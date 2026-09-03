import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronDown,
  FileCode2,
  FileText,
  Landmark,
  Loader2,
  Plus,
  Save,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute(
  "/proyectos/$projectId/predios/$codigo/inscripcion-registral-sid",
)({
  head: () => ({
    meta: [
      { title: "Presentación SID – Inscripción registral" },
      {
        name: "description",
        content:
          "Preparación y envío del acto administrativo a los Registros Públicos (Sunarp) mediante la Plataforma de Interoperabilidad del Estado (PIDE).",
      },
    ],
  }),
  component: InscripcionRegistralSidPage,
});

/* ─── Design tokens ─── */
const RED = "#dc2626";
const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] focus:border-gray-500 focus:outline-none";
const selectCls = inputCls + " appearance-none";
const readonlyCls =
  "h-8 w-full rounded border border-gray-200 bg-gray-100 px-2 text-[12px] text-gray-600 cursor-default";
const textareaCls =
  "w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-[12px] focus:border-gray-500 focus:outline-none resize-none";

/* ─── Static reference data ─── */
type ZonaRegistral = { id: string; label: string; oficinas: string[] };

const ZONAS_REGISTRALES: ZonaRegistral[] = [
  {
    id: "I",
    label: "Zona Registral N° I – Sede Piura",
    oficinas: ["Piura", "Tumbes", "Sullana", "Chulucanas", "Talara"],
  },
  {
    id: "II",
    label: "Zona Registral N° II – Sede Chiclayo",
    oficinas: ["Chiclayo", "Lambayeque", "Cajamarca", "Chota", "Jaén"],
  },
  {
    id: "III",
    label: "Zona Registral N° III – Sede Moyobamba",
    oficinas: ["Moyobamba", "Tarapoto", "Chachapoyas", "Yurimaguas"],
  },
  {
    id: "IV",
    label: "Zona Registral N° IV – Sede Iquitos",
    oficinas: ["Iquitos", "Pucallpa"],
  },
  {
    id: "V",
    label: "Zona Registral N° V – Sede Trujillo",
    oficinas: ["Trujillo", "Pacasmayo", "Chepén", "Otuzco", "Santiago de Chuco", "Huamachuco"],
  },
  {
    id: "VI",
    label: "Zona Registral N° VI – Sede Pucallpa",
    oficinas: ["Pucallpa", "Aguaytía"],
  },
  {
    id: "VII",
    label: "Zona Registral N° VII – Sede Huancayo",
    oficinas: ["Huancayo", "La Merced", "Tarma", "Satipo"],
  },
  {
    id: "VIII",
    label: "Zona Registral N° VIII – Sede Huancavelica",
    oficinas: ["Huancavelica", "Ayacucho", "Ica"],
  },
  {
    id: "IX",
    label: "Zona Registral N° IX – Sede Lima",
    oficinas: ["Lima", "Callao", "Cañete", "Huacho", "Huaral"],
  },
  {
    id: "X",
    label: "Zona Registral N° X – Sede Cusco",
    oficinas: ["Cusco", "Quillabamba", "Sicuani", "Puerto Maldonado"],
  },
  {
    id: "XI",
    label: "Zona Registral N° XI – Sede Ica",
    oficinas: ["Ica", "Chincha", "Pisco", "Nazca"],
  },
  {
    id: "XII",
    label: "Zona Registral N° XII – Sede Arequipa",
    oficinas: ["Arequipa", "Mollendo", "Camaná"],
  },
  {
    id: "XIII",
    label: "Zona Registral N° XIII – Sede Tacna",
    oficinas: ["Tacna", "Moquegua", "Ilo"],
  },
  {
    id: "XIV",
    label: "Zona Registral N° XIV – Sede Ayacucho",
    oficinas: ["Ayacucho", "Puquio"],
  },
];

const REGISTROS_JURIDICOS = [
  "Registro de Propiedad Inmueble",
  "Registro de Personas Jurídicas",
  "Registro de Bienes Muebles",
  "Registro Personal",
];

const TIPOS_ACTO = [
  "Medida Cautelar / Embargo",
  "Afectación en Uso",
  "Resolución Administrativa de Transferencia",
  "Levantamiento de Medida",
  "Inscripción de Derecho de Vía",
  "Anotación Preventiva",
  "Cancelación de Anotación Preventiva",
  "Transferencia de Dominio",
];

type Interviniente = {
  id: number;
  rol: string;
  tipoDocumento: "DNI" | "RUC";
  documento: string;
  nombre: string;
  consultado: boolean;
};

