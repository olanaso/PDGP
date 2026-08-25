import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import bg from "../assets/login-bg.png";

export const Route = createFileRoute("/recuperar")({
  head: () => ({
    meta: [
      { title: "Recuperar contraseña — MTC" },
      { name: "description", content: "Recupera tu contraseña del sistema de Gestión Predial del MTC." },
    ],
  }),
  component: RecuperarPage,
});

function RecuperarPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Ingrese un correo válido");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 900);
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-md shadow-xl pt-8 pb-6 px-8 border-t-4 border-[#dc2626]">
          <h1 className="text-center text-[18px] font-bold text-[#dc2626] tracking-wide leading-tight">
            RECUPERAR CONTRASEÑA
          </h1>
          <div className="mx-auto mt-3 h-[2px] w-16 bg-[#dc2626] rounded" />
          <p className="text-center mt-4 text-[12px] text-[#6b7280]">
            {sent
              ? "Revisa tu bandeja de entrada."
              : "Te enviaremos tu contraseña al correo registrado."}
          </p>

          {sent ? (
            <div className="mt-5">
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-md p-3">
                <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
                <div className="text-[13px] text-[#065f46]">
                  Se ha enviado la contraseña al correo <strong>{email}</strong>. Si no lo
                  encuentras, revisa la carpeta de spam.
                </div>
              </div>
              <button
                onClick={() => navigate({ to: "/" })}
                className="w-full mt-4 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold tracking-wider text-[13px] py-2.5 rounded-md"
              >
                VOLVER AL INICIO DE SESIÓN
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-3">
              <label className="block text-[12px] text-[#374151]">Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@mtc.gob.pe"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#e5e7eb] rounded-md text-[13px] bg-[#fafafa] focus:outline-none focus:border-[#dc2626]"
                  required
                  autoFocus
                />
              </div>
              {error && <div className="text-[12px] text-red-600">{error}</div>}
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold tracking-wider text-[13px] py-2.5 rounded-md mt-2 disabled:opacity-70"
              >
                {sending ? "ENVIANDO..." : "ENVIAR CONTRASEÑA"}
              </button>
              <Link
                to="/"
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#fef2f2] text-[#dc2626] border border-[#dc2626] font-semibold tracking-wider text-[13px] py-2.5 rounded-md"
              >
                <ArrowLeft size={14} /> VOLVER
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
