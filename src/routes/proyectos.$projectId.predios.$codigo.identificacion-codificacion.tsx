import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  FileText,
  Files,
  History,
  Plus,
  Save,
  SearchCheck,
  Send,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { PredioDocumentManager } from "@/components/PredioDocumentManager";
import { getPredioByCodigo, getPredioCenter, predioRows } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/identificacion-codificacion")({
  head: () => ({
    meta: [
      { title: "Identificacion y codificacion de predio" },
      {
        name: "description",
        content: "Registro de identificacion plena, codificacion, ubicacion y datos tecnicos preliminares del predio.",
      },
    ],
  }),
  component: IdentificacionCodificacionPage,
});

const RED = "#dc2626";
const inputCls = "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";

type VertexRow = {
  id: string;
  vertice: string;
  lado: string;
  distancia: string;
  este: string;
  norte: string;
  observacion: string;
};

type TraceRow = {
  id: string;
  fecha: string;
  usuario: string;
  actividad: string;
  estado: string;
  detalle: string;
};

type TechnicalImportResult = {
  rows: VertexRow[];
  area?: string;
  perimeter?: string;
  source?: string;
  message: string;
};

type FormState = {
  tipoPredio: "RURAL" | "URBANO";
  profesionalResponsable: string;
  brigadaResponsable: string;
  codigoPredio: string;
  codigoExpediente: string;
  mesExpediente: string;
  anioExpediente: string;
  validacionCodigo: "PENDIENTE" | "VALIDO" | "OBSERVADO";
  validacionExpediente: "PENDIENTE" | "VALIDO" | "OBSERVADO";
  condicionJuridicaPredio: "PRIVADO" | "ESTATAL";
  fuenteCondicionJuridica: string;
  titularidadEstatal: string;
  documentoSustentoCondicion: string;
  requiereTransferenciaInterestatal: "NO" | "SI";
  distrito: string;
  sector: string;
  localidad: string;
  manzana: string;
  lote: string;
  unidadCatastral: string;
  tieneServidumbre: "NO" | "SI";
  tipoServidumbre: string;
  marcoLegal: string[];
  analisisLegal: string;
  observaciones: string;
  fuenteLevantamiento: string;
  datum: string;
  zonaUtm: string;
  areaLevantada: string;
  perimetroLevantado: string;
  precision: string;
};

const LEGAL_OPTIONS = [
  "Decreto Legislativo Nro. 1192 y modificatorias",
  "Ley General de Expropiaciones aplicable al procedimiento predial",
  "Codigo Civil - derechos reales, posesion y propiedad",
  "Normativa catastral y registral aplicable",
  "Directivas internas de gestion predial del MTC",
];

const SERVIDUMBRE_OPTIONS = [
  "NINGUNO",
  "SERVIDUMBRE DE PASO",
  "SERVIDUMBRE DE AGUAS",
  "SERVIDUMBRE DE DESAGUE",
  "SERVIDUMBRES AERONAUTICAS",
  "SERVIDUMBRES DE CARRETERAS Y FERROCARRILES",
  "OTRA",
];

const FUENTE_CONDICION_OPTIONS = [
  "Padron preliminar",
  "Partida registral",
  "Ficha catastral",
  "Declaracion del sujeto pasivo",
  "Verificacion de campo",
  "Verificacion pendiente",
];

