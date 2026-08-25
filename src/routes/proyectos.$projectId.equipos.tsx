import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ProjectPageHeader } from "../components/ProjectPageHeader";
import {
  initialProjectBrigades as INITIAL,
  readProjectBrigades,
  rolesBrigada as ROLES,
  tiposUsuario as TIPOS,
  usuariosEquipo as USUARIOS,
  writeProjectBrigades,
  type BrigadaProyecto as Brigada,
  type IntegranteBrigada as Integrante,
  type TipoUsuario,
} from "../lib/projectTeamsData";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Users,
  ShieldCheck,
  ClipboardList,
  UserCog,
  Search,
  X,
  ChevronDown,
  History,
  Save,
  StickyNote,
  MoreVertical,
} from "lucide-react";

export const Route = createFileRoute("/proyectos/$projectId/equipos")({
  head: () => ({
    meta: [
      { title: "Equipos de Trabajo — MTC Prototipos" },
      {
        name: "description",
        content: "Configuración operativa: equipos, responsables y permisos.",
      },
    ],
  }),
  component: EquiposPage,
});

function tipoColor(t: TipoUsuario) {
  switch (t) {
    case "Técnico":
      return "bg-[#fee2e2] text-[#b91c1c]";
    case "Legal":
      return "bg-[#fef3c7] text-[#92400e]";
    case "Administrativo":
      return "bg-[#dcfce7] text-[#166534]";
    case "Otro":
      return "bg-[#f3e8ff] text-[#6b21a8]";
  }
}

function rolColor(r: Integrante["rol"]) {
  switch (r) {
    case "Coordinador":
      return "bg-[#dcfce7] text-[#166534]";
    case "Responsable Técnico":
      return "bg-[#fee2e2] text-[#b91c1c]";
    case "Responsable Legal":
      return "bg-[#fde68a] text-[#92400e]";
    case "Especialista Predial":
      return "bg-[#e0e7ff] text-[#dc2626]";
    case "Miembro":
      return "bg-[#f3f4f6] text-[#374151]";
  }
}

function estadoColor(e: Brigada["estado"]) {
  switch (e) {
    case "Activa":
      return "bg-[#dcfce7] text-[#166534]";
    case "En formación":
      return "bg-[#fee2e2] text-[#b91c1c]";
    case "Programada":
      return "bg-[#fef3c7] text-[#92400e]";
  }
}

