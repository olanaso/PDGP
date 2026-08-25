import { useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

export type LegendItem = { color: string; label: string };

export function MapLegend({ items }: { items: LegendItem[] }) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Mostrar leyenda"
        className="absolute bottom-4 right-4 z-[500] size-9 rounded-md bg-white border border-[#e5e7eb] shadow flex items-center justify-center hover:bg-[#f9fafb]"
      >
        <PanelRightOpen size={16} className="text-[#dc2626]" />
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 z-[500] bg-white/95 rounded-md border border-[#e5e7eb] shadow px-3 py-2 text-[11px] max-w-[220px]">
      <div className="flex items-center justify-between mb-1 gap-2">
        <div className="font-semibold">Leyenda</div>
        <button
          onClick={() => setOpen(false)}
          title="Ocultar leyenda"
          className="p-0.5 rounded hover:bg-[#f3f4f6] text-[#6b7280]"
        >
          <PanelRightClose size={12} />
        </button>
      </div>
      <div className="space-y-1">
        {items.map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <span className="size-3 rounded-sm border border-black/20" style={{ background: l.color }} />
            <span className="text-[#374151] truncate">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
