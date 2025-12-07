export async function deleteProduct(id: number | string) {
  try {
    // Call Next.js API route which handles auth via cookies
    const res = await fetch(`/api/admin/products/${id}`, { 
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) return { ok: false, status: res.status };
    return { ok: true, status: res.status };
  } catch (err: any) {
    return { ok: false, status: 0, error: String(err?.message || err) };
  }
}

export async function updateProduct(id: number | string, body: any) {
  try {
    // Call Next.js API route which handles auth via cookies
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, status: res.status, error: data || 'error' };
    return { ok: true, status: res.status, data };
  } catch (err: any) {
    return { ok: false, status: 0, error: String(err?.message || err) };
  }
}
