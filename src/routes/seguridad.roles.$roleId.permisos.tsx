import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Save, RotateCcw, Filter } from "lucide-react";
import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/seguridad/roles/$roleId/permisos")({
  head: () => ({
    meta: [
      { title: "Seguridad · Permisos del rol" },
      { name: "description", content: "Asignación de permisos por rol del sistema MTC." },
    ],
  }),
  component: PermisosRolPage,
});

type Rol = { code: string; name: string; activo: boolean; usuarios: number };

const roles: Rol[] = [
  { code: "ROL-ADM-SIS", name: "Administrador del sistema", activo: true, usuarios: 48 },
  { code: "ROL-ESP-TEC", name: "Especialista técnico", activo: true, usuarios: 12 },
  { code: "ROL-ESP-LEG", name: "Especialista legal", activo: true, usuarios: 8 },
  { code: "ROL-RESP-PRE", name: "Responsable predial", activo: true, usuarios: 6 },
  { code: "ROL-SUP", name: "Supervisor", activo: true, usuarios: 5 },
  { code: "ROL-CON-EXT", name: "Consultor externo", activo: false, usuarios: 3 },
  { code: "ROL-BRI", name: "Brigadista", activo: true, usuarios: 9 },
  { code: "ROL-DIG", name: "Digitador", activo: true, usuarios: 4 },
  { code: "ROL-REV-LEG", name: "Revisor legal", activo: false, usuarios: 2 },
  { code: "ROL-INV", name: "Invitado", activo: false, usuarios: 1 },
];

const modules: { name: string; views: string[] }[] = [
  { name: "PROYECTOS", views: ["Lista de proyectos", "Detalle de proyecto"] },
  { name: "PREDIOS", views: ["Padrón de afectados", "Verificación en campo", "Base gráfica", "Información registral", "Información catastral"] },
  { name: "EXPEDIENTES", views: ["Lista de expedientes", "Detalle de expediente", "Documentos de expediente"] },
  { name: "SEGURIDAD Y ACCESOS", views: ["Usuarios", "Roles", "Permisos", "Bitácora de accesos"] },
];

const permCols = ["Lectura", "Edición", "Eliminación", "Impresión", "Supervisión", "Todos"] as const;
type Perm = (typeof permCols)[number];

type Matrix = Record<string, Record<string, Record<Perm, boolean>>>;

function buildInitial(): Matrix {
  const m: Matrix = {};
  for (const mod of modules) {
    m[mod.name] = {};
    for (const v of mod.views) {
      m[mod.name][v] = Object.fromEntries(permCols.map((p) => [p, true])) as Record<Perm, boolean>;
    }
  }
  return m;
}

