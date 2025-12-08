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
  
  // Inicializamos el estado Destacado con lo que viene del producto
  const [destacado, setDestacado] = useState<boolean>(!!product?.destacado);

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
        destacado: destacado, // Enviamos el valor booleano
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
      <div className="relative bg-white rounded shadow-lg w-full max-w-2xl mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Editar Producto</h2>
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
          
          {/* Checkbox para editar Destacado */}
          <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded border border-gray-100">
             <input 
               type="checkbox" 
               id="editCheckDestacado"
               checked={destacado} 
               onChange={(e) => setDestacado(e.target.checked)} 
               className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
             />
             <label htmlFor="editCheckDestacado" className="text-sm font-medium cursor-pointer select-none text-gray-700">
               Producto Destacado
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
            <label className="block text-sm mb-1 font-medium">Imágenes existentes</label>
            <div className="flex gap-2 flex-wrap bg-gray-50 p-2 rounded border border-dashed">
              {existing.map((img, i) => (
                <div key={i} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.image} alt={`img-${i}`} className="h-20 w-20 object-cover rounded border bg-white" />
                  <button type="button" onClick={() => removeExisting(i)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow hover:bg-red-700">×</button>
                </div>
              ))}
              {existing.length === 0 && <div className="text-sm text-gray-400 w-full text-center py-2">Sin imágenes actuales</div>}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Añadir nuevas imágenes</label>
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
            <button disabled={loading} type="submit" className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 text-sm font-medium">{loading ? 'Guardando...' : 'Guardar Cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}