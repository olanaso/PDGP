import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  History,
  Save,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/expediente-tasacion")({
  head: () => ({
    meta: [
      { title: "Expediente para tasacion" },
      { name: "description", content: "Generacion de memoria descriptiva, membretes y codificacion de planos para tasacion." },
    ],
  }),
  component: ExpedienteTasacionPage,
});

const RED = "#dc2626";
const inputCls = "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";

type PlanKey = "diagnostico" | "ubicacion" | "perimetrico" | "afectacion" | "distribucion" | "arquitectura";

type PlanRow = {
  key: PlanKey;
  tipo: string;
  fechaLabel: string;
  codigoLabel: string;
  fecha: string;
  codigo: string;
};

type ActivityRow = {
  id: string;
  fecha: string;
  usuario: string;
  actividad: string;
  detalle: string;
};

type SignedFileRow = {
  id: string;
  tipo: "Memoria descriptiva" | "PDF firmado" | "DWG" | "Otro";
  plano?: string;
  version: string;
  archivo: string;
  fecha: string;
  usuario: string;
  estado: string;
};

const PLAN_DEFS: Array<Omit<PlanRow, "fecha" | "codigo"> & { suffix: string }> = [
  {
    key: "diagnostico",
    tipo: "Plano diagnostico",
    fechaLabel: "Fecha de elaboracion del Plano Diagnostico",
    codigoLabel: "Codigo plano diagnostico",
    suffix: "PD",
  },
  {
    key: "ubicacion",
    tipo: "Plano de ubicacion",
    fechaLabel: "Fecha de elaboracion del Plano de Ubicacion",
    codigoLabel: "Codigo plano ubicacion",
    suffix: "PU",
  },
  {
    key: "perimetrico",
    tipo: "Plano perimetrico",
    fechaLabel: "Fecha de elaboracion del Plano Perimetrico",
    codigoLabel: "Codigo plano perimetrico",
    suffix: "PP",
  },
  {
    key: "afectacion",
    tipo: "Plano de afectacion",
    fechaLabel: "Fecha de elaboracion del Plano de Afectacion",
    codigoLabel: "Codigo plano afectacion",
    suffix: "PA",
  },
  {
    key: "distribucion",
    tipo: "Plano de distribucion",
    fechaLabel: "Fecha de elaboracion del Plano de Distribucion",
    codigoLabel: "Codigo plano distribucion",
    suffix: "PDI",
  },
  {
    key: "arquitectura",
    tipo: "Plano de arquitectura",
    fechaLabel: "Fecha de elaboracion del Plano de Arquitectura",
    codigoLabel: "Codigo plano arquitectura",
    suffix: "PARQ",
  },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function ExpedienteTasacionPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}` : projectId;
  const baseCode = (predio?.cod || decodedCodigo).replace(/[^A-Z0-9-]/gi, "").toUpperCase();
  const [activeTab, setActiveTab] = useState<"documentos" | "historico">("documentos");
  const [fechaExpedicion, setFechaExpedicion] = useState(today());
  const [formatoMemoria, setFormatoMemoria] = useState<"word" | "pdf">("word");
  const [profesional, setProfesional] = useState(predio?.rtec || "");
  const [datum, setDatum] = useState("WGS84");
  const [firmaArquitectura, setFirmaArquitectura] = useState("");
  const [message, setMessage] = useState("");
  const [signedFiles, setSignedFiles] = useState<SignedFileRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([
    {
      id: "act-001",
      fecha: "03/07/2026 09:20",
      usuario: "Sistema",
      actividad: "Caracterizacion del predio registrada",
      detalle: "La etapa de expediente para tasacion considera caracterizacion del predio como registrada.",
    },
  ]);
  const [planRows, setPlanRows] = useState<PlanRow[]>(() =>
    PLAN_DEFS.map((plan, index) => ({
      ...plan,
      fecha: today(),
      codigo: `${baseCode}-${plan.suffix}-${String(index + 1).padStart(2, "0")}`,
    })),
  );

  const canGenerateMembretes = useMemo(
    () => planRows.every((plan) => plan.fecha && plan.codigo.trim()),
    [planRows],
  );

  function addActivity(actividad: string, detalle: string) {
    const row: ActivityRow = {
      id: `act-${Date.now()}`,
      fecha: new Date().toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      usuario: "Usuario tecnico",
      actividad,
      detalle,
    };
    setActivity((current) => [row, ...current]);
  }

  function updatePlan(key: PlanKey, field: "fecha" | "codigo", value: string) {
    setPlanRows((current) => current.map((plan) => (plan.key === key ? { ...plan, [field]: value } : plan)));
  }

  function assignPlanCodes() {
    setPlanRows((current) =>
      current.map((plan, index) => ({
        ...plan,
        codigo: plan.codigo.trim() || `${baseCode}-${PLAN_DEFS.find((def) => def.key === plan.key)?.suffix ?? "PL"}-${String(index + 1).padStart(2, "0")}`,
      })),
    );
    addActivity("Asignacion de codificacion", `Se asignaron codigos de planos para el predio ${predio?.cod || decodedCodigo}.`);
    setMessage("Codificacion de planos asignada correctamente.");
  }

  function handleGenerateMemoria() {
    const fileName = `memoria_descriptiva_${baseCode}.${formatoMemoria === "word" ? "doc" : "pdf"}`;
    if (formatoMemoria === "word") {
      downloadBlobFile(fileName, createMemoriaWordBlob({ fechaExpedicion, predio, codigo: decodedCodigo, projectLabel }));
    } else {
      downloadBlobFile(fileName, createMemoriaPdfBlob({ fechaExpedicion, predio, codigo: decodedCodigo, projectLabel }));
    }
    addActivity("Generacion de memoria descriptiva", `Documento emitido en formato ${formatoMemoria.toUpperCase()} con fecha ${fechaExpedicion}.`);
    setMessage("Memoria descriptiva generada correctamente.");
  }

  function handleGenerateMembretes() {
    downloadBlobFile(
      `membretes_autocad_${baseCode}.xls`,
      createMembretesExcelBlob({ planRows, predio, codigo: decodedCodigo, profesional, datum, firmaArquitectura }),
    );
    addActivity("Generacion de membretes", "Se genero archivo Excel para Data Link de AutoCAD.");
    setMessage("Membretes para planos generados correctamente.");
  }

  function handleSignedUpload(tipo: SignedFileRow["tipo"], file: File | null, plano?: string) {
    if (!file) return;
    const previousCount = signedFiles.filter((item) => item.tipo === tipo && item.plano === plano).length;
    const row: SignedFileRow = {
      id: `signed-${Date.now()}-${tipo}-${plano ?? "memoria"}`,
      tipo,
      plano,
      version: `v${previousCount + 1}`,
      archivo: file.name,
      fecha: new Date().toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      usuario: "Usuario tecnico",
      estado: "Firmado y cargado",
    };
    setSignedFiles((current) => [row, ...current]);
    addActivity(
      `Carga de ${tipo.toLowerCase()}`,
      `Se cargo ${plano ? `${tipo} para ${plano}` : tipo} (${file.name}) como ${row.version}.`,
    );
    setMessage(`${plano ? `${tipo} de ${plano}` : tipo} cargado correctamente y versionado como ${row.version}.`);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Exp. para la tasacion"
        badgeLabel="Predio"
        badgeValue={predio?.cod || decodedCodigo}
        badgeSuffix="Caracterizacion registrada"
      />

      <main className="p-4">
        <div className="bg-white rounded border">
          <div className="px-5 py-5">
            <div className="border-b mb-3">
              <button
                type="button"
                onClick={() => setActiveTab("documentos")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border-b-2"
                style={{ borderColor: activeTab === "documentos" ? RED : "transparent", color: activeTab === "documentos" ? RED : "#6b7280" }}
              >
                <FileText size={14} /> Documentos y planos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("historico")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border-b-2"
                style={{ borderColor: activeTab === "historico" ? RED : "transparent", color: activeTab === "historico" ? RED : "#6b7280" }}
              >
                <History size={14} /> Historico ({activity.length})
              </button>
            </div>

            {activeTab === "documentos" ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  addActivity("Actualizacion de expediente", "Se guardaron los datos del expediente para tasacion.");
                  setMessage("Datos del expediente para tasacion guardados.");
                }}
              >
                <SectionTitle>Estado del tramite</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Codigo de predio">
                    <input className={inputCls} value={predio?.cod || decodedCodigo} readOnly />
                  </Field>
                  <Field label="Caracterizacion">
                    <input className={inputCls} value="Registrada" readOnly />
                  </Field>
                  <Field label="Sujeto pasivo">
                    <input className={inputCls} value={predio?.suj || "Sin informacion"} readOnly />
                  </Field>
                  <Field label="Area m2">
                    <input className={inputCls} value={predio?.area || predio?.m2 || "Sin informacion"} readOnly />
                  </Field>
                </div>

                <SectionTitle>Generar memoria descriptiva</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Fecha de expedicion" required>
                    <input className={inputCls} type="date" value={fechaExpedicion} onChange={(event) => setFechaExpedicion(event.target.value)} />
                  </Field>
                  <Field label="Formato" required>
                    <select className={selectCls} value={formatoMemoria} onChange={(event) => setFormatoMemoria(event.target.value as "word" | "pdf")}>
                      <option value="word">Word</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </Field>
                  <div className="col-span-2 grid grid-cols-3 gap-3">
                    <ActionTile
                      icon={Download}
                      title="Generar memoria"
                      description={`Emitir ${formatoMemoria.toUpperCase()} con fecha de expedicion`}
                      onClick={handleGenerateMemoria}
                    />
                    <SignedUploadTile
                      icon={Upload}
                      title="Subir memoria firmada"
                      description="PDF final firmado y enviado"
                      onFile={(file) => handleSignedUpload("Memoria descriptiva", file)}
                      accept="application/pdf,.pdf"
                    />
                    <ActionTile
                      icon={FileSpreadsheet}
                      title="Generar membretes"
                      description="Excel para AutoCAD Data Link"
                      onClick={handleGenerateMembretes}
                      disabled={!canGenerateMembretes}
                    />
                  </div>
                </div>

                <SectionTitle>Datos de los planos</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Profesional tecnico responsable de firmar planos">
                    <input className={inputCls} value={profesional} onChange={(event) => setProfesional(event.target.value)} />
                  </Field>
                  <Field label="Datum de los planos">
                    <select className={selectCls} value={datum} onChange={(event) => setDatum(event.target.value)}>
                      <option value="WGS84">WGS84</option>
                      <option value="PSAD56">PSAD56</option>
                      <option value="LOCAL">LOCAL</option>
                    </select>
                  </Field>
                </div>

                <div className="mt-3 overflow-hidden rounded border border-gray-200">
                  <table className="w-full text-[11px]">
                    <thead className="bg-[#f3f4f6] text-left text-gray-700">
                      <tr>
                        <th className="px-2 py-2 font-semibold">Tipo de plano</th>
                        <th className="px-2 py-2 font-semibold">Fecha de elaboracion</th>
                        <th className="px-2 py-2 font-semibold">Codigo del plano</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planRows.map((plan) => (
                        <tr key={plan.key} className="border-t border-gray-100">
                          <td className="px-2 py-1.5">
                            <div className="font-medium">{plan.tipo}</div>
                            <div className="text-[10px] text-gray-500">{plan.fechaLabel}</div>
                          </td>
                          <td className="px-2 py-1.5">
                            <input className={inputCls} type="date" value={plan.fecha} onChange={(event) => updatePlan(plan.key, "fecha", event.target.value)} />
                          </td>
                          <td className="px-2 py-1.5">
                            <input className={inputCls} value={plan.codigo} onChange={(event) => updatePlan(plan.key, "codigo", event.target.value)} placeholder={plan.codigoLabel} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3">
                  <Field label="Firma plano arquitectura">
                    <input className={inputCls} value={firmaArquitectura} onChange={(event) => setFirmaArquitectura(event.target.value)} />
                  </Field>
                  <Field label="Membretes AutoCAD">
                    <input className={inputCls} value="Disponible en los botones principales de generacion." readOnly />
                  </Field>
                </div>

                <SectionTitle>Codificacion y archivos finales</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Codificacion de planos">
                    <button
                      type="button"
                      onClick={assignPlanCodes}
                      className="inline-flex h-8 items-center gap-1.5 px-3 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <Save size={14} /> Generar o asignar codificacion
                    </button>
                  </Field>
                  <Field label="Carga DWG/PDF">
                    <input className={inputCls} value="Pendiente: los archivos finales se cargaran y versionaran en esta etapa." readOnly />
                  </Field>
                </div>

                <SectionTitle>Finales firmados y versionados</SectionTitle>
                <div className="space-y-3">
                  <div className="overflow-hidden rounded border border-gray-200">
                    <table className="w-full text-[11px]">
                      <thead className="bg-[#f3f4f6] text-left text-gray-700">
                        <tr>
                          <th className="px-2 py-2 font-semibold">Tipo de plano</th>
                          <th className="px-2 py-2 font-semibold">Codigo</th>
                          <th className="px-2 py-2 font-semibold">PDF firmado</th>
                          <th className="px-2 py-2 font-semibold">DWG</th>
                          <th className="px-2 py-2 font-semibold">Otro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planRows.map((plan) => (
                          <tr key={`${plan.key}-uploads`} className="border-t border-gray-100">
                            <td className="px-2 py-1.5 font-medium">{plan.tipo}</td>
                            <td className="px-2 py-1.5 font-mono">{plan.codigo}</td>
                            <td className="px-2 py-1.5">
                              <InlineUploadButton
                                label="PDF firmado"
                                accept="application/pdf,.pdf"
                                onFile={(file) => handleSignedUpload("PDF firmado", file, plan.tipo)}
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <InlineUploadButton
                                label="DWG"
                                accept=".dwg,application/acad,application/x-acad,application/autocad_dwg,image/vnd.dwg"
                                onFile={(file) => handleSignedUpload("DWG", file, plan.tipo)}
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <InlineUploadButton
                                label="Otro"
                                accept=".pdf,.dwg,.dxf,.zip,.rar,.7z,.xlsx,.xls,.doc,.docx"
                                onFile={(file) => handleSignedUpload("Otro", file, plan.tipo)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded border border-gray-200 overflow-hidden">
                    <table className="w-full text-[11px]">
                      <thead className="bg-[#f3f4f6] text-left text-gray-700">
                        <tr>
                          <th className="px-2 py-2 font-semibold">Plano</th>
                          <th className="px-2 py-2 font-semibold">Tipo</th>
                          <th className="px-2 py-2 font-semibold">Version</th>
                          <th className="px-2 py-2 font-semibold">Archivo</th>
                          <th className="px-2 py-2 font-semibold">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {signedFiles.map((file) => (
                          <tr key={file.id} className="border-t border-gray-100">
                            <td className="px-2 py-1.5">{file.plano ?? "Memoria descriptiva"}</td>
                            <td className="px-2 py-1.5">{file.tipo}</td>
                            <td className="px-2 py-1.5 font-semibold text-[#dc2626]">{file.version}</td>
                            <td className="px-2 py-1.5 font-mono">{file.archivo}</td>
                            <td className="px-2 py-1.5">{file.fecha}</td>
                          </tr>
                        ))}
                        {!signedFiles.length && (
                          <tr>
                            <td colSpan={5} className="px-3 py-5 text-center text-gray-400">
                              Sin archivos finales firmados cargados.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {message && (
                  <div className="mt-4 flex items-start gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-[12px] text-green-900">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => history.back()}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <X size={14} /> Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded"
                    style={{ background: RED }}
                  >
                    <Save size={14} /> Guardar expediente
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b pb-1 mb-3 mt-4 first:mt-0">
      <h3 className="text-[13px] font-semibold" style={{ color: RED }}>{children}</h3>
    </div>
  );
}

function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-[180px_1fr] items-center gap-2 ${className}`}>
      <label className="text-[12px] text-right text-gray-700">
        {required && <span style={{ color: RED }}>* </span>}{label}
      </label>
      {children}
    </div>
  );
}

