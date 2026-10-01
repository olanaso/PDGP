// Visor 3D con ThatOpen (engine_components + fragments + web-ifc).
// Solo cliente: importar con import() dinámico desde la ruta.
import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type BimSelection = { name: string; properties: [string, string][] };

type Viewer = {
  components: OBC.Components;
  world: OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBC.SimpleRenderer>;
  fragments: OBC.FragmentsManager;
  loader: OBC.IfcLoader;
};

// Recorre el ItemData de fragments y extrae pares Nombre / Valor de los property sets.
function collectProperties(data: FRAGS.ItemData): [string, string][] {
  const out: [string, string][] = [];
  const psets = (data.IsDefinedBy as FRAGS.ItemData[] | undefined) ?? [];
  for (const pset of psets) {
    const props = (pset.HasProperties as FRAGS.ItemData[] | undefined) ?? [];
    for (const prop of props) {
      const name = (prop.Name as FRAGS.ItemAttribute | undefined)?.value;
      const value = (prop.NominalValue as FRAGS.ItemAttribute | undefined)?.value;
      if (name !== undefined && value !== undefined) out.push([String(name), String(value)]);
    }
  }
  return out;
}

export default function BimViewer({
  ifcData,
  modelName,
  onSelect,
}: {
  ifcData: Uint8Array | null;
  modelName: string;
  onSelect?: (selection: BimSelection | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [status, setStatus] = useState("Iniciando visor…");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;
    const components = new OBC.Components();

    (async () => {
      const worlds = components.get(OBC.Worlds);
      const world = worlds.create<
        OBC.SimpleScene,
        OBC.OrthoPerspectiveCamera,
        OBC.SimpleRenderer
      >();
      world.scene = new OBC.SimpleScene(components);
      world.renderer = new OBC.SimpleRenderer(components, container);
      world.camera = new OBC.OrthoPerspectiveCamera(components);
      components.init();
      world.scene.setup();
      world.scene.three.background = new THREE.Color("#eef2f7");
      components.get(OBC.Grids).create(world);
      await world.camera.controls.setLookAt(150, 120, 150, 0, 0, 0);

      // El worker de fragments se obtiene de unpkg (comportamiento por defecto de la librería).
      const fragments = components.get(OBC.FragmentsManager);
      fragments.init(await OBC.FragmentsManager.getWorker());
      world.camera.controls.addEventListener("rest", () => fragments.core.update(true));
      fragments.list.onItemSet.add(({ value: model }) => {
        model.useCamera(world.camera.three);
        world.scene.three.add(model.object);
        fragments.core.update(true);
      });

      // El wasm de web-ifc se sirve desde public/web-ifc (copiado de node_modules/web-ifc;
      // debe coincidir con la versión instalada, ver public/web-ifc/VERSION).
      const loader = components.get(OBC.IfcLoader);
      await loader.setup({
        autoSetWasm: false,
        wasm: { path: `${import.meta.env.BASE_URL}web-ifc/`, absolute: true },
      });
      if (disposed) return;
      viewerRef.current = { components, world, fragments, loader };
      setStatus("");
    })().catch((error: unknown) => {
      setStatus(
        "No se pudo iniciar el visor: " + (error instanceof Error ? error.message : String(error)),
      );
    });

    return () => {
      disposed = true;
      viewerRef.current = null;
      components.dispose();
    };
  }, []);

  // Carga (o recarga) el IFC cuando cambian los datos.
  useEffect(() => {
    if (!ifcData) return;
    let cancelled = false;
    const run = async () => {
      // Espera a que el visor esté listo.
      while (!viewerRef.current && !cancelled) await new Promise((r) => setTimeout(r, 100));
      const viewer = viewerRef.current;
      if (!viewer || cancelled) return;
      const { fragments, loader, world, components } = viewer;
      setStatus("Procesando IFC…");
      for (const [id] of fragments.list) await fragments.core.disposeModel(id);
      await loader.load(ifcData, false, modelName, {
        instanceCallback: (importer) => importer.addAllRelations(),
      });
      await fragments.core.update(true);
      const boxer = components.get(OBC.BoundingBoxer);
      boxer.list.clear();
      boxer.addFromModels();
      const box = boxer.get();
      if (!box.isEmpty())
        await world.camera.controls.fitToBox(box, true, {
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 10,
          paddingBottom: 10,
        });
      boxer.list.clear();
      if (!cancelled) setStatus("");
    };
    run().catch((error: unknown) => {
      if (!cancelled)
        setStatus(
          "Error al cargar el IFC: " + (error instanceof Error ? error.message : String(error)),
        );
    });
    return () => {
      cancelled = true;
    };
  }, [ifcData, modelName]);

  async function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    const viewer = viewerRef.current;
    const container = containerRef.current;
    if (!viewer || !container) return;
    const { fragments, world } = viewer;
    const canvas = container.querySelector("canvas");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(event.clientX - rect.left, event.clientY - rect.top);
    const hit = await fragments.raycast({ camera: world.camera.three, mouse, dom: canvas });
    await fragments.resetHighlight();
    if (!hit) {
      onSelect?.(null);
      return;
    }
    const model = hit.fragments;
    await fragments.highlight(
      {
        color: new THREE.Color("#facc15"),
        renderedFaces: FRAGS.RenderedFaces.TWO,
        opacity: 1,
        transparent: false,
      },
      { [model.modelId]: new Set([hit.localId]) },
    );
    const [data] = await model.getItemsData([hit.localId], {
      attributesDefault: true,
      relations: { IsDefinedBy: { attributes: true, relations: true } },
    });
    const name = (data?.Name as FRAGS.ItemAttribute | undefined)?.value;
    onSelect?.({
      name: name ? String(name) : `Elemento ${hit.localId}`,
      properties: data ? collectProperties(data) : [],
    });
    await fragments.core.update(true);
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" onClick={handleClick} />
      {status && (
        <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
          <span className="rounded bg-white/90 px-3 py-1 text-[11px] text-gray-700 shadow">
            {status}
          </span>
        </div>
      )}
    </div>
  );
}
