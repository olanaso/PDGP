import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileWarning,
  FilterX,
  Gavel,
  Landmark,
  Scale,
  Search,
  ShieldAlert,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { ChartExplanation } from "../components/ChartExplanation";

import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/seguimiento-monitoreo/legal-riesgos-plazos")({
  head: () => ({ meta: [{ title: "Situación legal, riesgos y plazos" }] }),
  component: LegalRiesgosPage,
});

const COLORS = {
  red: "#dc2626",
  orange: "#f97316",
  green: "#16a34a",
  blue: "#2563eb",
  amber: "#f59e0b",
  purple: "#7c3aed",
  slate: "#64748b",
};

const legalConditions = [
  { name: "Propietario registral", value: 38, count: 438, color: COLORS.blue },
  { name: "Documento de fecha cierta", value: 12, count: 138, color: COLORS.purple },
  { name: "Poseedor", value: 14, count: 161, color: COLORS.amber },
  { name: "Ocupante", value: 9, count: 104, color: COLORS.orange },
  { name: "Sucesión", value: 8, count: 92, color: "#a855f7" },
  { name: "Inmueble no inscrito", value: 7, count: 81, color: COLORS.slate },
  { name: "Inmueble estatal", value: 5, count: 58, color: COLORS.green },
  { name: "Fideicomiso", value: 3, count: 35, color: "#0891b2" },
  { name: "Propiedad en litigio", value: 4, count: 46, color: COLORS.red },
];

const legalCases = [
  {
    name: "Tramo 1",
    complete: 82,
    pending: 24,
    observation: 11,
    opposition: 6,
    litigation: 4,
    consignment: 5,
    expropriation: 8,
    closed: 38,
  },
  {
    name: "Tramo 2",
    complete: 74,
    pending: 31,
    observation: 14,
    opposition: 8,
    litigation: 6,
    consignment: 7,
    expropriation: 10,
    closed: 29,
  },
  {
    name: "Tramo 3",
    complete: 96,
    pending: 18,
    observation: 9,
    opposition: 3,
    litigation: 2,
    consignment: 4,
    expropriation: 6,
    closed: 47,
  },
  {
    name: "Tramo 4",
    complete: 61,
    pending: 38,
    observation: 17,
    opposition: 12,
    litigation: 9,
    consignment: 8,
    expropriation: 13,
    closed: 21,
  },
  {
    name: "Tramo 5",
    complete: 88,
    pending: 22,
    observation: 13,
    opposition: 7,
    litigation: 5,
    consignment: 6,
    expropriation: 9,
    closed: 35,
  },
  {
    name: "Tramo 6",
    complete: 53,
    pending: 44,
    observation: 19,
    opposition: 14,
    litigation: 11,
    consignment: 9,
    expropriation: 16,
    closed: 17,
  },
  {
    name: "Tramo 7",
    complete: 79,
    pending: 27,
    observation: 10,
    opposition: 5,
    litigation: 3,
    consignment: 5,
    expropriation: 7,
    closed: 33,
  },
];

type RiskLevel = "Bajo" | "Moderado" | "Alto" | "Crítico";
type RiskStatus = "Controlado" | "En mitigación" | "Pendiente" | "Vencido" | "Bloqueado";
type RiskRow = {
  code: string;
  category: string;
  description: string;
  probability: number;
  impact: number;
  level: RiskLevel;
  exposed: number;
  properties: number;
  days: number;
  mitigation: string;
  owner: string;
  deadline: string;
  status: RiskStatus;
};

