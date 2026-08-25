import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  Copy,
  Gavel,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Trash2,
  Users,
} from "lucide-react";

export type ProcessType = "trato-directo" | "expropiacion" | "estatales" | "mejoras";
export type AlertChannel = "Sistema" | "Sistema y correo" | "Sistema, correo y SMS";

export type Milestone = {
  id: string;
  number?: number | null;
  category: string;
  name: string;
  days: number;
  warningDay: number;
  criticalDay: number;
  repeatEvery: number;
  weight: number;
  responsible: string;
  evidence: string;
  channel: AlertChannel;
  active: boolean;
};

export type ProcessConfig = {
  id: ProcessType;
  family: string;
  name: string;
  description: string;
  legalLimitDays: number;
  color: string;
  milestones: Milestone[];
};

export const ACQUISITION_MILESTONES_STORAGE_KEY = "mtc-acquisition-milestones-v2";
export const ACQUISITION_MILESTONES_UPDATED_EVENT = "mtc-acquisition-milestones-updated";

function stage(
  id: string,
  category: string,
  name: string,
  days: number,
  responsible: string,
  evidence: string,
  weight: number,
): Milestone {
  return {
    id,
    category,
    name,
    days,
    warningDay: Math.max(1, Math.round(days * 0.7)),
    criticalDay: Math.max(1, Math.round(days * 0.9)),
    repeatEvery: 2,
    weight,
    responsible,
    evidence,
    channel: "Sistema y correo",
    active: true,
  };
}

function numberedStage(
  id: string,
  number: number | null,
  category: string,
  name: string,
  days: number,
  responsible: string,
  evidence: string,
  weight: number,
) {
  return {
    ...stage(id, category, name, days, responsible, evidence, weight),
    number,
  };
}

