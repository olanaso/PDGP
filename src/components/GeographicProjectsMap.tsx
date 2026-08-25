import { useMemo, useState } from "react";
import {
  Anchor,
  Building2,
  BusFront,
  Construction,
  Droplets,
  Layers3,
  Map as MapIcon,
  Plane,
  Route,
  Search,
  ShipWheel,
  TrainFront,
  X,
  type LucideIcon,
} from "lucide-react";
import { Map, Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { projectStateColors, type GeographicProject } from "@/lib/geographicDashboardData";

type BaseMap = "Calles" | "Administrativo" | "Satelital";

const projectIcons: Record<string, LucideIcon> = {
  Carretera: Construction,
  Puente: Route,
  Aeropuerto: Plane,
  Puerto: Anchor,
  Ferrocarril: TrainFront,
  "Corredor vial": Route,
  Saneamiento: Droplets,
  "Edificación pública": Building2,
  Terminal: BusFront,
  "Infraestructura urbana": MapIcon,
  "Proyecto multimodal": ShipWheel,
};

const layerOptions = [
  "Departamentos",
  "Provincias",
  "Trazado",
  "Predios",
  "Interferencias",
  "Áreas liberadas",
];

export default function GeographicProjectsMap({
  projects,
  selected,
  onSelect,
}: {
  projects: GeographicProject[];
  selected: GeographicProject | null;
  onSelect: (project: GeographicProject | null) => void;
}) {
  const [baseMap, setBaseMap] = useState<BaseMap>("Calles");
  const [layers, setLayers] = useState<string[]>(["Departamentos", "Trazado"]);
  const [layerMenu, setLayerMenu] = useState(false);
  const [search, setSearch] = useState("");

  const mapStyle = useMemo(() => {
    const source =
      baseMap === "Satelital"
        ? {
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            attribution: "Esri World Imagery",
          }
        : baseMap === "Administrativo"
          ? {
              tiles: ["https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"],
              attribution: "CARTO",
            }
          : {
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              attribution: "© OpenStreetMap contributors",
            };
    return {
      version: 8 as const,
      sources: {
        base: { type: "raster" as const, tileSize: 256, ...source },
      },
      layers: [
        { id: "background", type: "background" as const, paint: { "background-color": "#dbeafe" } },
        {
          id: "base",
          type: "raster" as const,
          source: "base",
          paint: { "raster-saturation": baseMap === "Satelital" ? -0.15 : -0.45 },
        },
      ],
    };
  }, [baseMap]);

  const visibleProjects = projects.filter((project) =>
    `${project.name} ${project.code} ${project.department}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const toggleLayer = (layer: string) =>
    setLayers((current) =>
      current.includes(layer) ? current.filter((item) => item !== layer) : [...current, layer],
    );

  return (
    <div className="relative h-full min-h-[610px] overflow-hidden rounded-lg">
      <Map
        initialViewState={{ longitude: -75.2, latitude: -9.7, zoom: 4.45 }}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        {visibleProjects.map((project) => {
          const Icon = projectIcons[project.type] ?? MapIcon;
          return (
            <Marker
              key={project.id}
              longitude={project.longitude}
              latitude={project.latitude}
              anchor="center"
            >
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(project);
                }}
                className={`group relative flex size-10 items-center justify-center rounded-xl border-2 border-white text-white shadow-lg transition hover:scale-110 ${selected?.id === project.id ? "ring-4 ring-white/80" : ""}`}
                style={{ background: projectStateColors[project.state] }}
                title={`${project.code} · ${project.name}`}
              >
                <Icon size={19} />
                <span className="absolute left-1/2 top-11 hidden w-max max-w-56 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-[9px] font-medium text-white shadow-lg group-hover:block">
                  {project.name}
                </span>
              </button>
            </Marker>
          );
        })}

        {selected &&
          layers.includes("Predios") &&
          [
            [-0.045, 0.025, "#2563eb"],
            [0.035, 0.018, "#eab308"],
            [-0.02, -0.034, "#16a34a"],
            [0.048, -0.025, "#dc2626"],
            [0.006, 0.048, "#7c3aed"],
          ].map(([longitudeOffset, latitudeOffset, color], index) => (
            <Marker
              key={`predio-${index}`}
              longitude={selected.longitude + Number(longitudeOffset)}
              latitude={selected.latitude + Number(latitudeOffset)}
            >
              <span
                className="block size-3 rounded-sm border border-white shadow"
                style={{ background: String(color) }}
                title="Predio demostrativo"
              />
            </Marker>
          ))}

        {selected && (
          <Popup
            longitude={selected.longitude}
            latitude={selected.latitude}
            offset={26}
            closeButton={false}
            maxWidth="370px"
            onClose={() => onSelect(null)}
          >
            <div className="w-[330px] text-[10px]">
              <div className="flex items-start justify-between gap-3 border-b pb-2">
                <div>
                  <div className="text-[9px] font-semibold text-red-600">{selected.code}</div>
                  <div className="mt-0.5 text-[12px] font-bold text-slate-800">{selected.name}</div>
                  <div className="mt-0.5 text-slate-500">
                    {selected.type} · {selected.department}
                  </div>
                </div>
                <button
                  onClick={() => onSelect(null)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                <PopupMetric
                  label="Ejecución"
                  value={`${((selected.executed / selected.investment) * 100).toFixed(1)}%`}
                />
                <PopupMetric label="Avance físico" value={`${selected.physical}%`} />
                <PopupMetric
                  label="Disponibilidad"
                  value={`${((selected.delivered / selected.properties) * 100).toFixed(1)}%`}
                />
                <PopupMetric label="Predios" value={selected.properties} />
                <PopupMetric label="Entregados" value={selected.delivered} />
                <PopupMetric label="Inscritos" value={selected.registered} />
              </div>
              <div className="mt-2 rounded bg-slate-50 p-2 text-slate-600">
                Riesgo: <b>{selected.risk}</b> · Disponibilidad estimada:{" "}
                <b>{selected.availabilityDate}</b>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1">
                {["Ver detalle", "Ver predios", "Ver gastos", "Cronograma"].map((action) => (
                  <button
                    key={action}
                    className="rounded border border-slate-200 px-1 py-1.5 text-[8px] font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-90px)] gap-2">
        <label className="relative block w-64 max-w-[45vw]">
          <Search size={13} className="absolute left-2 top-2.5 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar proyecto o departamento"
            className="h-8 w-full rounded-md border border-slate-200 bg-white/95 pl-7 pr-2 text-[10px] shadow"
          />
        </label>
        <select
          value={baseMap}
          onChange={(event) => setBaseMap(event.target.value as BaseMap)}
          className="h-8 rounded-md border border-slate-200 bg-white/95 px-2 text-[10px] shadow"
        >
          <option>Calles</option>
          <option>Administrativo</option>
          <option>Satelital</option>
        </select>
        <div className="relative">
          <button
            onClick={() => setLayerMenu((value) => !value)}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white/95 px-2 text-[10px] font-semibold shadow"
          >
            <Layers3 size={13} /> Capas ({layers.length})
          </button>
          {layerMenu && (
            <div className="absolute left-0 top-10 w-48 rounded-md border border-slate-200 bg-white p-2 shadow-xl">
              {layerOptions.map((layer) => (
                <label
                  key={layer}
                  className="flex items-center gap-2 rounded px-2 py-1.5 text-[9px] hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={layers.includes(layer)}
                    onChange={() => toggleLayer(layer)}
                    className="accent-red-600"
                  />{" "}
                  {layer}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-3 left-3 z-10 max-w-[520px] rounded-lg border border-slate-200 bg-white/95 p-2.5 text-[8px] shadow-lg backdrop-blur-sm">
        <div className="mb-1.5 font-semibold text-slate-700">Estado del proyecto</div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {Object.entries(projectStateColors).map(([state, color]) => (
            <span key={state} className="flex items-center gap-1 text-slate-600">
              <i className="size-2 rounded-full" style={{ background: color }} />
              {state}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PopupMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded bg-slate-50 p-1.5 text-center">
      <div className="text-[11px] font-bold text-slate-800">{value}</div>
      <div className="text-[8px] text-slate-400">{label}</div>
    </div>
  );
}