function PermisosRolPage() {
  const { roleId } = Route.useParams();
  const rol = useMemo(() => roles.find((r) => r.code === roleId) ?? roles[0], [roleId]);

  const [matrices, setMatrices] = useState<Record<string, Matrix>>(
    Object.fromEntries(roles.map((r) => [r.code, buildInitial()])),
  );
  const [aplicarTodos, setAplicarTodos] = useState(false);

  const matrix = matrices[rol.code];

  const setCell = (mod: string, view: string, perm: Perm, val: boolean) => {
    setMatrices((m) => {
      const next = structuredClone(m);
      const targets = aplicarTodos ? roles.map((r) => r.code) : [rol.code];
      for (const code of targets) {
        if (perm === "Todos") {
          for (const p of permCols) next[code][mod][view][p] = val;
        } else {
          next[code][mod][view][perm] = val;
          next[code][mod][view]["Todos"] = permCols.slice(0, -1).every((p) => next[code][mod][view][p]);
        }
      }
      return next;
    });
  };

  const selectAll = (val: boolean) => {
    setMatrices((m) => {
      const next = structuredClone(m);
      for (const mod of modules) for (const v of mod.views) for (const p of permCols) next[rol.code][mod.name][v][p] = val;
      return next;
    });
  };

  const resetMatrix = () => {
    setMatrices((m) => ({ ...m, [rol.code]: buildInitial() }));
  };

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937] text-sm">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#6b7280] tracking-wider">MODULO DE SEGURIDAD &gt; ROLES Y PERMISOS</div>
            <h1 className="text-2xl font-bold mt-1">Roles y permisos</h1>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-[12px]">
              <input type="checkbox" checked={aplicarTodos} onChange={(e) => setAplicarTodos(e.target.checked)} className="accent-[#dc2626]" />
              Aplicar a todos
            </label>
            <button className="flex items-center gap-1 border border-[#e5e7eb] rounded-md px-3 py-1.5 text-[12px] hover:bg-[#f9fafb] bg-white">
              <Download size={12} /> Exportar
            </button>
            <button onClick={() => alert("Cambios guardados")} className="flex items-center gap-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-md px-3 py-1.5 text-[12px]">
              <Save size={12} /> Guardar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <section className="mx-6 bg-white border border-[#e5e7eb] rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-semibold">Filtros</h2>
              <p className="text-[12px] text-[#6b7280]">Seleccione el módulo, alcance y criterio de revisión antes de aplicar cambios sobre la matriz.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={resetMatrix} className="flex items-center gap-1 border border-[#e5e7eb] rounded-md px-3 py-1.5 text-[12px] hover:bg-[#f9fafb]">
                <RotateCcw size={12} /> Limpiar
              </button>
              <button className="flex items-center gap-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-md px-3 py-1.5 text-[12px]">
                <Filter size={12} /> Aplicar filtros
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="BUSCAR MODULO">
              <input placeholder="Módulo o vista" className="input" />
            </Field>
            <Field label="ALCANCE">
              <select className="input"><option>Todos los módulos</option>{modules.map((m) => <option key={m.name}>{m.name}</option>)}</select>
            </Field>
            <Field label="ESTADO">
              <select className="input"><option>Todos</option><option>Otorgado</option><option>Sin permiso</option></select>
            </Field>
          </div>
        </section>

        <section className="mx-6 my-4 grid grid-cols-[280px_1fr] gap-4">
          {/* Roles list */}
          <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
            <h3 className="font-semibold mb-1">Roles registrados</h3>
            <p className="text-[11px] text-[#6b7280] mb-3">Seleccione un rol para asignar permisos.</p>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {roles.map((r) => (
                <Link
                  key={r.code}
                  to="/seguridad/roles/$roleId/permisos"
                  params={{ roleId: r.code }}
                  className={`w-full text-left p-2.5 rounded-md border block ${r.code === rol.code ? "border-[#dc2626] bg-[#fef2f2]" : "border-[#e5e7eb] hover:bg-[#f9fafb]"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[12px]">{r.name}</div>
                      <div className="text-[11px] text-[#6b7280]">{r.code}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${r.activo ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fef3c7] text-[#a16207]"}`}>
                      {r.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 text-[11px] text-[#6b7280]">
              <span>Mostrando 1 a {roles.length} de {roles.length} roles</span>
              <div className="flex gap-1">
                <button className="size-6 rounded bg-[#dc2626] text-white">1</button>
                <button className="size-6 rounded text-[#dc2626] hover:bg-[#fef2f2]">2</button>
              </div>
            </div>
          </div>

          {/* Matrix */}
          <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold">Permisos del rol: {rol.name}</h3>
                <p className="text-[11px] text-[#6b7280]">Código {rol.code} · {rol.usuarios} usuarios asignados.</p>
              </div>
              <label className="flex items-center gap-1 text-[12px]">
                <input
                  type="checkbox"
                  checked={modules.every((m) => m.views.every((v) => permCols.every((p) => matrix[m.name][v][p])))}
                  onChange={(e) => selectAll(e.target.checked)}
                  className="accent-[#dc2626]"
                />
                Seleccionar todos los permisos
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-[#6b7280] border-b border-[#e5e7eb]">
                    <th className="py-2 px-2 font-medium">Vista / Función</th>
                    {permCols.map((p) => (
                      <th key={p} className="py-2 px-2 font-medium text-center">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map((mod) => (
                    <FragmentSection key={mod.name} title={`MODULO: ${mod.name}`}>
                      {mod.views.map((v) => (
                        <tr key={v} className="border-b border-[#f3f4f6]">
                          <td className="py-2 px-2">{v}</td>
                          {permCols.map((p) => (
                            <td key={p} className="py-2 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={matrix[mod.name][v][p]}
                                onChange={(e) => setCell(mod.name, v, p, e.target.checked)}
                                className="accent-[#b91c1c]"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </FragmentSection>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb] mt-3">
              <div className="flex gap-4 text-[12px]">
                <span className="flex items-center gap-1"><input type="checkbox" checked readOnly className="accent-[#b91c1c]" /> Permiso otorgado</span>
                <span className="flex items-center gap-1"><input type="checkbox" readOnly className="accent-[#b91c1c]" /> Sin permiso</span>
              </div>
              <div className="flex gap-2">
                <button onClick={resetMatrix} className="flex items-center gap-1 border border-[#e5e7eb] rounded-md px-3 py-1.5 text-[12px] hover:bg-[#f9fafb]">
                  <RotateCcw size={12} /> Restablecer permisos
                </button>
                <button onClick={() => alert(`Guardado para ${rol.name}`)} className="flex items-center gap-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-md px-3 py-1.5 text-[12px]">
                  <Save size={12} /> Guardar cambios
                </button>
              </div>
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

function FragmentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <tr className="bg-[#f9fafb]"><td colSpan={7} className="py-2 px-2 font-semibold text-[#dc2626] text-[11px]">{title}</td></tr>
      {children}
    </>
  );
}
