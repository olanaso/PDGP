import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Filter, Search, X } from "lucide-react";
import { PredioActions } from "@/components/PredioActions";
import { ColumnFilter } from "@/components/ColumnFilter";
import { predioRows, type PredioRow } from "@/lib/prediosData";
import {
  FULL_PREDIO_TRACKING_STAGES,
  FULL_PREDIO_TRACKING_TARGET_DAYS,
  formatFullPredioTrackingDate,
  fullPredioTrackingProcessDays,
  fullPredioTrackingStageIndex,
  fullPredioTrackingStageTiming,
  fullPredioTrackingStart,
} from "@/lib/fullPredioTracking";

type Group = {
  label: string;
  color: string;
  text: string;
};

const GROUPS: Record<string, Group> = {
  predio: { label: "DATOS DEL PREDIO Y SUJETO PASIVO", color: "#1e3a8a", text: "#ffffff" },
  adq: { label: "DATOS ADQUISICIÓN", color: "#c2410c", text: "#ffffff" },
  reg: { label: "GESTIÓN DEL PROCESO DE INSCRIPCIÓN REGISTRAL", color: "#15803d", text: "#ffffff" },
  fis: { label: "DATOS FÍSICOS DEL PREDIO Y EXPEDIENTE", color: "#7e22ce", text: "#ffffff" },
  seg: { label: "SEGUIMIENTO TÉCNICO Y TASACIONES", color: "#9a3412", text: "#ffffff" },
};

type Col = {
  key: string;
  label: string;
  group: keyof typeof GROUPS;
  width: number;
  align?: "left" | "right" | "center";
  mono?: boolean;
};

const BASE_COLUMNS: Col[] = [
  { key: "n", label: "N°", group: "predio", width: 50, align: "center" },
  { key: "__act", label: "Acciones", group: "predio", width: 70, align: "center" },
  { key: "cod", label: "Código de predio", group: "predio", width: 220, mono: true },
  { key: "condicionPredio", label: "CONDICION_PREDIO", group: "predio", width: 150 },
  { key: "proyecto", label: "Nombre del Proyecto", group: "predio", width: 200 },
  { key: "exp", label: "Expediente", group: "predio", width: 160 },
  { key: "mod", label: "Modalidad de adquisición", group: "predio", width: 170 },
  { key: "suj", label: "Sujeto Pasivo", group: "predio", width: 260 },
  { key: "tp", label: "Tipo de persona jurídica", group: "predio", width: 140 },
  { key: "cond", label: "Condición del Sujeto Pasivo", group: "predio", width: 150 },
  { key: "rlegal", label: "Responsable Legal", group: "predio", width: 170 },
  { key: "rtec", label: "Responsable Técnico", group: "predio", width: 170 },
  { key: "part", label: "Número de partida registral", group: "predio", width: 140, mono: true },
  { key: "m2", label: "Área m²", group: "predio", width: 90, align: "right" },
  { key: "ha", label: "Área (ha)", group: "predio", width: 90, align: "right" },
  { key: "afec", label: "Tipo de afectación (Total/Parcial)", group: "predio", width: 160 },
  { key: "valor", label: "Valor de adquisición (S/)", group: "predio", width: 140, align: "right" },
  { key: "fres", label: "Fecha Resolución MTC/VMT/SBN", group: "adq", width: 150 },
  { key: "nres", label: "Número de Resolución", group: "adq", width: 150 },
  { key: "per", label: "Periodo de adquisición", group: "adq", width: 110, align: "center" },
  { key: "pago", label: "Estado de pago", group: "adq", width: 110 },
  {
    key: "estado",
    label: "Estado situacional de inscripción",
    group: "reg",
    width: 130,
    align: "center",
  },
  { key: "acto", label: "Acto registral", group: "reg", width: 180 },
  { key: "ofi", label: "Oficina registral", group: "reg", width: 130 },
  { key: "titulo", label: "N° Título SUNARP", group: "reg", width: 150 },
  { key: "ftit", label: "Fecha de título", group: "reg", width: 120 },
  { key: "etit", label: "Estado de título", group: "reg", width: 120 },
  { key: "finsc", label: "Fecha de inscripción", group: "reg", width: 130 },
  { key: "pind", label: "Partida inscrita / independizada", group: "reg", width: 150, mono: true },
  { key: "edd", label: "EXPEDIENTE FÍSICO DDP", group: "fis", width: 140, align: "center" },
  {
    key: "fr",
    label: "FORM. REGISTRAL / FE ENTREGA MEJORAS",
    group: "fis",
    width: 180,
    align: "center",
  },
  { key: "acta", label: "ACTA RECEPCIÓN DE PREDIO", group: "fis", width: 150, align: "center" },
  { key: "trans", label: "Estado transferencia a OPAT", group: "fis", width: 220 },
  { key: "com", label: "COMENTARIO", group: "fis", width: 200 },
];

