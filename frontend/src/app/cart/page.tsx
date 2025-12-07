"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/cart/productsCard";
import { updateCartItem, removeCartItem } from "@/app/api/cart/addItem";

type CartItem = {
  id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  stock_disponible?: number;
  imagen?: string | null;
};

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadCart() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/cart", { credentials: "include" });
        if (!res.ok) {
          if (res.status === 401) {
            setError("Debes iniciar sesión para ver tu carrito.");
          } else {
            setError("No se pudo cargar el carrito.");
          }
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        const detalles = Array.isArray(data?.detalles) ? data.detalles : [];
        const mapped: CartItem[] = detalles.map((d: any) => ({
          id: d.producto,
          nombre: d.nombre_producto,
          precio_unitario: Number(d.precio_unitario || 0),
          cantidad: Number(d.cantidad || 0),
          stock_disponible: typeof d.stock_disponible === 'number' ? d.stock_disponible : undefined,
          imagen: d.imagen ?? null,
        }));
        setItems(mapped);
      } catch (err) {
        if (!cancelled) setError("Error de conexión al cargar el carrito.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCart();
    return () => {
      cancelled = true;
    };
  }, []);

  async function removeItem(id: number) {
    const prev = items;
    setItems((s) => s.filter((p) => p.id !== id));

    const res = await removeCartItem(id);
    if (!res.ok) {
      // revert on error
      setItems(prev);
      if (res.data?.detail) setError(res.data.detail);
    }
  }

  async function changeQty(id: number, qty: number) {
    const prev = items;
    const item = items.find((p) => p.id === id);
    if (!item) return;

    // normalizar cantidad mínima
    if (qty <= 0) {
      qty = 0;
    }

    // límite por stock (si se conoce): cantidad actual + lo que queda en bodega
    const maxTotal =
      typeof item.stock_disponible === 'number'
        ? item.cantidad + item.stock_disponible
        : undefined;
    if (maxTotal != null && qty > maxTotal) {
      qty = maxTotal; // si excede, ajustar al máximo permitido
    }

    if (qty <= 0) {
      setItems((s) => s.filter((p) => p.id !== id));
    } else {
      const diff = qty - item.cantidad;
      setItems((s) =>
        s.map((p) =>
          p.id === id
            ? {
                ...p,
                cantidad: qty,
                stock_disponible:
                  typeof p.stock_disponible === 'number'
                    ? p.stock_disponible - diff
                    : p.stock_disponible,
              }
            : p
        )
      );
    }

    const res = await updateCartItem(id, qty);
    if (!res.ok) {
      // si backend falla por cualquier motivo, revertimos
      setItems(prev);
    }
  }

  const total = items.reduce((sum, p) => sum + p.precio_unitario * p.cantidad, 0);

  return (
    <section className="w-4/5 xl:w-3/5 mx-auto my-7">
      <h1 className="text-3xl mb-5">Carrito de Compras</h1>

      {loading ? (
        <div className="p-6 bg-white rounded shadow text-center text-gray-600">
          Cargando carrito...
        </div>
      ) : error ? (
        <div className="p-6 bg-white rounded shadow text-center text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="p-6 bg-white rounded shadow text-center text-gray-600">No hay productos en el carrito</div>
      ) : (
        <div className="bg-white rounded shadow p-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {items.map((p) => {
                const maxTotal =
                  typeof p.stock_disponible === "number"
                    ? p.cantidad + p.stock_disponible
                    : undefined;
                const canIncrease = maxTotal == null ? true : p.cantidad < maxTotal;

                return (
                  <ProductCard
                    key={p.id}
                    product={{
                      id: String(p.id),
                      name: p.nombre,
                      price: p.precio_unitario,
                      qty: p.cantidad,
                      image: p.imagen || undefined,
                    }}
                    stockDisponible={p.stock_disponible}
                    onRemove={(id) => removeItem(Number(id))}
                    onChangeQty={(id, qty) => {
                      if (!canIncrease && qty > p.cantidad) return;
                      changeQty(Number(id), qty);
                    }}
                  />
                );
              })}
            </div>

            <aside className="flex md:col-span-1 bg-gray-50">
              <div className="self-center w-full rounded border p-2">
                <div className="text-lg font-semibold">Resumen</div>
                  <div className="mt-4 text-2xl font-bold">Total: ${total.toLocaleString()}</div>
                  {/*Configurar costos de envio: Pendiente*/}
                  <div>Envio: 5000</div>
                <button
                onClick={() => router.push('/checkout')}
                className="mt-18 w-full bg-black text-white py-2 rounded bottom-5 inset-x-0"
                >
                Ir a Checkout
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}
    </section>
  );
}