import { createFileRoute } from "@tanstack/react-router";

import { PredioSimpleForm, type PredioSimpleSection } from "@/components/PredioSimpleForm";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/pago-consignacion")({
  head: () => ({
    meta: [
      { title: "Pago / Consignación" },
      {
        name: "description",
        content: "Registro del pago directo o consignación vinculada al predio.",
      },
    ],
  }),
  component: PagoConsignacionPage,
});

const sections: PredioSimpleSection[] = [
  {
    title: "Datos del pago",
    fields: [
      {
        key: "tipoPago",
        label: "Tipo de pago",
        type: "select",
        options: ["PAGO DIRECTO", "CONSIGNACIÓN BANCO DE LA NACIÓN"],
        required: true,
      },
      { key: "monto", label: "Monto", placeholder: "S/ 0.00", required: true },
      { key: "fechaPago", label: "Fecha", type: "date", required: true },
      { key: "numeroComprobante", label: "Número de comprobante", required: true },
      {
        key: "entidadBancaria",
        label: "Entidad bancaria",
        type: "select",
        options: ["BANCO DE LA NACIÓN", "OTRA ENTIDAD"],
      },
      { key: "numeroOperacion", label: "Número de operación" },
      {
        key: "comprobante",
        label: "Comprobante",
        type: "file",
        accept: ".pdf,image/*",
        fullWidth: true,
      },
    ],
  },
];

function PagoConsignacionPage() {
  const { projectId, codigo } = Route.useParams();
  return (
    <PredioSimpleForm
      projectId={projectId}
      codigo={codigo}
      title="Pago / Consignación"
      menuLabel="4.3 Pago / Consignación"
      badgeSuffix="Etapa III · 4.3"
      sections={sections}
    />
  );
}
