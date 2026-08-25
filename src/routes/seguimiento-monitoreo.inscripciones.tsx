import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Eraser, Layers, MapPinned, Plus } from "lucide-react";
import { AppSidebar } from "../components/AppSidebar";
import { ChartExplanation } from "../components/ChartExplanation";

export const Route = createFileRoute("/seguimiento-monitoreo/inscripciones")({
  head: () => ({ meta: [{ title: "Inscripción registral de predios" }] }),
  component: TableroInscripcionesPage,
});

const RED = "#b7070b";
const BLUE = "#2369c9";
const AMBER = "#f0a400";
const PURPLE = "#8135d2";

const topFilters = [
  "Expediente físico recibido",
  "Formulario registral o fe de entrega",
  "Acta de aceptación",
  "Entrega a la oficina patrimonial (OPAT)",
  "Estado del título registral",
  "Estado de inscripción",
  "Modalidad de adquisición",
  "Estado de recepción documental",
];

const rows = [
  [
    "AERO-JAUJA-PR-0542T",
    "1787-2024-MTC/20",
    "TRANSFERENCIA INTERESTATAL",
    "ESTADO",
    "Inscrito",
    "Completa",
    "Completa",
    "Entregado",
  ],
  [
    "AERO-JAUJA-S01-120401-PR-0098",
    "0456-2024-MTC/20",
    "TRATO DIRECTO",
    "ELIO ROMILIA PALACIOS NUNEZ DE P",
    "En tramite",
    "Completa",
    "Completa",
    "Pendiente",
  ],
  [
    "AERO-JAUJA-0088",
    "2828-2024-MTC/20",
    "TRATO DIRECTO",
    "COMUNIDAD CAMPESINA DE HUERTAS",
    "Inscrito",
    "Completa",
    "Completa",
    "Entregado",
  ],
  [
    "AERO-JAUJA-PR-0654",
    "3832-2024-MTC/20",
    "TRATO DIRECTO",
    "MANUEL DANTE HUARIPATA",
    "No inscrito",
    "Pendiente",
    "Completa",
    "Pendiente",
  ],
  [
    "AERO-JAUJA-PR-0052",
    "061-2024-MTC/20",
    "TRATO DIRECTO",
    "ANA JOSEFINA QUISPE",
    "En tramite",
    "Completa",
    "Completa",
    "Pendiente",
  ],
  [
    "AERO-JAUJA-PR-0556",
    "0491-2024-MTC/20",
    "TRATO DIRECTO",
    "COMUNIDAD CAMPESINA DE HUERTAS",
    "Inscrito",
    "Completa",
    "Completa",
    "Entregado",
  ],
  [
    "AERO-JAUJA-PR-0161",
    "1130-2024-MTC/20",
    "CORPORACION",
    "CESAR AUGUSTO CONDOR",
    "En tramite",
    "Pendiente",
    "Completa",
    "Pendiente",
  ],
  [
    "AERO-JAUJA-PR-0612",
    "1129-2024-MTC/20",
    "COPIA DIRECTA",
    "JUAN FARIAS CALDERON",
    "Inscrito",
    "Completa",
    "Completa",
    "Entregado",
  ],
];

const estadoTitulo = [
  ["En calificación registral", "168"],
  ["Inscrito", "279"],
  ["No corresponde", "5"],
  ["Pendiente de presentación", "44"],
];

const recepcion = [
  ["Expediente físico completo", "213"],
  ["Expediente digital completo", "226"],
  ["Documentación pendiente", "42"],
  ["Documentación observada", "15"],
];

const transferencia = [
  ["Pendiente de entrega", "185"],
  ["Predio recibido por OPAT", "276"],
  ["Predio y expediente recibidos por OPAT", "35"],
];

const resumen = [
  ["Inscripción registral", "37", "73", "238", "143", "5", "496"],
  ["Recepción de documentación física", "42", "86", "215", "125", "8", "476"],
  ["Recepción de documentación digital", "29", "68", "198", "133", "6", "434"],
  ["Entrega a la oficina patrimonial", "21", "49", "154", "96", "4", "324"],
];

