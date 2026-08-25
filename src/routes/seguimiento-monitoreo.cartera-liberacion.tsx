import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FilterX,
  Flag,
  Gauge,
  LandPlot,
  MapPinned,
  Search,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartExplanation } from "../components/ChartExplanation";

import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/seguimiento-monitoreo/cartera-liberacion")({
  head: () => ({ meta: [{ title: "Avance y disponibilidad predial" }] }),
  component: CarteraLiberacionPage,
});

const COLORS = {
  red: "#dc2626",
  green: "#16a34a",
  blue: "#2563eb",
  amber: "#f59e0b",
  slate: "#64748b",
  purple: "#7c3aed",
};

type Filters = {
  project: string;
  section: string;
  sector: string;
  affectation: string;
  procedure: string;
  status: string;
  owner: string;
  start: string;
  end: string;
};

const defaultFilters: Filters = {
  project: "TODOS",
  section: "TODOS",
  sector: "TODOS",
  affectation: "TODAS",
  procedure: "TODOS",
  status: "TODOS",
  owner: "TODOS",
  start: "2026-01-01",
  end: "2026-12-31",
};

const funnelStages = [
  ["Identificación", 1248, 100, 4],
  ["Diagnóstico", 1176, 94.2, 8],
  ["Empadronamiento", 1084, 92.2, 11],
  ["Expediente técnico-legal", 956, 88.2, 18],
  ["Tasación", 824, 86.2, 24],
  ["Oferta", 718, 87.1, 12],
  ["Aceptación", 632, 88, 15],
  ["Pago", 548, 86.7, 21],
  ["Entrega", 491, 89.6, 9],
  ["Inscripción", 427, 87, 32],
] as const;

const sectionBase = [
  { name: "Tramo I · Norte", released: 72, process: 17, pending: 7, critical: 4 },
  { name: "Tramo I · Centro", released: 61, process: 21, pending: 12, critical: 6 },
  { name: "Tramo II · Norte", released: 84, process: 10, pending: 4, critical: 2 },
  { name: "Tramo II · Sur", released: 54, process: 24, pending: 13, critical: 9 },
  { name: "Tramo III · Este", released: 67, process: 19, pending: 9, critical: 5 },
  { name: "Tramo III · Oeste", released: 43, process: 26, pending: 18, critical: 13 },
  { name: "Acceso Norte", released: 76, process: 14, pending: 7, critical: 3 },
];

const procedures = [
  {
    name: "Trato directo ordinario",
    pending: 66,
    process: 128,
    accepted: 94,
    rejected: 21,
    paid: 176,
    closed: 142,
  },
  {
    name: "Expropiación",
    pending: 22,
    process: 54,
    accepted: 12,
    rejected: 18,
    paid: 47,
    closed: 39,
  },
  {
    name: "Reconocimiento de mejoras",
    pending: 29,
    process: 46,
    accepted: 38,
    rejected: 8,
    paid: 51,
    closed: 42,
  },
  {
    name: "Transferencia estatal",
    pending: 17,
    process: 36,
    accepted: 29,
    rejected: 3,
    paid: 22,
    closed: 31,
  },
  {
    name: "Ejecución coactiva",
    pending: 11,
    process: 24,
    accepted: 6,
    rejected: 15,
    paid: 18,
    closed: 12,
  },
];

