"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RegionesYComunas } from "@/lib/regiones";
import { confirmCart } from "@/app/api/cart/addItem";

type CartItem = {
	id: number;
	nombre: string;
	precio_unitario: number;
	cantidad: number;
	imagen?: string | null;
};

type Paso = 1 | 2 | 3;

export default function CheckoutPage() {
	const router = useRouter();
	const regiones = RegionesYComunas.regiones || [];

	const [paso, setPaso] = useState<Paso>(1);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// datos de usuario / contacto
	const [userData, setUserData] = useState({
		nombre: "",
		apellido: "",
		rut: "",
		email: "",
		telefono: "",
	});

	// dirección para envío (obligatoria)
	const [address, setAddress] = useState({
		calle: "",
		numero: "",
		region: "",
		comuna: "",
		depto_oficina: "",
	});

	const [cartItems, setCartItems] = useState<CartItem[]>([]);

	const total = cartItems.reduce((sum, p) => sum + p.precio_unitario * p.cantidad, 0);
	const totalCantidad = cartItems.reduce((sum, p) => sum + p.cantidad, 0);

	// cargar perfil (si está logeado) + carrito
	useEffect(() => {
		let cancelled = false;

		async function loadAll() {
			setLoading(true);
			setError(null);
			try {
				// --- cargar perfil ---
				try {
					const token = typeof window !== "undefined"
						? (() => {
							const direct =
								localStorage.getItem("access") ||
								localStorage.getItem("token");
							if (direct) return direct;
							try {
								const authStored = localStorage.getItem("auth");
								if (!authStored) return null;
								const parsed = JSON.parse(authStored);
								return (
									parsed?.tokens?.access ||
									parsed?.access ||
									null
								);
							} catch (err) {
								return null;
							}
						})()
						: null;
					const headers: Record<string, string> = {};
					if (token) headers.Authorization = `Bearer ${token}`;

					let res = await fetch("/api/usuarios/me", { headers }).catch(
						() => ({ ok: false, status: 0 } as Response)
					);

					if (res.status === 401) {
						const bodyText = await res.text().catch(() => "");
						let parsedBody: any = null;
						try {
							parsedBody = JSON.parse(bodyText);
						} catch (err) {
							parsedBody = null;
						}
						const isExpired =
							bodyText.toLowerCase().includes("expired") ||
							(Array.isArray(parsedBody?.messages) &&
								parsedBody.messages.some((m: any) =>
									typeof m?.message === "string" &&
									m.message.toLowerCase().includes("expired")
								));

						if (isExpired) {
							const refreshToken =
								typeof window !== "undefined"
									? localStorage.getItem("refresh") ||
										(() => {
											try {
												const a = JSON.parse(
													localStorage.getItem("auth") || "{}"
												);
												return a?.refresh || a?.tokens?.refresh || null;
											} catch (err) {
												return null;
											}
										})()
								: null;

							if (refreshToken) {
								const refreshRes = await fetch("/api/auth/refresh", {
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({ refresh: refreshToken }),
								}).catch(() => ({ ok: false, status: 0 } as Response));

								if (refreshRes.ok) {
									const tokens = await refreshRes
										.json()
										.catch(() => null);
									const newAccess = tokens?.access || tokens?.token || null;
									if (newAccess) {
										try {
											localStorage.setItem("access", newAccess);
										} catch (err) {}
										headers.Authorization = `Bearer ${newAccess}`;
										res = await fetch("/api/usuarios/me", {
											headers,
										}).catch(() => ({ ok: false, status: 0 } as Response));
									}
								}
							}
						}
					}

					if (res.ok) {
						const data = await res.json().catch(() => null);
						if (!cancelled && data) {
							setUserData((prev) => ({
								...prev,
								nombre: data.nombre ?? data.first_name ?? prev.nombre,
								apellido:
									data.apellido_paterno ?? data.last_name ?? prev.apellido,
								rut: data.rut ?? prev.rut,
								email: data.correo ?? data.email ?? prev.email,
								telefono: data.telefono ?? data.phone ?? prev.telefono,
							}));

							const dir = data.direccion || data.address || {};
							setAddress((prev) => ({
								...prev,
								calle: dir.calle ?? prev.calle,
								numero: dir.numero ?? prev.numero,
								region: dir.region ?? prev.region,
								comuna: dir.comuna ?? prev.comuna,
								depto_oficina: dir.depto_oficina ?? prev.depto_oficina,
							}));
						}
					}
				} catch (e) {
					// si falla perfil, se sigue como invitado
				}

				// --- cargar carrito ---
				try {
					const resCart = await fetch("/api/cart", { credentials: "include" });
					if (resCart.ok) {
						const data = await resCart.json().catch(() => null);
						const detalles = Array.isArray(data?.detalles) ? data.detalles : [];
						const mapped: CartItem[] = detalles.map((d: any) => ({
							id: d.producto,
							nombre: d.nombre_producto,
							precio_unitario: Number(d.precio_unitario || 0),
							cantidad: Number(d.cantidad || 0),
							imagen: d.imagen ?? null,
						}));
						if (!cancelled) setCartItems(mapped);
					} else if (resCart.status === 401) {
						if (!cancelled)
							setError(
								"Debes iniciar sesión para continuar con el checkout."
							);
					}
				} catch (e) {
					if (!cancelled)
						setError("No se pudo cargar el carrito para el checkout.");
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		loadAll();

		return () => {
			cancelled = true;
		};
	}, []);

	const handleUserChange = (e: any) => {
		const { name, value } = e.target;
		setUserData((prev) => ({ ...prev, [name]: value }));
	};

	const handleAddressChange = (e: any) => {
		const { name, value } = e.target;
		setAddress((prev) => ({ ...prev, [name]: value }));
	};

	function validarPasoActual(): boolean {
		if (paso === 1) {
			if (!userData.nombre || !userData.apellido || !userData.rut || !userData.email) {
				setError(
					"Completa al menos nombre, apellido, RUT y email para continuar."
				);
				return false;
			}
		}
		if (paso === 2) {
			if (
				!address.calle ||
				!address.numero ||
				!address.region ||
				!address.comuna
			) {
				setError(
					"Debes completar calle, número, región y comuna para continuar."
				);
				return false;
			}
		}
		setError(null);
		return true;
	}

	const handleNext = () => {
		if (!validarPasoActual()) return;
		setPaso((p) => (p < 3 ? ((p + 1) as Paso) : p));
	};

	const handleBack = () => {
		setPaso((p) => (p > 1 ? ((p - 1) as Paso) : p));
	};

	const handleConfirmar = async () => {
		if (!validarPasoActual()) return;
		setSaving(true);
		setError(null);
		try {
			const res = await confirmCart();
			if (!res.ok) {
				const message =
					typeof res.data?.detail === "string"
						? res.data.detail
						: "No se pudo completar la reserva.";
				setError(message);
				return;
			}
			router.push("/");
		} catch (e) {
			setError("No se pudo completar la reserva.");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<section className="w-4/5 xl:w-3/5 mx-auto my-7 pt-24">
				<div className="p-6 bg-white rounded shadow text-center text-gray-600">
					Cargando checkout...
				</div>
			</section>
		);
	}

	if (!cartItems.length) {
		return (
			<section className="w-4/5 xl:w-3/5 mx-auto my-7 pt-24">
				<div className="p-6 bg-white rounded shadow text-center text-gray-600">
					No hay productos en el carrito.
				</div>
			</section>
		);
	}

	return (
		<section className="w-4/5 xl:w-3/5 mx-auto my-7 pt-24">
			{/* pasos superiores */}
			<div className="mb-6 flex items-center justify-between text-sm">
				{[
					{ id: 1, label: "Tus datos" },
					{ id: 2, label: "Dirección" },
					{ id: 3, label: "Reserva" },
				].map((step) => {
					const active = paso === step.id;
					const done = paso > step.id;
					return (
						<div key={step.id} className="flex-1 flex flex-col items-center">
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 ${
									active
										? "bg-black border-black text-white"
										: done
										? "bg-white border-black text-black"
										: "bg-white border-gray-300 text-gray-500"
								}`}
							>
								{step.id}
							</div>
							<span
								className={`mt-2 text-xs ${
									active
										? "text-black font-semibold"
										: "text-gray-600"
								}`}
							>
								{step.label}
							</span>
						</div>
					);
				})}
			</div>

			<div className="grid md:grid-cols-3 gap-6">
				{/* contenido paso */}
				<div className="md:col-span-2 bg-white rounded shadow p-6">
					{error && (
						<div className="mb-4 text-sm text-red-700 bg-red-100 p-3 rounded">
							{error}
						</div>
					)}

					{paso === 1 && (
						<div>
							<h2 className="text-xl font-semibold mb-4">Tus datos</h2>
							<p className="text-sm text-gray-600 mb-4">
								Datos para envío de notificaciones de la compra.
							</p>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm mb-1">Nombre</label>
									<input
										name="nombre"
										value={userData.nombre}
										onChange={handleUserChange}
										className="w-full border border-gray-300 rounded-md p-2"
									/>
								</div>
								<div>
									<label className="block text-sm mb-1">Apellido</label>
									<input
										name="apellido"
										value={userData.apellido}
										onChange={handleUserChange}
										className="w-full border border-gray-300 rounded-md p-2"
									/>
								</div>
								<div>
									<label className="block text-sm mb-1">RUT</label>
									<input
										name="rut"
										value={userData.rut}
										onChange={handleUserChange}
										className="w-full border border-gray-300 rounded-md p-2"
									/>
								</div>
								<div>
									<label className="block text-sm mb-1">E-mail</label>
									<input
										name="email"
										value={userData.email}
										onChange={handleUserChange}
										className="w-full border border-gray-300 rounded-md p-2"
										type="email"
									/>
								</div>
								<div>
									<label className="block text-sm mb-1">Teléfono</label>
									<input
										name="telefono"
										value={userData.telefono}
										onChange={handleUserChange}
										className="w-full border border-gray-300 rounded-md p-2"
									/>
								</div>
							</div>
						</div>
					)}

					{paso === 2 && (
						<div>
							<h2 className="text-xl font-semibold mb-4">Dirección</h2>
							<p className="text-sm text-gray-600 mb-4">
								Dirección de envío para tu compra. Todos los campos son
								obligatorios.
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="md:col-span-2">
									<label className="block text-sm mb-1">Calle</label>
									<input
										name="calle"
										value={address.calle}
										onChange={handleAddressChange}
										className="w-full border border-gray-300 rounded-md p-2"
										required
									/>
								</div>
								<div>
									<label className="block text-sm mb-1">Número</label>
									<input
										name="numero"
										value={address.numero}
										onChange={handleAddressChange}
										className="w-full border border-gray-300 rounded-md p-2"
										required
									/>
								</div>
								<div>
									<label className="block text-sm mb-1">Región</label>
									<select
										name="region"
										value={address.region}
										onChange={handleAddressChange}
										className="w-full border border-gray-300 rounded-md p-2"
										required
									>
										<option value="">Seleccione una región</option>
										{regiones.map((r: any) => (
											<option key={r.NombreRegion} value={r.NombreRegion}>
												{r.NombreRegion}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm mb-1">Comuna</label>
									<select
										name="comuna"
										value={address.comuna}
										onChange={handleAddressChange}
										className="w-full border border-gray-300 rounded-md p-2"
										disabled={!address.region}
										required
									>
										<option value="">Seleccione una comuna</option>
										{address.region &&
											regiones
												.find((r: any) => r.NombreRegion === address.region)?.comunas
												.map((c: any) => (
													<option key={c} value={c}>
														{c}
													</option>
												))}
									</select>
								</div>
								<div>
									<label className="block text-sm mb-1">Depto / Oficina</label>
									<input
										name="depto_oficina"
										value={address.depto_oficina}
										onChange={handleAddressChange}
										className="w-full border border-gray-300 rounded-md p-2"
									/>
								</div>
							</div>
						</div>
					)}

					{paso === 3 && (
						<div>
							<h2 className="text-xl font-semibold mb-4">Reserva</h2>
							<p className="text-sm text-gray-600 mb-4">
								Revisa el detalle de tu compra antes de confirmar.
							</p>

							<div className="mb-6 space-y-3">
								{cartItems.map((item) => (
									<div
										key={item.id}
										className="flex justify-between items-center border-b pb-2 text-sm"
									>
										<div className="flex-1 pr-4">
											<div className="font-medium text-gray-800">
												{item.nombre}
											</div>
											<div className="text-gray-500">
												Cantidad: {item.cantidad}
											</div>
										</div>
										<div className="text-right text-gray-800 font-semibold">
											${(item.precio_unitario * item.cantidad).toLocaleString()}
										</div>
									</div>
								))}
							</div>

							<div className="border-t pt-4 text-sm space-y-1">
								<div className="font-semibold text-gray-800">Resumen de datos</div>
								<div className="text-gray-700">
									<span className="font-medium">Nombre:</span> {userData.nombre} {" "}
									{userData.apellido}
								</div>
								<div className="text-gray-700">
									<span className="font-medium">RUT:</span> {userData.rut}
								</div>
								<div className="text-gray-700">
									<span className="font-medium">E-mail:</span> {userData.email}
								</div>
								<div className="text-gray-700">
									<span className="font-medium">Teléfono:</span> {userData.telefono}
								</div>
								<div className="text-gray-700">
									<span className="font-medium">Dirección:</span> {address.calle} {address.numero}, {" "}
									{address.comuna}, {address.region}
									{address.depto_oficina
										? `, Depto/Oficina: ${address.depto_oficina}`
										: ""}
								</div>
							</div>
						</div>
					)}

					<div className="mt-6 flex justify-between">
						<button
							type="button"
							onClick={handleBack}
							disabled={paso === 1}
							className="px-4 py-2 border rounded text-sm disabled:opacity-50"
						>
							Atrás
						</button>

						{paso < 3 ? (
							<button
								type="button"
								onClick={handleNext}
								className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-zinc-800"
							>
								Siguiente
							</button>
						) : (
							<button
								type="button"
								onClick={handleConfirmar}
								disabled={saving}
								className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-zinc-800 disabled:opacity-60"
							>
								{saving ? "Confirmando..." : "Confirmar reserva"}
							</button>
						)}
					</div>
				</div>

				{/* resumen lateral */}
				<aside className="bg-gray-50 rounded border p-4 self-start">
					<div className="text-lg font-semibold mb-2">Resumen ({totalCantidad} producto{totalCantidad !== 1 ? "s" : ""})</div>
					<div className="space-y-2 text-sm mb-4">
						{cartItems.slice(0, 3).map((item) => (
							<div key={item.id} className="flex justify-between">
								<span className="text-gray-700 truncate max-w-[180px]">
									{item.nombre} x{item.cantidad}
								</span>
								<span className="text-gray-900 font-medium">
									${(item.precio_unitario * item.cantidad).toLocaleString()}
								</span>
							</div>
						))}
						{cartItems.length > 3 && (
							<div className="text-xs text-gray-500">
								y {cartItems.length - 3} producto(s) más...
							</div>
						)}
					</div>
					<div className="border-t pt-3 mt-2 text-sm flex justify-between">
						<span className="text-gray-700">Total</span>
						<span className="text-xl font-bold text-gray-900">
							${total.toLocaleString()}
						</span>
					</div>
				</aside>
			</div>
		</section>
	);
}

