import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  FileText,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute(
  "/proyectos/$projectId/predios/$codigo/empadronamiento-inspeccion-campo",
)({
  head: () => ({
    meta: [
      { title: "Empadronamiento e inspección de campo" },
      {
        name: "description",
        content:
          "Registro del empadronamiento, inspección de campo y actas correspondientes al predio.",
      },
    ],
  }),
  component: EmpadronamientoInspeccionCampoPage,
});

const RED = "#dc2626";
const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] text-gray-800 outline-none transition focus:border-[#dc2626] focus:ring-1 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";
const textareaCls =
  "w-full rounded border border-gray-300 bg-white p-2 text-[12px] text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#dc2626] focus:ring-1 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";

type ActaRow = {
  id: string;
  numero: string;
  description: string;
  fileName: string;
  size: number;
  file: File;
};

type Feedback = {
  kind: "success" | "error";
  text: string;
};

const initialForm = {
  conEmpadronamiento: false,
  fechaInicio: "",
  fechaFin: "",
  ocupante: "",
  documentoOcupante: "",
  condicionOcupante: "",
  caracteristicasPredio: "",
  edificaciones: "",
  mejoras: "",
  observaciones: "",
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-4 border-b border-red-100 pb-1 first:mt-0">
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
  alignStart = false,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  alignStart?: boolean;
}) {
  return (
    <div
      className={`grid gap-1.5 sm:grid-cols-[180px_minmax(0,1fr)] ${
        alignStart ? "sm:items-start" : "sm:items-center"
      } ${className}`}
    >
      <label className={`text-[12px] text-gray-700 sm:text-right ${alignStart ? "sm:pt-2" : ""}`}>
        {required && <span style={{ color: RED }}>* </span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[10px] font-medium text-gray-600">{label}</span>
      <input className={`${inputCls} bg-gray-50`} value={value || "—"} readOnly />
    </label>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileDescription(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
}

function todayInPeru() {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Lima",
  }).format(new Date());
}

function EmpadronamientoInspeccionCampoPage() {
  const { projectId, codigo } = Route.useParams();
  const navigate = useNavigate();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;

  const [form, setForm] = useState(initialForm);
  const [actas, setActas] = useState<ActaRow[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    setForm(initialForm);
    setActas([]);
    setFeedback(null);
  }, [decodedCodigo]);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFeedback(null);
  }

  function addActas(files: FileList | null) {
    if (!files?.length) return;

    const timestamp = Date.now();
    const newActas = Array.from(files).map((file, index) => ({
      id: `${timestamp}-${index}-${file.name}`,
      numero: "",
      description: fileDescription(file.name),
      fileName: file.name,
      size: file.size,
      file,
    }));

    setActas((current) => [...current, ...newActas]);
    setFeedback(null);
  }

  function updateActa(id: string, key: "numero" | "description", value: string) {
    setActas((current) =>
      current.map((acta) => (acta.id === id ? { ...acta, [key]: value } : acta)),
    );
    setFeedback(null);
  }

  function removeActa(id: string) {
    setActas((current) => current.filter((acta) => acta.id !== id));
    setFeedback(null);
  }

  function handleGenerateActa() {
    const predioCode = predio?.cod || decodedCodigo;
    const safeCode = predioCode.replace(/[^A-Z0-9-]/gi, "").toUpperCase() || "PREDIO";
    const blob = createActaEmpadronamientoWordBlob({
      form,
      predio,
      predioCode,
      projectLabel,
    });

    downloadBlobFile(`acta_empadronamiento_${safeCode}.doc`, blob);
    setFeedback({
      kind: "success",
      text: "Acta de empadronamiento generada correctamente en formato Word.",
    });
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Empadronamiento e inspección de campo"
        badgeLabel="Predio"
        badgeValue={predio?.cod || decodedCodigo}
        badgeSuffix="Información base 1.5"
      />

      <main className="mx-auto max-w-[1500px] p-4">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();

            if (!form.conEmpadronamiento) {
              setFeedback({
                kind: "error",
                text: "Confirme que el predio cuenta con empadronamiento antes de guardar.",
              });
              return;
            }

            if (form.fechaFin < form.fechaInicio) {
              setFeedback({
                kind: "error",
                text: "La fecha final no puede ser anterior a la fecha inicial del empadronamiento.",
              });
              return;
            }

            if (!actas.length) {
              setFeedback({
                kind: "error",
                text: "Adjunte por lo menos un acta de empadronamiento.",
              });
              return;
            }

            if (actas.some((acta) => !acta.description.trim())) {
              setFeedback({
                kind: "error",
                text: "Todas las actas deben tener una descripción.",
              });
              return;
            }

            setFeedback({
              kind: "success",
              text: "El empadronamiento y las actas se guardaron correctamente.",
            });
          }}
        >
          <section className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
            <header className="mx-4 mt-3 flex flex-wrap items-center gap-2 border-b border-red-200 pb-2 text-[#ef4444]">
              <h2 className="text-[13px] font-semibold">Información del predio</h2>
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-gray-500">
                Informativo · Solo lectura
              </span>
            </header>

            <div className="p-4">
              <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
                <ReadOnlyField
                  label="Tipo de infraestructura"
                  value={proyecto?.tipo?.toUpperCase() ?? ""}
                />
                <ReadOnlyField
                  label="Grupo"
                  value={proyecto?.coordinacionGeneral?.toUpperCase() ?? ""}
                />
                <ReadOnlyField label="Proyecto" value={projectLabel.toUpperCase()} />
                <ReadOnlyField label="Fecha actual" value={todayInPeru()} />
                <ReadOnlyField label="Código de predio" value={predio?.cod || decodedCodigo} />
                <ReadOnlyField label="Expediente" value={predio?.exp ?? ""} />
                <ReadOnlyField label="Sección funcional" value={predio?.et ?? ""} />
                <ReadOnlyField
                  label="Coordinación"
                  value={proyecto?.coordinacionPredial?.toUpperCase() ?? ""}
                />
              </div>

              <div className="mt-4 overflow-hidden rounded border border-gray-200">
                <div className="grid grid-cols-[160px_1fr_1fr] bg-gray-50 text-center text-[10px] font-medium text-gray-700">
                  <div className="border-r border-gray-200 px-3 py-2" />
                  <div className="border-r border-gray-200 px-3 py-2">Profesional legal</div>
                  <div className="px-3 py-2">Profesional técnico</div>
                </div>
                <div className="grid grid-cols-[160px_1fr_1fr] items-center border-t border-gray-200 text-[10px]">
                  <div className="border-r border-gray-200 px-3 py-3 text-gray-600">
                    Responsables
                  </div>
                  <div className="border-r border-gray-200 p-2">
                    <input
                      className={`${inputCls} bg-gray-50`}
                      value={predio?.rlegal || "Pendiente de asignación"}
                      readOnly
                    />
                  </div>
                  <div className="p-2">
                    <input
                      className={`${inputCls} bg-gray-50`}
                      value={predio?.rtec || "Pendiente de asignación"}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {feedback && (
            <div
              role="status"
              className={`flex items-center gap-2 rounded border px-3 py-2 text-[11px] ${
                feedback.kind === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {feedback.kind === "success" ? (
                <CheckCircle2 size={15} className="shrink-0" />
              ) : (
                <AlertCircle size={15} className="shrink-0" />
              )}
              {feedback.text}
            </div>
          )}

          <div className="grid gap-4 2xl:grid-cols-[minmax(0,0.95fr)_minmax(440px,1.05fr)]">
            <section className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
              <header className="mx-4 mt-3 border-b border-red-200 pb-2 text-[#ef4444]">
                <h2 className="text-[11px] font-semibold uppercase tracking-wide">
                  Empadronamiento
                </h2>
              </header>

              <div className="p-4">
                <SectionTitle>Control del empadronamiento</SectionTitle>
                <div className="space-y-2">
                  <Field label="Con empadronamiento" required>
                    <label className="inline-flex min-h-8 items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 text-[11px] text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.conEmpadronamiento}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setForm((current) => ({
                            ...current,
                            conEmpadronamiento: checked,
                            fechaInicio: checked ? current.fechaInicio : "",
                            fechaFin: checked ? current.fechaFin : "",
                          }));
                          setFeedback(null);
                        }}
                        className="size-4 accent-[#dc2626]"
                      />
                      Sí, el predio cuenta con empadronamiento
                    </label>
                  </Field>
                  <Field label="Fecha de empadronamiento" required>
                    <input
                      type="date"
                      required={form.conEmpadronamiento}
                      disabled={!form.conEmpadronamiento}
                      className={inputCls}
                      value={form.fechaInicio}
                      onChange={(event) => setField("fechaInicio", event.target.value)}
                    />
                  </Field>
                  <Field label="Fecha fin del empadronamiento" required>
                    <input
                      type="date"
                      required={form.conEmpadronamiento}
                      disabled={!form.conEmpadronamiento}
                      className={inputCls}
                      value={form.fechaFin}
                      onChange={(event) => setField("fechaFin", event.target.value)}
                    />
                  </Field>
                </div>

                <SectionTitle>Datos de la inspección de campo</SectionTitle>
                <div className="space-y-2">
                  <Field label="Ocupante encontrado">
                    <input
                      disabled={!form.conEmpadronamiento}
                      className={inputCls}
                      placeholder="Apellidos y nombres"
                      value={form.ocupante}
                      onChange={(event) => setField("ocupante", event.target.value)}
                    />
                  </Field>
                  <Field label="DNI / documento">
                    <input
                      disabled={!form.conEmpadronamiento}
                      className={inputCls}
                      placeholder="Documento del ocupante"
                      value={form.documentoOcupante}
                      onChange={(event) => setField("documentoOcupante", event.target.value)}
                    />
                  </Field>
                  <Field label="Condición del ocupante">
                    <select
                      disabled={!form.conEmpadronamiento}
                      className={inputCls}
                      value={form.condicionOcupante}
                      onChange={(event) => setField("condicionOcupante", event.target.value)}
                    >
                      <option value="">-- SELECCIONE --</option>
                      <option>PROPIETARIO</option>
                      <option>POSEEDOR</option>
                      <option>ARRENDATARIO</option>
                      <option>OCUPANTE</option>
                      <option>OTRO</option>
                    </select>
                  </Field>
                  <Field label="Características del predio" alignStart>
                    <textarea
                      rows={3}
                      disabled={!form.conEmpadronamiento}
                      className={textareaCls}
                      placeholder="Uso actual, materiales, estado de conservación y otras características."
                      value={form.caracteristicasPredio}
                      onChange={(event) => setField("caracteristicasPredio", event.target.value)}
                    />
                  </Field>
                  <Field label="Edificaciones" alignStart>
                    <textarea
                      rows={2}
                      disabled={!form.conEmpadronamiento}
                      className={textareaCls}
                      placeholder="Descripción de edificaciones encontradas."
                      value={form.edificaciones}
                      onChange={(event) => setField("edificaciones", event.target.value)}
                    />
                  </Field>
                  <Field label="Mejoras" alignStart>
                    <textarea
                      rows={2}
                      disabled={!form.conEmpadronamiento}
                      className={textareaCls}
                      placeholder="Cultivos, cercos, instalaciones u otras mejoras."
                      value={form.mejoras}
                      onChange={(event) => setField("mejoras", event.target.value)}
                    />
                  </Field>
                  <Field label="Observaciones de campo" alignStart>
                    <textarea
                      rows={3}
                      disabled={!form.conEmpadronamiento}
                      className={textareaCls}
                      value={form.observaciones}
                      onChange={(event) => setField("observaciones", event.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section className="self-start overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
              <header className="mx-3 mt-3 flex flex-wrap items-center justify-between gap-3 border-b border-red-200 pb-2">
                <div>
                  <h2 className="text-[11px] font-semibold uppercase tracking-wide text-[#ef4444]">
                    Actas de empadronamiento
                  </h2>
                  <p className="mt-0.5 text-[9px] text-gray-500">
                    Documentos suscritos durante la visita de campo
                  </p>
                </div>
                <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded bg-[#dc2626] px-3 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#b91c1c]">
                  <Plus size={14} /> Subir acta
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,image/*"
                    className="sr-only"
                    onChange={(event) => {
                      addActas(event.target.files);
                      event.target.value = "";
                    }}
                  />
                </label>
              </header>

              <div className="p-3">
                {actas.length === 0 ? (
                  <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition hover:border-red-300 hover:bg-red-50/30">
                    <span className="grid size-11 place-items-center rounded-full bg-white text-[#dc2626] shadow-sm">
                      <Upload size={20} />
                    </span>
                    <span className="mt-3 text-[12px] font-semibold text-gray-700">
                      Adjunte las actas de empadronamiento
                    </span>
                    <span className="mt-1 max-w-xs text-[10px] leading-4 text-gray-500">
                      Puede seleccionar una o varias actas firmadas en PDF, Word o imagen.
                    </span>
                    <span className="mt-3 rounded border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-medium text-gray-600">
                      Seleccionar archivos
                    </span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,image/*"
                      className="sr-only"
                      onChange={(event) => {
                        addActas(event.target.files);
                        event.target.value = "";
                      }}
                    />
                  </label>
                ) : (
                  <div className="overflow-x-auto rounded border border-gray-200">
                    <table className="w-full min-w-[680px] border-collapse text-left">
                      <thead>
                        <tr className="bg-gray-50 text-[9px] uppercase tracking-wide text-gray-600">
                          <th className="w-10 px-3 py-2 text-center">N.°</th>
                          <th className="w-36 px-3 py-2">Número de acta</th>
                          <th className="px-3 py-2">Descripción</th>
                          <th className="w-48 px-3 py-2">Archivo</th>
                          <th className="w-20 px-3 py-2 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {actas.map((acta, index) => (
                          <tr key={acta.id} className="border-t border-gray-200 align-top">
                            <td className="px-3 py-3 text-center text-[11px] font-semibold text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-3 py-2">
                              <input
                                aria-label={`Número del acta ${index + 1}`}
                                className={inputCls}
                                placeholder="ACTA-001"
                                value={acta.numero}
                                onChange={(event) =>
                                  updateActa(acta.id, "numero", event.target.value)
                                }
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                aria-label={`Descripción del acta ${index + 1}`}
                                className={inputCls}
                                value={acta.description}
                                onChange={(event) =>
                                  updateActa(acta.id, "description", event.target.value)
                                }
                              />
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex min-w-0 items-start gap-2">
                                <FileCheck2 size={15} className="mt-0.5 shrink-0 text-[#dc2626]" />
                                <div className="min-w-0">
                                  <p
                                    className="truncate text-[10px] font-medium text-gray-700"
                                    title={acta.fileName}
                                  >
                                    {acta.fileName}
                                  </p>
                                  <p className="mt-0.5 text-[9px] text-gray-400">
                                    {formatFileSize(acta.size)}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeActa(acta.id)}
                                title="Eliminar acta"
                                className="inline-grid size-8 place-items-center rounded border border-red-200 text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-3 flex items-start gap-2 rounded bg-gray-50 px-3 py-2 text-[10px] leading-4 text-gray-500">
                  <FileText size={14} className="mt-0.5 shrink-0 text-[#dc2626]" />
                  Registre el número y una descripción que permitan identificar cada acta antes de
                  guardar.
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[10px] text-gray-500">
              Los campos marcados con <span className="text-[#dc2626]">*</span> son obligatorios.
            </p>
            <button
              type="button"
              onClick={handleGenerateActa}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-[#dc2626] bg-white px-4 text-[12px] font-medium text-[#dc2626] transition hover:bg-red-50"
            >
              <FileText size={14} /> Generar acta
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/proyectos/$projectId/predios/$codigo/identificacion-codificacion",
                    params: { projectId, codigo: decodedCodigo },
                  })
                }
                className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 px-4 text-[12px] text-gray-700 transition hover:bg-gray-50"
              >
                <X size={14} /> Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-4 text-[12px] font-medium text-white transition hover:bg-[#b91c1c]"
              >
                <Save size={14} /> Guardar empadronamiento
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

function createActaEmpadronamientoWordBlob({
  form,
  predio,
  predioCode,
  projectLabel,
}: {
  form: typeof initialForm;
  predio: ReturnType<typeof getPredioByCodigo>;
  predioCode: string;
  projectLabel: string;
}) {
  const fechaInicio = formatActaDate(form.fechaInicio);
  const fechaFin = formatActaDate(form.fechaFin);
  const html = `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="UTF-8" />
    <title>Acta de empadronamiento</title>
    <style>
      @page { size: A4; margin: 2cm 2.2cm; }
      body { font-family: Arial, sans-serif; color: #111827; font-size: 10.5pt; line-height: 1.45; }
      h1 { margin: 18px 0 6px; text-align: center; font-size: 15pt; }
      h2 { margin: 18px 0 8px; border-bottom: 1px solid #dc2626; padding-bottom: 4px; color: #b91c1c; font-size: 11pt; }
      p { margin: 7px 0; text-align: justify; }
      .institution { text-align: center; font-size: 9pt; font-weight: bold; }
      .subtitle { margin-bottom: 18px; text-align: center; font-size: 9pt; }
      table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; }
      th, td { border: 1px solid #d1d5db; padding: 6px 8px; vertical-align: top; }
      th { width: 32%; background: #f3f4f6; text-align: left; font-weight: bold; }
      .signature td { height: 82px; border: 0; padding: 42px 10px 0; text-align: center; vertical-align: bottom; }
      .signature-line { border-top: 1px solid #111827; padding-top: 5px; }
      .footer { margin-top: 24px; color: #6b7280; text-align: center; font-size: 8pt; }
    </style>
  </head>
  <body>
    <div class="institution">MINISTERIO DE TRANSPORTES Y COMUNICACIONES</div>
    <h1>ACTA DE EMPADRONAMIENTO E INSPECCIÓN DE CAMPO</h1>
    <div class="subtitle">Predio ${escapeActaHtml(predioCode)}</div>

    <p>
      En la fecha ${escapeActaHtml(fechaInicio)}, se realizó el empadronamiento y la inspección de
      campo del predio identificado con código <b>${escapeActaHtml(predioCode)}</b>, correspondiente
      al proyecto <b>${escapeActaHtml(projectLabel)}</b>. La presente acta deja constancia de la
      información encontrada durante la diligencia.
    </p>

    <h2>1. Identificación del predio</h2>
    <table>
      <tr><th>Proyecto</th><td>${escapeActaHtml(projectLabel)}</td></tr>
      <tr><th>Código del predio</th><td>${escapeActaHtml(predioCode)}</td></tr>
      <tr><th>Expediente</th><td>${escapeActaHtml(predio?.exp || "No consignado")}</td></tr>
      <tr><th>Sujeto pasivo</th><td>${escapeActaHtml(predio?.suj || "No consignado")}</td></tr>
      <tr><th>Tipo de predio</th><td>${escapeActaHtml(predio?.tipo || predio?.tp || "No consignado")}</td></tr>
      <tr><th>Área afectada</th><td>${escapeActaHtml(predio?.area || predio?.m2 || "No consignada")} m²</td></tr>
      <tr><th>Ubicación</th><td>${escapeActaHtml(predio?.ciudad || "No consignada")}</td></tr>
    </table>

    <h2>2. Control del empadronamiento</h2>
    <table>
      <tr><th>Cuenta con empadronamiento</th><td>${form.conEmpadronamiento ? "Sí" : "No"}</td></tr>
      <tr><th>Fecha de inicio</th><td>${escapeActaHtml(fechaInicio)}</td></tr>
      <tr><th>Fecha de término</th><td>${escapeActaHtml(fechaFin)}</td></tr>
    </table>

    <h2>3. Datos de la inspección de campo</h2>
    <table>
      <tr><th>Ocupante encontrado</th><td>${escapeActaHtml(form.ocupante || "No consignado")}</td></tr>
      <tr><th>DNI / documento</th><td>${escapeActaHtml(form.documentoOcupante || "No consignado")}</td></tr>
      <tr><th>Condición del ocupante</th><td>${escapeActaHtml(form.condicionOcupante || "No consignada")}</td></tr>
      <tr><th>Características del predio</th><td>${escapeActaHtml(form.caracteristicasPredio || "No consignadas")}</td></tr>
      <tr><th>Edificaciones</th><td>${escapeActaHtml(form.edificaciones || "No se registraron edificaciones")}</td></tr>
      <tr><th>Mejoras</th><td>${escapeActaHtml(form.mejoras || "No se registraron mejoras")}</td></tr>
      <tr><th>Observaciones de campo</th><td>${escapeActaHtml(form.observaciones || "Sin observaciones")}</td></tr>
    </table>

    <p>
      Leída la presente acta y encontrándola conforme, los participantes la suscriben para constancia
      de la diligencia de empadronamiento e inspección de campo realizada.
    </p>

    <table class="signature">
      <tr>
        <td><div class="signature-line"><b>${escapeActaHtml(predio?.rtec || "Profesional técnico")}</b><br />Responsable técnico</div></td>
        <td><div class="signature-line"><b>${escapeActaHtml(predio?.rlegal || "Profesional legal")}</b><br />Responsable legal</div></td>
        <td><div class="signature-line"><b>${escapeActaHtml(form.ocupante || "Ocupante")}</b><br />Ocupante / sujeto pasivo</div></td>
      </tr>
    </table>

    <div class="footer">Documento generado el ${escapeActaHtml(todayInPeru())} por el Sistema de Gestión Predial.</div>
  </body>
</html>`;

  return new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
}

function formatActaDate(value: string) {
  if (!value) return "No consignada";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
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

function escapeActaHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
