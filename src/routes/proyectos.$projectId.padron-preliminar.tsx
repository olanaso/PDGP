import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  FileSpreadsheet,
  History,
  RotateCcw,
  Save,
  Upload,
  X,
} from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/padron-preliminar")({
  head: () => ({
    meta: [
      { title: "Padron Preliminar - Importacion Excel" },
      { name: "description", content: "Importacion y validacion de padron preliminar de predios." },
    ],
  }),
  component: PadronPreliminarPage,
});

const RED = "#dc2626";
const inputCls = "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";

const TEMPLATE_COLUMNS = [
  "codigo_padron",
  "condicion_predio",
  "sujeto_pasivo",
  "tipo_persona_juridica",
  "condicion_sujeto",
  "tipo_predio",
  "area_m2",
  "latitud",
  "longitud",
  "ubicacion",
  "observaciones",
] as const;

type TemplateColumn = (typeof TEMPLATE_COLUMNS)[number];

type ImportStatus = "ok" | "error";

type PadronImportRow = Record<TemplateColumn, string> & {
  id: string;
  fila: number;
  estado: ImportStatus;
  observacionValidacion: string;
};

type ImportHistoryItem = {
  id: string;
  fecha: string;
  usuario: string;
  archivo: string;
  total: number;
  correctos: number;
  fallidos: number;
  estado: "Importado" | "Con errores";
};

const INITIAL_HISTORY: ImportHistoryItem[] = [
  {
    id: "hist-001",
    fecha: "03/07/2026 09:35",
    usuario: "Marcos Armando Soto Luis",
    archivo: "padron_preliminar_jauja_v1.xls",
    total: 18,
    correctos: 18,
    fallidos: 0,
    estado: "Importado",
  },
  {
    id: "hist-002",
    fecha: "02/07/2026 16:10",
    usuario: "Coordinacion Predial",
    archivo: "padron_preliminar_observado.xls",
    total: 24,
    correctos: 20,
    fallidos: 4,
    estado: "Con errores",
  },
];

const SAMPLE_ROWS: PadronImportRow[] = [
  createValidatedRow(
    {
      codigo_padron: "PAD-AERO-JAUJA-0001",
      condicion_predio: "PRIVADO",
      sujeto_pasivo: "BRYAN CESAR CATANO SARRO",
      tipo_persona_juridica: "NATURAL",
      condicion_sujeto: "POSEEDOR",
      tipo_predio: "RURAL",
      area_m2: "1250.45",
      latitud: "-11.78215",
      longitud: "-75.47852",
      ubicacion: "Jauja",
      observaciones: "",
    },
    2,
  ),
  createValidatedRow(
    {
      codigo_padron: "",
      condicion_predio: "ESTATAL",
      sujeto_pasivo: "MUNICIPALIDAD PROVINCIAL DE JAUJA",
      tipo_persona_juridica: "JURIDICA",
      condicion_sujeto: "PROPIETARIO",
      tipo_predio: "URBANO",
      area_m2: "840.00",
      latitud: "-11.78170",
      longitud: "-75.47796",
      ubicacion: "Sector aeropuerto",
      observaciones: "Generar codigo de padron",
    },
    3,
  ),
  createValidatedRow(
    {
      codigo_padron: "",
      condicion_predio: "",
      sujeto_pasivo: "",
      tipo_persona_juridica: "NATURAL",
      condicion_sujeto: "POSEEDOR",
      tipo_predio: "RURAL",
      area_m2: "abc",
      latitud: "",
      longitud: "",
      ubicacion: "Jauja",
      observaciones: "",
    },
    4,
  ),
];

