import { createFileRoute } from "@tanstack/react-router";

import { TerritorialPagosDashboard } from "./seguimiento-monitoreo.territorial-pagos-cierre";

export const Route = createFileRoute("/seguimiento-monitoreo/territorial-integral")({
  head: () => ({
    meta: [{ title: "Dashboard territorial integral de pagos, inscripción y cierre" }],
  }),
  component: TerritorialPagosDashboard,
});
