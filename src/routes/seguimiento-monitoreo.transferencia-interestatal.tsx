import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  FilterX,
  Landmark,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import writeExcelFile, { type SheetData } from "write-excel-file/browser";

import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/seguimiento-monitoreo/transferencia-interestatal")({
  head: () => ({
    meta: [
      { title: "Coordinadores · Transferencias interestatales" },
      {
        name: "description",
        content: "Seguimiento de predios estatales pendientes, en trámite y adquiridos.",
      },
    ],
  }),
  component: TransferenciaInterestatalPage,
});

type TransferStatus = "PENDIENTE" | "EN TRÁMITE" | "ADQUIRIDO";

type StateProperty = {
  project: string;
  owner: string;
  code: string;
  registry: string;
  status: TransferStatus;
  period: "2026";
  responsible: string;
  updatedAt: string;
};

const statusOrder: TransferStatus[] = ["PENDIENTE", "EN TRÁMITE", "ADQUIRIDO"];

const properties: StateProperty[] = [
  {
    project: "JAUJA",
    owner: "Estado peruano",
    code: "AERO-JAUJA-PR-0521T",
    registry: "PARTIDA ELECTRÓNICA 11356305",
    status: "ADQUIRIDO",
    period: "2026",
    responsible: "Ana Campos",
    updatedAt: "08/07/2026",
  },
  {
    project: "JAUJA",
    owner: "Estado peruano",
    code: "AERO-JAUJA-PR-0522T",
    registry: "PARTIDA ELECTRÓNICA 11354027",
    status: "ADQUIRIDO",
    period: "2026",
    responsible: "Ana Campos",
    updatedAt: "09/07/2026",
  },
  {
    project: "JAUJA",
    owner: "Estado peruano",
    code: "AERO-JAUJA-PR-0535T",
    registry: "PARTIDA ELECTRÓNICA 11369203",
    status: "ADQUIRIDO",
    period: "2026",
    responsible: "Luis Paredes",
    updatedAt: "10/07/2026",
  },
  {
    project: "JAUJA",
    owner: "Estado peruano",
    code: "AERO-JAUJA-PR-0547T",
    registry: "PARTIDA ELECTRÓNICA 11376290",
    status: "ADQUIRIDO",
    period: "2026",
    responsible: "Luis Paredes",
    updatedAt: "11/07/2026",
  },
  {
    project: "JAUJA",
    owner: "Estado peruano",
    code: "AERO-JAUJA-PR-0548AT",
    registry: "PARTIDA ELECTRÓNICA 11366180",
    status: "ADQUIRIDO",
    period: "2026",
    responsible: "Patricia Gómez",
    updatedAt: "12/07/2026",
  },
  {
    project: "JAUJA",
    owner: "Estado peruano",
    code: "AERO-JAUJA-PR-0534T",
    registry: "PARTIDA ELECTRÓNICA 11360421",
    status: "EN TRÁMITE",
    period: "2026",
    responsible: "Patricia Gómez",
    updatedAt: "13/07/2026",
  },
  {
    project: "JAUJA",
    owner: "Estado peruano",
    code: "AERO-JAUJA-PR-0536T",
    registry: "PARTIDA ELECTRÓNICA 11360773",
    status: "EN TRÁMITE",
    period: "2026",
    responsible: "Jorge Salazar",
    updatedAt: "14/07/2026",
  },
  {
    project: "JAUJA",
    owner: "Estado peruano",
    code: "AERO-JAUJA-PR-0541T",
    registry: "PARTIDA ELECTRÓNICA 11363102",
    status: "EN TRÁMITE",
    period: "2026",
    responsible: "Jorge Salazar",
    updatedAt: "15/07/2026",
  },
  {
    project: "JAUJA",
    owner: "Estado peruano",
    code: "AERO-JAUJA-PR-0549T",
    registry: "Pendiente de validación registral",
    status: "PENDIENTE",
    period: "2026",
    responsible: "Ana Campos",
    updatedAt: "16/07/2026",
  },
  {
    project: "JAUJA",
    owner: "Estado peruano",
    code: "AERO-JAUJA-PR-0560T",
    registry: "Pendiente de ingreso documental",
    status: "PENDIENTE",
    period: "2026",
    responsible: "Luis Paredes",
    updatedAt: "17/07/2026",
  },
  {
    project: "CAJAMARCA",
    owner: "Estado peruano",
    code: "PM1G-AERCAJAMARCA-PR-0456",
    registry: "PARTIDA ELECTRÓNICA 11237411",
    status: "ADQUIRIDO",
    period: "2026",
    responsible: "Patricia Gómez",
    updatedAt: "18/07/2026",
  },
  {
    project: "CAJAMARCA",
    owner: "Estado peruano",
    code: "PM1G-AERCAJAMARCA-PR-0565",
    registry: "OFICIO N.° 05690-2026-SBN-DGPE-SDDI",
    status: "EN TRÁMITE",
    period: "2026",
    responsible: "Jorge Salazar",
    updatedAt: "19/07/2026",
  },
  {
    project: "CAJAMARCA",
    owner: "Estado peruano",
    code: "PM1G-AERCAJAMARCA-PR-0571",
    registry: "Pendiente de ingreso documental",
    status: "PENDIENTE",
    period: "2026",
    responsible: "Ana Campos",
    updatedAt: "20/07/2026",
  },
  {
    project: "PIURA",
    owner: "Estado peruano",
    code: "PM1G-AERPIURA-PU-203",
    registry: "PARTIDA ELECTRÓNICA 11305577",
    status: "ADQUIRIDO",
    period: "2026",
    responsible: "Luis Paredes",
    updatedAt: "21/07/2026",
  },
  {
    project: "PIURA",
    owner: "Estado peruano",
    code: "PM1G-AERPIURA-PU-206",
    registry: "PARTIDA ELECTRÓNICA 11299145",
    status: "ADQUIRIDO",
    period: "2026",
    responsible: "Patricia Gómez",
    updatedAt: "22/07/2026",
  },
  {
    project: "TALARA",
    owner: "Estado peruano",
    code: "PM1G-AER-TALARA-PR-102",
    registry: "PARTIDA ELECTRÓNICA 11248754",
    status: "EN TRÁMITE",
    period: "2026",
    responsible: "Jorge Salazar",
    updatedAt: "23/07/2026",
  },
  {
    project: "TALARA",
    owner: "Estado peruano",
    code: "PM1G-AER-TALARA-PR-103",
    registry: "PARTIDA ELECTRÓNICA 11248775",
    status: "EN TRÁMITE",
    period: "2026",
    responsible: "Ana Campos",
    updatedAt: "24/07/2026",
  },
  {
    project: "TALARA",
    owner: "Estado peruano",
    code: "PM1G-AER-TALARA-PR-109",
    registry: "Pendiente de ingreso documental",
    status: "PENDIENTE",
    period: "2026",
    responsible: "Luis Paredes",
    updatedAt: "25/07/2026",
  },
  {
    project: "AREQUIPA",
    owner: "Estado peruano",
    code: "PM2G-AERAREQ-PU-014",
    registry: "PARTIDA ELECTRÓNICA 11632517",
    status: "ADQUIRIDO",
    period: "2026",
    responsible: "Patricia Gómez",
    updatedAt: "26/07/2026",
  },
  {
    project: "AREQUIPA",
    owner: "Estado peruano",
    code: "PM2G-AERAREQ-PU-015",
    registry: "PARTIDA ELECTRÓNICA 11632518",
    status: "ADQUIRIDO",
    period: "2026",
    responsible: "Jorge Salazar",
    updatedAt: "27/07/2026",
  },
  {
    project: "PUCALLPA",
    owner: "Estado peruano",
    code: "PM1G-AERPUCALLPA-PU-119",
    registry: "PARTIDA ELECTRÓNICA 11270311",
    status: "ADQUIRIDO",
    period: "2026",
    responsible: "Ana Campos",
    updatedAt: "28/07/2026",
  },
  {
    project: "BREU",
    owner: "Estado peruano",
    code: "AERO-BREU-PU-07",
    registry: "PARTIDA ELECTRÓNICA 11226684",
    status: "EN TRÁMITE",
    period: "2026",
    responsible: "Luis Paredes",
    updatedAt: "29/07/2026",
  },
  {
    project: "BREU",
    owner: "Estado peruano",
    code: "AERO-BREU-PU-09",
    registry: "PARTIDA ELECTRÓNICA 11225940",
    status: "ADQUIRIDO",
    period: "2026",
    responsible: "Patricia Gómez",
    updatedAt: "30/07/2026",
  },
  {
    project: "CABALLOCOCHA",
    owner: "Estado peruano",
    code: "AEROCABALLOCHA-PR-015",
    registry: "Pendiente de ingreso documental",
    status: "PENDIENTE",
    period: "2026",
    responsible: "Jorge Salazar",
    updatedAt: "31/07/2026",
  },
];

