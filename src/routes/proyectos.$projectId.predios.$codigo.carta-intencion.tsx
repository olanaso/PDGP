import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Download,
  FileText,
  History,
  Mail,
  MessageCircle,
  Save,
  Send,
  Upload,
  X,
} from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/carta-intencion")({
  head: () => ({
    meta: [
      { title: "Carta / Oficio de intención" },
      {
        name: "description",
        content: "Generación, firma, notificación y trazabilidad de la Carta u Oficio de intención.",
      },
    ],
  }),
  component: CartaIntencionPage,
});

const RED = "#dc2626";
const inputCls = "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";

type FormState = {
  tipoDocumento: "CARTA" | "OFICIO";
  numeroCarta: string;
  fechaEmision: string;
  montoOfertado: string;
  incentivo: string;
  fechaNotificacion: string;
  codigoExpedienteTd: string;
  asunto: string;
  sustento: string;
  correoRegistrado: string;
  correoManual: string;
  whatsappRegistrado: string;
  whatsappManual: string;
  responsable: string;
  canalNotificacion: "PENDIENTE" | "CORREO" | "WHATSAPP" | "FISICO" | "MIXTO";
  comunicacionSatisfactoria: "PENDIENTE" | "SI" | "NO";
  observacionNotificacion: string;
};

type SignedFileRow = {
  id: string;
  version: string;
  archivo: string;
  fecha: string;
  usuario: string;
  estado: string;
};