function nowLabel() {
  return new Date().toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function currentMonth() {
  return String(new Date().getMonth() + 1).padStart(2, "0");
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="border-b pb-1 mb-3 mt-4 first:mt-0">
      <h3 className="text-[13px] font-semibold" style={{ color: RED }}>
        {children}
      </h3>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-[180px_1fr] items-center gap-2 ${className}`}>
      <label className="text-[12px] text-right text-gray-700">
        {required && <span style={{ color: RED }}>* </span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded border border-gray-200 bg-white px-3 py-2.5">
      <div className="mb-2 flex items-center gap-1.5 border-b border-red-200 pb-1.5 text-[#ef4444]">
        <span className="[&>svg]:size-3.5">{icon}</span>
        <h2 className="text-[10px] font-semibold tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-w-0 grid-cols-[155px_1fr] items-center gap-1.5">
      <div className="text-right text-[11px] leading-tight text-gray-600">{label}</div>
      <div
        className="flex h-7 min-w-0 items-center truncate rounded border border-gray-200 bg-gray-50 px-2 text-[11px] text-gray-700"
        title={value || "Sin información"}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function getInfrastructureLabel(tipo?: string) {
  if (tipo === "Aeroportuarios") return "AEROPORTUARIO";
  if (tipo === "Viales") return "VIAL";
  if (tipo === "Especiales") return "ESPECIAL";
  return String(tipo || "").toUpperCase();
}

function getGroupLabel(proyecto: ReturnType<typeof getProyecto>) {
  if (!proyecto) return "";

  const airportGroup = proyecto.coordinacionPredial.match(/Aeropuertos\s+0?(\d+)/i);
  if (airportGroup) return `GRUPO DE AEROPUERTOS ${airportGroup[1]}`;

  const roadGroup = proyecto.coordinacionGeneral.match(/Vial\s+0?(\d+)/i);
  if (roadGroup) return `GRUPO DE PROYECTOS VIALES ${roadGroup[1]}`;

  if (proyecto.coordinacionGeneral.toLowerCase().includes("proyectos viales y especiales")) {
    return "GRUPO DE PROYECTOS VIALES Y ESPECIALES";
  }

  return proyecto.coordinacionGeneral.toUpperCase();
}

function IdentificacionCodificacionPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const center = getPredioCenter(decodedCodigo);
  const projectLabel = proyecto ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}` : projectId;
  const initialCondicionJuridica = normalizeCondicionJuridica(predio?.condicionPredio);
  const [activeTab, setActiveTab] = useState<"registro" | "historico" | "documentos">("registro");
  const [message, setMessage] = useState<{ type: "success" | "warning" | "error"; text: string } | null>(null);
  const [form, setForm] = useState<FormState>({
    tipoPredio: normalizeTipoPredio(predio?.tipo || predio?.tp),
    profesionalResponsable: predio?.rtec || "",
    brigadaResponsable: proyecto?.coordinacionPredial || "Brigada predial",
    codigoPredio: predio?.cod || decodedCodigo,
    codigoExpediente: predio?.exp || `EXP-${(predio?.cod || decodedCodigo).replace(/[^A-Z0-9-]/gi, "").slice(-8)}`,
    mesExpediente: currentMonth(),
    anioExpediente: String(new Date().getFullYear()),
    validacionCodigo: "PENDIENTE",
    validacionExpediente: "PENDIENTE",
    condicionJuridicaPredio: initialCondicionJuridica,
    fuenteCondicionJuridica: predio?.condicionPredio ? "Padron preliminar" : "Verificacion pendiente",
    titularidadEstatal: initialCondicionJuridica === "ESTATAL" ? "Entidad publica por verificar" : "",
    documentoSustentoCondicion: predio?.part || predio?.pind || "",
    requiereTransferenciaInterestatal: initialCondicionJuridica === "ESTATAL" ? "SI" : "NO",
    distrito: predio?.ciudad || "Jauja",
    sector: predio?.et || "",
    localidad: predio?.proyecto || "",
    manzana: "",
    lote: "",
    unidadCatastral: predio?.part || "",
    tieneServidumbre: "NO",
    tipoServidumbre: "NINGUNO",
    marcoLegal: [LEGAL_OPTIONS[0], LEGAL_OPTIONS[3]],
    analisisLegal:
      "De la revision preliminar se identifica la necesidad de confirmar la condicion del sujeto pasivo, la situacion registral y la correspondencia entre el area levantada y la ocupacion fisica del predio.",
    observaciones: "",
    fuenteLevantamiento: "Levantamiento topografico preliminar",
    datum: "WGS84",
    zonaUtm: "19M",
    areaLevantada: predio?.m2 || predio?.area || "",
    perimetroLevantado: "",
    precision: "Preliminar",
  });
  const [vertices, setVertices] = useState<VertexRow[]>(() => initialVertices(center));
  const [technicalFileName, setTechnicalFileName] = useState("");
  const [trace, setTrace] = useState<TraceRow[]>([
    {
      id: "trace-inicial",
      fecha: nowLabel(),
      usuario: "Sistema",
      actividad: "Actividad creada",
      estado: "BORRADOR",
      detalle: `Se inicio la identificacion y codificacion del predio ${predio?.cod || decodedCodigo}.`,
    },
  ]);

  const validationSummary = useMemo(() => validateCodigo(form.codigoPredio, decodedCodigo), [form.codigoPredio, decodedCodigo]);
  const expedienteValidationSummary = useMemo(
    () => validateExpediente(form.codigoExpediente, predio?.exp, decodedCodigo),
    [form.codigoExpediente, predio?.exp, decodedCodigo],
  );
  const validationsOk = form.validacionCodigo === "VALIDO" && form.validacionExpediente === "VALIDO";
  const generalInfo = {
    tipoInfraestructura: getInfrastructureLabel(proyecto?.tipo),
    grupo: getGroupLabel(proyecto),
    proyecto: projectLabel.toUpperCase(),
    fechaActual: new Date().toLocaleDateString("es-PE", { timeZone: "America/Lima" }),
    codigoPredio: predio?.cod || decodedCodigo,
    expediente: predio?.exp || form.codigoExpediente,
    seccionFuncional: predio?.et || "",
    coordinacion: proyecto?.coordinacionPredial || "",
    profesionalLegal: predio?.rlegal || "",
    profesionalTecnico: predio?.rtec || "",
  };
  const badgeSuffix = validationsOk
    ? "CODIGOS VALIDADOS"
    : form.validacionCodigo === "OBSERVADO" || form.validacionExpediente === "OBSERVADO"
      ? "OBSERVADO"
      : "BORRADOR";

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addTrace(actividad: string, estado: string, detalle: string) {
    setTrace((current) => [
      {
        id: `trace-${Date.now()}-${current.length}`,
        fecha: nowLabel(),
        usuario: form.profesionalResponsable || "Usuario tecnico",
        actividad,
        estado,
        detalle,
      },
      ...current,
    ]);
  }

  function handleValidateCode() {
    const nextStatus = validationSummary.ok ? "VALIDO" : "OBSERVADO";
    setForm((current) => ({ ...current, validacionCodigo: nextStatus }));
    addTrace("Validacion de codigo", nextStatus, validationSummary.message);
    setMessage({ type: validationSummary.ok ? "success" : "warning", text: validationSummary.message });
  }

  function handleValidateExpediente() {
    const nextStatus = expedienteValidationSummary.ok ? "VALIDO" : "OBSERVADO";
    setForm((current) => ({ ...current, validacionExpediente: nextStatus }));
    addTrace("Validacion de expediente", nextStatus, expedienteValidationSummary.message);
    setMessage({ type: expedienteValidationSummary.ok ? "success" : "warning", text: expedienteValidationSummary.message });
  }

  function toggleLegalOption(option: string) {
    setForm((current) => ({
      ...current,
      marcoLegal: current.marcoLegal.includes(option)
        ? current.marcoLegal.filter((item) => item !== option)
        : [...current.marcoLegal, option],
    }));
  }

  function updateVertex(id: string, patch: Partial<VertexRow>) {
    setVertices((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addVertex() {
    const nextNumber = vertices.length + 1;
    setVertices((current) => [
      ...current,
      {
        id: `v-${Date.now()}`,
        vertice: `P${nextNumber}`,
        lado: `P${nextNumber}-P${nextNumber + 1}`,
        distancia: "",
        este: "",
        norte: "",
        observacion: "",
      },
    ]);
  }

  function removeVertex(id: string) {
    setVertices((current) => current.filter((item) => item.id !== id));
  }

  async function handleTechnicalFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileName = file.name;
      const extension = fileName.split(".").pop()?.toLowerCase();
      const result =
        extension === "csv" || extension === "txt"
          ? parseTechnicalTableCsv(await file.text(), fileName)
          : await parseTechnicalTableExcel(file);

      setVertices(result.rows);
      setTechnicalFileName(fileName);
      setForm((current) => ({
        ...current,
        areaLevantada: result.area || current.areaLevantada,
        perimetroLevantado: result.perimeter || current.perimetroLevantado,
        fuenteLevantamiento: result.source || `Excel: ${fileName}`,
      }));
      addTrace("Carga de datos tecnicos", "BORRADOR", result.message);
      setMessage({ type: "success", text: result.message });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo leer el archivo de datos tecnicos.",
      });
    } finally {
      event.target.value = "";
    }
  }

  function handleSave(status: "BORRADOR" | "REGISTRADO") {
    if (!form.codigoPredio.trim() || !form.codigoExpediente.trim()) {
      setMessage({ type: "error", text: "Debe registrar codigo de predio y codigo de expediente." });
      return;
    }
    if (status === "REGISTRADO" && form.validacionCodigo !== "VALIDO") {
      setMessage({ type: "warning", text: "Valide el codigo del predio antes de registrar la actividad." });
      return;
    }
    if (status === "REGISTRADO" && form.validacionExpediente !== "VALIDO") {
      setMessage({ type: "warning", text: "Valide el codigo de expediente antes de registrar la actividad." });
      return;
    }
    addTrace(
      status === "REGISTRADO" ? "Registro de identificacion y codificacion" : "Guardado de borrador",
      status,
      `Predio ${form.codigoPredio}, expediente ${form.codigoExpediente}, condicion ${form.condicionJuridicaPredio}, periodo ${form.mesExpediente}/${form.anioExpediente}.`,
    );
    setMessage({
      type: "success",
      text:
        status === "REGISTRADO"
          ? "Identificacion, codificacion y datos tecnicos preliminares registrados correctamente."
          : "Borrador guardado correctamente.",
    });
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Identificación y codificación del predio"
        badgeLabel="Predio"
        badgeValue={predio?.cod || decodedCodigo}
        badgeSuffix={badgeSuffix}
      />

      <main className="max-w-[1280px] mx-auto p-4">
        <div className="bg-white rounded border">
          <div className="px-5 py-5">
            <div className="border-b mb-3 flex items-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("registro")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border-b-2"
                style={{ borderColor: activeTab === "registro" ? RED : "transparent", color: activeTab === "registro" ? RED : "#4b5563" }}
              >
                <FileText size={14} /> Identificacion y codificacion
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("documentos")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border-b-2"
                style={{ borderColor: activeTab === "documentos" ? RED : "transparent", color: activeTab === "documentos" ? RED : "#4b5563" }}
              >
                <Files size={14} /> Documentación legal y registral
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("historico")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border-b-2"
                style={{ borderColor: activeTab === "historico" ? RED : "transparent", color: activeTab === "historico" ? RED : "#4b5563" }}
              >
                <History size={14} /> Historico
              </button>
            </div>

            {message && (
              <div
                className={`mb-3 flex items-start gap-2 rounded border px-3 py-2 text-[12px] ${
                  message.type === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : message.type === "warning"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-green-200 bg-green-50 text-green-700"
                }`}
              >
                <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                <span>{message.text}</span>
              </div>
            )}

            {activeTab === "registro" ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSave("BORRADOR");
                }}
              >
                <SectionTitle>
                  <span className="flex items-center gap-2">
                    <span>Información del predio</span>
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-gray-500">
                      Informativo · Solo lectura
                    </span>
                  </span>
                </SectionTitle>
                <div className="space-y-2.5">
                  <InfoSection icon={<Building2 size={16} />} title="DATOS GENERALES">
                    <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
                      <InfoRow label="Tipo de infraestructura" value={generalInfo.tipoInfraestructura} />
                      <InfoRow label="Grupo" value={generalInfo.grupo} />
                      <InfoRow label="Proyecto" value={generalInfo.proyecto} />
                      <InfoRow label="Fecha actual" value={generalInfo.fechaActual} />
                      <InfoRow label="Código de predio" value={generalInfo.codigoPredio} />
                      <InfoRow label="Expediente" value={generalInfo.expediente} />
                      <InfoRow label="Sección funcional" value={generalInfo.seccionFuncional} />
                      <InfoRow label="Coordinación" value={generalInfo.coordinacion} />
                    </div>
                  </InfoSection>

                  <InfoSection icon={<Users size={16} />} title="RESPONSABLES">
                    <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
                      <InfoRow label="Profesional legal" value={generalInfo.profesionalLegal} />
                      <InfoRow label="Profesional técnico" value={generalInfo.profesionalTecnico} />
                      <InfoRow label="Brigada responsable" value={form.brigadaResponsable} />
                    </div>
                  </InfoSection>
                </div>

                <SectionTitle>Identificacion plena y codificacion</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Tipo de predio" required>
                    <select className={selectCls} value={form.tipoPredio} onChange={(event) => setField("tipoPredio", event.target.value as FormState["tipoPredio"])}>
                      <option value="RURAL">Rural</option>
                      <option value="URBANO">Urbano</option>
                    </select>
                  </Field>
                  <Field label="Mes / anio expediente" required>
                    <div className="grid grid-cols-[1fr_1fr] gap-2">
                      <select className={selectCls} value={form.mesExpediente} onChange={(event) => setField("mesExpediente", event.target.value)}>
                        {Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0")).map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <input className={inputCls} value={form.anioExpediente} onChange={(event) => setField("anioExpediente", event.target.value)} />
                    </div>
                  </Field>
                  <Field label="Codigo del predio" required>
                    <div className="flex gap-2">
                      <input
                        className={inputCls}
                        value={form.codigoPredio}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, codigoPredio: event.target.value, validacionCodigo: "PENDIENTE" }))
                        }
                      />
                      <button
                        type="button"
                        onClick={handleValidateCode}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded border border-gray-300 px-3 text-[12px] hover:bg-gray-50"
                      >
                        <SearchCheck size={14} /> Validar
                      </button>
                    </div>
                  </Field>
                  <Field label="Codigo expediente" required>
                    <div className="flex gap-2">
                      <input
                        className={inputCls}
                        value={form.codigoExpediente}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, codigoExpediente: event.target.value, validacionExpediente: "PENDIENTE" }))
                        }
                      />
                      <button
                        type="button"
                        onClick={handleValidateExpediente}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded border border-gray-300 px-3 text-[12px] hover:bg-gray-50"
                      >
                        <SearchCheck size={14} /> Validar
                      </button>
                    </div>
                  </Field>
                  <Field label="Estado cod. predio">
                    <input className={`${inputCls} bg-gray-50`} value={form.validacionCodigo} readOnly />
                  </Field>
                  <Field label="Estado expediente">
                    <input className={`${inputCls} bg-gray-50`} value={form.validacionExpediente} readOnly />
                  </Field>
                  <Field label="Resultado cod. predio">
                    <input className={`${inputCls} bg-gray-50`} value={validationSummary.message} readOnly />
                  </Field>
                  <Field label="Resultado expediente">
                    <input className={`${inputCls} bg-gray-50`} value={expedienteValidationSummary.message} readOnly />
                  </Field>
                </div>

                <SectionTitle>Identificacion de condicion juridica del predio</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Condicion del predio" required>
                    <select
                      className={selectCls}
                      value={form.condicionJuridicaPredio}
                      onChange={(event) => {
                        const nextValue = event.target.value as FormState["condicionJuridicaPredio"];
                        setForm((current) => ({
                          ...current,
                          condicionJuridicaPredio: nextValue,
                          titularidadEstatal: nextValue === "PRIVADO" ? "" : current.titularidadEstatal,
                          requiereTransferenciaInterestatal: nextValue === "ESTATAL" ? "SI" : "NO",
                        }));
                      }}
                    >
                      <option value="PRIVADO">Privado</option>
                      <option value="ESTATAL">Estatal</option>
                    </select>
                  </Field>
                  <Field label="Fuente identificacion">
                    <select
                      className={selectCls}
                      value={form.fuenteCondicionJuridica}
                      onChange={(event) => setField("fuenteCondicionJuridica", event.target.value)}
                    >
                      {FUENTE_CONDICION_OPTIONS.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Entidad titular">
                    <input
                      className={`${inputCls} ${form.condicionJuridicaPredio === "PRIVADO" ? "bg-gray-50 text-gray-400" : ""}`}
                      value={form.titularidadEstatal}
                      onChange={(event) => setField("titularidadEstatal", event.target.value)}
                      placeholder={form.condicionJuridicaPredio === "ESTATAL" ? "Entidad publica titular o administradora" : "No aplica"}
                      disabled={form.condicionJuridicaPredio === "PRIVADO"}
                    />
                  </Field>
                  <Field label="Documento sustento">
                    <input
                      className={inputCls}
                      value={form.documentoSustentoCondicion}
                      onChange={(event) => setField("documentoSustentoCondicion", event.target.value)}
                      placeholder="Partida, ficha, informe o documento de verificacion"
                    />
                  </Field>
                  <Field label="Transf. interestatal">
                    <select
                      className={`${selectCls} ${form.condicionJuridicaPredio === "PRIVADO" ? "bg-gray-50 text-gray-400" : ""}`}
                      value={form.requiereTransferenciaInterestatal}
                      onChange={(event) =>
                        setField("requiereTransferenciaInterestatal", event.target.value as FormState["requiereTransferenciaInterestatal"])
                      }
                      disabled={form.condicionJuridicaPredio === "PRIVADO"}
                    >
                      <option value="NO">No</option>
                      <option value="SI">Si</option>
                    </select>
                  </Field>
                  <Field label="Resumen condicion">
                    <input
                      className={`${inputCls} bg-gray-50`}
                      value={
                        form.condicionJuridicaPredio === "ESTATAL"
                          ? `Predio estatal${form.titularidadEstatal ? ` - ${form.titularidadEstatal}` : ""}`
                          : "Predio privado"
                      }
                      readOnly
                    />
                  </Field>
                </div>

                <SectionTitle>Datos de ubicacion</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Distrito" required>
                    <input className={inputCls} value={form.distrito} onChange={(event) => setField("distrito", event.target.value)} />
                  </Field>
                  <Field label="Sector">
                    <input className={inputCls} value={form.sector} onChange={(event) => setField("sector", event.target.value)} />
                  </Field>
                  <Field label="Localidad">
                    <input className={inputCls} value={form.localidad} onChange={(event) => setField("localidad", event.target.value)} />
                  </Field>
                  <Field label="Manzana">
                    <input className={inputCls} value={form.manzana} onChange={(event) => setField("manzana", event.target.value)} />
                  </Field>
                  <Field label="Lote">
                    <input className={inputCls} value={form.lote} onChange={(event) => setField("lote", event.target.value)} />
                  </Field>
                  <Field label="Unidad catastral">
                    <input className={inputCls} value={form.unidadCatastral} onChange={(event) => setField("unidadCatastral", event.target.value)} />
                  </Field>
                  <Field label="Tiene servidumbre">
                    <select className={selectCls} value={form.tieneServidumbre} onChange={(event) => setField("tieneServidumbre", event.target.value as FormState["tieneServidumbre"])}>
                      <option value="NO">No</option>
                      <option value="SI">Si</option>
                    </select>
                  </Field>
                  <Field label="Tipo servidumbre">
                    <select className={selectCls} value={form.tipoServidumbre} onChange={(event) => setField("tipoServidumbre", event.target.value)}>
                      {SERVIDUMBRE_OPTIONS.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <SectionTitle>Marco legal, analisis y observaciones</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Marcos legales" className="col-span-2">
                    <div className="grid grid-cols-2 gap-2 rounded border border-gray-200 p-2">
                      {LEGAL_OPTIONS.map((option) => (
                        <label key={option} className="flex items-center gap-2 text-[12px] text-gray-700">
                          <input
                            type="checkbox"
                            checked={form.marcoLegal.includes(option)}
                            onChange={() => toggleLegalOption(option)}
                            className="accent-[#dc2626]"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </Field>
                  <Field label="Analisis legal" className="col-span-2">
                    <textarea
                      className="min-h-[78px] px-2 py-1.5 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500"
                      value={form.analisisLegal}
                      onChange={(event) => setField("analisisLegal", event.target.value)}
                    />
                  </Field>
                  <Field label="Observaciones" className="col-span-2">
                    <textarea
                      className="min-h-[64px] px-2 py-1.5 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500"
                      value={form.observaciones}
                      onChange={(event) => setField("observaciones", event.target.value)}
                    />
                  </Field>
                </div>

                <SectionTitle>Datos tecnicos preliminares del poligono</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Fuente levantamiento">
                    <input className={inputCls} value={form.fuenteLevantamiento} onChange={(event) => setField("fuenteLevantamiento", event.target.value)} />
                  </Field>
                  <Field label="Datum / Zona UTM">
                    <div className="grid grid-cols-[1fr_1fr] gap-2">
                      <input className={inputCls} value={form.datum} onChange={(event) => setField("datum", event.target.value)} />
                      <input className={inputCls} value={form.zonaUtm} onChange={(event) => setField("zonaUtm", event.target.value)} />
                    </div>
                  </Field>
                  <Field label="Area levantada m2">
                    <input className={inputCls} value={form.areaLevantada} onChange={(event) => setField("areaLevantada", event.target.value)} />
                  </Field>
                  <Field label="Perimetro ml">
                    <input className={inputCls} value={form.perimetroLevantado} onChange={(event) => setField("perimetroLevantado", event.target.value)} />
                  </Field>
                  <Field label="Precision">
                    <select className={selectCls} value={form.precision} onChange={(event) => setField("precision", event.target.value)}>
                      <option>Preliminar</option>
                      <option>Verificado en campo</option>
                      <option>Observado</option>
                    </select>
                  </Field>
                  <Field label="Centro aproximado">
                    <input className={`${inputCls} bg-gray-50`} value={center ? `${center[1].toFixed(6)}, ${center[0].toFixed(6)}` : "Sin coordenada"} readOnly />
                  </Field>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 rounded border border-dashed border-gray-300 bg-gray-50 px-3 py-2">
                  <div className="min-w-0 text-[12px] text-gray-600">
                    <div className="font-medium text-gray-800">Carga del cuadro tecnico</div>
                    <div className="truncate">
                      {technicalFileName
                        ? `Archivo cargado: ${technicalFileName}`
                        : "Seleccione un Excel (.xlsx) o CSV con vertices, lados, distancias y coordenadas."}
                    </div>
                  </div>
                  <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-[12px] hover:bg-gray-100">
                    <Upload size={14} /> Subir Excel
                    <input type="file" accept=".xlsx,.csv,.txt" className="hidden" onChange={handleTechnicalFileUpload} />
                  </label>
                </div>

                <div className="mt-3 overflow-x-auto rounded border">
                  <table className="min-w-full text-[12px]">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-2 py-2 text-left font-semibold">Vertice</th>
                        <th className="px-2 py-2 text-left font-semibold">Lado</th>
                        <th className="px-2 py-2 text-left font-semibold">Distancia ml</th>
                        <th className="px-2 py-2 text-left font-semibold">Este</th>
                        <th className="px-2 py-2 text-left font-semibold">Norte</th>
                        <th className="px-2 py-2 text-left font-semibold">Observacion</th>
                        <th className="px-2 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {vertices.map((row) => (
                        <tr key={row.id} className="border-t">
                          <td className="px-2 py-1.5"><input className={inputCls} value={row.vertice} onChange={(event) => updateVertex(row.id, { vertice: event.target.value })} /></td>
                          <td className="px-2 py-1.5"><input className={inputCls} value={row.lado} onChange={(event) => updateVertex(row.id, { lado: event.target.value })} /></td>
                          <td className="px-2 py-1.5"><input className={inputCls} value={row.distancia} onChange={(event) => updateVertex(row.id, { distancia: event.target.value })} /></td>
                          <td className="px-2 py-1.5"><input className={inputCls} value={row.este} onChange={(event) => updateVertex(row.id, { este: event.target.value })} /></td>
                          <td className="px-2 py-1.5"><input className={inputCls} value={row.norte} onChange={(event) => updateVertex(row.id, { norte: event.target.value })} /></td>
                          <td className="px-2 py-1.5"><input className={inputCls} value={row.observacion} onChange={(event) => updateVertex(row.id, { observacion: event.target.value })} /></td>
                          <td className="px-2 py-1.5 text-right">
                            <button type="button" onClick={() => removeVertex(row.id)} className="inline-flex size-8 items-center justify-center rounded text-[#dc2626] hover:bg-red-50" title="Quitar vertice">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 flex justify-end">
                  <button type="button" onClick={addVertex} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-[12px] hover:bg-gray-50">
                    <Plus size={14} /> Agregar vertice
                  </button>
                </div>

                <div className="mt-5 flex justify-end gap-2 border-t pt-3">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50"
                  >
                    <X size={14} /> Cancelar
                  </button>
                  <button type="submit" className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white" style={{ background: RED }}>
                    <Save size={14} /> Guardar borrador
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave("REGISTRADO")}
                    className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white"
                    style={{ background: RED }}
                  >
                    <Send size={14} /> Registrar actividad
                  </button>
                </div>
              </form>
            ) : activeTab === "historico" ? (
              <Historico trace={trace} />
            ) : (
              <>
                <SectionTitle>Documentación legal y registral</SectionTitle>
                <PredioDocumentManager projectId={projectId} codigo={predio?.cod || decodedCodigo} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Historico({ trace }: { trace: TraceRow[] }) {
  return (
    <>
      <SectionTitle>Historico de identificacion y codificacion</SectionTitle>
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-[12px]">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-2 py-2 text-left font-semibold">Fecha</th>
              <th className="px-2 py-2 text-left font-semibold">Usuario</th>
              <th className="px-2 py-2 text-left font-semibold">Actividad</th>
              <th className="px-2 py-2 text-left font-semibold">Estado</th>
              <th className="px-2 py-2 text-left font-semibold">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {trace.map((row) => (
              <tr key={row.id} className="border-t align-top">
                <td className="px-2 py-2 whitespace-nowrap">{row.fecha}</td>
                <td className="px-2 py-2">{row.usuario}</td>
                <td className="px-2 py-2 font-medium">{row.actividad}</td>
                <td className="px-2 py-2">{row.estado}</td>
                <td className="px-2 py-2">{row.detalle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function normalizeTipoPredio(value?: string): "RURAL" | "URBANO" {
  return String(value ?? "").toUpperCase().includes("URB") ? "URBANO" : "RURAL";
}

function normalizeCondicionJuridica(value?: string | null): "PRIVADO" | "ESTATAL" {
  return String(value ?? "").trim().toUpperCase().includes("ESTATAL") ? "ESTATAL" : "PRIVADO";
}

function parseTechnicalTableCsv(text: string, fileName: string): TechnicalImportResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("El archivo debe incluir una cabecera y al menos una fila de vertices.");
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitDelimitedLine(lines[0], delimiter).map(normalizeHeader);
  const rows = lines.slice(1).map((line) => {
    const values = splitDelimitedLine(line, delimiter);
    return headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {});
  });

  return technicalImportFromRecords(rows, fileName);
}

async function parseTechnicalTableExcel(file: File): Promise<TechnicalImportResult> {
  const { default: readXlsxFile } = await import("read-excel-file/browser");
  const sheetRows = await readXlsxFile(file);

  if (sheetRows.length < 2) {
    throw new Error("La primera hoja del Excel debe incluir una cabecera y al menos una fila de vertices.");
  }

  const headers = sheetRows[0].map((header) => normalizeHeader(String(header ?? "")));
  const records = sheetRows.slice(1).map((row) =>
    headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = String(row[index] ?? "").trim();
      return record;
    }, {}),
  );

  return technicalImportFromRecords(records, file.name);
}

function technicalImportFromRecords(rows: Array<Record<string, string>>, fileName: string): TechnicalImportResult {
  const importedRows = rows
    .map((record, index) => ({
      id: `imp-${Date.now()}-${index}`,
      vertice: valueFrom(record, ["vertice", "punto", "p"]) || `P${index + 1}`,
      lado: valueFrom(record, ["lado", "tramo"]) || `P${index + 1}-P${index + 2}`,
      distancia: valueFrom(record, ["distancia", "distancia ml", "distancia m", "dist"]),
      este: valueFrom(record, ["este", "este x", "x", "coord este", "coordenada este"]),
      norte: valueFrom(record, ["norte", "norte y", "y", "coord norte", "coordenada norte"]),
      observacion: valueFrom(record, ["observacion", "obs"]),
    }))
    .filter((row) => row.vertice || row.este || row.norte || row.distancia);

  if (!importedRows.length) {
    throw new Error("No se encontraron vertices validos en el archivo seleccionado.");
  }

  const firstRecord = rows[0] || {};
  return {
    rows: importedRows,
    area: valueFrom(firstRecord, ["area", "area levantada", "area m2", "area_m2"]),
    perimeter: valueFrom(firstRecord, ["perimetro", "perimetro ml", "perimetro_m", "perimetro ml"]),
    source: `Excel/CSV: ${fileName}`,
    message: `Se cargaron ${importedRows.length} vertices desde ${fileName}.`,
  };
}

function detectDelimiter(headerLine: string) {
  const tabCount = (headerLine.match(/\t/g) || []).length;
  const semicolonCount = (headerLine.match(/;/g) || []).length;
  const commaCount = (headerLine.match(/,/g) || []).length;
  if (tabCount > 0) return "\t";
  return semicolonCount >= commaCount ? ";" : ",";
}

function splitDelimitedLine(line: string, delimiter: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  values.push(current.trim());
  return values.map((value) => value.replace(/^"|"$/g, ""));
}

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function valueFrom(record: Record<string, string>, aliases: string[]) {
  for (const alias of aliases) {
    const value = record[normalizeHeader(alias)];
    if (value) return value;
  }
  return "";
}

function validateCodigo(codigoPredio: string, originalCodigo: string) {
  const cleaned = codigoPredio.trim();
  const existsInPredios = predioRows.some((row) => row.codigo === cleaned || row.cod === cleaned);
  const matchesCurrent = cleaned === originalCodigo || getPredioByCodigo(originalCodigo)?.cod === cleaned;
  const patternOk = /^(AERO|VIAL|FERRO|PORT)-[A-Z0-9-]+-(PR|PU)-[A-Z0-9-]+$/i.test(cleaned) || cleaned.length >= 12;

  if (!cleaned) return { ok: false, message: "El codigo de predio esta vacio." };
  if (!patternOk) return { ok: false, message: "El codigo no cumple el patron minimo de codificacion predial." };
  if (matchesCurrent) return { ok: true, message: "Codigo validado contra el predio seleccionado y el modulo de predios." };
  if (existsInPredios) return { ok: true, message: "Codigo existe en el registro de predios cargado para el proyecto." };
  return { ok: false, message: "Codigo no encontrado en la base de predios cargada. Verificar en el modulo de codificacion." };
}

function validateExpediente(codigoExpediente: string, originalExpediente: string | undefined, originalCodigo: string) {
  const cleaned = codigoExpediente.trim().toUpperCase();
  const normalizedOriginal = String(originalExpediente ?? "").trim().toUpperCase();
  const currentPredio = getPredioByCodigo(originalCodigo);
  const duplicate = predioRows.find((row) => {
    const rowExp = String(row.exp ?? "").trim().toUpperCase();
    if (!rowExp || rowExp !== cleaned) return false;
    return row.codigo !== originalCodigo && row.cod !== currentPredio?.cod;
  });
  const patternOk = /^(EXP|EXPDTE|EXPEDIENTE)-[A-Z0-9-]{4,}$/i.test(cleaned) || /^[A-Z0-9-]{6,}$/i.test(cleaned);

  if (!cleaned) return { ok: false, message: "El codigo de expediente esta vacio." };
  if (!patternOk) return { ok: false, message: "El expediente no cumple el patron minimo de codificacion." };
  if (duplicate) return { ok: false, message: `El expediente ya esta asociado al predio ${duplicate.cod || duplicate.codigo}.` };
  if (normalizedOriginal && cleaned === normalizedOriginal) {
    return { ok: true, message: "Codigo de expediente validado contra el registro del predio seleccionado." };
  }
  return { ok: true, message: "Codigo de expediente disponible y validado para este predio." };
}

function initialVertices(center: [number, number] | null): VertexRow[] {
  const baseEste = center ? Math.round((center[0] + 180) * 1000) : 383267;
  const baseNorte = center ? Math.round((center[1] + 90) * 100000) : 9598499;
  return [
    { id: "v-1", vertice: "P1", lado: "P1-P2", distancia: "", este: String(baseEste), norte: String(baseNorte), observacion: "Dato preliminar" },
    { id: "v-2", vertice: "P2", lado: "P2-P3", distancia: "", este: "", norte: "", observacion: "" },
    { id: "v-3", vertice: "P3", lado: "P3-P4", distancia: "", este: "", norte: "", observacion: "" },
    { id: "v-4", vertice: "P4", lado: "P4-P1", distancia: "", este: "", norte: "", observacion: "" },
  ];
}
