import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Briefcase,
  CheckCircle2,
  Download,
  Edit,
  FileText,
  History,
  Mail,
  Paperclip,
  Plus,
  Save,
  Send,
  X,
} from "lucide-react";

import { AppSidebar } from "@/components/AppSidebar";
import { predioRows } from "@/lib/prediosData";
import { proyectos } from "@/lib/projectsData";

export const Route = createFileRoute("/servicios")({
  head: () => ({ meta: [{ title: "Servicios" }] }),
  component: ServiciosPage,
});

const RED = "#dc2626";
const inputCls = "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";
const textAreaCls = "min-h-[68px] px-2 py-1.5 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";

type Estado =
  | "REGISTRO"
  | "REVISION"
  | "ENVIADO ADMINISTRACION"
  | "APROBADO"
  | "RECHAZADO"
  | "CONTRATADO"
  | "SEGUIMIENTO"
  | "CONFORMIDAD"
  | "PAGO"
  | "CERRADO";
type Prioridad = "ALTA" | "MEDIA" | "BAJA";

type Documento = {
  id: number;
  nombre: string;
  version: string;
  archivo: string;
  responsable: string;
  fecha: string;
};

type UsuarioAdministracion = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
};

type Cambio = {
  id: number;
  fecha: string;
  usuario: string;
  estado: Estado;
  detalle: string;
};

type Solicitud = {
  id: number;
  codigo: string;
  proyectoId: string;
  predioCodigo: string;
  responsable: string;
  tipoServicio: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  montoEstimado: number;
  montoAprobado: number;
  montoContratado: number;
  montoEjecutado: number;
  fechaSolicitud: string;
  fechaRequerida: string;
  prioridad: Prioridad;
  proveedor: string;
  correosNotificacion: string;
  hojaRuta: string;
  estado: Estado;
  avance: number;
  documentos: Documento[];
  historial: Cambio[];
};

type SolicitudForm = Omit<Solicitud, "id" | "codigo" | "documentos" | "historial">;

const estados: Estado[] = [
  "REGISTRO",
  "REVISION",
  "ENVIADO ADMINISTRACION",
  "APROBADO",
  "RECHAZADO",
  "CONTRATADO",
  "SEGUIMIENTO",
  "CONFORMIDAD",
  "PAGO",
  "CERRADO",
];

const serviciosBase = [
  "1.MAQUINAS Y EQUIPOS - 2.6.3.2.1.1",
  "2.MOBILIARIO - 2.6.3.2.1.2",
  "1.EQUIPOS COMPUTACIONALES Y PERIFERICOS - 2.6.3.2.3.1",
  "1.AIRE ACONDICIONADO Y REFRIGERACION - 2.6.3.2.9.1",
  "5.EQUIPOS E INSTRUMENTOS DE MEDICION - 2.6.3.2.9.5",
  "1.TERRENOS URBANOS - 2.6.5.1.1.1",
  "2.TERRENOS RURALES - 2.6.5.1.1.2",
  "2.SOFTWARES - 2.6.6.1.3.2",
  "2.GASTO POR LA COMPRA DE BIENES - 2.6.8.1.4.2",
  "3.GASTO POR LA CONTRATACION DE SERVICIOS - 2.6.8.1.4.3",
  "4.GASTO POR LAUDOS ARBITRALES O SENTENCIAS VINCULADAS A INVERSIONES - 2.6.8.1.4.4",
  "99.OTROS GASTOS - 2.6.8.1.4.99",
  "3.EQUIPOS DE TELECOMUNICACIONES - 2.6.3.2.3.3",
];

const administracionRoles = [
  "Administracion",
  "Tesoreria",
  "Logistica",
  "Abastecimiento",
  "Control presupuestal",
];

const usuariosAdministracion: UsuarioAdministracion[] = [
  { id: "ADM-000", nombre: "Mesa Administracion Predial", email: "administracion.predial@mtc.gob.pe", rol: "Administracion" },
  { id: "ADM-001", nombre: "Ana Maria Campos", email: "ana.campos@mtc.gob.pe", rol: "Administracion" },
  { id: "ADM-002", nombre: "Jorge Salazar Rios", email: "jorge.salazar@mtc.gob.pe", rol: "Tesoreria" },
  { id: "ADM-003", nombre: "Carmen Ruiz Vega", email: "carmen.ruiz@mtc.gob.pe", rol: "Logistica" },
  { id: "ADM-004", nombre: "Luis Paredes Soto", email: "luis.paredes@mtc.gob.pe", rol: "Abastecimiento" },
  { id: "ADM-005", nombre: "Milagros Huaman", email: "milagros.huaman@mtc.gob.pe", rol: "Control presupuestal" },
];

