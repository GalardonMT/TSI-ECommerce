import { CartItem } from "./types";

type Props = {
  cartItems: CartItem[];
};

export function SummarySidebar({ cartItems }: Props) {
  const total = cartItems.reduce(
    (sum, p) => sum + p.precio_unitario * p.cantidad,
    0
  );
  const totalCantidad = cartItems.reduce((sum, p) => sum + p.cantidad, 0);

  return (
    <aside className="bg-gray-50 rounded border p-4 self-start">
      <div className="text-lg font-semibold mb-2">
        Resumen ({totalCantidad} producto{totalCantidad !== 1 ? "s" : ""})
      </div>
      <div className="space-y-2 text-sm mb-4">
        {cartItems.slice(0, 3).map((item) => (
          <div key={item.id} className="flex justify-between">
            <span className="text-gray-700 truncate max-w-[180px]">
              {item.nombre} x{item.cantidad}
            </span>
            <span className="text-gray-900 font-medium">
              ${(item.precio_unitario * item.cantidad).toLocaleString()}
            </span>
          </div>
        ))}
        {cartItems.length > 3 && (
          <div className="text-xs text-gray-500">
            y {cartItems.length - 3} producto(s) más...
          </div>
        )}
      </div>
      <div className="border-t pt-3 mt-2 text-sm flex justify-between">
        <span className="text-gray-700">Total</span>
        <span className="text-xl font-bold text-gray-900">
          ${total.toLocaleString()}
        </span>
      </div>
    </aside>
  );
}
