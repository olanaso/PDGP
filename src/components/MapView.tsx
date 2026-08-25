import {
  Map,
  NavigationControl,
  Popup,
  type MapLayerMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Archive,
  Banknote,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Eye,
  FileCode,
  FileText,
  Filter,
  Folder,
  GripHorizontal,
  Hash,
  Images,
  Landmark,
  Link as LinkIcon,
  MapPin,
  Maximize2,
  Ruler,
  Settings2,
  ShieldCheck,
  Users,
  X,
  ChevronDown,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";

import concesionData from "@/data/concesion.geojson?url";
import pmdData from "@/data/pmd.geojson?url";
import { PredioActions } from "@/components/PredioActions";
import {
  getPredioByCodigo,
  getPredioCenter,
  predioRows,
  prediosGeojson,
  type PredioRow,
} from "@/lib/prediosData";

const center: [number, number] = [-75.478, -11.782];
const JAUJA_BOUNDS: [[number, number], [number, number]] = [
  [-75.49035, -11.7964],
  [-75.45642, -11.76973],
];
const MODAL_MARGIN = 12;
const PUBLIC_BASE_URL = import.meta.env.BASE_URL;

type PredioDemoImage = {
  id: string;
  label: string;
  src: string;
  alt: string;
};

const PREDIO_DEMO_IMAGES: PredioDemoImage[] = [
  {
    id: "frente",
    label: "1. Frente",
    src: `${PUBLIC_BASE_URL}images/predios/predio-demo-frente.jpg`,
    alt: "Vista frontal demostrativa del predio rural en Jauja",
  },
  {
    id: "fondo",
    label: "2. Fondo",
    src: `${PUBLIC_BASE_URL}images/predios/predio-demo-fondo.jpg`,
    alt: "Vista posterior demostrativa del predio rural en Jauja",
  },
  {
    id: "lado-derecho",
    label: "3. Lado derecho",
    src: `${PUBLIC_BASE_URL}images/predios/predio-demo-lado-derecho.jpg`,
    alt: "Vista lateral derecha demostrativa del predio rural en Jauja",
  },
  {
    id: "lado-izquierdo",
    label: "4. Lado izquierdo",
    src: `${PUBLIC_BASE_URL}images/predios/predio-demo-lado-izquierdo.jpg`,
    alt: "Vista lateral izquierda demostrativa del predio rural en Jauja",
  },
  {
    id: "panoramica",
    label: "5. Panorámica",
    src: `${PUBLIC_BASE_URL}images/predios/predio-demo-panoramica.jpg`,
    alt: "Vista panorámica demostrativa del predio rural en Jauja",
  },
];

type SelectedPredio = {
  codigo: string;
  lng: number;
  lat: number;
};

type MapFilterKey =
  "codigo" | "tipo" | "cond" | "mod" | "pagado" | "inscrito" | "recepcionCampo" | "recepcionOpat";

type MapFilterDef = {
  key: MapFilterKey;
  label: string;
  group: string;
};

type MapFilterState = Partial<Record<MapFilterKey, string[]>>;
type MapFilterStateSetter = (
  value: MapFilterState | ((previous: MapFilterState) => MapFilterState),
) => void;

const ESTADOS = [
  { label: "En diagnóstico", color: "#f59e0b" },
  { label: "En tasación", color: "#0ea5e9" },
  { label: "Apto para pago", color: "#16a34a" },
  { label: "Pagado", color: "#059669" },
  { label: "Observado", color: "#dc2626" },
];

const TRATOS = [
  { label: "TRATO DIRECTO", color: "#3b82f6" },
  { label: "TRANSFERENCIA INTERESTATAL", color: "#7c3aed" },
  { label: "EXPROPIACIÓN", color: "#dc2626" },
];

const DEMO_PREDIO_STATES = [
  { label: "Identificado", color: "#6b7280" },
  { label: "Expediente en proceso", color: "#2563eb" },
  { label: "En tasación", color: "#eab308" },
  { label: "En negociación", color: "#f97316" },
  { label: "Conflicto / expropiación", color: "#dc2626" },
  { label: "Pagado", color: "#0ea5e9" },
  { label: "Liberado", color: "#16a34a" },
  { label: "Inscrito", color: "#7c3aed" },
] as const;

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function demoStateForCode(code: string) {
  return DEMO_PREDIO_STATES[hash(code) % DEMO_PREDIO_STATES.length] ?? DEMO_PREDIO_STATES[0];
}

function demoFinancialForCode(code: string) {
  const state = demoStateForCode(code);
  const seed = hash(code);
  const estimated = 160_000 + (seed % 840_000);
  const approved = Math.round(estimated * (0.94 + ((seed >>> 8) % 13) / 100));
  const paidRatio: Record<(typeof DEMO_PREDIO_STATES)[number]["label"], number> = {
    Identificado: 0,
    "Expediente en proceso": 0.08,
    "En tasación": 0.18,
    "En negociación": 0.35,
    "Conflicto / expropiación": 0.22,
    Pagado: 0.9,
    Liberado: 0.97,
    Inscrito: 1,
  };
  const paid = Math.round(approved * paidRatio[state.label]);
  return { estimated, approved, paid, balance: approved - paid };
}

function demoMoney(value: number) {
  return `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;
}

const demoPrediosData = {
  ...prediosGeojson,
  features: prediosGeojson.features.map((feature, index) => {
    const properties = feature.properties ?? {};
    const code = String(
      properties.codigopred ??
        properties.match_codigo_geojson ??
        properties["CODIGO DE PREDIO"] ??
        `SIN-CODIGO-${index + 1}`,
    );
    return {
      ...feature,
      properties: {
        ...properties,
        MONITOREO_ESTADO_DEMO: demoStateForCode(code).label,
      },
    };
  }),
};

const DEMO_STATE_COUNTS = Object.fromEntries(
  DEMO_PREDIO_STATES.map((state) => [
    state.label,
    predioRows.filter((row) => demoStateForCode(row.codigo).label === state.label).length,
  ]),
) as Record<(typeof DEMO_PREDIO_STATES)[number]["label"], number>;

function infoFor(codigo: string) {
  const h = hash(codigo);
  return {
    estado: ESTADOS[(h >>> 5) % ESTADOS.length] ?? ESTADOS[0],
    trato: TRATOS[(h >>> 7) % TRATOS.length] ?? TRATOS[0],
  };
}

const MAP_FILTERS: MapFilterDef[] = [
  { key: "codigo", label: "Cod. predio", group: "Datos de adquisicion" },
  { key: "tipo", label: "Tipo predio", group: "Datos de adquisicion" },
  { key: "cond", label: "Condicion SP", group: "Datos de adquisicion" },
  { key: "mod", label: "Modalidad", group: "Datos de adquisicion" },
  { key: "pagado", label: "Con resolución", group: "Datos de adquisición" },
  { key: "inscrito", label: "Inscrito", group: "Proceso de inscripcion" },
  { key: "recepcionCampo", label: "Recepcion campo", group: "OPAT" },
  { key: "recepcionOpat", label: "Recepcion OPAT", group: "OPAT" },
];

function emptyLabel(value?: string) {
  const clean = value?.trim();
  return clean ? clean : "Sin informacion";
}

function yesNo(value?: string) {
  return value?.trim() ? "SI" : "NO";
}

function mapFilterValue(row: PredioRow, key: MapFilterKey) {
  if (key === "codigo") return emptyLabel(row.cod || row.codigo);
  if (key === "tipo") return emptyLabel(row.tipo || row.tp);
  if (key === "cond") return emptyLabel(row.cond);
  if (key === "mod") return emptyLabel(row.mod);
  if (key === "pagado") return yesNo(row.res || row.nres);
  if (key === "inscrito") return emptyLabel(row.estado);
  if (key === "recepcionCampo") return emptyLabel(row.fr);
  return emptyLabel(row.acta || row.edd);
}

function escapeExcelCell(value?: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function exportPrediosExcel(rows: PredioRow[]) {
  const columns: Array<[label: string, key: keyof PredioRow | string]> = [
    ["Codigo de predio", "cod"],
    ["CONDICION_PREDIO", "condicionPredio"],
    ["Nro. expediente", "exp"],
    ["Ciudad", "ciudad"],
    ["Proyecto", "proyecto"],
    ["E.T.", "et"],
    ["Tipo de predio", "tipo"],
    ["Sujeto pasivo", "suj"],
    ["Condicion SP", "cond"],
    ["Modalidad", "mod"],
    ["Area afectada m2", "area"],
    ["Nro. resolucion", "res"],
    ["Fecha", "fres"],
    ["Mes resolucion", "mesres"],
    ["Anio adquisicion", "per"],
    ["Monto", "valor"],
    ["H.R. resolucion", "hrres"],
    ["STD devengado", "pago"],
    ["Inscrito", "estado"],
    ["Acto registral", "acto"],
    ["Oficina registral", "ofi"],
    ["Titulo SUNARP", "titulo"],
    ["Estado titulo", "etit"],
    ["Partida inscrita", "pind"],
    ["Recepcion campo", "fr"],
    ["Recepcion OPAT", "acta"],
    ["Estado predio", "afec"],
  ];
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${columns.map(([, key]) => `<td>${escapeExcelCell(row[key])}</td>`).join("")}</tr>`,
    )
    .join("");
  const html = `
    <html>
      <head><meta charset="UTF-8" /></head>
      <body>
        <table border="1">
          <thead><tr>${columns.map(([label]) => `<th>${escapeExcelCell(label)}</th>`).join("")}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `;
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `predios_filtrados_${stamp}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function MapView({
  selectedCodigo,
  onSelectCodigo,
  layerVisibility = {},
}: {
  selectedCodigo?: string | null;
  onSelectCodigo?: (codigo: string | null) => void;
  layerVisibility?: Record<string, boolean>;
}) {
  const params = useParams({ strict: false }) as { projectId?: string };
  const projectId = params.projectId ?? "default";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [hover, setHover] = useState<SelectedPredio | null>(null);
  const [selected, setSelected] = useState<SelectedPredio | null>(null);
  const [showModal, setShowModal] = useState(true);
  const [modalMinimized, setModalMinimized] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("imagenes");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [openMapFilter, setOpenMapFilter] = useState<MapFilterKey | null>(null);
  const [mapFilters, setMapFilters] = useState<MapFilterState>({});
  const [modalPos, setModalPos] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const selectedFilterCodigo = selected?.codigo ?? "";
  const prediosVisible = layerVisibility.predios !== false;
  const activeMapFilterCount = Object.keys(mapFilters).length;

  const mapFilterOptions = useMemo(() => {
    return Object.fromEntries(
      MAP_FILTERS.map((filter) => [
        filter.key,
        Array.from(new Set(predioRows.map((row) => mapFilterValue(row, filter.key)))).sort((a, b) =>
          a.localeCompare(b),
        ),
      ]),
    ) as Record<MapFilterKey, string[]>;
  }, []);

  const filteredPredioCodes = useMemo(() => {
    return predioRows
      .filter((row) =>
        MAP_FILTERS.every((filter) => {
          const selectedValues = mapFilters[filter.key];
          if (!selectedValues) return true;
          return selectedValues.includes(mapFilterValue(row, filter.key));
        }),
      )
      .map((row) => row.codigo);
  }, [mapFilters]);
  const filteredPredioRows = useMemo(() => {
    const codes = new Set(filteredPredioCodes);
    return predioRows.filter((row) => codes.has(row.codigo));
  }, [filteredPredioCodes]);

  const hasMapFilters = activeMapFilterCount > 0;

  const mapStyle = useMemo(
    () => ({
      version: 8 as const,
      sources: {
        openstreetmap: {
          type: "raster" as const,
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors",
        },
        "esri-satellite": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Tiles (c) Esri",
        },
        predios: { type: "geojson" as const, data: demoPrediosData },
        concesion: { type: "geojson" as const, data: concesionData },
        pmd: { type: "geojson" as const, data: pmdData },
      },
      layers: [
        {
          id: "map-background",
          type: "background" as const,
          paint: { "background-color": "#dbeafe" },
        },
        { id: "openstreetmap", type: "raster" as const, source: "openstreetmap" },
        { id: "satellite", type: "raster" as const, source: "esri-satellite" },
        {
          id: "pmd-line",
          type: "line" as const,
          source: "pmd",
          paint: { "line-color": "#dc2626", "line-width": 5 },
        },
        {
          id: "concesion-line",
          type: "line" as const,
          source: "concesion",
          paint: { "line-color": "#ec4899", "line-width": 3 },
        },
        {
          id: "predios-fill",
          type: "fill" as const,
          source: "predios",
          paint: {
            "fill-color": [
              "match",
              ["get", "MONITOREO_ESTADO_DEMO"],
              "Identificado",
              "#6b7280",
              "Expediente en proceso",
              "#2563eb",
              "En tasación",
              "#eab308",
              "En negociación",
              "#f97316",
              "Conflicto / expropiación",
              "#dc2626",
              "Pagado",
              "#0ea5e9",
              "Liberado",
              "#16a34a",
              "Inscrito",
              "#7c3aed",
              "#6b7280",
            ],
            "fill-opacity": 0.42,
          },
        },
        {
          id: "predios-line",
          type: "line" as const,
          source: "predios",
          paint: { "line-color": "#0f172a", "line-width": 1.25 },
        },
        {
          id: "predios-selected-fill",
          type: "fill" as const,
          source: "predios",
          filter: ["==", ["get", "codigopred"], ""],
          paint: { "fill-color": "#facc15", "fill-opacity": 0.24 },
        },
        {
          id: "predios-selected-line",
          type: "line" as const,
          source: "predios",
          filter: ["==", ["get", "codigopred"], ""],
          paint: { "line-color": "#facc15", "line-width": 4 },
        },
        {
          id: "predios-label",
          type: "symbol" as const,
          source: "predios",
          layout: {
            "text-field": ["get", "codigopred"],
            "text-size": 7,
            "text-anchor": "center",
            "text-justify": "center",
          },
          paint: {
            "text-color": "#000000",
            "text-halo-color": "#ffffff",
            "text-halo-width": 4,
            "text-halo-blur": 0.5,
          },
        },
      ],
    }),
    [],
  );

  const clampModalPosition = useCallback((x: number, y: number) => {
    const container = containerRef.current;
    const modal = modalRef.current;
    const containerWidth = container?.clientWidth ?? window.innerWidth;
    const containerHeight = container?.clientHeight ?? window.innerHeight;
    const modalWidth = modal?.offsetWidth ?? 520;
    const modalHeight = modal?.offsetHeight ?? 360;
    const maxX = Math.max(MODAL_MARGIN, containerWidth - modalWidth - MODAL_MARGIN);
    const maxY = Math.max(MODAL_MARGIN, containerHeight - modalHeight - MODAL_MARGIN);

    return {
      x: Math.min(Math.max(MODAL_MARGIN, x), maxX),
      y: Math.min(Math.max(MODAL_MARGIN, y), maxY),
    };
  }, []);

  const dockModalPosition = useCallback(() => {
    const container = containerRef.current;
    const modal = modalRef.current;
    const containerWidth = container?.clientWidth ?? window.innerWidth;
    const modalWidth = modal?.offsetWidth ?? 520;
    return clampModalPosition(containerWidth - modalWidth - 16, 76);
  }, [clampModalPosition]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !mapLoaded) return;

    const visibilityGroups: Record<string, string[]> = {
      base: ["openstreetmap", "satellite"],
      pmd: ["pmd-line"],
      concesion: ["concesion-line"],
      predios: [
        "predios-fill",
        "predios-line",
        "predios-selected-fill",
        "predios-selected-line",
        "predios-label",
      ],
    };

    Object.entries(visibilityGroups).forEach(([key, layerIds]) => {
      const visibility = layerVisibility[key] === false ? "none" : "visible";
      layerIds.forEach((layerId) => {
        if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "visibility", visibility);
      });
    });
  }, [layerVisibility, mapLoaded]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !mapLoaded) return;

    const visibleCodesFilter = [
      "in",
      ["get", "codigopred"],
      ["literal", filteredPredioCodes],
    ] as Parameters<typeof map.setFilter>[1];
    const baseFilter = hasMapFilters ? visibleCodesFilter : null;
    const selectedFilter = (
      selectedFilterCodigo
        ? hasMapFilters
          ? ["all", visibleCodesFilter, ["==", ["get", "codigopred"], selectedFilterCodigo]]
          : ["==", ["get", "codigopred"], selectedFilterCodigo]
        : ["==", ["get", "codigopred"], "__none__"]
    ) as Parameters<typeof map.setFilter>[1];
    ["predios-fill", "predios-line", "predios-label"].forEach((layerId) => {
      if (map.getLayer(layerId)) map.setFilter(layerId, baseFilter);
    });
    if (map.getLayer("predios-selected-fill"))
      map.setFilter("predios-selected-fill", selectedFilter);
    if (map.getLayer("predios-selected-line"))
      map.setFilter("predios-selected-line", selectedFilter);

    const colorExpression = [
      "case",
      ["==", ["get", "codigopred"], selectedFilterCodigo],
      "#facc15",
      "#ffffff",
    ] as Parameters<typeof map.setPaintProperty>[2];

    map.setPaintProperty("predios-line", "line-color", colorExpression);
    map.setPaintProperty("predios-line", "line-width", [
      "case",
      ["==", ["get", "codigopred"], selectedFilterCodigo],
      3,
      1.2,
    ]);
  }, [filteredPredioCodes, hasMapFilters, mapLoaded, selectedFilterCodigo]);

  useEffect(() => {
    if (!selectedCodigo) {
      setSelected(null);
      setSelectedImageIndex(null);
      setShowModal(false);
      return;
    }
    if (selected?.codigo === selectedCodigo) return;

    const nextCenter = getPredioCenter(selectedCodigo);
    if (!nextCenter) return;

    const map = mapRef.current?.getMap();
    if (map) map.flyTo({ center: nextCenter, zoom: Math.max(map.getZoom(), 16), duration: 500 });

    setSelected({ codigo: selectedCodigo, lng: nextCenter[0], lat: nextCenter[1] });
    setActiveDetailTab("imagenes");
    setSelectedImageIndex(null);
    setModalPos(dockModalPosition());
    setShowModal(true);
    setModalMinimized(false);
  }, [dockModalPosition, selected?.codigo, selectedCodigo]);

  useEffect(() => {
    if (!isDragging) return;

    function handlePointerMove(e: PointerEvent) {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const nextX = e.clientX - rect.left - dragOffsetRef.current.x;
      const nextY = e.clientY - rect.top - dragOffsetRef.current.y;
      setModalPos(clampModalPosition(nextX, nextY));
      e.preventDefault();
    }

    function handlePointerUp() {
      setIsDragging(false);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [clampModalPosition, isDragging]);

  function handleClick(e: MapLayerMouseEvent) {
    const f = e.features?.[0];
    if (!f) {
      setSelected(null);
      setSelectedImageIndex(null);
      setShowModal(false);
      onSelectCodigo?.(null);
      return;
    }

    const codigo = (f.properties as { codigopred?: string })?.codigopred ?? "SIN CODIGO";
    setSelected({ codigo, lng: e.lngLat.lng, lat: e.lngLat.lat });
    setActiveDetailTab("imagenes");
    setSelectedImageIndex(null);
    onSelectCodigo?.(codigo);
    setModalPos(dockModalPosition());
    setShowModal(true);
    setModalMinimized(false);
  }

  function handleMove(e: MapLayerMouseEvent) {
    const f = e.features?.[0];
    const map = mapRef.current?.getMap();
    if (map) map.getCanvas().style.cursor = f ? "pointer" : "";
    if (!f) return setHover(null);

    const codigo = (f.properties as { codigopred?: string })?.codigopred ?? "";
    setHover({ codigo, lng: e.lngLat.lng, lat: e.lngLat.lat });
  }

  const row = getPredioByCodigo(selected?.codigo);
  const baseInfo = selected ? infoFor(selected.codigo) : null;
  const estado = demoStateForCode(selected?.codigo ?? "Jauja");
  const demoFinancial = demoFinancialForCode(selected?.codigo ?? "Jauja");
  const modalityLabel = row?.mod || baseInfo?.trato.label || "Sin modalidad";
  const modalityColor = modalityLabel.toUpperCase().includes("TRANSFERENCIA")
    ? "#7c3aed"
    : modalityLabel.toUpperCase().includes("EXPROPI")
      ? "#dc2626"
      : "#2563eb";
  const trato = {
    label: modalityLabel,
    color: modalityColor,
  };
  const detailSections: Array<{
    id: string;
    short: string;
    icon: LucideIcon;
    title: string;
    items: Array<[label: string, value?: string, mono?: boolean]>;
  }> = [
    {
      id: "imagenes",
      short: "Imágenes",
      icon: Images,
      title: "Imágenes del predio",
      items: [],
    },
    {
      id: "identificacion",
      short: "Predio",
      icon: MapPin,
      title: "Identificacion del predio",
      items: [
        ["Codigo de predio", row?.cod || selected?.codigo, true],
        ["Nro. de expediente", row?.exp, true],
        ["Ciudad", row?.ciudad],
        ["Proyecto", row?.proyecto],
        ["E.T.", row?.et],
        ["Tipo de predio", row?.tipo || row?.tp],
      ],
    },
    {
      id: "responsables",
      short: "Resp.",
      icon: Users,
      title: "Responsables",
      items: [
        ["Especialista legal", row?.rlegal],
        ["Especialista tecnico", row?.rtec],
      ],
    },
    {
      id: "sujeto",
      short: "Sujeto",
      icon: ShieldCheck,
      title: "Sujeto pasivo",
      items: [
        ["Sujeto pasivo", row?.suj],
        ["Condicion del SP", row?.cond],
      ],
    },
    {
      id: "area",
      short: "Area",
      icon: Ruler,
      title: "Area afectada",
      items: [
        ["Cantidad", row?.cantidad],
        ["Area afectada (m2)", row?.area, true],
      ],
    },
    {
      id: "adquisicion",
      short: "Adq.",
      icon: ClipboardCheck,
      title: "Adquisicion",
      items: [
        ["Modalidad de adquisicion", trato.label],
        ["Nro. de resolucion", row?.res || row?.nres, true],
        ["Fecha", row?.fres],
        ["Mes resolucion", row?.mesres],
        ["Anio de adquisicion", row?.per],
      ],
    },
    {
      id: "economica",
      short: "Monto",
      icon: Banknote,
      title: "Informacion economica",
      items: [
        ["Costo estimado (simulado)", demoMoney(demoFinancial.estimated), true],
        ["Monto aprobado (simulado)", demoMoney(demoFinancial.approved), true],
        ["Monto pagado (simulado)", demoMoney(demoFinancial.paid), true],
        ["Saldo (simulado)", demoMoney(demoFinancial.balance), true],
      ],
    },
    {
      id: "documental",
      short: "Doc.",
      icon: LinkIcon,
      title: "Sustento documental",
      items: [["Drive / expediente digital", row?.drive, true]],
    },
    {
      id: "registral",
      short: "Reg.",
      icon: Landmark,
      title: "Inscripcion registral",
      items: [
        ["Estado inscripcion Si/No", row?.estado],
        ["Acto registral", row?.acto],
        ["Oficina registral", row?.ofi],
        ["Nro. titulo SUNARP", row?.titulo, true],
        ["Fecha presentacion", row?.ftit],
        ["Estado del titulo", row?.etit],
        ["Fecha de inscripcion", row?.finsc],
        ["Nro. partida inscrita", row?.pind || row?.part, true],
      ],
    },
    {
      id: "cierre",
      short: "Cierre",
      icon: Archive,
      title: "Recepcion y cierre",
      items: [
        ["Recepcion en campo", row?.fr],
        ["Fecha recepcion y entrega", row?.acta],
        ["Recepcion exp. fisico", row?.edd],
        ["Fecha de entrega", row?.trans],
        ["Estado del predio", row?.afec || row?.com],
      ],
    },
  ];
  const activeSection =
    detailSections.find((section) => section.id === activeDetailTab) ?? detailSections[0];

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: center[0], latitude: center[1], zoom: 13.8 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle as never}
        attributionControl={false}
        interactiveLayerIds={prediosVisible ? ["predios-fill"] : []}
        onClick={handleClick}
        onMouseMove={handleMove}
        onLoad={() => {
          setMapLoaded(true);
          mapRef.current?.fitBounds(JAUJA_BOUNDS, { padding: 42, duration: 0 });
        }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        {hover && !selected && (
          <Popup
            longitude={hover.lng}
            latitude={hover.lat}
            anchor="bottom"
            closeButton={false}
            className="text-[11px]"
          >
            {hover.codigo}
          </Popup>
        )}
      </Map>

      {!mapLoaded && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-slate-100/90 text-sm font-medium text-slate-600">
          Cargando mapa predial de Jauja…
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-30 max-w-[360px] rounded-lg border border-amber-200 bg-white/95 p-3 text-[10px] shadow-lg backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="font-semibold text-slate-800">Estado demostrativo de los predios</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
            Datos simulados
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {DEMO_PREDIO_STATES.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-slate-600">
              <span className="size-2.5 shrink-0 rounded-sm" style={{ background: item.color }} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <b className="text-slate-800">{DEMO_STATE_COUNTS[item.label]}</b>
            </div>
          ))}
        </div>
      </div>

      <MapFilterBar
        filters={MAP_FILTERS}
        options={mapFilterOptions}
        values={mapFilters}
        openFilter={openMapFilter}
        onOpenFilter={setOpenMapFilter}
        onValuesChange={setMapFilters}
        rows={filteredPredioRows}
        resultCount={filteredPredioCodes.length}
        activeCount={activeMapFilterCount}
      />

      {selected && showModal && (
        <div
          ref={modalRef}
          className={`absolute z-[600] w-[520px] max-w-[calc(100%-24px)] overflow-hidden rounded-md border border-[#e5e7eb] bg-white shadow-xl ${isDragging ? "ring-2 ring-[#facc15]/70 shadow-2xl" : ""}`}
          style={{ left: `${modalPos.x}px`, top: `${modalPos.y}px` }}
        >
          <div
            className="flex select-none items-center justify-between gap-3 bg-[#b91c1c] px-3 py-2.5 text-white cursor-grab active:cursor-grabbing"
            style={{ touchAction: "none" }}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              const rect = modalRef.current?.getBoundingClientRect();
              if (!rect) return;
              dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
              setIsDragging(true);
              e.preventDefault();
            }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <GripHorizontal size={15} className="shrink-0 text-white/80" />
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-normal text-white/75">
                  Predio seleccionado
                </div>
                <div
                  className="truncate text-[12px] font-semibold"
                  title={row?.cod || selected.codigo}
                >
                  {row?.cod || selected.codigo}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setModalMinimized(!modalMinimized)}
                className="flex size-7 items-center justify-center rounded hover:bg-white/20"
                aria-label={modalMinimized ? "Expandir" : "Minimizar"}
                title={modalMinimized ? "Expandir" : "Minimizar"}
              >
                {modalMinimized ? "▲" : "▼"}
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => {
                  setSelected(null);
                  setSelectedImageIndex(null);
                  setShowModal(false);
                  onSelectCodigo?.(null);
                }}
                className="flex size-7 items-center justify-center rounded hover:bg-white/20"
                aria-label="Cerrar"
                title="Cerrar"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!modalMinimized && (
            <>
              <div className="border-b border-[#e5e7eb] bg-white px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] font-semibold uppercase text-[#dc2626]">Acciones</div>
                  <PredioActions
                    codigoPredio={selected.codigo}
                    condicionPredio={row?.condicionPredio}
                    mode="toolbar"
                  />
                </div>
              </div>

              <div
                className="overflow-auto p-3 text-[12px]"
                style={{ maxHeight: "min(510px, calc(100vh - 205px))" }}
              >
                <div className="mb-3 flex items-center justify-between gap-2 border-b border-[#e5e7eb] pb-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                    style={{ background: estado.color }}
                  >
                    {estado.label}
                  </span>
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-semibold text-white"
                    style={{ background: trato.color }}
                  >
                    {trato.label}
                  </span>
                </div>

                <div className="mb-3 flex gap-1 overflow-x-auto border-b border-[#e5e7eb] pb-2">
                  {detailSections.map((section) => {
                    const Icon = section.icon;
                    const active = section.id === activeSection.id;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        title={section.title}
                        aria-label={section.title}
                        onClick={() => setActiveDetailTab(section.id)}
                        className={`flex shrink-0 items-center gap-1.5 rounded px-2 py-1.5 text-[11px] font-medium ${
                          active
                            ? "bg-[#dc2626] text-white"
                            : "border border-[#e5e7eb] bg-white text-[#374151] hover:bg-[#fef2f2] hover:text-[#dc2626]"
                        }`}
                      >
                        <Icon size={13} />
                        <span>{section.short}</span>
                      </button>
                    );
                  })}
                </div>

                {activeSection.id === "imagenes" ? (
                  <PredioImageGallery
                    images={PREDIO_DEMO_IMAGES}
                    onSelect={setSelectedImageIndex}
                  />
                ) : (
                  <DetailSection
                    icon={activeSection.icon}
                    title={activeSection.title}
                    items={activeSection.items}
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}

      <PredioImageViewer
        images={PREDIO_DEMO_IMAGES}
        selectedIndex={selectedImageIndex}
        codigoPredio={row?.cod || selected?.codigo || ""}
        onSelectedIndexChange={setSelectedImageIndex}
      />
    </div>
  );
}

