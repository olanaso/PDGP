import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "../components/AppSidebar";
import { ClipboardCheck } from "lucide-react";

export const Route = createFileRoute("/seguimiento-adquisicion")({
  head: () => ({ meta: [{ title: "Seguimiento de Adquisición" }] }),
  component: Page,
});

function Page() {
  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <AppSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardCheck size={22} className="text-[#dc2626]" />
          <h1 className="text-[20px] font-semibold text-[#111]">Módulo de Seguimiento de la Adquisición por el Sujeto Pasivo</h1>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-md p-8 text-[13px] text-[#6b7280]">
          Módulo en construcción. Aquí se registrará el seguimiento del proceso de adquisición por parte del sujeto pasivo.
        </div>
      </main>
    </div>
  );
}
