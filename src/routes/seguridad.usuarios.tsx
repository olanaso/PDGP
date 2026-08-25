import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Download,
  Plus,
  RotateCcw,
  Filter,
  Eye,
  Pencil,
  Shield,
  KeyRound,
  Trash2,
  X,
} from "lucide-react";
import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/seguridad/usuarios")({
  head: () => ({
    meta: [
      { title: "Seguridad · Usuarios" },
      { name: "description", content: "Administración de usuarios del sistema MTC." },
    ],
  }),
  component: UsuariosPage,
});

type Estado = "Activo" | "Inactivo";
type Usuario = {
  id: string;
  nombre: string;
  email: string;
  doc: string;
  cargo: string;
  roles: string[];
  estado: Estado;
  ultimo: string;
};

const initialUsers: Usuario[] = [
  { id: "USR-001", nombre: "Juan Carlos Perez Garcia", email: "juan.perez@proyecto.com", doc: "DNI 42145678", cargo: "Especialista Técnico Predial", roles: ["Especialista Técnico", "Responsable Predial"], estado: "Activo", ultimo: "Hoy, 08:42 a. m." },
  { id: "USR-002", nombre: "Maria Elena Lopez Ruiz", email: "maria.lopez@proyecto.com", doc: "DNI 40651234", cargo: "Especialista Legal", roles: ["Especialista Legal"], estado: "Activo", ultimo: "Ayer, 06:15 p. m." },
  { id: "USR-003", nombre: "Carlos Ramos Delgado", email: "carlos.ramos@proyecto.com", doc: "DNI 43895621", cargo: "Supervisor de campo", roles: ["Supervisor", "Brigadista"], estado: "Activo", ultimo: "Hoy, 07:58 a. m." },
  { id: "USR-004", nombre: "Rosa Vilchez Torres", email: "rosa.vilchez@proyecto.com", doc: "DNI 29561478", cargo: "Consultora externa", roles: ["Consultor"], estado: "Inactivo", ultimo: "12/06/2026" },
  { id: "USR-005", nombre: "Luis Alberto Nuñez", email: "luis.nunez@proyecto.com", doc: "CE 00875612", cargo: "Digitador", roles: ["Digitador"], estado: "Activo", ultimo: "Hoy, 09:05 a. m." },
  { id: "USR-006", nombre: "Patricia Gomez Salas", email: "patricia.gomez@proyecto.com", doc: "DNI 41778542", cargo: "Responsable predial", roles: ["Responsable Predial"], estado: "Activo", ultimo: "Hoy, 08:17 a. m." },
];

const rolesCatalog = [
  "Especialista Técnico",
  "Especialista Legal",
  "Responsable Predial",
  "Supervisor",
  "Brigadista",
  "Consultor",
  "Digitador",
  "Revisor Legal",
  "Invitado",
];

