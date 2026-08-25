import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileCheck2,
  FilePenLine,
  FileText,
  History,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute(
  "/proyectos/$projectId/predios/$codigo/entrega-recepcion-ddp-opat",
)({
  head: () => ({
    meta: [
      { title: "Entrega / Recepción DDP – OPAT" },
      {
        name: "description",
        content:
          "Generación, suscripción y trazabilidad del acta de entrega y recepción entre DDP y OPAT.",
      },
    ],
  }),
  component: EntregaRecepcionDdpOpatPage,
});

const RED = "#dc2626";
const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] focus:border-gray-500 focus:outline-none";
const selectCls = `${inputCls} appearance-none`;
const FILE_DB_NAME = "predio-documentos-db";
const FILE_STORE_NAME = "archivos";
const MAX_FILE_SIZE = 15 * 1024 * 1024;

type FormState = {
  numeroActa: string;
  fechaActa: string;
  fechaFin: string;
  lugarEntrega: string;
  representanteDdp: string;
  cargoRepresentanteDdp: string;
  representanteOpat: string;
  cargoRepresentanteOpat: string;
  estadoLiberacion: string;
  condicionEntrega: string;
  areaEntregada: string;
  documentosEntregados: string;
  acuerdos: string;
  observaciones: string;
  conActaSuscrita: boolean;
};

type DocumentRow = {
  id: string;
  version: string;
  tipo: "BORRADOR" | "FIRMADO";
  descripcion: string;
  archivo: string;
  mimeType: string;
  size: number;
  fecha: string;
  responsable: string;
  tipoFirma: string;
  estado: string;
  versionOrigen?: string;
};

type ActivityRow = {
  id: string;
  fecha: string;
  actividad: string;
  usuario: string;
  estado: string;
  detalle: string;
};

type PersistedState = {
  form?: FormState;
  documents?: DocumentRow[];
  activity?: ActivityRow[];
};

