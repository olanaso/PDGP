import { createFileRoute } from "@tanstack/react-router";

import {
  PredioGeneratedDocumentForm,
  type GeneratedDocumentField,
} from "@/components/PredioGeneratedDocumentForm";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/gestion-devengado")({
  head: () => ({
    meta: [
      { title: "Gestión de devengado" },
      {
        name: "description",
        content: "Generación y registro documental de la solicitud de devengado del predio.",
      },
    ],
  }),
  component: GestionDevengadoPage,
});

const fields: GeneratedDocumentField[] = [
  {
    key: "tipoDocumento",
    label: "Tipo de documento",
    type: "select",
    options: ["MEMORANDO", "SOLICITUD DE DEVENGADO"],
    required: true,
  },
  { key: "numeroDocumento", label: "Número de documento", required: true },
  { key: "fechaDocumento", label: "Fecha", type: "date", required: true },
  {
    key: "numeroHojaRuta",
    label: "Número de hoja de ruta",
    placeholder: "Sistema de trámite documentario",
    required: true,
  },
  {
    key: "montoDevengado",
    label: "Monto del predio",
    type: "number",
    placeholder: "S/ 0.00",
    required: true,
  },
  { key: "responsable", label: "Responsable", required: true },
  {
    key: "sustento",
    label: "Sustento del devengado",
    type: "textarea",
    fullWidth: true,
  },
];

function GestionDevengadoPage() {
  const { projectId, codigo } = Route.useParams();
  return (
    <PredioGeneratedDocumentForm
      projectId={projectId}
      codigo={codigo}
      title="Gestión de devengado"
      menuLabel="4.1 Gestión de devengado"
      badgeSuffix="Etapa III · 4.1"
      sectionTitle="Datos del devengado"
      draftTitle="MEMORANDO / SOLICITUD DE DEVENGADO – BORRADOR"
      fileBaseName="borrador_devengado"
      uploadLabel="Registrar documento original"
      fields={fields}
    />
  );
}
