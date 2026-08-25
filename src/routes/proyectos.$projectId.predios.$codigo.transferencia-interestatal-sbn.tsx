import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Download,
  FileCheck2,
  FilePenLine,
  FileText,
  Landmark,
  Save,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute(
  "/proyectos/$projectId/predios/$codigo/transferencia-interestatal-sbn",
)({
  head: () => ({
    meta: [
      { title: "Transferencia interestatal – SBN" },
      {
        name: "description",
        content:
          "Generación del oficio, presentación por mesa de partes y seguimiento de la transferencia interestatal ante la SBN.",
      },
    ],
  }),
  component: TransferenciaInterestatalSbnPage,
});

const RED = "#dc2626";
const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] focus:border-gray-500 focus:outline-none";
const selectCls = `${inputCls} appearance-none`;
const FILE_DB_NAME = "predio-documentos-db";
const FILE_STORE_NAME = "archivos";
const MAX_FILE_SIZE = 15 * 1024 * 1024;

type FormState = {
  entidadTransferente: string;
  entidadBeneficiaria: string;
  dependenciaSbn: string;
  cusSbn: string;
  oficinaRegistral: string;
  partidaRegistral: string;
  areaRegistral: string;
  numeroOficio: string;
  fechaOficio: string;
  destinatario: string;
  cargoDestinatario: string;
  asunto: string;
  referencia: string;
  sustento: string;
  anexos: string;
  responsable: string;
  estado: string;
  resolucionSbn: string;
  fechaResolucion: string;
  publicacion: string;
  fechaPublicacion: string;
  fechaInscripcion: string;
  partidaFinal: string;
  observacionesResultado: string;
};

type DocumentRow = {
  id: string;
  version: string;
  tipo: "BORRADOR" | "OFICIAL";
  descripcion: string;
  archivo: string;
  size: number;
  fecha: string;
  responsable: string;
  estado: string;
  versionOrigen?: string;
};

type MesaDraft = {
  fechaIngreso: string;
  horaIngreso: string;
  canal: string;
  numeroTramite: string;
  expedienteSbn: string;
  hojaRuta: string;
  dependencia: string;
  recibidoPor: string;
  correoUrl: string;
  estado: string;
  observaciones: string;
};

type MesaEntry = MesaDraft & {
  id: string;
  fechaRegistro: string;
  oficioVersion: string;
  oficioArchivo: string;
  cargoId: string;
  cargoArchivo: string;
  cargoSize: number;
};

