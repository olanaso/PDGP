import type { PredioRow } from "./prediosData";

export const FULL_PREDIO_TRACKING_STAGES = [
  { label: "Ingreso", targetDays: 5 },
  { label: "Elaboración técnico-legal", targetDays: 15 },
  { label: "Revisión técnica", targetDays: 10 },
  { label: "Subsanación", targetDays: 10 },
  { label: "Conforme", targetDays: 5 },
  { label: "Enviado a tasación", targetDays: 5 },
  { label: "En tasación", targetDays: 25 },
  { label: "Informe recibido", targetDays: 5 },
  { label: "Aprobado", targetDays: 5 },
] as const;

export const FULL_PREDIO_TRACKING_TARGET_DAYS = FULL_PREDIO_TRACKING_STAGES.reduce(
  (total, stage) => total + stage.targetDays,
  0,
);

const TRACKING_DAY_MS = 86_400_000;

export function fullPredioTrackingStageIndex(row: PredioRow) {
  const source = `${row.etit} ${row.estado} ${row.trans} ${row.pago}`.toUpperCase();
  if (/INSCRITO|RECEPCIONADO|OPAT/.test(source)) return 8;
  if (/APROBADO|PAGADO/.test(source)) return 7;
  if (/TASACI/.test(source)) return 6;
  if (row.exp) return 5;
  if (/CONFORME|SI/.test(source)) return 4;
  if (/OBSERV/.test(source)) return 3;
  const seed = Array.from(row.codigo).reduce((total, char) => total + char.charCodeAt(0), 0);
  return seed % 4;
}

export function fullPredioTrackingStart(row: PredioRow) {
  const seed = Array.from(row.codigo).reduce((total, char) => total + char.charCodeAt(0), 0);
  return new Date(Date.UTC(2026, 0, 4 + (seed % 80)));
}

export function fullPredioTrackingStageTiming(row: PredioRow, stageIndex: number) {
  const currentStage = fullPredioTrackingStageIndex(row);
  if (stageIndex > currentStage)
    return { condition: "Pendiente" as const, start: null, end: null, days: null };
  const seed = Array.from(row.codigo).reduce((total, char) => total + char.charCodeAt(0), 0);
  const previousDays = FULL_PREDIO_TRACKING_STAGES.slice(0, stageIndex).reduce(
    (total, stage, index) => total + Math.max(2, stage.targetDays - 3 + ((seed + index) % 5)),
    0,
  );
  const start = new Date(fullPredioTrackingStart(row).getTime() + previousDays * TRACKING_DAY_MS);
  if (stageIndex < currentStage) {
    const realDays = Math.max(
      2,
      FULL_PREDIO_TRACKING_STAGES[stageIndex].targetDays - 3 + ((seed + stageIndex) % 5),
    );
    return {
      condition: "Completada" as const,
      start,
      end: new Date(start.getTime() + (realDays - 1) * TRACKING_DAY_MS),
      days: realDays,
    };
  }
  const cutOff = new Date(Date.UTC(2026, 7, 5));
  return {
    condition: "Etapa actual" as const,
    start,
    end: cutOff,
    days: Math.max(1, Math.floor((cutOff.getTime() - start.getTime()) / TRACKING_DAY_MS) + 1),
  };
}

export function fullPredioTrackingProcessDays(row: PredioRow) {
  return Math.max(
    1,
    Math.floor(
      (new Date(Date.UTC(2026, 7, 5)).getTime() - fullPredioTrackingStart(row).getTime()) /
        TRACKING_DAY_MS,
    ) + 1,
  );
}

export function formatFullPredioTrackingDate(date: Date) {
  return date.toLocaleDateString("es-PE", { timeZone: "UTC" });
}
