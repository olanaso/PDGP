import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  Link2,
  LoaderCircle,
  Network,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

import { AppSidebar } from "@/components/AppSidebar";

export const Route = createFileRoute("/interoperabilidad")({
  head: () => ({
    meta: [
      { title: "Interoperabilidad" },
      {
        name: "description",
        content:
          "Administración, configuración y seguimiento de servicios interoperables de la Plataforma Digital de Gestión de Predios.",
      },
    ],
  }),
  component: InteroperabilidadPage,
});

const STORAGE_KEY = "pdgp:interoperabilidad:config:v1";
const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] text-gray-800 outline-none transition focus:border-[#dc2626] focus:ring-1 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100";
const textareaCls =
  "min-h-20 w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-mono text-[11px] text-gray-800 outline-none transition focus:border-[#dc2626] focus:ring-1 focus:ring-red-100";

type Health = "OPERATIVO" | "SIN_CONFIGURAR" | "CON_ERROR";
type AuthType = "NONE" | "BEARER" | "API_KEY" | "BASIC" | "OAUTH2" | "MTLS";

type InteroperabilityService = {
  code: string;
  category: string;
  name: string;
  entity: string;
  input: string;
  description: string;
  expected: string;
  protocol: "REST" | "SOAP" | "OGC API";
};

type ServiceConfig = {
  enabled: boolean;
  health: Health;
  environment: "PRUEBAS" | "PRODUCCION";
  protocol: "REST" | "SOAP" | "OGC API";
  method: "GET" | "POST" | "PUT";
  endpoint: string;
  authType: AuthType;
  token: string;
  tokenEndpoint: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  apiKeyName: string;
  apiKey: string;
  scope: string;
  certificateAlias: string;
  timeout: string;
  retries: string;
  headers: string;
  notes: string;
  lastCheck: string;
};

type Feedback = { kind: "success" | "error"; text: string };

const serviceCatalog: InteroperabilityService[] = [
  {
    code: "ID-01",
    category: "Identificación de personas naturales",
    name: "Consulta de identidad por DNI",
    entity: "RENIEC",
    input: "Número de DNI",
    description:
      "Validar la identidad de una persona natural peruana vinculada con un procedimiento de gestión predial.",
    expected:
      "Nombres, apellidos, fecha de nacimiento o defunción, fotografía, estado civil, domicilio, ubigeo y condición del documento.",
    protocol: "REST",
  },
  {
    code: "ID-02",
    category: "Identificación de personas naturales",
    name: "Consulta de carné de extranjería",
    entity: "Migraciones",
    input: "Número de carné de extranjería o documento migratorio",
    description:
      "Validar la identidad de una persona extranjera propietaria, posesionaria, ocupante, representante o afectada.",
    expected:
      "Nombres, apellidos, nacionalidad, documento, calidad migratoria, vigencia, fotografía y domicilio.",
    protocol: "REST",
  },
  {
    code: "PJ-01",
    category: "Identificación de personas jurídicas",
    name: "Consulta de ficha RUC",
    entity: "SUNAT",
    input: "Número de RUC",
    description:
      "Validar la existencia, condición tributaria, domicilio fiscal, representantes y datos generales de una persona jurídica.",
    expected:
      "Razón social, contribuyente, estado, actividad económica, domicilio, ubigeo y representantes legales.",
    protocol: "REST",
  },
  {
    code: "GD-01",
    category: "Gestión documental institucional",
    name: "Gestión integral de expedientes y documentos",
    entity: "STD - MTC",
    input: "Hoja de ruta, expediente, documento, proyecto y predio",
    description:
      "Consultar expedientes e historial de derivaciones y registrar documentos generados por la plataforma predial.",
    expected:
      "Hoja de ruta, expediente, asunto, documentos, derivaciones, unidad responsable, estado y última actuación.",
    protocol: "SOAP",
  },
  {
    code: "SR-01",
    category: "Publicidad registral de SUNARP",
    name: "Consulta de partida registral",
    entity: "SUNARP",
    input: "Número de partida y oficina registral",
    description: "Consultar el contenido de una partida registral inmobiliaria.",
    expected:
      "Titularidad, inmueble, antecedentes, cargas, gravámenes, anotaciones, títulos, PDF e imágenes de asientos.",
    protocol: "REST",
  },
  {
    code: "SR-03",
    category: "Publicidad registral de SUNARP",
    name: "Consulta de títulos archivados",
    entity: "SUNARP",
    input: "Número de título, año, partida y oficina registral",
    description: "Consultar los documentos que dieron mérito a una inscripción registral.",
    expected:
      "Escrituras, formularios, resoluciones, planos, memorias descriptivas, anexos e imágenes o PDF.",
    protocol: "REST",
  },
  {
    code: "SR-04",
    category: "Publicidad registral de SUNARP",
    name: "Consulta de cargas y gravámenes",
    entity: "SUNARP",
    input: "Número de partida",
    description: "Identificar restricciones o derechos inscritos que afectan al inmueble.",
    expected:
      "Hipotecas, embargos, demandas, servidumbres, bloqueos, cargas técnicas y demás afectaciones.",
    protocol: "REST",
  },
  {
    code: "SR-05",
    category: "Publicidad registral de SUNARP",
    name: "Consulta de antecedentes registrales",
    entity: "SUNARP",
    input: "Número de partida",
    description:
      "Identificar partidas matrices, independizaciones, acumulaciones y títulos anteriores.",
    expected:
      "Partida matriz, partidas independizadas, antecedentes de dominio y títulos archivados.",
    protocol: "REST",
  },
  {
    code: "SI-01",
    category: "Presentación e inscripción registral",
    name: "Presentación electrónica de títulos",
    entity: "SID-SUNARP",
    input: "Parte, formulario, resolución, planos y documentos firmados",
    description: "Presentar electrónicamente títulos destinados a inscripción registral.",
    expected:
      "Número de título, fecha, hora, oficina, asiento de presentación y constancia de ingreso.",
    protocol: "SOAP",
  },
  {
    code: "SI-02",
    category: "Presentación e inscripción registral",
    name: "Seguimiento del título",
    entity: "SID-SUNARP",
    input: "Número de título, año y oficina registral",
    description: "Consultar el avance del procedimiento de calificación registral.",
    expected:
      "Estado, observaciones, esquela, liquidación, pago, subsanación, inscripción, tacha o desistimiento.",
    protocol: "REST",
  },
  {
    code: "SI-03",
    category: "Presentación e inscripción registral",
    name: "Consulta de observaciones",
    entity: "SUNARP",
    input: "Número de título",
    description: "Obtener las observaciones formuladas por el registrador público.",
    expected: "Esquela, requisitos pendientes, fecha de notificación y plazo de subsanación.",
    protocol: "REST",
  },
  {
    code: "SI-04",
    category: "Presentación e inscripción registral",
    name: "Consulta de liquidación registral",
    entity: "SUNARP",
    input: "Número de título",
    description: "Consultar los derechos registrales pendientes de pago.",
    expected: "Monto, concepto, fechas de emisión y vencimiento, y estado del pago.",
    protocol: "REST",
  },
  {
    code: "SI-05",
    category: "Presentación e inscripción registral",
    name: "Descarga del asiento inscrito",
    entity: "SUNARP",
    input: "Número de título o partida",
    description: "Obtener el resultado final de la inscripción registral.",
    expected: "Asiento inscrito, constancia, partida actualizada y archivo PDF.",
    protocol: "REST",
  },
  {
    code: "GC-01",
    category: "Información gráfica y catastral",
    name: "Consulta gráfica mediante polígono",
    entity: "SUNARP",
    input: "Polígono georreferenciado del área de interés",
    description: "Comparar el área enviada con la Base Gráfica Registral.",
    expected: "Polígonos intersectados, partidas, ubicación y geometrías resultantes.",
    protocol: "OGC API",
  },
  {
    code: "BE-01",
    category: "Bienes inmuebles del Estado",
    name: "Consulta de predios estatales por polígono",
    entity: "SBN / SINABIP",
    input: "Polígono georreferenciado del área de interés",
    description: "Comparar el área del proyecto con la información de bienes inmuebles del Estado.",
    expected:
      "Predios intersectados, código SINABIP, entidad titular, ubicación y condición jurídica.",
    protocol: "OGC API",
  },
  {
    code: "PF-01",
    category: "Seguimiento presupuestal y financiero",
    name: "Consulta de certificación presupuestal",
    entity: "SIAF-SP",
    input: "Número de certificación, expediente o proyecto",
    description: "Verificar la disponibilidad presupuestal para efectuar un pago.",
    expected: "Número de certificación, monto, saldo, fecha y estado.",
    protocol: "REST",
  },
  {
    code: "PF-02",
    category: "Seguimiento presupuestal y financiero",
    name: "Consulta de compromiso",
    entity: "SIAF-SP",
    input: "Número de expediente SIAF",
    description: "Consultar el registro del compromiso presupuestal.",
    expected: "Número de compromiso, monto, fecha, beneficiario, concepto y estado.",
    protocol: "REST",
  },
  {
    code: "PF-03",
    category: "Seguimiento presupuestal y financiero",
    name: "Consulta de devengado",
    entity: "SIAF-SP",
    input: "Número de expediente SIAF",
    description: "Verificar que la obligación de pago haya sido reconocida.",
    expected: "Número de devengado, monto, fecha, concepto, beneficiario y estado.",
    protocol: "REST",
  },
  {
    code: "PF-04",
    category: "Seguimiento presupuestal y financiero",
    name: "Consulta de girado",
    entity: "SIAF-SP",
    input: "Número de expediente SIAF",
    description: "Consultar la emisión de la orden financiera para realizar el pago.",
    expected: "Número de girado, monto, fecha, cuenta, beneficiario y estado.",
    protocol: "REST",
  },
  {
    code: "PF-05",
    category: "Seguimiento presupuestal y financiero",
    name: "Consulta de pago",
    entity: "SIAF-SP / Tesorería",
    input: "Expediente SIAF, DNI, RUC o beneficiario",
    description: "Verificar si el pago fue ejecutado.",
    expected: "Estado pagado, fecha, monto, beneficiario, comprobante y medio de pago.",
    protocol: "REST",
  },
  {
    code: "PF-06",
    category: "Seguimiento presupuestal y financiero",
    name: "Consulta de pagos por predio",
    entity: "SIAF-SP / PDGP",
    input: "Código del predio o expediente predial",
    description: "Relacionar los registros financieros con el inmueble afectado.",
    expected: "Tasación, incentivo, compensación, indemnización, mejoras, monto, fecha y estado.",
    protocol: "REST",
  },
  {
    code: "PF-07",
    category: "Seguimiento presupuestal y financiero",
    name: "Consulta de observaciones o devoluciones",
    entity: "SIAF-SP / Tesorería",
    input: "Número de expediente financiero",
    description: "Identificar problemas que impiden continuar con el pago.",
    expected:
      "Motivo de observación, devolución o rechazo, documento pendiente y unidad responsable.",
    protocol: "REST",
  },
];

const initiallyEnabled = new Set(["ID-01", "PJ-01", "GD-01", "SR-01", "PF-01", "PF-03", "PF-05"]);

function defaultConfig(service: InteroperabilityService): ServiceConfig {
  const enabled = initiallyEnabled.has(service.code);
  return {
    enabled,
    health: enabled ? "OPERATIVO" : "SIN_CONFIGURAR",
    environment: enabled ? "PRODUCCION" : "PRUEBAS",
    protocol: service.protocol,
    method: service.protocol === "SOAP" ? "POST" : "GET",
    endpoint: enabled
      ? "https://api.pdgp.mtc.gob.pe/interoperabilidad/" + service.code.toLowerCase()
      : "",
    authType: "NONE",
    token: "",
    tokenEndpoint: "",
    clientId: "",
    clientSecret: "",
    username: "",
    password: "",
    apiKeyName: "X-API-Key",
    apiKey: "",
    scope: "",
    certificateAlias: "",
    timeout: "30",
    retries: "2",
    headers: '{\n  "Content-Type": "application/json",\n  "Accept": "application/json"\n}',
    notes: "",
    lastCheck: enabled ? "03/09/2026 09:30" : "",
  };
}

function initialConfigMap() {
  return Object.fromEntries(
    serviceCatalog.map((service) => [service.code, defaultConfig(service)]),
  ) as Record<string, ServiceConfig>;
}

function Field({
  label,
  required,
  children,
  alignStart = false,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  alignStart?: boolean;
}) {
  return (
    <div
      className={
        "grid gap-1.5 sm:grid-cols-[180px_minmax(0,1fr)] " +
        (alignStart ? "sm:items-start" : "sm:items-center")
      }
    >
      <label className={"text-[12px] text-gray-700 sm:text-right " + (alignStart ? "sm:pt-2" : "")}>
        {required && <span className="text-[#dc2626]">* </span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-5 border-b border-gray-200 pb-1 first:mt-0">
      <h3 className="text-[13px] font-semibold text-[#dc2626]">{children}</h3>
    </div>
  );
}

function InteroperabilidadPage() {
  const [configs, setConfigs] = useState<Record<string, ServiceConfig>>(initialConfigMap);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedService, setSelectedService] = useState<InteroperabilityService | null>(null);
  const [draft, setDraft] = useState<ServiceConfig | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pageNotice, setPageNotice] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Record<string, ServiceConfig>;
      const defaults = initialConfigMap();
      Object.keys(defaults).forEach((code) => {
        if (parsed[code]) defaults[code] = { ...defaults[code], ...parsed[code] };
      });
      setConfigs(defaults);
    } catch {
      setConfigs(initialConfigMap());
    }
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(serviceCatalog.map((service) => service.category))).sort(),
    [],
  );
  const entities = useMemo(
    () => Array.from(new Set(serviceCatalog.map((service) => service.entity))).sort(),
    [],
  );
  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es-PE");
    return serviceCatalog.filter((service) => {
      const config = configs[service.code];
      const matchesQuery =
        !normalizedQuery ||
        [service.code, service.name, service.entity, service.category, service.input]
          .join(" ")
          .toLocaleLowerCase("es-PE")
          .includes(normalizedQuery);
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "ACTIVE" && config.enabled) ||
        (statusFilter === "INACTIVE" && !config.enabled) ||
        (statusFilter === "OPERATIVE" && config.enabled && config.health === "OPERATIVO") ||
        (statusFilter === "PENDING" && config.health === "SIN_CONFIGURAR") ||
        (statusFilter === "ERROR" && config.health === "CON_ERROR");
      return (
        matchesQuery &&
        (!categoryFilter || service.category === categoryFilter) &&
        (!entityFilter || service.entity === entityFilter) &&
        matchesStatus
      );
    });
  }, [categoryFilter, configs, entityFilter, query, statusFilter]);

  const stats = useMemo(() => {
    const values = Object.values(configs);
    return {
      active: values.filter((config) => config.enabled).length,
      operative: values.filter((config) => config.enabled && config.health === "OPERATIVO").length,
      inactive: values.filter((config) => !config.enabled).length,
      pending: values.filter((config) => config.health === "SIN_CONFIGURAR").length,
    };
  }, [configs]);

  function persist(next: Record<string, ServiceConfig>) {
    setConfigs(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function toggleEnabled(service: InteroperabilityService) {
    const current = configs[service.code];
    const enabled = !current.enabled;
    const nextConfig = {
      ...current,
      enabled,
      health: enabled && !current.endpoint ? ("SIN_CONFIGURAR" as Health) : current.health,
    };
    persist({ ...configs, [service.code]: nextConfig });
    setPageNotice(
      service.code +
        " " +
        (enabled ? "fue activado. Revise su configuración." : "fue desactivado."),
    );
  }

  function openConfiguration(service: InteroperabilityService) {
    setSelectedService(service);
    setDraft({ ...configs[service.code] });
    setShowSecrets(false);
    setFeedback(null);
  }

  function closeConfiguration() {
    setSelectedService(null);
    setDraft(null);
    setFeedback(null);
    setTesting(false);
  }

  function updateDraft<K extends keyof ServiceConfig>(key: K, value: ServiceConfig[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setFeedback(null);
  }

  function validateDraft() {
    if (!draft) return "No existe una configuración para validar.";
    if (draft.enabled && !draft.endpoint.trim()) return "Ingrese el endpoint del servicio.";
    if (draft.endpoint && !/^https?:\/\//i.test(draft.endpoint)) {
      return "El endpoint debe comenzar con http:// o https://.";
    }
    if (Number(draft.timeout) < 1 || Number(draft.timeout) > 300) {
      return "El tiempo de espera debe estar entre 1 y 300 segundos.";
    }
    try {
      JSON.parse(draft.headers || "{}");
    } catch {
      return "Las cabeceras HTTP deben tener un formato JSON válido.";
    }
    if (draft.authType === "BEARER" && draft.enabled && !draft.token.trim()) {
      return "Ingrese el token Bearer requerido por el servicio.";
    }
    if (draft.authType === "API_KEY" && draft.enabled && !draft.apiKey.trim()) {
      return "Ingrese la API Key requerida por el servicio.";
    }
    if (draft.authType === "BASIC" && draft.enabled && (!draft.username || !draft.password)) {
      return "Ingrese el usuario y la contraseña.";
    }
    if (
      draft.authType === "OAUTH2" &&
      draft.enabled &&
      (!draft.tokenEndpoint || !draft.clientId || !draft.clientSecret)
    ) {
      return "Complete el endpoint de token, Client ID y Client Secret.";
    }
    if (draft.authType === "MTLS" && draft.enabled && !draft.certificateAlias) {
      return "Ingrese el alias del certificado mTLS.";
    }
    return "";
  }

  function testParameters() {
    const error = validateDraft();
    if (error) {
      setFeedback({ kind: "error", text: error });
      return;
    }
    setTesting(true);
    window.setTimeout(() => {
      setDraft((current) =>
        current
          ? {
              ...current,
              health: current.enabled ? "OPERATIVO" : current.health,
              lastCheck: new Date().toLocaleString("es-PE"),
            }
          : current,
      );
      setTesting(false);
      setFeedback({
        kind: "success",
        text: "Parámetros validados. La configuración tiene el formato requerido.",
      });
    }, 650);
  }

  function saveConfiguration(event: FormEvent) {
    event.preventDefault();
    if (!selectedService || !draft) return;
    const error = validateDraft();
    if (error) {
      setFeedback({ kind: "error", text: error });
      return;
    }
    const savedDraft = {
      ...draft,
      health: draft.enabled && draft.endpoint ? ("OPERATIVO" as Health) : draft.health,
      lastCheck:
        draft.enabled && draft.endpoint
          ? draft.lastCheck || new Date().toLocaleString("es-PE")
          : draft.lastCheck,
    };
    persist({ ...configs, [selectedService.code]: savedDraft });
    setPageNotice(
      "Configuración guardada para " + selectedService.code + " · " + selectedService.name + ".",
    );
    closeConfiguration();
  }

  function clearFilters() {
    setQuery("");
    setCategoryFilter("");
    setEntityFilter("");
    setStatusFilter("");
  }

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937]">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-auto">
        <div className="px-5 pb-8 pt-5 xl:px-8">
          <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#dc2626]">
                Módulo transversal
              </p>
              <div className="mt-1 flex items-center gap-2.5">
                <Network size={22} className="text-[#dc2626]" />
                <h1 className="text-[20px] font-semibold text-gray-900">Interoperabilidad</h1>
              </div>
              <p className="mt-1 max-w-3xl text-[12px] leading-5 text-gray-500">
                Catálogo y configuración de los servicios de información requeridos por la
                Plataforma Digital de Gestión de Predios.
              </p>
            </div>
            <div className="rounded border border-gray-200 bg-white px-3 py-2 text-right shadow-sm">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                Última revisión del catálogo
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-gray-700">03/09/2026</p>
            </div>
          </header>

          <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              icon={Network}
              label="Servicios catalogados"
              value={serviceCatalog.length}
              tone="gray"
            />
            <MetricCard icon={Activity} label="Activos" value={stats.active} tone="blue" />
            <MetricCard
              icon={CheckCircle2}
              label="Operativos"
              value={stats.operative}
              tone="green"
            />
            <MetricCard
              icon={AlertCircle}
              label="Por configurar"
              value={stats.pending}
              tone="amber"
            />
            <MetricCard icon={Clock3} label="Inactivos" value={stats.inactive} tone="red" />
          </section>

          {pageNotice && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-[12px] text-green-700">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} /> {pageNotice}
              </span>
              <button type="button" onClick={() => setPageNotice("")} aria-label="Cerrar mensaje">
                <X size={14} />
              </button>
            </div>
          )}

          <section className="rounded-md border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <div className="mb-4 border-b">
              <div className="inline-flex items-center gap-1.5 border-b-2 border-[#dc2626] px-3 py-1.5 text-[12px] font-medium text-[#dc2626]">
                <Settings2 size={14} /> Listado de interoperabilidad
              </div>
            </div>

            <SectionTitle>Filtros del catálogo</SectionTitle>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <FilterField label="Buscar servicio">
                <div className="relative">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className={inputCls + " pl-8"}
                    placeholder="Código, servicio o entidad"
                  />
                </div>
              </FilterField>
              <FilterField label="Categoría">
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className={inputCls}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </FilterField>
              <FilterField label="Entidad">
                <select
                  value={entityFilter}
                  onChange={(event) => setEntityFilter(event.target.value)}
                  className={inputCls}
                >
                  <option value="">Todas las entidades</option>
                  {entities.map((entity) => (
                    <option key={entity}>{entity}</option>
                  ))}
                </select>
              </FilterField>
              <FilterField label="Estado">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className={inputCls}
                >
                  <option value="">Todos los estados</option>
                  <option value="ACTIVE">Activos</option>
                  <option value="INACTIVE">Inactivos</option>
                  <option value="OPERATIVE">Operativos</option>
                  <option value="PENDING">Por configurar</option>
                  <option value="ERROR">Con error</option>
                </select>
              </FilterField>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 px-3 text-[11px] text-gray-600 hover:bg-gray-50"
              >
                <RefreshCw size={13} /> Limpiar filtros
              </button>
            </div>

            <SectionTitle>Servicios de información</SectionTitle>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[11px] text-gray-500">
                {filteredServices.length} de {serviceCatalog.length} servicios
              </p>
              <div className="flex gap-3 text-[10px] text-gray-500">
                <Legend color="bg-green-500" label="Operativo" />
                <Legend color="bg-amber-500" label="Por configurar" />
                <Legend color="bg-red-500" label="Con error" />
              </div>
            </div>

            <div className="overflow-x-auto rounded border border-gray-200">
              <table className="w-full min-w-[1120px] text-[11px]">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-2 py-2 font-semibold">CÓDIGO</th>
                    <th className="px-2 py-2 font-semibold">SERVICIO REQUERIDO</th>
                    <th className="px-2 py-2 font-semibold">ENTIDAD / SISTEMA</th>
                    <th className="px-2 py-2 font-semibold">CATEGORÍA</th>
                    <th className="px-2 py-2 font-semibold">PROTOCOLO</th>
                    <th className="px-2 py-2 text-center font-semibold">ACTIVO</th>
                    <th className="px-2 py-2 font-semibold">ESTADO TÉCNICO</th>
                    <th className="px-2 py-2 font-semibold">ÚLTIMA VALIDACIÓN</th>
                    <th className="px-2 py-2 text-center font-semibold">CONFIGURACIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((service) => {
                    const config = configs[service.code];
                    return (
                      <tr key={service.code} className="border-t align-middle hover:bg-red-50/20">
                        <td className="px-2 py-2 font-mono font-semibold text-[#b91c1c]">
                          {service.code}
                        </td>
                        <td className="max-w-[240px] px-2 py-2">
                          <p className="font-medium text-gray-800">{service.name}</p>
                          <p
                            className="mt-0.5 truncate text-[10px] text-gray-400"
                            title={service.input}
                          >
                            Entrada: {service.input}
                          </p>
                        </td>
                        <td className="px-2 py-2 font-medium">{service.entity}</td>
                        <td className="max-w-[190px] px-2 py-2 text-gray-600">
                          {service.category}
                        </td>
                        <td className="px-2 py-2">
                          <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-[10px]">
                            {config.protocol}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <Toggle
                            active={config.enabled}
                            label={service.name}
                            onClick={() => toggleEnabled(service)}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <HealthBadge config={config} />
                        </td>
                        <td className="px-2 py-2 text-gray-500">
                          {config.lastCheck || "Sin validar"}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => openConfiguration(service)}
                            className="inline-flex h-7 items-center gap-1 rounded border border-red-200 px-2.5 text-[10px] font-medium text-[#dc2626] hover:bg-red-50"
                          >
                            <Settings2 size={13} /> Configurar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!filteredServices.length && (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-[12px] text-gray-400">
                        No se encontraron servicios con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] leading-4 text-blue-700">
              Los parámetros se guardan en este prototipo por navegador. En producción, los tokens,
              contraseñas y certificados deben almacenarse cifrados en un gestor seguro de secretos.
            </div>
          </section>
        </div>
      </main>

      {selectedService && draft && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/45 p-4"
          onClick={closeConfiguration}
        >
          <form
            onSubmit={saveConfiguration}
            className="flex max-h-[94vh] w-full max-w-[980px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between gap-3 border-b border-red-100 px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#dc2626]">
                  {selectedService.code} · {selectedService.entity}
                </p>
                <h2 className="mt-1 text-[15px] font-semibold text-gray-900">
                  Configuración de {selectedService.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeConfiguration}
                className="inline-flex size-8 items-center justify-center rounded hover:bg-gray-100"
                aria-label="Cerrar configuración"
              >
                <X size={17} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {feedback && <FeedbackMessage feedback={feedback} />}

              <SectionTitle>Información del servicio</SectionTitle>
              <div className="grid gap-3 rounded border border-gray-200 bg-gray-50 p-3 lg:grid-cols-2">
                <InfoLine label="Categoría" value={selectedService.category} />
                <InfoLine label="Entidad o sistema" value={selectedService.entity} />
                <InfoLine label="Datos de entrada" value={selectedService.input} />
                <InfoLine label="Protocolo sugerido" value={selectedService.protocol} />
                <div className="lg:col-span-2">
                  <InfoLine label="Descripción" value={selectedService.description} />
                </div>
                <div className="lg:col-span-2">
                  <InfoLine label="Información esperada" value={selectedService.expected} />
                </div>
              </div>

              <SectionTitle>Conexión</SectionTitle>
              <div className="grid gap-x-8 gap-y-3 lg:grid-cols-2">
                <Field label="Servicio activo">
                  <label className="inline-flex items-center gap-2 text-[12px]">
                    <input
                      type="checkbox"
                      checked={draft.enabled}
                      onChange={(event) => updateDraft("enabled", event.target.checked)}
                      className="size-4 accent-[#dc2626]"
                    />
                    Habilitar consumo desde la plataforma
                  </label>
                </Field>
                <Field label="Ambiente">
                  <select
                    className={inputCls}
                    value={draft.environment}
                    onChange={(event) =>
                      updateDraft("environment", event.target.value as ServiceConfig["environment"])
                    }
                  >
                    <option value="PRUEBAS">Pruebas / homologación</option>
                    <option value="PRODUCCION">Producción</option>
                  </select>
                </Field>
                <Field label="Protocolo" required>
                  <select
                    className={inputCls}
                    value={draft.protocol}
                    onChange={(event) =>
                      updateDraft("protocol", event.target.value as ServiceConfig["protocol"])
                    }
                  >
                    <option>REST</option>
                    <option>SOAP</option>
                    <option>OGC API</option>
                  </select>
                </Field>
                <Field label="Método HTTP" required>
                  <select
                    className={inputCls}
                    value={draft.method}
                    onChange={(event) =>
                      updateDraft("method", event.target.value as ServiceConfig["method"])
                    }
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                  </select>
                </Field>
                <div className="lg:col-span-2">
                  <Field label="Endpoint" required={draft.enabled}>
                    <div className="relative">
                      <Link2
                        size={14}
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        className={inputCls + " pl-8 font-mono text-[11px]"}
                        value={draft.endpoint}
                        onChange={(event) => updateDraft("endpoint", event.target.value)}
                        placeholder="https://api.entidad.gob.pe/v1/servicio"
                      />
                    </div>
                  </Field>
                </div>
                <Field label="Tiempo de espera">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={300}
                      className={inputCls}
                      value={draft.timeout}
                      onChange={(event) => updateDraft("timeout", event.target.value)}
                    />
                    <span className="shrink-0 text-[11px] text-gray-500">segundos</span>
                  </div>
                </Field>
                <Field label="Reintentos">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    className={inputCls}
                    value={draft.retries}
                    onChange={(event) => updateDraft("retries", event.target.value)}
                  />
                </Field>
              </div>

              <SectionTitle>Seguridad y autenticación</SectionTitle>
              <div className="grid gap-x-8 gap-y-3 lg:grid-cols-2">
                <Field label="Tipo de autenticación" required>
                  <select
                    className={inputCls}
                    value={draft.authType}
                    onChange={(event) => updateDraft("authType", event.target.value as AuthType)}
                  >
                    <option value="NONE">Sin autenticación</option>
                    <option value="BEARER">Bearer token</option>
                    <option value="API_KEY">API Key</option>
                    <option value="BASIC">Usuario y contraseña</option>
                    <option value="OAUTH2">OAuth 2.0</option>
                    <option value="MTLS">Certificado mTLS</option>
                  </select>
                </Field>
                <Field label="Mostrar credenciales">
                  <button
                    type="button"
                    onClick={() => setShowSecrets((current) => !current)}
                    className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 px-3 text-[11px] text-gray-600 hover:bg-gray-50"
                  >
                    {showSecrets ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showSecrets ? "Ocultar valores" : "Mostrar valores"}
                  </button>
                </Field>

                {draft.authType === "BEARER" && (
                  <div className="lg:col-span-2">
                    <Field label="Token Bearer" required={draft.enabled}>
                      <SecretInput
                        value={draft.token}
                        visible={showSecrets}
                        onChange={(value) => updateDraft("token", value)}
                        placeholder="Pegue el token entregado por la entidad"
                      />
                    </Field>
                  </div>
                )}
                {draft.authType === "API_KEY" && (
                  <>
                    <Field label="Nombre de cabecera">
                      <input
                        className={inputCls}
                        value={draft.apiKeyName}
                        onChange={(event) => updateDraft("apiKeyName", event.target.value)}
                      />
                    </Field>
                    <Field label="API Key" required={draft.enabled}>
                      <SecretInput
                        value={draft.apiKey}
                        visible={showSecrets}
                        onChange={(value) => updateDraft("apiKey", value)}
                      />
                    </Field>
                  </>
                )}
                {draft.authType === "BASIC" && (
                  <>
                    <Field label="Usuario" required={draft.enabled}>
                      <input
                        className={inputCls}
                        value={draft.username}
                        onChange={(event) => updateDraft("username", event.target.value)}
                      />
                    </Field>
                    <Field label="Contraseña" required={draft.enabled}>
                      <SecretInput
                        value={draft.password}
                        visible={showSecrets}
                        onChange={(value) => updateDraft("password", value)}
                      />
                    </Field>
                  </>
                )}
                {draft.authType === "OAUTH2" && (
                  <>
                    <div className="lg:col-span-2">
                      <Field label="Endpoint de token" required={draft.enabled}>
                        <input
                          className={inputCls + " font-mono text-[11px]"}
                          value={draft.tokenEndpoint}
                          onChange={(event) => updateDraft("tokenEndpoint", event.target.value)}
                        />
                      </Field>
                    </div>
                    <Field label="Client ID" required={draft.enabled}>
                      <input
                        className={inputCls}
                        value={draft.clientId}
                        onChange={(event) => updateDraft("clientId", event.target.value)}
                      />
                    </Field>
                    <Field label="Client Secret" required={draft.enabled}>
                      <SecretInput
                        value={draft.clientSecret}
                        visible={showSecrets}
                        onChange={(value) => updateDraft("clientSecret", value)}
                      />
                    </Field>
                    <Field label="Scope">
                      <input
                        className={inputCls}
                        value={draft.scope}
                        onChange={(event) => updateDraft("scope", event.target.value)}
                        placeholder="consulta lectura"
                      />
                    </Field>
                  </>
                )}
                {draft.authType === "MTLS" && (
                  <div className="lg:col-span-2">
                    <Field label="Alias del certificado" required={draft.enabled}>
                      <div className="relative">
                        <ShieldCheck
                          size={14}
                          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          className={inputCls + " pl-8"}
                          value={draft.certificateAlias}
                          onChange={(event) => updateDraft("certificateAlias", event.target.value)}
                          placeholder="cert-entidad-produccion"
                        />
                      </div>
                    </Field>
                  </div>
                )}
              </div>

              <SectionTitle>Parámetros adicionales</SectionTitle>
              <div className="space-y-3">
                <Field label="Cabeceras HTTP" alignStart>
                  <textarea
                    className={textareaCls}
                    value={draft.headers}
                    onChange={(event) => updateDraft("headers", event.target.value)}
                    spellCheck={false}
                  />
                </Field>
                <Field label="Notas técnicas" alignStart>
                  <textarea
                    className={textareaCls + " font-sans"}
                    value={draft.notes}
                    onChange={(event) => updateDraft("notes", event.target.value)}
                    placeholder="Convenio, contacto técnico, restricciones, versión u observaciones..."
                  />
                </Field>
              </div>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-5 py-3">
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <KeyRound size={13} className="text-[#dc2626]" />
                Credenciales visibles solo para usuarios autorizados.
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeConfiguration}
                  className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 px-4 text-[12px] hover:bg-gray-50"
                >
                  <X size={14} /> Cancelar
                </button>
                <button
                  type="button"
                  disabled={testing}
                  onClick={testParameters}
                  className="inline-flex h-8 items-center gap-1.5 rounded border border-red-200 px-4 text-[12px] text-[#dc2626] hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                >
                  {testing ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <Activity size={14} />
                  )}
                  Validar parámetros
                </button>
                <button
                  type="submit"
                  className="inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-4 text-[12px] font-medium text-white hover:bg-[#b91c1c]"
                >
                  <Save size={14} /> Guardar configuración
                </button>
              </div>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Network;
  label: string;
  value: number;
  tone: "gray" | "blue" | "green" | "amber" | "red";
}) {
  const tones = {
    gray: "border-gray-200 bg-gray-50 text-gray-600",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };
  return (
    <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-3 shadow-sm">
      <span
        className={"inline-flex size-9 items-center justify-center rounded border " + tones[tone]}
      >
        <Icon size={17} />
      </span>
      <div>
        <p className="text-[18px] font-semibold leading-5 text-gray-900">{value}</p>
        <p className="text-[10px] text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function Toggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "relative inline-flex h-5 w-9 items-center rounded-full transition " +
        (active ? "bg-[#dc2626]" : "bg-gray-300")
      }
      aria-label={(active ? "Desactivar " : "Activar ") + label}
      aria-pressed={active}
    >
      <span
        className={
          "inline-block size-4 rounded-full bg-white shadow transition " +
          (active ? "translate-x-4" : "translate-x-0.5")
        }
      />
    </button>
  );
}