type PersistedState = {
  form?: FormState;
  documents?: DocumentRow[];
  submissions?: MesaEntry[];
  mesaDraft?: MesaDraft;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function currentTime() {
  return new Date().toTimeString().slice(0, 5);
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

function TransferenciaInterestatalSbnPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const predioCode = predio?.cod || decodedCodigo;
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;
  const safeCode = predioCode.replace(/[^A-Z0-9-]/gi, "").toUpperCase();
  const storageKey = `transferencia-interestatal-sbn:${projectId}:${decodedCodigo}`;

  const initialForm = useMemo<FormState>(
    () => ({
      entidadTransferente: "ESTADO PERUANO",
      entidadBeneficiaria: "MINISTERIO DE TRANSPORTES Y COMUNICACIONES",
      dependenciaSbn: "SDAPE - Subdirección de Administración del Patrimonio Estatal",
      cusSbn: "",
      oficinaRegistral: predio?.ofi || "",
      partidaRegistral: predio?.part || "",
      areaRegistral: predio?.m2 || "",
      numeroOficio: `OFICIO-${new Date().getFullYear()}-MTC/20`,
      fechaOficio: today(),
      destinatario: "Superintendente Nacional de Bienes Estatales",
      cargoDestinatario: "SUPERINTENDENCIA NACIONAL DE BIENES ESTATALES",
      asunto: `Solicitud de transferencia interestatal del predio ${predioCode}`,
      referencia: predio?.exp ? `Expediente predial ${predio.exp}` : "Expediente predial",
      sustento:
        "Se solicita la transferencia interestatal a favor del Ministerio de Transportes y Comunicaciones para la ejecución y continuidad del proyecto de infraestructura indicado.",
      anexos:
        "Memoria descriptiva, plano perimétrico, plano de ubicación, partida registral y documentación técnica y legal del predio.",
      responsable: proyecto?.coordinadorPredial || predio?.rlegal || "",
      estado: "BORRADOR",
      resolucionSbn: "",
      fechaResolucion: "",
      publicacion: "",
      fechaPublicacion: "",
      fechaInscripcion: "",
      partidaFinal: predio?.part || "",
      observacionesResultado: "",
    }),
    [
      predio?.exp,
      predio?.m2,
      predio?.ofi,
      predio?.part,
      predio?.rlegal,
      predioCode,
      proyecto?.coordinadorPredial,
    ],
  );

  const initialMesaDraft = useMemo<MesaDraft>(
    () => ({
      fechaIngreso: today(),
      horaIngreso: currentTime(),
      canal: "MESA DE PARTES VIRTUAL SBN",
      numeroTramite: "",
      expedienteSbn: "",
      hojaRuta: "",
      dependencia: "SDAPE",
      recibidoPor: "Mesa de Partes SBN",
      correoUrl: "",
      estado: "PRESENTADO",
      observaciones: "",
    }),
    [],
  );

  const [form, setForm] = useState<FormState>(initialForm);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [submissions, setSubmissions] = useState<MesaEntry[]>([]);
  const [mesaDraft, setMesaDraft] = useState<MesaDraft>(initialMesaDraft);
  const [cargoFile, setCargoFile] = useState<File | null>(null);
  const [officialDescription, setOfficialDescription] = useState(
    "Oficio firmado dirigido a la SBN",
  );
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "warning" | "error";
    text: string;
  } | null>(null);

  const drafts = documents.filter((document) => document.tipo === "BORRADOR");
  const officialDocuments = documents.filter((document) => document.tipo === "OFICIAL");
  const latestDraft = drafts[0];
  const latestOfficial = officialDocuments[0];
  const currentStatus = form.resolucionSbn
    ? "RESOLUCIÓN REGISTRADA"
    : submissions.length
      ? form.estado
      : officialDocuments.length
        ? "OFICIO FIRMADO"
        : drafts.length
          ? "BORRADOR GENERADO"
          : form.estado;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as PersistedState;
        setForm({ ...initialForm, ...parsed.form });
        setDocuments(parsed.documents || []);
        setSubmissions(parsed.submissions || []);
        setMesaDraft({ ...initialMesaDraft, ...parsed.mesaDraft });
      }
    } catch {
      setMessage({
        type: "warning",
        text: "No se pudo recuperar el registro anterior. Puede continuar con uno nuevo.",
      });
    } finally {
      setLoaded(true);
    }
  }, [initialForm, initialMesaDraft, storageKey]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ form, documents, submissions, mesaDraft }),
    );
  }, [documents, form, loaded, mesaDraft, storageKey, submissions]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setMesaField<K extends keyof MesaDraft>(key: K, value: MesaDraft[K]) {
    setMesaDraft((current) => ({ ...current, [key]: value }));
  }

  function validateOficioData() {
    if (!form.numeroOficio.trim() || !form.fechaOficio) {
      setMessage({ type: "warning", text: "Complete el número y la fecha del oficio." });
      return false;
    }
    if (!form.entidadTransferente.trim() || !form.entidadBeneficiaria.trim()) {
      setMessage({
        type: "warning",
        text: "Registre la entidad transferente y la entidad beneficiaria.",
      });
      return false;
    }
    if (!form.responsable.trim()) {
      setMessage({ type: "warning", text: "Registre el responsable que suscribirá el oficio." });
      return false;
    }
    return true;
  }

  async function handleGenerateOficio() {
    if (!validateOficioData()) return;
    const version = `B${drafts.length + 1}`;
    const fileName = `Oficio_Transferencia_SBN_${safeCode}_${version}.doc`;
    const blob = createOficioWordBlob({ form, predio, predioCode, projectLabel, version });
    const id = makeId("oficio-sbn-borrador");
    try {
      await storeDocumentFile(id, blob);
      const row: DocumentRow = {
        id,
        version,
        tipo: "BORRADOR",
        descripcion: "Borrador editable del oficio de transferencia interestatal",
        archivo: fileName,
        size: blob.size,
        fecha: timestamp(),
        responsable: form.responsable,
        estado: "GENERADO",
      };
      setDocuments([row, ...documents]);
      downloadBlobFile(fileName, blob);
      setMessage({
        type: "success",
        text: `Se generó el borrador ${version}. Revíselo, fírmelo y registre el oficio oficial antes de presentarlo a la SBN.`,
      });
    } catch {
      setMessage({ type: "error", text: "No se pudo generar o almacenar el oficio Word." });
    }
  }

  async function handleOfficialUpload(file: File | null) {
    if (!file) return;
    if (!latestDraft) {
      setMessage({ type: "warning", text: "Primero genere el borrador Word del oficio." });
      return;
    }
    if (!isAllowedFile(file, ["pdf"])) {
      setMessage({ type: "warning", text: "El oficio firmado debe cargarse en formato PDF." });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: "warning", text: "El archivo supera el límite permitido de 15 MB." });
      return;
    }
    const id = makeId("oficio-sbn-oficial");
    const version = `F${officialDocuments.length + 1}`;
    try {
      await storeDocumentFile(id, file);
      const row: DocumentRow = {
        id,
        version,
        tipo: "OFICIAL",
        descripcion: officialDescription.trim() || "Oficio firmado dirigido a la SBN",
        archivo: file.name,
        size: file.size,
        fecha: timestamp(),
        responsable: form.responsable,
        estado: "FIRMADO",
        versionOrigen: latestDraft.version,
      };
      setDocuments([row, ...documents]);
      setForm((current) => ({ ...current, estado: "OFICIO FIRMADO" }));
      setMessage({
        type: "success",
        text: `Oficio oficial ${version} registrado y vinculado al borrador ${latestDraft.version}.`,
      });
    } catch {
      setMessage({ type: "error", text: "No se pudo almacenar el oficio firmado." });
    }
  }

  async function handleRegisterMesaPartes() {
    if (!latestOfficial) {
      setMessage({
        type: "warning",
        text: "Registre primero el oficio firmado que será presentado a la SBN.",
      });
      return;
    }
    if (!mesaDraft.fechaIngreso || !mesaDraft.numeroTramite.trim()) {
      setMessage({
        type: "warning",
        text: "Complete la fecha de ingreso y el número de trámite de mesa de partes.",
      });
      return;
    }
    if (!cargoFile) {
      setMessage({
        type: "warning",
        text: "Adjunte el cargo o constancia de recepción emitido por mesa de partes.",
      });
      return;
    }
    if (!isAllowedFile(cargoFile, ["pdf", "jpg", "jpeg", "png"])) {
      setMessage({ type: "warning", text: "El cargo debe estar en PDF, JPG, JPEG o PNG." });
      return;
    }
    if (cargoFile.size > MAX_FILE_SIZE) {
      setMessage({ type: "warning", text: "El cargo supera el límite permitido de 15 MB." });
      return;
    }

    const id = makeId("mesa-partes-sbn");
    try {
      await storeDocumentFile(id, cargoFile);
      const entry: MesaEntry = {
        id,
        ...mesaDraft,
        fechaRegistro: timestamp(),
        oficioVersion: latestOfficial.version,
        oficioArchivo: latestOfficial.archivo,
        cargoId: id,
        cargoArchivo: cargoFile.name,
        cargoSize: cargoFile.size,
      };
      setSubmissions([entry, ...submissions]);
      setForm((current) => ({ ...current, estado: "PRESENTADO A SBN" }));
      setMesaDraft({
        ...initialMesaDraft,
        fechaIngreso: today(),
        horaIngreso: currentTime(),
      });
      setCargoFile(null);
      setMessage({
        type: "success",
        text: `Presentación registrada con trámite ${entry.numeroTramite} y vinculada al oficio ${entry.oficioVersion}.`,
      });
    } catch {
      setMessage({ type: "error", text: "No se pudo almacenar el registro de mesa de partes." });
    }
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

  async function handleDeleteDocument(document: DocumentRow) {
    if (
      document.tipo === "BORRADOR" &&
      documents.some((item) => item.versionOrigen === document.version)
    ) {
      setMessage({
        type: "warning",
        text: `No se puede eliminar ${document.version}: tiene un oficio firmado vinculado.`,
      });
      return;
    }
    if (
      document.tipo === "OFICIAL" &&
      submissions.some((entry) => entry.oficioVersion === document.version)
    ) {
      setMessage({
        type: "warning",
        text: `No se puede eliminar ${document.version}: fue presentado por mesa de partes.`,
      });
      return;
    }
    try {
      await deleteDocumentFile(document.id);
      setDocuments(documents.filter((item) => item.id !== document.id));
      setMessage({ type: "success", text: `Se eliminó la versión ${document.version}.` });
    } catch {
      setMessage({ type: "error", text: "No se pudo eliminar el documento." });
    }
  }

  async function handleDeleteSubmission(entry: MesaEntry) {
    try {
      await deleteDocumentFile(entry.cargoId);
      const nextSubmissions = submissions.filter((item) => item.id !== entry.id);
      setSubmissions(nextSubmissions);
      if (!nextSubmissions.length && !form.resolucionSbn) {
        setForm((current) => ({
          ...current,
          estado: officialDocuments.length ? "OFICIO FIRMADO" : "BORRADOR",
        }));
      }
      setMessage({ type: "success", text: "Se eliminó el registro de mesa de partes." });
    } catch {
      setMessage({ type: "error", text: "No se pudo eliminar la presentación." });
    }
  }

  function handleSave() {
    if (!form.entidadTransferente.trim() || !form.entidadBeneficiaria.trim()) {
      setMessage({ type: "warning", text: "Complete las entidades de la transferencia." });
      return;
    }
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ form, documents, submissions, mesaDraft }),
    );
    setMessage({ type: "success", text: "La transferencia interestatal quedó guardada." });
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Transferencia interestatal – SBN"
        badgeLabel="Predio"
        badgeValue={predioCode}
        badgeSuffix={`Saneamiento e inscripción · 5.3 · ${currentStatus}`}
      />

      <main className="mx-auto max-w-[1400px] p-4">
        <div className="rounded border bg-white px-5 py-5">
          <div className="mb-4 flex border-b">
            <div
              className="inline-flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-[12px] font-medium"
              style={{ borderColor: RED, color: RED }}
            >
              <Landmark size={14} /> 5.3 Transferencia interestatal – SBN
            </div>
          </div>

          <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-4">
            <SummaryCard
              icon={<FilePenLine size={14} />}
              label="Borradores"
              value={`${drafts.length}`}
            />
            <SummaryCard
              icon={<FileCheck2 size={14} />}
              label="Oficios firmados"
              value={`${officialDocuments.length}`}
            />
            <SummaryCard
              icon={<Send size={14} />}
              label="Presentaciones SBN"
              value={`${submissions.length}`}
            />
            <SummaryCard icon={<CheckCircle2 size={14} />} label="Estado" value={currentStatus} />
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

          <SectionTitle>Información registral y entidades intervinientes</SectionTitle>
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2">
            <Field label="Código de predio">
              <input className={`${inputCls} bg-gray-50`} value={predioCode} readOnly />
            </Field>
            <Field label="Proyecto">
              <input className={`${inputCls} bg-gray-50`} value={projectLabel} readOnly />
            </Field>
            <Field label="Entidad transferente" required>
              <input
                className={inputCls}
                value={form.entidadTransferente}
                onChange={(event) => setField("entidadTransferente", event.target.value)}
              />
            </Field>
            <Field label="Entidad beneficiaria" required>
              <input
                className={inputCls}
                value={form.entidadBeneficiaria}
                onChange={(event) => setField("entidadBeneficiaria", event.target.value)}
              />
            </Field>
            <Field label="Dependencia SBN">
              <select
                className={selectCls}
                value={form.dependenciaSbn}
                onChange={(event) => setField("dependenciaSbn", event.target.value)}
              >
                <option>SDAPE - Subdirección de Administración del Patrimonio Estatal</option>
                <option>SDDI - Subdirección de Desarrollo Inmobiliario</option>
                <option>Otra dependencia</option>
              </select>
            </Field>
            <Field label="CUS SBN">
              <input
                className={inputCls}
                value={form.cusSbn}
                onChange={(event) => setField("cusSbn", event.target.value)}
                placeholder="Código Único SINABIP"
              />
            </Field>
            <Field label="Oficina registral">
              <input
                className={inputCls}
                value={form.oficinaRegistral}
                onChange={(event) => setField("oficinaRegistral", event.target.value)}
              />
            </Field>
            <Field label="Partida registral">
              <input
                className={inputCls}
                value={form.partidaRegistral}
                onChange={(event) => setField("partidaRegistral", event.target.value)}
              />
            </Field>
            <Field label="Área registral">
              <div className="relative">
                <input
                  className={`${inputCls} pr-10`}
                  value={form.areaRegistral}
                  onChange={(event) => setField("areaRegistral", event.target.value)}
                />
                <span className="absolute right-2 top-2 text-[10px] text-gray-400">m²</span>
              </div>
            </Field>
            <Field label="Estado del trámite">
              <select
                className={selectCls}
                value={form.estado}
                onChange={(event) => setField("estado", event.target.value)}
              >
                <option>BORRADOR</option>
                <option>OFICIO FIRMADO</option>
                <option>PRESENTADO A SBN</option>
                <option>EN EVALUACIÓN SBN</option>
                <option>OBSERVADO</option>
                <option>APROBADO</option>
                <option>TRANSFERIDO</option>
              </select>
            </Field>
          </div>

          <SectionTitle>1. Elaboración del oficio de transferencia</SectionTitle>
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2">
            <Field label="Número de oficio" required>
              <input
                className={inputCls}
                value={form.numeroOficio}
                onChange={(event) => setField("numeroOficio", event.target.value)}
              />
            </Field>
            <Field label="Fecha del oficio" required>
              <input
                type="date"
                className={inputCls}
                value={form.fechaOficio}
                onChange={(event) => setField("fechaOficio", event.target.value)}
              />
            </Field>
            <Field label="Destinatario">
              <input
                className={inputCls}
                value={form.destinatario}
                onChange={(event) => setField("destinatario", event.target.value)}
              />
            </Field>
            <Field label="Entidad / cargo">
              <input
                className={inputCls}
                value={form.cargoDestinatario}
                onChange={(event) => setField("cargoDestinatario", event.target.value)}
              />
            </Field>
            <Field label="Asunto" className="lg:col-span-2">
              <input
                className={inputCls}
                value={form.asunto}
                onChange={(event) => setField("asunto", event.target.value)}
              />
            </Field>
            <Field label="Referencia" className="lg:col-span-2">
              <input
                className={inputCls}
                value={form.referencia}
                onChange={(event) => setField("referencia", event.target.value)}
              />
            </Field>
            <Field label="Sustento de solicitud" className="items-start lg:col-span-2">
              <textarea
                className="min-h-[60px] w-full rounded border border-gray-300 px-2 py-2 text-[12px] focus:border-gray-500 focus:outline-none"
                value={form.sustento}
                onChange={(event) => setField("sustento", event.target.value)}
              />
            </Field>
            <Field label="Anexos" className="items-start lg:col-span-2">
              <textarea
                className="min-h-[52px] w-full rounded border border-gray-300 px-2 py-2 text-[12px] focus:border-gray-500 focus:outline-none"
                value={form.anexos}
                onChange={(event) => setField("anexos", event.target.value)}
              />
            </Field>
            <Field label="Responsable que firma" required>
              <input
                className={inputCls}
                value={form.responsable}
                onChange={(event) => setField("responsable", event.target.value)}
                placeholder="Apellidos y nombres"
              />
            </Field>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <FilePenLine size={16} />
                </span>
                <div className="flex-1">
                  <p className="text-[12px] font-semibold">Generar borrador Word</p>
                  <p className="mt-1 text-[10px] leading-4 text-gray-500">
                    Genera el oficio editable con la identificación registral, entidades, sustento y
                    relación de anexos.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateOficio}
                    className="mt-3 inline-flex h-8 items-center gap-1.5 rounded bg-red-600 px-3 text-[11px] font-medium text-white hover:bg-red-700"
                  >
                    <Download size={14} /> Generar y descargar Word
                  </button>
                </div>
              </div>
            </div>
            <div className="rounded border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <FileCheck2 size={16} />
                </span>
                <div className="flex-1">
                  <p className="text-[12px] font-semibold">Registrar oficio firmado</p>
                  <p className="mt-1 text-[10px] leading-4 text-gray-500">
                    Suba el oficio oficial firmado. Se vinculará al último borrador{" "}
                    {latestDraft ? `(${latestDraft.version})` : "generado"}.
                  </p>
                  <input
                    className={`${inputCls} mt-2`}
                    value={officialDescription}
                    onChange={(event) => setOfficialDescription(event.target.value)}
                  />
                  <label
                    className={`mt-2 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded px-3 text-[11px] font-medium text-white ${latestDraft ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"}`}
                  >
                    <Upload size={14} /> Subir oficio firmado PDF
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={(event) => {
                        void handleOfficialUpload(event.target.files?.[0] || null);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto rounded border border-gray-200">
            <table className="w-full min-w-[820px] text-[10px]">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-2 py-2 text-left">Versión</th>
                  <th className="px-2 py-2 text-left">Tipo</th>
                  <th className="px-2 py-2 text-left">Documento</th>
                  <th className="px-2 py-2 text-left">Origen</th>
                  <th className="px-2 py-2 text-left">Fecha</th>
                  <th className="px-2 py-2 text-left">Responsable</th>
                  <th className="px-2 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-gray-400">
                      Aún no se han generado documentos.
                    </td>
                  </tr>
                ) : (
                  documents.map((document) => (
                    <tr key={document.id} className="border-t border-gray-100">
                      <td className="px-2 py-2 font-semibold">{document.version}</td>
                      <td className="px-2 py-2">
                        {document.tipo === "OFICIAL" ? "OFICIO FIRMADO" : "BORRADOR WORD"}
                      </td>
                      <td className="px-2 py-2">
                        <p className="font-medium">{document.descripcion}</p>
                        <p className="text-gray-400">
                          {document.archivo} · {formatFileSize(document.size)}
                        </p>
                      </td>
                      <td className="px-2 py-2">{document.versionOrigen || "—"}</td>
                      <td className="px-2 py-2">{document.fecha}</td>
                      <td className="px-2 py-2">{document.responsable}</td>
                      <td className="px-2 py-2">
                        <div className="flex justify-center gap-1">
                          <button
                            type="button"
                            title="Descargar"
                            onClick={() => void handleDownload(document.id, document.archivo)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600"
                          >
                            <Download size={13} />
                          </button>
                          <button
                            type="button"
                            title="Eliminar"
                            onClick={() => void handleDeleteDocument(document)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-red-200 text-red-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <SectionTitle>2. Registro de presentación por mesa de partes SBN</SectionTitle>
          <div className="rounded border border-gray-200 bg-white px-3 py-3">
            <div className="mb-3 border-b border-red-200 pb-1.5 text-[10px] font-semibold tracking-wide text-red-500">
              DATOS DEL CARGO Y NÚMERO DE TRÁMITE
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2">
              <Field label="Oficio que se presenta">
                <input
                  className={`${inputCls} bg-gray-50`}
                  value={
                    latestOfficial
                      ? `${latestOfficial.version} · ${latestOfficial.archivo}`
                      : "Registre primero el oficio firmado"
                  }
                  readOnly
                />
              </Field>
              <Field label="Canal de presentación">
                <select
                  className={selectCls}
                  value={mesaDraft.canal}
                  onChange={(event) => setMesaField("canal", event.target.value)}
                >
                  <option>MESA DE PARTES VIRTUAL SBN</option>
                  <option>MESA DE PARTES PRESENCIAL SBN</option>
                  <option>PLATAFORMA DE INTEROPERABILIDAD</option>
                  <option>CORREO INSTITUCIONAL</option>
                </select>
              </Field>
              <Field label="Fecha de ingreso" required>
                <input
                  type="date"
                  className={inputCls}
                  value={mesaDraft.fechaIngreso}
                  onChange={(event) => setMesaField("fechaIngreso", event.target.value)}
                />
              </Field>
              <Field label="Hora de ingreso">
                <input
                  type="time"
                  className={inputCls}
                  value={mesaDraft.horaIngreso}
                  onChange={(event) => setMesaField("horaIngreso", event.target.value)}
                />
              </Field>
              <Field label="Número de trámite" required>
                <input
                  className={inputCls}
                  value={mesaDraft.numeroTramite}
                  onChange={(event) => setMesaField("numeroTramite", event.target.value)}
                  placeholder="Número de registro o trámite"
                />
              </Field>
              <Field label="Expediente SBN">
                <input
                  className={inputCls}
                  value={mesaDraft.expedienteSbn}
                  onChange={(event) => setMesaField("expedienteSbn", event.target.value)}
                  placeholder="Número de expediente asignado"
                />
              </Field>
              <Field label="Hoja de ruta">
                <input
                  className={inputCls}
                  value={mesaDraft.hojaRuta}
                  onChange={(event) => setMesaField("hojaRuta", event.target.value)}
                />
              </Field>
              <Field label="Dependencia receptora">
                <input
                  className={inputCls}
                  value={mesaDraft.dependencia}
                  onChange={(event) => setMesaField("dependencia", event.target.value)}
                />
              </Field>
              <Field label="Recibido por">
                <input
                  className={inputCls}
                  value={mesaDraft.recibidoPor}
                  onChange={(event) => setMesaField("recibidoPor", event.target.value)}
                />
              </Field>
              <Field label="Correo o URL de consulta">
                <input
                  className={inputCls}
                  value={mesaDraft.correoUrl}
                  onChange={(event) => setMesaField("correoUrl", event.target.value)}
                />
              </Field>
              <Field label="Estado de presentación">
                <select
                  className={selectCls}
                  value={mesaDraft.estado}
                  onChange={(event) => setMesaField("estado", event.target.value)}
                >
                  <option>PRESENTADO</option>
                  <option>RECIBIDO</option>
                  <option>DERIVADO</option>
                  <option>OBSERVADO</option>
                  <option>SUBSANADO</option>
                </select>
              </Field>
              <Field label="Cargo de mesa de partes" required>
                <label className="flex h-8 cursor-pointer items-center justify-between rounded border border-gray-300 bg-white px-2 text-[11px] text-gray-600">
                  <span className="truncate">
                    {cargoFile?.name || "Seleccionar cargo o constancia"}
                  </span>
                  <Upload size={13} />
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) => setCargoFile(event.target.files?.[0] || null)}
                  />
                </label>
              </Field>
              <Field label="Observaciones" className="items-start lg:col-span-2">
                <textarea
                  className="min-h-[52px] w-full rounded border border-gray-300 px-2 py-2 text-[12px]"
                  value={mesaDraft.observaciones}
                  onChange={(event) => setMesaField("observaciones", event.target.value)}
                />
              </Field>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => void handleRegisterMesaPartes()}
                className="inline-flex h-8 items-center gap-1.5 rounded bg-red-600 px-3 text-[11px] font-medium text-white hover:bg-red-700"
              >
                <Send size={14} /> Registrar presentación
              </button>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto rounded border border-gray-200">
            <table className="w-full min-w-[1100px] text-[10px]">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-2 py-2 text-left">Fecha / hora</th>
                  <th className="px-2 py-2 text-left">Canal</th>
                  <th className="px-2 py-2 text-left">N.° trámite</th>
                  <th className="px-2 py-2 text-left">Expediente SBN</th>
                  <th className="px-2 py-2 text-left">Hoja de ruta</th>
                  <th className="px-2 py-2 text-left">Dependencia</th>
                  <th className="px-2 py-2 text-left">Oficio</th>
                  <th className="px-2 py-2 text-left">Cargo</th>
                  <th className="px-2 py-2 text-left">Estado</th>
                  <th className="px-2 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-6 text-center text-gray-400">
                      No existen presentaciones registradas en mesa de partes.
                    </td>
                  </tr>
                ) : (
                  submissions.map((entry) => (
                    <tr key={entry.id} className="border-t border-gray-100 align-top">
                      <td className="px-2 py-2">
                        {entry.fechaIngreso}
                        <br />
                        <span className="text-gray-400">{entry.horaIngreso}</span>
                      </td>
                      <td className="px-2 py-2">{entry.canal}</td>
                      <td className="px-2 py-2 font-semibold">{entry.numeroTramite}</td>
                      <td className="px-2 py-2">{entry.expedienteSbn || "—"}</td>
                      <td className="px-2 py-2">{entry.hojaRuta || "—"}</td>
                      <td className="px-2 py-2">{entry.dependencia}</td>
                      <td className="px-2 py-2">{entry.oficioVersion}</td>
                      <td className="px-2 py-2">
                        {entry.cargoArchivo}
                        <br />
                        <span className="text-gray-400">{formatFileSize(entry.cargoSize)}</span>
                      </td>
                      <td className="px-2 py-2">{entry.estado}</td>
                      <td className="px-2 py-2">
                        <div className="flex justify-center gap-1">
                          <button
                            type="button"
                            title="Descargar cargo"
                            onClick={() => void handleDownload(entry.cargoId, entry.cargoArchivo)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600"
                          >
                            <Download size={13} />
                          </button>
                          <button
                            type="button"
                            title="Eliminar"
                            onClick={() => void handleDeleteSubmission(entry)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-red-200 text-red-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <SectionTitle>3. Resultado de la transferencia e inscripción</SectionTitle>
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2">
            <Field label="Resolución SBN">
              <input
                className={inputCls}
                value={form.resolucionSbn}
                onChange={(event) => setField("resolucionSbn", event.target.value)}
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
            <Field label="Publicación">
              <input
                className={inputCls}
                value={form.publicacion}
                onChange={(event) => setField("publicacion", event.target.value)}
                placeholder="Diario, portal o referencia"
              />
            </Field>
            <Field label="Fecha de publicación">
              <input
                type="date"
                className={inputCls}
                value={form.fechaPublicacion}
                onChange={(event) => setField("fechaPublicacion", event.target.value)}
              />
            </Field>
            <Field label="Partida final">
              <input
                className={inputCls}
                value={form.partidaFinal}
                onChange={(event) => setField("partidaFinal", event.target.value)}
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
            <Field label="Observaciones" className="items-start lg:col-span-2">
              <textarea
                className="min-h-[52px] w-full rounded border border-gray-300 px-2 py-2 text-[12px]"
                value={form.observacionesResultado}
                onChange={(event) => setField("observacionesResultado", event.target.value)}
              />
            </Field>
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
              <Save size={14} /> Guardar transferencia
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function createOficioWordBlob({
  form,
  predio,
  predioCode,
  projectLabel,
  version,
}: {
  form: FormState;
  predio: ReturnType<typeof getPredioByCodigo>;
  predioCode: string;
  projectLabel: string;
  version: string;
}) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: A4; margin: 2.5cm; }
    body { font-family: Arial, sans-serif; color: #111827; font-size: 11pt; line-height: 1.55; }
    .header { text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 28px; }
    .date { text-align: right; margin-bottom: 22px; }
    .label { display: inline-block; width: 95px; font-weight: bold; vertical-align: top; }
    .value { display: inline-block; width: 520px; }
    p { margin: 9px 0; text-align: justify; }
    table { width: 100%; border-collapse: collapse; margin: 14px 0; }
    th, td { border: 1px solid #9ca3af; padding: 6px; font-size: 9.5pt; text-align: left; }
    th { width: 28%; background: #f3f4f6; }
    .signature { width: 58%; margin: 70px auto 0; border-top: 1px solid #111827; text-align: center; padding-top: 6px; }
    .footer { margin-top: 42px; color: #6b7280; font-size: 8pt; text-align: right; }
  </style></head><body>
    <div class="header">${escapeHtml(form.numeroOficio)}</div>
    <p class="date">Lima, ${escapeHtml(form.fechaOficio)}</p>
    <p>Señor(a)<br><b>${escapeHtml(form.destinatario)}</b><br>${escapeHtml(form.cargoDestinatario)}<br>Presente.-</p>
    <p><span class="label">Asunto:</span><span class="value"><b>${escapeHtml(form.asunto)}</b></span></p>
    <p><span class="label">Referencia:</span><span class="value">${escapeHtml(form.referencia)}</span></p>
    <p>De mi consideración:</p>
    <p>${escapeHtml(form.sustento)}</p>
    <p>La solicitud comprende el siguiente predio estatal:</p>
    <table>
      <tr><th>Proyecto</th><td>${escapeHtml(projectLabel)}</td></tr>
      <tr><th>Código de predio</th><td>${escapeHtml(predioCode)}</td></tr>
      <tr><th>Entidad transferente</th><td>${escapeHtml(form.entidadTransferente)}</td></tr>
      <tr><th>Entidad beneficiaria</th><td>${escapeHtml(form.entidadBeneficiaria)}</td></tr>
      <tr><th>Partida registral</th><td>${escapeHtml(form.partidaRegistral || predio?.part || "Por verificar")}</td></tr>
      <tr><th>Área registral</th><td>${escapeHtml(form.areaRegistral || predio?.m2 || "Por verificar")} m²</td></tr>
      <tr><th>CUS SBN</th><td>${escapeHtml(form.cusSbn || "Por asignar")}</td></tr>
      <tr><th>Dependencia SBN</th><td>${escapeHtml(form.dependenciaSbn)}</td></tr>
    </table>
    <p><b>Anexos:</b> ${escapeHtml(form.anexos)}</p>
    <p>Sin otro particular, hago propicia la oportunidad para expresarle los sentimientos de mi especial consideración.</p>
    <p>Atentamente,</p>
    <div class="signature"><b>${escapeHtml(form.responsable)}</b><br>Ministerio de Transportes y Comunicaciones</div>
    <p class="footer">Borrador ${escapeHtml(version)} generado por el Sistema de Gestión Predial · pendiente de firma</p>
  </body></html>`;
  return new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
}

function isAllowedFile(file: File, extensions: string[]) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return Boolean(extension && extensions.includes(extension));
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

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
