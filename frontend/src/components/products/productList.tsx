import Image from "next/image";
import Link from 'next/link';
import { type Product } from '@/data/products';

type ProductListProps = {
  products: Product[];
};

export default function ProductList({ products }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
      {products.length === 0 && (
        <p className="col-span-full text-center text-gray-500">
          No se encontraron productos con los filtros seleccionados.
        </p>
      )}

      {products.map((product) => (
        <div key={product.id} className="group relative">
          <div className="aspect-square w-full overflow-hidden bg-gray-200 relative">
            <Image
              alt={product.imageAlt}
              src={product.imageSrc}
              fill 
              className="object-cover object-center group-hover:opacity-75"
            />
          </div>

          {/* Detalles del Producto */}
          <div className="mt-4 text-center">
            <h3 className="text-sm text-gray-700">
              <Link href={`/products/${product.id}`}>
                <span aria-hidden="true" className="absolute inset-0" />
                {product.title}
              </Link>
            </h3>
            <p className="mt-1 text-sm font-medium text-gray-900">{product.price}</p>
          </div>
        </div>
      ))}
    </div>
  );
}