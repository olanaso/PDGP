import type { PredioRow } from "@/lib/prediosData";

export type PredioProcessKind = "privado" | "estatal" | "mejoras" | "sin-clasificar";

export type PredioSummary = {
  processKind: PredioProcessKind;
  condition: string;
  conditionInferred: boolean;
  modality: string;
  modalityPending: boolean;
  stage: string;
  stageEvidence: string;
  stageProgress: number;
  sourceStatus: string;
};

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function hasValue(value: string | null | undefined) {
  const normalized = normalize(value);
  return Boolean(
    normalized && !["NO", "N/A", "SIN INFORMACION", "SIN INFORMACIÓN", "-"].includes(normalized),
  );
}

function processKindFor(row: PredioRow): PredioProcessKind {
  const condition = normalize(row.condicionPredio);
  const modality = normalize(row.mod);

  if (condition.includes("RECONOCIMIENTO") || modality.includes("RECONOCIMIENTO")) return "mejoras";
  if (condition.includes("ESTATAL") || modality.includes("TRANSFERENCIA")) return "estatal";
  if (
    condition.includes("PRIVADO") ||
    modality.includes("TRATO DIRECTO") ||
    modality.includes("EXPROPI") ||
    modality.includes("ENTREGA ANTICIPADA")
  )
    return "privado";
  return "sin-clasificar";
}

function inferredCondition(kind: PredioProcessKind) {
  if (kind === "privado") return "PRIVADO";
  if (kind === "estatal") return "ESTATAL";
  if (kind === "mejoras") return "RECONOCIMIENTO DE MEJORAS";
  return "PENDIENTE DE CLASIFICACIÓN";
}

function modalityFor(row: PredioRow, kind: PredioProcessKind) {
  if (hasValue(row.mod)) return row.mod.trim();
  if (kind === "estatal") return "TRANSFERENCIA / SANEAMIENTO ESTATAL";
  if (kind === "mejoras") return "RECONOCIMIENTO DE MEJORAS";
  return "PENDIENTE DE CLASIFICACIÓN";
}

function stageFor(row: PredioRow) {
  const registration = normalize(`${row.estado} ${row.etit}`);

  if (hasValue(row.finsc) || registration.includes("INSCRIT") || normalize(row.estado) === "SI")
    return {
      stage: "Inscripción registral concluida",
      evidence: "El padrón registra la inscripción o su fecha de conclusión.",
      progress: 100,
    };

  if (hasValue(row.titulo) || hasValue(row.ftit) || hasValue(row.etit))
    return {
      stage: "Inscripción registral en trámite",
      evidence: "Existe título presentado o estado de trámite ante SUNARP.",
      progress: 90,
    };

  if (hasValue(row.acta) || hasValue(row.trans) || hasValue(row.fr))
    return {
      stage: "Entrega de posesión",
      evidence: "Existe recepción en campo, acta o fecha de entrega.",
      progress: 82,
    };

  if (hasValue(row.pago))
    return {
      stage: "Devengado, pago o consignación",
      evidence: "El padrón registra información de devengado o pago.",
      progress: 72,
    };

  if (hasValue(row.res) || hasValue(row.nres))
    return {
      stage: "Resolución de adquisición",
      evidence: "El predio cuenta con número de resolución registrado.",
      progress: 62,
    };

  if (hasValue(row.valor))
    return {
      stage: "Tasación",
      evidence: "El padrón registra un monto de tasación o adquisición.",
      progress: 50,
    };

  if (hasValue(row.exp))
    return {
      stage: "Expediente técnico-legal",
      evidence: "Existe un expediente predial asociado.",
      progress: 38,
    };

  if (hasValue(row.part) || hasValue(row.area) || hasValue(row.rlegal) || hasValue(row.rtec))
    return {
      stage: "Diagnóstico técnico-legal",
      evidence: "Existen datos de partida, área afectada o responsables.",
      progress: 25,
    };

  if (
    hasValue(row.condicionPredio) ||
    hasValue(row.mod) ||
    (hasValue(row.suj) && normalize(row.suj) !== "SIN INFORMACION")
  )
    return {
      stage: "Identificación y codificación",
      evidence: "El código y la condición preliminar del predio están identificados.",
      progress: 15,
    };

  return {
    stage: "Identificado / individualizado",
    evidence: "El predio cuenta con código y geometría en el mapa.",
    progress: 8,
  };
}

export function buildPredioSummary(row: PredioRow): PredioSummary {
  const processKind = processKindFor(row);
  const stage = stageFor(row);
  const conditionInferred = !hasValue(row.condicionPredio);
  const modality = modalityFor(row, processKind);

  return {
    processKind,
    condition: conditionInferred ? inferredCondition(processKind) : row.condicionPredio.trim(),
    conditionInferred,
    modality,
    modalityPending: normalize(modality).includes("PENDIENTE"),
    stage: stage.stage,
    stageEvidence: stage.evidence,
    stageProgress: stage.progress,
    sourceStatus:
      normalize(row.com) === "COINCIDE" ? "Consolidado con padrón" : "Información preliminar",
  };
}
