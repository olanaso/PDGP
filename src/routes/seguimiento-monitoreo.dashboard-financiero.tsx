import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  FilterX,
  Landmark,
  ReceiptText,
  Search,
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
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartExplanation } from "../components/ChartExplanation";

import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/seguimiento-monitoreo/dashboard-financiero")({
  head: () => ({ meta: [{ title: "Presupuesto y pagos prediales" }] }),
  component: DashboardFinancieroPage,
});

const COLORS = {
  red: "#dc2626",
  green: "#16a34a",
  amber: "#f59e0b",
  blue: "#2563eb",
  slate: "#64748b",
  lightBlue: "#93c5fd",
};

const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const monthlyBase = [
  { month: "Ene", programmed: 55, paid: 36, execution: 6 },
  { month: "Feb", programmed: 62, paid: 43, execution: 13 },
  { month: "Mar", programmed: 68, paid: 50, execution: 21 },
  { month: "Abr", programmed: 74, paid: 58, execution: 30 },
  { month: "May", programmed: 80, paid: 66, execution: 40 },
  { month: "Jun", programmed: 86, paid: 70, execution: 51 },
  { month: "Jul", programmed: 91, paid: 75, execution: 62 },
  { month: "Ago", programmed: 88, paid: 71, execution: 72 },
  { month: "Sep", programmed: 83, paid: 63, execution: 80 },
  { month: "Oct", programmed: 76, paid: 57, execution: 88 },
  { month: "Nov", programmed: 70, paid: 49, execution: 94 },
  { month: "Dic", programmed: 63, paid: 42, execution: 98 },
];

const categoryBase = [
  ["Terrenos", 124, 42, 18],
  ["Edificaciones", 94, 31, 15],
  ["Plantaciones", 36, 18, 12],
  ["Perjuicio económico", 58, 22, 9],
  ["Incentivos", 24, 15, 8],
  ["Compensaciones", 48, 17, 11],
  ["Mejoras", 34, 14, 9],
  ["Servicios técnicos", 28, 11, 7],
  ["Servicios legales", 21, 9, 6],
  ["Tasaciones", 18, 7, 5],
  ["Publicaciones", 6, 3, 2],
  ["Notaría", 8, 4, 2],
  ["Registro", 11, 5, 3],
  ["Gestión social", 17, 8, 4],
  ["Interferencias", 42, 21, 14],
  ["Gastos administrativos", 15, 7, 5],
] as const;

const gapRows = [
  {
    project: "Carretera Central",
    section: "Tramo I",
    budget: 186,
    estimated: 214,
    appraised: 161,
    paid: 104,
    pending: 110,
  },
  {
    project: "Evitamiento Chimbote",
    section: "Tramo II",
    budget: 142,
    estimated: 138,
    appraised: 119,
    paid: 82,
    pending: 56,
  },
  {
    project: "Puente Santa Rosa",
    section: "Acceso Norte",
    budget: 88,
    estimated: 103,
    appraised: 79,
    paid: 41,
    pending: 62,
  },
  {
    project: "Longitudinal de la Sierra",
    section: "Tramo IV",
    budget: 224,
    estimated: 207,
    appraised: 188,
    paid: 132,
    pending: 75,
  },
  {
    project: "Aeropuerto de Jauja",
    section: "Sector Oeste",
    budget: 95,
    estimated: 116,
    appraised: 87,
    paid: 48,
    pending: 68,
  },
  {
    project: "Autopista del Sol",
    section: "Tramo III",
    budget: 168,
    estimated: 174,
    appraised: 142,
    paid: 96,
    pending: 78,
  },
];

type Filters = {
  project: string;
  investmentCode: string;
  year: string;
  funding: string;
  section: string;
  sector: string;
  procedure: string;
  period: string;
};

const defaultFilters: Filters = {
  project: "TODOS",
  investmentCode: "TODOS",
  year: "2026",
  funding: "TODAS",
  section: "TODOS",
  sector: "TODOS",
  procedure: "TODOS",
  period: "Acumulado anual",
};

