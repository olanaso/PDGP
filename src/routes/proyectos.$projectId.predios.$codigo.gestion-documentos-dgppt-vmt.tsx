import { createFileRoute } from "@tanstack/react-router";

import { PredioSimpleForm, type PredioSimpleSection } from "@/components/PredioSimpleForm";

export const Route = createFileRoute(
  "/proyectos/$projectId/predios/$codigo/gestion-documentos-dgppt-vmt",
)({
  head: () => ({
    meta: [
      { title: "Gestión de documentos DGPPT – VMT" },
      {
        name: "description",
        content: "Seguimiento de documentos remitidos desde DGPPT hacia el VMT.",
      },
    ],
  }),
  component: GestionDocumentosDgpptVmtPage,
});

const sections: PredioSimpleSection[] = [
  {
    title: "Documento remitido",
    fields: [
      { key: "documentoEnviado", label: "Documento enviado", required: true },
      { key: "fechaEnvio", label: "Fecha", type: "date", required: true },
      { key: "destino", label: "Destino", required: true },
      { key: "numeroTramite", label: "Número de trámite", required: true },
      {
        key: "estado",
        label: "Estado",
        type: "select",
        options: ["BORRADOR", "ENVIADO", "RECIBIDO", "EN EVALUACIÓN", "OBSERVADO", "ATENDIDO"],
        required: true,
      },
      {
        key: "archivo",
        label: "Archivo enviado",
        type: "file",
        accept: ".pdf,.doc,.docx",
        fullWidth: true,
      },
    ],
  },
];

function GestionDocumentosDgpptVmtPage() {
  const { projectId, codigo } = Route.useParams();
  return (
    <PredioSimpleForm
      projectId={projectId}
      codigo={codigo}
      title="Gestión de documentos DGPPT – VMT"
      menuLabel="3.5 Gestión de documentos DGPPT – VMT"
      badgeSuffix="Etapa II · 3.5"
      sections={sections}
    />
  );
}
