export async function createUser(payload: any) {
  try {
    // Token sent automatically via HttpOnly cookie
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
    // Token sent automatically via HttpOnly cookie
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
    // Token sent automatically via HttpOnly cookie
    const res = await fetch(`/api/admin/users/${id}`, { 
      method: 'DELETE',
      credentials: 'include'
    });
    return { ok: res.ok, status: res.status };
  } catch (err: any) {
    return { ok: false, status: 0, error: String(err?.message || err) };
  }
}

export default { createUser, updateUser, deleteUser };