function PadronPreliminarPage() {
  const { projectId } = Route.useParams();
  const proyecto = getProyecto(projectId);
  const projectLabel = proyecto ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}` : projectId;
  const [activeTab, setActiveTab] = useState<"importacion" | "historial">("importacion");
  const [step, setStep] = useState<"plantilla" | "validacion" | "resultado">("plantilla");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [rows, setRows] = useState<PadronImportRow[]>([]);
  const [history, setHistory] = useState<ImportHistoryItem[]>(INITIAL_HISTORY);
  const [message, setMessage] = useState("");

  const stats = useMemo(() => {
    const correctos = rows.filter((row) => row.estado === "ok").length;
    const fallidos = rows.filter((row) => row.estado === "error").length;
    return { total: rows.length, correctos, fallidos };
  }, [rows]);

  async function handleFile(file: File | null) {
    setArchivo(file);
    setMessage("");
    if (!file) {
      setRows([]);
      setStep("plantilla");
      return;
    }

    const text = await file.text();
    const parsed = parseUploadedPadron(text);
    const nextRows = parsed.length ? parsed : SAMPLE_ROWS;
    setRows(nextRows);
    setStep("validacion");
    setMessage(parsed.length ? "" : "No se pudieron leer filas del archivo; se muestra una vista de validacion referencial con observaciones.");
  }

  function handleImport() {
    if (!rows.length) return;
    const item: ImportHistoryItem = {
      id: `hist-${Date.now()}`,
      fecha: new Date().toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      usuario: "Usuario solicitante",
      archivo: archivo?.name ?? "padron_preliminar.xls",
      total: stats.total,
      correctos: stats.correctos,
      fallidos: stats.fallidos,
      estado: stats.fallidos ? "Con errores" : "Importado",
    };
    setHistory((current) => [item, ...current]);
    setStep("resultado");
    setMessage(
      stats.fallidos
        ? `Se importaron ${stats.correctos} predios correctos. ${stats.fallidos} filas quedaron observadas en el historial.`
        : `El predio ya cuenta con codigo de padron y el proceso de importacion fue registrado correctamente para ${stats.correctos} filas.`,
    );
  }

  function resetImport() {
    setArchivo(null);
    setRows([]);
    setMessage("");
    setStep("plantilla");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Padron Preliminar"
        badgeLabel="Estado"
        badgeValue={step === "resultado" ? "Importacion registrada" : "Borrador"}
      />

      <main className="p-4">
        <div className="bg-white rounded border">
          <div className="px-5 py-5">
            <div className="border-b mb-3">
              <button
                type="button"
                onClick={() => setActiveTab("importacion")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border-b-2"
                style={{ borderColor: activeTab === "importacion" ? RED : "transparent", color: activeTab === "importacion" ? RED : "#6b7280" }}
              >
                <Upload size={14} /> Importacion
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("historial")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border-b-2"
                style={{ borderColor: activeTab === "historial" ? RED : "transparent", color: activeTab === "historial" ? RED : "#6b7280" }}
              >
                <History size={14} /> Historial ({history.length})
              </button>
            </div>

            {activeTab === "importacion" ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleImport();
                }}
              >
                <SectionTitle>1. Descargar plantilla</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Formato" required>
                    <select className={selectCls} defaultValue="padron_preliminar">
                      <option value="padron_preliminar">Padron preliminar de predios</option>
                    </select>
                  </Field>
                  <Field label="Archivo modelo">
                    <button
                      type="button"
                      onClick={downloadPadronTemplate}
                      className="inline-flex h-8 items-center gap-1.5 px-3 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <Download size={14} /> Descargar Excel
                    </button>
                  </Field>
                  <Field label="Columnas requeridas" className="col-span-2">
                    <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-[11px] text-gray-700">
                      {TEMPLATE_COLUMNS.join(", ")}
                    </div>
                  </Field>
                </div>

                <SectionTitle>2. Subir archivo completado</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Archivo Excel/CSV" required>
                    <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded border border-gray-300 px-3 text-[12px] hover:bg-gray-50">
                      <Upload size={14} />
                      {archivo ? archivo.name : "Seleccionar archivo"}
                      <input
                        type="file"
                        accept=".xls,.xlsx,.csv,.txt"
                        className="hidden"
                        onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
                      />
                    </label>
                  </Field>
                  <Field label="Estado de lectura">
                    <input className={inputCls} value={rows.length ? `${rows.length} filas evaluadas` : "Pendiente"} readOnly />
                  </Field>
                </div>

                {message && (
                  <div className="mt-4 flex items-start gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                <SectionTitle>3. Validacion del padron importado</SectionTitle>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <StatCard label="Filas importadas" value={stats.total} />
                  <StatCard label="Correctas" value={stats.correctos} tone="ok" />
                  <StatCard label="Observadas" value={stats.fallidos} tone="error" />
                  <StatCard label="Habilitadas" value={stats.correctos} tone="ok" />
                </div>

                <div className="overflow-hidden rounded border border-gray-200">
                  <div className="max-h-[360px] overflow-auto">
                    <table className="w-full min-w-[1180px] text-[11px]">
                      <thead className="sticky top-0 bg-[#f3f4f6] text-left text-gray-700">
                        <tr>
                          <th className="px-2 py-2 font-semibold">Fila</th>
                          <th className="px-2 py-2 font-semibold">Codigo padron</th>
                          <th className="px-2 py-2 font-semibold">Condicion predio</th>
                          <th className="px-2 py-2 font-semibold">Sujeto pasivo</th>
                          <th className="px-2 py-2 font-semibold">Tipo persona</th>
                          <th className="px-2 py-2 font-semibold">Condicion sujeto</th>
                          <th className="px-2 py-2 font-semibold">Tipo predio</th>
                          <th className="px-2 py-2 font-semibold text-right">Area m2</th>
                          <th className="px-2 py-2 font-semibold">Latitud</th>
                          <th className="px-2 py-2 font-semibold">Longitud</th>
                          <th className="px-2 py-2 font-semibold">Observaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-2 py-1.5 font-mono text-gray-500">{row.fila}</td>
                            <td className="px-2 py-1.5 font-mono">{row.codigo_padron || generatedPadronCode(row.fila)}</td>
                            <td className="px-2 py-1.5">{row.condicion_predio}</td>
                            <td className="px-2 py-1.5">{row.sujeto_pasivo}</td>
                            <td className="px-2 py-1.5">{row.tipo_persona_juridica}</td>
                            <td className="px-2 py-1.5">{row.condicion_sujeto}</td>
                            <td className="px-2 py-1.5">{row.tipo_predio}</td>
                            <td className="px-2 py-1.5 text-right font-mono">{row.area_m2}</td>
                            <td className="px-2 py-1.5 font-mono">{row.latitud}</td>
                            <td className="px-2 py-1.5 font-mono">{row.longitud}</td>
                            <td className="px-2 py-1.5">
                              <span className={row.estado === "ok" ? "text-green-700" : "text-red-700"}>
                                {row.observacionValidacion}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {!rows.length && (
                          <tr>
                            <td colSpan={11} className="px-4 py-8 text-center text-[12px] text-gray-400">
                              Descargue la plantilla, completela y suba el archivo para ver la validacion.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {step === "resultado" && (
                  <div className="mt-4 flex items-start gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-[12px] text-green-900">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
                  <button
                    type="button"
                    onClick={resetImport}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <RotateCcw size={14} /> Limpiar
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("historial")}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Eye size={14} /> Ver historial
                  </button>
                  <button
                    type="submit"
                    disabled={!rows.length || !stats.correctos}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: RED }}
                  >
                    <Save size={14} /> Importar padron
                  </button>
                </div>
              </form>
            ) : (
              <HistoryTable history={history} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b pb-1 mb-3 mt-4 first:mt-0">
      <h3 className="text-[13px] font-semibold" style={{ color: RED }}>{children}</h3>
    </div>
  );
}

function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-[180px_1fr] items-center gap-2 ${className}`}>
      <label className="text-[12px] text-right text-gray-700">
        {required && <span style={{ color: RED }}>* </span>}{label}
      </label>
      {children}
    </div>
  );
}

