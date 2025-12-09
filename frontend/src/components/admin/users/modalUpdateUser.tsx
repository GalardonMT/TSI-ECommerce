"use client";
import { useState } from 'react';

export default function ModalUpdateUser({ user, onClose, onUpdate }: { user: any; onClose: () => void; onUpdate: (id: number, p: any) => Promise<any> }) {
  const [email, setEmail] = useState(user.correo || '');
  const [nombre, setNombre] = useState(user.nombre || '');
  const [apellido, setApellido] = useState(user.apellido_paterno || '');
  const [apellidoMaterno, setApellidoMaterno] = useState(user.apellido_materno || '');
  const [rut, setRut] = useState(user.rut || '');
  const [telefono, setTelefono] = useState(user.telefono || '');
  const [isSuper, setIsSuper] = useState(!!user.is_superuser);
  const [isActive, setIsActive] = useState(!!user.is_active);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !nombre || !apellido || !rut || !telefono) {
      setError('Correo, nombre, apellido, RUT y teléfono son obligatorios');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        correo: email,
        nombre,
        apellido_paterno: apellido,
        apellido_materno: apellidoMaterno,
        rut,
        telefono,
        is_superuser: isSuper,
        is_active: isActive,
        // keep existing staff flag to avoid unintended role changes
        is_staff: !!user.is_staff,
      };
      const res = await onUpdate(user.id, payload);
      if (!res.ok) {
        const firstFieldError = res.data && typeof res.data === 'object'
          ? Object.values(res.data)[0]
          : null;
        const msg = Array.isArray(firstFieldError) ? firstFieldError[0] : firstFieldError;
        setError((res.data?.detail as string) || (res.data?.error as string) || (msg as string) || 'Error updating user');
      }
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Update User</h2>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm">Email</label>
            <input className="w-full border p-2 rounded" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
          <div>
            <label className="block text-sm">Nombre</label>
            <input className="w-full border p-2 rounded" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm">Apellido</label>
            <input className="w-full border p-2 rounded" value={apellido} onChange={(e) => setApellido(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm">Apellido materno</label>
            <input className="w-full border p-2 rounded" value={apellidoMaterno} onChange={(e) => setApellidoMaterno(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm">RUT</label>
            <input className="w-full border p-2 rounded" value={rut} onChange={(e) => setRut(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm">Teléfono</label>
            <input className="w-full border p-2 rounded" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm">Superuser</label>
            <input type="checkbox" checked={isSuper} onChange={(e) => setIsSuper(e.target.checked)} />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm">Active</label>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          </div>

          <div className="flex items-center gap-3">
            <button disabled={loading} className="bg-blue-600 text-white px-3 py-2 rounded">{loading ? 'Updating...' : 'Update'}</button>
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
