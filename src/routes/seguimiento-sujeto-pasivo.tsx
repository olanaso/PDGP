import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Fingerprint,
  FolderOpen,
  HelpCircle,
  Hourglass,
  KeyRound,
  LandPlot,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  RefreshCw,
  Send,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import bg from "../assets/login-bg.png";

export const Route = createFileRoute("/seguimiento-sujeto-pasivo")({
  head: () => ({
    meta: [
      { title: "Consulta de seguimiento predial — MTC" },
      {
        name: "description",
        content:
          "Consulta individual del sujeto pasivo sobre el estado, avance y documentos de sus predios y expedientes.",
      },
    ],
  }),
  component: SubjectTrackingPage,
});

type AccessStep = "dni" | "otp" | "portal";
type TimingStatus = "Atrasado" | "Adelantado" | "En plazo" | "Finalizado";
type TimelineStatus = "completed" | "current" | "pending";

type GeneratedDocument = {
  id: string;
  title: string;
  type: string;
  number: string;
  date: string;
  size: string;
  stage: string;
};

type TimelineItem = {
  id: string;
  title: string;
  description: string;
  status: TimelineStatus;
  date?: string;
  duration?: string;
  documentIds: string[];
};

type PropertyRecord = {
  id: string;
  code: string;
  project: string;
  expediente: string;
  location: string;
  affectedArea: string;
  modality: string;
  progress: number;
  currentStage: string;
  stageNumber: number;
  totalStages: number;
  timing: TimingStatus;
  timingDays: number;
  daysInStage: number;
  plannedDays: number;
  updatedAt: string;
  expectedDate: string;
  nextAction: string;
  responsible: string;
  documents: GeneratedDocument[];
  timeline: TimelineItem[];
};

type SubjectRecord = {
  dni: string;
  name: string;
  email: string;
  maskedEmail: string;
  phone: string;
  properties: PropertyRecord[];
};

type Feedback = { kind: "success" | "error" | "info"; text: string };

const firstDocuments: GeneratedDocument[] = [
  {
    id: "doc-ficha-0567",
    title: "Ficha de identificación y codificación del predio",
    type: "Ficha predial",
    number: "FP-AERO-JAUJA-0567",
    date: "12/05/2026",
    size: "486 KB",
    stage: "Identificación",
  },
  {
    id: "doc-cri-0567",
    title: "Certificado registral inmobiliario",
    type: "Certificado registral",
    number: "CRI-2026-004812",
    date: "20/05/2026",
    size: "1.8 MB",
    stage: "Diagnóstico técnico-legal",
  },
  {
    id: "doc-plano-0567",
    title: "Plano de afectación predial",
    type: "Plano técnico",
    number: "PTKT-00567-01",
    date: "02/06/2026",
    size: "2.4 MB",
    stage: "Expediente técnico-legal",
  },
  {
    id: "doc-memoria-0567",
    title: "Memoria descriptiva del área afectada",
    type: "Memoria descriptiva",
    number: "MD-AJ-0567-2026",
    date: "02/06/2026",
    size: "782 KB",
    stage: "Expediente técnico-legal",
  },
  {
    id: "doc-itl-0567",
    title: "Informe técnico legal del predio",
    type: "Informe técnico legal",
    number: "ITL-178-2026-MTC/20.11",
    date: "10/06/2026",
    size: "1.2 MB",
    stage: "Expediente técnico-legal",
  },
  {
    id: "doc-itt-0567",
    title: "Informe técnico de tasación",
    type: "Tasación",
    number: "3541-2026-MTC/DDP",
    date: "08/07/2026",
    size: "3.1 MB",
    stage: "Tasación",
  },
  {
    id: "doc-carta-0567",
    title: "Carta de intención de adquisición",
    type: "Comunicación",
    number: "CARTA-421-2026-MTC/20",
    date: "16/07/2026",
    size: "594 KB",
    stage: "Trato directo",
  },
];

const secondDocuments: GeneratedDocument[] = [
  {
    id: "doc-ficha-0612",
    title: "Ficha de identificación y codificación del predio",
    type: "Ficha predial",
    number: "FP-AERO-JAUJA-0612",
    date: "18/03/2026",
    size: "472 KB",
    stage: "Identificación",
  },
  {
    id: "doc-cri-0612",
    title: "Certificado registral inmobiliario",
    type: "Certificado registral",
    number: "CRI-2026-003104",
    date: "25/03/2026",
    size: "1.5 MB",
    stage: "Diagnóstico técnico-legal",
  },
  {
    id: "doc-itl-0612",
    title: "Informe técnico legal del predio",
    type: "Informe técnico legal",
    number: "ITL-102-2026-MTC/20.11",
    date: "15/04/2026",
    size: "1.1 MB",
    stage: "Expediente técnico-legal",
  },
  {
    id: "doc-itt-0612",
    title: "Informe técnico de tasación",
    type: "Tasación",
    number: "2987-2026-MTC/DDP",
    date: "20/05/2026",
    size: "2.7 MB",
    stage: "Tasación",
  },
  {
    id: "doc-aceptacion-0612",
    title: "Acta de aceptación de la oferta",
    type: "Acta",
    number: "ACTA-078-2026-MTC/20",
    date: "24/07/2026",
    size: "648 KB",
    stage: "Aceptación",
  },
];