type ActivityRow = {
  id: string;
  fecha: string;
  usuario: string;
  actividad: string;
  canal: string;
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

function CartaIntencionPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}` : projectId;
  const baseCode = (predio?.cod || decodedCodigo).replace(/[^A-Z0-9-]/gi, "").toUpperCase();
  const initialNumber = useMemo(() => `CI-${new Date().getFullYear()}-${baseCode.slice(-6)}`, [baseCode]);
  const [activeTab, setActiveTab] = useState<"registro" | "historico">("registro");
  const [message, setMessage] = useState<{ type: "success" | "warning" | "error"; text: string } | null>(null);
  const [form, setForm] = useState<FormState>({
    tipoDocumento: "CARTA",
    numeroCarta: initialNumber,
    fechaEmision: today(),
    montoOfertado: "",
    incentivo: "",
    fechaNotificacion: today(),
    codigoExpedienteTd: predio?.exp || `TD-${new Date().getFullYear()}-${baseCode.slice(-6)}`,
    asunto: "Carta de intencion de afectacion para trato directo",
    sustento:
      "Se comunica la intencion de afectacion y se solicita al sujeto pasivo presentar la documentacion requerida para continuar con el procedimiento predial.",
    correoRegistrado: "",
    correoManual: "",
    whatsappRegistrado: "",
    whatsappManual: "",
    responsable: proyecto?.coordinadorPredial || "Coordinador predial",
    canalNotificacion: "PENDIENTE",
    comunicacionSatisfactoria: "PENDIENTE",
    observacionNotificacion: "",
  });
  const [files, setFiles] = useState<SignedFileRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([
    {
      id: "act-inicial",
      fecha: timestamp(),
      usuario: "Sistema",
      actividad: "Actividad creada",
      canal: "Sistema",
      estado: "BORRADOR",
      detalle: `Se inicio la carta de intencion para el predio ${predio?.cod || decodedCodigo}.`,
    },
  ]);

  const recipientEmail = (form.correoManual || form.correoRegistrado).trim();
  const recipientWhatsapp = (form.whatsappManual || form.whatsappRegistrado).replace(/\D/g, "");
  const badgeSuffix = form.comunicacionSatisfactoria === "SI" ? "COMUNICADA" : form.comunicacionSatisfactoria === "NO" ? "NO COMUNICADA" : "BORRADOR";

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addActivity(actividad: string, canal: string, estado: string, detalle: string) {
    setActivity((current) => [
      {
        id: `act-${Date.now()}-${current.length}`,
        fecha: timestamp(),
        usuario: form.responsable || "Usuario predial",
        actividad,
        canal,
        estado,
        detalle,
      },
      ...current,
    ]);
  }

  function handleGenerateLetter() {
    downloadBlobFile(
      `${form.tipoDocumento.toLowerCase()}_intencion_${baseCode}.doc`,
      createCartaIntencionBlob({ form, predio, codigo: decodedCodigo, projectLabel }),
    );
    addActivity("Generación de documento", "Documento", "GENERADO", `Se generó ${form.tipoDocumento.toLowerCase()} ${form.numeroCarta}.`);
    setMessage({ type: "success", text: `${form.tipoDocumento === "CARTA" ? "Carta" : "Oficio"} de intención generado correctamente.` });
  }

  function handleUploadSigned(file: File | null) {
    if (!file) return;
    const row: SignedFileRow = {
      id: `signed-${Date.now()}`,
      version: `v${files.length + 1}`,
      archivo: file.name,
      fecha: timestamp(),
      usuario: form.responsable || "Usuario predial",
      estado: "Firmado y cargado",
    };
    setFiles((current) => [row, ...current]);
    addActivity("Carga de documento final firmado", "Sistema", "FIRMADO", `Se cargó ${file.name} como ${row.version}.`);
    setMessage({ type: "success", text: `Documento final firmado cargado correctamente como ${row.version}.` });
  }

  function handleEmailNotification() {
    if (!recipientEmail) {
      setMessage({ type: "error", text: "Ingrese el correo registrado o manual del sujeto pasivo/proveedor." });
      return;
    }
    setField("canalNotificacion", form.canalNotificacion === "WHATSAPP" ? "MIXTO" : "CORREO");
    addActivity(
      "Notificacion por correo",
      "Correo electronico",
      "NOTIFICADO",
      `Carta ${form.numeroCarta} notificada a ${recipientEmail} mediante expediente TD ${form.codigoExpedienteTd}.`,
    );
    setMessage({ type: "success", text: "Notificacion por correo registrada correctamente." });
  }

  function handleWhatsappNotification() {
    if (!recipientWhatsapp) {
      setMessage({ type: "error", text: "Ingrese el numero de WhatsApp registrado o manual." });
      return;
    }
    const text = encodeURIComponent(
      `${form.numeroCarta}: se remite carta de intencion de afectacion del predio ${predio?.cod || decodedCodigo}. Expediente TD: ${form.codigoExpedienteTd}.`,
    );
    window.open(`https://wa.me/51${recipientWhatsapp}?text=${text}`, "_blank", "noopener,noreferrer");
    setField("canalNotificacion", form.canalNotificacion === "CORREO" ? "MIXTO" : "WHATSAPP");
    addActivity(
      "Notificacion por WhatsApp",
      "WhatsApp",
      "NOTIFICADO",
      `Se preparo comunicacion WhatsApp al numero ${recipientWhatsapp}.`,
    );
    setMessage({ type: "success", text: "Se abrio WhatsApp con el mensaje de la carta preparado." });
  }

  function handleRegisterCommunication() {
    if (!form.fechaNotificacion || !form.codigoExpedienteTd.trim()) {
      setMessage({ type: "error", text: "Registre fecha de notificacion y expediente de tramite documentario." });
      return;
    }
    if (files.length === 0) {
      setMessage({ type: "warning", text: "Suba el documento final firmado antes de cerrar la comunicación." });
      return;
    }
    addActivity(
      "Registro de comunicacion",
      form.canalNotificacion,
      form.comunicacionSatisfactoria === "SI" ? "COMUNICACION SATISFACTORIA" : "PENDIENTE/NO SATISFACTORIA",
      `Fecha ${form.fechaNotificacion}. Expediente TD ${form.codigoExpedienteTd}. ${form.observacionNotificacion}`,
    );
    setMessage({ type: "success", text: "Comunicacion de la carta de intencion registrada correctamente." });
  }

  function handleSaveDraft() {
    addActivity("Guardado de borrador", "Sistema", "BORRADOR", `Carta ${form.numeroCarta} actualizada.`);
    setMessage({ type: "success", text: "Borrador de carta de intencion guardado correctamente." });
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Carta / Oficio de intención"
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
                <FileText size={14} /> 3.2 Carta / Oficio de intención
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
                <SectionTitle>Datos de la carta</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Codigo predio">
                    <input className={`${inputCls} bg-gray-50`} value={predio?.cod || decodedCodigo} readOnly />
                  </Field>
                  <Field label="Sujeto pasivo">
                    <input className={`${inputCls} bg-gray-50`} value={predio?.suj || "SIN INFORMACION"} readOnly />
                  </Field>
                  <Field label="Tipo de documento" required>
                    <select className={selectCls} value={form.tipoDocumento} onChange={(event) => setField("tipoDocumento", event.target.value as FormState["tipoDocumento"])}>
                      <option value="CARTA">Carta</option>
                      <option value="OFICIO">Oficio</option>
                    </select>
                  </Field>
                  <Field label="Número de carta / oficio" required>
                    <input className={inputCls} value={form.numeroCarta} onChange={(event) => setField("numeroCarta", event.target.value)} />
                  </Field>
                  <Field label="Fecha emision" required>
                    <input type="date" className={inputCls} value={form.fechaEmision} onChange={(event) => setField("fechaEmision", event.target.value)} />
                  </Field>
                  <Field label="Expediente TD" required>
                    <input className={inputCls} value={form.codigoExpedienteTd} onChange={(event) => setField("codigoExpedienteTd", event.target.value)} />
                  </Field>
                  <Field label="Responsable" required>
                    <input className={inputCls} value={form.responsable} onChange={(event) => setField("responsable", event.target.value)} />
                  </Field>
                  <Field label="Monto ofertado" required>
                    <input className={inputCls} value={form.montoOfertado} onChange={(event) => setField("montoOfertado", event.target.value)} placeholder="S/ 0.00" />
                  </Field>
                  <Field label="Incentivo">
                    <input className={inputCls} value={form.incentivo} onChange={(event) => setField("incentivo", event.target.value)} placeholder="S/ 0.00" />
                  </Field>
                  <Field label="Asunto" className="col-span-2" required>
                    <input className={inputCls} value={form.asunto} onChange={(event) => setField("asunto", event.target.value)} />
                  </Field>
                  <Field label="Sustento" className="col-span-2">
                    <textarea
                      className="min-h-[72px] px-2 py-1.5 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500"
                      value={form.sustento}
                      onChange={(event) => setField("sustento", event.target.value)}
                    />
                  </Field>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateLetter}
                    className="flex min-h-[76px] items-center gap-3 rounded border-2 border-[#dc2626] bg-white p-3 text-left shadow-sm hover:bg-[#fef2f2]"
                  >
                    <span className="flex size-10 items-center justify-center rounded bg-[#dc2626] text-white">
                      <Download size={18} />
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold">Generar carta / oficio de intención</span>
                      <span className="block text-[11px] text-gray-500">Descarga Word para firma</span>
                    </span>
                  </button>
                  <label className="flex min-h-[76px] cursor-pointer items-center gap-3 rounded border-2 border-dashed border-[#dc2626] bg-[#fffafa] p-3 text-left shadow-sm hover:bg-[#fef2f2]">
                    <span className="flex size-10 items-center justify-center rounded bg-white text-[#dc2626] ring-1 ring-[#fecaca]">
                      <Upload size={18} />
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold">Subir documento final firmado</span>
                      <span className="block text-[11px] text-gray-500">PDF o Word firmado digital/fisicamente</span>
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(event) => {
                        handleUploadSigned(event.target.files?.[0] ?? null);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>

                <SectionTitle>Notificacion y comunicacion</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Fecha notificacion" required>
                    <input type="date" className={inputCls} value={form.fechaNotificacion} onChange={(event) => setField("fechaNotificacion", event.target.value)} />
                  </Field>
                  <Field label="Canal">
                    <select className={selectCls} value={form.canalNotificacion} onChange={(event) => setField("canalNotificacion", event.target.value as FormState["canalNotificacion"])}>
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="CORREO">Correo</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="FISICO">Fisico</option>
                      <option value="MIXTO">Mixto</option>
                    </select>
                  </Field>
                  <Field label="Correo registrado">
                    <input className={inputCls} value={form.correoRegistrado} onChange={(event) => setField("correoRegistrado", event.target.value)} placeholder="correo del sujeto/proveedor" />
                  </Field>
                  <Field label="Correo manual">
                    <input className={inputCls} value={form.correoManual} onChange={(event) => setField("correoManual", event.target.value)} />
                  </Field>
                  <Field label="WhatsApp registrado">
                    <input className={inputCls} value={form.whatsappRegistrado} onChange={(event) => setField("whatsappRegistrado", event.target.value)} />
                  </Field>
                  <Field label="WhatsApp manual">
                    <input className={inputCls} value={form.whatsappManual} onChange={(event) => setField("whatsappManual", event.target.value)} />
                  </Field>
                  <Field label="Comunicacion satisfactoria">
                    <select className={selectCls} value={form.comunicacionSatisfactoria} onChange={(event) => setField("comunicacionSatisfactoria", event.target.value as FormState["comunicacionSatisfactoria"])}>
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="SI">Si</option>
                      <option value="NO">No</option>
                    </select>
                  </Field>
                  <Field label="Observacion">
                    <input className={inputCls} value={form.observacionNotificacion} onChange={(event) => setField("observacionNotificacion", event.target.value)} />
                  </Field>
                </div>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <button type="button" onClick={handleEmailNotification} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50">
                    <Mail size={14} /> Notificar correo
                  </button>
                  <button type="button" onClick={handleWhatsappNotification} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50">
                    <MessageCircle size={14} /> Enviar WhatsApp
                  </button>
                  <button type="button" onClick={handleRegisterCommunication} className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white" style={{ background: RED }}>
                    <CheckCircle2 size={14} /> Registrar comunicacion
                  </button>
                </div>

                <SectionTitle>Documentos finales firmados y versionados</SectionTitle>
                <FilesTable files={files} />

                <div className="mt-5 flex justify-end gap-2 border-t pt-3">
                  <button type="button" onClick={() => window.history.back()} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50">
                    <X size={14} /> Cancelar
                  </button>
                  <button type="submit" className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white" style={{ background: RED }}>
                    <Save size={14} /> Guardar
                  </button>
                  <button type="button" onClick={handleRegisterCommunication} className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white" style={{ background: RED }}>
                    <Send size={14} /> Registrar y cerrar
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

function FilesTable({ files }: { files: SignedFileRow[] }) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="min-w-full text-[12px]">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-2 py-2 text-left font-semibold">Version</th>
            <th className="px-2 py-2 text-left font-semibold">Archivo</th>
            <th className="px-2 py-2 text-left font-semibold">Fecha</th>
            <th className="px-2 py-2 text-left font-semibold">Usuario</th>
            <th className="px-2 py-2 text-left font-semibold">Estado</th>
          </tr>
        </thead>
        <tbody>
          {files.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-2 py-4 text-center text-gray-500">
                Aún no se subieron documentos finales firmados.
              </td>
            </tr>
          ) : (
            files.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-2 py-2 font-medium">{item.version}</td>
                <td className="px-2 py-2">{item.archivo}</td>
                <td className="px-2 py-2">{item.fecha}</td>
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
      <SectionTitle>Historico de carta de intencion</SectionTitle>
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-[12px]">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-2 py-2 text-left font-semibold">Fecha</th>
              <th className="px-2 py-2 text-left font-semibold">Usuario</th>
              <th className="px-2 py-2 text-left font-semibold">Actividad</th>
              <th className="px-2 py-2 text-left font-semibold">Canal</th>
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
                <td className="px-2 py-2">{item.canal}</td>
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

function createCartaIntencionBlob({
  form,
  predio,
  codigo,
  projectLabel,
}: {
  form: FormState;
  predio: ReturnType<typeof getPredioByCodigo>;
  codigo: string;
  projectLabel: string;
}) {
  const html = `
    <html>
      <head><meta charset="utf-8"><style>${documentStyles()}</style></head>
      <body>
        <h1>${escapeHtml(form.tipoDocumento)} DE INTENCION DE AFECTACION</h1>
        <p class="right"><b>Nro.:</b> ${escapeHtml(form.numeroCarta)}<br><b>Fecha:</b> ${escapeHtml(form.fechaEmision)}</p>
        <p><b>Proyecto:</b> ${escapeHtml(projectLabel)}</p>
        <p><b>Predio:</b> ${escapeHtml(predio?.cod || codigo)}</p>
        <p><b>Sujeto pasivo:</b> ${escapeHtml(predio?.suj || "SIN INFORMACION")}</p>
        <p><b>Expediente de tramite documentario:</b> ${escapeHtml(form.codigoExpedienteTd)}</p>
        <p><b>Monto ofertado:</b> ${escapeHtml(form.montoOfertado || "PENDIENTE")}</p>
        <p><b>Incentivo:</b> ${escapeHtml(form.incentivo || "NO APLICA")}</p>
        <p><b>Asunto:</b> ${escapeHtml(form.asunto)}</p>
        <p>${escapeHtml(form.sustento)}</p>
        <p>Se solicita presentar la documentacion que acredite titularidad, identificacion, representacion y demas documentos necesarios para evaluar la procedencia del trato directo.</p>
        <p>La presente comunicacion se emite para continuar con el procedimiento de gestion predial correspondiente.</p>
        <br><br>
        <p class="signature">____________________________________<br>${escapeHtml(form.responsable)}<br>Responsable predial</p>
      </body>
    </html>`;
  return new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
}

function documentStyles() {
  return `
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #111827; line-height: 1.35; }
    h1 { color: #dc2626; font-size: 15pt; text-align: center; margin-bottom: 24px; }
    p { margin: 8px 0; }
    .right { text-align: right; }
    .signature { text-align: center; margin-top: 48px; }
  `;
}

function downloadBlobFile(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
