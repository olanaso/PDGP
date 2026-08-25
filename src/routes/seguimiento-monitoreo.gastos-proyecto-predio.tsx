import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownUp,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FilterX,
  Layers3,
  Search,
  SlidersHorizontal,
  WalletCards,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartExplanation } from "../components/ChartExplanation";
import writeExcelFile, { type Feature, type SheetData } from "write-excel-file/browser";

import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/seguimiento-monitoreo/gastos-proyecto-predio")({
  head: () => ({ meta: [{ title: "Monitoreo de Gastos por Proyecto y Predio" }] }),
  component: GastosProyectoPredioPage,
});

const COLORS = {
  green: "#16a34a",
  blue: "#2563eb",
  amber: "#f59e0b",
  orange: "#ea580c",
  red: "#dc2626",
  slate: "#64748b",
  purple: "#7c3aed",
  cyan: "#0891b2",
};

const expenseCategories = [
  "Valor del terreno",
  "Edificaciones",
  "Obras complementarias",
  "Instalaciones",
  "Plantaciones",
  "Daño emergente",
  "Lucro cesante",
  "Incentivo",
  "Compensación",
  "Reconocimiento de mejoras",
  "Gastos de traslado",
  "Servicios técnicos",
  "Servicios legales",
  "Gastos notariales",
  "Gastos registrales",
  "Gestión social",
  "Liberación de interferencias",
  "Gastos administrativos",
] as const;

const categoryColors = [
  "#b91c1c",
  "#dc2626",
  "#ea580c",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0891b2",
  "#2563eb",
  "#4f46e5",
  "#7c3aed",
  "#9333ea",
  "#c026d3",
  "#64748b",
];

type Predio = {
  code: string;
  name: string;
  owner: string;
  tramo: string;
  sector: string;
  procedure: string;
  legal: string;
  status: string;
  area: number;
  estimated: number;
  appraised: number;
  approved: number;
  certified: number;
  committed: number;
  accrued: number;
  drawn: number;
  paid: number;
  services: number;
  interference: number;
};

const predios: Predio[] = Array.from({ length: 12 }, (_, index) => {
  const area = 680 + ((index * 431) % 3100);
  const estimated = 680_000 + index * 143_000 + (index % 3) * 185_000;
  const appraised = estimated * (0.91 + (index % 5) * 0.045);
  const approved = appraised * (0.94 + (index % 4) * 0.035);
  const paid = approved * (0.54 + (index % 5) * 0.085);
  return {
    code: `PR-${String(1842 + index * 17).padStart(6, "0")}`,
    name: `Predio ${String(index + 1).padStart(2, "0")} – Corredor Central`,
    owner: [
      "María Elena Rojas",
      "Sucesión Flores Huamán",
      "Comunidad San Jerónimo",
      "Inversiones del Centro SAC",
      "Agrícola Santa Ana SRL",
      "José Antonio Medina",
    ][index % 6],
    tramo: `Tramo ${(index % 3) + 1}`,
    sector: `Sector ${String.fromCharCode(65 + (index % 4))}`,
    procedure: ["Trato directo", "Expropiación"][index % 2],
    legal: ["Propietario registral", "Poseedor", "Sucesión", "Inmueble no inscrito"][index % 4],
    status: ["En proceso", "Pagado", "Entregado", "Inscrito", "Observado"][index % 5],
    area,
    estimated,
    appraised,
    approved,
    certified: approved * 0.96,
    committed: approved * 0.92,
    accrued: approved * 0.84,
    drawn: paid * 1.03,
    paid,
    services: approved * (0.035 + (index % 3) * 0.012),
    interference: approved * (0.018 + (index % 4) * 0.009),
  };
});

type Movement = {
  id: string;
  predio: string;
  category: string;
  subcategory: string;
  concept: string;
  group: string;
  linkType: "Directo" | "Compartido" | "Prorrateado" | "General";
  contract: string;
  provider: string;
  file: string;
  resolution: string;
  certification: string;
  commitment: string;
  accrual: string;
  draw: string;
  receipt: string;
  funding: string;
  classifier: string;
  year: string;
  recordDate: string;
  scheduledDate: string;
  effectiveDate: string;
  estimated: number;
  appraised: number;
  approved: number;
  certified: number;
  committed: number;
  accrued: number;
  drawn: number;
  paid: number;
  state: string;
  responsible: string;
  hasDocument: boolean;
  rule: string;
  assignedPct: number;
  totalContract: number;
};

const movementCategories = [
  "Valor del terreno",
  "Edificaciones",
  "Servicios técnicos",
  "Servicios legales",
  "Liberación de interferencias",
  "Reconocimiento de mejoras",
  "Gastos administrativos",
  "Plantaciones",
];