function MapFilterBar({
  filters,
  options,
  values,
  openFilter,
  onOpenFilter,
  onValuesChange,
  rows,
  resultCount,
  activeCount,
}: {
  filters: MapFilterDef[];
  options: Record<MapFilterKey, string[]>;
  values: MapFilterState;
  openFilter: MapFilterKey | null;
  onOpenFilter: (key: MapFilterKey | null) => void;
  onValuesChange: MapFilterStateSetter;
  rows: PredioRow[];
  resultCount: number;
  activeCount: number;
}) {
  return (
    <>
      {openFilter && (
        <button
          className="fixed inset-0 z-[519] cursor-default"
          onClick={() => onOpenFilter(null)}
          aria-label="Cerrar filtro"
        />
      )}
      <div className="absolute left-1/2 top-3 z-[520] w-[min(calc(100%-96px),1120px)] -translate-x-1/2 overflow-visible">
        <div className="flex max-w-full flex-nowrap items-center justify-center gap-1.5 overflow-visible">
          <div
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-2.5 text-[11px] font-semibold text-[#374151] shadow-md"
            title="Filtros"
          >
            <Filter size={14} className={activeCount ? "text-[#111827]" : "text-[#6b7280]"} />
            <span>{resultCount}</span>
          </div>

          {filters.map((filter) => (
            <MapFilterButton
              key={filter.key}
              filter={filter}
              options={options[filter.key] ?? []}
              selected={values[filter.key]}
              open={openFilter === filter.key}
              onOpen={() => onOpenFilter(openFilter === filter.key ? null : filter.key)}
              onClose={() => onOpenFilter(null)}
              onValuesChange={onValuesChange}
            />
          ))}

          <div className="mx-1 h-7 w-px shrink-0 bg-white/80 shadow" />
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onValuesChange({});
                onOpenFilter(null);
              }}
              className="flex size-8 items-center justify-center rounded-full border border-[#fed7aa] bg-white text-[#ea580c] shadow-md hover:bg-[#fff7ed]"
              title="Reiniciar filtros"
              aria-label="Reiniciar filtros"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={() => exportPrediosExcel(rows)}
              className="flex size-8 items-center justify-center rounded-full border border-[#bbf7d0] bg-white text-[#16a34a] shadow-md hover:bg-[#f0fdf4]"
              title="Exportar predios filtrados a Excel"
              aria-label="Exportar predios filtrados a Excel"
            >
              <Download size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function MapFilterButton({
  filter,
  options,
  selected,
  open,
  onOpen,
  onClose,
  onValuesChange,
}: {
  filter: MapFilterDef;
  options: string[];
  selected?: string[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onValuesChange: MapFilterStateSetter;
}) {
  const active = selected !== undefined;
  const checkedCount = selected?.length ?? options.length;
  const [search, setSearch] = useState("");
  const searchable = filter.key === "codigo";
  const visibleOptions = searchable
    ? options.filter((option) => option.toLowerCase().includes(search.trim().toLowerCase()))
    : options;

  function setAll() {
    onValuesChange((previous) => {
      const next = { ...previous };
      delete next[filter.key];
      return next;
    });
  }

  function setNone() {
    onValuesChange((previous) => ({ ...previous, [filter.key]: [] }));
  }

  function toggleValue(value: string) {
    onValuesChange((previous) => {
      const current = previous[filter.key] ?? options;
      const nextValues = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      const next = { ...previous };
      if (nextValues.length === options.length) delete next[filter.key];
      else next[filter.key] = nextValues;
      return next;
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpen}
        className={`flex h-8 max-w-[128px] shrink-0 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold shadow-sm ${
          active
            ? "border-[#4b5563] bg-[#4b5563] text-white"
            : "border-[#e5e7eb] bg-white text-[#4b5563] hover:bg-[#f9fafb]"
        }`}
        title={filter.label}
      >
        <span className="truncate">{filter.label}</span>
        <span className="flex shrink-0 items-center gap-1">
          {active && (
            <span className="rounded-full bg-white/20 px-1 text-[9px] text-white">
              {checkedCount}
            </span>
          )}
          <ChevronDown size={12} />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-[900] mt-1 w-[240px] rounded-md border border-[#d1d5db] bg-white shadow-xl">
          <div className="border-b border-[#e5e7eb] px-2 py-1.5">
            <div className="truncate text-[11px] font-semibold text-[#111827]">{filter.label}</div>
            <div className="text-[10px] text-[#6b7280]">
              {checkedCount} de {options.length} visibles
            </div>
          </div>
          {searchable && (
            <div className="border-b border-[#e5e7eb] p-1.5">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar"
                className="h-7 w-full rounded border border-[#d1d5db] px-2 text-[11px] outline-none focus:border-[#dc2626]"
                autoFocus
              />
            </div>
          )}
          <div className="flex gap-1 border-b border-[#e5e7eb] p-1.5">
            <button
              type="button"
              onClick={setAll}
              className="flex-1 rounded border border-[#e5e7eb] px-2 py-1 text-[11px] hover:bg-[#f9fafb]"
            >
              Todo
            </button>
            <button
              type="button"
              onClick={setNone}
              className="flex-1 rounded border border-[#e5e7eb] px-2 py-1 text-[11px] hover:bg-[#f9fafb]"
            >
              Ninguno
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-[#e5e7eb] px-2 py-1 text-[11px] hover:bg-[#f9fafb]"
              aria-label="Cerrar"
            >
              <X size={12} />
            </button>
          </div>
          <div className="max-h-[320px] overflow-auto p-1">
            {visibleOptions.map((option) => {
              const checked = selected === undefined ? true : selected.includes(option);
              return (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-[11px] hover:bg-[#f9fafb]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleValue(option)}
                    className="accent-[#374151]"
                  />
                  <span className="min-w-0 flex-1 truncate" title={option}>
                    {option}
                  </span>
                </label>
              );
            })}
            {visibleOptions.length === 0 && (
              <div className="px-2 py-3 text-center text-[11px] text-[#9ca3af]">
                Sin coincidencias
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PredioImageGallery({
  images,
  onSelect,
}: {
  images: PredioDemoImage[];
  onSelect: (index: number) => void;
}) {
  return (
    <section className="rounded border border-[#e5e7eb] bg-[#f9fafb] p-2">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[#dc2626]">
          <Images size={13} />
          <span>Imágenes del predio</span>
        </div>
        <span className="rounded-full bg-[#fef2f2] px-2 py-0.5 text-[9px] font-medium text-[#b91c1c]">
          Datos demostrativos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => onSelect(index)}
            className={`group min-w-0 overflow-hidden rounded border border-[#e5e7eb] bg-white text-left transition hover:border-[#dc2626] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] ${
              image.id === "panoramica" ? "col-span-2" : ""
            }`}
            aria-label={`Ampliar ${image.label.toLowerCase()}`}
          >
            <div
              className={`relative overflow-hidden ${image.id === "panoramica" ? "h-28" : "h-24"}`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="size-full object-cover transition duration-200 group-hover:scale-[1.03]"
              />
              <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/55 text-white opacity-90 shadow-sm">
                <Maximize2 size={12} />
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 px-2 py-1.5">
              <span className="truncate text-[10px] font-semibold text-[#374151]">
                {image.label}
              </span>
              <span className="text-[9px] text-[#9ca3af]">Ver</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function PredioImageViewer({
  images,
  selectedIndex,
  codigoPredio,
  onSelectedIndexChange,
}: {
  images: PredioDemoImage[];
  selectedIndex: number | null;
  codigoPredio: string;
  onSelectedIndexChange: (index: number | null) => void;
}) {
  const selectedImage = selectedIndex === null ? null : images[selectedIndex];

  function showPrevious() {
    if (selectedIndex === null) return;
    onSelectedIndexChange((selectedIndex - 1 + images.length) % images.length);
  }

  function showNext() {
    if (selectedIndex === null) return;
    onSelectedIndexChange((selectedIndex + 1) % images.length);
  }

  return (
    <DialogPrimitive.Root
      open={selectedImage !== null}
      onOpenChange={(open) => {
        if (!open) onSelectedIndexChange(null);
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[10001] w-[min(94vw,1100px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-white/15 bg-[#111827] shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
            <div className="min-w-0">
              <DialogPrimitive.Title className="truncate text-[14px] font-semibold">
                {selectedImage?.label || "Imagen del predio"}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-0.5 truncate text-[10px] text-white/60">
                Predio {codigoPredio} · Imagen demostrativa
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Cerrar visor de imagen"
            >
              <X size={17} />
            </DialogPrimitive.Close>
          </div>

          <div className="relative flex h-[min(70vh,720px)] items-center justify-center bg-black">
            {selectedImage && (
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="size-full object-contain"
              />
            )}

            <button
              type="button"
              onClick={showPrevious}
              className="absolute left-3 flex size-10 items-center justify-center rounded-full bg-black/55 text-white shadow-lg transition hover:bg-[#b91c1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Ver imagen anterior"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="absolute right-3 flex size-10 items-center justify-center rounded-full bg-black/55 text-white shadow-lg transition hover:bg-[#b91c1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Ver imagen siguiente"
            >
              <ChevronRight size={22} />
            </button>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/60 px-3 py-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => onSelectedIndexChange(index)}
                  className={`size-2 rounded-full transition ${
                    index === selectedIndex
                      ? "bg-[#ef4444] ring-2 ring-white/80"
                      : "bg-white/55 hover:bg-white"
                  }`}
                  aria-label={`Ver ${image.label.toLowerCase()}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-[10px] text-white/65">
            <span>{selectedImage?.label}</span>
            <span>
              {selectedIndex === null ? 0 : selectedIndex + 1} de {images.length}
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function DetailSection({
  icon: Icon,
  title,
  items,
}: {
  icon: LucideIcon;
  title: string;
  items: Array<[label: string, value?: string, mono?: boolean]>;
}) {
  return (
    <section className="rounded border border-[#e5e7eb] bg-[#f9fafb] p-2">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[#dc2626]">
        <Icon size={13} />
        <span>{title}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        {items.map(([label, value, mono]) => (
          <DetailItem key={label} label={label} value={value} mono={mono} />
        ))}
      </div>
    </section>
  );
}

function DetailItem({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="min-w-0 rounded border border-[#e5e7eb] bg-white p-2">
      <div className="text-[10px] text-[#6b7280]">{label}</div>
      <div className={`break-words leading-snug ${mono ? "font-mono" : ""}`}>
        {value || "Sin informacion"}
      </div>
    </div>
  );
}