const subjectData: SubjectRecord = {
  dni: "45678912",
  name: "María Quispe Huamán",
  email: "maria.quispe@email.com",
  maskedEmail: "m***.q*****@email.com",
  phone: "*** *** 482",
  properties: [
    {
      id: "property-0567",
      code: "AERO-JAUJA-PR-0567T",
      project: "Aeropuerto de Jauja",
      expediente: "EXP-3546-2023-MTC/DDP",
      location: "Distrito de Acolla, provincia de Jauja, Junín",
      affectedArea: "1,250.40 m²",
      modality: "Trato directo",
      progress: 58,
      currentStage: "Respuesta del sujeto pasivo",
      stageNumber: 7,
      totalStages: 12,
      timing: "Atrasado",
      timingDays: 4,
      daysInStage: 18,
      plannedDays: 14,
      updatedAt: "31/08/2026, 16:45",
      expectedDate: "05/09/2026",
      nextAction: "Registrar la respuesta a la carta de intención y completar la validación legal.",
      responsible: "Coordinación Predial Aeropuertos 02",
      documents: firstDocuments,
      timeline: [
        {
          id: "tl-0567-1",
          title: "Identificación e individualización",
          description: "El predio y el área requerida fueron identificados y codificados.",
          status: "completed",
          date: "12/05/2026",
          duration: "5 días",
          documentIds: ["doc-ficha-0567"],
        },
        {
          id: "tl-0567-2",
          title: "Diagnóstico técnico-legal",
          description: "Se verificaron titularidad, antecedentes registrales y condición física.",
          status: "completed",
          date: "20/05/2026",
          duration: "8 días",
          documentIds: ["doc-cri-0567"],
        },
        {
          id: "tl-0567-3",
          title: "Expediente técnico-legal completo",
          description: "Se integraron plano, memoria descriptiva e informe técnico legal.",
          status: "completed",
          date: "10/06/2026",
          duration: "21 días",
          documentIds: ["doc-plano-0567", "doc-memoria-0567", "doc-itl-0567"],
        },
        {
          id: "tl-0567-4",
          title: "Tasación",
          description: "El órgano tasador determinó y aprobó el valor del inmueble afectado.",
          status: "completed",
          date: "08/07/2026",
          duration: "28 días",
          documentIds: ["doc-itt-0567"],
        },
        {
          id: "tl-0567-5",
          title: "Notificación de la intención de adquisición",
          description: "La carta de intención y la oferta económica fueron notificadas.",
          status: "completed",
          date: "16/07/2026",
          duration: "8 días",
          documentIds: ["doc-carta-0567"],
        },
        {
          id: "tl-0567-6",
          title: "Respuesta del sujeto pasivo",
          description: "Se encuentra pendiente registrar la aceptación u observación a la oferta.",
          status: "current",
          date: "En curso",
          duration: "18 de 14 días",
          documentIds: [],
        },
        {
          id: "tl-0567-7",
          title: "Resolución de adquisición",
          description: "Se iniciará después de completar la respuesta y la validación legal.",
          status: "pending",
          documentIds: [],
        },
        {
          id: "tl-0567-8",
          title: "Pago y entrega de posesión",
          description: "Comprende programación, abono y suscripción del acta de entrega.",
          status: "pending",
          documentIds: [],
        },
        {
          id: "tl-0567-9",
          title: "Inscripción y cierre",
          description: "Presentación ante SUNARP y cierre del expediente predial.",
          status: "pending",
          documentIds: [],
        },
      ],
    },
    {
      id: "property-0612",
      code: "AERO-JAUJA-PR-0612T",
      project: "Aeropuerto de Jauja",
      expediente: "EXP-4021-2024-MTC/DDP",
      location: "Distrito de Yauyos, provincia de Jauja, Junín",
      affectedArea: "842.75 m²",
      modality: "Trato directo",
      progress: 76,
      currentStage: "Resolución de adquisición",
      stageNumber: 9,
      totalStages: 12,
      timing: "Adelantado",
      timingDays: 6,
      daysInStage: 4,
      plannedDays: 10,
      updatedAt: "02/09/2026, 10:20",
      expectedDate: "12/09/2026",
      nextAction: "Emitir y notificar la resolución que aprueba la adquisición del predio.",
      responsible: "Coordinación Predial Aeropuertos 02",
      documents: secondDocuments,
      timeline: [
        {
          id: "tl-0612-1",
          title: "Identificación e individualización",
          description: "Predio y afectación identificados.",
          status: "completed",
          date: "18/03/2026",
          duration: "4 días",
          documentIds: ["doc-ficha-0612"],
        },
        {
          id: "tl-0612-2",
          title: "Diagnóstico técnico-legal",
          description: "Antecedentes técnicos y registrales validados.",
          status: "completed",
          date: "25/03/2026",
          duration: "7 días",
          documentIds: ["doc-cri-0612"],
        },
        {
          id: "tl-0612-3",
          title: "Expediente técnico-legal completo",
          description: "Expediente conformado y remitido para tasación.",
          status: "completed",
          date: "15/04/2026",
          duration: "21 días",
          documentIds: ["doc-itl-0612"],
        },
        {
          id: "tl-0612-4",
          title: "Tasación",
          description: "Valor de tasación aprobado.",
          status: "completed",
          date: "20/05/2026",
          duration: "35 días",
          documentIds: ["doc-itt-0612"],
        },
        {
          id: "tl-0612-5",
          title: "Trato directo y aceptación",
          description: "Oferta notificada y aceptada por el sujeto pasivo.",
          status: "completed",
          date: "24/07/2026",
          duration: "19 días",
          documentIds: ["doc-aceptacion-0612"],
        },
        {
          id: "tl-0612-6",
          title: "Resolución de adquisición",
          description: "La resolución se encuentra en elaboración y revisión de firmas.",
          status: "current",
          date: "En curso",
          duration: "4 de 10 días",
          documentIds: [],
        },
        {
          id: "tl-0612-7",
          title: "Pago y entrega de posesión",
          description: "Pendiente de la resolución de adquisición.",
          status: "pending",
          documentIds: [],
        },
        {
          id: "tl-0612-8",
          title: "Inscripción y cierre",
          description: "Pendiente de las actuaciones anteriores.",
          status: "pending",
          documentIds: [],
        },
      ],
    },
  ],
};

