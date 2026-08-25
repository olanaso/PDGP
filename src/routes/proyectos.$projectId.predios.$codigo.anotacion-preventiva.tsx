import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileArchive,
  FileText,
  History,
  Link2,
  Save,
  Upload,
  X,
} from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/anotacion-preventiva")({
  head: () => ({
    meta: [
      { title: "Anotación preventiva DL 1192" },
      {
        name: "description",
        content: "Seguimiento de anotación preventiva DL 1192, generación documental y trazabilidad del trámite SUNARP.",
      },
    ],
  }),
  component: AnotacionPreventivaPage,
});

const RED = "#dc2626";
const SUNARP_LINK = "https://conoce-aqui.sunarp.gob.pe/conoce-aqui/inicio";
const inputCls = "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";
const textAreaCls = "min-h-[68px] px-2 py-1.5 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";

type PreventiveStatus =
  | "PENDIENTE"
  | "GENERADO"
  | "LISTO PARA PRESENTAR"
  | "PRESENTADO"
  | "OBSERVADO"
  | "SUBSANADO"
  | "INSCRITO"
  | "TACHADO"
  | "CANCELADO";

type DocumentState = "PENDIENTE" | "GENERADO" | "LISTO" | "PRESENTADO" | "OBSERVADO" | "INSCRITO";

type DocumentDefinition = {
  id: string;
  label: string;
  fileName: string;
  description: string;
};

type DocumentRow = DocumentDefinition & {
  status: DocumentState;
  version: string;
  generatedAt: string;
  file: string;
};

type TraceRow = {
  id: string;
  date: string;
  user: string;
  previousStatus: PreventiveStatus;
  newStatus: PreventiveStatus;
  document: string;
  detail: string;
};

type FormState = {
  status: PreventiveStatus;
  expedienteId: string;
  solicitudNumber: string;
  oficioNumber: string;
  presentationMode: string;
  responsible: string;
  office: string;
  titleNumber: string;
  presentationDate: string;
  observations: string;
  correctionDocument: string;
  registrationCertificate: string;
  registrySeat: string;
  inscriptionDate: string;
  lastUpdate: string;
};

const STATUS_OPTIONS: PreventiveStatus[] = [
  "PENDIENTE",
  "GENERADO",
  "LISTO PARA PRESENTAR",
  "PRESENTADO",
  "OBSERVADO",
  "SUBSANADO",
  "INSCRITO",
  "TACHADO",
  "CANCELADO",
];

const DOCUMENTS: DocumentDefinition[] = [
  {
    id: "solicitud",
    label: "Solicitud de anotacion preventiva",
    fileName: "solicitud_anotacion_preventiva",
    description: "Solicitud principal para presentar ante SUNARP.",
  },
  {
    id: "oficio",
    label: "Oficio de remision",
    fileName: "oficio_remision_sunarp",
    description: "Oficio dirigido a la oficina registral competente.",
  },
  {
    id: "resumen",
    label: "Hoja resumen",
    fileName: "hoja_resumen_expediente",
    description: "Resumen ejecutivo del expediente registral.",
  },
  {
    id: "indice",
    label: "Indice de anexos",
    fileName: "indice_anexos",
    description: "Relacion ordenada de anexos y documentos soporte.",
  },
  {
    id: "relacion",
    label: "Relacion de predios afectados",
    fileName: "relacion_predios_afectados",
    description: "Listado de predios vinculados al tramite.",
  },
  {
    id: "consolidado",
    label: "Expediente consolidado",
    fileName: "expediente_consolidado_anotacion",
    description: "Paquete consolidado para revision y presentacion.",
  },
];

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

function AnotacionPreventivaPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}` : projectId;
  const displayCode = predio?.cod || decodedCodigo;
  const safeCode = safeFileName(displayCode);
  const initialStatus = statusFromPredio(predio?.etit);
  const [copied, setCopied] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "warning"; text: string } | null>(null);
  const [form, setForm] = useState<FormState>({
    status: initialStatus,
    expedienteId: predio?.exp || `AP-${new Date().getFullYear()}-${safeCode.slice(-6)}`,
    solicitudNumber: `SOL-AP-${new Date().getFullYear()}-${safeCode.slice(-5)}`,
    oficioNumber: `OF-AP-${new Date().getFullYear()}-${safeCode.slice(-5)}`,
    presentationMode: "Mesa de partes SUNARP",
    responsible: proyecto?.coordinadorPredial || predio?.rlegal || "Especialista legal",
    office: predio?.ofi || officeForLocation(predio?.ciudad),
    titleNumber: predio?.titulo && predio.titulo !== "-" ? predio.titulo : "",
    presentationDate: normalizeDate(predio?.ftit) || today(),
    observations: predio?.etit?.toUpperCase().includes("OBSERV") ? predio?.com || "Pendiente levantar observaciones." : "",
    correctionDocument: "",
    registrationCertificate: "",
    registrySeat: predio?.pind || predio?.part || "",
    inscriptionDate: normalizeDate(predio?.finsc),
    lastUpdate: today(),
  });
  const [documents, setDocuments] = useState<DocumentRow[]>(() =>
    DOCUMENTS.map((document, index) => ({
      ...document,
      status: index < 3 || initialStatus !== "PENDIENTE" ? "GENERADO" : "PENDIENTE",
      version: index < 3 || initialStatus !== "PENDIENTE" ? "v1" : "",
      generatedAt: index < 3 || initialStatus !== "PENDIENTE" ? today() : "",
      file: index < 3 || initialStatus !== "PENDIENTE" ? generatedFileName(document, safeCode) : "",
    })),
  );
  const [trace, setTrace] = useState<TraceRow[]>([
    {
      id: "trace-inicial",
      date: timestamp(),
      user: "Sistema",
      previousStatus: "PENDIENTE",
      newStatus: initialStatus,
      document: "Registro base",
      detail: `Se inicializo el seguimiento de anotacion preventiva para el predio ${displayCode}.`,
    },
  ]);

  const progress = useMemo(() => progressFromStatus(form.status), [form.status]);
  const alerts = useMemo(() => buildAlerts(form), [form]);
  const generatedCount = documents.filter((item) => item.status !== "PENDIENTE").length;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addTrace(newStatus: PreventiveStatus, document: string, detail: string) {
    setTrace((current) => [
      {
        id: `trace-${Date.now()}-${current.length}`,
        date: timestamp(),
        user: form.responsible || "Usuario predial",
        previousStatus: form.status,
        newStatus,
        document,
        detail,
      },
      ...current,
    ]);
  }

  function updateStatus(nextStatus: PreventiveStatus, document: string, detail: string) {
    addTrace(nextStatus, document, detail);
    setForm((current) => ({ ...current, status: nextStatus, lastUpdate: today() }));
  }

  function handleGenerateDocument(document: DocumentDefinition) {
    const fileName = generatedFileName(document, safeCode);
    const blob =
      document.id === "oficio"
        ? createOficioWordBlob(form, predio, projectLabel, displayCode)
        : createDocumentPdf(document, form, predio, projectLabel, displayCode);
    downloadBlobFile(fileName, blob);
    setDocuments((current) =>
      current.map((item) =>
        item.id === document.id
          ? {
              ...item,
              status: item.id === "consolidado" ? "LISTO" : "GENERADO",
              version: nextVersion(item.version),
              generatedAt: today(),
              file: fileName,
            }
          : item,
      ),
    );
    updateStatus(form.status === "PENDIENTE" ? "GENERADO" : form.status, document.label, `${document.label} generado para exportacion.`);
    setMessage({ type: "success", text: `${document.label} generado correctamente.` });
  }

  function handleMarkReady() {
    setDocuments((current) =>
      current.map((item) => ({
        ...item,
        status: item.status === "PENDIENTE" ? "GENERADO" : item.status === "GENERADO" ? "LISTO" : item.status,
        version: item.version || "v1",
        generatedAt: item.generatedAt || today(),
        file: item.file || generatedFileName(item, safeCode),
      })),
    );
    updateStatus("LISTO PARA PRESENTAR", "Expediente documental", "El expediente fue marcado como listo para presentar ante SUNARP.");
    setMessage({ type: "success", text: "Expediente listo para presentar ante SUNARP." });
  }

  function handleRegisterPresentation() {
    updateStatus("PRESENTADO", "Presentacion SUNARP", `Titulo ${form.titleNumber || "pendiente"} presentado en ${form.office}.`);
    setDocuments((current) => current.map((item) => ({ ...item, status: item.status === "PENDIENTE" ? "PRESENTADO" : item.status })));
    setMessage({ type: "success", text: "Presentacion SUNARP registrada en la trazabilidad." });
  }

  function handleSave() {
    addTrace(form.status, "Guardado", "Se guardo la informacion del seguimiento de anotacion preventiva.");
    setMessage({ type: "success", text: "Seguimiento de anotacion preventiva guardado." });
  }

  function handleUploadCorrection(file: File | null) {
    if (!file) return;
    setField("correctionDocument", file.name);
    updateStatus("SUBSANADO", file.name, "Se registro documento de subsanacion para levantar observaciones.");
    setMessage({ type: "success", text: `Documento de subsanacion cargado: ${file.name}` });
  }

  function handleUploadCertificate(file: File | null) {
    if (!file) return;
    setField("registrationCertificate", file.name);
    updateStatus("INSCRITO", file.name, "Se registro constancia de inscripcion de la anotacion preventiva.");
    setDocuments((current) => current.map((item) => (item.id === "consolidado" ? { ...item, status: "INSCRITO" } : item)));
    setMessage({ type: "success", text: `Constancia de inscripcion cargada: ${file.name}` });
  }

  function handleDownloadConsolidated() {
    downloadBlobFile(
      `expediente_consolidado_anotacion_preventiva_${safeCode}.pdf`,
      createConsolidatedPdf(form, documents, trace, predio, projectLabel, displayCode),
    );
    updateStatus(form.status === "PENDIENTE" ? "GENERADO" : form.status, "PDF consolidado", "Se exporto el expediente consolidado en PDF.");
  }

  async function handleDownloadZip() {
    const pdfFiles = await Promise.all(
      documents.map(async (document) => {
        const blob =
          document.id === "oficio"
            ? createOficioWordBlob(form, predio, projectLabel, displayCode)
            : createDocumentPdf(document, form, predio, projectLabel, displayCode);
        return {
          name: document.file || generatedFileName(document, safeCode),
          data: new Uint8Array(await blob.arrayBuffer()),
        };
      }),
    );
    const metadata = new TextEncoder().encode(buildMetadata(form, documents, trace, predio, displayCode));
    const zip = createZipBlob([
      ...pdfFiles,
      { name: `metadata_anotacion_preventiva_${safeCode}.txt`, data: metadata },
      { name: `anexos_${safeCode}.txt`, data: new TextEncoder().encode(buildAnnexText(predio, form)) },
    ]);
    downloadBlobFile(`paquete_anotacion_preventiva_${safeCode}.zip`, zip);
    updateStatus(form.status === "PENDIENTE" ? "GENERADO" : form.status, "ZIP expediente", "Se exporto ZIP con documentos, anexos y metadata.");
  }

  async function handleCopySummary() {
    await copyTextToClipboard(buildCopySummary(form, predio, displayCode));
    markCopied("summary");
  }

  async function handleCopySunarpLink() {
    await copyTextToClipboard(SUNARP_LINK);
    markCopied("sunarp");
  }

  function markCopied(key: string) {
    setCopied(key);
    window.setTimeout(() => {
      setCopied((current) => (current === key ? null : current));
    }, 1600);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Anotación preventiva DL 1192"
        badgeLabel="Estado"
        badgeValue={form.status}
        badgeSuffix={`${progress}%`}
      />

      <main className="mx-auto max-w-[1400px] p-4">
        <form
          className="bg-white rounded border"
          onSubmit={(event) => {
            event.preventDefault();
            handleSave();
          }}
        >
          <div className="px-5 py-5">
            <div className="border-b mb-3">
              <div className="inline-block px-3 py-1.5 text-[12px] font-medium border-b-2" style={{ borderColor: RED, color: RED }}>
                2.4 Anotación preventiva DL 1192
              </div>
            </div>

            {message && (
              <div
                className={`mb-3 flex items-start gap-2 rounded border px-3 py-2 text-[12px] ${
                  message.type === "warning" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-green-200 bg-green-50 text-green-700"
                }`}
              >
                <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                <span>{message.text}</span>
              </div>
            )}

            <SectionTitle>Datos automaticos del expediente</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field label="Proyecto">
                <input className={`${inputCls} bg-gray-50`} value={projectLabel} readOnly />
              </Field>
              <Field label="Codigo predio">
                <input className={`${inputCls} bg-gray-50 font-semibold`} value={displayCode} readOnly />
              </Field>
              <Field label="Sujeto pasivo" className="col-span-2">
                <input className={`${inputCls} bg-gray-50`} value={predio?.suj || "Sin informacion"} readOnly />
              </Field>
              <Field label="Acto administrativo">
                <input className={`${inputCls} bg-gray-50`} value={predio?.nres || predio?.res || "Pendiente de registro"} readOnly />
              </Field>
              <Field label="Partida registral">
                <input className={`${inputCls} bg-gray-50`} value={predio?.part || predio?.pind || "Sin informacion"} readOnly />
              </Field>
              <Field label="Area afectada m2">
                <input className={`${inputCls} bg-gray-50`} value={predio?.m2 || predio?.area || "Sin informacion"} readOnly />
              </Field>
              <Field label="Memoria y planos">
                <input className={`${inputCls} bg-gray-50`} value={`Plano y memoria descriptiva asociados a ${displayCode}`} readOnly />
              </Field>
            </div>

            <SectionTitle>Control del tramite registral</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field label="Estado del tramite" required>
                <select
                  className={selectCls}
                  value={form.status}
                  onChange={(event) => updateStatus(event.target.value as PreventiveStatus, "Cambio manual", "Estado actualizado desde el formulario.")}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Expediente">
                <input className={inputCls} value={form.expedienteId} onChange={(event) => setField("expedienteId", event.target.value)} />
              </Field>
              <Field label="Solicitud">
                <input className={inputCls} value={form.solicitudNumber} onChange={(event) => setField("solicitudNumber", event.target.value)} />
              </Field>
              <Field label="Oficio">
                <input className={inputCls} value={form.oficioNumber} onChange={(event) => setField("oficioNumber", event.target.value)} />
              </Field>
              <Field label="Modo presentacion">
                <select className={selectCls} value={form.presentationMode} onChange={(event) => setField("presentationMode", event.target.value)}>
                  <option>Mesa de partes SUNARP</option>
                  <option>SID SUNARP</option>
                  <option>Ventanilla registral</option>
                  <option>Presentacion por notaria</option>
                </select>
              </Field>
              <Field label="Responsable">
                <input className={inputCls} value={form.responsible} onChange={(event) => setField("responsible", event.target.value)} />
              </Field>
              <Field label="Avance">
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded bg-gray-100">
                    <div className="h-2 rounded bg-[#dc2626]" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="w-16 text-right text-[12px] font-medium">{progress}%</span>
                </div>
              </Field>
              <Field label="Ultima actualizacion">
                <input type="date" className={inputCls} value={form.lastUpdate} onChange={(event) => setField("lastUpdate", event.target.value)} />
              </Field>
            </div>

            <SectionTitle>Documentos para presentacion</SectionTitle>
            <div className="mb-3 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={handleDownloadConsolidated} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50">
                <Download size={14} /> PDF consolidado
              </button>
              <button type="button" onClick={handleDownloadZip} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50">
                <FileArchive size={14} /> ZIP con anexos
              </button>
              <button type="button" onClick={handleMarkReady} className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white" style={{ background: RED }}>
                <CheckCircle2 size={14} /> Listo para presentar
              </button>
            </div>
            <DocumentsTable rows={documents} onGenerate={handleGenerateDocument} />

            <SectionTitle>Seguimiento ante SUNARP</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field label="Consulta SUNARP">
                <div className="flex items-center gap-2">
                  <a
                    href={SUNARP_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 px-3 text-[12px] font-medium text-[#dc2626] hover:bg-red-50"
                  >
                    <ExternalLink size={14} /> Conoce Aqui
                  </a>
                  <button type="button" onClick={handleCopySunarpLink} className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 px-3 text-[12px] hover:bg-gray-50">
                    <Link2 size={14} /> {copied === "sunarp" ? "Link copiado" : "Copiar link"}
                  </button>
                </div>
              </Field>
              <Field label="Nro. titulo">
                <input className={inputCls} value={form.titleNumber} onChange={(event) => setField("titleNumber", event.target.value)} placeholder="Pegar numero de titulo SUNARP" />
              </Field>
              <Field label="Oficina registral">
                <input className={inputCls} value={form.office} onChange={(event) => setField("office", event.target.value)} />
              </Field>
              <Field label="Fecha presentacion">
                <input type="date" className={inputCls} value={form.presentationDate} onChange={(event) => setField("presentationDate", event.target.value)} />
              </Field>
              <Field label="Asiento registral">
                <input className={inputCls} value={form.registrySeat} onChange={(event) => setField("registrySeat", event.target.value)} placeholder="Pegar asiento registral" />
              </Field>
              <Field label="Fecha inscripcion">
                <input type="date" className={inputCls} value={form.inscriptionDate} onChange={(event) => setField("inscriptionDate", event.target.value)} />
              </Field>
              <Field label="Observaciones" className="col-span-2">
                <textarea className={textAreaCls} value={form.observations} onChange={(event) => setField("observations", event.target.value)} placeholder="Pegar observaciones SUNARP o detalle de tacha/subsanacion" />
              </Field>
              <Field label="Documento subsanacion">
                <div className="flex items-center gap-2">
                  <input className={`${inputCls} bg-gray-50`} value={form.correctionDocument || "Sin documento"} readOnly />
                  <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded border border-gray-300 px-3 text-[12px] hover:bg-gray-50">
                    <Upload size={14} /> Subir
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(event) => {
                        handleUploadCorrection(event.target.files?.[0] ?? null);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
              </Field>
              <Field label="Constancia inscripcion">
                <div className="flex items-center gap-2">
                  <input className={`${inputCls} bg-gray-50`} value={form.registrationCertificate || "Sin constancia"} readOnly />
                  <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded border border-gray-300 px-3 text-[12px] hover:bg-gray-50">
                    <Upload size={14} /> Subir
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={(event) => {
                        handleUploadCertificate(event.target.files?.[0] ?? null);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={handleCopySummary} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50">
                <Copy size={14} /> {copied === "summary" ? "Datos copiados" : "Copiar datos SUNARP"}
              </button>
              <button type="button" onClick={handleRegisterPresentation} className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white" style={{ background: RED }}>
                <Save size={14} /> Registrar presentacion
              </button>
            </div>

            <SectionTitle>Alertas del tramite</SectionTitle>
            <div className="grid gap-2 md:grid-cols-3">
              {alerts.map((alert) => (
                <div key={alert.title} className={`rounded border px-3 py-2 text-[12px] ${alert.tone}`}>
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertTriangle size={14} />
                    {alert.title}
                  </div>
                  <p className="mt-1 leading-snug">{alert.detail}</p>
                </div>
              ))}
            </div>

            <SectionTitle>Trazabilidad</SectionTitle>
            <TraceTable rows={trace} />

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
              <button type="button" onClick={() => window.history.back()} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50">
                <X size={14} /> Cancelar
              </button>
              <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded" style={{ background: RED }}>
                <Save size={14} /> Guardar
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

function DocumentsTable({ rows, onGenerate }: { rows: DocumentRow[]; onGenerate: (document: DocumentDefinition) => void }) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full min-w-[980px] text-[12px]">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-2 py-2 font-semibold">Documento</th>
            <th className="px-2 py-2 font-semibold">Descripcion</th>
            <th className="w-[130px] px-2 py-2 font-semibold">Estado</th>
            <th className="w-[90px] px-2 py-2 font-semibold">Version</th>
            <th className="w-[130px] px-2 py-2 font-semibold">Fecha</th>
            <th className="w-[180px] px-2 py-2 font-semibold">Archivo</th>
            <th className="w-[130px] px-2 py-2 font-semibold">Accion</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t align-top hover:bg-gray-50">
              <td className="px-2 py-2 font-medium text-gray-900">{row.label}</td>
              <td className="px-2 py-2 text-gray-600">{row.description}</td>
              <td className="px-2 py-2"><DocumentPill status={row.status} /></td>
              <td className="px-2 py-2 font-mono text-[#dc2626]">{row.version || "-"}</td>
              <td className="px-2 py-2">{row.generatedAt || "-"}</td>
              <td className="px-2 py-2">{row.file || "-"}</td>
              <td className="px-2 py-2">
                <button type="button" onClick={() => onGenerate(row)} className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[12px] text-white" style={{ background: RED }}>
                  {row.id === "oficio" ? <FileText size={14} /> : <Download size={14} />}
                  {row.id === "oficio" ? "Oficio" : "PDF"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentPill({ status }: { status: DocumentState }) {
  const cls =
    status === "PENDIENTE"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : status === "OBSERVADO"
        ? "border-red-200 bg-red-50 text-red-700"
        : status === "INSCRITO"
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-blue-200 bg-blue-50 text-blue-700";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{status}</span>;
}

function TraceTable({ rows }: { rows: TraceRow[] }) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full min-w-[960px] text-[12px]">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-2 py-2 font-semibold">Fecha</th>
            <th className="px-2 py-2 font-semibold">Usuario</th>
            <th className="px-2 py-2 font-semibold">Estado anterior</th>
            <th className="px-2 py-2 font-semibold">Estado nuevo</th>
            <th className="px-2 py-2 font-semibold">Documento adjunto</th>
            <th className="px-2 py-2 font-semibold">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t align-top hover:bg-gray-50">
              <td className="whitespace-nowrap px-2 py-2">{row.date}</td>
              <td className="px-2 py-2">{row.user}</td>
              <td className="px-2 py-2">{row.previousStatus}</td>
              <td className="px-2 py-2 font-semibold text-[#dc2626]">{row.newStatus}</td>
              <td className="px-2 py-2">{row.document}</td>
              <td className="px-2 py-2">{row.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function buildAlerts(form: FormState) {
  const alerts: Array<{ title: string; detail: string; tone: string }> = [];
  if (form.status === "OBSERVADO" && !form.correctionDocument) {
    alerts.push({
      title: "Observacion pendiente",
      detail: "Registre el documento de subsanacion y actualice el estado a subsanado.",
      tone: "border-red-200 bg-red-50 text-red-700",
    });
  }
  if (["PRESENTADO", "OBSERVADO", "SUBSANADO"].includes(form.status) && daysSince(form.lastUpdate) >= 7) {
    alerts.push({
      title: "Sin actualizacion",
      detail: "El tramite registra siete o mas dias sin actualizacion. Verifique el titulo en SUNARP.",
      tone: "border-amber-200 bg-amber-50 text-amber-700",
    });
  }
  if (form.status === "INSCRITO" && (!form.registrySeat || !form.inscriptionDate)) {
    alerts.push({
      title: "Inscripcion incompleta",
      detail: "Complete asiento registral y fecha de inscripcion para cerrar el seguimiento.",
      tone: "border-amber-200 bg-amber-50 text-amber-700",
    });
  }
  if (alerts.length === 0) {
    alerts.push({
      title: "Sin alertas criticas",
      detail: "El tramite no presenta observaciones ni vencimientos pendientes.",
      tone: "border-green-200 bg-green-50 text-green-700",
    });
  }
  return alerts;
}

function generatedFileName(document: Pick<DocumentDefinition, "id" | "fileName">, safeCode: string) {
  return `${document.fileName}_${safeCode}.${document.id === "oficio" ? "doc" : "pdf"}`;
}

function createDocumentPdf(
  document: DocumentDefinition,
  form: FormState,
  predio: ReturnType<typeof getPredioByCodigo>,
  projectLabel: string,
  displayCode: string,
) {
  const lines = [
    document.label.toUpperCase(),
    "",
    `Expediente: ${form.expedienteId}`,
    `Solicitud: ${form.solicitudNumber}`,
    `Oficio: ${form.oficioNumber}`,
    `Proyecto: ${projectLabel}`,
    `Codigo de predio: ${displayCode}`,
    `Sujeto pasivo: ${predio?.suj || "Sin informacion"}`,
    `Acto administrativo: ${predio?.nres || predio?.res || "Pendiente"}`,
    `Partida registral: ${predio?.part || predio?.pind || "Sin informacion"}`,
    `Area afectada m2: ${predio?.m2 || predio?.area || "Sin informacion"}`,
    `Oficina registral: ${form.office}`,
    `Estado tramite: ${form.status}`,
    "",
    document.description,
    "El documento se genera con la informacion registrada del proyecto, predio, acto administrativo, planos y memoria descriptiva.",
    "Incluye metadata de expediente para presentacion y control registral.",
  ];
  return createSimplePdfBlob(document.label, lines);
}

function createOficioWordBlob(
  form: FormState,
  predio: ReturnType<typeof getPredioByCodigo>,
  projectLabel: string,
  displayCode: string,
) {
  const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>${wordDocumentStyles()}</style>
      </head>
      <body>
        <p class="right"><b>OFICIO Nro. ${escapeHtml(form.oficioNumber)}</b></p>
        <p class="right">Lima, ${escapeHtml(formatDatePe(form.lastUpdate))}</p>

        <p><b>Senor(a):</b><br>
        Registrador Publico<br>
        ${escapeHtml(form.office)}<br>
        Superintendencia Nacional de los Registros Publicos - SUNARP</p>

        <p><b>Asunto:</b> Solicitud de inscripcion de anotacion preventiva del predio ${escapeHtml(displayCode)}.</p>
        <p><b>Referencia:</b> Expediente ${escapeHtml(form.expedienteId)} - Solicitud ${escapeHtml(form.solicitudNumber)}.</p>

        <p>De mi consideracion:</p>
        <p>
          Me dirijo a usted para remitir el expediente correspondiente y solicitar la inscripcion
          de la anotacion preventiva vinculada al procedimiento de gestion predial del proyecto
          ${escapeHtml(projectLabel)}, respecto del predio identificado con codigo
          ${escapeHtml(displayCode)}.
        </p>
        <p>
          La solicitud se sustenta en la informacion tecnica, legal y registral registrada en el
          sistema, incluyendo el acto administrativo, planos, memoria descriptiva y anexos que
          forman parte del expediente.
        </p>

        <table>
          <tr><th>Campo</th><th>Detalle</th></tr>
          <tr><td>Codigo de predio</td><td>${escapeHtml(displayCode)}</td></tr>
          <tr><td>Sujeto pasivo</td><td>${escapeHtml(predio?.suj || "Sin informacion")}</td></tr>
          <tr><td>Partida registral</td><td>${escapeHtml(predio?.part || predio?.pind || "Sin informacion")}</td></tr>
          <tr><td>Acto administrativo</td><td>${escapeHtml(predio?.nres || predio?.res || "Pendiente")}</td></tr>
          <tr><td>Area afectada m2</td><td>${escapeHtml(predio?.m2 || predio?.area || "Sin informacion")}</td></tr>
          <tr><td>Modalidad de presentacion</td><td>${escapeHtml(form.presentationMode)}</td></tr>
        </table>

        <p>
          Se adjunta la solicitud de anotacion preventiva, hoja resumen, indice de anexos,
          relacion de predios afectados, planos, memoria descriptiva y demas documentos
          que integran el expediente para su calificacion registral.
        </p>
        <p>Sin otro particular, quedo atento(a) a la atencion correspondiente.</p>

        <br><br>
        <p class="signature">
          ____________________________________<br>
          ${escapeHtml(form.responsible)}<br>
          Responsable del tramite registral
        </p>
      </body>
    </html>`;
  return new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
}

