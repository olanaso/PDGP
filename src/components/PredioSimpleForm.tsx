import { useNavigate } from "@tanstack/react-router";
import { Save, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export type PredioSimpleField = {
  key: string;
  label: string;
  type?: "text" | "date" | "textarea" | "select" | "file";
  options?: string[];
  placeholder?: string;
  accept?: string;
  required?: boolean;
  fullWidth?: boolean;
};

export type PredioSimpleSection = {
  title: string;
  fields: PredioSimpleField[];
};

export type PredioSimpleFormActionContext = {
  values: Readonly<Record<string, string>>;
  decodedCodigo: string;
  projectLabel: string;
  predio: ReturnType<typeof getPredioByCodigo>;
  setMessage: (message: string) => void;
};

type PredioSimpleFormProps = {
  projectId: string;
  codigo: string;
  title: string;
  menuLabel: string;
  badgeSuffix: string;
  sections: PredioSimpleSection[];
  successMessage?: string;
  additionalAction?: {
    label: string;
    icon?: ReactNode;
    onClick: (context: PredioSimpleFormActionContext) => void;
  };
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

export function PredioSimpleForm({
  projectId,
  codigo,
  title,
  menuLabel,
  badgeSuffix,
  sections,
  successMessage,
  additionalAction,
}: PredioSimpleFormProps) {
  const navigate = useNavigate();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;
  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        sections.flatMap((section) => section.fields.map((field) => [field.key, ""])),
      ),
    [sections],
  );
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [message, setMessage] = useState<string | null>(null);

  function setField(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function renderField(field: PredioSimpleField) {
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

    if (field.type === "file") {
      return (
        <div>
          <input
            type="file"
            accept={field.accept}
            className="block h-8 w-full rounded border border-gray-300 bg-white text-[12px] file:mr-3 file:h-full file:border-0 file:border-r file:border-gray-200 file:bg-gray-50 file:px-3 file:text-[11px]"
            onChange={(event) => setField(field.key, event.target.files?.[0]?.name ?? "")}
          />
          {values[field.key] && (
            <p className="mt-1 text-[10px] text-gray-500">
              Archivo seleccionado: {values[field.key]}
            </p>
          )}
        </div>
      );
    }

    return (
      <input
        type={field.type === "date" ? "date" : "text"}
        className={inputCls}
        value={values[field.key] ?? ""}
        placeholder={field.placeholder}
        onChange={(event) => setField(field.key, event.target.value)}
      />
    );
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
            setMessage(successMessage ?? `${title} guardado correctamente.`);
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
              <div className="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-[11px] text-green-700">
                {message}
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

            {sections.map((section) => (
              <div key={section.title}>
                <SectionTitle>{section.title}</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {section.fields.map((field) => (
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
              </div>
            ))}

            <div className="mt-5 flex justify-end gap-2 border-t pt-3">
              {additionalAction && (
                <button
                  type="button"
                  onClick={() =>
                    additionalAction.onClick({
                      values,
                      decodedCodigo,
                      projectLabel,
                      predio,
                      setMessage,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded border border-[#dc2626] bg-white px-4 py-1.5 text-[12px] font-medium text-[#dc2626] transition hover:bg-red-50"
                >
                  {additionalAction.icon}
                  {additionalAction.label}
                </button>
              )}
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
