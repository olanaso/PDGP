import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";

import { FullPrediosTable } from "../components/FullPrediosTable";
import { LayersPanel } from "@/components/LayersPanel";
import { MapLegend } from "@/components/MapLegend";
import { MapStatusBar } from "@/components/MapStatusBar";
import { getProyecto } from "@/lib/projectsData";
import { PredioActions } from "@/components/PredioActions";
import { ColumnFilter } from "@/components/ColumnFilter";
import { predioRows, type PredioRow } from "@/lib/prediosData";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type MapComponentProps = {
  selectedCodigo?: string | null;
  onSelectCodigo?: (codigo: string | null) => void;
  layerVisibility?: Record<string, boolean>;
};

function ClientMap ({
  selectedCodigo,
  onSelectCodigo,
  layerVisibility,
}: MapComponentProps) {
  const [Comp, setComp] = useState<ComponentType<MapComponentProps> | null>(null);
  useEffect(() => {
    import("../components/MapView").then((m) => setComp(() => m.default));
  }, []);
  if (!Comp) return <div className="h-full w-full bg-[#e5e7eb] animate-pulse" />;
  return <Comp selectedCodigo={selectedCodigo} onSelectCodigo={onSelectCodigo} layerVisibility={layerVisibility} />;
}
import {
  MapPin,
  ArrowLeft,
  Download,
  ChevronDown,
  Locate,
  Search,
  BarChart3,
  Filter,
  Map as MapIcon,
  Folder,
  ShieldCheck,
  FileText,
  Eye,
  MoreVertical,
  ChevronRight,
  Columns2,
  Rows2,
  Square,
  Table as TableIcon,
  Hash,
  FileCode,
  X,
  FileSpreadsheet,
  ClipboardList,
  ClipboardCheck,
  Check,
  Box,
} from "lucide-react";

const MODALIDAD_OPTS = [
  "EN PROCESO DE ADQUISICIÓN",
  "EN PROCESO DE ADQUISICIÓN - SIN CODIGO",
  "EXPROPIACIÓN",
  "PRIMERA INSCRIPCIÓN DE DOMINIO",
  "RECONOCIMIENTO DE MEJORAS",
  "TRANSFERENCIA INTERESTATAL",
  "TRATO DIRECTO",
];
const CONDICION_OPTS = ["OCUPANTE", "PENDIENTE", "POSESIONARIO + 10 AÑOS", "PROPIETARIO"];
const OPCION_BUSQUEDA = ["Cod. de predio", "Nombres Apellidos", "DNI o RUC"];

