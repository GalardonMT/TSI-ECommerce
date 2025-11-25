export async function createUser(payload: any) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch (e) {}
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    return { ok: false, status: 0, error: String(err?.message || err) };
  }
}

export async function updateUser(id: number | string, payload: any) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch (e) {}
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    return { ok: false, status: 0, error: String(err?.message || err) };
  }
}

export async function deleteUser(id: number | string) {
  try {
    const headers: Record<string, string> = {};
    try {
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch (e) {}
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: Object.keys(headers).length ? headers : undefined });
    return { ok: res.ok, status: res.status };
  } catch (err: any) {
    return { ok: false, status: 0, error: String(err?.message || err) };
  }
}

export default { createUser, updateUser, deleteUser };
