import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Plus, Save, Search, Send, Trash2, Upload, X } from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute(
  "/proyectos/$projectId/predios/$codigo/transferencia-documentaria-opat",
)({
  head: () => ({
    meta: [
      { title: "Transferencia documentaria a OPAT" },
      {
        name: "description",
        content:
          "Registro, evidencias e historial de la transferencia del expediente documentario hacia OPAT.",
      },
    ],
  }),
  component: TransferenciaDocumentariaOpatPage,
});

const RED = "#dc2626";
const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] focus:border-gray-500 focus:outline-none";
const readOnlyCls = `${inputCls} bg-gray-50 text-gray-700`;

type TransferStatus =
  | "BORRADOR"
  | "EN PREPARACIÓN"
  | "ENVIADO"
  | "EN REVISIÓN OPAT"
  | "OBSERVADO"
  | "RECIBIDO"
  | "TRANSFERIDO";

type FormState = {
  oficinaRegistral: string;
  areaRegistral: string;
  partidaRegistral: string;
  partidaMatriz: string;
  datosOtorgante: string;
  fechaInscripcion: string;
  nivelViabilidad: string;
  periodoProgramacion: string;
  periodoEjecutado: string;
  numeroDocumento: string;
  fechaDocumento: string;
  expedienteTransferido: string;
  hojaRuta: string;
  dependenciaOrigen: string;
  dependenciaDestino: string;
  responsableEntrega: string;
  responsableRecibe: string;
  faseEstado: string;
  estado: TransferStatus;
  progreso: string;
  comentario: string;
};

type EvidenceRow = {
  id: string;
  description: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  addedAt: string;
};

type TraceRow = {
  id: string;
  documentDate: string;
  comment: string;
  routeNumber: string;
  evidence: string;
  dependency: string;
  phase: string;
  status: TransferStatus;
  progress: number;
};

type StoredTransfer = {
  form?: Partial<FormState>;
  evidence?: EvidenceRow[];
  history?: TraceRow[];
};

function TransferenciaDocumentariaOpatPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;
  const storageKey = `transferencia-documentaria-opat:${projectId}:${decodedCodigo}`;
  const initialForm = useMemo<FormState>(
    () => ({
      oficinaRegistral: predio?.ofi || "",
      areaRegistral: predio?.m2 || predio?.area || "",
      partidaRegistral: predio?.part || predio?.pind || "",
      partidaMatriz: "",
      datosOtorgante: predio?.suj || "",
      fechaInscripcion: normalizeDate(predio?.finsc),
      nivelViabilidad: "RIESGO MEDIO",
      periodoProgramacion: currentMonth(),
      periodoEjecutado: "",
      numeroDocumento: "",
      fechaDocumento: today(),
      expedienteTransferido:
        predio?.exp ||
        `EXP-${(predio?.cod || decodedCodigo).replace(/[^A-Z0-9-]/gi, "").slice(-8)}`,
      hojaRuta: predio?.hrres || "",
      dependenciaOrigen: "DIRECCIÓN DE DISPONIBILIDAD DE PREDIOS",
      dependenciaDestino: "OPAT",
      responsableEntrega: proyecto?.coordinadorPredial || predio?.rlegal || "",
      responsableRecibe: "",
      faseEstado: "PREPARACIÓN DEL EXPEDIENTE",
      estado: "BORRADOR",
      progreso: "0",
      comentario: "",
    }),
    [decodedCodigo, predio, proyecto?.coordinadorPredial],
  );
  const [form, setForm] = useState<FormState>(initialForm);
  const [evidence, setEvidence] = useState<EvidenceRow[]>([]);
  const [history, setHistory] = useState<TraceRow[]>([]);
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "warning";
    text: string;
  } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const uploadedFiles = useRef(new Map<string, File>());

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredTransfer;
        setForm((current) => ({ ...current, ...parsed.form }));
        setEvidence(parsed.evidence ?? []);
        setHistory(parsed.history ?? []);
      } else {
        setForm(initialForm);
      }
    } catch {
      setForm(initialForm);
      setMessage({
        type: "warning",
        text: "No se pudo recuperar el borrador anterior. Se inició un registro nuevo.",
      });
    } finally {
      setLoaded(true);
    }
  }, [initialForm, storageKey]);

  const filteredHistory = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return history;
    return history.filter((row) =>
      [
        row.id,
        row.documentDate,
        row.comment,
        row.routeNumber,
        row.evidence,
        row.dependency,
        row.phase,
        row.status,
      ].some((value) => value.toLowerCase().includes(term)),
    );
  }, [history, search]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function persist(nextForm = form, nextEvidence = evidence, nextHistory = history) {
    const payload: StoredTransfer = {
      form: nextForm,
      evidence: nextEvidence,
      history: nextHistory,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }

  function handleSaveDraft() {
    persist();
    setMessage({ type: "success", text: "Borrador guardado correctamente para este predio." });
  }

  function handleEvidenceUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const addedAt = nowLabel();
    const nextRows = files.map<EvidenceRow>((file, index) => {
      const id = `evidence-${Date.now()}-${index}`;
      uploadedFiles.current.set(id, file);
      return {
        id,
        description: evidenceDescription.trim() || documentDescription(file.name),
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        addedAt,
      };
    });
    const nextEvidence = [...evidence, ...nextRows];
    setEvidence(nextEvidence);
    setEvidenceDescription("");
    persist(form, nextEvidence, history);
    setMessage({
      type: "success",
      text: `${nextRows.length} archivo(s) incorporado(s) a la transferencia.`,
    });
    event.target.value = "";
  }

  function removeEvidence(id: string) {
    uploadedFiles.current.delete(id);
    const nextEvidence = evidence.filter((row) => row.id !== id);
    setEvidence(nextEvidence);
    persist(form, nextEvidence, history);
  }

  function downloadEvidence(row: EvidenceRow) {
    const file = uploadedFiles.current.get(row.id);
    const blob =
      file ??
      new Blob(
        [
          `Documento registrado en la transferencia a OPAT\n\nDescripción: ${row.description}\nArchivo: ${row.fileName}\nFecha de carga: ${row.addedAt}`,
        ],
        { type: "text/plain;charset=utf-8" },
      );
    downloadBlob(row.fileName, blob);
  }

  function addHistory(statusOverride?: TransferStatus) {
    if (
      !form.numeroDocumento.trim() ||
      !form.fechaDocumento ||
      !form.expedienteTransferido.trim()
    ) {
      setMessage({
        type: "warning",
        text: "Complete el número de documento, la fecha y el expediente transferido.",
      });
      return;
    }
    if (statusOverride === "TRANSFERIDO" && !evidence.length) {
      setMessage({
        type: "warning",
        text: "Adjunte al menos el documento oficial de remisión o el cargo de recepción antes de registrar la transferencia.",
      });
      return;
    }
    const nextStatus = statusOverride ?? form.estado;
    const nextProgress = statusOverride === "TRANSFERIDO" ? 100 : Number(form.progreso || 0);
    const nextForm: FormState = {
      ...form,
      estado: nextStatus,
      progreso: String(nextProgress),
      periodoEjecutado:
        nextStatus === "TRANSFERIDO"
          ? form.periodoEjecutado || currentMonth()
          : form.periodoEjecutado,
    };
    const nextHistoryId = Math.max(0, ...history.map((item) => Number(item.id) || 0)) + 1;
    const row: TraceRow = {
      id: String(nextHistoryId).padStart(3, "0"),
      documentDate: nextForm.fechaDocumento,
      comment: nextForm.comentario || "Registro de transferencia documentaria a OPAT",
      routeNumber: nextForm.hojaRuta,
      evidence: evidence.map((item) => item.fileName).join(", "),
      dependency: `${nextForm.dependenciaOrigen} → ${nextForm.dependenciaDestino}`,
      phase: nextForm.faseEstado,
      status: nextStatus,
      progress: nextProgress,
    };
    const nextHistory = [row, ...history];
    setForm(nextForm);
    setHistory(nextHistory);
    persist(nextForm, evidence, nextHistory);
    setMessage({
      type: "success",
      text:
        nextStatus === "TRANSFERIDO"
          ? "Transferencia a OPAT registrada como culminada."
          : "Movimiento agregado al historial del trámite.",
    });
  }

  function removeHistory(id: string) {
    const nextHistory = history.filter((row) => row.id !== id);
    setHistory(nextHistory);
    persist(form, evidence, nextHistory);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Transferencia documentaria a OPAT"
        badgeLabel="Predio"
        badgeValue={predio?.cod || decodedCodigo}
        badgeSuffix={form.estado}
      />

      <main className="mx-auto max-w-[1480px] p-4">
        <form
          className="rounded border bg-white"
          onSubmit={(event) => {
            event.preventDefault();
            handleSaveDraft();
          }}
        >
          <div className="px-5 py-5">
            <div className="mb-3 border-b">
              <div className="inline-flex items-center gap-1.5 border-b-2 border-red-600 px-3 py-1.5 text-[12px] font-medium text-red-600">
                <FileText size={14} /> 6.3 Transferencia documentaria a OPAT
              </div>
            </div>

            {message && (
              <div
                className={`mb-3 rounded border px-3 py-2 text-[11px] ${
                  message.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <SectionTitle>Antecedentes del predio</SectionTitle>
            <div className="grid gap-3 lg:grid-cols-2">
              <InfoSection title="INFORMACIÓN REGISTRAL DEL TERRENO">
                <div className="grid gap-y-2">
                  <Field label="Oficina registral" required>
                    <input
                      className={inputCls}
                      value={form.oficinaRegistral}
                      onChange={(event) => setField("oficinaRegistral", event.target.value)}
                      placeholder="Oficina registral SUNARP"
                    />
                  </Field>
                  <Field label="Área registral m²" required>
                    <input
                      className={inputCls}
                      value={form.areaRegistral}
                      onChange={(event) => setField("areaRegistral", event.target.value)}
                      placeholder="0.0000"
                    />
                  </Field>
                  <Field label="Partida registral" required>
                    <input
                      className={inputCls}
                      value={form.partidaRegistral}
                      onChange={(event) => setField("partidaRegistral", event.target.value)}
                    />
                  </Field>
                  <Field label="Partida matriz">
                    <input
                      className={inputCls}
                      value={form.partidaMatriz}
                      onChange={(event) => setField("partidaMatriz", event.target.value)}
                    />
                  </Field>
                </div>
              </InfoSection>

              <InfoSection title="DATOS DE INSCRIPCIÓN Y OTORGANTE">
                <div className="grid gap-y-2">
                  <Field label="Datos del otorgante" required>
                    <input
                      className={inputCls}
                      value={form.datosOtorgante}
                      onChange={(event) => setField("datosOtorgante", event.target.value)}
                      placeholder="Nombre o razón social"
                    />
                  </Field>
                  <Field label="Partida del predio">
                    <input className={readOnlyCls} value={form.partidaRegistral || "—"} readOnly />
                  </Field>
                  <Field label="Fecha de inscripción" required>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.fechaInscripcion}
                      onChange={(event) => setField("fechaInscripcion", event.target.value)}
                    />
                  </Field>
                  <Field label="Código del predio">
                    <input className={readOnlyCls} value={predio?.cod || decodedCodigo} readOnly />
                  </Field>
                </div>
              </InfoSection>
            </div>

            <SectionTitle>Estado de la programación de metas de adquisiciones</SectionTitle>
            <InfoSection title="PROGRAMACIÓN Y VIABILIDAD">
              <div className="grid gap-x-6 gap-y-2 lg:grid-cols-3">
                <CompactField label="Nivel de viabilidad">
                  <select
                    className={inputCls}
                    value={form.nivelViabilidad}
                    onChange={(event) => setField("nivelViabilidad", event.target.value)}
                  >
                    <option>RIESGO BAJO</option>
                    <option>RIESGO MEDIO</option>
                    <option>RIESGO ALTO</option>
                  </select>
                </CompactField>
                <CompactField label="Periodo de programación">
                  <input
                    type="month"
                    className={inputCls}
                    value={form.periodoProgramacion}
                    onChange={(event) => setField("periodoProgramacion", event.target.value)}
                  />
                </CompactField>
                <CompactField label="Periodo ejecutado">
                  <input
                    type="month"
                    className={inputCls}
                    value={form.periodoEjecutado}
                    onChange={(event) => setField("periodoEjecutado", event.target.value)}
                  />
                </CompactField>
              </div>
            </InfoSection>

            <SectionTitle>Registro de transferencia y evidencias</SectionTitle>
            <div className="grid items-start gap-3 xl:grid-cols-2">
              <InfoSection title="TRANSFERENCIA DOCUMENTARIA A OPAT">
                <div className="grid gap-y-2">
                  <Field label="Número de documento" required>
                    <input
                      className={inputCls}
                      value={form.numeroDocumento}
                      onChange={(event) => setField("numeroDocumento", event.target.value)}
                      placeholder="Ej. MEMORANDO N.° 000123-2026-MTC"
                    />
                  </Field>
                  <Field label="Fecha del documento" required>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.fechaDocumento}
                      onChange={(event) => setField("fechaDocumento", event.target.value)}
                    />
                  </Field>
                  <Field label="Expediente transferido" required>
                    <input
                      className={inputCls}
                      value={form.expedienteTransferido}
                      onChange={(event) => setField("expedienteTransferido", event.target.value)}
                    />
                  </Field>
                  <Field label="Hoja de ruta">
                    <input
                      className={inputCls}
                      value={form.hojaRuta}
                      onChange={(event) => setField("hojaRuta", event.target.value)}
                      placeholder="Ej. HR-2026-001234"
                    />
                  </Field>
                  <Field label="Dependencia de origen">
                    <input
                      className={inputCls}
                      value={form.dependenciaOrigen}
                      onChange={(event) => setField("dependenciaOrigen", event.target.value)}
                    />
                  </Field>
                  <Field label="Dependencia de destino">
                    <input
                      className={inputCls}
                      value={form.dependenciaDestino}
                      onChange={(event) => setField("dependenciaDestino", event.target.value)}
                    />
                  </Field>
                  <Field label="Responsable que entrega">
                    <input
                      className={inputCls}
                      value={form.responsableEntrega}
                      onChange={(event) => setField("responsableEntrega", event.target.value)}
                    />
                  </Field>
                  <Field label="Responsable que recibe">
                    <input
                      className={inputCls}
                      value={form.responsableRecibe}
                      onChange={(event) => setField("responsableRecibe", event.target.value)}
                    />
                  </Field>
                  <Field label="Fase del estado">
                    <select
                      className={inputCls}
                      value={form.faseEstado}
                      onChange={(event) => setField("faseEstado", event.target.value)}
                    >
                      <option>PREPARACIÓN DEL EXPEDIENTE</option>
                      <option>REMISIÓN DOCUMENTARIA</option>
                      <option>REVISIÓN OPAT</option>
                      <option>SUBSANACIÓN</option>
                      <option>RECEPCIÓN CONFORME</option>
                    </select>
                  </Field>
                  <Field label="Estado / progreso">
                    <div className="grid grid-cols-[1fr_120px] gap-2">
                      <select
                        className={inputCls}
                        value={form.estado}
                        onChange={(event) =>
                          setField("estado", event.target.value as TransferStatus)
                        }
                      >
                        <option>BORRADOR</option>
                        <option>EN PREPARACIÓN</option>
                        <option>ENVIADO</option>
                        <option>EN REVISIÓN OPAT</option>
                        <option>OBSERVADO</option>
                        <option>RECIBIDO</option>
                        <option>TRANSFERIDO</option>
                      </select>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className={`${inputCls} pr-7 text-right`}
                          value={form.progreso}
                          onChange={(event) => setField("progreso", event.target.value)}
                        />
                        <span className="pointer-events-none absolute right-2 top-2 text-[11px] text-gray-500">
                          %
                        </span>
                      </div>
                    </div>
                  </Field>
                  <Field label="Comentario">
                    <textarea
                      rows={3}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-[12px] focus:border-gray-500 focus:outline-none"
                      value={form.comentario}
                      onChange={(event) => setField("comentario", event.target.value)}
                      placeholder="Detalle del envío, recepción u observaciones de OPAT"
                    />
                  </Field>
                </div>
              </InfoSection>

              <InfoSection
                title="DOCUMENTOS Y EVIDENCIAS OFICIALES"
                action={
                  <label className="inline-flex h-7 cursor-pointer items-center gap-1 rounded bg-red-600 px-2.5 text-[10px] font-semibold text-white hover:bg-red-700">
                    <Upload size={12} /> Subir archivo
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                      className="hidden"
                      onChange={handleEvidenceUpload}
                    />
                  </label>
                }
              >
                <div className="mb-2">
                  <input
                    className={inputCls}
                    value={evidenceDescription}
                    onChange={(event) => setEvidenceDescription(event.target.value)}
                    placeholder="Descripción para los archivos que se cargarán"
                  />
                </div>
                <div className="overflow-x-auto rounded border">
                  <table className="w-full min-w-[580px] text-[11px]">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="w-10 px-2 py-2 text-center font-semibold">#</th>
                        <th className="px-2 py-2 text-left font-semibold">Descripción</th>
                        <th className="w-[220px] px-2 py-2 text-left font-semibold">Archivo</th>
                        <th className="w-[76px] px-2 py-2 text-center font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evidence.length ? (
                        evidence.map((row, index) => (
                          <tr key={row.id} className="border-t align-top">
                            <td className="px-2 py-2 text-center text-gray-500">{index + 1}</td>
                            <td className="px-2 py-2">
                              <div className="font-medium text-gray-800">{row.description}</div>
                              <div className="text-[9px] text-gray-400">{row.addedAt}</div>
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex items-start gap-1.5">
                                <FileText className="mt-0.5 size-3.5 shrink-0 text-red-500" />
                                <div className="min-w-0">
                                  <div
                                    className="truncate font-medium text-gray-700"
                                    title={row.fileName}
                                  >
                                    {row.fileName}
                                  </div>
                                  <div className="text-[9px] text-gray-400">
                                    {formatBytes(row.fileSize)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => downloadEvidence(row)}
                                  className="inline-flex size-7 items-center justify-center rounded border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600"
                                  title="Descargar archivo"
                                >
                                  <Download size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeEvidence(row.id)}
                                  className="inline-flex size-7 items-center justify-center rounded border border-gray-200 text-red-600 hover:bg-red-50"
                                  title="Quitar archivo"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-3 py-8 text-center text-gray-400">
                            Aún no se han adjuntado documentos oficiales.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-[9px] text-gray-400">
                  Formatos admitidos: PDF, Office, imágenes y ZIP. Incluya el documento de remisión,
                  cargo de recepción y expediente transferido.
                </p>
              </InfoSection>
            </div>

            <SectionTitle>Listado de trámite documentario</SectionTitle>
            <InfoSection
              title="HISTORIAL DE ENVÍOS, RECEPCIONES Y OBSERVACIONES"
              action={
                <button
                  type="button"
                  onClick={() => addHistory()}
                  className="inline-flex h-7 items-center gap-1 rounded border border-gray-300 bg-white px-2.5 text-[10px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <Plus size={12} /> Agregar movimiento
                </button>
              }
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="relative w-full max-w-[260px]">
                  <Search className="pointer-events-none absolute left-2.5 top-2 size-3.5 text-gray-400" />
                  <input
                    className={`${inputCls} pl-8`}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar en el historial..."
                  />
                </div>
                <span className="text-[10px] text-gray-500">
                  {filteredHistory.length} de {history.length} registro(s)
                </span>
              </div>
              <div className="overflow-x-auto rounded border">
                <table className="w-full min-w-[1250px] text-[10px]">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="w-12 px-2 py-2 text-center font-semibold">ID</th>
                      <th className="w-20 px-2 py-2 text-center font-semibold">Acciones</th>
                      <th className="w-[120px] px-2 py-2 text-left font-semibold">Fecha</th>
                      <th className="px-2 py-2 text-left font-semibold">Comentario</th>
                      <th className="w-36 px-2 py-2 text-left font-semibold">Hoja de ruta</th>
                      <th className="w-52 px-2 py-2 text-left font-semibold">Evidencia</th>
                      <th className="w-60 px-2 py-2 text-left font-semibold">Dependencia</th>
                      <th className="w-48 px-2 py-2 text-left font-semibold">Fase</th>
                      <th className="w-32 px-2 py-2 text-left font-semibold">Estado</th>
                      <th className="w-32 px-2 py-2 text-left font-semibold">Progreso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.length ? (
                      filteredHistory.map((row) => (
                        <tr key={`${row.id}-${row.documentDate}`} className="border-t align-top">
                          <td className="px-2 py-2 text-center font-semibold text-gray-500">
                            {row.id}
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex justify-center gap-1">
                              {evidence[0] && (
                                <button
                                  type="button"
                                  onClick={() => downloadEvidence(evidence[0])}
                                  className="inline-flex size-7 items-center justify-center rounded border border-gray-200 text-gray-600 hover:text-red-600"
                                  title="Descargar evidencia"
                                >
                                  <Download size={12} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeHistory(row.id)}
                                className="inline-flex size-7 items-center justify-center rounded border border-gray-200 text-red-600 hover:bg-red-50"
                                title="Eliminar movimiento"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-2 py-2">
                            {formatDatePe(row.documentDate)}
                          </td>
                          <td className="px-2 py-2">{row.comment}</td>
                          <td className="px-2 py-2">{row.routeNumber || "—"}</td>
                          <td
                            className="max-w-[220px] truncate px-2 py-2"
                            title={row.evidence || "Sin evidencia"}
                          >
                            {row.evidence || "—"}
                          </td>
                          <td className="px-2 py-2">{row.dependency}</td>
                          <td className="px-2 py-2">{row.phase}</td>
                          <td className="px-2 py-2">
                            <StatusPill status={row.status} />
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 flex-1 rounded bg-gray-100">
                                <div
                                  className="h-1.5 rounded bg-red-600"
                                  style={{ width: `${Math.min(100, Math.max(0, row.progress))}%` }}
                                />
                              </div>
                              <span className="w-8 text-right font-semibold">{row.progress}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="px-3 py-10 text-center text-gray-400">
                          {history.length
                            ? "No se encontraron movimientos con el criterio indicado."
                            : "Ningún movimiento registrado en el historial del trámite."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </InfoSection>

            <div className="mt-5 flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50"
              >
                <X size={14} /> Cancelar
              </button>
              <button
                type="submit"
                disabled={!loaded}
                className="inline-flex items-center gap-1.5 rounded border border-red-600 px-4 py-1.5 text-[12px] text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Save size={14} /> Guardar borrador
              </button>
              <button
                type="button"
                onClick={() => addHistory("TRANSFERIDO")}
                className="inline-flex items-center gap-1.5 rounded bg-red-600 px-4 py-1.5 text-[12px] text-white hover:bg-red-700"
              >
                <Send size={14} /> Registrar transferencia
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-4 border-b pb-1 first:mt-0">
      <h3 className="text-[13px] font-semibold" style={{ color: RED }}>
        {children}
      </h3>
    </div>
  );
}

function InfoSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded border border-gray-200 bg-white px-3 py-2.5">
      <div className="mb-2 flex min-h-7 items-center justify-between gap-2 border-b border-red-200 pb-1.5 text-red-500">
        <h2 className="text-[10px] font-semibold tracking-wide">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

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
    <div className="grid grid-cols-[180px_1fr] items-center gap-2">
      <label className="text-right text-[12px] text-gray-700">
        {required && <span className="text-red-600">* </span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function CompactField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-[11px] text-gray-600">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function StatusPill({ status }: { status: TransferStatus }) {
  const cls =
    status === "TRANSFERIDO" || status === "RECIBIDO"
      ? "border-green-200 bg-green-50 text-green-700"
      : status === "OBSERVADO"
        ? "border-red-200 bg-red-50 text-red-700"
        : status === "BORRADOR"
          ? "border-gray-200 bg-gray-50 text-gray-600"
          : "border-blue-200 bg-blue-50 text-blue-700";
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[9px] font-semibold ${cls}`}
    >
      {status}
    </span>
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function nowLabel() {
  return new Date().toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function normalizeDate(value: string | undefined | null) {
  const clean = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  const match = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!match) return "";
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${year}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function formatDatePe(value: string) {
  const normalized = normalizeDate(value);
  if (!normalized) return value || "—";
  const [year, month, day] = normalized.split("-");
  return `${day}/${month}/${year}`;
}

function formatBytes(value: number) {
  if (!value) return "0 KB";
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function documentDescription(fileName: string) {
  const normalized = fileName.toLowerCase();
  if (normalized.includes("cargo")) return "Cargo de recepción de OPAT";
  if (normalized.includes("memorando") || normalized.includes("memo")) {
    return "Documento de remisión del expediente";
  }
  if (normalized.includes("acta")) return "Acta de entrega o recepción";
  return "Documento del expediente transferido";
}

function downloadBlob(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
