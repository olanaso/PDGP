import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProjectPageHeader } from "../components/ProjectPageHeader";
import { getProjectInfo, CURRENT_USER, PROFESIONALES, COORDINACIONES, seguimientoMock } from "../lib/projectContext";
import { HistorialTimeline } from "./proyectos.$projectId.codigos-planos";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  FileDown,
  Printer,
  X,
  Save,
  LogOut,
  ChevronDown,
  MapPin,
  History,
  Copy,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/proyectos/$projectId/codigos-predios")({
  head: () => ({
    meta: [
      { title: "Códigos de Predios — MTC" },
      { name: "description", content: "Listado de códigos de predios generados." },
    ],
  }),
  component: CodigosPrediosPage,
});

type Estado = "USADO" | "ASIGNADO" | "ANULADO" | "DISPONIBLE";

type Predio = {
  id: number;
  codigo: string;
  departamento: string;
  proyecto: string;
  tipoPredio: "PREDIO RURAL" | "PREDIO URBANO";
  fecha: string;
  estado: Estado;
};

const initialPredios: Predio[] = [
  { id: 1, codigo: "VIAL-IIRSST5-T05-210101-PR-01042", departamento: "PUNO", proyecto: "PACRI - IIRSA SUR TRAMO 5", tipoPredio: "PREDIO RURAL", fecha: "2026-06-23 05:46:36", estado: "USADO" },
  { id: 2, codigo: "VIAL-IIRSST5-T05-210101-PR-01041", departamento: "PUNO", proyecto: "PACRI - IIRSA SUR TRAMO 5", tipoPredio: "PREDIO RURAL", fecha: "2026-06-23 05:41:57", estado: "ASIGNADO" },
  { id: 3, codigo: "AERO-PUCALLPA-PU-0611", departamento: "UCAYALI", proyecto: "AEROPUERTO DE PUCALLPA", tipoPredio: "PREDIO URBANO", fecha: "2026-06-22 10:11:57", estado: "USADO" },
  { id: 4, codigo: "AERO-PUCALLPA-PU-0610", departamento: "UCAYALI", proyecto: "AEROPUERTO DE PUCALLPA", tipoPredio: "PREDIO URBANO", fecha: "2026-06-22 10:11:05", estado: "ANULADO" },
  { id: 5, codigo: "VIAL-RV4-T02EVV-131201-PU-02201", departamento: "LA LIBERTAD", proyecto: "PACRI - RED VIAL 4", tipoPredio: "PREDIO URBANO", fecha: "2026-06-22 08:48:14", estado: "ASIGNADO" },
  { id: 6, codigo: "VIAL-RV4-T02EVV-131201-PU-02200", departamento: "LA LIBERTAD", proyecto: "PACRI - RED VIAL 4", tipoPredio: "PREDIO URBANO", fecha: "2026-06-22 08:48:13", estado: "USADO" },
  { id: 7, codigo: "AERO-PUCALLPA-PU-0609", departamento: "UCAYALI", proyecto: "AEROPUERTO DE PUCALLPA", tipoPredio: "PREDIO URBANO", fecha: "2026-06-22 08:47:14", estado: "DISPONIBLE" },
  { id: 8, codigo: "VIAL-IIRSST4-T04-210204-PR-04205", departamento: "PUNO", proyecto: "PACRI - IIRSA SUR TRAMO 4", tipoPredio: "PREDIO RURAL", fecha: "2026-06-18 03:22:14", estado: "USADO" },
  { id: 9, codigo: "VIAL-IIRSST4-T04-210204-PR-04204", departamento: "PUNO", proyecto: "PACRI - IIRSA SUR TRAMO 4", tipoPredio: "PREDIO RURAL", fecha: "2026-06-18 03:22:12", estado: "ANULADO" },
  { id: 10, codigo: "VIAL-LST4-ST05-090702-PR-05288", departamento: "HUANCAVELICA", proyecto: "LONGITUDINAL DE LA SIERRA TRAMO 04", tipoPredio: "PREDIO RURAL", fecha: "2026-06-17 03:51:56", estado: "DISPONIBLE" },
];

const estadoStyle: Record<Estado, string> = {
  USADO: "bg-[#dcfce7] text-[#166534] border-[#86efac]",
  ASIGNADO: "bg-[#fee2e2] text-[#1e40af] border-[#93c5fd]",
  ANULADO: "bg-[#fee2e2] text-[#991b1b] border-[#fca5a5]",
  DISPONIBLE: "bg-[#f3f4f6] text-[#374151] border-[#d1d5db]",
};

