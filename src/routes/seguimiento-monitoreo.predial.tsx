import { createFileRoute } from "@tanstack/react-router";
import { Calendar, ChevronDown, Filter, Gauge, ListChecks, RotateCcw, Target } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { AppSidebar } from "../components/AppSidebar";
import { ChartExplanation } from "../components/ChartExplanation";

export const Route = createFileRoute("/seguimiento-monitoreo/predial")({
  head: () => ({ meta: [{ title: "Metas y ejecución predial" }] }),
  component: MonitoreoPredialPage,
});

const RED = "#d71919";

type FilterKey = "team" | "city" | "legal" | "technical" | "period";
type PredialFilters = Record<FilterKey, string>;

const initialFilters: PredialFilters = {
  team: "Todos",
  city: "Todos",
  legal: "Todos",
  technical: "Todos",
  period: "Mayo de 2026",
};

const filterDefinitions: Array<{ key: FilterKey; label: string; options: string[] }> = [
  { key: "team", label: "Equipo responsable", options: ["Todos", "G01", "G02", "G03"] },
  {
    key: "city",
    label: "Proyecto o ciudad",
    options: ["Todos", "Jauja", "Piura", "Tacna"],
  },
  {
    key: "legal",
    label: "Responsable legal",
    options: [
      "Todos",
      "Katherine Silva",
      "Evelyn Phillips",
      "Joana Elias",
      "Juan Carlos Evangelista",
    ],
  },
  {
    key: "technical",
    label: "Responsable técnico",
    options: ["Todos", "Raúl Cárdenas", "Carola Gómez", "Jorge Huamán", "Milton Solórzano"],
  },
  {
    key: "period",
    label: "Periodo de análisis",
    options: ["Todos los periodos", "Abril de 2026", "Mayo de 2026", "Junio de 2026"],
  },
];

const teamProfiles = {
  G01: {
    city: "Jauja",
    periods: ["Abril de 2026", "Mayo de 2026"],
    legal: ["Katherine Silva", "Evelyn Phillips"],
    technical: ["Raúl Cárdenas", "Carola Gómez"],
  },
  G02: {
    city: "Piura",
    periods: ["Mayo de 2026", "Junio de 2026"],
    legal: ["Joana Elias", "Juan Carlos Evangelista"],
    technical: ["Jorge Huamán", "Milton Solórzano"],
  },
  G03: { city: "Tacna", periods: ["Mayo de 2026"], legal: [], technical: [] },
} as const;

const metas = [
  {
    title: "Meta presupuestal aprobada",
    amount: "S/ 6.126.229,31",
    percent: 105,
    advance: "S/ 6.410.614",
    diff: "S/ 284.384",
    tone: "green",
  },
  {
    title: "Meta de gestión del sector",
    amount: "S/ 13.000.000,00",
    percent: 49,
    advance: "S/ 6.410.614",
    diff: "- S/ 6.589.386",
    tone: "red",
  },
  {
    title: "Monto planificado",
    amount: "S/ 15.526.277,23",
    percent: 41,
    advance: "S/ 6.410.614",
    diff: "- S/ 9.115.664",
    tone: "red",
  },
  {
    title: "Monto en trámite",
    amount: "S/ 9.767.652,07",
    percent: 66,
    advance: "S/ 6.410.614",
    diff: "- S/ 3.357.038",
    tone: "red",
  },
];

const brigadas = [
  ["G01", "15", "S/ 4.099.601,00", "S/ 4.087.318,00", "100%"],
  ["G02", "18", "S/ 1.900.000,00", "S/ 1.190.795,00", "63%"],
  ["G03", "0", "S/ 126.628,00", "S/ 0,00", "0%"],
];

const ejecucion = [
  ["G01", "S/ 4.099.601", "S/ 5.908.932", "- S/ 1.809.331", "S/ 5.218.915", "S/ 689.113", "127%"],
  ["G02", "S/ 1.900.000", "S/ 3.858.720", "S/ 1.958.720", "S/ 1.190.795", "S/ 2.667.925", "63%"],
  ["G03", "S/ 126.628", "S/ 0", "- S/ 126.628", "S/ 0", "S/ 126.628", "0%"],
];

