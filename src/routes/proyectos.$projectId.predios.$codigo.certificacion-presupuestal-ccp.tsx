import { createFileRoute } from "@tanstack/react-router";

import { PredioSimpleForm, type PredioSimpleSection } from "@/components/PredioSimpleForm";

export const Route = createFileRoute(
  "/proyectos/$projectId/predios/$codigo/certificacion-presupuestal-ccp",
)({
  head: () => ({
    meta: [
      { title: "Certificación presupuestal – CCP" },
      {
        name: "description",
        content: "Registro de la Certificación de Crédito Presupuestario vinculada al predio.",
      },
    ],
  }),
  component: CertificacionPresupuestalCcpPage,
});

const sections: PredioSimpleSection[] = [
  {
    title: "Datos de la certificación presupuestal",
    fields: [
      { key: "numeroCcp", label: "Número CCP", required: true },
      { key: "fechaCcp", label: "Fecha", type: "date", required: true },
      {
        key: "montoCertificado",
        label: "Monto certificado",
        placeholder: "S/ 0.00",
        required: true,
      },
      { key: "fuenteFinanciamiento", label: "Fuente de financiamiento", required: true },
      {
        key: "archivoCcp",
        label: "Archivo CCP",
        type: "file",
        accept: ".pdf,.doc,.docx",
        fullWidth: true,
      },
    ],
  },
];

function CertificacionPresupuestalCcpPage() {
  const { projectId, codigo } = Route.useParams();
  return (
    <PredioSimpleForm
      projectId={projectId}
      codigo={codigo}
      title="Certificación presupuestal – CCP"
      menuLabel="3.1 Certificación presupuestal – CCP"
      badgeSuffix="Etapa II · 3.1"
      sections={sections}
    />
  );
}
