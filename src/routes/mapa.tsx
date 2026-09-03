import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Construction,
  ExternalLink,
  Layers3,
  LoaderCircle,
  Map as MapIcon,
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
  Plane,
  RotateCcw,
  Route as RouteIcon,
  Search,
  Satellite,
  TrainFront,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Map,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
  type MapRef,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { proyectos } from "@/lib/projectsData";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa de proyectos — MTC" },
      {
        name: "description",
        content: "Visor geográfico nacional de los proyectos de gestión predial del MTC.",
      },
    ],
  }),
  component: ProjectsMapPage,
});

type BaseMap = "calles" | "satelital" | "claro";

type ProjectProperties = {
  ITEM: number | string;
  TIPO_INFRA: string;
  PROYECTO: string;
  DENOMINACI: string;
  UBICACION: string;
  DEPARTAMEN: string;
  GRUPO: string;
};

type ProjectFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: ProjectProperties;
};

type ProjectFeatureCollection = {
  type: "FeatureCollection";
  features: ProjectFeature[];
};

type MapProject = ProjectProperties & {
  id: string;
  longitude: number;
  latitude: number;
  projectId?: string;
};

type InfrastructureSpec = {
  label: string;
  icon: LucideIcon;
  color: string;
  softColor: string;
};

const PROJECTS_GEOJSON_URL = `${import.meta.env.BASE_URL}data/proyectos.geojson`;
const DDP_TMS_URL =
  "http://3.233.4.153:8080/geoserver/gwc/service/tms/1.0.0/ddp%3Ageo_ddp_area_proyecto@EPSG%3A900913@png8/{z}/{x}/{y}.png8";
const DEPARTMENT_LIMITS_TMS_URL =
  "http://3.233.4.153:8080/geoserver/gwc/service/tms/1.0.0/ddp%3Ageo_limite_departamento@EPSG%3A900913@png8/{z}/{x}/{y}.png8";
const PERU_VIEW = { longitude: -75.05, latitude: -9.25, zoom: 4.45 };

const infrastructureSpecs: Record<string, InfrastructureSpec> = {
  AEROPORTUARIO: {
    label: "Aeroportuario",
    icon: Plane,
    color: "#dc2626",
    softColor: "#fef2f2",
  },
  VIAL: {
    label: "Vial",
    icon: Construction,
    color: "#2563eb",
    softColor: "#eff6ff",
  },
  "VIAS CONCESIONADAS": {
    label: "Vías concesionadas",
    icon: RouteIcon,
    color: "#d97706",
    softColor: "#fffbeb",
  },
  FERROVIARIO: {
    label: "Ferroviario",
    icon: TrainFront,
    color: "#7c3aed",
    softColor: "#f5f3ff",
  },
};

const projectRouteAliases: Record<string, string> = {
  "autopista del sol": "autopista-del-sol",
  "desvio quilca la concordia": "dv-quilca-la-concordia",
  "huaral acos": "dv-huaral-acos",
  "iirsa centro tramo 2": "iirsa-centro",
  "iirsa norte": "iirsa-norte",
  "iirsa sur tramo 2": "iirsa-sur-t2",
  "iirsa sur tramo 3": "iirsa-sur-t3",
  "iirsa sur tramo 4": "iirsa-sur-t4",
  "iirsa sur tramo 5 puno juliaca": "carretera-puno-juliaca",
  "longitudinal de la sierra norte tramo 2": "longitudinal-de-la-sierra-t2",
  "longitudinal de la sierra tramo 04": "longitudinal-de-la-sierra-t4",
  "nuevo mocupe cayalti": "dv-nuevo-mocupe-cayalti",
  "red vial 4": "red-vial-4",
  "red vial 5": "red-vial-5",
  "red vial 6": "red-vial-6",
  "anillo vial periferico avp": "anillo-vial-periferico",
  "ferrocarril huancayo huancavelica": "fhh",
};

