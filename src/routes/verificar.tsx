import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mail } from "lucide-react";
import bg from "../assets/login-bg.png";

export const Route = createFileRoute("/verificar")({
  head: () => ({ meta: [{ title: "Verificación en dos pasos — MTC" }] }),
  component: VerificarPage,
});

function VerificarPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [attempts] = useState(3);
  const [loading, setLoading] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
    const t = setTimeout(() => setShowNotice(false), 4500);
    return () => clearTimeout(t);
  }, []);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = d;
    setCode(next);
    if (d && i < 5) inputs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/proyectos" }), 600);
  };

  const complete = code.every((c) => c !== "");

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {showNotice && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-[#a7f3d0] shadow-lg rounded-md px-4 py-3 flex items-start gap-3 max-w-sm">
          <div className="size-8 rounded-full bg-[#d1fae5] text-[#065f46] flex items-center justify-center shrink-0">
            <Mail size={16} />
          </div>
          <div className="text-[12px] text-[#374151]">
            <div className="font-semibold text-[#065f46]">Código enviado</div>
            Se envió un código de 6 dígitos a su correo electrónico.
          </div>
        </div>
      )}

      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-md shadow-xl pt-8 pb-6 px-8 border-t-4 border-[#dc2626]">
          <h1 className="text-center text-[20px] font-bold text-[#dc2626] tracking-wide leading-tight">
            PLATAFORMA DIGITAL DE<br />GESTIÓN DE PREDIOS
          </h1>
          <div className="mx-auto mt-3 h-[2px] w-16 bg-[#dc2626] rounded" />
          <div className="flex justify-center mt-3">
            <Link
              to="/"
              className="bg-white hover:bg-[#fef2f2] text-[#dc2626] border border-[#dc2626] text-[12px] font-medium px-5 py-1.5 rounded-md"
            >
              Volver
            </Link>
          </div>
          <div className="text-center mt-4 text-[12px] font-semibold text-[#6b7280] tracking-wider uppercase">
            VERIFICACIÓN EN DOS PASOS
          </div>
          <p className="text-center text-[12px] text-[#374151] mt-3">
            Ingrese el código de <span className="font-bold">6 dígitos</span> que enviamos a su correo electrónico.
          </p>
          <p className="text-center text-[11px] text-[#9ca3af] mt-2">Intentos restantes: {attempts} de 3.</p>

          <form onSubmit={submit} className="mt-4">
            <div className="flex justify-center gap-2">
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el; }}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onKey(i, e)}
                  inputMode="numeric"
                  maxLength={1}
                  className="size-10 text-center text-[16px] font-semibold border border-[#dc2626] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#dc2626]/30"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={!complete || loading}
              className="w-full bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold tracking-wider text-[13px] py-2.5 rounded-md mt-5"
            >
              {loading ? "VERIFICANDO..." : "VERIFICAR CÓDIGO"}
            </button>
          </form>

          <div className="border-t border-[#e5e7eb] my-4" />

          <button
            type="button"
            className="w-full bg-white hover:bg-[#fef2f2] text-[#dc2626] border border-[#dc2626] font-semibold tracking-wider text-[13px] py-2.5 rounded-md"
          >
            SOLICITAR ACCESO AL SISTEMA
          </button>
        </div>
      </div>
    </div>
  );
}