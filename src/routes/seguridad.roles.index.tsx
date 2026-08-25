import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Download,
  Plus,
  RotateCcw,
  Filter,
  Pencil,
  Copy,
  Shield,
  Trash2,
} from "lucide-react";
import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/seguridad/roles/")({
  head: () => ({
    meta: [
      { title: "Seguridad · Administración de roles" },
      { name: "description", content: "Listado y administración de roles del sistema MTC." },
    ],
  }),
  component: RolesListPage,
});

type Estado = "Activo" | "Inactivo";

type Rol = {
  code: string;
  name: string;
  subtitle: string;
  estado: Estado;
  usuarios: number;
  creadoPor: string;
  ultimaActualizacion: string;
};

const initialRoles: Rol[] = [
  { code: "ROL-ADM-SIS", name: "Administrador del sistema", subtitle: "Perfil de acceso del módulo", estado: "Activo", usuarios: 48, creadoPor: "Administrador", ultimaActualizacion: "15/06/2026" },
  { code: "ROL-ESP-TEC", name: "Especialista técnico", subtitle: "Perfil de acceso del módulo", estado: "Activo", usuarios: 12, creadoPor: "Administrador", ultimaActualizacion: "15/06/2026" },
  { code: "ROL-ESP-LEG", name: "Especialista legal", subtitle: "Perfil de acceso del módulo", estado: "Activo", usuarios: 9, creadoPor: "Administrador", ultimaActualizacion: "15/06/2026" },
  { code: "ROL-RESP-PRE", name: "Responsable predial", subtitle: "Perfil de acceso del módulo", estado: "Activo", usuarios: 16, creadoPor: "Administrador", ultimaActualizacion: "15/06/2026" },
  { code: "ROL-SUP", name: "Supervisor", subtitle: "Perfil de acceso del módulo", estado: "Activo", usuarios: 7, creadoPor: "Administrador", ultimaActualizacion: "15/06/2026" },
  { code: "ROL-CON-EXT", name: "Consultor externo", subtitle: "Perfil de acceso del módulo", estado: "Inactivo", usuarios: 3, creadoPor: "Supervisor", ultimaActualizacion: "03/06/2026" },
  { code: "ROL-BRI", name: "Brigadista", subtitle: "Perfil de acceso del módulo", estado: "Activo", usuarios: 11, creadoPor: "Administrador", ultimaActualizacion: "15/06/2026" },
  { code: "ROL-DIG", name: "Digitador", subtitle: "Perfil de acceso del módulo", estado: "Activo", usuarios: 5, creadoPor: "Administrador", ultimaActualizacion: "15/06/2026" },
  { code: "ROL-REV-LEG", name: "Revisor legal", subtitle: "Perfil de acceso del módulo", estado: "Inactivo", usuarios: 4, creadoPor: "Supervisor", ultimaActualizacion: "03/06/2026" },
  { code: "ROL-INV", name: "Invitado", subtitle: "Perfil de acceso del módulo", estado: "Inactivo", usuarios: 1, creadoPor: "Supervisor", ultimaActualizacion: "03/06/2026" },
  { code: "ROL-ANAL", name: "Analista de datos", subtitle: "Perfil de acceso del módulo", estado: "Activo", usuarios: 6, creadoPor: "Administrador", ultimaActualizacion: "15/06/2026" },
  { code: "ROL-COOR", name: "Coordinador de campo", subtitle: "Perfil de acceso del módulo", estado: "Activo", usuarios: 8, creadoPor: "Administrador", ultimaActualizacion: "15/06/2026" },
];

const creadores = ["Todos", "Administrador", "Supervisor"];
const estados = ["Todos los estados", "Activo", "Inactivo"];

