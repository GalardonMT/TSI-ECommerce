"use client";

import { useState, useEffect, useRef } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // referencia al contenedor
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Click outside for search box (ignore clicks on the search toggle button)
  useEffect(() => {
    function handleClickOutsideSearch(event: MouseEvent) {
      const target = event.target as Node;
      if (
        searchRef.current &&
        !searchRef.current.contains(target) &&
        !(searchToggleRef.current && searchToggleRef.current.contains(target))
      ) {
        setOpenSearch(false);
      }
    }

    if (openSearch) {
      document.addEventListener('mousedown', handleClickOutsideSearch);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideSearch);
    }

    return () => document.removeEventListener('mousedown', handleClickOutsideSearch);
  }, [openSearch]);

  // autofocus search input when opened
  useEffect(() => {
    if (openSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [openSearch]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // when the sentinel is NOT intersecting, the header has reached the top
        entries.forEach((entry) => setIsStuck(!entry.isIntersecting));
      },
      { root: null, threshold: 0 }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* sentinel used to detect when the header reaches the top of the viewport */}
      <div ref={sentinelRef} className="w-full h-px" />

  <header className={`sticky top-0 z-50 flex w-full h-20 px-12 py-3 justify-center items-center transition-colors duration-200 ${isStuck ? 'bg-transparent' : 'bg-black'} text-white`}>
      {/* Logo */}
      <a className="text-2xl font-bold tracking-wider font-Sansation" href="">
        PRO NANO CHILE
      </a>
      <div className="flex flex-1 flex-row justify-end items-center gap-4">
        {/* Centered Search (slides from top). Keep mounted for smooth close animation */}
        <div
          ref={searchRef}
          className={`flex w-full justify-end z-40 transform transition-transform duration-300 ${openSearch ? '-translate-y-2 pointer-events-auto' : '-translate-y-20 pointer-events-none'}`}
        >
          <div className="w-2/5 mt-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchTerm.trim()) console.log('Search for:', searchTerm);
              }}
              className="flex items-center bg-zinc-100 rounded-md shadow-md px-2 py-1"
            >
              <input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder="Buscar productos..."
                className="w-full px-4 py-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => setOpenSearch(false)}
                className="ml-2 px-3"
                aria-label="Cerrar búsqueda"
              >
                {/* X icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
        {/* Search Icon (toggles centered search). If open already, clicking submits the search */}
        <div>
          <button
            ref={searchToggleRef}
            onClick={(e) => {
              if (openSearch) {
                e.preventDefault();
                if (searchTerm.trim()) console.log('Search for:', searchTerm);
              } else {
                setOpenSearch(true);
              }
            }}
            className="px-4 py-2"
            aria-label="Abrir búsqueda"
          >
            <svg className="size-8" viewBox="0 0 51 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="w-full stroke-3 stroke-white transition-colors" cx="20.5233" cy="20.9778" r="18.5987"/>
              <line className="w-full h-full stroke-3 stroke-white transition-colors" y1="-1.5" x2="20.3197" y2="-1.5" transform="matrix(0.711303 0.702886 -0.711303 0.702886 34.2129 34.8385)"/>
            </svg>
          </button>
        </div>

        {/* Botón login/register */}
        <div className="flex flex-row relative justify-self-center" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="px-4 py-2"
          >
            <svg className="size-8" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 23.8245C28.0388 23.8245 30.9532 22.5695 33.102 20.3355C35.2508 18.1015 36.458 15.0716 36.458 11.9122C36.458 8.75292 35.2508 5.723 33.102 3.48902C30.9532 1.25504 28.0388 0 25 0C21.9612 0 19.0468 1.25504 16.898 3.48902C14.7492 5.723 13.542 8.75292 13.542 11.9122C13.542 15.0716 14.7492 18.1015 16.898 20.3355C19.0468 22.5695 21.9612 23.8245 25 23.8245ZM25 29.0582C9.76591 29.0582 0 37.7983 0 42.0538V50H50V42.0538C50 36.9075 40.7545 29.0582 25 29.0582Z" fill="white"/>
            </svg>

          </button>

          {/* Ventana desplegable */}
          {open && (
            <div className="absolute right-0 mt-16 w-72 bg-white text-gray-800 rounded-sm p-4 z-50">
              <form className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="text"
                    placeholder="Ingresa tu email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium mb-1">Contraseña</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="*************"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute size-12 right-0 px-3"
                  >
                    <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g opacity="0.5">
                      <path d="M1.25 15C1.25 15 6.25 5 15 5C23.75 5 28.75 15 28.75 15C28.75 15 23.75 25 15 25C6.25 25 1.25 15 1.25 15Z" stroke="#585858" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M15 18.75C17.0711 18.75 18.75 17.0711 18.75 15C18.75 12.9289 17.0711 11.25 15 11.25C12.9289 11.25 11.25 12.9289 11.25 15C11.25 17.0711 12.9289 18.75 15 18.75Z" stroke="#585858" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <line className={showPassword ? "flex" : "hidden"} x1="3" y1="26.981" x2="25.981" y2="4.00004" stroke="#585858" stroke-width="2.5" stroke-linecap="round"/>
                      </g>
                    </svg>

                  </button>
                </div>

                <button
                  type="button"
                  className="w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-zinc-900 transition"
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
        
        {/* Botón Carrito de compra
            Pendiente de hacer */}
        <button className="flex flex-row items-center justify-self-center">
            <div className="px-4 py-2">
              <svg className="size-8" viewBox="0 0 61 59" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M44.8144 39.0324L52.1879 5.30195H60.2545V0H48.6631L46.9249 7.95137L0 7.91215L4.98882 39.0322H44.8144V39.0324ZM45.7662 13.2524L41.2897 33.7304H8.75587L5.46766 13.2187L45.7662 13.2524Z" fill="white"/>
                <path d="M38.6022 58.3543C42.6038 58.3543 45.8594 54.5507 45.8594 49.8756C45.8594 45.2004 42.6038 41.397 38.6022 41.397H11.2598C7.25821 41.397 4.00256 45.2004 4.00256 49.8756C4.00256 54.5507 7.25814 58.3543 11.2598 58.3543C15.2616 58.3543 18.5171 54.5507 18.5171 49.8756C18.5171 48.7528 18.3288 47.6806 17.988 46.6989H31.874C31.5332 47.6806 31.3449 48.7528 31.3449 49.8756C31.345 54.5507 34.6006 58.3543 38.6022 58.3543ZM13.9789 49.8756C13.9789 51.6273 12.7592 53.0524 11.2598 53.0524C9.76053 53.0524 8.5407 51.6273 8.5407 49.8756C8.5407 48.124 9.76046 46.6989 11.2598 46.6989C12.7592 46.6989 13.9789 48.124 13.9789 49.8756ZM41.3214 49.8756C41.3214 51.6273 40.1016 53.0524 38.6023 53.0524C37.103 53.0524 35.8832 51.6273 35.8832 49.8756C35.8832 48.124 37.103 46.6989 38.6023 46.6989C40.1016 46.6989 41.3214 48.124 41.3214 49.8756Z" fill="white"/>
              </svg>
            </div>
        </button>
      </div>
    </header>
    </>
  );
}
