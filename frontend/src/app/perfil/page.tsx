"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RegionesYComunas } from "@/lib/regiones";

export default function PerfilPage() {
  const router = useRouter();
  const regiones = RegionesYComunas.regiones || [];
  const [form, setForm] = useState({
    correo: "",
    rut: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    telefono: "",
    direccion: {
      calle: "",
      numero: "",
      comuna: "",
      region: "",
      depto_oficina: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  // Load user profile via server proxy (/api/usuarios/me)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access") || localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        // attempt to GET profile; if 401 with expired token, try refresh and retry once
        let res = await fetch("/api/usuarios/me", { headers }).catch(() => ({ ok: false, status: 0 } as Response));

        if (res.status === 401) {
          // read body to inspect token issue
          const bodyText = await res.text().catch(() => '');
          let parsedBody: any = null;
          try { parsedBody = JSON.parse(bodyText); } catch (e) { parsedBody = null; }
          const code = parsedBody?.code || parsedBody?.detail || '';
          // detect expired access token
          const isExpired = bodyText?.toLowerCase().includes('expired') || (Array.isArray(parsedBody?.messages) && parsedBody.messages.some((m: any) => String(m.message).toLowerCase().includes('expired')));
          if (isExpired) {
            // try refresh using refresh token from localStorage via server proxy
            const refreshToken = localStorage.getItem('refresh') || (() => { try { const a = JSON.parse(localStorage.getItem('auth')||'{}'); return a?.refresh || a?.tokens?.refresh || null; } catch(e){return null;} })();
            if (refreshToken) {
              const r = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
              }).catch(() => ({ ok: false, status: 0 } as Response));
              if (r.ok) {
                const tokens = await r.json().catch(() => null);
                const newAccess = tokens?.access || tokens?.token || null;
                if (newAccess) {
                  try { localStorage.setItem('access', newAccess); } catch (e) {}
                  // retry original request with new token
                  const headers2: Record<string,string> = { ...(newAccess ? { Authorization: `Bearer ${newAccess}` } : {}) };
                  res = await fetch('/api/usuarios/me', { headers: headers2 }).catch(() => ({ ok: false, status: 0 } as Response));
                }
              } else {
                const txt = await r.text().catch(() => '');
                setMsg({ type: 'error', text: `Refresh failed ${r.status}: ${txt || '(sin cuerpo)'}` });
                setLoading(false);
                return;
              }
            } else {
              setMsg({ type: 'error', text: 'Access token expirado y no se encontró refresh token.' });
              setLoading(false);
              return;
            }
          }
        }

        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          let parsed = null;
          try { parsed = JSON.parse(txt); } catch (e) { parsed = null; }
          const details = parsed ? JSON.stringify(parsed, null, 2) : txt || '(sin cuerpo)';
          setMsg({ type: 'error', text: `Error proxy GET ${res.status}: ${details}` });
          setLoading(false);
          return;
        }
        const data = await res.json().catch(() => null);
        setForm((prev) => ({
          ...prev,
          correo: data.correo ?? data.email ?? data.username ?? prev.correo,
          rut: data.rut ?? prev.rut,
          nombre: data.nombre ?? data.first_name ?? prev.nombre,
          apellido_paterno: data.apellido_paterno ?? data.last_name ?? prev.apellido_paterno,
          apellido_materno: data.apellido_materno ?? data.apellido2 ?? prev.apellido_materno,
          telefono: data.telefono ?? data.phone ?? prev.telefono,
          direccion: {
            calle: data.direccion?.calle ?? data.address?.calle ?? prev.direccion.calle,
            numero: data.direccion?.numero ?? prev.direccion.numero,
            comuna: data.direccion?.comuna ?? prev.direccion.comuna,
            region: data.direccion?.region ?? prev.direccion.region,
            depto_oficina: data.direccion?.depto_oficina ?? prev.direccion.depto_oficina,
          },
        }));
      } catch (e: any) {
        const text = e?.message || String(e);
        setMsg({ type: "error", text: `Error de red al obtener perfil: ${text}` });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name.startsWith("dir_")) {
      const field = name.replace("dir_", "");
      setForm((prev) => ({ ...prev, direccion: { ...prev.direccion, [field]: value } }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const token = localStorage.getItem("access") || localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      let res = await fetch("/api/usuarios/me", {
        method: "PATCH",
        headers,
        body: JSON.stringify(form),
      }).catch(() => ({ ok: false, status: 0 } as Response));

      // If 401 expired, try refresh then retry once
      if (res.status === 401) {
        const bodyText = await res.text().catch(() => '');
        const isExpired = bodyText?.toLowerCase().includes('expired');
        if (isExpired) {
          const refreshToken = localStorage.getItem('refresh') || (() => { try { const a = JSON.parse(localStorage.getItem('auth')||'{}'); return a?.refresh || a?.tokens?.refresh || null; } catch(e){return null;} })();
          if (refreshToken) {
            const r = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh: refreshToken }),
            }).catch(() => ({ ok: false, status: 0 } as Response));
            if (r.ok) {
              const tokens = await r.json().catch(() => null);
              const newAccess = tokens?.access || tokens?.token || null;
              if (newAccess) {
                try { localStorage.setItem('access', newAccess); } catch (e) {}
                headers.Authorization = `Bearer ${newAccess}`;
                res = await fetch("/api/usuarios/me", { method: 'PATCH', headers, body: JSON.stringify(form) }).catch(() => ({ ok: false, status: 0 } as Response));
              }
            } else {
              const txt = await r.text().catch(() => '');
              setMsg({ type: 'error', text: `Refresh failed ${r.status}: ${txt || '(sin cuerpo)'}` });
              setSaving(false);
              return;
            }
          } else {
            setMsg({ type: 'error', text: 'Access token expirado y no se encontró refresh token.' });
            setSaving(false);
            return;
          }
        }
      }

      if (res.ok) {
        const data = await res.json().catch(() => null);
        setMsg({ type: "ok", text: "Perfil actualizado correctamente." });
        // update localStorage auth.user if present
        try {
          const authRaw = localStorage.getItem("auth");
          if (authRaw) {
            const parsed = JSON.parse(authRaw);
            // asegurar que no guardamos objetos complejos como mensaje de error
            parsed.user = data && typeof data === 'object' && !Array.isArray(data)
              ? data
              : { ...parsed.user, ...form };
            localStorage.setItem("auth", JSON.stringify(parsed));
          }
        } catch (e) {}
        setTimeout(() => router.push('/'), 900);
      } else {
        const txt = await res.text().catch(() => "");
        let parsed = null;
        try { parsed = JSON.parse(txt); } catch (e) {}
        const detail = typeof parsed?.detail === 'string'
          ? parsed.detail
          : typeof parsed === 'string'
            ? parsed
            : txt || 'Error al actualizar perfil.';
        setMsg({ type: "error", text: detail });
      }
    } catch (e) {
      setMsg({ type: "error", text: "Error de red al guardar perfil." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Cargando perfil...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Editar Perfil</h1>

        {msg && (
          <div role="alert" className={`mb-4 p-3 rounded ${msg.type === 'ok' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo</label>
            <input value={form.correo} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">RUT</label>
            <input value={form.rut} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Apellido paterno</label>
            <input name="apellido_paterno" value={form.apellido_paterno} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellido materno</label>
            <input name="apellido_materno" value={form.apellido_materno} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </div>
        </div>

        <fieldset className="mt-6 border-t pt-4">
          <legend className="text-sm font-medium text-gray-700">Dirección</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Calle</label>
              <input name="dir_calle" value={form.direccion.calle} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Número</label>
              <input name="dir_numero" value={form.direccion.numero} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Región</label>
              <select
                name="dir_region"
                value={form.direccion.region}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              >
                <option value="">Seleccione una región</option>
                {regiones.map((r: any) => (
                  <option key={r.NombreRegion} value={r.NombreRegion}>
                    {r.NombreRegion}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Comuna</label>
              <select
                name="dir_comuna"
                value={form.direccion.comuna}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                disabled={!form.direccion.region}
              >
                <option value="">Seleccione una comuna</option>
                {form.direccion.region &&
                  regiones
                    .find((r: any) => r.NombreRegion === form.direccion.region)?.comunas
                    .map((c: any) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Depto / Oficina</label>
              <input
                name="dir_depto_oficina"
                value={form.direccion.depto_oficina}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              />
            </div>
          </div>
        </fieldset>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center px-4 py-2 bg-black text-white rounded hover:opacity-95 disabled:opacity-60">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button onClick={() => router.push('/')} className="px-4 py-2 border rounded">Cancelar</button>
        </div>
      </div>
    </div>
  );
}
