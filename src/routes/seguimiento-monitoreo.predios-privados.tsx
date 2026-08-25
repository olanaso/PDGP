import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  FileSpreadsheet,
  FilterX,
  Printer,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import writeExcelFile, { type SheetData } from "write-excel-file/browser";

import { AppSidebar } from "../components/AppSidebar";
import {
  ACQUISITION_MILESTONES_STORAGE_KEY,
  ACQUISITION_MILESTONES_UPDATED_EVENT,
  DEFAULT_CONFIGS,
  type ProcessConfig,
  type ProcessType,
} from "../components/AcquisitionMilestonesConfig";

export const Route = createFileRoute("/seguimiento-monitoreo/predios-privados")({
  head: () => ({
    meta: [
      { title: "Coordinadores · Seguimiento de predios privados" },
      {
        name: "description",
        content: "Seguimiento de predios privados por etapa de adquisición y cierre predial.",
      },
    ],
  }),
  component: PrivatePropertiesDashboard,
});

type StageDefinition = {
  label: string;
  evidence: string;
  nextAction: string;
};

type MatrixRuntime = {
  processId: ProcessType;
  processName: string;
  legalLimitDays: number;
  stages: StageDefinition[];
  targetDays: number[];
  warningDays: number[];
  criticalDays: number[];
  weights: number[];
};

type PredioStatus = "En plazo" | "En riesgo" | "Observado" | "Cerrado";

type MatrixKind = "predial" | "mejoras" | "estado";

type PrivateProperty = {
  code: string;
  project: string;
  period: "2026";
  owner: string;
  modality: "Trato directo" | "Expropiación";
  responsible: string;
  currentStage: number;
  status: PredioStatus;
  updatedAt: string;
  blocker: string;
  improvementsStage: number;
  improvementsStatus: PredioStatus;
  improvementsFile: string;
  improvementsUpdatedAt: string;
  improvementsBlocker: string;
  stateStage: number;
  stateStatus: PredioStatus;
  stateFile: string;
  stateUpdatedAt: string;
  stateBlocker: string;
};

type SelectedStage = {
  property: PrivateProperty;
  stageIndex: number;
  matrixKind: MatrixKind;
};

const stages: StageDefinition[] = [
  {
    label: "Identificado / Individualizado",
    evidence: "código predial, ubicación y polígono de afectación",
    nextAction: "iniciar el diagnóstico técnico-legal",
  },
  {
    label: "En diagnóstico técnico-legal",
    evidence: "partida registral, titularidad, área afectada y condición física",
    nextAction: "cerrar observaciones del diagnóstico",
  },
  {
    label: "Expediente técnico-legal completo",
    evidence: "planos, memoria descriptiva, informe técnico e informe legal",
    nextAction: "remitir el expediente para tasación",
  },
  {
    label: "En tasación",
    evidence: "expediente admitido por el órgano tasador",
    nextAction: "obtener el informe técnico de tasación",
  },
  {
    label: "Tasado",
    evidence: "informe de tasación aprobado y monto determinado",
    nextAction: "notificar la oferta de adquisición",
  },
  {
    label: "En trato directo / adquisición",
    evidence: "carta de intención u oferta notificada al sujeto pasivo",
    nextAction: "obtener la respuesta del sujeto pasivo",
  },
  {
    label: "Aceptado",
    evidence: "aceptación expresa de la oferta dentro del plazo",
    nextAction: "emitir la resolución de adquisición",
  },
  {
    label: "Con Resolución",
    evidence: "resolución aprobatoria emitida y notificada",
    nextAction: "gestionar la certificación y el devengado",
  },
  {
    label: "Devengado",
    evidence: "registro presupuestal del devengado",
    nextAction: "programar el pago al beneficiario",
  },
  {
    label: "Pago programado",
    evidence: "fecha y cuenta de pago validadas",
    nextAction: "ejecutar el abono o consignación",
  },
  {
    label: "Pagado parcialmente",
    evidence: "constancia de abono parcial y saldo identificado",
    nextAction: "completar el saldo pendiente",
  },
  {
    label: "Pagado",
    evidence: "comprobante de pago total o consignación",
    nextAction: "formalizar la entrega de posesión",
  },
  {
    label: "Posesión entregada",
    evidence: "acta de entrega y recepción del área",
    nextAction: "suscribir el formulario registral",
  },
  {
    label: "Formulario Registral suscrito",
    evidence: "formulario registral firmado por las partes",
    nextAction: "presentar el título ante SUNARP",
  },
  {
    label: "En trámite SUNARP",
    evidence: "número de título y asiento de presentación",
    nextAction: "dar seguimiento a la calificación registral",
  },
  {
    label: "Observado por SUNARP",
    evidence: "esquela de observación registral",
    nextAction: "subsanar las observaciones dentro del plazo",
  },
  {
    label: "Inscrito en SUNARP",
    evidence: "asiento registral de adquisición inscrito",
    nextAction: "completar el expediente predial",
  },
  {
    label: "Expediente predial completo",
    evidence: "documentos técnicos, legales, financieros y registrales foliados",
    nextAction: "entregar el expediente a OPAT",
  },
  {
    label: "Entregado a OPAT",
    evidence: "cargo de entrega y conformidad de recepción",
    nextAction: "confirmar el cierre administrativo",
  },
  {
    label: "Cerrado",
    evidence: "lista de control final sin pendientes",
    nextAction: "mantener el expediente en custodia",
  },
];

const improvementStages = stages.slice(0, 13).map((stage, index) =>
  index === 12
    ? {
        ...stage,
        nextAction: "cerrar el expediente del pago de mejoras",
      }
    : stage,
);

const statePropertyStages: StageDefinition[] = [
  {
    label: "PENDIENTE",
    evidence: "identificación del predio estatal y de la entidad titular",
    nextAction: "iniciar la solicitud de transferencia o adquisición",
  },
  {
    label: "EN TRÁMITE",
    evidence: "expediente presentado y cargo de recepción de la entidad competente",
    nextAction: "obtener el acto administrativo que aprueba la transferencia",
  },
  {
    label: "ADQUIRIDO",
    evidence: "resolución, convenio o acto de transferencia aprobado",
    nextAction: "cerrar el expediente del predio estatal",
  },
];

const stageTargetDays: Record<MatrixKind, number[]> = {
  predial: [7, 14, 12, 18, 8, 14, 7, 10, 8, 6, 8, 6, 5, 8, 12, 10, 10, 8, 5, 4],
  mejoras: [10, 18, 16, 22, 10, 18, 10, 14, 12, 10, 16, 12, 12],
  estado: [20, 60, 10],
};

function targetDaysFor(runtime: MatrixRuntime, stageIndex: number) {
  return runtime.targetDays[stageIndex] ?? 5;
}

function processTargetDaysFor(runtime: MatrixRuntime) {
  return runtime.targetDays.reduce((total, days) => total + days, 0);
}

