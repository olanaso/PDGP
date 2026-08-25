import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarRange } from "lucide-react";

import {
  ACQUISITION_MILESTONES_STORAGE_KEY,
  DEFAULT_CONFIGS,
  type Milestone,
  type ProcessConfig,
  type ProcessType,
} from "@/components/AcquisitionMilestonesConfig";
import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo, type PredioRow } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/monitoreo")({
  head: () => ({
    meta: [
      { title: "Monitoreo" },
      {
        name: "description",
        content:
          "Estado actual, porcentaje de avance, pendientes, alertas y observaciones del proceso predial.",
      },
    ],
  }),
  component: MonitoreoPredialPage,
});

type MilestoneProgress = "PENDIENTE" | "EN PROCESO" | "CUMPLIDO";
type MilestoneProgressMap = Record<string, MilestoneProgress>;
type ScheduleStatus =
  "CUMPLIDO" | "EN PROCESO" | "PENDIENTE" | "PREVENTIVO" | "CRÍTICO" | "VENCIDO";

type GanttRow = {
  milestone: Milestone;
  startDate: string;
  endDate: string;
  startOffset: number;
  duration: number;
  progress: number;
  trackingState: MilestoneProgress;
  scheduleStatus: ScheduleStatus;
  accumulatedWeight: number;
};

type StoredGanttState = {
  processId?: ProcessType;
  startDate?: string;
  progress?: MilestoneProgressMap;
};

function MonitoreoPredialPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;
  const todayIso = today();
  const suggestedProcessId = useMemo(() => resolveProcessType(predio), [predio]);
  const ganttStorageKey = `predio-gantt:${projectId}:${decodedCodigo}`;
  const [configs, setConfigs] = useState<ProcessConfig[]>(cloneAcquisitionConfigs);
  const [processId, setProcessId] = useState<ProcessType>(suggestedProcessId);
  const [ganttStartDate, setGanttStartDate] = useState(() => inferScheduleStart(predio));
  const [milestoneProgress, setMilestoneProgress] = useState<MilestoneProgressMap>({});
  const [ganttLoaded, setGanttLoaded] = useState(false);
  const activeProcess = configs.find((process) => process.id === processId) ?? configs[0];
  const ganttRows = useMemo(
    () =>
      buildGanttRows(activeProcess?.milestones ?? [], ganttStartDate, milestoneProgress, todayIso),
    [activeProcess?.milestones, ganttStartDate, milestoneProgress, todayIso],
  );
  const progress = Math.round(
    ganttRows.reduce((sum, row) => sum + row.milestone.weight * (row.progress / 100), 0),
  );
  const completedCount = ganttRows.filter((row) => row.trackingState === "CUMPLIDO").length;

  useEffect(() => {
    const configuredProcesses = readAcquisitionMilestoneConfigs();
    setConfigs(configuredProcesses);
    try {
      const stored = window.localStorage.getItem(ganttStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredGanttState;
        const storedProcess = configuredProcesses.some((item) => item.id === parsed.processId)
          ? parsed.processId
          : suggestedProcessId;
        const selectedProcess =
          configuredProcesses.find((item) => item.id === storedProcess) ?? configuredProcesses[0];
        setProcessId(storedProcess ?? suggestedProcessId);
        setGanttStartDate(parsed.startDate || inferScheduleStart(predio));
        setMilestoneProgress(
          parsed.progress ??
            buildInitialMilestoneProgress(selectedProcess?.milestones ?? [], predio),
        );
      } else {
        const selectedProcess =
          configuredProcesses.find((item) => item.id === suggestedProcessId) ??
          configuredProcesses[0];
        setMilestoneProgress(
          buildInitialMilestoneProgress(selectedProcess?.milestones ?? [], predio),
        );
      }
    } catch {
      const selectedProcess =
        configuredProcesses.find((item) => item.id === suggestedProcessId) ??
        configuredProcesses[0];
      setMilestoneProgress(
        buildInitialMilestoneProgress(selectedProcess?.milestones ?? [], predio),
      );
    } finally {
      setGanttLoaded(true);
    }
  }, [ganttStorageKey, predio, suggestedProcessId]);

  useEffect(() => {
    if (!ganttLoaded) return;
    const payload: StoredGanttState = {
      processId,
      startDate: ganttStartDate,
      progress: milestoneProgress,
    };
    window.localStorage.setItem(ganttStorageKey, JSON.stringify(payload));
  }, [ganttLoaded, ganttStartDate, ganttStorageKey, milestoneProgress, processId]);

  function handleProcessChange(nextProcessId: ProcessType) {
    setProcessId(nextProcessId);
    const nextProcess = configs.find((item) => item.id === nextProcessId);
    setMilestoneProgress(buildInitialMilestoneProgress(nextProcess?.milestones ?? [], predio));
  }

  function updateMilestoneProgress(id: string, value: MilestoneProgress) {
    setMilestoneProgress((current) => ({ ...current, [id]: value }));
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Monitoreo"
        badgeLabel="Avance"
        badgeValue={`${completedCount}/${ganttRows.length}`}
        badgeSuffix={`${progress}%`}
      />

      <main className="mx-auto max-w-[1500px] p-3">
        <div className="rounded border bg-white p-3">
          <div className="mb-2 border-b border-gray-200 pb-1">
            <h2 className="text-[12px] font-semibold text-red-600">
              Diagrama Gantt del seguimiento individual
            </h2>
          </div>
          <PredioGantt
            configs={configs}
            activeProcess={activeProcess}
            processId={processId}
            startDate={ganttStartDate}
            rows={ganttRows}
            progress={progress}
            todayIso={todayIso}
            onProcessChange={handleProcessChange}
            onStartDateChange={setGanttStartDate}
            onProgressChange={updateMilestoneProgress}
          />
        </div>
      </main>
    </div>
  );
}

