"use client";
import React from 'react';

type Product = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

type Props = {
  product: Product;
  onRemove: (id: string) => void;
  onChangeQty: (id: string, qty: number) => void;
};

// Presentational component that renders a single product row in the cart.
export default function ProductCard({ product, onRemove, onChangeQty }: Props) {
  return (
    <div className="flex items-center gap-4 bg-zinc-300">
      <div className="w-40 h-40 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
        {product.image ? (
          // image is served from /public
          <img src={product.image} alt={product.name} className="max-w-full max-h-full" />
        ) : null}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-gray-800">{product.name}</div>
        <div className="text-sm text-gray-600">Precio: ${product.price.toLocaleString()}</div>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center border rounded overflow-hidden">
            <button
              aria-label={`Disminuir cantidad de ${product.name}`}
              onClick={() => onChangeQty(product.id, product.qty - 1)}
              className="px-3 py-1 bg-white hover:bg-gray-100"
            >
              -
            </button>
            <div className="px-4 py-1 bg-white">{product.qty}</div>
            <button
              aria-label={`Aumentar cantidad de ${product.name}`}
              onClick={() => onChangeQty(product.id, product.qty + 1)}
              className="px-3 py-1 bg-white hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 w-36 mr-4">
        <div className="text-sm text-gray-700">Subtotal</div>
        <div className="font-semibold">${(product.price * product.qty).toLocaleString()}</div>
        <button
          onClick={() => onRemove(product.id)}
          className="text-sm text-red-600 hover:underline mt-2"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}