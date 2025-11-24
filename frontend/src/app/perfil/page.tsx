"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserProfile = {
  id?: number | string;
  email?: string;
  correo?: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
  rol?: any;
  is_empleado?: boolean;
  is_superuser?: boolean;
  is_staff?: boolean;
  [k: string]: any;
};

export default function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [originalUser, setOriginalUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  // Normalize user object to common keys used by the form
  const normalizeUser = (raw: any): UserProfile => {
    if (!raw) return {} as UserProfile;
    const email = raw.email ?? raw.correo ?? raw.username ?? raw.user_email ?? '';
    const nombre = raw.nombre ?? raw.first_name ?? raw.name ?? '';
    const apellido = raw.apellido ?? raw.last_name ?? raw.apellido_paterno ?? '';
    const telefono = raw.telefono ?? raw.phone ?? raw.telefono_movil ?? '';
    const direccion = raw.direccion ?? raw.address ?? raw.direccion_completa ?? '';
    return {
      ...raw,
      email,
      nombre,
      apellido,
      telefono,
      direccion,
    };
  };

  useEffect(() => {
    // Try to load from localStorage first for fast UX
    try {
      const raw = localStorage.getItem("auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.user) {
          const norm = normalizeUser(parsed.user);
          setUser(norm);
          setOriginalUser(norm);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    // If not in localStorage, try to fetch from backend
    async function fetchMe() {
      setLoading(true);
      setError(null);
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || "";
        const endpoints = [
          `${base}/api/auth/user/`,
          `${base}/api/usuarios/me/`,
          `${base}/api/users/me/`,
          `${base}/api/profile/`,
        ];
        const token = localStorage.getItem('access') || localStorage.getItem('token') || null;
        let data: any = null;
        for (const url of endpoints) {
          try {
            const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
            if (!res.ok) continue;
            data = await res.json();
            break;
          } catch (e) {
            continue;
          }
        }

        if (data) {
          const norm = normalizeUser(data);
          setUser(norm);
          setOriginalUser(norm);
          // persist so header can reuse
          try { localStorage.setItem('auth', JSON.stringify({ user: norm })); } catch(e){}
        } else {
          setError('No se pudo obtener datos del perfil.');
        }
      } catch (err: any) {
        setError(String(err?.message || err));
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, []);

  const handleChange = (field: string, value: any) => {
    setUser((u) => (u ? { ...u, [field]: value } : { [field]: value } as any));
    setSuccess(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "";
      // Candidate endpoints for update (PATCH preferred)
      const candidates = [
        `${base}/api/auth/user/`,
        `${base}/api/usuarios/me/`,
        `${base}/api/users/me/`,
        `${base}/api/profile/`,
      ];

      const token = localStorage.getItem('access') || localStorage.getItem('token') || null;
      let updated: any = null;

      // payload — don't send undefined fields
      const payload: any = {};
      ['nombre','apellido','telefono','direccion','email','correo'].forEach((k) => {
        if ((user as any)[k] !== undefined) payload[k] = (user as any)[k];
      });

      for (const url of candidates) {
        try {
          const res = await fetch(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            // try PUT as fallback
            try {
              const res2 = await fetch(url, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
              });
              if (!res2.ok) continue;
              updated = await res2.json();
              break;
            } catch (e) {
              continue;
            }
          } else {
            updated = await res.json();
            break;
          }
        } catch (e) {
          continue;
        }
      }

        if (updated) {
        const norm = normalizeUser(updated);
        setSuccess('Perfil actualizado correctamente.');
        setUser(norm);
        try { localStorage.setItem('auth', JSON.stringify({ user: norm })); } catch(e){}
        setOriginalUser(norm);
      } else {
        setError('No se pudo actualizar el perfil. Verifique el endpoint del backend.');
      }
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[60vh] p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-md shadow">
        <h1 className="text-2xl font-semibold mb-4">Editar Perfil</h1>

        {loading && <div className="text-gray-600">Cargando perfil...</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {success && <div className="text-green-600 mb-4">{success}</div>}

        {!loading && user && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                value={user.email ?? user.correo ?? ''}
                onChange={(e) => handleChange('email', e.target.value)}
                type="email"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  value={user.nombre ?? ''}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Apellido</label>
                <input
                  value={user.apellido ?? ''}
                  onChange={(e) => handleChange('apellido', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                value={user.telefono ?? ''}
                onChange={(e) => handleChange('telefono', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <input
                value={user.direccion ?? ''}
                onChange={(e) => handleChange('direccion', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>

              <button
                className="px-4 py-2 border rounded"
                onClick={() => {
                  // restore original values and go to home
                  if (originalUser) {
                    setUser(originalUser);
                    try {
                      localStorage.setItem('auth', JSON.stringify({ user: originalUser }));
                    } catch (e) {}
                  }
                  router.push('/');
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {!loading && !user && !error && (
          <div>No hay información de perfil disponible.</div>
        )}
      </div>
    </div>
  );
}
