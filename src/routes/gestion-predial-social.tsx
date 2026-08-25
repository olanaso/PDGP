import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "../components/AppSidebar";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  Save,
  X,
  Upload,
  Download,
  Eye,
  Paperclip,
  ChevronsUpDown,
} from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";

export const Route = createFileRoute("/gestion-predial-social")({
  head: () => ({ meta: [{ title: "Gestión Predial Social" }] }),
  component: Page,
});

const RED = "#dc2626";
const inputCls =
  "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";
const textareaCls =
  "px-2 py-1.5 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";

type Evidencia = {
  id: string;
  tipo: "Documento" | "Foto" | "Imagen";
  categoria: string;
  descripcion: string;
  fecha: string;
  responsable: string;
  nombreArchivo: string;
};

type Seguimiento = {
  id: string;
  fecha: string;
  responsable: string;
  estado: "Permanece" | "Cambia" | "Se agrava" | "Resuelto";
  observacion: string;
};

type Actor = {
  id: string;
  proyecto: string;
  ambito: "Individual" | "Familiar" | "Grupal" | "Comunitario";
  categoria: string;
  severidad: "No identificado" | "Baja" | "Media" | "Alta";
  sujeto: string;
  ubicacion: string;
  descripcion: string;
  economica: string;
  educacion: string;
  salud: string;
  enfermedades: string;
  otros: string;
  fechaRegistro: string;
  responsable: string;
  evidencias: Evidencia[];
  seguimientos: Seguimiento[];
};

const PROYECTOS = [
  "Longitudinal de la Sierra Tramo 4",
  "Carretera Central — Tramo II",
  "Corredor Vial Interoceánico Sur",
];
const CATEGORIAS = [
  "Vulnerabilidad económica",
  "Salud",
  "Educación",
  "Vivienda",
  "Conflicto social",
  "Reasentamiento",
  "No identificado",
];