const TRACKING_COLUMNS: Col[] = [
  { key: "__track_start", label: "Fecha de inicio", group: "seg", width: 110, align: "center" },
  ...FULL_PREDIO_TRACKING_STAGES.map((stage, index) => ({
    key: `__track_${index}`,
    label: `${stage.label} · ${stage.targetDays} d`,
    group: "seg" as const,
    width: 54,
    align: "center" as const,
  })),
  { key: "__track_progress", label: "% avance", group: "seg", width: 85, align: "center" },
  { key: "__track_days", label: "Días transcurridos", group: "seg", width: 115, align: "center" },
  { key: "__track_deviation", label: "Desviación", group: "seg", width: 90, align: "center" },
];

const ROWS: Record<string, string>[] = [
  {
    n: "10",
    proyecto: "AEROPUERTO DE CAJAMARCA",
    cod: "PM1G-AERCAJAMARCA-PR-0100",
    exp: "027-2018-MTC/OPAT",
    mod: "TRATO DIRECTO",
    suj: "NAPOLEÓN GAONA RAMOS / ROSA O. VILLEGAS FERNÁNDEZ",
    tp: "NATURAL",
    cond: "PROPIETARIO",
    rlegal: "COMPLETAR",
    rtec: "ING. LUIS ESCOBEDO",
    part: "11025526",
    m2: "542.00",
    ha: "0.0542",
    afec: "PARCIAL",
    valor: "226,723.03",
    fres: "23/12/2019",
    nres: "1207-2019 MTC/01.02",
    per: "2019",
    pago: "PAGADO",
    estado: "SI",
    acto: "TRANSFERENCIA",
    ofi: "CAJAMARCA",
    titulo: "2021-00801853",
    ftit: "26/03/2021",
    etit: "INSCRITO",
    finsc: "13/07/2021",
    pind: "11025526",
    edd: "OPAT",
    fr: "OPAT",
    acta: "OPAT",
    trans: "PREDIO RECEPCIONADO Y EXPEDIENTE CON OPAT",
    com: "NO APLICA",
  },
  {
    n: "11",
    proyecto: "AEROPUERTO DE CAJAMARCA",
    cod: "PM1G-AERCAJAMARCA-PR-0100A",
    exp: "161-2019-MTC/DDP",
    mod: "TRATO DIRECTO",
    suj: "ULICES URRUTIA RODRIGUEZ",
    tp: "NATURAL",
    cond: "PROPIETARIO",
    rlegal: "COMPLETAR",
    rtec: "ING. LUIS ESCOBEDO",
    part: "11025526",
    m2: "370.00",
    ha: "0.0370",
    afec: "TOTAL",
    valor: "359,027.48",
    fres: "30/12/2019",
    nres: "1257-2019 MTC/01.02",
    per: "2019",
    pago: "PAGADO",
    estado: "SI",
    acto: "TRANSFERENCIA",
    ofi: "CAJAMARCA",
    titulo: "2021-00801853",
    ftit: "26/03/2021",
    etit: "INSCRITO",
    finsc: "13/07/2021",
    pind: "11025526",
    edd: "OPAT",
    fr: "OPAT",
    acta: "OPAT",
    trans: "PREDIO RECEPCIONADO Y EXPEDIENTE CON OPAT",
    com: "NO APLICA",
  },
  {
    n: "12",
    proyecto: "AEROPUERTO DE CAJAMARCA",
    cod: "PM1G-AERCAJAMARCA-PR-0104",
    exp: "163-2018-MTC/OPAT",
    mod: "TRATO DIRECTO",
    suj: "GIANI CRUZADO NUÑEZ",
    tp: "NATURAL",
    cond: "PROPIETARIO",
    rlegal: "ABG. DIANA MONTERO",
    rtec: "ING. RICARDO SAENZ",
    part: "11100139",
    m2: "177.35",
    ha: "0.0177",
    afec: "PARCIAL",
    valor: "77,541.97",
    fres: "29/10/2021",
    nres: "COMPLETAR",
    per: "2021",
    pago: "PAGADO",
    estado: "SI",
    acto: "INDEPENDIZACIÓN Y TRANSFERENCIA",
    ofi: "CAJAMARCA",
    titulo: "2024-3661635",
    ftit: "18/12/2024",
    etit: "INSCRITO",
    finsc: "20/02/2025",
    pind: "11242094",
    edd: "SI",
    fr: "SI",
    acta: "SI",
    trans: "PREDIO RECEPCIONADO POR OPAT",
    com: "EXPEDIENTE FÍSICO CON C.A.",
  },
  {
    n: "13",
    proyecto: "AEROPUERTO DE CAJAMARCA",
    cod: "PM1G-AERCAJAMARCA-PR-0109B",
    exp: "474-2021-MTC/DDP",
    mod: "TRATO DIRECTO",
    suj: "ANTHONY RAUL VASQUEZ JOPLIN",
    tp: "NATURAL",
    cond: "PROPIETARIO",
    rlegal: "ABG. SALLY VERAMENDI",
    rtec: "ING. JUAN ROSPIGLIOSI",
    part: "11144583",
    m2: "23,507.00",
    ha: "2.3507",
    afec: "PARCIAL",
    valor: "7,601,888.60",
    fres: "28/10/2021",
    nres: "COMPLETAR",
    per: "2021",
    pago: "PAGADO",
    estado: "SI",
    acto: "INDEPENDIZACIÓN Y TRANSFERENCIA",
    ofi: "CAJAMARCA",
    titulo: "2022-02391956",
    ftit: "15/08/2022",
    etit: "INSCRITO",
    finsc: "30/09/2022",
    pind: "11208270",
    edd: "SI",
    fr: "SI",
    acta: "SI",
    trans: "PREDIO RECEPCIONADO POR OPAT",
    com: "EXPEDIENTE FÍSICO CON C.A.",
  },
  {
    n: "14",
    proyecto: "AEROPUERTO DE CAJAMARCA",
    cod: "PM1G-AERCAJAMARCA-PR-0109C",
    exp: "475-2021-MTC/DDP",
    mod: "TRATO DIRECTO",
    suj: "ANTHONY RAUL VASQUEZ JOPLIN",
    tp: "NATURAL",
    cond: "PROPIETARIO",
    rlegal: "ABG. SALLY VERAMENDI",
    rtec: "ING. JUAN ROSPIGLIOSI",
    part: "11110447",
    m2: "1,409.00",
    ha: "0.1409",
    afec: "TOTAL",
    valor: "1,087,872.35",
    fres: "28/10/2021",
    nres: "COMPLETAR",
    per: "2021",
    pago: "PAGADO",
    estado: "SI",
    acto: "TRANSFERENCIA",
    ofi: "CAJAMARCA",
    titulo: "2022-02391956",
    ftit: "15/08/2022",
    etit: "INSCRITO",
    finsc: "30/09/2022",
    pind: "11110447",
    edd: "SI",
    fr: "SI",
    acta: "SI",
    trans: "PREDIO RECEPCIONADO POR OPAT",
    com: "EXPEDIENTE FÍSICO CON C.A.",
  },
  {
    n: "15",
    proyecto: "AEROPUERTO DE CAJAMARCA",
    cod: "PM1G-AERCAJAMARCA-PR-0111",
    exp: "587-2021-MTC/DDP",
    mod: "EXPROPIACIÓN",
    suj: "MARÍA DORILA CULQUI DE ROMERO Y OTROS (6)",
    tp: "NATURAL",
    cond: "PROPIETARIO",
    rlegal: "ABG. SALLY VERAMENDI",
    rtec: "ING. JUAN ROSPIGLIOSI",
    part: "02070452",
    m2: "23,898.00",
    ha: "2.3898",
    afec: "PARCIAL",
    valor: "6,479,039.07",
    fres: "30/06/2022",
    nres: "561-2022-MTC/01.02",
    per: "2022",
    pago: "PAGADO",
    estado: "SI",
    acto: "INDEPENDIZACIÓN Y TRANSFERENCIA",
    ofi: "CAJAMARCA",
    titulo: "2022-03622721",
    ftit: "01/12/2022",
    etit: "INSCRITO",
    finsc: "12/01/2023",
    pind: "11210833",
    edd: "SI",
    fr: "NO APLICA",
    acta: "NO",
    trans: "PREDIO RECEPCIONADO POR OPAT",
    com: "NO APLICA",
  },
  {
    n: "16",
    proyecto: "AEROPUERTO DE CAJAMARCA",
    cod: "PM1G-AERCAJAMARCA-PR-0112",
    exp: "387-2020-MTC/DDP",
    mod: "TRATO DIRECTO",
    suj: "JAIME RAFAEL SILVA VILLANUEVA",
    tp: "NATURAL",
    cond: "PROPIETARIO",
    rlegal: "ABG. DIANA MONTERO",
    rtec: "ING. MICHEL CHINCHAY",
    part: "11149240",
    m2: "450.00",
    ha: "0.0450",
    afec: "PARCIAL",
    valor: "210,500.00",
    fres: "15/03/2022",
    nres: "071-2022 MTC/01.02",
    per: "2022",
    pago: "PAGADO",
    estado: "SI",
    acto: "TRANSFERENCIA",
    ofi: "CAJAMARCA",
    titulo: "2022-01122334",
    ftit: "10/05/2022",
    etit: "INSCRITO",
    finsc: "22/06/2022",
    pind: "11149240",
    edd: "SI",
    fr: "SI",
    acta: "SI",
    trans: "PREDIO RECEPCIONADO POR OPAT",
    com: "",
  },
  {
    n: "17",
    proyecto: "AEROPUERTO DE CAJAMARCA",
    cod: "PM1G-AERCAJAMARCA-PR-0113",
    exp: "411-2020-MTC/DDP",
    mod: "TRATO DIRECTO",
    suj: "RODOLFO BECERRA BAZÁN / ESPERANZA A. ARRIBASPLATA",
    tp: "NATURAL",
    cond: "PROPIETARIO",
    rlegal: "ABG. DIANA MONTERO",
    rtec: "ING. MICHEL CHINCHAY",
    part: "11149239",
    m2: "1,068.00",
    ha: "0.1068",
    afec: "PARCIAL",
    valor: "541,308.00",
    fres: "20/04/2022",
    nres: "121-2022 MTC/01.02",
    per: "2022",
    pago: "PENDIENTE",
    estado: "NO",
    acto: "INDEPENDIZACIÓN Y TRANSFERENCIA",
    ofi: "CAJAMARCA",
    titulo: "—",
    ftit: "—",
    etit: "OBSERVADO",
    finsc: "—",
    pind: "—",
    edd: "SI",
    fr: "NO",
    acta: "NO",
    trans: "EN TRÁMITE",
    com: "PENDIENTE LEVANTAR OBSERVACIONES",
  },
];

