import { useState } from "react";
import {
  Layers,
  Plus,
  Download,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  ZoomIn,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export type LayerItem = { id: string; name: string };
export type LayerGroup = { name: string; items: LayerItem[] };

const EXPORT_FORMATS = [
  "GeoJSON",
  "KML",
  "Shapefile (zipped)",
  "CSV (attributes only)",
];

function downloadLayer(name: string, format: string) {
  const ext = format.toLowerCase().includes("csv")
    ? "csv"
    : format.toLowerCase().includes("shape")
      ? "zip"
        : format.toLowerCase().includes("kml")
          ? "kml"
          : "geojson";
  const filename = `${name.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}.${ext}`;
  let blob: Blob;
  if (ext === "geojson") {
    blob = new Blob(
      [JSON.stringify({ type: "FeatureCollection", name, features: [] }, null, 2)],
      { type: "application/geo+json" },
    );
  } else if (ext === "csv") {
    blob = new Blob([`id,name\n1,${name}\n`], { type: "text/csv" });
  } else {
    blob = new Blob([`# ${format} export of ${name} (mock)\n`], {
      type: "application/octet-stream",
    });
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function ExportMenu({ name, label }: { name: string; label?: React.ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1 text-[11px] text-[#374151] px-1.5 py-0.5 rounded hover:bg-[#f3f4f6]"
          title="Exportar capa"
          onClick={(e) => e.stopPropagation()}
        >
          {label ?? <Download size={12} />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] z-[9999]">
        <DropdownMenuLabel className="text-[11px]">Exportar “{name}”</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {EXPORT_FORMATS.map((f) => (
          <DropdownMenuItem
            key={f}
            className="text-[12px] cursor-pointer"
            onClick={() => downloadLayer(name, f)}
          >
            {f}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ActionsMenu({
  name,
  visible,
  onToggleVisible,
  opacity,
  onOpacityChange,
  scope = "capa",
  originalFile,
}: {
  name: string;
  visible?: boolean;
  onToggleVisible?: () => void;
  opacity?: number;
  onOpacityChange?: (v: number) => void;
  scope?: "capa" | "grupo";
  originalFile?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="text-[#9ca3af] hover:text-[#374151] p-0.5 rounded hover:bg-[#f3f4f6]"
          title="Acciones"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px] z-[9999]">
        <DropdownMenuLabel className="text-[11px] truncate">
          {scope === "grupo" ? "Grupo" : "Capa"}: {name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onToggleVisible && (
          <DropdownMenuItem className="text-[12px] cursor-pointer" onClick={onToggleVisible}>
            {visible ? <EyeOff size={12} className="mr-2" /> : <Eye size={12} className="mr-2" />}
            {visible ? "Ocultar" : "Mostrar"}
          </DropdownMenuItem>
        )}
        {scope === "capa" && (
          <DropdownMenuItem className="text-[12px] cursor-pointer">
            <ZoomIn size={12} className="mr-2" /> Zoom a la capa
          </DropdownMenuItem>
        )}
        {onOpacityChange && (
          <>
            <DropdownMenuSeparator />
            <div
              className="px-2 py-1.5"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between text-[10px] text-[#6b7280] mb-1">
                <span>Opacidad</span>
                <span className="tabular-nums">{(opacity ?? 1).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={opacity ?? 1}
                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                className="w-full accent-[#dc2626] h-1"
              />
            </div>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] text-[#6b7280] font-normal">
          Exportar como
        </DropdownMenuLabel>
        <DropdownMenuItem
          className="text-[12px] cursor-pointer"
          title={originalFile ?? "La capa viene de otra fuente y no fue subida"}
          onClick={() => {
            if (originalFile) {
              downloadLayer(originalFile.replace(/\.[^.]+$/, ""), "Original");
            } else {
              alert("La capa viene de otra fuente y no fue subida.");
            }
          }}
        >
          <Download size={12} className="mr-2" />
          <span className="flex-1 truncate">
            Original{originalFile ? ` (${originalFile})` : " — no disponible"}
          </span>
        </DropdownMenuItem>
        {EXPORT_FORMATS.map((f) => (
          <DropdownMenuItem
            key={f}
            className="text-[12px] cursor-pointer"
            onClick={() => downloadLayer(name, f)}
          >
            <Download size={12} className="mr-2" /> {f}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LayerRow({
  item,
  visible,
  onToggleVisible,
}: {
  item: LayerItem;
  visible: boolean;
  onToggleVisible: () => void;
}) {
  const [opacity, setOpacity] = useState(1);
  return (
    <div className="border border-[#e5e7eb] rounded-md mb-1 bg-white">
      <div className="flex items-center gap-2 px-2 py-1">
        <input
          type="checkbox"
          checked={visible}
          onChange={onToggleVisible}
          className="accent-[#dc2626]"
        />
        <span className="flex-1 truncate text-[12px] text-[#374151]" title={item.name}>
          {item.name}
        </span>
        <span className="text-[9px] font-semibold text-[#9ca3af] tracking-wide">VECTOR</span>
        <ActionsMenu
          name={item.name}
          visible={visible}
          onToggleVisible={onToggleVisible}
          opacity={opacity}
          onOpacityChange={setOpacity}
        />
      </div>
    </div>
  );
}

export function LayersPanel({
  layerGroups,
  openGroups,
  setOpenGroups,
  layerVisibility,
  setLayerVisibility,
  className = "",
}: {
  layerGroups: LayerGroup[];
  openGroups: Record<string, boolean>;
  setOpenGroups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  layerVisibility: Record<string, boolean>;
  setLayerVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  className?: string;
}) {
  const [groupOpacity, setGroupOpacity] = useState<Record<string, number>>(
    Object.fromEntries(layerGroups.map((g) => [g.name, 1])),
  );
  const [collapsed, setCollapsed] = useState(false);

  const groupVisible = (group: LayerGroup) => group.items.every((item) => layerVisibility[item.id] !== false);
  const toggleGroup = (group: LayerGroup) => {
    const nextVisible = !groupVisible(group);
    setLayerVisibility((state) => ({
      ...state,
      ...Object.fromEntries(group.items.map((item) => [item.id, nextVisible])),
    }));
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        title="Mostrar capas"
        className={`absolute top-3 left-3 z-[500] size-9 rounded-md bg-white border border-[#e5e7eb] shadow flex items-center justify-center hover:bg-[#f9fafb] ${className}`}
      >
        <PanelLeftOpen size={16} className="text-[#dc2626]" />
      </button>
    );
  }

  return (
    <div
      className={`absolute top-0 left-0 h-full w-[320px] bg-white shadow-lg border-r border-[#e5e7eb] flex flex-col z-[500] ${className}`}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#e5e7eb] shrink-0">
        <div className="flex items-center gap-1.5 font-semibold text-[13px]">
          <Layers size={14} /> Capas
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(true)}
            title="Ocultar panel"
            className="ml-1 p-1 rounded hover:bg-[#f3f4f6] text-[#6b7280]"
          >
            <PanelLeftClose size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {layerGroups.map((g) => (
          <div key={g.name} className="text-[12px] mb-2">
            <div className="flex items-center gap-2 px-1 py-1 rounded hover:bg-[#f9fafb]">
              <button
                onClick={() => setOpenGroups((s) => ({ ...s, [g.name]: !s[g.name] }))}
                className="flex items-center"
                title={openGroups[g.name] ? "Colapsar" : "Expandir"}
              >
                <ChevronRight
                  size={12}
                  className={openGroups[g.name] ? "rotate-90 transition" : "transition"}
                />
              </button>
              <input
                type="checkbox"
                checked={groupVisible(g)}
                onChange={() => toggleGroup(g)}
                className="accent-[#dc2626]"
              />
              <span className="flex-1 text-left font-semibold text-[#1f2937] truncate">
                {g.name}
              </span>
              <ActionsMenu
                name={g.name}
                scope="grupo"
                visible={groupVisible(g)}
                onToggleVisible={() => toggleGroup(g)}
                opacity={groupOpacity[g.name] ?? 1}
                onOpacityChange={(v) =>
                  setGroupOpacity((s) => ({ ...s, [g.name]: v }))
                }
              />
            </div>
            {openGroups[g.name] && (
              <div className="pl-5 pr-1 pt-1">
                {g.items.map((item) => (
                  <LayerRow
                    key={item.id}
                    item={item}
                    visible={layerVisibility[item.id] !== false}
                    onToggleVisible={() =>
                      setLayerVisibility((state) => ({ ...state, [item.id]: !(state[item.id] !== false) }))
                    }
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