// Compartido con el Gantt predial para usar exactamente los mismos plazos configurables.
// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_CONFIGS: ProcessConfig[] = [
  {
    id: "trato-directo",
    family: "1. Adquisición de predios privados",
    name: "1.1. Trato directo",
    description: "Adquisición por aceptación de la oferta, pago y entrega de posesión.",
    legalLimitDays: 180,
    color: "#2563eb",
    milestones: [
      stage(
        "td-1",
        "Diagnóstico",
        "Identificado / individualizado",
        12,
        "Equipo técnico",
        "Ficha de identificación",
        6,
      ),
      stage(
        "td-2",
        "Diagnóstico",
        "Diagnóstico técnico-legal",
        18,
        "Técnico / Legal",
        "Informe técnico-legal",
        8,
      ),
      stage(
        "td-3",
        "Expediente",
        "Expediente técnico-legal completo",
        22,
        "Coordinador predial",
        "Expediente validado",
        12,
      ),
      stage("td-4", "Tasación", "En tasación", 18, "Perito tasador", "Cargo de envío al perito", 8),
      stage("td-5", "Tasación", "Tasado", 8, "Coordinador de tasaciones", "Informe de tasación", 8),
      stage(
        "td-6",
        "Negociación",
        "Oferta y trato directo",
        25,
        "Especialista legal",
        "Carta de intención notificada",
        12,
      ),
      stage("td-7", "Negociación", "Aceptado", 10, "Sujeto pasivo", "Carta de aceptación", 8),
      stage(
        "td-8",
        "Formalización",
        "Resolución aprobada",
        15,
        "Asesoría legal",
        "Resolución emitida",
        10,
      ),
      stage("td-9", "Pago", "Devengado", 12, "Administración", "Comprobante de devengado", 7),
      stage("td-10", "Pago", "Pago programado", 10, "Tesorería", "Programación de pago", 6),
      stage("td-11", "Pago", "Pagado", 15, "Tesorería", "Comprobante de pago", 8),
      stage("td-12", "Cierre", "Posesión entregada", 15, "Equipo predial", "Acta de entrega", 7),
    ],
  },
  {
    id: "expropiacion",
    family: "1. Adquisición de predios privados",
    name: "1.2. Expropiación de predios",
    description: "Proceso expropiatorio cuando no se concreta el trato directo.",
    legalLimitDays: 180,
    color: "#dc2626",
    milestones: [
      stage(
        "exp-1",
        "Diagnóstico",
        "Predio identificado y diagnóstico concluido",
        15,
        "Equipo técnico-legal",
        "Informe técnico-legal",
        8,
      ),
      stage(
        "exp-2",
        "Expediente",
        "Expediente técnico-legal completo",
        20,
        "Coordinador predial",
        "Expediente validado",
        12,
      ),
      stage(
        "exp-3",
        "Tasación",
        "Tasación aprobada",
        20,
        "Perito tasador",
        "Informe de tasación",
        10,
      ),
      stage(
        "exp-4",
        "Trato directo",
        "Oferta notificada",
        15,
        "Especialista legal",
        "Cargo de notificación",
        8,
      ),
      stage(
        "exp-5",
        "Trato directo",
        "Rechazo o vencimiento de oferta",
        15,
        "Especialista legal",
        "Acta o constancia",
        8,
      ),
      stage(
        "exp-6",
        "Expropiación",
        "Expediente de expropiación",
        25,
        "Asesoría legal",
        "Proyecto normativo",
        15,
      ),
      stage(
        "exp-7",
        "Expropiación",
        "Norma de expropiación emitida",
        25,
        "Alta dirección",
        "Norma publicada",
        15,
      ),
      stage(
        "exp-8",
        "Pago",
        "Consignación / pago",
        20,
        "Tesorería",
        "Constancia de consignación",
        10,
      ),
      stage(
        "exp-9",
        "Cierre",
        "Ejecución coactiva y posesión",
        15,
        "Procuraduría / Predial",
        "Acta de posesión",
        8,
      ),
      stage(
        "exp-10",
        "Registro",
        "Inscripción registral",
        10,
        "Especialista registral",
        "Asiento registral",
        6,
      ),
    ],
  },
  {
    id: "estatales",
    family: "2. Transferencia de predios estatales",
    name: "2. Transferencia de predios estatales",
    description: "Saneamiento, trámite interinstitucional y transferencia del predio estatal.",
    legalLimitDays: 90,
    color: "#059669",
    milestones: [
      stage(
        "est-1",
        "Pendiente",
        "Identificación de entidad titular",
        8,
        "Equipo técnico",
        "Partida y consulta institucional",
        10,
      ),
      stage(
        "est-2",
        "Pendiente",
        "Diagnóstico técnico-legal",
        10,
        "Técnico / Legal",
        "Informe técnico-legal",
        12,
      ),
      stage(
        "est-3",
        "En trámite",
        "Solicitud a entidad propietaria",
        10,
        "Especialista legal",
        "Oficio y cargo de recepción",
        10,
      ),
      stage(
        "est-4",
        "En trámite",
        "Evaluación y saneamiento",
        18,
        "Entidad propietaria",
        "Informe de saneamiento",
        18,
      ),
      stage(
        "est-5",
        "En trámite",
        "Tasación o valorización",
        12,
        "Perito tasador",
        "Informe de valorización",
        12,
      ),
      stage(
        "est-6",
        "En trámite",
        "Resolución / acto administrativo",
        14,
        "Asesoría legal",
        "Resolución emitida",
        16,
      ),
      stage(
        "est-7",
        "Adquirido",
        "Transferencia e inscripción",
        10,
        "SUNARP / Legal",
        "Asiento registral",
        14,
      ),
      stage("est-8", "Adquirido", "Entrega de posesión", 8, "Equipo predial", "Acta de entrega", 8),
    ],
  },
  {
    id: "mejoras",
    family: "3. Pago de mejoras",
    name: "3. Pago de mejoras",
    description: "Identificación, valorización, aprobación y pago de mejoras.",
    legalLimitDays: 180,
    color: "#7c3aed",
    milestones: [
      stage(
        "mej-1",
        "Identificación",
        "Mejoras identificadas",
        15,
        "Equipo técnico",
        "Ficha e inventario fotográfico",
        8,
      ),
      stage(
        "mej-2",
        "Expediente",
        "Levantamiento e inventario",
        20,
        "Especialista técnico",
        "Planos y metrados",
        10,
      ),
      stage(
        "mej-3",
        "Expediente",
        "Expediente de mejoras completo",
        25,
        "Coordinador predial",
        "Expediente validado",
        15,
      ),
      stage(
        "mej-4",
        "Valuación",
        "Tasación de mejoras",
        20,
        "Perito tasador",
        "Informe de tasación",
        15,
      ),
      stage(
        "mej-5",
        "Valuación",
        "Valor aprobado",
        12,
        "Coordinador de tasaciones",
        "Conformidad de tasación",
        10,
      ),
      stage(
        "mej-6",
        "Conformidad",
        "Acta de aceptación",
        18,
        "Especialista legal",
        "Acta suscrita",
        12,
      ),
      stage("mej-7", "Pago", "Devengado", 15, "Administración", "Comprobante de devengado", 8),
      stage("mej-8", "Pago", "Pago programado", 15, "Tesorería", "Programación de pago", 7),
      stage("mej-9", "Pago", "Pagado", 20, "Tesorería", "Comprobante de pago", 10),
      stage("mej-10", "Cierre", "Entrega y cierre", 20, "Equipo predial", "Acta de cierre", 5),
    ],
  },
];