function EquiposPage() {
  const { projectId } = useParams({ from: "/proyectos/$projectId/equipos" });
  const [brigadas, setBrigadas] = useState<Brigada[]>(INITIAL);
  const [selectedId, setSelectedId] = useState<string>(INITIAL[0].id);
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const storedBrigades = readProjectBrigades(projectId);
    setBrigadas(storedBrigades);
    setSelectedId(storedBrigades[0]?.id ?? "");
    setLoadedProjectId(projectId);
  }, [projectId]);

  useEffect(() => {
    if (loadedProjectId === projectId) writeProjectBrigades(projectId, brigadas);
  }, [brigadas, loadedProjectId, projectId]);

  const selected = brigadas.find((b) => b.id === selectedId) ?? brigadas[0];

  const resumen = useMemo(
    () => ({
      registradas: brigadas.length,
      activas: brigadas.filter((b) => b.estado === "Activa").length,
      usuarios: new Set(brigadas.flatMap((b) => b.integrantes.map((i) => i.usuarioId))).size,
      roles: ROLES.length,
    }),
    [brigadas],
  );

  function addBrigada(b: Omit<Brigada, "id">) {
    const id = "b" + Date.now();
    const integrantes = b.integrantes.find((i) => i.usuarioId === b.coordinadorId)
      ? b.integrantes
      : [{ usuarioId: b.coordinadorId, rol: "Coordinador" as const }, ...b.integrantes];
    setBrigadas((arr) => [...arr, { ...b, id, integrantes }]);
  }

  function updateBrigada(id: string, b: Omit<Brigada, "id">) {
    const integrantes = b.integrantes.find((i) => i.usuarioId === b.coordinadorId)
      ? b.integrantes
      : [{ usuarioId: b.coordinadorId, rol: "Coordinador" as const }, ...b.integrantes];
    setBrigadas((arr) => arr.map((x) => (x.id === id ? { ...b, id, integrantes } : x)));
  }

  function removeBrigada(id: string) {
    setBrigadas((arr) => arr.filter((b) => b.id !== id));
    if (selectedId === id && brigadas.length > 1) setSelectedId(brigadas[0].id);
  }

  function addMember(brigadaId: string, integrante: Integrante) {
    setBrigadas((arr) =>
      arr.map((b) =>
        b.id === brigadaId
          ? {
              ...b,
              integrantes: b.integrantes.find((i) => i.usuarioId === integrante.usuarioId)
                ? b.integrantes
                : [...b.integrantes, integrante],
            }
          : b,
      ),
    );
  }

  function removeMember(brigadaId: string, usuarioId: string) {
    setBrigadas((arr) =>
      arr.map((b) =>
        b.id === brigadaId
          ? { ...b, integrantes: b.integrantes.filter((i) => i.usuarioId !== usuarioId) }
          : b,
      ),
    );
  }

  function getUsuario(id: string) {
    return USUARIOS.find((u) => u.id === id);
  }

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937] text-sm">
      <main className="flex-1 flex flex-col overflow-hidden">
        <ProjectPageHeader
          projectId={projectId}
          title="Equipos de Trabajo"
          badgeLabel="PROYECTO"
          badgeValue={projectId}
          badgeSuffix="EQUIPOS"
        />

        <div className="flex-1 overflow-auto px-6 py-4 grid grid-cols-[1fr_300px] gap-4">
          {/* LEFT */}
          <div className="space-y-4">
            {/* Brigadas table */}
            <section className="bg-white border border-[#e5e7eb] rounded-lg">
              <div className="px-5 pt-4 pb-3 flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-[15px]">Equipos del Proyecto</h2>
                  <p className="text-[12px] text-[#6b7280]">
                    Registre y gestione los equipos que intervendrán en la gestión del proyecto.
                  </p>
                </div>
                <button
                  onClick={() => setShowNew(true)}
                  className="flex items-center gap-1.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white text-[12px] font-medium px-3 py-2 rounded-md"
                >
                  <Plus size={14} /> Nuevo Equipo
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead className="text-[#6b7280] border-y border-[#e5e7eb] bg-[#f9fafb]">
                    <tr>
                      {[
                        "Código",
                        "Nombre del Equipo",
                        "Zona / Tramo",
                        "Coordinador",
                        "N° de Integrantes",
                        "Vigencia",
                        "Estado",
                        "Acciones",
                      ].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {brigadas.map((b) => {
                      const coord = getUsuario(b.coordinadorId);
                      return (
                        <tr
                          key={b.id}
                          onClick={() => setSelectedId(b.id)}
                          className={`border-b border-[#f3f4f6] cursor-pointer ${selectedId === b.id ? "bg-[#fef2f2]" : "hover:bg-[#f9fafb]"}`}
                        >
                          <td className="px-3 py-2.5 font-mono text-[#dc2626]">{b.codigo}</td>
                          <td className="px-3 py-2.5 font-medium">{b.nombre}</td>
                          <td className="px-3 py-2.5 text-[#374151]">{b.zona}</td>
                          <td className="px-3 py-2.5">{coord?.nombre}</td>
                          <td className="px-3 py-2.5">{b.integrantes.length}</td>
                          <td className="px-3 py-2.5 text-[#374151]">
                            {b.vigenciaIni} - {b.vigenciaFin}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${estadoColor(b.estado)}`}
                            >
                              {b.estado}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2 text-[#6b7280]">
                              <button
                                className="hover:text-[#dc2626]"
                                title="Editar"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditId(b.id);
                                }}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                className="hover:text-[#dc2626]"
                                title="Integrantes"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedId(b.id);
                                }}
                              >
                                <Users size={14} />
                              </button>
                              <button className="hover:text-[#dc2626]" title="Ver">
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeBrigada(b.id);
                                }}
                                className="hover:text-[#b91c1c]"
                                title="Eliminar"
                              >
                                <Trash2 size={14} />
                              </button>
                              <MoreVertical size={14} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-2 text-[11px] text-[#6b7280] border-t border-[#e5e7eb]">
                Mostrando 1 a {brigadas.length} de {brigadas.length} equipos
              </div>
            </section>

            {/* Composition */}
            <section className="bg-white border border-[#e5e7eb] rounded-lg p-5">
              <h3 className="font-semibold text-[14px] mb-3">
                Composición del Equipo Seleccionado
              </h3>
              <div className="relative inline-block mb-4">
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 border border-[#e5e7eb] rounded-md text-[13px] min-w-[260px] focus:outline-none focus:border-[#dc2626]"
                >
                  {brigadas.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nombre} ({b.codigo})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none"
                />
              </div>

              {selected && (
                <div className="grid grid-cols-[260px_1fr] gap-6">
                  {/* Info brigada */}
                  <div className="border border-[#e5e7eb] rounded-md p-4 text-[12px] space-y-2">
                    <div className="font-semibold text-[13px] mb-2">Información del Equipo</div>
                    <Row k="Código" v={<span className="font-mono">{selected.codigo}</span>} />
                    <Row k="Nombre" v={selected.nombre} />
                    <Row k="Zona / Tramo" v={selected.zona} />
                    <Row k="Coordinador" v={getUsuario(selected.coordinadorId)?.nombre ?? "—"} />
                    <Row k="Vigencia" v={`${selected.vigenciaIni} - ${selected.vigenciaFin}`} />
                    <Row
                      k="Estado"
                      v={
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${estadoColor(selected.estado)}`}
                        >
                          {selected.estado}
                        </span>
                      }
                    />
                    <div className="pt-1">
                      <div className="text-[#6b7280]">Descripción:</div>
                      <div className="text-[#374151]">{selected.descripcion}</div>
                    </div>
                  </div>

                  {/* Integrantes */}
                  <div className="border border-[#e5e7eb] rounded-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-[13px]">
                        Integrantes del Equipo ({selected.integrantes.length})
                      </div>
                      <button
                        onClick={() => setShowAddMember(true)}
                        className="flex items-center gap-1 text-[12px] text-[#b91c1c] border border-[#fecaca] hover:bg-[#fef2f2] px-2.5 py-1.5 rounded-md"
                      >
                        <Plus size={12} /> Agregar Integrante
                      </button>
                    </div>
                    <table className="w-full text-[12px]">
                      <thead className="text-[#6b7280] bg-[#f9fafb]">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                          <th className="px-3 py-2 text-left font-semibold">Tipo</th>
                          <th className="px-3 py-2 text-left font-semibold">Rol en el Equipo</th>
                          <th className="px-3 py-2 text-left font-semibold">Especialidad / Área</th>
                          <th className="px-3 py-2 text-left font-semibold">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.integrantes.map((i) => {
                          const u = getUsuario(i.usuarioId);
                          if (!u) return null;
                          return (
                            <tr key={u.id} className="border-t border-[#f3f4f6]">
                              <td className="px-3 py-2 font-medium">{u.nombre}</td>
                              <td className="px-3 py-2">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${tipoColor(u.tipo)}`}
                                >
                                  {u.tipo}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${rolColor(i.rol)}`}
                                >
                                  {i.rol}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-[#374151]">{u.especialidad}</td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2 text-[#6b7280]">
                                  <button className="hover:text-[#dc2626]">
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() => removeMember(selected.id, u.id)}
                                    className="hover:text-[#b91c1c]"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT */}
          <aside className="space-y-4">
            <section className="bg-white border border-[#e5e7eb] rounded-lg p-4">
              <h3 className="font-semibold text-[13px] mb-3">Resumen de Configuración Operativa</h3>
              <ul className="space-y-2 text-[12px]">
                <ResumenItem
                  icon={ClipboardList}
                  label="Equipos registrados"
                  value={resumen.registradas}
                />
                <ResumenItem icon={ShieldCheck} label="Equipos activos" value={resumen.activas} />
                <ResumenItem icon={Users} label="Usuarios asignados" value={resumen.usuarios} />
                <ResumenItem icon={UserCog} label="Roles definidos" value={resumen.roles} />
              </ul>
            </section>

            <section className="bg-white border border-[#e5e7eb] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3 font-semibold text-[13px]">
                <History size={14} /> Historial de Cambios
              </div>
              <ol className="relative border-l border-[#e5e7eb] ml-1 space-y-3 text-[12px]">
                {[
                  {
                    date: "15/05/2025 10:30",
                    tag: "Creación",
                    tagColor: "bg-[#dcfce7] text-[#166534]",
                    who: "Administrador",
                    text: 'Se creó el equipo "Equipo Norte".',
                  },
                  {
                    date: "16/05/2025 14:22",
                    tag: "Actualización",
                    tagColor: "bg-[#fee2e2] text-[#b91c1c]",
                    who: "Ana Torres",
                    text: 'Se actualizó la vigencia del equipo "Equipo Centro".',
                  },
                  {
                    date: "17/05/2025 09:15",
                    tag: "Actualización",
                    tagColor: "bg-[#fee2e2] text-[#b91c1c]",
                    who: "Pedro Ramírez",
                    text: 'Se agregó un nuevo integrante al equipo "Equipo Norte".',
                  },
                ].map((h, idx) => (
                  <li key={idx} className="ml-3">
                    <span className="absolute -left-1.5 size-3 rounded-full bg-white border-2 border-[#b91c1c]" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#374151] font-medium">{h.date}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${h.tagColor}`}
                      >
                        {h.tag}
                      </span>
                    </div>
                    <div className="text-[#6b7280]">{h.who}</div>
                    <div className="text-[#374151]">{h.text}</div>
                  </li>
                ))}
              </ol>
              <button className="mt-3 text-[12px] text-[#b91c1c] hover:underline">
                Ver todo el historial →
              </button>
            </section>

            <section className="bg-white border border-[#e5e7eb] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 font-semibold text-[13px]">
                <StickyNote size={14} /> Notas
              </div>
              <p className="text-[12px] text-[#6b7280]">
                Cualquier cambio en responsables o integrantes de equipos quedará registrado para
                fines de trazabilidad y control operativo.
              </p>
            </section>
          </aside>
        </div>
      </main>

      {showNew && (
        <BrigadaFormModal
          mode="create"
          onClose={() => setShowNew(false)}
          onSubmit={(b) => {
            addBrigada(b);
            setShowNew(false);
          }}
          initial={{
            codigo: `BRG-CAB-${String(brigadas.length + 1).padStart(3, "0")}`,
            nombre: "",
            zona: "",
            coordinadorId: "",
            vigenciaIni: "",
            vigenciaFin: "",
            estado: "En formación",
            descripcion: "",
            integrantes: [],
          }}
        />
      )}
      {editId &&
        (() => {
          const b = brigadas.find((x) => x.id === editId);
          if (!b) return null;
          return (
            <BrigadaFormModal
              mode="edit"
              onClose={() => setEditId(null)}
              onSubmit={(data) => {
                updateBrigada(editId, data);
                setEditId(null);
              }}
              initial={b}
            />
          );
        })()}
      {showAddMember && selected && (
        <AddMemberModal
          existing={selected.integrantes.map((i) => i.usuarioId)}
          onClose={() => setShowAddMember(false)}
          onAdd={(i) => {
            addMember(selected.id, i);
            setShowAddMember(false);
          }}
        />
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[#6b7280]">{k}:</span>
      <span className="text-[#1f2937] text-right">{v}</span>
    </div>
  );
}

function ResumenItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-[#374151]">
        <span className="size-7 rounded-md bg-[#fef2f2] text-[#b91c1c] flex items-center justify-center">
          <Icon size={14} />
        </span>
        {label}
      </span>
      <span className="font-semibold text-[#1f2937]">{value}</span>
    </li>
  );
}

function UserAutocomplete({
  value,
  onChange,
  exclude = [],
  placeholder = "Buscar usuario por nombre…",
}: {
  value: string;
  onChange: (id: string) => void;
  exclude?: string[];
  placeholder?: string;
}) {
  const [query, setQuery] = useState(
    value ? (USUARIOS.find((u) => u.id === value)?.nombre ?? "") : "",
  );
  const [open, setOpen] = useState(false);

  const filtered = USUARIOS.filter((u) => !exclude.includes(u.id))
    .filter(
      (u) =>
        u.nombre.toLowerCase().includes(query.toLowerCase()) ||
        u.especialidad.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 8);

  return (
    <div className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            onChange("");
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full pl-8 pr-3 py-2 border border-[#e5e7eb] rounded-md text-[13px] focus:outline-none focus:border-[#dc2626]"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-auto bg-white border border-[#e5e7eb] rounded-md shadow-lg">
          {filtered.map((u) => (
            <button
              type="button"
              key={u.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(u.id);
                setQuery(u.nombre);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-[#f9fafb] text-[12px]"
            >
              <div>
                <div className="font-medium">{u.nombre}</div>
                <div className="text-[11px] text-[#6b7280]">{u.especialidad}</div>
              </div>
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${tipoColor(u.tipo)}`}
              >
                {u.tipo}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BrigadaFormModal({
  mode,
  onClose,
  onSubmit,
  initial,
}: {
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (b: Omit<Brigada, "id">) => void;
  initial: Omit<Brigada, "id">;
}) {
  const [codigo, setCodigo] = useState(initial.codigo);
  const [nombre, setNombre] = useState(initial.nombre);
  const [zona, setZona] = useState(initial.zona);
  const [coordinadorId, setCoordinadorId] = useState(initial.coordinadorId);
  const [vigenciaIni, setVigenciaIni] = useState(initial.vigenciaIni);
  const [vigenciaFin, setVigenciaFin] = useState(initial.vigenciaFin);
  const [estado, setEstado] = useState<Brigada["estado"]>(initial.estado);
  const [descripcion, setDescripcion] = useState(initial.descripcion);
  const [integrantes, setIntegrantes] = useState<Integrante[]>(initial.integrantes);

  const [newMemberId, setNewMemberId] = useState("");
  const [newMemberRol, setNewMemberRol] = useState<Integrante["rol"]>("Miembro");
  const [filtroTipo, setFiltroTipo] = useState<TipoUsuario | "">("");

  function addMember() {
    if (!newMemberId) return;
    if (integrantes.find((i) => i.usuarioId === newMemberId)) return;
    setIntegrantes((arr) => [...arr, { usuarioId: newMemberId, rol: newMemberRol }]);
    setNewMemberId("");
    setNewMemberRol("Miembro");
  }

  function removeIntegrante(uid: string) {
    setIntegrantes((arr) => arr.filter((i) => i.usuarioId !== uid));
  }

  function changeRol(uid: string, rol: Integrante["rol"]) {
    setIntegrantes((arr) => arr.map((i) => (i.usuarioId === uid ? { ...i, rol } : i)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !coordinadorId || !codigo) return;
    onSubmit({
      codigo,
      nombre,
      zona,
      coordinadorId,
      vigenciaIni,
      vigenciaFin,
      estado,
      descripcion,
      integrantes,
    });
  }

  const excludedForMember = [
    ...integrantes.map((i) => i.usuarioId),
    ...(filtroTipo ? USUARIOS.filter((u) => u.tipo !== filtroTipo).map((u) => u.id) : []),
  ];

  return (
    <Modal title={mode === "create" ? "Nuevo Equipo" : "Editar Equipo"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4 text-[13px]">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Código de Equipo">
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full px-3 py-2 border border-[#e5e7eb] rounded-md font-mono text-[#dc2626] focus:outline-none focus:border-[#dc2626]"
            />
          </Field>
          <Field label="Nombre del Equipo">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#dc2626]"
            />
          </Field>
        </div>
        <Field label="Zona / Tramo">
          <input
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            className="w-full px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#dc2626]"
          />
        </Field>
        <Field label="Coordinador (buscar usuario registrado)">
          <UserAutocomplete value={coordinadorId} onChange={setCoordinadorId} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Vigencia desde">
            <input
              type="date"
              value={vigenciaIni}
              onChange={(e) => setVigenciaIni(e.target.value)}
              className="w-full px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#dc2626]"
            />
          </Field>
          <Field label="Vigencia hasta">
            <input
              type="date"
              value={vigenciaFin}
              onChange={(e) => setVigenciaFin(e.target.value)}
              className="w-full px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#dc2626]"
            />
          </Field>
          <Field label="Estado">
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as Brigada["estado"])}
              className="w-full px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#dc2626]"
            >
              <option>Activa</option>
              <option>En formación</option>
              <option>Programada</option>
            </select>
          </Field>
        </div>
        <Field label="Descripción">
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#dc2626]"
          />
        </Field>

        <div className="border-t border-[#f3f4f6] pt-3">
          <div className="font-semibold text-[13px] mb-2">Miembros del Equipo</div>

          <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-md p-3 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFiltroTipo("")}
                className={`px-2.5 py-1 rounded-full text-[11px] border ${filtroTipo === "" ? "bg-[#dc2626] text-white border-[#dc2626]" : "border-[#e5e7eb] text-[#374151] bg-white hover:bg-[#f3f4f6]"}`}
              >
                Todos
              </button>
              {TIPOS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFiltroTipo(t)}
                  className={`px-2.5 py-1 rounded-full text-[11px] border ${filtroTipo === t ? "bg-[#dc2626] text-white border-[#dc2626]" : "border-[#e5e7eb] text-[#374151] bg-white hover:bg-[#f3f4f6]"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-[1fr_180px_auto] gap-2">
              <UserAutocomplete
                value={newMemberId}
                onChange={setNewMemberId}
                exclude={excludedForMember}
                placeholder="Buscar usuario registrado…"
              />
              <select
                value={newMemberRol}
                onChange={(e) => setNewMemberRol(e.target.value as Integrante["rol"])}
                className="px-3 py-2 border border-[#e5e7eb] rounded-md bg-white focus:outline-none focus:border-[#dc2626]"
              >
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addMember}
                disabled={!newMemberId}
                className="px-3 py-2 text-[12px] rounded-md bg-[#dc2626] text-white hover:bg-[#b91c1c] disabled:opacity-50 flex items-center gap-1"
              >
                <Plus size={12} /> Agregar
              </button>
            </div>
          </div>

          <div className="mt-3 border border-[#e5e7eb] rounded-md overflow-hidden">
            <table className="w-full text-[12px]">
              <thead className="bg-[#f9fafb] text-[#6b7280]">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                  <th className="px-3 py-2 text-left font-semibold">Tipo</th>
                  <th className="px-3 py-2 text-left font-semibold">Rol</th>
                  <th className="px-3 py-2 text-left font-semibold">Especialidad</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {integrantes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-[#9ca3af]">
                      Sin miembros agregados
                    </td>
                  </tr>
                )}
                {integrantes.map((i) => {
                  const u = USUARIOS.find((x) => x.id === i.usuarioId);
                  if (!u) return null;
                  return (
                    <tr key={u.id} className="border-t border-[#f3f4f6]">
                      <td className="px-3 py-2 font-medium">{u.nombre}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${tipoColor(u.tipo)}`}
                        >
                          {u.tipo}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={i.rol}
                          onChange={(e) => changeRol(u.id, e.target.value as Integrante["rol"])}
                          className="px-2 py-1 border border-[#e5e7eb] rounded text-[11px] bg-white focus:outline-none focus:border-[#dc2626]"
                        >
                          {ROLES.map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-[#374151]">{u.especialidad}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeIntegrante(u.id)}
                          className="text-[#6b7280] hover:text-[#b91c1c]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#f3f4f6]">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] rounded-md border border-[#e5e7eb] hover:bg-[#f9fafb]"
          >
            <X size={14} /> Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] rounded-md bg-[#b91c1c] hover:bg-[#991b1b] text-white"
          >
            <Save size={14} /> {mode === "create" ? "Crear Equipo" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AddMemberModal({
  existing,
  onClose,
  onAdd,
}: {
  existing: string[];
  onClose: () => void;
  onAdd: (i: Integrante) => void;
}) {
  const [usuarioId, setUsuarioId] = useState("");
  const [rol, setRol] = useState<Integrante["rol"]>("Miembro");
  const [filtroTipo, setFiltroTipo] = useState<TipoUsuario | "">("");

  const excluded = useMemo(() => {
    const ids = [...existing];
    if (filtroTipo) USUARIOS.filter((u) => u.tipo !== filtroTipo).forEach((u) => ids.push(u.id));
    return ids;
  }, [existing, filtroTipo]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuarioId) return;
    onAdd({ usuarioId, rol });
  }

  return (
    <Modal title="Agregar Integrante" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3 text-[13px]">
        <Field label="Tipo de Usuario (filtro)">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFiltroTipo("")}
              className={`px-2.5 py-1 rounded-full text-[11px] border ${filtroTipo === "" ? "bg-[#dc2626] text-white border-[#dc2626]" : "border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb]"}`}
            >
              Todos
            </button>
            {TIPOS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFiltroTipo(t)}
                className={`px-2.5 py-1 rounded-full text-[11px] border ${filtroTipo === t ? "bg-[#dc2626] text-white border-[#dc2626]" : "border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb]"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Buscar Usuario del Sistema">
          <UserAutocomplete value={usuarioId} onChange={setUsuarioId} exclude={excluded} />
        </Field>
        <Field label="Rol en el Equipo">
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value as Integrante["rol"])}
            className="w-full px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#dc2626]"
          >
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2 border-t border-[#f3f4f6]">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] rounded-md border border-[#e5e7eb] hover:bg-[#f9fafb]"
          >
            <X size={14} /> Cancelar
          </button>
          <button
            type="submit"
            disabled={!usuarioId}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] rounded-md bg-[#b91c1c] hover:bg-[#991b1b] text-white disabled:opacity-50"
          >
            <Plus size={14} /> Agregar
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] text-[#374151] font-medium mb-1">{label}</span>
      {children}
    </label>
  );
}

function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full ${wide ? "max-w-3xl" : "max-w-lg"}`}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e5e7eb]">
          <h3 className="font-semibold text-[14px]">{title}</h3>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#1f2937]">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-auto">{children}</div>
      </div>
    </div>
  );
}
