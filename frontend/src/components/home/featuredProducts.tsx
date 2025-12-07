import Image from "next/image";
import Link from 'next/link';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const FeaturedProducts = [
{
  id: "super-coat",
  subtitle: "Compromiso Nano",
  title: "SUPER COAT",
  description: "Recubrimiento Cerámico Nano protege su vehículo contra rayones, excrementos de aves, lluvia ácida, rayos UV, detergentes y diversos productos químicos.",
  details: "Cuenta con una duración de 3 años y ofrece un efecto de súper brillo con alta repelencia al agua.",
  imageSrc: "/SuperCoat.jpg", // Ruta a la imagen del producto
  imageAlt: "Botella de SUPER COAT",
  bgImageSrc: "/product-bg-placeholder.jpg", // Opcional: Imagen de fondo para la columna
  bgImageAlt: "Fondo de presentación",
},
{
    id: "otro-producto",
    subtitle: "Limpieza Profunda",
    title: "NANO CLEANER",
    description: "Limpiador intensivo con nanotecnología para eliminar suciedad difícil sin dañar superficies.",
    details: "Ideal para llantas, motores y tapicería.",
    imageSrc: "/nano-cleaner.png",
    imageAlt: "Botella de NANO CLEANER",
    bgImageSrc: "/product-bg-placeholder-2.jpg",
    bgImageAlt: "Fondo diferente",
  },
];

export default function featuredProdutcts (){
  return (
    <section className="container mx-auto py-16">
      <div className="bg-neutral-200 overflow-hidden">
        <Carousel
          opts={{
          align: "start",
          loop: true,
          }}
        >
          <CarouselContent>
            {FeaturedProducts.map((product) => (
              <CarouselItem key={product.id}>
              <div className="flex flex-col md:flex-row">

                <div className="w-full md:w-1/2 text-left p-4 md:p-8">
                  <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">
                    {product.subtitle}
                  </h3>
                  <h2 className="text-4xl font-extrabold mb-4">
                    {product.title}
                  </h2>
                  <p className="mb-4 text-gray-700">
                    {product.description}
                  </p>
                  <p className="mb-4 text-sm text-gray-500 italic">
                    {product.details}
                  </p>
                  <Link href="/products">
                    <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition">
                      Ver producto
                    </button>
                  </Link> 
                </div>

                <div className="w-full md:w-1/2 bg-gray-300 flex items-center justify-center">
                  <img
                    src={product.imageSrc}
                    alt={product.imageAlt}
                    className="object-contain w-auto"
                  />
                </div>   
              </div>
              </CarouselItem>
            ))}
          </CarouselContent>  
        </Carousel>
      </div>  
    </section>
  )
}