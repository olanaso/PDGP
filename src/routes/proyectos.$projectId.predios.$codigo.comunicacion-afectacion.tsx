import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Download,
  FileCheck2,
  FilePenLine,
  FileText,
  History,
  Mail,
  MessageCircle,
  Printer,
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
  "/proyectos/$projectId/predios/$codigo/comunicacion-afectacion",
)({
  head: () => ({
    meta: [
      { title: "Comunicación de afectación" },
      {
        name: "description",
        content:
          "Generación, notificación y trazabilidad de la comunicación de afectación al sujeto pasivo.",
      },
    ],
  }),
  component: ComunicacionAfectacionPage,
});

const RED = "#dc2626";
const inputCls =
  "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";
const FILE_DB_NAME = "predio-documentos-db";
const FILE_STORE_NAME = "archivos";
const MAX_OFFICIAL_FILE_SIZE = 15 * 1024 * 1024;

type ActivityRow = {
  id: string;
  fecha: string;
  usuario: string;
  actividad: string;
  canal: string;
  estado: string;
  detalle: string;
};

type SignedDocumentRow = {
  id: string;
  version: string;
  archivo: string;
  tipo: string;
  tipoFirma: string;
  descripcion: string;
  size: number;
  fecha: string;
  usuario: string;
  estado: string;
};

