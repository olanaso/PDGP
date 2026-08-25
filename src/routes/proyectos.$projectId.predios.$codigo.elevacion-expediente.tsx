import { createFileRoute } from "@tanstack/react-router";

import { PredioSimpleForm, type PredioSimpleSection } from "@/components/PredioSimpleForm";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/elevacion-expediente")({
  head: () => ({
    meta: [
      { title: "Elevación del expediente" },
      {
        name: "description",
        content: "Registro de la elevación del expediente y seguimiento de su recepción.",
      },
    ],
  }),
  component: ElevacionExpedientePage,
});

const sections: PredioSimpleSection[] = [
  {
    title: "Datos de elevación",
    fields: [
      { key: "fechaElevacion", label: "Fecha de elevación", type: "date", required: true },
      { key: "areaReceptora", label: "Área receptora", required: true },
      { key: "responsable", label: "Responsable", required: true },
      {
        key: "estado",
        label: "Estado",
        type: "select",
        options: ["BORRADOR", "ELEVADO", "RECIBIDO", "OBSERVADO", "APROBADO"],
        required: true,
      },
      {
        key: "documento",
        label: "Documento de elevación",
        type: "file",
        accept: ".pdf,.doc,.docx",
        fullWidth: true,
      },
    ],
  },
];

function ElevacionExpedientePage() {
  const { projectId, codigo } = Route.useParams();
  return (
    <PredioSimpleForm
      projectId={projectId}
      codigo={codigo}
      title="Elevación del expediente"
      menuLabel="3.6 Elevación del expediente"
      badgeSuffix="Etapa II · 3.6"
      sections={sections}
    />
  );
}