function ProjectAutocomplete({
  value,
  onChange,
  options,
  label,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value ? options.find((o) => o === value) ?? value : "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value ? options.find((o) => o === value) ?? value : "");
  }, [value, options]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [query, options]);

  const select = (v: string) => {
    onChange(v);
    setQuery(v);
    setOpen(false);
  };

  const clear = () => {
    onChange("");
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="min-w-[220px] relative">
      <label className="text-[11px] text-gray-600">{label}</label>
      <div className="relative">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={inputCls + " pr-7"}
        />
        {query && (
          <button
            onClick={clear}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X size={12} />
          </button>
        )}
        <ChevronsUpDown
          size={14}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-52 overflow-y-auto">
          <button
            className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-100 text-gray-500"
            onClick={() => clear()}
          >
            Todos
          </button>
          {filtered.map((o) => (
            <button
              key={o}
              onClick={() => select(o)}
              className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-100 ${o === value ? "bg-red-50 text-[#dc2626] font-medium" : ""}`}
            >
              {o}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-[12px] text-gray-400">Sin coincidencias</div>
          )}
        </div>
      )}
    </div>
  );
}

const seed: Actor[] = [
  {
    id: "GPS-0001",
    proyecto: PROYECTOS[0],
    ambito: "Familiar",
    categoria: "Vulnerabilidad económica",
    severidad: "Media",
    sujeto: "Familia Quispe Huamán",
    ubicacion: "Sector Huanchaca, km 42+300",
    descripcion:
      "Núcleo familiar con jefe de hogar adulto mayor. Actividad económica basada en agricultura de subsistencia.",
    economica: "Ingreso mensual estimado < S/ 500. Sin acceso a crédito formal.",
    educacion: "2 miembros con primaria incompleta.",
    salud: "1 miembro con enfermedad crónica (diabetes).",
    enfermedades: "Diabetes tipo 2, hipertensión leve.",
    otros: "Solicita acompañamiento social durante adquisición.",
    fechaRegistro: "2026-05-14",
    responsable: "María López — Área Social",
    evidencias: [
      {
        id: "E1",
        tipo: "Foto",
        categoria: "Vivienda",
        descripcion: "Frontis de la vivienda familiar.",
        fecha: "2026-05-14",
        responsable: "María López",
        nombreArchivo: "vivienda_frontis.jpg",
      },
    ],
    seguimientos: [
      {
        id: "S1",
        fecha: "2026-06-02",
        responsable: "María López",
        estado: "Permanece",
        observacion: "Se coordina segunda visita con equipo legal.",
      },
    ],
  },
  {
    id: "GPS-0002",
    proyecto: PROYECTOS[0],
    ambito: "Comunitario",
    categoria: "Conflicto social",
    severidad: "Alta",
    sujeto: "Comunidad Campesina San Andrés",
    ubicacion: "Sector norte del tramo",
    descripcion:
      "Comunidad expresa preocupación por afectación de zona agrícola comunal.",
    economica: "Comunidad dedicada a ganadería y agricultura.",
    educacion: "No identificado",
    salud: "No identificado",
    enfermedades: "No identificado",
    otros: "Requiere mesa de diálogo.",
    fechaRegistro: "2026-06-10",
    responsable: "Carlos Ruiz — Área Social",
    evidencias: [],
    seguimientos: [],
  },
];

function Page() {
  const [items, setItems] = useState<Actor[]>(seed);
  const [q, setQ] = useState("");
  const [filtroProyecto, setFiltroProyecto] = useState("");
  const [filtroAmbito, setFiltroAmbito] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Actor | null>(null);
  const [detail, setDetail] = useState<Actor | null>(null);
  const [confirmDel, setConfirmDel] = useState<Actor | null>(null);

  const filtered = useMemo(
    () =>
      items.filter(
        (a) =>
          (!q ||
            a.sujeto.toLowerCase().includes(q.toLowerCase()) ||
            a.id.toLowerCase().includes(q.toLowerCase()) ||
            a.descripcion.toLowerCase().includes(q.toLowerCase())) &&
          (!filtroProyecto || a.proyecto === filtroProyecto) &&
          (!filtroAmbito || a.ambito === filtroAmbito),
      ),
    [items, q, filtroProyecto, filtroAmbito],
  );

  const upsert = (a: Actor) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.id === a.id);
      if (i >= 0) {
        const c = [...prev];
        c[i] = a;
        return c;
      }
      return [a, ...prev];
    });
  };

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <AppSidebar />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users size={22} className="text-[#dc2626]" />
          <div>
            <h1 className="text-[18px] font-semibold text-[#111]">
              Gestión Predial Social
            </h1>
            <div className="text-[12px] text-[#6b7280]">
              Actores y ámbito de registro — seguimiento social del proceso predial
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white border rounded p-3 mb-3 flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[220px]">
            <label className="text-[11px] text-gray-600">Buscar</label>
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Sujeto, código o descripción…"
                className={inputCls + " pl-7"}
              />
            </div>
          </div>
          <ProjectAutocomplete
            value={filtroProyecto}
            onChange={setFiltroProyecto}
            options={PROYECTOS}
            label="Proyecto"
            placeholder="Buscar proyecto…"
          />
          <div className="min-w-[160px]">
            <label className="text-[11px] text-gray-600">Ámbito</label>
            <select
              value={filtroAmbito}
              onChange={(e) => setFiltroAmbito(e.target.value)}
              className={selectCls}
            >
              <option value="">Todos</option>
              {["Individual", "Familiar", "Grupal", "Comunitario"].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setOpenForm(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-white rounded"
            style={{ background: RED }}
          >
            <Plus size={14} /> Nuevo registro
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white border rounded overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-gray-50 text-gray-600">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Código</th>
                <th className="px-3 py-2 font-medium">Proyecto</th>
                <th className="px-3 py-2 font-medium">Ámbito</th>
                <th className="px-3 py-2 font-medium">Categoría</th>
                <th className="px-3 py-2 font-medium">Sujeto / Grupo</th>
                <th className="px-3 py-2 font-medium">Severidad</th>
                <th className="px-3 py-2 font-medium">Fecha</th>
                <th className="px-3 py-2 font-medium">Responsable</th>
                <th className="px-3 py-2 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-[11px]">{a.id}</td>
                  <td className="px-3 py-2">{a.proyecto}</td>
                  <td className="px-3 py-2">{a.ambito}</td>
                  <td className="px-3 py-2">{a.categoria}</td>
                  <td className="px-3 py-2">{a.sujeto}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        a.severidad === "Alta"
                          ? "bg-red-100 text-red-700"
                          : a.severidad === "Media"
                            ? "bg-amber-100 text-amber-700"
                            : a.severidad === "Baja"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {a.severidad}
                    </span>
                  </td>
                  <td className="px-3 py-2">{a.fechaRegistro}</td>
                  <td className="px-3 py-2">{a.responsable}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setDetail(a)}
                        title="Ver"
                        className="p-1 rounded hover:bg-gray-100 text-gray-600"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(a);
                          setOpenForm(true);
                        }}
                        title="Editar"
                        className="p-1 rounded hover:bg-gray-100 text-gray-600"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDel(a)}
                        title="Eliminar"
                        className="p-1 rounded hover:bg-gray-100 text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-8 text-center text-gray-400 text-[12px]"
                  >
                    Sin registros que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {openForm && (
          <ActorForm
            initial={editing}
            onCancel={() => setOpenForm(false)}
            onSave={(a) => {
              upsert(a);
              setOpenForm(false);
            }}
          />
        )}

        {detail && <DetailModal actor={detail} onClose={() => setDetail(null)} />}

        {confirmDel && (
          <ConfirmModal
            title="Eliminar registro social"
            message={`¿Confirma eliminar el registro ${confirmDel.id} — ${confirmDel.sujeto}?`}
            onCancel={() => setConfirmDel(null)}
            onConfirm={() => {
              setItems((p) => p.filter((x) => x.id !== confirmDel.id));
              setConfirmDel(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

/* ============ FORM ============ */

function ActorForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Actor | null;
  onSave: (a: Actor) => void;
  onCancel: () => void;
}) {
  const [tab, setTab] = useState<"caso" | "socio" | "evidencias" | "seguimiento">(
    "caso",
  );
  const [a, setA] = useState<Actor>(
    initial ?? {
      id: "GPS-" + String(Math.floor(Math.random() * 9000) + 1000),
      proyecto: PROYECTOS[0],
      ambito: "Individual",
      categoria: "No identificado",
      severidad: "No identificado",
      sujeto: "",
      ubicacion: "",
      descripcion: "",
      economica: "",
      educacion: "",
      salud: "",
      enfermedades: "",
      otros: "",
      fechaRegistro: new Date().toISOString().slice(0, 10),
      responsable: "",
      evidencias: [],
      seguimientos: [],
    },
  );

  const set = <K extends keyof Actor>(k: K, v: Actor[K]) =>
    setA((p) => ({ ...p, [k]: v }));

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "caso", label: "Datos del caso" },
    { key: "socio", label: "Condición social" },
    { key: "evidencias", label: `Evidencias (${a.evidencias.length})` },
    { key: "seguimiento", label: `Seguimiento (${a.seguimientos.length})` },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto p-6">
      <div className="bg-white rounded border w-full max-w-4xl my-6">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <div className="text-[13px] font-semibold" style={{ color: RED }}>
            {initial ? "Editar registro social" : "Nuevo registro social"} — {a.id}
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pt-3 border-b">
          <div className="flex gap-1">
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="px-3 py-1.5 text-[12px] font-medium border-b-2"
                  style={{
                    borderColor: active ? RED : "transparent",
                    color: active ? RED : "#6b7280",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-5">
          {tab === "caso" && (
            <>
              <SectionTitle>Ámbito del registro</SectionTitle>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <Field label="Proyecto" required>
                  <select
                    className={selectCls}
                    value={a.proyecto}
                    onChange={(e) => set("proyecto", e.target.value)}
                  >
                    {PROYECTOS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Ámbito de afectación" required>
                  <select
                    className={selectCls}
                    value={a.ambito}
                    onChange={(e) => set("ambito", e.target.value as Actor["ambito"])}
                  >
                    {["Individual", "Familiar", "Grupal", "Comunitario"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Sujeto / Grupo" required>
                  <input
                    className={inputCls}
                    value={a.sujeto}
                    onChange={(e) => set("sujeto", e.target.value)}
                    placeholder="Nombre del sujeto pasivo, familia o comunidad"
                  />
                </Field>
                <Field label="Ubicación / Sector">
                  <input
                    className={inputCls}
                    value={a.ubicacion}
                    onChange={(e) => set("ubicacion", e.target.value)}
                  />
                </Field>
              </div>

              <SectionTitle>Clasificación</SectionTitle>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <Field label="Categoría social">
                  <select
                    className={selectCls}
                    value={a.categoria}
                    onChange={(e) => set("categoria", e.target.value)}
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Nivel de severidad">
                  <select
                    className={selectCls}
                    value={a.severidad}
                    onChange={(e) =>
                      set("severidad", e.target.value as Actor["severidad"])
                    }
                  >
                    {["No identificado", "Baja", "Media", "Alta"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Fecha de registro" required>
                  <input
                    type="date"
                    className={inputCls}
                    value={a.fechaRegistro}
                    onChange={(e) => set("fechaRegistro", e.target.value)}
                  />
                </Field>
                <Field label="Responsable" required>
                  <input
                    className={inputCls}
                    value={a.responsable}
                    onChange={(e) => set("responsable", e.target.value)}
                  />
                </Field>
                <Field label="Descripción del caso" required className="col-span-2">
                  <textarea
                    rows={4}
                    className={textareaCls}
                    value={a.descripcion}
                    onChange={(e) => set("descripcion", e.target.value)}
                    placeholder="Descripción textual del caso y su contexto…"
                  />
                </Field>
              </div>
            </>
          )}

          {tab === "socio" && (
            <>
              <SectionTitle>Condición socioeconómica</SectionTitle>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <Field label="Situación económica" className="col-span-2">
                  <textarea
                    rows={2}
                    className={textareaCls}
                    value={a.economica}
                    onChange={(e) => set("economica", e.target.value)}
                  />
                </Field>
                <Field label="Educación" className="col-span-2">
                  <textarea
                    rows={2}
                    className={textareaCls}
                    value={a.educacion}
                    onChange={(e) => set("educacion", e.target.value)}
                  />
                </Field>
                <Field label="Salud" className="col-span-2">
                  <textarea
                    rows={2}
                    className={textareaCls}
                    value={a.salud}
                    onChange={(e) => set("salud", e.target.value)}
                  />
                </Field>
                <Field label="Enfermedades" className="col-span-2">
                  <textarea
                    rows={2}
                    className={textareaCls}
                    value={a.enfermedades}
                    onChange={(e) => set("enfermedades", e.target.value)}
                    placeholder="Información sensible — acceso restringido"
                  />
                </Field>
                <Field label="Otros aspectos sociales" className="col-span-2">
                  <textarea
                    rows={2}
                    className={textareaCls}
                    value={a.otros}
                    onChange={(e) => set("otros", e.target.value)}
                  />
                </Field>
              </div>
            </>
          )}

          {tab === "evidencias" && (
            <EvidenciasEditor
              value={a.evidencias}
              onChange={(v) => set("evidencias", v)}
            />
          )}

          {tab === "seguimiento" && (
            <SeguimientoEditor
              value={a.seguimientos}
              onChange={(v) => set("seguimientos", v)}
            />
          )}

          <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
            >
              <X size={14} /> Cancelar
            </button>
            <button
              onClick={() => onSave(a)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded"
              style={{ background: RED }}
            >
              <Save size={14} /> Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ EVIDENCIAS ============ */

function EvidenciasEditor({
  value,
  onChange,
}: {
  value: Evidencia[];
  onChange: (v: Evidencia[]) => void;
}) {
  const [e, setE] = useState<Evidencia>({
    id: "",
    tipo: "Foto",
    categoria: "No identificado",
    descripcion: "",
    fecha: new Date().toISOString().slice(0, 10),
    responsable: "",
    nombreArchivo: "",
  });

  const add = () => {
    if (!e.descripcion || !e.nombreArchivo) return;
    onChange([...value, { ...e, id: "E" + (value.length + 1) }]);
    setE({ ...e, descripcion: "", nombreArchivo: "" });
  };

  return (
    <>
      <SectionTitle>Registrar evidencia</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Tipo">
          <select
            className={selectCls}
            value={e.tipo}
            onChange={(ev) => setE({ ...e, tipo: ev.target.value as Evidencia["tipo"] })}
          >
            {["Documento", "Foto", "Imagen"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <Field label="Categoría">
          <select
            className={selectCls}
            value={e.categoria}
            onChange={(ev) => setE({ ...e, categoria: ev.target.value })}
          >
            {CATEGORIAS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Fecha">
          <input
            type="date"
            className={inputCls}
            value={e.fecha}
            onChange={(ev) => setE({ ...e, fecha: ev.target.value })}
          />
        </Field>
        <Field label="Responsable">
          <input
            className={inputCls}
            value={e.responsable}
            onChange={(ev) => setE({ ...e, responsable: ev.target.value })}
          />
        </Field>
        <Field label="Archivo" className="col-span-2">
          <div className="flex gap-2">
            <input
              className={inputCls}
              value={e.nombreArchivo}
              onChange={(ev) => setE({ ...e, nombreArchivo: ev.target.value })}
              placeholder="archivo.pdf / foto.jpg"
            />
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50 shrink-0"
            >
              <Upload size={14} /> Subir
            </button>
          </div>
        </Field>
        <Field label="Descripción" className="col-span-2">
          <textarea
            rows={2}
            className={textareaCls}
            value={e.descripcion}
            onChange={(ev) => setE({ ...e, descripcion: ev.target.value })}
          />
        </Field>
      </div>
      <div className="flex justify-end mt-3">
        <button
          onClick={add}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-white rounded"
          style={{ background: RED }}
        >
          <Plus size={14} /> Agregar evidencia
        </button>
      </div>

      <SectionTitle>Evidencias registradas</SectionTitle>
      <div className="border rounded overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="text-left">
              <th className="px-2 py-1.5">Tipo</th>
              <th className="px-2 py-1.5">Categoría</th>
              <th className="px-2 py-1.5">Archivo</th>
              <th className="px-2 py-1.5">Descripción</th>
              <th className="px-2 py-1.5">Fecha</th>
              <th className="px-2 py-1.5">Responsable</th>
              <th className="px-2 py-1.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {value.map((x, i) => (
              <tr key={x.id} className="border-t">
                <td className="px-2 py-1.5">{x.tipo}</td>
                <td className="px-2 py-1.5">{x.categoria}</td>
                <td className="px-2 py-1.5">
                  <span className="inline-flex items-center gap-1 text-gray-700">
                    <Paperclip size={12} /> {x.nombreArchivo}
                  </span>
                </td>
                <td className="px-2 py-1.5">{x.descripcion}</td>
                <td className="px-2 py-1.5">{x.fecha}</td>
                <td className="px-2 py-1.5">{x.responsable}</td>
                <td className="px-2 py-1.5 text-right">
                  <button
                    onClick={() => onChange(value.filter((_, j) => j !== i))}
                    className="p-1 rounded hover:bg-gray-100 text-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {value.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-2 py-4 text-center text-gray-400 text-[12px]"
                >
                  Sin evidencias registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ============ SEGUIMIENTO ============ */

function SeguimientoEditor({
  value,
  onChange,
}: {
  value: Seguimiento[];
  onChange: (v: Seguimiento[]) => void;
}) {
  const [s, setS] = useState<Seguimiento>({
    id: "",
    fecha: new Date().toISOString().slice(0, 10),
    responsable: "",
    estado: "Permanece",
    observacion: "",
  });

  const add = () => {
    if (!s.observacion) return;
    onChange([...value, { ...s, id: "S" + (value.length + 1) }]);
    setS({ ...s, observacion: "" });
  };

  return (
    <>
      <SectionTitle>Nuevo seguimiento</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Fecha">
          <input
            type="date"
            className={inputCls}
            value={s.fecha}
            onChange={(e) => setS({ ...s, fecha: e.target.value })}
          />
        </Field>
        <Field label="Responsable">
          <input
            className={inputCls}
            value={s.responsable}
            onChange={(e) => setS({ ...s, responsable: e.target.value })}
          />
        </Field>
        <Field label="Estado del caso">
          <select
            className={selectCls}
            value={s.estado}
            onChange={(e) => setS({ ...s, estado: e.target.value as Seguimiento["estado"] })}
          >
            {["Permanece", "Cambia", "Se agrava", "Resuelto"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <Field label="Observación" className="col-span-2">
          <textarea
            rows={2}
            className={textareaCls}
            value={s.observacion}
            onChange={(e) => setS({ ...s, observacion: e.target.value })}
          />
        </Field>
      </div>
      <div className="flex justify-end mt-3">
        <button
          onClick={add}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-white rounded"
          style={{ background: RED }}
        >
          <Plus size={14} /> Agregar seguimiento
        </button>
      </div>

      <SectionTitle>Historial</SectionTitle>
      <div className="border rounded overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="text-left">
              <th className="px-2 py-1.5">Fecha</th>
              <th className="px-2 py-1.5">Responsable</th>
              <th className="px-2 py-1.5">Estado</th>
              <th className="px-2 py-1.5">Observación</th>
              <th className="px-2 py-1.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {value.map((x, i) => (
              <tr key={x.id} className="border-t">
                <td className="px-2 py-1.5">{x.fecha}</td>
                <td className="px-2 py-1.5">{x.responsable}</td>
                <td className="px-2 py-1.5">{x.estado}</td>
                <td className="px-2 py-1.5">{x.observacion}</td>
                <td className="px-2 py-1.5 text-right">
                  <button
                    onClick={() => onChange(value.filter((_, j) => j !== i))}
                    className="p-1 rounded hover:bg-gray-100 text-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {value.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-2 py-4 text-center text-gray-400 text-[12px]"
                >
                  Sin seguimientos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ============ DETAIL ============ */

function DetailModal({ actor, onClose }: { actor: Actor; onClose: () => void }) {
  const exportCsv = () => {
    const rows = [
      ["Campo", "Valor"],
      ["Código", actor.id],
      ["Proyecto", actor.proyecto],
      ["Ámbito", actor.ambito],
      ["Categoría", actor.categoria],
      ["Severidad", actor.severidad],
      ["Sujeto", actor.sujeto],
      ["Ubicación", actor.ubicacion],
      ["Descripción", actor.descripcion],
      ["Económica", actor.economica],
      ["Educación", actor.educacion],
      ["Salud", actor.salud],
      ["Enfermedades", actor.enfermedades],
      ["Otros", actor.otros],
      ["Fecha", actor.fechaRegistro],
      ["Responsable", actor.responsable],
    ];
    const csv = rows.map((r) => r.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${actor.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto p-6">
      <div className="bg-white rounded border w-full max-w-3xl my-6">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <div className="text-[13px] font-semibold" style={{ color: RED }}>
            Detalle — {actor.id} · {actor.sujeto}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-5 text-[12px] space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <Info k="Proyecto" v={actor.proyecto} />
            <Info k="Ámbito" v={actor.ambito} />
            <Info k="Categoría" v={actor.categoria} />
            <Info k="Severidad" v={actor.severidad} />
            <Info k="Ubicación" v={actor.ubicacion} />
            <Info k="Fecha registro" v={actor.fechaRegistro} />
            <Info k="Responsable" v={actor.responsable} />
          </div>
          <div>
            <div className="font-semibold mb-1" style={{ color: RED }}>
              Descripción
            </div>
            <div className="text-gray-700 whitespace-pre-wrap">{actor.descripcion || "—"}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Block title="Económica" text={actor.economica} />
            <Block title="Educación" text={actor.educacion} />
            <Block title="Salud" text={actor.salud} />
            <Block title="Enfermedades" text={actor.enfermedades} />
            <Block title="Otros" text={actor.otros} />
          </div>
          <div>
            <div className="font-semibold mb-1" style={{ color: RED }}>
              Evidencias ({actor.evidencias.length})
            </div>
            <ul className="list-disc pl-5 text-gray-700">
              {actor.evidencias.map((e) => (
                <li key={e.id}>
                  [{e.tipo}] {e.nombreArchivo} — {e.descripcion} ({e.fecha})
                </li>
              ))}
              {actor.evidencias.length === 0 && <li className="list-none text-gray-400">Sin evidencias.</li>}
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-1" style={{ color: RED }}>
              Seguimientos ({actor.seguimientos.length})
            </div>
            <ul className="list-disc pl-5 text-gray-700">
              {actor.seguimientos.map((s) => (
                <li key={s.id}>
                  {s.fecha} — {s.estado}: {s.observacion} ({s.responsable})
                </li>
              ))}
              {actor.seguimientos.length === 0 && <li className="list-none text-gray-400">Sin seguimientos.</li>}
            </ul>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t">
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
          >
            <Download size={14} /> Exportar CSV
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded"
            style={{ background: RED }}
          >
            <X size={14} /> Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500">{k}:</span>
      <span className="text-gray-800">{v || "—"}</span>
    </div>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div className="border rounded p-2 bg-gray-50">
      <div className="text-[11px] font-semibold text-gray-600 mb-1">{title}</div>
      <div className="text-gray-700 whitespace-pre-wrap text-[12px]">{text || "—"}</div>
    </div>
  );
}

/* ============ CONFIRM ============ */

function ConfirmModal({
  title,
  message,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded border w-full max-w-md p-5">
        <div className="font-semibold text-[14px]" style={{ color: RED }}>
          {title}
        </div>
        <div className="text-[12px] text-gray-600 mt-2">{message}</div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
          >
            <X size={14} /> Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded"
            style={{ background: RED }}
          >
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ HELPERS ============ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b pb-1 mb-3 mt-4 first:mt-0">
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
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-[180px_1fr] items-center gap-2 ${className}`}>
      <label className="text-[12px] text-right text-gray-700">
        {required && <span style={{ color: RED }}>* </span>}
        {label}
      </label>
      {children}
    </div>
  );
}
