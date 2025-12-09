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
  const [search, setSearch] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string | number>("ALL");

  const filteredItems = items.filter((p) => {
    const idVal = p.id ?? p.id_producto ?? "";
    const nameVal = (p.nombre ?? "").toString().toLowerCase();
    const searchTerm = search.trim().toLowerCase();

    const matchesSearch = !searchTerm
      ? true
      : idVal?.toString() === searchTerm || nameVal.includes(searchTerm);

    const productCategoryId =
      p.categoria ?? p.id_categoria ?? p.categoria_id ?? p.categoriaId ?? p.category_id ?? null;
    const matchesCategory =
      filterCategory === "ALL" ? true : Number(productCategoryId) === Number(filterCategory);

    return matchesSearch && matchesCategory;
  });

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

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por ID exacto o nombre"
          className="w-full md:w-64 border px-3 py-2 rounded text-sm"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
          className="w-full md:w-56 border px-3 py-2 rounded text-sm"
        >
          <option value="ALL">Todas las categorías</option>
          {categoryList.map((c) => (
            <option key={c.id_categoria} value={c.id_categoria}>
              {c.nombre}
            </option>
          ))}
        </select>
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
              {/* Nueva columna para ver si es destacado */}
              <th className="p-3 w-24">Destacado</th>
              <th className="p-3 w-28">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((p) => {
              const img = p?.imagenes && p.imagenes.length ? p.imagenes[0].image : null;
              return (
                <tr key={p.id || p.id_producto} className="border-t even:bg-gray-50">
                  <td className="p-3 align-top">{p.id || p.id_producto}</td>
                  <td className="p-3 align-top">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={p.nombre || ''} className="h-16 w-16 object-cover rounded" />
                    ) : (
                      <div className="h-16 w-16 bg-gray-100 flex items-center justify-center text-xs text-gray-400 rounded">No image</div>
                    )}
                  </td>
                  <td className="p-3 align-top">{p.nombre}</td>
                  <td 
                    className="p-3 align-top text-sm text-gray-700 max-w-[200px] truncate" 
                    title={p.descripcion} // Tooltip para ver todo al pasar el mouse
                  >
                    {p.descripcion}
                  </td>
                  <td className="p-3 align-top text-sm text-gray-700">{p.categoria_nombre || 'Sin categoría'}</td>
                  <td className="p-3 align-top">{fmtPrice(Number(p.precio || 0))}</td>
                  <td className="p-3 align-top">{p.stock_disponible ?? p.stock ?? 0}</td>
                  
                  {/* Nueva celda para mostrar el estado de destacado */}
                  <td className="p-3 align-top">
                    {p.destacado ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                        Sí
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">No</span>
                    )}
                  </td>

                  <td className="p-3 align-top">
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(p)} className="text-sm px-2 py-1 border rounded hover:bg-gray-50">Editar</button>
                      <button
                        onClick={async () => {
                          if (!confirm('Eliminar este producto?')) return;
                          const res = await deleteProduct(p.id || p.id_producto);
                          if (res.ok) {
                            window.location.reload();
                            return;
                          }
                          alert(res.error || 'No se pudo eliminar el producto. Intente nuevamente.');
                        }}
                        className="text-sm px-2 py-1 border rounded text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-500">No hay productos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <ModalCreateProduct
          onClose={() => setOpen(false)}
          onCreated={(data) => {
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