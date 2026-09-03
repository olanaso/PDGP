import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Download,
  Eye,
  FileDown,
  FileSpreadsheet,
  FileText,
  Landmark,
  LoaderCircle,
  Search,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute(
  "/proyectos/$projectId/predios/$codigo/levantamiento-informacion-tecnica_/partidas-registrales",
)({
  head: () => ({
    meta: [
      { title: "Partidas registrales" },
      {
        name: "description",
        content:
          "Consulta de partidas registrales por oficina y número de partida, revisión de asientos y descarga en PDF.",
      },
    ],
  }),
  component: PartidasRegistralesPage,
});

const RED = "#dc2626";
const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] text-gray-800 outline-none transition focus:border-[#dc2626] focus:ring-1 focus:ring-red-100";

const offices = [
  "CHIMBOTE",
  "AREQUIPA",
  "CAJAMARCA",
  "CUSCO",
  "HUANCAYO",
  "IQUITOS",
  "LIMA",
  "PIURA",
  "TRUJILLO",
];

const addressByOffice: Record<string, string> = {
  CHIMBOTE: "AV. JOSÉ PARDO N.° 1010 - CHIMBOTE",
  AREQUIPA: "CALLE SAN FRANCISCO N.° 302 - AREQUIPA",
  CAJAMARCA: "JR. TARAPACÁ N.° 552 - CAJAMARCA",
  CUSCO: "AV. MICAELA BASTIDAS N.° 356 - CUSCO",
  HUANCAYO: "JR. AREQUIPA N.° 240 - HUANCAYO",
  IQUITOS: "JR. ARICA N.° 564 - IQUITOS",
  LIMA: "AV. EDGARDO REBAGLIATI N.° 561 - JESÚS MARÍA",
  PIURA: "AV. LORETO N.° 140 - PIURA",
  TRUJILLO: "AV. LARCO N.° 1212 - TRUJILLO",
};

type RegistryResult = {
  id: string;
  titular: string;
  zona: string;
  oficina: string;
  partida: string;
  estado: "ACTIVA" | "CERRADA";
  registro: string;
  libro: string;
  direccion: string;
  asientoCount: number;
};

type RegistrySeat = {
  id: string;
  nro: number;
  tipo: string;
  documentId: string;
  pagina: number;
  referencia: string;
  fecha: string;
  acto: string;
};

type SavedPdf = {
  id: string;
  office: string;
  partida: string;
  seats: number[];
  fileName: string;
  savedAt: string;
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
      <label className="text-[12px] text-gray-700 sm:text-right">
        {required && <span className="text-[#dc2626]">* </span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-5 border-b border-red-100 pb-1 first:mt-0">
      <h2 className="text-[13px] font-semibold text-[#dc2626]">{children}</h2>
    </div>
  );
}

function buildResults(office: string, partida: string): RegistryResult[] {
  const normalizedOffice = office.trim().toUpperCase();
  const normalizedPartida = partida.trim().toUpperCase();
  if (!normalizedOffice || !normalizedPartida) return [];

  return [
    {
      id: `${normalizedOffice}-${normalizedPartida}-1`,
      titular: "MINISTERIO DE TRANSPORTES Y COMUNICACIONES",
      zona: normalizedOffice === "LIMA" ? "ZONA IX" : "ZONA VII",
      oficina: normalizedOffice,
      partida: normalizedPartida,
      estado: "ACTIVA",
      registro: "REGISTRO DE PREDIOS",
      libro: "PREDIOS",
      direccion: addressByOffice[normalizedOffice] ?? `OFICINA REGISTRAL DE ${normalizedOffice}`,
      asientoCount: 5,
    },
    {
      id: `${normalizedOffice}-${normalizedPartida}-2`,
      titular: "SUPERINTENDENCIA NACIONAL DE BIENES ESTATALES",
      zona: normalizedOffice === "LIMA" ? "ZONA IX" : "ZONA VII",
      oficina: normalizedOffice,
      partida: normalizedPartida,
      estado: "ACTIVA",
      registro: "REGISTRO DE INMUEBLES",
      libro: "PREDIOS",
      direccion: addressByOffice[normalizedOffice] ?? `OFICINA REGISTRAL DE ${normalizedOffice}`,
      asientoCount: 3,
    },
  ];
}

function buildSeats(result: RegistryResult): RegistrySeat[] {
  const acts = [
    "INMATRICULACIÓN",
    "TRANSFERENCIA DE DOMINIO",
    "RECTIFICACIÓN DE ÁREA Y LINDEROS",
    "ANOTACIÓN PREVENTIVA",
    "CARGAS Y GRAVÁMENES",
  ];

  return Array.from({ length: result.asientoCount }, (_, index) => ({
    id: `${result.id}-seat-${index + 1}`,
    nro: index + 1,
    tipo: "ASIENTO",
    documentId: String(index),
    pagina: index < 2 ? index + 1 : 2,
    referencia: `${result.asientoCount - index}/${result.asientoCount}`,
    fecha: `${String(index + 8).padStart(2, "0")}/08/2026`,
    acto: acts[index] ?? "MODIFICACIÓN REGISTRAL",
  }));
}

function PartidasRegistralesPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;
  const [office, setOffice] = useState("CHIMBOTE");
  const [partida, setPartida] = useState("P09075155");
  const [searchOffice, setSearchOffice] = useState("CHIMBOTE");
  const [searchPartida, setSearchPartida] = useState("P09075155");
  const [results, setResults] = useState(() => buildResults("CHIMBOTE", "P09075155"));
  const [activeResult, setActiveResult] = useState<RegistryResult | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [previewSeat, setPreviewSeat] = useState<RegistrySeat | null>(null);
  const [previewZoom, setPreviewZoom] = useState(0.78);
  const [savedPdfs, setSavedPdfs] = useState<SavedPdf[]>([]);
  const [feedback, setFeedback] = useState("");
  const [downloading, setDownloading] = useState(false);
  const storageKey = `pdgp:partidas-registrales:${projectId}:${decodedCodigo}`;
  const seats = useMemo(() => (activeResult ? buildSeats(activeResult) : []), [activeResult]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setSavedPdfs(JSON.parse(stored) as SavedPdf[]);
    } catch {
      setSavedPdfs([]);
    }
  }, [storageKey]);

  function searchRegistry() {
    const cleanOffice = office.trim().toUpperCase();
    const cleanPartida = partida.trim().toUpperCase();
    if (!cleanOffice || !cleanPartida) {
      setFeedback("Seleccione la oficina registral e ingrese el número de partida.");
      return;
    }
    setSearchOffice(cleanOffice);
    setSearchPartida(cleanPartida);
    setResults(buildResults(cleanOffice, cleanPartida));
    setFeedback("Consulta realizada. Se encontraron 2 coincidencias registrales.");
  }

  function clearSearch() {
    setOffice("");
    setPartida("");
    setSearchOffice("");
    setSearchPartida("");
    setResults([]);
    setFeedback("");
  }

  function openSeats(result: RegistryResult) {
    setActiveResult(result);
    setSelectedSeats([]);
    setPreviewSeat(null);
  }

  function toggleSeat(nro: number) {
    setSelectedSeats((current) =>
      current.includes(nro) ? current.filter((item) => item !== nro) : [...current, nro],
    );
  }

  function toggleAllSeats() {
    setSelectedSeats((current) =>
      current.length === seats.length ? [] : seats.map((seat) => seat.nro),
    );
  }

  function openSeatPreview(seat: RegistrySeat) {
    setPreviewSeat(seat);
    setPreviewZoom(0.78);
  }

  function persistPdf(record: SavedPdf) {
    const nextRecords = [record, ...savedPdfs.filter((item) => item.id !== record.id)].slice(0, 20);
    setSavedPdfs(nextRecords);
    window.localStorage.setItem(storageKey, JSON.stringify(nextRecords));
  }

  async function downloadPdf(result: RegistryResult, requestedSeats?: number[]) {
    setDownloading(true);
    try {
      const allSeats = buildSeats(result);
      const seatNumbers = requestedSeats?.length
        ? requestedSeats
        : allSeats.map((seat) => seat.nro);
      const includedSeats = allSeats.filter((seat) => seatNumbers.includes(seat.nro));
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const fileName = `partida_${sanitizeFileName(result.oficina)}_${sanitizeFileName(result.partida)}.pdf`;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(15);
      pdf.setTextColor(220, 38, 38);
      pdf.text("CONSULTA DE PARTIDA REGISTRAL", 16, 18);
      pdf.setDrawColor(220, 38, 38);
      pdf.line(16, 22, 194, 22);

      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Datos de la consulta", 16, 31);
      pdf.setFont("helvetica", "normal");
      const detailLines = [
        `Proyecto: ${projectLabel}`,
        `Predio: ${predio?.cod || decodedCodigo}`,
        `Oficina registral: ${result.oficina}`,
        `Número de partida registral: ${result.partida}`,
        `Titular: ${result.titular}`,
        `Zona registral: ${result.zona}`,
        `Estado: ${result.estado}`,
        `Registro / libro: ${result.registro} / ${result.libro}`,
        `Dirección: ${result.direccion}`,
      ];
      let y = 38;
      detailLines.forEach((line) => {
        const wrapped = pdf.splitTextToSize(line, 175) as string[];
        pdf.text(wrapped, 16, y);
        y += wrapped.length * 5;
      });

      y += 3;
      pdf.setFont("helvetica", "bold");
      pdf.text("Asientos incluidos", 16, y);
      y += 7;
      pdf.setFont("helvetica", "normal");
      includedSeats.forEach((seat) => {
        if (y > 270) {
          pdf.addPage();
          y = 18;
        }
        pdf.setFillColor(249, 250, 251);
        pdf.rect(16, y - 4, 178, 20, "F");
        pdf.text(`Asiento ${seat.nro} · ${seat.acto}`, 19, y + 1);
        pdf.text(
          `Documento ${seat.documentId} · Página ${seat.pagina} · Ref. ${seat.referencia} · ${seat.fecha}`,
          19,
          y + 7,
        );
        y += 24;
      });

      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text(
        `Documento generado por la Plataforma Digital de Gestión de Predios · ${new Date().toLocaleString("es-PE")}`,
        16,
        289,
      );
      pdf.save(fileName);

      const record: SavedPdf = {
        id: `${result.oficina}:${result.partida}`,
        office: result.oficina,
        partida: result.partida,
        seats: seatNumbers,
        fileName,
        savedAt: new Date().toISOString(),
      };
      persistPdf(record);
      setFeedback(`PDF guardado y descargado para ${result.oficina} · ${result.partida}.`);
    } finally {
      setDownloading(false);
    }
  }

  function exportResults() {
    if (!results.length) return;
    const rows = [
      ["Titular", "Zona", "Oficina", "Número Partida", "Estado", "Registro", "Libro", "Dirección"],
      ...results.map((result) => [
        result.titular,
        result.zona,
        result.oficina,
        result.partida,
        result.estado,
        result.registro,
        result.libro,
        result.direccion,
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(";")).join("\r\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `consulta_${sanitizeFileName(searchOffice)}_${sanitizeFileName(searchPartida)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function removeSaved(recordId: string) {
    const nextRecords = savedPdfs.filter((item) => item.id !== recordId);
    setSavedPdfs(nextRecords);
    window.localStorage.setItem(storageKey, JSON.stringify(nextRecords));
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Partidas registrales"
        badgeLabel="Predio"
        badgeValue={predio?.cod || decodedCodigo}
        badgeSuffix="Información base 1.7"
      />

      <main className="mx-auto max-w-[1260px] p-4">
        <section className="rounded-md border border-gray-200 bg-white px-5 py-5 shadow-sm">
          <div className="mb-4 border-b">
            <div className="inline-flex items-center gap-1.5 border-b-2 border-[#dc2626] px-3 py-1.5 text-[12px] font-medium text-[#dc2626]">
              <FileText size={14} /> Consulta SUNARP por número de partida
            </div>
          </div>

          {feedback && (
            <div className="mb-4 flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-[12px] text-green-700">
              <CheckCircle2 size={15} className="shrink-0" /> {feedback}
            </div>
          )}

          <SectionTitle>Filtros de búsqueda</SectionTitle>
          <div className="grid gap-x-8 gap-y-3 xl:grid-cols-2">
            <Field label="Oficina registral" required>
              <select
                className={inputCls}
                value={office}
                onChange={(event) => setOffice(event.target.value)}
              >
                <option value="">-- SELECCIONE --</option>
                {offices.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field label="Número de partida registral" required>
              <input
                className={inputCls}
                value={partida}
                onChange={(event) => setPartida(event.target.value.toUpperCase())}
                placeholder="Ej. P09075155"
              />
            </Field>
          </div>
          <p className="mt-2 text-right text-[10px] text-gray-500">
            La consulta se realiza con la oficina y el número de partida indicados.
          </p>
          <div className="mt-4 flex justify-end gap-2 border-t pt-3">
            <button
              type="button"
              onClick={clearSearch}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 px-4 text-[12px] hover:bg-gray-50"
            >
              <X size={14} /> Limpiar
            </button>
            <button
              type="button"
              onClick={searchRegistry}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-4 text-[12px] font-medium text-white hover:bg-[#b91c1c]"
            >
              <Search size={14} /> Buscar
            </button>
          </div>

          <SectionTitle>Resultado de la búsqueda</SectionTitle>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[11px] text-gray-500">
              {results.length
                ? `${results.length} coincidencias para ${searchOffice} · ${searchPartida}`
                : "No hay resultados para mostrar."}
            </p>
            <button
              type="button"
              onClick={exportResults}
              disabled={!results.length}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-green-600 px-3 text-[11px] font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FileSpreadsheet size={14} /> Exportar resultados
            </button>
          </div>
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="min-w-[1050px] w-full text-[11px]">
              <thead className="bg-gray-100 text-left text-gray-600">
                <tr>
                  <th className="w-16 px-2 py-2 text-center font-semibold">ASIENTOS</th>
                  <th className="px-2 py-2 font-semibold">RAZÓN SOCIAL / TITULAR</th>
                  <th className="px-2 py-2 font-semibold">ZONA</th>
                  <th className="px-2 py-2 font-semibold">OFICINA</th>
                  <th className="px-2 py-2 font-semibold">NÚMERO PARTIDA</th>
                  <th className="px-2 py-2 font-semibold">ESTADO</th>
                  <th className="px-2 py-2 font-semibold">REGISTRO</th>
                  <th className="px-2 py-2 font-semibold">LIBRO</th>
                  <th className="px-2 py-2 font-semibold">DIRECCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-t align-top hover:bg-red-50/30">
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => openSeats(result)}
                        className="inline-flex size-7 items-center justify-center rounded border border-red-200 text-[#dc2626] hover:bg-red-50"
                        title="Ver asientos"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                    <td className="px-2 py-2 font-medium text-gray-800">{result.titular}</td>
                    <td className="px-2 py-2">{result.zona}</td>
                    <td className="px-2 py-2">{result.oficina}</td>
                    <td className="px-2 py-2 font-mono font-semibold text-[#b91c1c]">
                      {result.partida}
                    </td>
                    <td className="px-2 py-2">
                      <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                        {result.estado}
                      </span>
                    </td>
                    <td className="px-2 py-2">{result.registro}</td>
                    <td className="px-2 py-2">{result.libro}</td>
                    <td className="px-2 py-2">{result.direccion}</td>
                  </tr>
                ))}
                {!results.length && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-[12px] text-gray-400">
                      Complete ambos filtros y pulse Buscar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <SectionTitle>PDF guardados por búsqueda</SectionTitle>
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="min-w-[720px] w-full text-[11px]">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-2 py-2 font-semibold">OFICINA REGISTRAL</th>
                  <th className="px-2 py-2 font-semibold">NÚMERO DE PARTIDA</th>
                  <th className="px-2 py-2 font-semibold">ASIENTOS</th>
                  <th className="px-2 py-2 font-semibold">ARCHIVO</th>
                  <th className="px-2 py-2 font-semibold">FECHA</th>
                  <th className="px-2 py-2 text-center font-semibold">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {savedPdfs.map((record) => (
                  <tr key={record.id} className="border-t">
                    <td className="px-2 py-2">{record.office}</td>
                    <td className="px-2 py-2 font-mono font-semibold">{record.partida}</td>
                    <td className="px-2 py-2">{record.seats.join(", ")}</td>
                    <td className="px-2 py-2">{record.fileName}</td>
                    <td className="px-2 py-2">{formatDateTime(record.savedAt)}</td>
                    <td className="px-2 py-2">
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const result = buildResults(record.office, record.partida)[0];
                            if (result) void downloadPdf(result, record.seats);
                          }}
                          className="inline-flex size-7 items-center justify-center rounded border border-red-200 text-[#dc2626] hover:bg-red-50"
                          title="Descargar nuevamente"
                        >
                          <Download size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSaved(record.id)}
                          className="inline-flex size-7 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50"
                          title="Quitar del registro"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!savedPdfs.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[12px] text-gray-400">
                      Los PDF descargados desde el modal quedarán registrados aquí.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {activeResult && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/45 p-4"
          onClick={() => setActiveResult(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="seat-dialog-title"
            className="max-h-[92vh] w-full max-w-[920px] overflow-y-auto rounded-lg bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-red-100 bg-white px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#dc2626]">
                  Consulta de partida registral
                </p>
                <h2 id="seat-dialog-title" className="mt-1 text-[15px] font-semibold text-gray-900">
                  Lista de asientos
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveResult(null)}
                className="inline-flex size-8 items-center justify-center rounded hover:bg-gray-100"
                aria-label="Cerrar modal"
              >
                <X size={17} />
              </button>
            </header>

            <div className="p-5">
              <div className="mb-4 grid gap-2 rounded border border-gray-200 bg-gray-50 p-3 text-[11px] sm:grid-cols-2">
                <p>
                  <span className="text-gray-500">Oficina registral:</span>{" "}
                  <strong>{activeResult.oficina}</strong>
                </p>
                <p>
                  <span className="text-gray-500">Número de partida:</span>{" "}
                  <strong className="font-mono">{activeResult.partida}</strong>
                </p>
                <p className="sm:col-span-2">
                  <span className="text-gray-500">Titular:</span>{" "}
                  <strong>{activeResult.titular}</strong>
                </p>
              </div>

              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] text-gray-500">
                  Seleccione los asientos que desea incluir en el archivo PDF.
                </p>
                <label className="inline-flex cursor-pointer items-center gap-2 text-[11px] font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={seats.length > 0 && selectedSeats.length === seats.length}
                    onChange={toggleAllSeats}
                    className="size-4 accent-[#dc2626]"
                  />
                  Seleccionar todos
                </label>
              </div>

              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="min-w-[760px] w-full text-[11px]">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold">NRO.</th>
                      <th className="px-2 py-2 text-left font-semibold">TIPO</th>
                      <th className="px-2 py-2 text-left font-semibold">ID DOCUMENTO</th>
                      <th className="px-2 py-2 text-left font-semibold">PÁGINA</th>
                      <th className="px-2 py-2 text-left font-semibold">PÁG. REFERENCIA</th>
                      <th className="px-2 py-2 text-center font-semibold">SELECCIONAR</th>
                      <th className="px-2 py-2 text-center font-semibold">VER ASIENTO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seats.map((seat) => (
                      <tr key={seat.id} className="border-t hover:bg-red-50/30">
                        <td className="px-2 py-2">{seat.nro}</td>
                        <td className="px-2 py-2">{seat.tipo}</td>
                        <td className="px-2 py-2">{seat.documentId}</td>
                        <td className="px-2 py-2">{seat.pagina}</td>
                        <td className="px-2 py-2">{seat.referencia}</td>
                        <td className="px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedSeats.includes(seat.nro)}
                            onChange={() => toggleSeat(seat.nro)}
                            className="size-4 accent-[#dc2626]"
                            aria-label={`Seleccionar asiento ${seat.nro}`}
                          />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => openSeatPreview(seat)}
                            className="inline-flex size-7 items-center justify-center rounded border border-amber-200 text-amber-700 hover:bg-amber-50"
                            title={`Ver asiento ${seat.nro}`}
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setActiveResult(null)}
                  className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 px-4 text-[12px] hover:bg-gray-50"
                >
                  <X size={14} /> Cerrar
                </button>
                <button
                  type="button"
                  disabled={downloading}
                  onClick={() => void downloadPdf(activeResult, selectedSeats)}
                  className="inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-4 text-[12px] font-medium text-white hover:bg-[#b91c1c] disabled:cursor-wait disabled:opacity-60"
                >
                  {downloading ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : selectedSeats.length ? (
                    <FileDown size={14} />
                  ) : (
                    <Download size={14} />
                  )}
                  {selectedSeats.length
                    ? `Guardar PDF (${selectedSeats.length})`
                    : "Guardar PDF completo"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {previewSeat && activeResult && (
        <div
          className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/60 p-3 sm:p-5"
          onClick={() => setPreviewSeat(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-preview-title"
            className="flex max-h-[96vh] w-full max-w-[980px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-red-100 bg-white px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#dc2626]">
                  Documento registral
                </p>
                <h2
                  id="document-preview-title"
                  className="mt-0.5 text-[14px] font-semibold text-gray-900"
                >
                  Visualización del asiento {previewSeat.nro}
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewZoom((current) => Math.max(0.55, current - 0.1))}
                  className="inline-flex size-8 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                  title="Alejar"
                >
                  <ZoomOut size={15} />
                </button>
                <span className="min-w-12 text-center text-[11px] text-gray-500">
                  {Math.round(previewZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom((current) => Math.min(1.15, current + 0.1))}
                  className="inline-flex size-8 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                  title="Acercar"
                >
                  <ZoomIn size={15} />
                </button>
                <button
                  type="button"
                  disabled={downloading}
                  onClick={() => void downloadPdf(activeResult, [previewSeat.nro])}
                  className="ml-1 inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-3 text-[11px] font-medium text-white hover:bg-[#b91c1c] disabled:opacity-60"
                >
                  {downloading ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  Descargar PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSeat(null)}
                  className="ml-1 inline-flex size-8 items-center justify-center rounded hover:bg-gray-100"
                  aria-label="Cerrar visualización"
                >
                  <X size={17} />
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-auto bg-[#4b5056] p-5 sm:p-8">
              <div
                className="relative mx-auto"
                style={{ width: 620 * previewZoom, height: 875 * previewZoom }}
              >
                <article
                  className="absolute left-0 top-0 h-[875px] w-[620px] origin-top-left overflow-hidden bg-white px-[58px] py-[45px] font-serif text-[#111827] shadow-2xl"
                  style={{ transform: `scale(${previewZoom})` }}
                >
                  <div className="pointer-events-none absolute left-[88px] top-[355px] -rotate-[48deg] select-none text-[30px] font-bold tracking-[0.22em] text-gray-300/55">
                    COPIA INFORMATIVA
                  </div>
                  <div className="pointer-events-none absolute left-[190px] top-[650px] -rotate-[48deg] select-none text-[25px] font-bold tracking-[0.18em] text-gray-300/45">
                    PUBLICIDAD REGISTRAL
                  </div>

                  <div className="flex items-start justify-between gap-8 border-b-2 border-gray-900 pb-3">
                    <div className="flex items-center gap-2">
                      <Landmark size={34} strokeWidth={1.4} className="text-[#b91c1c]" />
                      <div>
                        <p className="font-sans text-[16px] font-black tracking-tight">SUNARP</p>
                        <p className="font-sans text-[6px] font-semibold uppercase tracking-wide">
                          Superintendencia Nacional
                        </p>
                        <p className="font-sans text-[6px] font-semibold uppercase tracking-wide">
                          de los Registros Públicos
                        </p>
                      </div>
                    </div>
                    <div className="max-w-[265px] text-center text-[7px] font-bold uppercase leading-[1.45]">
                      <p>Zona registral {activeResult.zona}</p>
                      <p>Oficina registral de {activeResult.oficina}</p>
                      <p className="mt-1 text-[6px] font-normal normal-case">
                        Publicidad registral en línea
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 text-center text-[8px] font-bold uppercase leading-4">
                    <p>Registro de propiedad inmueble</p>
                    <p>Registro de predios</p>
                    <p className="mt-2 text-[10px]">Partida N.° {activeResult.partida}</p>
                  </div>

                  <div className="mt-6 border-y border-gray-500 py-2 text-center text-[8px] font-bold uppercase">
                    Asiento N.° {String(previewSeat.nro).padStart(5, "0")} — {previewSeat.acto}
                  </div>

                  <div className="mt-6 text-justify text-[9px] leading-[1.65]">
                    <p className="font-bold uppercase">Inscripción registral</p>
                    <p className="mt-3 indent-7">
                      Por el presente asiento se deja constancia de la inscripción del acto de{" "}
                      <strong>{previewSeat.acto.toLowerCase()}</strong>, correspondiente al inmueble
                      inscrito en la partida electrónica N.° {activeResult.partida}, ubicado en el
                      ámbito de la Oficina Registral de {activeResult.oficina}.
                    </p>
                    <p className="mt-3 indent-7">
                      El derecho registrado corresponde a {activeResult.titular}, conforme al título
                      archivado y a los documentos presentados para su calificación. El predio se
                      encuentra asociado en la Plataforma Digital de Gestión de Predios al código{" "}
                      <strong>{predio?.cod || decodedCodigo}</strong>.
                    </p>
                    <p className="mt-3 indent-7">
                      La presente visualización reproduce la información del documento N.°{" "}
                      {previewSeat.documentId}, página {previewSeat.pagina}, referencia{" "}
                      {previewSeat.referencia}. Fecha del asiento: {previewSeat.fecha}.
                    </p>
                    <p className="mt-3 indent-7">
                      Se extiende el asiento luego de efectuada la evaluación registral
                      correspondiente, quedando su contenido sujeto a la información obrante en el
                      archivo registral.
                    </p>
                  </div>

                  <div className="mt-12 flex justify-end">
                    <div className="w-[210px] text-center text-[7px] leading-3">
                      <div className="mx-auto mb-2 h-10 w-28 -rotate-6 rounded-[50%] border-2 border-blue-700/60 px-2 py-1 font-sans font-bold uppercase text-blue-800/70">
                        Oficina registral
                        <br />
                        {activeResult.oficina}
                      </div>
                      <div className="border-t border-gray-700 pt-1">
                        Registrador Público
                        <br />
                        Zona Registral {activeResult.zona}
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-[42px] left-[58px] right-[58px] border-t border-gray-400 pt-2 font-sans text-[6px] leading-3 text-gray-600">
                    <div className="flex justify-between">
                      <span>COPIA INFORMATIVA — NO CONSTITUYE CERTIFICADO</span>
                      <span>
                        Página {previewSeat.pagina} · Ref. {previewSeat.referencia}
                      </span>
                    </div>
                    <p>
                      Documento de visualización generado por la Plataforma Digital de Gestión de
                      Predios.
                    </p>
                  </div>
                </article>
              </div>
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-2.5">
              <p className="text-[10px] text-gray-500">
                Vista informativa del asiento seleccionado. El PDF se guarda por oficina y partida.
              </p>
              <button
                type="button"
                onClick={() => setPreviewSeat(null)}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded border border-gray-300 px-4 text-[11px] hover:bg-gray-50"
              >
                <X size={14} /> Cerrar
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

function sanitizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
