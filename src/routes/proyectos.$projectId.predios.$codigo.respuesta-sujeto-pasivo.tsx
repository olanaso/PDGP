import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  FileCheck2,
  FileText,
  History,
  Save,
  Send,
  Upload,
  X,
} from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/respuesta-sujeto-pasivo")({
  head: () => ({
    meta: [
      { title: "Respuesta del Sujeto Pasivo" },
      {
        name: "description",
        content: "Registro, validación documental, aceptación o rechazo y versionado de la respuesta del Sujeto Pasivo.",
      },
    ],
  }),
  component: RespuestaSujetoPasivoPage,
});

const RED = "#dc2626";
const inputCls = "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";

type FormState = {
  fechaRecepcion: string;
  codigoExpedienteTd: string;
  tipoDocumento: string;
  numeroDocumento: string;
  remitente: string;
  resultadoRespuesta: "PENDIENTE" | "ACEPTA" | "NO ACEPTA" | "OBSERVA" | "NO RESPONDE";
  clasificacion: "PENDIENTE" | "TRATO DIRECTO" | "EXPROPIACION";
  tieneFirma: boolean;
  tieneDocumentoIdentidad: boolean;
  acreditaTitularidad: boolean;
  adjuntaDocumentosSolicitados: boolean;
  respuestaExpresa: boolean;
  observacionValidacion: string;
  responsable: string;
};

type FileRow = {
  id: string;
  version: string;
  tipo: string;
  archivo: string;
  fecha: string;
  usuario: string;
  resultado: FormState["resultadoRespuesta"];
  estado: string;
};