const ganttRows = [
  {
    section: "Tramo I",
    activity: "Delimitación del tramo",
    start: 0,
    duration: 18,
    progress: 100,
    delay: 0,
    owner: "M. Salazar",
  },
  {
    section: "Tramo I",
    activity: "Empadronamiento y calificación",
    start: 16,
    duration: 27,
    progress: 100,
    delay: 0,
    owner: "C. Romero",
  },
  {
    section: "Tramo I",
    activity: "Aprobación del padrón y tasaciones",
    start: 41,
    duration: 32,
    progress: 78,
    delay: 6,
    owner: "L. Quispe",
  },
  {
    section: "Tramo I",
    activity: "Liberación",
    start: 70,
    duration: 31,
    progress: 54,
    delay: 9,
    owner: "A. Paredes",
  },
  {
    section: "Tramo I",
    activity: "Inscripción registral",
    start: 99,
    duration: 22,
    progress: 18,
    delay: 0,
    owner: "R. Huamán",
  },
  {
    section: "Tramo II",
    activity: "Delimitación del tramo",
    start: 8,
    duration: 20,
    progress: 100,
    delay: 0,
    owner: "M. Salazar",
  },
  {
    section: "Tramo II",
    activity: "Empadronamiento y calificación",
    start: 26,
    duration: 34,
    progress: 82,
    delay: 12,
    owner: "C. Romero",
  },
  {
    section: "Tramo II",
    activity: "Aprobación del padrón y tasaciones",
    start: 58,
    duration: 30,
    progress: 45,
    delay: 16,
    owner: "L. Quispe",
  },
  {
    section: "Tramo II",
    activity: "Liberación",
    start: 86,
    duration: 35,
    progress: 12,
    delay: 8,
    owner: "A. Paredes",
  },
  {
    section: "Tramo II",
    activity: "Inscripción registral",
    start: 118,
    duration: 20,
    progress: 0,
    delay: 0,
    owner: "R. Huamán",
  },
];

const prediosBase = [
  [
    "PR-001842",
    "María Elena Rojas",
    "Tramo I",
    842.4,
    "Tasación",
    "12/06/2026",
    54,
    "Certificado",
    "Pendiente",
    "No entregado",
    "Anotación preventiva",
    "L. Quispe",
    "Tasación observada",
  ],
  [
    "PR-001873",
    "Comunidad San Jerónimo",
    "Tramo II",
    3260.8,
    "Oferta",
    "28/05/2026",
    69,
    "Disponible",
    "Programado",
    "Parcial",
    "En trámite",
    "A. Paredes",
    "Impacta camino crítico",
  ],
  [
    "PR-001905",
    "Inversiones del Centro SAC",
    "Tramo III",
    1480.2,
    "Expediente técnico-legal",
    "09/04/2026",
    118,
    "Sin certificación",
    "Bloqueado",
    "No entregado",
    "Pendiente",
    "M. Salazar",
    "Controversia de linderos",
  ],
  [
    "PR-001927",
    "Sucesión Flores Huamán",
    "Tramo I",
    615.7,
    "Aceptación",
    "18/06/2026",
    48,
    "Certificado",
    "Aceptado",
    "Por programar",
    "Título observado",
    "C. Romero",
    "Sucesión intestada",
  ],
  [
    "PR-001944",
    "Municipalidad Distrital Norte",
    "Acceso Norte",
    5410.6,
    "Transferencia",
    "02/07/2026",
    34,
    "No aplica",
    "No aplica",
    "Parcial",
    "En trámite",
    "R. Huamán",
    "Acuerdo de concejo pendiente",
  ],
  [
    "PR-001968",
    "José Antonio Medina",
    "Tramo II",
    392.1,
    "Pago",
    "21/07/2026",
    15,
    "Devengado",
    "Programado",
    "No entregado",
    "Anotación preventiva",
    "A. Paredes",
    "Sin alerta",
  ],
  [
    "PR-001991",
    "Agrícola Santa Ana SRL",
    "Tramo III",
    2268.9,
    "Entrega",
    "11/07/2026",
    25,
    "Pagado",
    "Pagado",
    "Acta observada",
    "En trámite",
    "C. Romero",
    "Ocupante precario",
  ],
  [
    "PR-002014",
    "Rosa Milagros Chávez",
    "Tramo II",
    729.3,
    "Diagnóstico",
    "17/03/2026",
    141,
    "Por solicitar",
    "Pendiente",
    "No entregado",
    "Sin iniciar",
    "M. Salazar",
    "No ubicada",
  ],
  [
    "PR-002037",
    "Consorcio Vial Andino",
    "Tramo III",
    1894.5,
    "Expropiación",
    "05/05/2026",
    92,
    "Certificado",
    "En trámite",
    "No entregado",
    "Bloqueado",
    "L. Quispe",
    "Apelación judicial",
  ],
  [
    "PR-002058",
    "Comunidad Campesina Central",
    "Tramo I",
    6840.2,
    "Inscripción",
    "25/06/2026",
    42,
    "Pagado",
    "Pagado",
    "Entregado",
    "Título presentado",
    "R. Huamán",
    "Subsanación registral",
  ],
] as const;

