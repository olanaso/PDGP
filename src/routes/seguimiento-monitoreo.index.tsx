import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/seguimiento-monitoreo/")({
  component: SeguimientoMonitoreoIndex,
});

function SeguimientoMonitoreoIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/seguimiento-monitoreo/general", replace: true });
  }, [navigate]);

  return null;
}