const initialSolicitudes: Solicitud[] = [
  {
    id: 1,
    codigo: "SS-2026-PRY-016-0001",
    proyectoId: "jauja",
    predioCodigo: "AERO-JAUJA-PR-0567T",
    responsable: "Marcos Armando Soto Luis",
    tipoServicio: "3.GASTO POR LA CONTRATACION DE SERVICIOS - 2.6.8.1.4.3",
    descripcion: "Levantamiento topografico complementario para sectores con observacion tecnica.",
    cantidad: 3,
    unidad: "sectores",
    montoEstimado: 42000,
    montoAprobado: 40000,
    montoContratado: 39000,
    montoEjecutado: 18000,
    fechaSolicitud: "2026-07-02",
    fechaRequerida: "2026-07-25",
    prioridad: "ALTA",
    proveedor: "Consorcio GeoAndes",
    correosNotificacion: "administracion.predial@mtc.gob.pe; coordinacion.predial@mtc.gob.pe",
    hojaRuta: "HR-2026-004512",
    estado: "SEGUIMIENTO",
    avance: 46,
    documentos: [
      { id: 1, nombre: "TDR topografia complementaria", version: "v1", archivo: "tdr_topografia_jauja.pdf", responsable: "Especialista tecnico", fecha: "02/07/2026 10:30" },
      { id: 2, nombre: "Cotizacion GeoAndes", version: "v1", archivo: "cotizacion_geoandes.pdf", responsable: "Administracion", fecha: "04/07/2026 12:15" },
    ],
    historial: [
      { id: 1, fecha: "02/07/2026 10:30", usuario: "Especialista tecnico", estado: "REGISTRO", detalle: "Solicitud registrada con TDR inicial." },
      { id: 2, fecha: "04/07/2026 12:15", usuario: "Administracion", estado: "CONTRATADO", detalle: "Servicio contratado y proveedor asignado." },
      { id: 3, fecha: "10/07/2026 09:00", usuario: "Coordinador predial", estado: "SEGUIMIENTO", detalle: "Se registra avance parcial del servicio." },
    ],
  },
  {
    id: 2,
    codigo: "SS-2026-PRY-024-0002",
    proyectoId: "autopista-del-sol",
    predioCodigo: "",
    responsable: "Marlon Napravnick Noriega",
    tipoServicio: "3.GASTO POR LA CONTRATACION DE SERVICIOS - 2.6.8.1.4.3",
    descripcion: "Revision legal de expedientes con titulares observados.",
    cantidad: 12,
    unidad: "expedientes",
    montoEstimado: 24000,
    montoAprobado: 24000,
    montoContratado: 0,
    montoEjecutado: 0,
    fechaSolicitud: "2026-07-08",
    fechaRequerida: "2026-08-05",
    prioridad: "MEDIA",
    proveedor: "Por asignar",
    correosNotificacion: "administracion.predial@mtc.gob.pe; legal.predial@mtc.gob.pe",
    hojaRuta: "",
    estado: "APROBADO",
    avance: 10,
    documentos: [
      { id: 1, nombre: "TDR asesoria legal", version: "v2", archivo: "tdr_asesoria_legal_v2.pdf", responsable: "Especialista legal", fecha: "09/07/2026 08:45" },
    ],
    historial: [
      { id: 1, fecha: "08/07/2026 16:20", usuario: "Especialista legal", estado: "REGISTRO", detalle: "Solicitud creada." },
      { id: 2, fecha: "09/07/2026 11:10", usuario: "Coordinador predial", estado: "APROBADO", detalle: "Solicitud aprobada para gestion administrativa." },
    ],
  },
];

function nowLabel() {
  return new Date().toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function money(value: number) {
  return `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function makeSolicitudCode(index: number, projectId: string) {
  const proyecto = proyectos.find((item) => item.id === projectId);
  return `SS-${new Date().getFullYear()}-${proyecto?.codigo ?? "PRY-000"}-${String(index).padStart(4, "0")}`;
}

function normalizeText(value: string | undefined | null) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function prediosForProject(projectId: string) {
  const proyecto = proyectos.find((item) => item.id === projectId);
  if (!proyecto) return [];
  const projectName = normalizeText(proyecto.nombre);
  const projectIdText = normalizeText(projectId);
  return predioRows.filter((predio) => {
    const rowProject = normalizeText(predio.proyecto);
    const rowCode = normalizeText(predio.cod || predio.codigo);
    return rowProject.includes(projectName) || rowProject.includes(projectIdText) || rowCode.includes(projectIdText);
  });
}

const exportHeaders = [
  "Codigo interno",
  "Proyecto",
  "Predio vinculado",
  "Responsable",
  "Tipo de servicio",
  "Descripcion",
  "Cantidad",
  "Unidad",
  "Monto estimado",
  "Monto aprobado",
  "Monto contratado",
  "Monto ejecutado",
  "Fecha solicitud",
  "Fecha requerida",
  "Prioridad",
  "Proveedor asignado",
  "Correos notificacion",
  "Hoja de Ruta",
  "Estado",
  "Avance %",
  "Documentos y versiones",
  "Historial de cambios",
];

function projectLabel(projectId: string) {
  const proyecto = proyectos.find((item) => item.id === projectId);
  return proyecto ? `${proyecto.codigo} - ${proyecto.nombre}` : projectId;
}

function documentsLabel(documentos: Documento[]) {
  if (!documentos.length) return "Sin documentos";
  return documentos
    .map((item) => `${item.nombre} (${item.version}) - ${item.archivo || "Sin archivo"} - ${item.responsable} - ${item.fecha}`)
    .join(" | ");
}

function historyLabel(historial: Cambio[]) {
  if (!historial.length) return "Sin historial";
  return historial
    .map((item) => `${item.fecha} - ${item.usuario} - ${item.estado}: ${item.detalle}`)
    .join(" | ");
}

function solicitudExportRow(item: Solicitud): Array<string | number> {
  return [
    item.codigo,
    projectLabel(item.proyectoId),
    item.predioCodigo || "Sin vinculo",
    item.responsable,
    item.tipoServicio,
    item.descripcion,
    item.cantidad,
    item.unidad,
    item.montoEstimado,
    item.montoAprobado,
    item.montoContratado,
    item.montoEjecutado,
    item.fechaSolicitud,
    item.fechaRequerida,
    item.prioridad,
    item.proveedor || "Por asignar",
    item.correosNotificacion,
    item.hojaRuta || "Sin hoja de ruta",
    item.estado,
    item.avance,
    documentsLabel(item.documentos),
    historyLabel(item.historial),
  ];
}

function escapeHtml(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

function exportSolicitudesExcel(rows: Solicitud[]) {
  const stamp = new Date().toISOString().slice(0, 10);
  const tableRows = rows.map((item) => solicitudExportRow(item));
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; }
    table { border-collapse: collapse; width: 100%; }
    th { background: #dc2626; color: #fff; font-weight: bold; }
    th, td { border: 1px solid #d1d5db; padding: 6px; vertical-align: top; mso-number-format:"\\@"; }
    .number { mso-number-format:"0.00"; }
  </style>
</head>
<body>
  <h3>Solicitudes y Control de Servicios</h3>
  <p>Fecha de exportacion: ${stamp} | Registros: ${rows.length}</p>
  <table>
    <thead><tr>${exportHeaders.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
    <tbody>
      ${tableRows
        .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
        .join("")}
    </tbody>
  </table>
</body>
</html>`;
  downloadBlobFile(`solicitudes_servicios_${stamp}.xls`, new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8" }));
}

function pdfSafe(value: string | number) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/[\\()]/g, "\\$&");
}

