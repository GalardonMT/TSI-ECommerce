"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateCartItem, removeCartItem } from "@/app/api/cart/addItem";

type HeaderCartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

type CartItem = {
  id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  stock_disponible?: number;
  imagen?: string | null;
};

export default function HeaderCartDrawer({ open, onClose }: HeaderCartDrawerProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

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
          stock_disponible:
            typeof d.stock_disponible === "number" ? d.stock_disponible : undefined,
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

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      cancelled = true;
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  const handleViewCart = () => {
    onClose();
    router.push("/cart");
  };

  async function removeItem(id: number) {
    const prev = items;
    setItems((s) => s.filter((p) => p.id !== id));

    const res = await removeCartItem(id);
    if (!res.ok) {
      setItems(prev);
      if (res.data?.detail) setError(res.data.detail);
    }
  }

  async function changeQty(id: number, qty: number) {
    const prev = items;
    const item = items.find((p) => p.id === id);
    if (!item) return;

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
      setItems(prev);
      if (res.data?.detail) setError(res.data.detail);
    }
  }

  const total = items.reduce((sum, p) => sum + p.precio_unitario * p.cantidad, 0);

  return (
    <div
      ref={containerRef}
      className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="h-full flex flex-col p-6">
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
          <h2 className="text-xl font-bold font-Sansation tracking-wide text-black">Carrito</h2>
          <button onClick={onClose} className="text-black" aria-label="Cerrar carrito">
            <svg className="w-6 h-6 stroke-current fill-none">
              <use xlinkHref="/sprites.svg#icon-close" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex items-center justify-center text-gray-500 text-sm h-full">
              Cargando carrito...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center text-red-600 text-sm h-full text-center px-4">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center text-gray-400 text-base font-medium h-full">
              Tu carrito está vacío.
            </div>
          ) : (
            items.map((p) => {
              const maxTotal =
                typeof p.stock_disponible === "number"
                  ? p.cantidad + p.stock_disponible
                  : undefined;
              const canIncrease = maxTotal == null ? true : p.cantidad < maxTotal;

              return (
              <div
                key={p.id}
                className="flex items-center gap-3 border border-gray-200 rounded-md p-2"
              >
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  {p.imagen ? (
                    <img
                      src={p.imagen}
                      alt={p.nombre}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">
                    {p.nombre}
                  </div>
                  <div className="text-xs text-gray-600">
                    ${p.precio_unitario.toLocaleString()} c/u
                  </div>
                  {typeof p.stock_disponible === "number" && (
                    <div className="text-[11px] text-gray-500">
                      Stock disponible: {p.stock_disponible}
                    </div>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center border rounded overflow-hidden">
                      <button
                        aria-label={`Disminuir cantidad de ${p.nombre}`}
                        onClick={() => changeQty(p.id, p.cantidad - 1)}
                        className="px-2 py-1 bg-white hover:bg-gray-100 text-sm"
                      >
                        -
                      </button>
                      <div className="px-3 py-1 bg-white text-sm">{p.cantidad}</div>
                      <button
                        aria-label={`Aumentar cantidad de ${p.nombre}`}
                        onClick={() => {
                          if (!canIncrease) return;
                          changeQty(p.id, p.cantidad + 1);
                        }}
                        disabled={!canIncrease}
                        className={`px-2 py-1 bg-white hover:bg-gray-100 text-sm ${
                          !canIncrease ? "opacity-50 cursor-not-allowed hover:bg-white" : ""
                        }`}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(p.id)}
                      className="ml-2 text-xs text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  ${(p.precio_unitario * p.cantidad).toLocaleString()}
                </div>
              </div>
            );
            })
          )}
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="text-gray-600">Total estimado</span>
            <span className="text-base font-semibold text-gray-900">
              ${total.toLocaleString()}
            </span>
          </div>
          <button
            onClick={handleViewCart}
            className="w-full bg-[#151515] text-white py-3 font-bold tracking-widest hover:bg-zinc-800 transition text-base"
          >
            Ver carrito
          </button>
        </div>
      </div>
    </div>
  );
}
