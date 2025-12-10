"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect, Suspense } from "react";

// 1. Componente con la lógica (No se exporta por defecto)
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token inválido");
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Token inválido");
      return;
    }
    if (!password || password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/auth/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.detail || "No se pudo restablecer la contraseña");
    } else {
      setMessage("Contraseña actualizada. Ahora puedes iniciar sesión.");
      setTimeout(() => router.push("/"), 2000);
    }
    setSubmitting(false);
  };

  return (
    <section className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 mx-auto my-12 p-6 bg-white shadow rounded">
      <h1 className="text-xl font-semibold mb-4">Restablecer contraseña</h1>
      {message && <div className="mb-3 text-green-700 text-sm bg-green-50 p-2 rounded">{message}</div>}
      {error && <div className="mb-3 text-red-700 text-sm bg-red-50 p-2 rounded">{error}</div>}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="********"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="********"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white text-sm font-semibold py-2 rounded hover:bg-zinc-800 disabled:opacity-60"
        >
          {submitting ? "Enviando..." : "Restablecer contraseña"}
        </button>
      </form>
    </section>
  );
}

// 2. Componente Principal (Este es el que se exporta)
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Cargando formulario...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}