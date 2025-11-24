"use client";

import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [openSearch, setOpenSearch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // referencia al contenedor
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isStuck, setIsStuck] = useState(() => !isHome);
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  // Helper to determine if a given user should be considered an 'Empleado'.
  // Checks multiple possible shapes and also supports a comma-separated
  // env var `NEXT_PUBLIC_EMPLEADO_EMAILS` for fallback matching by email or domain.
  const userIsEmpleado = (u: any) => {
    try {
      if (!u) return false;
      // Allow superusers/staff as well
      if (u.is_superuser || u.is_staff) return true;
      // normalize email for later checks
      const email = (u.email || u.correo || '').toString().toLowerCase();

      // If user has a 'rol' object with a name field
      if (u.rol && typeof u.rol === 'object') {
        const nombre = (u.rol.nombre_rol || u.rol.nombre || '').toString().toLowerCase();
        if (nombre.includes('empleado')) return true;
      }
      // If 'rol' is a string
      if (typeof u.rol === 'string' && u.rol.toLowerCase().includes('empleado')) return true;
      // Common alternate field names
      if (u.role && typeof u.role === 'string' && u.role.toLowerCase().includes('empleado')) return true;
      if (u.role_name && typeof u.role_name === 'string' && u.role_name.toLowerCase().includes('empleado')) return true;
      // Boolean flag fallback
      if (u.is_empleado) return true;

      // Fallback: check env var list of emails/domains
      const raw = (process.env.NEXT_PUBLIC_EMPLEADO_EMAILS || '').toString();
      if (raw) {
        const items = raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
        if (email) {
          for (const it of items) {
            if (it.startsWith('@')) {
              // domain match
              if (email.endsWith(it)) return true;
            } else if (it.includes('@')) {
              // exact email match
              if (email === it) return true;
            } else {
              // substring match
              if (email.includes(it)) return true;
            }
          }
        }
      }

      // Development fallback: consider specific emails as empleados (useful for local testing)
      const devFallback = ['admin@admin.cl'];
      if (email && devFallback.includes(email)) return true;

      return false;
    } catch (e) {
      return false;
    }
  };

  // Detectar clic fuera
  useEffect(() => {
    // NOTE: loading user from localStorage is done on mount (see separate effect)

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

  // Load user from localStorage once on mount (avoid re-loading when modal opens/closes)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user) {
          const augmented = { ...parsed.user, is_empleado: userIsEmpleado(parsed.user) };
          setUser(augmented);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Persist user when changed
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('auth', JSON.stringify({ user }));
      } else {
        localStorage.removeItem('auth');
      }
    } catch (e) {
      // ignore
    }
  }, [user]);

  

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

    // If we're not on the home page, header should always be visible
    if (!isHome) {
      setIsStuck(true);
      return;
    }

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
  }, [isHome]);

  

  return (
    <>
      {/* sentinel used to detect when the header reaches the top of the viewport */}
      <div ref={sentinelRef} className="w-full h-0" />

  <header className={`sticky top-0 z-50 flex w-full h-20 px-12 py-3 justify-center items-center transition-colors duration-200 ${isStuck ? 'bg-black' : 'bg-transparent'} text-white`}>
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold tracking-wider font-Sansation whitespace-nowrap">
        PRO NANO CHILE
      </Link>
      
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
            <svg className="size-8" viewBox="0 0 50 50" fill="none">
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
                    {user ? (
                      <div className="space-y-3">
                        <div className="text-sm">Conectado como</div>
                        <div className="font-semibold">{user.email}</div>

                        {/* Panel visible only to users with role 'Empleado' or when augmented flag exists */}
                        {(user?.is_empleado || userIsEmpleado(user)) && (
                          <div className="pt-2">
                            <a
                              href="http://localhost:3000/admin/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full block bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 text-center"
                            >
                              Panel de administración
                            </a>
                          </div>
                        )}

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              // simple logout
                              setUser(null);
                              setEmail('');
                              setPassword('');
                              setOpen(false);
                            }}
                            className="w-full bg-gray-200 text-gray-700 py-2 rounded-md font-semibold hover:bg-gray-300 transition"
                          >
                            Cerrar sesión
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="Ingresa tu email"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>

                        <div className="relative">
                          <label className="block text-sm font-medium mb-1">Contraseña</label>
                          <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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

                        {loginError && <div className="text-sm text-red-600">{loginError}</div>}

                        <button
                          type="button"
                          onClick={async () => {
                            setLoginError(null);
                            setLoggingIn(true);
                            try {
                              // Try to login via API - adapt endpoint as needed
                                // Try to login via backend API (Django). Configure base URL in NEXT_PUBLIC_API_URL
                                  const base = process.env.NEXT_PUBLIC_API_URL || '';
                                  const res = await fetch(`${base}/api/auth/login/`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ correo: email, password }),
                              });

                              if (res.ok) {
                                const data = await res.json();
                                // Expect data.user or data.email. Adjust to your backend shape.
                                // If your Django view returns tokens (simplejwt -> access/refresh)
                                if (data.access || data.token || data.refresh) {
                                  // store tokens (consider HttpOnly cookies for production)
                                  if (data.access) localStorage.setItem('access', data.access);
                                  if (data.refresh) localStorage.setItem('refresh', data.refresh);
                                  if (data.token) localStorage.setItem('token', data.token);
                                }

                                // Prefer backend-provided user object (may include role fields)
                                const returnedUser = data.user ?? (data.email ? { email: data.email } : { email });
                                const augmentedUser = { ...returnedUser, is_empleado: userIsEmpleado(returnedUser) };
                                setUser(augmentedUser);
                                setOpen(false);
                              } else if (res.status === 401) {
                                setLoginError('Email o contraseña incorrectos');
                              } else {
                                // fallback: try simple mock login for development
                                // If API returns non-200, show a helpful message
                                const text = await res.text();
                                setLoginError('Error al iniciar sesión: ' + (text || res.statusText));
                              }
                              } catch (err) {
                                // network error or API missing: fallback mock success for dev convenience
                                // Remove this fallback in production
                                console.warn('login request failed, using mock login', err);
                                const fallbackUser = { email, is_empleado: userIsEmpleado({ email }) };
                                setUser(fallbackUser);
                              } finally {
                              setLoggingIn(false);
                            }
                          }}
                          className="w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-zinc-900 transition"
                          disabled={loggingIn}
                        >
                          {loggingIn ? 'Iniciando...' : 'Iniciar sesión'}
                        </button>

                        <Link
                          href="/register"
                          className="w-full bg-gray-200 text-gray-700 py-2 rounded-md font-semibold hover:bg-gray-300 transition inline-block text-center"
                        >
                          Registrarse
                        </Link>

                        <button
                          type="button"
                          className="w-full text-sm text-blue-600 hover:underline"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </>
                    )}
                  </form>
            </div>
          )}
        </div>
        
        {/* Visible Panel de administración (fuera del desplegable) para 'Empleado' */}
        

        {/* Botón Carrito de compra*/}
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
            <button 
            className="w-full bg-black text-white py-2 rounded-md"
            type="button"
            onClick={() => router.push("/cart")}
            >
              Ir al carrito
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