function TableroInscripcionesPage() {
  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-auto p-2">
        <div className="min-h-[calc(100vh-16px)]">
          <section className="min-w-0 rounded-md bg-white shadow-sm">
            <Header />
            <FilterBand />
            <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-2 p-2">
              <div className="min-w-0">
                <YearBand />
                <MapPanel />
                <DetailTable />
              </div>
              <RightPanel />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="grid grid-cols-[minmax(340px,1fr)_280px_145px_105px] items-center gap-3 border-b px-4 py-3 text-[11px]">
      <div>
        <h1 className="text-[19px] font-semibold text-slate-900">
          Inscripción registral de predios
        </h1>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Verifica la presentación del título, la documentación recibida y la entrega del expediente
          a la oficina patrimonial.
        </p>
        <ChartExplanation>
          Morado significa inscrito, azul en trámite y amarillo pendiente de inscripción.
        </ChartExplanation>
      </div>
      <Info label="Proyecto seleccionado" value="Aeropuerto Internacional de Jauja" />
      <Info label="Periodo analizado" value="Octubre de 2025" />
      <button className="flex h-9 items-center justify-center gap-2 rounded border border-[#d71919] text-[11px] font-bold text-[#d71919]">
        <Eraser size={15} /> Restablecer
      </button>
    </header>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[9px] text-gray-500">{label}</div>
      <div className="mt-0.5 font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function FilterBand() {
  return (
    <div className="monitor-filter-band grid grid-cols-8 gap-1 bg-[#b7070b] px-2 py-1">
      {topFilters.map((filter) => (
        <label key={filter} className="min-w-0 text-white">
          <span className="block truncate text-[9px] font-bold">{filter}</span>
          <span className="mt-1 flex h-7 items-center justify-between rounded-sm bg-white px-2 text-[10px] font-medium text-gray-700">
            Todas <ChevronDown size={12} />
          </span>
        </label>
      ))}
    </div>
  );
}

function YearBand() {
  return (
    <div className="mb-2 grid grid-cols-[150px_repeat(5,1fr)] gap-1">
      <button className="rounded bg-white px-3 py-2 text-left text-[11px] font-semibold shadow-sm">
        Año de presentación
      </button>
      {["2021", "2022", "2023", "2024", "2025"].map((year) => (
        <button
          key={year}
          className={`rounded px-3 py-2 text-[11px] font-bold shadow-sm ${year === "2025" ? "bg-[#b7070b] text-white" : "bg-white text-gray-700"}`}
        >
          {year}
        </button>
      ))}
    </div>
  );
}

