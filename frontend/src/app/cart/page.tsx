"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import ProductCard from "@/components/cart/productsCard";

type Product = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

export default function Cart() {
  const initial: Product[] = [
    { id: "p1", name: "Producto 1", price: 19990, qty: 1, image: "/file.svg" },
    { id: "p2", name: "Producto 2", price: 29990, qty: 2, image: "/globe.svg" },
    { id: "p3", name: "Producto 3", price: 18990, qty: 1, image: "/file.svg" },
  ];

  const [items, setItems] = useState<Product[]>(initial);
  const router = useRouter();

  function removeItem(id: string) {
    setItems((s) => s.filter((p) => p.id !== id));
  }

  function changeQty(id: string, qty: number) {
    if (qty <= 0) {
      // remove if decreased to 0 or below
      setItems((s) => s.filter((p) => p.id !== id));
    } else {
      setItems((s) => s.map((p) => (p.id === id ? { ...p, qty } : p)));
    }
  }

  const total = items.reduce((sum, p) => sum + p.price * p.qty, 0);

  return (
    <section className="w-4/5 xl:w-3/5 mx-auto my-7">
      <h1 className="text-3xl mb-5">Carrito de Compras</h1>

      {items.length === 0 ? (
        <div className="p-6 bg-white rounded shadow text-center text-gray-600">No hay productos en el carrito</div>
      ) : (
        <div className="bg-white rounded shadow p-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} onRemove={removeItem} onChangeQty={changeQty} />
              ))}
            </div>

            <aside className="flex md:col-span-1 bg-gray-50">
              <div className="self-center w-full rounded border p-2">
                <div className="text-lg font-semibold">Resumen</div>
                  <div className="mt-4 text-2xl font-bold">Total: ${total.toLocaleString()}</div>
                  {/*Configurar costos de envio: Pendiente*/}
                  <div>Envio: 5000</div>
                <button
                onClick={() => router.push('/checkout')}
                className="mt-18 w-full bg-black text-white py-2 rounded bottom-5 inset-x-0"
                >
                Ir a Checkout
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}
    </section>
  );
}