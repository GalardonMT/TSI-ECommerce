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
