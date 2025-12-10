"use client";

import * as React from "react";
import Image from "next/image";
import Link from 'next/link';
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Tipos de datos
type ProductoImagen = {
  image: string;
  orden: number;
};

type ProductoBackend = {
  id_producto: number;
  nombre: string;
  precio: number;
  imagenes: ProductoImagen[];
  destacado: boolean;
};

export default function FeaturedProducts() {
  const [products, setProducts] = React.useState<ProductoBackend[]>([]);

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  // Obtener datos del API al cargar el componente
  React.useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/inventario/producto/?destacado=true");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
    }
    fetchFeatured();
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="container mx-auto py-16 px-12 md:px-16">
      <h2 className="text-3xl mb-8 text-center uppercase tracking-tight">
        Destacados
      </h2>

      {/* Carrusel Infinito */}
      <div className="w-full relative group">
        <Carousel
          plugins={[plugin.current]}
          opts={{
            loop: true,  
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {products.map((product) => {
              const imageSrc = product.imagenes && product.imagenes.length > 0 
                ? product.imagenes[0].image 
                : "/placeholder.png"; 

              return (
                <CarouselItem key={product.id_producto} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <div className="group relative">
                    {/* Contenedor de imagen cuadrado */}
                    <div className="aspect-square w-full overflow-hidden bg-gray-200 relative">
                      <Image
                        src={imageSrc}
                        alt={product.nombre}
                        fill
                        className="object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
                        unoptimized={true}
                      />
                    </div>

                    {/* Información */}
                    <div className="mt-3 text-center">
                      <h3 className="text-sm font-medium text-gray-700 truncate px-2">
                        <Link href={`/products/${product.id_producto}`}>
                          <span aria-hidden="true" className="absolute inset-0" />
                          {product.nombre}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">
                        ${product.precio}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          
          {/* Flechas de navegación (ocultas en móvil) */}
          <CarouselPrevious className="hidden md:flex -left-12 border-gray-300 text-gray-600 hover:text-black hover:bg-gray-100" />
          <CarouselNext className="hidden md:flex -right-12 border-gray-300 text-gray-600 hover:text-black hover:bg-gray-100" />
        </Carousel>
      </div>
    </section>
  );
}