function ActionTile({
  icon: Icon,
  title,
  description,
  onClick,
  disabled,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-[116px] flex-col items-start justify-between rounded border-2 border-[#dc2626] bg-white p-3 text-left shadow-sm hover:bg-[#fef2f2] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex size-9 items-center justify-center rounded bg-[#dc2626] text-white">
        <Icon size={18} />
      </span>
      <span>
        <span className="block text-[13px] font-semibold text-[#111827]">{title}</span>
        <span className="mt-1 block text-[11px] leading-snug text-gray-500">{description}</span>
      </span>
    </button>
  );
}

function SignedUploadTile({
  icon: Icon,
  title,
  description,
  onFile,
  accept = "application/pdf,.pdf",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onFile: (file: File | null) => void;
  accept?: string;
}) {
  return (
    <label className="flex min-h-[116px] cursor-pointer flex-col items-start justify-between rounded border-2 border-dashed border-[#dc2626] bg-[#fffafa] p-3 text-left shadow-sm hover:bg-[#fef2f2]">
      <span className="flex size-9 items-center justify-center rounded bg-white text-[#dc2626] ring-1 ring-[#fecaca]">
        <Icon size={18} />
      </span>
      <span>
        <span className="block text-[13px] font-semibold text-[#111827]">{title}</span>
        <span className="mt-1 block text-[11px] leading-snug text-gray-500">{description}</span>
      </span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          onFile(event.target.files?.[0] ?? null);
          event.currentTarget.value = "";
        }}
      />
    </label>
  );
}

