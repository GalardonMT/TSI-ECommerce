"use client";

import { useState } from 'react';
import { createProduct } from '@/app/api/admin/products/createProduct';

type Props = {
  onClose?: () => void;
  onCreated?: (data: any) => void;
};

export default function ModalCreateProduct({ onClose, onCreated }: Props) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [categoria, setCategoria] = useState<number | ''>('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nombre || precio === '') {
      setError('Nombre y precio son requeridos');
      return;
    }
    const formData = new FormData();
    if (categoria !== '') formData.append('categoria', String(categoria));
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('precio', String(precio));
    formData.append('stock_disponible', String(stock === '' ? 0 : stock));
    // append all selected images as 'image' entries
    for (const f of newFiles) formData.append('image', f);

    setLoading(true);
    try {
      const created = await createProduct(formData);
      if (!created) {
        setError('Error creando producto');
        return;
      }
      onCreated?.(created);
      onClose?.();
    } catch (err) {
      setError('Error desconectado');
    } finally {
      setLoading(false);
    }
  }

  function removeNewFile(idx: number) {
    setNewFiles((s) => s.filter((_, i) => i !== idx));
  }

  function addNewFile(f?: File | null) {
    if (!f) return;
    setNewFiles((s) => [...s, f]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded shadow-lg w-full max-w-xl mx-4 p-6 z-10">
        <h2 className="text-lg font-semibold mb-4">Crear Producto</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm mb-1">Descripción</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Precio</label>
              <input value={precio} onChange={(e) => setPrecio(e.target.value === '' ? '' : Number(e.target.value))} type="number" className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Stock</label>
              <input value={stock} onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))} type="number" className="w-full border p-2 rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Categoría (id)</label>
            <input value={categoria} onChange={(e) => setCategoria(e.target.value === '' ? '' : Number(e.target.value))} type="number" className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm mb-1">Imágenes (opcional)</label>
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) addNewFile(e.target.files[0]); }} />
            <div className="flex gap-2 mt-2">
              {newFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm">{f.name}</span>
                  <button type="button" onClick={() => removeNewFile(i)} className="text-red-600">Eliminar</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancelar</button>
            <button disabled={loading} type="submit" className="px-3 py-2 rounded bg-black text-white">{loading ? 'Creando...' : 'Crear'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
