import { createFileRoute } from "@tanstack/react-router";

import { PredioSimpleForm, type PredioSimpleSection } from "@/components/PredioSimpleForm";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/inscripcion-registral")(
  {
    head: () => ({
      meta: [
        { title: "Inscripción registral" },
        {
          name: "description",
          content: "Registro de la inscripción del predio ante SUNARP y su propietario final.",
        },
      ],
    }),
    component: InscripcionRegistralPage,
  },
);

const sections: PredioSimpleSection[] = [
  {
    title: "Datos de inscripción SUNARP",
    fields: [
      { key: "tituloSunarp", label: "Título SUNARP", required: true },
      { key: "asiento", label: "Asiento registral", required: true },
      { key: "partida", label: "Partida registral", required: true },
      {
        key: "fechaInscripcion",
        label: "Fecha de inscripción",
        type: "date",
        required: true,
      },
      {
        key: "propietarioFinal",
        label: "Propietario final",
        required: true,
        fullWidth: true,
      },
    ],
  },
];

function InscripcionRegistralPage() {
  const { projectId, codigo } = Route.useParams();
  return (
    <PredioSimpleForm
      projectId={projectId}
      codigo={codigo}
      title="Inscripción registral"
      menuLabel="5.2 Inscripción registral"
      badgeSuffix="Etapa IV · 5.2"
      sections={sections}
    />
  );
}