function wrapPdfLine(value: string | number, max = 104) {
  const text = String(value).replace(/\s+/g, " ").trim();
  if (!text) return [""];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function createSolicitudesPdfBlob(rows: Solicitud[], totals: { estimado: number; aprobado: number; contratado: number; ejecutado: number }) {
  const stamp = new Date().toISOString().slice(0, 10);
  const rawLines = [
    "Solicitudes y Control de Servicios",
    `Fecha de exportacion: ${stamp}`,
    `Registros: ${rows.length}`,
    `Totales: estimado ${money(totals.estimado)} | aprobado ${money(totals.aprobado)} | contratado ${money(totals.contratado)} | ejecutado ${money(totals.ejecutado)}`,
    "",
    ...rows.flatMap((item, index) => {
      const values = solicitudExportRow(item);
      return [
        `${index + 1}. ${item.codigo}`,
        ...exportHeaders.map((header, headerIndex) => `${header}: ${values[headerIndex]}`),
        "",
      ];
    }),
  ];
  return createTextPdfBlob(rawLines);
}

function createTextPdfBlob(rawLines: Array<string | number>) {
  const pageLineLimit = 56;
  const lines = rawLines.flatMap((line) => wrapPdfLine(line));
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += pageLineLimit) pages.push(lines.slice(i, i + pageLineLimit));
  if (!pages.length) pages.push(["Sin registros"]);

  const objects: string[] = [];
  const addObject = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  addObject("<< /Type /Catalog /Pages 2 0 R >>");
  addObject("");
  const fontObj = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const pageObjectNumbers: number[] = [];

  pages.forEach((pageLines) => {
    const streamLines = [
      "BT",
      "/F1 9 Tf",
      "42 800 Td",
      "12 TL",
      ...pageLines.map((line) => `(${pdfSafe(line)}) Tj T*`),
      "ET",
    ];
    const stream = streamLines.join("\n");
    const contentObj = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageObj = addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObj} 0 R >> >> /Contents ${contentObj} 0 R >>`);
    pageObjectNumbers.push(pageObj);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((num) => `${num} 0 R`).join(" ")}] /Count ${pageObjectNumbers.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets[index + 1] = pdf.length;
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function exportSolicitudesPdf(rows: Solicitud[], totals: { estimado: number; aprobado: number; contratado: number; ejecutado: number }) {
  const stamp = new Date().toISOString().slice(0, 10);
  downloadBlobFile(`solicitudes_servicios_${stamp}.pdf`, createSolicitudesPdfBlob(rows, totals));
}

function emptyForm(): SolicitudForm {
  return {
    proyectoId: "jauja",
    predioCodigo: "",
    responsable: "Coordinacion predial",
    tipoServicio: "3.GASTO POR LA CONTRATACION DE SERVICIOS - 2.6.8.1.4.3",
    descripcion: "",
    cantidad: 1,
    unidad: "servicio",
    montoEstimado: 0,
    montoAprobado: 0,
    montoContratado: 0,
    montoEjecutado: 0,
    fechaSolicitud: today(),
    fechaRequerida: today(),
    prioridad: "MEDIA",
    proveedor: "",
    correosNotificacion: "administracion.predial@mtc.gob.pe",
    hojaRuta: "",
    estado: "REGISTRO",
    avance: 0,
  };
}

function recipientsFromEmails(value: string): UsuarioAdministracion[] {
  return value
    .split(/[;,]/)
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => {
      const user = usuariosAdministracion.find((item) => item.email.toLowerCase() === email.toLowerCase());
      return user ?? { id: email, nombre: email, email, rol: "Administracion" };
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

function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-[180px_1fr] items-center gap-2 ${className}`}>
      <label className="text-right text-[12px] text-gray-700">
        {required && <span style={{ color: RED }}>* </span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function ServiciosPage() {
  const catalogo = serviciosBase;
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(initialSolicitudes);
  const [editing, setEditing] = useState<Solicitud | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [historyItem, setHistoryItem] = useState<Solicitud | null>(null);
  const [resendItem, setResendItem] = useState<Solicitud | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    proyectoId: "TODOS",
    tipoServicio: "TODOS",
    estado: "TODOS",
    prioridad: "TODOS",
    fechaInicio: "",
    fechaFin: "",
  });

  const filtered = useMemo(
    () =>
      solicitudes.filter((item) => {
        if (filters.proyectoId !== "TODOS" && item.proyectoId !== filters.proyectoId) return false;
        if (filters.tipoServicio !== "TODOS" && item.tipoServicio !== filters.tipoServicio) return false;
        if (filters.estado !== "TODOS" && item.estado !== filters.estado) return false;
        if (filters.prioridad !== "TODOS" && item.prioridad !== filters.prioridad) return false;
        if (filters.fechaInicio && item.fechaSolicitud < filters.fechaInicio) return false;
        if (filters.fechaFin && item.fechaSolicitud > filters.fechaFin) return false;
        return true;
      }),
    [filters, solicitudes],
  );

  const totals = useMemo(
    () => ({
      estimado: filtered.reduce((sum, item) => sum + item.montoEstimado, 0),
      aprobado: filtered.reduce((sum, item) => sum + item.montoAprobado, 0),
      contratado: filtered.reduce((sum, item) => sum + item.montoContratado, 0),
      ejecutado: filtered.reduce((sum, item) => sum + item.montoEjecutado, 0),
    }),
    [filtered],
  );

  function saveSolicitud(form: SolicitudForm, documentos: Documento[]) {
    const emailDetail = form.correosNotificacion.trim()
      ? `Se envio el correo a: ${form.correosNotificacion}.`
      : "No se registraron correos para notificar.";
    if (editing) {
      setSolicitudes((current) =>
        current.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                ...form,
                documentos,
                historial: [
                  { id: Date.now(), fecha: nowLabel(), usuario: form.responsable || "Equipo funcional", estado: form.estado, detalle: `Registro actualizado desde el formulario de servicios. ${emailDetail}` },
                  ...item.historial,
                ],
              }
            : item,
        ),
      );
    } else {
      const nextId = Math.max(0, ...solicitudes.map((item) => item.id)) + 1;
      setSolicitudes((current) => [
        {
          id: nextId,
          codigo: makeSolicitudCode(nextId, form.proyectoId),
          ...form,
          documentos,
          historial: [{ id: Date.now(), fecha: nowLabel(), usuario: form.responsable || "Equipo funcional", estado: form.estado, detalle: `Solicitud de servicio registrada. ${emailDetail}` }],
        },
        ...current,
      ]);
    }
    setNotificationMessage(emailDetail);
    setShowForm(false);
  }

  function advanceEstado(item: Solicitud) {
    const nextEstado = estados[Math.min(estados.indexOf(item.estado) + 1, estados.length - 1)];
    setSolicitudes((current) =>
      current.map((row) =>
        row.id === item.id
          ? {
              ...row,
              estado: nextEstado,
              historial: [
                { id: Date.now(), fecha: nowLabel(), usuario: "Equipo funcional", estado: nextEstado, detalle: nextEstado === "ENVIADO ADMINISTRACION" ? `Enviado a ${row.correosNotificacion}.` : "Cambio de estado registrado." },
                ...row.historial,
              ],
            }
          : row,
      ),
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <AppSidebar />
      <main className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Briefcase size={21} className="text-[#dc2626]" />
            <div>
              <h1 className="text-[18px] font-semibold text-[#111]">Solicitudes y Control de Servicios</h1>
              <p className="text-[12px] text-gray-500">Registro, aprobacion, contratacion, seguimiento y cierre de servicios por proyecto.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportSolicitudesExcel(filtered)}
              className="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50"
              title="Descargar Excel con datos completos"
            >
              <Download size={14} /> Excel
            </button>
            <button
              type="button"
              onClick={() => exportSolicitudesPdf(filtered, totals)}
              className="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50"
              title="Descargar PDF con datos completos"
            >
              <FileText size={14} /> PDF
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-1.5 rounded px-3 py-2 text-[12px] text-white"
              style={{ background: RED }}
            >
              <Plus size={14} /> Registrar solicitud
            </button>
          </div>
        </div>

        {notificationMessage && (
          <div className="mb-3 flex items-center justify-between rounded border border-green-200 bg-green-50 px-3 py-2 text-[12px] text-green-700">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={14} /> {notificationMessage}
            </span>
            <button type="button" onClick={() => setNotificationMessage(null)} className="rounded p-1 hover:bg-green-100" aria-label="Cerrar aviso">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="mb-3 grid grid-cols-4 gap-3">
          <AmountCard label="Monto estimado" value={totals.estimado} />
          <AmountCard label="Monto aprobado" value={totals.aprobado} />
          <AmountCard label="Monto contratado" value={totals.contratado} />
          <AmountCard label="Monto ejecutado" value={totals.ejecutado} />
        </div>

        <div className="mb-3 rounded border bg-white p-3">
          <div className="grid grid-cols-6 gap-3">
            <FilterSelect label="Proyecto" value={filters.proyectoId} onChange={(value) => setFilters({ ...filters, proyectoId: value })}>
              <option value="TODOS">Todos los proyectos</option>
              {proyectos.map((proyecto) => (
                <option key={proyecto.id} value={proyecto.id}>{proyecto.codigo} - {proyecto.nombre}</option>
              ))}
            </FilterSelect>
            <FilterSelect label="Tipo de servicio" value={filters.tipoServicio} onChange={(value) => setFilters({ ...filters, tipoServicio: value })}>
              <option value="TODOS">Todos</option>
              {catalogo.map((item) => <option key={item}>{item}</option>)}
            </FilterSelect>
            <FilterSelect label="Estado" value={filters.estado} onChange={(value) => setFilters({ ...filters, estado: value })}>
              <option value="TODOS">Todos</option>
              {estados.map((item) => <option key={item}>{item}</option>)}
            </FilterSelect>
            <FilterSelect label="Prioridad" value={filters.prioridad} onChange={(value) => setFilters({ ...filters, prioridad: value })}>
              <option value="TODOS">Todas</option>
              <option>ALTA</option>
              <option>MEDIA</option>
              <option>BAJA</option>
            </FilterSelect>
            <FilterDate label="Fecha inicio" value={filters.fechaInicio} onChange={(value) => setFilters({ ...filters, fechaInicio: value })} />
            <FilterDate label="Fecha fin" value={filters.fechaFin} onChange={(value) => setFilters({ ...filters, fechaFin: value })} />
          </div>
        </div>

        <div className="overflow-hidden rounded border bg-white">
            <div className="border-b bg-gray-50 px-3 py-2 text-[12px] font-semibold text-gray-700">Lista de solicitudes</div>
            <div className="overflow-auto">
              <table className="min-w-full text-[12px]">
                <thead className="bg-white text-left text-gray-600">
                  <tr>
                    <th className="px-2 py-2 font-semibold">Codigo</th>
                    <th className="px-2 py-2 font-semibold">Proyecto</th>
                    <th className="px-2 py-2 font-semibold">Predio</th>
                    <th className="px-2 py-2 font-semibold">Servicio</th>
                    <th className="px-2 py-2 font-semibold">Proveedor</th>
                    <th className="px-2 py-2 font-semibold">Estado</th>
                    <th className="px-2 py-2 text-right font-semibold">Estimado</th>
                    <th className="px-2 py-2 text-right font-semibold">Ejecutado</th>
                    <th className="px-2 py-2 text-center font-semibold">Avance</th>
                    <th className="px-2 py-2 text-center font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const proyecto = proyectos.find((p) => p.id === item.proyectoId);
                    return (
                      <tr key={item.id} className="border-t align-top hover:bg-gray-50">
                        <td className="px-2 py-2 font-mono text-[11px] text-[#dc2626]">{item.codigo}</td>
                        <td className="px-2 py-2">{proyecto?.nombre ?? item.proyectoId}</td>
                        <td className="px-2 py-2 font-mono text-[11px]">{item.predioCodigo || "Sin vinculo"}</td>
                        <td className="px-2 py-2">
                          <div className="font-medium text-gray-900">{item.tipoServicio}</div>
                          <div className="max-w-[280px] truncate text-[11px] text-gray-500">{item.descripcion}</div>
                        </td>
                        <td className="px-2 py-2">{item.proveedor || "Por asignar"}</td>
                        <td className="px-2 py-2"><EstadoBadge estado={item.estado} /></td>
                        <td className="px-2 py-2 text-right">{money(item.montoEstimado)}</td>
                        <td className="px-2 py-2 text-right">{money(item.montoEjecutado)}</td>
                        <td className="px-2 py-2 text-center">
                          <div className="mx-auto h-2 w-20 overflow-hidden rounded bg-gray-200">
                            <div className="h-full bg-[#dc2626]" style={{ width: `${item.avance}%` }} />
                          </div>
                          <span className="text-[11px] text-gray-500">{item.avance}%</span>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <button type="button" onClick={() => { setEditing(item); setShowForm(true); }} className="inline-flex size-7 items-center justify-center rounded border text-blue-600" title="Editar">
                              <Edit size={13} />
                            </button>
                            <button type="button" onClick={() => advanceEstado(item)} className="inline-flex size-7 items-center justify-center rounded border text-[#dc2626]" title="Registrar cambio">
                              <Send size={13} />
                            </button>
                            <button type="button" onClick={() => setResendItem(item)} className="inline-flex size-7 items-center justify-center rounded border text-[#dc2626]" title="Reenviar correo">
                              <Mail size={13} />
                            </button>
                            <button type="button" onClick={() => setHistoryItem(item)} className="inline-flex size-7 items-center justify-center rounded border text-gray-600" title="Historial">
                              <History size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        </div>
      </main>

      {showForm && (
        <SolicitudModal
          catalogo={catalogo}
          editing={editing}
          nextCode={makeSolicitudCode(Math.max(0, ...solicitudes.map((item) => item.id)) + 1, editing?.proyectoId ?? "jauja")}
          onClose={() => setShowForm(false)}
          onSave={saveSolicitud}
        />
      )}
      {historyItem && <HistorialModal solicitud={historyItem} onClose={() => setHistoryItem(null)} />}
      {resendItem && (
        <ReenviarCorreoModal
          solicitud={resendItem}
          onClose={() => setResendItem(null)}
          onSend={(email) => {
            const message = `Se reenvio el correo de la solicitud ${resendItem.codigo} a: ${email}.`;
            setSolicitudes((current) =>
              current.map((item) =>
                item.id === resendItem.id
                  ? {
                      ...item,
                      historial: [
                        { id: Date.now(), fecha: nowLabel(), usuario: "Equipo funcional", estado: item.estado, detalle: message },
                        ...item.historial,
                      ],
                    }
                  : item,
              ),
            );
            setNotificationMessage(message);
            setResendItem(null);
          }}
        />
      )}
    </div>
  );
}

function AmountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border bg-white px-3 py-2">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="mt-1 text-[15px] font-semibold text-gray-900">{money(value)}</div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] text-gray-600">{label}</label>
      <select className={selectCls} value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </div>
  );
}

