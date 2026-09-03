import { createFileRoute } from "@tanstack/react-router";
import JSZip from "jszip";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  FolderArchive,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";

import { AppSidebar } from "@/components/AppSidebar";
import { proyectos } from "@/lib/projectsData";

export const Route = createFileRoute("/gestion-documental")({
  head: () => ({
    meta: [
      { title: "Plantillas Word | Gestión Documental" },
      {
        name: "description",
        content: "Configuración de plantillas Word para los documentos de gestión predial.",
      },
    ],
  }),
  component: GestionDocumentalPage,
});

const STORAGE_KEY = "pdgp:plantillas-word:v1";
const DATABASE_NAME = "pdgp-plantillas-word";
const DATABASE_STORE = "files";
const PAGE_SIZE = 8;
const VARIABLE_PATTERN = /^[A-Z][A-Z0-9_]*$/;
const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] text-gray-800 outline-none transition focus:border-[#dc2626] focus:ring-1 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100";
const textareaCls =
  "min-h-16 w-full resize-y rounded border border-gray-300 bg-white px-2 py-1.5 text-[12px] text-gray-800 outline-none transition focus:border-[#dc2626] focus:ring-1 focus:ring-red-100";

type FieldSize = "CORTO" | "MEDIANO" | "LARGO";
type FieldType = "text" | "number" | "date" | "currency";

type TemplateField = {
  id: string;
  name: string;
  size: FieldSize;
  maxLength: number;
  type: FieldType;
};

type WordTemplate = {
  id: string;
  projectIds: string[];
  code: string;
  system: boolean;
  denomination: string;
  description: string;
  order: number;
  fileName: string;
  fileSize: number;
  fields: TemplateField[];
  updatedAt: string;
};

type Feedback = { kind: "success" | "error"; text: string };

const exampleFields = [
  "CODIGO_DE_PREDIO",
  "NOMBRE_DEL_PROYECTO",
  "NRO_DE_OFICIO",
  "NOMBRES_APELLIDOS",
  "DIRECCION_ELECTRONICA",
  "DOMICILIO",
  "DISTRITO",
];

function field(name: string, index: number): TemplateField {
  return {
    id: `seed-field-${name}-${index}`,
    name,
    size: index < 2 ? "CORTO" : index < 5 ? "MEDIANO" : "LARGO",
    maxLength: index < 2 ? 50 : index < 5 ? 250 : 500,
    type: name.includes("FECHA") ? "date" : "text",
  };
}

const seedTemplates: WordTemplate[] = [
  {
    id: "tpl-predio",
    projectIds: [],
    code: "HS34PC",
    system: true,
    denomination: "FICHA DE INFORMACIÓN DEL PREDIO",
    description: "Plantilla institucional para consolidar los datos generales del predio.",
    order: 8,
    fileName: "ficha-informacion-predio.docx",
    fileSize: 28462,
    fields: ["CODIGO_DE_PREDIO", "NOMBRE_DEL_PROYECTO", "AREA_AFECTADA"].map(field),
    updatedAt: "03/09/2026, 09:10",
  },
  {
    id: "tpl-oficio-cajamarca",
    projectIds: ["cajamarca"],
    code: "Y65FRD",
    system: true,
    denomination: "OFICIO CAJAMARCA",
    description: "Oficio institucional para comunicaciones del proyecto Cajamarca.",
    order: 3,
    fileName: "oficio-cajamarca.docx",
    fileSize: 36281,
    fields: exampleFields.map(field),
    updatedAt: "03/09/2026, 09:15",
  },
  {
    id: "tpl-intencion",
    projectIds: ["cajamarca"],
    code: "MPZ3TT",
    system: false,
    denomination: "OFICIO INTENCIÓN DE COMPRA",
    description: "Comunicación de intención de adquisición al sujeto pasivo.",
    order: 4,
    fileName: "oficio-intencion-compra.docx",
    fileSize: 31440,
    fields: ["NRO_DE_OFICIO", "NOMBRES_APELLIDOS", "CODIGO_DE_PREDIO", "FECHA_DOCUMENTO"].map(
      field,
    ),
    updatedAt: "02/09/2026, 16:32",
  },
  {
    id: "tpl-prueba",
    projectIds: ["iquitos"],
    code: "B6H00Z",
    system: false,
    denomination: "ACTA DE INSPECCIÓN PREDIAL",
    description: "Acta para registrar visitas e inspecciones de campo.",
    order: 2,
    fileName: "acta-inspeccion-predial.docx",
    fileSize: 25876,
    fields: ["CODIGO_DE_PREDIO", "FECHA_INSPECCION", "NOMBRES_APELLIDOS", "OBSERVACIONES"].map(
      field,
    ),
    updatedAt: "01/09/2026, 12:20",
  },
  {
    id: "tpl-base-grafica",
    projectIds: ["pucallpa"],
    code: "7SA1DO",
    system: false,
    denomination: "OFICIO SOLICITUD DE BASE GRÁFICA",
    description: "Solicitud de información gráfica para el análisis técnico registral.",
    order: 9,
    fileName: "solicitud-base-grafica.docx",
    fileSize: 33412,
    fields: ["NRO_DE_OFICIO", "NOMBRE_DEL_PROYECTO", "POLIGONO_AFECTADO"].map(field),
    updatedAt: "31/08/2026, 15:05",
  },
  {
    id: "tpl-independizacion",
    projectIds: ["iquitos"],
    code: "E64ZQY",
    system: false,
    denomination: "OFICIO DE INDEPENDIZACIÓN",
    description: "Documento para iniciar el procedimiento de independización registral.",
    order: 1,
    fileName: "oficio-independizacion.docx",
    fileSize: 41220,
    fields: ["NRO_DE_OFICIO", "PARTIDA_REGISTRAL", "OFICINA_REGISTRAL", "AREA_AFECTADA"].map(field),
    updatedAt: "30/08/2026, 10:42",
  },
  {
    id: "tpl-transferencia",
    projectIds: ["jauja"],
    code: "RS078B",
    system: false,
    denomination: "OFICIO DE INDEPENDIZACIÓN Y TRANSFERENCIA VÍA EXPROPIACIÓN",
    description: "Solicitud registral asociada al procedimiento de expropiación.",
    order: 1,
    fileName: "independizacion-transferencia.docx",
    fileSize: 46850,
    fields: ["CODIGO_DE_PREDIO", "PARTIDA_REGISTRAL", "TITULAR_REGISTRAL", "VALOR_TASACION"].map(
      field,
    ),
    updatedAt: "29/08/2026, 17:14",
  },
  {
    id: "tpl-informe-mejoras",
    projectIds: [],
    code: "6R8QNB",
    system: true,
    denomination: "INFORME TÉCNICO LEGAL – TRANSFERENCIA INTERESTATAL Y PAGO DE MEJORAS",
    description: "Informe técnico legal reutilizable en proyectos de infraestructura.",
    order: 11,
    fileName: "informe-tecnico-legal-mejoras.docx",
    fileSize: 58210,
    fields: [
      "CODIGO_DE_PREDIO",
      "NOMBRE_DEL_PROYECTO",
      "ENTIDAD_TITULAR",
      "DESCRIPCION_MEJORAS",
      "MONTO_TOTAL",
    ].map(field),
    updatedAt: "28/08/2026, 09:34",
  },
  {
    id: "tpl-informe-regularizacion",
    projectIds: [],
    code: "R3GYP9",
    system: true,
    denomination: "INFORME TÉCNICO LEGAL – REGULARIZACIÓN DE PREDIOS DEL ESTADO",
    description: "Informe para predios ocupados por el Estado que requieren regularización.",
    order: 10,
    fileName: "informe-regularizacion-predios.docx",
    fileSize: 53118,
    fields: ["CODIGO_DE_PREDIO", "ENTIDAD_OCUPANTE", "ANTECEDENTE_REGISTRAL", "CONCLUSION"].map(
      field,
    ),
    updatedAt: "27/08/2026, 13:05",
  },
];

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function createEmptyTemplate(): WordTemplate {
  return {
    id: newId("tpl"),
    projectIds: [],
    code: generateCode(),
    system: false,
    denomination: "",
    description: "",
    order: 1,
    fileName: "",
    fileSize: 0,
    fields: [],
    updatedAt: "",
  };
}

function openFileDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(DATABASE_STORE)) {
        request.result.createObjectStore(DATABASE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("No se pudo abrir el almacenamiento."));
  });
}

