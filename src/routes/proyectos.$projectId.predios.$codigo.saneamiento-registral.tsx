import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Landmark,
  Plus,
  Save,
  SearchCheck,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/saneamiento-registral")(
  {
    head: () => ({
      meta: [
        { title: "Saneamiento registral y titulación" },
        {
          name: "description",
          content:
            "Preparación, presentación y seguimiento de la titulación del predio a favor del Ministerio de Transportes y Comunicaciones.",
        },
      ],
    }),
    component: SaneamientoRegistralPage,
  },
);

const RED = "#dc2626";
const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] focus:border-gray-500 focus:outline-none";
const selectCls = `${inputCls} appearance-none`;
const FILE_DB_NAME = "predio-documentos-db";
const FILE_STORE_NAME = "archivos";
const MAX_FILE_SIZE = 15 * 1024 * 1024;

type FormState = {
  zonaRegistral: string;
  oficinaRegistral: string;
  partidaMatriz: string;
  titularActual: string;
  areaAntecedente: string;
  condicionRegistral: string;
  tipoSaneamiento: string;
  actoSolicitado: string;
  baseLegal: string;
  resolucionSustento: string;
  fechaResolucion: string;
  areaTitular: string;
  responsableLegal: string;
  responsableTecnico: string;
  titularDestino: string;
  rucTitularDestino: string;
  estadoExpediente: string;
  estadoResultado: string;
  numeroTituloFinal: string;
  asientoInscripcion: string;
  partidaFinal: string;
  fechaInscripcion: string;
  areaInscrita: string;
  propietarioFinal: string;
  observacionesResultado: string;
};

type PresentationDraft = {
  numeroTitulo: string;
  anioTitulo: string;
  oficina: string;
  fechaPresentacion: string;
  fechaVencimiento: string;
  lugarPresentacion: string;
  presentante: string;
  tipoDocumento: string;
  numeroDocumento: string;
  reciboPago: string;
  montoPagado: string;
  estado: string;
  observaciones: string;
};

type PresentationEntry = PresentationDraft & {
  id: string;
  fechaRegistro: string;
  cargoId: string;
  cargoArchivo: string;
  cargoSize: number;
};

type QualificationDraft = {
  fecha: string;
  tipo: string;
  numeroDocumento: string;
  detalle: string;
  fechaLimite: string;
  estado: string;
};

type QualificationEntry = QualificationDraft & {
  id: string;
  fechaRegistro: string;
  archivoId: string;
  archivo: string;
  size: number;
};

type DocumentDraft = {
  etapa: string;
  tipo: string;
  numero: string;
  fecha: string;
  descripcion: string;
  estado: string;
};

type DocumentRow = DocumentDraft & {
  id: string;
  fechaRegistro: string;
  archivoId: string;
  archivo: string;
  size: number;
};

