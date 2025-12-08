"use client";

import { useEffect, useState } from "react";

type Detalle = {
	id: number;
	producto: number;
	nombre_producto: string;
	cantidad: number;
	precio_unitario: number;
	imagen?: string | null;
};

type Pedido = {
	id_reserva: number;
	fecha_creacion: string;
	fecha_reserva: string;
	estado: string;
	correo_usuario?: string | null;
	detalles: Detalle[];
};

export default function PedidosPage() {
	const [pedidos, setPedidos] = useState<Pedido[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

	useEffect(() => {
		let cancelled = false;

		async function loadPedidos() {
			if (!cancelled) {
				setLoading(true);
				setError(null);
				setPedidos([]);
			}
			try {
				const params = new URLSearchParams();
				if (selectedStatus !== "ALL") {
					params.append("estado", selectedStatus);
				}
				const query = params.toString();
				const res = await fetch(`/api/orders${query ? `?${query}` : ""}`, {
					credentials: "include",
				});
				if (!res.ok) {
					if (!cancelled) {
						setPedidos([]);
						if (res.status === 401) {
							setError("Debes iniciar sesión para ver tus pedidos pendientes.");
						} else {
							setError("No se pudieron cargar los pedidos pendientes.");
						}
					}
					return;
				}
				const data = await res.json().catch(() => null);
				if (cancelled) return;
				setPedidos(Array.isArray(data) ? data : []);
			} catch (err) {
				if (!cancelled) {
					setPedidos([]);
					setError("Error de conexión al cargar los pedidos.");
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		loadPedidos();
		return () => {
			cancelled = true;
		};
	}, [selectedStatus]);

	const statusOptions = [
		{ value: "ALL", label: "Todos" },
		{ value: "PENDIENTE", label: "Pendientes" },
		{ value: "CONFIRMADA", label: "Confirmadas" },
		{ value: "COMPLETADA", label: "Completadas" },
		{ value: "CANCELADA", label: "Canceladas" },
	];

	const statusLabels: Record<string, string> = {
		PENDIENTE: "Pendiente",
		CONFIRMADA: "Confirmada",
		COMPLETADA: "Completada",
		CANCELADA: "Cancelada",
	};

	if (loading) {
		return (
			<section className="w-4/5 xl:w-3/5 mx-auto my-7 pt-24">
				<div className="p-6 bg-white rounded shadow text-center text-gray-600">
					Cargando pedidos pendientes...
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="w-4/5 xl:w-3/5 mx-auto my-7 pt-24">
				<div className="p-6 bg-white rounded shadow text-center text-red-600">
					{error}
				</div>
			</section>
		);
	}

	if (!pedidos.length) {
		return (
			<section className="w-4/5 xl:w-3/5 mx-auto my-7 pt-24">
				<div className="p-6 bg-white rounded shadow text-center text-gray-600">
					No tienes pedidos pendientes.
				</div>
			</section>
		);
	}

	return (
		<section className="w-4/5 xl:w-3/5 mx-auto my-7 pt-24">
			<header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
				<h1 className="text-3xl">Mis pedidos</h1>
				<div className="flex items-center gap-2 text-sm">
					<label htmlFor="estado" className="text-gray-600">
						Filtrar por estado
					</label>
					<select
						id="estado"
						value={selectedStatus}
						onChange={(e) => setSelectedStatus(e.target.value)}
						className="border border-gray-300 rounded-md px-3 py-2"
					>
						{statusOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</div>
			</header>
			<div className="space-y-4">
				{pedidos.map((pedido) => {
					const total = pedido.detalles.reduce(
						(sum, det) => sum + det.precio_unitario * det.cantidad,
						0
					);
					return (
						<article key={pedido.id_reserva} className="bg-white rounded shadow p-4">
							<header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 text-sm text-gray-600">
								<div className="inline-flex flex-wrap items-center gap-2">
									<span className="font-semibold text-gray-800">Reserva #{pedido.id_reserva}</span>
									<span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
										{statusLabels[pedido.estado] ?? pedido.estado}
									</span>
									{pedido.correo_usuario && (
										<span className="text-xs text-gray-500">
											Correo: {pedido.correo_usuario}
										</span>
									)}
								</div>
								<div>
									Creado: {new Date(pedido.fecha_creacion).toLocaleString()}
								</div>
								<div>
									Fecha reserva: {new Date(pedido.fecha_reserva).toLocaleDateString()}
								</div>
							</header>
							<ul className="space-y-2 text-sm text-gray-700">
								{pedido.detalles.map((detalle) => (
									<li key={detalle.id} className="flex justify-between">
										<span className="truncate max-w-[220px]">
											{detalle.nombre_producto} x{detalle.cantidad}
										</span>
										<span className="font-medium">
											${(detalle.precio_unitario * detalle.cantidad).toLocaleString()}
										</span>
									</li>
								))}
							</ul>
							<footer className="border-t mt-4 pt-3 text-sm flex justify-between">
								<span className="text-gray-600">Total</span>
								<span className="text-lg font-semibold text-gray-900">
									${total.toLocaleString()}
								</span>
							</footer>
						</article>
					);
				})}
			</div>
		</section>
	);
}
