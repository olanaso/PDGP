import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownAZ,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileSpreadsheet,
  Search,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/seguimiento-monitoreo/seguimiento-personal")({
  head: () => ({ meta: [{ title: "Seguimiento del personal" }] }),
  component: SeguimientoPersonalPage,
});

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const TABS = [
  "Resumen",
  "Especialistas",
  "Participación",
  "Productividad",
  "Carga de Trabajo",
  "Análisis",
] as const;
const ACTIVITY_TYPES = [
  "Diagnóstico técnico-legal",
  "Estudio de títulos",
  "Elaboración de expedientes",
  "Tasaciones",
  "Trato directo",
  "Expropiaciones",
  "Gestión social",
  "Inscripción registral",
  "Atención de observaciones",
  "Seguimiento de pagos",
  "Elaboración de informes",
];

type Tab = (typeof TABS)[number];
type Team = "Equipo Legal" | "Equipo Técnico" | "Equipo Social" | "Equipo Administrativo";

type Specialist = {
  id: string;
  name: string;
  initials: string;
  profession: string;
  specialty: string;
  team: Team;
  coordination: string;
  supervisor: string;
  project: string;
  role: string;
  joined: string;
  monthly: number[];
  assigned: number;
  inProgress: number;
  pending: number;
  observed: number;
  overdue: number;
  properties: number;
  files: number;
  averageDays: number;
};

const SPECIALISTS: Specialist[] = [
  {
    id: "sp-01",
    name: "María Elena Salazar Rojas",
    initials: "MS",
    profession: "Abogada",
    specialty: "Adquisición predial",
    team: "Equipo Legal",
    coordination: "Coordinación Predial Aeropuertos 02",
    supervisor: "Marcos Soto Luis",
    project: "Jauja",
    role: "Especialista legal",
    joined: "15/03/2021",
    monthly: [8, 9, 10, 7, 11, 9, 12, 10, 13, 11, 9, 12],
    assigned: 142,
    inProgress: 13,
    pending: 7,
    observed: 4,
    overdue: 2,
    properties: 48,
    files: 39,
    averageDays: 7,
  },
  {
    id: "sp-02",
    name: "Carlos Alberto Mendoza Peña",
    initials: "CM",
    profession: "Abogado",
    specialty: "Saneamiento legal",
    team: "Equipo Legal",
    coordination: "Coordinación Predial Aeropuertos 02",
    supervisor: "Marcos Soto Luis",
    project: "Jauja",
    role: "Especialista legal",
    joined: "08/07/2020",
    monthly: [6, 7, 8, 9, 8, 10, 7, 9, 8, 10, 11, 9],
    assigned: 130,
    inProgress: 16,
    pending: 8,
    observed: 7,
    overdue: 3,
    properties: 42,
    files: 36,
    averageDays: 9,
  },
  {
    id: "sp-03",
    name: "Rosa Milagros Huamán Torres",
    initials: "RH",
    profession: "Abogada",
    specialty: "Derecho registral",
    team: "Equipo Legal",
    coordination: "Coordinación Predial Aeropuertos 02",
    supervisor: "Marcos Soto Luis",
    project: "Jauja",
    role: "Especialista registral",
    joined: "12/01/2022",
    monthly: [5, 6, 5, 7, 8, 6, 9, 8, 7, 9, 8, 10],
    assigned: 115,
    inProgress: 17,
    pending: 9,
    observed: 6,
    overdue: 4,
    properties: 35,
    files: 41,
    averageDays: 10,
  },
  {
    id: "sp-04",
    name: "Luis Fernando Quispe Ramos",
    initials: "LQ",
    profession: "Ingeniero",
    specialty: "Catastro",
    team: "Equipo Técnico",
    coordination: "Coordinación Predial Aeropuertos 02",
    supervisor: "Joel Lázaro Anaya",
    project: "Jauja",
    role: "Especialista técnico",
    joined: "04/11/2019",
    monthly: [10, 11, 12, 9, 13, 12, 14, 13, 12, 15, 13, 14],
    assigned: 176,
    inProgress: 14,
    pending: 6,
    observed: 4,
    overdue: 1,
    properties: 67,
    files: 31,
    averageDays: 6,
  },
  {
    id: "sp-05",
    name: "Ana Sofía Paredes Vega",
    initials: "AP",
    profession: "Arquitecta",
    specialty: "Edificaciones",
    team: "Equipo Técnico",
    coordination: "Coordinación Predial Aeropuertos 02",
    supervisor: "Joel Lázaro Anaya",
    project: "Jauja",
    role: "Especialista técnico",
    joined: "20/05/2021",
    monthly: [7, 8, 9, 8, 10, 11, 9, 12, 10, 11, 12, 10],
    assigned: 148,
    inProgress: 18,
    pending: 7,
    observed: 5,
    overdue: 2,
    properties: 54,
    files: 34,
    averageDays: 8,
  },
  {
    id: "sp-06",
    name: "Jorge Raúl Cárdenas León",
    initials: "JC",
    profession: "Ingeniero",
    specialty: "Topografía",
    team: "Equipo Técnico",
    coordination: "Coordinación Predial Vial 01",
    supervisor: "Rafael Palomino Rojas",
    project: "Piura",
    role: "Especialista topográfico",
    joined: "16/09/2018",
    monthly: [8, 7, 9, 10, 9, 8, 11, 10, 12, 9, 10, 11],
    assigned: 151,
    inProgress: 20,
    pending: 10,
    observed: 3,
    overdue: 3,
    properties: 59,
    files: 28,
    averageDays: 8,
  },
  {
    id: "sp-07",
    name: "Patricia del Pilar Núñez Soto",
    initials: "PN",
    profession: "Especialista social",
    specialty: "Gestión social",
    team: "Equipo Social",
    coordination: "Coordinación Predial Aeropuertos 02",
    supervisor: "Verónica Castro Medina",
    project: "Jauja",
    role: "Especialista social",
    joined: "10/02/2020",
    monthly: [6, 5, 7, 8, 7, 9, 8, 10, 9, 8, 10, 11],
    assigned: 126,
    inProgress: 18,
    pending: 11,
    observed: 4,
    overdue: 3,
    properties: 46,
    files: 22,
    averageDays: 9,
  },
  {
    id: "sp-08",
    name: "Miguel Ángel Rojas Silva",
    initials: "MR",
    profession: "Especialista social",
    specialty: "Relacionamiento comunitario",
    team: "Equipo Social",
    coordination: "Coordinación Predial Vial 01",
    supervisor: "Verónica Castro Medina",
    project: "Piura",
    role: "Gestor social",
    joined: "07/06/2022",
    monthly: [4, 5, 6, 5, 7, 6, 8, 7, 9, 8, 7, 9],
    assigned: 108,
    inProgress: 21,
    pending: 13,
    observed: 5,
    overdue: 5,
    properties: 39,
    files: 18,
    averageDays: 12,
  },
  {
    id: "sp-09",
    name: "Cecilia Vargas Medina",
    initials: "CV",
    profession: "Administrativa",
    specialty: "Control documental",
    team: "Equipo Administrativo",
    coordination: "Coordinación Predial Aeropuertos 02",
    supervisor: "Silvia Rivas Flores",
    project: "Jauja",
    role: "Analista administrativa",
    joined: "18/10/2021",
    monthly: [9, 8, 10, 9, 11, 10, 12, 11, 10, 13, 12, 11],
    assigned: 158,
    inProgress: 16,
    pending: 8,
    observed: 6,
    overdue: 2,
    properties: 31,
    files: 76,
    averageDays: 5,
  },
  {
    id: "sp-10",
    name: "Diego Alonso Chávez Luna",
    initials: "DC",
    profession: "Técnico",
    specialty: "Archivo predial",
    team: "Equipo Administrativo",
    coordination: "Coordinación Predial Aeropuertos 02",
    supervisor: "Silvia Rivas Flores",
    project: "Jauja",
    role: "Técnico administrativo",
    joined: "03/04/2023",
    monthly: [5, 4, 6, 5, 7, 6, 5, 8, 7, 6, 8, 7],
    assigned: 104,
    inProgress: 19,
    pending: 12,
    observed: 7,
    overdue: 6,
    properties: 28,
    files: 63,
    averageDays: 11,
  },
  {
    id: "sp-11",
    name: "Fernando Iván Valdivia Cruz",
    initials: "FV",
    profession: "Ingeniero",
    specialty: "Tasaciones",
    team: "Equipo Técnico",
    coordination: "Coordinación Predial Sur",
    supervisor: "Nelson Gutiérrez Minchola",
    project: "Tacna",
    role: "Perito tasador",
    joined: "22/08/2019",
    monthly: [7, 9, 8, 10, 11, 9, 12, 11, 10, 12, 13, 12],
    assigned: 156,
    inProgress: 15,
    pending: 7,
    observed: 8,
    overdue: 3,
    properties: 52,
    files: 37,
    averageDays: 8,
  },
  {
    id: "sp-12",
    name: "Lucía Esperanza Castro Díaz",
    initials: "LC",
    profession: "Abogada",
    specialty: "Expropiaciones",
    team: "Equipo Legal",
    coordination: "Coordinación Predial Sur",
    supervisor: "Nelson Gutiérrez Minchola",
    project: "Tacna",
    role: "Especialista legal",
    joined: "11/12/2020",
    monthly: [5, 7, 6, 8, 7, 9, 8, 9, 10, 8, 9, 10],
    assigned: 124,
    inProgress: 18,
    pending: 8,
    observed: 5,
    overdue: 4,
    properties: 38,
    files: 33,
    averageDays: 10,
  },
];