function processTermFor(runtime: MatrixRuntime) {
  const days = runtime.legalLimitDays;
  return days > 0 && days % 30 === 0 ? `${days / 30} meses` : `${days} días`;
}

const matrixCopy: Record<
  MatrixKind,
  { tab: string; title: string; description: string; exportName: string }
> = {
  predial: {
    tab: "Adquisición predial",
    title: "Matriz de avance por predio",
    description:
      "Seleccione cualquier celda para conocer por qué el predio llegó o aún no llega a esa etapa.",
    exportName: "adquisicion_predial",
  },
  mejoras: {
    tab: "Pago de mejoras",
    title: "Matriz de pago de mejoras por predio",
    description:
      "Seguimiento del pago de mejoras desde la identificación hasta la entrega de posesión.",
    exportName: "pago_mejoras",
  },
  estado: {
    tab: "Predios del Estado",
    title: "Matriz de avance de predios del Estado",
    description: "Seguimiento de predios estatales en condición pendiente, en trámite o adquirido.",
    exportName: "predios_del_estado",
  },
};

const owners = [
  "María Quispe Huamán",
  "Juan Ramos Paredes",
  "Comunidad Campesina Acolla",
  "Rosa Vilca Torres",
  "Hermanos Salazar E.I.R.L.",
  "Carlos Mendoza Ruiz",
];

const responsibles = ["Ana Campos", "Luis Paredes", "Patricia Gómez", "Jorge Salazar"];

const stageSeeds = [
  5, 9, 4, 16, 5, 17, 10, 15, 1, 12, 7, 19, 3, 6, 13, 8, 14, 11, 2, 18, 0, 5, 16, 9,
];

const improvementStageSeeds = [
  3, 7, 2, 12, 4, 10, 6, 11, 1, 8, 5, 12, 3, 9, 7, 10, 2, 11, 4, 12, 0, 6, 9, 5,
];

const stateStageSeeds = [0, 1, 1, 2, 0, 1, 2, 1, 0, 2, 1, 0, 1, 2, 0, 1, 1, 2, 0, 1, 2, 1, 0, 2];

const projectSeeds = [
  { name: "Aeropuerto de Jauja", prefix: "AERO-JAUJA", count: 12 },
  { name: "Aeropuerto de Cajamarca", prefix: "AERO-CAJ", count: 6 },
  { name: "Aeropuerto de Pisco", prefix: "AERO-PISCO", count: 6 },
];

const privateProperties: PrivateProperty[] = projectSeeds.flatMap((project, projectIndex) =>
  Array.from({ length: project.count }, (_, localIndex) => {
    const index =
      projectSeeds.slice(0, projectIndex).reduce((sum, previous) => sum + previous.count, 0) +
      localIndex;
    const currentStage = stageSeeds[index];
    const improvementsStage = improvementStageSeeds[index];
    const stateStage = stateStageSeeds[index];
    const status: PredioStatus =
      currentStage === stages.length - 1
        ? "Cerrado"
        : currentStage === 15
          ? "Observado"
          : index % 5 === 0
            ? "En riesgo"
            : "En plazo";
    const improvementsStatus: PredioStatus =
      improvementsStage === improvementStages.length - 1
        ? "Cerrado"
        : index % 7 === 0
          ? "Observado"
          : index % 4 === 0
            ? "En riesgo"
            : "En plazo";
    const stateStatus: PredioStatus =
      stateStage === statePropertyStages.length - 1
        ? "Cerrado"
        : index % 8 === 0
          ? "Observado"
          : index % 5 === 0
            ? "En riesgo"
            : "En plazo";
    return {
      code: `${project.prefix}-PR-${String(localIndex + 1).padStart(3, "0")}`,
      project: project.name,
      period: "2026" as const,
      owner: owners[index % owners.length],
      modality: index % 4 === 0 ? "Expropiación" : "Trato directo",
      responsible: responsibles[index % responsibles.length],
      currentStage,
      status,
      updatedAt: `${String(10 + (index % 18)).padStart(2, "0")}/07/2026`,
      blocker:
        status === "Observado"
          ? "Pendiente subsanar la esquela de observación emitida por SUNARP."
          : status === "En riesgo"
            ? "La actividad supera el plazo interno de atención y requiere priorización."
            : status === "Cerrado"
              ? "Sin bloqueos; el expediente cuenta con cierre administrativo."
              : "Pendiente completar la evidencia exigida para pasar a la siguiente etapa.",
      improvementsStage,
      improvementsStatus,
      improvementsFile: `EXP-MEJ-2026-${String(index + 1).padStart(4, "0")}`,
      improvementsUpdatedAt: `${String(8 + (index % 20)).padStart(2, "0")}/07/2026`,
      improvementsBlocker:
        improvementsStatus === "Observado"
          ? "Pendiente validar la documentación que sustenta las mejoras valorizadas."
          : improvementsStatus === "En riesgo"
            ? "El trámite de pago de mejoras requiere atención prioritaria para cumplir el plazo."
            : improvementsStatus === "Cerrado"
              ? "Sin bloqueos; el pago de mejoras y la entrega de posesión fueron completados."
              : "Pendiente completar la evidencia de la etapa para continuar con el pago de mejoras.",
      stateStage,
      stateStatus,
      stateFile: `EXP-EST-2026-${String(index + 1).padStart(4, "0")}`,
      stateUpdatedAt: `${String(6 + (index % 22)).padStart(2, "0")}/07/2026`,
      stateBlocker:
        stateStatus === "Observado"
          ? "Pendiente subsanar la documentación solicitada por la entidad estatal competente."
          : stateStatus === "En riesgo"
            ? "El expediente estatal requiere atención prioritaria para cumplir el plazo previsto."
            : stateStatus === "Cerrado"
              ? "Sin bloqueos; el predio estatal cuenta con acto de adquisición aprobado."
              : "Pendiente completar la documentación requerida para avanzar con el trámite.",
    };
  }),
);

function stagesFor(matrixKind: MatrixKind) {
  if (matrixKind === "mejoras") return improvementStages;
  if (matrixKind === "estado") return statePropertyStages;
  return stages;
}

function cloneMilestoneConfigs() {
  return DEFAULT_CONFIGS.map((process) => ({
    ...process,
    milestones: process.milestones.map((milestone) => ({ ...milestone })),
  }));
}

function readMilestoneConfigs() {
  const defaults = cloneMilestoneConfigs();
  if (typeof window === "undefined") return defaults;

  try {
    const stored = window.localStorage.getItem(ACQUISITION_MILESTONES_STORAGE_KEY);
    if (!stored) return defaults;
    const parsed = JSON.parse(stored) as ProcessConfig[];
    if (!Array.isArray(parsed) || !parsed.length) return defaults;
    const currentDirectAcquisition = defaults.find((item) => item.id === "trato-directo");
    return parsed.map((process) => {
      const usesLegacyDirectAcquisition =
        process.id === "trato-directo" &&
        process.milestones.length === 12 &&
        process.milestones.every((milestone, index) => milestone.id === `td-${index + 1}`);
      return usesLegacyDirectAcquisition && currentDirectAcquisition
        ? {
            ...process,
            milestones: currentDirectAcquisition.milestones.map((milestone) => ({ ...milestone })),
          }
        : process;
    });
  } catch {
    return defaults;
  }
}

