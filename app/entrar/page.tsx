// app/entrar/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EnterPage() {
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || "Error de autenticación");
        setLoading(false);
        return;
      }
      router.replace("/");
    } catch {
      setError("Error de red");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <div className="text-center mb-6">
          <div className="text-xs uppercase tracking-widest text-gray-500">
            ALTOCONCEPTO Mayorista
          </div>
          <h1 className="text-xl font-semibold mt-1">Acceso protegido</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ingresa la contraseña para entrar
          </p>
        </div>

        <label className="block text-sm font-medium mb-2">Contraseña</label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full h-11 rounded-lg border border-gray-300 px-3 pr-11 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {show ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full h-11 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
