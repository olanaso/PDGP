export type DocumentSectionId =
  | "procesos-judiciales"
  | "otros-documentos"
  | "sucesion-intestada"
  | "documentos-posesion"
  | "cargas-gravamenes"
  | "titulos-archivados";

export type DocumentIconId = "scale" | "files" | "succession" | "possession" | "charges" | "archive";

export type PredioDocumentRecord = {
  id: string;
  fechaDocumento: string;
  anioTitulo: string;
  tipoDocumento: string;
  numeroDocumento: string;
  oficinaRegistral: string;
  descripcion: string;
  numeroExpedienteJudicial: string;
  distritoJudicial: string;
  instancia: string;
  especialidad: string;
  archivo: File | null;
};

export type DocumentFieldKey = Exclude<keyof PredioDocumentRecord, "id" | "archivo">;

export type DocumentFormField = {
  key: DocumentFieldKey;
  label: string;
  type: "text" | "date" | "number" | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

export type DocumentColumn = {
  key: DocumentFieldKey | "archivo";
  label: string;
  className?: string;
};

export type DocumentSectionConfig = {
  id: DocumentSectionId;
  title: string;
  icon: DocumentIconId;
  createTitle: string;
  editTitle: string;
  viewTitle: string;
  columns: DocumentColumn[];
  formFields: DocumentFormField[];
  emptyMessage: string;
  endpoint: string;
};

const GENERAL_FIELDS: DocumentFormField[] = [
  { key: "fechaDocumento", label: "Fecha del documento", type: "date", required: true },
  {
    key: "anioTitulo",
    label: "Año del título",
    type: "number",
    required: true,
    placeholder: "Ej. 2026",
  },
  {
    key: "tipoDocumento",
    label: "Tipo de documento",
    type: "select",
    required: true,
    options: ["Acta", "Carta", "Certificado", "Escritura pública", "Informe", "Resolución", "Título", "Otro"],
  },
  {
    key: "numeroDocumento",
    label: "Número de documento",
    type: "text",
    required: true,
    placeholder: "Ingrese el número",
  },
  {
    key: "oficinaRegistral",
    label: "Oficina registral",
    type: "text",
    required: true,
    placeholder: "Ingrese la oficina registral",
  },
  {
    key: "descripcion",
    label: "Descripción",
    type: "text",
    required: true,
    placeholder: "Describa brevemente el documento",
  },
];

const JUDICIAL_FIELDS: DocumentFormField[] = [
  {
    key: "numeroExpedienteJudicial",
    label: "N.º de expediente judicial",
    type: "text",
    required: true,
  },
  { key: "distritoJudicial", label: "Distrito judicial", type: "text", required: true },
  {
    key: "instancia",
    label: "Instancia",
    type: "select",
    required: true,
    options: ["Juzgado de Paz Letrado", "Primera instancia", "Segunda instancia", "Corte Suprema"],
  },
  {
    key: "especialidad",
    label: "Especialidad",
    type: "select",
    required: true,
    options: ["Civil", "Contencioso administrativo", "Laboral", "Penal", "Constitucional", "Otra"],
  },
];

const GENERAL_COLUMNS: DocumentColumn[] = [
  { key: "fechaDocumento", label: "Fecha documento", className: "whitespace-nowrap" },
  { key: "anioTitulo", label: "Año título", className: "whitespace-nowrap" },
  { key: "tipoDocumento", label: "Tipo de documento", className: "min-w-[140px]" },
  { key: "numeroDocumento", label: "N.º documento", className: "min-w-[130px]" },
  { key: "oficinaRegistral", label: "Oficina registral", className: "min-w-[150px]" },
  { key: "descripcion", label: "Descripción", className: "min-w-[220px]" },
  { key: "archivo", label: "Archivo", className: "min-w-[130px]" },
];

const JUDICIAL_COLUMNS: DocumentColumn[] = [
  ...GENERAL_COLUMNS.slice(0, 5),
  { key: "numeroExpedienteJudicial", label: "Expediente judicial", className: "min-w-[150px]" },
  { key: "distritoJudicial", label: "Distrito judicial", className: "min-w-[140px]" },
  { key: "instancia", label: "Instancia", className: "min-w-[130px]" },
  { key: "especialidad", label: "Especialidad", className: "min-w-[130px]" },
  ...GENERAL_COLUMNS.slice(5),
];

const section = (
  config: Omit<DocumentSectionConfig, "columns" | "formFields" | "emptyMessage"> & {
    judicial?: boolean;
  },
): DocumentSectionConfig => ({
  ...config,
  columns: config.judicial ? JUDICIAL_COLUMNS : GENERAL_COLUMNS,
  formFields: config.judicial
    ? [...GENERAL_FIELDS.slice(0, 5), ...JUDICIAL_FIELDS, GENERAL_FIELDS[5]]
    : GENERAL_FIELDS,
  emptyMessage: "Sin registros disponibles",
});

export const DOCUMENT_SECTION_CONFIGS: DocumentSectionConfig[] = [
  section({
    id: "procesos-judiciales",
    title: "Procesos Judiciales",
    icon: "scale",
    createTitle: "Registrar proceso judicial",
    editTitle: "Editar proceso judicial",
    viewTitle: "Ver proceso judicial",
    endpoint: "/api/predios/:codigo/procesos-judiciales",
    judicial: true,
  }),
  section({
    id: "otros-documentos",
    title: "Otros Documentos",
    icon: "files",
    createTitle: "Registrar otro documento",
    editTitle: "Editar otro documento",
    viewTitle: "Ver otro documento",
    endpoint: "/api/predios/:codigo/otros-documentos",
  }),
  section({
    id: "sucesion-intestada",
    title: "Sucesión Intestada",
    icon: "succession",
    createTitle: "Registrar sucesión intestada",
    editTitle: "Editar sucesión intestada",
    viewTitle: "Ver sucesión intestada",
    endpoint: "/api/predios/:codigo/sucesion-intestada",
  }),
  section({
    id: "documentos-posesion",
    title: "Documentos que Acreditan la Posesión",
    icon: "possession",
    createTitle: "Registrar documento que acredita la posesión",
    editTitle: "Editar documento que acredita la posesión",
    viewTitle: "Ver documento que acredita la posesión",
    endpoint: "/api/predios/:codigo/documentos-posesion",
  }),
  section({
    id: "cargas-gravamenes",
    title: "Cargas o Gravámenes",
    icon: "charges",
    createTitle: "Registrar carga o gravamen",
    editTitle: "Editar carga o gravamen",
    viewTitle: "Ver carga o gravamen",
    endpoint: "/api/predios/:codigo/cargas-gravamenes",
  }),
  section({
    id: "titulos-archivados",
    title: "Títulos Archivados",
    icon: "archive",
    createTitle: "Registrar título archivado",
    editTitle: "Editar título archivado",
    viewTitle: "Ver título archivado",
    endpoint: "/api/predios/:codigo/titulos-archivados",
  }),
];

export const EMPTY_DOCUMENT_RECORD: PredioDocumentRecord = {
  id: "",
  fechaDocumento: "",
  anioTitulo: "",
  tipoDocumento: "",
  numeroDocumento: "",
  oficinaRegistral: "",
  descripcion: "",
  numeroExpedienteJudicial: "",
  distritoJudicial: "",
  instancia: "",
  especialidad: "",
  archivo: null,
};

export const MAX_DOCUMENT_FILE_SIZE = 10 * 1024 * 1024;
export const DOCUMENT_FILE_ACCEPT = ".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp";

const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "png", "jpg", "jpeg", "webp"];

export function validateDocumentFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return "Formato no permitido. Adjunte un archivo PDF, Word o una imagen.";
  }
  if (file.size > MAX_DOCUMENT_FILE_SIZE) {
    return "El archivo supera el tamaño máximo permitido de 10 MB.";
  }
  return "";
}

export function formatDocumentFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
