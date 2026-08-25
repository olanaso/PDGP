import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  FileSearch,
  FilterX,
  MinusCircle,
  Ruler,
  Search,
  X,
  XCircle,
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
import { FullPrediosTable } from "../components/FullPrediosTable";
import {
  FULL_PREDIO_TRACKING_STAGES,
  formatFullPredioTrackingDate,
  fullPredioTrackingProcessDays,
  fullPredioTrackingStageIndex,
  fullPredioTrackingStageTiming,
  fullPredioTrackingStart,
} from "../lib/fullPredioTracking";
import { predioRows, type PredioRow } from "../lib/prediosData";

import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/seguimiento-monitoreo/tecnico-tasaciones")({
  head: () => ({ meta: [{ title: "Expedientes, tasaciones y costos" }] }),
  component: TecnicoTasacionesPage,
});

const COLORS = {
  red: "#dc2626",
  green: "#16a34a",
  blue: "#2563eb",
  amber: "#f59e0b",
  purple: "#7c3aed",
  cyan: "#0891b2",
  slate: "#64748b",
};

const states = [
  "Pendiente",
  "Elaboración",
  "Revisión",
  "Observado",
  "Subsanado",
  "Conforme",
  "Enviado a tasación",
  "En tasación",
  "Recibido",
  "Aprobado",
  "Vencido",
];

const stateData = states.map((name, index) => ({
  name,
  value: [74, 96, 82, 61, 48, 116, 91, 68, 53, 142, 27][index],
  color: [
    "#94a3b8",
    "#60a5fa",
    "#3b82f6",
    "#f97316",
    "#f59e0b",
    "#22c55e",
    "#14b8a6",
    "#06b6d4",
    "#8b5cf6",
    "#16a34a",
    "#dc2626",
  ][index],
}));

const names = [
  "María Elena Rojas",
  "Comunidad San Jerónimo",
  "Inversiones del Centro SAC",
  "Sucesión Flores Huamán",
  "Municipalidad Distrital Norte",
  "José Antonio Medina",
  "Agrícola Santa Ana SRL",
  "Rosa Milagros Chávez",
  "Consorcio Vial Andino",
  "Comunidad Campesina Central",
  "Transportes del Valle SAC",
  "Familia Gutiérrez Soto",
  "Agroindustrias del Sur",
  "Constructora Los Andes",
  "Asociación Valle Verde",
];

const types = ["Rural", "Urbano", "Industrial", "Comercial"];
const typeColors: Record<string, string> = {
  Rural: COLORS.green,
  Urbano: COLORS.blue,
  Industrial: COLORS.red,
  Comercial: COLORS.purple,
};
const experts = ["Ing. J. Torres", "Arq. P. Medina", "Ing. R. Castro", "Arq. S. León"];
const technicians = ["M. Salazar", "C. Romero", "L. Quispe", "A. Paredes"];

type Predio = {
  code: string;
  owner: string;
  sector: string;
  type: string;
  status: string;
  appraisalStatus: string;
  expert: string;
  technician: string;
  matrixArea: number;
  affectedArea: number;
  remainingArea: number;
  land: number;
  buildings: number;
  plantations: number;
  economicLoss: number;
  incentive: number;
  compensation: number;
  directServices: number;
  sharedExpenses: number;
  appraised: number;
  approved: number;
  paid: number;
  estimated: number;
  variation: number;
  servicesPct: number;
  entryDate: string;
};

type TrackingStage = {
  label: string;
  targetDays: number;
  evidence: string;
};

type SelectedTrackingStage = {
  row: Predio;
  stageIndex: number;
};

type SelectedFullTrackingStage = {
  row: PredioRow;
  stageIndex: number;
};

const trackingStages: TrackingStage[] = [
  { label: "Ingreso del expediente", targetDays: 5, evidence: "Cargo de ingreso y asignación" },
  {
    label: "Elaboración técnico-legal",
    targetDays: 15,
    evidence: "Planos, memoria e informes técnico-legales",
  },
  { label: "Revisión técnica", targetDays: 10, evidence: "Lista de control de revisión" },
  { label: "Subsanación", targetDays: 10, evidence: "Observaciones levantadas" },
  { label: "Conforme", targetDays: 5, evidence: "Conformidad del expediente" },
  { label: "Enviado a tasación", targetDays: 5, evidence: "Cargo de remisión" },
  { label: "En tasación", targetDays: 25, evidence: "Expediente admitido por el perito" },
  { label: "Informe recibido", targetDays: 5, evidence: "Informe técnico de tasación" },
  { label: "Aprobado", targetDays: 5, evidence: "Tasación aprobada" },
];

const trackingTargetDays = trackingStages.reduce((total, stage) => total + stage.targetDays, 0);
const TRACKING_DAY_MS = 86_400_000;

const predios: Predio[] = names.map((owner, index) => {
  const affectedArea = 360 + ((index * 617) % 6800);
  const matrixArea = affectedArea * (1.55 + (index % 4) * 0.3);
  const land = (affectedArea * (620 + (index % 5) * 185)) / 1_000_000;
  const buildings = index % 3 === 0 ? land * 0.52 : land * (0.14 + (index % 4) * 0.07);
  const plantations = index % 2 === 0 ? land * 0.11 : land * 0.025;
  const economicLoss = land * (0.05 + (index % 3) * 0.02);
  const incentive = land * 0.06;
  const compensation = land * (0.04 + (index % 2) * 0.03);
  const directServices = 0.08 + (index % 5) * 0.035;
  const sharedExpenses = 0.04 + (index % 4) * 0.02;
  const appraised = land + buildings + plantations + economicLoss;
  const approved = appraised * (0.96 + (index % 4) * 0.025);
  const paid = approved * (0.72 + (index % 5) * 0.055);
  const estimated = appraised * (0.84 + (index % 6) * 0.055);
  return {
    code: `PR-${String(1842 + index * 23).padStart(6, "0")}`,
    owner,
    sector: `Sector ${String.fromCharCode(65 + (index % 7))}`,
    type: types[index % types.length],
    status: states[(index * 3) % states.length],
    appraisalStatus: ["Pendiente", "En proceso", "Aprobada", "Observada", "Vencida"][index % 5],
    expert: experts[index % experts.length],
    technician: technicians[(index * 3) % technicians.length],
    matrixArea,
    affectedArea,
    remainingArea: matrixArea - affectedArea,
    land,
    buildings,
    plantations,
    economicLoss,
    incentive,
    compensation,
    directServices,
    sharedExpenses,
    appraised,
    approved,
    paid,
    estimated,
    variation: ((appraised - estimated) / estimated) * 100,
    servicesPct:
      ((directServices + sharedExpenses) / (appraised + directServices + sharedExpenses)) * 100,
    entryDate: new Date(Date.UTC(2026, 0, 5 + index * 4)).toLocaleDateString("es-PE", {
      timeZone: "UTC",
    }),
  };
});