type PersistedState = {
  form?: FormState;
  presentationDraft?: PresentationDraft;
  presentations?: PresentationEntry[];
  qualificationDraft?: QualificationDraft;
  qualifications?: QualificationEntry[];
  documentDraft?: DocumentDraft;
  documents?: DocumentRow[];
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

function timestamp() {
  return new Date().toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-5 border-b pb-1 first:mt-0">
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
      <label className="text-right text-[12px] text-gray-700">
        {required && <span style={{ color: RED }}>* </span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wide text-gray-400">{label}</p>
        <p className="truncate text-[12px] font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function SaneamientoRegistralPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const predioCode = predio?.cod || decodedCodigo;
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;
  const storageKey = `saneamiento-registral:${projectId}:${decodedCodigo}`;

  const initialForm = useMemo<FormState>(
    () => ({
      zonaRegistral: "ZONA REGISTRAL N.° VIII - SEDE HUANCAYO",
      oficinaRegistral: predio?.ofi || "OFICINA REGISTRAL DE JAUJA",
      partidaMatriz: predio?.part || "11024567",
      titularActual: predio?.suj || "COMUNIDAD CAMPESINA DE SAUSA",
      areaAntecedente: predio?.m2 || "1,250.0000",
      condicionRegistral: "ÁREA POR INDEPENDIZAR DE PARTIDA MATRIZ",
      tipoSaneamiento: "INDEPENDIZACIÓN Y TITULACIÓN",
      actoSolicitado: "INDEPENDIZACIÓN E INSCRIPCIÓN DE DOMINIO A FAVOR DEL MTC",
      baseLegal: "Decreto Legislativo N.° 1192 y normas registrales aplicables",
      resolucionSustento: "R.M. N.° 412-2026-MTC/01.02",
      fechaResolucion: "2026-08-18",
      areaTitular: predio?.m2 || "1,250.0000",
      responsableLegal: predio?.rlegal || "María Elena Torres Huamán",
      responsableTecnico: predio?.rtec || "Carlos Alberto Mendoza Rojas",
      titularDestino: "MINISTERIO DE TRANSPORTES Y COMUNICACIONES",
      rucTitularDestino: "20131379944",
      estadoExpediente: "EXPEDIENTE TÉCNICO-LEGAL COMPLETO",
      estadoResultado: "PENDIENTE",
      numeroTituloFinal: "",
      asientoInscripcion: "",
      partidaFinal: "",
      fechaInscripcion: "",
      areaInscrita: predio?.m2 || "1,250.0000",
      propietarioFinal: "MINISTERIO DE TRANSPORTES Y COMUNICACIONES",
      observacionesResultado: "",
    }),
    [predio?.m2, predio?.ofi, predio?.part, predio?.rlegal, predio?.rtec, predio?.suj],
  );

  const initialPresentation = useMemo<PresentationDraft>(
    () => ({
      numeroTitulo: "2026-01874562",
      anioTitulo: "2026",
      oficina: "OFICINA REGISTRAL DE JAUJA",
      fechaPresentacion: "2026-08-20",
      fechaVencimiento: "2026-09-10",
      lugarPresentacion: "SID SUNARP / JAUJA",
      presentante: "María Elena Torres Huamán",
      tipoDocumento: "DNI",
      numeroDocumento: "42156874",
      reciboPago: "REC-2026-45871",
      montoPagado: "248.60",
      estado: "PRESENTADO",
      observaciones: "Título presentado para independización e inscripción a favor del MTC.",
    }),
    [],
  );

  const initialQualification = useMemo<QualificationDraft>(
    () => ({
      fecha: today(),
      tipo: "ESQUELA DE OBSERVACIÓN",
      numeroDocumento: "",
      detalle: "",
      fechaLimite: addDays(today(), 15),
      estado: "PENDIENTE DE ATENCIÓN",
    }),
    [],
  );

  const initialDocument = useMemo<DocumentDraft>(
    () => ({
      etapa: "EXPEDIENTE DE TITULACIÓN",
      tipo: "MEMORIA DESCRIPTIVA",
      numero: "",
      fecha: today(),
      descripcion: "Documento técnico-legal para la titulación del predio",
      estado: "VIGENTE",
    }),
    [],
  );

  const [form, setForm] = useState<FormState>(initialForm);
  const [presentationDraft, setPresentationDraft] =
    useState<PresentationDraft>(initialPresentation);
  const [presentations, setPresentations] = useState<PresentationEntry[]>([]);
  const [presentationCargo, setPresentationCargo] = useState<File | null>(null);
  const [qualificationDraft, setQualificationDraft] =
    useState<QualificationDraft>(initialQualification);
  const [qualifications, setQualifications] = useState<QualificationEntry[]>([]);
  const [qualificationFile, setQualificationFile] = useState<File | null>(null);
  const [documentDraft, setDocumentDraft] = useState<DocumentDraft>(initialDocument);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "warning" | "error";
    text: string;
  } | null>(null);

  const currentStatus =
    form.estadoResultado === "INSCRITO"
      ? "TITULADO A FAVOR DEL MTC"
      : qualifications.some((entry) => entry.estado.includes("PENDIENTE"))
        ? "OBSERVADO"
        : presentations.length
          ? form.estadoExpediente
          : "EXPEDIENTE EN PREPARACIÓN";

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as PersistedState;
        setForm({ ...initialForm, ...parsed.form });
        setPresentationDraft({ ...initialPresentation, ...parsed.presentationDraft });
        setPresentations(parsed.presentations || []);
        setQualificationDraft({ ...initialQualification, ...parsed.qualificationDraft });
        setQualifications(parsed.qualifications || []);
        setDocumentDraft({ ...initialDocument, ...parsed.documentDraft });
        setDocuments(parsed.documents || []);
      }
    } catch {
      setMessage({
        type: "warning",
        text: "No se pudo recuperar el expediente anterior. Se cargaron datos de referencia.",
      });
    } finally {
      setLoaded(true);
    }
  }, [initialDocument, initialForm, initialPresentation, initialQualification, storageKey]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        form,
        presentationDraft,
        presentations,
        qualificationDraft,
        qualifications,
        documentDraft,
        documents,
      }),
    );
  }, [
    documentDraft,
    documents,
    form,
    loaded,
    presentationDraft,
    presentations,
    qualificationDraft,
    qualifications,
    storageKey,
  ]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setPresentationField<K extends keyof PresentationDraft>(
    key: K,
    value: PresentationDraft[K],
  ) {
    setPresentationDraft((current) => ({ ...current, [key]: value }));
  }

  function setQualificationField<K extends keyof QualificationDraft>(
    key: K,
    value: QualificationDraft[K],
  ) {
    setQualificationDraft((current) => ({ ...current, [key]: value }));
  }

  function setDocumentField<K extends keyof DocumentDraft>(key: K, value: DocumentDraft[K]) {
    setDocumentDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleRegisterPresentation() {
    if (!presentationDraft.numeroTitulo.trim() || !presentationDraft.fechaPresentacion) {
      setMessage({
        type: "warning",
        text: "Complete el número de título y la fecha de presentación.",
      });
      return;
    }
    if (!presentationCargo) {
      setMessage({
        type: "warning",
        text: "Adjunte el cargo de presentación emitido por SUNARP.",
      });
      return;
    }
    if (!validateFile(presentationCargo)) return;

    const id = makeId("titulo-sunarp");
    try {
      await storeDocumentFile(id, presentationCargo);
      const entry: PresentationEntry = {
        id,
        ...presentationDraft,
        fechaRegistro: timestamp(),
        cargoId: id,
        cargoArchivo: presentationCargo.name,
        cargoSize: presentationCargo.size,
      };
      setPresentations([entry, ...presentations]);
      setForm((current) => ({ ...current, estadoExpediente: "EN CALIFICACIÓN SUNARP" }));
      setPresentationCargo(null);
      setMessage({
        type: "success",
        text: `Título ${entry.numeroTitulo} registrado y enviado a seguimiento de calificación.`,
      });
    } catch {
      setMessage({ type: "error", text: "No se pudo almacenar la presentación del título." });
    }
  }

  async function handleRegisterQualification() {
    if (!presentations.length) {
      setMessage({
        type: "warning",
        text: "Primero registre la presentación del título ante SUNARP.",
      });
      return;
    }
    if (!qualificationDraft.numeroDocumento.trim() || !qualificationDraft.detalle.trim()) {
      setMessage({
        type: "warning",
        text: "Complete el número y el detalle del documento de calificación.",
      });
      return;
    }
    if (!qualificationFile) {
      setMessage({
        type: "warning",
        text: "Adjunte la esquela, liquidación o documento de subsanación.",
      });
      return;
    }
    if (!validateFile(qualificationFile)) return;

    const id = makeId("calificacion-sunarp");
    try {
      await storeDocumentFile(id, qualificationFile);
      const entry: QualificationEntry = {
        id,
        ...qualificationDraft,
        fechaRegistro: timestamp(),
        archivoId: id,
        archivo: qualificationFile.name,
        size: qualificationFile.size,
      };
      setQualifications([entry, ...qualifications]);
      setForm((current) => ({
        ...current,
        estadoExpediente: entry.tipo.includes("SUBSANACIÓN")
          ? "SUBSANADO"
          : entry.tipo.includes("OBSERVACIÓN")
            ? "OBSERVADO"
            : "EN CALIFICACIÓN SUNARP",
      }));
      setQualificationDraft({
        ...initialQualification,
        fecha: today(),
        fechaLimite: addDays(today(), 15),
      });
      setQualificationFile(null);
      setMessage({ type: "success", text: "Actuación de calificación registrada correctamente." });
    } catch {
      setMessage({ type: "error", text: "No se pudo almacenar la actuación registral." });
    }
  }

  async function handleUploadDocument() {
    if (!documentFile) {
      setMessage({ type: "warning", text: "Seleccione el documento que desea registrar." });
      return;
    }
    if (!documentDraft.descripcion.trim()) {
      setMessage({ type: "warning", text: "Registre una descripción para el documento." });
      return;
    }
    if (!validateFile(documentFile)) return;

    const id = makeId("documento-titulacion");
    try {
      await storeDocumentFile(id, documentFile);
      const row: DocumentRow = {
        id,
        ...documentDraft,
        fechaRegistro: timestamp(),
        archivoId: id,
        archivo: documentFile.name,
        size: documentFile.size,
      };
      setDocuments([row, ...documents]);
      setDocumentFile(null);
      setMessage({ type: "success", text: "Documento incorporado al expediente de titulación." });
    } catch {
      setMessage({ type: "error", text: "No se pudo almacenar el documento." });
    }
  }

  function validateFile(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["pdf", "doc", "docx", "jpg", "jpeg", "png"].includes(extension)) {
      setMessage({
        type: "warning",
        text: "El archivo debe ser PDF, Word, JPG, JPEG o PNG.",
      });
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: "warning", text: "El archivo supera el límite permitido de 15 MB." });
      return false;
    }
    return true;
  }

  async function handleDownload(id: string, fileName: string) {
    try {
      const blob = await readDocumentFile(id);
      if (!blob) {
        setMessage({
          type: "warning",
          text: "El archivo ya no está disponible en este navegador.",
        });
        return;
      }
      downloadBlobFile(fileName, blob);
    } catch {
      setMessage({ type: "error", text: "No se pudo descargar el archivo." });
    }
  }

  async function handleDeleteFile(
    id: string,
    target: "presentation" | "qualification" | "document",
  ) {
    try {
      await deleteDocumentFile(id);
      if (target === "presentation") {
        setPresentations(presentations.filter((entry) => entry.id !== id));
      } else if (target === "qualification") {
        setQualifications(qualifications.filter((entry) => entry.id !== id));
      } else {
        setDocuments(documents.filter((entry) => entry.id !== id));
      }
      setMessage({ type: "success", text: "Registro y archivo eliminados." });
    } catch {
      setMessage({ type: "error", text: "No se pudo eliminar el archivo." });
    }
  }

  function handleSave() {
    if (!form.partidaMatriz.trim() || !form.areaTitular.trim()) {
      setMessage({
        type: "warning",
        text: "Complete la partida matriz y el área materia de titulación.",
      });
      return;
    }
    if (form.estadoResultado === "INSCRITO" && !form.partidaFinal.trim()) {
      setMessage({
        type: "warning",
        text: "Para concluir como inscrito debe registrar la nueva partida a favor del MTC.",
      });
      return;
    }
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        form,
        presentationDraft,
        presentations,
        qualificationDraft,
        qualifications,
        documentDraft,
        documents,
      }),
    );
    setMessage({ type: "success", text: "El expediente de titulación quedó guardado." });
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Saneamiento registral y titulación"
        badgeLabel="Predio"
        badgeValue={predioCode}
        badgeSuffix={`Saneamiento e inscripción · 5.1 · ${currentStatus}`}
      />

      <main className="mx-auto max-w-[1400px] p-4">
        <div className="rounded border bg-white px-5 py-5">
          <div className="mb-4 flex border-b">
            <div
              className="inline-flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-[12px] font-medium"
              style={{ borderColor: RED, color: RED }}
            >
              <Landmark size={14} /> 5.1 Saneamiento registral y titulación a favor del MTC
            </div>
          </div>

          <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-4">
            <SummaryCard icon={<Building2 size={14} />} label="Titular destino" value="MTC" />
            <SummaryCard
              icon={<ClipboardCheck size={14} />}
              label="Títulos presentados"
              value={`${presentations.length}`}
            />
            <SummaryCard
              icon={<SearchCheck size={14} />}
              label="Actuaciones SUNARP"
              value={`${qualifications.length}`}
            />
            <SummaryCard icon={<ShieldCheck size={14} />} label="Estado" value={currentStatus} />
          </div>

          {message && (
            <div
              className={`mb-3 flex items-start gap-2 rounded border px-3 py-2 text-[11px] ${
                message.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : message.type === "warning"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <SectionTitle>Información del predio y antecedentes registrales</SectionTitle>
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2">
            <Field label="Código de predio">
              <input className={`${inputCls} bg-gray-50`} value={predioCode} readOnly />
            </Field>
            <Field label="Proyecto">
              <input className={`${inputCls} bg-gray-50`} value={projectLabel} readOnly />
            </Field>
            <Field label="Zona registral">
              <input
                className={inputCls}
                value={form.zonaRegistral}
                onChange={(event) => setField("zonaRegistral", event.target.value)}
              />
            </Field>
            <Field label="Oficina registral">
              <input
                className={inputCls}
                value={form.oficinaRegistral}
                onChange={(event) => setField("oficinaRegistral", event.target.value)}
              />
            </Field>
            <Field label="Partida matriz" required>
              <input
                className={inputCls}
                value={form.partidaMatriz}
                onChange={(event) => setField("partidaMatriz", event.target.value)}
              />
            </Field>
            <Field label="Titular registral actual">
              <input
                className={inputCls}
                value={form.titularActual}
                onChange={(event) => setField("titularActual", event.target.value)}
              />
            </Field>
            <Field label="Área del antecedente">
              <div className="relative">
                <input
                  className={`${inputCls} pr-10`}
                  value={form.areaAntecedente}
                  onChange={(event) => setField("areaAntecedente", event.target.value)}
                />
                <span className="absolute right-2 top-2 text-[10px] text-gray-400">m²</span>
              </div>
            </Field>
            <Field label="Condición registral">
              <input
                className={inputCls}
                value={form.condicionRegistral}
                onChange={(event) => setField("condicionRegistral", event.target.value)}
              />
            </Field>
          </div>

          <SectionTitle>Expediente técnico-legal de titulación</SectionTitle>
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2">
            <Field label="Tipo de saneamiento" required>
              <select
                className={selectCls}
                value={form.tipoSaneamiento}
                onChange={(event) => setField("tipoSaneamiento", event.target.value)}
              >
                <option>INDEPENDIZACIÓN Y TITULACIÓN</option>
                <option>INMATRICULACIÓN</option>
                <option>RECTIFICACIÓN DE ÁREA Y TITULACIÓN</option>
                <option>ACUMULACIÓN E INSCRIPCIÓN DE DOMINIO</option>
              </select>
            </Field>
            <Field label="Acto solicitado">
              <input
                className={inputCls}
                value={form.actoSolicitado}
                onChange={(event) => setField("actoSolicitado", event.target.value)}
              />
            </Field>
            <Field label="Base legal">
              <input
                className={inputCls}
                value={form.baseLegal}
                onChange={(event) => setField("baseLegal", event.target.value)}
              />
            </Field>
            <Field label="Resolución de sustento">
              <input
                className={inputCls}
                value={form.resolucionSustento}
                onChange={(event) => setField("resolucionSustento", event.target.value)}
              />
            </Field>
            <Field label="Fecha de resolución">
              <input
                type="date"
                className={inputCls}
                value={form.fechaResolucion}
                onChange={(event) => setField("fechaResolucion", event.target.value)}
              />
            </Field>
            <Field label="Área a titular" required>
              <div className="relative">
                <input
                  className={`${inputCls} pr-10`}
                  value={form.areaTitular}
                  onChange={(event) => setField("areaTitular", event.target.value)}
                />
                <span className="absolute right-2 top-2 text-[10px] text-gray-400">m²</span>
              </div>
            </Field>
            <Field label="Especialista legal">
              <input
                className={inputCls}
                value={form.responsableLegal}
                onChange={(event) => setField("responsableLegal", event.target.value)}
              />
            </Field>
            <Field label="Especialista técnico">
              <input
                className={inputCls}
                value={form.responsableTecnico}
                onChange={(event) => setField("responsableTecnico", event.target.value)}
              />
            </Field>
            <Field label="Titular de destino">
              <input className={`${inputCls} bg-gray-50`} value={form.titularDestino} readOnly />
            </Field>
            <Field label="RUC del MTC">
              <input className={`${inputCls} bg-gray-50`} value={form.rucTitularDestino} readOnly />
            </Field>
            <Field label="Estado del expediente">
              <select
                className={selectCls}
                value={form.estadoExpediente}
                onChange={(event) => setField("estadoExpediente", event.target.value)}
              >
                <option>EXPEDIENTE EN PREPARACIÓN</option>
                <option>EXPEDIENTE TÉCNICO-LEGAL COMPLETO</option>
                <option>PRESENTADO A SUNARP</option>
                <option>EN CALIFICACIÓN SUNARP</option>
                <option>OBSERVADO</option>
                <option>SUBSANADO</option>
                <option>CONCLUIDO</option>
              </select>
            </Field>
          </div>

          <SectionTitle>Presentación del título ante SUNARP</SectionTitle>
          <div className="rounded border border-gray-200 bg-white px-3 py-3">
            <div className="mb-3 border-b border-red-200 pb-1.5 text-[10px] font-semibold tracking-wide text-red-500">
              DATOS DEL TÍTULO Y CARGO DE PRESENTACIÓN
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2">
              <Field label="Número de título" required>
                <input
                  className={inputCls}
                  value={presentationDraft.numeroTitulo}
                  onChange={(event) => setPresentationField("numeroTitulo", event.target.value)}
                />
              </Field>
              <Field label="Año del título">
                <input
                  className={inputCls}
                  value={presentationDraft.anioTitulo}
                  onChange={(event) => setPresentationField("anioTitulo", event.target.value)}
                />
              </Field>
              <Field label="Oficina registral">
                <input
                  className={inputCls}
                  value={presentationDraft.oficina}
                  onChange={(event) => setPresentationField("oficina", event.target.value)}
                />
              </Field>
              <Field label="Fecha de presentación" required>
                <input
                  type="date"
                  className={inputCls}
                  value={presentationDraft.fechaPresentacion}
                  onChange={(event) =>
                    setPresentationField("fechaPresentacion", event.target.value)
                  }
                />
              </Field>
              <Field label="Fecha de vencimiento">
                <input
                  type="date"
                  className={inputCls}
                  value={presentationDraft.fechaVencimiento}
                  onChange={(event) => setPresentationField("fechaVencimiento", event.target.value)}
                />
              </Field>
              <Field label="Lugar / canal">
                <input
                  className={inputCls}
                  value={presentationDraft.lugarPresentacion}
                  onChange={(event) =>
                    setPresentationField("lugarPresentacion", event.target.value)
                  }
                />
              </Field>
              <Field label="Presentante">
                <input
                  className={inputCls}
                  value={presentationDraft.presentante}
                  onChange={(event) => setPresentationField("presentante", event.target.value)}
                />
              </Field>
              <Field label="Documento del presentante">
                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <select
                    className={selectCls}
                    value={presentationDraft.tipoDocumento}
                    onChange={(event) => setPresentationField("tipoDocumento", event.target.value)}
                  >
                    <option>DNI</option>
                    <option>CE</option>
                    <option>CIP</option>
                  </select>
                  <input
                    className={inputCls}
                    value={presentationDraft.numeroDocumento}
                    onChange={(event) =>
                      setPresentationField("numeroDocumento", event.target.value)
                    }
                  />
                </div>
              </Field>
              <Field label="Recibo de pago">
                <input
                  className={inputCls}
                  value={presentationDraft.reciboPago}
                  onChange={(event) => setPresentationField("reciboPago", event.target.value)}
                />
              </Field>
              <Field label="Monto pagado">
                <div className="relative">
                  <span className="absolute left-2 top-2 text-[10px] text-gray-400">S/</span>
                  <input
                    className={`${inputCls} pl-7`}
                    value={presentationDraft.montoPagado}
                    onChange={(event) => setPresentationField("montoPagado", event.target.value)}
                  />
                </div>
              </Field>
              <Field label="Estado">
                <select
                  className={selectCls}
                  value={presentationDraft.estado}
                  onChange={(event) => setPresentationField("estado", event.target.value)}
                >
                  <option>PRESENTADO</option>
                  <option>EN CALIFICACIÓN</option>
                  <option>OBSERVADO</option>
                  <option>SUBSANADO</option>
                  <option>INSCRITO</option>
                </select>
              </Field>
              <Field label="Cargo SUNARP" required>
                <label className="flex h-8 cursor-pointer items-center justify-between rounded border border-gray-300 px-2 text-[11px] text-gray-600">
                  <span className="truncate">
                    {presentationCargo?.name || "Seleccionar cargo de presentación"}
                  </span>
                  <Upload size={13} />
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) => setPresentationCargo(event.target.files?.[0] || null)}
                  />
                </label>
              </Field>
              <Field label="Observaciones" className="items-start lg:col-span-2">
                <textarea
                  className="min-h-[52px] w-full rounded border border-gray-300 px-2 py-2 text-[12px]"
                  value={presentationDraft.observaciones}
                  onChange={(event) => setPresentationField("observaciones", event.target.value)}
                />
              </Field>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => void handleRegisterPresentation()}
                className="inline-flex h-8 items-center gap-1.5 rounded bg-red-600 px-3 text-[11px] font-medium text-white hover:bg-red-700"
              >
                <Plus size={14} /> Registrar título presentado
              </button>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto rounded border border-gray-200">
            <table className="w-full min-w-[980px] text-[10px]">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-2 py-2 text-left">Título</th>
                  <th className="px-2 py-2 text-left">Presentación / vencimiento</th>
                  <th className="px-2 py-2 text-left">Oficina</th>
                  <th className="px-2 py-2 text-left">Presentante</th>
                  <th className="px-2 py-2 text-left">Pago</th>
                  <th className="px-2 py-2 text-left">Cargo</th>
                  <th className="px-2 py-2 text-left">Estado</th>
                  <th className="px-2 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {presentations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-gray-400">
                      No existen títulos presentados registrados.
                    </td>
                  </tr>
                ) : (
                  presentations.map((entry) => (
                    <tr key={entry.id} className="border-t border-gray-100 align-top">
                      <td className="px-2 py-2 font-semibold">{entry.numeroTitulo}</td>
                      <td className="px-2 py-2">
                        {entry.fechaPresentacion}
                        <br />
                        <span className="text-gray-400">Vence: {entry.fechaVencimiento}</span>
                      </td>
                      <td className="px-2 py-2">{entry.oficina}</td>
                      <td className="px-2 py-2">
                        {entry.presentante}
                        <br />
                        <span className="text-gray-400">
                          {entry.tipoDocumento} {entry.numeroDocumento}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        S/ {entry.montoPagado}
                        <br />
                        <span className="text-gray-400">{entry.reciboPago}</span>
                      </td>
                      <td className="px-2 py-2">
                        {entry.cargoArchivo}
                        <br />
                        <span className="text-gray-400">{formatFileSize(entry.cargoSize)}</span>
                      </td>
                      <td className="px-2 py-2">{entry.estado}</td>
                      <td className="px-2 py-2">
                        <TableActions
                          onDownload={() => void handleDownload(entry.cargoId, entry.cargoArchivo)}
                          onDelete={() => void handleDeleteFile(entry.id, "presentation")}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <SectionTitle>Calificación, observaciones y subsanaciones</SectionTitle>
          <div className="rounded border border-gray-200 bg-white px-3 py-3">
            <div className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2">
              <Field label="Fecha de actuación">
                <input
                  type="date"
                  className={inputCls}
                  value={qualificationDraft.fecha}
                  onChange={(event) => setQualificationField("fecha", event.target.value)}
                />
              </Field>
              <Field label="Tipo de actuación">
                <select
                  className={selectCls}
                  value={qualificationDraft.tipo}
                  onChange={(event) => setQualificationField("tipo", event.target.value)}
                >
                  <option>ESQUELA DE OBSERVACIÓN</option>
                  <option>LIQUIDACIÓN DE MAYOR DERECHO</option>
                  <option>DOCUMENTO DE SUBSANACIÓN</option>
                  <option>ESQUELA DE TACHA</option>
                  <option>PRÓRROGA DEL ASIENTO DE PRESENTACIÓN</option>
                </select>
              </Field>
              <Field label="Número de documento" required>
                <input
                  className={inputCls}
                  value={qualificationDraft.numeroDocumento}
                  onChange={(event) => setQualificationField("numeroDocumento", event.target.value)}
                />
              </Field>
              <Field label="Fecha límite de atención">
                <input
                  type="date"
                  className={inputCls}
                  value={qualificationDraft.fechaLimite}
                  onChange={(event) => setQualificationField("fechaLimite", event.target.value)}
                />
              </Field>
              <Field label="Estado">
                <select
                  className={selectCls}
                  value={qualificationDraft.estado}
                  onChange={(event) => setQualificationField("estado", event.target.value)}
                >
                  <option>PENDIENTE DE ATENCIÓN</option>
                  <option>EN PREPARACIÓN</option>
                  <option>ATENDIDO</option>
                  <option>VENCIDO</option>
                </select>
              </Field>
              <Field label="Documento" required>
                <label className="flex h-8 cursor-pointer items-center justify-between rounded border border-gray-300 px-2 text-[11px] text-gray-600">
                  <span className="truncate">
                    {qualificationFile?.name || "Seleccionar documento"}
                  </span>
                  <Upload size={13} />
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(event) => setQualificationFile(event.target.files?.[0] || null)}
                  />
                </label>
              </Field>
              <Field label="Detalle" required className="items-start lg:col-span-2">
                <textarea
                  className="min-h-[52px] w-full rounded border border-gray-300 px-2 py-2 text-[12px]"
                  value={qualificationDraft.detalle}
                  onChange={(event) => setQualificationField("detalle", event.target.value)}
                  placeholder="Describa la observación, requisito pendiente o subsanación presentada."
                />
              </Field>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => void handleRegisterQualification()}
                className="inline-flex h-8 items-center gap-1.5 rounded bg-red-600 px-3 text-[11px] font-medium text-white hover:bg-red-700"
              >
                <Plus size={14} /> Agregar actuación
              </button>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto rounded border border-gray-200">
            <table className="w-full min-w-[900px] text-[10px]">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-2 py-2 text-left">Fecha</th>
                  <th className="px-2 py-2 text-left">Actuación</th>
                  <th className="px-2 py-2 text-left">Documento</th>
                  <th className="px-2 py-2 text-left">Detalle</th>
                  <th className="px-2 py-2 text-left">Plazo</th>
                  <th className="px-2 py-2 text-left">Estado</th>
                  <th className="px-2 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {qualifications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-gray-400">
                      No existen actuaciones de calificación registradas.
                    </td>
                  </tr>
                ) : (
                  qualifications.map((entry) => (
                    <tr key={entry.id} className="border-t border-gray-100 align-top">
                      <td className="px-2 py-2">{entry.fecha}</td>
                      <td className="px-2 py-2 font-medium">{entry.tipo}</td>
                      <td className="px-2 py-2">
                        {entry.numeroDocumento}
                        <br />
                        <span className="text-gray-400">{entry.archivo}</span>
                      </td>
                      <td className="max-w-[320px] px-2 py-2">{entry.detalle}</td>
                      <td className="px-2 py-2">{entry.fechaLimite}</td>
                      <td className="px-2 py-2">{entry.estado}</td>
                      <td className="px-2 py-2">
                        <TableActions
                          onDownload={() => void handleDownload(entry.archivoId, entry.archivo)}
                          onDelete={() => void handleDeleteFile(entry.id, "qualification")}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <SectionTitle>Resultado final de la titulación</SectionTitle>
          {form.estadoResultado === "INSCRITO" && (
            <div className="mb-3 flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-[11px] text-green-700">
              <CheckCircle2 size={15} /> Predio titulado e inscrito a favor del Ministerio de
              Transportes y Comunicaciones.
            </div>
          )}
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2">
            <Field label="Resultado">
              <select
                className={selectCls}
                value={form.estadoResultado}
                onChange={(event) => setField("estadoResultado", event.target.value)}
              >
                <option>PENDIENTE</option>
                <option>INSCRITO</option>
                <option>TACHADO</option>
                <option>DESISTIDO</option>
              </select>
            </Field>
            <Field label="Número de título final">
              <input
                className={inputCls}
                value={form.numeroTituloFinal}
                onChange={(event) => setField("numeroTituloFinal", event.target.value)}
              />
            </Field>
            <Field label="Nueva partida registral">
              <input
                className={inputCls}
                value={form.partidaFinal}
                onChange={(event) => setField("partidaFinal", event.target.value)}
              />
            </Field>
            <Field label="Asiento de inscripción">
              <input
                className={inputCls}
                value={form.asientoInscripcion}
                onChange={(event) => setField("asientoInscripcion", event.target.value)}
              />
            </Field>
            <Field label="Fecha de inscripción">
              <input
                type="date"
                className={inputCls}
                value={form.fechaInscripcion}
                onChange={(event) => setField("fechaInscripcion", event.target.value)}
              />
            </Field>
            <Field label="Área inscrita">
              <div className="relative">
                <input
                  className={`${inputCls} pr-10`}
                  value={form.areaInscrita}
                  onChange={(event) => setField("areaInscrita", event.target.value)}
                />
                <span className="absolute right-2 top-2 text-[10px] text-gray-400">m²</span>
              </div>
            </Field>
            <Field label="Propietario final">
              <input className={`${inputCls} bg-gray-50`} value={form.propietarioFinal} readOnly />
            </Field>
            <Field label="Observaciones" className="items-start lg:col-span-2">
              <textarea
                className="min-h-[52px] w-full rounded border border-gray-300 px-2 py-2 text-[12px]"
                value={form.observacionesResultado}
                onChange={(event) => setField("observacionesResultado", event.target.value)}
              />
            </Field>
          </div>

          <SectionTitle>Documentos del expediente de titulación</SectionTitle>
          <div className="rounded border border-gray-200 bg-white px-3 py-3">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              <select
                className={selectCls}
                value={documentDraft.etapa}
                onChange={(event) => setDocumentField("etapa", event.target.value)}
              >
                <option>EXPEDIENTE DE TITULACIÓN</option>
                <option>PRESENTACIÓN SUNARP</option>
                <option>CALIFICACIÓN</option>
                <option>SUBSANACIÓN</option>
                <option>INSCRIPCIÓN FINAL</option>
              </select>
              <select
                className={selectCls}
                value={documentDraft.tipo}
                onChange={(event) => setDocumentField("tipo", event.target.value)}
              >
                <option>MEMORIA DESCRIPTIVA</option>
                <option>PLANO PERIMÉTRICO</option>
                <option>PLANO DE UBICACIÓN</option>
                <option>RESOLUCIÓN</option>
                <option>FORMULARIO REGISTRAL</option>
                <option>PARTIDA REGISTRAL</option>
                <option>CERTIFICADO REGISTRAL</option>
                <option>OTRO</option>
              </select>
              <input
                className={inputCls}
                value={documentDraft.numero}
                onChange={(event) => setDocumentField("numero", event.target.value)}
                placeholder="Número del documento"
              />
              <label className="flex h-8 cursor-pointer items-center justify-between rounded border border-gray-300 px-2 text-[11px] text-gray-600">
                <span className="truncate">{documentFile?.name || "Seleccionar archivo"}</span>
                <Upload size={13} />
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(event) => setDocumentFile(event.target.files?.[0] || null)}
                />
              </label>
              <button
                type="button"
                onClick={() => void handleUploadDocument()}
                className="inline-flex h-8 items-center justify-center gap-1 rounded bg-red-600 px-3 text-[11px] text-white hover:bg-red-700"
              >
                <Plus size={14} /> Agregar
              </button>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[160px_1fr_160px]">
              <input
                type="date"
                className={inputCls}
                value={documentDraft.fecha}
                onChange={(event) => setDocumentField("fecha", event.target.value)}
              />
              <input
                className={inputCls}
                value={documentDraft.descripcion}
                onChange={(event) => setDocumentField("descripcion", event.target.value)}
                placeholder="Descripción del documento"
              />
              <select
                className={selectCls}
                value={documentDraft.estado}
                onChange={(event) => setDocumentField("estado", event.target.value)}
              >
                <option>VIGENTE</option>
                <option>EN REVISIÓN</option>
                <option>OBSERVADO</option>
                <option>REEMPLAZADO</option>
              </select>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto rounded border border-gray-200">
            <table className="w-full min-w-[900px] text-[10px]">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-2 py-2 text-left">Etapa</th>
                  <th className="px-2 py-2 text-left">Tipo / número</th>
                  <th className="px-2 py-2 text-left">Descripción</th>
                  <th className="px-2 py-2 text-left">Fecha</th>
                  <th className="px-2 py-2 text-left">Archivo</th>
                  <th className="px-2 py-2 text-left">Estado</th>
                  <th className="px-2 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-gray-400">
                      No existen documentos incorporados al expediente.
                    </td>
                  </tr>
                ) : (
                  documents.map((entry) => (
                    <tr key={entry.id} className="border-t border-gray-100 align-top">
                      <td className="px-2 py-2">{entry.etapa}</td>
                      <td className="px-2 py-2">
                        <span className="font-medium">{entry.tipo}</span>
                        <br />
                        <span className="text-gray-400">{entry.numero || "Sin número"}</span>
                      </td>
                      <td className="px-2 py-2">{entry.descripcion}</td>
                      <td className="px-2 py-2">{entry.fecha}</td>
                      <td className="px-2 py-2">
                        {entry.archivo}
                        <br />
                        <span className="text-gray-400">{formatFileSize(entry.size)}</span>
                      </td>
                      <td className="px-2 py-2">{entry.estado}</td>
                      <td className="px-2 py-2">
                        <TableActions
                          onDownload={() => void handleDownload(entry.archivoId, entry.archivo)}
                          onDelete={() => void handleDeleteFile(entry.id, "document")}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-center gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 px-4 text-[11px] text-gray-600 hover:bg-gray-50"
            >
              <X size={14} /> Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-red-600 px-4 text-[11px] font-medium text-white hover:bg-red-700"
            >
              <Save size={14} /> Guardar expediente
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function TableActions({ onDownload, onDelete }: { onDownload: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-center gap-1">
      <button
        type="button"
        title="Descargar"
        onClick={onDownload}
        className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
      >
        <Download size={13} />
      </button>
      <button
        type="button"
        title="Eliminar"
        onClick={onDelete}
        className="inline-flex h-7 w-7 items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadBlobFile(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function openDocumentDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(FILE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(FILE_STORE_NAME)) {
        request.result.createObjectStore(FILE_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function storeDocumentFile(id: string, blob: Blob) {
  const database = await openDocumentDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(FILE_STORE_NAME, "readwrite");
    transaction.objectStore(FILE_STORE_NAME).put(blob, id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  database.close();
}

async function readDocumentFile(id: string) {
  const database = await openDocumentDatabase();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const transaction = database.transaction(FILE_STORE_NAME, "readonly");
    const request = transaction.objectStore(FILE_STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return blob;
}

async function deleteDocumentFile(id: string) {
  const database = await openDocumentDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(FILE_STORE_NAME, "readwrite");
    transaction.objectStore(FILE_STORE_NAME).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  database.close();
}
