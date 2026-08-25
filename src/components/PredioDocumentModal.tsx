import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FileUp, Loader2, Save, Trash2, X } from "lucide-react";

import { DocumentSectionIcon } from "@/components/DocumentSectionIcon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DOCUMENT_FILE_ACCEPT,
  EMPTY_DOCUMENT_RECORD,
  formatDocumentFileSize,
  validateDocumentFile,
  type DocumentFieldKey,
  type DocumentFormField,
  type DocumentSectionConfig,
  type PredioDocumentRecord,
} from "@/lib/predioDocumentSections";

export type DocumentModalMode = "create" | "edit" | "view";

type Props = {
  open: boolean;
  mode: DocumentModalMode;
  config: DocumentSectionConfig | null;
  record: PredioDocumentRecord | null;
  onClose: () => void;
  onSave: (record: PredioDocumentRecord) => Promise<void>;
};

const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] focus:border-gray-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-600";

export function PredioDocumentModal({
  open,
  mode,
  config,
  record,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<PredioDocumentRecord>({ ...EMPTY_DOCUMENT_RECORD });
  const [fileError, setFileError] = useState("");
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isView = mode === "view";

  useEffect(() => {
    if (!open) return;
    setForm(record ? { ...record } : { ...EMPTY_DOCUMENT_RECORD });
    setFileError("");
    setServerError("");
    setSaving(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open, record, config?.id, mode]);

  const fieldErrors = useMemo(() => {
    if (!config) return {} as Partial<Record<DocumentFieldKey, string>>;
    return config.formFields.reduce<Partial<Record<DocumentFieldKey, string>>>((errors, field) => {
      const value = String(form[field.key] ?? "").trim();
      if (field.required && !value) errors[field.key] = "Este campo es obligatorio.";
      if (field.key === "anioTitulo" && value && !/^\d{4}$/.test(value)) {
        errors[field.key] = "Ingrese un año válido de cuatro dígitos.";
      }
      return errors;
    }, {});
  }, [config, form]);

  const canSave =
    !isView &&
    !saving &&
    !fileError &&
    Object.keys(fieldErrors).length === 0;

  if (!config) return null;

  const title =
    mode === "create" ? config.createTitle : mode === "edit" ? config.editTitle : config.viewTitle;
  const documentFields = config.formFields.filter((field) => field.key !== "descripcion");
  const descriptionField = config.formFields.find((field) => field.key === "descripcion");

  function setField(key: DocumentFieldKey, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setServerError("");
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    const error = validateDocumentFile(file);
    setFileError(error);
    if (!error) setForm((current) => ({ ...current, archivo: file }));
  }

  function removeFile() {
    setForm((current) => ({ ...current, archivo: null }));
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setServerError("");
    try {
      await onSave(form);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No se pudo guardar el registro.");
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !saving) onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto gap-3 p-0">
        <DialogHeader className="border-b bg-gray-50 px-5 py-4 pr-12">
          <DialogTitle className="flex items-center gap-2 text-[15px] text-gray-900">
            <span className="flex size-8 items-center justify-center rounded bg-red-50 text-[#dc2626]">
              <DocumentSectionIcon icon={config.icon} size={16} />
            </span>
            {title}
          </DialogTitle>
          <DialogDescription className="text-[11px]">
            {isView
              ? "Consulta de la información registrada."
              : "Complete los datos obligatorios antes de guardar."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-2">
          {serverError && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
              {serverError}
            </div>
          )}

          <ModalBlock title="Datos del documento">
            <div className="grid grid-cols-2 gap-x-5 gap-y-2">
              {documentFields.map((field) => (
                <DocumentModalField
                  key={field.key}
                  field={field}
                  value={String(form[field.key] ?? "")}
                  error={isView ? "" : fieldErrors[field.key]}
                  disabled={isView || saving}
                  onChange={(value) => setField(field.key, value)}
                />
              ))}
            </div>
          </ModalBlock>

          <ModalBlock title="Archivo y descripción">
            <div className="space-y-3">
              <ModalField label="Archivo adjunto">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={DOCUMENT_FILE_ACCEPT}
                    className="hidden"
                    onChange={(event) => handleFile(event.target.files?.[0])}
                  />
                  <div className="flex min-h-8 items-center gap-2 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-[11px]">
                    <div className="min-w-0 flex-1">
                      {form.archivo ? (
                        <>
                          <div className="truncate font-medium text-gray-700">{form.archivo.name}</div>
                          <div className="text-[10px] text-gray-500">
                            {formatDocumentFileSize(form.archivo.size)}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500">Sin archivo adjunto</span>
                      )}
                    </div>
                    {!isView && (
                      <>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-[10px] hover:bg-gray-100 disabled:opacity-50"
                        >
                          <FileUp size={12} /> {form.archivo ? "Reemplazar" : "Seleccionar"}
                        </button>
                        {form.archivo && (
                          <button
                            type="button"
                            disabled={saving}
                            onClick={removeFile}
                            className="inline-flex items-center gap-1 rounded border border-red-200 bg-white px-2 py-1 text-[10px] text-[#dc2626] hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={12} /> Quitar
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  <div className="mt-1 text-[10px] text-gray-500">
                    PDF, Word o imágenes. Tamaño máximo: 10 MB.
                  </div>
                  {fileError && <FieldError>{fileError}</FieldError>}
                </div>
              </ModalField>

              {descriptionField && (
                <ModalField label={descriptionField.label} required={descriptionField.required} align="start">
                  <div>
                    <textarea
                      value={form.descripcion}
                      onChange={(event) => setField("descripcion", event.target.value)}
                      disabled={isView || saving}
                      placeholder={descriptionField.placeholder}
                      className="min-h-[72px] w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-[12px] focus:border-gray-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-600"
                    />
                    {!isView && fieldErrors.descripcion && (
                      <FieldError>{fieldErrors.descripcion}</FieldError>
                    )}
                  </div>
                </ModalField>
              )}
            </div>
          </ModalBlock>
        </div>

        <DialogFooter className="border-t bg-gray-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 rounded border border-gray-300 bg-white px-4 py-1.5 text-[12px] hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={14} /> {isView ? "Cerrar" : "Cancelar"}
          </button>
          {!isView && (
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="inline-flex items-center justify-center gap-1.5 rounded bg-[#dc2626] px-4 py-1.5 text-[12px] text-white hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Guardando..." : "Guardar"}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ModalBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-3 border-b pb-1">
        <h3 className="text-[13px] font-semibold text-[#dc2626]">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function ModalField({
  label,
  required,
  align = "center",
  children,
}: {
  label: string;
  required?: boolean;
  align?: "center" | "start";
  children: ReactNode;
}) {
  return (
    <div className={`grid grid-cols-[150px_1fr] gap-2 ${align === "start" ? "items-start" : "items-center"}`}>
      <label className={`text-right text-[11px] text-gray-700 ${align === "start" ? "pt-2" : ""}`}>
        {required && <span className="text-[#dc2626]">* </span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function DocumentModalField({
  field,
  value,
  error,
  disabled,
  onChange,
}: {
  field: DocumentFormField;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <ModalField label={field.label} required={field.required}>
      <div>
        {field.type === "select" ? (
          <select
            className={`${inputCls} appearance-none`}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
          >
            <option value="">-- Seleccione --</option>
            {field.options?.map((option) => <option key={option}>{option}</option>)}
          </select>
        ) : (
          <input
            className={inputCls}
            type={field.type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            placeholder={field.placeholder}
            min={field.type === "number" ? "1900" : undefined}
            max={field.type === "number" ? "2100" : undefined}
          />
        )}
        {error && <FieldError>{error}</FieldError>}
      </div>
    </ModalField>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return <div className="mt-1 text-[10px] text-red-600">{children}</div>;
}
