"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { RegionesYComunas } from "@/lib/regiones";
import { confirmCart } from "@/app/api/cart/addItem";
import { Stepper } from "@/components/cart/checkout/Stepper";
import { UserForm } from "@/components/cart/checkout/UserForm";
import { AddressForm } from "@/components/cart/checkout/AddressForm";
import { ReviewStep } from "@/components/cart/checkout/ReviewStep";
import { SummarySidebar } from "@/components/cart/checkout/SummarySidebar";
import { AddressData, CartItem, Paso, UserData } from "@/components/cart/checkout/types";

const refreshSession = async (): Promise<boolean> => {
	try {
		const res = await fetch("/api/auth/refresh", {
			method: "POST",
			credentials: "include",
		}).catch(() => ({ ok: false } as Response));

		if (!res.ok) {
			return false;
		}

		await res.json().catch(() => null);
		return true;
	} catch {
		return false;
	}
};

export default function CheckoutPage() {
	const router = useRouter();
	const regiones = RegionesYComunas.regiones || [];

	const [paso, setPaso] = useState<Paso>(1);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// datos de usuario / contacto
	const [userData, setUserData] = useState<UserData>({
		nombre: "",
		apellido: "",
		rut: "",
		email: "",
		telefono: "",
	});

	// dirección para envío (obligatoria)
	const [address, setAddress] = useState<AddressData>({
		calle: "",
		numero: "",
		region: "",
		comuna: "",
		depto_oficina: "",
	});

	const [cartItems, setCartItems] = useState<CartItem[]>([]);

	useEffect(() => {
		let cancelled = false;

		const loadAll = async () => {
			setLoading(true);
			setError(null);
			try {
				let profileRes = await fetch("/api/usuarios/me", {
					credentials: "include",
				}).catch(() => ({ ok: false, status: 0 } as Response));

				if (profileRes.status === 401) {
					const refreshed = await refreshSession();
					if (refreshed) {
						profileRes = await fetch("/api/usuarios/me", {
							credentials: "include",
						}).catch(() => ({ ok: false, status: 0 } as Response));
					}
				}

				if (profileRes.ok) {
					const data = await profileRes.json().catch(() => null);
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

						try {
							localStorage.setItem("auth", JSON.stringify({ user: data }));
						} catch {
							/* ignore storage issues */
						}
					}
				}

				let cartRes = await fetch("/api/cart", {
					credentials: "include",
				}).catch(() => ({ ok: false, status: 0 } as Response));

				if (cartRes.status === 401) {
					const refreshed = await refreshSession();
					if (refreshed) {
						cartRes = await fetch("/api/cart", {
							credentials: "include",
						}).catch(() => ({ ok: false, status: 0 } as Response));
					}
				}

				if (cartRes.ok) {
					const data = await cartRes.json().catch(() => null);
					const detalles = Array.isArray(data?.detalles) ? data.detalles : [];
					const mapped: CartItem[] = detalles.map((d: any) => ({
						id: d.producto,
						nombre: d.nombre_producto,
						precio_unitario: Number(d.precio_unitario || 0),
						cantidad: Number(d.cantidad || 0),
						imagen: d.imagen ?? null,
					}));
					if (!cancelled) setCartItems(mapped);
				} else if (!cancelled) {
					if (cartRes.status === 401) {
						setError("Debes iniciar sesión para continuar con el checkout.");
					} else {
						setError("No se pudo cargar el carrito para el checkout.");
					}
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		loadAll();

		return () => {
			cancelled = true;
		};
	}, []);

	const handleUserChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setUserData((prev) => ({ ...prev, [name]: value }));
	};

	const handleAddressChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
			let res = await confirmCart();
			if (!res.ok && res.status === 401) {
				const refreshed = await refreshSession();
				if (refreshed) {
					res = await confirmCart();
				}
			}

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
			<Stepper current={paso} />

			<div className="grid md:grid-cols-3 gap-6">
				<div className="md:col-span-2 bg-white rounded shadow p-6">
					{error && (
						<div className="mb-4 text-sm text-red-700 bg-red-100 p-3 rounded">
							{error}
						</div>
					)}

					{paso === 1 && (
						<UserForm value={userData} onChange={handleUserChange} />
					)}

					{paso === 2 && (
						<AddressForm value={address} regiones={regiones} onChange={handleAddressChange} />
					)}

					{paso === 3 && (
						<ReviewStep cartItems={cartItems} userData={userData} address={address} />
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

				<SummarySidebar cartItems={cartItems} />
			</div>
		</section>
	);
}

