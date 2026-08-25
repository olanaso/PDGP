import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Link2,
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
  "/proyectos/$projectId/predios/$codigo/levantamiento-informacion-tecnica",
)({
  head: () => ({
    meta: [
      { title: "Levantamiento de información técnica" },
      {
        name: "description",
        content:
          "Registro de requerimientos, servicios, documentos enviados y productos recibidos del predio.",
      },
    ],
  }),
  component: LevantamientoInformacionTecnicaPage,
});

const RED = "#dc2626";
const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] text-gray-800 outline-none transition focus:border-[#dc2626] focus:ring-1 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";
const textareaCls =
  "w-full rounded border border-gray-300 bg-white p-2 text-[12px] text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#dc2626] focus:ring-1 focus:ring-red-100";

const serviceTypes = [
  {
    key: "geodesico",
    label: "Servicio geodésico y/o topográfico",
    description: "Coordenadas, áreas, linderos y detalles del terreno.",
  },
  {
    key: "fotogrametria",
    label: "Servicio de fotogrametría",
    description: "Captura aérea y productos cartográficos del predio.",
  },
  {
    key: "hitos",
    label: "Servicio de colocación de hitos",
    description: "Materialización y verificación de vértices en campo.",
  },
  {
    key: "existencias",
    label: "Servicio de levantamiento de existencias",
    description: "Inventario de edificaciones, instalaciones y mejoras.",
  },
] as const;

type ServiceKey = (typeof serviceTypes)[number]["key"];
type ResourceBucket = "sentResources" | "resultResources";

type DocumentResource = {
  id: string;
  kind: "file" | "link";
  description: string;
  fileName?: string;
  size?: number;
  file?: File;
  url?: string;
};

type Requirement = {
  id: string;
  hojaRuta: string;
  fechaEnvio: string;
  destinatario: string;
  asunto: string;
  estado: string;
  services: ServiceKey[];
  tieneOrdenServicio: boolean;
  numeroOrdenServicio: string;
  fechaOrdenServicio: string;
  especialista: string;
  fechaRecepcionResultado: string;
  descripcionResultado: string;
  observaciones: string;
  sentResources: DocumentResource[];
  resultResources: DocumentResource[];
};

type Feedback = {
  kind: "success" | "error";
  text: string;
};

function createRequirement(id: string): Requirement {
  return {
    id,
    hojaRuta: "",
    fechaEnvio: "",
    destinatario: "",
    asunto: "",
    estado: "BORRADOR",
    services: [],
    tieneOrdenServicio: false,
    numeroOrdenServicio: "",
    fechaOrdenServicio: "",
    especialista: "",
    fechaRecepcionResultado: "",
    descripcionResultado: "",
    observaciones: "",
    sentResources: [],
    resultResources: [],
  };
}

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

function formatFileSize(bytes?: number) {
  if (bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileDescription(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
}

function ResourcePanel({
  title,
  description,
  emptyMessage,
  resources,
  onAddFiles,
  onAddLink,
  onUpdateDescription,
  onRemove,
  resultPanel = false,
}: {
  title: string;
  description: string;
  emptyMessage: string;
  resources: DocumentResource[];
  onAddFiles: (files: FileList | null) => void;
  onAddLink: (url: string, description: string) => void;
  onUpdateDescription: (id: string, description: string) => void;
  onRemove: (id: string) => void;
  resultPanel?: boolean;
}) {
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDescription, setLinkDescription] = useState("");

  function resetLinkForm() {
    setShowLinkForm(false);
    setLinkUrl("");
    setLinkDescription("");
  }

  return (
    <section
      className={`overflow-hidden rounded border ${
        resultPanel ? "border-green-200" : "border-blue-200"
      }`}
    >
      <header
        className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 ${
          resultPanel ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"
        }`}
      >
        <div>
          <h4
            className={`text-[11px] font-bold ${resultPanel ? "text-green-800" : "text-blue-800"}`}
          >
            {title}
          </h4>
          <p className={`mt-0.5 text-[10px] ${resultPanel ? "text-green-700" : "text-blue-700"}`}>
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded border border-gray-300 bg-white px-3 text-[11px] font-medium text-gray-700 transition hover:bg-gray-50">
            <Upload size={14} /> Subir archivo
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.zip,image/*"
              className="sr-only"
              onChange={(event) => {
                onAddFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => setShowLinkForm((current) => !current)}
            className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 bg-white px-3 text-[11px] font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Link2 size={14} /> Agregar enlace
          </button>
        </div>
      </header>

      {showLinkForm && (
        <div className="grid gap-2 border-b border-gray-200 bg-gray-50/70 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <input
            className={inputCls}
            placeholder="Descripción del documento"
            value={linkDescription}
            onChange={(event) => setLinkDescription(event.target.value)}
          />
          <input
            type="url"
            className={inputCls}
            placeholder="https://drive.google.com/..."
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!linkUrl.trim() || !linkDescription.trim()}
              onClick={() => {
                onAddLink(linkUrl.trim(), linkDescription.trim());
                resetLinkForm();
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-3 text-[11px] text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} /> Añadir
            </button>
            <button
              type="button"
              onClick={resetLinkForm}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 bg-white px-3 text-[11px] text-gray-600 hover:bg-gray-50"
            >
              <X size={14} /> Cancelar
            </button>
          </div>
        </div>
      )}

      {resources.length === 0 ? (
        <div className="px-4 py-7 text-center">
          <FileText size={22} className="mx-auto text-gray-300" />
          <p className="mt-2 text-[10px] text-gray-500">{emptyMessage}</p>
          <p className="mt-1 text-[9px] text-gray-400">
            Puede registrar un archivo independiente o un enlace de Drive, OneDrive u otro
            repositorio.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="bg-white text-[9px] uppercase tracking-wide text-gray-500">
                <th className="w-12 border-b border-gray-200 px-3 py-2 text-center">N.°</th>
                <th className="w-24 border-b border-gray-200 px-3 py-2">Tipo</th>
                <th className="border-b border-gray-200 px-3 py-2">Descripción</th>
                <th className="w-72 border-b border-gray-200 px-3 py-2">Archivo o enlace</th>
                <th className="w-20 border-b border-gray-200 px-3 py-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource, index) => (
                <tr key={resource.id} className="border-t border-gray-100 align-middle">
                  <td className="px-3 py-2 text-center text-[11px] text-gray-500">{index + 1}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold ${
                        resource.kind === "file"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-violet-50 text-violet-700"
                      }`}
                    >
                      {resource.kind === "file" ? <FileText size={11} /> : <Link2 size={11} />}
                      {resource.kind === "file" ? "Archivo" : "Enlace"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      aria-label={`Descripción del documento ${index + 1}`}
                      className={inputCls}
                      value={resource.description}
                      onChange={(event) => onUpdateDescription(resource.id, event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    {resource.kind === "file" ? (
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText size={14} className="shrink-0 text-[#dc2626]" />
                        <div className="min-w-0">
                          <p
                            className="truncate text-[10px] font-medium text-gray-700"
                            title={resource.fileName}
                          >
                            {resource.fileName}
                          </p>
                          <p className="text-[9px] text-gray-400">
                            {formatFileSize(resource.size)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-full items-center gap-1.5 text-[10px] font-medium text-blue-700 hover:underline"
                      >
                        <span className="truncate">{resource.url}</span>
                        <ExternalLink size={12} className="shrink-0" />
                      </a>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => onRemove(resource.id)}
                      title="Eliminar documento"
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
    </section>
  );
}

function LevantamientoInformacionTecnicaPage() {
  const { projectId, codigo } = Route.useParams();
  const navigate = useNavigate();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;

  const [requirements, setRequirements] = useState<Requirement[]>([
    createRequirement("requirement-initial"),
  ]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    setRequirements([createRequirement("requirement-initial")]);
    setFeedback(null);
  }, [decodedCodigo]);

  function updateRequirement<K extends keyof Requirement>(
    requirementId: string,
    key: K,
    value: Requirement[K],
  ) {
    setRequirements((current) =>
      current.map((requirement) =>
        requirement.id === requirementId ? { ...requirement, [key]: value } : requirement,
      ),
    );
    setFeedback(null);
  }

  function toggleService(requirementId: string, serviceKey: ServiceKey) {
    setRequirements((current) =>
      current.map((requirement) => {
        if (requirement.id !== requirementId) return requirement;
        const selected = requirement.services.includes(serviceKey);
        return {
          ...requirement,
          services: selected
            ? requirement.services.filter((item) => item !== serviceKey)
            : [...requirement.services, serviceKey],
        };
      }),
    );
    setFeedback(null);
  }

  function addFiles(requirementId: string, bucket: ResourceBucket, files: FileList | null) {
    if (!files?.length) return;

    const timestamp = Date.now();
    const resources: DocumentResource[] = Array.from(files).map((file, index) => ({
      id: `${timestamp}-${index}-${file.name}`,
      kind: "file",
      description: fileDescription(file.name),
      fileName: file.name,
      size: file.size,
      file,
    }));

    setRequirements((current) =>
      current.map((requirement) =>
        requirement.id === requirementId
          ? { ...requirement, [bucket]: [...requirement[bucket], ...resources] }
          : requirement,
      ),
    );
    setFeedback(null);
  }

  function addLink(
    requirementId: string,
    bucket: ResourceBucket,
    url: string,
    description: string,
  ) {
    const resource: DocumentResource = {
      id: `link-${Date.now()}`,
      kind: "link",
      description,
      url,
    };

    setRequirements((current) =>
      current.map((requirement) =>
        requirement.id === requirementId
          ? { ...requirement, [bucket]: [...requirement[bucket], resource] }
          : requirement,
      ),
    );
    setFeedback(null);
  }

  function updateResourceDescription(
    requirementId: string,
    bucket: ResourceBucket,
    resourceId: string,
    description: string,
  ) {
    setRequirements((current) =>
      current.map((requirement) =>
        requirement.id === requirementId
          ? {
              ...requirement,
              [bucket]: requirement[bucket].map((resource) =>
                resource.id === resourceId ? { ...resource, description } : resource,
              ),
            }
          : requirement,
      ),
    );
  }

  function removeResource(requirementId: string, bucket: ResourceBucket, resourceId: string) {
    setRequirements((current) =>
      current.map((requirement) =>
        requirement.id === requirementId
          ? {
              ...requirement,
              [bucket]: requirement[bucket].filter((resource) => resource.id !== resourceId),
            }
          : requirement,
      ),
    );
    setFeedback(null);
  }

  function addRequirement() {
    setRequirements((current) => [...current, createRequirement(`requirement-${Date.now()}`)]);
    setFeedback(null);
  }

  function removeRequirement(requirementId: string) {
    setRequirements((current) => current.filter((item) => item.id !== requirementId));
    setFeedback(null);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Levantamiento de información técnica"
        badgeLabel="Predio"
        badgeValue={predio?.cod || decodedCodigo}
        badgeSuffix="Información base 1.6"
      />

      <main className="mx-auto max-w-[1260px] p-4">
        <form
          className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();

            const withoutServices = requirements.find(
              (requirement) => !requirement.services.length,
            );
            if (withoutServices) {
              setFeedback({
                kind: "error",
                text: "Cada requerimiento debe incluir por lo menos un servicio.",
              });
              return;
            }

            const withoutSentDocuments = requirements.find(
              (requirement) =>
                requirement.estado !== "BORRADOR" && !requirement.sentResources.length,
            );
            if (withoutSentDocuments) {
              setFeedback({
                kind: "error",
                text: "Los requerimientos enviados deben tener por lo menos un archivo o enlace en Documentos enviados.",
              });
              return;
            }

            const withoutResults = requirements.find(
              (requirement) =>
                ["RESULTADO RECIBIDO", "CERRADO"].includes(requirement.estado) &&
                !requirement.resultResources.length,
            );
            if (withoutResults) {
              setFeedback({
                kind: "error",
                text: "Los requerimientos con resultado recibido deben tener por lo menos un producto adjunto o enlazado.",
              });
              return;
            }

            const resourcesWithoutDescription = requirements.some((requirement) =>
              [...requirement.sentResources, ...requirement.resultResources].some(
                (resource) => !resource.description.trim(),
              ),
            );
            if (resourcesWithoutDescription) {
              setFeedback({
                kind: "error",
                text: "Todos los archivos y enlaces deben tener una descripción.",
              });
              return;
            }

            setFeedback({
              kind: "success",
              text: "Los requerimientos y sus documentos se guardaron correctamente.",
            });
          }}
        >
          <div className="border-b border-gray-200 px-5 pt-4">
            <div
              className="inline-block border-b-2 px-2 pb-2 text-[12px] font-semibold"
              style={{ borderColor: RED, color: RED }}
            >
              1.6 Requerimientos de levantamiento de información
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="rounded border border-gray-200 bg-gray-50 p-4">
              <SectionTitle>Predio del requerimiento</SectionTitle>
              <div className="grid gap-x-8 gap-y-2 xl:grid-cols-2">
                <Field label="Código de predio">
                  <input
                    className={`${inputCls} bg-gray-50 font-medium`}
                    value={predio?.cod || decodedCodigo}
                    readOnly
                  />
                </Field>
                <Field label="Proyecto">
                  <input className={`${inputCls} bg-gray-50`} value={projectLabel} readOnly />
                </Field>
              </div>
            </div>

            <div className="my-4 rounded border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-[11px] font-semibold text-blue-800">
                ¿Cómo se organiza el registro?
              </p>
              <p className="mt-1 text-[10px] leading-4 text-blue-700">
                Cada tarjeta representa una hoja de ruta. Puede solicitar uno o varios servicios y
                registrar por separado lo que se envió y los productos que posteriormente fueron
                recibidos.
              </p>
            </div>

            {feedback && (
              <div
                role="status"
                className={`mb-4 flex items-center gap-2 rounded border px-3 py-2 text-[11px] ${
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

            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-red-100 pb-2">
              <div>
                <h2 className="text-[13px] font-semibold text-[#dc2626]">
                  Requerimientos registrados
                </h2>
                <p className="mt-0.5 text-[10px] text-gray-500">
                  Agregue una tarjeta nueva cuando exista otra hoja de ruta.
                </p>
              </div>
              <button
                type="button"
                onClick={addRequirement}
                className="inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-3 text-[11px] font-medium text-white transition hover:bg-[#b91c1c]"
              >
                <Plus size={14} /> Nuevo requerimiento
              </button>
            </div>

            <div className="space-y-4">
              {requirements.map((requirement, requirementIndex) => (
                <article
                  key={requirement.id}
                  className="overflow-hidden rounded border border-gray-300"
                >
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-7 place-items-center rounded-full bg-[#dc2626] text-[11px] font-bold text-white">
                        {requirementIndex + 1}
                      </span>
                      <div>
                        <h3 className="text-[12px] font-semibold text-gray-800">
                          Requerimiento {requirementIndex + 1}
                          {requirement.hojaRuta
                            ? ` · ${requirement.hojaRuta}`
                            : " · Sin hoja de ruta"}
                        </h3>
                        <p className="mt-0.5 text-[9px] text-gray-500">
                          {requirement.services.length} servicio
                          {requirement.services.length === 1 ? "" : "s"} seleccionado
                          {requirement.services.length === 1 ? "" : "s"} · Estado:{" "}
                          {requirement.estado}
                        </p>
                      </div>
                    </div>
                    {requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(requirement.id)}
                        className="inline-flex h-8 items-center gap-1.5 rounded border border-red-200 bg-white px-3 text-[11px] text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} /> Eliminar requerimiento
                      </button>
                    )}
                  </header>

                  <div className="p-4">
                    <SectionTitle>Datos de envío por hoja de ruta</SectionTitle>
                    <div className="grid gap-x-8 gap-y-2 xl:grid-cols-2">
                      <Field label="Número de hoja de ruta" required>
                        <input
                          required
                          className={inputCls}
                          placeholder="Ej. HR-2026-001234"
                          value={requirement.hojaRuta}
                          onChange={(event) =>
                            updateRequirement(requirement.id, "hojaRuta", event.target.value)
                          }
                        />
                      </Field>
                      <Field label="Fecha de envío" required>
                        <input
                          type="date"
                          required
                          className={inputCls}
                          value={requirement.fechaEnvio}
                          onChange={(event) =>
                            updateRequirement(requirement.id, "fechaEnvio", event.target.value)
                          }
                        />
                      </Field>
                      <Field label="Área o entidad destinataria" required>
                        <input
                          required
                          className={inputCls}
                          placeholder="Coordinación, abastecimiento, consultor u otra entidad"
                          value={requirement.destinatario}
                          onChange={(event) =>
                            updateRequirement(requirement.id, "destinatario", event.target.value)
                          }
                        />
                      </Field>
                      <Field label="Estado del requerimiento">
                        <select
                          className={inputCls}
                          value={requirement.estado}
                          onChange={(event) =>
                            updateRequirement(requirement.id, "estado", event.target.value)
                          }
                        >
                          <option value="BORRADOR">BORRADOR</option>
                          <option value="ENVIADO">ENVIADO</option>
                          <option value="EN ATENCIÓN">EN ATENCIÓN</option>
                          <option value="RESULTADO RECIBIDO">RESULTADO RECIBIDO</option>
                          <option value="CERRADO">CERRADO</option>
                        </select>
                      </Field>
                      <Field label="Asunto del requerimiento" className="xl:col-span-2">
                        <input
                          className={inputCls}
                          placeholder="Resumen de lo solicitado mediante la hoja de ruta"
                          value={requirement.asunto}
                          onChange={(event) =>
                            updateRequirement(requirement.id, "asunto", event.target.value)
                          }
                        />
                      </Field>
                    </div>

                    <SectionTitle>Servicios incluidos en este requerimiento</SectionTitle>
                    <p className="mb-2 text-[10px] text-gray-500">
                      Una hoja de ruta puede solicitar uno o varios de los siguientes servicios.
                    </p>
                    <div className="grid gap-2 xl:grid-cols-2">
                      {serviceTypes.map((service) => {
                        const selected = requirement.services.includes(service.key);
                        return (
                          <label
                            key={service.key}
                            className={`flex cursor-pointer items-start gap-3 rounded border p-3 transition ${
                              selected
                                ? "border-red-300 bg-red-50/60"
                                : "border-gray-200 hover:border-red-200 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleService(requirement.id, service.key)}
                              className="mt-0.5 size-4 accent-[#dc2626]"
                            />
                            <span>
                              <span className="block text-[11px] font-semibold text-gray-800">
                                {service.label}
                              </span>
                              <span className="mt-0.5 block text-[10px] leading-4 text-gray-500">
                                {service.description}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    <SectionTitle>Datos de contratación, cuando corresponda</SectionTitle>
                    <div className="grid gap-x-8 gap-y-2 xl:grid-cols-2">
                      <Field label="¿Tiene orden de servicio?">
                        <label className="inline-flex min-h-8 items-center gap-2 text-[11px] text-gray-700">
                          <input
                            type="checkbox"
                            checked={requirement.tieneOrdenServicio}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              setRequirements((current) =>
                                current.map((item) =>
                                  item.id === requirement.id
                                    ? {
                                        ...item,
                                        tieneOrdenServicio: checked,
                                        numeroOrdenServicio: checked
                                          ? item.numeroOrdenServicio
                                          : "",
                                        fechaOrdenServicio: checked ? item.fechaOrdenServicio : "",
                                      }
                                    : item,
                                ),
                              );
                              setFeedback(null);
                            }}
                            className="size-4 accent-[#dc2626]"
                          />
                          Sí, existe una orden de servicio
                        </label>
                      </Field>
                      <Field label="Número de orden de servicio">
                        <input
                          className={inputCls}
                          disabled={!requirement.tieneOrdenServicio}
                          placeholder="Ingrese el número de O/S"
                          value={requirement.numeroOrdenServicio}
                          onChange={(event) =>
                            updateRequirement(
                              requirement.id,
                              "numeroOrdenServicio",
                              event.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field label="Fecha de orden de servicio">
                        <input
                          type="date"
                          className={inputCls}
                          disabled={!requirement.tieneOrdenServicio}
                          value={requirement.fechaOrdenServicio}
                          onChange={(event) =>
                            updateRequirement(
                              requirement.id,
                              "fechaOrdenServicio",
                              event.target.value,
                            )
                          }
                        />
                      </Field>
                    </div>

                    <SectionTitle>Documentos enviados con el requerimiento</SectionTitle>
                    <ResourcePanel
                      title="DOCUMENTOS ENVIADOS"
                      description="Oficios, memorandos, términos de referencia, planos, informes u otros documentos oficiales remitidos."
                      emptyMessage="Aún no se han registrado documentos enviados."
                      resources={requirement.sentResources}
                      onAddFiles={(files) => addFiles(requirement.id, "sentResources", files)}
                      onAddLink={(url, description) =>
                        addLink(requirement.id, "sentResources", url, description)
                      }
                      onUpdateDescription={(resourceId, description) =>
                        updateResourceDescription(
                          requirement.id,
                          "sentResources",
                          resourceId,
                          description,
                        )
                      }
                      onRemove={(resourceId) =>
                        removeResource(requirement.id, "sentResources", resourceId)
                      }
                    />

                    <SectionTitle>Recepción del resultado de la actividad</SectionTitle>
                    <div className="mb-3 grid gap-x-8 gap-y-2 xl:grid-cols-2">
                      <Field label="Especialista o proveedor">
                        <input
                          className={inputCls}
                          placeholder="Responsable que entrega el producto"
                          value={requirement.especialista}
                          onChange={(event) =>
                            updateRequirement(requirement.id, "especialista", event.target.value)
                          }
                        />
                      </Field>
                      <Field label="Fecha de recepción">
                        <input
                          type="date"
                          className={inputCls}
                          value={requirement.fechaRecepcionResultado}
                          onChange={(event) =>
                            updateRequirement(
                              requirement.id,
                              "fechaRecepcionResultado",
                              event.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field
                        label="Descripción del producto recibido"
                        alignStart
                        className="xl:col-span-2"
                      >
                        <textarea
                          rows={3}
                          className={textareaCls}
                          placeholder="Describa brevemente el informe, plano, base gráfica, fotografías u otro producto recibido."
                          value={requirement.descripcionResultado}
                          onChange={(event) =>
                            updateRequirement(
                              requirement.id,
                              "descripcionResultado",
                              event.target.value,
                            )
                          }
                        />
                      </Field>
                    </div>

                    <ResourcePanel
                      title="PRODUCTOS RECIBIDOS"
                      description="Informes, planos, fotografías, bases gráficas u otros entregables obtenidos como resultado de la actividad."
                      emptyMessage="Aún no se han registrado productos recibidos."
                      resources={requirement.resultResources}
                      onAddFiles={(files) => addFiles(requirement.id, "resultResources", files)}
                      onAddLink={(url, description) =>
                        addLink(requirement.id, "resultResources", url, description)
                      }
                      onUpdateDescription={(resourceId, description) =>
                        updateResourceDescription(
                          requirement.id,
                          "resultResources",
                          resourceId,
                          description,
                        )
                      }
                      onRemove={(resourceId) =>
                        removeResource(requirement.id, "resultResources", resourceId)
                      }
                      resultPanel
                    />

                    <SectionTitle>Observaciones del requerimiento</SectionTitle>
                    <Field label="Observaciones" alignStart>
                      <textarea
                        rows={3}
                        className={textareaCls}
                        placeholder="Registre incidencias, pendientes o aclaraciones relacionadas con esta hoja de ruta."
                        value={requirement.observaciones}
                        onChange={(event) =>
                          updateRequirement(requirement.id, "observaciones", event.target.value)
                        }
                      />
                    </Field>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
              <p className="text-[10px] text-gray-500">
                Formatos admitidos: PDF, Word, Excel, DWG, DXF, ZIP e imágenes. También puede
                registrar enlaces externos.
              </p>
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
                  <Save size={14} /> Guardar requerimientos
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
