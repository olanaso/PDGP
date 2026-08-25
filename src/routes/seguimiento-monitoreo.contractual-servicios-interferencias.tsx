import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Cable,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  FileWarning,
  FilterX,
  Gauge,
  HandCoins,
  Network,
  Search,
  ShieldAlert,
  WalletCards,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
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

export const Route = createFileRoute("/seguimiento-monitoreo/contractual-servicios-interferencias")(
  {
    head: () => ({ meta: [{ title: "Contratos, servicios e interferencias" }] }),
    component: ContractualServiciosPage,
  },
);

const COLORS = {
  red: "#dc2626",
  green: "#16a34a",
  blue: "#2563eb",
  amber: "#f59e0b",
  purple: "#7c3aed",
  cyan: "#0891b2",
  slate: "#64748b",
};

const contracts = [
  {
    number: "CS-014-2026",
    provider: "Consorcio Predial Centro",
    service: "Diagnóstico técnico-legal",
    amount: 12.8,
    start: "15/01/2026",
    end: "30/11/2026",
    physical: 72,
    financial: 68,
    compliant: 18,
    observed: 3,
    penalties: 0.12,
    balance: 4.1,
    owner: "M. Salazar",
    paid: 6.4,
    payable: 1.2,
    committed: 1.1,
  },
  {
    number: "OS-087-2026",
    provider: "GeoVial Ingeniería SAC",
    service: "Topografía",
    amount: 9.6,
    start: "02/02/2026",
    end: "15/10/2026",
    physical: 83,
    financial: 76,
    compliant: 24,
    observed: 2,
    penalties: 0.04,
    balance: 2.3,
    owner: "C. Romero",
    paid: 6.1,
    payable: 0.8,
    committed: 0.4,
  },
  {
    number: "CS-021-2026",
    provider: "Tasaciones Andinas SRL",
    service: "Tasación",
    amount: 8.4,
    start: "10/03/2026",
    end: "20/12/2026",
    physical: 61,
    financial: 64,
    compliant: 15,
    observed: 5,
    penalties: 0.18,
    balance: 3.0,
    owner: "L. Quispe",
    paid: 4.2,
    payable: 0.9,
    committed: 0.3,
  },
  {
    number: "OS-103-2026",
    provider: "Gestión Social Perú",
    service: "Gestión social",
    amount: 7.2,
    start: "05/01/2026",
    end: "28/09/2026",
    physical: 78,
    financial: 59,
    compliant: 19,
    observed: 6,
    penalties: 0.21,
    balance: 2.9,
    owner: "A. Paredes",
    paid: 3.4,
    payable: 0.8,
    committed: 0.1,
  },
  {
    number: "CS-029-2026",
    provider: "InterRedes Consultores",
    service: "Interferencias",
    amount: 6.8,
    start: "18/02/2026",
    end: "05/11/2026",
    physical: 52,
    financial: 57,
    compliant: 11,
    observed: 7,
    penalties: 0.26,
    balance: 2.5,
    owner: "R. Huamán",
    paid: 3.0,
    payable: 0.7,
    committed: 0.6,
  },
  {
    number: "OS-118-2026",
    provider: "Legal & Registro Asociados",
    service: "Estudio de títulos",
    amount: 5.9,
    start: "22/01/2026",
    end: "10/09/2026",
    physical: 88,
    financial: 81,
    compliant: 27,
    observed: 2,
    penalties: 0,
    balance: 1.1,
    owner: "M. Salazar",
    paid: 4.2,
    payable: 0.4,
    committed: 0.2,
  },
  {
    number: "CS-033-2026",
    provider: "Catastro Integral SAC",
    service: "Catastro",
    amount: 5.1,
    start: "11/04/2026",
    end: "18/12/2026",
    physical: 46,
    financial: 51,
    compliant: 9,
    observed: 4,
    penalties: 0.08,
    balance: 2.0,
    owner: "C. Romero",
    paid: 2.2,
    payable: 0.5,
    committed: 0.4,
  },
  {
    number: "OS-126-2026",
    provider: "Notaría y Archivo Digital",
    service: "Notaría y registro",
    amount: 3.7,
    start: "06/02/2026",
    end: "30/08/2026",
    physical: 69,
    financial: 72,
    compliant: 31,
    observed: 3,
    penalties: 0.03,
    balance: 0.8,
    owner: "R. Huamán",
    paid: 2.4,
    payable: 0.3,
    committed: 0.2,
  },
];

