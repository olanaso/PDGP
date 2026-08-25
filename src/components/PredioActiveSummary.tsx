import {
  AlertCircle,
  Building2,
  CalendarClock,
  FileText,
  Landmark,
  MapPinned,
  Route,
  UserRound,
} from "lucide-react";

import { getPredioByCodigo } from "@/lib/prediosData";
import { buildPredioSummary, type PredioProcessKind } from "@/lib/predioSummary";

const kindStyle: Record<PredioProcessKind, string> = {
  privado: "border-blue-200 bg-blue-50 text-blue-700",
  estatal: "border-violet-200 bg-violet-50 text-violet-700",
  mejoras: "border-amber-200 bg-amber-50 text-amber-800",
  "sin-clasificar": "border-gray-200 bg-gray-50 text-gray-600",
};

function processLabel(kind: PredioProcessKind) {
  if (kind === "privado") return "Predio privado";
  if (kind === "estatal") return "Predio estatal";
  if (kind === "mejoras") return "Reconocimiento de mejoras";
  return "Sin clasificar";
}

function valueOrPending(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.toUpperCase() === "SIN INFORMACION") return "Pendiente de registrar";
  return trimmed;
}

function SummaryField({
  label,
  value,
  icon: Icon,
  mono = false,
}: {
  label: string;
  value: string;
  icon: typeof FileText;
  mono?: boolean;
}) {
  return (
    <div className="flex gap-2.5 border-b border-[#f3f4f6] py-2.5 last:border-b-0">
      <Icon size={14} className="mt-0.5 shrink-0 text-[#dc2626]" />
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-[#9ca3af]">{label}</p>
        <p
          className={`mt-0.5 break-words text-[11px] font-medium leading-4 text-[#374151] ${
            mono ? "font-mono" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function PredioActiveSummary({ codigo }: { codigo: string }) {
  const predio = getPredioByCodigo(codigo);

  if (!predio) {
    return (
      <aside
        data-predio-summary
        className="fixed bottom-3 right-3 top-[73px] z-30 hidden w-[344px] overflow-hidden rounded-md border border-[#fecaca] bg-white shadow-sm xl:flex xl:flex-col"
      >
        <div className="bg-[#ef4444] px-4 py-3 text-[11px] font-semibold uppercase text-white">
          Información del predio activo
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <AlertCircle size={28} className="text-[#f87171]" />
          <p className="mt-3 text-[12px] font-semibold text-[#374151]">Predio no encontrado</p>
          <p className="mt-1 text-[11px] leading-4 text-[#6b7280]">
            No existe información consolidada para el código seleccionado.
          </p>
        </div>
      </aside>
    );
  }

  const summary = buildPredioSummary(predio);

  return (
    <aside
      data-predio-summary
      className="fixed bottom-3 right-3 top-[73px] z-30 hidden w-[344px] overflow-hidden rounded-md border border-[#fecaca] bg-white shadow-sm xl:flex xl:flex-col"
    >
      <div className="bg-[#ef4444] px-4 py-3 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-wide">
          Información del predio activo
        </p>
        <p className="mt-1 truncate font-mono text-[12px] font-bold" title={codigo}>
          {codigo}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="border-b border-[#e5e7eb] p-4">
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${kindStyle[summary.processKind]}`}
            >
              {processLabel(summary.processKind)}
            </span>
            <span className="inline-flex rounded-full border border-[#e5e7eb] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#6b7280]">
              {summary.sourceStatus}
            </span>
          </div>

          <div className="mt-4 rounded-md border border-[#e5e7eb] bg-[#fafafa] p-3">
            <div className="flex items-start gap-2.5">
              <Route size={16} className="mt-0.5 shrink-0 text-[#dc2626]" />
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-[#9ca3af]">
                  Ruta de gestión
                </p>
                <p className="mt-1 text-[11px] font-semibold text-[#1f2937]">{summary.condition}</p>
                <p
                  className={`mt-1 text-[11px] leading-4 ${
                    summary.modalityPending ? "font-semibold text-amber-700" : "text-[#4b5563]"
                  }`}
                >
                  {summary.modality}
                </p>
                {summary.conditionInferred && (
                  <p className="mt-1 text-[9px] leading-3 text-[#9ca3af]">
                    Condición inferida a partir de la modalidad registrada.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#e5e7eb] p-4">
          <div className="flex items-center gap-2 text-[#dc2626]">
            <CalendarClock size={15} />
            <h2 className="text-[10px] font-bold uppercase tracking-wide">Etapa actual</h2>
          </div>
          <p className="mt-3 text-[13px] font-bold leading-5 text-[#1f2937]">{summary.stage}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f3f4f6]">
            <div
              className="h-full rounded-full bg-[#ef4444]"
              style={{ width: `${summary.stageProgress}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[9px] text-[#9ca3af]">
            <span>Inicio</span>
            <span>{summary.stageProgress}% referencial</span>
          </div>
          <p className="mt-3 rounded bg-[#fff7ed] px-2.5 py-2 text-[10px] leading-4 text-[#9a3412]">
            {summary.stageEvidence}
          </p>
        </section>

        <section className="px-4 py-3">
          <div className="flex items-center gap-2 border-b border-[#fecaca] pb-2 text-[#dc2626]">
            <MapPinned size={15} />
            <h2 className="text-[10px] font-bold uppercase tracking-wide">Identificación</h2>
          </div>
          <SummaryField label="Código" value={codigo} icon={FileText} mono />
          <SummaryField label="Sujeto pasivo" value={valueOrPending(predio.suj)} icon={UserRound} />
          <SummaryField
            label="Expediente"
            value={valueOrPending(predio.exp)}
            icon={FileText}
            mono
          />
          <SummaryField
            label="Tipo de predio"
            value={valueOrPending(predio.tipo || predio.tp)}
            icon={Building2}
          />
          <SummaryField
            label="Área afectada"
            value={predio.area ? `${predio.area} m²` : "Pendiente de registrar"}
            icon={Landmark}
          />
        </section>
      </div>

      <div className="border-t border-[#e5e7eb] bg-[#f9fafb] px-4 py-2.5 text-[9px] leading-3 text-[#6b7280]">
        Resumen de solo lectura generado con la información disponible del padrón y del mapa.
      </div>
    </aside>
  );
}