const impactBase = [
  ["PR-001905", 118, 1480, "Controversia de linderos", "M. Salazar"],
  ["PR-002014", 104, 729, "Sujeto pasivo no ubicado", "C. Romero"],
  ["PR-002037", 92, 1895, "Apelación judicial", "L. Quispe"],
  ["PR-001873", 69, 3261, "Tasación impugnada", "A. Paredes"],
  ["PR-002081", 64, 940, "Duplicidad registral", "R. Huamán"],
  ["PR-001927", 58, 616, "Sucesión intestada", "C. Romero"],
  ["PR-002106", 52, 2120, "Falta disponibilidad presupuestal", "L. Quispe"],
  ["PR-001842", 47, 842, "Tasación observada", "A. Paredes"],
  ["PR-002124", 41, 515, "Ocupante precario", "M. Salazar"],
  ["PR-002143", 38, 1280, "Rectificación de área", "R. Huamán"],
] as const;

type SelectedPredio = (typeof prediosBase)[number] | null;

function number(value: number, digits = 0) {
  return value.toLocaleString("es-PE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function CarteraLiberacionPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [search, setSearch] = useState("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedPredio, setSelectedPredio] = useState<SelectedPredio>(null);
  const [updatedAt, setUpdatedAt] = useState("05/08/2026 10:15");

  const scope = useMemo(() => {
    let value = 1;
    if (filters.project !== "TODOS") value *= 0.46;
    if (filters.section !== "TODOS") value *= 0.7;
    if (filters.sector !== "TODOS") value *= 0.82;
    if (filters.affectation !== "TODAS") value *= 0.76;
    if (filters.procedure !== "TODOS") value *= 0.68;
    if (filters.status !== "TODOS") value *= 0.62;
    if (filters.owner !== "TODOS") value *= 0.54;
    if (selectedSection) value *= 0.41;
    return value;
  }, [filters, selectedSection]);

  const available = 68.4;
  const cards = [
    {
      label: "Predios identificados",
      value: number(Math.round(1248 * scope)),
      note: "100% de la cartera",
      trend: 3.2,
      color: "blue",
    },
    {
      label: "Predios en proceso",
      value: number(Math.round(621 * scope)),
      note: "49.8% del total",
      trend: -2.1,
      color: "amber",
    },
    {
      label: "Predios pagados",
      value: number(Math.round(548 * scope)),
      note: "43.9% del total",
      trend: 8.3,
      color: "green",
    },
    {
      label: "Predios entregados",
      value: number(Math.round(491 * scope)),
      note: "39.3% del total",
      trend: 6.8,
      color: "green",
    },
    {
      label: "Predios inscritos",
      value: number(Math.round(427 * scope)),
      note: "34.2% del total",
      trend: 5.7,
      color: "blue",
    },
    {
      label: "Área total requerida",
      value: `${number(286.4 * scope, 1)} ha`,
      note: "Área afectada consolidada",
      trend: 1.4,
      color: "blue",
    },
    {
      label: "Área liberada",
      value: `${number(195.9 * scope, 1)} ha`,
      note: "68.4% del área",
      trend: 7.1,
      color: "green",
    },
    {
      label: "Disponibilidad física",
      value: `${available.toFixed(1)}%`,
      note: "Meta del periodo: 75%",
      trend: 4.6,
      color: "amber",
    },
    {
      label: "Predios críticos",
      value: number(Math.max(1, Math.round(37 * scope))),
      note: "Bloquean el avance de obra",
      trend: -11.9,
      color: "red",
    },
  ] as const;

  const filteredPredios = prediosBase.filter((row) => {
    const query = search.trim().toLowerCase();
    if (query && !`${row[0]} ${row[1]}`.toLowerCase().includes(query)) return false;
    if (filters.owner !== "TODOS" && row[11] !== filters.owner) return false;
    if (selectedSection && !selectedSection.includes(row[2])) return false;
    return true;
  });

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function reset() {
    setFilters(defaultFilters);
    setSearch("");
    setSelectedSection(null);
  }

  function exportCsv() {
    const header =
      "codigo,sujeto_pasivo,tramo,area,etapa,dias,estado_pago,estado_entrega,estado_registral,responsable,alerta\n";
    const rows = filteredPredios
      .map((row) =>
        [row[0], row[1], row[2], row[3], row[4], row[6], row[8], row[9], row[10], row[11], row[12]]
          .map((cell) => `"${cell}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff", header, rows], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "cartera_liberacion_predial.csv";
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
              <LandPlot size={21} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[20px] font-semibold tracking-tight">
                  Avance y disponibilidad predial
                </h1>
                {selectedSection && (
                  <button
                    onClick={() => setSelectedSection(null)}
                    className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700"
                  >
                    Filtro: {selectedSection} <X size={11} />
                  </button>
                )}
              </div>
              <p className="text-[12px] text-slate-500">
                Estado integral de los inmuebles requeridos y su disponibilidad física para la
                ejecución de obra
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
              className="inline-flex h-8 items-center gap-1.5 rounded border border-slate-300 bg-white px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <FilterX size={14} /> Restablecer
            </button>
            <button
              onClick={exportCsv}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-3 text-[12px] font-semibold text-white hover:bg-[#b91c1c]"
            >
              <Download size={14} /> Exportar
            </button>
          </div>
        </header>

        <section className="mb-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-700">
              <MapPinned size={15} className="text-[#dc2626]" /> Alcance de la cartera predial
            </div>
            <button
              onClick={() => setUpdatedAt("05/08/2026 10:37")}
              className="text-[11px] font-medium text-[#dc2626] hover:underline"
            >
              Actualizar información
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-10">
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
              label="Tramo"
              value={filters.section}
              onChange={(v) => update("section", v)}
              options={["TODOS", "Tramo I", "Tramo II", "Tramo III", "Acceso Norte"]}
            />
            <FilterSelect
              label="Sector"
              value={filters.sector}
              onChange={(v) => update("sector", v)}
              options={["TODOS", "Norte", "Centro", "Sur", "Oeste"]}
            />
            <FilterSelect
              label="Tipo de afectación"
              value={filters.affectation}
              onChange={(v) => update("affectation", v)}
              options={["TODAS", "Total", "Parcial", "Temporal", "Servidumbre"]}
            />
            <FilterSelect
              label="Procedimiento"
              value={filters.procedure}
              onChange={(v) => update("procedure", v)}
              options={["TODOS", "Trato directo", "Expropiación", "Transferencia estatal"]}
            />
            <FilterSelect
              label="Estado del predio"
              value={filters.status}
              onChange={(v) => update("status", v)}
              options={[
                "TODOS",
                "Pendiente",
                "En proceso",
                "Liberado",
                "Crítico",
                ...funnelStages.map(([stage]) => stage),
              ]}
            />
            <FilterSelect
              label="Responsable"
              value={filters.owner}
              onChange={(v) => update("owner", v)}
              options={["TODOS", "M. Salazar", "C. Romero", "L. Quispe", "A. Paredes", "R. Huamán"]}
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

        <section className="mb-3 grid gap-3 2xl:grid-cols-[.9fr_1.1fr]">
          <Panel
            title="Embudo de maduración predial"
            subtitle="Muestra cuántos predios llegan a cada etapa, qué porcentaje continúa desde la etapa anterior y cuánto tiempo permanecen allí."
            icon={<Flag size={15} />}
          >
            <div className="space-y-1.5 py-1">
              {funnelStages.map(([stage, count, conversion, days], index) => {
                const scaled = Math.round(count * scope);
                const width = 100 - index * 5.2;
                return (
                  <button
                    key={stage}
                    onClick={() => update("status", stage)}
                    className="group mx-auto grid min-h-8 grid-cols-[1fr_auto] items-center rounded px-3 text-left text-white shadow-sm transition hover:brightness-95"
                    style={{
                      width: `${width}%`,
                      background: `hsl(${218 - index * 3} 72% ${44 + index * 1.3}%)`,
                    }}
                  >
                    <span className="truncate text-[10px] font-semibold">{stage}</span>
                    <span className="flex items-center gap-2 text-[9px]">
                      <b>{number(scaled)} predios</b>
                      <i className="h-3 w-px bg-white/40" />
                      {conversion}%<i className="h-3 w-px bg-white/40" />
                      {days} días
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex justify-center gap-4 text-[9px] text-slate-500">
              <span>Cantidad</span>
              <span>% respecto a etapa anterior</span>
              <span>Tiempo promedio</span>
            </div>
          </Panel>

          <Panel
            title="Disponibilidad por tramo y sector"
            subtitle="Cada barra compara la proporción de predios liberados, en proceso, pendientes y críticos por tramo o sector. Seleccione una para filtrar."
            icon={<LandPlot size={15} />}
          >
            <ResponsiveContainer width="100%" height={382}>
              <BarChart
                data={sectionBase}
                layout="vertical"
                margin={{ left: 20, right: 18, top: 8 }}
                onClick={(state) => {
                  if (typeof state?.activeLabel === "string")
                    setSelectedSection((current) =>
                      current === state.activeLabel ? null : state.activeLabel,
                    );
                }}
              >
                <CartesianGrid stroke="#edf0f4" strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={118}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar
                  dataKey="released"
                  name="Liberados"
                  stackId="a"
                  fill={COLORS.green}
                  cursor="pointer"
                />
                <Bar
                  dataKey="process"
                  name="En proceso"
                  stackId="a"
                  fill={COLORS.blue}
                  cursor="pointer"
                />
                <Bar
                  dataKey="pending"
                  name="Pendiente documental"
                  stackId="a"
                  fill={COLORS.amber}
                  cursor="pointer"
                />
                <Bar
                  dataKey="critical"
                  name="Críticos"
                  stackId="a"
                  fill={COLORS.red}
                  radius={[0, 3, 3, 0]}
                  cursor="pointer"
                >
                  {sectionBase.map((row) => (
                    <Cell
                      key={row.name}
                      opacity={selectedSection && selectedSection !== row.name ? 0.35 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </section>

        <section className="mb-3">
          <Panel
            title="Cronograma de disponibilidad de áreas"
            subtitle="Ubica las actividades en el calendario y permite comparar fecha programada, avance real, días de retraso y responsable."
            icon={<CalendarDays size={15} />}
          >
            <Gantt
              rows={ganttRows.filter(
                (row) => !selectedSection || selectedSection.includes(row.section),
              )}
            />
          </Panel>
        </section>

        <section className="mb-3">
          <Panel
            title="Cartera por procedimiento y estado"
            subtitle="Compara cuántos predios están pendientes, en trámite, aceptados, rechazados, pagados o cerrados para cada procedimiento."
            icon={<Building2 size={15} />}
          >
            <ResponsiveContainer width="100%" height={315}>
              <BarChart
                data={procedures.map((row) =>
                  Object.fromEntries(
                    Object.entries(row).map(([key, value]) => [
                      key,
                      typeof value === "number" ? Math.round(value * scope) : value,
                    ]),
                  ),
                )}
                margin={{ left: 8, right: 14, top: 10 }}
              >
                <CartesianGrid stroke="#edf0f4" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={{ fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="pending" name="Pendiente" stackId="a" fill="#cbd5e1" />
                <Bar dataKey="process" name="En trámite" stackId="a" fill={COLORS.blue} />
                <Bar dataKey="accepted" name="Aceptado" stackId="a" fill={COLORS.purple} />
                <Bar dataKey="rejected" name="Rechazado" stackId="a" fill={COLORS.red} />
                <Bar dataKey="paid" name="Pagado" stackId="a" fill={COLORS.amber} />
                <Bar
                  dataKey="closed"
                  name="Cerrado"
                  stackId="a"
                  fill={COLORS.green}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </section>

        <section className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2.5">
            <div>
              <h2 className="text-[13px] font-semibold text-slate-800">
                Tabla operativa de predios
              </h2>
              <p className="text-[10px] text-slate-500">
                Seguimiento de permanencia, pago, entrega, registro y alertas
              </p>
            </div>
            <div className="flex h-8 w-72 items-center gap-2 rounded border border-slate-200 px-2 text-slate-400">
              <Search size={14} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar código o sujeto pasivo..."
                className="min-w-0 flex-1 bg-transparent text-[11px] text-slate-700 outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1520px] text-[10px]">
              <thead className="bg-slate-50 text-left uppercase tracking-wide text-slate-500">
                <tr>
                  {[
                    "Código",
                    "Sujeto pasivo",
                    "Tramo",
                    "Área afectada",
                    "Etapa actual",
                    "Ingreso a etapa",
                    "Días",
                    "Estado presupuestal",
                    "Estado de pago",
                    "Estado de entrega",
                    "Estado registral",
                    "Responsable",
                    "Alerta",
                    "",
                  ].map((head) => (
                    <th key={head} className="whitespace-nowrap px-3 py-2 font-semibold">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPredios.map((row) => (
                  <tr key={row[0]} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-bold text-[#dc2626]">{row[0]}</td>
                    <td className="max-w-52 truncate px-3 py-2.5 font-medium text-slate-800">
                      {row[1]}
                    </td>
                    <td className="px-3 py-2.5">{row[2]}</td>
                    <td className="px-3 py-2.5">{number(row[3], 1)} m²</td>
                    <td className="px-3 py-2.5">
                      <StatusPill text={row[4]} tone="blue" />
                    </td>
                    <td className="px-3 py-2.5">{row[5]}</td>
                    <td
                      className={`px-3 py-2.5 font-bold ${row[6] > 60 ? "text-red-700" : row[6] > 30 ? "text-amber-700" : "text-green-700"}`}
                    >
                      {row[6]}
                    </td>
                    <td className="px-3 py-2.5">{row[7]}</td>
                    <td className="px-3 py-2.5">
                      <StatusPill
                        text={row[8]}
                        tone={
                          row[8] === "Pagado" ? "green" : row[8] === "Bloqueado" ? "red" : "amber"
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5">{row[9]}</td>
                    <td className="px-3 py-2.5">{row[10]}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1">
                        <UserRound size={11} />
                        {row[11]}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-2.5 font-medium ${row[12] === "Sin alerta" ? "text-green-700" : "text-red-700"}`}
                    >
                      {row[12]}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setSelectedPredio(row)}
                        title="Abrir ficha individual"
                        className="rounded border border-slate-200 p-1.5 text-slate-500 hover:border-red-200 hover:text-red-600"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filteredPredios.length && (
            <div className="p-8 text-center text-[12px] text-slate-500">
              No se encontraron predios con los filtros seleccionados.
            </div>
          )}
        </section>

        <section className="mb-3 grid gap-3 xl:grid-cols-[.7fr_1.3fr]">
          <Panel
            title="Disponibilidad predial global"
            subtitle="Resume qué porcentaje del área requerida ya puede ser ocupado por la obra; un valor bajo indica restricciones físicas pendientes."
            icon={<Gauge size={15} />}
          >
            <GaugeChart value={available} />
          </Panel>
          <Panel
            title="Top 10 · Mayor impacto en el cronograma"
            subtitle="Ordena los predios según su impacto en el cronograma y muestra retraso, área afectada, causa y responsable de la siguiente acción."
            icon={<ShieldAlert size={15} />}
          >
            <div className="max-h-[370px] overflow-auto">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-white text-left text-slate-500">
                  <tr>
                    <th className="py-2"># / Predio</th>
                    <th>Días retraso</th>
                    <th>Área bloqueada</th>
                    <th>Causa</th>
                    <th>Responsable siguiente acción</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {impactBase.map(([code, days, area, cause, owner], index) => (
                    <tr key={code} className="border-t border-slate-100">
                      <td className="py-2 font-semibold">
                        <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-red-50 text-[9px] text-red-700">
                          {index + 1}
                        </span>
                        {code}
                      </td>
                      <td className="font-bold text-red-700">{days} días</td>
                      <td>{number(area)} m²</td>
                      <td>{cause}</td>
                      <td>
                        <span className="inline-flex items-center gap-1">
                          <UserRound size={11} />
                          {owner}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            const match = prediosBase.find((row) => row[0] === code);
                            if (match) setSelectedPredio(match);
                          }}
                          className="rounded p-1 text-slate-400 hover:text-red-600"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </section>
      </main>
      {selectedPredio && (
        <PredioDrawer row={selectedPredio} onClose={() => setSelectedPredio(null)} />
      )}
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
    <label className="block">
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
  const icon = { blue: MapPinned, green: LandPlot, amber: Clock3, red: AlertTriangle }[color];
  const Icon = icon;
  return (
    <div
      className={`min-h-[116px] rounded-lg border border-slate-200 border-t-[3px] bg-white p-2.5 shadow-sm ${top}`}
    >
      <div className="flex min-h-8 items-start justify-between gap-2">
        <span className="text-[10px] font-semibold leading-4 text-slate-600">{label}</span>
        <Icon
          size={14}
          className={`shrink-0 ${color === "red" ? "text-red-500" : color === "green" ? "text-green-600" : color === "amber" ? "text-amber-500" : "text-blue-600"}`}
        />
      </div>
      <div className="mt-1 text-[20px] font-bold tracking-tight text-slate-900">{value}</div>
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

function Gantt({ rows }: { rows: typeof ganttRows }) {
  const colors: Record<string, string> = {
    "Delimitación del tramo": COLORS.slate,
    "Empadronamiento y calificación": COLORS.blue,
    "Aprobación del padrón y tasaciones": COLORS.purple,
    Liberación: COLORS.green,
    "Inscripción registral": COLORS.amber,
  };
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1180px]">
        <div className="grid grid-cols-[280px_1fr_185px] border-b border-slate-200 pb-2 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
          <div>Tramo / actividad</div>
          <div className="grid grid-cols-6 text-center">
            <span>Ene</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Abr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
          <div className="pl-3">Avance / responsable</div>
        </div>
        {rows.map((row, index) => (
          <div
            key={`${row.section}-${row.activity}`}
            className="grid min-h-[42px] grid-cols-[280px_1fr_185px] items-center border-b border-slate-100 py-1.5 text-[10px]"
          >
            <div className="flex items-center gap-2">
              <b className="w-14 text-[#dc2626]">{row.section}</b>
              <span>{row.activity}</span>
            </div>
            <div
              className="relative h-7 rounded bg-slate-50"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent calc(16.66% - 1px), #e2e8f0 16.66%)",
                backgroundSize: "16.66% 100%",
              }}
            >
              <div
                className="absolute top-1 h-5 overflow-hidden rounded shadow-sm"
                style={{
                  left: `${(row.start / 140) * 100}%`,
                  width: `${(row.duration / 140) * 100}%`,
                  background: `${colors[row.activity]}44`,
                  border: `1px solid ${colors[row.activity]}`,
                }}
              >
                <div
                  className="h-full"
                  style={{ width: `${row.progress}%`, background: colors[row.activity] }}
                />
              </div>
              {row.delay > 0 && (
                <span
                  className="absolute -top-1 text-[8px] font-bold text-red-700"
                  style={{ left: `${Math.min(94, ((row.start + row.duration) / 140) * 100)}%` }}
                >
                  +{row.delay}d
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 pl-3">
              <span
                className={`font-bold ${row.progress < 50 ? "text-amber-700" : "text-green-700"}`}
              >
                {row.progress}%
              </span>
              <span className="truncate text-slate-500">{row.owner}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ text, tone }: { text: string; tone: "blue" | "green" | "amber" | "red" }) {
  const cls = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  }[tone];
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold ${cls}`}
    >
      {text}
    </span>
  );
}

function GaugeChart({ value }: { value: number }) {
  const data = [
    { value, color: value >= 75 ? COLORS.green : value >= 60 ? COLORS.amber : COLORS.red },
    { value: 100 - value, color: "#e2e8f0" },
  ];
  return (
    <div className="relative mx-auto max-w-md">
      <ResponsiveContainer width="100%" height={245}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            startAngle={180}
            endAngle={0}
            cx="50%"
            cy="78%"
            innerRadius={75}
            outerRadius={108}
            stroke="none"
          >
            {data.map((row, index) => (
              <Cell key={index} fill={row.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-x-0 bottom-9 text-center">
        <div className="text-[35px] font-bold text-slate-900">{value.toFixed(1)}%</div>
        <div className="text-[10px] text-slate-500">DISPONIBILIDAD GLOBAL</div>
      </div>
      <div className="absolute bottom-4 left-[16%] text-[9px] text-red-600">0%</div>
      <div className="absolute bottom-4 right-[16%] text-[9px] text-green-600">100%</div>
      <div className="mt-[-16px] grid grid-cols-3 gap-2 text-center text-[9px]">
        <span className="rounded bg-red-50 p-1 text-red-700">Crítico &lt; 60%</span>
        <span className="rounded bg-amber-50 p-1 text-amber-700">En riesgo 60–75%</span>
        <span className="rounded bg-green-50 p-1 text-green-700">Meta ≥ 75%</span>
      </div>
    </div>
  );
}

function PredioDrawer({ row, onClose }: { row: NonNullable<SelectedPredio>; onClose: () => void }) {
  const fields = [
    ["Sujeto pasivo", row[1]],
    ["Tramo", row[2]],
    ["Área afectada", `${number(row[3], 1)} m²`],
    ["Etapa actual", row[4]],
    ["Ingreso a etapa", row[5]],
    ["Días transcurridos", `${row[6]} días`],
    ["Estado presupuestal", row[7]],
    ["Estado de pago", row[8]],
    ["Estado de entrega", row[9]],
    ["Estado registral", row[10]],
    ["Responsable", row[11]],
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/30"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className="flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#dc2626]">
                Ficha individual del predio
              </div>
              <h2 className="mt-1 text-[21px] font-bold text-slate-900">{row[0]}</h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Trazabilidad técnico-legal, presupuestal y registral
              </p>
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
          <div
            className={`mb-4 flex items-start gap-3 rounded-lg border p-3 ${row[12] === "Sin alerta" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            <AlertTriangle
              size={17}
              className={row[12] === "Sin alerta" ? "text-green-600" : "text-red-600"}
            />
            <div>
              <b className="text-[11px]">Alerta operativa</b>
              <p className="mt-0.5 text-[11px] text-slate-700">{row[12]}</p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200">
            {fields.map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[150px_1fr] border-b border-slate-100 px-3 py-2.5 text-[11px] last:border-0"
              >
                <span className="text-slate-500">{label}</span>
                <b className="text-slate-800">{value}</b>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h3 className="mb-2 text-[11px] font-semibold text-slate-800">Hitos recientes</h3>
            {[
              "Expediente actualizado y validado",
              "Control de calidad técnico-legal",
              "Asignación de responsable",
              "Ingreso a la etapa actual",
            ].map((item, index) => (
              <div
                key={item}
                className="flex gap-3 border-l-2 border-slate-200 pb-4 pl-4 text-[10px]"
              >
                <i
                  className={`-ml-[21px] mt-0.5 size-2.5 rounded-full ${index === 0 ? "bg-green-500" : "bg-slate-300"}`}
                />
                <div>
                  <b>{item}</b>
                  <p className="mt-0.5 text-slate-500">
                    {5 + index * 8}/07/2026 · Sistema de Gestión Predial
                  </p>
                </div>
              </div>
            ))}
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
            Abrir expediente completo
          </button>
        </div>
      </aside>
    </div>
  );
}