function createConsolidatedPdf(
  form: FormState,
  documents: DocumentRow[],
  trace: TraceRow[],
  predio: ReturnType<typeof getPredioByCodigo>,
  projectLabel: string,
  displayCode: string,
) {
  const lines = [
    "EXPEDIENTE CONSOLIDADO DE ANOTACION PREVENTIVA",
    "",
    buildCopySummary(form, predio, displayCode),
    `Proyecto: ${projectLabel}`,
    "",
    "DOCUMENTOS",
    ...documents.map((document, index) => `${index + 1}. ${document.label} | ${document.status} | ${document.file || "-"}`),
    "",
    "TRAZABILIDAD",
    ...trace.map((row) => `${row.date} | ${row.user} | ${row.previousStatus} -> ${row.newStatus} | ${row.document} | ${row.detail}`),
  ];
  return createSimplePdfBlob("Expediente consolidado de anotacion preventiva", lines);
}

function buildCopySummary(form: FormState, predio: ReturnType<typeof getPredioByCodigo>, displayCode: string) {
  return [
    `Predio: ${displayCode}`,
    `Sujeto pasivo: ${predio?.suj || "Sin informacion"}`,
    `Expediente: ${form.expedienteId}`,
    `Nro. titulo SUNARP: ${form.titleNumber || "Pendiente"}`,
    `Oficina registral: ${form.office}`,
    `Fecha presentacion: ${formatDatePe(form.presentationDate)}`,
    `Estado: ${form.status}`,
    `Observaciones: ${form.observations || "Sin observaciones"}`,
    `Documento subsanacion: ${form.correctionDocument || "Sin documento"}`,
    `Constancia inscripcion: ${form.registrationCertificate || "Sin constancia"}`,
    `Asiento registral: ${form.registrySeat || "Pendiente"}`,
    `Fecha inscripcion: ${form.inscriptionDate ? formatDatePe(form.inscriptionDate) : "Pendiente"}`,
    `Consulta SUNARP: ${SUNARP_LINK}`,
  ].join("\n");
}