const monthlyProgress = [
  { month: "Ene", physical: 9, financial: 7 },
  { month: "Feb", physical: 17, financial: 14 },
  { month: "Mar", physical: 26, financial: 23 },
  { month: "Abr", physical: 38, financial: 30 },
  { month: "May", physical: 49, financial: 37 },
  { month: "Jun", physical: 58, financial: 44 },
  { month: "Jul", physical: 67, financial: 53 },
  { month: "Ago", physical: 73, financial: 62 },
  { month: "Sep", physical: 80, financial: 71 },
  { month: "Oct", physical: 87, financial: 80 },
  { month: "Nov", physical: 93, financial: 89 },
  { month: "Dic", physical: 98, financial: 96 },
];

const specialties = [
  ["Topografía", 9.6, 468],
  ["Catastro", 5.1, 384],
  ["Diagnóstico técnico-legal", 12.8, 612],
  ["Estudio de títulos", 5.9, 327],
  ["Expedientes", 8.7, 446],
  ["Tasación", 8.4, 358],
  ["Gestión social", 7.2, 521],
  ["Publicaciones", 1.8, 176],
  ["Notaría", 2.2, 241],
  ["Registro", 2.6, 219],
  ["Logística", 3.4, 198],
  ["Asesoría legal", 4.9, 287],
  ["Interferencias", 6.8, 164],
].map(([name, amount, properties]) => ({ name, amount, properties }));

const providers = [
  { name: "Consorcio Predial Centro", deadlines: 78, quality: 84, amount: 12.8, risk: "Medio" },
  { name: "GeoVial Ingeniería", deadlines: 91, quality: 93, amount: 9.6, risk: "Bajo" },
  { name: "Tasaciones Andinas", deadlines: 68, quality: 79, amount: 8.4, risk: "Alto" },
  { name: "Gestión Social Perú", deadlines: 62, quality: 71, amount: 7.2, risk: "Alto" },
  { name: "InterRedes Consultores", deadlines: 55, quality: 66, amount: 6.8, risk: "Crítico" },
  { name: "Legal & Registro", deadlines: 94, quality: 91, amount: 5.9, risk: "Bajo" },
  { name: "Catastro Integral", deadlines: 73, quality: 82, amount: 5.1, risk: "Medio" },
  { name: "Notaría y Archivo", deadlines: 88, quality: 86, amount: 3.7, risk: "Bajo" },
];

const expenseDistribution = [
  { name: "Número de predios", value: 28, amount: 4.3, color: COLORS.red },
  { name: "Área afectada", value: 21, amount: 3.2, color: COLORS.blue },
  { name: "Horas trabajadas", value: 14, amount: 2.1, color: COLORS.purple },
  { name: "Valor de tasación", value: 16, amount: 2.5, color: COLORS.green },
  { name: "Entregables", value: 12, amount: 1.8, color: COLORS.amber },
  { name: "Fórmula mixta", value: 9, amount: 1.4, color: COLORS.cyan },
];

const interferenceTypes = [
  "Agua",
  "Saneamiento",
  "Electricidad",
  "Telecom.",
  "Gas",
  "Canales",
  "Señalización",
  "Semáforos",
  "Paraderos",
  "Otras",
];
const interferenceLocations = [
  "Tramo I · Norte",
  "Tramo I · Centro",
  "Tramo II · Norte",
  "Tramo II · Sur",
  "Tramo III · Este",
  "Tramo III · Oeste",
  "Acceso Norte",
];
type HeatStatus = "released" | "progress" | "critical" | "unknown";
const heatStatuses: HeatStatus[] = ["released", "progress", "critical", "unknown"];

