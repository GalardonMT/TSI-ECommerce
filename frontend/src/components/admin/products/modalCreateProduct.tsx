"use client";

import { useState } from 'react';
import { createProduct } from '@/app/api/admin/products/createProduct';

type Props = {
  onClose?: () => void;
  onCreated?: (data: any) => void;
  categories: { id_categoria: number; nombre: string }[];
};

export default function ModalCreateProduct({ onClose, onCreated, categories }: Props) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [categoria, setCategoria] = useState<string>('');
  
  // Nuevo estado para Destacado
  const [destacado, setDestacado] = useState(false);

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
    if (categoria !== '') formData.append('categoria', categoria);
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('precio', String(precio));
    formData.append('stock_disponible', String(stock === '' ? 0 : stock));
    
    // Enviamos el valor de destacado (el backend espera 'true' o 'false')
    formData.append('destacado', destacado ? 'true' : 'false');

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
      <div className="relative bg-white rounded shadow-lg w-full max-w-xl mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Crear Producto</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1 font-medium">Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Descripción</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1 font-medium">Precio</label>
              <input value={precio} onChange={(e) => setPrecio(e.target.value === '' ? '' : Number(e.target.value))} type="number" className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1 font-medium">Stock</label>
              <input value={stock} onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))} type="number" className="w-full border p-2 rounded" />
            </div>
          </div>

          {/* Nuevo Checkbox Destacado */}
          <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded border border-gray-100">
             <input 
               type="checkbox" 
               id="createCheckDestacado"
               checked={destacado} 
               onChange={(e) => setDestacado(e.target.checked)} 
               className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
             />
             <label htmlFor="createCheckDestacado" className="text-sm font-medium cursor-pointer select-none text-gray-700">
               Marcar como Producto Destacado
             </label>
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border p-2 rounded bg-white"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id_categoria} value={String(cat.id_categoria)}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Imágenes (opcional)</label>
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) addNewFile(e.target.files[0]); }} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"/>
            <div className="flex gap-2 mt-2 flex-wrap">
              {newFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded border">
                  <span className="text-xs truncate max-w-[150px]">{f.name}</span>
                  <button type="button" onClick={() => removeNewFile(i)} className="text-red-600 font-bold hover:text-red-800">×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border hover:bg-gray-50 text-sm font-medium">Cancelar</button>
            <button disabled={loading} type="submit" className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 text-sm font-medium">{loading ? 'Creando...' : 'Crear Producto'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}