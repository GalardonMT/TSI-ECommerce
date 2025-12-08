import Image from "next/image";
import Link from 'next/link';
import { backendUrl } from "@/lib/auth/serverTokens";

// Tipos de datos que vienen del Backend
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

// Función para obtener SOLO los destacados (Server Side)
async function getFeaturedProducts() {
  const BACKEND = backendUrl();
  try {
    const res = await fetch(`${BACKEND}/api/inventario/producto/?destacado=true`, {
      cache: "no-store", 
    });

    if (!res.ok) return [];
    
    const data: ProductoBackend[] = await res.json();
    // Aumentamos el límite a 4 u 8 para que se vea bien en la nueva grilla
    return data; 
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (products.length === 0) return null;

  return (
    <section className="container mx-auto py-16 px-4">
      <h2 className="text-3xl mb-8 text-center uppercase tracking-tight">
        Destacados
      </h2>

      {/* CAMBIO CLAVE EN EL GRID:
         - grid-cols-2: En móviles se verán 2 productos pequeños por fila.
         - sm:grid-cols-3: En tablets 3.
         - lg:grid-cols-4: En PC grandes 4 (esto reduce el tamaño individual de cada tarjeta).
      */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-6">
        {products.map((product) => {
          const imageSrc = product.imagenes && product.imagenes.length > 0 
            ? product.imagenes[0].image 
            : "/placeholder.png"; 

          return (
            <div key={product.id_producto} className="group relative">
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
          );
        })}
      </div>
    </section>
  );
}