function processTypeFor(matrixKind: MatrixKind, modality: string): ProcessType {
  if (matrixKind === "mejoras") return "mejoras";
  if (matrixKind === "estado") return "estatales";
  return modality === "Expropiación" ? "expropiacion" : "trato-directo";
}

function buildMatrixRuntime(
  matrixKind: MatrixKind,
  modality: string,
  configs: ProcessConfig[],
): MatrixRuntime {
  const processId = processTypeFor(matrixKind, modality);
  const process =
    configs.find((item) => item.id === processId) ??
    DEFAULT_CONFIGS.find((item) => item.id === processId);
  const activeMilestones = process?.milestones.filter((milestone) => milestone.active) ?? [];

  if (!process || !activeMilestones.length) {
    const fallbackStages = stagesFor(matrixKind);
    const fallbackDays = stageTargetDays[matrixKind];
    return {
      processId,
      processName: matrixCopy[matrixKind].tab,
      legalLimitDays: fallbackDays.reduce((total, days) => total + days, 0),
      stages: fallbackStages,
      targetDays: fallbackDays,
      warningDays: fallbackDays.map((days) => Math.max(1, Math.round(days * 0.7))),
      criticalDays: fallbackDays.map((days) => Math.max(1, Math.round(days * 0.9))),
      weights: fallbackStages.map(() => 1),
    };
  }

  return {
    processId,
    processName: process.name,
    legalLimitDays: process.legalLimitDays,
    stages: activeMilestones.map((milestone, index) => ({
      label: milestone.name,
      evidence: milestone.evidence || "documento sustentatorio de la etapa",
      nextAction: activeMilestones[index + 1]?.name
        ? `continuar con “${activeMilestones[index + 1].name}”`
        : "cerrar el proceso y archivar el expediente",
    })),
    targetDays: activeMilestones.map((milestone) => Math.max(1, milestone.days)),
    warningDays: activeMilestones.map((milestone) => Math.max(1, milestone.warningDay)),
    criticalDays: activeMilestones.map((milestone) => Math.max(1, milestone.criticalDay)),
    weights: activeMilestones.map((milestone) => Math.max(0, milestone.weight)),
  };
}

function currentStageFor(property: PrivateProperty, matrixKind: MatrixKind, stageCount: number) {
  const rawStage =
    matrixKind === "mejoras"
      ? property.improvementsStage
      : matrixKind === "estado"
        ? property.stateStage
        : property.currentStage;
  const sourceCount = stagesFor(matrixKind).length;
  if (stageCount <= 1 || sourceCount <= 1) return 0;
  return Math.min(
    stageCount - 1,
    Math.max(0, Math.round((rawStage / (sourceCount - 1)) * (stageCount - 1))),
  );
}

function statusFor(property: PrivateProperty, matrixKind: MatrixKind) {
  if (matrixKind === "mejoras") return property.improvementsStatus;
  if (matrixKind === "estado") return property.stateStatus;
  return property.status;
}

function updatedAtFor(property: PrivateProperty, matrixKind: MatrixKind) {
  if (matrixKind === "mejoras") return property.improvementsUpdatedAt;
  if (matrixKind === "estado") return property.stateUpdatedAt;
  return property.updatedAt;
}

function blockerFor(property: PrivateProperty, matrixKind: MatrixKind) {
  if (matrixKind === "mejoras") return property.improvementsBlocker;
  if (matrixKind === "estado") return property.stateBlocker;
  return property.blocker;
}

function secondaryValueFor(property: PrivateProperty, matrixKind: MatrixKind) {
  if (matrixKind === "mejoras") return property.improvementsFile;
  if (matrixKind === "estado") return property.stateFile;
  return property.modality;
}

function secondaryLabelFor(matrixKind: MatrixKind) {
  return matrixKind === "predial" ? "Modalidad de adquisición" : "Expediente";
}

function stageCondition(
  property: PrivateProperty,
  stageIndex: number,
  matrixKind: MatrixKind,
  runtime: MatrixRuntime,
) {
  const currentStage = currentStageFor(property, matrixKind, runtime.stages.length);
  if (statusFor(property, matrixKind) === "Cerrado" && stageIndex <= currentStage)
    return "Completada";
  if (stageIndex < currentStage) return "Completada";
  if (stageIndex === currentStage) return "Etapa actual";
  return "Pendiente";
}

function progressFor(property: PrivateProperty, matrixKind: MatrixKind, runtime: MatrixRuntime) {
  const currentStage = currentStageFor(property, matrixKind, runtime.stages.length);
  const reached =
    statusFor(property, matrixKind) === "Cerrado" ? runtime.stages.length : currentStage + 1;
  const totalWeight = runtime.weights.reduce((total, weight) => total + weight, 0);
  if (!totalWeight) return (reached / runtime.stages.length) * 100;
  const reachedWeight = runtime.weights
    .slice(0, reached)
    .reduce((total, weight) => total + weight, 0);
  return (reachedWeight / totalWeight) * 100;
}

const DAY_IN_MS = 86_400_000;

function formatDate(date: Date) {
  return date.toLocaleDateString("es-PE", { timeZone: "UTC" });
}