function PredioGantt({
  configs,
  activeProcess,
  processId,
  startDate,
  rows,
  progress,
  todayIso,
  onProcessChange,
  onStartDateChange,
  onProgressChange,
}: {
  configs: ProcessConfig[];
  activeProcess: ProcessConfig | undefined;
  processId: ProcessType;
  startDate: string;
  rows: GanttRow[];
  progress: number;
  todayIso: string;
  onProcessChange: (value: ProcessType) => void;
  onStartDateChange: (value: string) => void;
  onProgressChange: (id: string, value: MilestoneProgress) => void;
}) {
  const totalDays = rows.reduce((sum, row) => sum + row.duration, 0);
  const scheduleEnd = rows.at(-1)?.endDate ?? startDate;
  const alertCount = rows.filter((row) =>
    ["PREVENTIVO", "CRÍTICO", "VENCIDO"].includes(row.scheduleStatus),
  ).length;
  const todayOffset = differenceInDays(startDate, todayIso);
  const showToday = todayOffset >= 0 && todayOffset <= totalDays;
  const todayPosition = totalDays ? Math.min(100, (todayOffset / totalDays) * 100) : 0;
  const ticks = Array.from({ length: 7 }, (_, index) => {
    const offset = Math.round((Math.max(1, totalDays) * index) / 6);
    return { offset, label: formatDatePe(addDaysIso(startDate, offset)) };
  });

  return (
    <div className="rounded border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-2 py-1.5 text-[9px]">
        <label className="font-semibold uppercase tracking-wide text-gray-500">Proceso</label>
        <div className="min-w-[240px] flex-1">
          <select
            className="h-7 w-full rounded border border-gray-300 bg-white px-2 text-[10px] focus:border-gray-500 focus:outline-none"
            value={processId}
            onChange={(event) => onProcessChange(event.target.value as ProcessType)}
          >
            {configs.map((process) => (
              <option key={process.id} value={process.id}>
                {process.name}
              </option>
            ))}
          </select>
        </div>
        <label className="font-semibold uppercase tracking-wide text-gray-500">Inicio</label>
        <div className="w-[135px]">
          <input
            type="date"
            className="h-7 w-full rounded border border-gray-300 bg-white px-2 text-[10px] focus:border-gray-500 focus:outline-none"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
          />
        </div>
        <label className="font-semibold uppercase tracking-wide text-gray-500">Fin</label>
        <div className="w-[92px]">
          <div className="flex h-7 items-center rounded border border-gray-200 bg-gray-50 px-2 text-[10px] font-semibold text-gray-700">
            {formatDatePe(scheduleEnd)}
          </div>
        </div>
        <Link
          to="/configuracion/hitos-plazos"
          className="ml-auto inline-flex h-7 items-center gap-1 rounded border border-gray-300 px-2 text-[9px] font-semibold text-gray-600 hover:bg-gray-50"
        >
          <CalendarRange size={11} /> Plazos
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-600">
        <span className="min-w-0 truncate" title={activeProcess?.name}>
          <b className="text-gray-800">{activeProcess?.name ?? "Sin proceso"}</b>
        </span>
        <span>
          Duración: <b className="text-gray-800">{totalDays} días</b>
        </span>
        <span>
          Avance: <b className="text-red-600">{progress}%</b>
        </span>
        <span>
          Alertas: <b className={alertCount ? "text-amber-700" : "text-green-700"}>{alertCount}</b>
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1180px]">
          <div className="grid grid-cols-[310px_minmax(620px,1fr)_205px] border-b border-gray-200 bg-gray-50 text-[8px] font-semibold uppercase tracking-wide text-gray-500">
            <div className="px-2 py-1.5">Etapa / hito</div>
            <div className="relative px-2 py-1.5">
              <div className="flex justify-between">
                {ticks.map((tick) => (
                  <span key={`${tick.offset}-${tick.label}`}>{tick.label}</span>
                ))}
              </div>
            </div>
            <div className="px-2 py-1.5">Estado / avance acumulado</div>
          </div>

          {rows.map((row) => {
            const barColor = scheduleColor(row.scheduleStatus);
            const left = totalDays ? (row.startOffset / totalDays) * 100 : 0;
            const width = totalDays ? Math.max(0.8, (row.duration / totalDays) * 100) : 100;
            const milestoneNumber = "number" in row.milestone ? (row.milestone.number ?? "—") : "—";
            return (
              <div
                key={row.milestone.id}
                className="grid min-h-[38px] grid-cols-[310px_minmax(620px,1fr)_205px] items-center border-b border-gray-100 text-[9px] last:border-b-0"
              >
                <div className="min-w-0 px-2 py-1">
                  <div className="flex items-center gap-1.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-red-50 text-[8px] font-bold text-red-600">
                      {milestoneNumber}
                    </span>
                    <div className="min-w-0">
                      <div
                        className="truncate font-semibold text-gray-800"
                        title={`${row.milestone.category} · ${row.milestone.name}`}
                      >
                        {row.milestone.name}
                      </div>
                      <div className="truncate text-[8px] text-gray-400">
                        {row.milestone.responsible} · {row.duration}d · {row.milestone.weight}%
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="relative mx-2 h-6 bg-gray-50"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, transparent calc(16.666% - 1px), #e5e7eb 16.666%)",
                    backgroundSize: "16.666% 100%",
                  }}
                >
                  {showToday && (
                    <div
                      className="absolute inset-y-0 z-20 border-l border-red-500"
                      style={{ left: `${todayPosition}%` }}
                      title={`Fecha actual: ${formatDatePe(todayIso)}`}
                    />
                  )}
                  <div
                    className="absolute top-1 h-4 overflow-hidden rounded-sm border"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      borderColor: barColor,
                      backgroundColor: `${barColor}22`,
                    }}
                    title={`${row.milestone.name}: ${formatDatePe(row.startDate)} al ${formatDatePe(row.endDate)}`}
                  >
                    <div
                      className="h-full opacity-90"
                      style={{ width: `${row.progress}%`, backgroundColor: barColor }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap px-1 text-[7px] font-bold text-gray-800">
                      {formatDatePe(row.startDate)} – {formatDatePe(row.endDate)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2 py-1">
                  <div className="shrink-0">
                    <SchedulePill status={row.scheduleStatus} />
                  </div>
                  <select
                    className="h-6 min-w-0 flex-1 rounded border border-gray-300 bg-white px-1 text-[9px] focus:border-gray-500 focus:outline-none"
                    value={row.trackingState}
                    onChange={(event) =>
                      onProgressChange(row.milestone.id, event.target.value as MilestoneProgress)
                    }
                  >
                    <option value="PENDIENTE">Pendiente 0%</option>
                    <option value="EN PROCESO">En proceso 50%</option>
                    <option value="CUMPLIDO">Cumplido 100%</option>
                  </select>
                  <span className="w-8 shrink-0 text-right text-[8px] font-bold text-gray-700">
                    {row.accumulatedWeight}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1 border-t border-gray-200 bg-gray-50 px-2 py-1 text-[8px] text-gray-500">
        <div className="flex flex-wrap gap-2">
          <Legend color="#16a34a" label="Cumplido" />
          <Legend color="#2563eb" label="En proceso" />
          <Legend color="#d97706" label="Alerta preventiva" />
          <Legend color="#dc2626" label="Crítico o vencido" />
          <Legend color="#9ca3af" label="Pendiente" />
        </div>
        <span>Línea roja: fecha actual · plazos en días calendario.</span>
      </div>
    </div>
  );
}

function SchedulePill({ status }: { status: ScheduleStatus }) {
  const cls = {
    CUMPLIDO: "bg-green-50 text-green-700",
    "EN PROCESO": "bg-blue-50 text-blue-700",
    PENDIENTE: "bg-gray-100 text-gray-600",
    PREVENTIVO: "bg-amber-50 text-amber-700",
    CRÍTICO: "bg-red-50 text-red-700",
    VENCIDO: "bg-red-100 text-red-800",
  }[status];
  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 text-[8px] font-bold ${cls}`}>
      {status}
    </span>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="size-2 rounded-sm" style={{ backgroundColor: color }} /> {label}
    </span>
  );
}

function cloneAcquisitionConfigs() {
  return DEFAULT_CONFIGS.map((process) => ({
    ...process,
    milestones: process.milestones.map((milestone) => ({ ...milestone })),
  }));
}

function readAcquisitionMilestoneConfigs() {
  const defaults = cloneAcquisitionConfigs();
  if (typeof window === "undefined") return defaults;
  const stored = window.localStorage.getItem(ACQUISITION_MILESTONES_STORAGE_KEY);
  if (!stored) return defaults;
  try {
    const parsed = JSON.parse(stored) as ProcessConfig[];
    if (!Array.isArray(parsed) || parsed.length !== 4) return defaults;
    const defaultDirectAcquisition = defaults.find((item) => item.id === "trato-directo");
    return parsed.map((process) => {
      const usesPreviousDefaults =
        process.id === "trato-directo" &&
        process.milestones.length === 12 &&
        process.milestones.every((milestone, index) => milestone.id === `td-${index + 1}`);
      return usesPreviousDefaults && defaultDirectAcquisition
        ? {
            ...process,
            milestones: defaultDirectAcquisition.milestones.map((milestone) => ({ ...milestone })),
          }
        : {
            ...process,
            milestones: process.milestones.map((milestone) => ({ ...milestone })),
          };
    });
  } catch {
    return defaults;
  }
}

function resolveProcessType(predio: PredioRow | null): ProcessType {
  const context = `${predio?.mod || ""} ${predio?.condicionPredio || ""} ${predio?.tipo || ""}`
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (context.includes("EXPROPI")) return "expropiacion";
  if (context.includes("ESTATAL") || context.includes("INTERESTATAL") || context.includes("SBN")) {
    return "estatales";
  }
  if (context.includes("MEJORA")) return "mejoras";
  return "trato-directo";
}

function inferScheduleStart(predio: PredioRow | null) {
  const resolutionDate = normalizeDate(predio?.fres);
  if (resolutionDate) return addDaysIso(resolutionDate, -107);
  const registrationDate = normalizeDate(predio?.ftit || predio?.finsc);
  if (registrationDate) return addDaysIso(registrationDate, -135);
  return today();
}

function buildInitialMilestoneProgress(
  milestones: Milestone[],
  predio: PredioRow | null,
): MilestoneProgressMap {
  const activeMilestones = milestones.filter((item) => item.active);
  let completedIndex = -1;

  function completeThrough(search: (milestone: Milestone) => boolean) {
    const index = activeMilestones.findIndex(search);
    if (index >= 0) completedIndex = Math.max(completedIndex, index);
  }

  if (hasRegisteredValue(predio?.cod || predio?.codigo)) {
    completeThrough((item) => item.name.toUpperCase().includes("CÓDIGO PREDIAL"));
  }
  if (hasRegisteredValue(predio?.valor)) {
    completeThrough((item) => item.name.toUpperCase().includes("ITT"));
  }
  if (hasRegisteredValue(predio?.nres || predio?.res)) {
    completeThrough((item) => item.name.toUpperCase().includes("EMISIÓN DE RD"));
  }
  if (hasRegisteredValue(predio?.pago)) {
    completeThrough((item) => item.name.toUpperCase().includes("DEVENGADO"));
  }
  if (hasRegisteredValue(predio?.finsc || predio?.titulo)) {
    completeThrough((item) => item.name.toUpperCase().includes("INSCRIPCIÓN REGISTRAL"));
  }
  if (hasRegisteredValue(predio?.trans || predio?.acta)) {
    completedIndex = activeMilestones.length - 1;
  }

  return Object.fromEntries(
    activeMilestones.map((milestone, index) => [
      milestone.id,
      index <= completedIndex
        ? "CUMPLIDO"
        : index === completedIndex + 1
          ? "EN PROCESO"
          : "PENDIENTE",
    ]),
  );
}

function buildGanttRows(
  milestones: Milestone[],
  startDate: string,
  progressMap: MilestoneProgressMap,
  todayIso: string,
): GanttRow[] {
  let offset = 0;
  let accumulatedWeight = 0;
  return milestones
    .filter((milestone) => milestone.active)
    .map((milestone) => {
      const duration = Math.max(1, milestone.days);
      const rowStart = addDaysIso(startDate, offset);
      const rowEnd = addDaysIso(rowStart, duration - 1);
      const trackingState = progressMap[milestone.id] ?? "PENDIENTE";
      const progress = trackingState === "CUMPLIDO" ? 100 : trackingState === "EN PROCESO" ? 50 : 0;
      accumulatedWeight += milestone.weight;
      const scheduleStatus = calculateScheduleStatus(
        milestone,
        trackingState,
        rowStart,
        rowEnd,
        todayIso,
      );
      const row: GanttRow = {
        milestone,
        startDate: rowStart,
        endDate: rowEnd,
        startOffset: offset,
        duration,
        progress,
        trackingState,
        scheduleStatus,
        accumulatedWeight,
      };
      offset += duration;
      return row;
    });
}

function calculateScheduleStatus(
  milestone: Milestone,
  trackingState: MilestoneProgress,
  startDate: string,
  endDate: string,
  todayIso: string,
): ScheduleStatus {
  if (trackingState === "CUMPLIDO") return "CUMPLIDO";
  if (todayIso > endDate) return "VENCIDO";
  const criticalDate = addDaysIso(startDate, Math.max(0, milestone.criticalDay - 1));
  const warningDate = addDaysIso(startDate, Math.max(0, milestone.warningDay - 1));
  if (todayIso >= criticalDate) return "CRÍTICO";
  if (todayIso >= warningDate) return "PREVENTIVO";
  if (trackingState === "EN PROCESO") return "EN PROCESO";
  return "PENDIENTE";
}

function scheduleColor(status: ScheduleStatus) {
  if (status === "CUMPLIDO") return "#16a34a";
  if (status === "EN PROCESO") return "#2563eb";
  if (status === "PREVENTIVO") return "#d97706";
  if (status === "CRÍTICO" || status === "VENCIDO") return "#dc2626";
  return "#9ca3af";
}

function addDaysIso(value: string, days: number) {
  const normalized = normalizeDate(value) || today();
  const [year, month, day] = normalized.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function differenceInDays(from: string, to: string) {
  const start = Date.parse(`${normalizeDate(from) || from}T00:00:00Z`);
  const end = Date.parse(`${normalizeDate(to) || to}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return -1;
  return Math.floor((end - start) / 86_400_000);
}

function hasRegisteredValue(value: string | undefined | null) {
  const clean = String(value ?? "").trim();
  return clean !== "" && clean !== "-" && clean.toUpperCase() !== "SIN INFORMACION";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeDate(value: string | undefined | null) {
  const clean = String(value ?? "").trim();
  if (!clean) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  const slash = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (slash) {
    const day = slash[1].padStart(2, "0");
    const month = slash[2].padStart(2, "0");
    const year = slash[3].length === 2 ? `20${slash[3]}` : slash[3];
    return `${year}-${month}-${day}`;
  }
  return "";
}

function formatDatePe(value: string) {
  const normalized = normalizeDate(value) || value;
  const iso = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!iso) return String(value || "Sin información");
  return `${iso[3]}/${iso[2]}/${iso[1]}`;
}
