import { Fragment, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileDown,
  Eye,
  History,
  ArrowRight,
  Loader2,
} from "lucide-react";

type ImportRow = {
  id: string;
  fila: number;
  codigoPredio: string;
  propietario: string;
  area: string;
  modalidad: string;
  estado: "ok" | "error" | "warning";
  mensaje?: string;
};

type ImportHistoryItem = {
  id: string;
  fecha: string;
  usuario: string;
  archivo: string;
  destino: "Predios" | "Padrón";
  conCodigo: boolean;
  matrizCompleta: boolean;
  total: number;
  correctos: number;
  fallidos: number;
  estado: "Completado" | "Con errores" | "Procesando";
};

const HISTORY_MOCK: ImportHistoryItem[] = [
  {
    id: "imp-001",
    fecha: "28/06/2026 14:32",
    usuario: "Jorge Aguirre Gómez",
    archivo: "predios_cajamarca_lote1.xlsx",
    destino: "Predios",
    conCodigo: true,
    matrizCompleta: true,
    total: 248,
    correctos: 245,
    fallidos: 3,
    estado: "Con errores",
  },
  {
    id: "imp-002",
    fecha: "27/06/2026 09:11",
    usuario: "María Salazar",
    archivo: "padron_legal_v2.xlsx",
    destino: "Padrón",
    conCodigo: false,
    matrizCompleta: false,
    total: 87,
    correctos: 87,
    fallidos: 0,
    estado: "Completado",
  },
  {
    id: "imp-003",
    fecha: "25/06/2026 16:48",
    usuario: "Luis Ramírez",
    archivo: "matriz_completa_tramo2.xlsx",
    destino: "Predios",
    conCodigo: true,
    matrizCompleta: true,
    total: 512,
    correctos: 498,
    fallidos: 14,
    estado: "Con errores",
  },
];

const DETALLE_MOCK: ImportRow[] = [
  { id: "r1", fila: 2, codigoPredio: "CAJ-001", propietario: "Juan Pérez", area: "1240.5", modalidad: "TRATO DIRECTO", estado: "ok" },
  { id: "r2", fila: 3, codigoPredio: "CAJ-002", propietario: "Ana Torres", area: "980.0", modalidad: "EXPROPIACIÓN", estado: "ok" },
  { id: "r3", fila: 4, codigoPredio: "", propietario: "Pedro Gómez", area: "450.2", modalidad: "TRATO DIRECTO", estado: "error", mensaje: "Código de predio requerido" },
  { id: "r4", fila: 5, codigoPredio: "CAJ-004", propietario: "Lucía Rojas", area: "—", modalidad: "TRATO DIRECTO", estado: "error", mensaje: "Área inválida o vacía" },
  { id: "r5", fila: 6, codigoPredio: "CAJ-005", propietario: "Carlos Vega", area: "2100.0", modalidad: "INVÁLIDA", estado: "warning", mensaje: "Modalidad no reconocida, será marcada como PENDIENTE" },
  { id: "r6", fila: 7, codigoPredio: "CAJ-006", propietario: "Sofía Mendoza", area: "760.8", modalidad: "PRIMERA INSCRIPCIÓN DE DOMINIO", estado: "ok" },
];

