import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  CircleAlert,
  CircleDashed,
  Copy,
  Download,
  Eye,
  KeyRound,
  Link2,
  LockKeyhole,
  Printer,
  RotateCcw,
  Search,
  Share2,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/expediente-digital")({
  head: () => ({
    meta: [
      { title: "Expediente digital" },
      {
        name: "description",
        content:
          "Visor, enlace compartible y supervisión de los documentos del expediente digital del predio.",
      },
    ],
  }),
  component: ExpedienteDigitalPage,
});

const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] focus:border-gray-500 focus:outline-none";

type Decision = "PENDIENTE" | "VISTO BUENO" | "OBSERVADO";

type DocumentDefinition = {
  number: number;
  stage: string;
  document: string;
  user: string;
};

type ReviewRecord = {
  decision: Decision;
  comment: string;
  supervisor: string;
  reviewedAt: string;
};

type SharedAccessState = {
  mode: boolean;
  token: string;
  granted: boolean;
  printAll: boolean;
};

const DOCUMENTS: DocumentDefinition[] = [
  {
    number: 1,
    stage: "1. INFORMACIÓN BASE",
    document: "Ficha RENIEC, DNI o documento de personería jurídica",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 2,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Certificado de Búsqueda Catastral – CBC",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 3,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Informe del Especialista Técnico",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 4,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Informe del Verificador Catastral / Especialista",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 5,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Títulos archivados",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 6,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Documentos que acreditan la posesión",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 7,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Publicaciones",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 8,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Notificación de publicaciones",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 9,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Certificado Registral Inmobiliario – CRI",
    user: "Especialista legal",
  },
  {
    number: 10,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Partida Registral actualizada",
    user: "Especialista legal",
  },
  {
    number: 11,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Visualización / constancia de inexistencia de título pendiente",
    user: "Especialista legal",
  },
  {
    number: 12,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Oficio de comunicación de inicio de trato directo / solicitud de información",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 13,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Oficio a SUNARP solicitando Anotación Preventiva",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 14,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Asiento de inscripción de Anotación Preventiva",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 15,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Informe y documentos de perjuicio económico",
    user: "Perito tasador / Especialista técnico",
  },
  {
    number: 16,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Memoria descriptiva + plano de afectación + plano de distribución",
    user: "Perito tasador / Especialista técnico",
  },
  {
    number: 17,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Formato de certificación del expediente técnico",
    user: "Perito tasador / Especialista técnico",
  },
  {
    number: 18,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Orden de Servicio del Perito Tasador",
    user: "Perito tasador / Especialista técnico",
  },
  {
    number: 19,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Oficio/correo de remisión del expediente de tasación al perito",
    user: "Perito tasador / Especialista técnico",
  },
  {
    number: 20,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Carta del Perito al MTC remitiendo la tasación",
    user: "Perito tasador / Especialista técnico",
  },
  {
    number: 21,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Informe Técnico de Tasación – ITT",
    user: "Perito tasador / Especialista técnico",
  },
  {
    number: 22,
    stage: "2. ADQUISICIÓN Y TASACIÓN",
    document: "Informe del Perito Supervisor",
    user: "Perito tasador / Especialista técnico",
  },
  {
    number: 23,
    stage: "3. COMUNICACIÓN Y APROBACIÓN",
    document: "Certificación de Crédito Presupuestario – CCP",
    user: "Administración / Tesorería",
  },
  {
    number: 24,
    stage: "3. COMUNICACIÓN Y APROBACIÓN",
    document: "Cargo de notificación de Carta de Intención de Adquisición",
    user: "Coordinador predial",
  },
  {
    number: 25,
    stage: "3. COMUNICACIÓN Y APROBACIÓN",
    document: "Documento de aceptación de la oferta + Hoja de Ruta",
    user: "Coordinador predial",
  },
  {
    number: 26,
    stage: "3. COMUNICACIÓN Y APROBACIÓN",
    document: "Documento de rechazo de la oferta / consulta a Trámite Documentario",
    user: "Coordinador predial",
  },
  {
    number: 27,
    stage: "3. COMUNICACIÓN Y APROBACIÓN",
    document: "Informe Técnico Legal – ITL para aprobación del valor y pago",
    user: "Administración / Tesorería",
  },
  {
    number: 28,
    stage: "3. COMUNICACIÓN Y APROBACIÓN",
    document: "Memorando DGPPT – VMT",
    user: "Administración / Tesorería",
  },
  {
    number: 29,
    stage: "3. COMUNICACIÓN Y APROBACIÓN",
    document: "Informe DGOGAJ – VMT",
    user: "Administración / Tesorería",
  },
  {
    number: 30,
    stage: "3. COMUNICACIÓN Y APROBACIÓN",
    document: "Resolución Ministerial + anexo",
    user: "Administración / Tesorería",
  },
  {
    number: 31,
    stage: "3. COMUNICACIÓN Y APROBACIÓN",
    document: "Resolución Viceministerial + anexo",
    user: "Administración / Tesorería",
  },
  {
    number: 32,
    stage: "3. COMUNICACIÓN Y APROBACIÓN",
    document: "Resolución Directoral – RD",
    user: "Administración / Tesorería",
  },
  {
    number: 33,
    stage: "4. PAGO",
    document: "Memorando DDP–OGA / Solicitud de emisión de devengado",
    user: "Administración / Tesorería",
  },
  {
    number: 34,
    stage: "4. PAGO",
    document: "Memorando solicitando representante para entrega de cheque DDP–OFIN",
    user: "Administración / Tesorería",
  },
  {
    number: 35,
    stage: "4. PAGO",
    document: "Designación de representante para entrega de cheque OFIN–DDP",
    user: "Administración / Tesorería",
  },
  {
    number: 36,
    stage: "4. PAGO",
    document: "Comprobante de pago + cheque / fe de entrega",
    user: "Administración / Tesorería",
  },
  {
    number: 37,
    stage: "4. PAGO",
    document: "Formulario Registral",
    user: "Especialista legal",
  },
  {
    number: 38,
    stage: "4. PAGO",
    document: "Oficio de designación de profesional DDP para recepción del predio",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 39,
    stage: "4. PAGO",
    document: "Memorando solicitando designación de representante DDP–OPAT",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 40,
    stage: "4. PAGO",
    document: "Designación de representante OPAT–DDP",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 41,
    stage: "4. PAGO",
    document: "Acta de entrega de terreno Sujeto Pasivo–DDP",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 42,
    stage: "4. PAGO",
    document: "Acta de entrega de terreno DDP–Concesionaria",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 43,
    stage: "4. PAGO",
    document: "Acta de entrega de terreno DDP–OPAT",
    user: "Gilbert Manuel Aguirre Gómez",
  },
  {
    number: 44,
    stage: "5. SANEAMIENTO E INSCRIPCIÓN",
    document: "Constancia de inscripción de transferencia a favor del MTC",
    user: "Especialista legal",
  },
];

