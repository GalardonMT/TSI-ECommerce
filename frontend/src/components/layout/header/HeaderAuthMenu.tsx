"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { getDisplayEmail, userIsEmpleado } from "../../../app/api/auth/login/headerUtils";
import { clearTokens } from "../../../app/api/auth/login/tokenStorage";
import { ResetPasswordModal } from "./ResetPasswordModal";

type HeaderAuthMenuProps = {
  user: any | null;
  onUserChange: (value: any | null) => void;
  pathname: string;
};

export default function HeaderAuthMenu({ user, onUserChange, pathname }: HeaderAuthMenuProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogin = async () => {
    setLoginError(null);
    setLoggingIn(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        clearTokens();

        const returnedUser = data?.user ?? (data?.email ? { email: data.email } : { email });
        const augmentedUser = {
          ...returnedUser,
          is_empleado: userIsEmpleado(returnedUser),
        };

        onUserChange(augmentedUser);
        try {
          localStorage.setItem("auth", JSON.stringify({ user: augmentedUser }));
        } catch {
          /* ignore */
        }
        setOpen(false);
        setEmail("");
        setPassword("");
        return;
      }

      if (response.status === 401) {
        setLoginError("Email o contraseña incorrectos");
        return;
      }

      const text = await response.text();
      setLoginError(`Error al iniciar sesión: ${text || response.statusText}`);
    } catch (error) {
      console.error("login request failed", error);
      setLoginError("No se pudo contactar al servidor de autenticación.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);

    onUserChange(null);
    try {
      localStorage.removeItem("auth");
    } catch {
      /* ignore */
    }
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setLoginError(null);
    setOpen(false);
    clearTokens();
  };

  return (
    <div className="relative hidden lg:block" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="hover:text-gray-300 transition-transform hover:scale-105 flex items-center"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg className="w-6 h-6 stroke-current fill-none">
          <use xlinkHref="/sprites.svg#icon-user" />
        </svg>
        {user && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-black transform translate-x-1 -translate-y-1" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-6 w-80 bg-white text-gray-800 rounded shadow-xl p-5 z-50 text-left">
          <form className="space-y-3">
            {user ? (
              <>
                <div className="text-sm border-b pb-2 mb-2">
                  Conectado como
                  <br />
                  <span className="font-bold">{getDisplayEmail(user)}</span>
                </div>
                {(user?.is_empleado || userIsEmpleado(user)) && (
                  <Link
                    href="/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="w-full block bg-blue-600 text-white text-sm font-semibold py-2 text-center rounded hover:bg-blue-700 transition"
                  >
                    Panel de administración
                  </Link>
                )}
                <Link
                  href="/pedidos"
                  onClick={() => setOpen(false)}
                  className="w-full block text-sm py-2 text-left hover:text-gray-600 transition"
                >
                  Mis pedidos
                </Link>
                <Link
                  href="/perfil"
                  onClick={() => setOpen(false)}
                  className="w-full block text-sm py-2 text-left hover:text-gray-600 transition"
                >
                  Perfil
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left text-sm font-semibold text-red-600 hover:text-red-700 transition"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500">Email</label>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    className="w-full border-b border-gray-300 focus:border-[#151515] py-1 outline-none text-sm"
                    placeholder="Ingresa tu email"
                  />
                </div>
                <div className="relative">
                  <label className="text-xs font-bold uppercase text-gray-500">Contraseña</label>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={showPassword ? "text" : "password"}
                    className="w-full border-b border-gray-300 focus:border-[#151515] py-1 outline-none text-sm pr-10"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 px-2"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <svg viewBox="0 0 30 30" fill="none" className="w-6 h-6">
                      <use xlinkHref="/sprites.svg#icon-password-eye" />
                      <use
                        className={showPassword ? "flex" : "hidden"}
                        xlinkHref="/sprites.svg#icon-password-eye-off"
                      />
                    </svg>
                  </button>
                </div>
                {loginError && <div className="text-xs text-red-600">{loginError}</div>}
                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full bg-[#151515] text-white text-sm font-bold py-2 hover:bg-zinc-800 transition"
                  disabled={loggingIn}
                >
                  {loggingIn ? "Iniciando..." : "Iniciar sesión"}
                </button>
                <div className="text-xs text-center mt-2 text-gray-500">
                  <Link href="/register" className="hover:underline font-medium">
                    Crear cuenta
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(true);
                    setResetEmail(email);
                  }}
                  className="w-full text-xs text-left text-blue-600 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </>
            )}
          </form>
        </div>
      )}

      {showResetModal && (
        <ResetPasswordModal
          initialEmail={resetEmail}
          onClose={() => setShowResetModal(false)}
        />
      )}
    </div>
  );
}