async function saveStoredFile(id: string, blob: Blob) {
  const database = await openFileDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(DATABASE_STORE, "readwrite");
    transaction.objectStore(DATABASE_STORE).put(blob, id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

async function getStoredFile(id: string): Promise<Blob | undefined> {
  const database = await openFileDatabase();
  const result = await new Promise<Blob | undefined>((resolve, reject) => {
    const request = database
      .transaction(DATABASE_STORE, "readonly")
      .objectStore(DATABASE_STORE)
      .get(id);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return result;
}

async function removeStoredFile(id: string) {
  const database = await openFileDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(DATABASE_STORE, "readwrite");
    transaction.objectStore(DATABASE_STORE).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

function decodeXmlText(xml: string) {
  return xml
    .replace(/<w:tab\s*\/?>/g, "\t")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

async function extractVariables(file: File): Promise<string[]> {
  if (!file.name.toLowerCase().endsWith(".docx")) {
    throw new Error("Solo se admiten plantillas Word en formato .docx.");
  }

  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const contentFiles = Object.keys(zip.files).filter((name) =>
    /^word\/(document|header\d+|footer\d+|footnotes|endnotes)\.xml$/.test(name),
  );
  const xmlParts = await Promise.all(
    contentFiles.map((name) => zip.file(name)?.async("text") ?? Promise.resolve("")),
  );
  const plainText = decodeXmlText(xmlParts.join("\n"));
  const matches = plainText.match(/\$\{[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9_ -]+\}/g) ?? [];

  return Array.from(
    new Set(matches.map((match) => match.slice(2, -1).trim()).filter((name) => name.length > 0)),
  );
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function createReferenceDocx(template: WordTemplate) {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  );
  zip
    .folder("_rels")
    ?.file(
      ".rels",
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    );
  const paragraphs = [
    template.denomination,
    template.description,
    "",
    "Variables configuradas:",
    ...template.fields.map((item) => `\${${item.name}}`),
  ]
    .map((line) => `<w:p><w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`)
    .join("");
  zip
    .folder("word")
    ?.file(
      "document.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`,
    );
  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function formatFileSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function projectName(projectId: string) {
  return proyectos.find((project) => project.id === projectId)?.nombre ?? projectId;
}

function normalizeVariable(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}

function GestionDocumentalPage() {
  const [templates, setTemplates] = useState<WordTemplate[]>(seedTemplates);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [systemFilter, setSystemFilter] = useState("");
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<WordTemplate | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const [readingFile, setReadingFile] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pageFeedback, setPageFeedback] = useState<Feedback | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WordTemplate | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as WordTemplate[];
        if (Array.isArray(parsed)) setTemplates(parsed);
      }
    } catch {
      // Si el navegador bloquea el almacenamiento, se conservan los datos de demostración.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [hydrated, templates]);

  useEffect(() => {
    setPage(1);
  }, [query, projectFilter, systemFilter]);

  useEffect(() => {
    if (!pageFeedback) return;
    const timer = window.setTimeout(() => setPageFeedback(null), 4200);
    return () => window.clearTimeout(timer);
  }, [pageFeedback]);

  const filteredTemplates = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("es");
    return templates
      .filter((template) => {
        const matchesText =
          !term ||
          template.code.toLocaleLowerCase("es").includes(term) ||
          template.denomination.toLocaleLowerCase("es").includes(term) ||
          template.description.toLocaleLowerCase("es").includes(term) ||
          template.fields.some((item) => item.name.toLocaleLowerCase("es").includes(term));
        const matchesProject = !projectFilter || template.projectIds.includes(projectFilter);
        const matchesSystem =
          !systemFilter || (systemFilter === "system" ? template.system : !template.system);
        return matchesText && matchesProject && matchesSystem;
      })
      .sort((a, b) => a.order - b.order || a.denomination.localeCompare(b.denomination, "es"));
  }, [projectFilter, query, systemFilter, templates]);

  const pageCount = Math.max(1, Math.ceil(filteredTemplates.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleTemplates = filteredTemplates.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function openNewTemplate() {
    setDraft(createEmptyTemplate());
    setSelectedFile(null);
    setRemoveExistingFile(false);
    setFeedback(null);
  }

  function openEditTemplate(template: WordTemplate) {
    setDraft({
      ...template,
      projectIds: [...template.projectIds],
      fields: template.fields.map((item) => ({ ...item })),
    });
    setSelectedFile(null);
    setRemoveExistingFile(false);
    setFeedback(null);
  }

  function closeEditor() {
    setDraft(null);
    setSelectedFile(null);
    setRemoveExistingFile(false);
    setFeedback(null);
  }

  function updateDraft<K extends keyof WordTemplate>(key: K, value: WordTemplate[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateField(id: string, changes: Partial<TemplateField>) {
    setDraft((current) =>
      current
        ? {
            ...current,
            fields: current.fields.map((item) => (item.id === id ? { ...item, ...changes } : item)),
          }
        : current,
    );
  }

  async function handleFileSelection(file: File | undefined) {
    if (!file) return;
    setReadingFile(true);
    setFeedback(null);
    try {
      const names = await extractVariables(file);
      const existingByName = new Map(draft?.fields.map((item) => [item.name, item]));
      const detectedFields = names.map((name, index) => {
        const existing = existingByName.get(name);
        return existing ?? field(name, index);
      });
      setSelectedFile(file);
      setRemoveExistingFile(false);
      setDraft((current) =>
        current
          ? {
              ...current,
              fileName: file.name,
              fileSize: file.size,
              fields: detectedFields,
            }
          : current,
      );
      setFeedback({
        kind: "success",
        text:
          names.length > 0
            ? `Se detectaron ${names.length} variables dentro del documento.`
            : "La plantilla fue cargada, pero no contiene variables con el formato ${NOMBRE_VARIABLE}.",
      });
    } catch (error) {
      setSelectedFile(null);
      setFeedback({
        kind: "error",
        text: error instanceof Error ? error.message : "No se pudo leer la plantilla Word.",
      });
    } finally {
      setReadingFile(false);
    }
  }

  function addManualField() {
    if (!draft) return;
    let index = draft.fields.length + 1;
    let name = `NUEVA_VARIABLE_${index}`;
    while (draft.fields.some((item) => item.name === name)) {
      index += 1;
      name = `NUEVA_VARIABLE_${index}`;
    }
    updateDraft("fields", [...draft.fields, field(name, index)]);
  }

  function validateDraft(template: WordTemplate) {
    if (!template.code.trim()) return "Ingrese el código de la plantilla.";
    if (templates.some((item) => item.id !== template.id && item.code === template.code.trim())) {
      return "El código ingresado ya corresponde a otra plantilla.";
    }
    if (!template.denomination.trim()) return "Ingrese la denominación del documento.";
    if (!template.description.trim()) return "Ingrese la descripción del documento.";
    if (!Number.isFinite(template.order) || template.order < 1)
      return "Ingrese un orden mayor a cero.";
    if (!template.fileName) return "Seleccione una plantilla Word en formato .docx.";
    if (template.fields.some((item) => !VARIABLE_PATTERN.test(item.name))) {
      return "Corrija las variables: deben estar en mayúsculas, sin tildes y separadas por guion bajo.";
    }
    if (new Set(template.fields.map((item) => item.name)).size !== template.fields.length) {
      return "No se permiten variables duplicadas.";
    }
    return null;
  }

  async function saveTemplate(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const validationError = validateDraft(draft);
    if (validationError) {
      setFeedback({ kind: "error", text: validationError });
      return;
    }

    try {
      if (selectedFile) await saveStoredFile(draft.id, selectedFile);
      if (removeExistingFile) await removeStoredFile(draft.id);

      const savedTemplate: WordTemplate = {
        ...draft,
        code: draft.code.trim().toUpperCase(),
        denomination: draft.denomination.trim().toUpperCase(),
        description: draft.description.trim(),
        updatedAt: new Intl.DateTimeFormat("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      };
      setTemplates((current) => {
        const exists = current.some((item) => item.id === savedTemplate.id);
        return exists
          ? current.map((item) => (item.id === savedTemplate.id ? savedTemplate : item))
          : [...current, savedTemplate];
      });
      closeEditor();
      setPageFeedback({ kind: "success", text: "La configuración de la plantilla fue guardada." });
    } catch {
      setFeedback({
        kind: "error",
        text: "No se pudo guardar el archivo en el navegador. Verifique el espacio disponible.",
      });
    }
  }

  async function downloadTemplate(template: WordTemplate) {
    setDownloadingId(template.id);
    try {
      const storedFile = await getStoredFile(template.id);
      const blob = storedFile ?? (await createReferenceDocx(template));
      downloadBlob(blob, template.fileName || `${template.code}.docx`);
      setPageFeedback({
        kind: "success",
        text: storedFile
          ? "Se descargó la plantilla Word registrada."
          : "Se generó una plantilla Word de referencia con las variables configuradas.",
      });
    } catch {
      setPageFeedback({ kind: "error", text: "No fue posible descargar la plantilla." });
    } finally {
      setDownloadingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await removeStoredFile(deleteTarget.id);
    } catch {
      // La metadata también debe poder eliminarse si no existía un archivo en IndexedDB.
    }
    setTemplates((current) => current.filter((item) => item.id !== deleteTarget.id));
    setPageFeedback({ kind: "success", text: "La plantilla fue eliminada." });
    setDeleteTarget(null);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f7f9]">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="border-b border-gray-200 bg-white px-5 py-4 lg:px-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-9 items-center justify-center rounded-md bg-red-50 text-[#dc2626]">
                <FolderArchive size={19} />
              </span>
              <div>
                <h1 className="text-[18px] font-semibold text-gray-900">
                  Configuración de plantillas Word
                </h1>
                <p className="text-[11px] text-gray-500">
                  Gestione los documentos y variables utilizados por los módulos de la plataforma.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openNewTemplate}
              className="inline-flex h-9 items-center gap-1.5 rounded bg-[#dc2626] px-4 text-[12px] font-medium text-white shadow-sm hover:bg-[#b91c1c]"
            >
              <Plus size={15} /> Agregar plantilla
            </button>
          </div>
        </header>

        <div className="space-y-4 p-5 lg:p-7">
          {pageFeedback && <FeedbackMessage feedback={pageFeedback} />}

          <section className="rounded-md border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex flex-wrap items-end gap-3">
                <FilterField label="Proyecto" className="min-w-[220px] flex-1">
                  <select
                    value={projectFilter}
                    onChange={(event) => setProjectFilter(event.target.value)}
                    className={inputCls}
                  >
                    <option value="">Todos los proyectos</option>
                    {proyectos.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.nombre}
                      </option>
                    ))}
                  </select>
                </FilterField>
                <FilterField label="Tipo" className="w-full sm:w-[190px]">
                  <select
                    value={systemFilter}
                    onChange={(event) => setSystemFilter(event.target.value)}
                    className={inputCls}
                  >
                    <option value="">Todos</option>
                    <option value="system">Del sistema</option>
                    <option value="custom">Configurables</option>
                  </select>
                </FilterField>
                <FilterField
                  label="Buscar por denominación, código o variable"
                  className="min-w-[280px] flex-[1.35]"
                >
                  <div className="relative">
                    <Search
                      size={14}
                      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className={`${inputCls} pl-8`}
                      placeholder="Ej.: oficio, HS34PC o CODIGO_DE_PREDIO"
                    />
                  </div>
                </FilterField>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1160px] border-collapse text-left text-[11px]">
                <thead className="bg-gray-50 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="w-12 border-b border-gray-200 px-3 py-2 text-center">#</th>
                    <th className="w-28 border-b border-gray-200 px-3 py-2">Código</th>
                    <th className="w-48 border-b border-gray-200 px-3 py-2">Proyecto vinculado</th>
                    <th className="w-16 border-b border-gray-200 px-3 py-2 text-center">Orden</th>
                    <th className="border-b border-gray-200 px-3 py-2">
                      Denominación y descripción
                    </th>
                    <th className="w-24 border-b border-gray-200 px-3 py-2 text-center">Sistema</th>
                    <th className="w-24 border-b border-gray-200 px-3 py-2 text-center">
                      Variables
                    </th>
                    <th className="w-44 border-b border-gray-200 px-3 py-2">Archivo Word</th>
                    <th className="w-32 border-b border-gray-200 px-3 py-2">Actualización</th>
                    <th className="w-28 border-b border-gray-200 px-3 py-2 text-center">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleTemplates.map((template, index) => (
                    <tr key={template.id} className="hover:bg-red-50/25">
                      <td className="px-3 py-2.5 text-center text-gray-400">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="rounded bg-gray-100 px-2 py-1 font-mono text-[10px] font-semibold text-gray-700">
                          {template.code}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-700">
                        {template.projectIds.length ? (
                          <div className="flex flex-wrap gap-1">
                            {template.projectIds.map((projectId) => (
                              <span
                                key={projectId}
                                className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[9px]"
                              >
                                {projectName(projectId)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin vínculo específico</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center font-medium text-gray-600">
                        {template.order}
                      </td>
                      <td className="max-w-[430px] px-3 py-2.5">
                        <p className="font-medium text-gray-800">{template.denomination}</p>
                        <p className="mt-0.5 line-clamp-1 text-[10px] text-gray-500">
                          {template.description}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {template.system ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[9px] font-semibold text-green-700">
                            <Check size={10} /> Sí
                          </span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="inline-flex min-w-7 justify-center rounded bg-red-50 px-2 py-1 font-semibold text-[#dc2626]">
                          {template.fields.length}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <p
                          className="max-w-[165px] truncate text-[10px] font-medium text-gray-700"
                          title={template.fileName}
                        >
                          {template.fileName}
                        </p>
                        <p className="mt-0.5 text-[9px] text-gray-400">
                          {formatFileSize(template.fileSize)}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 text-[10px] text-gray-500">
                        {template.updatedAt}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <IconButton
                            label="Descargar plantilla"
                            onClick={() => void downloadTemplate(template)}
                            disabled={downloadingId === template.id}
                          >
                            {downloadingId === template.id ? (
                              <LoaderCircle size={14} className="animate-spin" />
                            ) : (
                              <Download size={14} />
                            )}
                          </IconButton>
                          <IconButton
                            label="Editar plantilla"
                            onClick={() => openEditTemplate(template)}
                          >
                            <Pencil size={14} />
                          </IconButton>
                          <IconButton
                            label="Eliminar plantilla"
                            tone="danger"
                            onClick={() => setDeleteTarget(template)}
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visibleTemplates.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-14 text-center">
                        <FileText className="mx-auto mb-2 text-gray-300" size={32} />
                        <p className="font-medium text-gray-600">No se encontraron plantillas</p>
                        <p className="mt-1 text-[10px] text-gray-400">
                          Cambie los filtros o registre un nuevo documento.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 text-[10px] text-gray-500">
              <span>
                Mostrando {visibleTemplates.length} de {filteredTemplates.length} plantillas
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="inline-flex size-8 items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="inline-flex h-8 min-w-20 items-center justify-center rounded border border-gray-200 bg-gray-50 px-2">
                  {currentPage} de {pageCount}
                </span>
                <button
                  type="button"
                  disabled={currentPage === pageCount}
                  onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                  className="inline-flex size-8 items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </footer>
          </section>

          <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] leading-4 text-blue-700">
            En este prototipo, la configuración y los archivos Word se guardan en el navegador. Para
            un entorno multiusuario, deben persistirse mediante el servicio documental
            institucional.
          </div>
        </div>
      </main>

      {draft && (
        <TemplateEditor
          draft={draft}
          feedback={feedback}
          readingFile={readingFile}
          selectedFile={selectedFile}
          onClose={closeEditor}
          onSubmit={saveTemplate}
          onUpdate={updateDraft}
          onFileSelected={(file) => void handleFileSelection(file)}
          onRemoveFile={() => {
            setSelectedFile(null);
            setRemoveExistingFile(true);
            setDraft((current) =>
              current ? { ...current, fileName: "", fileSize: 0, fields: [] } : current,
            );
          }}
          onAddField={addManualField}
          onUpdateField={updateField}
          onDeleteField={(id) =>
            updateDraft(
              "fields",
              draft.fields.filter((item) => item.id !== id),
            )
          }
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#dc2626]">
                <Trash2 size={18} />
              </span>
              <div>
                <h2 className="text-[15px] font-semibold text-gray-900">Eliminar plantilla Word</h2>
                <p className="mt-1 text-[11px] leading-5 text-gray-600">
                  Se eliminará <strong>{deleteTarget.denomination}</strong>, su configuración y el
                  archivo cargado en este navegador.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="inline-flex h-8 items-center rounded border border-gray-300 px-4 text-[12px] hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                className="inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-4 text-[12px] font-medium text-white hover:bg-[#b91c1c]"
              >
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateEditor({
  draft,
  feedback,
  readingFile,
  selectedFile,
  onClose,
  onSubmit,
  onUpdate,
  onFileSelected,
  onRemoveFile,
  onAddField,
  onUpdateField,
  onDeleteField,
}: {
  draft: WordTemplate;
  feedback: Feedback | null;
  readingFile: boolean;
  selectedFile: File | null;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  onUpdate: <K extends keyof WordTemplate>(key: K, value: WordTemplate[K]) => void;
  onFileSelected: (file: File | undefined) => void;
  onRemoveFile: () => void;
  onAddField: () => void;
  onUpdateField: (id: string, changes: Partial<TemplateField>) => void;
  onDeleteField: (id: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/45 p-3"
      onMouseDown={onClose}
    >
      <form
        onSubmit={onSubmit}
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[96vh] w-full max-w-[1040px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-red-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#dc2626]">
              Gestión documental
            </p>
            <h2 className="mt-1 text-[16px] font-semibold text-gray-900">
              {draft.updatedAt ? "Editar plantilla Word" : "Agregar plantilla Word"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded hover:bg-gray-100"
            aria-label="Cerrar editor"
          >
            <X size={17} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {feedback && <FeedbackMessage feedback={feedback} />}

          <div className="mt-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-[11px] leading-5 text-red-800">
            <p className="font-semibold">Importante para preparar el documento Word</p>
            <p>
              Escriba las variables en mayúsculas, sin tildes y separadas por guion bajo. Deben ir
              entre signo de dólar y llaves; por ejemplo:{" "}
              <code className="rounded bg-white px-1 py-0.5 text-[10px]">
                {"${CODIGO_DE_PREDIO}"}
              </code>
              ,{" "}
              <code className="rounded bg-white px-1 py-0.5 text-[10px]">
                {"${NOMBRE_DEL_PROYECTO}"}
              </code>
              .
            </p>
            <p className="mt-1">
              Ejemplo: El código del predio es <strong>{"${CODIGO_DE_PREDIO}"}</strong> y el
              proyecto es <strong>{"${NOMBRE_DEL_PROYECTO}"}</strong>.
            </p>
          </div>

          <SectionTitle>Datos del documento</SectionTitle>
          <div className="grid gap-x-8 gap-y-3 lg:grid-cols-2">
            <Field label="Código" required>
              <input
                value={draft.code}
                onChange={(event) => onUpdate("code", event.target.value.toUpperCase())}
                maxLength={12}
                className={`${inputCls} font-mono uppercase`}
              />
            </Field>
            <Field label="Orden" required>
              <input
                type="number"
                min={1}
                value={draft.order}
                onChange={(event) => onUpdate("order", Number(event.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="Plantilla del sistema">
              <label className="inline-flex items-center gap-2 text-[11px] text-gray-700">
                <input
                  type="checkbox"
                  checked={draft.system}
                  onChange={(event) => onUpdate("system", event.target.checked)}
                  className="size-4 accent-[#dc2626]"
                />
                Disponible como documento institucional
              </label>
            </Field>
            <Field label="Proyecto vinculado">
              <select
                className={inputCls}
                value={draft.projectIds[0] ?? ""}
                onChange={(event) =>
                  onUpdate("projectIds", event.target.value ? [event.target.value] : [])
                }
              >
                <option value="">Sin vínculo específico</option>
                {proyectos.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.nombre}
                  </option>
                ))}
              </select>
            </Field>
            <div className="lg:col-span-2">
              <Field label="Denominación" required>
                <input
                  value={draft.denomination}
                  onChange={(event) => onUpdate("denomination", event.target.value)}
                  className={inputCls}
                  placeholder="Ej.: OFICIO DE INTENCIÓN DE COMPRA"
                />
              </Field>
            </div>
            <div className="lg:col-span-2">
              <Field label="Descripción" required alignStart>
                <textarea
                  value={draft.description}
                  onChange={(event) => onUpdate("description", event.target.value)}
                  className={textareaCls}
                  placeholder="Indique el uso y alcance de la plantilla..."
                />
              </Field>
            </div>
          </div>

          <SectionTitle>Archivo de plantilla</SectionTitle>
          <Field label="Template Word (.docx)" required alignStart>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(event) => {
                  onFileSelected(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              {!draft.fileName ? (
                <button
                  type="button"
                  disabled={readingFile}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-20 w-full items-center justify-center gap-3 rounded border border-dashed border-red-300 bg-red-50/40 px-4 text-left hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                >
                  {readingFile ? (
                    <LoaderCircle size={22} className="animate-spin text-[#dc2626]" />
                  ) : (
                    <Upload size={22} className="text-[#dc2626]" />
                  )}
                  <span>
                    <strong className="block text-[12px] text-gray-800">
                      {readingFile ? "Analizando variables..." : "Seleccionar documento Word"}
                    </strong>
                    <span className="text-[10px] text-gray-500">
                      Formato .docx · máximo recomendado 10 MB
                    </span>
                  </span>
                </button>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 bg-gray-50 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText size={22} className="shrink-0 text-blue-600" />
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-medium text-gray-800">
                        {draft.fileName}
                      </p>
                      <p className="text-[9px] text-gray-500">
                        {formatFileSize(draft.fileSize)} · {draft.fields.length} variables
                        detectadas{selectedFile ? " · archivo nuevo" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 bg-white px-3 text-[10px] hover:bg-gray-50"
                    >
                      <Upload size={13} /> Reemplazar
                    </button>
                    <button
                      type="button"
                      onClick={onRemoveFile}
                      className="inline-flex h-8 items-center gap-1.5 rounded border border-red-200 bg-white px-3 text-[10px] text-[#dc2626] hover:bg-red-50"
                    >
                      <Trash2 size={13} /> Quitar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Field>

          <div className="mb-2 mt-5 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
            <div>
              <h3 className="text-[13px] font-semibold text-[#dc2626]">Variables del documento</h3>
              <p className="text-[10px] text-gray-500">
                Se detectan automáticamente al cargar el archivo y también pueden ajustarse aquí.
              </p>
            </div>
            <button
              type="button"
              onClick={onAddField}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-red-200 px-3 text-[10px] font-medium text-[#dc2626] hover:bg-red-50"
            >
              <Plus size={13} /> Agregar variable
            </button>
          </div>

          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="w-full min-w-[760px] border-collapse text-[11px]">
              <thead className="bg-gray-100 text-[9px] font-semibold uppercase text-gray-500">
                <tr>
                  <th className="w-12 border-b border-gray-200 px-2 py-2 text-center">#</th>
                  <th className="border-b border-gray-200 px-2 py-2 text-left">Nombre del campo</th>
                  <th className="w-36 border-b border-gray-200 px-2 py-2 text-left">Tamaño</th>
                  <th className="w-28 border-b border-gray-200 px-2 py-2 text-left">
                    Nro. caracteres
                  </th>
                  <th className="w-36 border-b border-gray-200 px-2 py-2 text-left">Tipo</th>
                  <th className="w-16 border-b border-gray-200 px-2 py-2 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {draft.fields.map((item, index) => {
                  const invalid = !VARIABLE_PATTERN.test(item.name);
                  return (
                    <tr key={item.id}>
                      <td className="px-2 py-2 text-center text-gray-400">{index + 1}</td>
                      <td className="px-2 py-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-gray-400">
                            {"${"}
                          </span>
                          <input
                            value={item.name}
                            onChange={(event) =>
                              onUpdateField(item.id, {
                                name: normalizeVariable(event.target.value),
                              })
                            }
                            className={`${inputCls} pl-6 pr-5 font-mono ${invalid ? "border-red-400 bg-red-50" : ""}`}
                            aria-invalid={invalid}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-gray-400">
                            {"}"}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={item.size}
                          onChange={(event) =>
                            onUpdateField(item.id, { size: event.target.value as FieldSize })
                          }
                          className={inputCls}
                        >
                          <option value="CORTO">Corto</option>
                          <option value="MEDIANO">Mediano</option>
                          <option value="LARGO">Largo</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={1}
                          max={10000}
                          value={item.maxLength}
                          onChange={(event) =>
                            onUpdateField(item.id, { maxLength: Number(event.target.value) })
                          }
                          className={inputCls}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={item.type}
                          onChange={(event) =>
                            onUpdateField(item.id, { type: event.target.value as FieldType })
                          }
                          className={inputCls}
                        >
                          <option value="text">Texto</option>
                          <option value="number">Número</option>
                          <option value="date">Fecha</option>
                          <option value="currency">Moneda</option>
                        </select>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <IconButton
                          label="Eliminar variable"
                          tone="danger"
                          onClick={() => onDeleteField(item.id)}
                        >
                          <Trash2 size={13} />
                        </IconButton>
                      </td>
                    </tr>
                  );
                })}
                {draft.fields.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-[10px] text-gray-400">
                      Cargue una plantilla Word para detectar variables o agréguelas manualmente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-5 py-3">
          <span className="text-[10px] text-gray-500">
            Los campos marcados con * son obligatorios.
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 px-4 text-[12px] hover:bg-gray-50"
            >
              <X size={14} /> Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-4 text-[12px] font-medium text-white hover:bg-[#b91c1c]"
            >
              <Save size={14} /> Guardar plantilla
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  alignStart = false,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  alignStart?: boolean;
}) {
  return (
    <div
      className={`grid gap-1.5 sm:grid-cols-[180px_minmax(0,1fr)] ${alignStart ? "sm:items-start" : "sm:items-center"}`}
    >
      <label className={`text-[12px] text-gray-700 sm:text-right ${alignStart ? "sm:pt-2" : ""}`}>
        {required && <span className="text-[#dc2626]">* </span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-5 border-b border-gray-200 pb-1">
      <h3 className="text-[13px] font-semibold text-[#dc2626]">{children}</h3>
    </div>
  );
}

function FilterField({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function IconButton({
  label,
  children,
  onClick,
  tone = "default",
  disabled,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  tone?: "default" | "danger";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex size-7 items-center justify-center rounded border bg-white transition disabled:cursor-wait disabled:opacity-50 ${tone === "danger" ? "border-red-200 text-[#dc2626] hover:bg-red-50" : "border-gray-300 text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-[#dc2626]"}`}
    >
      {children}
    </button>
  );
}

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
  return (
    <div
      className={`flex items-center gap-2 rounded border px-3 py-2 text-[11px] ${feedback.kind === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}
    >
      {feedback.kind === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
      {feedback.text}
    </div>
  );
}