function UsuariosPage() {
  const [users, setUsers] = useState<Usuario[]>(initialUsers);
  const [q, setQ] = useState("");
  const [doc, setDoc] = useState("");
  const [rol, setRol] = useState("");
  const [estado, setEstado] = useState<"" | Estado>("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        if (q && !(`${u.nombre} ${u.email} ${u.id}`.toLowerCase().includes(q.toLowerCase()))) return false;
        if (doc && !u.doc.toLowerCase().includes(doc.toLowerCase())) return false;
        if (rol && !u.roles.includes(rol)) return false;
        if (estado && u.estado !== estado) return false;
        return true;
      }),
    [users, q, doc, rol, estado],
  );

  const clear = () => {
    setQ("");
    setDoc("");
    setRol("");
    setEstado("");
  };

  const deleteUser = (id: string) => {
    if (confirm("¿Eliminar usuario?")) setUsers((u) => u.filter((x) => x.id !== id));
  };

  const resetAccess = (id: string) => {
    alert(`Acceso reseteado para ${id}. Se enviará correo de nueva contraseña.`);
  };

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937] text-sm">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="px-8 pt-6 pb-4">
          <div className="text-[11px] text-[#6b7280] tracking-wider">
            MODULO DE SEGURIDAD &gt; USUARIOS
          </div>
          <h1 className="text-2xl font-bold mt-1">Administración de usuarios</h1>
        </div>

        {/* Filtros */}
        <section className="mx-8 bg-white border border-[#e5e7eb] rounded-lg p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold">Filtros</h2>
              <p className="text-[12px] text-[#6b7280]">
                Filtre usuarios por número, nombre, rol, estado o documento desde este panel operativo.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 border border-[#e5e7eb] rounded-md px-3 py-1.5 text-[12px] hover:bg-[#f9fafb]">
                <Download size={14} /> Exportar
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-md px-3 py-1.5 text-[12px]"
              >
                <Plus size={14} /> Crear usuario
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Field label="BUSCAR USUARIO">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nro, nombre o correo" className="input" />
            </Field>
            <Field label="DOCUMENTO">
              <input value={doc} onChange={(e) => setDoc(e.target.value)} placeholder="DNI o CE" className="input" />
            </Field>
            <Field label="ROL">
              <select value={rol} onChange={(e) => setRol(e.target.value)} className="input">
                <option value="">Todos los roles</option>
                {rolesCatalog.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="ESTADO">
              <select value={estado} onChange={(e) => setEstado(e.target.value as Estado | "")} className="input">
                <option value="">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={clear} className="flex items-center gap-1 border border-[#e5e7eb] rounded-md px-4 py-1.5 text-[12px] hover:bg-[#f9fafb]">
              <RotateCcw size={12} /> Limpiar
            </button>
            <button className="flex items-center gap-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-md px-4 py-1.5 text-[12px]">
              <Filter size={12} /> Aplicar filtros
            </button>
          </div>
        </section>

        {/* Listado */}
        <section className="mx-8 my-6 bg-white border border-[#e5e7eb] rounded-lg p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold">Listado</h2>
              <p className="text-[12px] text-[#6b7280]">
                Vista operativa para control de altas, cambios y seguimiento del acceso.
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-[11px] px-2 py-1 rounded-full bg-[#f3f4f6] text-[#374151]">{filtered.length} usuarios</span>
              <span className="text-[11px] px-2 py-1 rounded-full bg-[#fee2e2] text-[#b91c1c]">Usuarios</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-[#6b7280] border-b border-[#e5e7eb]">
                  <th className="py-2 px-2">Nro</th>
                  <th className="py-2 px-2">Usuario</th>
                  <th className="py-2 px-2">Documento</th>
                  <th className="py-2 px-2">Cargo</th>
                  <th className="py-2 px-2">Roles</th>
                  <th className="py-2 px-2">Estado</th>
                  <th className="py-2 px-2">Último acceso</th>
                  <th className="py-2 px-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-[#f3f4f6] hover:bg-[#fafafa]">
                    <td className="py-3 px-2 font-semibold">{u.id}</td>
                    <td className="py-3 px-2">
                      <div className="font-medium">{u.nombre}</div>
                      <div className="text-[#6b7280]">{u.email}</div>
                    </td>
                    <td className="py-3 px-2">{u.doc}</td>
                    <td className="py-3 px-2">{u.cargo}</td>
                    <td className="py-3 px-2">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span key={r} className="px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#b91c1c] text-[11px]">{r}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] ${u.estado === "Activo" ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fef3c7] text-[#a16207]"}`}>
                        {u.estado}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-[#374151]">{u.ultimo}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-1">
                        <IconBtn icon={Eye} label="Ver" onClick={() => alert(`Ver ${u.id}`)} />
                        <IconBtn icon={Pencil} label="Editar" onClick={() => setEditing(u)} />
                        <Link to="/seguridad/roles" className="flex items-center gap-1 border border-[#fecaca] text-[#b91c1c] px-2 py-1 rounded-md text-[11px] hover:bg-[#eff6ff]">
                          <Shield size={11} /> Roles
                        </Link>
                        <IconBtn icon={KeyRound} label="Reset acceso" onClick={() => resetAccess(u.id)} />
                        <button onClick={() => deleteUser(u.id)} className="flex items-center gap-1 border border-[#fecaca] text-[#b91c1c] px-2 py-1 rounded-md text-[11px] hover:bg-[#fef2f2]">
                          <Trash2 size={11} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-[#6b7280]">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-[12px] text-[#6b7280]">
              Mostrando 1 a {filtered.length} de {users.length} usuarios
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map((p) => (
                <button key={p} className={`size-7 rounded text-[12px] ${p === 1 ? "bg-[#dc2626] text-white" : "text-[#dc2626] hover:bg-[#fef2f2]"}`}>{p}</button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {(showCreate || editing) && (
        <UserModal
          user={editing}
          onClose={() => { setShowCreate(false); setEditing(null); }}
          onSave={(u) => {
            if (editing) {
              setUsers((list) => list.map((x) => (x.id === editing.id ? u : x)));
            } else {
              setUsers((list) => [...list, { ...u, id: `USR-${String(list.length + 1).padStart(3, "0")}` }]);
            }
            setShowCreate(false);
            setEditing(null);
          }}
        />
      )}

      <style>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:6px;padding:6px 10px;font-size:12px;background:white}.input:focus{outline:none;border-color:#dc2626}`}</style>
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

function UserModal({ user, onClose, onSave }: { user: Usuario | null; onClose: () => void; onSave: (u: Usuario) => void }) {
  const [form, setForm] = useState<Usuario>(
    user ?? { id: "", nombre: "", email: "", doc: "", cargo: "", roles: [], estado: "Activo", ultimo: "—" },
  );
  const toggleRole = (r: string) =>
    setForm((f) => ({ ...f, roles: f.roles.includes(r) ? f.roles.filter((x) => x !== r) : [...f.roles, r] }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e5e7eb]">
          <h3 className="font-semibold">{user ? "Editar usuario" : "Crear usuario"}</h3>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#111]"><X size={18} /></button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <Field label="NOMBRE COMPLETO">
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input" />
          </Field>
          <Field label="CORREO">
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          </Field>
          <Field label="DOCUMENTO">
            <input value={form.doc} onChange={(e) => setForm({ ...form, doc: e.target.value })} placeholder="DNI 12345678" className="input" />
          </Field>
          <Field label="CARGO">
            <input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} className="input" />
          </Field>
          <Field label="ESTADO">
            <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as Estado })} className="input">
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
          </Field>
          <div className="col-span-2">
            <div className="text-[10px] font-semibold tracking-wider text-[#6b7280] mb-2">ROLES</div>
            <div className="flex flex-wrap gap-2">
              {rolesCatalog.map((r) => (
                <button
                  key={r}
                  onClick={() => toggleRole(r)}
                  className={`px-2 py-1 rounded-full text-[11px] border ${form.roles.includes(r) ? "bg-[#fee2e2] border-[#fecaca] text-[#b91c1c]" : "bg-white border-[#e5e7eb] text-[#374151]"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-[#e5e7eb] flex justify-end gap-2">
          <button onClick={onClose} className="border border-[#e5e7eb] px-4 py-1.5 rounded-md text-[12px] hover:bg-[#f9fafb]">Cancelar</button>
          <button
            onClick={() => {
              if (!form.nombre || !form.email) { alert("Complete nombre y correo"); return; }
              onSave(form);
            }}
            className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-4 py-1.5 rounded-md text-[12px]"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}