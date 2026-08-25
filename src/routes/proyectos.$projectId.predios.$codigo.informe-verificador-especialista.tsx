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
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute(
  "/proyectos/$projectId/predios/$codigo/informe-verificador-especialista",
)({
  head: () => ({
    meta: [
      { title: "Informe del Verificador Especialista" },
      {
        name: "description",
        content:
          "Generación del borrador, registro del informe firmado y trazabilidad del verificador especialista.",
      },
    ],
  }),
  component: InformeVerificadorEspecialistaPage,
});

const RED = "#dc2626";
const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] focus:border-gray-500 focus:outline-none";
const selectCls = `${inputCls} appearance-none`;
const FILE_DB_NAME = "predio-documentos-db";
const FILE_STORE_NAME = "archivos";
const MAX_FILE_SIZE = 15 * 1024 * 1024;

type Message = { type: "success" | "warning" | "error"; text: string };

type FormState = {
  conInforme: boolean;
  numeroInforme: string;
  fechaInicio: string;
  fechaFin: string;
  especialista: string;
  especialidad: string;
  colegiatura: string;
  resultado: string;
  objeto: string;
  conclusion: string;
  observaciones: string;
  tipoFirma: "FIRMA DIGITAL" | "FIRMA MANUSCRITA ESCANEADA";
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
  estado: string;
};

type ActivityRow = {
  id: string;
  fecha: string;
  actividad: string;
  usuario: string;
  estado: string;
  detalle: string;
};

type StoredPayload = {
  form?: Partial<FormState>;
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

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-4 border-b pb-1 first:mt-0">
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
    <div className="flex min-w-0 items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[9px] font-medium uppercase tracking-wide text-gray-500">
          {label}
        </span>
        <span className="block truncate text-[11px] font-semibold text-gray-800">{value}</span>
      </span>
    </div>
  );
}

function InformeVerificadorEspecialistaPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;
  const predioCode = predio?.cod || decodedCodigo;
  const safeCode = predioCode
    .replace(/[^A-Z0-9]/gi, "")
    .slice(-8)
    .toUpperCase();
  const storageKey = `informe-verificador:${projectId}:${decodedCodigo}`;
  const defaultForm = useMemo<FormState>(
    () => ({
      conInforme: true,
      numeroInforme: `IVE-${new Date().getFullYear()}-${safeCode}`,
      fechaInicio: today(),
      fechaFin: today(),
      especialista: predio?.rtec || "",
      especialidad: "Verificación técnico-registral",
      colegiatura: "",
      resultado: "",
      objeto:
        "Verificar la información física, catastral y registral del predio afectado por el proyecto.",
      conclusion: "",
      observaciones: "",
      tipoFirma: "FIRMA DIGITAL",
    }),
    [predio?.rtec, safeCode],
  );
  const [activeTab, setActiveTab] = useState<"registro" | "historico">("registro");
  const [form, setForm] = useState<FormState>(defaultForm);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [message, setMessage] = useState<Message | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [busyAction, setBusyAction] = useState<"draft" | "upload" | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredPayload;
        setForm({ ...defaultForm, ...parsed.form });
        setDocuments(parsed.documents ?? []);
        setActivity(parsed.activity ?? []);
      } else {
        setActivity([
          {
            id: createId("actividad"),
            fecha: timestamp(),
            actividad: "Registro iniciado",
            usuario: "Sistema",
            estado: "EN ELABORACIÓN",
            detalle: `Se inició el Informe del Verificador Especialista para el predio ${predioCode}.`,
          },
        ]);
      }
    } catch {
      setMessage({
        type: "warning",
        text: "No se pudo recuperar el registro anterior; se abrió un formulario nuevo.",
      });
    } finally {
      setHydrated(true);
    }
  }, [defaultForm, predioCode, storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    const payload: StoredPayload = { form, documents, activity };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [activity, documents, form, hydrated, storageKey]);

  const draftCount = documents.filter((document) => document.tipo === "BORRADOR").length;
  const signedCount = documents.filter((document) => document.tipo === "FIRMADO").length;
  const currentStatus = !form.conInforme
    ? "NO APLICA"
    : signedCount > 0
      ? "FIRMADO REGISTRADO"
      : draftCount > 0
        ? "BORRADOR GENERADO"
        : "EN ELABORACIÓN";

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addActivity(
    actividad: string,
    estado: string,
    detalle: string,
    usuario = "Usuario actual",
  ) {
    setActivity((current) => [
      {
        id: createId("actividad"),
        fecha: timestamp(),
        actividad,
        usuario,
        estado,
        detalle,
      },
      ...current,
    ]);
  }

  function validateForDocument() {
    if (!form.conInforme) return "Active la opción 'Cuenta con informe' para generar documentos.";
    if (!form.numeroInforme.trim()) return "Registre el número del informe.";
    if (!form.fechaInicio || !form.fechaFin) return "Registre las fechas de inicio y término.";
    if (form.fechaFin < form.fechaInicio) {
      return "La fecha de término no puede ser anterior a la fecha de inicio.";
    }
    if (!form.especialista.trim()) return "Registre al verificador especialista.";
    if (!form.resultado) return "Seleccione el resultado de la verificación.";
    if (!form.conclusion.trim()) return "Registre la conclusión antes de generar el borrador.";
    return null;
  }

  async function handleGenerateDraft() {
    const validation = validateForDocument();
    if (validation) {
      setMessage({ type: "warning", text: validation });
      return;
    }

    setBusyAction("draft");
    const version = `B-${String(draftCount + 1).padStart(2, "0")}`;
    const fileName = `Informe_Verificador_${safeCode}_${version}.doc`;
    const blob = createInformeWordBlob({ form, predio, predioCode, projectLabel, version });
    const id = createId("documento");

    try {
      await storeFile(id, blob);
      downloadBlobFile(fileName, blob);
      const row: DocumentRow = {
        id,
        version,
        tipo: "BORRADOR",
        descripcion: "Borrador editable del Informe del Verificador Especialista",
        archivo: fileName,
        mimeType: blob.type,
        size: blob.size,
        fecha: timestamp(),
        responsable: form.especialista,
        estado: "BORRADOR GENERADO",
      };
      setDocuments((current) => [row, ...current]);
      addActivity(
        "Borrador generado",
        "BORRADOR",
        `Se generó y descargó la versión ${version} (${fileName}).`,
      );
      setMessage({
        type: "success",
        text: `Borrador ${version} generado y descargado en Word. Ya puede revisarlo y firmarlo.`,
      });
    } catch {
      setMessage({
        type: "error",
        text: "No se pudo generar el borrador. Verifique el almacenamiento del navegador.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleUploadSigned(file: File | null) {
    if (!file) return;
    const validation = validateForDocument();
    if (validation) {
      setMessage({ type: "warning", text: validation });
      return;
    }
    if (draftCount === 0) {
      setMessage({
        type: "warning",
        text: "Primero genere al menos una versión del borrador antes de registrar el firmado.",
      });
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["pdf", "png", "jpg", "jpeg"].includes(extension)) {
      setMessage({
        type: "error",
        text: "Formato no permitido. Cargue un PDF firmado o una imagen JPG/PNG del documento escaneado.",
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: "error", text: "El archivo supera el límite permitido de 15 MB." });
      return;
    }

    setBusyAction("upload");
    const version = `F-${String(signedCount + 1).padStart(2, "0")}`;
    const id = createId("documento");
    try {
      await storeFile(id, file);
      const row: DocumentRow = {
        id,
        version,
        tipo: "FIRMADO",
        descripcion:
          form.tipoFirma === "FIRMA DIGITAL"
            ? "Informe final firmado digitalmente"
            : "Informe final con firma manuscrita escaneada",
        archivo: file.name,
        mimeType: file.type || `application/${extension}`,
        size: file.size,
        fecha: timestamp(),
        responsable: form.especialista,
        estado: form.tipoFirma,
      };
      setDocuments((current) => [row, ...current]);
      addActivity(
        "Informe firmado registrado",
        "FIRMADO",
        `Se registró ${file.name} como versión ${version} (${form.tipoFirma.toLowerCase()}).`,
      );
      setMessage({
        type: "success",
        text: `Documento firmado registrado correctamente como versión ${version}.`,
      });
    } catch {
      setMessage({
        type: "error",
        text: "No se pudo almacenar el archivo firmado en el navegador.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDownload(document: DocumentRow) {
    try {
      const blob = await readFile(document.id);
      if (!blob) throw new Error("Archivo no encontrado");
      downloadBlobFile(document.archivo, blob);
      setMessage({ type: "success", text: `Descarga iniciada: ${document.archivo}.` });
    } catch {
      setMessage({
        type: "error",
        text: "El archivo no está disponible. Puede volver a generarlo o cargarlo nuevamente.",
      });
    }
  }

  async function handleDelete(document: DocumentRow) {
    try {
      await deleteFile(document.id);
    } finally {
      setDocuments((current) => current.filter((item) => item.id !== document.id));
      addActivity(
        "Documento retirado",
        "ACTUALIZADO",
        `Se retiró la versión ${document.version}: ${document.archivo}.`,
      );
      setMessage({ type: "success", text: `Se retiró la versión ${document.version}.` });
    }
  }

  function handleSave() {
    if (form.conInforme && !form.numeroInforme.trim()) {
      setMessage({ type: "warning", text: "Registre el número del informe antes de guardar." });
      return;
    }
    addActivity(
      "Registro guardado",
      currentStatus,
      `Se guardaron los datos del informe ${form.numeroInforme || "sin número"}.`,
    );
    setMessage({ type: "success", text: "La información del informe quedó guardada." });
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Informe del Verificador Especialista"
        badgeLabel="Predio"
        badgeValue={predioCode}
        badgeSuffix={`Etapa I · ${currentStatus}`}
      />

      <main className="mx-auto max-w-[1400px] p-4">
        <div className="rounded border bg-white px-5 py-5">
          <div className="mb-4 flex border-b">
            <button
              type="button"
              onClick={() => setActiveTab("registro")}
              className="inline-flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-[12px] font-medium"
              style={{
                borderColor: activeTab === "registro" ? RED : "transparent",
                color: activeTab === "registro" ? RED : "#4b5563",
              }}
            >
              <FileText size={14} /> 2.1 Informe del Verificador Especialista
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("historico")}
              className="inline-flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-[12px] font-medium"
              style={{
                borderColor: activeTab === "historico" ? RED : "transparent",
                color: activeTab === "historico" ? RED : "#4b5563",
              }}
            >
              <History size={14} /> Histórico
            </button>
          </div>

          <div className="mb-3 grid grid-cols-3 gap-2">
            <SummaryCard
              icon={<ShieldCheck size={14} />}
              label="Estado del informe"
              value={currentStatus}
            />
            <SummaryCard
              icon={<FilePenLine size={14} />}
              label="Borradores generados"
              value={`${draftCount} versiones`}
            />
            <SummaryCard
              icon={<FileCheck2 size={14} />}
              label="Firmados registrados"
              value={`${signedCount} archivos`}
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

          {activeTab === "registro" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSave();
              }}
            >
              <SectionTitle>Información del predio</SectionTitle>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <Field label="Código de predio">
                  <input className={`${inputCls} bg-gray-50`} value={predioCode} readOnly />
                </Field>
                <Field label="Proyecto">
                  <input className={`${inputCls} bg-gray-50`} value={projectLabel} readOnly />
                </Field>
                <Field label="Condición jurídica">
                  <input
                    className={`${inputCls} bg-gray-50`}
                    value={predio?.condicionPredio || "Por verificar"}
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
              </div>

              <SectionTitle>Datos del informe y del verificador</SectionTitle>
              <div className="mb-3 rounded border border-gray-200 bg-gray-50 px-3 py-2">
                <label className="flex cursor-pointer items-center gap-2 text-[12px] font-medium text-gray-800">
                  <input
                    type="checkbox"
                    checked={form.conInforme}
                    onChange={(event) => setField("conInforme", event.target.checked)}
                    className="size-3.5 accent-red-600"
                  />
                  Cuenta con Informe del Verificador Especialista
                </label>
                <p className="ml-6 mt-0.5 text-[10px] text-gray-500">
                  Active esta opción para elaborar el borrador y registrar posteriormente el
                  documento firmado.
                </p>
              </div>

              <fieldset disabled={!form.conInforme} className="disabled:opacity-55">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Número de informe" required>
                    <input
                      className={inputCls}
                      value={form.numeroInforme}
                      onChange={(event) => setField("numeroInforme", event.target.value)}
                    />
                  </Field>
                  <Field label="Resultado" required>
                    <select
                      className={selectCls}
                      value={form.resultado}
                      onChange={(event) => setField("resultado", event.target.value)}
                    >
                      <option value="">-- SELECCIONE --</option>
                      <option value="FAVORABLE">Favorable</option>
                      <option value="FAVORABLE CON OBSERVACIONES">
                        Favorable con observaciones
                      </option>
                      <option value="OBSERVADO">Observado</option>
                      <option value="DESFAVORABLE">Desfavorable</option>
                    </select>
                  </Field>
                  <Field label="Fecha de inicio" required>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.fechaInicio}
                      onChange={(event) => setField("fechaInicio", event.target.value)}
                    />
                  </Field>
                  <Field label="Fecha de término" required>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.fechaFin}
                      onChange={(event) => setField("fechaFin", event.target.value)}
                    />
                  </Field>
                  <Field label="Verificador especialista" required>
                    <input
                      list="verificadores-especialistas"
                      className={inputCls}
                      value={form.especialista}
                      placeholder="Buscar o escribir especialista"
                      onChange={(event) => setField("especialista", event.target.value)}
                    />
                    <datalist id="verificadores-especialistas">
                      {predio?.rtec && <option value={predio.rtec} />}
                      <option value="Especialista técnico predial" />
                      <option value="Especialista catastral" />
                      <option value="Especialista registral" />
                    </datalist>
                  </Field>
                  <Field label="Especialidad">
                    <input
                      className={inputCls}
                      value={form.especialidad}
                      onChange={(event) => setField("especialidad", event.target.value)}
                    />
                  </Field>
                  <Field label="N.° de colegiatura">
                    <input
                      className={inputCls}
                      value={form.colegiatura}
                      placeholder="CIP / CAP / colegiatura"
                      onChange={(event) => setField("colegiatura", event.target.value)}
                    />
                  </Field>
                  <Field label="Objeto del informe" className="col-span-2">
                    <textarea
                      rows={2}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-[12px] focus:border-gray-500 focus:outline-none"
                      value={form.objeto}
                      onChange={(event) => setField("objeto", event.target.value)}
                    />
                  </Field>
                  <Field label="Conclusión" required className="col-span-2">
                    <textarea
                      rows={3}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-[12px] focus:border-gray-500 focus:outline-none"
                      value={form.conclusion}
                      placeholder="Conclusión técnica y registral del verificador"
                      onChange={(event) => setField("conclusion", event.target.value)}
                    />
                  </Field>
                  <Field label="Observaciones" className="col-span-2">
                    <textarea
                      rows={2}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-[12px] focus:border-gray-500 focus:outline-none"
                      value={form.observaciones}
                      placeholder="Observaciones, restricciones o documentación pendiente"
                      onChange={(event) => setField("observaciones", event.target.value)}
                    />
                  </Field>
                </div>
              </fieldset>

              <SectionTitle>Generación y firma del informe</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded border border-gray-200 bg-white p-3">
                  <div className="mb-2 flex items-start gap-2 border-b border-red-200 pb-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded bg-red-50 text-red-600">
                      <FilePenLine size={16} />
                    </span>
                    <div>
                      <h4 className="text-[12px] font-semibold text-red-600">
                        1. Generar borrador
                      </h4>
                      <p className="text-[10px] text-gray-500">
                        Crea una versión Word editable con los datos registrados y un espacio para
                        firma.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateDraft}
                    disabled={!form.conInforme || busyAction !== null}
                    className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded border border-red-200 bg-red-50 px-3 text-[12px] font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download size={14} />
                    {busyAction === "draft" ? "Generando..." : "Generar borrador en Word"}
                  </button>
                </div>

                <div className="rounded border border-gray-200 bg-white p-3">
                  <div className="mb-2 flex items-start gap-2 border-b border-red-200 pb-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded bg-red-50 text-red-600">
                      <FileCheck2 size={16} />
                    </span>
                    <div>
                      <h4 className="text-[12px] font-semibold text-red-600">
                        2. Registrar informe firmado
                      </h4>
                      <p className="text-[10px] text-gray-500">
                        Registre el PDF con firma digital o el documento firmado y escaneado.
                      </p>
                    </div>
                  </div>
                  <div className="mb-2 grid grid-cols-[135px_1fr] items-center gap-2">
                    <label className="text-right text-[11px] text-gray-600">Tipo de firma</label>
                    <select
                      className={inputCls}
                      value={form.tipoFirma}
                      onChange={(event) =>
                        setField("tipoFirma", event.target.value as FormState["tipoFirma"])
                      }
                    >
                      <option value="FIRMA DIGITAL">Firma digital</option>
                      <option value="FIRMA MANUSCRITA ESCANEADA">Firma manuscrita escaneada</option>
                    </select>
                  </div>
                  <label
                    className={`inline-flex h-8 w-full items-center justify-center gap-1.5 rounded border border-gray-300 px-3 text-[12px] font-semibold ${
                      form.conInforme && draftCount > 0 && busyAction === null
                        ? "cursor-pointer bg-white text-gray-700 hover:bg-gray-50"
                        : "cursor-not-allowed bg-gray-50 text-gray-400"
                    }`}
                  >
                    <Upload size={14} />
                    {busyAction === "upload" ? "Registrando..." : "Seleccionar firmado"}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      disabled={!form.conInforme || draftCount === 0 || busyAction !== null}
                      onChange={(event) => {
                        void handleUploadSigned(event.target.files?.[0] ?? null);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <p className="mt-1 text-right text-[9px] text-gray-400">
                    PDF, JPG o PNG · máximo 15 MB · disponible después de generar el borrador
                  </p>
                </div>
              </div>

              <SectionTitle>Versiones y documentos registrados</SectionTitle>
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="min-w-full text-[11px]">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold">Versión</th>
                      <th className="px-2 py-2 text-left font-semibold">Tipo</th>
                      <th className="px-2 py-2 text-left font-semibold">Descripción</th>
                      <th className="px-2 py-2 text-left font-semibold">Archivo</th>
                      <th className="px-2 py-2 text-left font-semibold">Fecha</th>
                      <th className="px-2 py-2 text-left font-semibold">Responsable</th>
                      <th className="px-2 py-2 text-left font-semibold">Estado</th>
                      <th className="px-2 py-2 text-center font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-3 py-6 text-center text-gray-400">
                          Aún no se generaron borradores ni se registraron documentos firmados.
                        </td>
                      </tr>
                    ) : (
                      documents.map((document) => (
                        <tr key={document.id} className="border-t border-gray-100 align-top">
                          <td className="whitespace-nowrap px-2 py-2 font-semibold text-red-600">
                            {document.version}
                          </td>
                          <td className="px-2 py-2">{document.tipo}</td>
                          <td className="min-w-[210px] px-2 py-2">{document.descripcion}</td>
                          <td className="min-w-[170px] px-2 py-2">
                            <span className="block font-medium text-gray-700">
                              {document.archivo}
                            </span>
                            <span className="text-[9px] text-gray-400">
                              {formatFileSize(document.size)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-2 py-2">{document.fecha}</td>
                          <td className="px-2 py-2">{document.responsable}</td>
                          <td className="px-2 py-2">
                            <span
                              className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                                document.tipo === "FIRMADO"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {document.estado}
                            </span>
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex justify-center gap-1">
                              <button
                                type="button"
                                title="Descargar archivo"
                                onClick={() => void handleDownload(document)}
                                className="rounded border border-gray-200 p-1 text-gray-600 hover:bg-gray-50"
                              >
                                <Download size={13} />
                              </button>
                              <button
                                type="button"
                                title="Retirar versión"
                                onClick={() => void handleDelete(document)}
                                className="rounded border border-red-100 p-1 text-red-600 hover:bg-red-50"
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

              <div className="mt-5 flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50"
                >
                  <X size={14} /> Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white"
                  style={{ background: RED }}
                >
                  <Save size={14} /> Guardar informe
                </button>
              </div>
            </form>
          ) : (
            <>
              <SectionTitle>Historial del informe</SectionTitle>
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="min-w-full text-[11px]">
                  <thead className="bg-gray-50 text-gray-600">
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
                        <td colSpan={5} className="px-3 py-6 text-center text-gray-400">
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function createInformeWordBlob({
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
        body { font-family: Arial, sans-serif; color: #111827; font-size: 11pt; line-height: 1.45; margin: 38px 46px; }
        h1 { text-align: center; font-size: 15pt; margin: 0 0 4px; }
        h2 { color: #dc2626; border-bottom: 1px solid #fecaca; font-size: 11pt; margin: 22px 0 8px; padding-bottom: 4px; }
        p { margin: 7px 0; text-align: justify; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { border: 1px solid #9ca3af; padding: 7px; font-size: 10pt; text-align: left; }
        th { width: 26%; background: #f3f4f6; }
        .number { text-align: center; font-weight: bold; margin-bottom: 24px; }
        .signature { margin: 60px auto 0; width: 58%; text-align: center; }
        .footer { color: #6b7280; font-size: 8pt; margin-top: 48px; text-align: right; }
      </style>
    </head>
    <body>
      <h1>INFORME DEL VERIFICADOR ESPECIALISTA</h1>
      <p class="number">${escapeHtml(form.numeroInforme)} · Versión ${escapeHtml(version)}</p>
      <table>
        <tr><th>Proyecto</th><td>${escapeHtml(projectLabel)}</td></tr>
        <tr><th>Código de predio</th><td>${escapeHtml(predioCode)}</td></tr>
        <tr><th>Sujeto pasivo</th><td>${escapeHtml(predio?.suj || "Sin información")}</td></tr>
        <tr><th>Condición jurídica</th><td>${escapeHtml(predio?.condicionPredio || "Por verificar")}</td></tr>
        <tr><th>Periodo de verificación</th><td>${escapeHtml(form.fechaInicio)} al ${escapeHtml(form.fechaFin)}</td></tr>
        <tr><th>Verificador especialista</th><td>${escapeHtml(form.especialista)}</td></tr>
        <tr><th>Especialidad / colegiatura</th><td>${escapeHtml(form.especialidad)} ${form.colegiatura ? `· ${escapeHtml(form.colegiatura)}` : ""}</td></tr>
      </table>
      <h2>1. OBJETO</h2>
      <p>${escapeHtml(form.objeto)}</p>
      <h2>2. ANTECEDENTES Y VERIFICACIÓN</h2>
      <p>Se revisó la información física, catastral, registral y legal disponible para el predio indicado, así como la documentación vinculada al proyecto.</p>
      <h2>3. RESULTADO</h2>
      <p><b>${escapeHtml(form.resultado)}</b></p>
      <h2>4. CONCLUSIÓN</h2>
      <p>${escapeHtml(form.conclusion)}</p>
      <h2>5. OBSERVACIONES</h2>
      <p>${escapeHtml(form.observaciones || "Sin observaciones adicionales.")}</p>
      <div class="signature">____________________________________<br><b>${escapeHtml(form.especialista)}</b><br>Verificador Especialista</div>
      <p class="footer">Borrador generado por el Sistema de Gestión Predial · pendiente de firma</p>
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

function openFileDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(FILE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(FILE_STORE_NAME)) {
        database.createObjectStore(FILE_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function storeFile(id: string, blob: Blob) {
  const database = await openFileDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(FILE_STORE_NAME, "readwrite");
    transaction.objectStore(FILE_STORE_NAME).put(blob, id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  database.close();
}

async function readFile(id: string) {
  const database = await openFileDatabase();
  const result = await new Promise<Blob | undefined>((resolve, reject) => {
    const transaction = database.transaction(FILE_STORE_NAME, "readonly");
    const request = transaction.objectStore(FILE_STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return result;
}

async function deleteFile(id: string) {
  const database = await openFileDatabase();
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
