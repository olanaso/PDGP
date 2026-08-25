import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Download, Save, Send, Upload, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export type GeneratedDocumentField = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select";
  options?: string[];
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
};

type VersionRow = {
  id: string;
  version: string;
  archivo: string;
  fecha: string;
  estado: string;
};

type PredioGeneratedDocumentFormProps = {
  projectId: string;
  codigo: string;
  title: string;
  menuLabel: string;
  badgeSuffix: string;
  sectionTitle: string;
  draftTitle: string;
  fileBaseName: string;
  uploadLabel: string;
  fields: GeneratedDocumentField[];
  enableOriginalDispatch?: boolean;
};

const RED = "#dc2626";
const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] focus:border-gray-500 focus:outline-none";

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
  fullWidth,
  children,
}: {
  label: string;
  required?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`grid grid-cols-[180px_1fr] items-center gap-2 ${fullWidth ? "col-span-2" : ""}`}
    >
      <label className="text-right text-[12px] text-gray-700">
        {required && <span style={{ color: RED }}>* </span>}
        {label}
      </label>
      {children}
    </div>
  );
}

export function PredioGeneratedDocumentForm({
  projectId,
  codigo,
  title,
  menuLabel,
  badgeSuffix,
  sectionTitle,
  draftTitle,
  fileBaseName,
  uploadLabel,
  fields,
  enableOriginalDispatch = false,
}: PredioGeneratedDocumentFormProps) {
  const navigate = useNavigate();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;
  const initialValues = useMemo(
    () => Object.fromEntries(fields.map((field) => [field.key, ""])),
    [fields],
  );
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  function setField(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function renderField(field: GeneratedDocumentField) {
    if (field.type === "textarea") {
      return (
        <textarea
          rows={3}
          className="w-full rounded border border-gray-300 bg-white p-2 text-[12px] focus:border-gray-500 focus:outline-none"
          value={values[field.key] ?? ""}
          placeholder={field.placeholder}
          onChange={(event) => setField(field.key, event.target.value)}
        />
      );
    }

    if (field.type === "select") {
      return (
        <select
          className={`${inputCls} appearance-none`}
          value={values[field.key] ?? ""}
          onChange={(event) => setField(field.key, event.target.value)}
        >
          <option value="">-- SELECCIONE --</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
        className={inputCls}
        value={values[field.key] ?? ""}
        placeholder={field.placeholder}
        onChange={(event) => setField(field.key, event.target.value)}
      />
    );
  }

  function handleGenerateDraft() {
    const safeCode = decodedCodigo.replace(/[^A-Z0-9-]/gi, "_");
    const details = fields
      .map(
        (field) =>
          `<p><b>${escapeHtml(field.label)}:</b> ${escapeHtml(values[field.key] || "Pendiente de registro")}</p>`,
      )
      .join("");
    const html = `<!doctype html>
      <html><head><meta charset="UTF-8" /></head>
      <body style="font-family:Arial,sans-serif;font-size:11pt;color:#111827;line-height:1.4">
        <h1 style="color:#dc2626;text-align:center;font-size:16pt">${escapeHtml(draftTitle)}</h1>
        <p><b>Proyecto:</b> ${escapeHtml(projectLabel)}</p>
        <p><b>Código de predio:</b> ${escapeHtml(decodedCodigo)}</p>
        ${details}
        <h3>Antecedentes y sustento</h3>
        <p>Complete el contenido técnico y legal que corresponda antes de la firma final.</p>
        <br><br><p style="text-align:center">____________________________________<br>Responsable</p>
      </body></html>`;
    downloadBlobFile(
      `${fileBaseName}_${safeCode}.doc`,
      new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" }),
    );
    setMessage(`${draftTitle} generado para descarga en Word.`);
  }

  function handleUpload(file: File | null) {
    if (!file) return;
    const row: VersionRow = {
      id: `document-${Date.now()}`,
      version: `v${versions.length + 1}`,
      archivo: file.name,
      fecha: new Date().toLocaleString("es-PE"),
      estado: "Firmado / registrado",
    };
    setVersions((current) => [row, ...current]);
    setMessage(`${uploadLabel} cargado correctamente como ${row.version}.`);
  }

  function handleDispatchOriginal() {
    if (!versions.length) {
      setMessage("Primero registre el documento original firmado.");
      return;
    }
    setVersions((current) =>
      current.map((version, index) =>
        index === 0 ? { ...version, estado: "Original enviado" } : version,
      ),
    );
    setMessage("El envío del documento original quedó registrado.");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title={title}
        badgeLabel="Predio"
        badgeValue={predio?.codigo || decodedCodigo}
        badgeSuffix={badgeSuffix}
      />

      <main className="mx-auto max-w-[1400px] p-4">
        <form
          className="rounded border bg-white"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(`${title} guardado correctamente.`);
          }}
        >
          <div className="px-5 py-5">
            <div className="mb-3 border-b">
              <div
                className="inline-block border-b-2 px-3 py-1.5 text-[12px] font-medium"
                style={{ borderColor: RED, color: RED }}
              >
                {menuLabel}
              </div>
            </div>

            {message && (
              <div className="mb-3 flex items-start gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-[11px] text-green-700">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <SectionTitle>Identificación del predio</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field label="Código de predio">
                <input className={`${inputCls} bg-gray-50`} value={decodedCodigo} readOnly />
              </Field>
              <Field label="Proyecto">
                <input className={`${inputCls} bg-gray-50`} value={projectLabel} readOnly />
              </Field>
            </div>

            <SectionTitle>{sectionTitle}</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {fields.map((field) => (
                <Field
                  key={field.key}
                  label={field.label}
                  required={field.required}
                  fullWidth={field.fullWidth}
                >
                  {renderField(field)}
                </Field>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGenerateDraft}
                className="flex min-h-[80px] items-center gap-3 rounded border-2 border-[#dc2626] bg-white p-3 text-left hover:bg-[#fef2f2]"
              >
                <span className="flex size-10 items-center justify-center rounded bg-[#dc2626] text-white">
                  <Download size={18} />
                </span>
                <span>
                  <span className="block text-[13px] font-semibold">Generar borrador</span>
                  <span className="block text-[11px] text-gray-500">Descargar Word editable</span>
                </span>
              </button>
              <label className="flex min-h-[80px] cursor-pointer items-center gap-3 rounded border-2 border-dashed border-[#dc2626] bg-[#fffafa] p-3 text-left hover:bg-[#fef2f2]">
                <span className="flex size-10 items-center justify-center rounded bg-white text-[#dc2626] ring-1 ring-[#fecaca]">
                  <Upload size={18} />
                </span>
                <span>
                  <span className="block text-[13px] font-semibold">{uploadLabel}</span>
                  <span className="block text-[11px] text-gray-500">
                    PDF o Word firmado digitalmente o escaneado
                  </span>
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(event) => {
                    handleUpload(event.target.files?.[0] ?? null);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>

            <SectionTitle>Documentos registrados y versiones</SectionTitle>
            <div className="overflow-hidden rounded border border-gray-200">
              <table className="w-full text-[11px]">
                <thead className="bg-gray-50 text-left text-gray-700">
                  <tr>
                    <th className="px-2 py-2 font-semibold">Versión</th>
                    <th className="px-2 py-2 font-semibold">Archivo</th>
                    <th className="px-2 py-2 font-semibold">Fecha</th>
                    <th className="px-2 py-2 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map((version) => (
                    <tr key={version.id} className="border-t border-gray-100">
                      <td className="px-2 py-2 font-semibold text-[#dc2626]">{version.version}</td>
                      <td className="px-2 py-2">{version.archivo}</td>
                      <td className="px-2 py-2">{version.fecha}</td>
                      <td className="px-2 py-2">{version.estado}</td>
                    </tr>
                  ))}
                  {!versions.length && (
                    <tr>
                      <td colSpan={4} className="px-3 py-5 text-center text-gray-400">
                        Sin documentos firmados registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {enableOriginalDispatch && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleDispatchOriginal}
                  className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50"
                >
                  <Send size={14} /> Registrar envío del original
                </button>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/proyectos/$projectId/predios/$codigo/identificacion-codificacion",
                    params: { projectId, codigo: decodedCodigo },
                  })
                }
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
            </div>
          </div>
        </form>
      </main>
    </div>
  );
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

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
