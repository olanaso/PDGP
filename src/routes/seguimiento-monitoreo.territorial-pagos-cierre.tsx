import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  FileClock,
  FileX2,
  FileSpreadsheet,
  FilterX,
  History,
  Layers3,
  MapPinned,
  Maximize2,
  Minimize2,
  Search,
  ShieldCheck,
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
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartExplanation } from "../components/ChartExplanation";

import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/seguimiento-monitoreo/territorial-pagos-cierre")({
  head: () => ({ meta: [{ title: "Mapa, pagos, inscripción y cierre" }] }),
  component: TerritorialPagosDashboard,
});

const COLORS = {
  red: "#dc2626",
  orange: "#f97316",
  green: "#16a34a",
  blue: "#2563eb",
  amber: "#f59e0b",
  purple: "#7c3aed",
  cyan: "#06b6d4",
  slate: "#64748b",
};

const statusColors: Record<string, string> = {
  Identificado: "#94a3b8",
  "Expediente en proceso": COLORS.blue,
  Tasación: COLORS.amber,
  Negociación: COLORS.orange,
  "Conflicto / expropiación": COLORS.red,
  Pagado: COLORS.cyan,
  Liberado: COLORS.green,
  Inscrito: COLORS.purple,
};

type MapProperty = {
  code: string;
  passive: string;
  area: number;
  appraised: number;
  approved: number;
  paid: number;
  delivery: string;
  registry: string;
  interference: string;
  risk: string;
  status: keyof typeof statusColors;
  points: string;
};

const mapProperties: MapProperty[] = [
  {
    code: "PR-001842",
    passive: "María Elena Rojas",
    area: 842,
    appraised: 1.42,
    approved: 1.38,
    paid: 1.38,
    delivery: "Entregado",
    registry: "Inscrito",
    interference: "Liberada",
    risk: "Bajo",
    status: "Inscrito",
    points: "62,85 142,74 154,128 72,139",
  },
  {
    code: "PR-001873",
    passive: "Comunidad San Jerónimo",
    area: 3261,
    appraised: 4.81,
    approved: 4.62,
    paid: 3.1,
    delivery: "Parcial",
    registry: "En trámite",
    interference: "Red de agua",
    risk: "Crítico",
    status: "Conflicto / expropiación",
    points: "151,74 238,67 249,119 154,128",
  },
  {
    code: "PR-001905",
    passive: "Inversiones del Centro SAC",
    area: 1480,
    appraised: 3.26,
    approved: 3.18,
    paid: 0,
    delivery: "No entregado",
    registry: "Bloqueado",
    interference: "Línea eléctrica",
    risk: "Crítico",
    status: "Conflicto / expropiación",
    points: "238,67 330,76 323,131 249,119",
  },
  {
    code: "PR-001927",
    passive: "Sucesión Flores Huamán",
    area: 616,
    appraised: 1.08,
    approved: 1.04,
    paid: 0.88,
    delivery: "Programado",
    registry: "Observado",
    interference: "Sin interferencia",
    risk: "Alto",
    status: "Negociación",
    points: "330,76 413,91 406,145 323,131",
  },
  {
    code: "PR-001944",
    passive: "Municipalidad Distrital Norte",
    area: 5411,
    appraised: 6.21,
    approved: 5.96,
    paid: 0,
    delivery: "Parcial",
    registry: "Transferencia",
    interference: "Paradero",
    risk: "Alto",
    status: "Expediente en proceso",
    points: "413,91 510,81 526,144 406,145",
  },
  {
    code: "PR-001968",
    passive: "José Antonio Medina",
    area: 392,
    appraised: 0.84,
    approved: 0.81,
    paid: 0.81,
    delivery: "No entregado",
    registry: "Anotación preventiva",
    interference: "Liberada",
    risk: "Medio",
    status: "Pagado",
    points: "72,139 154,128 161,196 80,207",
  },
  {
    code: "PR-001991",
    passive: "Agrícola Santa Ana SRL",
    area: 2269,
    appraised: 3.72,
    approved: 3.61,
    paid: 3.61,
    delivery: "Entregado",
    registry: "En trámite",
    interference: "Canal de riego",
    risk: "Alto",
    status: "Liberado",
    points: "154,128 249,119 258,190 161,196",
  },
  {
    code: "PR-002014",
    passive: "Rosa Milagros Chávez",
    area: 729,
    appraised: 1.19,
    approved: 1.14,
    paid: 0,
    delivery: "No entregado",
    registry: "Sin iniciar",
    interference: "Telecomunicaciones",
    risk: "Crítico",
    status: "Identificado",
    points: "249,119 323,131 334,197 258,190",
  },
  {
    code: "PR-002037",
    passive: "Consorcio Vial Andino",
    area: 1895,
    appraised: 4.04,
    approved: 3.92,
    paid: 2.1,
    delivery: "No entregado",
    registry: "Bloqueado",
    interference: "Gas natural",
    risk: "Crítico",
    status: "Tasación",
    points: "323,131 406,145 415,207 334,197",
  },
  {
    code: "PR-002058",
    passive: "Comunidad Campesina Central",
    area: 6840,
    appraised: 7.62,
    approved: 7.48,
    paid: 7.48,
    delivery: "Entregado",
    registry: "Inscrito",
    interference: "Liberada",
    risk: "Bajo",
    status: "Inscrito",
    points: "406,145 526,144 516,221 415,207",
  },
  {
    code: "PR-002081",
    passive: "Transportes del Valle SAC",
    area: 940,
    appraised: 1.88,
    approved: 1.82,
    paid: 1.82,
    delivery: "Entregado",
    registry: "Presentado",
    interference: "Señalización",
    risk: "Medio",
    status: "Liberado",
    points: "80,207 161,196 169,264 92,279",
  },
  {
    code: "PR-002106",
    passive: "Familia Gutiérrez Soto",
    area: 2120,
    appraised: 3.96,
    approved: 3.82,
    paid: 3.2,
    delivery: "Parcial",
    registry: "Observado",
    interference: "Saneamiento",
    risk: "Alto",
    status: "Pagado",
    points: "161,196 258,190 267,255 169,264",
  },
  {
    code: "PR-002124",
    passive: "Agroindustrias del Sur",
    area: 515,
    appraised: 0.96,
    approved: 0.93,
    paid: 0,
    delivery: "No entregado",
    registry: "Sin iniciar",
    interference: "Sin identificar",
    risk: "Medio",
    status: "Expediente en proceso",
    points: "258,190 334,197 345,265 267,255",
  },
  {
    code: "PR-002143",
    passive: "Constructora Los Andes",
    area: 1280,
    appraised: 2.74,
    approved: 2.66,
    paid: 2.66,
    delivery: "Entregado",
    registry: "Subsanado",
    interference: "Liberada",
    risk: "Medio",
    status: "Liberado",
    points: "334,197 415,207 421,278 345,265",
  },
  {
    code: "PR-002166",
    passive: "Asociación Valle Verde",
    area: 1740,
    appraised: 2.98,
    approved: 2.89,
    paid: 1.55,
    delivery: "No entregado",
    registry: "Pendiente",
    interference: "Semáforos",
    risk: "Alto",
    status: "Negociación",
    points: "415,207 516,221 503,292 421,278",
  },
];

