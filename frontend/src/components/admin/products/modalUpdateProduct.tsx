"use client";

import { useState } from 'react';
import { updateProduct } from '@/app/api/admin/products/manageProduct';

type Imagen = { id_imagen?: number; image: string; orden?: number };

type Props = {
  product: any;
  onClose?: () => void;
  onUpdated?: (data: any) => void;
  categories: { id_categoria: number; nombre: string }[];
};

const fileToDataUrl = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(f);
  });

export default function ModalUpdateProduct({ product, onClose, onUpdated, categories }: Props) {
  const [nombre, setNombre] = useState(product?.nombre || '');
  const [descripcion, setDescripcion] = useState(product?.descripcion || '');
  const [precio, setPrecio] = useState<number | ''>(product?.precio ?? '');
  const [stock, setStock] = useState<number | ''>(product?.stock_disponible ?? product?.stock ?? '');
  const [categoria, setCategoria] = useState<string>(
    product?.categoria ? String(product.categoria) : ''
  );
  const [existing, setExisting] = useState<Imagen[]>(product?.imagenes ? product.imagenes.slice() : []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function removeExisting(idx: number) {
    setExisting((s) => s.filter((_, i) => i !== idx));
  }

  function addNewFile(f?: File | null) {
    if (!f) return;
    setNewFiles((s) => [...s, f]);
  }

  function removeNewFile(idx: number) {
    setNewFiles((s) => s.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nombre || precio === '') {
      setError('Nombre y precio requeridos');
      return;
    }

    setLoading(true);
    try {
      // Build imagenes array: keep existing.image (text), add new files as data URLs
      const imagenes: Imagen[] = [];
      for (const img of existing) imagenes.push({ image: img.image, orden: img.orden ?? 0 });
      for (const f of newFiles) {
        const data = await fileToDataUrl(f);
        imagenes.push({ image: data, orden: 0 });
      }

      const body = {
        nombre,
        descripcion: descripcion || null,
        precio: Number(precio),
        stock_disponible: Number(stock === '' ? 0 : stock),
        categoria: categoria === '' ? null : Number(categoria),
        imagenes,
      };

      const res = await updateProduct(product.id || product.id_producto, body);
      if (!res.ok) {
        setError((res as any).error || 'Error actualizando');
        return;
      }
      onUpdated?.(res.data ?? res);
      onClose?.();
    } catch (err) {
      setError('Error desconectado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded shadow-lg w-full max-w-2xl mx-4 p-6 z-10">
        <h2 className="text-lg font-semibold mb-4">Editar Producto</h2>
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
            <label className="block text-sm mb-1">Categoría</label>
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
            <label className="block text-sm mb-1">Imágenes existentes</label>
            <div className="flex gap-2 flex-wrap">
              {existing.map((img, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.image} alt={`img-${i}`} className="h-20 w-20 object-cover rounded" />
                  <button type="button" onClick={() => removeExisting(i)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs">×</button>
                </div>
              ))}
              {existing.length === 0 && <div className="text-sm text-gray-500">No images</div>}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Añadir nuevas imágenes</label>
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
            <button disabled={loading} type="submit" className="px-3 py-2 rounded bg-black text-white">{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
