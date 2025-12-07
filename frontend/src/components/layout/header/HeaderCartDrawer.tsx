"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type HeaderCartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function HeaderCartDrawer({ open, onClose }: HeaderCartDrawerProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleViewCart = () => {
    onClose();
    router.push("/cart");
  };

  return (
    <div
      ref={containerRef}
      className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="h-full flex flex-col p-6">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold font-Sansation tracking-wide text-black">Carrito</h2>
          <button onClick={onClose} className="text-black" aria-label="Cerrar carrito">
            <svg className="w-6 h-6 stroke-current fill-none">
              <use xlinkHref="/sprites.svg#icon-close" />
            </svg>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400 text-base font-medium">
          Tu carrito está vacío.
        </div>
        <button
          onClick={handleViewCart}
          className="w-full bg-[#151515] text-white py-3 font-bold tracking-widest hover:bg-zinc-800 transition text-base"
        >
          Ver carrito
        </button>
      </div>
    </div>
  );
}