export function ImportShapeDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"nueva" | "historial">("nueva");
  const [step, setStep] = useState<"config" | "evaluacion" | "resultado">("config");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [destino, setDestino] = useState<"Predios" | "Padrón">("Predios");
  const [conCodigo, setConCodigo] = useState(true);
  const [matrizCompleta, setMatrizCompleta] = useState(false);
  const [evaluando, setEvaluando] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState<string | null>(null);

  const stats = useMemo(() => {
    const ok = DETALLE_MOCK.filter((r) => r.estado === "ok").length;
    const err = DETALLE_MOCK.filter((r) => r.estado === "error").length;
    const wa = DETALLE_MOCK.filter((r) => r.estado === "warning").length;
    return { ok, err, wa, total: DETALLE_MOCK.length };
  }, []);

  function resetForm() {
    setStep("config");
    setArchivo(null);
    setDestino("Predios");
    setConCodigo(true);
    setMatrizCompleta(false);
  }

  function handleEvaluar() {
    setEvaluando(true);
    setTimeout(() => {
      setEvaluando(false);
      setStep("evaluacion");
    }, 900);
  }

  function handleImportar() {
    setStep("resultado");
  }

  function descargarTemplate() {
    const headers = matrizCompleta
      ? ["codigo_predio", "propietario", "dni_ruc", "area_m2", "modalidad", "condicion", "ubicacion", "departamento", "provincia", "distrito", "coord_x", "coord_y", "uso", "observaciones"]
      : conCodigo
        ? ["codigo_predio", "propietario", "dni_ruc", "area_m2", "modalidad"]
        : ["propietario", "dni_ruc", "area_m2", "modalidad", "ubicacion"];
    const csv = headers.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `template_importacion_${destino.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportarDetalle(item: ImportHistoryItem, soloFallidos = false) {
    const rows = soloFallidos
      ? DETALLE_MOCK.filter((r) => r.estado === "error")
      : DETALLE_MOCK;
    const header = "fila,codigo_predio,propietario,area,modalidad,estado,mensaje\n";
    const body = rows
      .map((r) => `${r.fila},${r.codigoPredio},${r.propietario},${r.area},${r.modalidad},${r.estado},${r.mensaje ?? ""}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.archivo.replace(/\.[^.]+$/, "")}_${soloFallidos ? "fallidos" : "detalle"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          resetForm();
          setTab("nueva");
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-[#e5e7eb]">
          <DialogTitle className="flex items-center gap-2 text-[16px]">
            <FileSpreadsheet size={18} className="text-[#dc2626]" />
            Importación masiva desde Excel
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-[#e5e7eb] bg-[#f9fafb]">
          <button
            onClick={() => setTab("nueva")}
            className={`px-5 py-2.5 text-[13px] font-medium border-b-2 ${tab === "nueva" ? "border-[#dc2626] text-[#dc2626] bg-white" : "border-transparent text-[#6b7280] hover:text-[#374151]"}`}
          >
            <Upload size={13} className="inline mr-1.5" /> Nueva importación
          </button>
          <button
            onClick={() => setTab("historial")}
            className={`px-5 py-2.5 text-[13px] font-medium border-b-2 ${tab === "historial" ? "border-[#dc2626] text-[#dc2626] bg-white" : "border-transparent text-[#6b7280] hover:text-[#374151]"}`}
          >
            <History size={13} className="inline mr-1.5" /> Historial ({HISTORY_MOCK.length})
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {tab === "nueva" && (
            <div className="p-6">
              {/* Stepper */}
              <div className="flex items-center gap-2 mb-5 text-[12px]">
                {(["config", "evaluacion", "resultado"] as const).map((s, i) => {
                  const idx = ["config", "evaluacion", "resultado"].indexOf(step);
                  const active = step === s;
                  const done = i < idx;
                  const label = s === "config" ? "1. Configurar" : s === "evaluacion" ? "2. Evaluación" : "3. Importación";
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <span className={`size-6 rounded-full flex items-center justify-center text-[11px] font-semibold ${active ? "bg-[#dc2626] text-white" : done ? "bg-[#16a34a] text-white" : "bg-[#e5e7eb] text-[#6b7280]"}`}>
                        {done ? "✓" : i + 1}
                      </span>
                      <span className={active ? "font-semibold text-[#111827]" : "text-[#6b7280]"}>{label.replace(/^\d+\.\s/, "")}</span>
                      {i < 2 && <ArrowRight size={12} className="text-[#9ca3af]" />}
                    </div>
                  );
                })}
              </div>

              {step === "config" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[12px] font-semibold text-[#374151] block mb-1.5">Destino de la importación</label>
                      <div className="flex gap-2">
                        {(["Predios", "Padrón"] as const).map((d) => (
                          <button
                            key={d}
                            onClick={() => setDestino(d)}
                            className={`flex-1 px-3 py-2 rounded-md border text-[13px] ${destino === d ? "border-[#dc2626] bg-[#fef2f2] text-[#dc2626] font-medium" : "border-[#e5e7eb] hover:border-[#d1d5db]"}`}
                          >
                            {d === "Predios" ? "Lista de Predios" : "Padrón Legal"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-[#374151] block mb-1.5">Tipo de migración</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMatrizCompleta(false)}
                          className={`flex-1 px-3 py-2 rounded-md border text-[13px] ${!matrizCompleta ? "border-[#dc2626] bg-[#fef2f2] text-[#dc2626] font-medium" : "border-[#e5e7eb] hover:border-[#d1d5db]"}`}
                        >
                          Parcial
                        </button>
                        <button
                          onClick={() => setMatrizCompleta(true)}
                          className={`flex-1 px-3 py-2 rounded-md border text-[13px] ${matrizCompleta ? "border-[#dc2626] bg-[#fef2f2] text-[#dc2626] font-medium" : "border-[#e5e7eb] hover:border-[#d1d5db]"}`}
                        >
                          Matriz completa
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={conCodigo}
                        onChange={(e) => setConCodigo(e.target.checked)}
                        className="mt-0.5 accent-[#dc2626] size-4"
                      />
                      <div>
                        <div className="text-[13px] font-medium">Migrar con código de predio</div>
                        <div className="text-[11px] text-[#6b7280] mt-0.5">
                          Si está activo, el archivo debe incluir la columna <code className="bg-white px-1 rounded border">codigo_predio</code> y los registros se vincularán/actualizarán por código. De lo contrario se generará un código automático para cada registro nuevo.
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="border border-dashed border-[#e5e7eb] rounded-lg p-5 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-[13px] font-semibold">Plantilla de importación</div>
                        <div className="text-[11px] text-[#6b7280]">
                          Descargue el formato {matrizCompleta ? "de matriz completa" : "parcial"} {conCodigo ? "con código de predio" : "sin código de predio"} para {destino.toLowerCase()}.
                        </div>
                      </div>
                      <button
                        onClick={descargarTemplate}
                        className="flex items-center gap-1.5 bg-white border border-[#e5e7eb] hover:bg-[#f9fafb] px-3 py-2 rounded-md text-[13px] font-medium"
                      >
                        <FileDown size={14} /> Descargar template
                      </button>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-[#e5e7eb] rounded-lg p-8 text-center hover:border-[#dc2626] hover:bg-[#fef2f2]/30 transition">
                    <Upload size={28} className="mx-auto text-[#9ca3af] mb-2" />
                    <div className="text-[13px] font-medium">
                      {archivo ? archivo.name : "Seleccione o arrastre un archivo Excel/CSV"}
                    </div>
                    <div className="text-[11px] text-[#6b7280] mt-1">
                      Formatos aceptados: .xlsx, .xls, .csv — máximo 10MB
                    </div>
                    <label className="inline-block mt-3">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                      />
                      <span className="inline-flex items-center gap-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-3 py-1.5 rounded-md text-[12px] font-medium cursor-pointer">
                        <Upload size={12} /> {archivo ? "Cambiar archivo" : "Seleccionar archivo"}
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setOpen(false)}
                      className="px-4 py-2 rounded-md border border-[#e5e7eb] text-[13px] hover:bg-[#f9fafb]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleEvaluar}
                      disabled={!archivo || evaluando}
                      className="flex items-center gap-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-4 py-2 rounded-md text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {evaluando ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                      {evaluando ? "Evaluando..." : "Evaluar archivo"}
                    </button>
                  </div>
                </div>
              )}

              {step === "evaluacion" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <StatCard label="Total filas" value={stats.total} color="#374151" />
                    <StatCard label="Correctos" value={stats.ok} color="#16a34a" icon={<CheckCircle2 size={14} />} />
                    <StatCard label="Advertencias" value={stats.wa} color="#d97706" icon={<AlertTriangle size={14} />} />
                    <StatCard label="Fallidos" value={stats.err} color="#dc2626" icon={<XCircle size={14} />} />
                  </div>

                  <div className="border border-[#e5e7eb] rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-[#f9fafb] border-b border-[#e5e7eb] flex items-center justify-between">
                      <div className="text-[12px] font-semibold">Detalle de evaluación</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => exportarDetalle(HISTORY_MOCK[0], true)}
                          className="flex items-center gap-1 text-[11px] border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] px-2 py-1 rounded"
                        >
                          <Download size={11} /> Exportar fallidos
                        </button>
                        <button
                          onClick={() => exportarDetalle(HISTORY_MOCK[0])}
                          className="flex items-center gap-1 text-[11px] border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] px-2 py-1 rounded"
                        >
                          <Download size={11} /> Exportar todo
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      <table className="w-full text-[12px]">
                        <thead className="bg-white text-[#6b7280] text-left sticky top-0">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Fila</th>
                            <th className="px-3 py-2 font-semibold">Cód. Predio</th>
                            <th className="px-3 py-2 font-semibold">Propietario</th>
                            <th className="px-3 py-2 font-semibold">Área (m²)</th>
                            <th className="px-3 py-2 font-semibold">Modalidad</th>
                            <th className="px-3 py-2 font-semibold">Estado</th>
                            <th className="px-3 py-2 font-semibold">Mensaje</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DETALLE_MOCK.map((r) => (
                            <tr key={r.id} className="border-t border-[#f3f4f6]">
                              <td className="px-3 py-2 font-mono text-[11px] text-[#6b7280]">{r.fila}</td>
                              <td className="px-3 py-2 font-mono text-[11px]">{r.codigoPredio || "—"}</td>
                              <td className="px-3 py-2">{r.propietario}</td>
                              <td className="px-3 py-2">{r.area}</td>
                              <td className="px-3 py-2 text-[11px]">{r.modalidad}</td>
                              <td className="px-3 py-2">
                                <EstadoBadge estado={r.estado} />
                              </td>
                              <td className="px-3 py-2 text-[11px] text-[#6b7280]">{r.mensaje ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {stats.err > 0 && (
                    <div className="flex items-start gap-2 p-3 bg-[#fef3c7] border border-[#fde68a] rounded-lg text-[12px]">
                      <AlertTriangle size={14} className="text-[#d97706] mt-0.5 shrink-0" />
                      <div>
                        Hay <b>{stats.err} registros con errores</b>. Puede continuar importando solo los registros correctos
                        ({stats.ok}) o corregir el archivo y volver a evaluarlo.
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between gap-2 pt-2">
                    <button onClick={() => setStep("config")} className="px-4 py-2 rounded-md border border-[#e5e7eb] text-[13px] hover:bg-[#f9fafb]">
                      ← Volver
                    </button>
                    <button
                      onClick={handleImportar}
                      className="flex items-center gap-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-4 py-2 rounded-md text-[13px] font-medium"
                    >
                      <Upload size={14} /> Importar {stats.ok} registros correctos
                    </button>
                  </div>
                </div>
              )}

              {step === "resultado" && (
                <div className="space-y-4 py-4">
                  <div className="text-center py-6">
                    <div className="size-14 mx-auto rounded-full bg-[#dcfce7] flex items-center justify-center mb-3">
                      <CheckCircle2 size={28} className="text-[#16a34a]" />
                    </div>
                    <h3 className="text-[16px] font-semibold">Importación completada</h3>
                    <p className="text-[12px] text-[#6b7280] mt-1">
                      Se importaron {stats.ok} registros a {destino} {matrizCompleta ? "(matriz completa)" : "(parcial)"} {conCodigo ? "con código de predio" : "sin código de predio"}.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                    <StatCard label="Correctos" value={stats.ok} color="#16a34a" icon={<CheckCircle2 size={14} />} />
                    <StatCard label="Advertencias" value={stats.wa} color="#d97706" icon={<AlertTriangle size={14} />} />
                    <StatCard label="Fallidos" value={stats.err} color="#dc2626" icon={<XCircle size={14} />} />
                  </div>
                  <div className="flex justify-center gap-2 pt-4">
                    <button
                      onClick={() => setTab("historial")}
                      className="px-4 py-2 rounded-md border border-[#e5e7eb] text-[13px] hover:bg-[#f9fafb]"
                    >
                      Ver historial
                    </button>
                    <button
                      onClick={resetForm}
                      className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-4 py-2 rounded-md text-[13px] font-medium"
                    >
                      Nueva importación
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "historial" && (
            <div className="p-6">
              <div className="border border-[#e5e7eb] rounded-lg overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead className="bg-[#f9fafb] text-[#6b7280] text-left">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">Fecha</th>
                      <th className="px-3 py-2.5 font-semibold">Usuario</th>
                      <th className="px-3 py-2.5 font-semibold">Archivo</th>
                      <th className="px-3 py-2.5 font-semibold">Destino</th>
                      <th className="px-3 py-2.5 font-semibold">Tipo</th>
                      <th className="px-3 py-2.5 font-semibold text-right">Total</th>
                      <th className="px-3 py-2.5 font-semibold text-right">OK</th>
                      <th className="px-3 py-2.5 font-semibold text-right">Fallidos</th>
                      <th className="px-3 py-2.5 font-semibold">Estado</th>
                      <th className="px-3 py-2.5 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HISTORY_MOCK.map((h) => (
                      <Fragment key={h.id}>
                        <tr key={h.id} className="border-t border-[#f3f4f6] hover:bg-[#fafafa]">
                          <td className="px-3 py-2 whitespace-nowrap">{h.fecha}</td>
                          <td className="px-3 py-2">{h.usuario}</td>
                          <td className="px-3 py-2 font-mono text-[11px]">{h.archivo}</td>
                          <td className="px-3 py-2">{h.destino}</td>
                          <td className="px-3 py-2 text-[11px]">
                            <div>{h.matrizCompleta ? "Matriz completa" : "Parcial"}</div>
                            <div className="text-[#6b7280]">{h.conCodigo ? "con código" : "sin código"}</div>
                          </td>
                          <td className="px-3 py-2 text-right font-semibold">{h.total}</td>
                          <td className="px-3 py-2 text-right text-[#16a34a] font-semibold">{h.correctos}</td>
                          <td className="px-3 py-2 text-right text-[#dc2626] font-semibold">{h.fallidos}</td>
                          <td className="px-3 py-2">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${h.estado === "Completado" ? "bg-[#dcfce7] text-[#166534] border-[#bbf7d0]" : h.estado === "Con errores" ? "bg-[#fef3c7] text-[#92400e] border-[#fde68a]" : "bg-[#e0e7ff] text-[#3730a3] border-[#c7d2fe]"}`}>
                              {h.estado}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => setDetalleAbierto(detalleAbierto === h.id ? null : h.id)}
                                className="flex items-center gap-1 border border-[#e5e7eb] hover:bg-white px-2 py-1 rounded text-[11px] bg-white"
                                title="Ver detalle"
                              >
                                <Eye size={11} /> Detalle
                              </button>
                              <button
                                onClick={() => exportarDetalle(h)}
                                className="flex items-center gap-1 border border-[#e5e7eb] hover:bg-white px-2 py-1 rounded text-[11px] bg-white"
                                title="Exportar"
                              >
                                <Download size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {detalleAbierto === h.id && (
                          <tr key={`${h.id}-det`} className="bg-[#f9fafb]">
                            <td colSpan={10} className="px-4 py-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-[12px] font-semibold">Detalle de {h.archivo}</div>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => exportarDetalle(h, true)}
                                    className="flex items-center gap-1 border border-[#e5e7eb] bg-white hover:bg-[#f3f4f6] px-2 py-1 rounded text-[11px]"
                                  >
                                    <Download size={11} /> Exportar fallidos ({h.fallidos})
                                  </button>
                                  <button
                                    onClick={() => exportarDetalle(h)}
                                    className="flex items-center gap-1 border border-[#e5e7eb] bg-white hover:bg-[#f3f4f6] px-2 py-1 rounded text-[11px]"
                                  >
                                    <Download size={11} /> Exportar todo
                                  </button>
                                </div>
                              </div>
                              <div className="border border-[#e5e7eb] rounded bg-white max-h-[260px] overflow-y-auto">
                                <table className="w-full text-[11px]">
                                  <thead className="bg-[#f9fafb] text-[#6b7280] text-left sticky top-0">
                                    <tr>
                                      <th className="px-2 py-1.5 font-semibold">Fila</th>
                                      <th className="px-2 py-1.5 font-semibold">Cód.</th>
                                      <th className="px-2 py-1.5 font-semibold">Propietario</th>
                                      <th className="px-2 py-1.5 font-semibold">Estado</th>
                                      <th className="px-2 py-1.5 font-semibold">Mensaje</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {DETALLE_MOCK.map((r) => (
                                      <tr key={r.id} className="border-t border-[#f3f4f6]">
                                        <td className="px-2 py-1.5 font-mono">{r.fila}</td>
                                        <td className="px-2 py-1.5 font-mono">{r.codigoPredio || "—"}</td>
                                        <td className="px-2 py-1.5">{r.propietario}</td>
                                        <td className="px-2 py-1.5"><EstadoBadge estado={r.estado} /></td>
                                        <td className="px-2 py-1.5 text-[#6b7280]">{r.mensaje ?? "—"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon?: React.ReactNode }) {
  return (
    <div className="border border-[#e5e7eb] rounded-lg p-3 bg-white">
      <div className="text-[11px] text-[#6b7280] flex items-center gap-1" style={{ color }}>
        {icon} {label}
      </div>
      <div className="text-[20px] font-bold mt-0.5" style={{ color }}>{value}</div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: "ok" | "error" | "warning" }) {
  if (estado === "ok") return <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]"><CheckCircle2 size={10} /> OK</span>;
  if (estado === "warning") return <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a]"><AlertTriangle size={10} /> Aviso</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]"><XCircle size={10} /> Error</span>;
}
