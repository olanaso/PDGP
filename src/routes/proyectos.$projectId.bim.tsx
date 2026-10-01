import { createFileRoute } from "@tanstack/react-router";
import { Box, FileDown, Info, Layers3, Upload } from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";

import type { BimSelection } from "@/components/BimViewer";
import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { buildLots, buildProjectIfc } from "@/lib/ifcExport";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/bim")({
  head: () => ({
    meta: [
      { title: "Modelo BIM del proyecto" },
      {
        name: "description",
        content: "Generación del IFC consolidado del proyecto y visor 3D de lotes (ThatOpen).",
      },
    ],
  }),
  component: BimPage,
});

type ViewerProps = {
  ifcData: Uint8Array | null;
  modelName: string;
  onSelect?: (selection: BimSelection | null) => void;
};

// El visor usa WebGL/workers: se importa solo en el cliente, como MapView.
function ClientBimViewer(props: ViewerProps) {
  const [Comp, setComp] = useState<ComponentType<ViewerProps> | null>(null);
  useEffect(() => {
    import("@/components/BimViewer").then((m) => setComp(() => m.default));
  }, []);
  if (!Comp) return <div className="h-full w-full animate-pulse bg-[#e5e7eb]" />;
  return <Comp {...props} />;
}

type ModeloRegistrado = {
  nombre: string;
  origen: "Generado" | "Cargado";
  bytes: number;
  fecha: string;
};

function BimPage() {
  const { projectId } = Route.useParams();
  const proyecto = getProyecto(projectId);
  const nombre = proyecto?.nombre ?? projectId;
  const lots = useMemo(() => buildLots(), []);
  const [ifcData, setIfcData] = useState<Uint8Array | null>(null);
  const [modelName, setModelName] = useState("");
  const [modelos, setModelos] = useState<ModeloRegistrado[]>([]);
  const [selection, setSelection] = useState<BimSelection | null>(null);

  const ifcFileName = `consolidado_${projectId}.ifc`;

  function registrar(modelo: ModeloRegistrado) {
    setModelos((prev) => [modelo, ...prev.filter((m) => m.nombre !== modelo.nombre)]);
  }

  function generar(descargar: boolean) {
    const text = buildProjectIfc(nombre, lots);
    const bytes = new TextEncoder().encode(text);
    setIfcData(bytes);
    setModelName(ifcFileName);
    setSelection(null);
    registrar({
      nombre: ifcFileName,
      origen: "Generado",
      bytes: bytes.length,
      fecha: new Date().toLocaleString("es-PE"),
    });
    if (descargar) {
      const url = URL.createObjectURL(new Blob([text], { type: "application/x-step" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = ifcFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  }

  async function cargar(file: File | null) {
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    setIfcData(bytes);
    setModelName(file.name);
    setSelection(null);
    registrar({
      nombre: file.name,
      origen: "Cargado",
      bytes: bytes.length,
      fecha: new Date().toLocaleString("es-PE"),
    });
  }

  // Modelo de ejemplo: los lotes del proyecto se cargan al abrir la página.
  useEffect(() => {
    generar(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const areaTotal = lots.reduce((s, l) => s + (Number(l.row.area.replace(/,/g, "")) || 0), 0);
  const modalidades = Array.from(new Set(lots.map((l) => l.row.mod || "SIN INFORMACION")));

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937] text-sm">
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ProjectPageHeader
          projectId={projectId}
          projectLabel={nombre}
          title="Modelo BIM"
          badgeLabel="PROYECTO"
          badgeValue={nombre}
          badgeSuffix="BIM / IFC"
        />

        <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#e5e7eb] bg-white px-4 py-3">
            <div>
              <h2 className="flex items-center gap-2 text-[14px] font-semibold">
                <Box size={16} className="text-[#dc2626]" /> Consolidado BIM del proyecto
              </h2>
              <p className="text-[11px] text-[#6b7280]">
                {lots.length} lotes ·{" "}
                {areaTotal.toLocaleString("es-PE", { maximumFractionDigits: 0 })} m² afectados ·{" "}
                {modalidades.length} modalidades · IFC4 generado desde la base gráfica de predios
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => generar(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-3 text-[12px] font-medium text-white hover:bg-[#b91c1c]"
              >
                <FileDown size={14} /> Generar y descargar IFC
              </button>
              <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded border border-[#dc2626] px-3 text-[12px] font-medium text-[#dc2626] hover:bg-[#fef2f2]">
                <Upload size={14} /> Cargar IFC al sistema
                <input
                  type="file"
                  accept=".ifc"
                  className="hidden"
                  onChange={(e) => cargar(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="relative min-h-[420px] overflow-hidden rounded border border-[#e5e7eb] bg-white">
              <ClientBimViewer ifcData={ifcData} modelName={modelName} onSelect={setSelection} />
              <div className="pointer-events-none absolute bottom-3 left-3 rounded bg-white/90 px-2 py-1 text-[10px] text-[#6b7280] shadow">
                Visor ThatOpen · arrastre para orbitar, rueda para zoom, clic en un lote para ver
                sus datos
              </div>
            </div>

            <aside className="flex min-h-0 flex-col gap-3 overflow-auto">
              <div className="rounded border border-[#e5e7eb] bg-white p-3">
                <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-[#dc2626]">
                  <Info size={13} /> Lote seleccionado
                </h3>
                {selection ? (
                  <dl className="mt-2 space-y-1 text-[11px]">
                    <div>
                      <dt className="text-[9px] uppercase text-[#9ca3af]">Elemento</dt>
                      <dd className="font-mono font-semibold">{selection.name}</dd>
                    </div>
                    {selection.properties.map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-[9px] uppercase text-[#9ca3af]">{k}</dt>
                        <dd className="break-words">{v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-2 text-[11px] text-[#6b7280]">
                    Haga clic sobre un lote en el visor.
                  </p>
                )}
              </div>

              <div className="rounded border border-[#e5e7eb] bg-white p-3">
                <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-[#dc2626]">
                  <Layers3 size={13} /> Modelos en el sistema
                </h3>
                <ul className="mt-2 space-y-1.5 text-[11px]">
                  {modelos.map((m) => (
                    <li
                      key={m.nombre}
                      className={`rounded border px-2 py-1.5 ${m.nombre === modelName ? "border-[#dc2626] bg-[#fef2f2]" : "border-[#e5e7eb]"}`}
                    >
                      <p className="truncate font-mono font-semibold" title={m.nombre}>
                        {m.nombre}
                      </p>
                      <p className="text-[10px] text-[#6b7280]">
                        {m.origen} · {(m.bytes / 1024).toFixed(0)} KB · {m.fecha}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