function StatCard({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "neutral" | "ok" | "error" }) {
  const color = tone === "ok" ? "#16a34a" : tone === "error" ? "#dc2626" : "#374151";
  return (
    <div className="rounded border border-gray-200 bg-white p-3">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="mt-0.5 text-[20px] font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function HistoryTable({ history }: { history: ImportHistoryItem[] }) {
  return (
    <>
      <SectionTitle>Historial de importaciones</SectionTitle>
      <div className="overflow-hidden rounded border border-gray-200">
        <table className="w-full text-[12px]">
          <thead className="bg-[#f3f4f6] text-left text-gray-700">
            <tr>
              <th className="px-3 py-2 font-semibold">Fecha</th>
              <th className="px-3 py-2 font-semibold">Usuario</th>
              <th className="px-3 py-2 font-semibold">Archivo</th>
              <th className="px-3 py-2 font-semibold text-right">Total</th>
              <th className="px-3 py-2 font-semibold text-right">Correctos</th>
              <th className="px-3 py-2 font-semibold text-right">Fallidos</th>
              <th className="px-3 py-2 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2">{item.fecha}</td>
                <td className="px-3 py-2">{item.usuario}</td>
                <td className="px-3 py-2 font-mono text-[11px]">{item.archivo}</td>
                <td className="px-3 py-2 text-right font-semibold">{item.total}</td>
                <td className="px-3 py-2 text-right font-semibold text-green-700">{item.correctos}</td>
                <td className="px-3 py-2 text-right font-semibold text-red-700">{item.fallidos}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${item.estado === "Importado" ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                    {item.estado === "Importado" ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                    {item.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function createValidatedRow(input: Record<TemplateColumn, string>, index: number): PadronImportRow {
  const observations = validateRow(input);
  return {
    ...input,
    id: `${index}-${input.codigo_padron || input.sujeto_pasivo || "fila"}`,
    fila: index,
    estado: observations.length ? "error" : "ok",
    observacionValidacion: observations.length ? observations.join("; ") : "Correcto para importar",
  };
}

function validateRow(row: Record<TemplateColumn, string>) {
  const observations: string[] = [];
  const required: TemplateColumn[] = [
    "condicion_predio",
    "sujeto_pasivo",
    "tipo_persona_juridica",
    "condicion_sujeto",
    "tipo_predio",
    "area_m2",
  ];
  required.forEach((key) => {
    if (!row[key]?.trim()) observations.push(`${key} requerido`);
  });
  const area = Number(row.area_m2?.replace(",", "."));
  if (row.area_m2 && (!Number.isFinite(area) || area <= 0)) observations.push("area_m2 invalida");
  if (row.latitud && !Number.isFinite(Number(row.latitud.replace(",", ".")))) observations.push("latitud invalida");
  if (row.longitud && !Number.isFinite(Number(row.longitud.replace(",", ".")))) observations.push("longitud invalida");
  return observations;
}

function parseUploadedPadron(text: string) {
  const htmlRows = parseHtmlTable(text);
  if (htmlRows.length) return rowsFromMatrix(htmlRows);
  const delimiter = text.includes("\t") ? "\t" : text.includes(";") ? ";" : ",";
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  return rowsFromMatrix(lines.map((line) => splitDelimited(line, delimiter)));
}

function rowsFromMatrix(matrix: string[][]) {
  const headers = matrix[0]?.map(normalizeHeader) ?? [];
  const missingBase = TEMPLATE_COLUMNS.filter((column) => !headers.includes(column));
  if (missingBase.length > TEMPLATE_COLUMNS.length - 3) return [];
  return matrix.slice(1).map((cells, index) => {
    const row = Object.fromEntries(TEMPLATE_COLUMNS.map((column) => [column, ""])) as Record<TemplateColumn, string>;
    headers.forEach((header, cellIndex) => {
      if (TEMPLATE_COLUMNS.includes(header as TemplateColumn)) row[header as TemplateColumn] = cleanCell(cells[cellIndex] ?? "");
    });
    return createValidatedRow(row, index + 2);
  });
}

function normalizeHeader(value: string) {
  return cleanCell(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function cleanCell(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
}

function splitDelimited(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') quoted = !quoted;
    else if (char === delimiter && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function parseHtmlTable(text: string) {
  if (!text.includes("<table")) return [];
  const rows = [...text.matchAll(/<tr[\s\S]*?<\/tr>/gi)];
  return rows.map((rowMatch) => {
    const cells = [...rowMatch[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)];
    return cells.map((cell) => cleanCell(cell[1] ?? ""));
  }).filter((row) => row.length);
}

function generatedPadronCode(rowNumber: number) {
  return `PAD-PREL-${String(rowNumber - 1).padStart(5, "0")}`;
}

function downloadPadronTemplate() {
  const example = [
    "PAD-AERO-JAUJA-0001",
    "PRIVADO",
    "NOMBRE DEL SUJETO PASIVO",
    "NATURAL",
    "PROPIETARIO",
    "RURAL",
    "1000.00",
    "-11.78200",
    "-75.47800",
    "Jauja",
    "",
  ];
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <table border="1">
      <thead>
        <tr>${TEMPLATE_COLUMNS.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        <tr>${example.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>
      </tbody>
    </table>
  </body>
</html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template_padron_preliminar.xls";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
