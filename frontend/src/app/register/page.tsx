"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegionesYComunas } from '../../../lib/regiones';

export default function Register() {
  const router = useRouter();
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');
  const regiones = RegionesYComunas.regiones || [];
  return (
    <section className="w-4/5 xl:w-3/5 mx-auto my-7">
      <h1 className="text-3xl mb-5">Registro</h1>
      <div className="grid grid-cols-2 gap-28">
        {/* Datos de usuario */}
        <form className="flex flex-col gap-4 px-4 text-zinc-600">
          <h2 className="text-xl text-black mb-1">Datos de usuario</h2>
          <div>
            <label className="block mb-1">Nombre</label>
            <input
            type="text"
            className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Apellido</label>
            <input
            type="text"
            className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block mb-1">RUT</label>
            <input
            type="text"
            className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
            type="email"
            className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Teléfono</label>
            <input
            type="tel"
            className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="py-8">
            <label className="block mb-1">Contraseña</label>
            <input
            type="password"
            className="w-full border border-gray-300 rounded-md p-2 mb-4"
            />
            <label className="block mb-1">Confirmar contraseña</label>
            <input
            type="password"
            className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </form>
        {/* Datos de envio */}
        <form className="flex flex-col gap-4 text-zinc-600 px-4">
          <h2 className="text-xl text-black mb-1">Información de envío</h2>
          <div>
            <label className="block mb-1">Región</label>
            <select
              value={region}
              onChange={(e) => { setRegion(e.target.value); setComuna(''); }}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Seleccione una región</option>
              {regiones.map((r: any) => (
                <option key={r.NombreRegion} value={r.NombreRegion}>{r.NombreRegion}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Comuna</label>
            <select
              value={comuna}
              onChange={(e) => setComuna(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              disabled={!region}
            >
              <option value="">Seleccione una comuna</option>
              {region && (
                regiones.find((r: any) => r.NombreRegion === region)?.comunas.map((c: any) => (
                  <option key={c} value={c}>{c}</option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block mb-1">Calle</label>
            <input
            type="text"
            className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Numero</label>
            <input
            type="text"
            className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block mb-1">N° depto / oficina / otro</label>
            <input
            type="text"
            className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-15">
            <button
            type="submit"
            className="w-full bg-black text-white rounded-md p-2 hover:bg-zinc-800 transition"
            >
              Crear cuenta
            </button>
            <button
            type="button"
            className="w-full bg-zinc-300 text-zinc-600 rounded-md p-2 hover:bg-zinc-400 transition"
            onClick={() => router.push('/')}
            >
              Volver
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}