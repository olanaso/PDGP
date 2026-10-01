import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import bg from "../assets/login-bg.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — MTC" },
      {
        name: "description",
        content:
          "Acceso al sistema de Gestión Predial del Ministerio de Transportes y Comunicaciones.",
      },
    ],
  }),
  component: LoginPage,
});

// ponytail: credenciales fijas del prototipo; reemplazar por autenticación real.
const DEFAULT_USER = "bim";
const DEFAULT_PASS = "";

function LoginPage () {
  const navigate = useNavigate();
  const [user, setUser] = useState(DEFAULT_USER);
  const [pass, setPass] = useState(DEFAULT_PASS);
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.trim().toLowerCase() !== DEFAULT_USER || pass !== DEFAULT_PASS) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }
    setError("");
    try {
      localStorage.setItem("mtc-session", user.trim());
    } catch {
      // Sin almacenamiento disponible el ingreso continúa igual.
    }
    setLoading(true);
    setTimeout(() => navigate({ to: "/verificar" }), 600);
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-md shadow-xl pt-8 pb-6 px-8 border-t-4 border-[#dc2626]">
          <h1 className="text-center text-[20px] font-bold text-[#dc2626] tracking-wide leading-tight">
            PLATAFORMA DIGITAL DE
            <br />
            GESTIÓN DE PREDIOS
          </h1>
          <div className="mx-auto mt-3 h-[2px] w-16 bg-[#dc2626] rounded" />
          <div className="text-center mt-4 text-[12px] font-semibold text-[#6b7280] tracking-wider uppercase">
            INICIAR SESIÓN
          </div>

          <form onSubmit={submit} className="mt-5 space-y-3">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Usuario o correo"
                className="w-full pl-9 pr-3 py-2.5 border border-[#e5e7eb] rounded-md text-[13px] bg-[#fafafa] focus:outline-none focus:border-[#dc2626]"
                required
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type={show ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Password"
                className="w-full pl-9 pr-9 py-2.5 border border-[#e5e7eb] rounded-md text-[13px] bg-[#fafafa] focus:outline-none focus:border-[#dc2626]"
                required
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151]"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-md bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]"
              >
                {error}
              </p>
            )}

            <div className="flex items-center justify-between text-[12px]">
              <label className="flex items-center gap-2 text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-3.5 accent-[#dc2626]"
                />
                Recordar datos
              </label>
              <Link to="/recuperar" className="text-[#dc2626] hover:underline">
                Olvidé mi contraseña
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold tracking-wider text-[13px] py-2.5 rounded-md mt-2 disabled:opacity-70"
            >
              {loading ? "INGRESANDO..." : "INGRESAR"}
            </button>
            <button
              type="button"
              className="w-full bg-white hover:bg-[#fef2f2] text-[#dc2626] border border-[#dc2626] font-semibold tracking-wider text-[13px] py-2.5 rounded-md"
            >
              SOLICITAR ACCESO AL SISTEMA
            </button>
            <Link
              to="/seguimiento-sujeto-pasivo"
              className="block w-full text-center text-[12px] font-semibold text-[#dc2626] hover:underline"
            >
              Consulta de predios para el sujeto pasivo
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
