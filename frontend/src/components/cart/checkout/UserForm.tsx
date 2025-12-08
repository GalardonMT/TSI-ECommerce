import { ChangeEvent } from "react";
import { UserData } from "./types";

type Props = {
  value: UserData;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function UserForm({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tus datos</h2>
      <p className="text-sm text-gray-600 mb-4">
        Datos para envío de notificaciones de la compra.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input
            name="nombre"
            value={value.nombre}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Apellido</label>
          <input
            name="apellido"
            value={value.apellido}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">RUT</label>
          <input
            name="rut"
            value={value.rut}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">E-mail</label>
          <input
            name="email"
            value={value.email}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md p-2"
            type="email"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Teléfono</label>
          <input
            name="telefono"
            value={value.telefono}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
      </div>
    </div>
  );
}