const sectionProgress = [
  { name: "Tramo 1", pending: 12, paid: 18, delivered: 23, registered: 34 },
  { name: "Tramo 2", pending: 19, paid: 24, delivered: 27, registered: 21 },
  { name: "Tramo 3", pending: 16, paid: 29, delivered: 22, registered: 18 },
  { name: "Tramo 4", pending: 28, paid: 21, delivered: 17, registered: 12 },
  { name: "Tramo 5", pending: 14, paid: 26, delivered: 31, registered: 24 },
  { name: "Tramo 6", pending: 31, paid: 18, delivered: 13, registered: 9 },
  { name: "Tramo 7", pending: 17, paid: 23, delivered: 25, registered: 28 },
];

const paymentConcepts = [
  { name: "Terreno", value: 54, amount: 31.8, color: COLORS.red },
  { name: "Edificaciones", value: 17, amount: 10.0, color: COLORS.blue },
  { name: "Plantaciones", value: 6, amount: 3.5, color: COLORS.green },
  { name: "Perjuicio económico", value: 8, amount: 4.7, color: COLORS.orange },
  { name: "Incentivo", value: 5, amount: 2.9, color: COLORS.amber },
  { name: "Compensación", value: 4, amount: 2.4, color: COLORS.purple },
  { name: "Mejoras", value: 4, amount: 2.4, color: COLORS.cyan },
  { name: "Gastos de traslado", value: 2, amount: 1.2, color: COLORS.slate },
];

type PaymentRow = {
  code: string;
  beneficiary: string;
  concept: string;
  approved: number;
  certified: number;
  accrued: number;
  drawn: number;
  paid: number;
  programmed: string;
  effective: string;
  balance: number;
  status: string;
};
const payments: PaymentRow[] = mapProperties.slice(0, 12).map((row, index) => ({
  code: row.code,
  beneficiary: row.passive,
  concept: paymentConcepts[index % paymentConcepts.length].name,
  approved: row.approved,
  certified: row.approved * 0.97,
  accrued: row.approved * (0.78 + (index % 4) * 0.06),
  drawn: row.approved * (0.7 + (index % 4) * 0.07),
  paid: row.paid,
  programmed: `${String(8 + (index % 20)).padStart(2, "0")}/08/2026`,
  effective: row.paid ? `${String(2 + (index % 24)).padStart(2, "0")}/08/2026` : "—",
  balance: Math.max(0, row.approved - row.paid),
  status:
    index === 5 || index === 8
      ? "Emitido no entregado"
      : index === 2 || index === 7
        ? "Próximo a vencer"
        : row.paid >= row.approved * 0.98
          ? "Pagado"
          : "En proceso",
}));

type RegistryRow = {
  code: string;
  office: string;
  title: string;
  presentation: string;
  status: string;
  observation: string;
  deadline: string;
  resulting: string;
  owner: string;
};
const registryRows: RegistryRow[] = mapProperties.slice(0, 10).map((row, index) => ({
  code: row.code,
  office: ["Lima", "Junín", "Chimbote", "Callao"][index % 4],
  title: `2026-${String(118420 + index * 137)}`,
  presentation: `${String(4 + index).padStart(2, "0")}/07/2026`,
  status: ["Inscrito", "Observado", "Pendiente", "Subsanado", "Tachado", "Archivado"][index % 6],
  observation:
    index % 3 === 0
      ? "Rectificar área y linderos"
      : index % 3 === 1
        ? "Acreditar representación"
        : "Sin observación",
  deadline: index % 3 === 2 ? "—" : `${String(10 + index).padStart(2, "0")}/08/2026`,
  resulting: index % 6 === 0 ? `P-${11280460 + index}` : "Pendiente",
  owner: ["R. Huamán", "M. Salazar", "C. Romero"][index % 3],
}));

const timeline = ["Aprobación", "Certificación", "Devengado", "Pago", "Entrega", "Inscripción"].map(
  (stage, index) => ({
    stage,
    B01: [0, 8, 19, 31, 39, 52][index],
    B02: [0, 11, 26, 43, 57, 78][index],
    B04: [0, 16, 38, 67, 91, 126][index],
    B06: [0, 14, 35, 72, 104, 148][index],
  }),
);

const audits = [
  [
    "05/08/2026 11:18",
    "María Salazar",
    "PR-001905 · Estado de pago",
    "Pendiente",
    "Bloqueado",
    "Medida cautelar vigente",
    "Informe Legal 044-2026",
  ],
  [
    "05/08/2026 10:42",
    "Carlos Romero",
    "PR-001873 · Entrega física",
    "No entregado",
    "Parcial",
    "Acta de entrega de frente",
    "Acta 018-B04",
  ],
  [
    "05/08/2026 09:57",
    "Rosa Huamán",
    "PR-002143 · Estado registral",
    "Observado",
    "Subsanado",
    "Reingreso de título",
    "Esquela 2026-882",
  ],
  [
    "04/08/2026 17:21",
    "Luis Quispe",
    "PR-002037 · Monto pagado",
    "S/ 1.80 MM",
    "S/ 2.10 MM",
    "Pago parcial autorizado",
    "CP-005481",
  ],
  [
    "04/08/2026 15:36",
    "Ana Paredes",
    "PR-002014 · Riesgo",
    "Alto",
    "Crítico",
    "Plazo legal vencido",
    "Alerta AR-129",
  ],
  [
    "04/08/2026 12:08",
    "Rosa Huamán",
    "PR-002058 · Cierre",
    "En revisión",
    "Cerrado",
    "Cinco controles conformes",
    "Acta C-00142",
  ],
];