type ActivityRow = {
  id: string;
  fecha: string;
  usuario: string;
  actividad: string;
  estado: string;
  detalle: string;
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

function RespuestaSujetoPasivoPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}` : projectId;
  const baseCode = (predio?.cod || decodedCodigo).replace(/[^A-Z0-9-]/gi, "").toUpperCase();
  const initialDoc = useMemo(() => `RSP-${new Date().getFullYear()}-${baseCode.slice(-6)}`, [baseCode]);
  const [activeTab, setActiveTab] = useState<"registro" | "historico">("registro");
  const [message, setMessage] = useState<{ type: "success" | "warning" | "error"; text: string } | null>(null);
  const [form, setForm] = useState<FormState>({
    fechaRecepcion: today(),
    codigoExpedienteTd: predio?.exp || `TD-${new Date().getFullYear()}-${baseCode.slice(-6)}`,
    tipoDocumento: "Carta de respuesta",
    numeroDocumento: initialDoc,
    remitente: predio?.suj || "SIN INFORMACION",
    resultadoRespuesta: "PENDIENTE",
    clasificacion: "PENDIENTE",
    tieneFirma: false,
    tieneDocumentoIdentidad: false,
    acreditaTitularidad: false,
    adjuntaDocumentosSolicitados: false,
    respuestaExpresa: false,
    observacionValidacion: "",
    responsable: proyecto?.coordinadorPredial || "Coordinador predial",
  });
  const [files, setFiles] = useState<FileRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([
    {
      id: "act-inicial",
      fecha: timestamp(),
      usuario: "Sistema",
      actividad: "Actividad creada",
      estado: "BORRADOR",
      detalle: `Se inicio el registro de respuesta del sujeto pasivo para el predio ${predio?.cod || decodedCodigo}.`,
    },
  ]);

  const validation = getDocumentValidation(form, files.length > 0);
  const badgeSuffix = form.clasificacion === "PENDIENTE" ? "BORRADOR" : form.clasificacion;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addActivity(actividad: string, estado: string, detalle: string) {
    setActivity((current) => [
      {
        id: `act-${Date.now()}-${current.length}`,
        fecha: timestamp(),
        usuario: form.responsable || "Usuario predial",
        actividad,
        estado,
        detalle,
      },
      ...current,
    ]);
  }

  function handleUpload(file: File | null) {
    if (!file) return;
    const row: FileRow = {
      id: `file-${Date.now()}`,
      version: `v${files.length + 1}`,
      tipo: "Respuesta recibida",
      archivo: file.name,
      fecha: timestamp(),
      usuario: form.responsable || "Usuario predial",
      resultado: form.resultadoRespuesta,
      estado: "Recibido y cargado",
    };
    setFiles((current) => [row, ...current]);
    addActivity("Carga de respuesta", "DOCUMENTO RECIBIDO", `Se cargo ${file.name} como ${row.version}.`);
    setMessage({ type: "success", text: `Documento de respuesta cargado correctamente como ${row.version}.` });
  }

  function suggestClassification() {
    if (form.resultadoRespuesta === "ACEPTA" && validation.ok) {
      setField("clasificacion", "TRATO DIRECTO");
      setMessage({ type: "success", text: "La respuesta cumple requisitos y se sugiere clasificar como trato directo." });
      return;
    }
    if (form.resultadoRespuesta === "NO ACEPTA" || form.resultadoRespuesta === "NO RESPONDE") {
      setField("clasificacion", "EXPROPIACION");
      setMessage({ type: "warning", text: "Por no aceptacion o ausencia de respuesta se sugiere clasificar como expropiacion." });
      return;
    }
    setMessage({ type: "warning", text: "Complete la validacion documental para sugerir la clasificacion." });
  }

  function handleSaveDraft() {
    addActivity("Guardado de borrador", "BORRADOR", `Respuesta ${form.numeroDocumento} actualizada.`);
    setMessage({ type: "success", text: "Borrador de respuesta guardado correctamente." });
  }

  function handleRegisterResponse() {
    if (!form.codigoExpedienteTd.trim() || !form.numeroDocumento.trim()) {
      setMessage({ type: "error", text: "Registre expediente de tramite documentario y numero de documento." });
      return;
    }
    if (!validation.ok) {
      setMessage({ type: "warning", text: validation.message });
      return;
    }
    if (form.clasificacion === "PENDIENTE") {
      setMessage({ type: "warning", text: "Clasifique formalmente el predio como trato directo o expropiacion." });
      return;
    }
    addActivity(
      "Registro de respuesta y clasificacion",
      form.clasificacion,
      `Respuesta ${form.numeroDocumento}, resultado ${form.resultadoRespuesta}, expediente TD ${form.codigoExpedienteTd}. ${form.observacionValidacion}`,
    );
    setMessage({ type: "success", text: `Respuesta registrada y predio clasificado como ${form.clasificacion}.` });
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Respuesta del Sujeto Pasivo"
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
                <FileCheck2 size={14} /> 3.3 Respuesta del Sujeto Pasivo
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
                  handleSaveDraft();
                }}
              >
                <SectionTitle>Datos de recepcion</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Codigo predio">
                    <input className={`${inputCls} bg-gray-50`} value={predio?.cod || decodedCodigo} readOnly />
                  </Field>
                  <Field label="Sujeto pasivo">
                    <input className={`${inputCls} bg-gray-50`} value={predio?.suj || "SIN INFORMACION"} readOnly />
                  </Field>
                  <Field label="Fecha recepcion" required>
                    <input type="date" className={inputCls} value={form.fechaRecepcion} onChange={(event) => setField("fechaRecepcion", event.target.value)} />
                  </Field>
                  <Field label="Expediente TD" required>
                    <input className={inputCls} value={form.codigoExpedienteTd} onChange={(event) => setField("codigoExpedienteTd", event.target.value)} />
                  </Field>
                  <Field label="Tipo documento" required>
                    <select className={selectCls} value={form.tipoDocumento} onChange={(event) => setField("tipoDocumento", event.target.value)}>
                      <option>Carta de respuesta</option>
                      <option>Solicitud</option>
                      <option>Declaracion jurada</option>
                      <option>Escrito simple</option>
                      <option>Otro</option>
                    </select>
                  </Field>
                  <Field label="Numero documento" required>
                    <input className={inputCls} value={form.numeroDocumento} onChange={(event) => setField("numeroDocumento", event.target.value)} />
                  </Field>
                  <Field label="Remitente">
                    <input className={inputCls} value={form.remitente} onChange={(event) => setField("remitente", event.target.value)} />
                  </Field>
                  <Field label="Resultado respuesta">
                    <select className={selectCls} value={form.resultadoRespuesta} onChange={(event) => setField("resultadoRespuesta", event.target.value as FormState["resultadoRespuesta"])}>
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="ACEPTA">Acepta</option>
                      <option value="NO ACEPTA">No acepta</option>
                      <option value="OBSERVA">Observa</option>
                      <option value="NO RESPONDE">No responde</option>
                    </select>
                  </Field>
                </div>

                <SectionTitle>Documento recibido y requisitos de validez</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Documento respuesta" required>
                    <label className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded border border-gray-300 px-3 text-[12px] hover:bg-gray-50">
                      <Upload size={14} /> Subir documento
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(event) => {
                          handleUpload(event.target.files?.[0] ?? null);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </Field>
                  <Field label="Estado validacion">
                    <input className={`${inputCls} bg-gray-50`} value={validation.message} readOnly />
                  </Field>
                  <Field label="Requisitos" className="col-span-2">
                    <div className="grid grid-cols-2 gap-2 rounded border border-gray-200 p-2">
                      <CheckItem label="Tiene firma del sujeto pasivo o representante" checked={form.tieneFirma} onChange={(checked) => setField("tieneFirma", checked)} />
                      <CheckItem label="Adjunta DNI/RUC o documento de identidad" checked={form.tieneDocumentoIdentidad} onChange={(checked) => setField("tieneDocumentoIdentidad", checked)} />
                      <CheckItem label="Acredita titularidad o condicion declarada" checked={form.acreditaTitularidad} onChange={(checked) => setField("acreditaTitularidad", checked)} />
                      <CheckItem label="Adjunta documentos solicitados en carta" checked={form.adjuntaDocumentosSolicitados} onChange={(checked) => setField("adjuntaDocumentosSolicitados", checked)} />
                      <CheckItem label="Contiene respuesta expresa" checked={form.respuestaExpresa} onChange={(checked) => setField("respuestaExpresa", checked)} />
                    </div>
                  </Field>
                  <Field label="Observaciones" className="col-span-2">
                    <textarea
                      className="min-h-[68px] px-2 py-1.5 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500"
                      value={form.observacionValidacion}
                      onChange={(event) => setField("observacionValidacion", event.target.value)}
                    />
                  </Field>
                </div>

                <SectionTitle>Clasificacion formal del predio</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Clasificacion" required>
                    <select className={selectCls} value={form.clasificacion} onChange={(event) => setField("clasificacion", event.target.value as FormState["clasificacion"])}>
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="TRATO DIRECTO">Trato directo</option>
                      <option value="EXPROPIACION">Expropiacion</option>
                    </select>
                  </Field>
                  <Field label="Responsable" required>
                    <input className={inputCls} value={form.responsable} onChange={(event) => setField("responsable", event.target.value)} />
                  </Field>
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="button" onClick={suggestClassification} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50">
                    <FileText size={14} /> Sugerir clasificacion
                  </button>
                </div>

                <SectionTitle>Documentos recibidos</SectionTitle>
                <FilesTable files={files} />

                <div className="mt-5 flex justify-end gap-2 border-t pt-3">
                  <button type="button" onClick={() => window.history.back()} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50">
                    <X size={14} /> Cancelar
                  </button>
                  <button type="submit" className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white" style={{ background: RED }}>
                    <Save size={14} /> Guardar
                  </button>
                  <button type="button" onClick={handleRegisterResponse} className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white" style={{ background: RED }}>
                    <Send size={14} /> Registrar respuesta
                  </button>
                </div>
              </form>
            ) : (
              <HistoryTable activity={activity} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function CheckItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-[12px] text-gray-700">
      <input type="checkbox" className="accent-[#dc2626]" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

function FilesTable({ files }: { files: FileRow[] }) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="min-w-full text-[12px]">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-2 py-2 text-left font-semibold">Version</th>
            <th className="px-2 py-2 text-left font-semibold">Tipo</th>
            <th className="px-2 py-2 text-left font-semibold">Archivo</th>
            <th className="px-2 py-2 text-left font-semibold">Fecha</th>
            <th className="px-2 py-2 text-left font-semibold">Acepta / rechaza</th>
            <th className="px-2 py-2 text-left font-semibold">Usuario</th>
            <th className="px-2 py-2 text-left font-semibold">Estado</th>
          </tr>
        </thead>
        <tbody>
          {files.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-2 py-4 text-center text-gray-500">
                Aun no se subio la respuesta del sujeto pasivo.
              </td>
            </tr>
          ) : (
            files.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-2 py-2 font-medium">{item.version}</td>
                <td className="px-2 py-2">{item.tipo}</td>
                <td className="px-2 py-2">{item.archivo}</td>
                <td className="px-2 py-2">{item.fecha}</td>
                <td className="px-2 py-2 font-medium">{item.resultado}</td>
                <td className="px-2 py-2">{item.usuario}</td>
                <td className="px-2 py-2">{item.estado}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function HistoryTable({ activity }: { activity: ActivityRow[] }) {
  return (
    <>
      <SectionTitle>Historico de respuesta del sujeto pasivo</SectionTitle>
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
            {activity.map((item) => (
              <tr key={item.id} className="border-t align-top">
                <td className="px-2 py-2 whitespace-nowrap">{item.fecha}</td>
                <td className="px-2 py-2">{item.usuario}</td>
                <td className="px-2 py-2 font-medium">{item.actividad}</td>
                <td className="px-2 py-2">{item.estado}</td>
                <td className="px-2 py-2">{item.detalle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function getDocumentValidation(form: FormState, hasFile: boolean) {
  if (!hasFile) return { ok: false, message: "Debe subir el documento de respuesta recibido." };
  if (!form.tieneFirma) return { ok: false, message: "La respuesta debe contar con firma." };
  if (!form.tieneDocumentoIdentidad) return { ok: false, message: "Debe adjuntar DNI/RUC o documento de identidad." };
  if (!form.acreditaTitularidad) return { ok: false, message: "Debe acreditar titularidad o condicion declarada." };
  if (!form.adjuntaDocumentosSolicitados) return { ok: false, message: "Debe adjuntar los documentos solicitados en la carta." };
  if (!form.respuestaExpresa) return { ok: false, message: "Debe contener respuesta expresa del sujeto pasivo." };
  return { ok: true, message: "Documento valido para clasificacion del procedimiento." };
}