const movements: Movement[] = predios.flatMap((predio, predioIndex) =>
  Array.from({ length: 4 }, (_, movementIndex) => {
    const category =
      movementCategories[(predioIndex + movementIndex * 2) % movementCategories.length];
    const factor = [0.52, 0.22, 0.12, 0.07][movementIndex];
    const approved = predio.approved * factor;
    const linkType = (["Directo", "Compartido", "Prorrateado", "General"] as const)[
      (predioIndex + movementIndex) % 4
    ];
    return {
      id: `MOV-${String(predioIndex * 4 + movementIndex + 1).padStart(5, "0")}`,
      predio: predio.code,
      category,
      subcategory: movementIndex % 2 ? "Servicio especializado" : "Componente principal",
      concept: `${category} – ${predio.sector}`,
      group: groupForCategory(category),
      linkType,
      contract:
        movementIndex === 0
          ? "—"
          : `OS-${String(410 + predioIndex * 3 + movementIndex).padStart(5, "0")}`,
      provider:
        movementIndex === 0
          ? predio.owner
          : ["Consorcio Predial Centro", "Tasaciones Andinas SAC", "Notaría del Valle"][
              movementIndex - 1
            ],
      file: `EXP-${String(2026000 + predioIndex * 10 + movementIndex)}`,
      resolution:
        movementIndex === 0 ? `RD-${String(620 + predioIndex).padStart(4, "0")}-2026` : "—",
      certification: `CCP-${String(8001 + predioIndex * 4 + movementIndex).padStart(6, "0")}`,
      commitment: `COM-${String(7101 + predioIndex * 4 + movementIndex).padStart(6, "0")}`,
      accrual: `DEV-${String(5301 + predioIndex * 4 + movementIndex).padStart(6, "0")}`,
      draw: `GIR-${String(4201 + predioIndex * 4 + movementIndex).padStart(6, "0")}`,
      receipt: `CP-${String(3101 + predioIndex * 4 + movementIndex).padStart(7, "0")}`,
      funding: predioIndex % 2 ? "Recursos ordinarios" : "Recursos por operaciones",
      classifier: ["2.6.8.1.4.2", "2.3.2.7.11.99", "2.6.3.2.9.2"][movementIndex % 3],
      year: predioIndex % 5 === 0 ? "2025" : "2026",
      recordDate: `2026-${String(3 + (movementIndex % 5)).padStart(2, "0")}-${String(4 + (predioIndex % 23)).padStart(2, "0")}`,
      scheduledDate: `2026-${String(7 + (movementIndex % 2)).padStart(2, "0")}-${String(6 + (predioIndex % 20)).padStart(2, "0")}`,
      effectiveDate:
        movementIndex === 3 && predioIndex % 3 === 0
          ? ""
          : `2026-07-${String(8 + (predioIndex % 18)).padStart(2, "0")}`,
      estimated: predio.estimated * factor,
      appraised: predio.appraised * factor,
      approved,
      certified: approved * 0.96,
      committed: approved * 0.92,
      accrued: approved * (0.72 + movementIndex * 0.05),
      drawn: approved * (0.62 + movementIndex * 0.05),
      paid: approved * (0.54 + movementIndex * 0.055),
      state: ["Pagado", "En proceso", "Pendiente", "Observado"][movementIndex],
      responsible: ["C. Romero", "L. Quispe", "M. Salazar", "A. Paredes"][movementIndex],
      hasDocument: !(predioIndex % 5 === 0 && movementIndex === 3),
      rule:
        linkType === "Directo"
          ? "Asignación directa"
          : (["Área afectada", "Número de predios", "Fórmula mixta"][movementIndex - 1] ??
            "Fórmula mixta"),
      assignedPct: linkType === "Directo" ? 100 : 12 + (predioIndex % 5) * 3,
      totalContract: linkType === "Directo" ? approved : approved * (4.1 + (predioIndex % 3)),
    };
  }),
);

function groupForCategory(category: string) {
  if (
    [
      "Valor del terreno",
      "Edificaciones",
      "Plantaciones",
      "Daño emergente",
      "Lucro cesante",
      "Incentivo",
      "Compensación",
    ].includes(category)
  )
    return "Pagos directos";
  if (["Reconocimiento de mejoras", "Gastos de traslado"].includes(category))
    return "Mejoras y traslado";
  if (
    [
      "Servicios técnicos",
      "Servicios legales",
      "Gastos notariales",
      "Gastos registrales",
      "Gestión social",
    ].includes(category)
  )
    return "Servicios técnicos y legales";
  if (category === "Liberación de interferencias") return "Interferencias";
  return "Gastos administrativos";
}

const defaultFilters = {
  project: "Carretera Central – Tramo 1",
  year: "TODOS",
  tramo: "TODOS",
  sector: "TODOS",
  procedure: "TODOS",
  legal: "TODAS",
  status: "TODOS",
  category: "TODAS",
  provider: "TODOS",
  contract: "TODOS",
  funding: "TODAS",
  budgetState: "TODOS",
  start: "2026-01-01",
  end: "2026-08-05",
};

type ViewMode = "summary" | "detail";
type ExportMode = "summary" | "detail" | "both";

