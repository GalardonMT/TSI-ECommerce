import { ChangeEvent } from "react";
import { AddressData } from "./types";

type Region = {
  NombreRegion: string;
  comunas: string[];
};

type Props = {
  value: AddressData;
  regiones: Region[];
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export function AddressForm({ value, regiones, onChange }: Props) {
  const comunas = value.region
    ? regiones.find((r) => r.NombreRegion === value.region)?.comunas || []
    : [];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dirección</h2>
      <p className="text-sm text-gray-600 mb-4">
        Dirección de envío para tu compra. Todos los campos son obligatorios.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Calle</label>
          <input
            name="calle"
            value={value.calle}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Número</label>
          <input
            name="numero"
            value={value.numero}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Región</label>
          <select
            name="region"
            value={value.region}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Seleccione una región</option>
            {regiones.map((r) => (
              <option key={r.NombreRegion} value={r.NombreRegion}>
                {r.NombreRegion}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Comuna</label>
          <select
            name="comuna"
            value={value.comuna}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md p-2"
            disabled={!value.region}
            required
          >
            <option value="">Seleccione una comuna</option>
            {comunas.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Depto / Oficina</label>
          <input
            name="depto_oficina"
            value={value.depto_oficina}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
      </div>
    </div>
  );
}