export function FullPrediosTable({
  rows: sourceRows = predioRows,
  selectedCodigo,
  onSelectCodigo,
  tracking = false,
  onSelectTrackingStage,
}: {
  rows?: PredioRow[];
  selectedCodigo?: string | null;
  onSelectCodigo?: (codigo: string) => void;
  tracking?: boolean;
  onSelectTrackingStage?: (row: PredioRow, stageIndex: number) => void;
}) {
  const [filters, setFilters] = useState<Record<string, Set<string>>>({});
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const columns = useMemo(
    () => (tracking ? [...BASE_COLUMNS, ...TRACKING_COLUMNS] : BASE_COLUMNS),
    [tracking],
  );

  const groups = useMemo(() => {
    const out: { group: keyof typeof GROUPS; span: number }[] = [];
    let cur: keyof typeof GROUPS | null = null;
    for (const c of columns) {
      if (cur !== c.group) {
        out.push({ group: c.group, span: 1 });
        cur = c.group;
      } else {
        out[out.length - 1].span += 1;
      }
    }
    return out;
  }, [columns]);

  const rows = useMemo(() => {
    return sourceRows.filter((r) => {
      // search
      if (search) {
        const hay = Object.values(r).join(" ").toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      for (const [k, sel] of Object.entries(filters)) {
        if (sel.size === 0) continue;
        if (sel.has(r[k] ?? "")) return false; // excluded values
      }
      return true;
    });
  }, [filters, search, sourceRows]);

  const distinct = (key: string) => Array.from(new Set(sourceRows.map((r) => r[key] ?? ""))).sort();

  useEffect(() => {
    if (!selectedCodigo) return;
    rowRefs.current[selectedCodigo]?.scrollIntoView({ block: "nearest" });
  }, [rows, selectedCodigo]);

  // sticky offsets: N° (50) + Código de predio is the 3rd col; freeze N° and Código.
  // We freeze: col 0 (N°, width 50) and col 2 (Código, width 220). Nombre del Proyecto is between — to keep "Código de predio" frozen as requested, freeze cols 0,1,2.
  const leftOffsets: number[] = [];
  let acc = 0;
  for (let i = 0; i < 3; i++) {
    leftOffsets.push(acc);
    acc += columns[i].width;
  }
  const frozenCount = 3;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-2 flex items-center gap-2 border-b border-[#e5e7eb] bg-white">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en toda la tabla"
            className="w-full pl-7 pr-7 py-1.5 text-[12px] border border-[#e5e7eb] rounded outline-none focus:border-[#dc2626]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151]"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <span className="text-[12px] text-[#6b7280]">
          {rows.length} de {sourceRows.length} registros
        </span>
        {tracking && (
          <span className="rounded border border-orange-300 bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-800">
            Plazo técnico total: {FULL_PREDIO_TRACKING_TARGET_DAYS} días
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto relative">
        <table
          className="text-[11.5px] border-separate border-spacing-0"
          style={{ minWidth: columns.reduce((s, c) => s + c.width, 0) }}
        >
          <thead>
            {/* Group row */}
            <tr>
              {groups.map((g, gi) => {
                const groupCols = columns.filter((_, i) => {
                  const before = groups.slice(0, gi).reduce((s, x) => s + x.span, 0);
                  return i >= before && i < before + g.span;
                });
                const minW = groupCols.reduce((s, c) => s + c.width, 0);
                return (
                  <th
                    key={g.group + gi}
                    colSpan={g.span}
                    className="px-2 py-1.5 text-center font-semibold border border-white sticky top-0 z-30"
                    style={{
                      background: GROUPS[g.group].color,
                      color: GROUPS[g.group].text,
                      minWidth: minW,
                    }}
                  >
                    {GROUPS[g.group].label}
                  </th>
                );
              })}
            </tr>
            {/* Column header row */}
            <tr>
              {columns.map((c, ci) => {
                const isFrozen = ci < frozenCount;
                return (
                  <th
                    key={c.key}
                    className="px-2 py-1.5 text-left font-semibold border-r border-b border-[#e5e7eb] sticky z-20 align-top"
                    style={{
                      width: c.width,
                      minWidth: c.width,
                      background: c.group === "seg" ? "#111827" : "#f3f4f6",
                      color: c.group === "seg" ? "#ffffff" : "#1f2937",
                      top: 30, // height of group row
                      left: isFrozen ? leftOffsets[ci] : undefined,
                      position: "sticky",
                      zIndex: isFrozen ? 40 : 20,
                      boxShadow: isFrozen && ci === frozenCount - 1 ? "2px 0 0 #d1d5db" : undefined,
                    }}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="leading-tight whitespace-normal">{c.label}</span>
                      {c.group !== "seg" && (
                        <button
                          onClick={() => setOpenFilter(openFilter === c.key ? null : c.key)}
                          className={`shrink-0 size-5 rounded flex items-center justify-center hover:bg-[#e5e7eb] ${filters[c.key]?.size ? "text-[#dc2626]" : "text-[#6b7280]"}`}
                          title="Filtrar"
                        >
                          <Filter size={11} />
                        </button>
                      )}
                    </div>
                    {openFilter === c.key && (
                      <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setOpenFilter(null)} />
                        <div className="absolute top-full right-0 mt-1 z-[70]">
                          <ColumnFilter
                            values={distinct(c.key)}
                            selected={filters[c.key] ?? new Set()}
                            onChange={(next) =>
                              setFilters((f) => {
                                const copy = { ...f };
                                if (next.size === 0) delete copy[c.key];
                                else copy[c.key] = next;
                                return copy;
                              })
                            }
                          />
                        </div>
                      </>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const isSelected = selectedCodigo === r.codigo;
              return (
                <tr
                  key={r.codigo + i}
                  ref={(node) => {
                    if (node && !rowRefs.current[r.codigo]) rowRefs.current[r.codigo] = node;
                  }}
                  onClick={() => onSelectCodigo?.(r.codigo)}
                  className={`${isSelected ? "bg-[#fef3c7]" : i % 2 ? "bg-[#f9fafb]" : "bg-white"} cursor-pointer hover:bg-[#fef2f2]`}
                >
                  {columns.map((c, ci) => {
                    const isFrozen = ci < frozenCount;
                    const bg = isSelected ? "#fef3c7" : i % 2 ? "#f9fafb" : "#ffffff";
                    let content: ReactNode = r[c.key];
                    if (c.key === "__act") {
                      content = (
                        <PredioActions
                          codigoPredio={r.codigo}
                          condicionPredio={r.condicionPredio}
                        />
                      );
                    } else if (c.key === "n") {
                      content = i + 1;
                    } else if (c.key === "__track_start") {
                      content = (
                        <span className="font-semibold tabular-nums">
                          {formatFullPredioTrackingDate(fullPredioTrackingStart(r))}
                        </span>
                      );
                    } else if (c.key.startsWith("__track_") && /^__track_\d+$/.test(c.key)) {
                      const stageIndex = Number(c.key.replace("__track_", ""));
                      const timing = fullPredioTrackingStageTiming(r, stageIndex);
                      const observed =
                        timing.condition === "Etapa actual" &&
                        /OBSERV|VENCID/.test(`${r.etit} ${r.trans}`.toUpperCase());
                      content = (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onSelectTrackingStage?.(r, stageIndex);
                          }}
                          title={`${FULL_PREDIO_TRACKING_STAGES[stageIndex].label}: ${timing.condition}. ${timing.days ?? 0} días / meta ${FULL_PREDIO_TRACKING_STAGES[stageIndex].targetDays} días`}
                          className={`relative flex h-8 w-full items-center justify-center overflow-hidden ${
                            timing.condition === "Completada"
                              ? "bg-sky-400 text-sky-950"
                              : timing.condition === "Etapa actual"
                                ? observed
                                  ? "bg-red-400 text-white"
                                  : "bg-amber-400 text-amber-950"
                                : "bg-white text-slate-300"
                          }`}
                        >
                          {timing.condition === "Completada" ? (
                            <CheckCircle2 size={11} />
                          ) : timing.condition === "Etapa actual" ? (
                            observed ? (
                              <AlertTriangle size={11} />
                            ) : (
                              <Clock3 size={11} />
                            )
                          ) : (
                            <span className="size-1 rounded-full bg-slate-200" />
                          )}
                          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-orange-500" />
                        </button>
                      );
                    } else if (c.key === "__track_progress") {
                      content = `${(((fullPredioTrackingStageIndex(r) + 1) / FULL_PREDIO_TRACKING_STAGES.length) * 100).toFixed(1)}%`;
                    } else if (c.key === "__track_days") {
                      const days = fullPredioTrackingProcessDays(r);
                      content = (
                        <span
                          className={`rounded-full px-2 py-1 font-bold tabular-nums ${
                            days > FULL_PREDIO_TRACKING_TARGET_DAYS
                              ? "bg-red-100 text-red-700"
                              : days >= FULL_PREDIO_TRACKING_TARGET_DAYS * 0.8
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {days} días
                        </span>
                      );
                    } else if (c.key === "__track_deviation") {
                      const deviation =
                        fullPredioTrackingProcessDays(r) - FULL_PREDIO_TRACKING_TARGET_DAYS;
                      content = (
                        <b className={deviation > 0 ? "text-red-700" : "text-emerald-700"}>
                          {deviation > 0 ? "+" : ""}
                          {deviation} d
                        </b>
                      );
                    }
                    return (
                      <td
                        key={c.key}
                        className={`${c.key.startsWith("__track_") && /^__track_\d+$/.test(c.key) ? "p-0" : "px-2 py-1"} border-r border-b border-[#e5e7eb] align-top ${c.mono ? "font-mono" : ""}`}
                        style={{
                          width: c.width,
                          minWidth: c.width,
                          textAlign: c.align ?? "left",
                          position: isFrozen ? "sticky" : undefined,
                          left: isFrozen ? leftOffsets[ci] : undefined,
                          background: isFrozen ? bg : undefined,
                          zIndex: isFrozen ? 10 : undefined,
                          boxShadow:
                            isFrozen && ci === frozenCount - 1 ? "2px 0 0 #d1d5db" : undefined,
                          color: c.key === "n" ? "#dc2626" : "#1f2937",
                          fontWeight: c.key === "n" ? 600 : 400,
                        }}
                      >
                        <div className="whitespace-normal leading-tight">{content}</div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-[#9ca3af]">
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
