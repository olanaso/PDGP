import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  History,
  Plus,
  Search,
  Save,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import {
  getUsuarioEquipo,
  initialProjectBrigades,
  readProjectBrigades,
  usuariosEquipo,
  type BrigadaProyecto,
  type UsuarioEquipo,
} from "@/lib/projectTeamsData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/asignacion-predial")({
  head: () => ({
    meta: [
      { title: "Asignación predial" },
      {
        name: "description",
        content:
          "Asignación de brigadas, responsables adicionales e historial de atención del predio.",
      },
    ],
  }),
  component: AsignacionPredialPage,
});

const RED = "#dc2626";
const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] outline-none transition focus:border-[#dc2626] focus:ring-1 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";
const selectCls = `${inputCls} appearance-none`;

const additionalRoles = [
  "Responsable de apoyo",
  "Especialista técnico",
  "Especialista legal",
  "Responsable documental",
  "Supervisor",
  "Otro",
] as const;

type AdditionalRole = (typeof additionalRoles)[number];

type AdditionalResponsible = {
  id: string;
  usuarioId: string;
  role: AdditionalRole;
};

type AssignmentHistoryItem = {
  id: string;
  registeredAt: string;
  action: "ASIGNACIÓN" | "REASIGNACIÓN" | "ACTUALIZACIÓN";
  brigadaCode: string;
  brigadaName: string;
  principalName: string;
  additionalNames: string[];
  startDate: string;
  endDate: string;
  priority: string;
  status: string;
  observation: string;
};

type Feedback = {
  kind: "success" | "error";
  text: string;
};

const initialForm = {
  brigadaId: "",
  responsablePrincipalId: "",
  fechaAsignacion: "",
  fechaFin: "",
  prioridad: "ORDINARIA",
  estado: "ASIGNADO",
  motivo: "",
  observaciones: "",
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-4 border-b pb-1 first:mt-0">
      <h3 className="text-[13px] font-semibold" style={{ color: RED }}>
        {children}
      </h3>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className = "",
  alignStart = false,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  alignStart?: boolean;
}) {
  return (
    <div
      className={`grid gap-1.5 sm:grid-cols-[180px_minmax(0,1fr)] ${
        alignStart ? "sm:items-start" : "sm:items-center"
      } ${className}`}
    >
      <label className={`text-[12px] text-gray-700 sm:text-right ${alignStart ? "sm:pt-2" : ""}`}>
        {required && <span style={{ color: RED }}>* </span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function BrigadaAutocomplete({
  brigadas,
  value,
  onChange,
}: {
  brigadas: BrigadaProyecto[];
  value: string;
  onChange: (brigadaId: string) => void;
}) {
  const selected = brigadas.find((brigada) => brigada.id === value);
  const [query, setQuery] = useState(selected ? `${selected.codigo} · ${selected.nombre}` : "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const selectedBrigada = brigadas.find((brigada) => brigada.id === value);
    setQuery(selectedBrigada ? `${selectedBrigada.codigo} · ${selectedBrigada.nombre}` : "");
  }, [brigadas, value]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    return brigadas
      .filter((brigada) => {
        if (!normalizedQuery) return true;
        return [brigada.codigo, brigada.nombre, brigada.zona, brigada.estado]
          .join(" ")
          .toLocaleLowerCase("es")
          .includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [brigadas, query]);

  return (
    <div className="relative">
      <Search
        size={14}
        className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-gray-400"
      />
      <input
        className={`${inputCls} pl-8`}
        value={query}
        placeholder="Buscar por código, nombre, zona o estado"
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          if (value) onChange("");
        }}
      />

      {open && (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded border border-gray-200 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-[11px] text-gray-500">
              No se encontraron brigadas.
            </p>
          ) : (
            filtered.map((brigada) => {
              const coordinator = getUsuarioEquipo(brigada.coordinadorId);
              return (
                <button
                  key={brigada.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(brigada.id);
                    setQuery(`${brigada.codigo} · ${brigada.nombre}`);
                    setOpen(false);
                  }}
                  className="flex w-full items-start justify-between gap-3 border-b border-gray-100 px-3 py-2.5 text-left last:border-b-0 hover:bg-red-50/50"
                >
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold text-gray-800">
                      {brigada.codigo} · {brigada.nombre}
                    </span>
                    <span className="mt-0.5 block text-[9px] text-gray-500">
                      {brigada.zona} · Coordinador: {coordinator?.nombre ?? "Sin asignar"}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${
                      brigada.estado === "Activa"
                        ? "bg-green-100 text-green-700"
                        : brigada.estado === "Programada"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {brigada.estado}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function UserAutocomplete({
  users,
  value,
  onChange,
  disabled = false,
}: {
  users: UsuarioEquipo[];
  value: string;
  onChange: (usuarioId: string) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(users.find((user) => user.id === value)?.nombre ?? "");
  }, [users, value]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    return users
      .filter((user) =>
        [user.nombre, user.especialidad, user.tipo]
          .join(" ")
          .toLocaleLowerCase("es")
          .includes(normalizedQuery),
      )
      .slice(0, 8);
  }, [query, users]);

  return (
    <div className="relative">
      <Search
        size={14}
        className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-gray-400"
      />
      <input
        className={`${inputCls} pl-8`}
        disabled={disabled}
        value={query}
        placeholder={disabled ? "Seleccione primero una brigada" : "Buscar responsable por nombre"}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          if (value) onChange("");
        }}
      />

      {open && !disabled && (
        <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded border border-gray-200 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-[11px] text-gray-500">
              No se encontraron responsables disponibles.
            </p>
          ) : (
            filtered.map((user) => (
              <button
                key={user.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(user.id);
                  setQuery(user.nombre);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-3 py-2 text-left last:border-b-0 hover:bg-red-50/50"
              >
                <span>
                  <span className="block text-[11px] font-semibold text-gray-800">
                    {user.nombre}
                  </span>
                  <span className="text-[9px] text-gray-500">{user.especialidad}</span>
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-[9px] font-medium text-gray-600">
                  {user.tipo}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function historyStorageKey(projectId: string, codigo: string) {
  return `mtc-predio-assignment-history:${projectId}:${codigo}`;
}

function readAssignmentHistory(projectId: string, codigo: string): AssignmentHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(historyStorageKey(projectId, codigo));
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) ? (parsed as AssignmentHistoryItem[]) : [];
  } catch {
    return [];
  }
}

function writeAssignmentHistory(
  projectId: string,
  codigo: string,
  historyItems: AssignmentHistoryItem[],
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(historyStorageKey(projectId, codigo), JSON.stringify(historyItems));
}

function formatDate(date: string) {
  if (!date) return "—";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function AsignacionPredialPage() {
  const { projectId, codigo } = Route.useParams();
  const navigate = useNavigate();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;

  const [brigadas, setBrigadas] = useState<BrigadaProyecto[]>(initialProjectBrigades);
  const [form, setForm] = useState(initialForm);
  const [additionalResponsibles, setAdditionalResponsibles] = useState<AdditionalResponsible[]>([]);
  const [newResponsibleId, setNewResponsibleId] = useState("");
  const [newResponsibleRole, setNewResponsibleRole] =
    useState<AdditionalRole>("Responsable de apoyo");
  const [historyItems, setHistoryItems] = useState<AssignmentHistoryItem[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    setBrigadas(readProjectBrigades(projectId));
    setForm(initialForm);
    setAdditionalResponsibles([]);
    setNewResponsibleId("");
    setHistoryItems(readAssignmentHistory(projectId, decodedCodigo));
    setFeedback(null);
  }, [decodedCodigo, projectId]);

  const selectedBrigada = brigadas.find((brigada) => brigada.id === form.brigadaId);

  const brigadeMembers = useMemo(
    () =>
      selectedBrigada?.integrantes
        .map((integrante) => ({
          ...integrante,
          user: getUsuarioEquipo(integrante.usuarioId),
        }))
        .filter((integrante) => integrante.user) ?? [],
    [selectedBrigada],
  );

  const availableExternalUsers = useMemo(() => {
    const brigadeUserIds = new Set(
      selectedBrigada?.integrantes.map((integrante) => integrante.usuarioId) ?? [],
    );
    const alreadyAddedIds = new Set(
      additionalResponsibles.map((responsible) => responsible.usuarioId),
    );
    return usuariosEquipo.filter(
      (user) => !brigadeUserIds.has(user.id) && !alreadyAddedIds.has(user.id),
    );
  }, [additionalResponsibles, selectedBrigada]);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFeedback(null);
  }

  function selectBrigada(brigadaId: string) {
    const brigada = brigadas.find((item) => item.id === brigadaId);
    setForm((current) => ({
      ...current,
      brigadaId,
      responsablePrincipalId: brigada?.coordinadorId ?? "",
    }));
    setAdditionalResponsibles([]);
    setNewResponsibleId("");
    setFeedback(null);
  }

  function addAdditionalResponsible() {
    if (!newResponsibleId) return;
    setAdditionalResponsibles((current) => [
      ...current,
      {
        id: `additional-${Date.now()}`,
        usuarioId: newResponsibleId,
        role: newResponsibleRole,
      },
    ]);
    setNewResponsibleId("");
    setNewResponsibleRole("Responsable de apoyo");
    setFeedback(null);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Asignación predial"
        badgeLabel="Predio"
        badgeValue={predio?.cod || decodedCodigo}
        badgeSuffix="Información base 1.3"
      />

      <main className="mx-auto max-w-[1400px] p-4">
        <form
          className="rounded border bg-white"
          onSubmit={(event) => {
            event.preventDefault();
            if (!selectedBrigada) {
              setFeedback({ kind: "error", text: "Seleccione una brigada registrada." });
              return;
            }

            const principal = getUsuarioEquipo(form.responsablePrincipalId);
            if (!principal) {
              setFeedback({
                kind: "error",
                text: "Seleccione al responsable principal dentro de la brigada.",
              });
              return;
            }

            const newHistoryItem: AssignmentHistoryItem = {
              id: `history-${Date.now()}`,
              registeredAt: new Date().toLocaleString("es-PE"),
              action: historyItems.length ? "REASIGNACIÓN" : "ASIGNACIÓN",
              brigadaCode: selectedBrigada.codigo,
              brigadaName: selectedBrigada.nombre,
              principalName: principal.nombre,
              additionalNames: additionalResponsibles.map((responsible) => {
                const user = getUsuarioEquipo(responsible.usuarioId);
                return `${user?.nombre ?? "Usuario"} (${responsible.role})`;
              }),
              startDate: form.fechaAsignacion,
              endDate: form.fechaFin,
              priority: form.prioridad,
              status: form.estado,
              observation: form.observaciones || form.motivo,
            };

            const updatedHistory = [newHistoryItem, ...historyItems];
            setHistoryItems(updatedHistory);
            writeAssignmentHistory(projectId, decodedCodigo, updatedHistory);
            setFeedback({
              kind: "success",
              text: "La asignación fue guardada y añadida al historial del predio.",
            });
          }}
        >
          <div className="px-5 py-5">
            <div className="mb-3 border-b">
              <div
                className="inline-block border-b-2 px-3 py-1.5 text-[12px] font-medium"
                style={{ borderColor: RED, color: RED }}
              >
                1.3 Asignación predial
              </div>
            </div>

            {feedback && (
              <div
                role="status"
                className={`mb-3 flex items-center gap-2 rounded border px-3 py-2 text-[11px] ${
                  feedback.kind === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {feedback.kind === "success" ? (
                  <CheckCircle2 size={15} className="shrink-0" />
                ) : (
                  <AlertCircle size={15} className="shrink-0" />
                )}
                {feedback.text}
              </div>
            )}

            <SectionTitle>Identificación de la asignación</SectionTitle>
            <div className="grid gap-x-6 gap-y-2 xl:grid-cols-2">
              <Field label="Código de predio">
                <input
                  className={`${inputCls} bg-gray-50`}
                  value={predio?.cod || decodedCodigo}
                  readOnly
                />
              </Field>
              <Field label="Proyecto">
                <input className={`${inputCls} bg-gray-50`} value={projectLabel} readOnly />
              </Field>
              <Field label="Fecha de asignación" required>
                <input
                  type="date"
                  required
                  className={inputCls}
                  value={form.fechaAsignacion}
                  onChange={(event) => setField("fechaAsignacion", event.target.value)}
                />
              </Field>
              <Field label="Fecha prevista de término">
                <input
                  type="date"
                  className={inputCls}
                  value={form.fechaFin}
                  onChange={(event) => setField("fechaFin", event.target.value)}
                />
              </Field>
              <Field label="Prioridad">
                <select
                  className={selectCls}
                  value={form.prioridad}
                  onChange={(event) => setField("prioridad", event.target.value)}
                >
                  <option>ORDINARIA</option>
                  <option>ALTA</option>
                  <option>URGENTE</option>
                </select>
              </Field>
              <Field label="Estado de asignación">
                <select
                  className={selectCls}
                  value={form.estado}
                  onChange={(event) => setField("estado", event.target.value)}
                >
                  <option>ASIGNADO</option>
                  <option>PENDIENTE</option>
                  <option>REASIGNADO</option>
                  <option>CERRADO</option>
                </select>
              </Field>
            </div>

            <SectionTitle>Brigada asignada</SectionTitle>
            <div className="grid gap-x-6 gap-y-2 xl:grid-cols-2">
              <Field label="Buscar brigada" required className="xl:col-span-2">
                <BrigadaAutocomplete
                  brigadas={brigadas}
                  value={form.brigadaId}
                  onChange={selectBrigada}
                />
              </Field>
            </div>
            <div className="mt-2 flex justify-end">
              <Link
                to="/proyectos/$projectId/equipos"
                params={{ projectId }}
                className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#dc2626] hover:underline"
              >
                <Users size={13} /> Administrar brigadas en Equipos
              </Link>
            </div>

            {!selectedBrigada ? (
              <div className="mt-3 rounded border border-dashed border-gray-300 bg-gray-50 px-4 py-7 text-center">
                <Users size={24} className="mx-auto text-gray-400" />
                <p className="mt-2 text-[11px] font-semibold text-gray-700">
                  Seleccione una brigada para cargar sus integrantes
                </p>
                <p className="mt-1 text-[10px] text-gray-500">
                  El responsable principal se completará inicialmente con el coordinador de la
                  brigada.
                </p>
              </div>
            ) : (
              <div className="mt-3 overflow-hidden rounded border border-gray-200">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-800">
                      {selectedBrigada.codigo} · {selectedBrigada.nombre}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">{selectedBrigada.zona}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[9px]">
                    <span className="rounded-full bg-green-100 px-2 py-1 font-semibold text-green-700">
                      {selectedBrigada.estado}
                    </span>
                    <span className="rounded-full bg-white px-2 py-1 text-gray-600">
                      Vigencia: {formatDate(selectedBrigada.vigenciaIni)} –{" "}
                      {formatDate(selectedBrigada.vigenciaFin)}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-[11px]">
                    <thead className="bg-white text-[9px] uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="w-24 border-b border-gray-200 px-3 py-2 text-center">
                          Principal
                        </th>
                        <th className="border-b border-gray-200 px-3 py-2">Integrante</th>
                        <th className="border-b border-gray-200 px-3 py-2">Tipo</th>
                        <th className="border-b border-gray-200 px-3 py-2">Rol en la brigada</th>
                        <th className="border-b border-gray-200 px-3 py-2">Especialidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brigadeMembers.map((member) => (
                        <tr key={member.usuarioId} className="border-t border-gray-100">
                          <td className="px-3 py-2 text-center">
                            <input
                              type="radio"
                              name="responsable-principal"
                              aria-label={`Seleccionar a ${member.user?.nombre} como responsable principal`}
                              checked={form.responsablePrincipalId === member.usuarioId}
                              onChange={() => setField("responsablePrincipalId", member.usuarioId)}
                              className="size-4 accent-[#dc2626]"
                            />
                          </td>
                          <td className="px-3 py-2 font-medium text-gray-800">
                            {member.user?.nombre}
                          </td>
                          <td className="px-3 py-2 text-gray-600">{member.user?.tipo}</td>
                          <td className="px-3 py-2">
                            <span className="rounded-full bg-red-50 px-2 py-1 text-[9px] font-medium text-red-700">
                              {member.rol}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-600">{member.user?.especialidad}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <SectionTitle>Responsables adicionales fuera de la brigada</SectionTitle>
            <p className="mb-3 text-[10px] leading-4 text-gray-500">
              Agregue usuarios que apoyarán este predio sin modificar la composición de la brigada
              en Equipos.
            </p>
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_220px_auto]">
              <UserAutocomplete
                users={availableExternalUsers}
                value={newResponsibleId}
                onChange={setNewResponsibleId}
                disabled={!selectedBrigada}
              />
              <select
                className={selectCls}
                disabled={!selectedBrigada}
                value={newResponsibleRole}
                onChange={(event) => setNewResponsibleRole(event.target.value as AdditionalRole)}
              >
                {additionalRoles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={!newResponsibleId}
                onClick={addAdditionalResponsible}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded bg-[#dc2626] px-3 text-[11px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <UserPlus size={14} /> Agregar responsable
              </button>
            </div>

            <div className="mt-3 overflow-x-auto rounded border border-gray-200">
              <table className="w-full min-w-[640px] text-left text-[11px]">
                <thead className="bg-gray-50 text-[9px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="w-12 px-3 py-2 text-center">N.°</th>
                    <th className="px-3 py-2">Responsable externo</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Función en este predio</th>
                    <th className="w-20 px-3 py-2 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {additionalResponsibles.length === 0 ? (
                    <tr className="border-t border-gray-100">
                      <td colSpan={5} className="px-3 py-5 text-center text-[10px] text-gray-500">
                        No se han agregado responsables fuera de la brigada.
                      </td>
                    </tr>
                  ) : (
                    additionalResponsibles.map((responsible, index) => {
                      const user = getUsuarioEquipo(responsible.usuarioId);
                      return (
                        <tr key={responsible.id} className="border-t border-gray-100">
                          <td className="px-3 py-2 text-center text-gray-500">{index + 1}</td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-gray-800">{user?.nombre}</p>
                            <p className="text-[9px] text-gray-500">{user?.especialidad}</p>
                          </td>
                          <td className="px-3 py-2 text-gray-600">{user?.tipo}</td>
                          <td className="px-3 py-2 text-gray-700">{responsible.role}</td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              title="Quitar responsable adicional"
                              onClick={() =>
                                setAdditionalResponsibles((current) =>
                                  current.filter((item) => item.id !== responsible.id),
                                )
                              }
                              className="inline-grid size-8 place-items-center rounded border border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <SectionTitle>Motivo y observaciones</SectionTitle>
            <div className="grid gap-x-6 gap-y-2 xl:grid-cols-2">
              <Field label="Motivo de asignación" className="xl:col-span-2">
                <input
                  className={inputCls}
                  placeholder="Asignación inicial, redistribución de carga, apoyo especializado u otro"
                  value={form.motivo}
                  onChange={(event) => setField("motivo", event.target.value)}
                />
              </Field>
              <Field label="Observaciones" alignStart className="xl:col-span-2">
                <textarea
                  rows={3}
                  className="w-full rounded border border-gray-300 bg-white p-2 text-[12px] outline-none focus:border-[#dc2626]"
                  value={form.observaciones}
                  onChange={(event) => setField("observaciones", event.target.value)}
                />
              </Field>
            </div>

            <SectionTitle>Historial de asignaciones del predio</SectionTitle>
            <div className="overflow-x-auto rounded border border-gray-200">
              <table className="w-full min-w-[900px] text-left text-[10px]">
                <thead className="bg-gray-50 text-[9px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Fecha de registro</th>
                    <th className="px-3 py-2">Acción</th>
                    <th className="px-3 py-2">Brigada</th>
                    <th className="px-3 py-2">Responsable principal</th>
                    <th className="px-3 py-2">Responsables adicionales</th>
                    <th className="px-3 py-2">Vigencia</th>
                    <th className="px-3 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historyItems.length === 0 ? (
                    <tr className="border-t border-gray-100">
                      <td colSpan={7} className="px-3 py-7 text-center text-gray-500">
                        <History size={20} className="mx-auto mb-2 text-gray-300" />
                        Este predio todavía no tiene asignaciones registradas.
                      </td>
                    </tr>
                  ) : (
                    historyItems.map((historyItem) => (
                      <tr key={historyItem.id} className="border-t border-gray-100 align-top">
                        <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={12} /> {historyItem.registeredAt}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="rounded-full bg-red-50 px-2 py-1 text-[9px] font-semibold text-red-700">
                            {historyItem.action}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-medium text-gray-800">{historyItem.brigadaCode}</p>
                          <p className="text-[9px] text-gray-500">{historyItem.brigadaName}</p>
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-700">
                          {historyItem.principalName}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {historyItem.additionalNames.length
                            ? historyItem.additionalNames.join(", ")
                            : "Ninguno"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                          {formatDate(historyItem.startDate)} – {formatDate(historyItem.endDate)}
                        </td>
                        <td className="px-3 py-2">
                          <span className="rounded-full bg-green-50 px-2 py-1 text-[9px] font-semibold text-green-700">
                            {historyItem.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/proyectos/$projectId/predios/$codigo/identificacion-codificacion",
                    params: { projectId, codigo: decodedCodigo },
                  })
                }
                className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 px-4 text-[12px] hover:bg-gray-50"
              >
                <X size={14} /> Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex h-8 items-center gap-1.5 rounded px-4 text-[12px] text-white"
                style={{ background: RED }}
              >
                <Save size={14} /> Guardar asignación
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