const STAGES = [...new Set(DOCUMENTS.map((item) => item.stage))];

function ExpedienteDigitalPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;
  const storageKey = `expediente-digital-revision:${projectId}:${decodedCodigo}`;
  const accessStorageKey = `expediente-digital-acceso:${projectId}:${decodedCodigo}`;
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState<Record<string, ReviewRecord>>({});
  const [supervisor, setSupervisor] = useState(
    proyecto?.coordinadorPredial || "Supervisor predial",
  );
  const [reviewComment, setReviewComment] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [enteredAccessCode, setEnteredAccessCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [sharedAccess, setSharedAccess] = useState<SharedAccessState>({
    mode: false,
    token: "",
    granted: false,
    printAll: false,
  });
  const printLinkHandled = useRef(false);
  const selectedDocument = DOCUMENTS.find((item) => item.number === selectedNumber) ?? DOCUMENTS[0];
  const selectedReview = reviews[String(selectedDocument.number)] ?? emptyReview();
  const approvedCount = Object.values(reviews).filter(
    (review) => review.decision === "VISTO BUENO",
  ).length;
  const observedCount = Object.values(reviews).filter(
    (review) => review.decision === "OBSERVADO",
  ).length;
  const reviewedCount = approvedCount + observedCount;
  const progress = Math.round((approvedCount / DOCUMENTS.length) * 100);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          reviews?: Record<string, ReviewRecord>;
          supervisor?: string;
        };
        setReviews(parsed.reviews ?? {});
        if (parsed.supervisor) setSupervisor(parsed.supervisor);
      }
      const savedAccessCode = window.localStorage.getItem(accessStorageKey);
      const nextAccessCode = normalizeAccessCode(savedAccessCode) || generateAccessCode();
      setAccessCode(nextAccessCode);
      window.localStorage.setItem(accessStorageKey, nextAccessCode);

      const params = new URLSearchParams(window.location.search);
      const sharedMode = params.get("compartido") === "1";
      const token = params.get("token") || "";
      const embeddedCode = normalizeAccessCode(params.get("clave"));
      const granted = Boolean(
        sharedMode && token && embeddedCode && accessToken(embeddedCode, decodedCodigo) === token,
      );
      setSharedAccess({
        mode: sharedMode,
        token,
        granted,
        printAll: params.get("imprimir") === "1",
      });
      const documentFromLink = Number(window.location.hash.replace("#documento-", ""));
      if (DOCUMENTS.some((item) => item.number === documentFromLink)) {
        setSelectedNumber(documentFromLink);
      }
    } catch {
      setMessage("No se pudo recuperar la revisión anterior.");
    }
  }, [accessStorageKey, decodedCodigo, storageKey]);

  useEffect(() => {
    setReviewComment(selectedReview.comment);
  }, [selectedDocument.number, selectedReview.comment]);

  useEffect(() => {
    const blob = createDocumentPdfBlob(selectedDocument, decodedCodigo, projectLabel);
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [decodedCodigo, projectLabel, selectedDocument]);

  useEffect(() => {
    if (
      !sharedAccess.mode ||
      !sharedAccess.granted ||
      !sharedAccess.printAll ||
      printLinkHandled.current
    ) {
      return;
    }
    printLinkHandled.current = true;
    const blob = createCompleteExpedientePdfBlob(DOCUMENTS, reviews, decodedCodigo, projectLabel);
    const url = URL.createObjectURL(blob);
    window.location.assign(url);
  }, [decodedCodigo, projectLabel, reviews, sharedAccess]);

  const groupedDocuments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return STAGES.map((stage) => ({
      stage,
      documents: DOCUMENTS.filter(
        (item) =>
          item.stage === stage &&
          (!term ||
            item.document.toLowerCase().includes(term) ||
            item.user.toLowerCase().includes(term) ||
            String(item.number).includes(term)),
      ),
    })).filter((group) => group.documents.length);
  }, [search]);

  function persist(nextReviews: Record<string, ReviewRecord>, nextSupervisor = supervisor) {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ reviews: nextReviews, supervisor: nextSupervisor }),
    );
  }

  function selectDocument(number: number) {
    setSelectedNumber(number);
    window.history.replaceState(null, "", `#documento-${number}`);
    setMessage("");
  }

  function saveDecision(decision: Decision) {
    const nextReview: ReviewRecord = {
      decision,
      comment: reviewComment.trim(),
      supervisor: supervisor.trim() || "Supervisor predial",
      reviewedAt: decision === "PENDIENTE" ? "" : nowLabel(),
    };
    const nextReviews = { ...reviews, [String(selectedDocument.number)]: nextReview };
    setReviews(nextReviews);
    persist(nextReviews);
    setMessage(
      decision === "VISTO BUENO"
        ? "Visto bueno registrado para el documento seleccionado."
        : decision === "OBSERVADO"
          ? "Documento marcado como observado."
          : "Revisión restablecida a pendiente.",
    );
  }

  function ensureAccessCode() {
    const code = normalizeAccessCode(accessCode) || generateAccessCode();
    if (code !== accessCode) {
      setAccessCode(code);
      window.localStorage.setItem(accessStorageKey, code);
    }
    return code;
  }

  async function copyShareLink(documentNumber?: number) {
    const code = ensureAccessCode();
    await copyText(
      buildSharedAccessLink({
        code,
        codigoPredio: decodedCodigo,
        documentNumber,
        includeCode: true,
      }),
    );
    setMessage(
      documentNumber
        ? "Enlace protegido del documento copiado."
        : "Enlace protegido del expediente digital copiado.",
    );
  }

  function regenerateAccessCode() {
    const code = generateAccessCode();
    setAccessCode(code);
    window.localStorage.setItem(accessStorageKey, code);
    setMessage("Se generó una nueva clave. Copie y distribuya los nuevos enlaces de acceso.");
  }

  function validateSharedAccess() {
    const code = normalizeAccessCode(enteredAccessCode);
    if (!code || accessToken(code, decodedCodigo) !== sharedAccess.token) {
      setAccessError("La clave de acceso no es válida para este expediente.");
      return;
    }
    setAccessError("");
    setSharedAccess((current) => ({ ...current, granted: true }));
  }

  function printCompleteExpediente() {
    const blob = createCompleteExpedientePdfBlob(DOCUMENTS, reviews, decodedCodigo, projectLabel);
    openPrintableBlob(blob, `expediente_completo_${slug(decodedCodigo)}.pdf`);
  }

  function downloadSelectedDocument() {
    const blob = createDocumentPdfBlob(selectedDocument, decodedCodigo, projectLabel);
    downloadBlob(documentFileName(selectedDocument), blob);
  }

  if (sharedAccess.mode && !sharedAccess.granted) {
    return (
      <SharedAccessGate
        projectId={projectId}
        projectLabel={projectLabel}
        codigoPredio={predio?.cod || decodedCodigo}
        accessCode={enteredAccessCode}
        error={accessError}
        printAll={sharedAccess.printAll}
        onAccessCodeChange={setEnteredAccessCode}
        onSubmit={validateSharedAccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Expediente digital"
        badgeLabel="Vistos buenos"
        badgeValue={`${approvedCount}/${DOCUMENTS.length}`}
        badgeSuffix={`${progress}%`}
      />

      <main className="mx-auto max-w-[1760px] p-4">
        <div className="rounded border bg-white px-4 py-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b pb-2">
            <div>
              <h1 className="text-[13px] font-semibold text-red-600">
                6.1 Expediente digital — revisión documental
              </h1>
              <p className="mt-0.5 text-[10px] text-gray-500">
                {DOCUMENTS.length} documentos · {reviewedCount} revisados · {observedCount}{" "}
                observados
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-[250px]">
                <Search className="pointer-events-none absolute left-2.5 top-2 size-3.5 text-gray-400" />
                <input
                  className={`${inputCls} pl-8`}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar documento o usuario..."
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  ensureAccessCode();
                  setShareDialogOpen(true);
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 px-3 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Share2 size={13} /> Generar enlace
              </button>
              <button
                type="button"
                onClick={printCompleteExpediente}
                className="inline-flex h-8 items-center gap-1.5 rounded bg-red-600 px-3 text-[11px] font-semibold text-white hover:bg-red-700"
              >
                <Printer size={13} /> Imprimir todo
              </button>
            </div>
          </div>

          {message && (
            <div className="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-[10px] text-green-700">
              {message}
            </div>
          )}

          <div className="grid min-h-[760px] gap-3 xl:grid-cols-[minmax(560px,0.88fr)_minmax(650px,1.12fr)]">
            <section className="min-w-0 rounded border border-gray-200 bg-white">
              <div className="flex h-9 items-center justify-between border-b border-red-200 px-3 text-red-500">
                <h2 className="text-[10px] font-semibold tracking-wide">
                  DOCUMENTOS DEL EXPEDIENTE
                </h2>
                <span className="text-[9px] text-gray-500">
                  Seleccione un documento para revisarlo
                </span>
              </div>
              <div className="max-h-[850px] overflow-auto">
                <table className="w-full min-w-[700px] text-[10px]">
                  <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600 shadow-sm">
                    <tr>
                      <th className="w-10 px-2 py-2 text-center font-semibold">N.°</th>
                      <th className="w-20 px-2 py-2 text-center font-semibold">V.° B.°</th>
                      <th className="px-2 py-2 text-left font-semibold">
                        Documento generado / registrado
                      </th>
                      <th className="w-[190px] px-2 py-2 text-left font-semibold">
                        Usuario que registra
                      </th>
                      <th className="w-[76px] px-2 py-2 text-center font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedDocuments.map((group) => {
                      const stageDocuments = DOCUMENTS.filter((item) => item.stage === group.stage);
                      const stageApproved = stageDocuments.filter(
                        (item) => reviews[String(item.number)]?.decision === "VISTO BUENO",
                      ).length;
                      return (
                        <StageRows
                          key={group.stage}
                          stage={group.stage}
                          documents={group.documents}
                          approved={stageApproved}
                          total={stageDocuments.length}
                          reviews={reviews}
                          selectedNumber={selectedDocument.number}
                          onSelect={selectDocument}
                          onCopyLink={copyShareLink}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="min-w-0 rounded border border-gray-200 bg-white">
              <div className="flex min-h-9 flex-wrap items-center justify-between gap-2 border-b border-red-200 px-3 py-1.5">
                <div className="min-w-0">
                  <div className="truncate text-[10px] font-semibold text-red-500">
                    VISTA DEL DOCUMENTO N.° {selectedDocument.number}
                  </div>
                  <div
                    className="truncate text-[9px] text-gray-500"
                    title={selectedDocument.document}
                  >
                    {selectedDocument.document}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => copyShareLink(selectedDocument.number)}
                    className="inline-flex h-7 items-center gap-1 rounded border border-gray-300 px-2 text-[9px] font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Copy size={12} /> Copiar link
                  </button>
                  <button
                    type="button"
                    onClick={downloadSelectedDocument}
                    className="inline-flex h-7 items-center gap-1 rounded border border-gray-300 px-2 text-[9px] font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Download size={12} /> Descargar
                  </button>
                </div>
              </div>

              <div className="border-b bg-gray-50 px-3 py-2">
                <div className="grid items-end gap-2 lg:grid-cols-[210px_1fr_auto]">
                  <label className="text-[9px] font-medium text-gray-500">
                    Supervisor
                    <input
                      className={`${inputCls} mt-1`}
                      value={supervisor}
                      onChange={(event) => setSupervisor(event.target.value)}
                    />
                  </label>
                  <label className="text-[9px] font-medium text-gray-500">
                    Observación de supervisión
                    <input
                      className={`${inputCls} mt-1`}
                      value={reviewComment}
                      onChange={(event) => setReviewComment(event.target.value)}
                      placeholder="Comentario opcional para el visto bueno u observación"
                    />
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => saveDecision("VISTO BUENO")}
                      className="inline-flex h-8 items-center gap-1 rounded bg-green-600 px-2.5 text-[9px] font-semibold text-white hover:bg-green-700"
                    >
                      <ThumbsUp size={12} /> Visto bueno
                    </button>
                    <button
                      type="button"
                      onClick={() => saveDecision("OBSERVADO")}
                      className="inline-flex h-8 items-center gap-1 rounded bg-red-600 px-2.5 text-[9px] font-semibold text-white hover:bg-red-700"
                    >
                      <ThumbsDown size={12} /> Observar
                    </button>
                    <button
                      type="button"
                      onClick={() => saveDecision("PENDIENTE")}
                      className="inline-flex size-8 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
                      title="Restablecer revisión"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2 text-[9px]">
                  <DecisionPill decision={selectedReview.decision} />
                  <span className="text-gray-500">
                    {selectedReview.reviewedAt
                      ? `Revisado por ${selectedReview.supervisor} · ${selectedReview.reviewedAt}`
                      : "Pendiente de revisión del supervisor"}
                  </span>
                </div>
              </div>

              <div className="bg-gray-100 p-2">
                {previewUrl ? (
                  <iframe
                    key={previewUrl}
                    src={previewUrl}
                    title={`Vista previa de ${selectedDocument.document}`}
                    className="h-[690px] w-full rounded border bg-white"
                  />
                ) : (
                  <div className="flex h-[690px] items-center justify-center rounded border bg-white text-[11px] text-gray-400">
                    Preparando vista previa del documento...
                  </div>
                )}
              </div>
            </section>
          </div>

          {shareDialogOpen && accessCode && (
            <ShareAccessDialog
              accessCode={accessCode}
              accessLink={buildSharedAccessLink({
                code: accessCode,
                codigoPredio: decodedCodigo,
              })}
              embeddedLink={buildSharedAccessLink({
                code: accessCode,
                codigoPredio: decodedCodigo,
                includeCode: true,
              })}
              printLink={buildSharedAccessLink({
                code: accessCode,
                codigoPredio: decodedCodigo,
                includeCode: true,
                printAll: true,
              })}
              onClose={() => setShareDialogOpen(false)}
              onRegenerate={regenerateAccessCode}
              onCopy={async (value, label) => {
                await copyText(value);
                setMessage(`${label} copiado.`);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function SharedAccessGate({
  projectId,
  projectLabel,
  codigoPredio,
  accessCode,
  error,
  printAll,
  onAccessCodeChange,
  onSubmit,
}: {
  projectId: string;
  projectLabel: string;
  codigoPredio: string;
  accessCode: string;
  error: string;
  printAll: boolean;
  onAccessCodeChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Acceso al expediente digital"
        badgeLabel="Predio"
        badgeValue={codigoPredio}
        badgeSuffix="ENLACE PROTEGIDO"
      />
      <main className="mx-auto flex max-w-[560px] items-center justify-center p-6 pt-16">
        <form
          className="w-full rounded border bg-white px-6 py-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600">
            <LockKeyhole size={21} />
          </div>
          <h1 className="mt-3 text-center text-[15px] font-semibold text-gray-900">
            Expediente digital protegido
          </h1>
          <p className="mx-auto mt-1 max-w-[410px] text-center text-[11px] leading-relaxed text-gray-500">
            Ingrese la clave de seis dígitos proporcionada junto con el enlace para acceder al
            expediente del predio {codigoPredio}.
          </p>
          {printAll && (
            <div className="mt-3 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-center text-[10px] text-blue-700">
              Después de validar la clave se abrirá el expediente consolidado para impresión.
            </div>
          )}
          <label className="mt-5 block text-center text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Clave de acceso
            <input
              autoFocus
              inputMode="numeric"
              maxLength={7}
              className="mx-auto mt-1.5 block h-11 w-[190px] rounded border border-gray-300 bg-white px-3 text-center text-[20px] font-bold tracking-[0.3em] focus:border-red-500 focus:outline-none"
              value={accessCode}
              onChange={(event) => onAccessCodeChange(formatAccessCode(event.target.value))}
              placeholder="000 000"
            />
          </label>
          {error && (
            <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-center text-[10px] text-red-700">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded bg-red-600 text-[11px] font-semibold text-white hover:bg-red-700"
          >
            <KeyRound size={14} /> Ingresar al expediente
          </button>
        </form>
      </main>
    </div>
  );
}

function ShareAccessDialog({
  accessCode,
  accessLink,
  embeddedLink,
  printLink,
  onClose,
  onRegenerate,
  onCopy,
}: {
  accessCode: string;
  accessLink: string;
  embeddedLink: string;
  printLink: string;
  onClose: () => void;
  onRegenerate: () => void;
  onCopy: (value: string, label: string) => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <section className="w-full max-w-[720px] rounded border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-red-200 px-4 py-3">
          <div>
            <h2 className="text-[13px] font-semibold text-red-600">
              Generar enlace del expediente
            </h2>
            <p className="mt-0.5 text-[10px] text-gray-500">
              Acceso protegido mediante enlace y clave, similar a una reunión virtual.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
            title="Cerrar"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 bg-gray-50 px-3 py-2.5">
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                Clave de acceso
              </div>
              <div className="mt-0.5 font-mono text-[22px] font-bold tracking-[0.24em] text-gray-900">
                {formatAccessCode(accessCode)}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onCopy(accessCode, "Clave de acceso")}
                className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 bg-white px-3 text-[10px] font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Copy size={12} /> Copiar clave
              </button>
              <button
                type="button"
                onClick={onRegenerate}
                className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 bg-white px-3 text-[10px] font-semibold text-gray-700 hover:bg-gray-50"
              >
                <RotateCcw size={12} /> Nueva clave
              </button>
            </div>
          </div>

          <ShareLinkRow
            title="Enlace de acceso"
            description="El usuario deberá ingresar la clave de seis dígitos."
            value={accessLink}
            onCopy={() => onCopy(accessLink, "Enlace de acceso")}
          />
          <ShareLinkRow
            title="Enlace con clave incorporada"
            description="Abre directamente el expediente sin solicitar nuevamente la clave."
            value={embeddedLink}
            onCopy={() => onCopy(embeddedLink, "Enlace con clave incorporada")}
          />
          <ShareLinkRow
            title="Enlace para imprimir todo"
            description="Valida el acceso y abre el expediente consolidado en PDF."
            value={printLink}
            onCopy={() => onCopy(printLink, "Enlace para imprimir todo")}
            tone="red"
          />

          <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[9px] leading-relaxed text-amber-800">
            Al generar una nueva clave se crean enlaces diferentes. Comparta la clave por un medio
            separado cuando utilice el enlace de acceso sin clave incorporada.
          </div>
        </div>
      </section>
    </div>
  );
}

function ShareLinkRow({
  title,
  description,
  value,
  onCopy,
  tone = "gray",
}: {
  title: string;
  description: string;
  value: string;
  onCopy: () => void;
  tone?: "gray" | "red";
}) {
  return (
    <div className="rounded border border-gray-200 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div
            className={`text-[11px] font-semibold ${tone === "red" ? "text-red-600" : "text-gray-800"}`}
          >
            {title}
          </div>
          <div className="text-[9px] text-gray-500">{description}</div>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded px-3 text-[10px] font-semibold ${
            tone === "red"
              ? "bg-red-600 text-white hover:bg-red-700"
              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Copy size={12} /> Copiar
        </button>
      </div>
      <div
        className="mt-2 truncate rounded bg-gray-50 px-2 py-1.5 font-mono text-[9px] text-gray-600"
        title={value}
      >
        {value}
      </div>
    </div>
  );
}

function StageRows({
  stage,
  documents,
  approved,
  total,
  reviews,
  selectedNumber,
  onSelect,
  onCopyLink,
}: {
  stage: string;
  documents: DocumentDefinition[];
  approved: number;
  total: number;
  reviews: Record<string, ReviewRecord>;
  selectedNumber: number;
  onSelect: (number: number) => void;
  onCopyLink: (number: number) => void;
}) {
  return (
    <>
      <tr className="border-y border-red-100 bg-red-50/70">
        <td colSpan={5} className="px-2 py-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-red-700">{stage}</span>
            <span className="text-[9px] font-medium text-gray-500">
              {approved}/{total} con visto bueno
            </span>
          </div>
        </td>
      </tr>
      {documents.map((item) => {
        const review = reviews[String(item.number)] ?? emptyReview();
        const selected = item.number === selectedNumber;
        return (
          <tr
            key={item.number}
            className={`border-b align-middle ${selected ? "bg-red-50" : "hover:bg-gray-50"}`}
          >
            <td className="px-2 py-1.5 text-center text-gray-500">{item.number}</td>
            <td className="px-2 py-1.5 text-center">
              <DecisionIcon decision={review.decision} />
            </td>
            <td className="px-2 py-1.5">
              <button
                type="button"
                onClick={() => onSelect(item.number)}
                className="text-left font-medium text-gray-800 hover:text-red-600"
              >
                {item.document}
              </button>
            </td>
            <td className="px-2 py-1.5 text-gray-500">{item.user}</td>
            <td className="px-2 py-1.5">
              <div className="flex justify-center gap-1">
                <button
                  type="button"
                  onClick={() => onSelect(item.number)}
                  className="inline-flex size-7 items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:text-red-600"
                  title="Ver documento"
                >
                  <Eye size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onCopyLink(item.number)}
                  className="inline-flex size-7 items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:text-red-600"
                  title="Copiar enlace directo"
                >
                  <Link2 size={13} />
                </button>
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
}

function DecisionIcon({ decision }: { decision: Decision }) {
  if (decision === "VISTO BUENO") {
    return (
      <span
        className="inline-flex size-5 items-center justify-center rounded bg-green-600 text-white"
        title="Visto bueno"
      >
        <Check size={13} />
      </span>
    );
  }
  if (decision === "OBSERVADO") {
    return (
      <span
        className="inline-flex size-5 items-center justify-center rounded bg-red-600 text-white"
        title="Observado"
      >
        <CircleAlert size={13} />
      </span>
    );
  }
  return (
    <span
      className="inline-flex size-5 items-center justify-center rounded border border-gray-300 bg-white text-gray-400"
      title="Pendiente"
    >
      <CircleDashed size={13} />
    </span>
  );
}

function DecisionPill({ decision }: { decision: Decision }) {
  const cls =
    decision === "VISTO BUENO"
      ? "border-green-200 bg-green-50 text-green-700"
      : decision === "OBSERVADO"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-gray-200 bg-white text-gray-500";
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 font-semibold ${cls}`}>
      {decision}
    </span>
  );
}

function emptyReview(): ReviewRecord {
  return { decision: "PENDIENTE", comment: "", supervisor: "", reviewedAt: "" };
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

function generateAccessCode() {
  const values = new Uint32Array(1);
  window.crypto.getRandomValues(values);
  return String(100000 + (values[0] % 900000));
}

function normalizeAccessCode(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 6);
}

function formatAccessCode(value: string) {
  const normalized = normalizeAccessCode(value);
  return normalized.length > 3 ? `${normalized.slice(0, 3)} ${normalized.slice(3)}` : normalized;
}

function accessToken(code: string, codigoPredio: string) {
  const value = `${normalizeAccessCode(code)}|${codigoPredio}|MTC-EXPEDIENTE-DIGITAL`;
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).toUpperCase();
}

function buildSharedAccessLink({
  code,
  codigoPredio,
  includeCode = false,
  printAll = false,
  documentNumber,
}: {
  code: string;
  codigoPredio: string;
  includeCode?: boolean;
  printAll?: boolean;
  documentNumber?: number;
}) {
  const normalizedCode = normalizeAccessCode(code);
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("compartido", "1");
  url.searchParams.set("token", accessToken(normalizedCode, codigoPredio));
  if (includeCode) url.searchParams.set("clave", normalizedCode);
  if (printAll) url.searchParams.set("imprimir", "1");
  url.hash = documentNumber ? `documento-${documentNumber}` : "";
  return url.toString();
}

function createCompleteExpedientePdfBlob(
  documents: DocumentDefinition[],
  reviews: Record<string, ReviewRecord>,
  codigoPredio: string,
  projectLabel: string,
) {
  const lines = [
    "EXPEDIENTE DIGITAL COMPLETO",
    "",
    `Proyecto: ${projectLabel}`,
    `Codigo de predio: ${codigoPredio}`,
    `Total de documentos: ${documents.length}`,
    `Fecha de generacion: ${nowLabel()}`,
    "",
    "INDICE DOCUMENTARIO Y REVISION DE SUPERVISION",
    "",
  ];
  let currentStage = "";
  documents.forEach((document) => {
    if (document.stage !== currentStage) {
      currentStage = document.stage;
      lines.push("", currentStage, "");
    }
    const review = reviews[String(document.number)] ?? emptyReview();
    lines.push(
      `${document.number}. ${document.document}`,
      `   Usuario: ${document.user}`,
      `   Archivo: ${documentFileName(document)}`,
      `   Supervision: ${review.decision}${review.supervisor ? ` | ${review.supervisor}` : ""}${review.reviewedAt ? ` | ${review.reviewedAt}` : ""}`,
      review.comment ? `   Observacion: ${review.comment}` : "",
    );
  });
  return createSimplePdfBlob(`Expediente completo - ${codigoPredio}`, lines.filter(Boolean));
}

function openPrintableBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank");
  if (!opened) {
    downloadBlob(fileName, blob);
    return;
  }
  opened.opener = null;
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function documentFileName(document: DocumentDefinition) {
  return `${String(document.number).padStart(2, "0")}_${slug(document.document)}.pdf`;
}

function createDocumentPdfBlob(
  document: DocumentDefinition,
  codigoPredio: string,
  projectLabel: string,
) {
  return createSimplePdfBlob(document.document, [
    "EXPEDIENTE DIGITAL DEL PREDIO",
    "",
    `Proyecto: ${projectLabel}`,
    `Codigo de predio: ${codigoPredio}`,
    `Etapa: ${document.stage}`,
    `Documento Nro.: ${document.number}`,
    `Documento generado / registrado: ${document.document}`,
    `Usuario que registra: ${document.user}`,
    `Archivo: ${documentFileName(document)}`,
    `Fecha de registro: ${formatDateForDocument(document.number)}`,
    "",
    "CONSTANCIA DEL DOCUMENTO REGISTRADO",
    "",
    "El presente archivo representa el documento incorporado al expediente digital del predio y se encuentra disponible para revision, visto bueno u observacion del supervisor.",
    "",
    "Contenido referencial para el prototipo de gestion predial.",
  ]);
}

function formatDateForDocument(number: number) {
  const date = new Date(Date.UTC(2026, 5, 1 + number));
  return date.toLocaleDateString("es-PE", { timeZone: "UTC" });
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
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

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 70);
}

function createSimplePdfBlob(title: string, rawLines: string[]) {
  const lines = rawLines.flatMap((line) => wrapPdfLine(toPdfAscii(line), 92));
  const pages = chunk(lines.length ? lines : [toPdfAscii(title)], 46);
  const fontObjectNumber = 3 + pages.length * 2;
  const objects = new Map<number, string>();
  const pageObjectNumbers: number[] = [];

  pages.forEach((pageLines, pageIndex) => {
    const pageObjectNumber = 3 + pageIndex * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    pageObjectNumbers.push(pageObjectNumber);
    const content = [
      "BT",
      "/F1 10 Tf",
      "48 790 Td",
      "15 TL",
      ...pageLines.map((line) => `(${escapePdfText(line)}) Tj T*`),
      "ET",
    ].join("\n");
    objects.set(
      pageObjectNumber,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`,
    );
    objects.set(
      contentObjectNumber,
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    );
  });

  objects.set(1, "<< /Type /Catalog /Pages 2 0 R >>");
  objects.set(
    2,
    `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] /Count ${pages.length} >>`,
  );
  objects.set(fontObjectNumber, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let number = 1; number <= fontObjectNumber; number += 1) {
    const body = objects.get(number);
    if (!body) continue;
    offsets[number] = pdf.length;
    pdf += `${number} 0 obj\n${body}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${fontObjectNumber + 1}\n0000000000 65535 f \n`;
  for (let number = 1; number <= fontObjectNumber; number += 1) {
    pdf += `${String(offsets[number] || 0).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${fontObjectNumber + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function wrapPdfLine(value: string, maxLength: number) {
  if (value.length <= maxLength) return [value];
  const words = value.split(" ");
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    if (`${current} ${word}`.trim().length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  });
  if (current) lines.push(current);
  return lines;
}

function chunk<T>(items: T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size));
  }
  return groups;
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function toPdfAscii(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, " ");
}
