export async function addCartItem(productoId: number, cantidad: number = 1) {
  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ producto_id: productoId, cantidad }),
    });

    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (error: any) {
    console.error('Error agregando al carrito:', error);
    return { ok: false, status: 0, data: null };
  }
}

export async function updateCartItem(productoId: number, cantidad: number) {
  try {
    const res = await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ producto_id: productoId, cantidad }),
    });

    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (error: any) {
    console.error('Error actualizando cantidad en el carrito:', error);
    return { ok: false, status: 0, data: null };
  }
}

export async function removeCartItem(productoId: number) {
  try {
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ producto_id: productoId }),
    });

    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (error: any) {
    console.error('Error eliminando producto del carrito:', error);
    return { ok: false, status: 0, data: null };
  }
}
