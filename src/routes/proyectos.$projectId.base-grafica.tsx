import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/proyectos/$projectId/base-grafica")({
  component: () => <Outlet />,
});