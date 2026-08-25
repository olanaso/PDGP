import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProjectPageHeader } from "../components/ProjectPageHeader";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  X,
  FileText,
  Download,
  ClipboardList,
  Send,
  Save,
  Upload,
  Paperclip,
} from "lucide-react";

export const Route = createFileRoute("/proyectos/$projectId/requerimientos")({
  head: () => ({
    meta: [
      { title: "Requerimientos de Información — MTC Prototipos" },
      { name: "description", content: "Listado y gestión de requerimientos de información institucional del proyecto." },
    ],
  }),
  component: RequerimientosPage,
});

type Prioridad = "Alta" | "Media" | "Baja";
type Estado = "Borrador" | "Enviado" | "Atendido" | "Fuera de plazo";

type Documento = {
  id: string;
  nombre: string;
  tipo: string;
  tamano: string;
};

type Requerimiento = {
  id: string;
  numero: string;
  proyecto: string;
  codigoProyecto: string;
  area: string;
  entidad: string;
  tipoInformacion: string;
  asunto: string;
  fundamento: string;
  especifica: string[];
  fechaElaboracion: string;
  prioridad: Prioridad;
  plazoDias: number;
  fechaLimite: string;
  responsable: string;
  cargo: string;
  areaResp: string;
  telefono: string;
  correo: string;
  observaciones: string;
  estado: Estado;
  documentos: Documento[];
};

const ENTIDADES = [
  "Municipalidad Distrital de Baños del Inca",
  "SUNARP",
  "COFOPRI",
  "MIDAGRI",
  "Municipalidad Provincial de Cajamarca",
];
const TIPOS_INFO = [
  "Información Catastral",
  "Información Registral",
  "Información Predial",
  "Información Urbana",
  "Otros",
];
const ESPECIFICAS = [
  "Plano catastral",
  "Relación de contribuyentes",
  "Licencias",
  "Constancias de posesión",
  "Habilitaciones urbanas",
  "Otros",
];
const AREAS = ["Tramo 1 – Sector A", "Tramo 1 – Sector B", "Tramo 2 – Sector A", "Bloque Único"];
const RESPONSABLES = ["María López", "Ing. Pedro Ramírez", "Abog. Juan Delgado", "Ing. Diana Flores"];

const SEED: Requerimiento[] = [
  {
    id: "r1",
    numero: "REQ-2026-00049",
    proyecto: "Aeropuerto de Cajamarca",
    codigoProyecto: "PROY-2026-ACAJ",
    area: "Tramo 1 – Sector A",
    entidad: "Municipalidad Distrital de Baños del Inca",
    tipoInformacion: "Información Catastral",
    asunto: "Solicitud de información catastral del área de influencia del proyecto.",
    fundamento:
      "La información solicitada es necesaria para el diagnóstico técnico legal, identificación predial y elaboración de los planos de afectación del proyecto.",
    especifica: ["Plano catastral", "Relación de contribuyentes", "Licencias"],
    fechaElaboracion: "2026-05-28",
    prioridad: "Alta",
    plazoDias: 10,
    fechaLimite: "2026-06-07",
    responsable: "María López",
    cargo: "Coordinador Predial",
    areaResp: "Área Legal",
    telefono: "987 654 321",
    correo: "mlopez@proyecto.gob.pe",
    observaciones: "",
    estado: "Enviado",
    documentos: [
      { id: "d1", nombre: "Plano de ubicación - Área de influencia.pdf", tipo: "Plano", tamano: "2.35 MB" },
      { id: "d2", nombre: "Memoria descriptiva del proyecto.pdf", tipo: "Memoria", tamano: "1.82 MB" },
      { id: "d3", nombre: "Cuadro de coordenadas - Tramo 1.xlsx", tipo: "Cuadro de Coordenadas", tamano: "856 KB" },
    ],
  },
  {
    id: "r2",
    numero: "REQ-2026-00050",
    proyecto: "Aeropuerto de Cajamarca",
    codigoProyecto: "PROY-2026-ACAJ",
    area: "Tramo 1 – Sector B",
    entidad: "SUNARP",
    tipoInformacion: "Información Registral",
    asunto: "Solicitud de partidas registrales del ámbito del proyecto.",
    fundamento: "Necesario para el saneamiento físico legal.",
    especifica: ["Otros"],
    fechaElaboracion: "2026-05-20",
    prioridad: "Media",
    plazoDias: 15,
    fechaLimite: "2026-06-04",
    responsable: "Abog. Juan Delgado",
    cargo: "Responsable Legal",
    areaResp: "Área Legal",
    telefono: "987 111 222",
    correo: "jdelgado@proyecto.gob.pe",
    observaciones: "",
    estado: "Atendido",
    documentos: [],
  },
];

