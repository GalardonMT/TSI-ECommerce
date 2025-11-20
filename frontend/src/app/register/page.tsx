"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegionesYComunas } from "../../../lib/regiones";

export default function Register() {
  const router = useRouter();
  const regiones = RegionesYComunas.regiones || [];

  const [nombre, setNombre] = useState("");
  const [apellidoP, setApellidoP] = useState("");
  const [apellidoM, setApellidoM] = useState("");
  const [rut, setRut] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [depto, setDepto] = useState("");
  const [referencia, setReferencia] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones simples cliente
    if (!nombre || !apellidoP || !correo || !password || !passwordConfirm) {
      setError("Completa los campos obligatorios (nombre, apellido paterno, correo y contraseñas).");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const payload: any = {
      correo,
      nombre,
      apellido_paterno: apellidoP,
      apellido_materno: apellidoM || "",
      rut: rut || "",
      telefono: telefono || "",
      password,
      password_confirm: passwordConfirm,
    };

    // Agrega direccion solo si hay algún dato
    if (calle || numero || region || comuna || depto || referencia) {
      payload.direccion = {
        calle: calle || "",
        numero: numero || "",
        comuna: comuna || "",
        region: region || "",
        depto_oficina: depto || "",
      };
    }

    try {
      const res = await fetch(`${API_BASE}/api/usuarios/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // Formatea errores devueltos por DRF
        if (data && typeof data === "object") {
          const msg = Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join(" | ");
          setError(msg || "Error en el registro");
        } else {
          setError(data?.detail || "Error en el registro");
        }
        setLoading(false);
        return;
      }

      // Si backend devuelve tokens, guardarlos
      if (data.tokens) {
        try {
          localStorage.setItem("access", data.tokens.access);
          localStorage.setItem("refresh", data.tokens.refresh);
        } catch (err) {
          console.warn("No se pudieron guardar tokens en localStorage", err);
        }
      }

      // redirigir (o podrías mostrar un mensaje de éxito)
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-4/5 xl:w-3/5 mx-auto my-7">
      <h1 className="text-3xl mb-5">Registro</h1>

      {error && <div className="mb-4 text-sm text-red-700 bg-red-100 p-3 rounded">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-28">
          {/* Datos de usuario */}
          <div className="flex flex-col gap-4 px-4 text-zinc-600">
            <h2 className="text-xl text-black mb-1">Datos de usuario</h2>
            <div>
              <label className="block mb-1">Nombre</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} type="text" className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div>
              <label className="block mb-1">Apellido paterno</label>
              <input value={apellidoP} onChange={(e) => setApellidoP(e.target.value)} type="text" className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div>
              <label className="block mb-1">Apellido materno</label>
              <input value={apellidoM} onChange={(e) => setApellidoM(e.target.value)} type="text" className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div>
              <label className="block mb-1">RUT</label>
              <input value={rut} onChange={(e) => setRut(e.target.value)} type="text" className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div>
              <label className="block mb-1">Email</label>
              <input value={correo} onChange={(e) => setCorreo(e.target.value)} type="email" className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div>
              <label className="block mb-1">Teléfono</label>
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} type="text" className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div className="py-4">
              <label className="block mb-1">Contraseña</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full border border-gray-300 rounded-md p-2 mb-4" />
              <label className="block mb-1">Confirmar contraseña</label>
              <input value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} type="password" className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>

          {/* Datos de envio */}
          <div className="flex flex-col gap-4 text-zinc-600 px-4">
            <h2 className="text-xl text-black mb-1">Información de envío</h2>

            <div>
              <label className="block mb-1">Región</label>
              <select value={region} onChange={(e) => { setRegion(e.target.value); setComuna(""); }} className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Seleccione una región</option>
                {regiones.map((r: any) => <option key={r.NombreRegion} value={r.NombreRegion}>{r.NombreRegion}</option>)}
              </select>
            </div>

            <div>
              <label className="block mb-1">Comuna</label>
              <select value={comuna} onChange={(e) => setComuna(e.target.value)} className="w-full border border-gray-300 rounded-md p-2" disabled={!region}>
                <option value="">Seleccione una comuna</option>
                {region && regiones.find((r: any) => r.NombreRegion === region)?.comunas.map((c: any) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block mb-1">Calle</label>
              <input value={calle} onChange={(e) => setCalle(e.target.value)} type="text" className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div>
              <label className="block mb-1">Numero</label>
              <input value={numero} onChange={(e) => setNumero(e.target.value)} type="text" className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div>
              <label className="block mb-1">N° depto / oficina / otro</label>
              <input value={depto} onChange={(e) => setDepto(e.target.value)} type="text" className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-15">
              <button disabled={loading} type="submit" className="w-full bg-black text-white rounded-md p-2 hover:bg-zinc-800 transition disabled:opacity-60">
                {loading ? "Creando..." : "Crear cuenta"}
              </button>

              <button type="button" className="w-full bg-zinc-300 text-zinc-600 rounded-md p-2 hover:bg-zinc-400 transition" onClick={() => router.push("/")}>
                Volver
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