const PREDIAL_ACQUISITION_MILESTONES: Milestone[] = [
  numberedStage(
    "td-base-1",
    1,
    "INFORMACIÓN BASE – Diagnóstico e identificación del predio",
    "Diagnóstico general",
    5,
    "Equipo técnico-legal",
    "Ficha de diagnóstico general",
    5,
  ),
  numberedStage(
    "td-base-2",
    2,
    "INFORMACIÓN BASE – Diagnóstico e identificación del predio",
    "Asignación predial a la brigada",
    3,
    "Coordinador predial",
    "Registro de asignación e historial",
    5,
  ),
  numberedStage(
    "td-base-3",
    3,
    "INFORMACIÓN BASE – Diagnóstico e identificación del predio",
    "Diagnóstico preliminar",
    10,
    "Brigada predial",
    "Informe de diagnóstico preliminar",
    10,
  ),
  numberedStage(
    "td-base-4",
    4,
    "INFORMACIÓN BASE – Diagnóstico e identificación del predio",
    "Inspección de campo",
    10,
    "Brigada predial",
    "Acta de inspección, ficha y fotografías",
    10,
  ),
  numberedStage(
    "td-base-5",
    5,
    "INFORMACIÓN BASE – Diagnóstico e identificación del predio",
    "Registro de código predial",
    3,
    "Especialista técnico",
    "Ficha de identificación y codificación",
    5,
  ),
  numberedStage(
    "td-etapa-1",
    6,
    "ETAPA I – Diagnóstico técnico, adquisición y preparación de tasación",
    "ITL / Requerimiento de tasación",
    15,
    "Especialista técnico-legal",
    "ITL, requerimiento y cargo de remisión",
    15,
  ),
  numberedStage(
    "td-etapa-2-itt",
    7,
    "ETAPA II – Tasación y disponibilidad presupuestal",
    "Obtención del ITT",
    30,
    "Perito / Coordinación de tasaciones",
    "Informe técnico de tasación",
    15,
  ),
  numberedStage(
    "td-etapa-2-ccp",
    8,
    "ETAPA II – Tasación y disponibilidad presupuestal",
    "N.° CCP",
    10,
    "Oficina de presupuesto",
    "Certificación de crédito presupuestario",
    10,
  ),
  numberedStage(
    "td-etapa-3-eap",
    9,
    "ETAPA III – Comunicación y aprobación de la adquisición",
    "Elevación del EAP",
    7,
    "Coordinador predial",
    "Documento de elevación y cargo",
    10,
  ),
  numberedStage(
    "td-etapa-3-rd",
    10,
    "ETAPA III – Comunicación y aprobación de la adquisición",
    "Emisión de RD",
    15,
    "Asesoría legal / Dirección",
    "Resolución directoral emitida",
    10,
  ),
  numberedStage(
    "td-etapa-4",
    11,
    "ETAPA IV – Pago y consignación",
    "Devengado",
    10,
    "Administración",
    "Registro y comprobante de devengado",
    5,
  ),
  numberedStage(
    "td-etapa-5",
    null,
    "ETAPA V – Entrega, saneamiento e inscripción registral",
    "Entrega, saneamiento e inscripción registral",
    30,
    "Equipo legal y registral",
    "Acta de entrega, título y asiento registral",
    0,
  ),
  numberedStage(
    "td-etapa-6",
    null,
    "ETAPA VI – Repositorio y cierre del predio",
    "Repositorio y cierre del predio",
    12,
    "Coordinador predial",
    "Expediente digital y acta de cierre",
    0,
  ),
];

