import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "../components/AppSidebar";
import { FolderArchive } from "lucide-react";

export const Route = createFileRoute("/gestion-documental")({
  head: () => ({ meta: [{ title: "Gestión Documental" }] }),
  component: Page,
});

function Page() {
  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <AppSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center gap-3 mb-6">
          <FolderArchive size={22} className="text-[#dc2626]" />
          <h1 className="text-[20px] font-semibold text-[#111]">Gestión Documental de Registros y Productos</h1>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-md p-8 text-[13px] text-[#6b7280]">
          Módulo en construcción. Aquí se centralizará el archivo digital de registros y productos generados.
        </div>
      </main>
    </div>
  );
}