function FilterDate({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] text-gray-600">{label}</label>
      <input type="date" className={inputCls} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function EstadoBadge({ estado }: { estado: Estado }) {
  const done = ["APROBADO", "CONTRATADO", "CONFORMIDAD", "PAGO", "CERRADO"].includes(estado);
  const rejected = estado === "RECHAZADO";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${rejected ? "bg-red-50 text-red-700" : done ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
      <CheckCircle2 size={12} /> {estado}
    </span>
  );
}

function SolicitudModal({
  catalogo,
  editing,
  nextCode,
  onClose,
  onSave,
}: {
  catalogo: string[];
  editing: Solicitud | null;
  nextCode: string;
  onClose: () => void;
  onSave: (form: SolicitudForm, documentos: Documento[]) => void;
}) {
  const [form, setForm] = useState<SolicitudForm>(() => editing ? { ...editing } : emptyForm());
  const [documentos, setDocumentos] = useState<Documento[]>(editing?.documentos ?? []);
  const [documentName, setDocumentName] = useState("");
  const [documentFileName, setDocumentFileName] = useState("");
  const [selectedAdminUserId, setSelectedAdminUserId] = useState(usuariosAdministracion[0]?.id ?? "");
  const [selectedAdminRole, setSelectedAdminRole] = useState(administracionRoles[0]);
  const [adminRecipients, setAdminRecipients] = useState<UsuarioAdministracion[]>(() =>
    recipientsFromEmails(editing?.correosNotificacion ?? emptyForm().correosNotificacion),
  );
  const codigo = editing?.codigo ?? nextCode;
  const prediosProyecto = useMemo(() => prediosForProject(form.proyectoId), [form.proyectoId]);

  function setField<K extends keyof SolicitudForm>(key: K, value: SolicitudForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setRecipients(nextRecipients: UsuarioAdministracion[]) {
    setAdminRecipients(nextRecipients);
    setField("correosNotificacion", nextRecipients.map((item) => item.email).join("; "));
  }

  function addAdminRecipient() {
    const user = usuariosAdministracion.find((item) => item.id === selectedAdminUserId);
    if (!user) return;
    const nextUser = { ...user, rol: selectedAdminRole };
    const withoutDuplicate = adminRecipients.filter((item) => item.email !== nextUser.email);
    setRecipients([...withoutDuplicate, nextUser]);
  }

  function removeAdminRecipient(email: string) {
    setRecipients(adminRecipients.filter((item) => item.email !== email));
  }

  function addDocumento() {
    const nombre = documentName.trim();
    if (!nombre || !documentFileName) return;
    const count = documentos.filter((item) => item.nombre.toLowerCase() === nombre.toLowerCase()).length + 1;
    setDocumentos((current) => [
      { id: Date.now(), nombre, version: `v${count}`, archivo: documentFileName, responsable: form.responsable || "Equipo funcional", fecha: nowLabel() },
      ...current,
    ]);
    setDocumentName("");
    setDocumentFileName("");
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-[1180px] overflow-auto rounded bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-3">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-[#dc2626]" />
            <div>
              <div className="text-[14px] font-semibold">Solicitudes y Control de Servicios</div>
              <div className="font-mono text-[11px] text-[#dc2626]">Codigo interno: {codigo}</div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="inline-flex size-7 items-center justify-center rounded hover:bg-gray-100" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <form className="px-5 py-4" onSubmit={(event) => { event.preventDefault(); onSave(form, documentos); }}>
          <div className="border-b mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border-b-2" style={{ borderColor: RED, color: RED }}>
              <FileText size={14} /> Registro de solicitud
            </div>
          </div>

          <SectionTitle>Datos generales</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Field label="Proyecto" required>
              <select
                className={selectCls}
                value={form.proyectoId}
                onChange={(event) => {
                  const nextProjectId = event.target.value;
                  setForm((current) => ({ ...current, proyectoId: nextProjectId, predioCodigo: "" }));
                }}
              >
                {proyectos.map((proyecto) => (
                  <option key={proyecto.id} value={proyecto.id}>{proyecto.codigo} - {proyecto.nombre}</option>
                ))}
              </select>
            </Field>
            <Field label="Responsable" required>
              <input className={inputCls} value={form.responsable} onChange={(event) => setField("responsable", event.target.value)} />
            </Field>
            <Field label="Predio vinculado">
              <select className={selectCls} value={form.predioCodigo} onChange={(event) => setField("predioCodigo", event.target.value)}>
                <option value="">Sin predio vinculado</option>
                {prediosProyecto.map((predio) => {
                  const codigoPredio = predio.cod || predio.codigo;
                  return (
                    <option key={predio.rowId} value={codigoPredio}>
                      {codigoPredio} - {predio.suj}
                    </option>
                  );
                })}
              </select>
            </Field>
            <div />
            <Field label="Tipo de servicio" required>
              <select className={selectCls} value={form.tipoServicio} onChange={(event) => setField("tipoServicio", event.target.value)}>
                {catalogo.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Proveedor asignado">
              <input className={inputCls} value={form.proveedor} onChange={(event) => setField("proveedor", event.target.value)} />
            </Field>
            <Field label="Descripcion" required className="col-span-2 items-start">
              <textarea className={textAreaCls} value={form.descripcion} onChange={(event) => setField("descripcion", event.target.value)} />
            </Field>
            <Field label="Cantidad / Unidad">
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <input type="number" min={0} className={inputCls} value={form.cantidad} onChange={(event) => setField("cantidad", Number(event.target.value))} />
                <input className={inputCls} value={form.unidad} onChange={(event) => setField("unidad", event.target.value)} />
              </div>
            </Field>
            <Field label="Prioridad / Estado">
              <div className="grid grid-cols-2 gap-2">
                <select className={selectCls} value={form.prioridad} onChange={(event) => setField("prioridad", event.target.value as Prioridad)}>
                  <option>ALTA</option><option>MEDIA</option><option>BAJA</option>
                </select>
                <select className={selectCls} value={form.estado} onChange={(event) => setField("estado", event.target.value as Estado)}>
                  {estados.map((estado) => <option key={estado}>{estado}</option>)}
                </select>
              </div>
            </Field>
            <Field label="Fecha solicitud" required>
              <input type="date" className={inputCls} value={form.fechaSolicitud} onChange={(event) => setField("fechaSolicitud", event.target.value)} />
            </Field>
            <Field label="Fecha requerida" required>
              <input type="date" className={inputCls} value={form.fechaRequerida} onChange={(event) => setField("fechaRequerida", event.target.value)} />
            </Field>
            <Field label="Usuarios administracion" className="col-span-2">
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_180px_auto] gap-2">
                  <select className={selectCls} value={selectedAdminUserId} onChange={(event) => setSelectedAdminUserId(event.target.value)}>
                    {usuariosAdministracion.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.nombre} - {user.email}
                      </option>
                    ))}
                  </select>
                  <select className={selectCls} value={selectedAdminRole} onChange={(event) => setSelectedAdminRole(event.target.value)}>
                    {administracionRoles.map((rol) => (
                      <option key={rol}>{rol}</option>
                    ))}
                  </select>
                  <button type="button" onClick={addAdminRecipient} className="inline-flex h-8 items-center gap-1.5 rounded px-3 text-[12px] text-white" style={{ background: RED }}>
                    <Plus size={14} /> Agregar
                  </button>
                </div>
                <input
                  className={`${inputCls} bg-gray-50`}
                  value={form.correosNotificacion}
                  readOnly
                  placeholder="Agregue usuarios de administracion para notificar"
                />
                <div className="min-h-8 rounded border border-gray-200 bg-white p-2">
                  {adminRecipients.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {adminRecipients.map((user) => (
                        <span key={user.email} className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-2 py-1 text-[11px] text-gray-700">
                          <Mail size={12} className="text-[#dc2626]" />
                          <b>{user.rol}</b>
                          <span>{user.nombre}</span>
                          <span className="text-gray-500">{user.email}</span>
                          <button type="button" onClick={() => removeAdminRecipient(user.email)} className="ml-1 rounded-full text-gray-400 hover:text-[#dc2626]" aria-label={`Quitar ${user.email}`}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[12px] text-gray-500">Sin usuarios de administracion agregados.</div>
                  )}
                </div>
              </div>
            </Field>
            <Field label="Hoja de Ruta">
              <input className={inputCls} value={form.hojaRuta} onChange={(event) => setField("hojaRuta", event.target.value)} placeholder="Nro. HR para sincronizar mesa de partes" />
            </Field>
          </div>

          <SectionTitle>Control de montos y avance</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Field label="Monto estimado"><input type="number" min={0} className={inputCls} value={form.montoEstimado} onChange={(event) => setField("montoEstimado", Number(event.target.value))} /></Field>
            <Field label="Monto aprobado"><input type="number" min={0} className={inputCls} value={form.montoAprobado} onChange={(event) => setField("montoAprobado", Number(event.target.value))} /></Field>
            <Field label="Monto contratado"><input type="number" min={0} className={inputCls} value={form.montoContratado} onChange={(event) => setField("montoContratado", Number(event.target.value))} /></Field>
            <Field label="Monto ejecutado"><input type="number" min={0} className={inputCls} value={form.montoEjecutado} onChange={(event) => setField("montoEjecutado", Number(event.target.value))} /></Field>
            <Field label="Avance %"><input type="number" min={0} max={100} className={inputCls} value={form.avance} onChange={(event) => setField("avance", Number(event.target.value))} /></Field>
          </div>

          <SectionTitle>Documentos y versiones</SectionTitle>
          <div className="mb-2 grid grid-cols-[1fr_1fr_auto] items-center gap-2 rounded border border-gray-200 bg-gray-50 p-2">
            <input
              className={inputCls}
              value={documentName}
              onChange={(event) => setDocumentName(event.target.value)}
              placeholder="Nombre del documento"
            />
            <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded border border-gray-300 bg-white px-3 text-[12px] hover:bg-gray-100">
              <Paperclip size={14} />
              <span className="truncate">{documentFileName || "Seleccionar archivo"}</span>
              <input
                type="file"
                className="hidden"
                onChange={(event) => setDocumentFileName(event.target.files?.[0]?.name ?? "")}
              />
            </label>
            <button
              type="button"
              onClick={addDocumento}
              className="inline-flex h-8 items-center gap-1.5 rounded px-3 text-[12px] text-white"
              style={{ background: RED }}
            >
              <Plus size={14} /> Subir
            </button>
          </div>
          <SimpleDocsTable documentos={documentos} />

          <div className="mt-5 flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50"><X size={14} /> Cancelar</button>
            <button type="submit" className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white" style={{ background: RED }}><Save size={14} /> Guardar solicitud</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SimpleDocsTable({ documentos }: { documentos: Documento[] }) {
  return (
    <div className="overflow-auto rounded border">
      <table className="min-w-full text-[12px]">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr><th className="px-2 py-2 font-semibold">Nombre</th><th className="px-2 py-2 font-semibold">Version</th><th className="px-2 py-2 font-semibold">Archivo</th><th className="px-2 py-2 font-semibold">Responsable</th><th className="px-2 py-2 font-semibold">Fecha</th></tr>
        </thead>
        <tbody>
          {documentos.map((doc) => (
            <tr key={doc.id} className="border-t">
              <td className="px-2 py-1.5">{doc.nombre}</td><td className="px-2 py-1.5 font-mono text-[#dc2626]">{doc.version}</td><td className="px-2 py-1.5">{doc.archivo}</td><td className="px-2 py-1.5">{doc.responsable}</td><td className="px-2 py-1.5">{doc.fecha}</td>
            </tr>
          ))}
          {!documentos.length && <tr><td colSpan={5} className="px-2 py-4 text-center text-gray-500">Sin documentos adjuntos.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function HistorialModal({ solicitud, onClose }: { solicitud: Solicitud; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <History size={16} className="text-[#dc2626]" />
            <div><div className="text-[14px] font-semibold">Historial de cambios</div><div className="font-mono text-[11px] text-gray-500">{solicitud.codigo}</div></div>
          </div>
          <button type="button" onClick={onClose} className="inline-flex size-7 items-center justify-center rounded hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="max-h-[70vh] overflow-auto p-5">
          <table className="min-w-full text-[12px]">
            <thead className="bg-gray-50 text-left text-gray-600"><tr><th className="px-2 py-2 font-semibold">Fecha</th><th className="px-2 py-2 font-semibold">Usuario</th><th className="px-2 py-2 font-semibold">Estado</th><th className="px-2 py-2 font-semibold">Detalle</th></tr></thead>
            <tbody>
              {solicitud.historial.map((item) => (
                <tr key={item.id} className="border-t align-top"><td className="px-2 py-2 whitespace-nowrap">{item.fecha}</td><td className="px-2 py-2">{item.usuario}</td><td className="px-2 py-2"><EstadoBadge estado={item.estado} /></td><td className="px-2 py-2">{item.detalle}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end border-t px-5 py-3">
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50"><X size={14} /> Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function ReenviarCorreoModal({
  solicitud,
  onClose,
  onSend,
}: {
  solicitud: Solicitud;
  onClose: () => void;
  onSend: (email: string) => void;
}) {
  const firstEmail = solicitud.correosNotificacion.split(/[;,]/).map((item) => item.trim()).find(Boolean) ?? "";
  const [email, setEmail] = useState(firstEmail);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Ingrese un correo valido.");
      return;
    }
    onSend(value);
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-[#dc2626]" />
            <div>
              <div className="text-[14px] font-semibold">Reenviar correo</div>
              <div className="font-mono text-[11px] text-gray-500">{solicitud.codigo}</div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="inline-flex size-7 items-center justify-center rounded hover:bg-gray-100" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <label className="mb-1 block text-[12px] text-gray-700">Correo destino</label>
            <input
              autoFocus
              type="email"
              className={inputCls}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="usuario@dominio.gob.pe"
            />
            {error && <div className="mt-1 text-[11px] text-[#dc2626]">{error}</div>}
          </div>
          <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-[12px] text-gray-600">
            Se reenviara la solicitud de servicio y se registrara el envio en el historial.
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t bg-gray-50 px-5 py-3">
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-white">
            <X size={14} /> Cancelar
          </button>
          <button type="submit" className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white" style={{ background: RED }}>
            <Send size={14} /> Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