function parsePeruvianDate(value: string) {
  const [day, month, year] = value.split("/").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function daysBetween(start: Date, end: Date) {
  return Math.max(1, Math.floor((end.getTime() - start.getTime()) / DAY_IN_MS) + 1);
}

function stageStartDateFor(
  property: PrivateProperty,
  stageIndex: number,
  matrixKind: MatrixKind,
  runtime: MatrixRuntime,
) {
  if (stageIndex > currentStageFor(property, matrixKind, runtime.stages.length)) return null;
  const propertyNumber = Number(property.code.split("-").at(-1)) || 1;
  const matrixSeed = matrixKind === "mejoras" ? 2 : matrixKind === "estado" ? 4 : 0;
  const baseOffset = matrixKind === "mejoras" ? 56 : matrixKind === "estado" ? 120 : 0;
  let accumulatedDays = 0;
  for (let index = 0; index < stageIndex; index += 1) {
    const configuredDays = targetDaysFor(runtime, index);
    const executionFactor = 0.7 + ((propertyNumber + index * 2 + matrixSeed) % 5) * 0.08;
    accumulatedDays += Math.max(1, Math.round(configuredDays * executionFactor));
  }
  return new Date(Date.UTC(2026, 0, 4 + propertyNumber + baseOffset + accumulatedDays));
}

function stageTimingFor(
  property: PrivateProperty,
  stageIndex: number,
  matrixKind: MatrixKind,
  runtime: MatrixRuntime,
) {
  const condition = stageCondition(property, stageIndex, matrixKind, runtime);
  const currentStage = currentStageFor(property, matrixKind, runtime.stages.length);
  const start = stageStartDateFor(property, stageIndex, matrixKind, runtime);
  if (!start || condition === "Pendiente") {
    return { start: null, end: null, days: null, condition };
  }

  const nextStart = stageStartDateFor(property, stageIndex + 1, matrixKind, runtime);
  if (stageIndex < currentStage && nextStart) {
    const end = new Date(nextStart.getTime() - DAY_IN_MS);
    return { start, end, days: daysBetween(start, end), condition };
  }

  const end = parsePeruvianDate(updatedAtFor(property, matrixKind));
  return { start, end, days: daysBetween(start, end), condition };
}

function processDaysFor(property: PrivateProperty, matrixKind: MatrixKind, runtime: MatrixRuntime) {
  const start = stageStartDateFor(property, 0, matrixKind, runtime);
  if (!start) return 0;
  return daysBetween(start, parsePeruvianDate(updatedAtFor(property, matrixKind)));
}

function stageDaysLabel(
  property: PrivateProperty,
  stageIndex: number,
  matrixKind: MatrixKind,
  runtime: MatrixRuntime,
) {
  const timing = stageTimingFor(property, stageIndex, matrixKind, runtime);
  if (timing.days === null) return "Aún no inicia";
  return `${timing.days} ${timing.days === 1 ? "día" : "días"}${
    timing.condition === "Etapa actual" ? " en curso" : ""
  }`;
}

function dateForStage(
  property: PrivateProperty,
  stageIndex: number,
  matrixKind: MatrixKind,
  runtime: MatrixRuntime,
) {
  const date = stageStartDateFor(property, stageIndex, matrixKind, runtime);
  return date ? formatDate(date) : "—";
}

function reasonForStage(
  property: PrivateProperty,
  stageIndex: number,
  matrixKind: MatrixKind,
  runtime: MatrixRuntime,
) {
  const matrixStages = runtime.stages;
  const currentStage = currentStageFor(property, matrixKind, runtime.stages.length);
  const stage = matrixStages[stageIndex];
  const condition = stageCondition(property, stageIndex, matrixKind, runtime);
  if (condition === "Completada") {
    return `La etapa se completó después de verificar ${stage.evidence}.`;
  }
  if (condition === "Etapa actual") {
    return `${property.code} llegó a esta etapa al completarse las validaciones anteriores. ${blockerFor(property, matrixKind)}`;
  }
  return `La etapa aún no inicia porque el predio permanece en “${matrixStages[currentStage].label}”.`;
}

function PrivatePropertiesDashboard() {
  const [milestoneConfigs, setMilestoneConfigs] = useState<ProcessConfig[]>(cloneMilestoneConfigs);
  const [matrixKind, setMatrixKind] = useState<MatrixKind>("predial");
  const [project, setProject] = useState("TODOS");
  const [period, setPeriod] = useState("TODOS");
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("TODAS");
  const [status, setStatus] = useState("TODOS");
  const [modality, setModality] = useState("TODAS");
  const [responsible, setResponsible] = useState("TODOS");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedStage | null>(null);
  const runtime = useMemo(
    () => buildMatrixRuntime(matrixKind, modality, milestoneConfigs),
    [matrixKind, milestoneConfigs, modality],
  );
  const activeStages = runtime.stages;
  const activeCopy = matrixCopy[matrixKind];

  useEffect(() => {
    const refreshMilestones = () => setMilestoneConfigs(readMilestoneConfigs());
    refreshMilestones();
    window.addEventListener("focus", refreshMilestones);
    window.addEventListener("storage", refreshMilestones);
    window.addEventListener(ACQUISITION_MILESTONES_UPDATED_EVENT, refreshMilestones);
    return () => {
      window.removeEventListener("focus", refreshMilestones);
      window.removeEventListener("storage", refreshMilestones);
      window.removeEventListener(ACQUISITION_MILESTONES_UPDATED_EVENT, refreshMilestones);
    };
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return privateProperties.filter((property) => {
      if (project !== "TODOS" && property.project !== project) return false;
      if (period !== "TODOS" && property.period !== period) return false;
      if (
        stage !== "TODAS" &&
        activeStages[currentStageFor(property, matrixKind, activeStages.length)].label !== stage
      )
        return false;
      if (status !== "TODOS" && statusFor(property, matrixKind) !== status) return false;
      if (modality !== "TODAS" && secondaryValueFor(property, matrixKind) !== modality)
        return false;
      if (responsible !== "TODOS" && property.responsible !== responsible) return false;
      if (
        normalizedQuery &&
        !`${property.code} ${property.owner}`.toLowerCase().includes(normalizedQuery)
      )
        return false;
      return true;
    });
  }, [activeStages, matrixKind, modality, period, project, query, responsible, stage, status]);

  const closed = filtered.filter(
    (property) => statusFor(property, matrixKind) === "Cerrado",
  ).length;
  const observed = filtered.filter(
    (property) => statusFor(property, matrixKind) === "Observado",
  ).length;
  const atRisk = filtered.filter(
    (property) => statusFor(property, matrixKind) === "En riesgo",
  ).length;
  const averageProgress = filtered.length
    ? filtered.reduce((sum, property) => sum + progressFor(property, matrixKind, runtime), 0) /
      filtered.length
    : 0;
  const averageProcessDays = filtered.length
    ? filtered.reduce((sum, property) => sum + processDaysFor(property, matrixKind, runtime), 0) /
      filtered.length
    : 0;
  const activeFilterCount = [
    project !== "TODOS",
    period !== "TODOS",
    Boolean(query.trim()),
    stage !== "TODAS",
    status !== "TODOS",
    modality !== "TODAS",
    responsible !== "TODOS",
  ].filter(Boolean).length;

  function clearFilters() {
    setProject("TODOS");
    setPeriod("TODOS");
    setQuery("");
    setStage("TODAS");
    setStatus("TODOS");
    setModality("TODAS");
    setResponsible("TODOS");
  }

  function changeMatrix(nextMatrix: MatrixKind) {
    setMatrixKind(nextMatrix);
    setStage("TODAS");
    setStatus("TODOS");
    setModality("TODAS");
    setSelected(null);
  }

  function printMatrix() {
    const previousTitle = document.title;
    document.title = `${activeCopy.title} - ${runtime.processName}`;
    window.print();
    window.setTimeout(() => {
      document.title = previousTitle;
    }, 0);
  }

  return (
    <div data-monitoring-page className="flex min-h-screen bg-[#f7f9fc] text-slate-900">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-auto p-2.5 lg:p-3">
        <header
          data-print-hidden
          className="mb-2 flex flex-wrap items-center justify-between gap-2"
        >
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-red-600">
              Coordinadores · Predios privados
            </div>
            <h1 className="text-lg font-extrabold text-slate-950">
              Seguimiento de predios por etapas
            </h1>
            <p className="text-[10px] font-medium text-slate-500">
              Matriz operativa para identificar la etapa actual, las brechas y el motivo de cada
              situación. Datos demostrativos 2026.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={printMatrix}
              disabled={!filtered.length}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-[11px] font-extrabold text-slate-800 hover:border-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer size={14} /> Imprimir matriz
            </button>
            <button
              type="button"
              onClick={() => void exportPrivatePropertiesExcel(filtered, matrixKind, runtime)}
              disabled={!filtered.length}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-[11px] font-extrabold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileSpreadsheet size={14} /> Exportar matriz
            </button>
          </div>
        </header>

        <section
          data-print-hidden
          className="mb-2 overflow-hidden rounded-lg border border-slate-300 bg-white"
        >
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
            <button
              type="button"
              onClick={() => setFiltersOpen((current) => !current)}
              aria-expanded={filtersOpen}
              className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-[10px] font-extrabold text-slate-800"
            >
              <SlidersHorizontal size={13} className="shrink-0 text-red-600" />
              <span>Filtros de la matriz</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] text-red-700">
                  {activeFilterCount} activos
                </span>
              )}
              <span className="ml-auto text-[9px] font-medium text-slate-500">
                {filtersOpen ? "Ocultar" : "Mostrar"}
              </span>
              <ChevronDown
                size={13}
                className={`shrink-0 text-slate-500 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
              />
            </button>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-6 shrink-0 items-center gap-1 rounded border border-slate-200 px-2 text-[9px] font-bold text-slate-600 hover:bg-slate-50"
              >
                <FilterX size={11} /> Limpiar
              </button>
            )}
          </div>
          {filtersOpen && (
            <div className="grid grid-cols-2 gap-1.5 border-t border-slate-200 bg-slate-50/50 px-2.5 py-2 lg:grid-cols-4 2xl:grid-cols-7">
              <FilterSelect
                label="Proyecto"
                value={project}
                onChange={setProject}
                options={Array.from(new Set(privateProperties.map((item) => item.project)))}
                allValue="TODOS"
                allLabel="Todos"
              />
              <FilterSelect
                label="Periodo"
                value={period}
                onChange={setPeriod}
                options={["2026", "2025"]}
                allValue="TODOS"
                allLabel="Todos"
              />
              <label className="block">
                <span className="mb-0.5 block text-[8px] font-extrabold uppercase tracking-wide text-slate-500">
                  Código / titular
                </span>
                <span className="relative block">
                  <Search
                    size={11}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar predio..."
                    className="h-7 w-full rounded border border-slate-300 pl-7 pr-2 text-[10px] font-medium outline-none focus:border-red-500"
                  />
                </span>
              </label>
              <FilterSelect
                label="Etapa actual"
                value={stage}
                onChange={setStage}
                options={activeStages.map((item) => item.label)}
                allValue="TODAS"
                allLabel="Todas"
              />
              <FilterSelect
                label="Estado"
                value={status}
                onChange={setStatus}
                options={["En plazo", "En riesgo", "Observado", "Cerrado"]}
                allValue="TODOS"
                allLabel="Todos"
              />
              <FilterSelect
                label={matrixKind === "predial" ? "Modalidad" : "Expediente"}
                value={modality}
                onChange={setModality}
                options={
                  matrixKind === "predial"
                    ? ["Trato directo", "Expropiación"]
                    : privateProperties.map((property) => secondaryValueFor(property, matrixKind))
                }
                allValue="TODAS"
                allLabel="Todas"
              />
              <FilterSelect
                label="Responsable"
                value={responsible}
                onChange={setResponsible}
                options={responsibles}
                allValue="TODOS"
                allLabel="Todos"
              />
            </div>
          )}
        </section>

        <section
          data-print-matrix
          className="overflow-hidden rounded-lg border-2 border-slate-400 bg-white"
        >
          <div
            data-print-hidden
            className="flex gap-1 border-b border-slate-300 bg-white px-3 pt-1.5"
            role="tablist"
          >
            {(Object.keys(matrixCopy) as MatrixKind[]).map((kind) => {
              const active = matrixKind === kind;
              return (
                <button
                  key={kind}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => changeMatrix(kind)}
                  className={`rounded-t-md border border-b-0 px-4 py-1.5 text-[11px] font-extrabold transition ${
                    active
                      ? "border-red-300 bg-red-50 text-red-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-700"
                  }`}
                >
                  {matrixCopy[kind].tab}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-300 bg-white px-3 py-2.5">
            <div>
              <h2 className="text-[16px] font-black tracking-tight text-slate-950">
                {activeCopy.title}
              </h2>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-700">
                {activeCopy.description}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 text-[10px] font-semibold text-slate-700">
              <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 font-bold text-blue-800">
                Hitos configurados: {runtime.processName}
              </span>
              <span className="rounded-md border border-orange-300 bg-orange-50 px-2.5 py-1 font-bold text-orange-800">
                Plazo legal: {processTermFor(runtime)} · Hitos: {processTargetDaysFor(runtime)} días
              </span>
              <Legend color="border border-sky-200 bg-sky-100" label="Completada" />
              <Legend color="border border-blue-200 bg-blue-100" label="Actual en plazo" />
              <Legend color="border border-amber-200 bg-amber-100" label="En aviso" />
              <Legend color="border border-rose-200 bg-rose-100" label="Crítica / observada" />
              <Legend color="border border-slate-200 bg-slate-50" label="Pendiente" />
              <Legend color="border-2 border-orange-400 bg-orange-50" label="Plazo objetivo" />
            </div>
          </div>

          <div
            data-print-scroll
            className="min-h-[560px] max-h-[calc(100vh-190px)] overflow-auto bg-white"
          >
            <table
              className={`${
                matrixKind === "estado" ? "w-full min-w-[920px]" : "min-w-[1680px]"
              } border-collapse text-[11px] text-slate-900`}
            >
              <thead className="sticky top-0 z-20 text-slate-950">
                <tr>
                  <th className="sticky left-0 z-30 min-w-48 border border-slate-600 bg-slate-950 px-2.5 py-2.5 text-left text-[11px] font-black uppercase tracking-wide text-white">
                    Listado de predios
                  </th>
                  <th className="sticky left-48 z-30 min-w-40 border border-slate-600 bg-slate-950 px-2.5 py-2.5 text-center text-[11px] font-black uppercase tracking-wide text-white">
                    {secondaryLabelFor(matrixKind)}
                  </th>
                  <th className="sticky left-[22rem] z-30 min-w-28 border border-slate-600 bg-slate-950 px-2.5 py-2.5 text-center text-[11px] font-black uppercase tracking-wide text-white">
                    Fecha de inicio
                  </th>
                  {activeStages.map((item, stageIndex) => (
                    <th
                      key={item.label}
                      className="relative h-40 w-10 min-w-10 border border-slate-400 bg-slate-100 p-0 align-bottom text-slate-950"
                    >
                      <span className="absolute left-1/2 top-1 z-10 inline-flex min-w-7 -translate-x-1/2 items-center justify-center rounded-sm border border-orange-400 bg-orange-50 px-1 py-0.5 text-[7px] font-extrabold text-orange-700">
                        {targetDaysFor(runtime, stageIndex)} d
                      </span>
                      <span className="absolute bottom-0 left-0 inline-flex h-32 w-10 rotate-180 items-center justify-center px-1 py-2 text-[10px] font-black leading-tight [writing-mode:vertical-rl]">
                        {item.label}
                      </span>
                    </th>
                  ))}
                  <th className="sticky right-24 z-30 min-w-16 border border-slate-600 bg-slate-950 px-2 py-2 text-center text-[11px] font-black uppercase tracking-wide text-white">
                    % avance
                  </th>
                  <th className="sticky right-0 z-30 min-w-24 border border-slate-600 bg-slate-950 px-2 py-2 text-center text-[11px] font-black uppercase tracking-wide text-white">
                    Días en proceso
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((property) => (
                  <tr key={property.code} className="group even:bg-slate-50/70 hover:bg-blue-50">
                    <th className="sticky left-0 z-10 border border-slate-300 bg-white px-2.5 py-2 text-left group-even:bg-slate-50 group-hover:bg-blue-50">
                      <button
                        type="button"
                        onClick={() =>
                          setSelected({
                            property,
                            stageIndex: currentStageFor(property, matrixKind, activeStages.length),
                            matrixKind,
                          })
                        }
                        className="flex w-full items-center justify-between gap-2 text-left text-[11px] font-black text-slate-950 hover:text-red-700"
                      >
                        <span>{property.code}</span>
                        <Eye size={12} className="text-slate-400" />
                      </button>
                    </th>
                    <td className="sticky left-48 z-10 min-w-40 border border-slate-300 bg-white px-2 py-1.5 text-center group-even:bg-slate-50 group-hover:bg-blue-50">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-bold ${
                          matrixKind !== "predial"
                            ? matrixKind === "estado"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-violet-100 text-violet-700"
                            : property.modality === "Trato directo"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {secondaryValueFor(property, matrixKind)}
                      </span>
                    </td>
                    <td className="sticky left-[22rem] z-10 min-w-28 border border-slate-300 bg-white px-2 py-1.5 text-center font-extrabold tabular-nums text-slate-900 group-even:bg-slate-50 group-hover:bg-blue-50">
                      {dateForStage(property, 0, matrixKind, runtime)}
                    </td>
                    {activeStages.map((item, stageIndex) => {
                      const condition = stageCondition(property, stageIndex, matrixKind, runtime);
                      const timing = stageTimingFor(property, stageIndex, matrixKind, runtime);
                      const isCritical =
                        condition === "Etapa actual" &&
                        timing.days !== null &&
                        timing.days >= runtime.criticalDays[stageIndex];
                      const isWarning =
                        condition === "Etapa actual" &&
                        timing.days !== null &&
                        timing.days >= runtime.warningDays[stageIndex];
                      const isObserved =
                        condition === "Etapa actual" &&
                        (statusFor(property, matrixKind) === "Observado" || isCritical);
                      return (
                        <td key={item.label} className="border border-slate-300 p-0 text-center">
                          <button
                            type="button"
                            onClick={() => setSelected({ property, stageIndex, matrixKind })}
                            title={`${item.label}: ${condition}. ${stageDaysLabel(property, stageIndex, matrixKind, runtime)}. Aviso: ${runtime.warningDays[stageIndex]} días. Crítico: ${runtime.criticalDays[stageIndex]} días. Plazo objetivo: ${targetDaysFor(runtime, stageIndex)} días`}
                            aria-label={`${property.code}, ${item.label}, ${condition}, ${stageDaysLabel(property, stageIndex, matrixKind, runtime)}, plazo objetivo ${targetDaysFor(runtime, stageIndex)} días`}
                            className={`relative flex size-9 w-full items-center justify-center overflow-hidden transition hover:ring-2 hover:ring-inset hover:ring-red-500 ${
                              condition === "Completada"
                                ? "bg-sky-100 text-sky-700 hover:bg-sky-200"
                                : condition === "Etapa actual"
                                  ? isObserved
                                    ? "bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-300"
                                    : isWarning
                                      ? "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-300"
                                      : "bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300"
                                  : "bg-slate-50 text-slate-300"
                            }`}
                          >
                            {condition === "Completada" ? (
                              <CheckCircle2 size={13} />
                            ) : condition === "Etapa actual" ? (
                              isObserved ? (
                                <AlertTriangle size={13} />
                              ) : (
                                <Clock3 size={13} />
                              )
                            ) : (
                              <span className="size-1 rounded-full bg-slate-200" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="sticky right-24 z-10 border border-slate-300 bg-sky-50 px-2 py-1 text-center text-[12px] font-black tabular-nums text-sky-900 group-hover:bg-sky-100">
                      {progressFor(property, matrixKind, runtime).toFixed(1)}%
                    </td>
                    <td className="sticky right-0 z-10 border border-slate-300 bg-white px-2 py-1 text-center group-even:bg-slate-50 group-hover:bg-blue-50">
                      <span
                        title={`Tiempo transcurrido frente a los ${processTargetDaysFor(runtime)} días configurados para los hitos`}
                        className={`inline-flex min-w-16 items-center justify-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold tabular-nums ${
                          processDaysFor(property, matrixKind, runtime) >
                          processTargetDaysFor(runtime)
                            ? "bg-red-100 text-red-700"
                            : processDaysFor(property, matrixKind, runtime) >=
                                processTargetDaysFor(runtime) * 0.8
                              ? "bg-amber-100 text-amber-700"
                              : statusFor(property, matrixKind) === "Cerrado"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        <Clock3 size={10} /> {processDaysFor(property, matrixKind, runtime)} días
                      </span>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td
                      colSpan={activeStages.length + 5}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      No existen predios para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section data-print-hidden className="mt-2">
          <div className="mb-1 text-[9px] font-extrabold uppercase tracking-wide text-slate-500">
            Resumen de resultados de la matriz
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 2xl:grid-cols-6">
            <Kpi
              label="Predios visibles"
              value={filtered.length}
              detail={`De ${privateProperties.length} predios registrados`}
            />
            <Kpi
              label="Avance promedio"
              value={`${averageProgress.toFixed(1)}%`}
              detail="Porcentaje de etapas alcanzadas"
              tone="blue"
            />
            <Kpi
              label="Tiempo promedio"
              value={`${Math.round(averageProcessDays)} días`}
              detail={`Plazo legal: ${processTermFor(runtime)} · Hitos: ${processTargetDaysFor(runtime)} días`}
              tone="slate"
            />
            <Kpi label="En riesgo" value={atRisk} detail="Requieren prioridad" tone="amber" />
            <Kpi
              label={matrixKind === "predial" ? "Observados SUNARP" : "Observados"}
              value={observed}
              detail="Por subsanar"
              tone="red"
            />
            <Kpi label="Cerrados" value={closed} detail="Proceso culminado" tone="green" />
          </div>
        </section>
      </main>

      {selected && (
        <StageDetailModal selected={selected} runtime={runtime} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allValue,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allValue: string;
  allLabel: string;
}) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[8px] font-extrabold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-7 w-full rounded border border-slate-300 bg-white px-2 text-[10px] font-medium outline-none focus:border-red-500"
      >
        <option value={allValue}>{allLabel}</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Kpi({
  label,
  value,
  detail,
  tone = "slate",
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: "slate" | "blue" | "amber" | "red" | "green";
}) {
  const tones = {
    slate: "border-slate-300 border-l-slate-500 bg-slate-50 text-slate-950",
    blue: "border-blue-200 border-l-blue-500 bg-blue-50 text-blue-800",
    amber: "border-amber-200 border-l-amber-500 bg-amber-50 text-amber-800",
    red: "border-rose-200 border-l-rose-500 bg-rose-50 text-rose-800",
    green: "border-emerald-200 border-l-emerald-500 bg-emerald-50 text-emerald-800",
  };
  return (
    <article className={`rounded-lg border border-l-4 px-3 py-2 shadow-sm ${tones[tone]}`}>
      <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-600">
        {label}
      </div>
      <div className="text-2xl font-black leading-7 tabular-nums">{value}</div>
      <div className="text-[10px] font-medium text-slate-600">{detail}</div>
    </article>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className={`size-3 rounded-sm ${color}`} /> {label}
    </span>
  );
}

function StageDetailModal({
  selected,
  runtime,
  onClose,
}: {
  selected: SelectedStage;
  runtime: MatrixRuntime;
  onClose: () => void;
}) {
  const { property, stageIndex, matrixKind } = selected;
  const matrixStages = runtime.stages;
  const currentStage = currentStageFor(property, matrixKind, matrixStages.length);
  const currentStatus = statusFor(property, matrixKind);
  const stage = matrixStages[stageIndex];
  const condition = stageCondition(property, stageIndex, matrixKind, runtime);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[1px]"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="private-property-stage-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 bg-slate-950 px-5 py-4 text-white">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-red-300">
              {matrixCopy[matrixKind].tab} · {property.code}
            </div>
            <h2 id="private-property-stage-title" className="mt-1 text-lg font-bold">
              {stage.label}
            </h2>
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

        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-10">
            <DetailValue label="Condición" value={condition} tone={conditionTone(condition)} />
            <DetailValue
              label="Inicio de etapa"
              value={dateForStage(property, stageIndex, matrixKind, runtime)}
            />
            <DetailValue
              label="Tiempo en etapa"
              value={stageDaysLabel(property, stageIndex, matrixKind, runtime)}
              tone={
                condition === "Etapa actual"
                  ? "amber"
                  : condition === "Completada"
                    ? "green"
                    : "slate"
              }
            />
            <DetailValue
              label="Tiempo total"
              value={`${processDaysFor(property, matrixKind, runtime)} días`}
              tone="blue"
            />
            <DetailValue
              label="Plazo objetivo"
              value={`${targetDaysFor(runtime, stageIndex)} días`}
              tone="orange"
            />
            <DetailValue
              label="Aviso desde"
              value={`${runtime.warningDays[stageIndex]} días`}
              tone="amber"
            />
            <DetailValue
              label="Crítico desde"
              value={`${runtime.criticalDays[stageIndex]} días`}
              tone="orange"
            />
            <DetailValue
              label="Meta del proceso"
              value={`${processTermFor(runtime)} · ${processTargetDaysFor(runtime)} días en hitos`}
              tone="orange"
            />
            <DetailValue
              label={matrixKind === "predial" ? "Modalidad" : "Expediente"}
              value={secondaryValueFor(property, matrixKind)}
            />
            <DetailValue label="Responsable" value={property.responsible} />
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-[11px] font-bold text-slate-800">¿Por qué llegó a esta etapa?</h3>
            <p className="mt-2 text-[11px] leading-5 text-slate-600">
              {reasonForStage(property, stageIndex, matrixKind, runtime)}
            </p>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="text-[9px] font-bold uppercase text-blue-700">
                Evidencia requerida
              </div>
              <p className="mt-1 text-[10px] leading-4 text-blue-900">{stage.evidence}.</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <div className="text-[9px] font-bold uppercase text-emerald-700">
                Siguiente acción
              </div>
              <p className="mt-1 text-[10px] leading-4 text-emerald-900">
                {condition === "Pendiente"
                  ? `Primero completar “${matrixStages[currentStage].label}”.`
                  : stage.nextAction.charAt(0).toUpperCase() + stage.nextAction.slice(1)}
                .
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[11px] font-bold text-slate-800">Ficha del predio</h3>
              <StatusBadge status={currentStatus} />
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] sm:grid-cols-4">
              <Info label="Proyecto" value={property.project} />
              <Info label="Titular" value={property.owner} />
              <Info label="Etapa actual" value={matrixStages[currentStage].label} />
              <Info label="Actualización" value={updatedAtFor(property, matrixKind)} />
            </dl>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5">
              <div>
                <h3 className="text-[11px] font-bold text-slate-800">Tiempo por cada etapa</h3>
                <p className="mt-0.5 text-[9px] text-slate-500">
                  Fechas y permanencia acumulada al corte del {updatedAtFor(property, matrixKind)}.
                </p>
              </div>
              <div className="rounded-full bg-slate-900 px-3 py-1 text-[9px] font-bold text-white">
                {currentStage + 1} de {matrixStages.length} etapas alcanzadas
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {matrixStages.map((timelineStage, index) => {
                const timing = stageTimingFor(property, index, matrixKind, runtime);
                const isSelected = index === stageIndex;
                const isCurrent = timing.condition === "Etapa actual";
                const targetDays = targetDaysFor(runtime, index);
                const isLate = timing.days !== null && timing.days > targetDays;
                return (
                  <div
                    key={timelineStage.label}
                    className={`grid grid-cols-[24px_minmax(150px,1fr)] items-center gap-2 px-3 py-2 text-[10px] sm:grid-cols-[24px_minmax(190px,1.5fr)_110px_180px_115px] ${
                      isSelected ? "bg-red-50 ring-1 ring-inset ring-red-200" : "bg-white"
                    }`}
                  >
                    <span
                      className={`flex size-5 items-center justify-center rounded-full text-[8px] font-bold ${
                        timing.condition === "Completada"
                          ? "bg-sky-500 text-white"
                          : isCurrent
                            ? currentStatus === "Observado"
                              ? "bg-red-500 text-white"
                              : "bg-amber-400 text-amber-950"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {timing.condition === "Completada" ? <CheckCircle2 size={11} /> : index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-bold text-slate-700">{timelineStage.label}</div>
                      {isSelected && (
                        <div className="text-[8px] font-bold uppercase tracking-wide text-red-600">
                          Etapa seleccionada
                        </div>
                      )}
                    </div>
                    <span
                      className={`hidden w-fit rounded-full px-2 py-1 text-[8px] font-bold sm:inline-flex ${
                        timing.condition === "Completada"
                          ? "bg-sky-100 text-sky-700"
                          : isCurrent
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {timing.condition}
                    </span>
                    <div className="hidden text-[9px] text-slate-500 sm:block">
                      {timing.start && timing.end ? (
                        <>
                          <span className="font-semibold text-slate-700">
                            {formatDate(timing.start)}
                          </span>
                          <span className="mx-1">→</span>
                          <span>
                            {isCurrent ? `Corte ${formatDate(timing.end)}` : formatDate(timing.end)}
                          </span>
                        </>
                      ) : (
                        "Sin iniciar"
                      )}
                    </div>
                    <span
                      title={`Tiempo real frente al plazo objetivo de ${targetDays} días`}
                      className={`justify-self-end rounded-md border px-2 py-1 text-[9px] font-bold tabular-nums ${
                        timing.days === null
                          ? "border-orange-300 bg-white text-slate-400"
                          : isLate
                            ? "border-red-300 bg-red-50 text-red-700"
                            : "border-orange-400 bg-orange-50 text-orange-700"
                      }`}
                    >
                      {timing.days === null
                        ? `Meta ${targetDays} d`
                        : `${timing.days} / ${targetDays} d`}
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

function conditionTone(condition: string) {
  if (condition === "Completada") return "green" as const;
  if (condition === "Etapa actual") return "amber" as const;
  return "slate" as const;
}

function DetailValue({
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[8px] font-bold uppercase text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-semibold text-slate-700">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: PredioStatus }) {
  const cls =
    status === "Cerrado"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Observado"
        ? "bg-red-100 text-red-700"
        : status === "En riesgo"
          ? "bg-amber-100 text-amber-700"
          : "bg-blue-100 text-blue-700";
  return <span className={`rounded-full px-2 py-1 text-[9px] font-bold ${cls}`}>{status}</span>;
}

async function exportPrivatePropertiesExcel(
  rows: PrivateProperty[],
  matrixKind: MatrixKind,
  runtime: MatrixRuntime,
) {
  const matrixStages = runtime.stages;
  const matrixHeaders = [
    "Código",
    "Proyecto",
    "Periodo",
    "Titular",
    matrixKind === "predial" ? "Modalidad" : "Expediente",
    "Fecha de inicio",
    "Responsable",
    "Etapa actual",
    "Estado",
    ...matrixStages.map(
      (stage, index) => `${stage.label} (meta ${targetDaysFor(runtime, index)} días)`,
    ),
    "% avance",
    "Última actualización",
    "Días en proceso",
    "Plazo total (días)",
    "Desviación total (días)",
  ];
  const matrixData: SheetData = [excelHeader(matrixHeaders)];
  rows.forEach((property) => {
    matrixData.push([
      { value: property.code, type: String },
      { value: property.project, type: String },
      { value: property.period, type: String },
      { value: property.owner, type: String },
      { value: secondaryValueFor(property, matrixKind), type: String },
      { value: dateForStage(property, 0, matrixKind, runtime), type: String },
      { value: property.responsible, type: String },
      {
        value: matrixStages[currentStageFor(property, matrixKind, matrixStages.length)].label,
        type: String,
        fontWeight: "bold",
      },
      { value: statusFor(property, matrixKind), type: String },
      ...matrixStages.map((_, index) => ({
        value: stageCondition(property, index, matrixKind, runtime),
        type: String,
        backgroundColor:
          stageCondition(property, index, matrixKind, runtime) === "Completada"
            ? "#7DD3FC"
            : stageCondition(property, index, matrixKind, runtime) === "Etapa actual"
              ? statusFor(property, matrixKind) === "Observado"
                ? "#FCA5A5"
                : "#FCD34D"
              : "#FFFFFF",
      })),
      { value: progressFor(property, matrixKind, runtime) / 100, type: Number, format: "0.00%" },
      { value: updatedAtFor(property, matrixKind), type: String },
      { value: processDaysFor(property, matrixKind, runtime), type: Number, fontWeight: "bold" },
      { value: processTargetDaysFor(runtime), type: Number, fontWeight: "bold" },
      {
        value: processDaysFor(property, matrixKind, runtime) - processTargetDaysFor(runtime),
        type: Number,
        fontWeight: "bold",
      },
    ]);
  });

  const detailHeaders = [
    "Código",
    "Proyecto",
    secondaryLabelFor(matrixKind),
    "Etapa",
    "Condición",
    "Fecha de inicio",
    "Fecha fin / corte",
    "Días en etapa",
    "Plazo objetivo (días)",
    "Desviación (días)",
    "Motivo",
    "Evidencia requerida",
    "Siguiente acción",
    "Responsable",
  ];
  const detailData: SheetData = [excelHeader(detailHeaders)];
  rows.forEach((property) => {
    matrixStages.forEach((stage, index) => {
      const timing = stageTimingFor(property, index, matrixKind, runtime);
      detailData.push([
        { value: property.code, type: String },
        { value: property.project, type: String },
        { value: secondaryValueFor(property, matrixKind), type: String },
        { value: stage.label, type: String },
        { value: stageCondition(property, index, matrixKind, runtime), type: String },
        { value: timing.start ? formatDate(timing.start) : "—", type: String },
        { value: timing.end ? formatDate(timing.end) : "—", type: String },
        { value: timing.days ?? 0, type: Number },
        { value: targetDaysFor(runtime, index), type: Number },
        {
          value: timing.days === null ? 0 : timing.days - targetDaysFor(runtime, index),
          type: Number,
        },
        { value: reasonForStage(property, index, matrixKind, runtime), type: String, wrap: true },
        { value: stage.evidence, type: String, wrap: true },
        { value: stage.nextAction, type: String, wrap: true },
        { value: property.responsible, type: String },
      ]);
    });
  });

  await writeExcelFile([
    {
      data: matrixData,
      sheet: matrixKind === "mejoras" ? "Matriz pago de mejoras" : "Matriz de etapas",
      stickyRowsCount: 1,
      orientation: "landscape",
      showGridLines: true,
      columns: matrixHeaders.map((header, index) => ({
        width: index < 8 ? Math.min(28, Math.max(14, header.length + 2)) : 18,
      })),
    },
    {
      data: detailData,
      sheet: matrixKind === "mejoras" ? "Detalle pago de mejoras" : "Detalle de etapas",
      stickyRowsCount: 1,
      orientation: "landscape",
      showGridLines: true,
      columns: detailHeaders.map((header) => ({
        width: ["Motivo", "Evidencia requerida", "Siguiente acción"].includes(header)
          ? 42
          : Math.min(28, Math.max(14, header.length + 2)),
      })),
    },
  ]).toFile(
    `seguimiento_${matrixCopy[matrixKind].exportName}_2026_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}

function excelHeader(headers: string[]): SheetData[number] {
  return headers.map((header) => ({
    value: header,
    fontWeight: "bold",
    backgroundColor: "#111827",
    textColor: "#FFFFFF",
    align: "center",
    wrap: true,
    height: 32,
  }));
}
