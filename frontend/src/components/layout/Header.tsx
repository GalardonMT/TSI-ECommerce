"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import HeaderAuthMenu from "./header/HeaderAuthMenu";
import HeaderCartDrawer from "./header/HeaderCartDrawer";
import HeaderMobileMenu from "./header/HeaderMobileMenu";
import HeaderSearchOverlay from "./header/HeaderSearchOverlay";
import { userIsEmpleado } from "../../app/api/auth/login/headerUtils";

type Category = {
  id_categoria: number;
  nombre: string;
};

type StoredAuth = {
  user?: any;
};

export default function Header() {
  const [user, setUser] = useState<any | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isProductsHover, setIsProductsHover] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [isStuck, setIsStuck] = useState(false);

  const searchToggleRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    try {
      const storedRaw = localStorage.getItem("auth");
      if (!storedRaw) return;
      const stored: StoredAuth = JSON.parse(storedRaw);
      if (stored?.user) {
        const augmented = {
          ...stored.user,
          is_empleado: userIsEmpleado(stored.user),
        };
        setUser(augmented);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("auth", JSON.stringify({ user }));
      } else {
        localStorage.removeItem("auth");
      }
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    let ignore = false;
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/getCategories");
        if (!response.ok) return;
        const data = await response.json();
        if (!ignore && Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };

    loadCategories();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsStuck(window.scrollY > 50);
    };

    if (!isHome) {
      setIsStuck(true);
      return;
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenSearch(false);
  }, [pathname]);

  const handleCategoryNavigate = (categoryId: number) => {
    router.push(`/products?categoria=${categoryId}`);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ease-in-out h-18 ${
          isStuck ? "bg-[#151515]/95 backdrop-blur-md shadow-lg" : "bg-transparent"
        } text-white`}
      >
        <div className="w-full px-6 lg:px-16 h-full flex justify-between lg:grid lg:grid-cols-3 items-center max-w-[1920px] mx-auto">
          <div className="flex items-center">
            <button
              className="lg:hidden mr-4"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <svg className="w-8 h-8 stroke-current fill-none">
                <use xlinkHref="/sprites.svg#icon-menu" />
              </svg>
            </button>

            <nav className="hidden lg:flex justify-start items-center gap-8 text-base font-medium tracking-wide">
              <Link href="/" className="hover:text-gray-300 transition-colors">
                Inicio
              </Link>

              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setIsProductsHover(true)}
                onMouseLeave={() => setIsProductsHover(false)}
              >
                <button className="flex items-center gap-1 hover:text-gray-300 transition-colors py-6">
                  Productos
                  <svg
                    className={`w-4 h-4 transition-transform stroke-current fill-none ${
                      isProductsHover ? "rotate-180" : ""
                    }`}
                  >
                    <use xlinkHref="/sprites.svg#icon-chevron-down" />
                  </svg>
                </button>

                <div
                  className={`absolute top-full left-0 bg-white text-gray-800 shadow-xl min-w-[200px] py-2 transition-all duration-200 origin-top ${
                    isProductsHover ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"
                  }`}
                >
                  <div className="flex flex-col">
                    <Link
                      href="/products"
                      className="px-5 py-2 hover:bg-gray-100 font-bold hover:text-[#151515] transition-colors text-left border-b border-gray-100 text-sm"
                    >
                      Ver todo
                    </Link>
                    {categories.map((category) => (
                      <button
                        key={category.id_categoria}
                        onClick={() => handleCategoryNavigate(category.id_categoria)}
                        className="px-5 py-2 hover:bg-gray-100 hover:text-[#151515] transition-colors text-left text-sm"
                      >
                        {category.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="/contacto" className="hover:text-gray-300 transition-colors">
                Contacto
              </Link>
            </nav>
          </div>

          <div className="flex justify-center">
            <Link
              href="/"
              className="text-3xl md:text-4xl font-bold tracking-[0.2em] font-Sansation whitespace-nowrap hover:opacity-90 transition-opacity"
            >
              PRO NANO
            </Link>
          </div>

          <div className="flex justify-end items-center gap-4 lg:gap-6">
            <button
              ref={searchToggleRef}
              onClick={() => setOpenSearch(true)}
              className="hover:text-gray-300 transition-transform hover:scale-105"
              aria-label="Abrir búsqueda"
            >
              <svg className="w-6 h-6 stroke-current fill-none">
                <use xlinkHref="/sprites.svg#icon-search" />
              </svg>
            </button>

            <HeaderAuthMenu user={user} onUserChange={setUser} pathname={pathname ?? ""} />

            <button
              onClick={() => setCartOpen(true)}
              className="hover:text-gray-300 transition-transform hover:scale-105 relative"
              aria-label="Abrir carrito"
            >
              <svg className="w-6 h-6 stroke-current fill-none">
                <use xlinkHref="/sprites.svg#icon-cart" />
              </svg>
            </button>
          </div>
        </div>

        <HeaderSearchOverlay
          open={openSearch}
          onClose={() => setOpenSearch(false)}
          toggleRef={searchToggleRef}
        />
      </header>

      <HeaderMobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        categories={categories}
        user={user}
        onUserChange={setUser}
        pathname={pathname ?? ""}
      />

      <HeaderCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