function MapPanel() {
  return (
    <div className="relative h-[435px] overflow-hidden rounded-md border bg-[#d9d0bf] shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,.35),transparent_26%),linear-gradient(35deg,rgba(85,68,40,.35),transparent_35%),linear-gradient(135deg,rgba(30,80,45,.24),transparent_40%)]" />
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "linear-gradient(30deg, transparent 48%, rgba(255,255,255,.65) 49%, rgba(255,255,255,.65) 50%, transparent 51%), linear-gradient(115deg, transparent 48%, rgba(255,255,255,.45) 49%, rgba(255,255,255,.45) 50%, transparent 51%)",
          backgroundSize: "110px 90px",
        }}
      />
      <div className="absolute left-[22%] top-[6%] h-[82%] w-[38%] rotate-[-22deg]">
        {Array.from({ length: 52 }).map((_, index) => {
          const x = 8 + (index % 7) * 12 + ((index * 5) % 7);
          const y = 3 + Math.floor(index / 7) * 11;
          const colors = [PURPLE, BLUE, AMBER];
          return (
            <div
              key={index}
              className="absolute border border-white/90 shadow-sm"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${8 + (index % 3) * 2}%`,
                height: `${7 + (index % 4)}%`,
                background: colors[index % colors.length],
              }}
            />
          );
        })}
        <div className="absolute left-[3%] top-[2%] h-[96%] w-[88%] border-2 border-[#ffe600]" />
      </div>
      <div className="absolute left-3 top-3 max-w-[310px] rounded-md bg-white/95 p-2 shadow">
        <div className="text-[11px] font-semibold text-slate-800">Ubicación y estado registral</div>
        <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
          Cada polígono representa un predio y su color indica el estado de inscripción.
        </p>
      </div>
      <div className="absolute left-3 top-20 grid gap-2">
        <button className="flex size-9 items-center justify-center rounded bg-white shadow">
          <Layers size={17} />
        </button>
        <button className="flex size-9 items-center justify-center rounded bg-white shadow">
          <MapPinned size={17} />
        </button>
      </div>
      <button className="absolute left-3 top-44 rounded bg-white px-3 py-2 text-[10px] font-semibold shadow">
        Capas del mapa <ChevronDown size={10} className="inline" />
      </button>
      <div className="absolute right-3 top-3 grid overflow-hidden rounded bg-white shadow">
        <button className="flex size-8 items-center justify-center border-b">
          <Plus size={17} />
        </button>
        <button className="flex size-8 items-center justify-center text-[18px] font-bold">-</button>
      </div>
      <button className="absolute right-3 top-24 flex size-8 items-center justify-center rounded bg-white shadow">
        <MapPinned size={16} />
      </button>
      <div className="absolute bottom-12 right-7 rounded bg-white p-2 text-[10px] shadow">
        <div className="mb-1 font-bold">Leyenda</div>
        <Legend color={PURPLE} label="Inscrito" />
        <Legend color={BLUE} label="En trámite registral" />
        <Legend color={AMBER} label="Pendiente de inscripción" />
      </div>
      <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between text-[9px] text-white/90">
        <span>© mapbox</span>
        <span>© Mapbox © OpenStreetMap Improve this map</span>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="inline-block size-2.5 rounded-sm" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}

function DetailTable() {
  return (
    <div className="mt-2 overflow-hidden rounded-md border bg-white shadow-sm">
      <div className="bg-[#b7070b] py-1 text-center text-[10px] font-bold text-white">
        Predios y estado registral
      </div>
      <div className="px-3 pt-2">
        <ChartExplanation>
          Consulte el código para identificar el predio y revise de izquierda a derecha su título,
          documentación y entrega a la oficina patrimonial.
        </ChartExplanation>
      </div>
      <div className="overflow-auto">
        <table className="min-w-[900px] w-full text-[9px]">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              {[
                "Código del predio",
                "N.° de expediente",
                "Modalidad de adquisición",
                "Sujeto pasivo o entidad",
                "Estado registral",
                "Expediente físico",
                "Expediente digital",
                "Entrega a OPAT",
              ].map((head) => (
                <th key={head} className="px-2 py-2 font-bold">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-t">
                {row.map((cell, index) => (
                  <td key={`${row[0]}-${index}`} className="px-2 py-1">
                    {index >= 4 ? <StatusBadge value={cell} /> : readableTableValue(cell, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t px-3 py-2 text-[10px] text-gray-500">
        <span>Mostrando 1 a 8 de 496 registros</span>
        <span className="flex items-center gap-2">
          ‹ <b className="rounded bg-[#b7070b] px-2 py-1 text-white">1</b> 2 3 ... 63 ›{" "}
          <select className="rounded border px-2 py-1">
            <option>10 por página</option>
          </select>
        </span>
      </div>
    </div>
  );
}

function readableTableValue(value: string, columnIndex: number) {
  if (columnIndex === 3 && value === "ESTADO") return "Estado peruano";
  if (columnIndex !== 2) return value;
  const modalities: Record<string, string> = {
    "TRANSFERENCIA INTERESTATAL": "Transferencia de predio estatal",
    "TRATO DIRECTO": "Trato directo",
    CORPORACION: "Corporación",
    "COPIA DIRECTA": "Copia directa",
  };
  return modalities[value] ?? value;
}

function StatusBadge({ value }: { value: string }) {
  const displayValue =
    value === "En tramite" ? "En trámite" : value === "No inscrito" ? "No inscrito" : value;
  const color =
    value === "Inscrito" || value === "Completa"
      ? value === "Inscrito"
        ? "bg-purple-100 text-purple-700"
        : "bg-emerald-100 text-emerald-700"
      : value === "En tramite"
        ? "bg-blue-100 text-blue-700"
        : value === "No inscrito"
          ? "bg-amber-100 text-amber-700"
          : value === "Entregado"
            ? "bg-amber-100 text-amber-700"
            : "bg-gray-100 text-gray-700";
  return (
    <span className={`rounded px-2 py-0.5 text-[8px] font-bold ${color}`}>{displayValue}</span>
  );
}

function RightPanel() {
  return (
    <aside className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        <Counter label="Total de predios" value="496" />
        <Counter label="Inscritos" value="279" tone="purple" />
        <Counter label="En trámite" value="167" tone="blue" />
        <Counter label="Pendientes" value="50" tone="amber" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <SummaryCard title="Estado del título presentado" rows={estadoTitulo} total="496" />
        <SummaryCard title="Recepción documental" rows={recepcion} total="496" />
      </div>
      <SummaryCard
        title="Entrega a la oficina patrimonial (OPAT)"
        rows={transferencia}
        total="496"
      />
      <div className="monitor-advanced-section">
        <ActivityTable />
      </div>
      <div className="text-right text-[9px] text-gray-500">* Cifras actualizadas al 17/10/2025</div>
    </aside>
  );
}

function Counter({ label, value, tone = "gray" }: { label: string; value: string; tone?: string }) {
  const cls =
    tone === "purple"
      ? "text-purple-600"
      : tone === "blue"
        ? "text-blue-600"
        : tone === "amber"
          ? "text-amber-600"
          : "text-gray-700";
  return (
    <div className="rounded-md border bg-white p-2 text-center shadow-sm">
      <div className={`text-[9px] font-bold ${cls}`}>{label}</div>
      <div className="text-[28px] font-semibold text-gray-900">{value}</div>
    </div>
  );
}

const summaryExplanations: Record<string, string> = {
  "Estado del título presentado":
    "Muestra cuántos títulos están inscritos, en trámite o pendientes de presentación registral.",
  "Recepción documental":
    "Compara los expedientes con documentación completa, incompleta o todavía no recibida.",
  "Entrega a la oficina patrimonial (OPAT)":
    "Indica cuántos predios y expedientes fueron recibidos por la oficina patrimonial y cuántos continúan pendientes.",
};

function SummaryCard({ title, rows, total }: { title: string; rows: string[][]; total: string }) {
  return (
    <div className="overflow-hidden rounded-md border bg-white shadow-sm">
      <div className="bg-[#b7070b] py-1 text-center text-[10px] font-bold text-white">{title}</div>
      <div className="px-2 pt-1">
        <ChartExplanation>{summaryExplanations[title]}</ChartExplanation>
      </div>
      <table className="w-full text-[10px]">
        <tbody>
          {rows.map(([name, value]) => (
            <tr key={name} className="border-b">
              <td className="px-2 py-1">{name}</td>
              <td className="px-2 py-1 text-right font-semibold">{value}</td>
            </tr>
          ))}
          <tr className="font-bold text-[#b7070b]">
            <td className="px-2 py-1">TOTAL</td>
            <td className="px-2 py-1 text-right">{total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ActivityTable() {
  return (
    <div className="overflow-hidden rounded-md border bg-white shadow-sm">
      <div className="bg-[#b7070b] py-1 text-center text-[10px] font-bold text-white">
        Resumen anual de actividades
      </div>
      <table className="w-full text-[9px]">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {["Actividad", "2021", "2022", "2023", "2024", "2025", "Total"].map((head) => (
              <th key={head} className="px-1 py-2 text-right first:text-left">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resumen.map((row) => (
            <tr key={row[0]} className="border-t">
              {row.map((cell, index) => (
                <td
                  key={`${row[0]}-${index}`}
                  className={`px-1 py-2 ${index > 0 ? "text-right" : ""}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t font-bold text-[#b7070b]">
            {["TOTAL", "129", "276", "805", "497", "23", "1.730"].map((cell, index) => (
              <td key={cell} className={`px-1 py-2 ${index > 0 ? "text-right" : ""}`}>
                {cell}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
