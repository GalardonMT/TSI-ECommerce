"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Order = {
  id: number | string;
  fecha?: string;
  total?: number;
  estado?: string;
  items?: Array<{ id?: number | string; nombre?: string; cantidad?: number; precio?: number }>;
};

export default function PedidosPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const base = process.env.NEXT_PUBLIC_API_URL || "";

        // Try a few reasonable endpoints in order. Adjust to your backend.
        const candidates = [
          `${base}/api/pedidos/mis-pedidos/`,
          `${base}/api/pedidos/`,
          `${base}/api/orders/mine/`,
          `${base}/api/orders/`,
          `/api/orders/`,
        ];

        const token = localStorage.getItem("access") || localStorage.getItem("token") || localStorage.getItem("token");
        let data: any = null;

        for (const url of candidates) {
          try {
            const res = await fetch(url, {
              method: "GET",
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });

            if (!res.ok) {
              // try next
              continue;
            }

            data = await res.json();
            // normalize: some APIs return { results: [...] }
            if (Array.isArray(data)) {
              setOrders(data);
            } else if (data && Array.isArray(data.results)) {
              setOrders(data.results);
            } else if (data && Array.isArray(data.pedidos)) {
              setOrders(data.pedidos);
            } else {
              // if the returned object looks like a single order, wrap it
              if (data && (data.id || data.pk)) setOrders([data]);
              else setOrders([]);
            }
            break;
          } catch (e) {
            // try next
            continue;
          }
        }

        if (data === null) {
          setError("No se pudieron obtener pedidos: configure el endpoint BACKEND o revise la API.");
        }
      } catch (err: any) {
        setError(String(err?.message || err));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="min-h-[60vh] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Mis Pedidos</h1>

        {loading && <div className="text-gray-600">Cargando pedidos...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (!orders || orders.length === 0) && (
          <div className="text-gray-700">No se encontraron pedidos para este usuario.</div>
        )}

        {!loading && !error && orders && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={String(o.id)} className="border rounded-md p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500">Pedido #{o.id}</div>
                    <div className="font-medium">{o.fecha ? new Date(o.fecha).toLocaleString() : "Fecha no disponible"}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{typeof o.total === 'number' ? `$${o.total}` : "Total: -"}</div>
                    <div className="text-sm text-gray-500">{o.estado ?? "Estado: -"}</div>
                  </div>
                </div>

                {o.items && o.items.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-semibold mb-2">Artículos</div>
                    <ul className="space-y-1">
                      {o.items.map((it, idx) => (
                        <li key={idx} className="text-sm">
                          {it.nombre ?? `Item ${it.id ?? idx}`} — {it.cantidad ?? 1} × {it.precio ? `$${it.precio}` : "-"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => router.back()}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
