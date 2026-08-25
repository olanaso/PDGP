import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";

import {
  PredioSimpleForm,
  type PredioSimpleFormActionContext,
  type PredioSimpleSection,
} from "@/components/PredioSimpleForm";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/entrega-posesion")({
  head: () => ({
    meta: [
      { title: "Entrega de posesión" },
      {
        name: "description",
        content: "Registro del acta, fecha y estado de liberación del predio.",
      },
    ],
  }),
  component: EntregaPosesionPage,
});

const sections: PredioSimpleSection[] = [
  {
    title: "Datos de entrega",
    fields: [
      { key: "fechaEntrega", label: "Fecha de entrega", type: "date", required: true },
      {
        key: "estadoLiberacion",
        label: "Estado de liberación",
        type: "select",
        options: ["PENDIENTE", "PARCIALMENTE LIBERADO", "LIBERADO", "OBSERVADO"],
        required: true,
      },
      {
        key: "acta",
        label: "Acta de entrega",
        type: "file",
        accept: ".pdf,.doc,.docx,image/*",
        fullWidth: true,
      },
      {
        key: "observaciones",
        label: "Observaciones",
        type: "textarea",
        fullWidth: true,
      },
    ],
  },
];

function EntregaPosesionPage() {
  const { projectId, codigo } = Route.useParams();
  return (
    <PredioSimpleForm
      projectId={projectId}
      codigo={codigo}
      title="Entrega de posesión"
      menuLabel="4.5 Entrega de posesión"
      badgeSuffix="Etapa III · 4.5"
      sections={sections}
      additionalAction={{
        label: "Generar borrador de acta",
        icon: <FileText size={14} />,
        onClick: handleGenerateDraft,
      }}
    />
  );
}

function handleGenerateDraft({
  values,
  decodedCodigo,
  projectLabel,
  predio,
  setMessage,
}: PredioSimpleFormActionContext) {
  const predioCode = predio?.cod || decodedCodigo;
  const safeCode = predioCode.replace(/[^A-Z0-9-]/gi, "").toUpperCase() || "PREDIO";
  const blob = createActaEntregaPosesionWordBlob({
    fechaEntrega: values.fechaEntrega,
    estadoLiberacion: values.estadoLiberacion,
    observaciones: values.observaciones,
    predio,
    predioCode,
    projectLabel,
  });

  downloadBlobFile(`borrador_acta_entrega_posesion_${safeCode}.doc`, blob);
  setMessage("Borrador del acta de entrega de posesión generado correctamente en Word.");
}

