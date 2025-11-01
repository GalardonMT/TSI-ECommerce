"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

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

  // Click outside for cart drawer
  useEffect(() => {
    function handleClickOutsideCart(event: MouseEvent) {
      const target = event.target as Node;
      if (
        cartRef.current &&
        !cartRef.current.contains(target)
      ) {
        setCartOpen(false);
      }
    }

    if (cartOpen) {
      document.addEventListener('mousedown', handleClickOutsideCart);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideCart);
    }

    return () => document.removeEventListener('mousedown', handleClickOutsideCart);
  }, [cartOpen]);

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
      <div ref={sentinelRef} className="w-full h-0" />

  <header className={`sticky top-0 z-50 flex w-full h-20 px-12 py-3 justify-center items-center transition-colors duration-200 ${isStuck ? 'bg-transparent' : 'bg-black'} text-white`}>
      {/* Logo */}
      <button className="text-2xl font-bold tracking-wider font-Sansation whitespace-nowrap" onClick={() => router.push('/')}>
        PRO NANO CHILE
      </button>
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
                className="ml-2 px-3 py-2 hover:bg-gray-300 rounded-md"
                aria-label="Cerrar búsqueda"
              >
                {/* X icon */}
                <svg className="size-5" fill="none">
                  <use xlinkHref="/sprites.svg#icon-close" />
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
            <svg className="size-8" viewBox="0 0 50 50">
              <use xlinkHref="/sprites.svg#icon-search" strokeWidth="3" stroke="white"/>
            </svg>
          </button>
        </div>

        {/* Botón login/register */}
        <div className="flex flex-row relative justify-self-center" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="px-4 py-2"
          >
            <svg className="size-8">
              <use xlinkHref="/sprites.svg#icon-user" fill="white"/>
            </svg>

          </button>

          {/* Ventana desplegable */}
          {open && (
            <div className="absolute right-0 mt-14 w-72 bg-white text-gray-800 border-b-gray-950 border-1 rounded-sm p-4 z-50">
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
                    className="absolute size-12 top-1/3 right-0 px-3"
                  >
                    <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <use xlinkHref="/sprites.svg#icon-password-eye"/>
                      <use className={showPassword ? "flex" : "hidden"} xlinkHref="/sprites.svg#icon-password-eye-off"/>
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
                  onClick={() => router.push('/register')}
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
        
        {/* Botón Carrito de compra: Pendiente de hacer */}
        <button onClick={() => setCartOpen(true)} className="flex flex-row items-center justify-self-center">
            <div className="px-4 py-2">
              <svg className="size-9" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <use xlinkHref="/sprites.svg#icon-cart" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
        </button>
      </div>
    </header>
      {/* Cart drawer (slides from left) */}
      <div
        ref={cartRef}
        className={`fixed top-0 right-0 h-full w-80 bg-white z-60 shadow-lg transform transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!cartOpen}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Carrito de Compras</h2>
            <button onClick={() => setCartOpen(false)} aria-label="Cerrar carrito" className="px-2 py-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <use xlinkHref="/sprites.svg#icon-close" />
              </svg>
            </button>
          </div>

          <div className="flex-1">
            {/* Placeholder white box content while implementing cart */}
            <div className="w-full h-64 bg-white border rounded-md shadow-inner flex items-center justify-center text-gray-500">
              Carrito vacío
            </div>
          </div>

          <div className="mt-4">
            <button className="w-full bg-black text-white py-2 rounded-md">Ir al pago</button>
          </div>
        </div>
      </div>
    </>
  );
}
