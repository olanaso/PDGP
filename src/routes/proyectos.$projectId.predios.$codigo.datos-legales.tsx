import { createFileRoute, useRouter } from "@tanstack/react-router";
import { PadronLegalForm } from "@/components/PadronLegalForm";
import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/datos-legales")({
  head: () => ({
    meta: [
      { title: "Padrón Legal — Datos legales del predio" },
      { name: "description", content: "Registro de datos legales del predio: expediente, ubicación, titulares, lucro cesante y CBC." },
    ],
  }),
  component: DatosLegalesPage,
});

function DatosLegalesPage() {
  const { projectId, codigo } = Route.useParams();
  const router = useRouter();
  const goBack = () => router.history.back();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Datos legales"
        badgeLabel="Predio"
        badgeValue={decodedCodigo}
        badgeSuffix="PADRON LEGAL"
      />

      <main className="mx-auto max-w-[1280px] p-4">
        <h1 className="mb-3 text-[16px] font-semibold" style={{ color: "#dc2626" }}>
          Padrón Legal
        </h1>

        <PadronLegalForm codigoPredio={decodedCodigo} onCancel={goBack} onSave={goBack} />
      </main>
    </div>
  );
}
