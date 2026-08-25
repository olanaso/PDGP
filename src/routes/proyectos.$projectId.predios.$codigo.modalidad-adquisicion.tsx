import { createFileRoute } from "@tanstack/react-router";

import { PredioSimpleForm, type PredioSimpleSection } from "@/components/PredioSimpleForm";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/modalidad-adquisicion")(
  {
    head: () => ({
      meta: [
        { title: "Modalidad de adquisición" },
        {
          name: "description",
          content: "Determinación de la modalidad aplicable para la adquisición del predio.",
        },
      ],
    }),
    component: ModalidadAdquisicionPage,
  },
);

const sections: PredioSimpleSection[] = [
  {
    title: "Determinación de la modalidad",
    fields: [
      {
        key: "modalidad",
        label: "Modalidad de adquisición",
        type: "select",
        options: [
          "TRATO DIRECTO",
          "EXPROPIACIÓN",
          "TRANSFERENCIA INTERESTATAL",
          "RECONOCIMIENTO DE MEJORAS",
          "OTRA",
        ],
        required: true,
      },
      { key: "fecha", label: "Fecha de determinación", type: "date", required: true },
      {
        key: "condicion",
        label: "Condición aplicable",
        type: "textarea",
        fullWidth: true,
      },
      {
        key: "sustento",
        label: "Sustento",
        type: "file",
        accept: ".pdf,.doc,.docx",
        fullWidth: true,
      },
    ],
  },
];

function ModalidadAdquisicionPage() {
  const { projectId, codigo } = Route.useParams();
  return (
    <PredioSimpleForm
      projectId={projectId}
      codigo={codigo}
      title="Modalidad de adquisición"
      menuLabel="2.10 Modalidad de adquisición"
      badgeSuffix="Etapa I · 2.10"
      sections={sections}
    />
  );
}
