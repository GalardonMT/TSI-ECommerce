const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function deleteProduct(id: number | string) {
  const url = `${API_URL.replace(/\/$/, '')}/api/inventario/producto/${id}/`;
  try {
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) return { ok: false, status: res.status };
    return { ok: true, status: res.status };
  } catch (err: any) {
    return { ok: false, status: 0, error: String(err?.message || err) };
  }
}

export async function updateProduct(id: number | string, body: any) {
  const url = `${API_URL.replace(/\/$/, '')}/api/inventario/producto/${id}/`;
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, status: res.status, error: data || 'error' };
    return { ok: true, status: res.status, data };
  } catch (err: any) {
    return { ok: false, status: 0, error: String(err?.message || err) };
  }
}
