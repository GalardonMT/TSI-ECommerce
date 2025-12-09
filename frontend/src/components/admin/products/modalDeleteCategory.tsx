"use client";

import { useState } from "react";
import { deleteCategory } from "@/app/api/admin/products/deleteCategoryClient";

type Category = {
  id_categoria: number;
  nombre: string;
};

type Props = {
  categories: Category[];
  onClose?: () => void;
  onDeleted?: (id: number) => void;
};

export default function ModalDeleteCategory({ categories, onClose, onDeleted }: Props) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!selectedId) {
      setError("Selecciona una categoría para eliminar");
      return;
    }

    setLoading(true);
    try {
      const result = await deleteCategory(selectedId);
      if (!result) {
        setError("No se pudo eliminar la categoría");
        return;
      }
      window.location.reload();
      onDeleted?.(Number(selectedId));
      onClose?.();
    } catch (err) {
      setError("Error al eliminar la categoría");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded shadow-lg w-full max-w-md mx-4 p-6 z-10">
        <h2 className="text-lg font-semibold mb-4">Eliminar categoría</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="categoria-delete-select">
              Categoría
            </label>
            <select
              id="categoria-delete-select"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="w-full border p-2 rounded bg-white"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id_categoria} value={String(category.id_categoria)}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded border">
              Cerrar
            </button>
            <button
              type="submit"
              className="px-3 py-2 rounded bg-red-600 text-white"
              disabled={loading || categories.length === 0}
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