const responsables = [
  ["KATHERINE SILVA", "S/ 5.460.448,00", "3"],
  ["EVELYN PHILLIPS", "S/ 0,00", "1"],
  ["JOANA ELIAS", "S/ 525.472,00", "1"],
  ["JUAN CARLOS EVANGELISTA", "S/ 702.122,00", "1"],
];

const tecnicos = [
  ["RAUL CARDENAS", "S/ 409.536,00", "3"],
  ["CAROLA GOMEZ", "S/ 0,00", "1"],
  ["JORGE HUAMAN", "S/ 4.708.185,00", "1"],
  ["MILTON SOLORZANO", "S/ 218.123,00", "1"],
];

const programacion = [
  ["G01", "11", "9", "2", "82%"],
  ["G02", "25", "12", "13", "48%"],
  ["G03", "0", "0", "0", "0%"],
];

const tramitologia = [
  ["EXPROPIACION", "15", "9", "6", "60%"],
  ["TRATO DIRECTO", "12", "8", "4", "67%"],
  ["TRANSFERENCIA INTERESTATAL", "9", "4", "5", "44%"],
];

function MonitoreoPredialPage() {
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);
  const [showDetails, setShowDetails] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const visibleTeams = useMemo(
    () =>
      (Object.keys(teamProfiles) as Array<keyof typeof teamProfiles>).filter((team) => {
        const profile = teamProfiles[team];
        return (
          (selectedFilters.team === "Todos" || selectedFilters.team === team) &&
          (selectedFilters.city === "Todos" || selectedFilters.city === profile.city) &&
          (selectedFilters.period === "Todos los periodos" ||
            profile.periods.some((period) => period === selectedFilters.period)) &&
          (selectedFilters.legal === "Todos" ||
            profile.legal.some((name) => name === selectedFilters.legal)) &&
          (selectedFilters.technical === "Todos" ||
            profile.technical.some((name) => name === selectedFilters.technical))
        );
      }),
    [selectedFilters],
  );

  const filteredBrigadas = brigadas.filter((row) => visibleTeams.some((team) => team === row[0]));
  const filteredEjecucion = ejecucion.filter((row) => visibleTeams.some((team) => team === row[0]));
  const filteredProgramacion = programacion.filter((row) =>
    visibleTeams.some((team) => team === row[0]),
  );
  const filteredResponsables = responsables.filter((row) =>
    visibleTeams.some((team) =>
      teamProfiles[team].legal.some((name) => normalizeName(name) === normalizeName(row[0])),
    ),
  );
  const filteredTecnicos = tecnicos.filter((row) =>
    visibleTeams.some((team) =>
      teamProfiles[team].technical.some((name) => normalizeName(name) === normalizeName(row[0])),
    ),
  );
  const totals = buildDashboardTotals(filteredBrigadas, filteredEjecucion, filteredProgramacion);
  const activeFilterCount = Object.entries(selectedFilters).filter(
    ([key, value]) => key !== "period" && value !== "Todos",
  ).length;

  const updateFilter = (key: FilterKey, value: string) => {
    setSelectedFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => setSelectedFilters(initialFilters);

  const openProgress = () => {
    progressRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleDetails = () => {
    const opening = !showDetails;
    setShowDetails(opening);
    if (opening) {
      window.setTimeout(
        () => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        50,
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#edf0f3]">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-auto p-2">
        <div className="min-h-[calc(100vh-16px)]">
          <section className="min-w-0">
            <PageHeader />
            <TopBar
              values={selectedFilters}
              activeFilterCount={activeFilterCount}
              showDetails={showDetails}
              onChange={updateFilter}
              onReset={resetFilters}
              onViewProgress={openProgress}
              onToggleDetails={toggleDetails}
            />
            {activeFilterCount > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-[10px] text-blue-800">
                <b>Filtros aplicados:</b>
                {filterDefinitions
                  .filter(({ key }) => key !== "period" && selectedFilters[key] !== "Todos")
                  .map(({ key, label }) => (
                    <span key={key} className="rounded-full bg-white px-2 py-1 shadow-sm">
                      {label}: {selectedFilters[key]}
                    </span>
                  ))}
                <button onClick={resetFilters} className="ml-auto font-semibold underline">
                  Restablecer
                </button>
              </div>
            )}
            <div className="mt-2 grid grid-cols-12 gap-2">
              <KpiBlock
                title="Plan anual inicial"
                lines={[
                  totals.programmedPredios,
                  "Predios previstos",
                  totals.programmedAmount,
                  "Monto previsto",
                ]}
                className="col-span-3"
              />
              <KpiBlock
                title="Meta vigente"
                lines={[
                  totals.executedPredios,
                  "Predios ejecutados",
                  totals.devengado,
                  "Monto devengado",
                ]}
                className="col-span-3"
              />
              <KpiBlock
                title="Predios con aprobación"
                lines={[
                  totals.previousApproved,
                  "Aprobados el mes anterior",
                  totals.executedPredios,
                  "Meta del mes",
                  totals.executedPredios,
                  "Aprobados este mes",
                  totals.pendingPredios,
                  "Pendientes para la meta",
                ]}
                className="col-span-2"
              />
              <AmountCard
                title="Monto aprobado para adquisición"
                value={totals.approvedAmount}
                className="col-span-2"
              />
              <AmountCard title="Monto devengado" value={totals.devengado} className="col-span-2" />
            </div>

            {visibleTeams.length > 0 && (
              <div ref={progressRef} className="scroll-mt-3 mt-2">
                <div className="mb-2 flex items-end justify-between gap-3 px-1">
                  <div>
                    <h2 className="text-[13px] font-semibold text-slate-800">
                      Cumplimiento de metas monetarias
                    </h2>
                    <p className="text-[10px] text-slate-500">
                      El porcentaje compara el monto devengado con cada referencia institucional.
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400">
                    Periodo: {selectedFilters.period}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {metas.map((meta) => (
                    <MetaCard key={meta.title} {...meta} />
                  ))}
                </div>
              </div>
            )}

            {visibleTeams.length === 0 && (
              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-[11px] text-amber-800">
                No existen datos para la combinación seleccionada. Restablezca los filtros o elija
                otro equipo responsable.
              </div>
            )}

            {showDetails && visibleTeams.length > 0 && (
              <div ref={detailRef} className="scroll-mt-3 mt-2 grid grid-cols-12 gap-2">
                <DataCard title="Predios asignados por equipo" className="col-span-4">
                  <MiniTable
                    head={["Equipo", "Predios", "Monto programado", "Monto devengado", "% Avance"]}
                    rows={filteredBrigadas}
                    total={buildBrigadaTotal(filteredBrigadas)}
                  />
                </DataCard>
                <DataCard title="Ejecución presupuestal por equipo" className="col-span-5">
                  <MiniTable
                    head={[
                      "Equipo",
                      "Monto planificado",
                      "Monto tramitado",
                      "Diferencia",
                      "Devengado",
                      "Por devengar",
                      "% Avance",
                    ]}
                    rows={filteredEjecucion}
                    total={buildExecutionTotal(filteredEjecucion)}
                  />
                </DataCard>
                <DataCard title="Carga del responsable legal" className="col-span-3">
                  <MiniTable
                    head={["Responsable legal", "Monto devengado", "Predios aprobados"]}
                    rows={filteredResponsables}
                    total={buildResponsibleTotal(filteredResponsables)}
                  />
                </DataCard>
                <DataCard title="Carga del responsable técnico" className="col-span-4">
                  <MiniTable
                    head={["Responsable técnico", "Monto devengado", "Predios aprobados"]}
                    rows={filteredTecnicos}
                    total={buildResponsibleTotal(filteredTecnicos)}
                  />
                </DataCard>
                <DataCard title="Programación anual" className="col-span-4">
                  <MiniTable
                    head={["Equipo", "Programado", "Ejecutado", "Pendiente", "% Avance"]}
                    rows={filteredProgramacion}
                    total={buildProgrammingTotal(filteredProgramacion)}
                  />
                </DataCard>
                <DataCard title="Programación por etapa" className="col-span-4">
                  <MiniTable
                    head={["Procedimiento", "Programado", "Ejecutado", "Pendiente", "% Avance"]}
                    rows={tramitologia}
                    total={["Total", "36", "21", "15", "58%"]}
                  />
                </DataCard>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function PageHeader() {
  return (
    <header className="mb-2 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#d71919]">
          <Target size={18} />
        </span>
        <div>
          <h1 className="text-[19px] font-semibold text-slate-900">Metas y ejecución predial</h1>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Compara los predios y montos programados con lo aprobado y devengado por cada equipo
            responsable.
          </p>
          <ChartExplanation>
            Revise primero la meta vigente, luego el monto devengado y finalmente los equipos o
            procedimientos que mantienen saldo pendiente.
          </ChartExplanation>
        </div>
      </div>
    </header>
  );
}

function TopBar({
  values,
  activeFilterCount,
  showDetails,
  onChange,
  onReset,
  onViewProgress,
  onToggleDetails,
}: {
  values: PredialFilters;
  activeFilterCount: number;
  showDetails: boolean;
  onChange: (key: FilterKey, value: string) => void;
  onReset: () => void;
  onViewProgress: () => void;
  onToggleDetails: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2">
      <div className="grid grid-cols-5 gap-2">
        {filterDefinitions.map(({ key, label, options }) => (
          <label key={label} className="rounded-md border bg-white px-2 py-1 shadow-sm">
            <span className="mb-1 flex items-center gap-1 text-[10px] text-gray-500">
              <Filter size={10} /> {label}
            </span>
            <span className="relative block">
              <select
                value={values[key]}
                onChange={(event) => onChange(key, event.target.value)}
                className="h-6 w-full appearance-none bg-transparent pr-5 text-[11px] font-medium text-gray-700 outline-none"
              >
                {options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
              />
            </span>
          </label>
        ))}
      </div>
      <div className="grid grid-cols-[150px_90px_126px_42px] gap-2">
        <div className="rounded-md border bg-white px-2 py-1 shadow-sm">
          <span className="mb-1 flex items-center gap-1 text-[10px] text-gray-500">
            <Calendar size={10} /> Última actualización
          </span>
          <div className="text-[11px] font-semibold text-gray-800">08 jun 2026 · 15:18</div>
        </div>
        <button
          onClick={onViewProgress}
          className="rounded-md bg-[#d71919] text-[10px] font-bold text-white shadow-sm hover:bg-red-700"
        >
          Ver avance
        </button>
        <button
          onClick={onToggleDetails}
          aria-expanded={showDetails}
          className="rounded-md bg-white text-[10px] font-bold text-gray-700 shadow-sm hover:bg-slate-50"
        >
          {showDetails ? "Ocultar detalle" : "Ver detalle de datos"}
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center rounded-md bg-white text-gray-500 shadow-sm"
          title={
            activeFilterCount > 0
              ? `Restablecer ${activeFilterCount} filtros`
              : "Sin filtros activos"
          }
          aria-label="Restablecer filtros"
        >
          <RotateCcw size={17} />
        </button>
      </div>
    </div>
  );
}

function KpiBlock({
  title,
  lines,
  className = "",
}: {
  title: string;
  lines: string[];
  className?: string;
}) {
  return (
    <div className={`rounded-md bg-white p-3 shadow-sm ${className}`}>
      <div className="mb-2 text-[11px] font-semibold text-gray-700">{title}</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        {lines.map((line, index) => (
          <div
            key={`${line}-${index}`}
            className={index % 2 === 0 ? "font-semibold text-gray-900" : "text-gray-500"}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function AmountCard({
  title,
  value,
  className = "",
}: {
  title: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-md bg-white p-3 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-600">
        <span className="flex size-7 items-center justify-center rounded-full bg-red-50 text-[#d71919]">
          <Gauge size={15} />
        </span>
        {title}
      </div>
      <div className="mt-2 text-[18px] font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function MetaCard({
  title,
  amount,
  percent,
  advance,
  diff,
  tone,
}: {
  title: string;
  amount: string;
  percent: number;
  advance: string;
  diff: string;
  tone: string;
}) {
  return (
    <div className="rounded-md bg-white p-3 shadow-sm">
      <div className="mb-1 flex items-center gap-2 text-[12px] font-semibold text-gray-700">
        <Target size={16} className="shrink-0 text-[#d71919]" /> {title}
      </div>
      <div className="mb-2 text-[15px] font-semibold text-gray-900">{amount}</div>
      <div className="grid grid-cols-[130px_1fr] gap-3">
        <Donut percent={percent} />
        <div className="self-center text-[11px]">
          <InfoRow label="Devengado" value={advance} />
          <InfoRow label="Saldo" value={diff} tone={tone} />
          <InfoRow label="Cumplimiento" value={`${percent}%`} tone={tone} />
        </div>
      </div>
      <div className="mt-1 text-right text-[9px] text-gray-400">
        Monto devengado respecto de esta referencia
      </div>
    </div>
  );
}

function Donut({ percent }: { percent: number }) {
  const angle = Math.min(percent, 100) * 3.6;
  return (
    <div
      className="relative size-28 rounded-full"
      style={{ background: `conic-gradient(${RED} ${angle}deg, #ececec 0deg)` }}
    >
      <div className="absolute inset-5 flex items-center justify-center rounded-full bg-white text-[16px] font-bold text-gray-900">
        {percent}%
      </div>
      <div className="absolute -bottom-1 right-4 text-[9px] text-gray-500">100%</div>
    </div>
  );
}

function InfoRow({ label, value, tone = "gray" }: { label: string; value: string; tone?: string }) {
  const color =
    tone === "green" ? "text-emerald-600" : tone === "red" ? "text-[#d71919]" : "text-gray-900";
  return (
    <div className="grid grid-cols-[86px_1fr] border-b border-gray-100 py-1">
      <span className="font-medium text-gray-600">{label}</span>
      <span className={`text-right font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function parseMoney(value: string) {
  const negative = value.includes("-");
  const numeric = Number(
    value
      .replace(/[^\d,.]/g, "")
      .replace(/\./g, "")
      .replace(",", "."),
  );
  return negative ? -numeric : numeric;
}

function formatMoney(value: number) {
  return `S/ ${new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)}`;
}

function sumColumn(rows: string[][], index: number, parser = Number) {
  return rows.reduce((total, row) => total + (parser(row[index]) || 0), 0);
}

function percent(numerator: number, denominator: number) {
  return denominator > 0 ? `${Math.round((numerator / denominator) * 100)}%` : "0%";
}

function buildDashboardTotals(
  teamRows: string[][],
  executionRows: string[][],
  programmingRows: string[][],
) {
  const programmedAmount = sumColumn(teamRows, 2, parseMoney);
  const devengado = sumColumn(teamRows, 3, parseMoney);
  const approvedAmount = sumColumn(executionRows, 2, parseMoney);
  const programmedPredios = sumColumn(programmingRows, 1);
  const executedPredios = sumColumn(programmingRows, 2);
  const pendingPredios = sumColumn(programmingRows, 3);

  return {
    programmedAmount: formatMoney(programmedAmount),
    devengado: formatMoney(devengado),
    approvedAmount: formatMoney(approvedAmount),
    programmedPredios: String(programmedPredios),
    executedPredios: String(executedPredios),
    pendingPredios: String(pendingPredios),
    previousApproved: String(Math.max(executedPredios - 1, 0)),
  };
}

function buildBrigadaTotal(rows: string[][]) {
  const predios = sumColumn(rows, 1);
  const programmed = sumColumn(rows, 2, parseMoney);
  const devengado = sumColumn(rows, 3, parseMoney);
  return [
    "Total",
    String(predios),
    formatMoney(programmed),
    formatMoney(devengado),
    percent(devengado, programmed),
  ];
}

function buildExecutionTotal(rows: string[][]) {
  const planned = sumColumn(rows, 1, parseMoney);
  const processed = sumColumn(rows, 2, parseMoney);
  const devengado = sumColumn(rows, 4, parseMoney);
  return [
    "Total",
    formatMoney(planned),
    formatMoney(processed),
    formatMoney(processed - planned),
    formatMoney(devengado),
    formatMoney(Math.max(processed - devengado, 0)),
    percent(devengado, planned),
  ];
}

function buildResponsibleTotal(rows: string[][]) {
  return ["Total", formatMoney(sumColumn(rows, 1, parseMoney)), String(sumColumn(rows, 2))];
}

function buildProgrammingTotal(rows: string[][]) {
  const programmed = sumColumn(rows, 1);
  const executed = sumColumn(rows, 2);
  const pending = sumColumn(rows, 3);
  return [
    "Total",
    String(programmed),
    String(executed),
    String(pending),
    percent(executed, programmed),
  ];
}

const dataCardExplanations: Record<string, string> = {
  "Predios asignados por equipo":
    "Compara la meta, los predios atendidos y el saldo pendiente de cada equipo de trabajo.",
  "Ejecución presupuestal por equipo":
    "Compara lo programado con lo devengado y muestra la diferencia que todavía debe ejecutarse.",
  "Carga del responsable legal":
    "Muestra cuántos predios tiene asignados cada especialista legal y cuánto ha avanzado.",
  "Carga del responsable técnico":
    "Muestra cuántos predios tiene asignados cada especialista técnico y cuánto ha avanzado.",
  "Programación anual":
    "Resume la cantidad prevista, ejecutada y pendiente dentro de la programación del año.",
  "Programación por etapa":
    "Distribuye la carga operativa por etapa para identificar dónde se acumulan los pendientes.",
};

function DataCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-md bg-white p-3 shadow-sm ${className}`}>
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-gray-700">
        <ListChecks size={13} className="text-[#d71919]" /> {title}
      </div>
      {dataCardExplanations[title] && (
        <div className="mb-2">
          <ChartExplanation>{dataCardExplanations[title]}</ChartExplanation>
        </div>
      )}
      {children}
    </div>
  );
}

function MiniTable({ head, rows, total }: { head: string[]; rows: string[][]; total: string[] }) {
  return (
    <table className="w-full text-[9.5px]">
      <thead className="text-left text-gray-500">
        <tr>
          {head.map((item) => (
            <th key={item} className="border-b py-1 font-semibold">
              {item}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={`${row[0]}-${index}`} className="border-b border-gray-100">
            {row.map((cell, cellIndex) => (
              <td
                key={`${cell}-${cellIndex}`}
                className={`py-1 ${cellIndex > 0 ? "text-right" : ""}`}
              >
                <TableValue value={cell} />
              </td>
            ))}
          </tr>
        ))}
        <tr className="font-bold text-gray-900">
          {total.map((cell, index) => (
            <td key={`${cell}-${index}`} className={`pt-1 ${index > 0 ? "text-right" : ""}`}>
              <TableValue value={cell} />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function TableValue({ value }: { value: string }) {
  const red = value.trim().startsWith("-");
  const green = value.includes("105%") || value.includes("S/ 3.641");
  return <span className={red ? "text-[#d71919]" : green ? "text-emerald-600" : ""}>{value}</span>;
}