function InlineUploadButton({
  label,
  accept,
  onFile,
}: {
  label: string;
  accept: string;
  onFile: (file: File | null) => void;
}) {
  return (
    <label className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded border border-gray-300 bg-white px-2 text-[11px] hover:bg-gray-50">
      <Upload size={12} className="text-[#dc2626]" />
      <span>{label}</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          onFile(event.target.files?.[0] ?? null);
          event.currentTarget.value = "";
        }}
      />
    </label>
  );
}

function HistoryTable({ activity }: { activity: ActivityRow[] }) {
  return (
    <>
      <SectionTitle>Historico de actividades</SectionTitle>
      <div className="overflow-hidden rounded border border-gray-200">
        <table className="w-full text-[12px]">
          <thead className="bg-[#f3f4f6] text-left text-gray-700">
            <tr>
              <th className="px-3 py-2 font-semibold">Fecha</th>
              <th className="px-3 py-2 font-semibold">Usuario</th>
              <th className="px-3 py-2 font-semibold">Actividad</th>
              <th className="px-3 py-2 font-semibold">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((row) => (
              <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">{row.fecha}</td>
                <td className="px-3 py-2">{row.usuario}</td>
                <td className="px-3 py-2 font-medium">{row.actividad}</td>
                <td className="px-3 py-2 text-gray-600">{row.detalle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function createMemoriaWordBlob({
  fechaExpedicion,
  predio,
  codigo,
  projectLabel,
}: {
  fechaExpedicion: string;
  predio: ReturnType<typeof getPredioByCodigo>;
  codigo: string;
  projectLabel: string;
}) {
  const html = `<!doctype html>
<html>
  <head><meta charset="UTF-8" /></head>
  <body style="font-family: Arial; font-size: 10pt; color: #000;">
    <h2>MEMORIA DESCRIPTIVA</h2>
    <p><b>Fecha de expedicion:</b> ${escapeHtml(fechaExpedicion)}</p>
    <p><b>Proyecto:</b> ${escapeHtml(projectLabel)}</p>
    <p><b>Codigo de predio:</b> ${escapeHtml(predio?.cod || codigo)}</p>
    <p><b>Sujeto pasivo:</b> ${escapeHtml(predio?.suj || "Sin informacion")}</p>
    <p><b>Tipo de predio:</b> ${escapeHtml(predio?.tipo || predio?.tp || "Sin informacion")}</p>
    <p><b>Area afectada:</b> ${escapeHtml(predio?.area || predio?.m2 || "Sin informacion")} m2</p>
    <p>El presente documento se emite para conformar el expediente para tasacion, considerando la caracterizacion del predio registrada en el sistema.</p>
  </body>
</html>`;
  return new Blob([html], { type: "application/msword;charset=utf-8" });
}

function createMemoriaPdfBlob({
  fechaExpedicion,
  predio,
  codigo,
  projectLabel,
}: {
  fechaExpedicion: string;
  predio: ReturnType<typeof getPredioByCodigo>;
  codigo: string;
  projectLabel: string;
}) {
  const lines = [
    "MEMORIA DESCRIPTIVA",
    `Fecha de expedicion: ${fechaExpedicion}`,
    `Proyecto: ${projectLabel}`,
    `Codigo de predio: ${predio?.cod || codigo}`,
    `Sujeto pasivo: ${predio?.suj || "Sin informacion"}`,
    `Tipo de predio: ${predio?.tipo || predio?.tp || "Sin informacion"}`,
    `Area afectada: ${predio?.area || predio?.m2 || "Sin informacion"} m2`,
    "Documento generado para expediente de tasacion.",
  ];
  return createSimplePdfBlob(lines);
}

function createMembretesExcelBlob({
  planRows,
  predio,
  codigo,
  profesional,
  datum,
  firmaArquitectura,
}: {
  planRows: PlanRow[];
  predio: ReturnType<typeof getPredioByCodigo>;
  codigo: string;
  profesional: string;
  datum: string;
  firmaArquitectura: string;
}) {
  const headers = [
    "tipo_plano",
    "fecha_elaboracion",
    "codigo_plano",
    "codigo_predio",
    "sujeto_pasivo",
    "area_m2",
    "datum",
    "profesional_tecnico",
    "firma_plano_arquitectura",
  ];
  const rows = planRows.map((plan) => [
    plan.tipo,
    plan.fecha,
    plan.codigo,
    predio?.cod || codigo,
    predio?.suj || "",
    predio?.area || predio?.m2 || "",
    datum,
    profesional,
    firmaArquitectura,
  ]);
  const html = `<!doctype html>
<html>
  <head><meta charset="UTF-8" /></head>
  <body>
    <table border="1">
      <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  </body>
</html>`;
  return new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
}

function createSimplePdfBlob(lines: string[]) {
  const contentLines = lines.map((line, index) => `BT /F1 11 Tf 50 ${780 - index * 18} Td (${escapePdf(line)}) Tj ET`).join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${contentLines.length} >> stream\n${contentLines}\nendstream endobj`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function downloadBlobFile(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapePdf(value: string) {
  return String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
