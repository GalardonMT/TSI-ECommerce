"use client";

import { useState } from "react";

interface Props {
  initialEmail: string;
  onClose: () => void;
}

export function ResetPasswordModal({ initialEmail, onClose }: Props) {
  const [resetEmail, setResetEmail] = useState(initialEmail || "");
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const handleResetRequest = async () => {
    setResetError(null);
    setResetMessage(null);
    if (!resetEmail) {
      setResetError("Ingresa tu correo");
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: resetEmail }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setResetError(data?.detail || "No se pudo enviar el correo");
      } else {
        setResetMessage("Si el correo existe, te enviaremos un enlace para restablecer tu contraseña.");
      }
    } catch (e) {
      setResetError("No se pudo contactar al servidor");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-xl w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg text-black font-semibold">Restablecer contraseña</h2>
          <button onClick={onClose} aria-label="Cerrar" className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-gray-500">Correo</label>
          <input
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            type="email"
            className="w-full border-b border-gray-300 focus:border-[#151515] py-1 outline-none text-sm text-black"
            placeholder="Ingresa tu correo"
          />
        </div>
        {resetError && <div className="text-xs text-red-600">{resetError}</div>}
        {resetMessage && <div className="text-xs text-green-700">{resetMessage}</div>}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-black hover:text-gray-700 px-3 py-2 rounded border"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleResetRequest}
            disabled={resetLoading}
            className="text-sm px-3 py-2 rounded bg-black text-white disabled:opacity-60"
          >
            {resetLoading ? "Enviando..." : "Enviar enlace"}
          </button>
        </div>
        <p className="text-xs text-gray-500">Recibirás un enlace válido por 30 minutos.</p>
      </div>
    </div>
  );
}
