"use client";

import { useEffect, useState } from "react";

const ESTADOS = ["PENDIENTE", "CONFIRMADA", "COMPLETADA", "CANCELADA"];

type Detalle = {
  id: number;
  producto: number;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  imagen?: string | null;
};

type Cliente = {
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  correo: string;
  telefono: string;
} | null;

type Direccion = {
  calle: string;
  numero: string;
  comuna: string;
  region: string;
  depto_oficina?: string | null;
} | null;

type Reserva = {
  id_reserva: number;
  fecha_creacion: string;
  estado: string;
  cliente: Cliente;
  direccion: Direccion;
  detalles: Detalle[];
};

export default function AdminOrdersTable() {
  const [orders, setOrders] = useState<Reserva[]>([]);
  const [filterEstado, setFilterEstado] = useState<string>("TODOS");
  const [filterRegion, setFilterRegion] = useState<string>("TODAS");
  const [filterComuna, setFilterComuna] = useState<string>("TODAS");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/orders", { credentials: "include" });
        if (!res.ok) {
          const msg = res.status === 401 ? "No autorizado" : "Error cargando reservas";
          if (!cancelled) setError(msg);
          return;
        }
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setOrders(data);
        }
      } catch (err) {
        if (!cancelled) setError("Error de conexión");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  async function updateEstado(id_reserva: number, estado: string) {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id_reserva, estado }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.detail || "No se pudo actualizar el estado");
        return;
      }
      const updated = await res.json().catch(() => null);
      setOrders((prev) =>
        prev.map((o) => (o.id_reserva === id_reserva ? { ...o, estado: updated?.estado ?? estado } : o))
      );
    } catch (err) {
      alert("Error de conexión al actualizar estado");
    }
  }

  if (loading) {
    return <div className="p-6">Cargando reservas...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!orders.length) {
    return <div className="p-6">No hay reservas registradas.</div>;
  }

  const regionOptions = Array.from(
    new Set(orders.map((o) => o.direccion?.region).filter((r): r is string => Boolean(r)))
  );

  const comunaSource =
    filterRegion === "TODAS" ? orders : orders.filter((o) => o.direccion?.region === filterRegion);

  const comunaOptions = Array.from(
    new Set(comunaSource.map((o) => o.direccion?.comuna).filter((c): c is string => Boolean(c)))
  );

  const filteredByEstado =
    filterEstado === "TODOS" ? orders : orders.filter((o) => o.estado === filterEstado);

  const filteredByRegion =
    filterRegion === "TODAS" ? filteredByEstado : filteredByEstado.filter((o) => o.direccion?.region === filterRegion);

  const filteredOrders =
    filterComuna === "TODAS" ? filteredByRegion : filteredByRegion.filter((o) => o.direccion?.comuna === filterComuna);

  const searchTerm = search.trim().toLowerCase();
  const visibleOrders = !searchTerm
    ? filteredOrders
    : filteredOrders.filter((o) => {
        const idMatch = o.id_reserva.toString().includes(searchTerm);
        const cliente = o.cliente;
        const nombreCompleto = cliente
          ? `${cliente.nombre} ${cliente.apellido_paterno} ${cliente.apellido_materno || ""}`.toLowerCase()
          : "";
        const correo = cliente?.correo?.toLowerCase() || "";
        const nameMatch = nombreCompleto.includes(searchTerm);
        const mailMatch = correo.includes(searchTerm);
        return idMatch || nameMatch || mailMatch;
      });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 pb-2 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Estado:</span>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-white w-full"
          >
            <option value="TODOS">Todos</option>
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Región:</span>
          <select
            value={filterRegion}
            onChange={(e) => {
              setFilterRegion(e.target.value);
              setFilterComuna("TODAS");
            }}
            className="border rounded px-2 py-1 text-sm bg-white w-full"
          >
            <option value="TODAS">Todas</option>
            {regionOptions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Comuna:</span>
          <select
            value={filterComuna}
            onChange={(e) => setFilterComuna(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-white w-full"
          >
            <option value="TODAS">Todas</option>
            {comunaOptions.map((comuna) => (
              <option key={comuna} value={comuna}>
                {comuna}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ID, nombre o correo"
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {visibleOrders.map((reserva) => (
        <div key={reserva.id_reserva} className="border rounded p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold">Reserva #{reserva.id_reserva}</div>
              <div className="text-sm text-gray-500">Fecha: {reserva.fecha_creacion}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setExpanded((prev) => ({ ...prev, [reserva.id_reserva]: !prev[reserva.id_reserva] }))
                }
                className="text-sm border rounded px-2 py-1 bg-gray-100 hover:bg-gray-200"
              >
                {expanded[reserva.id_reserva] ? "Ocultar cliente" : "Ver cliente"}
              </button>
              <span className="text-sm text-gray-600">Estado:</span>
              <select
                value={reserva.estado}
                onChange={(e) => updateEstado(reserva.id_reserva, e.target.value)}
                className="border rounded px-2 py-1 text-sm bg-white"
              >
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {expanded[reserva.id_reserva] && (
            <div className="mb-3 rounded border bg-gray-50 p-3 text-sm">
              <div className="font-semibold mb-1">Cliente</div>
              {reserva.cliente ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-600">Nombre: </span>
                    {`${reserva.cliente.nombre} ${reserva.cliente.apellido_paterno}${
                      reserva.cliente.apellido_materno ? ` ${reserva.cliente.apellido_materno}` : ""
                    }`}
                  </div>
                  <div>
                    <span className="text-gray-600">Correo: </span>
                    {reserva.cliente.correo}
                  </div>
                  <div>
                    <span className="text-gray-600">Teléfono: </span>
                    {reserva.cliente.telefono}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Sin datos de cliente.</div>
              )}

              <div className="font-semibold mt-3 mb-1">Dirección</div>
              {reserva.direccion ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-600">Calle: </span>
                    {reserva.direccion.calle} {reserva.direccion.numero}
                  </div>
                  <div>
                    <span className="text-gray-600">Comuna: </span>
                    {reserva.direccion.comuna}
                  </div>
                  <div>
                    <span className="text-gray-600">Región: </span>
                    {reserva.direccion.region}
                  </div>
                  {reserva.direccion.depto_oficina ? (
                    <div>
                      <span className="text-gray-600">Depto/Oficina: </span>
                      {reserva.direccion.depto_oficina}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-gray-500">Sin dirección registrada.</div>
              )}
            </div>
          )}

          <table className="w-full text-sm border-t">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 text-left">Cantidad</th>
                <th className="p-2 text-left">Precio unitario</th>
                <th className="p-2 text-left">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {reserva.detalles.map((det) => (
                <tr key={det.id} className="border-t">
                  <td className="p-2">{det.nombre_producto}</td>
                  <td className="p-2">{det.cantidad}</td>
                  <td className="p-2">${det.precio_unitario.toLocaleString("es-CL")}</td>
                  <td className="p-2">${(det.precio_unitario * det.cantidad).toLocaleString("es-CL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
