import { createFileRoute } from "@tanstack/react-router";

import { PredioSimpleForm, type PredioSimpleSection } from "@/components/PredioSimpleForm";

export const Route = createFileRoute(
  "/proyectos/$projectId/predios/$codigo/certificado-registral-inmobiliario",
)({
  head: () => ({
    meta: [
      { title: "Certificado Registral Inmobiliario – CRI" },
      {
        name: "description",
        content: "Registro del CRI, titularidad, cargas y gravámenes del predio.",
      },
    ],
  }),
  component: CertificadoRegistralInmobiliarioPage,
});

const sections: PredioSimpleSection[] = [
  {
    title: "Datos del certificado",
    fields: [
      { key: "numero", label: "Número de CRI", required: true },
      { key: "fecha", label: "Fecha", type: "date", required: true },
      { key: "partida", label: "Partida registral", required: true },
      { key: "titular", label: "Titular registral", required: true },
      { key: "cargas", label: "Cargas", type: "textarea", fullWidth: true },
      { key: "gravamenes", label: "Gravámenes", type: "textarea", fullWidth: true },
      {
        key: "archivo",
        label: "Archivo CRI",
        type: "file",
        accept: ".pdf",
        fullWidth: true,
      },
    ],
  },
];

function CertificadoRegistralInmobiliarioPage() {
  const { projectId, codigo } = Route.useParams();
  return (
    <PredioSimpleForm
      projectId={projectId}
      codigo={codigo}
      title="Certificado Registral Inmobiliario – CRI"
      menuLabel="2.5 Certificado Registral Inmobiliario – CRI"
      badgeSuffix="Etapa I · 2.5"
      sections={sections}
    />
  );
}
