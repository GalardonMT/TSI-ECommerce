"use client";

import { useState } from 'react';
import ModalCreateProduct from './modalCreateProduct';
import ModalUpdateProduct from './modalUpdateProduct';
import ModalCreateCategory from './modalCreateCategory';
import ModalDeleteCategory from './modalDeleteCategory';
import { deleteProduct } from '@/app/api/admin/products/manageProduct';

type Category = {
  id_categoria: number;
  nombre: string;
};

type Props = { products: any[]; categories: Category[] };

function fmtPrice(v: number) {
  try {
    return v.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  } catch (e) {
    return `\$${v}`;
  }
}

export default function AdminProductsList({ products, categories }: Props) {
  const [open, setOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [openDeleteCategory, setOpenDeleteCategory] = useState(false);
  const [items, setItems] = useState<any[]>(Array.isArray(products) ? products : []);
  const [categoryList, setCategoryList] = useState<Category[]>(Array.isArray(categories) ? categories : []);
  const [editing, setEditing] = useState<any | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Listado de productos</h2>
        <div className="flex gap-2">
          <button onClick={() => setOpenCategory(true)} className="border px-3 py-2 rounded text-sm">Crear categoría</button>
          <button
            onClick={() => setOpenDeleteCategory(true)}
            className="border border-red-600 text-red-600 px-3 py-2 rounded text-sm disabled:opacity-50"
            disabled={categoryList.length === 0}
          >
            Eliminar categoría
          </button>
          <button onClick={() => setOpen(true)} className="bg-black text-white px-3 py-2 rounded text-sm">Crear producto</button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border rounded">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 w-20">ID</th>
              <th className="p-3 w-32">Imagen</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Descripción</th>
              <th className="p-3 w-40">Categoría</th>
              <th className="p-3 w-28">Precio</th>
              <th className="p-3 w-24">Stock</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const img = p?.imagenes && p.imagenes.length ? p.imagenes[0].image : null;
              return (
                <tr key={p.id || p.id_producto} className="border-t even:bg-gray-50">
                  <td className="p-3 align-top">{p.id || p.id_producto}</td>
                  <td className="p-3 align-top">
                    {img ? (
                      // image may be data URL or absolute URL
                      // constrain size
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={p.nombre || ''} className="h-16 w-16 object-cover rounded" />
                    ) : (
                      <div className="h-16 w-16 bg-gray-100 flex items-center justify-center text-xs text-gray-400 rounded">No image</div>
                    )}
                  </td>
                  <td className="p-3 align-top">{p.nombre}</td>
                  <td className="p-3 align-top text-sm text-gray-700">{p.descripcion}</td>
                  <td className="p-3 align-top text-sm text-gray-700">{p.categoria_nombre || 'Sin categoría'}</td>
                  <td className="p-3 align-top">{fmtPrice(Number(p.precio || 0))}</td>
                  <td className="p-3 align-top">{p.stock_disponible ?? p.stock ?? 0}</td>
                  <td className="p-3 align-top">
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(p)} className="text-sm px-2 py-1 border rounded">Editar</button>
                      <button
                        onClick={async () => {
                          if (!confirm('Eliminar este producto?')) return;
                          const res = await deleteProduct(p.id || p.id_producto);
                          if (res.ok) setItems((s) => s.filter((x) => (x.id || x.id_producto) !== (p.id || p.id_producto)));
                          else alert('Error eliminando producto');
                        }}
                        className="text-sm px-2 py-1 border rounded text-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">No hay productos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <ModalCreateProduct
          onClose={() => setOpen(false)}
          onCreated={(data) => {
            // If backend returns created product, append to list
            if (data) setItems((s) => [data, ...s]);
            setOpen(false);
          }}
          categories={categoryList}
        />
      )}

      {openCategory && (
        <ModalCreateCategory
          onClose={() => setOpenCategory(false)}
          onCreated={(data) => {
            if (data) {
              const normalizedId = data.id_categoria ?? data.id ?? data.pk;
              const normalizedName = data.nombre ?? data.name ?? '';
              if (normalizedId) {
                setCategoryList((prev) => {
                  const exists = prev.some((cat) => cat.id_categoria === normalizedId);
                  if (exists) {
                    return prev.map((cat) =>
                      cat.id_categoria === normalizedId ? { ...cat, nombre: normalizedName || cat.nombre } : cat
                    );
                  }
                  return [{ id_categoria: normalizedId, nombre: normalizedName || `Categoría ${normalizedId}` }, ...prev];
                });
              }
            }
            setOpenCategory(false);
          }}
        />
      )}

      {openDeleteCategory && (
        <ModalDeleteCategory
          categories={categoryList}
          onClose={() => setOpenDeleteCategory(false)}
          onDeleted={(id) => {
            setCategoryList((prev) => prev.filter((cat) => cat.id_categoria !== id));
            setItems((prev) =>
              prev.map((product) => {
                const productCategoryId =
                  product.categoria ??
                  product.id_categoria ??
                  product.categoria_id ??
                  product.categoriaId ??
                  product.category_id;
                if (productCategoryId && Number(productCategoryId) === Number(id)) {
                  return {
                    ...product,
                    categoria: null,
                    categoria_nombre: 'Sin categoría',
                  };
                }
                return product;
              })
            );
            setOpenDeleteCategory(false);
          }}
        />
      )}

      {editing && (
        <ModalUpdateProduct
          product={editing}
          onClose={() => setEditing(null)}
          onUpdated={(data: any) => {
            if (data) setItems((s) => s.map((it) => ((it.id || it.id_producto) === (data.id || data.id_producto) ? data : it)));
            setEditing(null);
          }}
          categories={categoryList}
        />
      )}
    </div>
  );
}
