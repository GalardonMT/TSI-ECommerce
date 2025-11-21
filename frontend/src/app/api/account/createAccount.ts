/**
 * createAccount - small wrapper to call the backend register endpoint.
 * Returns an object: { ok: boolean, status: number, data: any }
 * Uses NEXT_PUBLIC_API_URL or falls back to http://localhost:8000
 */
export async function createAccount(payload: any) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const url = `${API_BASE.replace(/\/$/, '')}/api/usuarios/auth/register/`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch (err) {
    // ignore parse errors; data will remain null
  }

  return { ok: res.ok, status: res.status, data };
}

export default createAccount;