type DetailContext = { title: string; amount: number; subtitle?: string } | null;
type Risk = "Bajo" | "Medio" | "Alto" | "Crítico";

function money(value: number, digits = 1) {
  const sign = value < 0 ? "-" : "";
  return `${sign}S/ ${Math.abs(value).toLocaleString("es-PE", { minimumFractionDigits: digits, maximumFractionDigits: digits })} MM`;
}

function DashboardFinancieroPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailContext>(null);
  const [detailTab, setDetailTab] = useState("Predios");
  const [updatedAt, setUpdatedAt] = useState("05/08/2026 09:42");
  const [projectionHorizon, setProjectionHorizon] = useState<12 | 24>(12);

  const filterFactor = useMemo(() => {
    let factor = 1;
    if (filters.project !== "TODOS") factor *= 0.42;
    if (filters.section !== "TODOS") factor *= 0.66;
    if (filters.procedure !== "TODOS") factor *= 0.81;
    if (filters.funding !== "TODAS") factor *= 0.88;
    return factor;
  }, [filters]);

  const scopeFactor =
    filterFactor * (selectedMonth ? 0.12 + months.indexOf(selectedMonth) * 0.004 : 1);

  const monthly = useMemo(
    () =>
      monthlyBase.map((row) => ({
        ...row,
        programmed: row.programmed * filterFactor,
        paid: row.paid * filterFactor,
      })),
    [filterFactor],
  );

  const budget = 980 * scopeFactor;
  const estimated = 1052 * scopeFactor;
  const appraised = 817 * scopeFactor;
  const approved = 742 * scopeFactor;
  const certified = 684 * scopeFactor;
  const accrued = 593 * scopeFactor;
  const paid = 548 * scopeFactor;
  const available = 126 * scopeFactor;
  const gap = budget - estimated;

  const kpis = [
    {
      label: "Presupuesto multianual aprobado",
      value: 1240 * scopeFactor,
      trend: 3.8,
      status: "green",
    },
    { label: "Presupuesto vigente", value: budget, trend: 2.4, status: "green" },
    { label: "Costo estimado actualizado", value: estimated, trend: 5.9, status: "red" },
    { label: "Valor total tasado", value: appraised, trend: 4.1, status: "amber" },
    { label: "Aprobado para pagos prediales", value: approved, trend: 2.7, status: "green" },
    { label: "Monto certificado", value: certified, trend: 6.2, status: "green" },
    { label: "Monto devengado", value: accrued, trend: 7.5, status: "green" },
    { label: "Monto pagado", value: paid, trend: 8.3, status: "green" },
    { label: "Saldo disponible", value: available, trend: -4.6, status: "amber" },
    { label: "Brecha presupuestal", value: gap, trend: -12.1, status: "red" },
  ] as const;

  const categories = categoryBase.map(([name, categoryPaid, pending, free]) => ({
    name,
    paid: categoryPaid * scopeFactor,
    pending: pending * scopeFactor,
    free: free * scopeFactor,
  }));

  const waterfall = [
    { name: "PIM", base: 0, value: budget, fill: COLORS.blue },
    { name: "Certificaciones", base: budget - certified, value: certified, fill: COLORS.red },
    { name: "Compromisos", base: 218 * scopeFactor, value: 78 * scopeFactor, fill: COLORS.amber },
    { name: "Devengados", base: 156 * scopeFactor, value: 62 * scopeFactor, fill: COLORS.red },
    { name: "Pagos", base: 126 * scopeFactor, value: 30 * scopeFactor, fill: COLORS.red },
    { name: "Oblig. pendientes", base: available, value: 22 * scopeFactor, fill: COLORS.amber },
    { name: "Saldo", base: 0, value: available, fill: COLORS.green },
  ];

  const composition = [
    { name: "Pagos directos a afectados", value: 68, amount: paid * 0.68, color: COLORS.red },
    { name: "Servicios prediales", value: 15, amount: paid * 0.15, color: COLORS.blue },
    { name: "Interferencias", value: 11, amount: paid * 0.11, color: COLORS.amber },
    { name: "Gastos administrativos", value: 6, amount: paid * 0.06, color: COLORS.slate },
  ];

  const projections = Array.from({ length: projectionHorizon }, (_, index) => {
    const monthIndex = (8 + index) % 12;
    const year = 2026 + Math.floor((8 + index) / 12);
    return {
      month: `${months[monthIndex]} ${String(year).slice(2)}`,
      base: (62 + index * 3.2 + Math.sin(index) * 4) * scopeFactor,
      optimistic: (56 + index * 2.4 + Math.sin(index) * 3) * scopeFactor,
      critical: (70 + index * 4.4 + Math.cos(index) * 5) * scopeFactor,
    };
  });

  const filteredGaps = gapRows
    .filter((row) => filters.project === "TODOS" || row.project === filters.project)
    .filter((row) => filters.section === "TODOS" || row.section === filters.section)
    .map((row) => {
      const rowGap = row.budget - row.estimated;
      const coverage = (row.budget / row.estimated) * 100;
      const risk: Risk =
        rowGap < -20 ? "Crítico" : rowGap < 0 ? "Alto" : coverage < 90 ? "Medio" : "Bajo";
      return { ...row, gap: rowGap * scopeFactor, coverage, risk };
    });

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters(defaultFilters);
    setSelectedMonth(null);
  }

  function showDetail(title: string, amount: number, subtitle?: string) {
    setDetailTab("Predios");
    setDetail({ title, amount, subtitle });
  }

  function exportCsv() {
    const headers =
      "proyecto,tramo,presupuesto_vigente,costo_estimado,monto_tasado,monto_pagado,necesidad_pendiente,brecha,cobertura,riesgo\n";
    const rows = filteredGaps
      .map((row) =>
        [
          row.project,
          row.section,
          row.budget,
          row.estimated,
          row.appraised,
          row.paid,
          row.pending,
          row.gap,
          row.coverage,
          row.risk,
        ]
          .map((item) => `"${item}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff", headers, rows], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "dashboard_presupuestal_financiero.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f7] text-[#172033]">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-auto p-3 xl:p-4">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 text-[#dc2626]">
              <Landmark size={21} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[20px] font-semibold tracking-tight">
                  Presupuesto y pagos prediales
                </h1>
                {selectedMonth && (
                  <button
                    onClick={() => setSelectedMonth(null)}
                    className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700"
                  >
                    Periodo: {selectedMonth} <X size={11} />
                  </button>
                )}
              </div>
              <p className="text-[12px] text-slate-500">
                Control consolidado de recursos y necesidades para la gestión predial de
                infraestructura pública
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex h-8 items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 text-[11px] text-slate-500">
              <Clock3 size={13} /> Última actualización:{" "}
              <b className="text-slate-700">{updatedAt}</b>
            </div>
            <button
              onClick={resetFilters}
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
              <WalletCards size={15} className="text-[#dc2626]" /> Alcance presupuestal
            </div>
            <button
              onClick={() => setUpdatedAt("05/08/2026 10:05")}
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
              options={["TODOS", ...gapRows.map((row) => row.project)]}
            />
            <FilterSelect
              label="Código de inversión"
              value={filters.investmentCode}
              onChange={(v) => update("investmentCode", v)}
              options={["TODOS", "CUI 2436645", "CUI 2489012", "CUI 2514470"]}
            />
            <FilterSelect
              label="Año fiscal"
              value={filters.year}
              onChange={(v) => update("year", v)}
              options={["2026", "2025", "2024"]}
            />
            <FilterSelect
              label="Fuente de financiamiento"
              value={filters.funding}
              onChange={(v) => update("funding", v)}
              options={["TODAS", "Recursos ordinarios", "Operaciones de crédito", "RDR"]}
            />
            <FilterSelect
              label="Tramo"
              value={filters.section}
              onChange={(v) => update("section", v)}
              options={["TODOS", ...Array.from(new Set(gapRows.map((row) => row.section)))]}
            />
            <FilterSelect
              label="Sector"
              value={filters.sector}
              onChange={(v) => update("sector", v)}
              options={["TODOS", "Norte", "Centro", "Sur", "Oeste"]}
            />
            <FilterSelect
              label="Tipo de procedimiento"
              value={filters.procedure}
              onChange={(v) => update("procedure", v)}
              options={["TODOS", "Trato directo", "Expropiación", "Transferencia"]}
            />
            <FilterSelect
              label="Periodo de análisis"
              value={filters.period}
              onChange={(v) => update("period", v)}
              options={["Acumulado anual", "Mensual", "Trimestral", "Últimos 12 meses"]}
            />
          </div>
        </section>

        <section className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-10">
          {kpis.map((item) => (
            <KpiCard
              key={item.label}
              {...item}
              budget={budget}
              onClick={() =>
                showDetail(
                  item.label,
                  item.value,
                  selectedMonth ? `Periodo seleccionado: ${selectedMonth}` : "Acumulado anual 2026",
                )
              }
            />
          ))}
        </section>

        <section className="mb-3 grid gap-3 2xl:grid-cols-[1.15fr_1fr]">
          <ChartPanel
            title="Ejecución presupuestal mensual"
            subtitle="Las columnas comparan lo programado con lo pagado; la línea indica el porcentaje acumulado de ejecución. Seleccione un mes para filtrar el tablero."
            icon={<CalendarDays size={15} />}
          >
            <div className="mb-1 flex justify-end gap-3 text-[10px] text-slate-500">
              <span>Montos en millones de soles</span>
              <span>Ejecución acumulada (%)</span>
            </div>
            <ResponsiveContainer width="100%" height={390}>
              <ComposedChart
                data={monthly}
                margin={{ top: 8, right: 10, left: 0, bottom: 0 }}
                onClick={(state) => {
                  const label = state?.activeLabel;
                  if (typeof label === "string")
                    setSelectedMonth((current) => (current === label ? null : label));
                }}
              >
                <CartesianGrid stroke="#e9edf2" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  yAxisId="money"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.round(v)}`}
                />
                <YAxis
                  yAxisId="pct"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<MoneyTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  yAxisId="money"
                  dataKey="programmed"
                  name="Presupuesto programado"
                  fill="#cbd5e1"
                  radius={[3, 3, 0, 0]}
                  cursor="pointer"
                >
                  {monthly.map((row) => (
                    <Cell
                      key={row.month}
                      fill={selectedMonth === row.month ? "#94a3b8" : "#cbd5e1"}
                      opacity={selectedMonth && selectedMonth !== row.month ? 0.35 : 1}
                    />
                  ))}
                </Bar>
                <Bar
                  yAxisId="money"
                  dataKey="paid"
                  name="Monto pagado"
                  fill={COLORS.red}
                  radius={[3, 3, 0, 0]}
                  cursor="pointer"
                >
                  {monthly.map((row) => (
                    <Cell
                      key={row.month}
                      fill={COLORS.red}
                      opacity={selectedMonth && selectedMonth !== row.month ? 0.28 : 1}
                    />
                  ))}
                </Bar>
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="execution"
                  name="Ejecución acumulada"
                  stroke={COLORS.blue}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "white", strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel
            title="Ejecución por categoría de gasto"
            subtitle="Cada barra divide el presupuesto de una categoría entre monto pagado, monto pendiente y saldo aún no comprometido."
            icon={<BarChart3 size={15} />}
          >
            <ResponsiveContainer width="100%" height={410}>
              <BarChart
                data={categories}
                layout="vertical"
                margin={{ left: 16, right: 12, top: 6 }}
                onClick={(state) => {
                  if (typeof state?.activeLabel === "string") {
                    const row = categories.find((item) => item.name === state.activeLabel);
                    if (row)
                      showDetail(row.name, row.paid + row.pending + row.free, "Categoría de gasto");
                  }
                }}
              >
                <CartesianGrid stroke="#edf0f4" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={128}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<MoneyTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="paid"
                  name="Monto pagado"
                  stackId="a"
                  fill={COLORS.green}
                  cursor="pointer"
                />
                <Bar
                  dataKey="pending"
                  name="Monto pendiente"
                  stackId="a"
                  fill={COLORS.amber}
                  cursor="pointer"
                />
                <Bar
                  dataKey="free"
                  name="Saldo no comprometido"
                  stackId="a"
                  fill="#cbd5e1"
                  radius={[0, 3, 3, 0]}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </section>

        <section className="mb-3 grid gap-3 xl:grid-cols-[1.25fr_.75fr]">
          <ChartPanel
            title="Puente presupuestal: del PIM al saldo disponible"
            subtitle="Parte del presupuesto vigente y descuenta certificaciones, compromisos, devengados, pagos y obligaciones hasta llegar al saldo disponible."
            icon={<WalletCards size={15} />}
          >
            <ResponsiveContainer width="100%" height={285}>
              <BarChart
                data={waterfall}
                margin={{ left: 6, right: 10, top: 22, bottom: 8 }}
                onClick={(state) => {
                  if (typeof state?.activeLabel === "string") {
                    const row = waterfall.find((item) => item.name === state.activeLabel);
                    if (row) showDetail(row.name, row.value, "Componente del puente presupuestal");
                  }
                }}
              >
                <CartesianGrid stroke="#edf0f4" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<WaterfallTooltip />} />
                <Bar dataKey="base" stackId="waterfall" fill="transparent" />
                <Bar dataKey="value" stackId="waterfall" radius={[3, 3, 0, 0]} cursor="pointer">
                  {waterfall.map((row) => (
                    <Cell key={row.name} fill={row.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel
            title="Composición del gasto total"
            subtitle="Cada segmento muestra qué proporción del gasto pagado corresponde a afectados, servicios prediales, interferencias y administración."
            icon={<ReceiptText size={15} />}
          >
            <div className="grid items-center md:grid-cols-[.9fr_1.1fr]">
              <div className="relative">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={composition}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={94}
                      paddingAngle={2}
                      onClick={(row) =>
                        showDetail(row.name, row.amount, `${row.value}% del gasto total`)
                      }
                      cursor="pointer"
                    >
                      {composition.map((row) => (
                        <Cell key={row.name} fill={row.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase text-slate-400">Total pagado</span>
                  <b className="text-[16px]">{money(paid)}</b>
                </div>
              </div>
              <div className="space-y-2 pr-3">
                {composition.map((row) => (
                  <button
                    key={row.name}
                    onClick={() =>
                      showDetail(row.name, row.amount, `${row.value}% del gasto total`)
                    }
                    className="flex w-full items-center justify-between gap-2 rounded p-1 text-left text-[11px] hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <i className="size-2.5 rounded-full" style={{ background: row.color }} />
                      {row.name}
                    </span>
                    <b>{row.value}%</b>
                  </button>
                ))}
              </div>
            </div>
          </ChartPanel>
        </section>

        <section className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2.5">
            <div>
              <h2 className="text-[13px] font-semibold text-slate-800">
                Brechas presupuestales por proyecto y tramo
              </h2>
              <p className="text-[10px] text-slate-500">
                Umbral de cobertura esperado: 90% · Haga clic en cualquier monto para revisar su
                sustento
              </p>
            </div>
            <div className="flex gap-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <i className="size-2 rounded-full bg-red-500" /> Brecha negativa
              </span>
              <span className="flex items-center gap-1">
                <i className="size-2 rounded-full bg-amber-400" /> Cobertura &lt; 90%
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1160px] text-[11px]">
              <thead className="bg-slate-50 text-left text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  {[
                    "Proyecto",
                    "Tramo",
                    "Presupuesto vigente",
                    "Costo estimado actualizado",
                    "Monto tasado",
                    "Monto pagado",
                    "Necesidad pendiente",
                    "Brecha",
                    "% cobertura",
                    "Nivel de riesgo",
                    "",
                  ].map((head) => (
                    <th key={head} className="whitespace-nowrap px-3 py-2 font-semibold">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredGaps.map((row) => (
                  <tr
                    key={`${row.project}-${row.section}`}
                    className="border-t border-slate-100 hover:bg-slate-50/70"
                  >
                    <td className="px-3 py-2.5 font-semibold text-slate-800">{row.project}</td>
                    <td className="px-3 py-2.5">{row.section}</td>
                    <AmountCell
                      value={row.budget * scopeFactor}
                      onClick={() =>
                        showDetail("Presupuesto vigente", row.budget * scopeFactor, row.project)
                      }
                    />
                    <AmountCell
                      value={row.estimated * scopeFactor}
                      onClick={() =>
                        showDetail(
                          "Costo estimado actualizado",
                          row.estimated * scopeFactor,
                          row.project,
                        )
                      }
                    />
                    <AmountCell
                      value={row.appraised * scopeFactor}
                      onClick={() =>
                        showDetail("Monto tasado", row.appraised * scopeFactor, row.project)
                      }
                    />
                    <AmountCell
                      value={row.paid * scopeFactor}
                      onClick={() =>
                        showDetail("Monto pagado", row.paid * scopeFactor, row.project)
                      }
                    />
                    <AmountCell
                      value={row.pending * scopeFactor}
                      onClick={() =>
                        showDetail("Necesidad pendiente", row.pending * scopeFactor, row.project)
                      }
                    />
                    <td
                      className={`px-3 py-2.5 font-bold ${row.gap < 0 ? "bg-red-50 text-red-700" : "text-green-700"}`}
                    >
                      <button
                        onClick={() => showDetail("Brecha presupuestal", row.gap, row.project)}
                        className="hover:underline"
                      >
                        {money(row.gap)}
                      </button>
                    </td>
                    <td
                      className={`px-3 py-2.5 font-bold ${row.coverage < 90 ? "bg-amber-50 text-amber-700" : "text-green-700"}`}
                    >
                      {row.coverage.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2.5">
                      <RiskBadge risk={row.risk} />
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() =>
                          showDetail(
                            "Detalle presupuestal",
                            row.estimated * scopeFactor,
                            `${row.project} · ${row.section}`,
                          )
                        }
                        className="rounded border border-slate-200 p-1 text-slate-500 hover:border-red-200 hover:text-red-600"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filteredGaps.length && (
            <div className="p-8 text-center text-[12px] text-slate-500">
              No existen registros para la combinación de filtros seleccionada.
            </div>
          )}
        </section>

        <section className="mb-3">
          <ChartPanel
            title={`Proyección de necesidades financieras · próximos ${projectionHorizon} meses`}
            subtitle="Las tres líneas proyectan la necesidad mensual; si una línea supera el presupuesto disponible, se anticipa una brecha de financiamiento."
            icon={<ArrowUpRight size={15} />}
            action={
              <button
                onClick={() => setProjectionHorizon((current) => (current === 12 ? 24 : 12))}
                className="rounded border border-slate-200 px-2 py-1 text-[10px] text-slate-600 hover:border-red-200 hover:text-red-600"
              >
                Ver {projectionHorizon === 12 ? 24 : 12} meses
              </button>
            }
          >
            <ResponsiveContainer width="100%" height={310}>
              <LineChart
                data={projections}
                margin={{ left: 10, right: 20, top: 12, bottom: 2 }}
                onClick={(state) => {
                  if (typeof state?.activeLabel === "string") {
                    const row = projections.find((item) => item.month === state.activeLabel);
                    if (row)
                      showDetail(
                        `Necesidad financiera · ${row.month}`,
                        row.base,
                        "Escenario base proyectado",
                      );
                  }
                }}
              >
                <CartesianGrid stroke="#e9edf2" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip content={<MoneyTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine
                  y={available}
                  stroke="#111827"
                  strokeDasharray="6 4"
                  label={{
                    value: `Presupuesto disponible: ${money(available)}`,
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "#111827",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="base"
                  name="Escenario base"
                  stroke={COLORS.blue}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  cursor="pointer"
                />
                <Line
                  type="monotone"
                  dataKey="optimistic"
                  name="Escenario optimista"
                  stroke={COLORS.green}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  cursor="pointer"
                />
                <Line
                  type="monotone"
                  dataKey="critical"
                  name="Escenario crítico"
                  stroke={COLORS.red}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  cursor="pointer"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>
        </section>
      </main>

      {detail && (
        <DetailDrawer
          detail={detail}
          activeTab={detailTab}
          onTab={setDetailTab}
          onClose={() => setDetail(null)}
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
        className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-[11px] text-slate-700 outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-red-100"
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
  trend,
  status,
  budget,
  onClick,
}: {
  label: string;
  value: number;
  trend: number;
  status: "green" | "amber" | "red";
  budget: number;
  onClick: () => void;
}) {
  const styles = {
    green: "border-t-green-500 bg-green-50/30",
    amber: "border-t-amber-400 bg-amber-50/30",
    red: "border-t-red-500 bg-red-50/30",
  };
  const dot = { green: "bg-green-500", amber: "bg-amber-400", red: "bg-red-500" };
  const percentage = budget ? (value / budget) * 100 : 0;
  return (
    <button
      onClick={onClick}
      className={`group min-h-[126px] rounded-lg border border-slate-200 border-t-[3px] p-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${styles[status]}`}
    >
      <div className="flex min-h-8 items-start justify-between gap-1">
        <span className="text-[10px] font-semibold leading-4 text-slate-600">{label}</span>
        <i className={`mt-1 size-2 shrink-0 rounded-full ${dot[status]}`} />
      </div>
      <div
        className={`mt-1 whitespace-nowrap text-[16px] font-bold tracking-tight ${value < 0 ? "text-red-700" : "text-slate-900"}`}
      >
        {money(value)}
      </div>
      <div className="mt-1 flex items-center justify-between gap-1 text-[9px] text-slate-500">
        <span>{percentage.toFixed(1)}% del PIM</span>
        <span
          className={`flex items-center font-semibold ${trend >= 0 ? "text-green-700" : "text-red-700"}`}
        >
          {trend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {Math.abs(trend)}%
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full ${dot[status]}`}
          style={{ width: `${Math.min(100, Math.abs(percentage))}%` }}
        />
      </div>
      <div className="mt-1 text-[9px] text-slate-400 group-hover:text-red-600">
        Ver sustento y trazabilidad →
      </div>
    </button>
  );
}

function ChartPanel({
  title,
  subtitle,
  icon,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex gap-2">
          <span className="mt-0.5 text-[#dc2626]">{icon}</span>
          <div>
            <h2 className="text-[13px] font-semibold text-slate-800">{title}</h2>
            <ChartExplanation>{subtitle}</ChartExplanation>
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function MoneyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-slate-200 bg-white p-2 text-[10px] shadow-lg">
      <div className="mb-1 font-semibold text-slate-800">{label}</div>
      {payload.map((item) => (
        <div key={item.name} className="flex justify-between gap-4" style={{ color: item.color }}>
          <span>{item.name}</span>
          <b>{item.name.includes("Ejecución") ? `${item.value}%` : money(item.value)}</b>
        </div>
      ))}
    </div>
  );
}

function WaterfallTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const value = payload.find((item) => item.dataKey === "value")?.value ?? 0;
  return (
    <div className="rounded border border-slate-200 bg-white p-2 text-[10px] shadow-lg">
      <b>{label}</b>
      <div className="mt-1 text-slate-600">{money(value)}</div>
    </div>
  );
}

function AmountCell({ value, onClick }: { value: number; onClick: () => void }) {
  return (
    <td className="whitespace-nowrap px-3 py-2.5 font-medium">
      <button onClick={onClick} className="text-slate-700 hover:text-[#dc2626] hover:underline">
        {money(value)}
      </button>
    </td>
  );
}

function RiskBadge({ risk }: { risk: Risk }) {
  const style =
    risk === "Crítico"
      ? "bg-red-100 text-red-700"
      : risk === "Alto"
        ? "bg-orange-100 text-orange-700"
        : risk === "Medio"
          ? "bg-amber-100 text-amber-700"
          : "bg-green-100 text-green-700";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${style}`}>
      {risk}
    </span>
  );
}

function DetailDrawer({
  detail,
  activeTab,
  onTab,
  onClose,
}: {
  detail: NonNullable<DetailContext>;
  activeTab: string;
  onTab: (tab: string) => void;
  onClose: () => void;
}) {
  const tabs = [
    { name: "Predios", icon: Landmark, count: 38 },
    { name: "Contratos", icon: FileCheck2, count: 12 },
    { name: "Pagos", icon: ReceiptText, count: 26 },
    { name: "Documentos", icon: FileText, count: 74 },
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/30"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className="flex h-full w-full max-w-[520px] flex-col bg-white shadow-2xl">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#dc2626]">
                Trazabilidad financiera
              </div>
              <h2 className="mt-1 text-[17px] font-semibold text-slate-900">{detail.title}</h2>
              {detail.subtitle && (
                <p className="mt-0.5 text-[11px] text-slate-500">{detail.subtitle}</p>
              )}
              <div
                className={`mt-2 text-[24px] font-bold ${detail.amount < 0 ? "text-red-700" : "text-slate-900"}`}
              >
                {money(detail.amount)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50">
          {tabs.map(({ name, icon: Icon, count }) => (
            <button
              key={name}
              onClick={() => onTab(name)}
              className={`flex flex-col items-center gap-1 border-b-2 px-2 py-3 text-[10px] ${activeTab === name ? "border-[#dc2626] bg-white font-semibold text-[#dc2626]" : "border-transparent text-slate-500"}`}
            >
              <Icon size={15} />
              <span>{name}</span>
              <b className="rounded-full bg-slate-100 px-1.5 text-[9px] text-slate-600">{count}</b>
            </button>
          ))}
        </div>
        <div className="border-b border-slate-100 p-3">
          <div className="flex h-8 items-center gap-2 rounded border border-slate-200 px-2 text-slate-400">
            <Search size={14} />
            <input
              className="min-w-0 flex-1 bg-transparent text-[11px] text-slate-700 outline-none"
              placeholder={`Buscar en ${activeTab.toLowerCase()}...`}
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto p-3">
          <div className="mb-2 flex items-center justify-between text-[10px] text-slate-500">
            <span>Registros que sustentan el monto seleccionado</span>
            <b>
              {activeTab === "Predios"
                ? 38
                : activeTab === "Contratos"
                  ? 12
                  : activeTab === "Pagos"
                    ? 26
                    : 74}{" "}
              resultados
            </b>
          </div>
          {Array.from({ length: 7 }, (_, index) => (
            <button
              key={index}
              className="mb-2 flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-left hover:border-red-200 hover:bg-red-50/30"
            >
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-slate-800">
                  {activeTab === "Predios"
                    ? `PR-${String(1842 + index).padStart(5, "0")} · Unidad predial ${index + 1}`
                    : activeTab === "Contratos"
                      ? `Contrato N.° 0${index + 1}-2026-MTC`
                      : activeTab === "Pagos"
                        ? `Comprobante de pago CP-${5260 + index}`
                        : `Expediente técnico-legal ${String(index + 1).padStart(3, "0")}`}
                </div>
                <div className="mt-1 truncate text-[10px] text-slate-500">
                  Carretera Central · Tramo I · Estado verificado
                </div>
              </div>
              <div className="shrink-0 text-right">
                <b className="block text-[11px] text-slate-800">
                  {money(detail.amount / (18 + index), 2)}
                </b>
                <span className="text-[9px] text-green-700">Conciliado</span>
              </div>
              <ChevronRight size={14} className="shrink-0 text-slate-400" />
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 p-3">
          <span className="text-[10px] text-slate-500">
            Fuente: SIAF · SIGA · Expediente predial digital
          </span>
          <button className="rounded bg-[#dc2626] px-3 py-2 text-[11px] font-semibold text-white">
            Abrir relación completa
          </button>
        </div>
      </aside>
    </div>
  );
}