const tipoInfraestructuraOptions = ["Vial", "Aeropuerto", "Ferroviario", "Portuario"];
const proyectoOptions = ["AEROPUERTO DE CABALLOCOCHA", "PACRI - IIRSA SUR TRAMO 5", "PACRI - RED VIAL 4", "LONGITUDINAL DE LA SIERRA TRAMO 04"];
const tramoOptions = ["Tramo 01", "Tramo 02", "Tramo 03", "Tramo 04"];
const tipoPredioOptions = ["PREDIO RURAL", "PREDIO URBANO"];
const departamentoOptions = ["LORETO", "PUNO", "UCAYALI", "LA LIBERTAD", "HUANCAVELICA"];
const provinciaOptions = ["Mariscal Ramón Castilla", "Coronel Portillo", "Trujillo"];
const distritoOptions = ["Caballococha", "Callería", "Trujillo"];

function CodigosPrediosPage() {
  const { projectId } = Route.useParams();
  const [items, setItems] = useState<Predio[]>(initialPredios);
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<Estado | "ALL">("ALL");
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Predio | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchSearch =
        !search ||
        p.codigo.toLowerCase().includes(search.toLowerCase()) ||
        p.proyecto.toLowerCase().includes(search.toLowerCase()) ||
        p.departamento.toLowerCase().includes(search.toLowerCase());
      const matchEstado = estadoFilter === "ALL" || p.estado === estadoFilter;
      return matchSearch && matchEstado;
    });
  }, [items, search, estadoFilter]);

  function openNew() {
    setEditing(null);
    setOpenModal(true);
  }

  function openEdit(p: Predio) {
    setEditing(p);
    setOpenModal(true);
  }

  async function copiarPredio(p: Predio) {
    const texto = [
      `Código: ${p.codigo}`,
      `Departamento: ${p.departamento}`,
      `Proyecto: ${p.proyecto}`,
      `Tipo de Predio: ${p.tipoPredio}`,
      `Fecha de Creación: ${p.fecha}`,
      `Estado: ${p.estado}`,
    ].join("\t");

    try {
      await navigator.clipboard.writeText(texto);
      setCopiedId(p.id);
      toast.success("Predio copiado al portapapeles");
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    }
  }

  function handleSave(form: {
    tipoInfraestructura: string;
    codigo: string;
    proyecto: string;
    tramo: string;
    tipoPredio: string;
    departamento: string;
    provincia: string;
    distrito: string;
  }) {
    if (editing) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editing.id
            ? {
                ...it,
                codigo: form.codigo || it.codigo,
                proyecto: form.proyecto || it.proyecto,
                tipoPredio: (form.tipoPredio as Predio["tipoPredio"]) || it.tipoPredio,
                departamento: form.departamento || it.departamento,
              }
            : it,
        ),
      );
    } else {
      const next: Predio = {
        id: Math.max(0, ...items.map((i) => i.id)) + 1,
        codigo: form.codigo || `NUEVO-${Date.now()}`,
        departamento: form.departamento || "—",
        proyecto: form.proyecto || "—",
        tipoPredio: (form.tipoPredio as Predio["tipoPredio"]) || "PREDIO RURAL",
        fecha: new Date().toISOString().slice(0, 19).replace("T", " "),
        estado: "DISPONIBLE",
      };
      setItems((prev) => [next, ...prev]);
    }
    setOpenModal(false);
  }

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937] text-sm">
      <main className="flex-1 flex flex-col overflow-hidden">
        <ProjectPageHeader
          projectId={projectId}
          title="Códigos de Predios"
          badgeLabel="PROYECTO"
          badgeValue={projectId}
          badgeSuffix="CÓDIGOS PREDIOS"
        />


        <div className="px-6 py-4 flex-1 overflow-auto">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="pl-9 pr-3 py-2 w-[280px] rounded-full border border-[#e5e7eb] bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/30"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value as Estado | "ALL")}
                className="px-3 py-2 rounded-md border border-[#e5e7eb] bg-white text-[13px]"
              >
                <option value="ALL">Todos los estados</option>
                <option value="USADO">Usado</option>
                <option value="ASIGNADO">Asignado</option>
                <option value="ANULADO">Anulado</option>
                <option value="DISPONIBLE">Disponible</option>
              </select>
              <button className="size-9 rounded-md bg-[#06b6d4] hover:bg-[#0891b2] text-white flex items-center justify-center" title="Filtros">
                <Filter size={16} />
              </button>
              <button className="size-9 rounded-md bg-[#0ea5e9] hover:bg-[#0284c7] text-white flex items-center justify-center" title="Exportar">
                <FileDown size={16} />
              </button>
              <button className="size-9 rounded-md bg-[#64748b] hover:bg-[#475569] text-white flex items-center justify-center" title="Imprimir">
                <Printer size={16} />
              </button>
              <button
                onClick={openNew}
                className="size-9 rounded-md bg-[#22c55e] hover:bg-[#16a34a] text-white flex items-center justify-center"
                title="Agregar"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden shadow-sm">
            <table className="w-full text-[12.5px]">
              <thead className="bg-[#b91c1c] text-white">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold w-16">ID</th>
                  <th className="text-left px-4 py-2.5 font-semibold">CODIGO</th>
                  <th className="text-left px-4 py-2.5 font-semibold">DEPARTAMENTO</th>
                  <th className="text-left px-4 py-2.5 font-semibold">PROYECTO</th>
                  <th className="text-left px-4 py-2.5 font-semibold">TIPO DE PREDIO</th>
                  <th className="text-left px-4 py-2.5 font-semibold">FECHA DE CREACION</th>
                  <th className="text-left px-4 py-2.5 font-semibold">ESTADO</th>
                  <th className="px-4 py-2.5 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}>
                    <td className="px-4 py-2.5 text-[#dc2626]">{p.id}</td>
                    <td className="px-4 py-2.5 text-[#dc2626] font-medium">{p.codigo}</td>
                    <td className="px-4 py-2.5">{p.departamento}</td>
                    <td className="px-4 py-2.5">{p.proyecto}</td>
                    <td className="px-4 py-2.5">{p.tipoPredio}</td>
                    <td className="px-4 py-2.5 text-[#6b7280]">{p.fecha}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full border text-[11px] font-medium ${estadoStyle[p.estado]}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copiarPredio(p)}
                          className="text-[#0ea5e9] hover:text-[#0284c7] text-[12px] flex items-center gap-1"
                          title="Copiar para Word"
                        >
                          {copiedId === p.id ? <Check size={13} /> : <Copy size={13} />}
                          {copiedId === p.id ? "Copiado" : "Copiar"}
                        </button>
                        <button onClick={() => openEdit(p)} className="text-[#dc2626] hover:underline text-[12px]">
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-[#9ca3af]">
                      Sin resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="px-4 py-2.5 border-t border-[#e5e7eb] text-[12px] text-[#6b7280] flex justify-between">
              <span>Mostrando {filtered.length} de {items.length} registros</span>
              <span>Página 1</span>
            </div>
          </div>
        </div>
      </main>

      {openModal && (
        <PredioModal
          initial={editing}
          onClose={() => setOpenModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function PredioModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Predio | null;
  onClose: () => void;
  onSave: (form: {
    tipoInfraestructura: string;
    codigo: string;
    proyecto: string;
    tramo: string;
    tipoPredio: string;
    departamento: string;
    provincia: string;
    distrito: string;
  }) => void;
}) {
  const { projectId } = Route.useParams();
  const project = getProjectInfo(projectId);
  const [tab, setTab] = useState<"datos" | "historial">("datos");
  const [tipoInfraestructura, setTipoInfraestructura] = useState(project.tipoInfraestructura);
  const [codigo, setCodigo] = useState(initial?.codigo ?? "");
  const [proyecto, setProyecto] = useState(initial?.proyecto ?? project.nombre);
  const [coordinacion, setCoordinacion] = useState(project.coordinacion);
  const [profesional, setProfesional] = useState(CURRENT_USER.nombre);
  const [tramo, setTramo] = useState("");
  const [tipoPredio, setTipoPredio] = useState(initial?.tipoPredio ?? "");
  const [departamento, setDepartamento] = useState(initial?.departamento ?? project.departamento);
  const [provincia, setProvincia] = useState(project.provincia);
  const [distrito, setDistrito] = useState(project.distrito);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 flex items-start justify-center overflow-y-auto p-6">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-xl overflow-hidden mt-10">
        <div className="flex bg-[#fff1f2] border-b border-[#fecdd3] text-[12.5px]">
          <button
            onClick={() => setTab("datos")}
            className={`px-4 py-2.5 font-semibold border-b-2 ${tab === "datos" ? "border-[#ef4444] text-[#b91c1c] bg-white" : "border-transparent text-[#7f1d1d]/70"}`}
          >
            Datos Generales
          </button>
          <button
            onClick={() => setTab("historial")}
            className={`px-4 py-2.5 font-semibold border-b-2 ${tab === "historial" ? "border-[#ef4444] text-[#b91c1c] bg-white" : "border-transparent text-[#7f1d1d]/70"}`}
          >
            <History size={13} className="inline mr-1" /> Historial de Seguimiento
          </button>
          <button onClick={onClose} className="ml-auto px-4 hover:opacity-80">
            <X size={16} />
          </button>
        </div>

        {tab === "historial" ? (
          <div className="p-6">
            <HistorialTimeline events={initial ? seguimientoMock : seguimientoMock.slice(0, 1)} />
          </div>
        ) : (
        <div className="p-6 border border-t-0 border-[#e5e7eb]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <Field label="Proyecto" required>
              <input value={proyecto} onChange={(e) => setProyecto(e.target.value)} className="form-input" />
            </Field>
            <Field label="Coordinación" required>
              <select value={coordinacion} onChange={(e) => setCoordinacion(e.target.value)} className="form-select">
                {COORDINACIONES.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Profesional">
              <select value={profesional} onChange={(e) => setProfesional(e.target.value)} className="form-select">
                {PROFESIONALES.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Tipo de infraestructura" required>
              <select
                value={tipoInfraestructura}
                onChange={(e) => setTipoInfraestructura(e.target.value)}
                className="form-select"
              >
                <option value=""></option>
                {tipoInfraestructuraOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Codigo de Predio N°">
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                disabled={!initial}
                placeholder={initial ? "" : "Se generará automáticamente"}
                className="form-input disabled:bg-[#f3f4f6]"
              />
            </Field>

            <Field label="Proyecto" required>
              <select value={proyecto} onChange={(e) => setProyecto(e.target.value)} className="form-select">
                <option value=""></option>
                {proyectoOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Tramo">
              <select value={tramo} onChange={(e) => setTramo(e.target.value)} className="form-select bg-[#f3f4f6]">
                <option value=""></option>
                {tramoOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>

            <Field label="Tipo de predio" required>
              <select value={tipoPredio} onChange={(e) => setTipoPredio(e.target.value)} className="form-select">
                <option value=""></option>
                {tipoPredioOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Departamento">
              <select value={departamento} onChange={(e) => setDepartamento(e.target.value)} className="form-select">
                <option value=""></option>
                {departamentoOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>

            <Field label="Provincia">
              <select value={provincia} onChange={(e) => setProvincia(e.target.value)} className="form-select">
                <option value=""></option>
                {provinciaOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Distrito">
              <select value={distrito} onChange={(e) => setDistrito(e.target.value)} className="form-select">
                <option value=""></option>
                {distritoOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={() =>
                onSave({
                  tipoInfraestructura,
                  codigo,
                  proyecto,
                  tramo,
                  tipoPredio,
                  departamento,
                  provincia,
                  distrito,
                })
              }
              className="px-4 py-2 rounded-md bg-[#22c55e] hover:bg-[#16a34a] text-white text-[13px] font-medium flex items-center gap-2"
            >
              Guardar <Save size={14} />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-[#f97316] hover:bg-[#ea580c] text-white text-[13px] font-medium flex items-center gap-2"
            >
              Salir <LogOut size={14} />
            </button>
          </div>
        </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/0"
          aria-label="cerrar"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid grid-cols-[160px_1fr] items-center gap-3">
      <span className="text-[13px] text-[#374151]">
        {required && <span className="text-[#ef4444] mr-0.5">*</span>}
        {label}:
      </span>
      <div className="[&_.form-input]:w-full [&_.form-input]:px-3 [&_.form-input]:py-2 [&_.form-input]:border [&_.form-input]:border-[#d1d5db] [&_.form-input]:rounded [&_.form-input]:text-[13px] [&_.form-input]:bg-white [&_.form-select]:w-full [&_.form-select]:px-3 [&_.form-select]:py-2 [&_.form-select]:border [&_.form-select]:border-[#d1d5db] [&_.form-select]:rounded [&_.form-select]:text-[13px] [&_.form-select]:bg-white">
        {children}
      </div>
    </label>
  );
}