type Filters = {
  project: string;
  section: string;
  property: string;
  payment: string;
  delivery: string;
  registry: string;
  risk: string;
  owner: string;
};
const defaultFilters: Filters = {
  project: "TODOS",
  section: "TODOS",
  property: "TODOS",
  payment: "TODOS",
  delivery: "TODOS",
  registry: "TODOS",
  risk: "TODOS",
  owner: "TODOS",
};
type AmountUnit = "soles" | "thousands" | "millions";
function money(value: number, digits = 2, unit: AmountUnit = "millions") {
  const amount =
    unit === "soles" ? value * 1_000_000 : unit === "thousands" ? value * 1_000 : value;
  const suffix = unit === "millions" ? " MM" : unit === "thousands" ? " mil" : "";
  return `S/ ${amount.toLocaleString("es-PE", {
    minimumFractionDigits: unit === "soles" ? 0 : digits,
    maximumFractionDigits: unit === "soles" ? 0 : digits,
  })}${suffix}`;
}
function number(value: number, digits = 0) {
  return value.toLocaleString("es-PE", { maximumFractionDigits: digits });
}

function displayDate(value: string) {
  if (!value || value === "—") return value;
  const [day, month, yearAndTime] = value.split("/");
  const [year, time] = (yearAndTime ?? "").split(" ");
  const monthName = [
    "",
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ][Number(month)];
  return `${day} ${monthName} ${year}${time ? ` · ${time}` : ""}`;
}