const risks: RiskRow[] = [
  {
    code: "R-01",
    category: "Legal",
    description: "Controversia de titularidad y doble inscripción",
    probability: 5,
    impact: 5,
    level: "Crítico",
    exposed: 18.4,
    properties: 12,
    days: -9,
    mitigation: "Solicitar cierre registral y medida cautelar",
    owner: "M. Salazar",
    deadline: "27/07/2026",
    status: "Vencido",
  },
  {
    code: "R-02",
    category: "Presupuestal",
    description: "Falta de disponibilidad para consignaciones",
    probability: 4,
    impact: 5,
    level: "Crítico",
    exposed: 15.7,
    properties: 18,
    days: 3,
    mitigation: "Gestionar modificación presupuestal",
    owner: "L. Quispe",
    deadline: "08/08/2026",
    status: "Pendiente",
  },
  {
    code: "R-03",
    category: "Judicial",
    description: "Medida cautelar impide toma de posesión",
    probability: 4,
    impact: 5,
    level: "Crítico",
    exposed: 13.2,
    properties: 6,
    days: -4,
    mitigation: "Impulsar levantamiento de medida",
    owner: "A. Paredes",
    deadline: "01/08/2026",
    status: "Vencido",
  },
  {
    code: "R-04",
    category: "Social",
    description: "Oposición colectiva al empadronamiento",
    probability: 5,
    impact: 4,
    level: "Crítico",
    exposed: 11.8,
    properties: 27,
    days: 5,
    mitigation: "Activar mesa de diálogo territorial",
    owner: "C. Romero",
    deadline: "10/08/2026",
    status: "En mitigación",
  },
  {
    code: "R-05",
    category: "Registral",
    description: "Partidas con área y linderos inconsistentes",
    probability: 4,
    impact: 4,
    level: "Alto",
    exposed: 9.6,
    properties: 21,
    days: 8,
    mitigation: "Tramitar rectificación de área",
    owner: "R. Huamán",
    deadline: "13/08/2026",
    status: "En mitigación",
  },
  {
    code: "R-06",
    category: "Plazos",
    description: "Vencimiento de vigencia de tasaciones",
    probability: 5,
    impact: 3,
    level: "Alto",
    exposed: 8.1,
    properties: 34,
    days: 2,
    mitigation: "Priorizar ofertas y notificaciones",
    owner: "M. Salazar",
    deadline: "07/08/2026",
    status: "Pendiente",
  },
  {
    code: "R-07",
    category: "Sucesorio",
    description: "Herederos no declarados ni ubicados",
    probability: 3,
    impact: 4,
    level: "Alto",
    exposed: 6.9,
    properties: 15,
    days: 12,
    mitigation: "Iniciar consignación judicial",
    owner: "A. Paredes",
    deadline: "17/08/2026",
    status: "Pendiente",
  },
  {
    code: "R-08",
    category: "Documental",
    description: "Documentos de propiedad incompletos",
    probability: 4,
    impact: 3,
    level: "Alto",
    exposed: 5.7,
    properties: 42,
    days: 7,
    mitigation: "Campaña de subsanación documental",
    owner: "C. Romero",
    deadline: "12/08/2026",
    status: "En mitigación",
  },
  {
    code: "R-09",
    category: "Arbitral",
    description: "Pretensión indemnizatoria adicional",
    probability: 3,
    impact: 3,
    level: "Moderado",
    exposed: 4.8,
    properties: 4,
    days: 18,
    mitigation: "Elaborar informe técnico de defensa",
    owner: "L. Quispe",
    deadline: "23/08/2026",
    status: "Pendiente",
  },
  {
    code: "R-10",
    category: "Ocupación",
    description: "Ocupantes posteriores a fecha de corte",
    probability: 4,
    impact: 2,
    level: "Moderado",
    exposed: 3.9,
    properties: 23,
    days: 14,
    mitigation: "Verificación y acta notarial",
    owner: "R. Huamán",
    deadline: "19/08/2026",
    status: "Controlado",
  },
  {
    code: "R-11",
    category: "Administrativo",
    description: "Retraso en emisión de resolución",
    probability: 2,
    impact: 3,
    level: "Moderado",
    exposed: 2.7,
    properties: 11,
    days: 21,
    mitigation: "Seguimiento a circuito de firmas",
    owner: "M. Salazar",
    deadline: "26/08/2026",
    status: "Controlado",
  },
  {
    code: "R-12",
    category: "Notarial",
    description: "Agenda insuficiente para legalizaciones",
    probability: 2,
    impact: 2,
    level: "Bajo",
    exposed: 1.2,
    properties: 9,
    days: 26,
    mitigation: "Ampliar cartera de notarías",
    owner: "C. Romero",
    deadline: "31/08/2026",
    status: "Controlado",
  },
];

type LegalRow = {
  code: string;
  condition: string;
  passive: string;
  occupant: string;
  propertyDoc: string;
  observations: string;
  conflict: string;
  proceeding: string;
  consignment: string;
  owner: string;
  next: string;
  risk: RiskLevel;
  deadline: string;
  budget: string;
};

const legalRows: LegalRow[] = [
  {
    code: "PR-001842",
    condition: "Propietario registral",
    passive: "María Elena Rojas",
    occupant: "Mismo sujeto",
    propertyDoc: "Partida 11874290",
    observations: "Título con carga hipotecaria",
    conflict: "Acreedor no notificado",
    proceeding: "Sin proceso",
    consignment: "No aplica",
    owner: "M. Salazar",
    next: "Notificar al acreedor",
    risk: "Moderado",
    deadline: "Próximo",
    budget: "Disponible",
  },
  {
    code: "PR-001873",
    condition: "Poseedor",
    passive: "Comunidad San Jerónimo",
    occupant: "42 familias",
    propertyDoc: "Constancia de posesión",
    observations: "Área comunal sin independizar",
    conflict: "Oposición parcial",
    proceeding: "Exp. 0812-2026",
    consignment: "Pendiente",
    owner: "C. Romero",
    next: "Convocar asamblea",
    risk: "Crítico",
    deadline: "Vencido",
    budget: "Sin disponibilidad",
  },
  {
    code: "PR-001905",
    condition: "Propiedad en litigio",
    passive: "Inversiones del Centro SAC",
    occupant: "Arrendatario comercial",
    propertyDoc: "Partida 11028461",
    observations: "Doble cadena de dominio",
    conflict: "Controversia de titularidad",
    proceeding: "Exp. 1445-2025",
    consignment: "En trámite",
    owner: "L. Quispe",
    next: "Solicitar medida cautelar",
    risk: "Crítico",
    deadline: "Vencido",
    budget: "Sin disponibilidad",
  },
  {
    code: "PR-001927",
    condition: "Sucesión",
    passive: "Sucesión Flores Huamán",
    occupant: "Dos coherederos",
    propertyDoc: "Escritura imperfecta",
    observations: "Herederos no declarados",
    conflict: "Desacuerdo sobre porcentajes",
    proceeding: "Sucesión intestada",
    consignment: "Recomendada",
    owner: "A. Paredes",
    next: "Publicar edicto",
    risk: "Alto",
    deadline: "Próximo",
    budget: "Certificado",
  },
  {
    code: "PR-001944",
    condition: "Inmueble estatal",
    passive: "Municipalidad Distrital Norte",
    occupant: "Comercio informal",
    propertyDoc: "Afectación en uso",
    observations: "Acuerdo de concejo pendiente",
    conflict: "Competencia institucional",
    proceeding: "Sin proceso",
    consignment: "No aplica",
    owner: "R. Huamán",
    next: "Gestionar acuerdo",
    risk: "Alto",
    deadline: "Vigente",
    budget: "No aplica",
  },
  {
    code: "PR-001968",
    condition: "Documento de fecha cierta",
    passive: "José Antonio Medina",
    occupant: "Mismo sujeto",
    propertyDoc: "Contrato privado 1998",
    observations: "Falta tracto registral",
    conflict: "Ninguno",
    proceeding: "Sin proceso",
    consignment: "No aplica",
    owner: "M. Salazar",
    next: "Validar fecha cierta",
    risk: "Bajo",
    deadline: "Vigente",
    budget: "Disponible",
  },
  {
    code: "PR-001991",
    condition: "Propietario registral",
    passive: "Agrícola Santa Ana SRL",
    occupant: "Ocupante precario",
    propertyDoc: "Partida 11296744",
    observations: "Ocupación posterior al corte",
    conflict: "Desalojo pendiente",
    proceeding: "Exp. 0921-2026",
    consignment: "No aplica",
    owner: "C. Romero",
    next: "Realizar constatación",
    risk: "Alto",
    deadline: "Próximo",
    budget: "Certificado",
  },
  {
    code: "PR-002014",
    condition: "Inmueble no inscrito",
    passive: "Rosa Milagros Chávez",
    occupant: "No identificado",
    propertyDoc: "Sin documento",
    observations: "Sujeto pasivo no ubicado",
    conflict: "Posesión informal",
    proceeding: "Sin proceso",
    consignment: "Por iniciar",
    owner: "A. Paredes",
    next: "Publicar convocatoria",
    risk: "Crítico",
    deadline: "Vencido",
    budget: "Sin disponibilidad",
  },
  {
    code: "PR-002037",
    condition: "Fideicomiso",
    passive: "Consorcio Vial Andino",
    occupant: "Operador logístico",
    propertyDoc: "Partida 11903072",
    observations: "Requiere autorización fiduciaria",
    conflict: "Tasación impugnada",
    proceeding: "Arbitraje 044-2026",
    consignment: "Pendiente",
    owner: "L. Quispe",
    next: "Contestar arbitraje",
    risk: "Crítico",
    deadline: "Vencido",
    budget: "Disponible",
  },
  {
    code: "PR-002058",
    condition: "Propietario registral",
    passive: "Comunidad Campesina Central",
    occupant: "Comuneros calificados",
    propertyDoc: "Partida 11004538",
    observations: "Padrón comunal actualizado",
    conflict: "Ninguno",
    proceeding: "Sin proceso",
    consignment: "No aplica",
    owner: "R. Huamán",
    next: "Presentar título",
    risk: "Bajo",
    deadline: "Vigente",
    budget: "Pagado",
  },
];

