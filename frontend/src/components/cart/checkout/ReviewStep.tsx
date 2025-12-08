import { AddressData, CartItem, UserData } from "./types";

type Props = {
  cartItems: CartItem[];
  userData: UserData;
  address: AddressData;
};

export function ReviewStep({ cartItems, userData, address }: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Reserva</h2>
      <p className="text-sm text-gray-600 mb-4">
        Revisa el detalle de tu compra antes de confirmar.
      </p>

      <div className="mb-6 space-y-3">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border-b pb-2 text-sm"
          >
            <div className="flex-1 pr-4">
              <div className="font-medium text-gray-800">{item.nombre}</div>
              <div className="text-gray-500">Cantidad: {item.cantidad}</div>
            </div>
            <div className="text-right text-gray-800 font-semibold">
              ${(item.precio_unitario * item.cantidad).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 text-sm space-y-1">
        <div className="font-semibold text-gray-800">Resumen de datos</div>
        <div className="text-gray-700">
          <span className="font-medium">Nombre:</span> {userData.nombre} {userData.apellido}
        </div>
        <div className="text-gray-700">
          <span className="font-medium">RUT:</span> {userData.rut}
        </div>
        <div className="text-gray-700">
          <span className="font-medium">E-mail:</span> {userData.email}
        </div>
        <div className="text-gray-700">
          <span className="font-medium">Teléfono:</span> {userData.telefono}
        </div>
        <div className="text-gray-700">
          <span className="font-medium">Dirección:</span> {address.calle} {address.numero}, {address.comuna}, {address.region}
          {address.depto_oficina ? `, Depto/Oficina: ${address.depto_oficina}` : ""}
        </div>
      </div>
    </div>
  );
}