const interferences = [
  {
    location: "Km 18+420 · Tramo I",
    entity: "SEDAPAL",
    solution: "Reubicación de red matriz DN 400",
    budget: 2.8,
    contract: "CS-041-2026",
    progress: 72,
    release: "30/09/2026",
    risk: "Medio",
  },
  {
    location: "Km 21+180 · Tramo I",
    entity: "Luz del Sur",
    solution: "Soterramiento de línea MT",
    budget: 4.2,
    contract: "CS-046-2026",
    progress: 38,
    release: "18/11/2026",
    risk: "Alto",
  },
  {
    location: "Km 27+650 · Tramo II",
    entity: "Cálidda",
    solution: "Protección de tubería de gas",
    budget: 3.5,
    contract: "CS-052-2026",
    progress: 24,
    release: "15/12/2026",
    risk: "Crítico",
  },
  {
    location: "Km 32+040 · Tramo II",
    entity: "Claro / Telefónica",
    solution: "Canalización compartida",
    budget: 1.6,
    contract: "OS-139-2026",
    progress: 61,
    release: "22/10/2026",
    risk: "Medio",
  },
  {
    location: "Km 38+910 · Tramo III",
    entity: "ANA / JUA",
    solution: "Reposición de canal de riego",
    budget: 2.1,
    contract: "CS-055-2026",
    progress: 19,
    release: "20/12/2026",
    risk: "Alto",
  },
  {
    location: "Km 44+230 · Tramo III",
    entity: "Municipalidad Provincial",
    solution: "Traslado de semáforos y señales",
    budget: 0.9,
    contract: "OS-144-2026",
    progress: 83,
    release: "12/09/2026",
    risk: "Bajo",
  },
];

type Filters = {
  project: string;
  service: string;
  contract: string;
  provider: string;
  status: string;
  owner: string;
  start: string;
  end: string;
};
const defaultFilters: Filters = {
  project: "TODOS",
  service: "TODOS",
  contract: "TODOS",
  provider: "TODOS",
  status: "TODOS",
  owner: "TODOS",
  start: "2026-01-01",
  end: "2026-12-31",
};

function money(value: number, digits = 1) {
  return `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: digits, maximumFractionDigits: digits })} MM`;
}

function ContractualServiciosPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [contractSearch, setContractSearch] = useState("");
  const [interferenceSearch, setInterferenceSearch] = useState("");
  const [selectedContract, setSelectedContract] = useState<(typeof contracts)[number] | null>(null);
  const [selectedInterference, setSelectedInterference] = useState<
    (typeof interferences)[number] | null
  >(null);
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState("05/08/2026 11:12");

  const filteredContracts = useMemo(
    () =>
      contracts.filter((row) => {
        if (filters.service !== "TODOS" && row.service !== filters.service) return false;
        if (filters.contract !== "TODOS" && row.number !== filters.contract) return false;
        if (filters.provider !== "TODOS" && row.provider !== filters.provider) return false;
        if (filters.owner !== "TODOS" && row.owner !== filters.owner) return false;
        const query = contractSearch.trim().toLowerCase();
        return (
          !query || `${row.number} ${row.provider} ${row.service}`.toLowerCase().includes(query)
        );
      }),
    [filters, contractSearch],
  );

  const scale =
    Math.max(0.1, filteredContracts.length / contracts.length) *
    (filters.project === "TODOS" ? 1 : 0.67);
  const totalAmount = contracts.reduce((sum, row) => sum + row.amount, 0) * scale;
  const totalPaid = contracts.reduce((sum, row) => sum + row.paid, 0) * scale;
  const totalPayable = contracts.reduce((sum, row) => sum + row.payable, 0) * scale;
  const totalBalance = contracts.reduce((sum, row) => sum + row.balance, 0) * scale;
  const cards = [
    {
      label: "Contratos vigentes",
      value: Math.max(1, Math.round(18 * scale)).toString(),
      note: "14 servicios y 4 consultorías",
      trend: 2.1,
      color: "blue",
    },
    {
      label: "Monto total contratado",
      value: money(totalAmount),
      note: "Cartera contractual activa",
      trend: 4.8,
      color: "blue",
    },
    {
      label: "Monto devengado",
      value: money(totalPaid + totalPayable),
      note: "72.4% del contratado",
      trend: 7.2,
      color: "green",
    },
    {
      label: "Monto pagado",
      value: money(totalPaid),
      note: "64.8% del contratado",
      trend: 8.5,
      color: "green",
    },
    {
      label: "Saldo contractual",
      value: money(totalBalance),
      note: "Disponible por ejecutar",
      trend: -6.1,
      color: "amber",
    },
    {
      label: "Entregables pendientes",
      value: Math.max(1, Math.round(42 * scale)).toString(),
      note: "12 próximos en 15 días",
      trend: -9.3,
      color: "amber",
    },
    {
      label: "Entregables observados",
      value: Math.max(1, Math.round(17 * scale)).toString(),
      note: "Requieren subsanación",
      trend: -3.7,
      color: "red",
    },
    {
      label: "Penalidades acumuladas",
      value: money(0.92 * scale, 2),
      note: "1.6% del contratado",
      trend: 11.4,
      color: "red",
    },
    {
      label: "Contratos próximos a vencer",
      value: Math.max(1, Math.round(5 * scale)).toString(),
      note: "Dentro de 45 días",
      trend: 0,
      color: "amber",
    },
    {
      label: "Interferencias críticas",
      value: Math.max(1, Math.round(13 * scale)).toString(),
      note: "Pendientes de liberación",
      trend: -7.8,
      color: "red",
    },
  ] as const;

  const contractChart = [...filteredContracts]
    .sort((a, b) => b.amount - a.amount)
    .map((row) => ({ ...row, executionLabel: `${row.financial}%` }));
  const alertMonths = monthlyProgress.filter((row) => Math.abs(row.physical - row.financial) > 10);
  const filteredInterferences = interferences.filter(
    (row) =>
      !interferenceSearch.trim() ||
      `${row.location} ${row.entity} ${row.solution}`
        .toLowerCase()
        .includes(interferenceSearch.toLowerCase()),
  );

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }
  function reset() {
    setFilters(defaultFilters);
    setContractSearch("");
    setInterferenceSearch("");
    setSelectedExpense(null);
  }
  function exportData() {
    const header =
      "contrato,proveedor,servicio,monto,inicio,fin,avance_fisico,avance_financiero,conformes,observados,penalidades,saldo,responsable\n";
    const rows = filteredContracts
      .map((row) =>
        [
          row.number,
          row.provider,
          row.service,
          row.amount,
          row.start,
          row.end,
          row.physical,
          row.financial,
          row.compliant,
          row.observed,
          row.penalties,
          row.balance,
          row.owner,
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
    link.download = "dashboard_contractual.csv";
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
              <HandCoins size={21} />
            </div>
            <div>
              <h1 className="text-[20px] font-semibold tracking-tight">
                Contratos, servicios e interferencias
              </h1>
              <p className="text-[12px] text-slate-500">
                Control integrado de consultorías, proveedores, entregables y liberación de
                instalaciones
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
              onClick={exportData}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-3 text-[12px] font-semibold text-white"
            >
              <Download size={14} /> Exportar
            </button>
          </div>
        </header>

        <section className="mb-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-700">
              <FileCheck2 size={15} className="text-[#dc2626]" /> Alcance contractual
            </div>
            <button
              onClick={() => setUpdatedAt("05/08/2026 11:28")}
              className="text-[11px] font-medium text-[#dc2626] hover:underline"
            >
              Actualizar información
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-9">
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
              label="Tipo de servicio"
              value={filters.service}
              onChange={(v) => update("service", v)}
              options={["TODOS", ...contracts.map((row) => row.service)]}
            />
            <FilterSelect
              label="Contrato"
              value={filters.contract}
              onChange={(v) => update("contract", v)}
              options={["TODOS", ...contracts.map((row) => row.number)]}
            />
            <FilterSelect
              label="Proveedor"
              value={filters.provider}
              onChange={(v) => update("provider", v)}
              options={["TODOS", ...contracts.map((row) => row.provider)]}
            />
            <FilterSelect
              label="Estado contractual"
              value={filters.status}
              onChange={(v) => update("status", v)}
              options={["TODOS", "Vigente", "Suspendido", "Por vencer", "Cerrado"]}
            />
            <FilterSelect
              label="Responsable"
              value={filters.owner}
              onChange={(v) => update("owner", v)}
              options={["TODOS", ...contracts.map((row) => row.owner)]}
            />
            <DateFilter
              label="Fecha inicio"
              value={filters.start}
              onChange={(v) => update("start", v)}
            />
            <DateFilter label="Fecha fin" value={filters.end} onChange={(v) => update("end", v)} />
          </div>
        </section>

        <section className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-10">
          {cards.map((card) => (
            <KpiCard key={card.label} {...card} />
          ))}
        </section>

        <section className="mb-3 grid gap-3 2xl:grid-cols-[1.1fr_.9fr]">
          <Panel
            title="Ejecución financiera por contrato"
            subtitle="Cada barra distribuye el monto del contrato entre pagado, devengado pendiente, comprometido y saldo; se ordena de mayor a menor monto."
            icon={<WalletCards size={15} />}
          >
            <ResponsiveContainer width="100%" height={405}>
              <BarChart
                data={contractChart}
                layout="vertical"
                margin={{ left: 20, right: 56, top: 8 }}
                onClick={(state) => {
                  if (typeof state?.activeLabel === "string") {
                    const row = contracts.find((item) => item.number === state.activeLabel);
                    if (row) setSelectedContract(row);
                  }
                }}
              >
                <CartesianGrid stroke="#edf0f4" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="number"
                  width={95}
                  tick={{ fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(value) => money(Number(value))} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar
                  dataKey="paid"
                  name="Pagado"
                  stackId="a"
                  fill={COLORS.green}
                  cursor="pointer"
                />
                <Bar
                  dataKey="payable"
                  name="Devengado pendiente"
                  stackId="a"
                  fill={COLORS.blue}
                  cursor="pointer"
                />
                <Bar
                  dataKey="committed"
                  name="Comprometido"
                  stackId="a"
                  fill={COLORS.amber}
                  cursor="pointer"
                />
                <Bar
                  dataKey="balance"
                  name="Saldo contractual"
                  stackId="a"
                  fill="#cbd5e1"
                  radius={[0, 3, 3, 0]}
                  cursor="pointer"
                >
                  <LabelList
                    dataKey="executionLabel"
                    position="right"
                    style={{ fontSize: 9, fill: "#475569", fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
          <Panel
            title="Avance físico vs. financiero"
            subtitle="Compara entregables conformes con ejecución financiera a lo largo del tiempo; una separación mayor a 10 puntos genera una alerta."
            icon={<Gauge size={15} />}
          >
            <div className="mb-1 flex justify-end">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold ${alertMonths.length ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
              >
                {alertMonths.length ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                {alertMonths.length} periodos fuera de tolerancia
              </span>
            </div>
            <ResponsiveContainer width="100%" height={365}>
              <LineChart data={monthlyProgress} margin={{ left: 0, right: 12, top: 12 }}>
                <CartesianGrid stroke="#e9edf2" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine
                  y={75}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{ value: "Meta", fontSize: 9, fill: "#64748b" }}
                />
                <Line
                  type="monotone"
                  dataKey="physical"
                  name="Entregables conformes"
                  stroke={COLORS.blue}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="financial"
                  name="Ejecución financiera"
                  stroke={COLORS.green}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </section>

        <section className="mb-3 grid gap-3 2xl:grid-cols-[1.15fr_.85fr]">
          <Panel
            title="Servicios por especialidad"
            subtitle="Para cada especialidad compara el monto contratado con la cantidad de predios atendidos, mostrando dónde se concentra el servicio."
            icon={<Building2 size={15} />}
          >
            <ResponsiveContainer width="100%" height={390}>
              <BarChart data={specialties} margin={{ left: 5, right: 8, top: 18, bottom: 58 }}>
                <CartesianGrid stroke="#edf0f4" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 8 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis yAxisId="amount" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis
                  yAxisId="properties"
                  orientation="right"
                  tick={{ fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value, name) =>
                    name === "Monto contratado" ? money(Number(value)) : `${value} predios`
                  }
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar
                  yAxisId="amount"
                  dataKey="amount"
                  name="Monto contratado"
                  fill={COLORS.blue}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  yAxisId="properties"
                  dataKey="properties"
                  name="Predios atendidos"
                  fill={COLORS.amber}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
          <Panel
            title="Evaluación de proveedores"
            subtitle="Más a la derecha significa mejor cumplimiento de plazo y más arriba mejor calidad; el tamaño indica monto y el color, nivel de riesgo."
            icon={<ShieldAlert size={15} />}
          >
            <ResponsiveContainer width="100%" height={390}>
              <ScatterChart margin={{ left: 10, right: 24, top: 14, bottom: 12 }}>
                <CartesianGrid stroke="#e9edf2" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="deadlines"
                  name="Cumplimiento de plazos"
                  unit="%"
                  domain={[45, 100]}
                  tick={{ fontSize: 9 }}
                />
                <YAxis
                  type="number"
                  dataKey="quality"
                  name="Entregables conformes"
                  unit="%"
                  domain={[55, 100]}
                  tick={{ fontSize: 9 }}
                />
                <ZAxis type="number" dataKey="amount" range={[100, 650]} name="Monto contratado" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value, name) =>
                    name === "Monto contratado" ? money(Number(value)) : `${value}%`
                  }
                />
                <ReferenceLine x={75} stroke={COLORS.red} strokeDasharray="4 4" />
                <ReferenceLine y={80} stroke={COLORS.red} strokeDasharray="4 4" />
                {["Bajo", "Medio", "Alto", "Crítico"].map((risk) => (
                  <Scatter
                    key={risk}
                    name={risk}
                    data={providers.filter((row) => row.risk === risk)}
                    fill={
                      risk === "Bajo"
                        ? COLORS.green
                        : risk === "Medio"
                          ? COLORS.amber
                          : risk === "Alto"
                            ? "#f97316"
                            : COLORS.red
                    }
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </ScatterChart>
            </ResponsiveContainer>
          </Panel>
        </section>

        <section className="mb-3 grid gap-3 xl:grid-cols-[.7fr_1.3fr]">
          <Panel
            title="Distribución de gastos compartidos"
            subtitle="Muestra cómo se distribuyen los gastos compartidos según el método de asignación y cuánto monto aún falta distribuir."
            icon={<HandCoins size={15} />}
          >
            <div className="grid items-center md:grid-cols-[1fr_.9fr]">
              <div className="relative">
                <ResponsiveContainer width="100%" height={290}>
                  <PieChart>
                    <Pie
                      data={expenseDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={96}
                      paddingAngle={2}
                      cursor="pointer"
                      onClick={(row) => setSelectedExpense(row.name)}
                    >
                      {expenseDistribution.map((row) => (
                        <Cell
                          key={row.name}
                          fill={row.color}
                          opacity={selectedExpense && selectedExpense !== row.name ? 0.3 : 1}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[9px] text-slate-400">DISTRIBUIDO</span>
                  <b className="text-[17px]">S/ 15.3 MM</b>
                  <span className="mt-1 text-[9px] font-semibold text-amber-600">
                    Pendiente: S/ 2.7 MM
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {expenseDistribution.map((row) => (
                  <button
                    key={row.name}
                    onClick={() => setSelectedExpense(row.name)}
                    className="flex w-full items-center justify-between rounded p-1 text-left text-[10px] hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <i className="size-2.5 rounded-full" style={{ background: row.color }} />
                      {row.name}
                    </span>
                    <b>{money(row.amount)}</b>
                  </button>
                ))}
              </div>
            </div>
          </Panel>
          <Panel
            title="Matriz de liberación de interferencias"
            subtitle="Cruza cada tramo con el tipo de instalación; rojo requiere atención inmediata, amarillo está en ejecución y verde está liberado."
            icon={<Network size={15} />}
          >
            <Heatmap />
          </Panel>
        </section>

        <ContractsTable
          rows={filteredContracts}
          search={contractSearch}
          onSearch={setContractSearch}
          onOpen={setSelectedContract}
          onExport={exportData}
        />
        <InterferencesTable
          rows={filteredInterferences}
          search={interferenceSearch}
          onSearch={setInterferenceSearch}
          onOpen={setSelectedInterference}
        />
      </main>
      {selectedContract && (
        <ContractDrawer row={selectedContract} onClose={() => setSelectedContract(null)} />
      )}
      {selectedInterference && (
        <InterferenceDrawer
          row={selectedInterference}
          onClose={() => setSelectedInterference(null)}
        />
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
      <div className="mt-1 whitespace-nowrap text-[18px] font-bold tracking-tight">{value}</div>
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

function Heatmap() {
  const config: Record<HeatStatus, { label: string; cls: string }> = {
    released: { label: "Liberada", cls: "bg-green-500 text-white" },
    progress: { label: "En ejecución", cls: "bg-amber-400 text-amber-950" },
    critical: { label: "Crítica", cls: "bg-red-500 text-white" },
    unknown: { label: "No identificada", cls: "bg-slate-300 text-slate-700" },
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-[9px]">
        <thead>
          <tr>
            <th className="px-2 py-2 text-left text-slate-500">Tramo</th>
            {interferenceTypes.map((type) => (
              <th key={type} className="px-1 py-2 text-center text-slate-500">
                {type}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {interferenceLocations.map((location, rowIndex) => (
            <tr key={location} className="border-t border-slate-100">
              <td className="px-2 py-2 font-semibold">{location}</td>
              {interferenceTypes.map((type, columnIndex) => {
                const status =
                  heatStatuses[(rowIndex * 3 + columnIndex * 2 + (columnIndex > 5 ? 1 : 0)) % 4];
                return (
                  <td key={type} className="p-1 text-center">
                    <span
                      title={`${type}: ${config[status].label}`}
                      className={`inline-flex size-7 items-center justify-center rounded ${config[status].cls}`}
                    >
                      {status === "released"
                        ? "✓"
                        : status === "progress"
                          ? "◐"
                          : status === "critical"
                            ? "!"
                            : "—"}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex justify-end gap-3 text-[9px] text-slate-500">
        {Object.values(config).map((item) => (
          <span key={item.label} className="flex items-center gap-1">
            <i className={`size-2 rounded-sm ${item.cls.split(" ")[0]}`} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ContractsTable({
  rows,
  search,
  onSearch,
  onOpen,
  onExport,
}: {
  rows: typeof contracts;
  search: string;
  onSearch: (value: string) => void;
  onOpen: (row: (typeof contracts)[number]) => void;
  onExport: () => void;
}) {
  return (
    <section className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <TableHeader
        title="Tabla de contratos y órdenes de servicio"
        subtitle="Seguimiento financiero, entregables, penalidades y responsables"
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
        <table className="w-full min-w-[1450px] text-[10px]">
          <thead className="bg-slate-50 text-left uppercase text-slate-500">
            <tr>
              {[
                "Número",
                "Proveedor",
                "Servicio",
                "Monto",
                "Inicio",
                "Fin",
                "Avance físico",
                "Avance financiero",
                "Conformes",
                "Observados",
                "Penalidades",
                "Saldo",
                "Responsable",
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
              <tr key={row.number} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2.5 font-bold text-[#dc2626]">{row.number}</td>
                <td className="px-3 py-2.5 font-medium">{row.provider}</td>
                <td className="px-3 py-2.5">{row.service}</td>
                <td className="px-3 py-2.5 font-semibold">{money(row.amount)}</td>
                <td className="px-3 py-2.5">{row.start}</td>
                <td className="px-3 py-2.5">{row.end}</td>
                <ProgressCell value={row.physical} color="blue" />
                <ProgressCell value={row.financial} color="green" />
                <td className="px-3 py-2.5 text-green-700">{row.compliant}</td>
                <td className="px-3 py-2.5 text-amber-700">{row.observed}</td>
                <td
                  className={`px-3 py-2.5 font-semibold ${row.penalties > 0.15 ? "text-red-700" : "text-slate-700"}`}
                >
                  {money(row.penalties, 2)}
                </td>
                <td className="px-3 py-2.5">{money(row.balance)}</td>
                <td className="px-3 py-2.5">{row.owner}</td>
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => onOpen(row)}
                    className="rounded border border-slate-200 px-2 py-1 text-slate-600 hover:text-red-600"
                  >
                    Detalle
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

function InterferencesTable({
  rows,
  search,
  onSearch,
  onOpen,
}: {
  rows: typeof interferences;
  search: string;
  onSearch: (value: string) => void;
  onOpen: (row: (typeof interferences)[number]) => void;
}) {
  return (
    <section className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <TableHeader
        title="Tabla operativa de interferencias"
        subtitle="Soluciones, presupuestos, liberación prevista y riesgo para la obra"
        search={search}
        onSearch={onSearch}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-[10px]">
          <thead className="bg-slate-50 text-left uppercase text-slate-500">
            <tr>
              {[
                "Ubicación",
                "Entidad responsable",
                "Alternativa de solución",
                "Presupuesto",
                "Contrato",
                "Avance",
                "Liberación prevista",
                "Riesgo para la obra",
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
              <tr key={row.location} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2.5 font-semibold">{row.location}</td>
                <td className="px-3 py-2.5">{row.entity}</td>
                <td className="px-3 py-2.5">{row.solution}</td>
                <td className="px-3 py-2.5 font-semibold">{money(row.budget)}</td>
                <td className="px-3 py-2.5 text-[#dc2626]">{row.contract}</td>
                <ProgressCell value={row.progress} color={row.progress < 40 ? "red" : "green"} />
                <td className="px-3 py-2.5">{row.release}</td>
                <td className="px-3 py-2.5">
                  <RiskBadge risk={row.risk} />
                </td>
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => onOpen(row)}
                    className="rounded border border-slate-200 px-2 py-1 text-slate-600 hover:text-red-600"
                  >
                    Detalle
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
function ProgressCell({ value, color }: { value: number; color: "blue" | "green" | "red" }) {
  const cls = color === "blue" ? "bg-blue-500" : color === "green" ? "bg-green-500" : "bg-red-500";
  return (
    <td className="px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 rounded bg-slate-100">
          <div className={`h-full rounded ${cls}`} style={{ width: `${value}%` }} />
        </div>
        <b>{value}%</b>
      </div>
    </td>
  );
}
function RiskBadge({ risk }: { risk: string }) {
  const cls =
    risk === "Crítico"
      ? "bg-red-100 text-red-700"
      : risk === "Alto"
        ? "bg-orange-100 text-orange-700"
        : risk === "Medio"
          ? "bg-amber-100 text-amber-700"
          : "bg-green-100 text-green-700";
  return <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${cls}`}>{risk}</span>;
}

function ContractDrawer({
  row,
  onClose,
}: {
  row: (typeof contracts)[number];
  onClose: () => void;
}) {
  const fields = [
    ["Proveedor", row.provider],
    ["Servicio", row.service],
    ["Monto contratado", money(row.amount)],
    ["Periodo", `${row.start} — ${row.end}`],
    ["Avance físico", `${row.physical}%`],
    ["Avance financiero", `${row.financial}%`],
    ["Entregables conformes", row.compliant],
    ["Entregables observados", row.observed],
    ["Penalidades", money(row.penalties, 2)],
    ["Saldo contractual", money(row.balance)],
    ["Responsable", row.owner],
  ];
  return (
    <DetailDrawer
      title={row.number}
      subtitle="Ficha contractual y trazabilidad de entregables"
      icon={<FileCheck2 size={18} />}
      fields={fields}
      onClose={onClose}
      action="Abrir expediente contractual"
    />
  );
}
function InterferenceDrawer({
  row,
  onClose,
}: {
  row: (typeof interferences)[number];
  onClose: () => void;
}) {
  const fields = [
    ["Entidad responsable", row.entity],
    ["Alternativa de solución", row.solution],
    ["Presupuesto", money(row.budget)],
    ["Contrato", row.contract],
    ["Avance", `${row.progress}%`],
    ["Liberación prevista", row.release],
    ["Riesgo para la obra", row.risk],
  ];
  return (
    <DetailDrawer
      title={row.location}
      subtitle="Ficha operativa de liberación de interferencia"
      icon={<Cable size={18} />}
      fields={fields}
      onClose={onClose}
      action="Abrir expediente de interferencia"
    />
  );
}
function DetailDrawer({
  title,
  subtitle,
  icon,
  fields,
  onClose,
  action,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  fields: Array<Array<string | number>>;
  onClose: () => void;
  action: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/35"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className="flex h-full w-full max-w-[470px] flex-col bg-white shadow-2xl">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <span className="mt-1 text-[#dc2626]">{icon}</span>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#dc2626]">
                  Detalle de gestión
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
                className="grid grid-cols-[155px_1fr] border-b border-slate-100 px-3 py-2.5 text-[11px] last:border-0"
              >
                <span className="text-slate-500">{label}</span>
                <b>{value}</b>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-800">
              <FileWarning size={14} /> Seguimiento requerido
            </div>
            <p className="mt-1 text-[10px] text-amber-700">
              Verificar el siguiente hito programado y registrar evidencia de conformidad.
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
