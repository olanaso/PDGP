import { createFileRoute } from "@tanstack/react-router";

import {
  PredioGeneratedDocumentForm,
  type GeneratedDocumentField,
} from "@/components/PredioGeneratedDocumentForm";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/informe-tecnico-legal")(
  {
    head: () => ({
      meta: [
        { title: "Informe técnico legal" },
        {
          name: "description",
          content: "Generación, firma y control de versiones del Informe Técnico Legal.",
        },
      ],
    }),
    component: InformeTecnicoLegalPage,
  },
);

const fields: GeneratedDocumentField[] = [
  { key: "numeroInforme", label: "Número de informe", required: true },
  { key: "fechaInforme", label: "Fecha", type: "date", required: true },
  { key: "conclusion", label: "Conclusión", type: "textarea", fullWidth: true, required: true },
  {
    key: "recomendacion",
    label: "Recomendación",
    type: "textarea",
    fullWidth: true,
    required: true,
  },
];

function InformeTecnicoLegalPage() {
  const { projectId, codigo } = Route.useParams();
  return (
    <PredioGeneratedDocumentForm
      projectId={projectId}
      codigo={codigo}
      title="Informe técnico legal"
      menuLabel="3.4 Informe técnico legal"
      badgeSuffix="Etapa II · 3.4"
      sectionTitle="Datos del Informe Técnico Legal"
      draftTitle="INFORME TÉCNICO LEGAL – BORRADOR"
      fileBaseName="borrador_informe_tecnico_legal"
      uploadLabel="Registrar informe firmado"
      fields={fields}
    />
  );
}
