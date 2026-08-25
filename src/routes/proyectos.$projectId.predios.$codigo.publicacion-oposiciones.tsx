import { createFileRoute } from "@tanstack/react-router";

import { PredioSimpleForm, type PredioSimpleSection } from "@/components/PredioSimpleForm";

export const Route = createFileRoute(
  "/proyectos/$projectId/predios/$codigo/publicacion-oposiciones",
)({
  head: () => ({
    meta: [
      { title: "Publicación y oposiciones" },
      {
        name: "description",
        content: "Registro de publicaciones, avisos, oposiciones y resultado del procedimiento.",
      },
    ],
  }),
  component: PublicacionOposicionesPage,
});

const sections: PredioSimpleSection[] = [
  {
    title: "Datos de publicación",
    fields: [
      { key: "diario", label: "Diario", required: true },
      { key: "fechaPublicacion", label: "Fecha de publicación", type: "date", required: true },
      { key: "aviso", label: "Aviso publicado", required: true },
      {
        key: "archivoAviso",
        label: "Archivo del aviso",
        type: "file",
        accept: ".pdf,image/*",
      },
    ],
  },
  {
    title: "Oposiciones",
    fields: [
      {
        key: "oposiciones",
        label: "Oposiciones presentadas",
        type: "textarea",
        fullWidth: true,
      },
      {
        key: "resultado",
        label: "Resultado",
        type: "select",
        options: ["SIN OPOSICIONES", "CON OPOSICIONES", "EN EVALUACIÓN", "RESUELTO"],
        required: true,
      },
    ],
  },
];

function PublicacionOposicionesPage() {
  const { projectId, codigo } = Route.useParams();
  return (
    <PredioSimpleForm
      projectId={projectId}
      codigo={codigo}
      title="Publicación y oposiciones"
      menuLabel="2.6 Publicación y oposiciones"
      badgeSuffix="Etapa I · 2.6"
      sections={sections}
    />
  );
}