function HealthBadge({ config }: { config: ServiceConfig }) {
  if (!config.enabled) {
    return <StatusPill color="gray" label="INACTIVO" />;
  }
  if (config.health === "OPERATIVO") {
    return <StatusPill color="green" label="OPERATIVO" />;
  }
  if (config.health === "CON_ERROR") {
    return <StatusPill color="red" label="CON ERROR" />;
  }
  return <StatusPill color="amber" label="POR CONFIGURAR" />;
}

function StatusPill({
  color,
  label,
}: {
  color: "gray" | "green" | "red" | "amber";
  label: string;
}) {
  const styles = {
    gray: "border-gray-200 bg-gray-50 text-gray-500",
    green: "border-green-200 bg-green-50 text-green-700",
    red: "border-red-200 bg-red-50 text-red-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  };
  const dots = {
    gray: "bg-gray-400",
    green: "bg-green-500",
    red: "bg-red-500",
    amber: "bg-amber-500",
  };
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold " +
        styles[color]
      }
    >
      <span className={"size-1.5 rounded-full " + dots[color]} /> {label}
    </span>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={"size-2 rounded-full " + color} /> {label}
    </span>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[11px] leading-4">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 text-gray-700">{value}</p>
    </div>
  );
}

function SecretInput({
  value,
  visible,
  onChange,
  placeholder,
}: {
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type={visible ? "text" : "password"}
      className={inputCls + " font-mono text-[11px]"}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      autoComplete="new-password"
    />
  );
}

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
  return (
    <div
      className={
        "mb-4 flex items-center gap-2 rounded border px-3 py-2 text-[11px] " +
        (feedback.kind === "success"
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700")
      }
    >
      {feedback.kind === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
      {feedback.text}
    </div>
  );
}
