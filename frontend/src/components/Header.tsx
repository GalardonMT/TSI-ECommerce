"use client";

import { useState, useEffect, useRef } from "react";
import { text } from "stream/consumers";

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
    <header className="w-full bg-neutral-800 text-white px-6 py-3 flex items-center justify-between fixed top-0">
      {/* Logo */}
      <a className="text-xl font-bold" href="">
        Pro Nano Chile
      </a>

      {/* Botón login/register */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="text-white hover:text-[#FFF374] px-4 py-2 transition-colors"
        >
          <svg width="28" height="28" className="stroke-current" fill="none" strokeWidth="2" >
            <use xlinkHref="/sprites.svg#icon-user" />
          </svg>
        </button>

        {/* Ventana desplegable */}
        {open && ( 
          <div className="absolute right-0 mt-2 w-72 bg-white text-gray-800 rounded-lg shadow-lg p-4 z-50">
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
    </header>
  );
}
