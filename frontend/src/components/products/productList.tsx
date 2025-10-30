import Image from "next/image";
import Link from 'next/link';
import { productsData, type Product } from '@/data/products';

export default function ProductList() {
  return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6  lg:max-w-7xl lg:px-8">
        {/* Grid de productos */}
        <div className="grid grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {productsData.map((product) => (
            <div key={product.id} className="group relative">
              <img
                alt={product.imageAlt}
                src={product.imageSrc}
                className="aspect-square w-full bg-gray-200 object-cover group-hover:opacity-75"
              />
              <div className="mt-4 text-center">
                <div className="mt-4">
                  <h3 className="text-sm text-gray-700">
                    <Link href={product.href || "#"}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm font-medium text-gray-900">{product.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  )
}
