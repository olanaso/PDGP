import { createFileRoute } from "@tanstack/react-router";

import {
  PredioGeneratedDocumentForm,
  type GeneratedDocumentField,
} from "@/components/PredioGeneratedDocumentForm";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/gestion-resolucion-rd")(
  {
    head: () => ({
      meta: [
        { title: "Gestión de resolución / RD" },
        {
          name: "description",
          content: "Generación, registro, versionado y envío de la resolución aprobatoria.",
        },
      ],
    }),
    component: GestionResolucionRdPage,
  },
);

const fields: GeneratedDocumentField[] = [
  {
    key: "tipoResolucion",
    label: "Tipo de resolución",
    type: "select",
    options: ["RESOLUCIÓN DIRECTORAL", "RESOLUCIÓN VICEMINISTERIAL", "RESOLUCIÓN MINISTERIAL"],
    required: true,
  },
  { key: "numeroResolucion", label: "Número de resolución", required: true },
  { key: "fechaResolucion", label: "Fecha", type: "date", required: true },
  {
    key: "montoAprobado",
    label: "Monto aprobado",
    type: "number",
    placeholder: "S/ 0.00",
    required: true,
  },
  {
    key: "incentivo",
    label: "Incentivo",
    type: "number",
    placeholder: "S/ 0.00",
  },
  { key: "responsable", label: "Responsable", required: true },
  {
    key: "fundamento",
    label: "Fundamento de aprobación",
    type: "textarea",
    fullWidth: true,
  },
];

function GestionResolucionRdPage() {
  const { projectId, codigo } = Route.useParams();
  return (
    <PredioGeneratedDocumentForm
      projectId={projectId}
      codigo={codigo}
      title="Gestión de resolución / RD"
      menuLabel="3.7 Gestión de resolución / RD"
      badgeSuffix="Etapa II · 3.7"
      sectionTitle="Datos de la resolución"
      draftTitle="RESOLUCIÓN – BORRADOR"
      fileBaseName="borrador_resolucion"
      uploadLabel="Registrar resolución original"
      fields={fields}
      enableOriginalDispatch
    />
  );
}