function RolesListPage() {
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("Todos los estados");
  const [creadoPor, setCreadoPor] = useState("Todos");

  const filtered = useMemo(() => {
    return initialRoles.filter((r) => {
      if (q && !(`${r.code} ${r.name}`.toLowerCase().includes(q.toLowerCase()))) return false;
      if (estado !== "Todos los estados" && r.estado !== estado) return false;
      if (creadoPor !== "Todos" && r.creadoPor !== creadoPor) return false;
      return true;
    });
  }, [q, estado, creadoPor]);

  const clear = () => {
    setQ("");
    setEstado("Todos los estados");
    setCreadoPor("Todos");
  };

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937] text-sm">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="px-6 pt-5 pb-3">
          <div className="text-[11px] text-[#6b7280] tracking-wider">MODULO DE SEGURIDAD &gt; ROLES</div>
          <h1 className="text-2xl font-bold mt-1">Administración de roles</h1>
        </div>

        {/* Filtros */}
        <section className="mx-6 bg-white border border-[#e5e7eb] rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-semibold">Filtros</h2>
              <p className="text-[12px] text-[#6b7280]">Use filtros operativos para ubicar registros por código, nombre o estado.</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 border border-[#e5e7eb] rounded-md px-3 py-1.5 text-[12px] hover:bg-[#f9fafb] bg-white">
                <Download size={12} /> Exportar
              </button>
              <button className="flex items-center gap-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-md px-3 py-1.5 text-[12px]">
                <Plus size={12} /> Nuevo rol
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="BUSCAR ROL">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Código o nombre del rol" className="input" />
            </Field>
            <Field label="ESTADO">
              <select value={estado} onChange={(e) => setEstado(e.target.value)} className="input">
                {estados.map((e) => <option key={e}>{e}</option>)}
              </select>
            </Field>
            <Field label="CREADO POR">
              <select value={creadoPor} onChange={(e) => setCreadoPor(e.target.value)} className="input">
                {creadores.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={clear} className="flex items-center gap-1 border border-[#e5e7eb] rounded-md px-3 py-1.5 text-[12px] hover:bg-[#f9fafb]">
              <RotateCcw size={12} /> Limpiar
            </button>
            <button className="flex items-center gap-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-md px-3 py-1.5 text-[12px]">
              <Filter size={12} /> Aplicar filtros
            </button>
          </div>
        </section>

        {/* Listado */}
        <section className="mx-6 my-4 bg-white border border-[#e5e7eb] rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-semibold">Listado</h2>
              <p className="text-[12px] text-[#6b7280]">Administre los roles del módulo de seguridad y asigne permisos cuando corresponda.</p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-[11px] px-2 py-1 rounded-full bg-[#f3f4f6] text-[#374151]">{filtered.length} registros</span>
              <span className="text-[11px] px-2 py-1 rounded-full bg-[#fee2e2] text-[#b91c1c]">Roles</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-[#6b7280] border-b border-[#e5e7eb]">
                  <th className="py-2 px-2 font-medium">Código</th>
                  <th className="py-2 px-2 font-medium">Rol</th>
                  <th className="py-2 px-2 font-medium">Estado</th>
                  <th className="py-2 px-2 font-medium">Usuarios asignados</th>
                  <th className="py-2 px-2 font-medium">Creado por</th>
                  <th className="py-2 px-2 font-medium">Última actualización</th>
                  <th className="py-2 px-2 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.code} className="border-b border-[#f3f4f6] hover:bg-[#fafafa]">
                    <td className="py-3 px-2 font-semibold">{r.code}</td>
                    <td className="py-3 px-2">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-[#6b7280]">{r.subtitle}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] ${r.estado === "Activo" ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fef3c7] text-[#a16207]"}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="py-3 px-2">{r.usuarios}</td>
                    <td className="py-3 px-2">{r.creadoPor}</td>
                    <td className="py-3 px-2">{r.ultimaActualizacion}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-1">
                        <IconBtn icon={Pencil} label="Editar" />
                        <IconBtn icon={Copy} label="Clonar" />
                        <Link
                          to="/seguridad/roles/$roleId/permisos"
                          params={{ roleId: r.code }}
                          className="flex items-center gap-1 border border-[#fecaca] text-[#b91c1c] px-2 py-1 rounded-md text-[11px] hover:bg-[#eff6ff]"
                        >
                          <Shield size={11} /> Asignar permisos
                        </Link>
                        <button className="flex items-center gap-1 border border-[#fecaca] text-[#b91c1c] px-2 py-1 rounded-md text-[11px] hover:bg-[#fef2f2]">
                          <Trash2 size={11} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-[#6b7280]">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[#e5e7eb] mt-2">
            <div className="text-[12px] text-[#6b7280]">
              Mostrando 1 a {filtered.length} de {initialRoles.length} roles
            </div>
            <div className="flex gap-1">
              <button className="size-6 rounded bg-[#dc2626] text-white text-[11px]">1</button>
              <button className="size-6 rounded text-[#dc2626] hover:bg-[#fef2f2] text-[11px]">2</button>
            </div>
          </div>
        </section>

        <style>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:6px;padding:6px 10px;font-size:12px;background:white}.input:focus{outline:none;border-color:#dc2626}`}</style>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] font-semibold tracking-wider text-[#6b7280] mb-1">{label}</div>
      {children}
    </label>
  );
}

function IconBtn({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 border border-[#e5e7eb] text-[#374151] px-2 py-1 rounded-md text-[11px] hover:bg-[#f9fafb]">
      <Icon size={11} /> {label}
    </button>
  );
}