function TransferenciaInterestatalPage() {
  const [project, setProject] = useState("TODOS");
  const [status, setStatus] = useState("TODOS");
  const [period, setPeriod] = useState("TODOS");
  const [query, setQuery] = useState("");

  const projects = useMemo(
    () => Array.from(new Set(properties.map((property) => property.project))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    return properties.filter(
      (property) =>
        (project === "TODOS" || property.project === project) &&
        (status === "TODOS" || property.status === status) &&
        (period === "TODOS" || property.period === period) &&
        (!normalizedQuery ||
          `${property.code} ${property.registry} ${property.owner}`
            .toLocaleLowerCase("es")
            .includes(normalizedQuery)),
    );
  }, [period, project, query, status]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        statusOrder.map((item) => [
          item,
          filtered.filter((property) => property.status === item).length,
        ]),
      ) as Record<TransferStatus, number>,
    [filtered],
  );

  const resetFilters = () => {
    setProject("TODOS");
    setStatus("TODOS");
    setPeriod("TODOS");
    setQuery("");
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-auto p-3">
        <header className="mb-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-red-600">
                Coordinadores · Predios estatales
              </div>
              <h1 className="text-lg font-bold">Transferencias interestatales</h1>
              <p className="mt-1 text-[11px] text-slate-500">
                Seguimiento consolidado con tres estados: Pendiente, En trámite y Adquirido.
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportTransfersExcel(filtered)}
              disabled={!filtered.length}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-3 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileSpreadsheet size={15} /> Exportar a Excel
            </button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-[160px_150px_180px_minmax(220px,1fr)_auto]">
            <FilterSelect
              label="Periodo"
              value={period}
              onChange={setPeriod}
              options={["2026"]}
              allLabel="Todos"
            />
            <FilterSelect
              label="Proyecto"
              value={project}
              onChange={setProject}
              options={projects}
              allLabel="Todos"
            />
            <FilterSelect
              label="Estado"
              value={status}
              onChange={setStatus}
              options={statusOrder}
              allLabel="Todos"
            />
            <label>
              <span className="mb-1 block text-[9px] font-bold uppercase text-slate-500">
                Código o partida registral
              </span>
              <span className="relative block">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar predio..."
                  className="h-9 w-full rounded-md border border-slate-300 pl-8 pr-3 text-[11px] outline-none focus:border-red-500"
                />
              </span>
            </label>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-auto inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-slate-300 px-3 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
            >
              <FilterX size={14} /> Limpiar
            </button>
          </div>
        </header>

        <section className="mb-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
          <Metric label="Total de predios" value={filtered.length} icon={<Landmark size={18} />} />
          <Metric
            label="Pendientes"
            value={counts.PENDIENTE}
            icon={<AlertCircle size={18} />}
            tone="rose"
          />
          <Metric
            label="En trámite"
            value={counts["EN TRÁMITE"]}
            icon={<Clock3 size={18} />}
            tone="amber"
          />
          <Metric
            label="Adquiridos"
            value={counts.ADQUIRIDO}
            icon={<CheckCircle2 size={18} />}
            tone="green"
          />
        </section>

        <section className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_330px]">
          <PropertiesTable rows={filtered} />
          <DashboardSide rows={filtered} counts={counts} />
        </section>
      </main>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel: string;
}) {
  return (
    <label>
      <span className="mb-1 block text-[9px] font-bold uppercase text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-[11px] outline-none focus:border-red-500"
      >
        <option value="TODOS">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function PropertiesTable({ rows }: { rows: StateProperty[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-3 py-2.5">
        <h2 className="text-[12px] font-bold">Detalle de predios estatales</h2>
        <p className="mt-0.5 text-[9px] text-slate-500">
          La tabla diferencia la situación actual de cada transferencia interestatal.
        </p>
      </div>
      <div className="max-h-[640px] overflow-auto">
        <table className="w-full min-w-[880px] border-collapse text-[10px]">
          <thead className="sticky top-0 z-10 bg-slate-900 text-left text-white">
            <tr>
              <th className="px-3 py-2.5">Proyecto</th>
              <th className="px-3 py-2.5">Propietario</th>
              <th className="px-3 py-2.5">Datos del predio</th>
              <th className="px-3 py-2.5">Partida registral / documento</th>
              <th className="px-3 py-2.5">Responsable</th>
              <th className="px-3 py-2.5 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((property) => (
              <tr key={property.code} className="border-t border-slate-200 hover:bg-slate-50">
                <td className="px-3 py-2 font-bold text-slate-700">{property.project}</td>
                <td className="px-3 py-2">{property.owner}</td>
                <td className="px-3 py-2 font-semibold">{property.code}</td>
                <td className="px-3 py-2 text-slate-600">{property.registry}</td>
                <td className="px-3 py-2 text-slate-600">{property.responsible}</td>
                <td className="px-3 py-2 text-center">
                  <StatusBadge status={property.status} />
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center text-slate-500">
                  No existen predios para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
          {!!rows.length && (
            <tfoot className="sticky bottom-0 bg-white font-bold shadow-[0_-1px_0_#cbd5e1]">
              <tr>
                <td colSpan={5} className="px-3 py-2.5">
                  Total de predios filtrados
                </td>
                <td className="px-3 py-2.5 text-center">{rows.length}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TransferStatus }) {
  const styles: Record<TransferStatus, string> = {
    PENDIENTE: "border-rose-200 bg-rose-50 text-rose-700",
    "EN TRÁMITE": "border-amber-200 bg-amber-50 text-amber-700",
    ADQUIRIDO: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
  return (
    <span
      className={`inline-flex min-w-24 justify-center rounded-full border px-2 py-1 text-[8px] font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function DashboardSide({
  rows,
  counts,
}: {
  rows: StateProperty[];
  counts: Record<TransferStatus, number>;
}) {
  const projects = useMemo(() => {
    const grouped = new Map<string, Record<TransferStatus, number>>();
    rows.forEach((property) => {
      const current = grouped.get(property.project) ?? {
        PENDIENTE: 0,
        "EN TRÁMITE": 0,
        ADQUIRIDO: 0,
      };
      current[property.status] += 1;
      grouped.set(property.project, current);
    });
    return Array.from(grouped.entries()).sort(
      ([, first], [, second]) =>
        Object.values(second).reduce((sum, value) => sum + value, 0) -
        Object.values(first).reduce((sum, value) => sum + value, 0),
    );
  }, [rows]);

  return (
    <aside className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-[12px] font-bold">Estado de las transferencias</h2>
        <p className="mt-0.5 text-[9px] text-slate-500">Distribución del universo filtrado.</p>
        <div className="mt-4 grid grid-cols-[145px_1fr] items-center gap-3">
          <Donut counts={counts} total={rows.length} />
          <div className="space-y-2.5">
            {statusOrder.map((status) => (
              <div key={status} className="flex items-center justify-between gap-2 text-[9px]">
                <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                  <span className={`size-2.5 rounded-full ${statusDot(status)}`} /> {status}
                </span>
                <strong>{counts[status]}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-[12px] font-bold">Predios por proyecto</h2>
        <p className="mt-0.5 text-[9px] text-slate-500">Comparación por estado de transferencia.</p>
        <div className="mt-3 flex flex-wrap gap-3 text-[8px] font-semibold text-slate-500">
          {statusOrder.map((status) => (
            <span key={status} className="flex items-center gap-1">
              <span className={`size-2 rounded-sm ${statusDot(status)}`} /> {status}
            </span>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {projects.map(([name, projectCounts]) => (
            <ProjectBar key={name} name={name} counts={projectCounts} />
          ))}
          {!projects.length && (
            <div className="py-10 text-center text-[10px] text-slate-400">Sin información</div>
          )}
        </div>
      </div>
    </aside>
  );
}

function Donut({ counts, total }: { counts: Record<TransferStatus, number>; total: number }) {
  const acquiredEnd = total ? (counts.ADQUIRIDO / total) * 100 : 0;
  const processEnd = total ? acquiredEnd + (counts["EN TRÁMITE"] / total) * 100 : 0;
  const background = total
    ? `conic-gradient(#10b981 0 ${acquiredEnd}%, #f59e0b ${acquiredEnd}% ${processEnd}%, #f43f5e ${processEnd}% 100%)`
    : "#e2e8f0";

  return (
    <div className="relative mx-auto size-32 rounded-full" style={{ background }}>
      <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white">
        <strong className="text-2xl tabular-nums">{total}</strong>
        <span className="text-[8px] text-slate-400">Predios</span>
      </div>
    </div>
  );
}

function ProjectBar({ name, counts }: { name: string; counts: Record<TransferStatus, number> }) {
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return (
    <div className="grid grid-cols-[78px_1fr_22px] items-center gap-2 text-[9px]">
      <span className="truncate text-right font-semibold text-slate-600" title={name}>
        {name}
      </span>
      <div className="flex h-4 overflow-hidden rounded bg-slate-100">
        <div
          className="bg-rose-500"
          style={{ width: `${(counts.PENDIENTE / total) * 100}%` }}
          title={`${counts.PENDIENTE} pendientes`}
        />
        <div
          className="bg-amber-500"
          style={{ width: `${(counts["EN TRÁMITE"] / total) * 100}%` }}
          title={`${counts["EN TRÁMITE"]} en trámite`}
        />
        <div
          className="bg-emerald-500"
          style={{ width: `${(counts.ADQUIRIDO / total) * 100}%` }}
          title={`${counts.ADQUIRIDO} adquiridos`}
        />
      </div>
      <strong className="tabular-nums">{total}</strong>
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
  tone = "slate",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: "slate" | "rose" | "amber" | "green";
}) {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-600",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
  return (
    <div className={`rounded-lg border p-3 shadow-sm ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function statusDot(status: TransferStatus) {
  if (status === "ADQUIRIDO") return "bg-emerald-500";
  if (status === "EN TRÁMITE") return "bg-amber-500";
  return "bg-rose-500";
}

async function exportTransfersExcel(rows: StateProperty[]) {
  const summaryHeaders = ["Estado", "Cantidad", "% del total"];
  const summaryData: SheetData = [excelHeader(summaryHeaders)];
  statusOrder.forEach((status) => {
    const count = rows.filter((property) => property.status === status).length;
    summaryData.push([
      { value: status, type: String },
      { value: count, type: Number },
      { value: rows.length ? count / rows.length : 0, type: Number, format: "0.00%" },
    ]);
  });

  const detailHeaders = [
    "Periodo",
    "Proyecto",
    "Propietario",
    "Datos del predio",
    "Partida registral / documento",
    "Estado",
    "Responsable",
    "Última actualización",
  ];
  const detailData: SheetData = [excelHeader(detailHeaders)];
  rows.forEach((property) => {
    detailData.push([
      { value: property.period, type: String },
      { value: property.project, type: String },
      { value: property.owner, type: String },
      { value: property.code, type: String },
      { value: property.registry, type: String },
      {
        value: property.status,
        type: String,
        fontWeight: "bold",
        backgroundColor:
          property.status === "ADQUIRIDO"
            ? "#D1FAE5"
            : property.status === "EN TRÁMITE"
              ? "#FEF3C7"
              : "#FFE4E6",
      },
      { value: property.responsible, type: String },
      { value: property.updatedAt, type: String },
    ]);
  });

  await writeExcelFile([
    {
      data: detailData,
      sheet: "Detalle de predios",
      stickyRowsCount: 1,
      orientation: "landscape",
      columns: detailHeaders.map((header, index) => ({
        width: [3, 4].includes(index) ? 34 : Math.min(26, Math.max(14, header.length + 2)),
      })),
    },
    {
      data: summaryData,
      sheet: "Resumen",
      stickyRowsCount: 1,
      columns: [{ width: 20 }, { width: 14 }, { width: 16 }],
    },
  ]).toFile(`transferencias_interestatales_2026_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function excelHeader(headers: string[]): SheetData[number] {
  return headers.map((header) => ({
    value: header,
    fontWeight: "bold",
    backgroundColor: "#0F172A",
    textColor: "#FFFFFF",
    align: "center",
    wrap: true,
    height: 30,
  }));
}