function buildMetadata(form: FormState, documents: DocumentRow[], trace: TraceRow[], predio: ReturnType<typeof getPredioByCodigo>, displayCode: string) {
  return [
    "METADATA EXPEDIENTE ANOTACION PREVENTIVA",
    "",
    buildCopySummary(form, predio, displayCode),
    "",
    "Documentos:",
    ...documents.map((document) => `- ${document.label}: ${document.status} | ${document.version || "-"} | ${document.file || "-"}`),
    "",
    "Trazabilidad:",
    ...trace.map((row) => `- ${row.date}: ${row.previousStatus} -> ${row.newStatus} | ${row.document} | ${row.user}`),
  ].join("\n");
}

function buildAnnexText(predio: ReturnType<typeof getPredioByCodigo>, form: FormState) {
  return [
    "ANEXOS REFERENCIALES",
    `Acto administrativo: ${predio?.nres || predio?.res || "Pendiente"}`,
    `Planos: Plano de afectacion del predio ${predio?.cod || ""}`,
    `Memoria descriptiva: Asociada al expediente ${form.expedienteId}`,
    `Partida registral: ${predio?.part || predio?.pind || "Sin informacion"}`,
    `Documento de subsanacion: ${form.correctionDocument || "Sin documento"}`,
    `Constancia de inscripcion: ${form.registrationCertificate || "Sin constancia"}`,
  ].join("\n");
}

