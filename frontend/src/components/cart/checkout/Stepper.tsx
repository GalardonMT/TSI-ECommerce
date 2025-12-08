type Step = { id: number; label: string };

type Props = {
  current: number;
};

const STEPS: Step[] = [
  { id: 1, label: "Tus datos" },
  { id: 2, label: "Dirección" },
  { id: 3, label: "Reserva" },
];

export function Stepper({ current }: Props) {
  return (
    <div className="mb-6 flex items-center justify-between text-sm">
      {STEPS.map((step) => {
        const active = current === step.id;
        const done = current > step.id;
        return (
          <div key={step.id} className="flex-1 flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 ${
                active
                  ? "bg-black border-black text-white"
                  : done
                  ? "bg-white border-black text-black"
                  : "bg-white border-gray-300 text-gray-500"
              }`}
            >
              {step.id}
            </div>
            <span
              className={`mt-2 text-xs ${
                active ? "text-black font-semibold" : "text-gray-600"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