function SubjectTrackingPage() {
  const [step, setStep] = useState<AccessStep>("dni");
  const [dni, setDni] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [attempts, setAttempts] = useState(3);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [selectedPropertyId, setSelectedPropertyId] = useState(subjectData.properties[0].id);
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "documents">("timeline");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const selectedProperty =
    subjectData.properties.find((property) => property.id === selectedPropertyId) ??
    subjectData.properties[0];

  useEffect(() => {
    if (step === "otp") otpRefs.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setResendSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  function sendDynamicCode(event?: FormEvent) {
    event?.preventDefault();
    if (!/^\d{8}$/.test(dni)) {
      setFeedback({ kind: "error", text: "Ingrese un número de DNI válido de 8 dígitos." });
      return;
    }
    setLoading(true);
    setFeedback(null);
    window.setTimeout(() => {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedCode(code);
      setOtp(Array(6).fill(""));
      setAttempts(3);
      setResendSeconds(45);
      setLoading(false);
      setStep("otp");
      setFeedback({
        kind: "success",
        text: `Enviamos una clave dinámica al correo ${subjectData.maskedEmail}.`,
      });
    }, 650);
  }

  function updateOtp(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setFeedback(null);
    if (digit && index < otp.length - 1) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKey(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function pasteOtp(event: ClipboardEvent<HTMLDivElement>) {
    const value = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!value) return;
    event.preventDefault();
    const next = Array(6)
      .fill("")
      .map((_, index) => value[index] ?? "");
    setOtp(next);
    otpRefs.current[Math.min(value.length, 6) - 1]?.focus();
  }

  function verifyCode(event: FormEvent) {
    event.preventDefault();
    if (otp.join("") !== generatedCode) {
      const remaining = attempts - 1;
      setAttempts(remaining);
      setFeedback({
        kind: "error",
        text:
          remaining > 0
            ? `La clave ingresada no es correcta. Le quedan ${remaining} intentos.`
            : "La clave fue bloqueada. Solicite una nueva para continuar.",
      });
      if (remaining <= 0) setOtp(Array(6).fill(""));
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setFeedback(null);
      setStep("portal");
    }, 500);
  }

  function resendCode() {
    if (resendSeconds > 0) return;
    sendDynamicCode();
  }

  function logout() {
    setStep("dni");
    setDni("");
    setOtp(Array(6).fill(""));
    setGeneratedCode("");
    setFeedback(null);
    setSelectedDocument(null);
  }

  async function downloadDocument(document: GeneratedDocument) {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    pdf.setTextColor(220, 38, 38);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.text("MINISTERIO DE TRANSPORTES Y COMUNICACIONES", 20, 24);
    pdf.setDrawColor(220, 38, 38);
    pdf.line(20, 29, 190, 29);
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(13);
    pdf.text(document.title, 20, 43, { maxWidth: 170 });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const lines = [
      `Documento: ${document.number}`,
      `Tipo: ${document.type}`,
      `Fecha de generación: ${document.date}`,
      `Sujeto pasivo: ${subjectData.name}`,
      `DNI: ${dni || subjectData.dni}`,
      `Predio: ${selectedProperty.code}`,
      `Expediente: ${selectedProperty.expediente}`,
      `Proyecto: ${selectedProperty.project}`,
      `Etapa: ${document.stage}`,
    ];
    lines.forEach((line, index) => pdf.text(line, 20, 64 + index * 8));
    pdf.setFontSize(9);
    pdf.setTextColor(107, 114, 128);
    pdf.text(
      "Documento demostrativo generado desde la consulta individual de seguimiento predial.",
      20,
      148,
    );
    pdf.save(`${document.number.replace(/[^A-Za-z0-9_-]/g, "-")}.pdf`);
  }

  if (step !== "portal") {
    return (
      <AccessScreen
        step={step}
        dni={dni}
        otp={otp}
        feedback={feedback}
        loading={loading}
        attempts={attempts}
        resendSeconds={resendSeconds}
        generatedCode={generatedCode}
        otpRefs={otpRefs}
        onDniChange={(value) => setDni(value.replace(/\D/g, "").slice(0, 8))}
        onSendCode={sendDynamicCode}
        onUpdateOtp={updateOtp}
        onOtpKey={handleOtpKey}
        onPasteOtp={pasteOtp}
        onVerify={verifyCode}
        onResend={resendCode}
        onBack={() => {
          setStep("dni");
          setOtp(Array(6).fill(""));
          setFeedback(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 lg:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#dc2626] text-[12px] font-black text-white">
              MTC
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#dc2626]">
                Consulta individual
              </p>
              <h1 className="truncate text-[15px] font-bold text-slate-900 sm:text-[17px]">
                Seguimiento de predios y expedientes
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-[11px] font-semibold text-slate-800">{subjectData.name}</p>
              <p className="text-[9px] text-slate-500">DNI {dni}</p>
            </div>
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-red-50 text-[#dc2626]">
              <UserRound size={16} />
            </span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-red-200 px-3 text-[10px] font-semibold text-[#dc2626] hover:bg-red-50"
            >
              <LogOut size={13} /> <span className="hidden sm:inline">Cerrar consulta</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-4 p-4 lg:p-6">
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-red-50 text-[#dc2626]">
              <Fingerprint size={21} />
            </span>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                Sujeto pasivo verificado
              </p>
              <h2 className="text-[16px] font-bold text-slate-900">{subjectData.name}</h2>
              <p className="text-[10px] text-slate-500">
                DNI {dni} · {subjectData.maskedEmail} · Teléfono {subjectData.phone}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-[10px] font-semibold text-green-700">
            <ShieldCheck size={15} /> Identidad validada con clave dinámica
          </div>
        </section>

        <div className="grid items-start gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-wide text-[#dc2626]">
                Consulta personal
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <h2 className="text-[14px] font-bold text-slate-900">Mis predios y expedientes</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                  {subjectData.properties.length} registrados
                </span>
              </div>
            </div>
            <div className="space-y-2 p-3">
              {subjectData.properties.map((property) => {
                const active = selectedProperty.id === property.id;
                return (
                  <button
                    key={property.id}
                    type="button"
                    onClick={() => {
                      setSelectedPropertyId(property.id);
                      setActiveTab("timeline");
                    }}
                    className={`w-full rounded-md border p-3 text-left transition ${
                      active
                        ? "border-red-300 bg-red-50/70 shadow-sm"
                        : "border-slate-200 bg-white hover:border-red-200 hover:bg-red-50/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`font-mono text-[10px] font-bold ${active ? "text-[#dc2626]" : "text-slate-700"}`}
                      >
                        {property.code}
                      </span>
                      <ChevronRight
                        size={14}
                        className={active ? "text-[#dc2626]" : "text-slate-400"}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] font-semibold text-slate-800">
                      {property.project}
                    </p>
                    <p className="mt-0.5 text-[9px] text-slate-500">{property.expediente}</p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[#dc2626]"
                        style={{ width: `${property.progress}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[9px]">
                      <span className="font-semibold text-slate-600">
                        {property.progress}% de avance
                      </span>
                      <TimingBadge status={property.timing} compact />
                    </div>
                    <p className="mt-2 line-clamp-2 text-[9px] leading-4 text-slate-500">
                      Etapa actual:{" "}
                      <strong className="text-slate-700">{property.currentStage}</strong>
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="border-t border-blue-100 bg-blue-50 px-4 py-3 text-[9px] leading-4 text-blue-700">
              Solo se muestran predios donde su DNI figura como titular, posesionario o sujeto
              pasivo validado.
            </div>
          </aside>

          <div className="min-w-0 space-y-4">
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-4 lg:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-mono text-[15px] font-black text-slate-900">
                        {selectedProperty.code}
                      </h2>
                      <TimingBadge status={selectedProperty.timing} />
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-slate-700">
                      {selectedProperty.project}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      Expediente {selectedProperty.expediente}
                    </p>
                  </div>
                  <div className="text-left lg:text-right">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Última actualización
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-700">
                      {selectedProperty.updatedAt}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:p-5">
                <div>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                        Avance general
                      </p>
                      <p className="mt-1 text-[12px] font-semibold text-slate-800">
                        Etapa {selectedProperty.stageNumber} de {selectedProperty.totalStages}:{" "}
                        {selectedProperty.currentStage}
                      </p>
                    </div>
                    <span className="text-[24px] font-black text-[#dc2626]">
                      {selectedProperty.progress}%
                    </span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
                      style={{ width: `${selectedProperty.progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[9px] font-medium text-slate-400">
                    <span>Inicio</span>
                    <span>Adquisición</span>
                    <span>Pago</span>
                    <span>Cierre registral</span>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <InfoCard
                      icon={Clock3}
                      label="Tiempo en etapa"
                      value={`${selectedProperty.daysInStage} días`}
                    />
                    <InfoCard
                      icon={CalendarClock}
                      label="Plazo previsto"
                      value={`${selectedProperty.plannedDays} días`}
                    />
                    <InfoCard
                      icon={FileCheck2}
                      label="Documentos generados"
                      value={`${selectedProperty.documents.length} archivos`}
                    />
                  </div>
                </div>

                <div
                  className={`rounded-md border p-3 ${timingPanelClass(selectedProperty.timing)}`}
                >
                  <div className="flex items-start gap-2">
                    {selectedProperty.timing === "Atrasado" ? (
                      <AlertCircle size={18} />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                    <div>
                      <p className="text-[11px] font-bold">
                        {selectedProperty.timing === "Atrasado"
                          ? `${selectedProperty.timingDays} días de atraso`
                          : selectedProperty.timing === "Adelantado"
                            ? `${selectedProperty.timingDays} días adelantado`
                            : selectedProperty.timing}
                      </p>
                      <p className="mt-1 text-[9px] leading-4">
                        {selectedProperty.timing === "Atrasado"
                          ? "La etapa superó el plazo previsto y requiere completar la acción pendiente."
                          : "El expediente avanza dentro de un tiempo menor al plazo previsto."}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-current/15 pt-2">
                    <p className="text-[8px] font-bold uppercase tracking-wide opacity-70">
                      Próxima acción
                    </p>
                    <p className="mt-1 text-[9px] font-medium leading-4">
                      {selectedProperty.nextAction}
                    </p>
                    <p className="mt-2 text-[9px]">
                      Fecha estimada: <strong>{selectedProperty.expectedDate}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="grid divide-y divide-slate-200 border-b border-slate-200 bg-slate-50 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                <Detail icon={MapPin} label="Ubicación" value={selectedProperty.location} />
                <Detail
                  icon={LandPlot}
                  label="Área afectada"
                  value={selectedProperty.affectedArea}
                />
                <Detail icon={FolderOpen} label="Modalidad" value={selectedProperty.modality} />
                <Detail
                  icon={Building2}
                  label="Unidad responsable"
                  value={selectedProperty.responsible}
                />
              </div>

              <div className="flex gap-1 border-b border-slate-200 px-4 pt-3">
                <TabButton
                  active={activeTab === "timeline"}
                  onClick={() => setActiveTab("timeline")}
                >
                  <Hourglass size={14} /> Línea de tiempo y avance
                </TabButton>
                <TabButton
                  active={activeTab === "documents"}
                  onClick={() => setActiveTab("documents")}
                >
                  <FileText size={14} /> Documentos generados
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px]">
                    {selectedProperty.documents.length}
                  </span>
                </TabButton>
              </div>

              {activeTab === "timeline" ? (
                <Timeline
                  property={selectedProperty}
                  onOpenDocument={(documentId) => {
                    const document = selectedProperty.documents.find(
                      (item) => item.id === documentId,
                    );
                    if (document) setSelectedDocument(document);
                  }}
                />
              ) : (
                <DocumentsTable
                  documents={selectedProperty.documents}
                  onView={setSelectedDocument}
                  onDownload={(document) => void downloadDocument(document)}
                />
              )}
            </section>

            <section className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800">
              <HelpCircle size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-bold">
                  ¿Necesita aclarar el estado de su expediente?
                </p>
                <p className="mt-1 text-[9px] leading-4">
                  Comuníquese con la mesa de ayuda predial indicando su DNI, código de predio y
                  número de expediente. La información mostrada es de consulta y no reemplaza una
                  notificación oficial.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {selectedDocument && (
        <DocumentPreview
          document={selectedDocument}
          property={selectedProperty}
          onClose={() => setSelectedDocument(null)}
          onDownload={() => void downloadDocument(selectedDocument)}
        />
      )}
    </div>
  );
}

function AccessScreen({
  step,
  dni,
  otp,
  feedback,
  loading,
  attempts,
  resendSeconds,
  generatedCode,
  otpRefs,
  onDniChange,
  onSendCode,
  onUpdateOtp,
  onOtpKey,
  onPasteOtp,
  onVerify,
  onResend,
  onBack,
}: {
  step: Exclude<AccessStep, "portal">;
  dni: string;
  otp: string[];
  feedback: Feedback | null;
  loading: boolean;
  attempts: number;
  resendSeconds: number;
  generatedCode: string;
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onDniChange: (value: string) => void;
  onSendCode: (event?: FormEvent) => void;
  onUpdateOtp: (index: number, value: string) => void;
  onOtpKey: (index: number, event: KeyboardEvent<HTMLInputElement>) => void;
  onPasteOtp: (event: ClipboardEvent<HTMLDivElement>) => void;
  onVerify: (event: FormEvent) => void;
  onResend: () => void;
  onBack: () => void;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-red-950/75" />

      <Link
        to="/"
        className="absolute left-4 top-4 z-10 inline-flex h-9 items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-3 text-[11px] font-semibold text-white backdrop-blur hover:bg-white/20"
      >
        <ArrowLeft size={14} /> Volver al inicio
      </Link>

      <div className="relative z-10 grid w-full max-w-[1040px] overflow-hidden rounded-xl border border-white/10 bg-white shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden bg-[#b91c1c] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex size-14 items-center justify-center rounded-lg bg-white text-[16px] font-black text-[#dc2626] shadow-lg">
              MTC
            </div>
            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.25em] text-red-100">
              Servicio digital
            </p>
            <h1 className="mt-3 max-w-sm text-[28px] font-black leading-tight">
              Seguimiento individual de predios y expedientes
            </h1>
            <p className="mt-4 max-w-md text-[12px] leading-6 text-red-50">
              Consulte de forma segura la etapa actual de sus predios, el avance del procedimiento,
              los plazos y los documentos generados.
            </p>
          </div>
          <div className="space-y-3 border-t border-white/20 pt-6 text-[11px]">
            <AccessBenefit icon={ShieldCheck}>
              Acceso protegido mediante clave dinámica
            </AccessBenefit>
            <AccessBenefit icon={Hourglass}>
              Línea de tiempo actualizada del expediente
            </AccessBenefit>
            <AccessBenefit icon={FileCheck2}>
              Consulta y descarga de documentos generados
            </AccessBenefit>
          </div>
        </section>

        <section className="p-6 sm:p-9 lg:p-10">
          <div className="mx-auto max-w-[390px]">
            <div className="mb-7 flex items-center justify-center gap-2 lg:hidden">
              <span className="inline-flex size-9 items-center justify-center rounded bg-[#dc2626] text-[11px] font-black text-white">
                MTC
              </span>
              <p className="text-[12px] font-bold leading-4 text-slate-800">
                Plataforma Digital de
                <br />
                Gestión de Predios
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-red-50 text-[#dc2626]">
                {step === "dni" ? <Fingerprint size={21} /> : <KeyRound size={20} />}
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#dc2626]">
                  Consulta del sujeto pasivo
                </p>
                <h2 className="text-[18px] font-bold text-slate-900">
                  {step === "dni" ? "Valide su identidad" : "Ingrese la clave dinámica"}
                </h2>
              </div>
            </div>

            <div className="my-6 flex items-center gap-2">
              <StepIndicator
                number="1"
                label="DNI"
                active={step === "dni"}
                completed={step === "otp"}
              />
              <div className={`h-px flex-1 ${step === "otp" ? "bg-[#dc2626]" : "bg-slate-200"}`} />
              <StepIndicator number="2" label="Clave dinámica" active={step === "otp"} />
            </div>

            {feedback && <AccessFeedback feedback={feedback} />}

            {step === "dni" ? (
              <form onSubmit={onSendCode} className="mt-5">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold text-slate-700">
                    Número de DNI
                  </span>
                  <span className="relative block">
                    <Fingerprint
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={dni}
                      onChange={(event) => onDniChange(event.target.value)}
                      inputMode="numeric"
                      autoFocus
                      placeholder="Ingrese los 8 dígitos"
                      className="h-11 w-full rounded-md border border-slate-300 bg-slate-50 pl-10 pr-3 text-[14px] font-semibold tracking-widest text-slate-800 outline-none focus:border-[#dc2626] focus:ring-2 focus:ring-red-100"
                    />
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={dni.length !== 8 || loading}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#dc2626] text-[12px] font-bold text-white shadow hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                  {loading ? "VALIDANDO DNI..." : "ENVIAR CLAVE AL CORREO"}
                </button>
                <p className="mt-4 text-center text-[10px] leading-4 text-slate-500">
                  La clave solo se enviará al correo registrado en su expediente predial.
                </p>
                <div className="mt-5 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[9px] leading-4 text-amber-800">
                  <strong>Modo demostración:</strong> puede ingresar cualquier DNI de 8 dígitos. En
                  producción se validará la identidad y el correo registrado.
                </div>
              </form>
            ) : (
              <form onSubmit={onVerify} className="mt-5">
                <p className="text-[11px] leading-5 text-slate-600">
                  Enviamos una clave de 6 dígitos a <strong>{subjectData.maskedEmail}</strong>. La
                  clave tiene una vigencia limitada.
                </p>
                <div className="mt-4" onPaste={onPasteOtp}>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(element) => {
                          otpRefs.current[index] = element;
                        }}
                        value={digit}
                        onChange={(event) => onUpdateOtp(index, event.target.value)}
                        onKeyDown={(event) => onOtpKey(index, event)}
                        inputMode="numeric"
                        maxLength={1}
                        className="size-11 rounded-md border border-slate-300 bg-slate-50 text-center text-[18px] font-bold text-slate-900 outline-none focus:border-[#dc2626] focus:ring-2 focus:ring-red-100"
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[9px] text-slate-500">
                  <span>Intentos disponibles: {attempts}</span>
                  <button
                    type="button"
                    onClick={onResend}
                    disabled={resendSeconds > 0}
                    className="font-semibold text-[#dc2626] hover:underline disabled:text-slate-400 disabled:no-underline"
                  >
                    {resendSeconds > 0 ? `Reenviar en ${resendSeconds} s` : "Reenviar clave"}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={otp.some((digit) => !digit) || loading || attempts <= 0}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#dc2626] text-[12px] font-bold text-white shadow hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <LockKeyhole size={15} />
                  )}
                  {loading ? "VERIFICANDO..." : "INGRESAR A MI SEGUIMIENTO"}
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="mt-2 h-9 w-full text-[10px] font-semibold text-slate-600 hover:text-[#dc2626]"
                >
                  Cambiar número de DNI
                </button>
                <div className="mt-4 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-center text-[10px] text-blue-800">
                  <strong>Clave de demostración:</strong>{" "}
                  <span className="font-mono text-[13px] font-black tracking-[0.18em]">
                    {generatedCode}
                  </span>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Timeline({
  property,
  onOpenDocument,
}: {
  property: PropertyRecord;
  onOpenDocument: (documentId: string) => void;
}) {
  return (
    <div className="p-4 lg:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-[13px] font-bold text-slate-900">
            Línea de tiempo del procedimiento
          </h3>
          <p className="mt-0.5 text-[9px] text-slate-500">
            Hitos alcanzados, etapa actual y actuaciones pendientes.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[8px] font-semibold text-slate-500">
          <Legend className="bg-green-500" label="Completado" />
          <Legend className="bg-[#dc2626]" label="Etapa actual" />
          <Legend className="bg-slate-300" label="Pendiente" />
        </div>
      </div>

      <div className="relative ml-2 border-l-2 border-slate-200 pl-6">
        {property.timeline.map((item, index) => {
          const attachedDocuments = item.documentIds
            .map((id) => property.documents.find((document) => document.id === id))
            .filter((document): document is GeneratedDocument => Boolean(document));
          return (
            <div
              key={item.id}
              className={`${index === property.timeline.length - 1 ? "pb-0" : "pb-5"} relative`}
            >
              <span
                className={`absolute -left-[33px] top-0 flex size-4 items-center justify-center rounded-full border-2 border-white ring-1 ring-slate-200 ${timelineDotClass(item.status)}`}
              >
                {item.status === "completed" && <Check size={9} className="text-white" />}
              </span>
              <div className={`rounded-md border p-3 ${timelineCardClass(item.status)}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                        Hito {index + 1}
                      </span>
                      {item.status === "current" && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[8px] font-bold text-red-700">
                          ETAPA ACTUAL
                        </span>
                      )}
                      {item.status === "completed" && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[8px] font-bold text-green-700">
                          COMPLETADO
                        </span>
                      )}
                    </div>
                    <h4 className="mt-1 text-[11px] font-bold text-slate-800">{item.title}</h4>
                    <p className="mt-1 text-[9px] leading-4 text-slate-500">{item.description}</p>
                  </div>
                  {(item.date || item.duration) && (
                    <div className="shrink-0 text-right text-[8px] text-slate-500">
                      {item.date && <p className="font-bold text-slate-700">{item.date}</p>}
                      {item.duration && <p className="mt-0.5">Duración: {item.duration}</p>}
                    </div>
                  )}
                </div>
                {attachedDocuments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 border-t border-slate-200/80 pt-2">
                    {attachedDocuments.map((document) => (
                      <button
                        key={document.id}
                        type="button"
                        onClick={() => onOpenDocument(document.id)}
                        className="inline-flex h-7 items-center gap-1.5 rounded border border-slate-200 bg-white px-2 text-[8px] font-semibold text-slate-600 hover:border-red-200 hover:text-[#dc2626]"
                      >
                        <FileText size={11} /> {document.type} <Eye size={10} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DocumentsTable({
  documents,
  onView,
  onDownload,
}: {
  documents: GeneratedDocument[];
  onView: (document: GeneratedDocument) => void;
  onDownload: (document: GeneratedDocument) => void;
}) {
  return (
    <div className="p-4 lg:p-5">
      <div className="mb-3">
        <h3 className="text-[13px] font-bold text-slate-900">Documentos generados</h3>
        <p className="mt-0.5 text-[9px] text-slate-500">
          Documentos incorporados al expediente hasta la última actualización.
        </p>
      </div>
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full min-w-[780px] border-collapse text-left text-[10px]">
          <thead className="bg-slate-50 text-[8px] font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-10 border-b border-slate-200 px-3 py-2 text-center">#</th>
              <th className="border-b border-slate-200 px-3 py-2">Documento</th>
              <th className="w-44 border-b border-slate-200 px-3 py-2">Número</th>
              <th className="w-40 border-b border-slate-200 px-3 py-2">Etapa</th>
              <th className="w-24 border-b border-slate-200 px-3 py-2">Generado</th>
              <th className="w-20 border-b border-slate-200 px-3 py-2">Tamaño</th>
              <th className="w-24 border-b border-slate-200 px-3 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.map((document, index) => (
              <tr key={document.id} className="hover:bg-red-50/30">
                <td className="px-3 py-2.5 text-center text-slate-400">{index + 1}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded bg-red-50 text-[#dc2626]">
                      <FileText size={13} />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{document.title}</p>
                      <p className="mt-0.5 text-[8px] text-slate-400">{document.type}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 font-mono text-[9px] font-semibold text-slate-600">
                  {document.number}
                </td>
                <td className="px-3 py-2.5 text-slate-600">{document.stage}</td>
                <td className="px-3 py-2.5 text-slate-600">{document.date}</td>
                <td className="px-3 py-2.5 text-slate-500">{document.size}</td>
                <td className="px-3 py-2.5">
                  <div className="flex justify-center gap-1">
                    <SmallAction label="Visualizar" onClick={() => onView(document)}>
                      <Eye size={13} />
                    </SmallAction>
                    <SmallAction label="Descargar PDF" onClick={() => onDownload(document)}>
                      <Download size={13} />
                    </SmallAction>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DocumentPreview({
  document,
  property,
  onClose,
  onDownload,
}: {
  document: GeneratedDocument;
  property: PropertyRecord;
  onClose: () => void;
  onDownload: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 p-3"
      onMouseDown={onClose}
    >
      <div
        className="flex max-h-[95vh] w-full max-w-[850px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-[#dc2626]">
              Vista del documento
            </p>
            <h2 className="mt-0.5 text-[13px] font-bold text-slate-900">{document.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded hover:bg-slate-100"
            aria-label="Cerrar vista"
          >
            <X size={16} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto bg-slate-200 p-4 sm:p-7">
          <article className="mx-auto min-h-[760px] max-w-[610px] bg-white px-12 py-14 shadow-lg">
            <div className="text-center">
              <p className="text-[9px] font-bold uppercase">
                Ministerio de Transportes y Comunicaciones
              </p>
              <p className="mt-1 text-[8px] text-slate-500">
                Dirección de Disponibilidad de Predios
              </p>
              <div className="mx-auto mt-4 h-0.5 w-20 bg-[#dc2626]" />
            </div>
            <h3 className="mt-10 text-center text-[13px] font-bold uppercase leading-6">
              {document.title}
            </h3>
            <p className="mt-2 text-center font-mono text-[10px] font-semibold">
              {document.number}
            </p>
            <div className="mt-10 space-y-3 text-[10px] leading-5 text-slate-700">
              <p>
                <strong>Sujeto pasivo:</strong> {subjectData.name}
              </p>
              <p>
                <strong>Código del predio:</strong> {property.code}
              </p>
              <p>
                <strong>Expediente:</strong> {property.expediente}
              </p>
              <p>
                <strong>Proyecto:</strong> {property.project}
              </p>
              <p>
                <strong>Ubicación:</strong> {property.location}
              </p>
              <p>
                <strong>Fecha de generación:</strong> {document.date}
              </p>
            </div>
            <div className="mt-8 border-t border-slate-300 pt-5 text-justify text-[10px] leading-5 text-slate-600">
              <p>
                El presente documento forma parte del expediente predial señalado y sustenta las
                actuaciones realizadas durante la etapa de <strong>{document.stage}</strong>.
              </p>
              <p className="mt-3">
                La visualización presentada corresponde a una vista informativa para el sujeto
                pasivo. El documento oficial conserva las firmas, anexos y mecanismos de validación
                establecidos por la entidad.
              </p>
            </div>
            <div className="mt-24 flex justify-center">
              <div className="w-52 border-t border-slate-500 pt-2 text-center text-[8px] text-slate-500">
                Documento generado por la PDGP
              </div>
            </div>
          </article>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
          <span className="text-[9px] text-slate-500">
            Archivo: {document.number}.pdf · {document.size}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-slate-300 px-4 text-[10px] font-semibold hover:bg-slate-50"
            >
              <X size={13} /> Cerrar
            </button>
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-4 text-[10px] font-semibold text-white hover:bg-[#b91c1c]"
            >
              <Download size={13} /> Descargar PDF
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function AccessBenefit({
  icon: Icon,
  children,
}: {
  icon: typeof ShieldCheck;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-white/15">
        <Icon size={14} />
      </span>
      {children}
    </div>
  );
}

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: string;
  label: string;
  active: boolean;
  completed?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 ${active || completed ? "text-[#dc2626]" : "text-slate-400"}`}
    >
      <span
        className={`inline-flex size-6 items-center justify-center rounded-full border text-[9px] font-bold ${active || completed ? "border-[#dc2626] bg-red-50" : "border-slate-300"}`}
      >
        {completed ? <Check size={12} /> : number}
      </span>
      <span className="whitespace-nowrap text-[9px] font-semibold">{label}</span>
    </div>
  );
}

function AccessFeedback({ feedback }: { feedback: Feedback }) {
  const styles = {
    success: "border-green-200 bg-green-50 text-green-700",
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };
  return (
    <div
      className={`flex items-start gap-2 rounded border px-3 py-2 text-[10px] leading-4 ${styles[feedback.kind]}`}
    >
      {feedback.kind === "success" ? (
        <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={14} className="mt-0.5 shrink-0" />
      )}
      {feedback.text}
    </div>
  );
}

function TimingBadge({ status, compact }: { status: TimingStatus; compact?: boolean }) {
  const styles: Record<TimingStatus, string> = {
    Atrasado: "border-red-200 bg-red-50 text-red-700",
    Adelantado: "border-green-200 bg-green-50 text-green-700",
    "En plazo": "border-blue-200 bg-blue-50 text-blue-700",
    Finalizado: "border-slate-200 bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-bold ${compact ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-1 text-[9px]"} ${styles[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function timingPanelClass(status: TimingStatus) {
  if (status === "Atrasado") return "border-red-200 bg-red-50 text-red-800";
  if (status === "Adelantado") return "border-green-200 bg-green-50 text-green-800";
  return "border-blue-200 bg-blue-50 text-blue-800";
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5">
      <span className="inline-flex size-7 items-center justify-center rounded bg-white text-[#dc2626] shadow-sm">
        <Icon size={13} />
      </span>
      <div>
        <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-[10px] font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 px-3 py-3">
      <Icon size={14} className="mt-0.5 shrink-0 text-[#dc2626]" />
      <div>
        <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 text-[9px] font-semibold leading-4 text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-1.5 border-b-2 px-3 text-[10px] font-bold transition ${active ? "border-[#dc2626] text-[#dc2626]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
    >
      {children}
    </button>
  );
}

function timelineDotClass(status: TimelineStatus) {
  if (status === "completed") return "bg-green-500";
  if (status === "current") return "bg-[#dc2626] ring-2 ring-red-200";
  return "bg-slate-300";
}

function timelineCardClass(status: TimelineStatus) {
  if (status === "current") return "border-red-200 bg-red-50/50";
  if (status === "pending") return "border-slate-200 bg-slate-50/60 opacity-75";
  return "border-slate-200 bg-white";
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`size-2 rounded-full ${className}`} />
      {label}
    </span>
  );
}

function SmallAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-7 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-[#dc2626]"
    >
      {children}
    </button>
  );
}