function money(value: number, compact = false) {
  if (compact && Math.abs(value) >= 1_000_000) return `S/ ${(value / 1_000_000).toFixed(2)} M`;
  return `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function date(value: string) {
  if (!value) return "Pendiente";
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function GastosProyectoPredioPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedPredios, setSelectedPredios] = useState(predios.map((item) => item.code));
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [view, setView] = useState<ViewMode>("summary");
  const [search, setSearch] = useState("");
  const [sortDescending, setSortDescending] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedBar, setSelectedBar] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportMode, setExportMode] = useState<ExportMode>("both");

  const scopedPredios = useMemo(() => {
    return predios.filter(
      (item) =>
        selectedPredios.includes(item.code) &&
        (filters.tramo === "TODOS" || item.tramo === filters.tramo) &&
        (filters.sector === "TODOS" || item.sector === filters.sector) &&
        (filters.procedure === "TODOS" || item.procedure === filters.procedure) &&
        (filters.legal === "TODAS" || item.legal === filters.legal) &&
        (filters.status === "TODOS" || item.status === filters.status),
    );
  }, [filters, selectedPredios]);

  const scopedCodes = useMemo(
    () => new Set(scopedPredios.map((item) => item.code)),
    [scopedPredios],
  );
  const filteredMovements = useMemo(
    () =>
      movements.filter(
        (item) =>
          scopedCodes.has(item.predio) &&
          (filters.year === "TODOS" || item.year === filters.year) &&
          (filters.category === "TODAS" || item.category === filters.category) &&
          (filters.provider === "TODOS" || item.provider === filters.provider) &&
          (filters.contract === "TODOS" || item.contract === filters.contract) &&
          (filters.funding === "TODAS" || item.funding === filters.funding) &&
          (filters.budgetState === "TODOS" || item.state === filters.budgetState) &&
          (!selectedGroup || item.group === selectedGroup) &&
          (!selectedBar || item.predio === selectedBar) &&
          item.recordDate >= filters.start &&
          item.recordDate <= filters.end &&
          (!search ||
            `${item.predio} ${item.concept} ${item.provider} ${item.contract}`
              .toLowerCase()
              .includes(search.toLowerCase())),
      ),
    [filters, scopedCodes, search, selectedBar, selectedGroup],
  );

  const totals = useMemo(() => {
    const sum = (key: keyof Predio) =>
      scopedPredios.reduce((acc, item) => acc + Number(item[key]), 0);
    const totalCost = sum("approved") + sum("services") + sum("interference");
    return {
      area: sum("area"),
      estimated: sum("estimated"),
      appraised: sum("appraised"),
      approved: sum("approved"),
      certified: sum("certified"),
      committed: sum("committed"),
      accrued: sum("accrued"),
      drawn: sum("drawn"),
      paid: sum("paid"),
      pending: sum("approved") - sum("paid"),
      totalCost,
    };
  }, [scopedPredios]);

  const chartRows = useMemo(
    () =>
      scopedPredios
        .map((item, index) => {
          const row: Record<string, string | number> = { code: item.code };
          expenseCategories.forEach((category, categoryIndex) => {
            const weight = ((index + categoryIndex * 3) % 9) + 1;
            row[category] = item.approved * (weight / 340);
          });
          return row;
        })
        .sort((a, b) => Number(b["Valor del terreno"]) - Number(a["Valor del terreno"])),
    [scopedPredios],
  );

  const composition = useMemo(() => {
    const groups = [
      "Pagos directos",
      "Mejoras y traslado",
      "Servicios técnicos y legales",
      "Interferencias",
      "Gastos administrativos",
    ];
    return groups.map((name, index) => ({
      name,
      value: movements
        .filter((movement) => scopedCodes.has(movement.predio) && movement.group === name)
        .reduce((sum, movement) => sum + movement.paid, 0),
      color: [COLORS.red, COLORS.amber, COLORS.blue, COLORS.orange, COLORS.slate][index],
    }));
  }, [scopedCodes]);

  const summaryRows = useMemo(
    () =>
      [...scopedPredios].sort((a, b) =>
        sortDescending
          ? b.approved + b.services + b.interference - (a.approved + a.services + a.interference)
          : a.approved - b.approved,
      ),
    [scopedPredios, sortDescending],
  );

  const cards = [
    ["Predios seleccionados", scopedPredios.length.toString(), "Alcance de consulta", "blue"],
    [
      "Área total afectada",
      `${totals.area.toLocaleString("es-PE", { maximumFractionDigits: 0 })} m²`,
      "Superficie consolidada",
      "blue",
    ],
    ["Presupuesto estimado", money(totals.estimated, true), "Estimación inicial", "slate"],
    [
      "Valor total tasado",
      money(totals.appraised, true),
      `${((totals.appraised / Math.max(totals.estimated, 1) - 1) * 100).toFixed(1)}% vs. estimado`,
      "amber",
    ],
    ["Monto total aprobado", money(totals.approved, true), "Resoluciones aprobadas", "blue"],
    [
      "Monto certificado",
      money(totals.certified, true),
      `${((totals.certified / Math.max(totals.approved, 1)) * 100).toFixed(1)}% aprobado`,
      "blue",
    ],
    ["Monto comprometido", money(totals.committed, true), "Compromiso anual", "blue"],
    ["Monto devengado", money(totals.accrued, true), "Obligación reconocida", "blue"],
    ["Monto girado", money(totals.drawn, true), "Órdenes de pago", "blue"],
    [
      "Monto pagado",
      money(totals.paid, true),
      `${((totals.paid / Math.max(totals.approved, 1)) * 100).toFixed(1)}% de ejecución`,
      "green",
    ],
    [
      "Saldo pendiente",
      money(totals.pending, true),
      "Por completar",
      totals.pending < 0 ? "red" : "amber",
    ],
    [
      "Costo total acumulado",
      money(totals.totalCost, true),
      "Directo + servicios + interferencias",
      "purple",
    ],
  ] as const;

  const indicators = [
    [
      "Costo promedio por predio",
      money(totals.totalCost / Math.max(scopedPredios.length, 1), true),
    ],
    ["Costo por m² afectado", money(totals.totalCost / Math.max(totals.area, 1))],
    ["Ejecución financiera", `${((totals.paid / Math.max(totals.approved, 1)) * 100).toFixed(1)}%`],
    [
      "Desviación costo final",
      `${((totals.totalCost / Math.max(totals.estimated, 1) - 1) * 100).toFixed(1)}%`,
    ],
  ];

  function setScope(kind: "all" | "tramo" | "one") {
    if (kind === "all") setSelectedPredios(predios.map((item) => item.code));
    if (kind === "tramo")
      setSelectedPredios(
        predios.filter((item) => item.tramo === "Tramo 1").map((item) => item.code),
      );
    if (kind === "one") setSelectedPredios([predios[0].code]);
  }

  function reset() {
    setFilters(defaultFilters);
    setSelectedPredios(predios.map((item) => item.code));
    setSelectedBar(null);
    setSelectedGroup(null);
    setSearch("");
  }

  async function exportWorkbook() {
    const sheets: ReturnType<typeof buildExcelSheet>[] = [];
    if (exportMode !== "detail") {
      const rows = summaryRows.map((item) => ({
        "Código predio": item.code,
        Predio: item.name,
        "Sujeto pasivo": item.owner,
        Tramo: item.tramo,
        Sector: item.sector,
        "Costo estimado": item.estimated,
        "Valor tasado": item.appraised,
        "Monto aprobado": item.approved,
        "Monto pagado": item.paid,
        "Servicios asociados": item.services,
        Interferencias: item.interference,
        Saldo: item.approved - item.paid,
        "Costo total": item.approved + item.services + item.interference,
        Estado: item.status,
      }));
      sheets.push(buildExcelSheet("Resumen por predio", rows));
    }
    if (exportMode !== "summary") {
      const rows = filteredMovements.map((item) => movementExportRow(item));
      sheets.push(buildExcelSheet("Detalle de gastos", rows));
    }
    const shared = filteredMovements
      .filter((item) => item.linkType !== "Directo")
      .map((item) => ({
        "Contrato o servicio": item.contract,
        "Tipo de vinculación": item.linkType,
        "Regla de distribución": item.rule,
        "Predio beneficiado": item.predio,
        "Porcentaje asignado": item.assignedPct / 100,
        "Monto total contrato": item.totalContract,
        "Monto asignado": item.approved,
        Estado: item.state,
      }));
    sheets.push(buildExcelSheet("Distribución gastos compartidos", shared));
    sheets.push(
      buildExcelSheet("Parámetros de consulta", [
        { Parámetro: "Proyecto", Valor: filters.project },
        { Parámetro: "Predios consultados", Valor: selectedPredios.join(", ") },
        { Parámetro: "Filtros aplicados", Valor: JSON.stringify(filters) },
        { Parámetro: "Usuario", Valor: "Equipo funcional" },
        { Parámetro: "Fecha y hora", Valor: new Date().toLocaleString("es-PE") },
      ]),
    );
    await writeExcelFile(sheets, { features: [excelAutoFilterFeature] }).toFile(
      `monitoreo_gastos_prediales_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    setExportOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f7] text-[#172033]">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-auto p-3 xl:p-4">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <WalletCards size={21} />
            </div>
            <div>
              <h1 className="text-[20px] font-semibold tracking-tight">
                Monitoreo de Gastos por Proyecto y Predio
              </h1>
              <p className="text-[12px] text-slate-500">
                Consulta consolidada de movimientos presupuestales, contractuales, financieros y de
                pago
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Actualizado: 05 ago 2026 · 10:35</span>
            <button
              onClick={() => setExportOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-[#dc2626] px-3 py-2 text-[12px] font-semibold text-white hover:bg-red-700"
            >
              <FileSpreadsheet size={15} /> Exportar a Excel
            </button>
          </div>
        </header>

        <section className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <FilterSelect
              required
              label="Proyecto"
              value={filters.project}
              options={["Carretera Central – Tramo 1", "Evitamiento Chimbote", "Puente Santa Rosa"]}
              onChange={(value) => setFilters({ ...filters, project: value })}
            />
            <div className="relative">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Predios seleccionados *
              </label>
              <button
                onClick={() => setSelectorOpen(!selectorOpen)}
                className="flex h-9 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-2.5 text-left text-[12px]"
              >
                <span className="truncate">
                  {selectedPredios.length === predios.length
                    ? "Todos los predios"
                    : `${selectedPredios.length} predio(s) seleccionados`}
                </span>
                <ChevronDown size={14} />
              </button>
              {selectorOpen && (
                <div className="absolute z-30 mt-1 w-full min-w-[320px] rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="mb-2 grid grid-cols-2 gap-1">
                    <ScopeButton label="Todo el proyecto" onClick={() => setScope("all")} />
                    <ScopeButton label="Tramo 1" onClick={() => setScope("tramo")} />
                    <ScopeButton
                      label="Sector A"
                      onClick={() =>
                        setSelectedPredios(
                          predios
                            .filter((item) => item.sector === "Sector A")
                            .map((item) => item.code),
                        )
                      }
                    />
                    <ScopeButton label="Predio individual" onClick={() => setScope("one")} />
                  </div>
                  <div className="max-h-52 space-y-1 overflow-auto border-t border-slate-100 pt-2">
                    {predios.map((item) => (
                      <label
                        key={item.code}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-[11px] hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPredios.includes(item.code)}
                          onChange={() =>
                            setSelectedPredios((current) =>
                              current.includes(item.code)
                                ? current.filter((code) => code !== item.code)
                                : [...current, item.code],
                            )
                          }
                          className="accent-red-600"
                        />
                        <span className="font-semibold">{item.code}</span>
                        <span className="truncate text-slate-500">{item.owner}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectorOpen(false)}
                    className="mt-2 w-full rounded bg-slate-900 py-1.5 text-[11px] font-semibold text-white"
                  >
                    Aplicar selección
                  </button>
                </div>
              )}
            </div>
            <FilterSelect
              label="Año fiscal"
              value={filters.year}
              options={["TODOS", "2026", "2025"]}
              onChange={(value) => setFilters({ ...filters, year: value })}
            />
            <FilterSelect
              label="Tramo"
              value={filters.tramo}
              options={["TODOS", "Tramo 1", "Tramo 2", "Tramo 3"]}
              onChange={(value) => setFilters({ ...filters, tramo: value })}
            />
          </div>
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-red-600"
          >
            <SlidersHorizontal size={13} />{" "}
            {advancedOpen ? "Ocultar filtros complementarios" : "Mostrar filtros complementarios"}
          </button>
          {advancedOpen && (
            <div className="mt-2 grid gap-2 border-t border-slate-100 pt-2 md:grid-cols-3 xl:grid-cols-7">
              <FilterSelect
                label="Sector"
                value={filters.sector}
                options={["TODOS", "Sector A", "Sector B", "Sector C", "Sector D"]}
                onChange={(value) => setFilters({ ...filters, sector: value })}
              />
              <FilterSelect
                label="Procedimiento"
                value={filters.procedure}
                options={["TODOS", "Trato directo", "Expropiación"]}
                onChange={(value) => setFilters({ ...filters, procedure: value })}
              />
              <FilterSelect
                label="Condición jurídica"
                value={filters.legal}
                options={[
                  "TODAS",
                  "Propietario registral",
                  "Poseedor",
                  "Sucesión",
                  "Inmueble no inscrito",
                ]}
                onChange={(value) => setFilters({ ...filters, legal: value })}
              />
              <FilterSelect
                label="Estado del predio"
                value={filters.status}
                options={["TODOS", "En proceso", "Pagado", "Entregado", "Inscrito", "Observado"]}
                onChange={(value) => setFilters({ ...filters, status: value })}
              />
              <FilterSelect
                label="Categoría"
                value={filters.category}
                options={["TODAS", ...movementCategories]}
                onChange={(value) => setFilters({ ...filters, category: value })}
              />
              <FilterSelect
                label="Estado presupuestal"
                value={filters.budgetState}
                options={["TODOS", "Pagado", "En proceso", "Pendiente", "Observado"]}
                onChange={(value) => setFilters({ ...filters, budgetState: value })}
              />
              <FilterSelect
                label="Proveedor / beneficiario"
                value={filters.provider}
                options={[
                  "TODOS",
                  ...Array.from(new Set(movements.map((item) => item.provider))).slice(0, 8),
                ]}
                onChange={(value) => setFilters({ ...filters, provider: value })}
              />
              <FilterSelect
                label="Contrato"
                value={filters.contract}
                options={[
                  "TODOS",
                  ...Array.from(new Set(movements.map((item) => item.contract)))
                    .filter((item) => item !== "—")
                    .slice(0, 8),
                ]}
                onChange={(value) => setFilters({ ...filters, contract: value })}
              />
              <FilterSelect
                label="Fuente"
                value={filters.funding}
                options={["TODAS", "Recursos ordinarios", "Recursos por operaciones"]}
                onChange={(value) => setFilters({ ...filters, funding: value })}
              />
              <DateField
                label="Desde"
                value={filters.start}
                onChange={(value) => setFilters({ ...filters, start: value })}
              />
              <DateField
                label="Hasta"
                value={filters.end}
                onChange={(value) => setFilters({ ...filters, end: value })}
              />
              <div className="flex items-end">
                <button
                  onClick={reset}
                  className="flex h-9 w-full items-center justify-center gap-1 rounded-md border border-slate-300 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <FilterX size={13} /> Restablecer
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="mb-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {cards.map(([label, value, note, color]) => (
            <KpiCard key={label} label={label} value={value} note={note} color={color} />
          ))}
        </section>
        <section className="mb-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {indicators.map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-slate-900 px-4 py-3 text-white"
            >
              <div className="text-[10px] uppercase tracking-wide text-slate-300">{label}</div>
              <div className="mt-1 text-[20px] font-semibold">{value}</div>
            </div>
          ))}
        </section>

        <section className="mb-3 grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel
            title="Gastos acumulados por predio"
            subtitle="Compara presupuesto, compromiso, devengado y pago por proyecto; seleccione una barra para revisar los movimientos que forman el monto."
            source="SIGEP · Módulo presupuestal"
          >
            {selectedBar && (
              <button
                onClick={() => setSelectedBar(null)}
                className="mb-1 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700"
              >
                {selectedBar}
                <X size={11} />
              </button>
            )}
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartRows}
                  layout="vertical"
                  margin={{ left: 18, right: 12, top: 8 }}
                  onClick={(event) =>
                    event?.activeLabel && setSelectedBar(String(event.activeLabel))
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(value) => `${(value / 1_000).toFixed(0)}k`}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis type="category" dataKey="code" width={82} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => money(Number(value))} />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  {expenseCategories.map((category, index) => (
                    <Bar
                      key={category}
                      dataKey={category}
                      stackId="cost"
                      fill={categoryColors[index]}
                      maxBarSize={20}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel
            title="Estimado, tasado, aprobado y pagado"
            subtitle="Compara el costo de cada predio con su límite presupuestal: rojo indica exceso y amarillo advierte que está próximo al límite."
            source="SIGEP · Presupuesto y tasaciones"
          >
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={scopedPredios.slice(0, 8)}
                  margin={{ left: 4, right: 10, top: 12, bottom: 36 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="code"
                    angle={-32}
                    textAnchor="end"
                    height={55}
                    tick={{ fontSize: 9 }}
                  />
                  <YAxis
                    tickFormatter={(value) => `${(value / 1_000_000).toFixed(1)}M`}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip formatter={(value) => money(Number(value))} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="estimated" name="Estimado" fill="#94a3b8" />
                  <Bar dataKey="appraised" name="Tasado" fill={COLORS.blue} />
                  <Bar dataKey="approved" name="Aprobado">
                    {scopedPredios.slice(0, 8).map((item) => (
                      <Cell
                        key={item.code}
                        fill={
                          item.approved > item.estimated
                            ? COLORS.red
                            : item.approved > item.estimated * 0.9
                              ? COLORS.amber
                              : COLORS.green
                        }
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="paid" name="Pagado" fill={COLORS.green} />
                  <ReferenceLine
                    y={totals.estimated / Math.max(scopedPredios.length, 1)}
                    stroke={COLORS.red}
                    strokeDasharray="5 4"
                    label={{ value: "Límite", fontSize: 9, fill: COLORS.red }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </section>

        <section className="mb-3 grid gap-3 xl:grid-cols-[0.72fr_1.28fr]">
          <Panel
            title="Composición total de gastos"
            subtitle="Cada segmento representa la participación de una categoría en el gasto total; seleccione una para filtrar la tabla de detalle."
            source="SIGEP · Detalle de gastos"
          >
            <div className="h-[275px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={composition}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={2}
                    onClick={(item) =>
                      setSelectedGroup(selectedGroup === item.name ? null : item.name)
                    }
                  >
                    {composition.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                        opacity={!selectedGroup || selectedGroup === item.name ? 1 : 0.3}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => money(Number(value))} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel
            title="Alertas e inconsistencias"
            subtitle="Agrupa inconsistencias detectadas automáticamente y permite priorizar los registros que requieren revisión antes del cierre."
            source="SIGEP · Motor de reglas"
          >
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {[
                ["Pagos duplicados", "2 movimientos", "red"],
                [
                  "Sin documento sustentatorio",
                  `${filteredMovements.filter((item) => !item.hasDocument).length} movimientos`,
                  "red",
                ],
                ["Pago mayor al aprobado", "1 predio", "red"],
                ["Contratos sin distribución", "3 contratos", "amber"],
                ["Compartidos sin asignar", "S/ 184 mil", "amber"],
                ["Saldo negativo", "1 predio", "red"],
                ["Pagado sin entrega", "4 predios", "amber"],
                ["Entregado sin inscripción", "3 predios", "purple"],
                ["Tasaciones vencidas", "5 expedientes", "red"],
                ["Desviación relevante", "3 predios > 10%", "orange"],
              ].map(([label, value, color]) => (
                <button
                  key={label}
                  className="flex items-start gap-2 rounded-lg border border-slate-200 p-2 text-left hover:bg-slate-50"
                >
                  <AlertTriangle
                    size={15}
                    className={`mt-0.5 shrink-0 ${alertIconColor[color] ?? "text-slate-600"}`}
                  />
                  <span>
                    <span className="block text-[11px] font-semibold">{label}</span>
                    <span className="text-[10px] text-slate-500">{value}</span>
                  </span>
                </button>
              ))}
            </div>
          </Panel>
        </section>

        <Panel
          title="Detalle consolidado de gastos"
          subtitle="Resumen expandible por predio y movimientos asociados"
          source="SIGEP · Consulta consolidada"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                onClick={() => setView("summary")}
                className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${view === "summary" ? "bg-white text-red-600 shadow-sm" : "text-slate-500"}`}
              >
                Resumen por predio
              </button>
              <button
                onClick={() => setView("detail")}
                className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${view === "detail" ? "bg-white text-red-600 shadow-sm" : "text-slate-500"}`}
              >
                Detalle de movimientos
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Código, concepto, proveedor..."
                  className="h-9 w-64 rounded-md border border-slate-300 pl-8 pr-3 text-[11px] outline-none focus:border-red-500"
                />
              </div>
              <button
                onClick={() => setSortDescending(!sortDescending)}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-300 px-3 text-[11px] font-semibold"
              >
                <ArrowDownUp size={13} /> {sortDescending ? "Mayor costo" : "Menor costo"}
              </button>
              <button
                onClick={() => setExportOpen(true)}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-red-200 px-3 text-[11px] font-semibold text-red-600"
              >
                <Download size={13} /> Exportar
              </button>
            </div>
          </div>
          {selectedGroup && (
            <div className="mb-2 flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
              <Layers3 size={14} />
              <span>
                Tabla filtrada por: <b>{selectedGroup}</b>
              </span>
              <button onClick={() => setSelectedGroup(null)} className="ml-auto">
                <X size={13} />
              </button>
            </div>
          )}
          {view === "summary" ? (
            <SummaryTable rows={summaryRows} expanded={expanded} onExpand={setExpanded} />
          ) : (
            <MovementTable rows={filteredMovements} />
          )}
        </Panel>

        {exportOpen && (
          <ExportDialog
            mode={exportMode}
            setMode={setExportMode}
            onClose={() => setExportOpen(false)}
            onExport={exportWorkbook}
            count={scopedPredios.length}
          />
        )}
      </main>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label>
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-[11px] outline-none focus:border-red-500"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function DateField({
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
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-slate-300 px-2 text-[11px] outline-none focus:border-red-500"
      />
    </label>
  );
}

function ScopeButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded border border-slate-200 px-2 py-1.5 text-[10px] font-semibold text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
    >
      {label}
    </button>
  );
}

function KpiCard({
  label,
  value,
  note,
  color,
}: {
  label: string;
  value: string;
  note: string;
  color: string;
}) {
  const border: Record<string, string> = {
    green: "border-t-green-500",
    blue: "border-t-blue-500",
    amber: "border-t-amber-500",
    red: "border-t-red-500",
    slate: "border-t-slate-400",
    purple: "border-t-purple-500",
  };
  return (
    <div
      className={`rounded-lg border border-slate-200 border-t-4 bg-white p-3 shadow-sm ${border[color]}`}
    >
      <div className="min-h-7 text-[10px] font-semibold uppercase leading-3 tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 truncate text-[18px] font-semibold">{value}</div>
      <div className="mt-1 text-[10px] text-slate-400">{note}</div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  source,
  children,
}: {
  title: string;
  subtitle: string;
  source: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-[13px] font-semibold">{title}</h2>
          <ChartExplanation>{subtitle}</ChartExplanation>
        </div>
        <BarChart3 size={16} className="text-slate-400" />
      </div>
      <div className="p-3">{children}</div>
      <div className="flex justify-between border-t border-slate-100 px-4 py-1.5 text-[9px] text-slate-400">
        <span>Fuente: {source}</span>
        <span>Actualización: 05 ago 2026</span>
      </div>
    </section>
  );
}

function SummaryTable({
  rows,
  expanded,
  onExpand,
}: {
  rows: Predio[];
  expanded: string | null;
  onExpand: (code: string | null) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1450px] w-full text-[10px]">
        <thead className="bg-slate-50 text-left uppercase text-slate-500">
          <tr>
            {[
              "",
              "Código",
              "Predio / sujeto pasivo",
              "Tramo",
              "Estimado",
              "Tasado",
              "Aprobado",
              "Pagado",
              "Servicios",
              "Interferencias",
              "Saldo",
              "Costo total",
              "Estado",
              "Documento",
            ].map((head) => (
              <th key={head} className="whitespace-nowrap px-2 py-2 font-semibold">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const total = item.approved + item.services + item.interference;
            return (
              <FragmentRow
                key={item.code}
                item={item}
                total={total}
                open={expanded === item.code}
                onToggle={() => onExpand(expanded === item.code ? null : item.code)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FragmentRow({
  item,
  total,
  open,
  onToggle,
}: {
  item: Predio;
  total: number;
  open: boolean;
  onToggle: () => void;
}) {
  const related = movements.filter((movement) => movement.predio === item.code);
  return (
    <>
      <tr className="border-t border-slate-100 hover:bg-slate-50">
        <td className="px-2 py-2">
          <button onClick={onToggle} className="rounded p-1 hover:bg-slate-200">
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        </td>
        <td className="whitespace-nowrap px-2 py-2 font-semibold text-blue-700">{item.code}</td>
        <td className="px-2 py-2">
          <div className="font-semibold">{item.name}</div>
          <div className="text-slate-400">{item.owner}</div>
        </td>
        <td className="px-2 py-2">{item.tramo}</td>
        {[
          item.estimated,
          item.appraised,
          item.approved,
          item.paid,
          item.services,
          item.interference,
          item.approved - item.paid,
          total,
        ].map((value, index) => (
          <td
            key={index}
            className={`whitespace-nowrap px-2 py-2 text-right tabular-nums ${index === 6 && value < 0 ? "font-semibold text-red-600" : ""}`}
          >
            {money(value)}
          </td>
        ))}
        <td className="px-2 py-2">
          <StateBadge state={item.status} />
        </td>
        <td className="px-2 py-2">
          <button className="inline-flex items-center gap-1 font-semibold text-blue-600">
            Ficha <ExternalLink size={11} />
          </button>
        </td>
      </tr>
      {open && (
        <tr className="bg-slate-50">
          <td colSpan={15} className="p-3">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-3 py-2 text-[10px] font-semibold uppercase text-slate-500">
                Movimientos que conforman el costo de {item.code}
              </div>
              {related.map((movement) => (
                <div
                  key={movement.id}
                  className="grid grid-cols-[90px_1fr_130px_120px_90px] gap-3 border-b border-slate-100 px-3 py-2 last:border-0"
                >
                  <span className="font-semibold text-blue-700">{movement.id}</span>
                  <span>{movement.concept}</span>
                  <span>
                    {movement.linkType} · {movement.rule}
                  </span>
                  <span className="text-right font-semibold">{money(movement.paid)}</span>
                  <StateBadge state={movement.state} />
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function MovementTable({ rows }: { rows: Movement[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[3100px] w-full text-[10px]">
        <thead className="sticky top-0 bg-slate-50 text-left uppercase text-slate-500">
          <tr>
            {[
              "Proyecto",
              "Nombre proyecto",
              "Tramo",
              "Sector",
              "Código predio",
              "Predio",
              "Sujeto pasivo / ocupante",
              "Procedimiento",
              "Categoría",
              "Subcategoría",
              "Concepto",
              "Vinculación",
              "Contrato / OS",
              "Proveedor / beneficiario",
              "Expediente",
              "Resolución",
              "Certificación",
              "Compromiso",
              "Devengado",
              "Giro",
              "Comprobante",
              "Fuente",
              "Clasificador",
              "Año",
              "Registro",
              "Pago programado",
              "Pago efectivo",
              "Estimado",
              "Tasado",
              "Aprobado",
              "Certificado",
              "Comprometido",
              "Devengado",
              "Girado",
              "Pagado",
              "Saldo",
              "% ejecución",
              "Estado",
              "Responsable",
              "Sustento",
            ].map((head) => (
              <th key={head} className="whitespace-nowrap px-2 py-2 font-semibold">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const predio = predios.find((row) => row.code === item.predio)!;
            const cells = [
              "CUI-2459786",
              "Carretera Central – Tramo 1",
              predio.tramo,
              predio.sector,
              predio.code,
              predio.name,
              predio.owner,
              predio.procedure,
              item.category,
              item.subcategory,
              item.concept,
              item.linkType,
              item.contract,
              item.provider,
              item.file,
              item.resolution,
              item.certification,
              item.commitment,
              item.accrual,
              item.draw,
              item.receipt,
              item.funding,
              item.classifier,
              item.year,
              date(item.recordDate),
              date(item.scheduledDate),
              date(item.effectiveDate),
            ];
            const amounts = [
              item.estimated,
              item.appraised,
              item.approved,
              item.certified,
              item.committed,
              item.accrued,
              item.drawn,
              item.paid,
              item.approved - item.paid,
            ];
            return (
              <tr
                key={item.id}
                className={`border-t border-slate-100 ${!item.hasDocument ? "bg-red-50" : "hover:bg-slate-50"}`}
              >
                {cells.map((cell, index) => (
                  <td key={index} className="whitespace-nowrap px-2 py-2">
                    {cell}
                  </td>
                ))}
                {amounts.map((amount, index) => (
                  <td key={index} className="whitespace-nowrap px-2 py-2 text-right tabular-nums">
                    {money(amount)}
                  </td>
                ))}
                <td className="px-2 py-2 text-right">
                  {((item.paid / item.approved) * 100).toFixed(1)}%
                </td>
                <td className="px-2 py-2">
                  <StateBadge state={item.state} />
                </td>
                <td className="px-2 py-2">{item.responsible}</td>
                <td className="px-2 py-2">
                  {item.hasDocument ? (
                    <button className="inline-flex items-center gap-1 font-semibold text-blue-600">
                      Abrir <ExternalLink size={11} />
                    </button>
                  ) : (
                    <span className="font-semibold text-red-600">Faltante</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="p-8 text-center text-[12px] text-slate-400">
          No existen movimientos para los filtros seleccionados.
        </div>
      )}
    </div>
  );
}

function StateBadge({ state }: { state: string }) {
  const style =
    state === "Pagado" || state === "Entregado"
      ? "bg-green-50 text-green-700"
      : state === "Inscrito"
        ? "bg-purple-50 text-purple-700"
        : state === "Observado"
          ? "bg-red-50 text-red-700"
          : state === "Pendiente"
            ? "bg-amber-50 text-amber-700"
            : "bg-blue-50 text-blue-700";
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold ${style}`}
    >
      {state}
    </span>
  );
}

function ExportDialog({
  mode,
  setMode,
  onClose,
  onExport,
  count,
}: {
  mode: ExportMode;
  setMode: (mode: ExportMode) => void;
  onClose: () => void;
  onExport: () => void;
  count: number;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-[15px] font-semibold">Exportar a Excel</h3>
            <p className="text-[11px] text-slate-500">
              La exportación respetará los filtros y {count} predio(s) seleccionados.
            </p>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="space-y-2 p-5">
          {(
            [
              ["summary", "Resumen por predio", "Una fila por inmueble con montos y estados"],
              [
                "detail",
                "Detalle completo de movimientos",
                "Operaciones presupuestales, contractuales y de pago",
              ],
              ["both", "Resumen y detalle", "Libro completo con todas las hojas solicitadas"],
            ] as const
          ).map(([value, label, note]) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left ${mode === value ? "border-red-500 bg-red-50" : "border-slate-200"}`}
            >
              <span
                className={`flex size-5 items-center justify-center rounded-full border ${mode === value ? "border-red-600 bg-red-600 text-white" : "border-slate-300"}`}
              >
                {mode === value && <Check size={12} />}
              </span>
              <span>
                <span className="block text-[12px] font-semibold">{label}</span>
                <span className="text-[10px] text-slate-500">{note}</span>
              </span>
            </button>
          ))}
          <div className="rounded-lg bg-slate-50 p-3 text-[10px] leading-5 text-slate-500">
            Se incluirán las hojas <b>Distribución gastos compartidos</b> y{" "}
            <b>Parámetros de consulta</b>. Los montos conservarán formato numérico en soles y los
            códigos no perderán ceros iniciales.
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-[11px] font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-[11px] font-semibold text-white"
          >
            <FileSpreadsheet size={14} /> Generar archivo .xlsx
          </button>
        </div>
      </div>
    </div>
  );
}

function movementExportRow(item: Movement) {
  const predio = predios.find((row) => row.code === item.predio)!;
  return {
    "Código proyecto": "CUI-2459786",
    "Nombre proyecto": "Carretera Central – Tramo 1",
    Tramo: predio.tramo,
    Sector: predio.sector,
    "Código predio": predio.code,
    Predio: predio.name,
    "Sujeto pasivo / ocupante": predio.owner,
    Procedimiento: predio.procedure,
    "Categoría de gasto": item.category,
    "Subcategoría de gasto": item.subcategory,
    Concepto: item.concept,
    "Tipo de vinculación": item.linkType,
    "Contrato / OS": item.contract,
    "Proveedor / beneficiario": item.provider,
    Expediente: item.file,
    Resolución: item.resolution,
    Certificación: item.certification,
    Compromiso: item.commitment,
    Devengado: item.accrual,
    Giro: item.draw,
    "Comprobante de pago": item.receipt,
    "Fuente de financiamiento": item.funding,
    Clasificador: item.classifier,
    "Año fiscal": item.year,
    "Fecha registro": date(item.recordDate),
    "Fecha programada": date(item.scheduledDate),
    "Fecha efectiva": date(item.effectiveDate),
    "Monto estimado": item.estimated,
    "Monto tasado": item.appraised,
    "Monto aprobado": item.approved,
    "Monto certificado": item.certified,
    "Monto comprometido": item.committed,
    "Monto devengado": item.accrued,
    "Monto girado": item.drawn,
    "Monto pagado": item.paid,
    "Saldo pendiente": item.approved - item.paid,
    "% ejecución": item.paid / item.approved,
    Estado: item.state,
    Responsable: item.responsible,
    "Documento sustentatorio": item.hasDocument ? `DOC-${item.id}` : "FALTANTE",
  };
}

const alertIconColor: Record<string, string> = {
  red: "text-red-600",
  amber: "text-amber-600",
  orange: "text-orange-600",
  purple: "text-purple-600",
};

const excelAutoFilterFeature: Feature<Blob> = {
  files: {
    transform: {
      "xl/worksheets/sheet{id}.xml": {
        transform(content) {
          const range = content.match(/<dimension ref="([^"]+)"\s*\/>/)?.[1];
          if (!range || content.includes("<autoFilter")) return content;
          return content.replace("</sheetData>", `</sheetData><autoFilter ref="${range}"/>`);
        },
      },
    },
  },
};

function buildExcelSheet(name: string, rows: Record<string, string | number>[]) {
  const safeRows = rows.length
    ? rows
    : [{ Resultado: "Sin registros para los filtros seleccionados" }];
  const headers = Object.keys(safeRows[0]);
  const data: SheetData = [
    headers.map((header) => ({
      value: header,
      fontWeight: "bold",
      backgroundColor: "#991B1B",
      textColor: "#FFFFFF",
      align: "center",
      wrap: true,
      height: 28,
    })),
    ...safeRows.map((row) =>
      headers.map((header) => {
        const value = row[header] ?? "";
        if (typeof value === "number") {
          const percentage = header.includes("%") || header.toLowerCase().includes("porcentaje");
          return {
            value,
            type: Number,
            format: percentage ? "0.00%" : "S/ #,##0.00",
            align: "right" as const,
          };
        }
        return { value: String(value), type: String, align: "left" as const };
      }),
    ),
  ];
  if (safeRows.length > 1) {
    data.push(
      headers.map((header, column) => {
        const values = safeRows.map((row) => row[header]);
        if (values.every((value) => typeof value === "number")) {
          const percentage = header.includes("%") || header.toLowerCase().includes("porcentaje");
          return {
            value: values.reduce((sum, value) => sum + Number(value), 0),
            type: Number,
            format: percentage ? "0.00%" : "S/ #,##0.00",
            fontWeight: "bold",
            backgroundColor: "#F1F5F9",
          };
        }
        return {
          value: column === 0 ? "TOTAL GENERAL" : "",
          fontWeight: "bold",
          backgroundColor: "#F1F5F9",
        };
      }),
    );
  }
  return {
    data,
    sheet: name.slice(0, 31),
    stickyRowsCount: 1,
    orientation: "landscape" as const,
    showGridLines: true,
    columns: headers.map((header) => ({
      width: Math.min(
        34,
        Math.max(14, header.length + 2, ...safeRows.map((row) => String(row[header] ?? "").length)),
      ),
    })),
  };
}
