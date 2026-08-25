import { useState } from "react";
import { Search } from "lucide-react";

export function ColumnFilter({
  values,
  selected,
  onChange,
}: {
  values: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = values.filter((v) => v.toLowerCase().includes(q.toLowerCase()));
  const allOn = selected.size === 0 || selected.size === values.length;
  return (
    <div className="w-[240px] bg-white border border-[#e5e7eb] rounded-md shadow-lg p-2 text-[12px] text-[#1f2937]">
      <div className="relative mb-2">
        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar"
          className="w-full pl-7 pr-2 py-1 text-[12px] border border-[#e5e7eb] rounded outline-none focus:border-[#dc2626]"
        />
      </div>
      <label className="flex items-center gap-2 px-1 py-1 border-b border-[#e5e7eb] mb-1">
        <input
          type="checkbox"
          checked={allOn}
          onChange={(e) => onChange(e.target.checked ? new Set() : new Set(values))}
          className="accent-[#dc2626]"
        />
        <span className="font-medium">(Seleccionar todo)</span>
      </label>
      <div className="max-h-[200px] overflow-y-auto pr-1">
        {filtered.map((v) => {
          const checked = selected.size === 0 ? true : !selected.has(v);
          return (
            <label key={v} className="flex items-center gap-2 px-1 py-0.5 hover:bg-[#f9fafb] rounded">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => {
                  const next = new Set(selected.size === 0 ? [] : selected);
                  if (checked) next.add(v);
                  else next.delete(v);
                  onChange(next);
                }}
                className="accent-[#dc2626]"
              />
              <span className="truncate">{v || "(vacío)"}</span>
            </label>
          );
        })}
        {filtered.length === 0 && <div className="text-[#9ca3af] px-1 py-2 text-center">Sin coincidencias</div>}
      </div>
    </div>
  );
}