const PROYECTO_NOMBRE = "Aeropuerto de Cajamarca";
const PROYECTO_CODIGO = "PROY-2026-ACAJ";

function nextNumero(items: Requerimiento[]) {
  const max = items.reduce((m, r) => {
    const n = parseInt(r.numero.split("-").pop() || "0", 10);
    return Math.max(m, isNaN(n) ? 0 : n);
  }, 0);
  return `REQ-2026-${String(max + 1).padStart(5, "0")}`;
}

function addDays(date: string, days: number) {
  if (!date) return "";
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function emptyForm(items: Requerimiento[]): Requerimiento {
  const fecha = new Date().toISOString().slice(0, 10);
  return {
    id: "",
    numero: nextNumero(items),
    proyecto: PROYECTO_NOMBRE,
    codigoProyecto: PROYECTO_CODIGO,
    area: AREAS[0],
    entidad: ENTIDADES[0],
    tipoInformacion: TIPOS_INFO[0],
    asunto: "",
    fundamento: "",
    especifica: [],
    fechaElaboracion: fecha,
    prioridad: "Media",
    plazoDias: 10,
    fechaLimite: addDays(fecha, 10),
    responsable: RESPONSABLES[0],
    cargo: "",
    areaResp: "",
    telefono: "",
    correo: "",
    observaciones: "",
    estado: "Borrador",
    documentos: [],
  };
}

function RequerimientosPage() {
  const [items, setItems] = useState<Requerimiento[]>(SEED);
  const [mode, setMode] = useState<"list" | "form" | "view">("list");
  const [current, setCurrent] = useState<Requerimiento | null>(null);
  const [search, setSearch] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fEntidad, setFEntidad] = useState("");

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (search && !`${r.numero} ${r.asunto} ${r.entidad}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (fEstado && r.estado !== fEstado) return false;
      if (fEntidad && r.entidad !== fEntidad) return false;
      return true;
    });
  }, [items, search, fEstado, fEntidad]);

  const openNew = () => {
    setCurrent(emptyForm(items));
    setMode("form");
  };
  const openEdit = (r: Requerimiento) => {
    setCurrent({ ...r, especifica: [...r.especifica], documentos: [...r.documentos] });
    setMode("form");
  };
  const openView = (r: Requerimiento) => {
    setCurrent(r);
    setMode("view");
  };
  const remove = (id: string) => {
    if (confirm("¿Eliminar este requerimiento?")) setItems((s) => s.filter((r) => r.id !== id));
  };

  const save = (estado: Estado) => {
    if (!current) return;
    const toSave = { ...current, estado };
    if (toSave.id) {
      setItems((s) => s.map((r) => (r.id === toSave.id ? toSave : r)));
    } else {
      toSave.id = `r${Date.now()}`;
      setItems((s) => [toSave, ...s]);
    }
    setMode("list");
    setCurrent(null);
  };

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937] text-sm">
      <main className="flex-1 flex flex-col overflow-hidden">
        <ProjectPageHeader
          projectId="caballococha"
          projectLabel={PROYECTO_NOMBRE}
          title="Requerimientos de Información"
          badgeLabel="PROYECTO"
          badgeValue={PROYECTO_NOMBRE}
          badgeSuffix="REQUERIMIENTOS"
        />


        <div className="flex-1 overflow-auto p-6">
          {mode === "list" && (
            <ListView
              items={filtered}
              total={items.length}
              search={search}
              setSearch={setSearch}
              fEstado={fEstado}
              setFEstado={setFEstado}
              fEntidad={fEntidad}
              setFEntidad={setFEntidad}
              onNew={openNew}
              onEdit={openEdit}
              onView={openView}
              onDelete={remove}
            />
          )}
          {mode === "form" && current && (
            <FormView
              data={current}
              setData={(d) => setCurrent(d)}
              onCancel={() => {
                setMode("list");
                setCurrent(null);
              }}
              onSaveDraft={() => save("Borrador")}
              onRegister={() => save("Enviado")}
            />
          )}
          {mode === "view" && current && (
            <ViewDetail data={current} onBack={() => setMode("list")} onEdit={() => setMode("form")} />
          )}
        </div>
      </main>
    </div>
  );
}

function ListView(props: {
  items: Requerimiento[];
  total: number;
  search: string;
  setSearch: (s: string) => void;
  fEstado: string;
  setFEstado: (s: string) => void;
  fEntidad: string;
  setFEntidad: (s: string) => void;
  onNew: () => void;
  onEdit: (r: Requerimiento) => void;
  onView: (r: Requerimiento) => void;
  onDelete: (id: string) => void;
}) {
  const estadoBadge = (e: Estado) => {
    const map: Record<Estado, string> = {
      Borrador: "bg-gray-100 text-gray-700",
      Enviado: "bg-blue-100 text-blue-700",
      Atendido: "bg-emerald-100 text-emerald-700",
      "Fuera de plazo": "bg-red-100 text-red-700",
    };
    return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${map[e]}`}>{e}</span>;
  };
  const prioBadge = (p: Prioridad) => {
    const map: Record<Prioridad, string> = {
      Alta: "bg-red-100 text-red-700",
      Media: "bg-amber-100 text-amber-700",
      Baja: "bg-emerald-100 text-emerald-700",
    };
    return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${map[p]}`}>{p}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <section className="bg-white rounded-lg border border-[#e5e7eb] p-4">
        <div className="flex items-center gap-2 text-[#dc2626] font-semibold text-[13px] mb-3">
          <Search size={14} /> Filtros de Búsqueda
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[12px]">
          <div>
            <label className="block text-[#374151] mb-1">N° Requerimiento / Asunto</label>
            <input
              value={props.search}
              onChange={(e) => props.setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full px-2 py-1.5 border border-[#d1d5db] rounded focus:outline-none focus:border-[#dc2626]"
            />
          </div>
          <div>
            <label className="block text-[#374151] mb-1">Entidad</label>
            <select
              value={props.fEntidad}
              onChange={(e) => props.setFEntidad(e.target.value)}
              className="w-full px-2 py-1.5 border border-[#d1d5db] rounded focus:outline-none focus:border-[#dc2626]"
            >
              <option value="">-- Todas --</option>
              {ENTIDADES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#374151] mb-1">Estado</label>
            <select
              value={props.fEstado}
              onChange={(e) => props.setFEstado(e.target.value)}
              className="w-full px-2 py-1.5 border border-[#d1d5db] rounded focus:outline-none focus:border-[#dc2626]"
            >
              <option value="">-- Todos --</option>
              {["Borrador", "Enviado", "Atendido", "Fuera de plazo"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="bg-white rounded-lg border border-[#e5e7eb]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb]">
          <div className="text-[#dc2626] font-semibold text-[13px]">
            Resultados ({props.items.length} de {props.total})
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 border border-[#d1d5db] rounded text-[12px] hover:bg-[#f9fafb]">
              <Download size={12} /> Descargar Excel
            </button>
            <button
              onClick={props.onNew}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#dc2626] text-white rounded text-[12px] hover:bg-[#b91c1c]"
            >
              <Plus size={12} /> Agregar Requerimiento
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-[#f3f4f6] text-[#374151]">
              <tr>
                {["N°", "N° Requerimiento", "Entidad", "Tipo Información", "Asunto", "Fecha Elab.", "Plazo (días)", "Fecha Límite", "Prioridad", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="px-2 py-2 text-left font-semibold border-b border-[#e5e7eb] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.items.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-6 text-center text-[#6b7280]">
                    Sin resultados.
                  </td>
                </tr>
              )}
              {props.items.map((r, i) => (
                <tr key={r.id} className="hover:bg-[#f9fafb]">
                  <td className="px-2 py-2 border-b border-[#e5e7eb]">{i + 1}</td>
                  <td className="px-2 py-2 border-b border-[#e5e7eb] font-mono text-[#dc2626]">{r.numero}</td>
                  <td className="px-2 py-2 border-b border-[#e5e7eb]">{r.entidad}</td>
                  <td className="px-2 py-2 border-b border-[#e5e7eb]">{r.tipoInformacion}</td>
                  <td className="px-2 py-2 border-b border-[#e5e7eb] max-w-[260px] truncate" title={r.asunto}>
                    {r.asunto}
                  </td>
                  <td className="px-2 py-2 border-b border-[#e5e7eb]">{r.fechaElaboracion}</td>
                  <td className="px-2 py-2 border-b border-[#e5e7eb] text-center">{r.plazoDias}</td>
                  <td className="px-2 py-2 border-b border-[#e5e7eb]">{r.fechaLimite}</td>
                  <td className="px-2 py-2 border-b border-[#e5e7eb]">{prioBadge(r.prioridad)}</td>
                  <td className="px-2 py-2 border-b border-[#e5e7eb]">{estadoBadge(r.estado)}</td>
                  <td className="px-2 py-2 border-b border-[#e5e7eb]">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => props.onView(r)}
                        className="p-1.5 rounded border border-[#e5e7eb] hover:bg-[#f3f4f6]"
                        title="Ver"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => props.onEdit(r)}
                        className="p-1.5 rounded border border-[#e5e7eb] hover:bg-[#fef2f2] text-[#dc2626]"
                        title="Editar"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => props.onDelete(r.id)}
                        className="p-1.5 rounded border border-[#e5e7eb] hover:bg-[#fee2e2] text-[#dc2626]"
                        title="Eliminar"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function FormView(props: {
  data: Requerimiento;
  setData: (d: Requerimiento) => void;
  onCancel: () => void;
  onSaveDraft: () => void;
  onRegister: () => void;
}) {
  const { data, setData } = props;
  const update = <K extends keyof Requerimiento>(k: K, v: Requerimiento[K]) => setData({ ...data, [k]: v });

  const toggleEsp = (e: string) => {
    const next = data.especifica.includes(e) ? data.especifica.filter((x) => x !== e) : [...data.especifica, e];
    update("especifica", next);
  };

  const onAddDoc = () => {
    const nombre = prompt("Nombre del documento (ej: plano.pdf):");
    if (!nombre) return;
    const tipo = prompt("Tipo (Plano, Memoria, Cuadro de Coordenadas, Otro):") || "Otro";
    const doc: Documento = {
      id: `d${Date.now()}`,
      nombre,
      tipo,
      tamano: `${(Math.random() * 3 + 0.2).toFixed(2)} MB`,
    };
    update("documentos", [...data.documentos, doc]);
  };
  const removeDoc = (id: string) => update("documentos", data.documentos.filter((d) => d.id !== id));

  const recalcLimite = (fecha: string, dias: number) => {
    setData({ ...data, fechaElaboracion: fecha, plazoDias: dias, fechaLimite: addDays(fecha, dias) });
  };

  return (
    <div className="space-y-4">
      {/* Top header bar */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-md bg-[#fee2e2] text-[#dc2626] flex items-center justify-center">
            <ClipboardList size={18} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#dc2626]">
              {data.id ? "Editar" : "Registro del"} Requerimiento de Información
            </h2>
            <p className="text-[12px] text-[#6b7280]">
              Complete la información para registrar la solicitud de información institucional requerida para el proyecto.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={props.onCancel}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#d1d5db] rounded text-[12px] hover:bg-[#f9fafb]"
          >
            <ArrowLeft size={14} /> Volver al Listado
          </button>
          <button
            onClick={props.onSaveDraft}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#dc2626] text-white rounded text-[12px] hover:bg-[#b91c1c]"
          >
            <Save size={14} /> Guardar Borrador
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Datos Generales */}
        <section className="bg-white border border-[#e5e7eb] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="size-6 rounded-full bg-[#dc2626] text-white text-[12px] font-bold flex items-center justify-center">1</span>
            <h3 className="font-semibold text-[#dc2626] border-b-2 border-[#dc2626] pb-1 flex-1">
              Datos Generales del Requerimiento
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-[12px]">
            <Field label="Proyecto *">
              <input
                value={data.proyecto}
                onChange={(e) => update("proyecto", e.target.value)}
                className={inputCls}
                readOnly
              />
            </Field>
            <Field label="Código del Proyecto">
              <input value={data.codigoProyecto} readOnly className={inputCls + " bg-[#f9fafb]"} />
            </Field>
            <Field label="N° Requerimiento (automático)">
              <input value={data.numero} readOnly className={inputCls + " bg-[#f9fafb]"} />
            </Field>

            <Field label="Área / Tramo / Sector / Bloque *">
              <select value={data.area} onChange={(e) => update("area", e.target.value)} className={inputCls}>
                {AREAS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Entidad Destinataria *">
              <select value={data.entidad} onChange={(e) => update("entidad", e.target.value)} className={inputCls}>
                {ENTIDADES.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Tipo de Información Solicitada *">
              <select
                value={data.tipoInformacion}
                onChange={(e) => update("tipoInformacion", e.target.value)}
                className={inputCls}
              >
                {TIPOS_INFO.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>

            <Field label="Asunto / Referencia *" full>
              <input
                value={data.asunto}
                onChange={(e) => update("asunto", e.target.value)}
                className={inputCls}
                placeholder="Ingrese el asunto"
              />
            </Field>

            <Field label="Fecha de Elaboración *">
              <input
                type="date"
                value={data.fechaElaboracion}
                onChange={(e) => recalcLimite(e.target.value, data.plazoDias)}
                className={inputCls}
              />
            </Field>
            <Field label="Prioridad *">
              <select
                value={data.prioridad}
                onChange={(e) => update("prioridad", e.target.value as Prioridad)}
                className={inputCls}
              >
                {["Alta", "Media", "Baja"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Plazo Legal (días)">
              <input
                type="number"
                value={data.plazoDias}
                onChange={(e) => recalcLimite(data.fechaElaboracion, Number(e.target.value) || 0)}
                className={inputCls}
              />
            </Field>
            <Field label="Fecha Límite Referencial" full>
              <input value={data.fechaLimite} readOnly className={inputCls + " bg-[#f9fafb]"} />
            </Field>
          </div>
        </section>

        {/* 2. Sustento */}
        <section className="bg-white border border-[#e5e7eb] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="size-6 rounded-full bg-[#dc2626] text-white text-[12px] font-bold flex items-center justify-center">2</span>
            <h3 className="font-semibold text-[#dc2626] border-b-2 border-[#dc2626] pb-1 flex-1">
              Sustento del Requerimiento
            </h3>
          </div>
          <div className="space-y-3 text-[12px]">
            <Field label="Fundamento / Justificación *" full>
              <textarea
                value={data.fundamento}
                onChange={(e) => update("fundamento", e.target.value)}
                rows={4}
                className={inputCls}
              />
            </Field>
            <Field label="Información Específica Requerida *" full>
              <div className="border border-[#d1d5db] rounded p-2 min-h-[80px] flex flex-wrap gap-1.5">
                {data.especifica.map((e) => (
                  <span
                    key={e}
                    className="inline-flex items-center gap-1 bg-[#fee2e2] text-[#b91c1c] text-[11px] px-2 py-1 rounded"
                  >
                    {e}
                    <button onClick={() => toggleEsp(e)} className="hover:text-[#7f1d1d]">
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <select
                  value=""
                  onChange={(e) => e.target.value && toggleEsp(e.target.value)}
                  className="ml-auto text-[11px] border border-[#d1d5db] rounded px-1 py-0.5"
                >
                  <option value="">+ Agregar</option>
                  {ESPECIFICAS.filter((x) => !data.especifica.includes(x)).map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
            </Field>
          </div>
        </section>

        {/* 3. Responsable */}
        <section className="bg-white border border-[#e5e7eb] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="size-6 rounded-full bg-[#dc2626] text-white text-[12px] font-bold flex items-center justify-center">3</span>
            <h3 className="font-semibold text-[#dc2626] border-b-2 border-[#dc2626] pb-1 flex-1">
              Responsable del Requerimiento
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <Field label="Responsable Técnico / Legal *">
              <select
                value={data.responsable}
                onChange={(e) => update("responsable", e.target.value)}
                className={inputCls}
              >
                {RESPONSABLES.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Cargo">
              <input value={data.cargo} onChange={(e) => update("cargo", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Área">
              <input value={data.areaResp} onChange={(e) => update("areaResp", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Teléfono / Anexo">
              <input value={data.telefono} onChange={(e) => update("telefono", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Correo Electrónico" full>
              <input
                type="email"
                value={data.correo}
                onChange={(e) => update("correo", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </section>

        {/* 4. Documentos */}
        <section className="bg-white border border-[#e5e7eb] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="size-6 rounded-full bg-[#dc2626] text-white text-[12px] font-bold flex items-center justify-center">4</span>
            <h3 className="font-semibold text-[#dc2626] border-b-2 border-[#dc2626] pb-1 flex-1">
              Documentos de Sustento (Anexos)
            </h3>
          </div>
          <div className="flex gap-2 mb-3">
            <button
              onClick={onAddDoc}
              className="flex items-center gap-1 px-3 py-1.5 border-2 border-dashed border-[#dc2626] text-[#dc2626] rounded text-[12px] hover:bg-[#fee2e2]"
            >
              <Plus size={12} /> Agregar Documento
            </button>
            <button
              onClick={onAddDoc}
              className="flex items-center gap-1 px-3 py-1.5 border border-[#d1d5db] rounded text-[12px] hover:bg-[#f9fafb]"
            >
              <Upload size={12} /> Cargar desde PC
            </button>
          </div>
          <table className="w-full text-[11px]">
            <thead className="bg-[#f3f4f6] text-[#374151]">
              <tr>
                <th className="px-2 py-1.5 text-left">#</th>
                <th className="px-2 py-1.5 text-left">Nombre del Documento</th>
                <th className="px-2 py-1.5 text-left">Tipo</th>
                <th className="px-2 py-1.5 text-left">Tamaño</th>
                <th className="px-2 py-1.5 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.documentos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-2 py-3 text-center text-[#6b7280]">
                    Sin documentos adjuntos.
                  </td>
                </tr>
              )}
              {data.documentos.map((d, i) => (
                <tr key={d.id} className="border-b border-[#e5e7eb]">
                  <td className="px-2 py-1.5">{i + 1}</td>
                  <td className="px-2 py-1.5 flex items-center gap-1">
                    <Paperclip size={11} className="text-[#dc2626]" />
                    {d.nombre}
                  </td>
                  <td className="px-2 py-1.5">{d.tipo}</td>
                  <td className="px-2 py-1.5">{d.tamano}</td>
                  <td className="px-2 py-1.5">
                    <button
                      onClick={() => removeDoc(d.id)}
                      className="p-1 text-[#dc2626] hover:bg-[#fee2e2] rounded"
                    >
                      <Trash2 size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-[11px] text-[#6b7280] flex gap-4">
            <span>Total de documentos: {data.documentos.length}</span>
          </div>
        </section>

        {/* 5. Observaciones */}
        <section className="bg-white border border-[#e5e7eb] rounded-lg p-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="size-6 rounded-full bg-[#dc2626] text-white text-[12px] font-bold flex items-center justify-center">5</span>
            <h3 className="font-semibold text-[#dc2626] border-b-2 border-[#dc2626] pb-1 flex-1">
              Observaciones (Opcional)
            </h3>
          </div>
          <textarea
            value={data.observaciones}
            onChange={(e) => update("observaciones", e.target.value)}
            rows={3}
            placeholder="Ingrese observaciones adicionales..."
            className={inputCls}
          />
        </section>
      </div>

      {/* Footer actions */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 flex justify-end gap-2">
        <button
          onClick={props.onCancel}
          className="flex items-center gap-1.5 px-4 py-2 border border-[#d1d5db] rounded text-[13px] hover:bg-[#f9fafb]"
        >
          <X size={14} /> Cancelar
        </button>
        <button
          onClick={props.onSaveDraft}
          className="flex items-center gap-1.5 px-4 py-2 border border-[#d1d5db] rounded text-[13px] hover:bg-[#f9fafb]"
        >
          <Save size={14} /> Guardar Borrador
        </button>
        <button
          onClick={props.onRegister}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#dc2626] text-white rounded text-[13px] hover:bg-[#b91c1c]"
        >
          <Send size={14} /> Registrar Requerimiento
        </button>
      </div>
    </div>
  );
}

function ViewDetail({ data, onBack, onEdit }: { data: Requerimiento; onBack: () => void; onEdit: () => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#dc2626]">{data.numero}</h2>
          <p className="text-[12px] text-[#6b7280]">{data.asunto}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-2 border border-[#d1d5db] rounded text-[12px] hover:bg-[#f9fafb]">
            <ArrowLeft size={14} /> Volver
          </button>
          <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-2 bg-[#dc2626] text-white rounded text-[12px] hover:bg-[#b91c1c]">
            <Pencil size={14} /> Editar
          </button>
        </div>
      </div>
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
        <Info label="Proyecto" value={data.proyecto} />
        <Info label="Código" value={data.codigoProyecto} />
        <Info label="Área" value={data.area} />
        <Info label="Entidad" value={data.entidad} />
        <Info label="Tipo Información" value={data.tipoInformacion} />
        <Info label="Prioridad" value={data.prioridad} />
        <Info label="Fecha Elaboración" value={data.fechaElaboracion} />
        <Info label="Plazo (días)" value={String(data.plazoDias)} />
        <Info label="Fecha Límite" value={data.fechaLimite} />
        <Info label="Estado" value={data.estado} />
        <Info label="Responsable" value={`${data.responsable} — ${data.cargo}`} />
        <Info label="Contacto" value={`${data.correo} · ${data.telefono}`} />
        <div className="md:col-span-2">
          <div className="text-[#6b7280] text-[11px] uppercase">Fundamento</div>
          <div>{data.fundamento}</div>
        </div>
        <div className="md:col-span-2">
          <div className="text-[#6b7280] text-[11px] uppercase mb-1">Información Específica</div>
          <div className="flex flex-wrap gap-1.5">
            {data.especifica.map((e) => (
              <span key={e} className="bg-[#fee2e2] text-[#b91c1c] text-[11px] px-2 py-1 rounded">
                {e}
              </span>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="text-[#6b7280] text-[11px] uppercase mb-1">Documentos ({data.documentos.length})</div>
          <ul className="space-y-1">
            {data.documentos.map((d) => (
              <li key={d.id} className="flex items-center gap-2 text-[12px]">
                <FileText size={12} className="text-[#dc2626]" /> {d.nombre}
                <span className="text-[#6b7280]">· {d.tipo} · {d.tamano}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[#6b7280] text-[11px] uppercase">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

const inputCls =
  "w-full px-2 py-1.5 border border-[#d1d5db] rounded focus:outline-none focus:border-[#dc2626] text-[12px]";

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-full" : ""}>
      <label className="block text-[#374151] mb-1 text-[11px] font-medium">{label}</label>
      {children}
    </div>
  );
}