"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { buildBackendUrl } from "../../../app/api/auth/login/headerUtils";

type HeaderSearchOverlayProps = {
  open: boolean;
  onClose: () => void;
  toggleRef: MutableRefObject<HTMLButtonElement | null>;
};

type SearchProduct = {
  id: number;
  title: string;
  price: number;
  imageSrc: string;
  category?: string | null;
};

export default function HeaderSearchOverlay({ open, onClose, toggleRef }: HeaderSearchOverlayProps) {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [allProducts, setAllProducts] = useState<SearchProduct[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const filteredResults = useMemo(() => {
    if (searchTerm.trim() === "") return [];
    const lower = searchTerm.toLowerCase();
    return allProducts
      .filter((product) => {
        const inTitle = product.title.toLowerCase().includes(lower);
        const inCategory = product.category?.toLowerCase().includes(lower) ?? false;
        return inTitle || inCategory;
      })
      .slice(0, 8);
  }, [searchTerm, allProducts]);

  const handleClose = useCallback(() => {
    onClose();
    setSearchTerm("");
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedToggle = toggleRef.current && toggleRef.current.contains(target);
      if (containerRef.current && !containerRef.current.contains(target) && !clickedToggle) {
        handleClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, toggleRef, handleClose]);

  useEffect(() => {
    if (!open || allProducts.length > 0) return;

    let ignore = false;

    const loadProducts = async () => {
      try {
        setLoadingSearch(true);
        const response = await fetch("/api/getProducts");
        if (!response.ok) return;
        const data = await response.json();
        if (ignore || !Array.isArray(data)) return;

        const formatted: SearchProduct[] = data.map((item: any) => {
          let imageSrc = "https://via.placeholder.com/150";
          if (Array.isArray(item.imagenes) && item.imagenes.length > 0) {
            const resource = item.imagenes[0].image;
            if (typeof resource === "string" && resource) {
              imageSrc = resource.startsWith("http")
                ? resource
                : `${buildBackendUrl("/")}${resource.startsWith("/") ? resource.slice(1) : resource}`;
            }
          }

          return {
            id: item.id_producto ?? item.id ?? 0,
            title: item.nombre ?? "Producto",
            price: Number(item.precio ?? 0),
            imageSrc,
            category: item.categoria_nombre ?? item.categoria?.nombre ?? null,
          };
        });

        setAllProducts(formatted);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        if (!ignore) setLoadingSearch(false);
      }
    };

    loadProducts();
    return () => {
      ignore = true;
    };
  }, [open, allProducts.length]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  const handleProductNavigate = useCallback(
    (productId: number) => {
      handleClose();
      router.push(`/products/${productId}`);
    },
    [handleClose, router]
  );

  return (
    <div
      ref={containerRef}
      className={`absolute top-0 left-0 w-full bg-white text-black shadow-xl z-40 transition-transform duration-300 ease-out ${
        open ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4 py-6 flex flex-col items-center">
        <div className="flex items-center w-full max-w-3xl relative">
          <div className="relative w-full">
            <input
              ref={inputRef}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar en nuestra tienda"
              className="w-full border border-gray-300 py-2 pl-5 pr-10 text-sm outline-none focus:border-[#151515] transition-colors placeholder-gray-400 font-normal bg-transparent"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg className="w-4 h-4 stroke-current fill-none">
                <use xlinkHref="/sprites.svg#icon-search" />
              </svg>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="ml-4 text-gray-400 hover:text-[#151515] transition-colors"
            aria-label="Cerrar búsqueda"
          >
            <svg className="w-5 h-5 stroke-current fill-none">
              <use xlinkHref="/sprites.svg#icon-close" />
            </svg>
          </button>
        </div>

        {open && (
          <div className="w-full max-w-5xl mt-8">
            {loadingSearch && !allProducts.length ? (
              <div className="text-center text-gray-400 py-8 text-sm">Cargando productos...</div>
            ) : filteredResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 animate-in fade-in slide-in-from-top-4">
                {filteredResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductNavigate(product.id)}
                    className="group text-left transition-opacity duration-200 hover:opacity-60"
                  >
                    <div className="aspect-square bg-gray-100 mb-2 relative overflow-hidden">
                      <Image src={product.imageSrc} alt={product.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="text-sm font-medium line-clamp-2 leading-tight text-black group-hover:text-gray-600">
                      {product.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {product.price ? `$${product.price.toLocaleString("es-CL")}` : ""}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8 text-sm">No encontramos resultados.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
