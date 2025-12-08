import { MapPin, ShieldCheck, CreditCard, MessageCircle } from "lucide-react"; 

const incentives = [
  {
    name: 'Envíos en R. Metropolitana',
    description: 'Despacho directo a domicilio en comunas de Santiago.',
    icon: MapPin,
  },
  {
    name: 'Garantía de Calidad',
    description: 'Productos certificados de nanotecnología probada.',
    icon: ShieldCheck,
  },
  {
    name: 'Pago Seguro',
    description: 'Transacciones protegidas y sin cobros ocultos.',
    icon: CreditCard,
  },
  {
    name: 'Contacto Directo',
    description: 'Hablamos contigo directamente para resolver tus dudas.',
    icon: MessageCircle,
  },
]

export default function Incentives() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
        {incentives.map((item) => (
        <div key={item.name} className="text-center">
            <div className="flex justify-center mb-4">
            <item.icon className="h-10 w-10 text-black" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
            <p className="mt-2 text-sm text-gray-500">{item.description}</p>
        </div>
        ))}
    </div>
    </div>
  )
}