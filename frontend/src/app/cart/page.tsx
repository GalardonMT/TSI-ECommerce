"use client";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/cart/productsCard";
import { useCart } from "@/context/cartContext";

export default function Cart() {
  const router = useRouter();
  const { cart, removeFromCart, changeQty } = useCart();

  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

  return (
    <section className="w-4/5 xl:w-3/5 mx-auto my-7">
      <h1 className="text-3xl mb-5">Carrito de Compras</h1>

      {cart.length === 0 ? (
        <div className="p-6 bg-white rounded shadow text-center text-gray-600">
          No hay productos en el carrito
        </div>
      ) : (
        <div className="bg-white rounded shadow p-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {cart.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onRemove={removeFromCart}
                  onChangeQty={changeQty}
                />
              ))}
            </div>

            <aside className="flex md:col-span-1 bg-gray-50">
              <div className="self-center w-full rounded border p-2">
                <div className="text-lg font-semibold">Resumen</div>
                <div className="mt-4 text-2xl font-bold">
                  Total: ${total.toLocaleString()}
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-black text-white py-2 rounded mt-5"
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
