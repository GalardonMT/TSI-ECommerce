"use client";

import * as React from "react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Categoria = {
  id_categoria: number;
  nombre: string;
  descripcion: string;
};

export default function CategoryCarousel() {
  const [categories, setCategories] = React.useState<Categoria[]>([]);
  
  const plugin = React.useRef(
    Autoplay({ delay: 10000, stopOnInteraction: false })
  );

  React.useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/inventario/categoria/");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error cargando categorías", error);
      }
    }
    fetchCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="container mx-auto py-12 px-12 md:px-16">
      <h2 className="text-3xl mb-8 text-gray-900 uppercase tracking-tight text-center md:text-center">
        Mas productos
      </h2>

      <div className="w-full relative group">
        <Carousel
          plugins={[plugin.current]}
          opts={{
            loop: true,
            align: "start"
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {categories.map((cat) => (
              <CarouselItem key={cat.id_categoria} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                {/* CAMBIO AQUÍ: Enviamos el nombre (encodeURIComponent es vital por si tiene espacios) */}
                <Link 
                  href={`/products?category=${encodeURIComponent(cat.nombre)}`}
                  className="group/card block relative overflow-hidden rounded-lg bg-gray-100 hover:shadow-lg transition-all duration-300 h-40"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-90 group-hover/card:opacity-100 transition-opacity" />
                  
                  <div className="relative p-4 h-full flex flex-col justify-center items-center text-center z-10">
                    <h3 className="text-white text-lg font-bold uppercase tracking-wider group-hover/card:scale-105 transition-transform duration-300">
                      {cat.nombre}
                    </h3>
                    {cat.descripcion && (
                      <p className="text-gray-300 text-xs mt-2 line-clamp-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                        {cat.descripcion}
                      </p>
                    )}
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12 border-gray-300 text-gray-600 hover:text-black hover:bg-gray-100" />
          <CarouselNext className="hidden md:flex -right-12 border-gray-300 text-gray-600 hover:text-black hover:bg-gray-100" />
        
        </Carousel>
      </div>
    </section>
  );
}