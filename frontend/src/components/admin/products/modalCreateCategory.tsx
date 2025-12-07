"use client";

import { useState } from "react";
import { createCategory } from "@/app/api/admin/products/createCategoryClient";

type Props = {
  onClose?: () => void;
  onCreated?: (data: any) => void;
};

export default function ModalCreateCategory({ onClose, onCreated }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetFeedback = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetFeedback();

    if (!nombre.trim()) {
      setError("El nombre de la categoría es obligatorio");
      return;
    }

    setLoading(true);
    try {
      const created = await createCategory({ nombre: nombre.trim(), descripcion: descripcion.trim() || undefined });
      if (!created) {
        setError("No se pudo crear la categoría");
        return;
      }
      setSuccess("Categoría creada correctamente");
      onCreated?.(created);
      setNombre("");
      setDescripcion("");
    } catch (err) {
      setError("Error al crear la categoría");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded shadow-lg w-full max-w-md mx-4 p-6 z-10">
        <h2 className="text-lg font-semibold mb-4">Crear categoría</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        {success && <div className="mb-3 text-sm text-green-600">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="categoria-nombre">
              Nombre
            </label>
            <input
              id="categoria-nombre"
              value={nombre}
              onChange={(event) => {
                resetFeedback();
                setNombre(event.target.value);
              }}
              className="w-full border p-2 rounded"
              placeholder="Ingresa el nombre de la categoría"
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="categoria-descripcion">
              Descripción (opcional)
            </label>
            <textarea
              id="categoria-descripcion"
              value={descripcion}
              onChange={(event) => {
                resetFeedback();
                setDescripcion(event.target.value);
              }}
              className="w-full border p-2 rounded"
              placeholder="Describe la categoría"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded border">
              Cerrar
            </button>
            <button type="submit" className="px-3 py-2 rounded bg-black text-white" disabled={loading}>
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
