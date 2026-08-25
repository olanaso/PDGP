import { createFileRoute } from "@tanstack/react-router";

import { PredioSimpleForm, type PredioSimpleSection } from "@/components/PredioSimpleForm";

export const Route = createFileRoute(
  "/proyectos/$projectId/predios/$codigo/requerimiento-tasacion-itl",
)({
  head: () => ({
    meta: [
      { title: "Requerimiento de tasación / ITL" },
      {
        name: "description",
        content: "Registro del requerimiento de tasación y su Informe Técnico Legal.",
      },
    ],
  }),
  component: RequerimientoTasacionItlPage,
});

const sections: PredioSimpleSection[] = [
  {
    title: "Datos del requerimiento",
    fields: [
      { key: "numero", label: "Número de requerimiento", required: true },
      { key: "fecha", label: "Fecha", type: "date", required: true },
      { key: "entidad", label: "Entidad receptora", required: true },
      {
        key: "estado",
        label: "Estado",
        type: "select",
        options: ["BORRADOR", "ENVIADO", "RECIBIDO", "OBSERVADO", "ATENDIDO"],
        required: true,
      },
      {
        key: "informeTecnicoLegal",
        label: "Informe Técnico Legal",
        type: "file",
        accept: ".pdf,.doc,.docx",
        fullWidth: true,
      },
    ],
  },
];

function RequerimientoTasacionItlPage() {
  const { projectId, codigo } = Route.useParams();
  return (
    <PredioSimpleForm
      projectId={projectId}
      codigo={codigo}
      title="Requerimiento de tasación / ITL"
      menuLabel="2.9 Requerimiento de tasación / ITL"
      badgeSuffix="Etapa I · 2.9"
      sections={sections}
    />
  );
}