const scheduleEvents = [
  {
    date: "05 Ago",
    type: "Publicación",
    code: "PR-002014",
    owner: "A. Paredes",
    status: "overdue",
    days: -3,
  },
  {
    date: "06 Ago",
    type: "Empadronamiento",
    code: "Tramo II",
    owner: "C. Romero",
    status: "soon",
    days: 1,
  },
  {
    date: "07 Ago",
    type: "Calificación",
    code: "PR-001927",
    owner: "M. Salazar",
    status: "soon",
    days: 2,
  },
  {
    date: "08 Ago",
    type: "Tasación",
    code: "PR-001842",
    owner: "L. Quispe",
    status: "done",
    days: 0,
  },
  {
    date: "10 Ago",
    type: "Notificación",
    code: "PR-001873",
    owner: "C. Romero",
    status: "blocked",
    days: 5,
  },
  {
    date: "12 Ago",
    type: "Respuesta a oferta",
    code: "PR-001905",
    owner: "A. Paredes",
    status: "overdue",
    days: -6,
  },
  {
    date: "14 Ago",
    type: "Resolución",
    code: "PR-001944",
    owner: "R. Huamán",
    status: "soon",
    days: 9,
  },
  { date: "17 Ago", type: "Pago", code: "PR-001968", owner: "M. Salazar", status: "done", days: 0 },
  {
    date: "20 Ago",
    type: "Entrega",
    code: "PR-001991",
    owner: "C. Romero",
    status: "soon",
    days: 15,
  },
  {
    date: "22 Ago",
    type: "Consignación",
    code: "PR-002037",
    owner: "L. Quispe",
    status: "blocked",
    days: 17,
  },
  {
    date: "25 Ago",
    type: "Presentación de título",
    code: "PR-002058",
    owner: "R. Huamán",
    status: "done",
    days: 0,
  },
  {
    date: "28 Ago",
    type: "Subsanación",
    code: "PR-002081",
    owner: "A. Paredes",
    status: "soon",
    days: 23,
  },
];

type Filters = {
  project: string;
  condition: string;
  procedure: string;
  risk: string;
  owner: string;
  deadline: string;
  start: string;
  end: string;
};
const defaultFilters: Filters = {
  project: "TODOS",
  condition: "TODAS",
  procedure: "TODOS",
  risk: "TODOS",
  owner: "TODOS",
  deadline: "TODOS",
  start: "2026-01-01",
  end: "2026-12-31",
};
function money(value: number, digits = 1) {
  return `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: digits, maximumFractionDigits: digits })} MM`;
}

function LegalRiesgosPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [legalSearch, setLegalSearch] = useState("");
  const [riskSearch, setRiskSearch] = useState("");
  const [selectedLegal, setSelectedLegal] = useState<LegalRow | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskRow | null>(null);
  const [showCriticalAlert, setShowCriticalAlert] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("05/08/2026 11:34");

  const filteredLegal = useMemo(
    () =>
      legalRows.filter((row) => {
        if (filters.condition !== "TODAS" && row.condition !== filters.condition) return false;
        if (filters.risk !== "TODOS" && row.risk !== filters.risk) return false;
        if (filters.owner !== "TODOS" && row.owner !== filters.owner) return false;
        if (filters.deadline !== "TODOS" && row.deadline !== filters.deadline) return false;
        const query = legalSearch.trim().toLowerCase();
        return !query || `${row.code} ${row.passive} ${row.occupant}`.toLowerCase().includes(query);
      }),
    [filters, legalSearch],
  );
  const filteredRisks = risks.filter(
    (row) =>
      !riskSearch.trim() ||
      `${row.code} ${row.category} ${row.description}`
        .toLowerCase()
        .includes(riskSearch.toLowerCase()),
  );
  const scale =
    Math.max(0.1, filteredLegal.length / legalRows.length) *
    (filters.project === "TODOS" ? 1 : 0.68) *
    (filters.procedure === "TODOS" ? 1 : 0.76);
  const cards = [
    {
      label: "Sujetos pasivos identificados",
      value: Math.round(1153 * scale).toString(),
      note: "96.1% de la cartera",
      trend: 3.4,
      color: "blue",
    },
    {
      label: "Ocupantes identificados",
      value: Math.round(287 * scale).toString(),
      note: "Incluye ocupación informal",
      trend: 5.2,
      color: "blue",
    },
    {
      label: "Documentación incompleta",
      value: Math.max(1, Math.round(126 * scale)).toString(),
      note: "10.5% de la cartera",
      trend: -6.7,
      color: "amber",
    },
    {
      label: "Predios en litigio",
      value: Math.max(1, Math.round(46 * scale)).toString(),
      note: "18 en proceso judicial",
      trend: 4.1,
      color: "red",
    },
    {
      label: "Oposiciones de terceros",
      value: Math.max(1, Math.round(38 * scale)).toString(),
      note: "Requieren pronunciamiento",
      trend: -3.2,
      color: "amber",
    },
    {
      label: "Consignaciones pendientes",
      value: Math.max(1, Math.round(57 * scale)).toString(),
      note: "S/ 21.4 MM expuestos",
      trend: 7.8,
      color: "red",
    },
    {
      label: "Plazos próximos a vencer",
      value: Math.max(1, Math.round(31 * scale)).toString(),
      note: "Dentro de 15 días",
      trend: 9.1,
      color: "amber",
    },
    {
      label: "Plazos vencidos",
      value: Math.max(1, Math.round(19 * scale)).toString(),
      note: "Atención inmediata",
      trend: -4.8,
      color: "red",
    },
    {
      label: "Riesgos críticos",
      value: Math.max(1, Math.round(12 * scale)).toString(),
      note: "S/ 59.1 MM expuestos",
      trend: 2.6,
      color: "red",
    },
  ] as const;
  const topRiskData = risks.slice(0, 10).map((row) => ({
    ...row,
    label: `${row.level} · ${money(row.exposed)} · ${row.properties} predios · ${row.days < 0 ? `${Math.abs(row.days)}d vencido` : `${row.days}d restantes`}`,
  }));

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }
  function reset() {
    setFilters(defaultFilters);
    setLegalSearch("");
    setRiskSearch("");
  }
  function exportLegal() {
    const header =
      "codigo,condicion_juridica,sujeto_pasivo,ocupante,documento,observaciones,conflicto,proceso,consignacion,responsable,accion_siguiente\n";
    const rows = filteredLegal
      .map((row) =>
        [
          row.code,
          row.condition,
          row.passive,
          row.occupant,
          row.propertyDoc,
          row.observations,
          row.conflict,
          row.proceeding,
          row.consignment,
          row.owner,
          row.next,
        ]
          .map((cell) => `"${cell}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff", header, rows], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "dashboard_legal_riesgos.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f7] text-[#172033]">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-auto p-3 xl:p-4">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 text-[#dc2626]">
              <Scale size={21} />
            </div>
            <div>
              <h1 className="text-[20px] font-semibold tracking-tight">
                Situación legal, riesgos y plazos
              </h1>
              <p className="text-[12px] text-slate-500">
                Control de condiciones jurídicas, contingencias, mitigaciones y vencimientos de la
                gestión predial
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex h-8 items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 text-[11px] text-slate-500">
              <Clock3 size={13} /> Última actualización:{" "}
              <b className="text-slate-700">{updatedAt}</b>
            </div>
            <button
              onClick={reset}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-slate-300 bg-white px-3 text-[12px] font-medium text-slate-700"
            >
              <FilterX size={14} /> Restablecer
            </button>
            <button
              onClick={exportLegal}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-3 text-[12px] font-semibold text-white"
            >
              <Download size={14} /> Exportar
            </button>
          </div>
        </header>

        <section className="mb-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-700">
              <Gavel size={15} className="text-[#dc2626]" /> Alcance legal y de riesgos
            </div>
            <button
              onClick={() => setUpdatedAt("05/08/2026 11:49")}
              className="text-[11px] font-medium text-[#dc2626] hover:underline"
            >
              Actualizar información
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8">
            <FilterSelect
              label="Proyecto"
              value={filters.project}
              onChange={(v) => update("project", v)}
              options={[
                "TODOS",
                "Carretera Central",
                "Evitamiento Chimbote",
                "Aeropuerto de Jauja",
              ]}
            />
            <FilterSelect
              label="Condición jurídica"
              value={filters.condition}
              onChange={(v) => update("condition", v)}
              options={["TODAS", ...legalConditions.map((row) => row.name)]}
            />
            <FilterSelect
              label="Tipo de procedimiento"
              value={filters.procedure}
              onChange={(v) => update("procedure", v)}
              options={["TODOS", "Trato directo", "Expropiación", "Consignación", "Transferencia"]}
            />
            <FilterSelect
              label="Nivel de riesgo"
              value={filters.risk}
              onChange={(v) => update("risk", v)}
              options={["TODOS", "Bajo", "Moderado", "Alto", "Crítico"]}
            />
            <FilterSelect
              label="Responsable legal"
              value={filters.owner}
              onChange={(v) => update("owner", v)}
              options={["TODOS", "M. Salazar", "C. Romero", "L. Quispe", "A. Paredes", "R. Huamán"]}
            />
            <FilterSelect
              label="Estado del plazo"
              value={filters.deadline}
              onChange={(v) => update("deadline", v)}
              options={["TODOS", "Vigente", "Próximo", "Vencido", "Bloqueado"]}
            />
            <DateFilter
              label="Fecha inicio"
              value={filters.start}
              onChange={(v) => update("start", v)}
            />
            <DateFilter label="Fecha fin" value={filters.end} onChange={(v) => update("end", v)} />
          </div>
        </section>

        <section className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-9">
          {cards.map((card) => (
            <KpiCard key={card.label} {...card} />
          ))}
        </section>

        <section className="mb-3 grid gap-3 xl:grid-cols-[.75fr_1.25fr]">
          <Panel
            title="Afectados por condición jurídica"
            subtitle="Cada segmento indica qué proporción de afectados corresponde a propietarios, poseedores, ocupantes u otras condiciones jurídicas."
            icon={<Users size={15} />}
          >
            <div className="grid items-center md:grid-cols-[1fr_1.05fr]">
              <div className="relative">
                <ResponsiveContainer width="100%" height={315}>
                  <PieChart>
                    <Pie
                      data={legalConditions}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={103}
                      paddingAngle={2}
                    >
                      {legalConditions.map((row) => (
                        <Cell key={row.name} fill={row.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, _name, item) => [
                        `${value}% · ${item.payload.count} afectados`,
                        item.payload.name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[9px] text-slate-400">AFECTADOS</span>
                  <b className="text-[24px]">1,153</b>
                </div>
              </div>
              <div className="space-y-1.5">
                {legalConditions.map((row) => (
                  <button
                    key={row.name}
                    onClick={() => update("condition", row.name)}
                    className="flex w-full items-center justify-between rounded p-1 text-left text-[9px] hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <i className="size-2 rounded-full" style={{ background: row.color }} />
                      {row.name}
                    </span>
                    <b>{row.count}</b>
                  </button>
                ))}
              </div>
            </div>
          </Panel>
          <Panel
            title="Casos legales por tramo"
            subtitle="Compara por ámbito cuántos casos tienen documentación completa, observaciones, oposición, litigio, consignación, expropiación o cierre."
            icon={<Landmark size={15} />}
          >
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={legalCases} margin={{ left: 5, right: 12, top: 10 }}>
                <CartesianGrid stroke="#edf0f4" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Bar
                  dataKey="complete"
                  name="Documentación completa"
                  stackId="a"
                  fill={COLORS.green}
                />
                <Bar dataKey="pending" name="Documentación pendiente" stackId="a" fill="#cbd5e1" />
                <Bar dataKey="observation" name="Observación" stackId="a" fill={COLORS.amber} />
                <Bar dataKey="opposition" name="Oposición" stackId="a" fill={COLORS.orange} />
                <Bar dataKey="litigation" name="Litigio" stackId="a" fill={COLORS.red} />
                <Bar dataKey="consignment" name="Consignación" stackId="a" fill={COLORS.purple} />
                <Bar dataKey="expropriation" name="Expropiación" stackId="a" fill={COLORS.blue} />
                <Bar dataKey="closed" name="Cierre" stackId="a" fill={COLORS.slate} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </section>

        <section className="mb-3 grid gap-3 xl:grid-cols-[1fr_1fr]">
          <Panel
            title="Matriz de riesgos 5 × 5"
            subtitle="Los riesgos más cercanos a la esquina superior derecha son los más críticos; el tamaño del punto representa el monto expuesto."
            icon={<ShieldAlert size={15} />}
          >
            <ResponsiveContainer width="100%" height={420}>
              <ScatterChart margin={{ left: 8, right: 28, top: 18, bottom: 15 }}>
                <CartesianGrid stroke="#cbd5e1" />
                <ReferenceArea
                  x1={0.5}
                  x2={2.5}
                  y1={0.5}
                  y2={2.5}
                  fill="#dcfce7"
                  fillOpacity={0.9}
                />
                <ReferenceArea
                  x1={2.5}
                  x2={4.5}
                  y1={0.5}
                  y2={3.5}
                  fill="#fef9c3"
                  fillOpacity={0.75}
                />
                <ReferenceArea
                  x1={0.5}
                  x2={3.5}
                  y1={2.5}
                  y2={5.5}
                  fill="#ffedd5"
                  fillOpacity={0.65}
                />
                <ReferenceArea
                  x1={3.5}
                  x2={5.5}
                  y1={3.5}
                  y2={5.5}
                  fill="#fee2e2"
                  fillOpacity={0.78}
                />
                <XAxis
                  type="number"
                  dataKey="probability"
                  name="Probabilidad"
                  domain={[0.5, 5.5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tickFormatter={(v) => ["", "Muy baja", "Baja", "Media", "Alta", "Muy alta"][v]}
                  tick={{ fontSize: 8 }}
                />
                <YAxis
                  type="number"
                  dataKey="impact"
                  name="Impacto"
                  domain={[0.5, 5.5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tickFormatter={(v) => ["", "Menor", "Bajo", "Medio", "Mayor", "Severo"][v]}
                  tick={{ fontSize: 8 }}
                />
                <ZAxis type="number" dataKey="exposed" range={[120, 760]} name="Monto expuesto" />
                <Tooltip
                  formatter={(value, name) =>
                    name === "Monto expuesto" ? money(Number(value)) : value
                  }
                />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                {(["Bajo", "Moderado", "Alto", "Crítico"] as RiskLevel[]).map((level) => (
                  <Scatter
                    key={level}
                    name={level}
                    data={risks.filter((row) => row.level === level)}
                    fill={
                      level === "Bajo"
                        ? COLORS.green
                        : level === "Moderado"
                          ? COLORS.amber
                          : level === "Alto"
                            ? COLORS.orange
                            : COLORS.red
                    }
                    onClick={(row) => setSelectedRisk(row)}
                    cursor="pointer"
                  >
                    <LabelList
                      dataKey="code"
                      position="top"
                      style={{ fontSize: 9, fill: "#334155", fontWeight: 700 }}
                    />
                  </Scatter>
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </Panel>
          <Panel
            title="Top 10 riesgos de mayor criticidad"
            subtitle="Ordena los diez riesgos más críticos y muestra cuánto dinero y cuántos predios comprometen, además del plazo para mitigarlos."
            icon={<AlertOctagon size={15} />}
          >
            <ResponsiveContainer width="100%" height={420}>
              <BarChart
                data={topRiskData}
                layout="vertical"
                margin={{ left: 10, right: 245, top: 8 }}
                onClick={(state) => {
                  if (typeof state?.activeLabel === "string") {
                    const row = risks.find((item) => item.code === state.activeLabel);
                    if (row) setSelectedRisk(row);
                  }
                }}
              >
                <CartesianGrid stroke="#edf0f4" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="code"
                  width={48}
                  tick={{ fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(value) => money(Number(value))} />
                <Bar dataKey="exposed" name="Monto expuesto" radius={[0, 3, 3, 0]} cursor="pointer">
                  <LabelList
                    dataKey="label"
                    position="right"
                    style={{ fontSize: 9, fill: "#475569" }}
                  />
                  {risks.slice(0, 10).map((row) => (
                    <Cell
                      key={row.code}
                      fill={
                        row.level === "Crítico"
                          ? COLORS.red
                          : row.level === "Alto"
                            ? COLORS.orange
                            : row.level === "Moderado"
                              ? COLORS.amber
                              : COLORS.green
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </section>

        <section className="mb-3">
          <Panel
            title="Cronograma de vencimientos legales y prediales"
            subtitle="Ubica cada hito legal en el calendario: verde está cumplido, amarillo próximo a vencer, rojo vencido y negro bloqueado."
            icon={<CalendarClock size={15} />}
          >
            <Schedule />
          </Panel>
        </section>

        <LegalTable
          rows={filteredLegal}
          search={legalSearch}
          onSearch={setLegalSearch}
          onOpen={setSelectedLegal}
          onExport={exportLegal}
        />
        <RiskTable
          rows={filteredRisks}
          search={riskSearch}
          onSearch={setRiskSearch}
          onOpen={setSelectedRisk}
        />
      </main>
      {showCriticalAlert && (
        <CriticalAlert
          onClose={() => setShowCriticalAlert(false)}
          onOpen={() => {
            setShowCriticalAlert(false);
            setSelectedLegal(legalRows[2]);
          }}
        />
      )}
      {selectedLegal && <LegalDrawer row={selectedLegal} onClose={() => setSelectedLegal(null)} />}
      {selectedRisk && <RiskDrawer row={selectedRisk} onClose={() => setSelectedRisk(null)} />}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block truncate text-[10px] font-medium text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-[11px] text-slate-700 outline-none focus:border-[#dc2626]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function DateFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-1 block text-[10px] font-medium text-slate-500">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-[11px] text-slate-700 outline-none focus:border-[#dc2626]"
      />
    </label>
  );
}
function KpiCard({
  label,
  value,
  note,
  trend,
  color,
}: {
  label: string;
  value: string;
  note: string;
  trend: number;
  color: "blue" | "green" | "amber" | "red";
}) {
  const top = {
    blue: "border-t-blue-500",
    green: "border-t-green-500",
    amber: "border-t-amber-400",
    red: "border-t-red-500",
  }[color];
  return (
    <div
      className={`min-h-[116px] rounded-lg border border-slate-200 border-t-[3px] bg-white p-2.5 shadow-sm ${top}`}
    >
      <div className="min-h-8 text-[10px] font-semibold leading-4 text-slate-600">{label}</div>
      <div className="mt-1 text-[20px] font-bold">{value}</div>
      <div className="mt-1 flex items-center justify-between gap-1 text-[9px] text-slate-500">
        <span>{note}</span>
        <b className={`flex items-center ${trend >= 0 ? "text-green-700" : "text-red-700"}`}>
          {trend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {Math.abs(trend)}%
        </b>
      </div>
    </div>
  );
}
function Panel({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex gap-2">
        <span className="mt-0.5 text-[#dc2626]">{icon}</span>
        <div>
          <h2 className="text-[13px] font-semibold text-slate-800">{title}</h2>
          <ChartExplanation>{subtitle}</ChartExplanation>
        </div>
      </div>
      {children}
    </div>
  );
}

function Schedule() {
  const cfg = {
    done: { label: "Cumplido", cls: "border-green-200 bg-green-50 text-green-700" },
    soon: { label: "Próximo", cls: "border-amber-200 bg-amber-50 text-amber-700" },
    overdue: { label: "Vencido", cls: "border-red-200 bg-red-50 text-red-700" },
    blocked: { label: "Bloqueado", cls: "border-slate-800 bg-slate-900 text-white" },
  };
  return (
    <div>
      <div className="mb-3 grid grid-cols-7 border-b border-slate-200 text-center text-[9px] font-semibold uppercase text-slate-500">
        <span>Lun</span>
        <span>Mar</span>
        <span>Mié</span>
        <span>Jue</span>
        <span>Vie</span>
        <span>Sáb</span>
        <span>Dom</span>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
        {scheduleEvents.map((event) => {
          const status = cfg[event.status as keyof typeof cfg];
          return (
            <button
              key={`${event.date}-${event.type}`}
              className={`min-h-[94px] rounded-lg border p-2.5 text-left transition hover:-translate-y-0.5 hover:shadow ${status.cls}`}
            >
              <div className="flex justify-between text-[9px] font-semibold">
                <span>{event.date}</span>
                <span>{status.label}</span>
              </div>
              <b className="mt-2 block text-[11px]">{event.type}</b>
              <span className="mt-1 block text-[10px]">{event.code}</span>
              <span className="mt-1 flex items-center gap-1 text-[9px] opacity-75">
                <UserRound size={10} />
                {event.owner}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex justify-end gap-4 text-[9px] text-slate-500">
        <span className="text-green-700">● Cumplido</span>
        <span className="text-amber-600">● Próximo</span>
        <span className="text-red-700">● Vencido</span>
        <span className="text-slate-900">● Bloqueado</span>
      </div>
    </div>
  );
}

function TableHeader({
  title,
  subtitle,
  search,
  onSearch,
  action,
}: {
  title: string;
  subtitle: string;
  search: string;
  onSearch: (value: string) => void;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2.5">
      <div>
        <h2 className="text-[13px] font-semibold text-slate-800">{title}</h2>
        <p className="text-[10px] text-slate-500">{subtitle}</p>
      </div>
      <div className="flex gap-2">
        <div className="flex h-8 w-64 items-center gap-2 rounded border border-slate-200 px-2 text-slate-400">
          <Search size={13} />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Buscar..."
            className="min-w-0 flex-1 bg-transparent text-[10px] text-slate-700 outline-none"
          />
        </div>
        {action}
      </div>
    </div>
  );
}
function LegalTable({
  rows,
  search,
  onSearch,
  onOpen,
  onExport,
}: {
  rows: LegalRow[];
  search: string;
  onSearch: (value: string) => void;
  onOpen: (row: LegalRow) => void;
  onExport: () => void;
}) {
  return (
    <section className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <TableHeader
        title="Tabla legal de predios"
        subtitle="Condición jurídica, conflictos, procesos y acciones siguientes"
        search={search}
        onSearch={onSearch}
        action={
          <button
            onClick={onExport}
            className="inline-flex h-8 items-center gap-1 rounded border border-slate-300 px-2 text-[10px]"
          >
            <Download size={12} /> Exportar
          </button>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1650px] text-[10px]">
          <thead className="bg-slate-50 text-left uppercase text-slate-500">
            <tr>
              {[
                "Código",
                "Condición jurídica",
                "Sujeto pasivo",
                "Ocupante",
                "Documento de propiedad",
                "Observaciones",
                "Conflicto identificado",
                "Proceso judicial/arbitral",
                "Consignación",
                "Responsable",
                "Acción siguiente",
                "",
              ].map((head) => (
                <th key={head} className="whitespace-nowrap px-3 py-2 font-semibold">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.code}
                className={`border-t border-slate-100 hover:bg-slate-50 ${row.risk === "Crítico" && row.deadline === "Vencido" && row.budget === "Sin disponibilidad" ? "bg-red-50/50" : ""}`}
              >
                <td className="px-3 py-2.5 font-bold text-[#dc2626]">{row.code}</td>
                <td className="px-3 py-2.5">{row.condition}</td>
                <td className="px-3 py-2.5 font-medium">{row.passive}</td>
                <td className="px-3 py-2.5">{row.occupant}</td>
                <td className="px-3 py-2.5">{row.propertyDoc}</td>
                <td className="px-3 py-2.5">{row.observations}</td>
                <td className="px-3 py-2.5">{row.conflict}</td>
                <td className="px-3 py-2.5">{row.proceeding}</td>
                <td className="px-3 py-2.5">{row.consignment}</td>
                <td className="px-3 py-2.5">{row.owner}</td>
                <td className="px-3 py-2.5 font-semibold">{row.next}</td>
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => onOpen(row)}
                    className="rounded border border-slate-200 p-1.5 text-slate-500 hover:text-red-600"
                  >
                    <Eye size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function RiskTable({
  rows,
  search,
  onSearch,
  onOpen,
}: {
  rows: RiskRow[];
  search: string;
  onSearch: (value: string) => void;
  onOpen: (row: RiskRow) => void;
}) {
  return (
    <section className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <TableHeader
        title="Tabla de riesgos y mitigaciones"
        subtitle="Exposición, responsables, plazos y estado de las medidas"
        search={search}
        onSearch={onSearch}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1420px] text-[10px]">
          <thead className="bg-slate-50 text-left uppercase text-slate-500">
            <tr>
              {[
                "Código",
                "Categoría",
                "Descripción",
                "Probabilidad",
                "Impacto",
                "Criticidad",
                "Monto expuesto",
                "Medida de mitigación",
                "Responsable",
                "Fecha límite",
                "Estado",
                "",
              ].map((head) => (
                <th key={head} className="whitespace-nowrap px-3 py-2 font-semibold">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2.5 font-bold">{row.code}</td>
                <td className="px-3 py-2.5">{row.category}</td>
                <td className="px-3 py-2.5 font-medium">{row.description}</td>
                <td className="px-3 py-2.5">{row.probability}/5</td>
                <td className="px-3 py-2.5">{row.impact}/5</td>
                <td className="px-3 py-2.5">
                  <RiskBadge level={row.level} />
                </td>
                <td className="px-3 py-2.5 font-semibold">{money(row.exposed)}</td>
                <td className="px-3 py-2.5">{row.mitigation}</td>
                <td className="px-3 py-2.5">{row.owner}</td>
                <td className="px-3 py-2.5">{row.deadline}</td>
                <td
                  className={`px-3 py-2.5 font-semibold ${row.status === "Vencido" || row.status === "Bloqueado" ? "text-red-700" : "text-slate-700"}`}
                >
                  {row.status}
                </td>
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => onOpen(row)}
                    className="rounded border border-slate-200 p-1.5 text-slate-500 hover:text-red-600"
                  >
                    <Eye size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const cls =
    level === "Crítico"
      ? "bg-red-100 text-red-700"
      : level === "Alto"
        ? "bg-orange-100 text-orange-700"
        : level === "Moderado"
          ? "bg-amber-100 text-amber-700"
          : "bg-green-100 text-green-700";
  return <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${cls}`}>{level}</span>;
}
function CriticalAlert({ onClose, onOpen }: { onClose: () => void; onOpen: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-[540px] overflow-hidden rounded-xl border border-red-200 bg-white shadow-2xl">
        <div className="flex items-start gap-3 bg-red-600 p-4 text-white">
          <AlertOctagon size={24} className="shrink-0" />
          <div className="flex-1">
            <h2 className="text-[15px] font-bold">Alerta legal crítica de atención inmediata</h2>
            <p className="mt-1 text-[11px] text-red-100">
              Se detectaron predios con tres condiciones críticas simultáneas.
            </p>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-white/15">
            <X size={17} />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
            <b className="text-[13px] text-red-800">PR-001905 · Inversiones del Centro SAC</b>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
              <span className="rounded bg-red-100 p-2 font-semibold text-red-700">
                Riesgo crítico
              </span>
              <span className="rounded bg-red-100 p-2 font-semibold text-red-700">
                Plazo vencido
              </span>
              <span className="rounded bg-red-100 p-2 font-semibold text-red-700">
                Sin presupuesto
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-600">
            Acción requerida: solicitar medida cautelar, gestionar disponibilidad presupuestal y
            escalar el caso al comité de riesgos.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded border border-slate-300 px-3 py-2 text-[11px]"
            >
              Revisar después
            </button>
            <button
              onClick={onOpen}
              className="rounded bg-[#dc2626] px-3 py-2 text-[11px] font-semibold text-white"
            >
              Abrir ficha crítica
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegalDrawer({ row, onClose }: { row: LegalRow; onClose: () => void }) {
  const fields = [
    ["Sujeto pasivo", row.passive],
    ["Condición jurídica", row.condition],
    ["Ocupante", row.occupant],
    ["Documento de propiedad", row.propertyDoc],
    ["Observaciones", row.observations],
    ["Conflicto identificado", row.conflict],
    ["Proceso judicial o arbitral", row.proceeding],
    ["Consignación", row.consignment],
    ["Responsable", row.owner],
    ["Acción siguiente", row.next],
    ["Riesgo / plazo", `${row.risk} · ${row.deadline}`],
    ["Presupuesto", row.budget],
  ];
  return (
    <Drawer
      title={row.code}
      subtitle="Ficha legal y trazabilidad del predio"
      fields={fields}
      onClose={onClose}
      icon={<Gavel size={18} />}
      action="Abrir expediente legal"
    />
  );
}
function RiskDrawer({ row, onClose }: { row: RiskRow; onClose: () => void }) {
  const fields = [
    ["Categoría", row.category],
    ["Descripción", row.description],
    ["Probabilidad / impacto", `${row.probability}/5 · ${row.impact}/5`],
    ["Criticidad", row.level],
    ["Monto expuesto", money(row.exposed)],
    ["Predios afectados", row.properties],
    ["Medida de mitigación", row.mitigation],
    ["Responsable", row.owner],
    ["Fecha límite", row.deadline],
    ["Estado", row.status],
  ];
  return (
    <Drawer
      title={`${row.code} · ${row.level}`}
      subtitle="Ficha de riesgo y medida de mitigación"
      fields={fields}
      onClose={onClose}
      icon={<ShieldAlert size={18} />}
      action="Actualizar medida de mitigación"
    />
  );
}
function Drawer({
  title,
  subtitle,
  fields,
  onClose,
  icon,
  action,
}: {
  title: string;
  subtitle: string;
  fields: Array<Array<string | number>>;
  onClose: () => void;
  icon: React.ReactNode;
  action: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/35"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className="flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <span className="mt-1 text-[#dc2626]">{icon}</span>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#dc2626]">
                  Detalle legal y de riesgo
                </div>
                <h2 className="mt-1 text-[20px] font-bold">{title}</h2>
                <p className="text-[11px] text-slate-500">{subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded border border-slate-200 p-1.5 text-slate-500"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="rounded-lg border border-slate-200">
            {fields.map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[160px_1fr] border-b border-slate-100 px-3 py-2.5 text-[11px] last:border-0"
              >
                <span className="text-slate-500">{label}</span>
                <b>{value}</b>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex gap-2 text-[11px] font-semibold text-amber-800">
              <FileWarning size={14} /> Seguimiento obligatorio
            </div>
            <p className="mt-1 text-[10px] text-amber-700">
              Registre evidencia y actualice la fecha comprometida después de ejecutar la siguiente
              acción.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 p-3">
          <button
            onClick={onClose}
            className="rounded border border-slate-300 px-3 py-2 text-[11px]"
          >
            Cerrar
          </button>
          <button className="rounded bg-[#dc2626] px-3 py-2 text-[11px] font-semibold text-white">
            {action}
          </button>
        </div>
      </aside>
    </div>
  );
}
