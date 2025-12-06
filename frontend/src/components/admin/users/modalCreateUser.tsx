"use client";
import { useState } from 'react';

export default function ModalCreateUser({ onClose, onCreate }: { onClose: () => void; onCreate: (p: any) => Promise<any> }) {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [password, setPassword] = useState('');
  const [isSuper, setIsSuper] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        correo: email,
        nombre,
        apellido_paterno: apellido,
        password,
        password_confirm: password,
        is_staff: true,
        is_superuser: isSuper,
      };
      const res = await onCreate(payload);
      if (!res.ok) {
        setError(res.data?.detail || 'Error creating user');
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
        <h2 className="text-lg font-semibold mb-4">Create User</h2>
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
            <label className="block text-sm">Password</label>
            <input className="w-full border p-2 rounded" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm">Make superuser</label>
            <input type="checkbox" checked={isSuper} onChange={(e) => setIsSuper(e.target.checked)} />
          </div>

          <div className="flex items-center gap-3">
            <button disabled={loading} className="bg-blue-600 text-white px-3 py-2 rounded">{loading ? 'Creating...' : 'Create'}</button>
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