function today() {
  return new Date().toISOString().slice(0, 10);
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

function EntregaRecepcionDdpOpatPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const predioCode = predio?.cod || decodedCodigo;
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;
  const safeCode = predioCode.replace(/[^A-Z0-9-]/gi, "").toUpperCase();
  const storageKey = `entrega-recepcion-ddp-opat:${projectId}:${decodedCodigo}`;

  const initialForm = useMemo<FormState>(
    () => ({
      numeroActa: `ACTA-DDP-OPAT-${new Date().getFullYear()}-${safeCode.slice(-7)}`,
      fechaActa: today(),
      fechaFin: today(),
      lugarEntrega: projectLabel,
      representanteDdp: proyecto?.coordinadorPredial || predio?.rlegal || "",
      cargoRepresentanteDdp: "Representante de la DDP",
      representanteOpat: "",
      cargoRepresentanteOpat: "Representante de la OPAT",
      estadoLiberacion: "PENDIENTE",
      condicionEntrega: "POR VERIFICAR",
      areaEntregada: predio?.m2 || "",
      documentosEntregados:
        "Expediente predial, planos, memoria descriptiva y documentos de sustento disponibles.",
      acuerdos:
        "La OPAT recibe la documentación y el predio en las condiciones descritas en la presente acta.",
      observaciones: "",
      conActaSuscrita: false,
    }),
    [predio?.m2, predio?.rlegal, projectLabel, proyecto?.coordinadorPredial, safeCode],
  );

  const [form, setForm] = useState<FormState>(initialForm);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tipoFirma, setTipoFirma] = useState("FIRMAS MANUSCRITAS ESCANEADAS");
  const [descripcionFirmado, setDescripcionFirmado] = useState(
    "Acta de entrega y recepción suscrita por DDP y OPAT",
  );
  const [message, setMessage] = useState<{
    type: "success" | "warning" | "error";
    text: string;
  } | null>(null);

  const drafts = documents.filter((document) => document.tipo === "BORRADOR");
  const signedDocuments = documents.filter((document) => document.tipo === "FIRMADO");
  const latestDraft = drafts[0];
  const currentStatus = signedDocuments.length
    ? "ACTA FIRMADA"
    : drafts.length
      ? "BORRADOR GENERADO"
      : "POR ELABORAR";

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as PersistedState;
        setForm({ ...initialForm, ...parsed.form });
        setDocuments(parsed.documents || []);
        setActivity(parsed.activity || []);
      }
    } catch {
      setMessage({
        type: "warning",
        text: "No se pudo recuperar el registro anterior. Puede continuar con un registro nuevo.",
      });
    } finally {
      setLoaded(true);
    }
  }, [initialForm, storageKey]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify({ form, documents, activity }));
  }, [activity, documents, form, loaded, storageKey]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addActivity(current: ActivityRow[], actividad: string, estado: string, detalle: string) {
    return [
      {
        id: makeId("actividad"),
        fecha: timestamp(),
        actividad,
        usuario: form.representanteDdp || "Usuario del sistema",
        estado,
        detalle,
      },
      ...current,
    ];
  }

  function validateActaData(requireRepresentatives = true) {
    if (!form.numeroActa.trim() || !form.fechaActa) {
      setMessage({ type: "warning", text: "Complete el número y la fecha del acta." });
      return false;
    }
    if (
      requireRepresentatives &&
      (!form.representanteDdp.trim() || !form.representanteOpat.trim())
    ) {
      setMessage({
        type: "warning",
        text: "Registre los representantes de DDP y OPAT antes de guardar el registro.",
      });
      return false;
    }
    return true;
  }

  async function handleGenerateDraft() {
    if (!validateActaData(false)) return;
    const version = `B${drafts.length + 1}`;
    const fileName = `Acta_Entrega_Recepcion_DDP_OPAT_${safeCode}_${version}.doc`;
    const blob = createActaWordBlob({ form, predio, predioCode, projectLabel, version });
    const id = makeId("acta-borrador");

    downloadBlobFile(fileName, blob);

    try {
      await storeDocumentFile(id, blob);
      const row: DocumentRow = {
        id,
        version,
        tipo: "BORRADOR",
        descripcion: "Borrador editable del acta de entrega y recepción",
        archivo: fileName,
        mimeType: blob.type,
        size: blob.size,
        fecha: timestamp(),
        responsable: form.representanteDdp,
        tipoFirma: "PENDIENTE DE FIRMA",
        estado: "GENERADO",
      };
      const nextDocuments = [row, ...documents];
      const nextActivity = addActivity(
        activity,
        "Borrador Word generado",
        "GENERADO",
        `Se generó la versión ${version} del acta ${form.numeroActa}.`,
      );
      setDocuments(nextDocuments);
      setActivity(nextActivity);
      setMessage({
        type: "success",
        text: `Se generó y descargó el borrador ${version}. Revíselo, fírmelo y registre luego el escaneado en el paso 2.`,
      });
    } catch {
      setMessage({
        type: "warning",
        text: `El borrador ${version} se descargó, pero el navegador no permitió guardarlo en el historial local.`,
      });
    }
  }

  async function handleSignedUpload(file: File | null) {
    if (!file) return;
    if (!latestDraft) {
      setMessage({
        type: "warning",
        text: "Primero genere el borrador Word. El acta firmada debe quedar vinculada a ese borrador.",
      });
      return;
    }
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["pdf", "jpg", "jpeg", "png"].includes(extension)) {
      setMessage({
        type: "warning",
        text: "El acta firmada debe cargarse en PDF, JPG, JPEG o PNG.",
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: "warning", text: "El archivo supera el límite permitido de 15 MB." });
      return;
    }

    const version = `F${signedDocuments.length + 1}`;
    const id = makeId("acta-firmada");
    try {
      await storeDocumentFile(id, file);
      const row: DocumentRow = {
        id,
        version,
        tipo: "FIRMADO",
        descripcion: descripcionFirmado.trim() || "Acta firmada",
        archivo: file.name,
        mimeType: file.type,
        size: file.size,
        fecha: timestamp(),
        responsable: form.representanteDdp || "Usuario del sistema",
        tipoFirma,
        estado: "OFICIAL",
        versionOrigen: latestDraft.version,
      };
      const nextDocuments = [row, ...documents];
      const nextForm = { ...form, conActaSuscrita: true };
      const nextActivity = addActivity(
        activity,
        "Acta firmada registrada",
        "OFICIAL",
        `Se registró la versión ${version}, vinculada al borrador ${latestDraft.version}.`,
      );
      setDocuments(nextDocuments);
      setForm(nextForm);
      setActivity(nextActivity);
      setMessage({
        type: "success",
        text: `Acta firmada ${version} registrada y vinculada al borrador ${latestDraft.version}.`,
      });
    } catch {
      setMessage({ type: "error", text: "No se pudo almacenar el acta firmada." });
    }
  }

  async function handleDownload(document: DocumentRow) {
    try {
      const blob = await readDocumentFile(document.id);
      if (!blob) {
        setMessage({
          type: "warning",
          text: "El archivo ya no está disponible en este navegador.",
        });
        return;
      }
      downloadBlobFile(document.archivo, blob);
    } catch {
      setMessage({ type: "error", text: "No se pudo descargar el archivo." });
    }
  }

  async function handleDelete(document: DocumentRow) {
    if (
      document.tipo === "BORRADOR" &&
      documents.some((item) => item.versionOrigen === document.version)
    ) {
      setMessage({
        type: "warning",
        text: `No se puede eliminar ${document.version}: tiene un acta firmada vinculada.`,
      });
      return;
    }
    try {
      await deleteDocumentFile(document.id);
      const nextDocuments = documents.filter((item) => item.id !== document.id);
      const hasSigned = nextDocuments.some((item) => item.tipo === "FIRMADO");
      const nextForm = { ...form, conActaSuscrita: hasSigned };
      const nextActivity = addActivity(
        activity,
        "Versión eliminada",
        "ELIMINADO",
        `Se eliminó la versión ${document.version}: ${document.archivo}.`,
      );
      setDocuments(nextDocuments);
      setForm(nextForm);
      setActivity(nextActivity);
      setMessage({ type: "success", text: `Se eliminó la versión ${document.version}.` });
    } catch {
      setMessage({ type: "error", text: "No se pudo eliminar el archivo." });
    }
  }

  function handleSave() {
    if (!validateActaData()) return;
    const nextActivity = addActivity(
      activity,
      "Registro guardado",
      currentStatus,
      `Se actualizaron los datos del acta ${form.numeroActa}.`,
    );
    setActivity(nextActivity);
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ form, documents, activity: nextActivity }),
    );
    setMessage({ type: "success", text: "La información de entrega y recepción quedó guardada." });
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Entrega / Recepción DDP – OPAT"
        badgeLabel="Predio"
        badgeValue={predioCode}
        badgeSuffix={`Repositorio y cierre · 6.2 · ${currentStatus}`}
      />

      <main className="mx-auto max-w-[1400px] p-4">
        <div className="rounded border bg-white px-5 py-5">
          <div className="mb-4 flex border-b">
            <div
              className="inline-flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-[12px] font-medium"
              style={{ borderColor: RED, color: RED }}
            >
              <FileText size={14} /> 6.2 Entrega / Recepción DDP – OPAT
            </div>
          </div>

          <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-3">
            <SummaryCard
              icon={<FilePenLine size={14} />}
              label="Borradores Word"
              value={`${drafts.length} ${drafts.length === 1 ? "versión" : "versiones"}`}
            />
            <SummaryCard
              icon={<FileCheck2 size={14} />}
              label="Actas firmadas"
              value={`${signedDocuments.length} ${signedDocuments.length === 1 ? "archivo" : "archivos"}`}
            />
            <SummaryCard
              icon={<CheckCircle2 size={14} />}
              label="Estado del registro"
              value={currentStatus}
            />
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

          <SectionTitle>Información del predio</SectionTitle>
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2">
            <Field label="Código de predio">
              <input className={`${inputCls} bg-gray-50`} value={predioCode} readOnly />
            </Field>
            <Field label="Proyecto">
              <input className={`${inputCls} bg-gray-50`} value={projectLabel} readOnly />
            </Field>
            <Field label="Expediente">
              <input
                className={`${inputCls} bg-gray-50`}
                value={predio?.exp || "Sin expediente registrado"}
                readOnly
              />
            </Field>
            <Field label="Sujeto pasivo">
              <input
                className={`${inputCls} bg-gray-50`}
                value={predio?.suj || "Sin información"}
                readOnly
              />
            </Field>
            <Field label="Área afectada">
              <div className="relative">
                <input
                  className={`${inputCls} bg-gray-50 pr-10`}
                  value={predio?.m2 || "Por verificar"}
                  readOnly
                />
                {predio?.m2 && (
                  <span className="absolute right-2 top-2 text-[10px] text-gray-400">m²</span>
                )}
              </div>
            </Field>
            <Field label="Partida registral">
              <input
                className={`${inputCls} bg-gray-50`}
                value={predio?.part || "Sin información"}
                readOnly
              />
            </Field>
          </div>

          <SectionTitle>Datos del acta de entrega y recepción</SectionTitle>
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2">
            <Field label="Número de acta" required>
              <input
                className={inputCls}
                value={form.numeroActa}
                onChange={(event) => setField("numeroActa", event.target.value)}
              />
            </Field>
            <Field label="Fecha del acta" required>
              <input
                type="date"
                className={inputCls}
                value={form.fechaActa}
                onChange={(event) => setField("fechaActa", event.target.value)}
              />
            </Field>
            <Field label="Lugar de entrega">
              <input
                className={inputCls}
                value={form.lugarEntrega}
                onChange={(event) => setField("lugarEntrega", event.target.value)}
              />
            </Field>
            <Field label="Fecha de finalización">
              <input
                type="date"
                className={inputCls}
                value={form.fechaFin}
                onChange={(event) => setField("fechaFin", event.target.value)}
              />
            </Field>
            <Field label="Estado de liberación">
              <select
                className={selectCls}
                value={form.estadoLiberacion}
                onChange={(event) => setField("estadoLiberacion", event.target.value)}
              >
                <option>PENDIENTE</option>
                <option>ENTREGA PARCIAL</option>
                <option>ENTREGA TOTAL</option>
              </select>
            </Field>
            <Field label="Condición de entrega">
              <select
                className={selectCls}
                value={form.condicionEntrega}
                onChange={(event) => setField("condicionEntrega", event.target.value)}
              >
                <option>POR VERIFICAR</option>
                <option>LIBRE Y DESOCUPADO</option>
                <option>CON OCUPANTES</option>
                <option>CON OBSERVACIONES</option>
              </select>
            </Field>
            <Field label="Área entregada">
              <div className="relative">
                <input
                  className={`${inputCls} pr-10`}
                  value={form.areaEntregada}
                  onChange={(event) => setField("areaEntregada", event.target.value)}
                  placeholder="0.0000"
                />
                <span className="absolute right-2 top-2 text-[10px] text-gray-400">m²</span>
              </div>
            </Field>
            <Field label="Con acta suscrita">
              <label className="inline-flex h-8 items-center gap-2 text-[12px] text-gray-600">
                <input type="checkbox" checked={form.conActaSuscrita} readOnly />
                {form.conActaSuscrita
                  ? "Sí, existe un acta firmada registrada"
                  : "Pendiente de registrar el acta firmada"}
              </label>
            </Field>
          </div>

          <SectionTitle>Representantes que intervienen</SectionTitle>
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2">
            <Field label="Representante DDP" required>
              <input
                className={inputCls}
                value={form.representanteDdp}
                onChange={(event) => setField("representanteDdp", event.target.value)}
                placeholder="Apellidos y nombres"
              />
            </Field>
            <Field label="Cargo en DDP">
              <input
                className={inputCls}
                value={form.cargoRepresentanteDdp}
                onChange={(event) => setField("cargoRepresentanteDdp", event.target.value)}
              />
            </Field>
            <Field label="Representante OPAT" required>
              <input
                className={inputCls}
                value={form.representanteOpat}
                onChange={(event) => setField("representanteOpat", event.target.value)}
                placeholder="Apellidos y nombres"
              />
            </Field>
            <Field label="Cargo en OPAT">
              <input
                className={inputCls}
                value={form.cargoRepresentanteOpat}
                onChange={(event) => setField("cargoRepresentanteOpat", event.target.value)}
              />
            </Field>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2">
            <Field label="Documentación entregada">
              <textarea
                className="min-h-[58px] w-full rounded border border-gray-300 px-2 py-2 text-[12px] focus:border-gray-500 focus:outline-none"
                value={form.documentosEntregados}
                onChange={(event) => setField("documentosEntregados", event.target.value)}
              />
            </Field>
            <Field label="Acuerdos">
              <textarea
                className="min-h-[58px] w-full rounded border border-gray-300 px-2 py-2 text-[12px] focus:border-gray-500 focus:outline-none"
                value={form.acuerdos}
                onChange={(event) => setField("acuerdos", event.target.value)}
              />
            </Field>
            <Field label="Observaciones">
              <textarea
                className="min-h-[58px] w-full rounded border border-gray-300 px-2 py-2 text-[12px] focus:border-gray-500 focus:outline-none"
                value={form.observaciones}
                onChange={(event) => setField("observaciones", event.target.value)}
                placeholder="Registre incidencias, pendientes o condiciones particulares de la entrega."
              />
            </Field>
          </div>

          <SectionTitle>Flujo documental del acta</SectionTitle>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <FilePenLine size={16} />
                </span>
                <div>
                  <p className="text-[12px] font-semibold text-gray-800">
                    1. Generar borrador del acta en Word
                  </p>
                  <p className="mt-0.5 text-[10px] leading-4 text-gray-500">
                    El sistema completa el documento con los datos registrados. Descárguelo para
                    revisar, imprimir y gestionar las firmas.
                  </p>
                </div>
              </div>
              <div className="rounded border border-gray-200 bg-white px-3 py-2 text-[10px] text-gray-500">
                Salida: Word editable (.doc) · cada generación crea una nueva versión B1, B2, B3…
              </div>
              <button
                type="button"
                onClick={handleGenerateDraft}
                className="mt-3 inline-flex h-8 items-center gap-1.5 rounded bg-red-600 px-3 text-[11px] font-medium text-white hover:bg-red-700"
              >
                <Download size={14} /> Generar acta Word
              </button>
            </div>

            <div className="rounded border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <FileCheck2 size={16} />
                </span>
                <div>
                  <p className="text-[12px] font-semibold text-gray-800">
                    2. Registrar el acta escaneada y firmada
                  </p>
                  <p className="mt-0.5 text-[10px] leading-4 text-gray-500">
                    Cargue el mismo acta después de su suscripción. Quedará vinculada al último
                    borrador generado {latestDraft ? `(${latestDraft.version})` : ""}.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <select
                  className={selectCls}
                  value={tipoFirma}
                  onChange={(event) => setTipoFirma(event.target.value)}
                >
                  <option>FIRMAS MANUSCRITAS ESCANEADAS</option>
                  <option>FIRMAS DIGITALES</option>
                  <option>FIRMAS MIXTAS</option>
                </select>
                <input
                  className={inputCls}
                  value={descripcionFirmado}
                  onChange={(event) => setDescripcionFirmado(event.target.value)}
                  placeholder="Descripción del archivo oficial"
                />
              </div>
              <label
                className={`mt-3 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded px-3 text-[11px] font-medium text-white ${
                  latestDraft ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
                }`}
              >
                <Upload size={14} /> Subir acta firmada
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) => {
                    void handleSignedUpload(event.target.files?.[0] || null);
                    event.target.value = "";
                  }}
                />
              </label>
              <span className="ml-2 text-[9px] text-gray-400">PDF o imagen · máximo 15 MB</span>
            </div>
          </div>

          <SectionTitle>Historial de versiones del acta</SectionTitle>
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="w-full min-w-[980px] text-[10px]">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-2 py-2 text-left font-semibold">Versión</th>
                  <th className="px-2 py-2 text-left font-semibold">Tipo</th>
                  <th className="px-2 py-2 text-left font-semibold">Descripción / archivo</th>
                  <th className="px-2 py-2 text-left font-semibold">Origen</th>
                  <th className="px-2 py-2 text-left font-semibold">Fecha</th>
                  <th className="px-2 py-2 text-left font-semibold">Responsable</th>
                  <th className="px-2 py-2 text-left font-semibold">Firma</th>
                  <th className="px-2 py-2 text-left font-semibold">Estado</th>
                  <th className="px-2 py-2 text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-gray-400">
                      Aún no se han generado ni registrado versiones del acta.
                    </td>
                  </tr>
                ) : (
                  documents.map((document) => (
                    <tr key={document.id} className="border-t border-gray-100 align-top">
                      <td className="px-2 py-2 font-semibold text-gray-700">{document.version}</td>
                      <td className="px-2 py-2">
                        <span
                          className={`rounded px-1.5 py-0.5 font-medium ${
                            document.tipo === "FIRMADO"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {document.tipo === "FIRMADO" ? "ACTA FIRMADA" : "BORRADOR WORD"}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <p className="font-medium text-gray-700">{document.descripcion}</p>
                        <p className="mt-0.5 text-gray-400">
                          {document.archivo} · {formatFileSize(document.size)}
                        </p>
                      </td>
                      <td className="px-2 py-2">{document.versionOrigen || "—"}</td>
                      <td className="whitespace-nowrap px-2 py-2">{document.fecha}</td>
                      <td className="px-2 py-2">{document.responsable}</td>
                      <td className="px-2 py-2">{document.tipoFirma}</td>
                      <td className="px-2 py-2">{document.estado}</td>
                      <td className="px-2 py-2">
                        <div className="flex justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => void handleDownload(document)}
                            title="Descargar"
                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                          >
                            <Download size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(document)}
                            title="Eliminar"
                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50"
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

          <details className="mt-4 rounded border border-gray-200 bg-gray-50">
            <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-[11px] font-medium text-gray-700">
              <History size={13} /> Ver trazabilidad del trámite ({activity.length})
            </summary>
            <div className="overflow-x-auto border-t bg-white">
              <table className="w-full min-w-[760px] text-[10px]">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="px-2 py-2 text-left font-semibold">Fecha</th>
                    <th className="px-2 py-2 text-left font-semibold">Actividad</th>
                    <th className="px-2 py-2 text-left font-semibold">Usuario</th>
                    <th className="px-2 py-2 text-left font-semibold">Estado</th>
                    <th className="px-2 py-2 text-left font-semibold">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-5 text-center text-gray-400">
                        No existen actividades registradas.
                      </td>
                    </tr>
                  ) : (
                    activity.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100 align-top">
                        <td className="whitespace-nowrap px-2 py-2">{item.fecha}</td>
                        <td className="px-2 py-2 font-medium">{item.actividad}</td>
                        <td className="px-2 py-2">{item.usuario}</td>
                        <td className="px-2 py-2">{item.estado}</td>
                        <td className="px-2 py-2">{item.detalle}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </details>

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
              className="inline-flex h-8 items-center gap-1.5 rounded bg-green-600 px-4 text-[11px] font-medium text-white hover:bg-green-700"
            >
              <Save size={14} /> Guardar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function createActaWordBlob({
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
  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        @page { size: A4; margin: 2.2cm; }
        body { font-family: Arial, sans-serif; color: #111827; font-size: 10.5pt; line-height: 1.45; }
        h1 { margin: 0; text-align: center; font-size: 14pt; }
        .number { margin: 5px 0 24px; text-align: center; font-weight: bold; }
        h2 { margin: 20px 0 8px; border-bottom: 1px solid #9ca3af; padding-bottom: 3px; font-size: 10.5pt; }
        p { margin: 7px 0; text-align: justify; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { border: 1px solid #9ca3af; padding: 6px; font-size: 9.5pt; text-align: left; vertical-align: top; }
        th { width: 25%; background: #f3f4f6; }
        .signatures { margin-top: 62px; border: 0; }
        .signatures td { width: 50%; border: 0; padding: 0 22px; text-align: center; }
        .line { border-top: 1px solid #111827; padding-top: 6px; }
        .footer { margin-top: 42px; color: #6b7280; font-size: 8pt; text-align: right; }
      </style>
    </head>
    <body>
      <h1>ACTA DE ENTREGA Y RECEPCIÓN DE PREDIO DDP – OPAT</h1>
      <p class="number">${escapeHtml(form.numeroActa)} · Borrador ${escapeHtml(version)}</p>

      <p>En ${escapeHtml(form.lugarEntrega || "el lugar indicado")}, con fecha ${escapeHtml(form.fechaActa)}, se reúnen los representantes de la Dirección de Disponibilidad de Predios (DDP) y de la Oficina de Patrimonio / OPAT, con la finalidad de formalizar la entrega y recepción del predio detallado en la presente acta.</p>

      <h2>I. IDENTIFICACIÓN DEL PREDIO</h2>
      <table>
        <tr><th>Proyecto</th><td>${escapeHtml(projectLabel)}</td></tr>
        <tr><th>Código de predio</th><td>${escapeHtml(predioCode)}</td></tr>
        <tr><th>Expediente</th><td>${escapeHtml(predio?.exp || "Sin expediente registrado")}</td></tr>
        <tr><th>Sujeto pasivo</th><td>${escapeHtml(predio?.suj || "Sin información")}</td></tr>
        <tr><th>Partida registral</th><td>${escapeHtml(predio?.part || "Sin información")}</td></tr>
        <tr><th>Área entregada</th><td>${escapeHtml(form.areaEntregada || predio?.m2 || "Por verificar")} m²</td></tr>
      </table>

      <h2>II. REPRESENTANTES</h2>
      <table>
        <tr><th>Representante DDP</th><td>${escapeHtml(form.representanteDdp || "Pendiente de designación")} · ${escapeHtml(form.cargoRepresentanteDdp)}</td></tr>
        <tr><th>Representante OPAT</th><td>${escapeHtml(form.representanteOpat || "Pendiente de designación")} · ${escapeHtml(form.cargoRepresentanteOpat)}</td></tr>
      </table>

      <h2>III. OBJETO DEL ACTA</h2>
      <p>Dejar constancia de la entrega por parte de la DDP y la recepción por parte de la OPAT del predio y su documentación asociada, para la continuidad de las acciones de administración, saneamiento, inscripción, custodia o cierre que correspondan.</p>

      <h2>IV. ESTADO Y CONDICIONES DE ENTREGA</h2>
      <table>
        <tr><th>Estado de liberación</th><td>${escapeHtml(form.estadoLiberacion)}</td></tr>
        <tr><th>Condición de entrega</th><td>${escapeHtml(form.condicionEntrega)}</td></tr>
        <tr><th>Fecha de finalización</th><td>${escapeHtml(form.fechaFin || "No consignada")}</td></tr>
      </table>

      <h2>V. DOCUMENTACIÓN ENTREGADA</h2>
      <p>${escapeHtml(form.documentosEntregados || "Sin detalle adicional.")}</p>

      <h2>VI. ACUERDOS Y OBSERVACIONES</h2>
      <p><b>Acuerdos:</b> ${escapeHtml(form.acuerdos || "Sin acuerdos adicionales.")}</p>
      <p><b>Observaciones:</b> ${escapeHtml(form.observaciones || "Sin observaciones.")}</p>

      <h2>VII. CONFORMIDAD</h2>
      <p>Leída la presente acta, los representantes intervinientes expresan su conformidad con su contenido y proceden a suscribirla para constancia.</p>
      <table class="signatures">
        <tr>
          <td><div class="line"><b>${escapeHtml(form.representanteDdp || "Pendiente de designación")}</b><br>${escapeHtml(form.cargoRepresentanteDdp)}<br>DDP</div></td>
          <td><div class="line"><b>${escapeHtml(form.representanteOpat || "Pendiente de designación")}</b><br>${escapeHtml(form.cargoRepresentanteOpat)}<br>OPAT</div></td>
        </tr>
      </table>
      <p class="footer">Borrador generado por el Sistema de Gestión Predial · pendiente de suscripción</p>
    </body>
  </html>`;
  return new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
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