type Filters = {
  project: string;
  profession: string;
  specialty: string;
  team: string;
  coordination: string;
  supervisor: string;
  year: string;
  month: string;
};

const DEFAULT_FILTERS: Filters = {
  project: "Jauja",
  profession: "TODOS",
  specialty: "TODOS",
  team: "TODOS",
  coordination: "TODOS",
  supervisor: "TODOS",
  year: "2026",
  month: "6",
};

const PROJECT_MONTHLY_GOALS: Record<string, number[]> = {
  Jauja: [18, 19, 20, 21, 22, 23, 24, 24, 25, 25, 26, 27],
  Piura: [6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10],
  Tacna: [6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10],
};

function annualProduction(item: Specialist) {
  return item.monthly.reduce((sum, value) => sum + value, 0);
}

function completedForPeriod(item: Specialist, month: string) {
  return month === "TODOS" ? annualProduction(item) : (item.monthly[Number(month)] ?? 0);
}

function assignedForPeriod(item: Specialist, month: string) {
  return month === "TODOS" ? item.assigned : Math.ceil(item.assigned / 12);
}

function liberatedForMonth(item: Specialist, monthIndex: number) {
  const factor: Record<Team, number> = {
    "Equipo Legal": 0.3,
    "Equipo Técnico": 0.35,
    "Equipo Social": 0.2,
    "Equipo Administrativo": 0.1,
  };
  return Math.round((item.monthly[monthIndex] ?? 0) * factor[item.team]);
}

function liberatedForPeriod(item: Specialist, month: string) {
  if (month !== "TODOS") return liberatedForMonth(item, Number(month));
  return Math.min(
    item.properties,
    MONTHS.reduce((sum, _label, monthIndex) => sum + liberatedForMonth(item, monthIndex), 0),
  );
}

function projectGoalForPeriod(project: string, month: string) {
  const goals = PROJECT_MONTHLY_GOALS[project] ?? [];
  return month === "TODOS"
    ? goals.reduce((sum, value) => sum + value, 0)
    : (goals[Number(month)] ?? 0);
}

function projectLiberatedForPeriod(project: string, month: string) {
  return SPECIALISTS.filter((item) => item.project === project).reduce(
    (sum, item) => sum + liberatedForPeriod(item, month),
    0,
  );
}

function compliance(item: Specialist, month: string) {
  const assigned = assignedForPeriod(item, month);
  return assigned ? Math.min(100, (completedForPeriod(item, month) / assigned) * 100) : 0;
}

