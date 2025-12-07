"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getDisplayEmail, userIsEmpleado } from "../../../app/api/auth/login/headerUtils";
import { clearTokens } from "../../../app/api/auth/login/tokenStorage";

type Category = {
  id_categoria: number;
  nombre: string;
};

type HeaderMobileMenuProps = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  user: any | null;
  onUserChange: (value: any | null) => void;
  pathname: string;
};

export default function HeaderMobileMenu({
  open,
  onClose,
  categories,
  user,
  onUserChange,
  pathname,
}: HeaderMobileMenuProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [productsOpen, setProductsOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setProductsOpen(false);
  }, [pathname, open]);

  useEffect(() => {
    if (!open) {
      setProductsOpen(false);
    }
  }, [open]);

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  const handleCategoryNavigate = (categoryId: number) => {
    onClose();
    router.push(`/products?categoria=${categoryId}`);
  };

  const handleLogout = () => {
    clearTokens();
    onUserChange(null);
    setProductsOpen(false);
    onClose();
  };

  return (
    <div
      ref={containerRef}
      className={`fixed top-0 left-0 h-full w-80 bg-white text-black z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <span className="font-bold text-xl font-Sansation tracking-widest">MENÚ</span>
          <button onClick={onClose} aria-label="Cerrar menú">
            <svg className="w-6 h-6 stroke-current fill-none">
              <use xlinkHref="/sprites.svg#icon-close" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-6 space-y-6 text-lg font-medium">
          <button onClick={() => handleNavigate("/")} className="block text-left hover:text-gray-600">
            Inicio
          </button>
          <div>
            <button
              onClick={() => setProductsOpen((prev) => !prev)}
              className="flex items-center justify-between w-full hover:text-gray-600"
            >
              Productos
              <svg
                className={`w-4 h-4 transition-transform stroke-current fill-none ${
                  productsOpen ? "rotate-180" : ""
                }`}
              >
                <use xlinkHref="/sprites.svg#icon-chevron-down" />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                productsOpen ? "max-h-96 mt-4 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex flex-col space-y-4 pl-4 text-base text-gray-600 border-l border-gray-200 ml-1">
                <button onClick={() => handleNavigate("/products")} className="font-bold text-left text-black">
                  Ver todo
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id_categoria}
                    onClick={() => handleCategoryNavigate(category.id_categoria)}
                    className="text-left hover:text-black"
                  >
                    {category.nombre}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => handleNavigate("/contacto")} className="block text-left hover:text-gray-600">
            Contacto
          </button>

          <div className="pt-6 border-t border-gray-100 mt-6 space-y-3 text-base">
            {user ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Hola, {getDisplayEmail(user)}</p>
                {(user?.is_empleado || userIsEmpleado(user)) && (
                  <Link
                    href="/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="text-blue-600 text-base"
                  >
                    Panel de administración
                  </Link>
                )}
                <button onClick={() => handleNavigate("/pedidos")} className="block text-left text-sm text-gray-700">
                  Mis pedidos
                </button>
                <button onClick={() => handleNavigate("/perfil")} className="block text-left text-sm text-gray-700">
                  Perfil
                </button>
                <button onClick={handleLogout} className="text-left text-red-600 text-base">
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button onClick={() => handleNavigate("/login")} className="flex items-center gap-2">
                <svg className="w-5 h-5 stroke-current fill-none">
                  <use xlinkHref="/sprites.svg#icon-user" />
                </svg>
                Iniciar sesión
              </button>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
