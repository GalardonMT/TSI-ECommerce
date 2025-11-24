"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${base}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError((data && data.detail) || 'Credenciales inválidas');
        return;
      }

      // persist minimal tokens + user in localStorage (if available)
      try {
        if (data?.access) localStorage.setItem('access', data.access);
        if (data?.refresh) localStorage.setItem('refresh', data.refresh);
        if (data?.user) localStorage.setItem('auth', JSON.stringify({ user: data.user }));
      } catch (e) {
        // ignore storage errors in restricted environments
      }

      router.push('/admin');
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Admin Login</h1>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded" type="email" />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 rounded" type="password" />
        </div>

        <div className="flex items-center gap-3">
          <button disabled={loading} className="bg-black text-white px-4 py-2 rounded">{loading ? 'Entrando...' : 'Entrar'}</button>
        </div>
      </form>
    </div>
  );
}
