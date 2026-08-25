import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "../components/AppSidebar";
import { Network } from "lucide-react";

export const Route = createFileRoute("/interoperabilidad")({
  head: () => ({ meta: [{ title: "Interoperabilidad" }] }),
  component: Page,
});

function Page() {
  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <AppSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Network size={22} className="text-[#dc2626]" />
          <h1 className="text-[20px] font-semibold text-[#111]">Interoperabilidad</h1>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-md p-8 text-[13px] text-[#6b7280]">
          Módulo en construcción. Aquí se gestionará el intercambio de información con entidades externas (SUNARP, RENIEC, COFOPRI, MEF, etc.).
        </div>
      </main>
    </div>
  );
}