function parseTrackingDate(value: string) {
  const [day, month, year] = value.split("/").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatTrackingDate(value: Date) {
  return value.toLocaleDateString("es-PE", { timeZone: "UTC" });
}

function trackingStageIndex(row: Predio) {
  const byStatus: Record<string, number> = {
    Pendiente: 0,
    Elaboración: 1,
    Revisión: 2,
    Observado: 3,
    Subsanado: 3,
    Conforme: 4,
    "Enviado a tasación": 5,
    "En tasación": 6,
    Recibido: 7,
    Aprobado: 8,
    Vencido: 6,
  };
  return byStatus[row.status] ?? 0;
}

function trackingStageStart(row: Predio, stageIndex: number) {
  const currentStage = trackingStageIndex(row);
  if (stageIndex > currentStage) return null;
  const rowSeed = Number(row.code.split("-").at(-1)) || 1;
  const elapsedDays = trackingStages
    .slice(0, stageIndex)
    .reduce(
      (total, stage, index) => total + Math.max(2, stage.targetDays - 3 + ((rowSeed + index) % 5)),
      0,
    );
  return new Date(parseTrackingDate(row.entryDate).getTime() + elapsedDays * TRACKING_DAY_MS);
}

function trackingStageTiming(row: Predio, stageIndex: number) {
  const currentStage = trackingStageIndex(row);
  const start = trackingStageStart(row, stageIndex);
  if (!start) return { start: null, end: null, days: null, condition: "Pendiente" as const };
  if (stageIndex < currentStage) {
    const nextStart = trackingStageStart(row, stageIndex + 1)!;
    const end = new Date(nextStart.getTime() - TRACKING_DAY_MS);
    return {
      start,
      end,
      days: Math.max(1, Math.round((end.getTime() - start.getTime()) / TRACKING_DAY_MS) + 1),
      condition: "Completada" as const,
    };
  }
  const cutOff = new Date(Date.UTC(2026, 7, 5));
  return {
    start,
    end: cutOff,
    days: Math.max(1, Math.round((cutOff.getTime() - start.getTime()) / TRACKING_DAY_MS) + 1),
    condition: "Etapa actual" as const,
  };
}

function trackingProcessDays(row: Predio) {
  return Math.max(
    1,
    Math.round(
      (new Date(Date.UTC(2026, 7, 5)).getTime() - parseTrackingDate(row.entryDate).getTime()) /
        TRACKING_DAY_MS,
    ) + 1,
  );
}

const sectorCosts = Array.from({ length: 7 }, (_, index) => {
  const rows = predios.filter((row) => row.sector === `Sector ${String.fromCharCode(65 + index)}`);
  return {
    name: `Sector ${String.fromCharCode(65 + index)}`,
    estimated: rows.reduce((sum, row) => sum + row.estimated, 0),
    appraised: rows.reduce((sum, row) => sum + row.appraised, 0),
    approved: rows.reduce((sum, row) => sum + row.approved, 0),
    paid: rows.reduce((sum, row) => sum + row.paid, 0),
  };
});

const compositionBase = [
  { name: "Terreno", value: 58, color: COLORS.red },
  { name: "Edificaciones", value: 18, color: COLORS.blue },
  { name: "Obras complementarias", value: 7, color: COLORS.purple },
  { name: "Instalaciones fijas", value: 5, color: COLORS.cyan },
  { name: "Plantaciones", value: 4, color: COLORS.green },
  { name: "Daño emergente", value: 5, color: COLORS.amber },
  { name: "Lucro cesante", value: 3, color: COLORS.slate },
];

const documentColumns = [
  "Plano",
  "Memoria descriptiva",
  "Coordenadas",
  "Partida registral",
  "Estudio de títulos",
  "Sujeto pasivo",
  "Edificaciones",
  "Plantaciones",
  "Perjuicio económico",
  "Fotografías",
  "Inspección ocular",
];

type Filters = {
  project: string;
  sector: string;
  property: string;
  type: string;
  fileStatus: string;
  appraisalStatus: string;
  expert: string;
  technician: string;
  start: string;
  end: string;
};

const defaultFilters: Filters = {
  project: "TODOS",
  sector: "TODOS",
  property: "TODOS",
  type: "TODOS",
  fileStatus: "TODOS",
  appraisalStatus: "TODOS",
  expert: "TODOS",
  technician: "TODOS",
  start: "2026-01-01",
  end: "2026-12-31",
};

function money(value: number, digits = 2) {
  return `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: digits, maximumFractionDigits: digits })} MM`;
}

function number(value: number, digits = 1) {
  return value.toLocaleString("es-PE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function TecnicoTasacionesPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [search, setSearch] = useState("");
  const [selectedComposition, setSelectedComposition] = useState<string | null>(null);
  const [selectedPredio, setSelectedPredio] = useState<Predio | null>(null);
  const [selectedTracking, setSelectedTracking] = useState<SelectedTrackingStage | null>(null);
  const [selectedFullTracking, setSelectedFullTracking] =
    useState<SelectedFullTrackingStage | null>(null);
  const [updatedAt, setUpdatedAt] = useState("05/08/2026 10:48");

  const filtered = useMemo(
    () =>
      predios.filter((row) => {
        if (filters.sector !== "TODOS" && row.sector !== filters.sector) return false;
        if (filters.property !== "TODOS" && row.code !== filters.property) return false;
        if (filters.type !== "TODOS" && row.type !== filters.type) return false;
        if (filters.fileStatus !== "TODOS" && row.status !== filters.fileStatus) return false;
        if (filters.appraisalStatus !== "TODOS" && row.appraisalStatus !== filters.appraisalStatus)
          return false;
        if (filters.expert !== "TODOS" && row.expert !== filters.expert) return false;
        if (filters.technician !== "TODOS" && row.technician !== filters.technician) return false;
        const query = search.trim().toLowerCase();
        return !query || `${row.code} ${row.owner}`.toLowerCase().includes(query);
      }),
    [filters, search],
  );

  const scale =
    Math.max(0.08, filtered.length / predios.length) * (filters.project === "TODOS" ? 1 : 0.74);
  const totalAppraised = predios.reduce((sum, row) => sum + row.appraised, 0) * scale;
  const cards = [
    {
      label: "Expedientes pendientes",
      value: Math.round(74 * scale).toString(),
      note: "8.2% de expedientes",
      trend: -4.2,
      color: "amber",
    },
    {
      label: "Expedientes en elaboración",
      value: Math.round(96 * scale).toString(),
      note: "10.6% de expedientes",
      trend: 6.4,
      color: "blue",
    },
    {
      label: "Expedientes observados",
      value: Math.round(61 * scale).toString(),
      note: "6.7% requieren subsanación",
      trend: -8.1,
      color: "red",
    },
    {
      label: "Expedientes conformes",
      value: Math.round(116 * scale).toString(),
      note: "12.8% de expedientes",
      trend: 9.7,
      color: "green",
    },
    {
      label: "Tasaciones en proceso",
      value: Math.round(68 * scale).toString(),
      note: "7.5% de expedientes",
      trend: 5.3,
      color: "blue",
    },
    {
      label: "Tasaciones aprobadas",
      value: Math.round(142 * scale).toString(),
      note: "15.6% de expedientes",
      trend: 11.8,
      color: "green",
    },
    {
      label: "Tasaciones vencidas",
      value: Math.max(1, Math.round(27 * scale)).toString(),
      note: "Superaron vigencia",
      trend: -3.6,
      color: "red",
    },
    {
      label: "Valor total tasado",
      value: money(totalAppraised, 1),
      note: "Acumulado de la cartera",
      trend: 7.9,
      color: "green",
    },
    {
      label: "Desviación estimación / tasación",
      value: "+8.6%",
      note: "Tolerancia definida: ±10%",
      trend: 1.2,
      color: "amber",
    },
  ] as const;

  const ranking = [...predios]
    .sort(
      (a, b) =>
        b.appraised +
        b.directServices +
        b.sharedExpenses -
        (a.appraised + a.directServices + a.sharedExpenses),
    )
    .map((row, index) => {
      const total = row.appraised + row.directServices + row.sharedExpenses;
      const perSquareMeter = (total * 1_000_000) / row.affectedArea;
      return {
        ...row,
        total,
        perSquareMeter,
        above: index < 4,
        label: `${money(total, 1)} · S/ ${number(perSquareMeter, 0)}/m² · Serv. ${row.servicesPct.toFixed(1)}%`,
      };
    });

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function reset() {
    setFilters(defaultFilters);
    setSearch("");
    setSelectedComposition(null);
  }

  function exportCsv() {
    const header =
      "codigo,area_matriz,area_afectada,area_remanente,terreno,edificaciones,plantaciones,perjuicio_economico,incentivo,compensacion,servicios_directos,gastos_compartidos,valor_tasado,monto_aprobado,monto_pagado,variacion\n";
    const rows = filtered
      .map((row) =>
        [
          row.code,
          row.matrixArea,
          row.affectedArea,
          row.remainingArea,
          row.land,
          row.buildings,
          row.plantations,
          row.economicLoss,
          row.incentive,
          row.compensation,
          row.directServices,
          row.sharedExpenses,
          row.appraised,
          row.approved,
          row.paid,
          row.variation,
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
    link.download = "dashboard_tecnico_tasaciones.csv";
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
              <Calculator size={21} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[20px] font-semibold tracking-tight">
                  Expedientes, tasaciones y costos
                </h1>
                {filters.fileStatus !== "TODOS" && (
                  <button
                    onClick={() => update("fileStatus", "TODOS")}
                    className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700"
                  >
                    Estado: {filters.fileStatus} <X size={11} />
                  </button>
                )}
              </div>
              <p className="text-[12px] text-slate-500">
                Control de expedientes, valorizaciones, desviaciones de costo y cumplimiento
                documental
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
              onClick={exportCsv}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-3 text-[12px] font-semibold text-white"
            >
              <Download size={14} /> Exportar
            </button>
          </div>
        </header>

        <section className="mb-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-700">
              <FileSearch size={15} className="text-[#dc2626]" /> Alcance técnico y valuatorio
            </div>
            <button
              onClick={() => setUpdatedAt("05/08/2026 11:06")}
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
              label="Sector"
              value={filters.sector}
              onChange={(v) => update("sector", v)}
              options={["TODOS", ...sectorCosts.map((row) => row.name)]}
            />
            <FilterSelect
              label="Predio"
              value={filters.property}
              onChange={(v) => update("property", v)}
              options={["TODOS", ...predios.map((row) => row.code)]}
            />
            <FilterSelect
              label="Tipo de inmueble"
              value={filters.type}
              onChange={(v) => update("type", v)}
              options={["TODOS", ...types]}
            />
            <FilterSelect
              label="Estado del expediente"
              value={filters.fileStatus}
              onChange={(v) => update("fileStatus", v)}
              options={["TODOS", ...states]}
            />
            <FilterSelect
              label="Estado de tasación"
              value={filters.appraisalStatus}
              onChange={(v) => update("appraisalStatus", v)}
              options={["TODOS", "Pendiente", "En proceso", "Aprobada", "Observada", "Vencida"]}
            />
            <FilterSelect
              label="Perito"
              value={filters.expert}
              onChange={(v) => update("expert", v)}
              options={["TODOS", ...experts]}
            />
            <FilterSelect
              label="Responsable técnico"
              value={filters.technician}
              onChange={(v) => update("technician", v)}
              options={["TODOS", ...technicians]}
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

        <section className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-3 py-2.5">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck2 size={15} className="text-red-600" />
                <h2 className="text-[13px] font-semibold text-slate-800">
                  Matriz extensa con seguimiento técnico y tasaciones
                </h2>
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                Conserva todas las columnas de la Matriz extensa y añade fechas, etapas, tiempos y
                desviaciones para los {predioRows.length} predios.
              </p>
            </div>
            <span className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-800">
              Fuente completa: predioRows · {predioRows.length} registros
            </span>
          </div>
          <div className="flex h-[720px] min-h-0 flex-col">
            <FullPrediosTable
              rows={predioRows}
              tracking
              onSelectTrackingStage={(row, stageIndex) =>
                setSelectedFullTracking({ row, stageIndex })
              }
            />
          </div>
        </section>

        <section className="mb-3 grid gap-3 2xl:grid-cols-2">
          <Panel
            title="Expedientes por estado"
            subtitle="Compara la cantidad de expedientes en cada estado del proceso técnico; seleccione una barra para ver solo esos predios."
            icon={<FileCheck2 size={15} />}
          >
            <ResponsiveContainer width="100%" height={365}>
              <BarChart
                data={stateData.map((row) => ({
                  ...row,
                  value: Math.max(1, Math.round(row.value * scale)),
                }))}
                margin={{ left: 4, right: 10, top: 12, bottom: 45 }}
                onClick={(state) => {
                  if (typeof state?.activeLabel === "string")
                    update(
                      "fileStatus",
                      filters.fileStatus === state.activeLabel ? "TODOS" : state.activeLabel,
                    );
                }}
              >
                <CartesianGrid stroke="#e9edf2" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" name="Expedientes" radius={[4, 4, 0, 0]} cursor="pointer">
                  <LabelList
                    dataKey="value"
                    position="top"
                    style={{ fontSize: 9, fill: "#475569" }}
                  />
                  {stateData.map((row) => (
                    <Cell
                      key={row.name}
                      fill={row.color}
                      opacity={
                        filters.fileStatus !== "TODOS" && filters.fileStatus !== row.name ? 0.25 : 1
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
          <Panel
            title="Comparativo de costos por sector"
            subtitle="Compara costo estimado, valor tasado, monto aprobado y pago final; la línea de referencia marca la tolerancia presupuestal."
            icon={<CircleDollarSign size={15} />}
          >
            <ResponsiveContainer width="100%" height={365}>
              <BarChart data={sectorCosts} margin={{ left: 4, right: 10, top: 16 }}>
                <CartesianGrid stroke="#e9edf2" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => money(Number(value))} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine
                  y={22}
                  stroke={COLORS.red}
                  strokeDasharray="5 4"
                  label={{
                    value: "Límite de tolerancia",
                    position: "insideTopRight",
                    fill: COLORS.red,
                    fontSize: 9,
                  }}
                />
                <Bar
                  dataKey="estimated"
                  name="Costo estimado"
                  fill="#94a3b8"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="appraised"
                  name="Valor tasado"
                  fill={COLORS.blue}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="approved"
                  name="Monto aprobado"
                  fill={COLORS.amber}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="paid"
                  name="Costo final pagado"
                  fill={COLORS.green}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </section>

        <section className="mb-3 grid gap-3 xl:grid-cols-[.8fr_1.2fr]">
          <Panel
            title="Composición del valor tasado"
            subtitle="Cada segmento muestra cuánto aporta terreno, edificaciones, instalaciones, plantaciones o perjuicios al valor tasado total."
            icon={<Calculator size={15} />}
          >
            <div className="grid items-center md:grid-cols-[1fr_.9fr]">
              <div className="relative">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={compositionBase}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={67}
                      outerRadius={104}
                      paddingAngle={2}
                      cursor="pointer"
                      onClick={(row) => setSelectedComposition(row.name)}
                    >
                      {compositionBase.map((row) => (
                        <Cell key={row.name} fill={row.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[9px] uppercase text-slate-400">Valor tasado</span>
                  <b className="text-[16px]">{money(totalAppraised, 1)}</b>
                </div>
              </div>
              <div className="space-y-2">
                {compositionBase.map((row) => (
                  <button
                    key={row.name}
                    onClick={() => setSelectedComposition(row.name)}
                    className="flex w-full items-center justify-between rounded p-1 text-left text-[10px] hover:bg-slate-50"
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
          </Panel>
          <Panel
            title="Área afectada vs. valor tasado"
            subtitle="Los puntos alejados del grupo revelan posibles valores atípicos: eje horizontal es área, eje vertical valor tasado y tamaño es costo total."
            icon={<Ruler size={15} />}
          >
            <ResponsiveContainer width="100%" height={318}>
              <ScatterChart margin={{ left: 8, right: 24, top: 12, bottom: 10 }}>
                <CartesianGrid stroke="#e9edf2" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="affectedArea"
                  name="Área afectada"
                  unit=" m²"
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="appraised"
                  name="Valor tasado"
                  unit=" MM"
                  tick={{ fontSize: 10 }}
                />
                <ZAxis type="number" dataKey="approved" range={[70, 440]} name="Costo total" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value, name) =>
                    name === "Área afectada"
                      ? `${number(Number(value), 0)} m²`
                      : money(Number(value))
                  }
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {types.map((type) => (
                  <Scatter
                    key={type}
                    name={type}
                    data={predios.filter((row) => row.type === type)}
                    fill={typeColors[type]}
                    onClick={(row) => setSelectedPredio(row)}
                    cursor="pointer"
                  />
                ))}
                <ReferenceLine
                  y={12}
                  stroke={COLORS.red}
                  strokeDasharray="4 4"
                  label={{ value: "Zona de atípicos", fontSize: 9, fill: COLORS.red }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Panel>
        </section>

        <section className="mb-3">
          <Panel
            title="Ranking de los 15 predios de mayor costo"
            subtitle="Ordena los quince predios más costosos; rojo identifica los que superan el promedio de su sector por encima del umbral."
            icon={<ArrowUpRight size={15} />}
          >
            <ResponsiveContainer width="100%" height={505}>
              <BarChart
                data={ranking}
                layout="vertical"
                margin={{ left: 18, right: 280, top: 8 }}
                onClick={(state) => {
                  if (typeof state?.activeLabel === "string") {
                    const row = ranking.find((item) => item.code === state.activeLabel);
                    if (row) setSelectedPredio(row);
                  }
                }}
              >
                <CartesianGrid stroke="#edf0f4" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="code"
                  width={90}
                  tick={{ fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(value) => money(Number(value))} />
                <Bar dataKey="total" name="Costo total" radius={[0, 3, 3, 0]} cursor="pointer">
                  <LabelList
                    dataKey="label"
                    position="right"
                    style={{ fontSize: 9, fill: "#475569" }}
                  />
                  {ranking.map((row) => (
                    <Cell key={row.code} fill={row.above ? COLORS.red : COLORS.blue} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </section>

        <section className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2.5">
            <div>
              <h2 className="text-[13px] font-semibold text-slate-800">
                Tabla técnica de costos por predio
              </h2>
              <p className="text-[10px] text-slate-500">
                Valores monetarios expresados en millones de soles
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex h-8 w-64 items-center gap-2 rounded border border-slate-200 px-2 text-slate-400">
                <Search size={14} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-[11px] text-slate-700 outline-none"
                  placeholder="Buscar código o sujeto pasivo..."
                />
              </div>
              <button
                onClick={exportCsv}
                className="inline-flex h-8 items-center gap-1 rounded border border-slate-300 px-2.5 text-[11px] font-medium text-slate-700"
              >
                <Download size={13} /> Exportar tabla
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1900px] text-[10px]">
              <thead className="bg-slate-50 text-left uppercase tracking-wide text-slate-500">
                <tr>
                  {[
                    "Código",
                    "Área matriz",
                    "Área afectada",
                    "Área remanente",
                    "Terreno",
                    "Edificaciones",
                    "Plantaciones",
                    "Perjuicio económico",
                    "Incentivo",
                    "Compensación",
                    "Servicios directos",
                    "Gastos compartidos",
                    "Valor tasado",
                    "Monto aprobado",
                    "Monto pagado",
                    "Variación",
                    "",
                  ].map((head) => (
                    <th key={head} className="whitespace-nowrap px-3 py-2 font-semibold">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.code} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-bold text-[#dc2626]">{row.code}</td>
                    <AreaCell value={row.matrixArea} />
                    <AreaCell value={row.affectedArea} />
                    <AreaCell value={row.remainingArea} />
                    {[
                      row.land,
                      row.buildings,
                      row.plantations,
                      row.economicLoss,
                      row.incentive,
                      row.compensation,
                      row.directServices,
                      row.sharedExpenses,
                      row.appraised,
                      row.approved,
                      row.paid,
                    ].map((value, index) => (
                      <MoneyCell key={index} value={value} />
                    ))}
                    <td
                      className={`px-3 py-2.5 font-bold ${Math.abs(row.variation) > 10 ? "bg-red-50 text-red-700" : row.variation > 0 ? "text-amber-700" : "text-green-700"}`}
                    >
                      {row.variation > 0 ? "+" : ""}
                      {row.variation.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setSelectedPredio(row)}
                        title="Abrir expediente técnico-legal"
                        className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-slate-600 hover:border-red-200 hover:text-red-600"
                      >
                        <Eye size={13} /> Expediente
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filtered.length && (
            <div className="p-8 text-center text-[12px] text-slate-500">
              No se encontraron predios con los filtros seleccionados.
            </div>
          )}
        </section>

        <section className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-3 py-2.5">
            <h2 className="text-[13px] font-semibold text-slate-800">
              Matriz de cumplimiento documental
            </h2>
            <p className="text-[10px] text-slate-500">
              Integridad de los documentos técnicos, legales y valuatorios por predio
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1380px] text-[10px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="sticky left-0 bg-slate-50 px-3 py-2 text-left">
                    Código del predio
                  </th>
                  {documentColumns.map((column) => (
                    <th key={column} className="min-w-24 px-2 py-2 text-center font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 10).map((row, rowIndex) => (
                  <tr key={row.code} className="border-t border-slate-100">
                    <td className="sticky left-0 bg-white px-3 py-2.5 font-bold text-slate-800">
                      {row.code}
                    </td>
                    {documentColumns.map((column, columnIndex) => (
                      <td key={column} className="px-2 py-2 text-center">
                        <DocumentStatus
                          status={
                            (rowIndex * 3 + columnIndex) % 11 === 0
                              ? "missing"
                              : (rowIndex + columnIndex * 2) % 7 === 0
                                ? "observed"
                                : columnIndex > 6 && (rowIndex + columnIndex) % 6 === 0
                                  ? "na"
                                  : "complete"
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-4 border-t border-slate-100 px-3 py-2 text-[9px] text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={11} className="text-green-600" /> Completo
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle size={11} className="text-amber-500" /> Observado
            </span>
            <span className="flex items-center gap-1">
              <XCircle size={11} className="text-red-600" /> Faltante
            </span>
            <span className="flex items-center gap-1">
              <MinusCircle size={11} className="text-slate-400" /> No aplicable
            </span>
          </div>
        </section>
      </main>
      {selectedComposition && (
        <CompositionDrawer
          name={selectedComposition}
          total={
            (totalAppraised *
              (compositionBase.find((row) => row.name === selectedComposition)?.value ?? 0)) /
            100
          }
          onClose={() => setSelectedComposition(null)}
          onPredio={setSelectedPredio}
        />
      )}
      {selectedPredio && (
        <PredioDrawer row={selectedPredio} onClose={() => setSelectedPredio(null)} />
      )}
      {selectedTracking && (
        <TechnicalTrackingModal
          selected={selectedTracking}
          onClose={() => setSelectedTracking(null)}
        />
      )}
      {selectedFullTracking && (
        <FullPredioTrackingModal
          selected={selectedFullTracking}
          onClose={() => setSelectedFullTracking(null)}
        />
      )}
    </div>
  );
}

function TechnicalTrackingMatrix({
  rows,
  onSelect,
}: {
  rows: Predio[];
  onSelect: (selected: SelectedTrackingStage) => void;
}) {
  function exportTrackingCsv() {
    const headers = [
      "codigo_predio",
      "sujeto_pasivo",
      "expediente",
      "sector",
      "tipo_inmueble",
      "area_afectada_m2",
      "perito",
      "responsable_tecnico",
      "fecha_inicio",
      "etapa_actual",
      "avance",
      "dias_transcurridos",
      "plazo_total_dias",
      ...trackingStages.flatMap((stage) => [
        `${stage.label}_inicio`,
        `${stage.label}_dias_reales`,
        `${stage.label}_meta_dias`,
      ]),
    ];
    const content = rows.map((row) => {
      const currentStage = trackingStageIndex(row);
      return [
        row.code,
        row.owner,
        `EXP-TAS-2026-${row.code.split("-").at(-1)}`,
        row.sector,
        row.type,
        row.affectedArea,
        row.expert,
        row.technician,
        row.entryDate,
        trackingStages[currentStage].label,
        `${(((currentStage + 1) / trackingStages.length) * 100).toFixed(1)}%`,
        trackingProcessDays(row),
        trackingTargetDays,
        ...trackingStages.flatMap((_, index) => {
          const timing = trackingStageTiming(row, index);
          return [
            timing.start ? formatTrackingDate(timing.start) : "",
            timing.days ?? "",
            trackingStages[index].targetDays,
          ];
        }),
      ];
    });
    const csv = [headers, ...content]
      .map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "matriz_seguimiento_tecnico_tasaciones.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-3 py-2.5">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 size={15} className="text-red-600" />
            <h2 className="text-[13px] font-semibold text-slate-800">
              Matriz extensa de seguimiento técnico y tasaciones
            </h2>
          </div>
          <p className="mt-1 text-[10px] text-slate-500">
            Datos del predio, responsables, fechas, avance y duración real frente al plazo objetivo
            de {trackingTargetDays} días.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[9px] text-slate-600">
          <span className="rounded-md border border-orange-300 bg-orange-50 px-2 py-1 font-bold text-orange-800">
            Meta total: {trackingTargetDays} días
          </span>
          <span className="flex items-center gap-1">
            <i className="size-2.5 rounded-sm bg-sky-400" /> Completada
          </span>
          <span className="flex items-center gap-1">
            <i className="size-2.5 rounded-sm bg-amber-400" /> Actual
          </span>
          <span className="flex items-center gap-1">
            <i className="size-2.5 rounded-sm border-2 border-orange-500" /> Plazo
          </span>
          <button
            type="button"
            onClick={exportTrackingCsv}
            className="inline-flex h-8 items-center gap-1.5 rounded bg-red-600 px-3 text-[11px] font-semibold text-white hover:bg-red-700"
          >
            <Download size={13} /> Exportar matriz
          </button>
        </div>
      </div>
      <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
        {rows.length} registros · Seleccione una etapa para revisar fechas, duración, desviación y
        evidencia.
      </div>
      <div className="max-h-[610px] overflow-auto">
        <table className="min-w-[2100px] border-separate border-spacing-0 text-[9px]">
          <thead className="sticky top-0 z-30">
            <tr>
              <th
                colSpan={9}
                className="border border-white bg-[#1e3a8a] px-2 py-1.5 text-center font-bold text-white"
              >
                DATOS DEL PREDIO Y EXPEDIENTE TÉCNICO
              </th>
              <th
                colSpan={trackingStages.length + 3}
                className="border border-white bg-[#9a3412] px-2 py-1.5 text-center font-bold text-white"
              >
                SEGUIMIENTO DE EXPEDIENTE Y TASACIÓN
              </th>
            </tr>
            <tr className="bg-slate-100 text-slate-700">
              {[
                ["N°", "min-w-10"],
                ["Código de predio", "min-w-36"],
                ["Sujeto pasivo", "min-w-56"],
                ["Expediente", "min-w-36"],
                ["Sector / tipo", "min-w-32"],
                ["Área afectada", "min-w-24"],
                ["Perito tasador", "min-w-36"],
                ["Responsable técnico", "min-w-36"],
                ["Fecha de inicio", "min-w-24"],
              ].map(([label, width], index) => (
                <th
                  key={label}
                  className={`border-b border-r border-slate-300 px-2 py-2 text-left font-bold ${width} ${
                    index < 2
                      ? `sticky z-40 bg-slate-100 ${index === 0 ? "left-0" : "left-10"}`
                      : ""
                  }`}
                >
                  {label}
                </th>
              ))}
              {trackingStages.map((stage, index) => (
                <th
                  key={stage.label}
                  className="relative h-40 min-w-10 border-b border-r border-slate-300 bg-slate-900 p-0 text-white"
                >
                  <span className="absolute left-1/2 top-1 -translate-x-1/2 rounded-sm border border-orange-400 bg-orange-50 px-1 py-0.5 text-[7px] font-extrabold text-orange-700">
                    {stage.targetDays} d
                  </span>
                  <span className="absolute bottom-0 left-0 inline-flex h-32 w-10 rotate-180 items-center justify-center px-1 py-2 text-[8px] font-semibold [writing-mode:vertical-rl]">
                    {stage.label}
                  </span>
                </th>
              ))}
              <th className="min-w-20 border-b border-r border-slate-300 bg-slate-900 px-2 text-center text-white">
                % avance
              </th>
              <th className="min-w-24 border-b border-r border-slate-300 bg-slate-900 px-2 text-center text-white">
                Días transcurridos
              </th>
              <th className="min-w-24 border-b border-r border-slate-300 bg-slate-900 px-2 text-center text-white">
                Desviación
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const currentStage = trackingStageIndex(row);
              const processDays = trackingProcessDays(row);
              const deviation = processDays - trackingTargetDays;
              const expediente = `EXP-TAS-2026-${row.code.split("-").at(-1)}`;
              return (
                <tr key={row.code} className={rowIndex % 2 ? "bg-slate-50" : "bg-white"}>
                  <td className="sticky left-0 z-20 border-b border-r border-slate-200 bg-inherit px-2 py-2 text-center font-bold text-red-600">
                    {rowIndex + 1}
                  </td>
                  <td className="sticky left-10 z-20 border-b border-r border-slate-200 bg-inherit px-2 py-2 font-mono font-bold text-slate-800">
                    {row.code}
                  </td>
                  <td className="border-b border-r border-slate-200 px-2 py-2 font-medium">
                    {row.owner}
                  </td>
                  <td className="border-b border-r border-slate-200 px-2 py-2 font-mono text-violet-700">
                    {expediente}
                  </td>
                  <td className="border-b border-r border-slate-200 px-2 py-2">
                    {row.sector} · {row.type}
                  </td>
                  <td className="border-b border-r border-slate-200 px-2 py-2 text-right tabular-nums">
                    {number(row.affectedArea)} m²
                  </td>
                  <td className="border-b border-r border-slate-200 px-2 py-2">{row.expert}</td>
                  <td className="border-b border-r border-slate-200 px-2 py-2">{row.technician}</td>
                  <td className="border-b border-r border-slate-200 px-2 py-2 text-center font-semibold tabular-nums">
                    {row.entryDate}
                  </td>
                  {trackingStages.map((stage, stageIndex) => {
                    const timing = trackingStageTiming(row, stageIndex);
                    const observed =
                      stageIndex === currentStage &&
                      (row.status === "Observado" || row.status === "Vencido");
                    return (
                      <td
                        key={stage.label}
                        className="border-b border-r border-slate-200 p-0 text-center"
                      >
                        <button
                          type="button"
                          onClick={() => onSelect({ row, stageIndex })}
                          title={`${stage.label}: ${timing.condition}. ${timing.days ?? 0} días / meta ${stage.targetDays} días`}
                          className={`relative flex h-8 w-full items-center justify-center overflow-hidden transition hover:ring-2 hover:ring-inset hover:ring-red-600 ${
                            timing.condition === "Completada"
                              ? "bg-sky-400 text-sky-950"
                              : timing.condition === "Etapa actual"
                                ? observed
                                  ? "bg-red-400 text-white"
                                  : "bg-amber-400 text-amber-950"
                                : "bg-white text-slate-300"
                          }`}
                        >
                          {timing.condition === "Completada" ? (
                            <CheckCircle2 size={11} />
                          ) : timing.condition === "Etapa actual" ? (
                            observed ? (
                              <AlertCircle size={11} />
                            ) : (
                              <Clock3 size={11} />
                            )
                          ) : (
                            <span className="size-1 rounded-full bg-slate-200" />
                          )}
                          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-orange-500" />
                        </button>
                      </td>
                    );
                  })}
                  <td className="border-b border-r border-slate-200 px-2 py-2 text-center font-bold tabular-nums">
                    {(((currentStage + 1) / trackingStages.length) * 100).toFixed(1)}%
                  </td>
                  <td className="border-b border-r border-slate-200 px-2 py-2 text-center">
                    <span
                      className={`rounded-full px-2 py-1 font-bold tabular-nums ${processDays > trackingTargetDays ? "bg-red-100 text-red-700" : processDays >= trackingTargetDays * 0.8 ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}
                    >
                      {processDays} días
                    </span>
                  </td>
                  <td className="border-b border-r border-slate-200 px-2 py-2 text-center">
                    <span
                      className={`font-bold tabular-nums ${deviation > 0 ? "text-red-700" : "text-emerald-700"}`}
                    >
                      {deviation > 0 ? "+" : ""}
                      {deviation} d
                    </span>
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

function TechnicalTrackingModal({
  selected,
  onClose,
}: {
  selected: SelectedTrackingStage;
  onClose: () => void;
}) {
  const { row, stageIndex } = selected;
  const selectedStage = trackingStages[stageIndex];
  const selectedTiming = trackingStageTiming(row, stageIndex);
  const currentStage = trackingStageIndex(row);
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4"
      onMouseDown={onClose}
    >
      <section
        className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 bg-slate-950 px-5 py-4 text-white">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-red-300">
              Seguimiento técnico y tasación · {row.code}
            </div>
            <h2 className="mt-1 text-lg font-bold">{selectedStage.label}</h2>
            <p className="mt-1 text-[10px] text-slate-300">
              {row.owner} · {row.sector}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-slate-300 hover:bg-white/10"
          >
            <X size={17} />
          </button>
        </header>
        <div className="max-h-[calc(100vh-7rem)] overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
            <TrackingMetric
              label="Condición"
              value={selectedTiming.condition}
              tone={
                selectedTiming.condition === "Etapa actual"
                  ? "amber"
                  : selectedTiming.condition === "Completada"
                    ? "green"
                    : "slate"
              }
            />
            <TrackingMetric
              label="Inicio"
              value={selectedTiming.start ? formatTrackingDate(selectedTiming.start) : "—"}
            />
            <TrackingMetric
              label="Fin / corte"
              value={selectedTiming.end ? formatTrackingDate(selectedTiming.end) : "—"}
            />
            <TrackingMetric
              label="Tiempo real"
              value={selectedTiming.days === null ? "—" : `${selectedTiming.days} días`}
            />
            <TrackingMetric
              label="Meta de etapa"
              value={`${selectedStage.targetDays} días`}
              tone="orange"
            />
            <TrackingMetric
              label="Tiempo total"
              value={`${trackingProcessDays(row)} días`}
              tone="blue"
            />
            <TrackingMetric label="Meta total" value={`${trackingTargetDays} días`} tone="orange" />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="text-[9px] font-bold uppercase text-blue-700">Evidencia esperada</div>
              <p className="mt-1 text-[10px] leading-4 text-blue-900">{selectedStage.evidence}.</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-[9px] font-bold uppercase text-slate-500">Responsables</div>
              <p className="mt-1 text-[10px] leading-4 text-slate-700">
                <b>Perito:</b> {row.expert}
                <br />
                <b>Técnico:</b> {row.technician}
              </p>
            </div>
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
              <div className="text-[9px] font-bold uppercase text-violet-700">Expediente</div>
              <p className="mt-1 font-mono text-[10px] font-bold text-violet-900">
                EXP-TAS-2026-{row.code.split("-").at(-1)}
              </p>
              <p className="mt-1 text-[9px] text-violet-700">Tasación: {row.appraisalStatus}</p>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
              <h3 className="text-[11px] font-bold">Cronología completa del expediente</h3>
              <p className="text-[9px] text-slate-500">
                Días reales frente a la meta asignada para cada etapa.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {trackingStages.map((stage, index) => {
                const timing = trackingStageTiming(row, index);
                const late = timing.days !== null && timing.days > stage.targetDays;
                return (
                  <div
                    key={stage.label}
                    className={`grid grid-cols-[24px_1fr_90px] items-center gap-2 px-3 py-2 text-[10px] sm:grid-cols-[24px_minmax(180px,1fr)_110px_190px_120px] ${index === stageIndex ? "bg-red-50 ring-1 ring-inset ring-red-200" : ""}`}
                  >
                    <span
                      className={`flex size-5 items-center justify-center rounded-full text-[8px] font-bold ${timing.condition === "Completada" ? "bg-sky-500 text-white" : timing.condition === "Etapa actual" ? "bg-amber-400 text-amber-950" : "bg-slate-100 text-slate-400"}`}
                    >
                      {timing.condition === "Completada" ? <CheckCircle2 size={11} /> : index + 1}
                    </span>
                    <div>
                      <b className="text-slate-700">{stage.label}</b>
                      <p className="text-[8px] text-slate-400">{stage.evidence}</p>
                    </div>
                    <span className="hidden w-fit rounded-full bg-slate-100 px-2 py-1 text-[8px] font-bold text-slate-600 sm:inline-flex">
                      {timing.condition}
                    </span>
                    <span className="hidden text-[9px] text-slate-500 sm:block">
                      {timing.start ? formatTrackingDate(timing.start) : "—"} →{" "}
                      {timing.end ? formatTrackingDate(timing.end) : "—"}
                    </span>
                    <span
                      className={`justify-self-end rounded-md border px-2 py-1 font-bold tabular-nums ${timing.days === null ? "border-orange-300 text-slate-400" : late ? "border-red-300 bg-red-50 text-red-700" : "border-orange-400 bg-orange-50 text-orange-700"}`}
                    >
                      {timing.days === null
                        ? `Meta ${stage.targetDays} d`
                        : `${timing.days} / ${stage.targetDays} d`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <span className="rounded-full bg-slate-900 px-3 py-1.5 text-[9px] font-bold text-white">
              {currentStage + 1} de {trackingStages.length} etapas alcanzadas
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function TrackingMetric({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string;
  tone?: "slate" | "green" | "amber" | "blue" | "orange";
}) {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-800",
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    orange: "border-orange-300 bg-orange-50 text-orange-800",
  };
  return (
    <div className={`rounded-lg border p-2.5 ${tones[tone]}`}>
      <div className="text-[8px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-[11px] font-bold leading-4">{value}</div>
    </div>
  );
}

function FullPredioTrackingModal({
  selected,
  onClose,
}: {
  selected: SelectedFullTrackingStage;
  onClose: () => void;
}) {
  const { row, stageIndex } = selected;
  const currentStage = fullPredioTrackingStageIndex(row);
  const timing = fullPredioTrackingStageTiming(row, stageIndex);
  const stage = FULL_PREDIO_TRACKING_STAGES[stageIndex];
  const totalTarget = FULL_PREDIO_TRACKING_STAGES.reduce(
    (total, item) => total + item.targetDays,
    0,
  );
  const processDays = fullPredioTrackingProcessDays(row);

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/60 p-4"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 bg-slate-950 px-5 py-4 text-white">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-red-300">
              Matriz extensa · Seguimiento técnico y tasaciones
            </div>
            <h2 className="mt-1 text-lg font-bold">
              {row.cod || row.codigo} · {stage.label}
            </h2>
            <p className="mt-1 text-[10px] text-slate-300">
              {row.proyecto || "Proyecto sin registrar"} · {row.suj || "Sin información"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="rounded p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <X size={17} />
          </button>
        </header>

        <div className="max-h-[calc(100vh-7rem)] overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
            <TrackingMetric
              label="Condición"
              value={timing.condition}
              tone={
                timing.condition === "Etapa actual"
                  ? "amber"
                  : timing.condition === "Completada"
                    ? "green"
                    : "slate"
              }
            />
            <TrackingMetric
              label="Inicio del proceso"
              value={formatFullPredioTrackingDate(fullPredioTrackingStart(row))}
            />
            <TrackingMetric
              label="Inicio de etapa"
              value={timing.start ? formatFullPredioTrackingDate(timing.start) : "—"}
            />
            <TrackingMetric
              label="Fin / corte"
              value={timing.end ? formatFullPredioTrackingDate(timing.end) : "—"}
            />
            <TrackingMetric
              label="Tiempo real"
              value={timing.days === null ? "—" : `${timing.days} días`}
            />
            <TrackingMetric label="Meta etapa" value={`${stage.targetDays} días`} tone="orange" />
            <TrackingMetric label="Tiempo total" value={`${processDays} días`} tone="blue" />
            <TrackingMetric label="Meta total" value={`${totalTarget} días`} tone="orange" />
          </div>

          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
              <h3 className="text-[11px] font-bold text-slate-800">
                Datos principales de la Matriz extensa
              </h3>
            </div>
            <dl className="grid text-[10px] sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Condición del predio", row.condicionPredio],
                ["Expediente", row.exp],
                ["Modalidad", row.mod],
                ["Sujeto pasivo", row.suj],
                ["Condición del sujeto pasivo", row.cond],
                ["Responsable legal", row.rlegal],
                ["Responsable técnico", row.rtec],
                ["Partida registral", row.part],
                ["Área afectada", row.m2 ? `${row.m2} m²` : ""],
                ["Tipo de afectación", row.afec],
                ["Valor de adquisición", row.valor ? `S/ ${row.valor}` : ""],
                ["Estado de pago", row.pago],
                ["Estado de título", row.etit],
                ["Transferencia a OPAT", row.trans],
                ["Expediente físico DDP", row.edd],
                ["Comentario", row.com],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-r border-slate-100 p-2.5">
                  <dt className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                    {label}
                  </dt>
                  <dd className="mt-1 font-semibold leading-4 text-slate-700">
                    {value || "Sin información"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2">
              <div>
                <h3 className="text-[11px] font-bold text-slate-800">
                  Cronología del expediente técnico y tasación
                </h3>
                <p className="text-[9px] text-slate-500">
                  Tiempo real comparado con la meta definida para cada etapa.
                </p>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[9px] font-bold text-white">
                {currentStage + 1} de {FULL_PREDIO_TRACKING_STAGES.length} etapas
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {FULL_PREDIO_TRACKING_STAGES.map((timelineStage, index) => {
                const timelineTiming = fullPredioTrackingStageTiming(row, index);
                const late =
                  timelineTiming.days !== null && timelineTiming.days > timelineStage.targetDays;
                return (
                  <div
                    key={timelineStage.label}
                    className={`grid grid-cols-[24px_1fr_100px] items-center gap-2 px-3 py-2 text-[10px] sm:grid-cols-[24px_minmax(180px,1fr)_110px_190px_120px] ${
                      index === stageIndex ? "bg-red-50 ring-1 ring-inset ring-red-200" : ""
                    }`}
                  >
                    <span
                      className={`flex size-5 items-center justify-center rounded-full text-[8px] font-bold ${
                        timelineTiming.condition === "Completada"
                          ? "bg-sky-500 text-white"
                          : timelineTiming.condition === "Etapa actual"
                            ? "bg-amber-400 text-amber-950"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {timelineTiming.condition === "Completada" ? (
                        <CheckCircle2 size={11} />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div>
                      <b className="text-slate-700">{timelineStage.label}</b>
                      {index === stageIndex && (
                        <p className="text-[8px] font-bold uppercase text-red-600">
                          Etapa seleccionada
                        </p>
                      )}
                    </div>
                    <span className="hidden w-fit rounded-full bg-slate-100 px-2 py-1 text-[8px] font-bold text-slate-600 sm:inline-flex">
                      {timelineTiming.condition}
                    </span>
                    <span className="hidden text-[9px] text-slate-500 sm:block">
                      {timelineTiming.start
                        ? formatFullPredioTrackingDate(timelineTiming.start)
                        : "—"}{" "}
                      →{" "}
                      {timelineTiming.end ? formatFullPredioTrackingDate(timelineTiming.end) : "—"}
                    </span>
                    <span
                      className={`justify-self-end rounded-md border px-2 py-1 font-bold tabular-nums ${
                        timelineTiming.days === null
                          ? "border-orange-300 text-slate-400"
                          : late
                            ? "border-red-300 bg-red-50 text-red-700"
                            : "border-orange-400 bg-orange-50 text-orange-700"
                      }`}
                    >
                      {timelineTiming.days === null
                        ? `Meta ${timelineStage.targetDays} d`
                        : `${timelineTiming.days} / ${timelineStage.targetDays} d`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
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
  return (
    <div
      className={`min-h-[116px] rounded-lg border border-slate-200 border-t-[3px] bg-white p-2.5 shadow-sm ${top}`}
    >
      <div className="min-h-8 text-[10px] font-semibold leading-4 text-slate-600">{label}</div>
      <div className="mt-1 whitespace-nowrap text-[18px] font-bold tracking-tight text-slate-900">
        {value}
      </div>
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

function AreaCell({ value }: { value: number }) {
  return <td className="whitespace-nowrap px-3 py-2.5">{number(value)} m²</td>;
}
function MoneyCell({ value }: { value: number }) {
  return <td className="whitespace-nowrap px-3 py-2.5 font-medium">{money(value)}</td>;
}

function DocumentStatus({ status }: { status: "complete" | "observed" | "missing" | "na" }) {
  const config = {
    complete: { Icon: CheckCircle2, cls: "text-green-600 bg-green-50", label: "Completo" },
    observed: { Icon: AlertCircle, cls: "text-amber-500 bg-amber-50", label: "Observado" },
    missing: { Icon: XCircle, cls: "text-red-600 bg-red-50", label: "Faltante" },
    na: { Icon: MinusCircle, cls: "text-slate-400 bg-slate-100", label: "No aplicable" },
  }[status];
  const Icon = config.Icon;
  return (
    <span
      title={config.label}
      className={`inline-flex size-6 items-center justify-center rounded-full ${config.cls}`}
    >
      <Icon size={14} />
    </span>
  );
}

function CompositionDrawer({
  name,
  total,
  onClose,
  onPredio,
}: {
  name: string;
  total: number;
  onClose: () => void;
  onPredio: (row: Predio) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-slate-950/30"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className="h-full w-full max-w-[440px] overflow-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#dc2626]">
                Composición del valor tasado
              </div>
              <h2 className="mt-1 text-[18px] font-semibold">{name}</h2>
              <b className="mt-2 block text-[23px]">{money(total, 1)}</b>
            </div>
            <button
              onClick={onClose}
              className="rounded border border-slate-200 p-1.5 text-slate-500"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="p-3">
          <p className="mb-3 text-[10px] text-slate-500">
            Predios que conforman el monto seleccionado
          </p>
          {predios.slice(0, 8).map((row, index) => (
            <button
              key={row.code}
              onClick={() => onPredio(row)}
              className="mb-2 flex w-full items-center justify-between rounded-lg border border-slate-200 p-3 text-left hover:border-red-200"
            >
              <div>
                <b className="text-[11px] text-slate-800">{row.code}</b>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {row.owner} · {row.sector}
                </p>
              </div>
              <div className="text-right">
                <b className="text-[11px]">{money(total * (0.17 - index * 0.012), 2)}</b>
                <p className="text-[9px] text-slate-400">Ver expediente</p>
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

function PredioDrawer({ row, onClose }: { row: Predio; onClose: () => void }) {
  const fields = [
    ["Sujeto pasivo", row.owner],
    ["Sector / tipo", `${row.sector} · ${row.type}`],
    ["Estado del expediente", row.status],
    ["Estado de tasación", row.appraisalStatus],
    ["Perito", row.expert],
    ["Responsable técnico", row.technician],
    ["Área afectada", `${number(row.affectedArea)} m²`],
    ["Valor tasado", money(row.appraised)],
    ["Monto aprobado", money(row.approved)],
    ["Monto pagado", money(row.paid)],
    ["Variación", `${row.variation > 0 ? "+" : ""}${row.variation.toFixed(1)}%`],
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/35"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className="flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl">
        <div className="border-b border-slate-200 p-4">
          <div className="flex justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#dc2626]">
                Expediente técnico-legal
              </div>
              <h2 className="mt-1 text-[21px] font-bold">{row.code}</h2>
              <p className="text-[11px] text-slate-500">
                Ficha de valorización y costos del predio
              </p>
            </div>
            <button
              onClick={onClose}
              className="h-fit rounded border border-slate-200 p-1.5 text-slate-500"
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
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="rounded border border-slate-200 p-3 text-left">
              <FileCheck2 size={16} className="text-green-600" />
              <b className="mt-2 block text-[11px]">Documentos técnicos</b>
              <span className="text-[9px] text-slate-500">8 completos · 2 observados</span>
            </button>
            <button className="rounded border border-slate-200 p-3 text-left">
              <CircleDollarSign size={16} className="text-blue-600" />
              <b className="mt-2 block text-[11px]">Informe de tasación</b>
              <span className="text-[9px] text-slate-500">Versión 03 · Vigente</span>
            </button>
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