function MultiSelectChip ({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const allChecked = selected.length === options.length;
  function toggle (opt: string) {
    onChange(selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt]);
  }
  function toggleAll () {
    onChange(allChecked ? [] : options);
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex shrink-0 items-center gap-1 rounded border border-[#e5e7eb] bg-white px-2 py-1 text-[12px] whitespace-nowrap hover:bg-[#f9fafb]"
        >
          {label}
          <ChevronDown size={12} className="opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="z-[9999] w-[270px] p-1 text-[12px]">
        <label className="flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 hover:bg-[#f9fafb]">
          <input type="checkbox" checked={allChecked} onChange={toggleAll} className="accent-[#dc2626]" />
          <span className="font-medium">(Seleccionar todo)</span>
        </label>
        <div className="my-1 border-t border-[#e5e7eb]" />
        <div className="max-h-[240px] overflow-y-auto">
          {options.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 hover:bg-[#f9fafb]">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="accent-[#dc2626]"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

type PredioCodeOption = {
  value: string;
  label: string;
  subject: string;
};

function PredioCodeCombobox ({
  value,
  onChange,
  options,
  onSelectCodigo,
}: {
  value: string;
  onChange: (value: string) => void;
  options: PredioCodeOption[];
  onSelectCodigo?: (codigo: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.label === value || option.value === value);

  function selectOption (option: PredioCodeOption) {
    onChange(option.label);
    onSelectCodigo?.(option.value);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-[30px] w-[300px] shrink-0 items-center justify-between gap-2 rounded border border-[#e5e7eb] bg-white px-2 text-left text-[12px] hover:bg-[#f9fafb] focus:outline-none focus:border-[#dc2626]"
          title="Buscar código de predio"
        >
          <span className={`min-w-0 truncate ${selected || value ? "font-mono text-[#1f2937]" : "text-[#9ca3af]"}`}>
            {value || "Buscar código de predio"}
          </span>
          <ChevronDown size={12} className="shrink-0 text-[#9ca3af]" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="z-[9999] w-[360px] p-0">
        <Command shouldFilter>
          <CommandInput
            value={value}
            onValueChange={onChange}
            placeholder="Escribe o selecciona un código"
            className="h-9 text-[12px]"
          />
          <CommandList className="max-h-[260px]">
            <CommandEmpty>Sin coincidencias</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value} ${option.subject}`}
                  onSelect={() => selectOption(option)}
                  className="items-start gap-2 text-[12px]"
                >
                  <Check
                    size={13}
                    className={`mt-0.5 shrink-0 text-[#dc2626] ${selected?.value === option.value ? "opacity-100" : "opacity-0"}`}
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-[#dc2626]">{option.label}</span>
                    <span className="block truncate text-[11px] text-[#6b7280]">{option.subject}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function PrediosFilterBar ({
  opcion,
  setOpcion,
  q,
  setQ,
  modalidadOptions,
  modalidadSelected,
  setModalidadSelected,
  condicionOptions,
  condicionSelected,
  setCondicionSelected,
  codigoOptions,
  onCodigoSelect,
}: {
  opcion: string;
  setOpcion: (value: string) => void;
  q: string;
  setQ: (value: string) => void;
  modalidadOptions: string[];
  modalidadSelected: string[];
  setModalidadSelected: (next: string[]) => void;
  condicionOptions: string[];
  condicionSelected: string[];
  setCondicionSelected: (next: string[]) => void;
  codigoOptions: PredioCodeOption[];
  onCodigoSelect?: (codigo: string) => void;
}) {
  const isCodigoSearch = opcion === OPCION_BUSQUEDA[0];

  return (
    <div className="overflow-x-auto px-6 pb-2">
      <div className="flex min-w-max items-center gap-2 whitespace-nowrap">
        <select
          value={opcion}
          onChange={(e) => setOpcion(e.target.value)}
          className="h-[30px] w-[150px] shrink-0 rounded border border-[#e5e7eb] bg-white px-2 text-[12px] focus:outline-none focus:border-[#dc2626]"
          title="Opción de búsqueda"
        >
          {OPCION_BUSQUEDA.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        {isCodigoSearch ? (
          <PredioCodeCombobox
            value={q}
            onChange={setQ}
            options={codigoOptions}
            onSelectCodigo={onCodigoSelect}
          />
        ) : (
          <div className="relative w-[300px] shrink-0">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Buscar por ${opcion.toLowerCase()}`}
              className="h-[30px] w-full rounded border border-[#e5e7eb] py-1 pr-7 pl-7 text-[12px] focus:outline-none focus:border-[#dc2626]"
            />
          </div>
        )}
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="flex size-[30px] shrink-0 items-center justify-center rounded border border-[#e5e7eb] bg-white text-[#9ca3af] hover:text-[#374151]"
            aria-label="Limpiar búsqueda"
            title="Limpiar búsqueda"
          >
            <X size={12} />
          </button>
        )}
        <MultiSelectChip
          label="Modalidad de adquisición"
          options={modalidadOptions}
          selected={modalidadSelected}
          onChange={setModalidadSelected}
        />
        <MultiSelectChip
          label="Condición del Sujeto Pasivo"
          options={condicionOptions}
          selected={condicionSelected}
          onChange={setCondicionSelected}
        />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/proyectos/$projectId/")({
  head: () => ({
    meta: [
      { title: "MTC Prototipos — Aeropuerto de Caballococha" },
      { name: "description", content: "Diagnóstico predial — gestión cartográfica y listado de predios." },
      { property: "og:title", content: "MTC Prototipos" },
      { property: "og:description", content: "Mapa de predios y gestión predial." },
    ],
  }),
  component: Index,
});

const layerGroups = [
  {
    name: "Base cartografica",
    items: [{ id: "base", name: "Mapa base" }],
  },
  {
    name: "Proyecto de infraestructura",
    items: [
      { id: "predios", name: "Capa de predios" },
      { id: "pmd", name: "Capa del proyecto (PMD)" },
      { id: "concesion", name: "Capa de la concesion" },
    ],
  },
];
const legendItems = [
  { color: "#ffffff", label: "Predios" },
  { color: "#ec4899", label: "Concesión" },
  { color: "#dc2626", label: "PMD" },
];

const actions = [
  { icon: ClipboardCheck, label: "Evaluación de información recibida", to: "evaluacion-informacion" as const },
  { icon: FileText, label: "Requerimiento de información", to: "requerimientos" as const },

  { icon: MapIcon, label: "Base gráfica", to: "base-grafica" as const },
  { icon: ShieldCheck, label: "Equipo de trabajo", to: "equipos" as const },
  { icon: BarChart3, label: "Presupuesto y metas" },

];

const predios = [
  { n: 10, cod: "PM1G-AERCAJAMARCA-PR-0100", mod: "TRATO DIRECTO", suj: "POLLON GAONA RAMOSROSA OLINDA VILLEGAS FERNAND", tp: "NATURAL", cond: "PROPIETARIO", part: "11025526", tipo: "URBANO", area: "542", res: "1207-2019 MTC/01.02" },
  { n: 11, cod: "PM1G-AERCAJAMARCA-PR-0100A", mod: "TRATO DIRECTO", suj: "ULICES URRUTIA RODRIGUEZ", tp: "NATURAL", cond: "PROPIETARIO", part: "11025526", tipo: "RURAL", area: "378", res: "1257-2019 MTC/01.02" },
  { n: 14, cod: "PM1G-AERCAJAMARCA-PR-0109C", mod: "TRATO DIRECTO", suj: "ANTHONY RAUL VASQUEZ JOPLIN", tp: "NATURAL", cond: "PROPIETARIO", part: "11110447", tipo: "URBANO", area: "1409", res: "COMPLETAR" },
  { n: 15, cod: "PM1G-AERCAJAMARCA-PR-0111", mod: "EXPROPIACIÓN", suj: "NDRO ROMERO GUI GUI / GONZALO RAMIRO ROMERO GUI G", tp: "NATURAL", cond: "PROPIETARIO", part: "02070452", tipo: "RURAL", area: "23898", res: "561-2022 MTC/01.02" },
  { n: 16, cod: "PM1G-AERCAJAMARCA-PR-0112", mod: "TRATO DIRECTO", suj: "JAIME RAFAEL SILVA VILLANUEVA", tp: "NATURAL", cond: "PROPIETARIO", part: "11149240", tipo: "URBANO", area: "450", res: "071-2022 MTC/01.02" },
  { n: 17, cod: "PM1G-AERCAJAMARCA-PR-0113", mod: "TRATO DIRECTO", suj: "ODOLFO BECERRA BAZANESPERANZA AYDEE ARRIBASPLAT", tp: "NATURAL", cond: "PROPIETARIO", part: "11149239", tipo: "RURAL", area: "1068", res: "121-2022 MTC/01.02" },
  { n: 18, cod: "PM1G-AERCAJAMARCA-PR-0114", mod: "TRATO DIRECTO", suj: "ARTURO BECERRA TELLO CINTHIA LISSET RODRIGUEZ ZAVA", tp: "NATURAL", cond: "PROPIETARIO", part: "11140824", tipo: "URBANO", area: "300", res: "132-2022 MTC/01.02" },
  { n: 19, cod: "PM1G-AERCAJAMARCA-PR-0117", mod: "TRATO DIRECTO", suj: "ELEUTERIO CHUGNAS CHICOMAJESUS ESPERANZA MORAL", tp: "NATURAL", cond: "PROPIETARIO", part: "11086659", tipo: "RURAL", area: "2719", res: "1009-2021 MTC/01.02" },
  { n: 20, cod: "PM1G-AERCAJAMARCA-PR-0118", mod: "TRATO DIRECTO", suj: "OLEON ABANTO LUNAMARIA DEL CARMEN CASTAÑEDA BRIO", tp: "NATURAL", cond: "PROPIETARIO", part: "11034694", tipo: "URBANO", area: "2024", res: "280-2021-MTC/01.02" },
  { n: 21, cod: "PM1G-AERCAJAMARCA-PR-0119", mod: "TRATO DIRECTO", suj: "JULIO CORO NOVOA", tp: "NATURAL", cond: "PROPIETARIO", part: "2160383", tipo: "RURAL", area: "85.35", res: "454-2022-MTC/01.02" },
  { n: 22, cod: "PM1G-AERCAJAMARCA-PR-0123", mod: "TRATO DIRECTO", suj: "SEGUNDO TOMAS MARIN CACHAY", tp: "NATURAL", cond: "PROPIETARIO", part: "11159962", tipo: "URBANO", area: "210.12", res: "0813-2020-MTC/01.02" },
  { n: 23, cod: "PM1G-AERCAJAMARCA-PR-0124", mod: "TRATO DIRECTO", suj: "LUISA RONCAL FLORES", tp: "NATURAL", cond: "PROPIETARIO", part: "11068644", tipo: "RURAL", area: "1237.94", res: "287-2021-MTC/01.02" },
  { n: 24, cod: "PM1G-AERCAJAMARCA-PR-0125", mod: "TRATO DIRECTO", suj: "VICTOR PORTAL MALUQUIZCASIMIRA CHUGNAS CHICOMA", tp: "NATURAL", cond: "PROPIETARIO", part: "2160381", tipo: "RURAL", area: "454.01", res: "163-2022-MTC/01.02" },
  { n: 28, cod: "PM1G-AERCAJAMARCA-PR-0128", mod: "TRATO DIRECTO", suj: "JANDRO RODRIGUEZ GIL ROSALIA CRUZADO RUIZ DE RODRIG", tp: "NATURAL", cond: "PROPIETARIO", part: "2160364", tipo: "RURAL", area: "750.3", res: "1226-2021-MTC/01.02" },
  { n: 29, cod: "PM1G-AERCAJAMARCA-PR-0129", mod: "TRATO DIRECTO", suj: "LUIS FERNANDO ROSELL ORTIZ", tp: "NATURAL", cond: "PROPIETARIO", part: "11117576", tipo: "RURAL", area: "1664", res: "1209-2019-MTC/01.02" },
  { n: 30, cod: "PM1G-AERCAJAMARCA-PR-0130", mod: "TRATO DIRECTO", suj: "LUIS FERNANDO ROSELL ORTIZ", tp: "NATURAL", cond: "PROPIETARIO", part: "11055550", tipo: "RURAL", area: "33949", res: "1276-2019-MTC/01.02" },
];

// Caballococha, Loreto, Peru
const center: [number, number] = [-3.9089, -70.5152];

const projectPolygon: [number, number][] = [
  [-3.905, -70.522],
  [-3.905, -70.508],
  [-3.913, -70.508],
  [-3.913, -70.522],
];

const parcels: [number, number][][] = [
  [[-3.9065, -70.5195], [-3.9065, -70.5175], [-3.9080, -70.5175], [-3.9080, -70.5195]],
  [[-3.9080, -70.5195], [-3.9080, -70.5175], [-3.9095, -70.5175], [-3.9095, -70.5195]],
  [[-3.9065, -70.5175], [-3.9065, -70.5155], [-3.9080, -70.5155], [-3.9080, -70.5175]],
  [[-3.9080, -70.5175], [-3.9080, -70.5155], [-3.9095, -70.5155], [-3.9095, -70.5175]],
  [[-3.9095, -70.5195], [-3.9095, -70.5170], [-3.9115, -70.5170], [-3.9115, -70.5195]],
  [[-3.9095, -70.5170], [-3.9095, -70.5145], [-3.9115, -70.5145], [-3.9115, -70.5170]],
];

const COMPACT_COLS: { label: string; key: string | null; filterable?: boolean }[] = [
  { label: "N°", key: null },
  { label: "Acciones", key: null },
  { label: "Código de predio", key: "cod", filterable: true },
  { label: "CONDICION_PREDIO", key: "condicionPredio", filterable: true },
  { label: "Modalidad de adquisición", key: "mod", filterable: true },
  { label: "Sujeto Pasivo", key: "suj", filterable: true },
  { label: "Tipo de persona jurídica", key: "tp", filterable: true },
  { label: "Condición del Sujeto Pasivo", key: "cond", filterable: true },
  { label: "Número de partida registral", key: "part", filterable: true },
  { label: "Tipo de predio", key: "tipo", filterable: true },
  { label: "Área en metros cuadrados", key: "area", filterable: true },
  { label: "Número de Resolución", key: "res", filterable: true },
];

function CompactPrediosTable ({
  rows = predioRows,
  selectedCodigo,
  onSelectCodigo,
  searchOption = OPCION_BUSQUEDA[0],
  searchQuery = "",
  modalidadSelected,
  condicionSelected,
}: {
  rows?: PredioRow[];
  selectedCodigo?: string | null;
  onSelectCodigo?: (codigo: string) => void;
  searchOption?: string;
  searchQuery?: string;
  modalidadSelected?: string[];
  condicionSelected?: string[];
}) {
  const [filters, setFilters] = useState<Record<string, Set<string>>>({});
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  const filtered = rows.filter((p) => {
    if (modalidadSelected && !modalidadSelected.includes(p.mod || "Sin informacion")) return false;
    if (condicionSelected && !condicionSelected.includes(p.cond || "Sin informacion")) return false;

    const term = searchQuery.trim().toLowerCase();
    if (term) {
      const target =
        searchOption === "Nombres Apellidos"
          ? p.suj
          : searchOption === "DNI o RUC"
            ? `${p.exp} ${p.suj}`
            : `${p.cod} ${p.codigo}`;
      if (!target.toLowerCase().includes(term)) return false;
    }

    for (const [k, sel] of Object.entries(filters)) {
      if (sel.size === 0) continue;
      if (sel.has(p[k] ?? "")) return false;
    }
    return true;
  });

  const distinct = (key: string) => Array.from(new Set(rows.map((p) => p[key] ?? ""))).sort();

  useEffect(() => {
    if (!selectedCodigo) return;
    rowRefs.current[selectedCodigo]?.scrollIntoView({ block: "nearest" });
  }, [filtered, selectedCodigo]);

  return (
    <>
      <div className="px-6 pb-2 text-[12px] text-[#6b7280]">{filtered.length} de {rows.length} registros</div>
      <div className="flex-1 overflow-auto px-6 pb-4">
        <table className="w-full text-[12px] border-collapse">
          <thead className="sticky top-0 bg-[#dc2626] text-white">
            <tr>
              {COMPACT_COLS.map((c) => (
                <th
                  key={c.label}
                  className="px-2 py-2 text-left font-semibold border-r border-indigo-500 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>{c.label}</span>
                    {c.filterable && c.key && (
                      <button
                        onClick={() => setOpenFilter(openFilter === c.key ? null : c.key!)}
                        className={`shrink-0 size-5 rounded flex items-center justify-center hover:bg-white/20 ${filters[c.key]?.size ? "text-white" : "text-white/70"}`}
                        title="Filtrar"
                      >
                        <Filter size={10} />
                      </button>
                    )}
                  </div>
                  {c.filterable && c.key && openFilter === c.key && (
                    <>
                      <div className="fixed inset-0 z-[60]" onClick={() => setOpenFilter(null)} />
                      <div className="absolute mt-1 z-[70]">
                        <ColumnFilter
                          values={distinct(c.key)}
                          selected={filters[c.key] ?? new Set()}
                          onChange={(next) =>
                            setFilters((f) => {
                              const copy = { ...f };
                              if (next.size === 0) delete copy[c.key!];
                              else copy[c.key!] = next;
                              return copy;
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const isSelected = selectedCodigo === p.codigo;
              return (
              <tr
                key={p.rowId}
                ref={(node) => {
                  if (node && !rowRefs.current[p.codigo]) rowRefs.current[p.codigo] = node;
                }}
                onClick={() => onSelectCodigo?.(p.codigo)}
                className={`${isSelected ? "bg-[#fef3c7]" : i % 2 ? "bg-[#f9fafb]" : "bg-white"} cursor-pointer hover:bg-[#fef2f2]`}
              >
                <td className="px-2 py-1.5 border-b border-[#e5e7eb] text-[#dc2626] font-semibold">{i + 1}</td>
                <td className="px-2 py-1.5 border-b border-[#e5e7eb] text-center"><PredioActions codigoPredio={p.codigo} condicionPredio={p.condicionPredio} /></td>
                <td className="px-2 py-1.5 border-b border-[#e5e7eb] font-mono">{p.cod}</td>
                <td className="px-2 py-1.5 border-b border-[#e5e7eb]">{p.condicionPredio}</td>
                <td className="px-2 py-1.5 border-b border-[#e5e7eb]">{p.mod}</td>
                <td className="px-2 py-1.5 border-b border-[#e5e7eb]">{p.suj}</td>
                <td className="px-2 py-1.5 border-b border-[#e5e7eb]">{p.tp}</td>
                <td className="px-2 py-1.5 border-b border-[#e5e7eb]">{p.cond}</td>
                <td className="px-2 py-1.5 border-b border-[#e5e7eb]">{p.part}</td>
                <td className="px-2 py-1.5 border-b border-[#e5e7eb]">{p.tipo}</td>
                <td className="px-2 py-1.5 border-b border-[#e5e7eb] text-right">{p.area}</td>
                <td className="px-2 py-1.5 border-b border-[#e5e7eb] bg-[#fee2e2]">{p.res}</td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
function Index () {
  const { projectId } = Route.useParams();
  const proyecto = getProyecto(projectId);
  const nombre = proyecto ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}` : projectId;
  const subtitulo = proyecto
    ? `${proyecto.codigo} · ${proyecto.tipo} · ${proyecto.coordinacionPredial} · ${proyecto.fase} · ${proyecto.coordinadorPredial}`
    : "";
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(layerGroups.map((g) => [g.name, true]))
  );
  const [layout, setLayout] = useState<"horizontal" | "vertical" | "full" | "table">("horizontal");
  const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null);
  const modalidadTableOptions = useMemo(
    () => Array.from(new Set(predioRows.map((row) => row.mod || "Sin informacion"))).sort(),
    [],
  );
  const condicionTableOptions = useMemo(
    () => Array.from(new Set(predioRows.map((row) => row.cond || "Sin informacion"))).sort(),
    [],
  );
  const codigoPredioOptions = useMemo(
    () =>
      predioRows
        .map((row) => ({
          value: row.codigo,
          label: row.cod || row.codigo,
          subject: row.suj || "Sin informacion",
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );
  const [tableSearchOption, setTableSearchOption] = useState(OPCION_BUSQUEDA[0]);
  const [tableSearch, setTableSearch] = useState("");
  const [tableModalidadSelected, setTableModalidadSelected] = useState<string[]>(modalidadTableOptions);
  const [tableCondicionSelected, setTableCondicionSelected] = useState<string[]>(condicionTableOptions);
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({
    base: true,
    predios: false,
    pmd: true,
    concesion: true,
  });

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937] text-sm">
      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Compact project bar */}
        <div className="px-6 py-2 bg-white border-b border-[#e5e7eb] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/proyectos" className="flex items-center gap-1 text-[12px] text-[#dc2626] hover:underline shrink-0">
              <ArrowLeft size={12} /> Proyectos
            </Link>
            <span className="text-[#d1d5db]">/</span>
            <MapPin size={12} className="text-[#dc2626] shrink-0" />
            <h1 className="text-[14px] font-semibold truncate" title={nombre}>{nombre}</h1>
            <span className="text-[11px] text-[#6b7280] truncate hidden md:inline" title={subtitulo}>· {subtitulo}</span>
          </div>
        </div>


        <nav className="px-6 py-2 bg-white border-b border-[#e5e7eb] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#e5e7eb] hover:border-[#dc2626] hover:bg-[#fef2f2] text-[13px]">
                  <ClipboardList size={14} className="text-[#dc2626]" />
                  <span>Diag. Téc. Gral.</span>
                  <ChevronDown size={12} className="text-[#6b7280]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[240px] z-[9999]">
                {actions.map((a) =>
                  a.to ? (
                    <DropdownMenuItem key={a.label} asChild>
                      <Link
                        to={
                          a.to === "equipos"
                            ? "/proyectos/$projectId/equipos"
                            : a.to === "evaluacion-informacion"
                              ? "/proyectos/$projectId/evaluacion-informacion"
                              : a.to === "requerimientos"
                                ? "/proyectos/$projectId/requerimientos"
                                : "/proyectos/$projectId/base-grafica"
                        }
                        params={{ projectId }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <a.icon size={14} className="text-[#dc2626]" /> {a.label}
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem key={a.label} className="flex items-center gap-2 cursor-pointer">
                      <a.icon size={14} className="text-[#dc2626]" /> {a.label}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#e5e7eb] hover:border-[#dc2626] hover:bg-[#fef2f2] text-[13px]">
                  <Hash size={14} className="text-[#dc2626]" />
                  <span>Códigos</span>
                  <ChevronDown size={12} className="text-[#6b7280]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[220px] z-[9999]">
                <DropdownMenuItem asChild>
                  <Link to="/proyectos/$projectId/codigos-planos" params={{ projectId }} className="flex items-center gap-2 cursor-pointer">
                    <FileCode size={14} className="text-[#dc2626]" /> Códigos de plano
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/proyectos/$projectId/codigos-predios" params={{ projectId }} className="flex items-center gap-2 cursor-pointer">
                    <Hash size={14} className="text-[#dc2626]" /> Códigos de Predios
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/proyectos/$projectId/expedientes" params={{ projectId }} className="flex items-center gap-2 cursor-pointer">
                    <FileText size={14} className="text-[#dc2626]" /> Número de expediente
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              to="/proyectos/$projectId/padron-preliminar"
              params={{ projectId }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#dc2626] bg-white text-[#dc2626] hover:bg-[#fef2f2] text-[13px] font-medium"
              title="Padron Preliminar"
            >
              <FileSpreadsheet size={14} />
              <span>Padron Preliminar</span>
            </Link>
            <Link
              to="/proyectos/$projectId/bim"
              params={{ projectId }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#dc2626] bg-white text-[#dc2626] hover:bg-[#fef2f2] text-[13px] font-medium"
              title="Modelo BIM del proyecto"
            >
              <Box size={14} />
              <span>BIM</span>
            </Link>
          </div>

          {/* Layout switcher */}
          <div className="flex items-center gap-1 bg-[#f3f4f6] rounded-md p-0.5 border border-[#e5e7eb]">
            <button
              onClick={() => setLayout("vertical")}
              className={`p-1.5 rounded ${layout === "vertical" ? "bg-white shadow text-[#dc2626]" : "text-[#6b7280] hover:text-[#374151]"}`}
              title="Vertical layout"
            >
              <Columns2 size={14} />
            </button>
            <button
              onClick={() => setLayout("full")}
              className={`p-1.5 rounded ${layout === "full" ? "bg-white shadow text-[#dc2626]" : "text-[#6b7280] hover:text-[#374151]"}`}
              title="Mapa completo"
            >
              <Square size={14} />
            </button>
            <button
              onClick={() => setLayout("horizontal")}
              className={`p-1.5 rounded ${layout === "horizontal" ? "bg-white shadow text-[#dc2626]" : "text-[#6b7280] hover:text-[#374151]"}`}
              title="Horizontal layout"
            >
              <Rows2 size={14} />
            </button>
            <button
              onClick={() => setLayout("table")}
              className={`p-1.5 rounded ${layout === "table" ? "bg-white shadow text-[#dc2626]" : "text-[#6b7280] hover:text-[#374151]"}`}
              title="Solo tabla"
            >
              <TableIcon size={14} />
            </button>
          </div>
        </nav>

        {/* Map + table content */}
        {layout === "table" ? (
          <section className="flex-1 overflow-hidden bg-white flex flex-col p-4">
            <div className="min-h-0 flex-1 rounded border border-[#e5e7eb] bg-white flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
                <h2 className="text-[14px] font-semibold">Matriz extensa</h2>
                {selectedCodigo && <span className="text-[12px] text-[#dc2626] font-mono">{selectedCodigo}</span>}
              </div>
              <FullPrediosTable
                rows={predioRows}
                selectedCodigo={selectedCodigo}
                onSelectCodigo={setSelectedCodigo}
              />
            </div>
          </section>
        ) : layout === "full" ? (
          <section className="flex-1 overflow-hidden">
            <div className="relative h-full">
              <ClientMap selectedCodigo={selectedCodigo} onSelectCodigo={setSelectedCodigo} layerVisibility={layerVisibility} />

              {/* Layers panel */}
              <LayersPanel
                layerGroups={layerGroups}
                openGroups={openGroups}
                setOpenGroups={setOpenGroups}
                layerVisibility={layerVisibility}
                setLayerVisibility={setLayerVisibility}
              />

              {/* Locate button */}
              <button className="absolute bottom-4 left-4 z-[500] size-9 rounded-md bg-white border border-[#e5e7eb] shadow flex items-center justify-center hover:bg-[#f9fafb]">
                <Locate size={16} />
              </button>

              {/* Legend */}
              <MapLegend items={legendItems} />

              <MapStatusBar centerLat={-3.9089} centerLng={-70.5152} />

            </div>
          </section>
        ) : layout === "vertical" ? (
          <ResizablePanelGroup orientation="horizontal" className="flex-1">
            <ResizablePanel defaultSize={60} minSize={30}>
              <div className="relative h-full">
                <ClientMap selectedCodigo={selectedCodigo} onSelectCodigo={setSelectedCodigo} layerVisibility={layerVisibility} />

                {/* Layers panel */}
                <LayersPanel
                  layerGroups={layerGroups}
                  openGroups={openGroups}
                  setOpenGroups={setOpenGroups}
                  layerVisibility={layerVisibility}
                  setLayerVisibility={setLayerVisibility}
                />

                {/* Locate button */}
                <button className="absolute bottom-4 left-4 z-[500] size-9 rounded-md bg-white border border-[#e5e7eb] shadow flex items-center justify-center hover:bg-[#f9fafb]">
                  <Locate size={16} />
                </button>

                <MapLegend items={legendItems} />

                <MapStatusBar centerLat={-3.9089} centerLng={-70.5152} />

              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={40} minSize={25}>
              <section className="bg-white border-l border-[#e5e7eb] flex flex-col overflow-hidden h-full">
                <div className="px-6 pt-4 pb-2 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Listado de predios</h2>
                </div>
                <PrediosFilterBar
                  opcion={tableSearchOption}
                  setOpcion={setTableSearchOption}
                  q={tableSearch}
                  setQ={setTableSearch}
                  modalidadOptions={modalidadTableOptions}
                  modalidadSelected={tableModalidadSelected}
                  setModalidadSelected={setTableModalidadSelected}
                  condicionOptions={condicionTableOptions}
                  condicionSelected={tableCondicionSelected}
                  setCondicionSelected={setTableCondicionSelected}
                  codigoOptions={codigoPredioOptions}
                  onCodigoSelect={setSelectedCodigo}
                />
                <CompactPrediosTable
                  rows={predioRows}
                  selectedCodigo={selectedCodigo}
                  onSelectCodigo={setSelectedCodigo}
                  searchOption={tableSearchOption}
                  searchQuery={tableSearch}
                  modalidadSelected={tableModalidadSelected}
                  condicionSelected={tableCondicionSelected}
                />
              </section>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <ResizablePanelGroup orientation="vertical" className="flex-1">
            <ResizablePanel defaultSize={55} minSize={30}>
              <div className="relative h-full">
                <ClientMap selectedCodigo={selectedCodigo} onSelectCodigo={setSelectedCodigo} layerVisibility={layerVisibility} />

                {/* Layers panel */}
                <LayersPanel
                  layerGroups={layerGroups}
                  openGroups={openGroups}
                  setOpenGroups={setOpenGroups}
                  layerVisibility={layerVisibility}
                  setLayerVisibility={setLayerVisibility}
                />

                {/* Locate button */}
                <button className="absolute bottom-4 left-4 z-[500] size-9 rounded-md bg-white border border-[#e5e7eb] shadow flex items-center justify-center hover:bg-[#f9fafb]">
                  <Locate size={16} />
                </button>

                <MapLegend items={legendItems} />

                <MapStatusBar centerLat={-3.9089} centerLng={-70.5152} />

              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={45} minSize={20}>
              <section className="bg-white border-t border-[#e5e7eb] flex flex-col overflow-hidden h-full">
                <div className="px-6 pt-4 pb-2 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Listado de predios</h2>
                </div>
                <PrediosFilterBar
                  opcion={tableSearchOption}
                  setOpcion={setTableSearchOption}
                  q={tableSearch}
                  setQ={setTableSearch}
                  modalidadOptions={modalidadTableOptions}
                  modalidadSelected={tableModalidadSelected}
                  setModalidadSelected={setTableModalidadSelected}
                  condicionOptions={condicionTableOptions}
                  condicionSelected={tableCondicionSelected}
                  setCondicionSelected={setTableCondicionSelected}
                  codigoOptions={codigoPredioOptions}
                  onCodigoSelect={setSelectedCodigo}
                />
                <CompactPrediosTable
                  rows={predioRows}
                  selectedCodigo={selectedCodigo}
                  onSelectCodigo={setSelectedCodigo}
                  searchOption={tableSearchOption}
                  searchQuery={tableSearch}
                  modalidadSelected={tableModalidadSelected}
                  condicionSelected={tableCondicionSelected}
                />
              </section>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </main>
    </div>
  );
}