function complianceTone(value: number, overdue = 0) {
  if (value < 50 || overdue >= 5) return { label: "Crítico", color: "#dc2626", bg: "#fef2f2" };
  if (value < 70) return { label: "Alto", color: "#f97316", bg: "#fff7ed" };
  if (value < 90) return { label: "En riesgo", color: "#ca8a04", bg: "#fefce8" };
  return { label: "Cumple", color: "#16a34a", bg: "#f0fdf4" };
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function heatClass(value: number) {
  if (value === 0) return "bg-white text-slate-400";
  if (value <= 5) return "bg-yellow-50 text-yellow-800";
  if (value <= 8) return "bg-yellow-200 text-yellow-900";
  return "bg-green-100 text-green-800";
}

function participationValue(item: Specialist, activityIndex: number) {
  const seed = item.name.length + activityIndex * 5 + item.id.charCodeAt(item.id.length - 1);
  return seed % 8;
}

function xmlEscape(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function exportExcel(items: Specialist[], month: string) {
  const sheet = (name: string, rows: Array<Array<string | number>>) => `
    <Worksheet ss:Name="${xmlEscape(name)}"><Table>${rows
      .map(
        (row) =>
          `<Row>${row
            .map(
              (cell) =>
                `<Cell><Data ss:Type="${typeof cell === "number" ? "Number" : "String"}">${xmlEscape(cell)}</Data></Cell>`,
            )
            .join("")}</Row>`,
      )
      .join("")}</Table></Worksheet>`;
  const summary = [
    ["Indicador", "Valor"],
    ["Especialistas", items.length],
    ["Actividades asignadas", items.reduce((sum, item) => sum + assignedForPeriod(item, month), 0)],
    [
      "Actividades concluidas",
      items.reduce((sum, item) => sum + completedForPeriod(item, month), 0),
    ],
    ["Predios liberados", items.reduce((sum, item) => sum + liberatedForPeriod(item, month), 0)],
    ["Actividades vencidas", items.reduce((sum, item) => sum + item.overdue, 0)],
  ];
  const productivity = [
    [
      "Especialista",
      "Proyecto",
      ...MONTHS,
      "Total actividades",
      "Predios liberados",
      "Meta del proyecto",
      "Aporte individual %",
    ],
    ...items.map((item) => {
      const goal = projectGoalForPeriod(item.project, month);
      const liberated = liberatedForPeriod(item, month);
      return [
        item.name,
        item.project,
        ...item.monthly,
        annualProduction(item),
        liberated,
        goal,
        goal ? Number(((liberated / goal) * 100).toFixed(2)) : 0,
      ];
    }),
  ];
  const workload = [
    [
      "Especialista",
      "Asignadas",
      "Concluidas",
      "En proceso",
      "Pendientes",
      "Observadas",
      "Vencidas",
      "Predios liberados",
    ],
    ...items.map((item) => [
      item.name,
      item.assigned,
      annualProduction(item),
      item.inProgress,
      item.pending,
      item.observed,
      item.overdue,
      liberatedForPeriod(item, month),
    ]),
  ];
  const activities = [
    ["Especialista", "Proyecto", "Actividad", "Estado", "Avance"],
    ...items.flatMap((item) =>
      ACTIVITY_TYPES.slice(0, 4).map((activity, index) => [
        item.name,
        item.project,
        activity,
        index === 0 ? "Concluido" : index === 3 ? "Vencido" : "En proceso",
        index === 0 ? 100 : 35 + index * 15,
      ]),
    ),
  ];
  const alerts = [
    ["Especialista", "Proyecto", "Vencidas", "Recomendación"],
    ...items
      .filter((item) => item.overdue > 2)
      .map((item) => [
        item.name,
        item.project,
        item.overdue,
        "Reprogramar y priorizar actividades críticas",
      ]),
  ];
  const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${sheet("Resumen", summary)}${sheet("Productividad por Especialista", productivity)}${sheet("Actividades Detalladas", activities)}${sheet("Carga de Trabajo", workload)}${sheet("Alertas", alerts)}</Workbook>`;
  const url = URL.createObjectURL(new Blob([workbook], { type: "application/vnd.ms-excel" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "seguimiento_personal.xls";
  anchor.click();
  URL.revokeObjectURL(url);
}

function SeguimientoPersonalPage() {
  const [tab, setTab] = useState<Tab>("Resumen");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(0);

  const options = useMemo(
    () => ({
      project: unique(SPECIALISTS.map((item) => item.project)),
      profession: unique(SPECIALISTS.map((item) => item.profession)),
      specialty: unique(SPECIALISTS.map((item) => item.specialty)),
      team: unique(SPECIALISTS.map((item) => item.team)),
      coordination: unique(SPECIALISTS.map((item) => item.coordination)),
      supervisor: unique(SPECIALISTS.map((item) => item.supervisor)),
    }),
    [],
  );

  const filtered = useMemo(
    () =>
      SPECIALISTS.filter((item) => {
        if (filters.project !== "TODOS" && item.project !== filters.project) return false;
        if (filters.profession !== "TODOS" && item.profession !== filters.profession) return false;
        if (filters.specialty !== "TODOS" && item.specialty !== filters.specialty) return false;
        if (filters.team !== "TODOS" && item.team !== filters.team) return false;
        if (filters.coordination !== "TODOS" && item.coordination !== filters.coordination)
          return false;
        if (filters.supervisor !== "TODOS" && item.supervisor !== filters.supervisor) return false;
        return true;
      }),
    [filters],
  );

  const visible = focusId ? filtered.filter((item) => item.id === focusId) : filtered;
  const selected = SPECIALISTS.find((item) => item.id === detailId) ?? null;
  const totalAssigned = visible.reduce(
    (sum, item) => sum + assignedForPeriod(item, filters.month),
    0,
  );
  const totalCompleted = visible.reduce(
    (sum, item) => sum + completedForPeriod(item, filters.month),
    0,
  );
  const totalPending = visible.reduce((sum, item) => sum + item.pending, 0);
  const totalOverdue = visible.reduce((sum, item) => sum + item.overdue, 0);
  const averageCompliance = visible.length
    ? visible.reduce((sum, item) => sum + compliance(item, filters.month), 0) / visible.length
    : 0;
  const totalLiberated = visible.reduce(
    (sum, item) => sum + liberatedForPeriod(item, filters.month),
    0,
  );
  const projectsInView = unique(visible.map((item) => item.project));
  const totalProjectGoal = projectsInView.reduce(
    (sum, project) => sum + projectGoalForPeriod(project, filters.month),
    0,
  );
  const contributionToGoal = totalProjectGoal ? (totalLiberated / totalProjectGoal) * 100 : 0;

  const ranking = [...filtered]
    .sort((a, b) => completedForPeriod(b, filters.month) - completedForPeriod(a, filters.month))
    .slice(0, 10);
  const rankingMax = Math.max(...ranking.map((item) => completedForPeriod(item, filters.month)), 1);

  const evolution = MONTHS.map((month, monthIndex) => ({
    month,
    legal: filtered
      .filter((item) => item.team === "Equipo Legal")
      .reduce((sum, item) => sum + item.monthly[monthIndex], 0),
    tecnico: filtered
      .filter((item) => item.team === "Equipo Técnico")
      .reduce((sum, item) => sum + item.monthly[monthIndex], 0),
    social: filtered
      .filter((item) => item.team === "Equipo Social")
      .reduce((sum, item) => sum + item.monthly[monthIndex], 0),
    administrativo: filtered
      .filter((item) => item.team === "Equipo Administrativo")
      .reduce((sum, item) => sum + item.monthly[monthIndex], 0),
    meta: Math.max(12, Math.round(filtered.length * 7.5)),
  }));

  const workload = visible.slice(0, 10).map((item) => ({
    name: item.name.split(" ").slice(0, 2).join(" "),
    concluidas: completedForPeriod(item, filters.month),
    proceso: item.inProgress,
    pendientes: item.pending,
    observadas: item.observed,
    vencidas: item.overdue,
  }));

  const scatter = visible.map((item) => ({
    name: item.name,
    assigned: assignedForPeriod(item, filters.month),
    completed: completedForPeriod(item, filters.month),
    properties: item.properties,
    color: complianceTone(compliance(item, filters.month), item.overdue).color,
  }));

  const teamSummary = options.team.map((team) => {
    const members = filtered.filter((item) => item.team === team);
    const assigned = members.reduce((sum, item) => sum + assignedForPeriod(item, filters.month), 0);
    const completed = members.reduce(
      (sum, item) => sum + completedForPeriod(item, filters.month),
      0,
    );
    return {
      team: team.replace("Equipo ", ""),
      specialists: members.length,
      assigned,
      completed,
      productivity: members.length ? completed / members.length : 0,
      compliance: assigned ? (completed / assigned) * 100 : 0,
      workload: members.length ? assigned / members.length : 0,
      overdue: members.reduce((sum, item) => sum + item.overdue, 0),
      averageDays: members.length
        ? members.reduce((sum, item) => sum + item.averageDays, 0) / members.length
        : 0,
    };
  });

  const matrixRows = [...visible]
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortDesc ? annualProduction(b) - annualProduction(a) : a.name.localeCompare(b.name),
    );
  const pageCount = Math.max(1, Math.ceil(matrixRows.length / 8));
  const paginatedRows = matrixRows.slice(page * 8, page * 8 + 8);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setFocusId(null);
    setPage(0);
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6f8] text-slate-800">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <header className="border-b border-slate-200 bg-white px-5 pt-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <Users size={19} />
                </div>
                <div>
                  <h1 className="text-[20px] font-semibold">Seguimiento del Personal</h1>
                  <p className="text-[11px] text-slate-500">
                    Carga de trabajo, productividad y cumplimiento de especialistas prediales.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportExcel(filtered, filters.month)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-[11px] font-semibold hover:bg-slate-50"
              >
                <FileSpreadsheet size={14} className="text-green-600" /> Exportar a Excel
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-red-600 px-3 text-[11px] font-semibold text-white hover:bg-red-700"
              >
                <Download size={14} /> Exportar reporte
              </button>
            </div>
          </div>
          <div className="mt-4 flex gap-5 overflow-x-auto">
            {TABS.map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`shrink-0 border-b-2 px-1 pb-2 text-[12px] font-medium ${tab === item ? "border-red-600 text-red-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </header>

        <div className="space-y-3 p-4">
          <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[12px] font-semibold">Filtros del periodo</span>
              <button
                onClick={() => {
                  setFilters(DEFAULT_FILTERS);
                  setFocusId(null);
                }}
                className="text-[10px] font-semibold text-red-600 hover:underline"
              >
                Restablecer filtros
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
              <FilterSelect
                label="Proyecto"
                value={filters.project}
                options={options.project}
                onChange={(value) => updateFilter("project", value)}
              />
              <FilterSelect
                label="Profesión"
                value={filters.profession}
                options={options.profession}
                onChange={(value) => updateFilter("profession", value)}
              />
              <FilterSelect
                label="Especialidad"
                value={filters.specialty}
                options={options.specialty}
                onChange={(value) => updateFilter("specialty", value)}
              />
              <FilterSelect
                label="Equipo"
                value={filters.team}
                options={options.team}
                onChange={(value) => updateFilter("team", value)}
              />
              <FilterSelect
                label="Coordinación"
                value={filters.coordination}
                options={options.coordination}
                onChange={(value) => updateFilter("coordination", value)}
              />
              <FilterSelect
                label="Responsable"
                value={filters.supervisor}
                options={options.supervisor}
                onChange={(value) => updateFilter("supervisor", value)}
              />
              <FilterSelect
                label="Año"
                value={filters.year}
                options={["2026", "2025", "2024"]}
                includeAll={false}
                onChange={(value) => updateFilter("year", value)}
              />
              <FilterSelect
                label="Mes"
                value={filters.month}
                options={MONTHS.map((month, index) => ({ label: month, value: String(index) }))}
                onChange={(value) => updateFilter("month", value)}
              />
            </div>
          </section>

          {focusId && (
            <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-800">
              <span>
                Vista filtrada por especialista:{" "}
                <b>{SPECIALISTS.find((item) => item.id === focusId)?.name}</b>
              </span>
              <button onClick={() => setFocusId(null)} className="font-semibold hover:underline">
                Ver todo el equipo
              </button>
            </div>
          )}

          <section className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
            <KpiCard
              icon={Users}
              label="Especialistas activos"
              value={visible.length}
              trend="+1 vs. mes anterior"
              tone="green"
            />
            <KpiCard
              icon={BriefcaseBusiness}
              label="Actividades asignadas"
              value={totalAssigned}
              trend="+6.4%"
              tone="blue"
            />
            <KpiCard
              icon={CheckCircle2}
              label="Actividades concluidas"
              value={totalCompleted}
              trend="+8.2%"
              tone="green"
            />
            <KpiCard
              icon={Clock3}
              label="Actividades pendientes"
              value={totalPending}
              trend="-3.1%"
              tone="yellow"
            />
            <KpiCard
              icon={AlertTriangle}
              label="Actividades vencidas"
              value={totalOverdue}
              trend="Requiere atención"
              tone="red"
            />
            <KpiCard
              icon={Target}
              label="Cumplimiento promedio"
              value={`${averageCompliance.toFixed(1)}%`}
              trend="+4.5 pp"
              tone={averageCompliance >= 90 ? "green" : averageCompliance >= 70 ? "yellow" : "red"}
            />
            <KpiCard
              icon={TrendingUp}
              label="Productividad promedio"
              value={visible.length ? (totalCompleted / visible.length).toFixed(1) : "0"}
              trend="Actividades / persona"
              tone="green"
            />
            <KpiCard
              icon={UserCheck}
              label="Predios liberados"
              value={totalLiberated}
              trend={`${contributionToGoal.toFixed(1)}% de la meta del proyecto`}
              tone={
                contributionToGoal >= 90 ? "green" : contributionToGoal >= 70 ? "yellow" : "red"
              }
            />
          </section>

          {(tab === "Resumen" || tab === "Especialistas" || tab === "Productividad") && (
            <ProfessionalContributionPanel
              items={visible}
              month={filters.month}
              onOpen={setDetailId}
            />
          )}

          {tab === "Resumen" && (
            <>
              <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <Panel
                  title="Ranking de productividad"
                  subtitle="Seleccione una barra para analizar al especialista"
                >
                  <div className="space-y-2.5">
                    {ranking.map((item, index) => {
                      const value = completedForPeriod(item, filters.month);
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setFocusId(item.id);
                            setDetailId(item.id);
                          }}
                          className="grid w-full grid-cols-[22px_minmax(150px,1fr)_2fr_40px] items-center gap-2 text-left text-[10px]"
                        >
                          <span className="text-center font-semibold text-slate-400">
                            {index + 1}
                          </span>
                          <span className="truncate font-medium text-slate-700">{item.name}</span>
                          <span className="h-4 overflow-hidden rounded bg-slate-100">
                            <span
                              className="block h-full rounded bg-red-500"
                              style={{ width: `${(value / rankingMax) * 100}%` }}
                            />
                          </span>
                          <b className="text-right">{value}</b>
                        </button>
                      );
                    })}
                  </div>
                </Panel>
                <Panel
                  title="Evolución mensual de productividad"
                  subtitle="Producción por equipo comparada con la meta de coordinación"
                >
                  <ResponsiveContainer width="100%" height={285}>
                    <LineChart data={evolution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line dataKey="legal" name="Legal" stroke="#dc2626" strokeWidth={2} />
                      <Line dataKey="tecnico" name="Técnico" stroke="#2563eb" strokeWidth={2} />
                      <Line dataKey="social" name="Social" stroke="#16a34a" strokeWidth={2} />
                      <Line
                        dataKey="administrativo"
                        name="Administrativo"
                        stroke="#7c3aed"
                        strokeWidth={2}
                      />
                      <Line dataKey="meta" name="Meta" stroke="#64748b" strokeDasharray="5 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </Panel>
              </section>
              <AlertsPanel items={visible} month={filters.month} onOpen={setDetailId} />
            </>
          )}

          {tab === "Especialistas" && (
            <SpecialistsDirectory
              items={matrixRows}
              month={filters.month}
              search={search}
              onSearch={(value) => {
                setSearch(value);
                setPage(0);
              }}
              onOpen={setDetailId}
            />
          )}

          {tab === "Productividad" && (
            <>
              <TeamCards teams={teamSummary} />
              <ProductivityMatrix
                items={paginatedRows}
                search={search}
                onSearch={(value) => {
                  setSearch(value);
                  setPage(0);
                }}
                sortDesc={sortDesc}
                onSort={() => setSortDesc((value) => !value)}
                onOpen={setDetailId}
              />
              <div className="flex items-center justify-end gap-2 text-[10px] text-slate-500">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                  className="rounded border p-1 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <span>
                  Página {page + 1} de {pageCount}
                </span>
                <button
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
                  className="rounded border p-1 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </>
          )}

          {tab === "Participación" && (
            <>
              <ParticipationOverview items={visible} />
              <ParticipationMatrix items={visible} onOpen={setDetailId} />
            </>
          )}

          {tab === "Carga de Trabajo" && (
            <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              <Panel
                title="Carga de trabajo por especialista"
                subtitle="Distribución de actividades según su estado"
              >
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={workload} layout="vertical" margin={{ left: 26 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 9 }} />
                    <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                    <Bar dataKey="concluidas" stackId="a" fill="#16a34a" />
                    <Bar dataKey="proceso" stackId="a" fill="#2563eb" />
                    <Bar dataKey="pendientes" stackId="a" fill="#eab308" />
                    <Bar dataKey="observadas" stackId="a" fill="#f97316" />
                    <Bar dataKey="vencidas" stackId="a" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
              <Panel
                title="Carga versus productividad"
                subtitle="El tamaño representa la cantidad de predios asignados"
              >
                <ResponsiveContainer width="100%" height={360}>
                  <ScatterChart margin={{ left: 8, right: 22, bottom: 14 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="assigned"
                      name="Asignadas"
                      tick={{ fontSize: 9 }}
                      label={{ value: "Actividades asignadas", position: "bottom", fontSize: 10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="completed"
                      name="Concluidas"
                      tick={{ fontSize: 9 }}
                    />
                    <ZAxis type="number" dataKey="properties" range={[70, 320]} />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter data={scatter}>
                      {scatter.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </Panel>
            </section>
          )}

          {tab === "Análisis" && <AnalysisPanel rows={teamSummary} evolution={evolution} />}
        </div>
      </main>
      {selected && (
        <SpecialistDrawer item={selected} month={filters.month} onClose={() => setDetailId(null)} />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  includeAll = true,
}: {
  label: string;
  value: string;
  options: Array<string | { label: string; value: string }>;
  onChange: (value: string) => void;
  includeAll?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block truncate text-[9px] font-medium text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-[10px] outline-none focus:border-red-400"
      >
        {includeAll && <option value="TODOS">Todos</option>}
        {options.map((option) => {
          const item = typeof option === "string" ? { label: option, value: option } : option;
          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  trend: string;
  tone: "green" | "blue" | "yellow" | "red";
}) {
  const colors = {
    green: "text-green-700 bg-green-50",
    blue: "text-blue-700 bg-blue-50",
    yellow: "text-yellow-700 bg-yellow-50",
    red: "text-red-700 bg-red-50",
  };
  return (
    <article className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className={`mb-2 flex size-7 items-center justify-center rounded-md ${colors[tone]}`}>
        <Icon size={14} />
      </div>
      <div className="text-[20px] font-semibold tracking-tight text-slate-900">{value}</div>
      <div className="mt-0.5 min-h-7 text-[10px] font-medium leading-3 text-slate-600">{label}</div>
      <div className={`mt-1.5 truncate text-[9px] ${colors[tone].split(" ")[0]}`}>{trend}</div>
    </article>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-[13px] font-semibold text-slate-800">{title}</h2>
        <p className="mt-0.5 text-[10px] text-slate-500">{subtitle}</p>
      </div>
      {children}
      <div className="mt-3 border-t border-slate-100 pt-2 text-[8px] text-slate-400">
        Fuente: registro demostrativo de actividades · Actualizado 07/08/2026
      </div>
    </section>
  );
}

function ProfessionalContributionPanel({
  items,
  month,
  onOpen,
}: {
  items: Specialist[];
  month: string;
  onOpen: (id: string) => void;
}) {
  const periodLabel = month === "TODOS" ? "Acumulado anual 2026" : `${MONTHS[Number(month)]} 2026`;
  const rows = [...items].sort(
    (a, b) => liberatedForPeriod(b, month) - liberatedForPeriod(a, month),
  );
  const projects = unique(items.map((item) => item.project));
  const filteredLiberated = items.reduce((sum, item) => sum + liberatedForPeriod(item, month), 0);
  const combinedGoal = projects.reduce(
    (sum, project) => sum + projectGoalForPeriod(project, month),
    0,
  );

  return (
    <Panel
      title="Aporte del profesional a la meta de liberación predial"
      subtitle="Aporte individual = predios liberados por el profesional ÷ meta mensual del proyecto. El avance del proyecto considera a todo su equipo."
    >
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <SmallMetric label="Periodo evaluado" value={periodLabel} />
        <SmallMetric label="Predios liberados por la selección" value={filteredLiberated} />
        <SmallMetric label="Meta conjunta de los proyectos" value={combinedGoal} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-[10px]">
          <thead>
            <tr className="border-y border-slate-200 bg-slate-50 text-slate-500">
              <th className="p-2">Profesional</th>
              <th className="p-2">Profesión / equipo</th>
              <th className="p-2 text-center">Proyecto</th>
              <th className="p-2 text-center">Actividades realizadas</th>
              <th className="p-2 text-center">Predios liberados</th>
              <th className="p-2 text-center">Meta mensual</th>
              <th className="p-2">Aporte individual a la meta</th>
              <th className="p-2">Avance total del proyecto</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const liberated = liberatedForPeriod(item, month);
              const goal = projectGoalForPeriod(item.project, month);
              const projectLiberated = projectLiberatedForPeriod(item.project, month);
              const individualContribution = goal ? (liberated / goal) * 100 : 0;
              const projectProgress = goal ? (projectLiberated / goal) * 100 : 0;
              const tone = complianceTone(projectProgress);
              return (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-2">
                    <button
                      onClick={() => onOpen(item.id)}
                      className="font-semibold text-slate-700 hover:text-red-600 hover:underline"
                    >
                      {item.name}
                    </button>
                    <div className="text-[8px] text-slate-400">{item.specialty}</div>
                  </td>
                  <td className="p-2">
                    <div>{item.profession}</div>
                    <div className="text-[8px] text-slate-400">{item.team}</div>
                  </td>
                  <td className="p-2 text-center font-medium">{item.project}</td>
                  <td className="p-2 text-center text-[13px] font-semibold">
                    {completedForPeriod(item, month)}
                  </td>
                  <td className="p-2 text-center text-[14px] font-bold text-green-700">
                    {liberated}
                  </td>
                  <td className="p-2 text-center font-semibold">{goal}</td>
                  <td className="p-2">
                    <div className="mb-1 flex justify-between gap-2">
                      <span>
                        {liberated} de {goal} predios
                      </span>
                      <b>{individualContribution.toFixed(1)}%</b>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{ width: `${Math.min(100, individualContribution)}%` }}
                      />
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="mb-1 flex justify-between gap-2">
                      <span>{projectLiberated} liberados</span>
                      <b style={{ color: tone.color }}>{projectProgress.toFixed(1)}%</b>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, projectProgress)}%`,
                          background: tone.color,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function ProductivityMatrix({
  items,
  search,
  onSearch,
  sortDesc,
  onSort,
  onOpen,
}: {
  items: Specialist[];
  search: string;
  onSearch: (value: string) => void;
  sortDesc: boolean;
  onSort: () => void;
  onOpen: (id: string) => void;
}) {
  return (
    <Panel
      title="Matriz de productividad por especialista"
      subtitle="Cada celda muestra actividades concluidas; el color permite reconocer rápidamente niveles bajos y altos."
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <label className="relative">
          <Search size={13} className="absolute left-2 top-2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Buscar especialista"
            className="h-8 w-64 rounded-md border border-slate-300 pl-7 pr-2 text-[10px]"
          />
        </label>
        <button
          onClick={onSort}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 px-3 text-[10px] font-medium"
        >
          <ArrowDownAZ size={13} /> {sortDesc ? "Mayor productividad" : "Orden alfabético"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1050px] w-full border-collapse text-[9px]">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="sticky left-0 z-10 min-w-56 border border-slate-200 bg-slate-100 px-2 py-2 text-left">
                Apellidos y nombres
              </th>
              {MONTHS.map((month) => (
                <th key={month} className="border border-slate-200 px-2 py-2 text-center">
                  {month}
                </th>
              ))}
              <th className="border border-slate-200 bg-slate-200 px-3 py-2 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="sticky left-0 z-10 border border-slate-200 bg-white px-2 py-2">
                  <button
                    onClick={() => onOpen(item.id)}
                    className="font-medium text-slate-700 hover:text-red-600 hover:underline"
                  >
                    {item.name}
                  </button>
                  <div className="text-[8px] text-slate-400">{item.team}</div>
                </td>
                {item.monthly.map((value, index) => (
                  <td
                    key={`${item.id}-${MONTHS[index]}`}
                    className={`border border-slate-200 px-2 py-2 text-center font-semibold ${heatClass(value)}`}
                  >
                    {value}
                  </td>
                ))}
                <td className="border border-slate-200 bg-slate-100 px-3 py-2 text-center font-bold text-slate-800">
                  {annualProduction(item)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function SpecialistsDirectory({
  items,
  month,
  search,
  onSearch,
  onOpen,
}: {
  items: Specialist[];
  month: string;
  search: string;
  onSearch: (value: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <Panel
      title="Directorio operativo de especialistas"
      subtitle="Muestra qué realizó cada profesional, su carga vigente, los predios que liberó y su nivel de cumplimiento."
    >
      <label className="relative mb-3 block w-72 max-w-full">
        <Search size={13} className="absolute left-2 top-2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Buscar por nombre"
          className="h-8 w-full rounded-md border border-slate-300 pl-7 pr-2 text-[10px]"
        />
      </label>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left text-[9px]">
          <thead>
            <tr className="border-y border-slate-200 bg-slate-50 text-slate-500">
              <th className="p-2">Especialista</th>
              <th className="p-2">Profesión y equipo</th>
              <th className="p-2 text-center">Proyecto</th>
              <th className="p-2 text-center">Asignadas</th>
              <th className="p-2 text-center">Realizadas</th>
              <th className="p-2 text-center">Predios liberados</th>
              <th className="p-2 text-center">Pendientes</th>
              <th className="p-2 text-center">Vencidas</th>
              <th className="p-2">Cumplimiento de actividades</th>
              <th className="p-2 text-center">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const assigned = assignedForPeriod(item, month);
              const completed = completedForPeriod(item, month);
              const liberated = liberatedForPeriod(item, month);
              const value = compliance(item, month);
              const tone = complianceTone(value, item.overdue);
              return (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-full bg-red-50 font-bold text-red-600">
                        {item.initials}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-700">{item.name}</div>
                        <div className="text-[8px] text-slate-400">{item.specialty}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div>{item.profession}</div>
                    <div className="text-[8px] text-slate-400">{item.team}</div>
                  </td>
                  <td className="p-2 text-center font-medium">{item.project}</td>
                  <td className="p-2 text-center">{assigned}</td>
                  <td className="p-2 text-center text-[12px] font-bold text-blue-700">
                    {completed}
                  </td>
                  <td className="p-2 text-center text-[12px] font-bold text-green-700">
                    {liberated}
                  </td>
                  <td className="p-2 text-center">{item.pending}</td>
                  <td className="p-2 text-center font-semibold text-red-600">{item.overdue}</td>
                  <td className="p-2">
                    <div className="mb-1 flex justify-between gap-2">
                      <span style={{ color: tone.color }}>{tone.label}</span>
                      <b>{value.toFixed(1)}%</b>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(100, value)}%`, background: tone.color }}
                      />
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => onOpen(item.id)}
                      className="rounded-md border border-red-200 px-2 py-1 font-semibold text-red-600 hover:bg-red-50"
                    >
                      Ver ficha
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function ParticipationOverview({ items }: { items: Specialist[] }) {
  const activityTotals = ACTIVITY_TYPES.map((activity, index) => ({
    activity,
    total: items.reduce((sum, item) => sum + participationValue(item, index), 0),
  })).sort((a, b) => b.total - a.total);
  const maximum = Math.max(...activityTotals.map((item) => item.total), 1);
  const teamTotals = unique(items.map((item) => item.team)).map((team) => {
    const members = items.filter((item) => item.team === team);
    return {
      team,
      members: members.length,
      interventions: members.reduce(
        (total, item) =>
          total +
          ACTIVITY_TYPES.reduce(
            (sum, _activity, index) => sum + participationValue(item, index),
            0,
          ),
        0,
      ),
    };
  });
  return (
    <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_0.8fr]">
      <Panel
        title="Actividades con mayor participación"
        subtitle="Total de intervenciones registradas por tipo de actividad en el periodo."
      >
        <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
          {activityTotals.map((item) => (
            <div
              key={item.activity}
              className="grid grid-cols-[minmax(150px,1fr)_1.5fr_30px] items-center gap-2 text-[9px]"
            >
              <span className="truncate text-slate-600">{item.activity}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <span
                  className="block h-full rounded-full bg-red-400"
                  style={{ width: `${(item.total / maximum) * 100}%` }}
                />
              </span>
              <b className="text-right">{item.total}</b>
            </div>
          ))}
        </div>
      </Panel>
      <Panel
        title="Participación por equipo"
        subtitle="Intervenciones y especialistas que las realizaron."
      >
        <div className="space-y-2">
          {teamTotals.map((item) => (
            <div key={item.team} className="rounded-md border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold">{item.team}</span>
                <b className="text-[14px] text-red-600">{item.interventions}</b>
              </div>
              <div className="mt-1 text-[8px] text-slate-400">
                {item.members} especialistas · {item.interventions} intervenciones
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function ParticipationMatrix({
  items,
  onOpen,
}: {
  items: Specialist[];
  onOpen: (id: string) => void;
}) {
  return (
    <Panel
      title="Participación por tipo de actividad"
      subtitle="Número de intervenciones registradas por especialista y actividad predial."
    >
      <div className="overflow-x-auto">
        <table className="min-w-[1250px] w-full border-collapse text-[9px]">
          <thead>
            <tr className="bg-slate-100">
              <th className="sticky left-0 z-10 min-w-56 border border-slate-200 bg-slate-100 p-2 text-left">
                Especialista
              </th>
              {ACTIVITY_TYPES.map((activity) => (
                <th
                  key={activity}
                  className="min-w-24 border border-slate-200 p-2 text-center leading-3"
                >
                  {activity}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="sticky left-0 z-10 border border-slate-200 bg-white p-2">
                  <button
                    onClick={() => onOpen(item.id)}
                    className="font-medium hover:text-red-600 hover:underline"
                  >
                    {item.name}
                  </button>
                </td>
                {ACTIVITY_TYPES.map((activity, index) => {
                  const value = participationValue(item, index);
                  return (
                    <td
                      key={activity}
                      className={`border border-slate-200 p-2 text-center font-semibold ${heatClass(value)}`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function TeamCards({ teams }: { teams: ReturnType<typeof buildTeamType>[] }) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {teams.map((team) => (
        <article
          key={team.team}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="text-[12px] font-semibold">Equipo {team.team}</div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <SmallMetric label="Integrantes" value={team.specialists} />
            <SmallMetric label="Producción" value={team.completed} />
            <SmallMetric label="Promedio" value={team.productivity.toFixed(1)} />
          </div>
        </article>
      ))}
    </section>
  );
}

function buildTeamType() {
  return {
    team: "",
    specialists: 0,
    assigned: 0,
    completed: 0,
    productivity: 0,
    compliance: 0,
    workload: 0,
    overdue: 0,
    averageDays: 0,
  };
}

function SmallMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-slate-50 p-2">
      <div className="text-[15px] font-semibold">{value}</div>
      <div className="text-[8px] text-slate-500">{label}</div>
    </div>
  );
}

function AlertsPanel({
  items,
  month,
  onOpen,
}: {
  items: Specialist[];
  month: string;
  onOpen: (id: string) => void;
}) {
  const alerts = [...items].sort((a, b) => b.overdue - a.overdue).slice(0, 6);
  return (
    <Panel
      title="Alertas del personal"
      subtitle="Casos que requieren revisión del responsable o jefe de equipo."
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-[10px]">
          <thead>
            <tr className="border-b bg-slate-50 text-slate-500">
              <th className="p-2">Especialista</th>
              <th className="p-2">Proyecto</th>
              <th className="p-2">Alerta</th>
              <th className="p-2">Criticidad</th>
              <th className="p-2">Días</th>
              <th className="p-2">Acción recomendada</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((item) => {
              const value = compliance(item, month);
              const tone = complianceTone(value, item.overdue);
              return (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="p-2">
                    <button
                      onClick={() => onOpen(item.id)}
                      className="font-medium hover:text-red-600 hover:underline"
                    >
                      {item.name}
                    </button>
                  </td>
                  <td className="p-2">{item.project}</td>
                  <td className="p-2">{item.overdue} actividades vencidas</td>
                  <td className="p-2">
                    <span
                      className="rounded-full px-2 py-1 font-semibold"
                      style={{ color: tone.color, background: tone.bg }}
                    >
                      {tone.label}
                    </span>
                  </td>
                  <td className="p-2">{item.overdue * 3 + 2}</td>
                  <td className="p-2">Priorizar vencidos y redistribuir carga</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function AnalysisPanel({
  rows,
  evolution,
}: {
  rows: ReturnType<typeof buildTeamType>[];
  evolution: Array<{
    month: string;
    legal: number;
    tecnico: number;
    social: number;
    administrativo: number;
    meta: number;
  }>;
}) {
  return (
    <div className="space-y-3">
      <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.35fr_1fr]">
        <Panel
          title="Comparativo entre equipos"
          subtitle="Indicadores consolidados para orientar la distribución de personal."
        >
          <div className="overflow-x-auto">
            <table className="min-w-[850px] w-full text-[9px]">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="p-2 text-left">Equipo</th>
                  <th>Especialistas</th>
                  <th>Asignadas</th>
                  <th>Concluidas</th>
                  <th>Promedio</th>
                  <th>Cumplimiento</th>
                  <th>Carga/persona</th>
                  <th>Vencidas</th>
                  <th>Tiempo prom.</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.team} className="border-b text-center">
                    <td className="p-2 text-left font-medium">{row.team}</td>
                    <td>{row.specialists}</td>
                    <td>{row.assigned}</td>
                    <td>{row.completed}</td>
                    <td>{row.productivity.toFixed(1)}</td>
                    <td>{row.compliance.toFixed(1)}%</td>
                    <td>{row.workload.toFixed(1)}</td>
                    <td className={row.overdue > 7 ? "font-semibold text-red-600" : ""}>
                      {row.overdue}
                    </td>
                    <td>{row.averageDays.toFixed(1)} días</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel
          title="Producción y carga por equipo"
          subtitle="Compara actividades asignadas y concluidas."
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="team" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="assigned" name="Asignadas" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Concluidas" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </section>
      <Panel
        title="Tendencia mensual comparativa entre equipos"
        subtitle="Permite reconocer equipos que mejoran, pierden productividad o se alejan de la meta mensual."
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={evolution}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line dataKey="legal" name="Equipo Legal" stroke="#dc2626" strokeWidth={2} />
            <Line dataKey="tecnico" name="Equipo Técnico" stroke="#2563eb" strokeWidth={2} />
            <Line dataKey="social" name="Equipo Social" stroke="#16a34a" strokeWidth={2} />
            <Line
              dataKey="administrativo"
              name="Equipo Administrativo"
              stroke="#7c3aed"
              strokeWidth={2}
            />
            <Line dataKey="meta" name="Meta mensual" stroke="#64748b" strokeDasharray="5 4" />
          </LineChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

function SpecialistDrawer({
  item,
  month,
  onClose,
}: {
  item: Specialist;
  month: string;
  onClose: () => void;
}) {
  const completed = completedForPeriod(item, month);
  const assigned = assignedForPeriod(item, month);
  const value = compliance(item, month);
  const tone = complianceTone(value, item.overdue);
  const liberated = liberatedForPeriod(item, month);
  const projectGoal = projectGoalForPeriod(item.project, month);
  const individualContribution = projectGoal ? (liberated / projectGoal) * 100 : 0;
  const projectLiberated = projectLiberatedForPeriod(item.project, month);
  const projectProgress = projectGoal ? (projectLiberated / projectGoal) * 100 : 0;
  const activities = ACTIVITY_TYPES.slice(0, 6).map((activity, index) => ({
    activity,
    code: `AERO-${item.project.toUpperCase()}-PR-${String(91 + index).padStart(4, "0")}`,
    file: `EXP-${2026}-${118 + index}`,
    assigned: `${String(2 + index).padStart(2, "0")}/07/2026`,
    due: `${String(12 + index * 2).padStart(2, "0")}/08/2026`,
    status:
      index === 0
        ? "Concluido"
        : index === 4
          ? "Vencido"
          : index === 3
            ? "Observado"
            : "En proceso",
    progress: index === 0 ? 100 : index === 4 ? 55 : 35 + index * 12,
  }));
  return (
    <div
      className="fixed inset-0 z-[120] flex justify-end bg-black/35"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <aside className="h-full w-[min(920px,96vw)] overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between bg-red-700 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/15 text-[15px] font-bold">
              {item.initials}
            </div>
            <div>
              <div className="text-[10px] text-red-100">
                Seguimiento individual del especialista
              </div>
              <h2 className="text-[16px] font-semibold">{item.name}</h2>
              <p className="text-[10px] text-red-100">
                {item.role} · {item.team}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1.5 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <ProfileValue label="Profesión" value={item.profession} />
            <ProfileValue label="Especialidad" value={item.specialty} />
            <ProfileValue label="Coordinación" value={item.coordination} />
            <ProfileValue label="Supervisor" value={item.supervisor} />
            <ProfileValue label="Cargo" value={item.role} />
            <ProfileValue label="Fecha de ingreso" value={item.joined} />
            <ProfileValue label="Estado laboral" value="Activo" />
            <ProfileValue label="Proyecto principal" value={item.project} />
          </section>
          <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <SmallMetric label="Predios asignados" value={item.properties} />
            <SmallMetric label="Predios liberados" value={liberated} />
            <SmallMetric label="Expedientes" value={item.files} />
            <SmallMetric label="Concluidas" value={completed} />
            <SmallMetric label="Pendientes" value={item.pending} />
            <SmallMetric label="Vencidas" value={item.overdue} />
            <SmallMetric label="Productividad acumulada" value={annualProduction(item)} />
            <SmallMetric label="Tiempo promedio" value={`${item.averageDays} días`} />
            <div
              className="rounded-md p-2 text-center"
              style={{ background: tone.bg, color: tone.color }}
            >
              <div className="text-[15px] font-semibold">{value.toFixed(1)}%</div>
              <div className="text-[8px]">Cumplimiento · {tone.label}</div>
            </div>
          </section>
          <section className="rounded-lg border border-red-100 bg-red-50/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-[12px] font-semibold text-slate-800">
                  Aporte a la meta de liberación de {item.project}
                </h3>
                <p className="mt-0.5 text-[9px] text-slate-500">
                  {month === "TODOS" ? "Acumulado anual" : `${MONTHS[Number(month)]} 2026`} · La
                  meta del proyecto es {projectGoal} predios.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-red-700 shadow-sm">
                Aporte individual: {individualContribution.toFixed(1)}%
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <ProgressMetric
                label={`${item.name.split(" ")[0]} liberó ${liberated} de ${projectGoal} predios de la meta`}
                value={individualContribution}
                color="#dc2626"
              />
              <ProgressMetric
                label={`El proyecto lleva ${projectLiberated} de ${projectGoal} predios liberados`}
                value={projectProgress}
                color={complianceTone(projectProgress).color}
              />
            </div>
          </section>
          <Panel
            title="Actividades detalladas"
            subtitle={`${assigned} actividades asignadas en el periodo seleccionado`}
          >
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full text-[9px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-2 text-left">Proyecto</th>
                    <th className="p-2 text-left">Código predio</th>
                    <th className="p-2 text-left">Expediente</th>
                    <th className="p-2 text-left">Tipo de actividad</th>
                    <th>Asignación</th>
                    <th>Programada</th>
                    <th>Estado</th>
                    <th>Avance</th>
                    <th>Días atención</th>
                    <th>Días retraso</th>
                    <th>Prioridad</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity, index) => (
                    <tr key={activity.file} className="border-b">
                      <td className="p-2">{item.project}</td>
                      <td className="p-2 font-mono">{activity.code}</td>
                      <td className="p-2 font-mono">{activity.file}</td>
                      <td className="p-2">{activity.activity}</td>
                      <td className="text-center">{activity.assigned}</td>
                      <td className="text-center">{activity.due}</td>
                      <td className="text-center">
                        <span
                          className={`rounded-full px-2 py-1 ${activity.status === "Vencido" ? "bg-red-50 text-red-700" : activity.status === "Concluido" ? "bg-green-50 text-green-700" : activity.status === "Observado" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}
                        >
                          {activity.status}
                        </span>
                      </td>
                      <td className="text-center">{activity.progress}%</td>
                      <td className="text-center">{5 + index * 2}</td>
                      <td className="text-center font-semibold text-red-600">
                        {activity.status === "Vencido" ? 6 : 0}
                      </td>
                      <td className="text-center">{index === 4 ? "Alta" : "Media"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </aside>
    </div>
  );
}

function ProfileValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-2">
      <div className="text-[8px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-[10px] font-medium text-slate-700">{value}</div>
    </div>
  );
}

function ProgressMetric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-md bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-3 text-[9px] text-slate-600">
        <span>{label}</span>
        <b className="shrink-0 text-[11px]" style={{ color }}>
          {value.toFixed(1)}%
        </b>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, value)}%`, background: color }}
        />
      </div>
    </div>
  );
}
