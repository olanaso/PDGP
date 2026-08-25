import { createFileRoute } from "@tanstack/react-router";
import { AcquisitionMilestonesConfig } from "../components/AcquisitionMilestonesConfig";
import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/configuracion/hitos-plazos")({
  head: () => ({ meta: [{ title: "Configuración · Hitos y plazos" }] }),
  component: HitosPlazosPage,
});

function HitosPlazosPage() {
  return (
    <div className="flex min-h-screen bg-[#f4f5f7] text-[#172033]">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-auto p-3 xl:p-4">
        <AcquisitionMilestonesConfig />
      </main>
    </div>
  );
}
