import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/seguridad/roles")({
  component: () => <Outlet />,
});