function exportExcel(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const escape = (value: string | number) =>
    String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `<table><thead><tr>${headers.map((header) => `<th>${escape(header)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escape(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const url = URL.createObjectURL(new Blob(["\ufeff", html], { type: "application/vnd.ms-excel" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

export function TerritorialPagosDashboard() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [layers, setLayers] = useState({
    alignment: true,
    interferences: false,
    delivered: false,
    pending: false,
    controls: true,
  });
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(mapProperties[1]);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [registrySearch, setRegistrySearch] = useState("");
  const [auditOpen, setAuditOpen] = useState(true);
  const [amountUnit, setAmountUnit] = useState<AmountUnit>("millions");
  const formatMoney = (value: number, digits = 2) => money(value, digits, amountUnit);

  const filteredMap = useMemo(
    () =>
      mapProperties.filter((row) => {
        if (filters.property !== "TODOS" && row.code !== filters.property) return false;
        if (filters.delivery !== "TODOS" && row.delivery !== filters.delivery) return false;
        if (filters.registry !== "TODOS" && row.registry !== filters.registry) return false;
        if (filters.risk !== "TODOS" && row.risk !== filters.risk) return false;
        if (filters.payment === "Pagado" && row.paid < row.approved * 0.98) return false;
        if (filters.payment === "Pendiente" && row.paid > 0) return false;
        if (filters.payment === "En proceso" && (row.paid === 0 || row.paid >= row.approved * 0.98))
          return false;
        if (filters.payment === "Consignado" && !["PR-001873", "PR-002037"].includes(row.code))
          return false;
        const responsible = ["M. Salazar", "C. Romero", "L. Quispe", "A. Paredes", "R. Huamán"][
          mapProperties.indexOf(row) % 5
        ];
        if (filters.owner !== "TODOS" && responsible !== filters.owner) return false;
        return true;
      }),
    [filters],
  );
  const scale =
    Math.max(0.1, filteredMap.length / mapProperties.length) *
    (filters.project === "TODOS" ? 1 : 0.68) *
    (filters.section === "TODOS" ? 1 : 0.77);
  const cards = [
    {
      label: "Monto total pagado",
      value: formatMoney(58.9 * scale, 1),
      note: "78.4% del aprobado",
      trend: 8.6,
      color: "green",
    },
    {
      label: "Pagos pendientes",
      value: formatMoney(16.2 * scale, 1),
      note: "86 operaciones",
      trend: -6.4,
      color: "amber",
    },
    {
      label: "Consignaciones",
      value: formatMoney(7.8 * scale, 1),
      note: "24 expedientes",
      trend: 5.1,
      color: "blue",
    },
    {
      label: "Pagados sin entrega",
      value: Math.max(1, Math.round(31 * scale)).toString(),
      note: "Requieren acta física",
      trend: -4.7,
      color: "red",
    },
    {
      label: "Entregados sin inscripción",
      value: Math.max(1, Math.round(46 * scale)).toString(),
      note: "En trámite registral",
      trend: -8.2,
      color: "amber",
    },
    {
      label: "Títulos observados",
      value: Math.max(1, Math.round(19 * scale)).toString(),
      note: "7 próximos a vencer",
      trend: 2.3,
      color: "red",
    },
    {
      label: "Predios cerrados",
      value: Math.max(1, Math.round(427 * scale)).toString(),
      note: "Cinco controles conformes",
      trend: 9.4,
      color: "green",
    },
    {
      label: "Cierre integral",
      value: "68.4%",
      note: "Meta del periodo: 75%",
      trend: 4.9,
      color: "amber",
    },
  ] as const;
  const filteredPayments = payments.filter(
    (row) =>
      (!selectedConcept || row.concept === selectedConcept) &&
      (!paymentSearch.trim() ||
        `${row.code} ${row.beneficiary}`.toLowerCase().includes(paymentSearch.toLowerCase())),
  );
  const filteredRegistry = registryRows.filter(
    (row) =>
      !registrySearch.trim() ||
      `${row.code} ${row.title} ${row.office}`.toLowerCase().includes(registrySearch.toLowerCase()),
  );
  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }
  function reset() {
    setFilters(defaultFilters);
    setSelectedConcept(null);
    setPaymentSearch("");
    setRegistrySearch("");
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f7] text-[#172033]">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-auto p-3 xl:p-4">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 text-[#dc2626]">
              <MapPinned size={21} />
            </div>
            <div>
              <h1 className="text-[20px] font-semibold tracking-tight">
                Mapa, pagos, inscripción y cierre
              </h1>
              <p className="text-[12px] text-slate-500">
                Control geográfico y trazabilidad financiera, física, registral y documental de los
                predios
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={amountUnit}
              onChange={(event) => setAmountUnit(event.target.value as AmountUnit)}
              className="h-8 rounded border border-slate-300 bg-white px-2 text-[11px] text-slate-700"
              aria-label="Unidad monetaria"
            >
              <option value="soles">Soles</option>
              <option value="thousands">Miles</option>
              <option value="millions">Millones</option>
            </select>
            <div className="inline-flex h-8 items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 text-[11px] text-slate-500">
              <Clock3 size={13} /> Última actualización:{" "}
              <b className="text-slate-700">05/08/2026 12:03</b>
            </div>
            <button
              onClick={reset}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-slate-300 bg-white px-3 text-[12px] font-medium text-slate-700"
            >
              <FilterX size={14} /> Restablecer
            </button>
            <button className="inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-3 text-[12px] font-semibold text-white">
              <Download size={14} /> Exportar
            </button>
          </div>
        </header>

        <section className="mb-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-slate-700">
            <Layers3 size={15} className="text-[#dc2626]" /> Alcance territorial
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
              label="Tramo"
              value={filters.section}
              onChange={(v) => update("section", v)}
              options={["TODOS", "Tramo I", "Tramo II", "Tramo III", "Acceso Norte"]}
            />
            <FilterSelect
              label="Predio"
              value={filters.property}
              onChange={(v) => update("property", v)}
              options={["TODOS", ...mapProperties.map((row) => row.code)]}
            />
            <FilterSelect
              label="Estado de pago"
              value={filters.payment}
              onChange={(v) => update("payment", v)}
              options={["TODOS", "Pendiente", "En proceso", "Pagado", "Consignado"]}
            />
            <FilterSelect
              label="Estado de entrega"
              value={filters.delivery}
              onChange={(v) => update("delivery", v)}
              options={["TODOS", "No entregado", "Programado", "Parcial", "Entregado"]}
            />
            <FilterSelect
              label="Estado registral"
              value={filters.registry}
              onChange={(v) => update("registry", v)}
              options={[
                "TODOS",
                "Sin iniciar",
                "En trámite",
                "Observado",
                "Subsanado",
                "Inscrito",
                "Bloqueado",
              ]}
            />
            <FilterSelect
              label="Nivel de riesgo"
              value={filters.risk}
              onChange={(v) => update("risk", v)}
              options={["TODOS", "Bajo", "Medio", "Alto", "Crítico"]}
            />
            <FilterSelect
              label="Responsable"
              value={filters.owner}
              onChange={(v) => update("owner", v)}
              options={["TODOS", "M. Salazar", "C. Romero", "L. Quispe", "A. Paredes", "R. Huamán"]}
            />
          </div>
        </section>

        <section className="mb-3 grid min-h-[720px] gap-3 2xl:grid-cols-[1.5fr_1fr]">
          <TerritorialMap
            rows={filteredMap}
            selected={selectedProperty}
            onSelect={setSelectedProperty}
            layers={layers}
            onLayers={setLayers}
            amountUnit={amountUnit}
          />
          <div className="min-w-0">
            <div className="mb-3 grid grid-cols-2 gap-2">
              {cards.map((card) => (
                <KpiCard key={card.label} {...card} />
              ))}
            </div>
            <Panel
              title="Avance por tramo"
              subtitle="Cada barra compara por tramo los predios pendientes de pago, pagados, entregados e inscritos para ver si el avance físico y registral acompaña al financiero."
              icon={<ShieldCheck size={15} />}
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={sectionProgress} margin={{ left: 0, right: 8, top: 8 }}>
                  <CartesianGrid stroke="#edf0f4" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Bar dataKey="pending" name="Pendientes de pago" stackId="a" fill="#cbd5e1" />
                  <Bar dataKey="paid" name="Pagados" stackId="a" fill={COLORS.cyan} />
                  <Bar dataKey="delivered" name="Entregados" stackId="a" fill={COLORS.green} />
                  <Bar
                    dataKey="registered"
                    name="Inscritos"
                    stackId="a"
                    fill={COLORS.purple}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>
        </section>

        <section className="mb-3 grid gap-3 xl:grid-cols-[.7fr_1.3fr]">
          <Panel
            title="Pagos por concepto"
            subtitle="Cada segmento muestra qué porcentaje del pago total corresponde a terreno, edificaciones, plantaciones u otros conceptos."
            icon={<CircleDollarSign size={15} />}
          >
            <div className="grid items-center md:grid-cols-[1fr_.9fr]">
              <div className="relative">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentConcepts}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={63}
                      outerRadius={98}
                      paddingAngle={2}
                      cursor="pointer"
                      onClick={(row) =>
                        setSelectedConcept((current) => (current === row.name ? null : row.name))
                      }
                    >
                      {paymentConcepts.map((row) => (
                        <Cell
                          key={row.name}
                          fill={row.color}
                          opacity={selectedConcept && selectedConcept !== row.name ? 0.25 : 1}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, _name, item) => [
                        `${value}% · ${formatMoney(item.payload.amount)}`,
                        item.payload.name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[9px] text-slate-400">TOTAL PAGADO</span>
                  <b className="text-[17px]">{formatMoney(58.9, 1)}</b>
                </div>
              </div>
              <div className="space-y-1.5">
                {paymentConcepts.map((row) => (
                  <button
                    key={row.name}
                    onClick={() =>
                      setSelectedConcept((current) => (current === row.name ? null : row.name))
                    }
                    className="flex w-full items-center justify-between rounded p-1 text-left text-[9px] hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <i className="size-2 rounded-full" style={{ background: row.color }} />
                      {row.name}
                    </span>
                    <b>{formatMoney(row.amount)}</b>
                  </button>
                ))}
              </div>
            </div>
          </Panel>
          <Panel
            title="Tiempo promedio entre hitos"
            subtitle="Sigue los días transcurridos entre aprobación, certificación, devengado, pago, entrega e inscripción para localizar la fase con mayor demora."
            icon={<Clock3 size={15} />}
          >
            <ResponsiveContainer width="100%" height={318}>
              <LineChart data={timeline} margin={{ left: 5, right: 16, top: 12 }}>
                <CartesianGrid stroke="#e9edf2" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} unit=" d" />
                <Tooltip formatter={(value) => `${value} días acumulados`} />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Line
                  type="monotone"
                  dataKey="B01"
                  name="Tramo 1"
                  stroke={COLORS.green}
                  strokeWidth={2.2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="B02"
                  name="Tramo 2"
                  stroke={COLORS.blue}
                  strokeWidth={2.2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="B04"
                  name="Tramo 4"
                  stroke={COLORS.amber}
                  strokeWidth={2.2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="B06"
                  name="Tramo 6"
                  stroke={COLORS.red}
                  strokeWidth={2.2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </section>

        <PaymentsTable
          rows={filteredPayments}
          search={paymentSearch}
          onSearch={setPaymentSearch}
          concept={selectedConcept}
          onClearConcept={() => setSelectedConcept(null)}
          amountUnit={amountUnit}
        />
        <RegistryTable
          rows={filteredRegistry}
          search={registrySearch}
          onSearch={setRegistrySearch}
        />
        <ClosureTable rows={mapProperties.slice(0, 10)} />
        <AuditPanel open={auditOpen} onToggle={() => setAuditOpen((current) => !current)} />
      </main>
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
  color: "green" | "blue" | "amber" | "red";
}) {
  const top = {
    green: "border-t-green-500",
    blue: "border-t-blue-500",
    amber: "border-t-amber-400",
    red: "border-t-red-500",
  }[color];
  return (
    <div
      className={`min-h-[105px] rounded-lg border border-slate-200 border-t-[3px] bg-white p-2.5 shadow-sm ${top}`}
    >
      <div className="min-h-7 text-[10px] font-semibold leading-4 text-slate-600">{label}</div>
      <div className="mt-1 whitespace-nowrap text-[17px] font-bold">{value}</div>
      <div className="mt-1 flex justify-between gap-1 text-[9px] text-slate-500">
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
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`${expanded ? "fixed inset-4 z-50 overflow-auto" : "min-w-0"} rounded-lg border border-slate-200 bg-white p-3 shadow-sm`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex gap-2">
          <span className="mt-0.5 text-[#dc2626]">{icon}</span>
          <div>
            <h2 className="text-[13px] font-semibold text-slate-800">{title}</h2>
            <ChartExplanation>{subtitle}</ChartExplanation>
          </div>
        </div>
        <button
          onClick={() => setExpanded((current) => !current)}
          className="rounded border border-slate-200 p-1.5 text-slate-500 hover:text-red-600"
          title={expanded ? "Restaurar gráfico" : "Ampliar gráfico"}
        >
          {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>
      </div>
      {children}
      <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-[8px] text-slate-400">
        <span>Fuente: SIGP · SIAF · SUNARP</span>
        <span>Actualizado: 05 Ago 2026 · 12:03</span>
      </div>
    </div>
  );
}

function TerritorialMap({
  rows,
  selected,
  onSelect,
  layers,
  onLayers,
  amountUnit,
}: {
  rows: MapProperty[];
  selected: MapProperty | null;
  onSelect: (row: MapProperty | null) => void;
  layers: Record<string, boolean>;
  amountUnit: AmountUnit;
  onLayers: React.Dispatch<
    React.SetStateAction<{
      alignment: boolean;
      interferences: boolean;
      delivered: boolean;
      pending: boolean;
      controls: boolean;
    }>
  >;
}) {
  const [expanded, setExpanded] = useState(false);
  const layerLabels: Record<string, string> = {
    alignment: "Trazado de obra",
    interferences: "Interferencias",
    delivered: "Áreas entregadas",
    pending: "Áreas pendientes",
    controls: "Puntos de control",
  };
  return (
    <div
      className={`${expanded ? "fixed inset-4 z-50" : "relative min-h-[720px]"} overflow-hidden rounded-lg border border-slate-200 bg-[#dbe5dc] shadow-sm`}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-3 py-2">
        <div>
          <h2 className="text-[13px] font-semibold">Mapa GIS de gestión territorial</h2>
          <p className="text-[9px] text-slate-500">
            Polígonos prediales, trazado y capas operativas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500">{rows.length} predios visibles</span>
          <button
            onClick={() => setExpanded((current) => !current)}
            className="rounded border border-slate-200 p-1 text-slate-500"
            title={expanded ? "Restaurar mapa" : "Ampliar mapa"}
          >
            {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>
      <svg
        viewBox="0 0 580 360"
        className="absolute inset-x-0 bottom-0 top-12 h-auto w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#afc0b4" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="580" height="360" fill="url(#grid)" />
        <path
          d="M20 300 C120 250 180 312 270 225 S440 140 570 95"
          fill="none"
          stroke="#fff"
          strokeWidth="30"
          opacity=".8"
        />
        <path
          d="M20 300 C120 250 180 312 270 225 S440 140 570 95"
          fill="none"
          stroke="#6b7280"
          strokeWidth="4"
          strokeDasharray="12 8"
          opacity={layers.alignment ? 1 : 0}
        />
        {rows.map((row) => (
          <polygon
            key={row.code}
            points={row.points}
            fill={statusColors[row.status]}
            fillOpacity={selected?.code === row.code ? 0.95 : 0.7}
            stroke={selected?.code === row.code ? "#111827" : "#fff"}
            strokeWidth={selected?.code === row.code ? 3 : 1.5}
            onClick={() => onSelect(row)}
            className="cursor-pointer transition hover:opacity-90"
          >
            <title>{`${row.code} · ${row.status}`}</title>
          </polygon>
        ))}
        {layers.delivered &&
          rows
            .filter((row) => row.delivery === "Entregado")
            .map((row) => (
              <polygon
                key={`delivered-${row.code}`}
                points={row.points}
                fill="none"
                stroke="#166534"
                strokeWidth="4"
                strokeDasharray="7 3"
              />
            ))}
        {layers.pending &&
          rows
            .filter((row) => row.delivery !== "Entregado")
            .map((row) => (
              <polygon
                key={`pending-${row.code}`}
                points={row.points}
                fill="none"
                stroke="#dc2626"
                strokeWidth="3"
                strokeDasharray="4 3"
              />
            ))}
        {layers.interferences &&
          [
            [135, 165],
            [300, 151],
            [452, 180],
            [218, 236],
          ].map(([x, y], index) => (
            <g key={index}>
              <circle cx={x} cy={y} r="8" fill={COLORS.red} stroke="#fff" strokeWidth="2" />
              <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fill="#fff">
                !
              </text>
            </g>
          ))}
        {layers.controls &&
          [
            [42, 304],
            [271, 224],
            [548, 104],
          ].map(([x, y], index) => (
            <g key={index}>
              <circle cx={x} cy={y} r="6" fill="#111827" />
              <circle cx={x} cy={y} r="11" fill="none" stroke="#111827" />
            </g>
          ))}
      </svg>
      <div className="absolute left-3 top-16 z-10 w-44 rounded-lg border border-slate-200 bg-white/95 p-2.5 shadow">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold">
          <Layers3 size={12} /> Capas del mapa
        </div>
        {Object.entries(layerLabels).map(([key, label]) => (
          <label
            key={key}
            className="flex cursor-pointer items-center justify-between py-1 text-[9px]"
          >
            <span>{label}</span>
            <input
              type="checkbox"
              checked={layers[key]}
              onChange={() =>
                onLayers((current) => ({
                  ...current,
                  [key]: !current[key as keyof typeof current],
                }))
              }
              className="accent-[#dc2626]"
            />
          </label>
        ))}
      </div>
      <div className="absolute bottom-3 left-3 z-10 grid grid-cols-2 gap-x-3 gap-y-1 rounded-lg border bg-white/95 p-2.5 text-[8px] shadow">
        {Object.entries(statusColors).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1.5">
            <i className="size-2 rounded-sm" style={{ background: color }} />
            {status}
          </span>
        ))}
      </div>
      {selected && (
        <div className="absolute right-3 top-16 z-20 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex justify-between">
            <div>
              <b className="text-[12px] text-[#dc2626]">{selected.code}</b>
              <p className="text-[10px] font-medium">{selected.passive}</p>
            </div>
            <button onClick={() => onSelect(null)}>
              <X size={14} />
            </button>
          </div>
          {[
            ["Área afectada", `${number(selected.area)} m²`],
            ["Valor tasado", money(selected.appraised, 2, amountUnit)],
            ["Monto aprobado", money(selected.approved, 2, amountUnit)],
            ["Monto pagado", money(selected.paid, 2, amountUnit)],
            ["Saldo", money(selected.approved - selected.paid, 2, amountUnit)],
            ["Entrega", selected.delivery],
            ["Estado registral", selected.registry],
            ["Interferencias", selected.interference],
            ["Riesgo", selected.risk],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between gap-2 border-t border-slate-100 py-1.5 text-[9px]"
            >
              <span className="text-slate-500">{label}</span>
              <b className="text-right">{value}</b>
            </div>
          ))}
          <button className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded bg-[#dc2626] px-2 py-2 text-[10px] font-semibold text-white">
            <FileCheck2 size={12} /> Ver documentos del predio
          </button>
        </div>
      )}
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
  search?: string;
  onSearch?: (value: string) => void;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2.5">
      <div>
        <h2 className="text-[13px] font-semibold text-slate-800">{title}</h2>
        <p className="text-[10px] text-slate-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        {onSearch && (
          <div className="flex h-8 w-64 items-center gap-2 rounded border border-slate-200 px-2 text-slate-400">
            <Search size={13} />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Buscar..."
              className="min-w-0 flex-1 bg-transparent text-[10px] text-slate-700 outline-none"
            />
          </div>
        )}
        {action}
      </div>
    </div>
  );
}

function PaymentsTable({
  rows,
  search,
  onSearch,
  concept,
  onClearConcept,
  amountUnit,
}: {
  rows: PaymentRow[];
  search: string;
  onSearch: (value: string) => void;
  concept: string | null;
  onClearConcept: () => void;
  amountUnit: AmountUnit;
}) {
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [ascending, setAscending] = useState(true);
  const visibleRows = [...rows]
    .filter((row) => statusFilter === "TODOS" || row.status === statusFilter)
    .sort((a, b) => (ascending ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code)));
  return (
    <section className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <TableHeader
        title="Tabla de pagos prediales"
        subtitle="Trazabilidad desde aprobación hasta pago efectivo"
        search={search}
        onSearch={onSearch}
        action={
          <div className="flex gap-1">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-8 rounded border border-slate-300 bg-white px-2 text-[9px]"
            >
              <option>TODOS</option>
              <option>Pagado</option>
              <option>En proceso</option>
              <option>Emitido no entregado</option>
              <option>Próximo a vencer</option>
            </select>
            <button
              onClick={() =>
                exportExcel(
                  "pagos_prediales",
                  [
                    "Código",
                    "Beneficiario",
                    "Concepto",
                    "Aprobado",
                    "Certificado",
                    "Devengado",
                    "Girado",
                    "Pagado",
                    "Programada",
                    "Efectiva",
                    "Saldo",
                    "Estado",
                  ],
                  visibleRows.map((row) => [
                    row.code,
                    row.beneficiary,
                    row.concept,
                    row.approved,
                    row.certified,
                    row.accrued,
                    row.drawn,
                    row.paid,
                    displayDate(row.programmed),
                    displayDate(row.effective),
                    row.balance,
                    row.status,
                  ]),
                )
              }
              className="inline-flex h-8 items-center gap-1 rounded border border-slate-300 px-2 text-[9px]"
            >
              <FileSpreadsheet size={12} /> Excel
            </button>
            {concept ? (
              <button
                onClick={onClearConcept}
                className="inline-flex h-8 items-center gap-1 rounded bg-red-50 px-2 text-[9px] font-semibold text-red-700"
              >
                Concepto: {concept} <X size={11} />
              </button>
            ) : null}
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1450px] text-[10px]">
          <thead className="bg-slate-50 text-left uppercase text-slate-500">
            <tr>
              {[
                "Código ↕",
                "Beneficiario",
                "Concepto",
                "Aprobado",
                "Certificado",
                "Devengado",
                "Girado",
                "Pagado",
                "Fecha programada",
                "Fecha efectiva",
                "Saldo",
                "Estado",
                "Documentos",
              ].map((head) => (
                <th key={head} className="whitespace-nowrap px-3 py-2 font-semibold">
                  {head.startsWith("Código") ? (
                    <button onClick={() => setAscending((current) => !current)}>{head}</button>
                  ) : (
                    head
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row.code}
                className={`border-t border-slate-100 hover:bg-slate-50 ${row.status === "Emitido no entregado" ? "bg-red-50/70" : row.status === "Próximo a vencer" ? "bg-amber-50/70" : ""}`}
              >
                <td className="px-3 py-2.5 font-bold text-[#dc2626]">{row.code}</td>
                <td className="px-3 py-2.5 font-medium">{row.beneficiary}</td>
                <td className="px-3 py-2.5">{row.concept}</td>
                {[row.approved, row.certified, row.accrued, row.drawn, row.paid].map(
                  (value, index) => (
                    <td key={index} className="px-3 py-2.5 font-medium">
                      {money(value, 2, amountUnit)}
                    </td>
                  ),
                )}
                <td className="px-3 py-2.5">{displayDate(row.programmed)}</td>
                <td className="px-3 py-2.5">{displayDate(row.effective)}</td>
                <td className="px-3 py-2.5 font-semibold">{money(row.balance, 2, amountUnit)}</td>
                <td
                  className={`px-3 py-2.5 font-semibold ${row.status === "Emitido no entregado" ? "text-red-700" : row.status === "Próximo a vencer" ? "text-amber-700" : "text-green-700"}`}
                >
                  {row.status}
                </td>
                <td className="px-3 py-2.5">
                  <button className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[9px] text-blue-700">
                    <Eye size={11} /> Sustento
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

function RegistryIcon({ status }: { status: string }) {
  const config =
    status === "Inscrito"
      ? { Icon: CheckCircle2, cls: "text-green-600 bg-green-50" }
      : status === "Observado"
        ? { Icon: AlertCircle, cls: "text-amber-600 bg-amber-50" }
        : status === "Subsanado"
          ? { Icon: FileCheck2, cls: "text-blue-600 bg-blue-50" }
          : status === "Tachado"
            ? { Icon: FileX2, cls: "text-red-600 bg-red-50" }
            : status === "Archivado"
              ? { Icon: Archive, cls: "text-slate-500 bg-slate-100" }
              : { Icon: FileClock, cls: "text-slate-500 bg-slate-100" };
  const Icon = config.Icon;
  return (
    <span className={`inline-flex size-6 items-center justify-center rounded-full ${config.cls}`}>
      <Icon size={13} />
    </span>
  );
}
function RegistryTable({
  rows,
  search,
  onSearch,
}: {
  rows: RegistryRow[];
  search: string;
  onSearch: (value: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [ascending, setAscending] = useState(true);
  const visibleRows = [...rows]
    .filter((row) => statusFilter === "TODOS" || row.status === statusFilter)
    .sort((a, b) => (ascending ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code)));
  return (
    <section className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <TableHeader
        title="Tabla de seguimiento registral"
        subtitle="Presentación, observaciones, subsanaciones e inscripción"
        search={search}
        onSearch={onSearch}
        action={
          <div className="flex gap-1">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-8 rounded border border-slate-300 bg-white px-2 text-[9px]"
            >
              <option>TODOS</option>
              <option>Pendiente</option>
              <option>Observado</option>
              <option>Subsanado</option>
              <option>Inscrito</option>
              <option>Tachado</option>
              <option>Archivado</option>
            </select>
            <button
              onClick={() =>
                exportExcel(
                  "seguimiento_registral",
                  [
                    "Predio",
                    "Oficina",
                    "Título",
                    "Presentación",
                    "Estado",
                    "Observación",
                    "Límite",
                    "Partida",
                    "Responsable",
                  ],
                  visibleRows.map((row) => [
                    row.code,
                    row.office,
                    row.title,
                    displayDate(row.presentation),
                    row.status,
                    row.observation,
                    displayDate(row.deadline),
                    row.resulting,
                    row.owner,
                  ]),
                )
              }
              className="inline-flex h-8 items-center gap-1 rounded border border-slate-300 px-2 text-[9px]"
            >
              <FileSpreadsheet size={12} /> Excel
            </button>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1250px] text-[10px]">
          <thead className="bg-slate-50 text-left uppercase text-slate-500">
            <tr>
              {[
                "Predio ↕",
                "Oficina registral",
                "Número de título",
                "Presentación",
                "Estado",
                "Observación",
                "Límite de subsanación",
                "Partida resultante",
                "Responsable",
                "Documentos",
              ].map((head) => (
                <th key={head} className="whitespace-nowrap px-3 py-2 font-semibold">
                  {head.startsWith("Predio") ? (
                    <button onClick={() => setAscending((current) => !current)}>{head}</button>
                  ) : (
                    head
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.code} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2.5 font-bold text-[#dc2626]">{row.code}</td>
                <td className="px-3 py-2.5">{row.office}</td>
                <td className="px-3 py-2.5 font-medium">{row.title}</td>
                <td className="px-3 py-2.5">{displayDate(row.presentation)}</td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <RegistryIcon status={row.status} />
                    <b>{row.status}</b>
                  </span>
                </td>
                <td className="px-3 py-2.5">{row.observation}</td>
                <td className="px-3 py-2.5">{displayDate(row.deadline)}</td>
                <td className="px-3 py-2.5">{row.resulting}</td>
                <td className="px-3 py-2.5">{row.owner}</td>
                <td className="px-3 py-2.5">
                  <button className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[9px] text-blue-700">
                    <Eye size={11} /> Título
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

function ClosureTable({ rows }: { rows: MapProperty[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [ascending, setAscending] = useState(true);
  const controlsFor = (row: MapProperty) => [
    row.paid >= row.approved * 0.98,
    row.delivery === "Entregado",
    row.interference === "Liberada",
    row.registry === "Inscrito",
    mapProperties.indexOf(row) % 4 !== 2,
  ];
  const visibleRows = [...rows]
    .filter(
      (row) =>
        !search.trim() || `${row.code} ${row.passive}`.toLowerCase().includes(search.toLowerCase()),
    )
    .filter(
      (row) =>
        statusFilter === "TODOS" ||
        (controlsFor(row).every(Boolean) ? "CERRADO" : "EN PROCESO") === statusFilter,
    )
    .sort((a, b) => (ascending ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code)));
  return (
    <section className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <TableHeader
        title="Control de cierre integral por predio"
        subtitle="El predio se cierra únicamente cuando los cinco controles están conformes"
        search={search}
        onSearch={setSearch}
        action={
          <div className="flex gap-1">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-8 rounded border border-slate-300 bg-white px-2 text-[9px]"
            >
              <option>TODOS</option>
              <option>CERRADO</option>
              <option>EN PROCESO</option>
            </select>
            <button
              onClick={() =>
                exportExcel(
                  "cierre_integral",
                  [
                    "Predio",
                    "Pago conciliado",
                    "Entrega física",
                    "Interferencias",
                    "Inscripción",
                    "Expediente",
                    "Estado",
                  ],
                  visibleRows.map((row) => {
                    const controls = controlsFor(row);
                    return [
                      row.code,
                      ...controls.map((value) => (value ? "Conforme" : "Pendiente")),
                      controls.every(Boolean) ? "CERRADO" : "EN PROCESO",
                    ];
                  }),
                )
              }
              className="inline-flex h-8 items-center gap-1 rounded border border-slate-300 px-2 text-[9px]"
            >
              <FileSpreadsheet size={12} /> Excel
            </button>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-[10px]">
          <thead className="bg-slate-50 text-left uppercase text-slate-500">
            <tr>
              {[
                "Predio ↕",
                "Pago conciliado",
                "Entrega física",
                "Interferencias liberadas",
                "Inscripción concluida",
                "Expediente completo",
                "Estado integral",
                "Documentos",
              ].map((head) => (
                <th key={head} className="px-3 py-2 text-center font-semibold first:text-left">
                  {head.startsWith("Predio") ? (
                    <button onClick={() => setAscending((current) => !current)}>{head}</button>
                  ) : (
                    head
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const controls = controlsFor(row);
              const closed = controls.every(Boolean);
              return (
                <tr key={row.code} className="border-t border-slate-100">
                  <td className="px-3 py-2.5 font-bold text-[#dc2626]">{row.code}</td>
                  {controls.map((value, controlIndex) => (
                    <td key={controlIndex} className="px-3 py-2.5 text-center">
                      {value ? (
                        <CheckCircle2 size={16} className="mx-auto text-green-600" />
                      ) : (
                        <AlertCircle size={16} className="mx-auto text-red-500" />
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-bold ${closed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {closed ? "CERRADO" : "EN PROCESO"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[9px] text-blue-700">
                      <Eye size={11} /> Expediente
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AuditPanel({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("TODOS");
  const [ascending, setAscending] = useState(false);
  const visibleAudits = [...audits]
    .filter((row) => userFilter === "TODOS" || row[1] === userFilter)
    .filter((row) => !search.trim() || row.join(" ").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (ascending ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0])));
  return (
    <section className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between border-b border-slate-200 px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <History size={15} className="text-[#dc2626]" />
          <div>
            <h2 className="text-[13px] font-semibold">Panel de auditoría</h2>
            <p className="text-[10px] text-slate-500">
              Últimas modificaciones y documentos sustentatorios
            </p>
          </div>
        </div>
        <ChevronRight size={15} className={`transition ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <>
          <div className="flex justify-end gap-2 border-b border-slate-100 p-2">
            <div className="flex h-8 w-64 items-center gap-2 rounded border border-slate-200 px-2 text-slate-400">
              <Search size={12} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar modificación..."
                className="min-w-0 flex-1 text-[9px] outline-none"
              />
            </div>
            <select
              value={userFilter}
              onChange={(event) => setUserFilter(event.target.value)}
              className="h-8 rounded border border-slate-300 bg-white px-2 text-[9px]"
            >
              <option>TODOS</option>
              {Array.from(new Set(audits.map((row) => row[1]))).map((user) => (
                <option key={user}>{user}</option>
              ))}
            </select>
            <button
              onClick={() =>
                exportExcel(
                  "auditoria_territorial",
                  ["Fecha", "Usuario", "Campo", "Anterior", "Nuevo", "Motivo", "Documento"],
                  visibleAudits.map((row) => [...row]),
                )
              }
              className="inline-flex h-8 items-center gap-1 rounded border border-slate-300 px-2 text-[9px]"
            >
              <FileSpreadsheet size={12} /> Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px] text-[10px]">
              <thead className="bg-slate-50 text-left uppercase text-slate-500">
                <tr>
                  {[
                    "Fecha ↕",
                    "Usuario",
                    "Campo modificado",
                    "Valor anterior",
                    "Valor nuevo",
                    "Motivo",
                    "Documento sustentatorio",
                    "",
                  ].map((head) => (
                    <th key={head} className="whitespace-nowrap px-3 py-2 font-semibold">
                      {head.startsWith("Fecha") ? (
                        <button onClick={() => setAscending((current) => !current)}>{head}</button>
                      ) : (
                        head
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleAudits.map(([date, user, field, previous, next, reason, document]) => (
                  <tr key={`${date}-${field}`} className="border-t border-slate-100">
                    <td className="px-3 py-2.5">{displayDate(date)}</td>
                    <td className="px-3 py-2.5 font-medium">{user}</td>
                    <td className="px-3 py-2.5">{field}</td>
                    <td className="px-3 py-2.5 text-slate-500">{previous}</td>
                    <td className="px-3 py-2.5 font-semibold">{next}</td>
                    <td className="px-3 py-2.5">{reason}</td>
                    <td className="px-3 py-2.5 text-blue-700">{document}</td>
                    <td className="px-3 py-2.5">
                      <button className="rounded border border-slate-200 p-1">
                        <Eye size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