function ProjectsMapPage() {
  const mapRef = useRef<MapRef | null>(null);
  const [projects, setProjects] = useState<MapProject[]>([]);
  const [selected, setSelected] = useState<MapProject | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("TODOS");
  const [baseMap, setBaseMap] = useState<BaseMap>("satelital");
  const [showDdpLayer, setShowDdpLayer] = useState(true);
  const [showDepartmentLimits, setShowDepartmentLimits] = useState(true);
  const [listOpen, setListOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      try {
        const response = await fetch(PROJECTS_GEOJSON_URL, { signal: controller.signal });
        if (!response.ok) throw new Error(`No se pudo cargar el GeoJSON (${response.status}).`);
        const geojson = (await response.json()) as ProjectFeatureCollection;
        if (geojson.type !== "FeatureCollection" || !Array.isArray(geojson.features)) {
          throw new Error("El archivo no contiene una colección GeoJSON válida.");
        }

        const parsed = geojson.features
          .filter(
            (feature) =>
              feature.geometry?.type === "Point" &&
              Number.isFinite(Number(feature.geometry.coordinates?.[0])) &&
              Number.isFinite(Number(feature.geometry.coordinates?.[1])),
          )
          .map((feature, index) => {
            const [longitude, latitude] = feature.geometry.coordinates;
            return {
              ...feature.properties,
              id: `${feature.properties.ITEM}-${index}`,
              longitude: Number(longitude),
              latitude: Number(latitude),
              projectId: resolveProjectId(feature.properties.PROYECTO),
            };
          })
          .sort((a, b) => a.PROYECTO.localeCompare(b.PROYECTO, "es"));

        setProjects(parsed);
      } catch (loadError) {
        if ((loadError as Error).name !== "AbortError") {
          setError(
            (loadError as Error).message || "No se pudo cargar la información de proyectos.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadProjects();
    return () => controller.abort();
  }, []);

  const infrastructureTypes = useMemo(
    () => Array.from(new Set(projects.map((project) => project.TIPO_INFRA))).sort(),
    [projects],
  );

  const filteredProjects = useMemo(() => {
    const query = normalizeText(search);
    return projects.filter((project) => {
      if (typeFilter !== "TODOS" && project.TIPO_INFRA !== typeFilter) return false;
      if (!query) return true;
      return normalizeText(
        `${project.PROYECTO} ${project.DENOMINACI} ${project.DEPARTAMEN} ${project.UBICACION} ${project.GRUPO}`,
      ).includes(query);
    });
  }, [projects, search, typeFilter]);

  const mapStyle = useMemo(() => {
    const baseSource =
      baseMap === "satelital"
        ? {
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            attribution: "Esri World Imagery",
          }
        : baseMap === "claro"
          ? {
              tiles: ["https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"],
              attribution: "© OpenStreetMap contributors © CARTO",
            }
          : {
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              attribution: "© OpenStreetMap contributors",
            };

    return {
      version: 8 as const,
      sources: {
        base: {
          type: "raster" as const,
          tileSize: 256,
          ...baseSource,
        },
        ddpProjects: {
          type: "raster" as const,
          tiles: [DDP_TMS_URL],
          tileSize: 256,
          scheme: "tms" as const,
          minzoom: 0,
          maxzoom: 20,
          bounds: [-90, -22.5, -67.5, 0] as [number, number, number, number],
          attribution: "Dirección de Disponibilidad de Predios — MTC",
        },
        departmentLimits: {
          type: "raster" as const,
          tiles: [DEPARTMENT_LIMITS_TMS_URL],
          tileSize: 256,
          scheme: "tms" as const,
          minzoom: 1,
          maxzoom: 22,
          bounds: [-90, -22.5, -67.5, 0] as [number, number, number, number],
          attribution: "Límites departamentales — MTC",
        },
      },
      layers: [
        {
          id: "background",
          type: "background" as const,
          paint: { "background-color": "#dbeafe" },
        },
        {
          id: "base",
          type: "raster" as const,
          source: "base",
          paint: {
            "raster-saturation": baseMap === "satelital" ? -0.12 : -0.25,
            "raster-brightness-max": baseMap === "satelital" ? 0.82 : 1,
          },
        },
        {
          id: "ddp-project-areas",
          type: "raster" as const,
          source: "ddpProjects",
          layout: { visibility: showDdpLayer ? ("visible" as const) : ("none" as const) },
          paint: { "raster-opacity": 0.86 },
        },
        {
          id: "department-limits",
          type: "raster" as const,
          source: "departmentLimits",
          layout: {
            visibility: showDepartmentLimits ? ("visible" as const) : ("none" as const),
          },
          paint: { "raster-opacity": 1 },
        },
      ],
    };
  }, [baseMap, showDdpLayer, showDepartmentLimits]);

  function selectProject(project: MapProject) {
    setSelected(project);
    mapRef.current?.flyTo({
      center: [project.longitude, project.latitude],
      zoom: Math.max(mapRef.current.getZoom(), 7.2),
      duration: 900,
      essential: true,
    });
  }

  function resetView() {
    setSelected(null);
    mapRef.current?.flyTo({
      center: [PERU_VIEW.longitude, PERU_VIEW.latitude],
      zoom: PERU_VIEW.zoom,
      duration: 900,
    });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f8fa] text-[#1f2937]">
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[58px] shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#fef2f2] text-[#dc2626]">
              <MapIcon size={18} />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-[16px] font-bold text-[#1f2937]">
                Mapa nacional de proyectos
              </h1>
              <p className="truncate text-[10px] text-[#6b7280]">
                Dirección de Disponibilidad de Predios · Cobertura nacional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-[#fecaca] bg-[#fef2f2] px-2.5 py-1 text-[10px] font-semibold text-[#b91c1c] sm:inline-flex">
              {projects.length} proyectos georreferenciados
            </span>
            <Link
              to="/proyectos"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#e5e7eb] bg-white px-3 text-[11px] font-medium text-[#374151] hover:border-[#fecaca] hover:bg-[#fef2f2] hover:text-[#b91c1c]"
            >
              <ExternalLink size={13} /> Vista de proyectos
            </Link>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {listOpen && (
            <aside className="flex w-[340px] shrink-0 flex-col border-r border-[#e5e7eb] bg-white">
              <div className="border-b border-[#e5e7eb] p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-[13px] font-semibold text-[#1f2937]">
                      Listado de proyectos
                    </h2>
                    <p className="text-[10px] text-[#6b7280]">
                      {filteredProjects.length} de {projects.length} visibles
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setListOpen(false)}
                    className="flex size-7 items-center justify-center rounded border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f9fafb]"
                    aria-label="Ocultar listado de proyectos"
                    title="Ocultar listado"
                  >
                    <PanelLeftClose size={14} />
                  </button>
                </div>

                <label className="relative block">
                  <Search
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar proyecto, región o grupo..."
                    className="h-8 w-full rounded-md border border-[#d1d5db] bg-white pl-8 pr-8 text-[11px] outline-none focus:border-[#dc2626]"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151]"
                      aria-label="Limpiar búsqueda"
                    >
                      <X size={13} />
                    </button>
                  )}
                </label>

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="mt-2 h-8 w-full rounded-md border border-[#d1d5db] bg-white px-2 text-[11px] outline-none focus:border-[#dc2626]"
                >
                  <option value="TODOS">Todos los tipos de infraestructura</option>
                  {infrastructureTypes.map((type) => (
                    <option key={type} value={type}>
                      {getInfrastructureSpec(type).label} (
                      {projects.filter((project) => project.TIPO_INFRA === type).length})
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {loading && (
                  <div className="flex items-center justify-center gap-2 px-4 py-8 text-[11px] text-[#6b7280]">
                    <LoaderCircle size={15} className="animate-spin text-[#dc2626]" /> Cargando
                    proyectos...
                  </div>
                )}

                {error && (
                  <div className="m-3 flex items-start gap-2 rounded border border-red-200 bg-red-50 p-3 text-[11px] text-red-800">
                    <CircleAlert size={15} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {!loading && !error && filteredProjects.length === 0 && (
                  <div className="px-5 py-10 text-center text-[11px] text-[#6b7280]">
                    No se encontraron proyectos con los filtros seleccionados.
                  </div>
                )}

                {filteredProjects.map((project) => (
                  <ProjectListItem
                    key={project.id}
                    project={project}
                    active={selected?.id === project.id}
                    onSelect={() => selectProject(project)}
                  />
                ))}
              </div>
            </aside>
          )}

          <section className="relative min-w-0 flex-1 bg-[#dbeafe]">
            <Map
              ref={mapRef}
              initialViewState={PERU_VIEW}
              mapStyle={mapStyle}
              style={{ width: "100%", height: "100%" }}
              attributionControl={{ compact: true }}
              dragPan
              scrollZoom
              doubleClickZoom
              touchZoomRotate
              keyboard
              minZoom={2.5}
              onClick={() => setSelected(null)}
            >
              <NavigationControl position="bottom-right" showCompass={false} />
              <ScaleControl position="bottom-left" unit="metric" />

              {filteredProjects.map((project) => {
                const spec = getInfrastructureSpec(project.TIPO_INFRA);
                const Icon = spec.icon;
                const isSelected = selected?.id === project.id;
                return (
                  <Marker
                    key={project.id}
                    longitude={project.longitude}
                    latitude={project.latitude}
                    anchor="bottom"
                  >
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        selectProject(project);
                      }}
                      className={`group relative flex size-8 items-center justify-center rounded-full border-2 border-white text-white shadow-lg transition hover:z-10 hover:scale-110 ${isSelected ? "z-10 ring-4 ring-white/80" : ""}`}
                      style={{ backgroundColor: spec.color }}
                      aria-label={`Ver ${project.PROYECTO}`}
                      title={project.PROYECTO}
                    >
                      <Icon size={15} strokeWidth={2.3} />
                      <span className="absolute bottom-9 left-1/2 hidden w-max max-w-60 -translate-x-1/2 rounded bg-[#111827] px-2 py-1 text-[9px] font-medium text-white shadow-xl group-hover:block">
                        {project.PROYECTO}
                      </span>
                    </button>
                  </Marker>
                );
              })}

              {selected && (
                <Popup
                  longitude={selected.longitude}
                  latitude={selected.latitude}
                  offset={36}
                  closeButton={false}
                  closeOnClick={false}
                  maxWidth="360px"
                  onClose={() => setSelected(null)}
                >
                  <ProjectPopup project={selected} onClose={() => setSelected(null)} />
                </Popup>
              )}
            </Map>

            {!listOpen && (
              <button
                type="button"
                onClick={() => setListOpen(true)}
                className="absolute left-3 top-3 z-10 inline-flex h-8 items-center gap-1.5 rounded-md border border-[#e5e7eb] bg-white/95 px-3 text-[10px] font-semibold text-[#374151] shadow-lg backdrop-blur hover:bg-white"
              >
                <PanelLeftOpen size={14} /> Mostrar proyectos
              </button>
            )}

            <div className="absolute right-3 top-3 z-10 w-52 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white/95 shadow-lg backdrop-blur">
              <div className="flex items-center gap-2 border-b border-[#e5e7eb] px-3 py-2 text-[10px] font-semibold text-[#374151]">
                <Layers3 size={13} className="text-[#dc2626]" /> Capas del mapa
              </div>
              <div className="space-y-1 p-2 text-[10px]">
                <MapOption
                  checked={baseMap === "calles"}
                  label="Mapa de calles"
                  icon={MapIcon}
                  onChange={() => setBaseMap("calles")}
                />
                <MapOption
                  checked={baseMap === "satelital"}
                  label="Mapa satelital"
                  icon={Satellite}
                  onChange={() => setBaseMap("satelital")}
                />
                <MapOption
                  checked={baseMap === "claro"}
                  label="Mapa claro"
                  icon={MapIcon}
                  onChange={() => setBaseMap("claro")}
                />
                <div className="my-1.5 border-t border-[#e5e7eb]" />
                <label className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 hover:bg-[#f9fafb]">
                  <input
                    type="checkbox"
                    checked={showDdpLayer}
                    onChange={(event) => setShowDdpLayer(event.target.checked)}
                    className="size-3.5 accent-[#dc2626]"
                  />
                  <span className="flex-1">Áreas de proyecto DDP</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 hover:bg-[#f9fafb]">
                  <input
                    type="checkbox"
                    checked={showDepartmentLimits}
                    onChange={(event) => setShowDepartmentLimits(event.target.checked)}
                    className="size-3.5 accent-[#dc2626]"
                  />
                  <span className="flex-1">Límites departamentales</span>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={resetView}
              className="absolute bottom-24 right-3 z-10 flex size-8 items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-[#374151] shadow-lg hover:bg-[#f9fafb]"
              aria-label="Volver a la vista nacional"
              title="Vista nacional"
            >
              <RotateCcw size={14} />
            </button>

            <div className="absolute bottom-3 left-3 z-10 max-w-[calc(100%-120px)] rounded-lg border border-[#e5e7eb] bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
              <div className="mb-1.5 text-[9px] font-semibold text-[#374151]">
                Tipo de infraestructura
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {Object.entries(infrastructureSpecs).map(([type, spec]) => {
                  const Icon = spec.icon;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTypeFilter(typeFilter === type ? "TODOS" : type)}
                      className={`flex items-center gap-1 text-[9px] ${typeFilter === type ? "font-semibold text-[#111827]" : "text-[#6b7280]"}`}
                    >
                      <span
                        className="flex size-4 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: spec.color }}
                      >
                        <Icon size={9} />
                      </span>
                      {spec.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function ProjectListItem({
  project,
  active,
  onSelect,
}: {
  project: MapProject;
  active: boolean;
  onSelect: () => void;
}) {
  const spec = getInfrastructureSpec(project.TIPO_INFRA);
  const Icon = spec.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-2.5 border-b border-[#f0f1f3] px-3 py-2.5 text-left transition ${active ? "border-l-2 border-l-[#dc2626] bg-[#fef2f2]" : "border-l-2 border-l-transparent hover:bg-[#f9fafb]"}`}
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: spec.softColor, color: spec.color }}
      >
        <Icon size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[10.5px] font-semibold text-[#1f2937]">
          {project.PROYECTO}
        </span>
        <span className="mt-0.5 block truncate text-[9px] text-[#6b7280]">
          {project.DEPARTAMEN || "Sin departamento"} · {project.GRUPO || "Sin grupo"}
        </span>
      </span>
      {active ? (
        <ChevronLeft size={13} className="shrink-0 text-[#dc2626]" />
      ) : (
        <ChevronRight size={13} className="shrink-0 text-[#9ca3af]" />
      )}
    </button>
  );
}

function ProjectPopup({ project, onClose }: { project: MapProject; onClose: () => void }) {
  const spec = getInfrastructureSpec(project.TIPO_INFRA);
  const Icon = spec.icon;
  const imageUrl = getProjectImageUrl(project);

  return (
    <div className="w-[310px] max-w-full text-[#1f2937]">
      <div
        className="relative mb-2 h-24 overflow-hidden rounded-md"
        style={{ backgroundColor: spec.softColor }}
      >
        <span
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: spec.color }}
        >
          <Icon size={32} strokeWidth={1.5} />
        </span>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={`Vista referencial de ${project.PROYECTO}`}
            className="relative size-full object-cover"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-[#374151] shadow-sm backdrop-blur">
          Imagen referencial
        </span>
      </div>

      <div className="flex items-start gap-2.5 border-b border-[#e5e7eb] pb-2">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: spec.softColor, color: spec.color }}
        >
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <span
            className="text-[9px] font-semibold uppercase tracking-wide"
            style={{ color: spec.color }}
          >
            {spec.label} · Ítem {project.ITEM}
          </span>
          <h3 className="mt-0.5 text-[12px] font-bold leading-snug">{project.PROYECTO}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151]"
          aria-label="Cerrar detalle"
        >
          <X size={14} />
        </button>
      </div>

      <dl className="mt-2 grid grid-cols-[88px_1fr] gap-x-2 gap-y-1.5 text-[9.5px]">
        <dt className="font-medium text-[#6b7280]">Denominación</dt>
        <dd className="font-medium text-[#374151]">{project.DENOMINACI || "Sin información"}</dd>
        <dt className="font-medium text-[#6b7280]">Departamento</dt>
        <dd>{project.DEPARTAMEN || "Sin información"}</dd>
        <dt className="font-medium text-[#6b7280]">Ubicación</dt>
        <dd>{project.UBICACION || "Sin información"}</dd>
        <dt className="font-medium text-[#6b7280]">Grupo</dt>
        <dd>{project.GRUPO || "Sin información"}</dd>
        <dt className="font-medium text-[#6b7280]">Coordenadas</dt>
        <dd>
          {project.latitude.toFixed(5)}, {project.longitude.toFixed(5)}
        </dd>
      </dl>

      {project.projectId ? (
        <Link
          to="/proyectos/$projectId"
          params={{ projectId: project.projectId }}
          className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-[#dc2626] px-3 text-[10px] font-semibold text-white hover:bg-[#b91c1c]"
        >
          <MapPin size={12} /> Abrir gestión del proyecto
        </Link>
      ) : (
        <div className="mt-3 rounded border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-2 text-[9px] text-[#6b7280]">
          Proyecto disponible en el visor geográfico.
        </div>
      )}
    </div>
  );
}

function MapOption({
  checked,
  label,
  icon: Icon,
  onChange,
}: {
  checked: boolean;
  label: string;
  icon: LucideIcon;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 hover:bg-[#f9fafb]">
      <input
        type="radio"
        name="base-map"
        checked={checked}
        onChange={onChange}
        className="size-3.5 accent-[#dc2626]"
      />
      <Icon size={12} className="text-[#6b7280]" />
      <span>{label}</span>
    </label>
  );
}

function getInfrastructureSpec(type: string): InfrastructureSpec {
  return (
    infrastructureSpecs[type] ?? {
      label: type || "Otro",
      icon: MapPin,
      color: "#475569",
      softColor: "#f1f5f9",
    }
  );
}

function getProjectImageUrl(project: MapProject) {
  const matchingProject = project.projectId
    ? proyectos.find((item) => item.id === project.projectId)
    : undefined;
  if (matchingProject?.img) return matchingProject.img;

  const fallbackProjectId =
    project.TIPO_INFRA === "AEROPORTUARIO"
      ? "iquitos"
      : project.TIPO_INFRA === "FERROVIARIO"
        ? "fhh"
        : "autopista-del-sol";
  return proyectos.find((item) => item.id === fallbackProjectId)?.img;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getComparableProjectName(value: string) {
  return normalizeText(value)
    .replace(/^(aeropuerto|aerodromo)\s+(de\s+)?/, "")
    .replace(/^pvc\s+/, "")
    .trim();
}

function resolveProjectId(projectName: string) {
  const comparableName = getComparableProjectName(projectName);
  const aliasedId = projectRouteAliases[comparableName];
  if (aliasedId) return aliasedId;

  const matchingProject = proyectos.find((project) => {
    const candidate = getComparableProjectName(project.nombre);
    return (
      candidate === comparableName ||
      candidate.includes(comparableName) ||
      comparableName.includes(candidate)
    );
  });
  return matchingProject?.id;
}
