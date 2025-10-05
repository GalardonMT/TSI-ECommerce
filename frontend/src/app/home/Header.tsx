"use client";

import { useState, useEffect, useRef } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // referencia al contenedor

  // Detectar clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Limpieza
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <header className="w-full h-20 bg-neutral-600 text-white px-6 py-3 items-center grid grid-cols-6 grid-rows-1">
      {/* Logo */}
      <a className="text-xl font-bold" href="">
        Pro Nano Chile
      </a>

      {/* Search Bar */}
      <form className=" w-4/5 col-span-3 flex items-center divide-zinc-700 divide-x" onSubmit={e => e.preventDefault()}>
        <input
          type="text"
          placeholder="Buscar productos..."
          className="bg-zinc-300 w-full px-4 py-2 rounded-l-md text-black text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="group bg-zinc-300 hover:bg-zinc-500 text-black px-4 py-2 rounded-r-md font-semibold transition"
        >
          <svg className="size-6" viewBox="0 0 51 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="w-full stroke-3 stroke-zinc-600 group-hover:stroke-zinc-300 transition-colors" cx="20.5233" cy="20.9778" r="18.5987"/>
            <line className="w-full h-full stroke-3 stroke-zinc-600 group-hover:stroke-zinc-300 transition-colors" y1="-1.5" x2="20.3197" y2="-1.5" transform="matrix(0.711303 0.702886 -0.711303 0.702886 34.2129 34.8385)"/>
          </svg>
        </button>
      </form>

      {/* Botón login/register */}
      <div className="flex flex-row relative justify-self-center" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="text-white text-lg px-4 py-2 font-semibold whitespace-nowrap flex flex-row items-center justify-center"
        >
          Cuenta
          <svg className="w-13 mx-12" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 23.8245C28.0388 23.8245 30.9532 22.5695 33.102 20.3355C35.2508 18.1015 36.458 15.0716 36.458 11.9122C36.458 8.75292 35.2508 5.723 33.102 3.48902C30.9532 1.25504 28.0388 0 25 0C21.9612 0 19.0468 1.25504 16.898 3.48902C14.7492 5.723 13.542 8.75292 13.542 11.9122C13.542 15.0716 14.7492 18.1015 16.898 20.3355C19.0468 22.5695 21.9612 23.8245 25 23.8245ZM25 29.0582C9.76591 29.0582 0 37.7983 0 42.0538V50H50V42.0538C50 36.9075 40.7545 29.0582 25 29.0582Z" fill="white"/>
          </svg>

        </button>

        {/* Ventana desplegable */}
        {open && (
          <div className="absolute right-0 mt-16 w-72 bg-white text-gray-800 rounded-lg p-4 z-50">
            <form className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Usuario</label>
                <input
                  type="text"
                  placeholder="Ingresa tu usuario"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                Iniciar sesión
              </button>

              <button
                type="button"
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-md font-semibold hover:bg-gray-300 transition"
              >
                Registrarse
              </button>

              <button
                type="button"
                className="w-full text-sm text-blue-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          </div>
        )}
      </div>
      
      {/* Botón Carrito de compra */}
      <button className="flex flex-row items-center justify-self-center">
          <div className="w-24 mx-6 leading-7 text-center text-white text-lg font-bold">Carrito de Compras</div>
          <div className="px-2">
            <svg width="52" viewBox="0 0 61 59" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M44.8144 39.0324L52.1879 5.30195H60.2545V0H48.6631L46.9249 7.95137L0 7.91215L4.98882 39.0322H44.8144V39.0324ZM45.7662 13.2524L41.2897 33.7304H8.75587L5.46766 13.2187L45.7662 13.2524Z" fill="white"/>
              <path d="M38.6022 58.3543C42.6038 58.3543 45.8594 54.5507 45.8594 49.8756C45.8594 45.2004 42.6038 41.397 38.6022 41.397H11.2598C7.25821 41.397 4.00256 45.2004 4.00256 49.8756C4.00256 54.5507 7.25814 58.3543 11.2598 58.3543C15.2616 58.3543 18.5171 54.5507 18.5171 49.8756C18.5171 48.7528 18.3288 47.6806 17.988 46.6989H31.874C31.5332 47.6806 31.3449 48.7528 31.3449 49.8756C31.345 54.5507 34.6006 58.3543 38.6022 58.3543ZM13.9789 49.8756C13.9789 51.6273 12.7592 53.0524 11.2598 53.0524C9.76053 53.0524 8.5407 51.6273 8.5407 49.8756C8.5407 48.124 9.76046 46.6989 11.2598 46.6989C12.7592 46.6989 13.9789 48.124 13.9789 49.8756ZM41.3214 49.8756C41.3214 51.6273 40.1016 53.0524 38.6023 53.0524C37.103 53.0524 35.8832 51.6273 35.8832 49.8756C35.8832 48.124 37.103 46.6989 38.6023 46.6989C40.1016 46.6989 41.3214 48.124 41.3214 49.8756Z" fill="white"/>
            </svg>
          </div>
      </button>
    </header>
  );
}