function createActaEntregaPosesionWordBlob({
  fechaEntrega,
  estadoLiberacion,
  observaciones,
  predio,
  predioCode,
  projectLabel,
}: {
  fechaEntrega: string;
  estadoLiberacion: string;
  observaciones: string;
  predio: PredioSimpleFormActionContext["predio"];
  predioCode: string;
  projectLabel: string;
}) {
  const fechaDocumento = formatDocumentDate(fechaEntrega);
  const representante = predio?.rlegal || predio?.rtec || "Representante de la DDP";
  const sujetoPasivo = predio?.suj || "Sujeto pasivo pendiente de identificar";
  const html = `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="UTF-8" />
    <title>Acta de entrega de posesión</title>
    <style>
      @page { size: A4; margin: 2cm 2.2cm; }
      body { font-family: Arial, sans-serif; color: #111827; font-size: 10.5pt; line-height: 1.5; }
      h1 { margin: 18px 0 4px; text-align: center; font-size: 15pt; }
      h2 { margin: 18px 0 8px; border-bottom: 1px solid #dc2626; padding-bottom: 4px; color: #b91c1c; font-size: 11pt; }
      p { margin: 8px 0; text-align: justify; }
      .institution, .subtitle { text-align: center; }
      .institution { font-size: 9pt; font-weight: bold; }
      .subtitle { margin-bottom: 20px; font-size: 9pt; }
      table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; }
      th, td { border: 1px solid #d1d5db; padding: 6px 8px; vertical-align: top; }
      th { width: 31%; background: #f3f4f6; text-align: left; }
      .signatures td { height: 90px; border: 0; padding: 50px 18px 0; text-align: center; vertical-align: bottom; }
      .signature-line { border-top: 1px solid #111827; padding-top: 5px; }
      .footer { margin-top: 24px; color: #6b7280; text-align: center; font-size: 8pt; }
    </style>
  </head>
  <body>
    <div class="institution">MINISTERIO DE TRANSPORTES Y COMUNICACIONES</div>
    <h1>ACTA DE ENTREGA DE POSESIÓN</h1>
    <div class="subtitle"><b>BORRADOR</b> · Predio ${escapeDocumentHtml(predioCode)}</div>

    <p>
      En la fecha ${escapeDocumentHtml(fechaDocumento)}, se deja constancia de la entrega de posesión
      del predio identificado con código <b>${escapeDocumentHtml(predioCode)}</b>, correspondiente al
      proyecto <b>${escapeDocumentHtml(projectLabel)}</b>, de acuerdo con la información y condiciones
      detalladas en la presente acta.
    </p>

    <h2>1. Identificación del predio</h2>
    <table>
      <tr><th>Proyecto</th><td>${escapeDocumentHtml(projectLabel)}</td></tr>
      <tr><th>Código de predio</th><td>${escapeDocumentHtml(predioCode)}</td></tr>
      <tr><th>Expediente</th><td>${escapeDocumentHtml(predio?.exp || "No consignado")}</td></tr>
      <tr><th>Sujeto pasivo</th><td>${escapeDocumentHtml(sujetoPasivo)}</td></tr>
      <tr><th>Partida registral</th><td>${escapeDocumentHtml(predio?.part || predio?.pind || "No consignada")}</td></tr>
      <tr><th>Área afectada</th><td>${escapeDocumentHtml(predio?.area || predio?.m2 || "Por verificar")} m²</td></tr>
      <tr><th>Ubicación</th><td>${escapeDocumentHtml(predio?.ciudad || "No consignada")}</td></tr>
    </table>

    <h2>2. Condiciones de la entrega</h2>
    <table>
      <tr><th>Fecha de entrega</th><td>${escapeDocumentHtml(fechaDocumento)}</td></tr>
      <tr><th>Estado de liberación</th><td>${escapeDocumentHtml(estadoLiberacion || "Pendiente de verificar")}</td></tr>
      <tr><th>Observaciones</th><td>${escapeDocumentHtml(observaciones || "Sin observaciones registradas")}</td></tr>
    </table>

    <h2>3. Declaración de entrega</h2>
    <p>
      La parte entregante manifiesta que pone el predio descrito a disposición de la Dirección de
      Disponibilidad de Predios, en el estado físico y de ocupación consignado en esta acta. La parte
      receptora declara recibir la posesión para la continuidad de las acciones relacionadas con el
      proyecto, sin perjuicio de las verificaciones técnicas y legales que correspondan.
    </p>

    <h2>4. Conformidad</h2>
    <p>
      Leído el contenido del presente borrador, las partes podrán completar las precisiones necesarias
      antes de su impresión y suscripción definitiva.
    </p>

    <table class="signatures">
      <tr>
        <td><div class="signature-line"><b>${escapeDocumentHtml(sujetoPasivo)}</b><br />Parte entregante</div></td>
        <td><div class="signature-line"><b>${escapeDocumentHtml(representante)}</b><br />Representante DDP / parte receptora</div></td>
      </tr>
    </table>

    <div class="footer">Borrador generado el ${escapeDocumentHtml(todayInPeru())} por el Sistema de Gestión Predial.</div>
  </body>
</html>`;

  return new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
}

function formatDocumentDate(value: string) {
  if (!value) return "No consignada";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function todayInPeru() {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Lima",
  }).format(new Date());
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

function escapeDocumentHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