const LEGACY_TRATO_DIRECTO_MILESTONES = DEFAULT_CONFIGS[0].milestones.map((item) => ({
  ...item,
}));

DEFAULT_CONFIGS[0] = {
  ...DEFAULT_CONFIGS[0],
  milestones: PREDIAL_ACQUISITION_MILESTONES,
};

function migrateDefaults(configs: ProcessConfig[]) {
  return configs.map((process) => {
    const usesLegacyDefaults =
      process.id === "trato-directo" &&
      JSON.stringify(process.milestones) === JSON.stringify(LEGACY_TRATO_DIRECTO_MILESTONES);

    return usesLegacyDefaults
      ? {
          ...process,
          milestones: PREDIAL_ACQUISITION_MILESTONES.map((item) => ({ ...item })),
        }
      : process;
  });
}

function cloneDefaults() {
  return DEFAULT_CONFIGS.map((process) => ({
    ...process,
    milestones: process.milestones.map((milestone) => ({ ...milestone })),
  }));
}

export function AcquisitionMilestonesConfig() {
  const [configs, setConfigs] = useState<ProcessConfig[]>(cloneDefaults);
  const [activeId, setActiveId] = useState<ProcessType>("trato-directo");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(ACQUISITION_MILESTONES_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as ProcessConfig[];
      if (Array.isArray(parsed) && parsed.length === 4) setConfigs(migrateDefaults(parsed));
    } catch {
      window.localStorage.removeItem(ACQUISITION_MILESTONES_STORAGE_KEY);
    }
  }, []);

  const active = configs.find((process) => process.id === activeId) ?? configs[0];
  const enabled = active.milestones.filter((item) => item.active);
  const activeDays = enabled.reduce((sum, item) => sum + item.days, 0);
  const totalWeight = enabled.reduce((sum, item) => sum + item.weight, 0);
  const difference = active.legalLimitDays - activeDays;
  const categories = [...new Set(active.milestones.map((item) => item.category))];

  function updateProcess(patch: Partial<ProcessConfig>) {
    setSaved(false);
    setConfigs((current) =>
      current.map((process) => (process.id === activeId ? { ...process, ...patch } : process)),
    );
  }

  function updateMilestone(id: string, patch: Partial<Milestone>) {
    updateProcess({
      milestones: active.milestones.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
  }

  function addMilestone() {
    updateProcess({
      milestones: [
        ...active.milestones,
        stage(
          `${activeId}-${Date.now()}`,
          categories.at(-1) ?? "Nueva categoría",
          "Nueva subetapa",
          5,
          "Por asignar",
          "Documento sustentatorio",
          5,
        ),
      ],
    });
  }

  function moveMilestone(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= active.milestones.length) return;
    const milestones = [...active.milestones];
    [milestones[index], milestones[target]] = [milestones[target], milestones[index]];
    updateProcess({ milestones });
  }

  function saveChanges() {
    window.localStorage.setItem(ACQUISITION_MILESTONES_STORAGE_KEY, JSON.stringify(configs));
    window.dispatchEvent(new Event(ACQUISITION_MILESTONES_UPDATED_EVENT));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  }

  function restoreDefaults() {
    setConfigs(cloneDefaults());
    window.localStorage.removeItem(ACQUISITION_MILESTONES_STORAGE_KEY);
    window.dispatchEvent(new Event(ACQUISITION_MILESTONES_UPDATED_EVENT));
    setSaved(false);
  }

  return (
    <section className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Settings2 size={18} className="text-red-600" />
              <h1 className="text-[16px] font-bold text-slate-800">
                Configuración de hitos, alertas y avance predial
              </h1>
            </div>
            <p className="mt-1 max-w-4xl text-[11px] leading-5 text-slate-500">
              Defina el plazo, evidencia, peso de avance y escalamiento de alertas para cada etapa.
              Estas reglas permiten medir individualmente el progreso de cada predio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={restoreDefaults}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-slate-300 px-3 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw size={13} /> Restaurar
            </button>
            <button
              type="button"
              onClick={saveChanges}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-red-600 px-3 text-[11px] font-semibold text-white hover:bg-red-700"
            >
              {saved ? <Check size={14} /> : <Save size={14} />}
              {saved ? "Configuración guardada" : "Guardar configuración"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Tipos de proceso
          </p>
          {configs.map((process, index) => {
            const total = process.milestones
              .filter((item) => item.active)
              .reduce((sum, item) => sum + item.days, 0);
            const selected = process.id === activeId;
            const showFamily = index === 0 || process.family !== configs[index - 1].family;
            return (
              <div key={process.id}>
                {showFamily && (
                  <p className="mb-1 mt-2 px-1 text-[10px] font-bold text-slate-700">
                    {process.family}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setActiveId(process.id)}
                  className={`w-full rounded-lg border p-3 text-left transition ${selected ? "border-red-200 bg-red-50 shadow-sm" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <ProcessIcon id={process.id} color={process.color} />
                    <ChevronRight
                      size={15}
                      className={selected ? "text-red-600" : "text-slate-300"}
                    />
                  </div>
                  <p className="mt-2 text-[11px] font-bold text-slate-700">{process.name}</p>
                  <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                    <span>{process.milestones.length} etapas</span>
                    <b
                      className={total > process.legalLimitDays ? "text-red-600" : "text-slate-700"}
                    >
                      {total}/{process.legalLimitDays} días
                    </b>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: total > process.legalLimitDays ? "#dc2626" : process.color,
                        width: `${Math.min(100, (total / process.legalLimitDays) * 100)}%`,
                      }}
                    />
                  </div>
                </button>
              </div>
            );
          })}
        </aside>

        <div className="min-w-0 space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
              <Field label="Nombre del proceso">
                <input
                  value={active.name}
                  onChange={(e) => updateProcess({ name: e.target.value })}
                  className="h-9 w-full rounded border border-slate-300 px-3 text-[11px] font-semibold outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </Field>
              <Field label="Plazo máximo">
                <NumberInput
                  value={active.legalLimitDays}
                  onChange={(value) => updateProcess({ legalLimitDays: value })}
                  suffix="días"
                />
              </Field>
            </div>
            <Field label="Descripción" className="mt-3">
              <input
                value={active.description}
                onChange={(e) => updateProcess({ description: e.target.value })}
                className="h-9 w-full rounded border border-slate-300 px-3 text-[11px] outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <SummaryCard label="Plazo máximo" value={`${active.legalLimitDays} días`} />
            <SummaryCard
              label="Tiempo asignado"
              value={`${activeDays} días`}
              alert={difference < 0}
            />
            <SummaryCard label="Etapas activas" value={enabled.length.toString()} />
            <SummaryCard
              label="Peso del avance"
              value={`${totalWeight}%`}
              alert={totalWeight !== 100}
            />
            <SummaryCard
              label={difference >= 0 ? "Margen" : "Exceso"}
              value={`${Math.abs(difference)} días`}
              alert={difference < 0}
            />
          </div>

          <AlertRules />

          {(difference < 0 || totalWeight !== 100) && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] text-red-700">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              {difference < 0 &&
                `El flujo excede el plazo máximo en ${Math.abs(difference)} días. `}
              {totalWeight !== 100 &&
                `El peso de las etapas activas debe sumar 100%; actualmente suma ${totalWeight}%.`}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2.5">
              <div>
                <h2 className="text-[12px] font-bold text-slate-800">
                  Etapas, evidencias y alertas
                </h2>
                <p className="text-[10px] text-slate-500">
                  El avance se acredita con la evidencia exigida; las alertas se calculan desde la
                  fecha de inicio de cada etapa.
                </p>
              </div>
              <button
                type="button"
                onClick={addMilestone}
                className="inline-flex h-8 items-center gap-1.5 rounded border border-red-200 bg-red-50 px-3 text-[11px] font-bold text-red-700 hover:bg-red-100"
              >
                <Plus size={13} /> Agregar etapa
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1800px] border-collapse text-[10px]">
                <thead className="bg-slate-50 text-left uppercase text-slate-500">
                  <tr>
                    <th className="w-12 px-2 py-2 text-center">N.°</th>
                    <th className="w-72 px-2 py-2">Etapa</th>
                    <th className="w-64 px-2 py-2">Descripción del hito</th>
                    <th className="w-24 px-2 py-2 text-center">Plazo</th>
                    <th className="w-24 bg-amber-50 px-2 py-2 text-center text-amber-700">
                      Preventiva
                    </th>
                    <th className="w-24 bg-red-50 px-2 py-2 text-center text-red-700">Crítica</th>
                    <th className="w-24 px-2 py-2 text-center">Repetir</th>
                    <th className="w-24 px-2 py-2 text-center">Peso %</th>
                    <th className="w-24 px-2 py-2 text-center">Acumulado %</th>
                    <th className="w-44 px-2 py-2">Responsable</th>
                    <th className="w-52 px-2 py-2">Evidencia de cierre</th>
                    <th className="w-44 px-2 py-2">Notificar por</th>
                    <th className="w-16 px-2 py-2 text-center">Activa</th>
                    <th className="w-36 px-2 py-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {active.milestones.map((item, index) => {
                    const accumulated = active.milestones
                      .slice(0, index + 1)
                      .filter((row) => row.active)
                      .reduce((sum, row) => sum + row.weight, 0);
                    return (
                      <tr
                        key={item.id}
                        className={`border-t border-slate-100 ${item.active ? "" : "bg-slate-50 opacity-60"}`}
                      >
                        <td className="px-2 py-2 text-center">
                          <b className="text-slate-500">
                            {"number" in item ? (item.number ?? "—") : index + 1}
                          </b>
                        </td>
                        <td className="px-2 py-2">
                          <TextInput
                            value={item.category}
                            onChange={(value) => updateMilestone(item.id, { category: value })}
                            list={`categories-${activeId}`}
                            strong
                          />
                        </td>
                        <td className="px-2 py-2">
                          <TextInput
                            value={item.name}
                            onChange={(value) => updateMilestone(item.id, { name: value })}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <CompactNumber
                            value={item.days}
                            onChange={(value) =>
                              updateMilestone(item.id, {
                                days: value,
                                warningDay: Math.min(item.warningDay, value),
                                criticalDay: Math.min(item.criticalDay, value),
                              })
                            }
                            tone="orange"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <CompactNumber
                            value={item.warningDay}
                            max={item.days}
                            onChange={(value) => updateMilestone(item.id, { warningDay: value })}
                            tone="amber"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <CompactNumber
                            value={item.criticalDay}
                            max={item.days}
                            onChange={(value) => updateMilestone(item.id, { criticalDay: value })}
                            tone="red"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <CompactNumber
                            value={item.repeatEvery}
                            onChange={(value) => updateMilestone(item.id, { repeatEvery: value })}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <CompactNumber
                            value={item.weight}
                            max={100}
                            onChange={(value) => updateMilestone(item.id, { weight: value })}
                            tone="blue"
                          />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className="inline-flex h-8 min-w-14 items-center justify-center rounded border border-blue-100 bg-blue-50 px-2 font-bold text-blue-700">
                            {item.weight > 0 ? `${accumulated}%` : "—"}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <TextInput
                            value={item.responsible}
                            onChange={(value) => updateMilestone(item.id, { responsible: value })}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <TextInput
                            value={item.evidence}
                            onChange={(value) => updateMilestone(item.id, { evidence: value })}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <select
                            value={item.channel}
                            onChange={(e) =>
                              updateMilestone(item.id, { channel: e.target.value as AlertChannel })
                            }
                            className="h-8 w-full rounded border border-slate-200 px-2 text-[10px] outline-none"
                          >
                            <option>Sistema</option>
                            <option>Sistema y correo</option>
                            <option>Sistema, correo y SMS</option>
                          </select>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <Toggle
                            active={item.active}
                            onClick={() => updateMilestone(item.id, { active: !item.active })}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex justify-center gap-1">
                            <IconButton
                              title="Subir"
                              disabled={index === 0}
                              onClick={() => moveMilestone(index, -1)}
                            >
                              <ArrowUp size={12} />
                            </IconButton>
                            <IconButton
                              title="Bajar"
                              disabled={index === active.milestones.length - 1}
                              onClick={() => moveMilestone(index, 1)}
                            >
                              <ArrowDown size={12} />
                            </IconButton>
                            <IconButton
                              title="Duplicar"
                              onClick={() =>
                                updateProcess({
                                  milestones: [
                                    ...active.milestones,
                                    {
                                      ...item,
                                      id: `${activeId}-${Date.now()}`,
                                      name: `${item.name} (copia)`,
                                    },
                                  ],
                                })
                              }
                            >
                              <Copy size={12} />
                            </IconButton>
                            <IconButton
                              title="Eliminar"
                              danger
                              onClick={() =>
                                updateProcess({
                                  milestones: active.milestones.filter((row) => row.id !== item.id),
                                })
                              }
                            >
                              <Trash2 size={12} />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <datalist id={`categories-${activeId}`}>
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
              <span>
                {enabled.filter((item) => item.weight > 0).length} hitos ponderados ·{" "}
                {categories.length} etapas
              </span>
              <span>
                Seguimiento acumulado: <b className="text-slate-800">{totalWeight}%</b> · Tiempo:{" "}
                <b className="text-slate-800">{activeDays} días</b>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AlertRules() {
  return (
    <div className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-3">
      <AlertRule
        color="bg-blue-500"
        title="En plazo"
        text="Desde el inicio hasta un día antes de la alerta preventiva."
      />
      <AlertRule
        color="bg-amber-500"
        title="Alerta preventiva"
        text="Notifica al responsable y coordinador para impulsar la etapa."
      />
      <AlertRule
        color="bg-red-500"
        title="Alerta crítica / vencida"
        text="Escala según el canal elegido y se repite con la frecuencia configurada."
      />
    </div>
  );
}

function AlertRule({ color, title, text }: { color: string; title: string; text: string }) {
  return (
    <div className="flex gap-2">
      <span className={`mt-1 size-2.5 shrink-0 rounded-full ${color}`} />
      <div>
        <p className="text-[10px] font-bold text-slate-700">{title}</p>
        <p className="text-[9px] leading-4 text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function ProcessIcon({ id, color }: { id: ProcessType; color: string }) {
  const icon =
    id === "mejoras" ? (
      <CircleDollarSign size={17} />
    ) : id === "estatales" ? (
      <Building2 size={17} />
    ) : id === "expropiacion" ? (
      <Gavel size={17} />
    ) : (
      <Users size={17} />
    );
  return (
    <span
      className="flex size-8 items-center justify-center rounded-lg"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {icon}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-3 shadow-sm ${alert ? "border-red-200" : "border-slate-200"}`}
    >
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-[18px] font-bold ${alert ? "text-red-600" : "text-slate-800"}`}>
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[10px] font-bold uppercase text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  suffix,
}: {
  value: number;
  onChange: (value: number) => void;
  suffix: string;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
        className="h-9 w-full rounded border border-slate-300 px-3 pr-12 text-[11px] font-bold outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
      />
      <span className="absolute right-3 top-2.5 text-[10px] text-slate-400">{suffix}</span>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  list,
  strong = false,
}: {
  value: string;
  onChange: (value: string) => void;
  list?: string;
  strong?: boolean;
}) {
  return (
    <input
      value={value}
      list={list}
      onChange={(e) => onChange(e.target.value)}
      className={`h-8 w-full rounded border border-slate-200 px-2 text-[10px] text-slate-700 outline-none focus:border-red-400 ${strong ? "font-semibold" : ""}`}
    />
  );
}

function CompactNumber({
  value,
  onChange,
  max,
  tone = "slate",
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  tone?: "slate" | "orange" | "amber" | "red" | "blue";
}) {
  const tones = {
    slate: "border-slate-200",
    orange: "border-orange-300 bg-orange-50 text-orange-800",
    amber: "border-amber-300 bg-amber-50 text-amber-800",
    red: "border-red-300 bg-red-50 text-red-700",
    blue: "border-blue-300 bg-blue-50 text-blue-700",
  };
  return (
    <input
      type="number"
      min={0}
      max={max}
      value={value}
      onChange={(e) => onChange(Math.max(0, Math.min(max ?? Infinity, Number(e.target.value))))}
      className={`h-8 w-full rounded border px-2 text-center text-[10px] font-bold outline-none ${tones[tone]}`}
    />
  );
}

function Toggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-5 w-9 rounded-full transition ${active ? "bg-emerald-500" : "bg-slate-300"}`}
      aria-label={active ? "Desactivar etapa" : "Activar etapa"}
    >
      <span
        className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition ${active ? "left-[18px]" : "left-0.5"}`}
      />
    </button>
  );
}

function IconButton({
  title,
  onClick,
  children,
  disabled = false,
  danger = false,
}: {
  title: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex size-7 items-center justify-center rounded border disabled:cursor-not-allowed disabled:opacity-30 ${danger ? "border-red-200 text-red-600 hover:bg-red-50" : "border-slate-200 text-slate-500 hover:bg-slate-100"}`}
    >
      {children}
    </button>
  );
}