function createSimplePdfBlob(title: string, rawLines: string[]) {
  const lines = rawLines.flatMap((line) => wrapPdfLine(toPdfAscii(line), 108));
  const pages = chunk(lines.length ? lines : [toPdfAscii(title)], 42);
  const fontObjNum = 3 + pages.length * 2;
  const maxObjNum = fontObjNum;
  const objects = new Map<number, string>();
  const pageObjNums: number[] = [];

  pages.forEach((pageLines, pageIndex) => {
    const pageObjNum = 3 + pageIndex * 2;
    const contentObjNum = pageObjNum + 1;
    pageObjNums.push(pageObjNum);
    const content = ["BT", "/F1 9 Tf", "40 800 Td", "12 TL", ...pageLines.map((line) => `(${escapePdfText(line)}) Tj T*`), "ET"].join("\n");
    objects.set(
      pageObjNum,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> /Contents ${contentObjNum} 0 R >>`,
    );
    objects.set(contentObjNum, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  objects.set(1, "<< /Type /Catalog /Pages 2 0 R >>");
  objects.set(2, `<< /Type /Pages /Kids [${pageObjNums.map((num) => `${num} 0 R`).join(" ")}] /Count ${pages.length} >>`);
  objects.set(fontObjNum, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let num = 1; num <= maxObjNum; num += 1) {
    const body = objects.get(num);
    if (!body) continue;
    offsets[num] = pdf.length;
    pdf += `${num} 0 obj\n${body}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${maxObjNum + 1}\n0000000000 65535 f \n`;
  for (let num = 1; num <= maxObjNum; num += 1) {
    pdf += `${String(offsets[num] || 0).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${maxObjNum + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function createZipBlob(files: Array<{ name: string; data: Uint8Array }>) {
  const encoder = new TextEncoder();
  const local: number[] = [];
  const central: number[] = [];
  const records: Array<{ nameBytes: Uint8Array; data: Uint8Array; crc: number; offset: number }> = [];

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.data);
    const offset = local.length;
    writeUint32(local, 0x04034b50);
    writeUint16(local, 20);
    writeUint16(local, 0);
    writeUint16(local, 0);
    writeUint16(local, 0);
    writeUint16(local, 0);
    writeUint32(local, crc);
    writeUint32(local, file.data.length);
    writeUint32(local, file.data.length);
    writeUint16(local, nameBytes.length);
    writeUint16(local, 0);
    local.push(...nameBytes, ...file.data);
    records.push({ nameBytes, data: file.data, crc, offset });
  });

  records.forEach((record) => {
    writeUint32(central, 0x02014b50);
    writeUint16(central, 20);
    writeUint16(central, 20);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint32(central, record.crc);
    writeUint32(central, record.data.length);
    writeUint32(central, record.data.length);
    writeUint16(central, record.nameBytes.length);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint32(central, 0);
    writeUint32(central, record.offset);
    central.push(...record.nameBytes);
  });

  const end: number[] = [];
  writeUint32(end, 0x06054b50);
  writeUint16(end, 0);
  writeUint16(end, 0);
  writeUint16(end, records.length);
  writeUint16(end, records.length);
  writeUint32(end, central.length);
  writeUint32(end, local.length);
  writeUint16(end, 0);

  return new Blob([new Uint8Array([...local, ...central, ...end])], { type: "application/zip" });
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(out: number[], value: number) {
  out.push(value & 0xff, (value >>> 8) & 0xff);
}

function writeUint32(out: number[], value: number) {
  out.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function downloadBlobFile(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function wordDocumentStyles() {
  return `
    body { font-family: Arial, sans-serif; font-size: 10.5pt; color: #111827; line-height: 1.4; }
    p { margin: 9px 0; }
    .right { text-align: right; }
    .signature { text-align: center; margin-top: 42px; }
    table { width: 100%; border-collapse: collapse; margin: 14px 0; }
    th, td { border: 1px solid #9ca3af; padding: 7px; vertical-align: top; }
    th { background: #f3f4f6; text-align: left; }
  `;
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function copyTextToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function progressFromStatus(status: PreventiveStatus) {
  const map: Record<PreventiveStatus, number> = {
    PENDIENTE: 10,
    GENERADO: 30,
    "LISTO PARA PRESENTAR": 45,
    PRESENTADO: 60,
    OBSERVADO: 65,
    SUBSANADO: 78,
    INSCRITO: 100,
    TACHADO: 0,
    CANCELADO: 0,
  };
  return map[status];
}

function statusFromPredio(value: string | undefined | null): PreventiveStatus {
  const clean = String(value ?? "").toUpperCase();
  if (clean.includes("INSCRITO")) return "INSCRITO";
  if (clean.includes("OBSERV")) return "OBSERVADO";
  if (clean.includes("TACH")) return "TACHADO";
  if (clean.includes("PRESENT")) return "PRESENTADO";
  return "PENDIENTE";
}

function nextVersion(version: string) {
  const current = Number(version.replace(/\D/g, "")) || 0;
  return `v${current + 1}`;
}

function officeForLocation(city?: string) {
  const value = String(city ?? "").toUpperCase();
  if (value.includes("JAUJA") || value.includes("HUANCAYO")) return "SUNARP - Oficina Registral Huancayo";
  if (value.includes("CAJAMARCA")) return "SUNARP - Oficina Registral Cajamarca";
  if (value.includes("LIMA")) return "SUNARP - Oficina Registral Lima";
  return "SUNARP - Oficina Registral competente";
}

function normalizeDate(value: string | undefined | null) {
  const clean = String(value ?? "").trim();
  if (!clean || clean === "-") return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  const slash = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (slash) {
    const day = slash[1].padStart(2, "0");
    const month = slash[2].padStart(2, "0");
    const year = slash[3].length === 2 ? `20${slash[3]}` : slash[3];
    return `${year}-${month}-${day}`;
  }
  return "";
}

function formatDatePe(value: string) {
  const normalized = normalizeDate(value) || value;
  const iso = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!iso) return value || "Pendiente";
  return `${iso[3]}/${iso[2]}/${iso[1]}`;
}

function daysSince(value: string) {
  const normalized = normalizeDate(value);
  if (!normalized) return 0;
  const start = new Date(`${normalized}T00:00:00`).getTime();
  const end = new Date(`${today()}T00:00:00`).getTime();
  return Math.floor((end - start) / 86400000);
}

function wrapPdfLine(value: string, maxLength: number) {
  if (value.length <= maxLength) return [value];
  const words = value.split(" ");
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    if (`${current} ${word}`.trim().length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  });
  if (current) lines.push(current);
  return lines;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function toPdfAscii(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ");
}

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "");
}