type FormState = {
  numeroDocumento: string;
  tipoDocumento: "Carta" | "Oficio";
  fechaEmision: string;
  asunto: string;
  sustento: string;
  correoRegistrado: string;
  correoManual: string;
  whatsappRegistrado: string;
  whatsappManual: string;
  responsable: string;
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

function ComunicacionAfectacionPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;
  const baseCode = (predio?.cod || decodedCodigo).replace(/[^A-Z0-9-]/gi, "").toUpperCase();
  const initialDocumentNumber = useMemo(
    () => `CA-${new Date().getFullYear()}-${baseCode.slice(-6)}`,
    [baseCode],
  );
  const sujetoPasivo = predio?.suj || "SIN INFORMACION";
  const [activeTab, setActiveTab] = useState<"gestion" | "historico">("gestion");
  const [message, setMessage] = useState<{
    type: "success" | "warning" | "error";
    text: string;
  } | null>(null);
  const [form, setForm] = useState<FormState>({
    numeroDocumento: initialDocumentNumber,
    tipoDocumento: "Carta",
    fechaEmision: today(),
    asunto: "Comunicacion de afectacion del predio para liberacion predial",
    sustento:
      "Se comunica la afectacion del predio en el marco de las actividades de gestion predial del proyecto, solicitando la atencion y respuesta del sujeto pasivo.",
    correoRegistrado: "",
    correoManual: "",
    whatsappRegistrado: "",
    whatsappManual: "",
    responsable: proyecto?.coordinadorPredial || "Coordinador predial",
  });
  const [resultado, setResultado] = useState({
    comunicacionEfectiva: "PENDIENTE",
    aceptacion: "PENDIENTE",
    fechaRespuesta: today(),
    observacion: "",
  });
  const [signedDocuments, setSignedDocuments] = useState<SignedDocumentRow[]>([]);
  const [officialDocument, setOfficialDocument] = useState({
    tipoFirma: "FIRMA DIGITAL",
    descripcion: "Comunicación de afectación firmada",
  });
  const [uploadHistoryLoaded, setUploadHistoryLoaded] = useState(false);
  const [activity, setActivity] = useState<ActivityRow[]>([
    {
      id: "act-inicial",
      fecha: timestamp(),
      usuario: "Sistema",
      actividad: "Tramite creado",
      canal: "Sistema",
      estado: "BORRADOR",
      detalle: `Se inicio la comunicacion de afectacion para el predio ${predio?.cod || decodedCodigo}.`,
    },
  ]);

  const recipientEmail = (form.correoManual || form.correoRegistrado).trim();
  const recipientWhatsapp = (form.whatsappManual || form.whatsappRegistrado).replace(/\D/g, "");
  const statusLabel =
    resultado.comunicacionEfectiva === "SI"
      ? "COMUNICACION EFECTIVA"
      : resultado.comunicacionEfectiva === "NO"
        ? "NO EFECTIVA"
        : "PENDIENTE";
  const uploadHistoryKey = `comunicacion-afectacion:oficiales:${projectId}:${decodedCodigo}`;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(uploadHistoryKey);
      if (stored) setSignedDocuments(JSON.parse(stored) as SignedDocumentRow[]);
    } catch {
      setMessage({
        type: "warning",
        text: "No se pudo recuperar el historial anterior de documentos oficiales.",
      });
    } finally {
      setUploadHistoryLoaded(true);
    }
  }, [uploadHistoryKey]);

  useEffect(() => {
    if (!uploadHistoryLoaded) return;
    window.localStorage.setItem(uploadHistoryKey, JSON.stringify(signedDocuments));
  }, [signedDocuments, uploadHistoryKey, uploadHistoryLoaded]);

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

  function handleGenerateDocument() {
    downloadBlobFile(
      `${form.tipoDocumento.toLowerCase()}_comunicacion_afectacion_${baseCode}.doc`,
      createAfectacionWordBlob({ form, predio, codigo: decodedCodigo, projectLabel }),
    );
    addActivity(
      "Generacion de documento",
      "Documento",
      "GENERADO",
      `${form.tipoDocumento} ${form.numeroDocumento} emitida con fecha ${form.fechaEmision}.`,
    );
    setMessage({
      type: "success",
      text: "Documento de comunicacion de afectacion generado correctamente.",
    });
  }

  async function handleUploadSigned(file: File | null) {
    if (!file) return;
    if (!form.numeroDocumento.trim() || !form.responsable.trim()) {
      setMessage({
        type: "warning",
        text: "Complete el número del documento y el responsable antes de subir el documento oficial.",
      });
      return;
    }
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["pdf", "png", "jpg", "jpeg"].includes(extension)) {
      setMessage({ type: "error", text: "El documento oficial debe ser PDF, JPG o PNG." });
      return;
    }
    if (file.size > MAX_OFFICIAL_FILE_SIZE) {
      setMessage({
        type: "error",
        text: "El documento oficial supera el tamaño máximo permitido de 15 MB.",
      });
      return;
    }

    const nextVersion =
      Math.max(0, ...signedDocuments.map((item) => Number(item.version.match(/\d+/)?.[0] || 0))) +
      1;
    const documentId = `signed-${Date.now()}`;
    try {
      await storeDocumentFile(documentId, file);
    } catch {
      setMessage({
        type: "error",
        text: "No se pudo almacenar el documento oficial en el navegador.",
      });
      return;
    }
    const row: SignedDocumentRow = {
      id: documentId,
      version: `OF-${String(nextVersion).padStart(2, "0")}`,
      archivo: file.name,
      tipo: "Documento oficial",
      tipoFirma: officialDocument.tipoFirma,
      descripcion: officialDocument.descripcion.trim() || "Comunicación de afectación firmada",
      size: file.size,
      fecha: timestamp(),
      usuario: form.responsable || "Usuario predial",
      estado: "OFICIAL REGISTRADO",
    };
    setSignedDocuments((current) => [row, ...current]);
    addActivity(
      "Carga de documento oficial",
      "Sistema",
      "OFICIAL REGISTRADO",
      `Se cargó ${file.name} como ${row.version} (${officialDocument.tipoFirma.toLowerCase()}).`,
    );
    setMessage({
      type: "success",
      text: `Documento oficial cargado y registrado como versión ${row.version}.`,
    });
  }

  async function handleDownloadOfficial(item: SignedDocumentRow) {
    try {
      const blob = await readDocumentFile(item.id);
      if (!blob) throw new Error("Archivo no disponible");
      downloadBlobFile(item.archivo, blob);
      setMessage({ type: "success", text: `Descarga iniciada: ${item.archivo}.` });
    } catch {
      setMessage({
        type: "error",
        text: "El archivo no está disponible. Vuelva a cargar esta versión oficial.",
      });
    }
  }

  async function handleRemoveOfficial(item: SignedDocumentRow) {
    try {
      await deleteDocumentFile(item.id);
    } finally {
      setSignedDocuments((current) => current.filter((document) => document.id !== item.id));
      addActivity(
        "Retiro de documento oficial",
        "Sistema",
        "RETIRADO",
        `Se retiró ${item.archivo}, versión ${item.version}.`,
      );
      setMessage({
        type: "success",
        text: `Se retiró la versión ${item.version} del historial de cargas.`,
      });
    }
  }

  function handleEmailNotification() {
    if (!recipientEmail) {
      setMessage({
        type: "error",
        text: "Ingrese un correo registrado o manual para notificar al sujeto pasivo.",
      });
      return;
    }
    addActivity(
      "Notificacion por correo",
      "Correo electronico",
      "NOTIFICADO",
      `Se registro el envio de la comunicacion de afectacion a ${recipientEmail}.`,
    );
    setMessage({ type: "success", text: "Notificacion por correo registrada correctamente." });
  }

  function handleWhatsappNotification() {
    if (!recipientWhatsapp) {
      setMessage({
        type: "error",
        text: "Ingrese un numero de WhatsApp registrado o manual para notificar.",
      });
      return;
    }
    const text = encodeURIComponent(
      `${form.tipoDocumento} ${form.numeroDocumento}: se comunica la afectacion del predio ${predio?.cod || decodedCodigo}. ${form.asunto}`,
    );
    window.open(
      `https://wa.me/51${recipientWhatsapp}?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
    addActivity(
      "Notificacion por WhatsApp",
      "WhatsApp",
      "NOTIFICADO",
      `Se preparo el envio al numero ${recipientWhatsapp}.`,
    );
    setMessage({
      type: "success",
      text: "Se abrio WhatsApp con el mensaje de comunicacion preparado.",
    });
  }

  function handlePhysicalDeliveryDocument() {
    downloadBlobFile(
      `constancia_entrega_fisica_${baseCode}.doc`,
      createPhysicalDeliveryBlob({ form, predio, codigo: decodedCodigo, projectLabel }),
    );
    addActivity(
      "Generacion de cargo de entrega fisica",
      "Entrega fisica",
      "GENERADO",
      "Se genero el documento para registrar la entrega fisica al sujeto pasivo.",
    );
    setMessage({ type: "success", text: "Documento para entrega fisica generado correctamente." });
  }

  function handleRegisterOutcome() {
    addActivity(
      "Registro de resultado de comunicacion",
      "Sistema",
      statusLabel,
      `Comunicacion efectiva: ${resultado.comunicacionEfectiva}. Aceptacion: ${resultado.aceptacion}. Fecha: ${resultado.fechaRespuesta}. ${resultado.observacion}`,
    );
    setMessage({
      type: "success",
      text: "Resultado de la comunicacion actualizado y registrado en el historial.",
    });
  }

  function handleSaveDraft() {
    addActivity(
      "Actualizacion del tramite",
      "Sistema",
      "BORRADOR ACTUALIZADO",
      "Se guardaron los datos de la comunicacion de afectacion.",
    );
    setMessage({ type: "success", text: "Datos de comunicacion guardados correctamente." });
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Comunicación de afectación"
        badgeLabel="Predio"
        badgeValue={predio?.cod || decodedCodigo}
        badgeSuffix={statusLabel}
      />

      <main className="max-w-[1280px] mx-auto p-4">
        <div className="bg-white rounded border">
          <div className="px-5 py-5">
            <div className="border-b mb-3 flex items-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("gestion")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border-b-2"
                style={{
                  borderColor: activeTab === "gestion" ? RED : "transparent",
                  color: activeTab === "gestion" ? RED : "#4b5563",
                }}
              >
                <FileText size={14} /> 2.3 Comunicación de afectación
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("historico")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border-b-2"
                style={{
                  borderColor: activeTab === "historico" ? RED : "transparent",
                  color: activeTab === "historico" ? RED : "#4b5563",
                }}
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

            {activeTab === "gestion" ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSaveDraft();
                }}
              >
                <SectionTitle>Datos del predio y sujeto pasivo</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Codigo de predio">
                    <input
                      className={`${inputCls} bg-gray-50`}
                      value={predio?.cod || decodedCodigo}
                      readOnly
                    />
                  </Field>
                  <Field label="Condicion predio">
                    <input
                      className={`${inputCls} bg-gray-50`}
                      value={predio?.condicionPredio || "Sin informacion"}
                      readOnly
                    />
                  </Field>
                  <Field label="Sujeto pasivo" className="col-span-2">
                    <input className={`${inputCls} bg-gray-50`} value={sujetoPasivo} readOnly />
                  </Field>
                  <Field label="Ubicacion">
                    <input
                      className={`${inputCls} bg-gray-50`}
                      value={
                        [predio?.ciudad, predio?.proyecto].filter(Boolean).join(" / ") ||
                        "Sin informacion"
                      }
                      readOnly
                    />
                  </Field>
                  <Field label="Area afectada m2">
                    <input
                      className={`${inputCls} bg-gray-50`}
                      value={predio?.m2 || predio?.area || "Sin informacion"}
                      readOnly
                    />
                  </Field>
                </div>

                <SectionTitle>Documento de comunicacion</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Tipo documento" required>
                    <select
                      className={selectCls}
                      value={form.tipoDocumento}
                      onChange={(event) =>
                        setField("tipoDocumento", event.target.value as FormState["tipoDocumento"])
                      }
                    >
                      <option>Carta</option>
                      <option>Oficio</option>
                    </select>
                  </Field>
                  <Field label="Numero documento" required>
                    <input
                      className={inputCls}
                      value={form.numeroDocumento}
                      onChange={(event) => setField("numeroDocumento", event.target.value)}
                    />
                  </Field>
                  <Field label="Fecha emision" required>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.fechaEmision}
                      onChange={(event) => setField("fechaEmision", event.target.value)}
                    />
                  </Field>
                  <Field label="Responsable" required>
                    <input
                      className={inputCls}
                      value={form.responsable}
                      onChange={(event) => setField("responsable", event.target.value)}
                    />
                  </Field>
                  <Field label="Asunto" className="col-span-2" required>
                    <input
                      className={inputCls}
                      value={form.asunto}
                      onChange={(event) => setField("asunto", event.target.value)}
                    />
                  </Field>
                  <Field label="Sustento" className="col-span-2">
                    <textarea
                      className="min-h-[72px] px-2 py-1.5 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500"
                      value={form.sustento}
                      onChange={(event) => setField("sustento", event.target.value)}
                    />
                  </Field>
                </div>

                <SectionTitle>Generación y registro del documento</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <section className="rounded border border-gray-200 bg-white p-3">
                    <div className="mb-3 flex items-start gap-2 border-b border-red-200 pb-2">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded bg-red-50 text-red-600">
                        <FilePenLine size={17} />
                      </span>
                      <div>
                        <div className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                          Paso 1
                        </div>
                        <h4 className="text-[12px] font-semibold text-red-600">
                          Generar borrador de la comunicación
                        </h4>
                        <p className="mt-0.5 text-[10px] leading-relaxed text-gray-500">
                          Descargue la carta u oficio en Word para revisión, corrección y firma.
                        </p>
                      </div>
                    </div>
                    <div className="mb-3 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-[10px] text-gray-600">
                      Se generará <b>{form.tipoDocumento}</b> N.° <b>{form.numeroDocumento}</b> con
                      los datos del predio y del sujeto pasivo.
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateDocument}
                      className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded border border-red-200 bg-red-50 px-3 text-[12px] font-semibold text-red-700 hover:bg-red-100"
                    >
                      <Download size={14} /> Generar y descargar borrador Word
                    </button>
                  </section>

                  <section className="rounded border border-gray-200 bg-white p-3">
                    <div className="mb-3 flex items-start gap-2 border-b border-red-200 pb-2">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded bg-red-50 text-red-600">
                        <FileCheck2 size={17} />
                      </span>
                      <div>
                        <div className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                          Paso 2
                        </div>
                        <h4 className="text-[12px] font-semibold text-red-600">
                          Subir documento oficial firmado
                        </h4>
                        <p className="mt-0.5 text-[10px] leading-relaxed text-gray-500">
                          Registre el PDF con firma digital o la carta/oficio firmado y escaneado.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-[135px_1fr] gap-x-2 gap-y-2">
                      <label className="self-center text-right text-[11px] text-gray-600">
                        Tipo de firma
                      </label>
                      <select
                        className={inputCls}
                        value={officialDocument.tipoFirma}
                        onChange={(event) =>
                          setOfficialDocument((current) => ({
                            ...current,
                            tipoFirma: event.target.value,
                          }))
                        }
                      >
                        <option value="FIRMA DIGITAL">Firma digital</option>
                        <option value="FIRMA MANUSCRITA ESCANEADA">
                          Firma manuscrita escaneada
                        </option>
                      </select>
                      <label className="self-center text-right text-[11px] text-gray-600">
                        Descripción
                      </label>
                      <input
                        className={inputCls}
                        value={officialDocument.descripcion}
                        onChange={(event) =>
                          setOfficialDocument((current) => ({
                            ...current,
                            descripcion: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <label className="mt-3 inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded bg-red-600 px-3 text-[12px] font-semibold text-white hover:bg-red-700">
                      <Upload size={14} /> Seleccionar y subir documento oficial
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(event) => {
                          void handleUploadSigned(event.target.files?.[0] ?? null);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                    <p className="mt-1 text-right text-[9px] text-gray-400">
                      Formatos: PDF, JPG o PNG · máximo 15 MB
                    </p>
                  </section>
                </div>

                <SectionTitle>Historial de documentos oficiales subidos</SectionTitle>
                <div className="mb-2 flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-[10px] text-gray-600">
                    Cada nueva carga se conserva como una versión independiente para mantener la
                    trazabilidad.
                  </p>
                  <span className="rounded bg-white px-2 py-1 text-[10px] font-semibold text-gray-700 ring-1 ring-gray-200">
                    {signedDocuments.length}{" "}
                    {signedDocuments.length === 1 ? "versión" : "versiones"}
                  </span>
                </div>
                <div className="overflow-x-auto rounded border border-gray-200">
                  <table className="min-w-full text-[11px]">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-2 py-2 text-left font-semibold">Versión</th>
                        <th className="px-2 py-2 text-left font-semibold">Descripción</th>
                        <th className="px-2 py-2 text-left font-semibold">Tipo de firma</th>
                        <th className="px-2 py-2 text-left font-semibold">Archivo</th>
                        <th className="px-2 py-2 text-left font-semibold">Fecha de carga</th>
                        <th className="px-2 py-2 text-left font-semibold">Responsable</th>
                        <th className="px-2 py-2 text-left font-semibold">Estado</th>
                        <th className="px-2 py-2 text-center font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {signedDocuments.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-3 py-6 text-center text-gray-400">
                            Todavía no se ha subido el documento oficial firmado.
                          </td>
                        </tr>
                      ) : (
                        signedDocuments.map((item) => (
                          <tr key={item.id} className="border-t border-gray-100 align-top">
                            <td className="whitespace-nowrap px-2 py-2 font-semibold text-red-600">
                              {item.version}
                            </td>
                            <td className="min-w-[180px] px-2 py-2">
                              {item.descripcion || "Comunicación de afectación firmada"}
                            </td>
                            <td className="px-2 py-2">{item.tipoFirma || "Documento firmado"}</td>
                            <td className="min-w-[160px] px-2 py-2">
                              <span className="block font-medium text-gray-700">
                                {item.archivo}
                              </span>
                              <span className="text-[9px] text-gray-400">
                                {formatFileSize(item.size || 0)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-2 py-2">{item.fecha}</td>
                            <td className="px-2 py-2">{item.usuario}</td>
                            <td className="px-2 py-2">
                              <span className="inline-flex rounded bg-green-50 px-1.5 py-0.5 text-[9px] font-semibold text-green-700">
                                {item.estado}
                              </span>
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex justify-center gap-1">
                                <button
                                  type="button"
                                  title="Descargar documento oficial"
                                  onClick={() => void handleDownloadOfficial(item)}
                                  className="rounded border border-gray-200 p-1 text-gray-600 hover:bg-gray-50"
                                >
                                  <Download size={13} />
                                </button>
                                <button
                                  type="button"
                                  title="Retirar esta versión"
                                  onClick={() => void handleRemoveOfficial(item)}
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

                <SectionTitle>Notificacion al sujeto pasivo</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Correo registrado">
                    <input
                      className={inputCls}
                      value={form.correoRegistrado}
                      onChange={(event) => setField("correoRegistrado", event.target.value)}
                      placeholder="correo registrado en padron"
                    />
                  </Field>
                  <Field label="Correo manual">
                    <input
                      className={inputCls}
                      value={form.correoManual}
                      onChange={(event) => setField("correoManual", event.target.value)}
                      placeholder="correo alterno"
                    />
                  </Field>
                  <Field label="WhatsApp registrado">
                    <input
                      className={inputCls}
                      value={form.whatsappRegistrado}
                      onChange={(event) => setField("whatsappRegistrado", event.target.value)}
                      placeholder="numero registrado"
                    />
                  </Field>
                  <Field label="WhatsApp manual">
                    <input
                      className={inputCls}
                      value={form.whatsappManual}
                      onChange={(event) => setField("whatsappManual", event.target.value)}
                      placeholder="numero alterno"
                    />
                  </Field>
                </div>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleEmailNotification}
                    className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50"
                  >
                    <Mail size={14} /> Notificar por correo
                  </button>
                  <button
                    type="button"
                    onClick={handleWhatsappNotification}
                    className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50"
                  >
                    <MessageCircle size={14} /> Enviar WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={handlePhysicalDeliveryDocument}
                    className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50"
                  >
                    <Printer size={14} /> Generar cargo fisico
                  </button>
                </div>

                <SectionTitle>Registro de resultado</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Comunicacion efectiva">
                    <select
                      className={selectCls}
                      value={resultado.comunicacionEfectiva}
                      onChange={(event) =>
                        setResultado((current) => ({
                          ...current,
                          comunicacionEfectiva: event.target.value,
                        }))
                      }
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="SI">Si</option>
                      <option value="NO">No</option>
                    </select>
                  </Field>
                  <Field label="Aceptacion">
                    <select
                      className={selectCls}
                      value={resultado.aceptacion}
                      onChange={(event) =>
                        setResultado((current) => ({ ...current, aceptacion: event.target.value }))
                      }
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="ACEPTA">Acepta</option>
                      <option value="DENIEGA">Deniega</option>
                      <option value="SIN RESPUESTA">Sin respuesta</option>
                    </select>
                  </Field>
                  <Field label="Fecha respuesta">
                    <input
                      type="date"
                      className={inputCls}
                      value={resultado.fechaRespuesta}
                      onChange={(event) =>
                        setResultado((current) => ({
                          ...current,
                          fechaRespuesta: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Observacion">
                    <input
                      className={inputCls}
                      value={resultado.observacion}
                      onChange={(event) =>
                        setResultado((current) => ({ ...current, observacion: event.target.value }))
                      }
                    />
                  </Field>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleRegisterOutcome}
                    className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white"
                    style={{ background: RED }}
                  >
                    <CheckCircle2 size={14} /> Registrar resultado
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
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white"
                    style={{ background: RED }}
                  >
                    <Save size={14} /> Guardar
                  </button>
                  <button
                    type="button"
                    onClick={handleEmailNotification}
                    className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white"
                    style={{ background: RED }}
                  >
                    <Send size={14} /> Enviar comunicacion
                  </button>
                </div>
              </form>
            ) : (
              <HistoricoTable activity={activity} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function HistoricoTable({ activity }: { activity: ActivityRow[] }) {
  return (
    <>
      <SectionTitle>Historico de actividades</SectionTitle>
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

function createAfectacionWordBlob({
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
        <h1>${escapeHtml(form.tipoDocumento.toUpperCase())} DE COMUNICACION DE AFECTACION</h1>
        <p class="right"><b>Nro.:</b> ${escapeHtml(form.numeroDocumento)}<br><b>Fecha:</b> ${escapeHtml(form.fechaEmision)}</p>
        <p><b>Proyecto:</b> ${escapeHtml(projectLabel)}</p>
        <p><b>Predio:</b> ${escapeHtml(predio?.cod || codigo)}</p>
        <p><b>Sujeto pasivo:</b> ${escapeHtml(predio?.suj || "SIN INFORMACION")}</p>
        <p><b>Ubicacion:</b> ${escapeHtml([predio?.ciudad, predio?.proyecto].filter(Boolean).join(" / ") || "Sin informacion")}</p>
        <p><b>Area afectada:</b> ${escapeHtml(predio?.m2 || predio?.area || "Sin informacion")} m2</p>
        <p><b>Asunto:</b> ${escapeHtml(form.asunto)}</p>
        <p>${escapeHtml(form.sustento)}</p>
        <p>Por medio del presente documento se comunica al sujeto pasivo la afectacion del predio indicado, a fin de continuar con el procedimiento de gestion predial correspondiente.</p>
        <p>Se solicita tomar conocimiento de la presente comunicacion y emitir la respuesta que corresponda dentro del plazo aplicable.</p>
        <br><br>
        <p class="signature">____________________________________<br>${escapeHtml(form.responsable)}<br>Responsable predial</p>
      </body>
    </html>`;
  return new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
}

function createPhysicalDeliveryBlob({
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
        <h1>CARGO DE ENTREGA FISICA</h1>
        <p><b>Documento entregado:</b> ${escapeHtml(form.tipoDocumento)} ${escapeHtml(form.numeroDocumento)}</p>
        <p><b>Proyecto:</b> ${escapeHtml(projectLabel)}</p>
        <p><b>Predio:</b> ${escapeHtml(predio?.cod || codigo)}</p>
        <p><b>Sujeto pasivo:</b> ${escapeHtml(predio?.suj || "SIN INFORMACION")}</p>
        <p><b>Fecha de emision:</b> ${escapeHtml(form.fechaEmision)}</p>
        <table>
          <tr><th>Fecha de entrega</th><th>Hora</th><th>Persona que recibe</th><th>DNI</th><th>Firma</th></tr>
          <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
        </table>
        <p><b>Observaciones de entrega:</b></p>
        <p class="box">&nbsp;</p>
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
    table { width: 100%; border-collapse: collapse; margin-top: 14px; }
    th, td { border: 1px solid #9ca3af; padding: 8px; font-size: 10pt; }
    th { background: #f3f4f6; }
    .box { min-height: 90px; border: 1px solid #9ca3af; }
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

function formatFileSize(bytes: number) {
  if (!bytes) return "Tamaño no disponible";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
  const result = await new Promise<Blob | undefined>((resolve, reject) => {
    const transaction = database.transaction(FILE_STORE_NAME, "readonly");
    const request = transaction.objectStore(FILE_STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return result;
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