type FirmaStatus = "none" | "checking" | "valid" | "invalid";

/* ─── Shared sub-components ─── */
function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-5 border-b pb-1 first:mt-0">
      <h3 className="text-[13px] font-semibold" style={{ color: RED }}>
        {children}
      </h3>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-[180px_1fr] items-start gap-2 ${className}`}>
      <label className="mt-1.5 text-right text-[12px] text-gray-700">
        {required && <span style={{ color: RED }}>* </span>}
        {label}
      </label>
      <div>{children}</div>
    </div>
  );
}

function ValidationBadge({ ok, text }: { ok: boolean; text: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${ok ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}
    >
      {ok ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
      {text}
    </span>
  );
}

/* ─── Main page ─── */
function InscripcionRegistralSidPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;

  /* ─ A. Datos Institucionales (autocompletados) ─ */
  const instData = {
    ruc: "20131370301",
    institucion: "Ministerio de Transportes y Comunicaciones",
    organo: "Dirección de Gestión Predial – DDP",
    funcionario: proyecto?.coordinadorPredial || "Gilbert Manuel Aguirre Gómez",
    dniFuncionario: "09875432",
  };

  /* ─ B. Destino Registral ─ */
  const [zonaId, setZonaId] = useState("IX");
  const zona = ZONAS_REGISTRALES.find((z) => z.id === zonaId) ?? ZONAS_REGISTRALES[8];
  const [oficina, setOficina] = useState(zona.oficinas[0]);
  const [registroJuridico, setRegistroJuridico] = useState(REGISTROS_JURIDICOS[0]);
  const [partidaRegistral, setPartidaRegistral] = useState(predio?.part || "");
  const partidaValida = /^\d{5,12}$/.test(partidaRegistral.trim());

  useEffect(() => {
    setOficina(zona.oficinas[0]);
  }, [zona]);

  /* ─ C. Acto a inscribir ─ */
  const [tipoActo, setTipoActo] = useState(TIPOS_ACTO[2]);
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [anioDocumento, setAnioDocumento] = useState("2026");
  const [sumilla, setSumilla] = useState("");

  /* ─ D. Intervinientes ─ */
  const [intervinientes, setIntervinientes] = useState<Interviniente[]>([]);
  const [showAddIntervient, setShowAddIntervient] = useState(false);

  function addInterviniente(i: Interviniente) {
    setIntervinientes((prev) => [...prev, { ...i, id: Date.now() }]);
    setShowAddIntervient(false);
  }
  function removeInterviniente(id: number) {
    setIntervinientes((prev) => prev.filter((x) => x.id !== id));
  }

  /* ─ E. Carga de título y firma digital ─ */
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [firmaStatus, setFirmaStatus] = useState<FirmaStatus>("none");
  const [annexFiles, setAnnexFiles] = useState<File[]>([]);
  const [pdfHash, setPdfHash] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const annexInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handlePdfSelect = useCallback(async (file: File) => {
    setPdfFile(file);
    setFirmaStatus("checking");
    // Simulate SHA-256 hash calculation
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    setPdfHash(hex);
    // Simulate firma check delay
    setTimeout(() => {
      setFirmaStatus("valid");
    }, 2500);
  }, []);

  /* Drag and Drop handlers */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);
  const handleDragLeave = useCallback(() => setDragging(false), []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file?.type === "application/pdf") handlePdfSelect(file);
    },
    [handlePdfSelect],
  );

  /* ─ State: message & payload ─ */
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(
    null,
  );
  const [showPayload, setShowPayload] = useState(false);
  const [sending, setSending] = useState(false);

  /* ─ Validations ─ */
  const allFieldsComplete =
    partidaValida &&
    numeroDocumento.trim() !== "" &&
    sumilla.trim() !== "" &&
    pdfFile !== null &&
    firmaStatus === "valid";

  /* ─ Build JSON Payload ─ */
  const payload = useMemo(() => {
    return {
      header: {
        entidadRuc: instData.ruc,
        entidadNombre: instData.institucion,
        organoEmisor: instData.organo,
        funcionario: instData.funcionario,
        dniFuncionario: instData.dniFuncionario,
        ipOrigen: "192.168.1.45",
        timestampUtc: new Date().toISOString(),
      },
      destinoRegistral: {
        zonaRegistral: zona.label,
        oficinaRegistral: oficina,
        registroJuridico,
        partidaRegistral: partidaRegistral.trim(),
      },
      actoAdministrativo: {
        tipoActo,
        numeroDocumento: `${numeroDocumento}-${anioDocumento}`,
        sumilla: sumilla.trim(),
      },
      intervinientes: intervinientes.map((i) => ({
        rol: i.rol,
        tipoDocumento: i.tipoDocumento,
        documento: i.documento,
        nombre: i.nombre,
      })),
      documento: {
        nombreArchivo: pdfFile?.name || "",
        tipoMime: "application/pdf",
        hashSha256: pdfHash,
        firmaDigital: firmaStatus === "valid" ? "VALIDA_IOFE_INDECOPI" : "PENDIENTE",
        base64: "[contenido en Base64 omitido por longitud]",
      },
      anexos: annexFiles.map((f) => ({ nombre: f.name, tamano: f.size })),
    };
  }, [
    instData,
    zona,
    oficina,
    registroJuridico,
    partidaRegistral,
    tipoActo,
    numeroDocumento,
    anioDocumento,
    sumilla,
    intervinientes,
    pdfFile,
    pdfHash,
    firmaStatus,
    annexFiles,
  ]);

  function handleSend() {
    if (!allFieldsComplete) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setMessage({
        type: "success",
        text: "El acto administrativo fue enviado exitosamente a SUNARP a través de la PIDE. Número de trámite: PIDE-2026-" +
          String(Math.floor(10000 + Math.random() * 90000)),
      });
    }, 3000);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Presentación SID – Inscripción registral"
        badgeLabel="Predio"
        badgeValue={predio?.cod || decodedCodigo}
        badgeSuffix="PIDE / SUNARP"
      />

      <main className="mx-auto max-w-[1400px] p-4">
        <form
          className="rounded border bg-white"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <div className="px-5 py-5">
            {/* Tab header */}
            <div className="border-b mb-3">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border-b-2"
                style={{ borderColor: RED, color: RED }}
              >
                <Landmark size={14} /> Presentación SID
              </div>
            </div>

            {message && (
              <div
                className={`mb-3 rounded border px-3 py-2 text-[12px] ${
                  message.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : message.type === "error"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* ─────── A. DATOS INSTITUCIONALES ─────── */}
            <SectionTitle>A. Datos institucionales y del remitente</SectionTitle>
            <div className="rounded border border-gray-200 bg-gray-50/50 p-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <Field label="RUC Entidad Pública">
                  <div className="flex items-center gap-2">
                    <input className={readonlyCls} value={instData.ruc} readOnly />
                    <Building2 size={14} className="shrink-0 text-gray-400" />
                  </div>
                </Field>
                <Field label="Nombre Institución">
                  <input className={readonlyCls} value={instData.institucion} readOnly />
                </Field>
                <Field label="Órgano / Área emisora">
                  <input className={readonlyCls} value={instData.organo} readOnly />
                </Field>
                <Field label="Funcionario responsable">
                  <input className={readonlyCls} value={instData.funcionario} readOnly />
                </Field>
                <Field label="DNI Funcionario">
                  <input className={readonlyCls} value={instData.dniFuncionario} readOnly />
                </Field>
              </div>
            </div>

            {/* ─────── B. DESTINO REGISTRAL ─────── */}
            <SectionTitle>B. Destino registral (SUNARP)</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field label="Zona Registral" required>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={zonaId}
                    onChange={(e) => setZonaId(e.target.value)}
                  >
                    {ZONAS_REGISTRALES.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-2 top-2.5 text-gray-400"
                  />
                </div>
              </Field>
              <Field label="Oficina Registral" required>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={oficina}
                    onChange={(e) => setOficina(e.target.value)}
                  >
                    {zona.oficinas.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-2 top-2.5 text-gray-400"
                  />
                </div>
              </Field>
              <Field label="Registro Jurídico" required>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={registroJuridico}
                    onChange={(e) => setRegistroJuridico(e.target.value)}
                  >
                    {REGISTROS_JURIDICOS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-2 top-2.5 text-gray-400"
                  />
                </div>
              </Field>
              <Field label="N° Partida Registral" required>
                <div className="space-y-1">
                  <input
                    className={inputCls}
                    value={partidaRegistral}
                    onChange={(e) => setPartidaRegistral(e.target.value)}
                    placeholder="Ej. 11085444"
                  />
                  {partidaRegistral.trim() !== "" && (
                    <ValidationBadge
                      ok={partidaValida}
                      text={partidaValida ? "Formato válido" : "Debe tener entre 5 y 12 dígitos"}
                    />
                  )}
                </div>
              </Field>
            </div>

            {/* ─────── C. ACTO A INSCRIBIR ─────── */}
            <SectionTitle>C. Datos del acto o título a inscribir</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field label="Tipo de Acto Administrativo" required>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={tipoActo}
                    onChange={(e) => setTipoActo(e.target.value)}
                  >
                    {TIPOS_ACTO.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-2 top-2.5 text-gray-400"
                  />
                </div>
              </Field>
              <Field label="N° y Año del Documento" required>
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value)}
                    placeholder="Res. Gerencial N° 124"
                  />
                  <input
                    className={`${inputCls} w-24 shrink-0`}
                    value={anioDocumento}
                    onChange={(e) => setAnioDocumento(e.target.value)}
                    placeholder="Año"
                  />
                </div>
              </Field>
            </div>
            <div className="mt-2">
              <Field label="Resumen / Sumilla" required>
                <div className="space-y-1">
                  <textarea
                    className={textareaCls}
                    rows={3}
                    maxLength={500}
                    value={sumilla}
                    onChange={(e) => setSumilla(e.target.value)}
                    placeholder="Describa brevemente el acto administrativo a inscribir..."
                  />
                  <div className="text-right text-[10px] text-gray-400">
                    {sumilla.length}/500 caracteres
                  </div>
                </div>
              </Field>
            </div>

            {/* ─────── D. INTERVINIENTES ─────── */}
            <SectionTitle>D. Personas / Intervinientes vinculados</SectionTitle>
            <p className="mb-2 text-[11px] text-gray-500">
              Consulta interoperabilidad RENIEC / SUNAT mediante PIDE.
            </p>

            <button
              type="button"
              onClick={() => setShowAddIntervient(true)}
              className="mb-2 inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[12px] text-white"
              style={{ background: "#5eaaa8" }}
            >
              <Plus size={14} /> Agregar interviniente
            </button>

            {intervinientes.length > 0 && (
              <div className="overflow-x-auto rounded border">
                <table className="min-w-full text-[12px]">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-2 py-2 font-semibold">ROL</th>
                      <th className="px-2 py-2 font-semibold">TIPO DOC.</th>
                      <th className="px-2 py-2 font-semibold">N° DOCUMENTO</th>
                      <th className="px-2 py-2 font-semibold">NOMBRE / RAZÓN SOCIAL</th>
                      <th className="px-2 py-2 font-semibold">PIDE</th>
                      <th className="px-2 py-2 text-center font-semibold">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intervinientes.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-gray-50">
                        <td className="px-2 py-2">{item.rol}</td>
                        <td className="px-2 py-2">{item.tipoDocumento}</td>
                        <td className="px-2 py-2">{item.documento}</td>
                        <td className="px-2 py-2 font-medium" style={{ color: RED }}>
                          {item.nombre}
                        </td>
                        <td className="px-2 py-2">
                          {item.consultado ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-semibold text-green-700">
                              <CheckCircle2 size={10} /> Verificado
                            </span>
                          ) : (
                            <span className="text-[9px] text-gray-400">Pendiente</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeInterviniente(item.id)}
                            className="inline-flex size-7 items-center justify-center rounded border"
                            style={{ color: RED }}
                            title="Eliminar"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {intervinientes.length === 0 && (
              <div className="rounded border border-dashed border-gray-300 bg-gray-50 py-4 text-center text-[11px] text-gray-400">
                No se han agregado intervinientes. Use el botón superior para añadir.
              </div>
            )}

            {/* ─────── E. CARGA DE TÍTULO Y FIRMA DIGITAL ─────── */}
            <SectionTitle>E. Carga del título y firma digital (PAdES / Indecopi)</SectionTitle>

            {/* Drag & Drop zone */}
            <div
              ref={dropRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                dragging
                  ? "border-red-400 bg-red-50"
                  : pdfFile
                    ? "border-green-300 bg-green-50/30"
                    : "border-gray-300 bg-gray-50/50"
              }`}
            >
              {pdfFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <FileText size={20} className="text-green-600" />
                    <span className="text-[13px] font-medium text-gray-800">{pdfFile.name}</span>
                    <span className="text-[10px] text-gray-500">
                      ({(pdfFile.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPdfFile(null);
                        setFirmaStatus("none");
                        setPdfHash("");
                      }}
                      className="inline-flex size-6 items-center justify-center rounded text-gray-500 hover:bg-gray-200"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  {/* Firma status */}
                  <div className="flex items-center justify-center gap-3">
                    {firmaStatus === "checking" && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-blue-600">
                        <Loader2 size={13} className="animate-spin" />
                        Verificando firma digital...
                      </span>
                    )}
                    {firmaStatus === "valid" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold text-green-700">
                        <ShieldCheck size={12} />
                        Firma digital cualificada válida (IOFE / Indecopi)
                      </span>
                    )}
                    {firmaStatus === "invalid" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-700">
                        <AlertCircle size={12} />
                        Firma digital no válida o no encontrada
                      </span>
                    )}
                  </div>
                  {/* Hash */}
                  {pdfHash && (
                    <div className="mt-1 rounded border border-gray-200 bg-white px-3 py-1.5">
                      <div className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                        SHA-256
                      </div>
                      <div className="mt-0.5 break-all font-mono text-[9px] text-gray-600">
                        {pdfHash}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload size={28} className="mx-auto text-gray-400" />
                  <p className="text-[12px] text-gray-600">
                    Arrastre el documento PDF/A firmado aquí o{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="font-semibold underline"
                      style={{ color: RED }}
                    >
                      seleccione un archivo
                    </button>
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Formato PDF con firma digital PAdES cualificada
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePdfSelect(f);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />
            </div>

            {/* Annexes */}
            <div className="mt-3 rounded border border-gray-200 bg-white px-3 py-2.5">
              <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-1.5">
                <h4 className="text-[11px] font-semibold text-gray-600">
                  Anexos complementarios (opcional)
                </h4>
                <button
                  type="button"
                  onClick={() => annexInputRef.current?.click()}
                  className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-[10px] hover:bg-gray-50"
                >
                  <Plus size={11} /> Agregar anexo
                </button>
                <input
                  ref={annexInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setAnnexFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                    }
                    if (annexInputRef.current) annexInputRef.current.value = "";
                  }}
                />
              </div>
              {annexFiles.length > 0 ? (
                <div className="space-y-1">
                  {annexFiles.map((f, i) => (
                    <div
                      key={`${f.name}-${i}`}
                      className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-2 py-1"
                    >
                      <div className="flex items-center gap-1.5">
                        <FileText size={12} className="text-gray-400" />
                        <span className="text-[11px]">{f.name}</span>
                        <span className="text-[9px] text-gray-400">
                          ({(f.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAnnexFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-gray-400">Sin anexos adjuntos</p>
              )}
            </div>

            {/* ─────── VALIDATION SUMMARY ─────── */}
            <div className="mt-5 rounded border border-gray-200 bg-gray-50 px-3 py-2.5">
              <h4 className="mb-2 text-[11px] font-semibold text-gray-600">
                Validación previa al envío
              </h4>
              <div className="flex flex-wrap gap-2">
                <ValidationBadge ok={partidaValida} text="Partida registral" />
                <ValidationBadge ok={numeroDocumento.trim() !== ""} text="N° documento" />
                <ValidationBadge ok={sumilla.trim() !== ""} text="Sumilla" />
                <ValidationBadge ok={pdfFile !== null} text="PDF cargado" />
                <ValidationBadge ok={firmaStatus === "valid"} text="Firma digital" />
              </div>
            </div>

            {/* ─────── PAYLOAD PREVIEW ─────── */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowPayload(!showPayload)}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700"
              >
                <FileCode2 size={13} />
                {showPayload ? "Ocultar" : "Mostrar"} payload técnico (JSON/PIDE)
              </button>
              {showPayload && (
                <div className="mt-2 max-h-[400px] overflow-auto rounded border border-gray-300 bg-gray-900 p-3">
                  <pre className="whitespace-pre-wrap text-[10px] leading-relaxed text-green-400">
                    {JSON.stringify(payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* ─────── ACTIONS ─────── */}
            <div className="mt-5 flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50"
              >
                <X size={14} /> Cancelar
              </button>
              <button
                type="button"
                onClick={() => setMessage({ type: "info", text: "Borrador guardado correctamente." })}
                className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50"
              >
                <Save size={14} /> Guardar borrador
              </button>
              <button
                type="submit"
                disabled={!allFieldsComplete || sending}
                className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white disabled:opacity-50"
                style={{ background: RED }}
              >
                {sending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Enviando a SUNARP...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Enviar a SUNARP vía PIDE
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* ─────── ADD INTERVINIENTE DIALOG ─────── */}
      {showAddIntervient && (
        <IntervinienteDialog
          onClose={() => setShowAddIntervient(false)}
          onAdd={addInterviniente}
        />
      )}

      {/* Sending overlay */}
      {sending && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/40">
          <div className="rounded-lg bg-white p-8 text-center shadow-xl">
            <Loader2 size={40} className="mx-auto animate-spin text-red-600" />
            <p className="mt-3 text-[14px] font-semibold text-gray-700">
              Transmitiendo a SUNARP vía PIDE...
            </p>
            <p className="mt-1 text-[11px] text-gray-500">
              Conectando con el endpoint de interoperabilidad del Estado
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Interviniente Dialog ─── */
function IntervinienteDialog({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (i: Interviniente) => void;
}) {
  const [form, setForm] = useState<Omit<Interviniente, "id">>({
    rol: "Afectado",
    tipoDocumento: "DNI",
    documento: "",
    nombre: "",
    consultado: false,
  });
  const [consultando, setConsultando] = useState(false);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((c) => ({ ...c, [key]: value }));
  }

  function consultarPide() {
    if (!form.documento.trim()) return;
    setConsultando(true);
    setTimeout(() => {
      if (form.tipoDocumento === "DNI") {
        setForm((c) => ({
          ...c,
          nombre: "ERICK SIMON ESCALANTE OLANO",
          consultado: true,
        }));
      } else {
        setForm((c) => ({
          ...c,
          nombre: "CORPORACIÓN ANDINA DE FOMENTO S.A.C.",
          consultado: true,
        }));
      }
      setConsultando(false);
    }, 1800);
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-[480px] rounded-lg bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {consultando && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-white/90">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="mt-2 text-[12px] font-semibold text-gray-700">
              Consultando {form.tipoDocumento === "DNI" ? "RENIEC" : "SUNAT"} vía PIDE...
            </p>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <div className="text-[14px]">
            <span className="text-gray-700">Agregar </span>
            <span className="font-semibold" style={{ color: RED }}>
              INTERVINIENTE
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-7 items-center justify-center rounded hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2">
          <Field label="Rol" required>
            <div className="relative">
              <select
                className={selectCls}
                value={form.rol}
                onChange={(e) => setField("rol", e.target.value)}
              >
                <option>Afectado</option>
                <option>Titular</option>
                <option>Beneficiario</option>
                <option>Representante Legal</option>
              </select>
              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-2 top-2.5 text-gray-400"
              />
            </div>
          </Field>
          <Field label="Tipo Documento" required>
            <div className="relative">
              <select
                className={selectCls}
                value={form.tipoDocumento}
                onChange={(e) =>
                  setField("tipoDocumento", e.target.value as "DNI" | "RUC")
                }
              >
                <option>DNI</option>
                <option>RUC</option>
              </select>
              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-2 top-2.5 text-gray-400"
              />
            </div>
          </Field>
          <Field label="N° Documento" required>
            <div className="space-y-1">
              <input
                className={inputCls}
                value={form.documento}
                onChange={(e) => setField("documento", e.target.value)}
                placeholder={form.tipoDocumento === "DNI" ? "Ej. 70021899" : "Ej. 20131370301"}
              />
              <button
                type="button"
                onClick={consultarPide}
                disabled={!form.documento.trim()}
                className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded border border-blue-200 bg-blue-50 px-3 text-[11px] font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-40"
              >
                <Search size={13} />
                Consultar {form.tipoDocumento === "DNI" ? "RENIEC" : "SUNAT"} vía PIDE
              </button>
              {form.consultado && (
                <div className="flex items-center gap-1.5 rounded border border-green-200 bg-green-50 px-2 py-1">
                  <CheckCircle2 size={12} className="shrink-0 text-green-600" />
                  <span className="text-[10px] text-green-700">
                    Identidad verificada por {form.tipoDocumento === "DNI" ? "RENIEC" : "SUNAT"}
                  </span>
                </div>
              )}
            </div>
          </Field>
          <Field label="Nombre / Razón Social" required>
            <input
              className={form.consultado ? readonlyCls : inputCls}
              value={form.nombre}
              onChange={(e) => setField("nombre", e.target.value)}
              readOnly={form.consultado}
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => onAdd({ ...form, id: 0 })}
            disabled={!form.documento.trim() || !form.nombre.trim()}
            className="inline-flex items-center gap-1.5 rounded px-6 py-1.5 text-[12px] text-white disabled:opacity-50"
            style={{ background: RED }}
          >
            <Plus size={14} /> Agregar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-6 py-1.5 text-[12px] hover:bg-gray-50"
          >
            <X size={14} /> Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
