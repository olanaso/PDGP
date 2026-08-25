import { createFileRoute } from "@tanstack/react-router";

import { PredioSimpleForm, type PredioSimpleSection } from "@/components/PredioSimpleForm";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/formulario-registral")({
  head: () => ({
    meta: [
      { title: "Formulario registral" },
      {
        name: "description",
        content: "Registro del formulario registral suscrito para el predio.",
      },
    ],
  }),
  component: FormularioRegistralPage,
});

const sections: PredioSimpleSection[] = [
  {
    title: "Datos del formulario registral",
    fields: [
      { key: "numeroFormulario", label: "Número", required: true },
      {
        key: "fechaSuscripcion",
        label: "Fecha de suscripción",
        type: "date",
        required: true,
      },
      { key: "notaria", label: "Notaría", required: true },
      {
        key: "archivo",
        label: "Archivo",
        type: "file",
        accept: ".pdf,.doc,.docx",
        fullWidth: true,
      },
    ],
  },
];

function FormularioRegistralPage() {
  const { projectId, codigo } = Route.useParams();
  return (
    <PredioSimpleForm
      projectId={projectId}
      codigo={codigo}
      title="Formulario registral"
      menuLabel="4.4 Formulario registral"
      badgeSuffix="Etapa III · 4.4"
      sections={sections}
    />
  );
}
