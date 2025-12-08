export type CartItem = {
  id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen?: string | null;
};

export type Paso = 1 | 2 | 3;

export type UserData = {
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  telefono: string;
};

export type AddressData = {
  calle: string;
  numero: string;
  region: string;
  comuna: string;
  depto_oficina: string;
};
