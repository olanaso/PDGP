import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeftRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileSpreadsheet,
  History,
  KeyRound,
  Landmark,
  Link2,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/configuracion/siaf-ceplan")({
  head: () => ({
    meta: [
      { title: "Configuración · Integración presupuestal SIAF–CEPLAN" },
      {
        name: "description",
        content:
          "Configuración, homologación y actualización presupuestal SIAF–CEPLAN para la gestión predial.",
      },
    ],
  }),
  component: SiafCeplanPage,
});

type TabId =
  | "actualizacion"
  | "institucional"
  | "proyectos"
  | "ceplan"
  | "parametros"
  | "homologacion-predial"
  | "homologacion-ceplan"
  | "validaciones"
  | "bitacora"
  | "seguridad";

type ConnectionType = "Base de datos" | "Archivos" | "Servicio/API" | "Importación manual";
type UpdateMode =
  "Solo pendientes" | "Incremental" | "Reprocesar periodo" | "Actualización completa";
type Severity = "Correcto" | "Advertencia" | "Error crítico";

type Institution = {
  id: number;
  entityCode: string;
  entityName: string;
  sector: string;
  pliego: string;
  pliegoName: string;
  ue: string;
  ueName: string;
  ruc: string;
  fiscalYear: string;
  active: boolean;
  default: boolean;
};

type BudgetProject = {
  id: number;
  cui: string;
  internalCode: string;
  name: string;
  infrastructure: string;
  department: string;
  province: string;
  district: string;
  ue: string;
  startYear: string;
  endYear: string;
  budget: number;
  active: boolean;
};

type ConnectionConfig = {
  entity: string;
  pliego: string;
  ue: string;
  fiscalYear: string;
  type: ConnectionType;
  origin: string;
  server: string;
  port: string;
  database: string;
  user: string;
  timeout: string;
  sourcePath: string;
  format: string;
  encoding: string;
  filenamePattern: string;
};

type Period = {
  id: string;
  year: string;
  period: string;
  entity: string;
  records: number;
  origin: string;
  databaseDate: string;
  status: "Disponible" | "Procesado" | "Observado";
  progress: number;
};

type ProcessLog = {
  id: string;
  entity: string;
  ue: string;
  origin: string;
  year: string;
  period: string;
  startedAt: string;
  finishedAt: string;
  user: string;
  found: number;
  processed: number;
  inserted: number;
  updated: number;
  observed: number;
  errors: number;
  status: string;
  message: string;
  sourceFile: string;
  hash: string;
};

type PersistedState = {
  institutions: Institution[];
  projects: BudgetProject[];
  connection: ConnectionConfig;
  processingIds: string[];
  updateMode: UpdateMode;
  logs: ProcessLog[];
};

const STORAGE_KEY = "mtc-siaf-ceplan-config-v1";

const institutionsSeed: Institution[] = [
  {
    id: 1,
    entityCode: "036",
    entityName: "Ministerio de Transportes y Comunicaciones",
    sector: "36 · Transportes y Comunicaciones",
    pliego: "036",
    pliegoName: "Ministerio de Transportes y Comunicaciones",
    ue: "001",
    ueName: "Administración General",
    ruc: "20131379944",
    fiscalYear: "2026",
    active: true,
    default: true,
  },
  {
    id: 2,
    entityCode: "036",
    entityName: "Ministerio de Transportes y Comunicaciones",
    sector: "36 · Transportes y Comunicaciones",
    pliego: "036",
    pliegoName: "Ministerio de Transportes y Comunicaciones",
    ue: "010",
    ueName: "Provías Nacional",
    ruc: "20503503639",
    fiscalYear: "2026",
    active: true,
    default: false,
  },
];

const projectsSeed: BudgetProject[] = [
  {
    id: 1,
    cui: "2491435",
    internalCode: "AERO-IQT-2026",
    name: "Mejoramiento del Aeropuerto Internacional de Iquitos",
    infrastructure: "Aeroportuaria",
    department: "Loreto",
    province: "Maynas",
    district: "San Juan Bautista",
    ue: "001",
    startYear: "2024",
    endYear: "2028",
    budget: 486500000,
    active: true,
  },
  {
    id: 2,
    cui: "2233850",
    internalCode: "AERO-JAU-2026",
    name: "Mejoramiento del Aeropuerto Francisco Carlé de Jauja",
    infrastructure: "Aeroportuaria",
    department: "Junín",
    province: "Jauja",
    district: "Jauja",
    ue: "001",
    startYear: "2023",
    endYear: "2027",
    budget: 312800000,
    active: true,
  },
];

const connectionSeed: ConnectionConfig = {
  entity: "036 · Ministerio de Transportes y Comunicaciones",
  pliego: "036 · MTC",
  ue: "001 · Administración General",
  fiscalYear: "2026",
  type: "Base de datos",
  origin: "SIAF-SP",
  server: "10.10.20.15",
  port: "1433",
  database: "SIAF_2026",
  user: "svc_integracion_predial",
  timeout: "30",
  sourcePath: "\\\\servidor\\siaf\\exportaciones",
  format: "DBF",
  encoding: "Windows-1252",
  filenamePattern: "SIAF_{AAAA}_{MM}_*.dbf",
};

const availablePeriods: Period[] = [
  {
    id: "2024-ANUAL",
    year: "2024",
    period: "Anual",
    entity: "036",
    records: 34250,
    origin: "SIAF",
    databaseDate: "31/12/2024",
    status: "Procesado",
    progress: 100,
  },
  {
    id: "2025-ANUAL",
    year: "2025",
    period: "Anual",
    entity: "036",
    records: 46805,
    origin: "SIAF",
    databaseDate: "31/12/2025",
    status: "Disponible",
    progress: 0,
  },
  {
    id: "2026-07",
    year: "2026",
    period: "Julio",
    entity: "036",
    records: 48023,
    origin: "SIAF",
    databaseDate: "20/08/2026",
    status: "Disponible",
    progress: 0,
  },
  {
    id: "2026-08",
    year: "2026",
    period: "Agosto",
    entity: "036",
    records: 51420,
    origin: "SIAF",
    databaseDate: "21/08/2026",
    status: "Observado",
    progress: 0,
  },
];

const validationRows: Array<{
  rule: string;
  detail: string;
  severity: Severity;
  records: number;
}> = [
  {
    rule: "Registros duplicados",
    detail: "Coincidencia por año, secuencia y clasificador",
    severity: "Advertencia",
    records: 18,
  },
  {
    rule: "Metas sin proyecto",
    detail: "Meta presupuestal sin CUI asociado",
    severity: "Error crítico",
    records: 7,
  },
  {
    rule: "Proyectos sin CUI",
    detail: "Proyecto predial sin código único de inversión",
    severity: "Error crítico",
    records: 2,
  },
  {
    rule: "Registros sin clasificador",
    detail: "Clasificador de gasto vacío o inválido",
    severity: "Advertencia",
    records: 11,
  },
  {
    rule: "Sin fuente de financiamiento",
    detail: "Registro sin código ni descripción de fuente",
    severity: "Advertencia",
    records: 4,
  },
  {
    rule: "SIAF sin homologación",
    detail: "Metas que aún no se vinculan con Gestión Predial",
    severity: "Advertencia",
    records: 63,
  },
  {
    rule: "CEPLAN sin meta SIAF",
    detail: "Actividad operativa sin equivalencia presupuestal",
    severity: "Advertencia",
    records: 9,
  },
  {
    rule: "Montos negativos",
    detail: "No se detectaron inconsistencias en los montos",
    severity: "Correcto",
    records: 0,
  },
  {
    rule: "PIM menor a ejecución",
    detail: "No se detectaron casos fuera de regla",
    severity: "Correcto",
    records: 0,
  },
  {
    rule: "Predios sin relación presupuestal",
    detail: "Predios activos sin meta presupuestal",
    severity: "Error crítico",
    records: 24,
  },
];

const importedFields = [
  "Año",
  "Mes",
  "Sector",
  "Pliego",
  "Unidad Ejecutora",
  "CUI",
  "Categoría presupuestal",
  "Producto / Proyecto",
  "Actividad / Obra",
  "Función",
  "División funcional",
  "Grupo funcional",
  "Meta",
  "Secuencia funcional",
  "Fuente de financiamiento",
  "Rubro",
  "Clasificador",
  "PIA",
  "Modificaciones",
  "PIM",
  "Certificación",
  "Compromiso anual",
  "Compromiso mensual",
  "Devengado",
  "Girado",
  "Pagado",
];

const initialLogs: ProcessLog[] = [
  {
    id: "PROC-2026-0087",
    entity: "036",
    ue: "001",
    origin: "SIAF",
    year: "2026",
    period: "Junio",
    startedAt: "20/08/2026 08:42",
    finishedAt: "20/08/2026 08:49",
    user: "mquiroz",
    found: 47218,
    processed: 47218,
    inserted: 1358,
    updated: 45812,
    observed: 42,
    errors: 6,
    status: "Completado con observaciones",
    message: "Proceso incremental finalizado",
    sourceFile: "SIAF_2026_06.zip",
    hash: "8f65c1...9ac4",
  },
];

function defaultState(): PersistedState {
  return {
    institutions: institutionsSeed,
    projects: projectsSeed,
    connection: connectionSeed,
    processingIds: ["2026-07"],
    updateMode: "Incremental",
    logs: initialLogs,
  };
}

function loadState(): PersistedState {
  const fallback = defaultState();
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored) as Partial<PersistedState>;
    return {
      institutions: parsed.institutions?.length ? parsed.institutions : fallback.institutions,
      projects: parsed.projects?.length ? parsed.projects : fallback.projects,
      connection: parsed.connection ?? fallback.connection,
      processingIds: parsed.processingIds ?? fallback.processingIds,
      updateMode: parsed.updateMode ?? fallback.updateMode,
      logs: parsed.logs?.length ? parsed.logs : fallback.logs,
    };
  } catch {
    return fallback;
  }
}

const tabs: Array<{ id: TabId; label: string; icon: typeof Settings2 }> = [
  { id: "actualizacion", label: "Origen y actualización", icon: RefreshCw },
  { id: "institucional", label: "Configuración institucional", icon: Building2 },
  { id: "proyectos", label: "Proyectos / CUI", icon: Landmark },
  { id: "ceplan", label: "Configuración CEPLAN", icon: FileSpreadsheet },
  { id: "parametros", label: "Parámetros presupuestales", icon: Database },
  { id: "homologacion-predial", label: "SIAF – Gestión Predial", icon: Link2 },
  { id: "homologacion-ceplan", label: "SIAF – CEPLAN", icon: ArrowLeftRight },
  { id: "validaciones", label: "Validaciones", icon: ClipboardCheck },
  { id: "bitacora", label: "Bitácora", icon: History },
  { id: "seguridad", label: "Seguridad y auditoría", icon: ShieldCheck },
];

function SiafCeplanPage() {
  const [state, setState] = useState<PersistedState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<TabId>("actualizacion");
  const [password, setPassword] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "failed"
  >("idle");
  const [lastTest, setLastTest] = useState("Sin pruebas registradas");
  const [responseTime, setResponseTime] = useState("—");
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState("");
  const [institutionEditor, setInstitutionEditor] = useState<Institution | null>(null);
  const [projectEditor, setProjectEditor] = useState<BudgetProject | null>(null);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(100, current + 4));
    }, 150);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running || progress < 100) return;
    setRunning(false);
    const periods = availablePeriods.filter((period) => state.processingIds.includes(period.id));
    const found = periods.reduce((total, period) => total + period.records, 0);
    const now = new Date().toLocaleString("es-PE");
    const newLog: ProcessLog = {
      id: `PROC-2026-${String(state.logs.length + 88).padStart(4, "0")}`,
      entity: "036",
      ue: "001",
      origin: state.connection.origin,
      year: periods[0]?.year ?? state.connection.fiscalYear,
      period: periods.map((period) => period.period).join(", ") || "Sin periodo",
      startedAt: now,
      finishedAt: now,
      user: "equipo.funcional",
      found,
      processed: found,
      inserted: Math.round(found * 0.08),
      updated: Math.round(found * 0.91),
      observed: Math.round(found * 0.009),
      errors: Math.round(found * 0.001),
      status: "Completado con observaciones",
      message: `${state.updateMode} finalizada correctamente`,
      sourceFile:
        state.connection.type === "Archivos"
          ? state.connection.filenamePattern
          : "Conexión directa",
      hash: `sha256:${crypto.randomUUID().slice(0, 12)}`,
    };
    setState((current) => ({ ...current, logs: [newLog, ...current.logs] }));
    setNotice("Actualización terminada. Se ejecutaron las validaciones automáticas.");
  }, [
    progress,
    running,
    state.connection,
    state.logs.length,
    state.processingIds,
    state.updateMode,
  ]);

  const processingPeriods = useMemo(
    () => availablePeriods.filter((period) => state.processingIds.includes(period.id)),
    [state.processingIds],
  );

  const foundRecords = processingPeriods.reduce((total, period) => total + period.records, 0);
  const processedRecords = Math.round((foundRecords * progress) / 100);

  function persist(next = state) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setNotice("Configuración guardada correctamente. La contraseña no fue almacenada.");
  }

  function updateConnection<K extends keyof ConnectionConfig>(key: K, value: ConnectionConfig[K]) {
    setState((current) => ({
      ...current,
      connection: { ...current.connection, [key]: value },
    }));
  }

  function testConnection() {
    setConnectionStatus("testing");
    setNotice("");
    window.setTimeout(() => {
      const succeeds = Boolean(
        state.connection.origin && (state.connection.server || state.connection.sourcePath),
      );
      setConnectionStatus(succeeds ? "success" : "failed");
      setResponseTime(succeeds ? "186 ms" : "5,000 ms");
      setLastTest(new Date().toLocaleString("es-PE"));
    }, 850);
  }

  function addSelectedPeriods() {
    setState((current) => ({
      ...current,
      processingIds: Array.from(new Set([...current.processingIds, ...selectedAvailable])),
    }));
    setSelectedAvailable([]);
  }

  function startUpdate(mode = state.updateMode) {
    if (!state.processingIds.length) {
      setNotice("Seleccione al menos un periodo para iniciar la actualización.");
      return;
    }
    if (
      mode === "Actualización completa" &&
      !window.confirm(
        "La actualización completa reconstruirá la información de los periodos seleccionados. ¿Desea continuar?",
      )
    )
      return;
    setState((current) => ({ ...current, updateMode: mode }));
    setProgress(0);
    setNotice("");
    setRunning(true);
  }

  function saveInstitution(institution: Institution) {
    setState((current) => ({
      ...current,
      institutions: current.institutions.some((item) => item.id === institution.id)
        ? current.institutions.map((item) => (item.id === institution.id ? institution : item))
        : [...current.institutions, institution],
    }));
    setInstitutionEditor(null);
    setNotice("Configuración institucional registrada.");
  }

  function saveProject(project: BudgetProject) {
    setState((current) => ({
      ...current,
      projects: current.projects.some((item) => item.id === project.id)
        ? current.projects.map((item) => (item.id === project.id ? project : item))
        : [...current.projects, project],
    }));
    setProjectEditor(null);
    setNotice("Proyecto/CUI registrado y disponible para homologación.");
  }

  return (
    <div className="flex min-h-screen bg-[#f9fafb] text-[#172033]">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-auto p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <RefreshCw size={18} className="text-[#dc2626]" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[18px] font-semibold">
                  Configuración / Actualización SIAF – CEPLAN
                </h1>
                <span className="text-[12px] text-[#6b7280]">Integración presupuestal</span>
              </div>
              <p className="mt-0.5 text-[11px] text-[#6b7280]">
                Integra información oficial con proyectos, expedientes y predios sin reemplazar al
                SIAF.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={connectionStatus === "success" ? "green" : "slate"}>
              {connectionStatus === "success" ? "SIAF conectado" : "Conexión pendiente"}
            </Badge>
            <Badge tone="red">Año fiscal {state.connection.fiscalYear}</Badge>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-[#e5e7eb] bg-white p-3">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <ContextSelect
              label="Entidad"
              value={state.connection.entity}
              options={["036 · Ministerio de Transportes y Comunicaciones"]}
              onChange={(value) => updateConnection("entity", value)}
            />
            <ContextSelect
              label="Proyecto / CUI"
              value="2491435 · Aeropuerto de Iquitos"
              options={["2491435 · Aeropuerto de Iquitos", "2233850 · Aeropuerto de Jauja"]}
              onChange={() => undefined}
            />
            <ContextSelect
              label="Unidad Ejecutora"
              value={state.connection.ue}
              options={["001 · Administración General", "010 · Provías Nacional"]}
              onChange={(value) => updateConnection("ue", value)}
            />
            <ContextSelect
              label="Año"
              value={state.connection.fiscalYear}
              options={["2026", "2025", "2024"]}
              onChange={(value) => updateConnection("fiscalYear", value)}
            />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
          <nav className="h-fit max-h-[calc(100vh-170px)] w-full overflow-y-auto rounded-lg border border-[#e5e7eb] bg-white p-2">
            <div className="mb-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
              Secciones del módulo
            </div>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 xl:block xl:space-y-0.5">
              {tabs.map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition ${
                      active
                        ? "bg-[#fef2f2] font-medium text-[#dc2626]"
                        : "text-[#374151] hover:bg-[#f3f4f6]"
                    }`}
                  >
                    <Icon size={14} className="shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <section className="min-w-0">
            {notice && (
              <div className="mb-3 flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-800">
                <span>{notice}</span>
                <button
                  type="button"
                  onClick={() => setNotice("")}
                  className="text-blue-700 hover:text-blue-950"
                >
                  ×
                </button>
              </div>
            )}

            {tab === "actualizacion" && (
              <UpdateWorkspace
                state={state}
                password={password}
                setPassword={setPassword}
                updateConnection={updateConnection}
                connectionStatus={connectionStatus}
                responseTime={responseTime}
                lastTest={lastTest}
                testConnection={testConnection}
                selectedAvailable={selectedAvailable}
                setSelectedAvailable={setSelectedAvailable}
                processingPeriods={processingPeriods}
                addSelectedPeriods={addSelectedPeriods}
                removePeriod={(id) =>
                  setState((current) => ({
                    ...current,
                    processingIds: current.processingIds.filter((item) => item !== id),
                  }))
                }
                selectAll={() => setSelectedAvailable(availablePeriods.map((period) => period.id))}
                clearSelection={() => setSelectedAvailable([])}
                updateMode={state.updateMode}
                setUpdateMode={(mode) => setState((current) => ({ ...current, updateMode: mode }))}
                running={running}
                progress={progress}
                processedRecords={processedRecords}
                foundRecords={foundRecords}
                onSave={() => persist()}
                onStart={() => startUpdate()}
                onPending={() => startUpdate("Solo pendientes")}
                onFull={() => startUpdate("Actualización completa")}
                openValidations={() => setTab("validaciones")}
                openLogs={() => setTab("bitacora")}
              />
            )}

            {tab === "institucional" && (
              <InstitutionPanel
                rows={state.institutions}
                editor={institutionEditor}
                setEditor={setInstitutionEditor}
                save={saveInstitution}
                setDefault={(id) =>
                  setState((current) => ({
                    ...current,
                    institutions: current.institutions.map((item) => ({
                      ...item,
                      default: item.id === id,
                    })),
                  }))
                }
                remove={(id) =>
                  setState((current) => ({
                    ...current,
                    institutions: current.institutions.filter((item) => item.id !== id),
                  }))
                }
              />
            )}

            {tab === "proyectos" && (
              <ProjectsPanel
                rows={state.projects}
                editor={projectEditor}
                setEditor={setProjectEditor}
                save={saveProject}
                remove={(id) =>
                  setState((current) => ({
                    ...current,
                    projects: current.projects.filter((item) => item.id !== id),
                  }))
                }
              />
            )}

            {tab === "ceplan" && (
              <CeplanPanel
                onSave={() => setNotice("Configuración CEPLAN guardada y lista para homologación.")}
              />
            )}
            {tab === "parametros" && <ParametersPanel />}
            {tab === "homologacion-predial" && (
              <PredialMappingPanel
                onSave={() =>
                  setNotice("Homologación SIAF–Gestión Predial registrada para 3 predios.")
                }
              />
            )}
            {tab === "homologacion-ceplan" && (
              <CeplanMappingPanel
                onSave={() =>
                  setNotice(
                    "Homologación SIAF–CEPLAN registrada con trazabilidad de usuario y fecha.",
                  )
                }
              />
            )}
            {tab === "validaciones" && <ValidationsPanel />}
            {tab === "bitacora" && <LogsPanel logs={state.logs} />}
            {tab === "seguridad" && <SecurityPanel />}
          </section>
        </div>
      </main>
    </div>
  );
}

function UpdateWorkspace(props: {
  state: PersistedState;
  password: string;
  setPassword: (value: string) => void;
  updateConnection: <K extends keyof ConnectionConfig>(key: K, value: ConnectionConfig[K]) => void;
  connectionStatus: "idle" | "testing" | "success" | "failed";
  responseTime: string;
  lastTest: string;
  testConnection: () => void;
  selectedAvailable: string[];
  setSelectedAvailable: (ids: string[]) => void;
  processingPeriods: Period[];
  addSelectedPeriods: () => void;
  removePeriod: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  updateMode: UpdateMode;
  setUpdateMode: (mode: UpdateMode) => void;
  running: boolean;
  progress: number;
  processedRecords: number;
  foundRecords: number;
  onSave: () => void;
  onStart: () => void;
  onPending: () => void;
  onFull: () => void;
  openValidations: () => void;
  openLogs: () => void;
}) {
  const { state, updateConnection } = props;
  const connection = state.connection;
  return (
    <div className="space-y-3">
      <SectionTitle
        title="Configuración de origen"
        description="Defina cómo se obtiene la información presupuestal oficial del SIAF."
        icon={Server}
      />
      <Panel>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Entidad">
            <Input
              value={connection.entity}
              onChange={(value) => updateConnection("entity", value)}
            />
          </Field>
          <Field label="Pliego">
            <Input
              value={connection.pliego}
              onChange={(value) => updateConnection("pliego", value)}
            />
          </Field>
          <Field label="Unidad Ejecutora">
            <Input value={connection.ue} onChange={(value) => updateConnection("ue", value)} />
          </Field>
          <Field label="Año fiscal">
            <Input
              value={connection.fiscalYear}
              onChange={(value) => updateConnection("fiscalYear", value)}
            />
          </Field>
          <Field label="Tipo de conexión">
            <Select
              value={connection.type}
              options={["Base de datos", "Archivos", "Servicio/API", "Importación manual"]}
              onChange={(value) => updateConnection("type", value as ConnectionType)}
            />
          </Field>
          <Field label="Origen de datos">
            <Input
              value={connection.origin}
              onChange={(value) => updateConnection("origin", value)}
            />
          </Field>
        </div>

        {connection.type === "Base de datos" && (
          <div className="mt-3 grid gap-3 border-t border-slate-200 pt-3 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Servidor / IP">
              <Input
                value={connection.server}
                onChange={(value) => updateConnection("server", value)}
              />
            </Field>
            <Field label="Puerto">
              <Input
                value={connection.port}
                onChange={(value) => updateConnection("port", value)}
              />
            </Field>
            <Field label="Base de datos">
              <Input
                value={connection.database}
                onChange={(value) => updateConnection("database", value)}
              />
            </Field>
            <Field label="Timeout (segundos)">
              <Input
                value={connection.timeout}
                onChange={(value) => updateConnection("timeout", value)}
              />
            </Field>
            <Field label="Usuario">
              <Input
                value={connection.user}
                onChange={(value) => updateConnection("user", value)}
              />
            </Field>
            <Field label="Contraseña cifrada" hint="Nunca se guarda en texto plano">
              <input
                type="password"
                value={props.password}
                onChange={(event) => props.setPassword(event.target.value)}
                placeholder="••••••••••••"
                className={inputClass}
              />
            </Field>
          </div>
        )}

        {connection.type === "Archivos" && (
          <div className="mt-3 grid gap-3 border-t border-slate-200 pt-3 md:grid-cols-2 xl:grid-cols-5">
            <Field label="Ruta origen">
              <Input
                value={connection.sourcePath}
                onChange={(value) => updateConnection("sourcePath", value)}
              />
            </Field>
            <Field label="Formato">
              <Select
                value={connection.format}
                options={["DBF", "CSV", "XLSX", "TXT", "ZIP"]}
                onChange={(value) => updateConnection("format", value)}
              />
            </Field>
            <Field label="Año">
              <Input
                value={connection.fiscalYear}
                onChange={(value) => updateConnection("fiscalYear", value)}
              />
            </Field>
            <Field label="Codificación">
              <Select
                value={connection.encoding}
                options={["UTF-8", "Windows-1252", "ISO-8859-1"]}
                onChange={(value) => updateConnection("encoding", value)}
              />
            </Field>
            <Field label="Patrón de archivo">
              <Input
                value={connection.filenamePattern}
                onChange={(value) => updateConnection("filenamePattern", value)}
              />
            </Field>
          </div>
        )}

        {(connection.type === "Servicio/API" || connection.type === "Importación manual") && (
          <div className="mt-3 grid gap-3 border-t border-slate-200 pt-3 md:grid-cols-2">
            <Field
              label={
                connection.type === "Servicio/API" ? "URL del servicio" : "Archivo de importación"
              }
            >
              <Input
                value={connection.sourcePath}
                onChange={(value) => updateConnection("sourcePath", value)}
                placeholder={
                  connection.type === "Servicio/API"
                    ? "https://servicio.entidad.gob.pe/api"
                    : "Seleccione un archivo oficial"
                }
              />
            </Field>
            <Field label="Formato">
              <Select
                value={connection.format}
                options={["JSON", "CSV", "XLSX", "ZIP"]}
                onChange={(value) => updateConnection("format", value)}
              />
            </Field>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-2.5">
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <ConnectionBadge status={props.connectionStatus} />
            <span className="font-semibold text-slate-600">Tiempo: {props.responseTime}</span>
            <span className="text-slate-500">Última prueba: {props.lastTest}</span>
          </div>
          <button
            type="button"
            onClick={props.testConnection}
            disabled={props.connectionStatus === "testing"}
            className={buttonSecondary}
          >
            {props.connectionStatus === "testing" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Server size={13} />
            )}{" "}
            Probar conexión
          </button>
        </div>
      </Panel>

      <SectionTitle
        title="Periodos disponibles"
        description="Seleccione información del origen y agréguela a la cola de procesamiento."
        icon={ArrowLeftRight}
      />
      <div className="grid gap-3 xl:grid-cols-[1fr_92px_1fr]">
        <PeriodPanel title="Información disponible" subtitle="Periodos encontrados en el origen">
          {availablePeriods.map((period) => (
            <PeriodRow
              key={period.id}
              period={period}
              selected={props.selectedAvailable.includes(period.id)}
              onSelect={() =>
                props.setSelectedAvailable(
                  props.selectedAvailable.includes(period.id)
                    ? props.selectedAvailable.filter((id) => id !== period.id)
                    : [...props.selectedAvailable, period.id],
                )
              }
            />
          ))}
          <div className="flex gap-2 border-t border-slate-200 px-3 py-2">
            <button type="button" onClick={props.selectAll} className={smallButton}>
              Seleccionar todos
            </button>
            <button type="button" onClick={props.clearSelection} className={smallButton}>
              Limpiar selección
            </button>
          </div>
        </PeriodPanel>
        <div className="flex items-center justify-center">
          <div className="flex gap-2 xl:flex-col">
            <button
              type="button"
              onClick={props.addSelectedPeriods}
              disabled={!props.selectedAvailable.length}
              className="inline-flex h-8 items-center justify-center rounded-md bg-[#dc2626] px-3 text-[12px] font-medium text-white hover:bg-[#b91c1c] disabled:opacity-40"
            >
              Agregar →
            </button>
            <button
              type="button"
              onClick={() =>
                props.processingPeriods.forEach((period) => props.removePeriod(period.id))
              }
              className={smallButton}
            >
              ← Quitar
            </button>
          </div>
        </div>
        <PeriodPanel title="Información a procesar" subtitle="Cola preparada para la actualización">
          {props.processingPeriods.map((period) => (
            <ProcessingPeriodRow
              key={period.id}
              period={period}
              onRemove={() => props.removePeriod(period.id)}
            />
          ))}
          {!props.processingPeriods.length && (
            <Empty text="Agregue uno o más periodos desde el panel de origen." />
          )}
        </PeriodPanel>
      </div>

      <SectionTitle
        title="Modo de actualización"
        description="La operación se aplica únicamente a los periodos seleccionados."
        icon={RefreshCw}
      />
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {(
          [
            "Solo pendientes",
            "Incremental",
            "Reprocesar periodo",
            "Actualización completa",
          ] as UpdateMode[]
        ).map((mode) => (
          <label
            key={mode}
            className={`cursor-pointer rounded-lg border p-3 ${props.updateMode === mode ? "border-red-400 bg-red-50 ring-1 ring-red-200" : "border-slate-300 bg-white hover:border-slate-400"}`}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                checked={props.updateMode === mode}
                onChange={() => props.setUpdateMode(mode)}
                className="accent-red-600"
              />
              <span className="text-[13px] font-medium text-[#172033]">{mode}</span>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-[#6b7280]">{modeDescription(mode)}</p>
          </label>
        ))}
      </div>

      {(props.running || props.progress > 0) && (
        <Panel>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[14px] font-semibold text-[#172033]">
                Procesando SIAF {connection.fiscalYear}
              </div>
              <div className="text-[10px] text-slate-500">
                {props.processedRecords.toLocaleString("es-PE")} /{" "}
                {props.foundRecords.toLocaleString("es-PE")} registros
              </div>
            </div>
            <span className="text-[20px] font-semibold text-[#dc2626]">{props.progress}%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-[#dc2626] transition-all"
              style={{ width: `${props.progress}%` }}
            />
          </div>
        </Panel>
      )}

      <details className="rounded-lg border border-slate-300 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-[13px] font-medium text-[#374151]">
          Estructura presupuestal a importar · {importedFields.length} campos obligatorios
        </summary>
        <div className="flex flex-wrap gap-1.5 border-t border-slate-200 p-3">
          {importedFields.map((field) => (
            <span
              key={field}
              className="rounded border border-[#e5e7eb] bg-[#f9fafb] px-2 py-1 text-[11px] text-[#4b5563]"
            >
              {field}
            </span>
          ))}
        </div>
      </details>

      <div className="flex flex-wrap justify-end gap-2 rounded-lg border border-slate-300 bg-white p-3">
        <button type="button" onClick={props.openLogs} className={buttonSecondary}>
          <History size={13} /> Ver bitácora
        </button>
        <button type="button" onClick={props.openValidations} className={buttonSecondary}>
          <ClipboardCheck size={13} /> Ver observaciones
        </button>
        <button type="button" onClick={props.onSave} className={buttonSecondary}>
          <Save size={13} /> Guardar configuración
        </button>
        <button
          type="button"
          onClick={props.onPending}
          disabled={props.running}
          className={buttonSecondary}
        >
          <RefreshCw size={13} /> Actualizar pendientes
        </button>
        <button
          type="button"
          onClick={props.onFull}
          disabled={props.running}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-3 text-[12px] font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          <AlertTriangle size={13} /> Actualización completa
        </button>
        <button
          type="button"
          onClick={props.onStart}
          disabled={props.running}
          className={buttonPrimary}
        >
          {props.running ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}{" "}
          Iniciar actualización
        </button>
      </div>
    </div>
  );
}

function InstitutionPanel({
  rows,
  editor,
  setEditor,
  save,
  setDefault,
  remove,
}: {
  rows: Institution[];
  editor: Institution | null;
  setEditor: (row: Institution | null) => void;
  save: (row: Institution) => void;
  setDefault: (id: number) => void;
  remove: (id: number) => void;
}) {
  const empty = (): Institution => ({
    id: Date.now(),
    entityCode: "036",
    entityName: "",
    sector: "36 · Transportes y Comunicaciones",
    pliego: "036",
    pliegoName: "",
    ue: "",
    ueName: "",
    ruc: "",
    fiscalYear: "2026",
    active: true,
    default: false,
  });
  return (
    <div className="space-y-3">
      <SectionTitle
        title="Configuración institucional"
        description="Entidades, pliegos y unidades ejecutoras habilitadas para la integración."
        icon={Building2}
        action={
          <button type="button" onClick={() => setEditor(empty())} className={buttonPrimary}>
            <Plus size={13} /> Nueva configuración
          </button>
        }
      />
      {editor && (
        <InstitutionEditor
          value={editor}
          onChange={setEditor}
          onCancel={() => setEditor(null)}
          onSave={() => save(editor)}
        />
      )}
      <DataTable
        headers={[
          "Entidad",
          "Pliego",
          "Unidad Ejecutora",
          "RUC",
          "Año",
          "Estado",
          "Predeterminada",
          "Acciones",
        ]}
      >
        {rows.map((row) => (
          <tr key={row.id}>
            <Cell strong>
              {row.entityCode} · {row.entityName}
            </Cell>
            <Cell>
              {row.pliego} · {row.pliegoName}
            </Cell>
            <Cell>
              {row.ue} · {row.ueName}
            </Cell>
            <Cell>{row.ruc}</Cell>
            <Cell>{row.fiscalYear}</Cell>
            <Cell>
              <Badge tone={row.active ? "green" : "slate"}>
                {row.active ? "Activo" : "Inactivo"}
              </Badge>
            </Cell>
            <Cell>
              <button
                type="button"
                onClick={() => setDefault(row.id)}
                className={
                  row.default
                    ? "rounded-full bg-red-100 px-2 py-1 text-[11px] font-medium text-red-700"
                    : smallButton
                }
              >
                {row.default ? "Predeterminada" : "Definir"}
              </button>
            </Cell>
            <Cell>
              <div className="flex gap-1">
                <button type="button" onClick={() => setEditor({ ...row })} className={smallButton}>
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => remove(row.id)}
                  className="rounded border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </Cell>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}

function InstitutionEditor({
  value,
  onChange,
  onCancel,
  onSave,
}: {
  value: Institution;
  onChange: (value: Institution) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const set = <K extends keyof Institution>(key: K, fieldValue: Institution[K]) =>
    onChange({ ...value, [key]: fieldValue });
  return (
    <Panel>
      <div className="mb-3 text-[14px] font-semibold text-[#172033]">
        Datos de la configuración institucional
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Código entidad">
          <Input value={value.entityCode} onChange={(v) => set("entityCode", v)} />
        </Field>
        <Field label="Nombre entidad">
          <Input value={value.entityName} onChange={(v) => set("entityName", v)} />
        </Field>
        <Field label="Sector">
          <Input value={value.sector} onChange={(v) => set("sector", v)} />
        </Field>
        <Field label="Pliego">
          <Input value={value.pliego} onChange={(v) => set("pliego", v)} />
        </Field>
        <Field label="Nombre del pliego">
          <Input value={value.pliegoName} onChange={(v) => set("pliegoName", v)} />
        </Field>
        <Field label="Unidad Ejecutora">
          <Input value={value.ue} onChange={(v) => set("ue", v)} />
        </Field>
        <Field label="Nombre de Unidad Ejecutora">
          <Input value={value.ueName} onChange={(v) => set("ueName", v)} />
        </Field>
        <Field label="RUC">
          <Input value={value.ruc} onChange={(v) => set("ruc", v)} />
        </Field>
        <Field label="Año fiscal">
          <Input value={value.fiscalYear} onChange={(v) => set("fiscalYear", v)} />
        </Field>
        <Field label="Estado">
          <Select
            value={value.active ? "Activo" : "Inactivo"}
            options={["Activo", "Inactivo"]}
            onChange={(v) => set("active", v === "Activo")}
          />
        </Field>
      </div>
      <ActionFooter onCancel={onCancel} onSave={onSave} />
    </Panel>
  );
}

function ProjectsPanel({
  rows,
  editor,
  setEditor,
  save,
  remove,
}: {
  rows: BudgetProject[];
  editor: BudgetProject | null;
  setEditor: (row: BudgetProject | null) => void;
  save: (row: BudgetProject) => void;
  remove: (id: number) => void;
}) {
  const empty = (): BudgetProject => ({
    id: Date.now(),
    cui: "",
    internalCode: "",
    name: "",
    infrastructure: "Aeroportuaria",
    department: "",
    province: "",
    district: "",
    ue: "001",
    startYear: "2026",
    endYear: "2028",
    budget: 0,
    active: true,
  });
  return (
    <div className="space-y-3">
      <SectionTitle
        title="Proyectos / CUI"
        description="Proyectos habilitados para relacionarse con metas presupuestales, expedientes y predios."
        icon={Landmark}
        action={
          <button type="button" onClick={() => setEditor(empty())} className={buttonPrimary}>
            <Plus size={13} /> Nuevo proyecto
          </button>
        }
      />
      {editor && (
        <ProjectEditor
          value={editor}
          onChange={setEditor}
          onCancel={() => setEditor(null)}
          onSave={() => save(editor)}
        />
      )}
      <DataTable
        headers={[
          "CUI / Código",
          "Proyecto",
          "Ubicación",
          "Unidad Ejecutora",
          "Periodo",
          "Presupuesto",
          "Estado",
          "Acciones",
        ]}
      >
        {rows.map((row) => (
          <tr key={row.id}>
            <Cell strong>
              {row.cui}
              <div className="text-[11px] text-[#6b7280]">{row.internalCode}</div>
            </Cell>
            <Cell>
              {row.name}
              <div className="text-[11px] text-[#6b7280]">{row.infrastructure}</div>
            </Cell>
            <Cell>
              {row.department} / {row.province} / {row.district}
            </Cell>
            <Cell>{row.ue}</Cell>
            <Cell>
              {row.startYear}–{row.endYear}
            </Cell>
            <Cell strong>S/ {row.budget.toLocaleString("es-PE")}</Cell>
            <Cell>
              <Badge tone={row.active ? "green" : "slate"}>
                {row.active ? "Activo" : "Inactivo"}
              </Badge>
            </Cell>
            <Cell>
              <div className="flex gap-1">
                <button type="button" onClick={() => setEditor({ ...row })} className={smallButton}>
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => remove(row.id)}
                  className="rounded border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </Cell>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}

function ProjectEditor({
  value,
  onChange,
  onCancel,
  onSave,
}: {
  value: BudgetProject;
  onChange: (value: BudgetProject) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const set = <K extends keyof BudgetProject>(key: K, fieldValue: BudgetProject[K]) =>
    onChange({ ...value, [key]: fieldValue });
  return (
    <Panel>
      <div className="mb-3 text-[14px] font-semibold text-[#172033]">
        Datos del proyecto de Gestión Predial
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Field label="ID proyecto">
          <Input value={String(value.id)} onChange={(v) => set("id", Number(v) || value.id)} />
        </Field>
        <Field label="CUI">
          <Input value={value.cui} onChange={(v) => set("cui", v)} />
        </Field>
        <Field label="Código interno">
          <Input value={value.internalCode} onChange={(v) => set("internalCode", v)} />
        </Field>
        <Field label="Nombre del proyecto">
          <Input value={value.name} onChange={(v) => set("name", v)} />
        </Field>
        <Field label="Tipo de infraestructura">
          <Select
            value={value.infrastructure}
            options={["Aeroportuaria", "Vial", "Ferroviaria", "Portuaria"]}
            onChange={(v) => set("infrastructure", v)}
          />
        </Field>
        <Field label="Departamento">
          <Input value={value.department} onChange={(v) => set("department", v)} />
        </Field>
        <Field label="Provincia">
          <Input value={value.province} onChange={(v) => set("province", v)} />
        </Field>
        <Field label="Distrito">
          <Input value={value.district} onChange={(v) => set("district", v)} />
        </Field>
        <Field label="Unidad Ejecutora">
          <Input value={value.ue} onChange={(v) => set("ue", v)} />
        </Field>
        <Field label="Año inicio">
          <Input value={value.startYear} onChange={(v) => set("startYear", v)} />
        </Field>
        <Field label="Año término">
          <Input value={value.endYear} onChange={(v) => set("endYear", v)} />
        </Field>
        <Field label="Presupuesto referencial">
          <Input value={String(value.budget)} onChange={(v) => set("budget", Number(v) || 0)} />
        </Field>
      </div>
      <ActionFooter onCancel={onCancel} onSave={onSave} />
    </Panel>
  );
}

function CeplanPanel({ onSave }: { onSave: () => void }) {
  const [source, setSource] = useState("Archivo XLSX");
  return (
    <div className="space-y-3">
      <SectionTitle
        title="Configuración CEPLAN"
        description="Información del PEI, POI y actividades operativas que será homologada con las metas SIAF."
        icon={FileSpreadsheet}
      />
      <Panel>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Entidad">
            <Input value="036 · MTC" />
          </Field>
          <Field label="Año">
            <Input value="2026" />
          </Field>
          <Field label="PEI">
            <Input value="PEI 2024–2030" />
          </Field>
          <Field label="POI">
            <Input value="POI Anual 2026" />
          </Field>
          <Field label="Código OEI">
            <Input value="OEI.05" />
          </Field>
          <Field label="Código AEI">
            <Input value="AEI.05.02" />
          </Field>
          <Field label="Actividad Operativa">
            <Input value="AOI00003600412" />
          </Field>
          <Field label="Centro de costo">
            <Input value="DDP · Dirección de Disponibilidad de Predios" />
          </Field>
          <Field label="Unidad orgánica">
            <Input value="Dirección General de Programas y Proyectos" />
          </Field>
          <Field label="Unidad de medida">
            <Input value="Predio liberado" />
          </Field>
          <Field label="Meta física">
            <Input value="125" />
          </Field>
          <Field label="Programación financiera">
            <Input value="18500000" />
          </Field>
        </div>
        <div className="mt-4 grid gap-3 border-t border-slate-200 pt-3 md:grid-cols-[220px_1fr_auto]">
          <Field label="Origen CEPLAN">
            <Select
              value={source}
              options={["Archivo XLSX", "Servicio/API", "Importación manual"]}
              onChange={setSource}
            />
          </Field>
          <Field label="Archivo o endpoint">
            <Input
              value={
                source === "Servicio/API" ? "https://api.ceplan.gob.pe/poi" : "POI_2026_MTC.xlsx"
              }
            />
          </Field>
          <button type="button" className={`${buttonSecondary} self-end`}>
            <Upload size={13} /> Cargar información
          </button>
        </div>
        <ActionFooter onCancel={() => undefined} onSave={onSave} />
      </Panel>
    </div>
  );
}

function ParametersPanel() {
  return (
    <div className="space-y-3">
      <SectionTitle
        title="Parámetros presupuestales"
        description="Catálogos con código y descripción original del SIAF."
        icon={Database}
      />
      <div className="grid gap-3 xl:grid-cols-2">
        <Catalog
          title="Metas presupuestales"
          headers={["Año", "Secuencia", "Meta", "CUI", "Actividad / Obra", "Estado"]}
          rows={[
            ["2026", "0042", "0012", "2491435", "Gestión y liberación predial", "Activo"],
            ["2026", "0057", "0018", "2233850", "Adquisición de terrenos", "Activo"],
          ]}
        />
        <Catalog
          title="Fuentes de financiamiento"
          headers={["Código", "Descripción"]}
          rows={[
            ["1", "Recursos Ordinarios"],
            ["3", "Recursos por Operaciones Oficiales de Crédito"],
            ["5", "Recursos Determinados"],
          ]}
        />
        <Catalog
          title="Rubros"
          headers={["Código", "Descripción"]}
          rows={[
            ["00", "Recursos Ordinarios"],
            ["19", "Recursos por Operaciones Oficiales de Crédito"],
          ]}
        />
        <Catalog
          title="Clasificadores de gasto"
          headers={["Código", "Descripción", "Genérica", "Subgenérica", "Específica"]}
          rows={[
            ["2.6.5.1.1.1", "Terrenos urbanos", "2.6", "2.6.5", "2.6.5.1.1.1"],
            ["2.6.5.1.1.2", "Terrenos rurales", "2.6", "2.6.5", "2.6.5.1.1.2"],
          ]}
        />
      </div>
    </div>
  );
}

function PredialMappingPanel({ onSave }: { onSave: () => void }) {
  const stages = [
    "Diagnóstico",
    "Tasación",
    "Adquisición",
    "Pago",
    "Consignación",
    "Entrega de posesión",
    "Inscripción registral",
    "Transferencia interestatal",
  ];
  return (
    <div className="space-y-3">
      <SectionTitle
        title="Homologación SIAF – Gestión Predial"
        description="Una meta SIAF puede financiar múltiples expedientes y predios."
        icon={Link2}
      />
      <div className="grid gap-3 xl:grid-cols-[1fr_56px_1fr]">
        <Panel>
          <PanelHeading title="Información SIAF" subtitle="Clave presupuestal de origen" />
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Pliego">
              <Input value="036 · MTC" />
            </Field>
            <Field label="Unidad Ejecutora">
              <Input value="001" />
            </Field>
            <Field label="Año">
              <Input value="2026" />
            </Field>
            <Field label="CUI">
              <Input value="2491435" />
            </Field>
            <Field label="Meta">
              <Input value="0012" />
            </Field>
            <Field label="Secuencia funcional">
              <Input value="0042" />
            </Field>
            <Field label="Clasificador">
              <Input value="2.6.5.1.1.2" />
            </Field>
            <Field label="Fuente de financiamiento">
              <Input value="1 · Recursos Ordinarios" />
            </Field>
          </div>
        </Panel>
        <div className="flex items-center justify-center">
          <ArrowLeftRight className="text-red-500" />
        </div>
        <Panel>
          <PanelHeading title="Gestión Predial" subtitle="Destino de la homologación" />
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Proyecto">
              <Input value="Aeropuerto de Iquitos" />
            </Field>
            <Field label="Componente">
              <Input value="Liberación de áreas" />
            </Field>
            <Field label="Tramo">
              <Input value="Perímetro aeroportuario" />
            </Field>
            <Field label="Sector">
              <Input value="Sector 02" />
            </Field>
            <Field label="Expediente predial">
              <Input value="EXP-IQT-2026-0042" />
            </Field>
            <Field label="Etapa">
              <Select value="Adquisición" options={stages} />
            </Field>
          </div>
          <div className="mt-3">
            <div className="mb-1 text-[11px] font-medium text-[#6b7280]">Predios relacionados</div>
            {["AERO-JAUJA-PR-0567T", "AERO-JAUJA-PR-00245-A", "AERO-JAUJA-PR-0056"].map((code) => (
              <label
                key={code}
                className="mr-2 mt-1 inline-flex items-center gap-1.5 rounded border border-red-200 bg-red-50 px-2 py-1.5 text-[11px] font-medium text-red-700"
              >
                <input type="checkbox" defaultChecked className="accent-[#dc2626]" />
                {code}
              </label>
            ))}
          </div>
        </Panel>
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={onSave} className={buttonPrimary}>
          <Link2 size={13} /> Guardar homologación
        </button>
      </div>
      <Catalog
        title="Homologaciones vigentes"
        headers={[
          "CUI",
          "Meta / Secuencia",
          "Clasificador",
          "Proyecto",
          "Expediente",
          "Predios",
          "Etapa",
          "Estado",
        ]}
        rows={[
          [
            "2491435",
            "0012 / 0042",
            "2.6.5.1.1.2",
            "Aeropuerto de Iquitos",
            "EXP-IQT-2026-0042",
            "3",
            "Adquisición",
            "Vigente",
          ],
        ]}
      />
    </div>
  );
}

function CeplanMappingPanel({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle
        title="Homologación SIAF – CEPLAN"
        description="Relaciona la ejecución presupuestal con objetivos y actividades operativas."
        icon={ArrowLeftRight}
      />
      <div className="grid gap-3 xl:grid-cols-2">
        <Panel>
          <PanelHeading title="Meta SIAF" subtitle="Información presupuestal" />
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Proyecto / CUI">
              <Input value="2491435" />
            </Field>
            <Field label="Meta SIAF">
              <Input value="0012" />
            </Field>
            <Field label="Secuencia funcional">
              <Input value="0042" />
            </Field>
            <Field label="Actividad presupuestal">
              <Input value="6000053 · Adquisición de terrenos" />
            </Field>
          </div>
        </Panel>
        <Panel>
          <PanelHeading title="Planeamiento CEPLAN" subtitle="Cadena estratégica" />
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="PEI">
              <Input value="PEI 2024–2030" />
            </Field>
            <Field label="OEI">
              <Input value="OEI.05" />
            </Field>
            <Field label="AEI">
              <Input value="AEI.05.02" />
            </Field>
            <Field label="POI">
              <Input value="POI 2026" />
            </Field>
            <Field label="Actividad Operativa">
              <Input value="AOI00003600412" />
            </Field>
            <Field label="Centro de costo">
              <Input value="DDP" />
            </Field>
          </div>
        </Panel>
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={onSave} className={buttonPrimary}>
          <Link2 size={13} /> Guardar homologación
        </button>
      </div>
      <Catalog
        title="Homologaciones registradas"
        headers={[
          "CUI",
          "Meta / Secuencia",
          "PEI / POI",
          "OEI / AEI",
          "Actividad operativa",
          "Centro de costo",
          "Fecha",
          "Usuario",
          "Estado",
        ]}
        rows={[
          [
            "2491435",
            "0012 / 0042",
            "PEI 2024–2030 / POI 2026",
            "OEI.05 / AEI.05.02",
            "AOI00003600412",
            "DDP",
            "21/08/2026",
            "mquiroz",
            "Vigente",
          ],
        ]}
      />
    </div>
  );
}

function ValidationsPanel() {
  const totals = {
    correct: validationRows.filter((row) => row.severity === "Correcto").length,
    warning: validationRows.filter((row) => row.severity === "Advertencia").length,
    critical: validationRows.filter((row) => row.severity === "Error crítico").length,
  };
  return (
    <div className="space-y-3">
      <SectionTitle
        title="Validaciones automáticas"
        description="Controles ejecutados después de cada importación o reproceso."
        icon={ClipboardCheck}
      />
      <div className="grid gap-2 sm:grid-cols-3">
        <Metric label="Reglas correctas" value={totals.correct} tone="green" />
        <Metric label="Advertencias" value={totals.warning} tone="amber" />
        <Metric label="Errores críticos" value={totals.critical} tone="red" />
      </div>
      <DataTable
        headers={["Resultado", "Regla de validación", "Descripción", "Registros", "Acción"]}
      >
        {validationRows.map((row) => (
          <tr key={row.rule}>
            <Cell>
              <SeverityBadge severity={row.severity} />
            </Cell>
            <Cell strong>{row.rule}</Cell>
            <Cell>{row.detail}</Cell>
            <Cell strong>{row.records.toLocaleString("es-PE")}</Cell>
            <Cell>
              <button type="button" className={smallButton}>
                Ver registros
              </button>
            </Cell>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}

function LogsPanel({ logs }: { logs: ProcessLog[] }) {
  return (
    <div className="space-y-3">
      <SectionTitle
        title="Bitácora de actualización"
        description="Trazabilidad completa de cada proceso ejecutado."
        icon={History}
        action={
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Buscar proceso..."
              className="h-8 rounded-md border border-slate-300 pl-7 pr-2 text-[10px]"
            />
          </div>
        }
      />
      <DataTable
        headers={[
          "ID proceso",
          "Entidad / UE",
          "Origen",
          "Año / Periodo",
          "Inicio / Fin",
          "Usuario",
          "Encontrados",
          "Procesados",
          "Insertados",
          "Actualizados",
          "Observados",
          "Errores",
          "Estado",
          "Archivo / Hash",
        ]}
      >
        {logs.map((log) => (
          <tr key={log.id}>
            <Cell strong>{log.id}</Cell>
            <Cell>
              {log.entity} / {log.ue}
            </Cell>
            <Cell>{log.origin}</Cell>
            <Cell>
              {log.year} / {log.period}
            </Cell>
            <Cell>
              {log.startedAt}
              <div className="text-[11px] text-[#9ca3af]">{log.finishedAt}</div>
            </Cell>
            <Cell>{log.user}</Cell>
            <Cell>{log.found.toLocaleString("es-PE")}</Cell>
            <Cell>{log.processed.toLocaleString("es-PE")}</Cell>
            <Cell>{log.inserted.toLocaleString("es-PE")}</Cell>
            <Cell>{log.updated.toLocaleString("es-PE")}</Cell>
            <Cell>{log.observed.toLocaleString("es-PE")}</Cell>
            <Cell>{log.errors.toLocaleString("es-PE")}</Cell>
            <Cell>
              <Badge tone="amber">{log.status}</Badge>
              <div className="mt-1 text-[8px] text-slate-500">{log.message}</div>
            </Cell>
            <Cell>
              {log.sourceFile}
              <div className="text-[8px] text-slate-400">{log.hash}</div>
            </Cell>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}

function SecurityPanel() {
  const permissions = [
    "Administrador",
    "Configuración SIAF",
    "Importación",
    "Homologación",
    "Conciliación",
    "Consulta",
    "Reportes",
  ];
  return (
    <div className="space-y-3">
      <SectionTitle
        title="Seguridad y auditoría"
        description="Permisos independientes y registro de operaciones sensibles."
        icon={ShieldCheck}
      />
      <div className="grid gap-3 xl:grid-cols-2">
        <Panel>
          <PanelHeading title="Permisos del módulo" subtitle="Perfil: Especialista presupuestal" />
          <div className="grid gap-2 sm:grid-cols-2">
            {permissions.map((permission, index) => (
              <label
                key={permission}
                className="flex items-center justify-between rounded-md border border-slate-200 p-2.5 text-[10px] font-bold text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <KeyRound size={12} className="text-slate-400" />
                  {permission}
                </span>
                <input type="checkbox" defaultChecked={index !== 0} className="accent-red-600" />
              </label>
            ))}
          </div>
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-[11px] leading-4 text-amber-800">
            Las credenciales de conexión se mantienen fuera del almacenamiento del navegador y deben
            cifrarse en el servicio seguro del backend.
          </div>
        </Panel>
        <Panel>
          <PanelHeading
            title="Auditoría reciente"
            subtitle="Creación, modificación, actualización y homologación"
          />
          <div className="space-y-2">
            {[
              ["21/08/2026 10:42", "mquiroz", "ACTUALIZACIÓN", "SIAF 2026 · Julio"],
              ["21/08/2026 09:18", "jperez", "HOMOLOGACIÓN", "Meta 0012 con 3 predios"],
              ["20/08/2026 16:04", "admin", "MODIFICACIÓN", "Conexión SIAF · UE 001"],
            ].map((row) => (
              <div
                key={row.join("-")}
                className="grid grid-cols-[125px_90px_110px_1fr] gap-2 rounded border border-[#e5e7eb] bg-[#f9fafb] p-2 text-[11px]"
              >
                <span>{row[0]}</span>
                <strong>{row[1]}</strong>
                <Badge tone="blue">{row[2]}</Badge>
                <span>{row[3]}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

const inputClass =
  "h-8 w-full rounded-md border border-[#d1d5db] bg-white px-2.5 text-[12px] text-[#374151] outline-none placeholder:text-[#9ca3af] focus:border-[#dc2626] focus:ring-2 focus:ring-red-100";
const buttonPrimary =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-[#dc2626] px-3 text-[12px] font-medium text-white hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-50";
const buttonSecondary =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#d1d5db] bg-white px-3 text-[12px] font-medium text-[#374151] hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50";
const smallButton =
  "inline-flex h-7 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-2 text-[11px] font-medium text-[#4b5563] hover:bg-[#f9fafb]";

function Panel({ children }: { children: React.ReactNode }) {
  return <section className="rounded-lg border border-[#e5e7eb] bg-white p-3">{children}</section>;
}
function PanelHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-3 border-b border-[#e5e7eb] pb-2">
      <h3 className="text-[14px] font-semibold text-[#172033]">{title}</h3>
      <p className="mt-0.5 text-[11px] text-[#6b7280]">{subtitle}</p>
    </div>
  );
}
function SectionTitle({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description: string;
  icon: typeof Settings2;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-start gap-2">
        <Icon size={17} className="mt-0.5 shrink-0 text-[#dc2626]" />
        <div>
          <h2 className="text-[14px] font-semibold text-[#172033]">{title}</h2>
          <p className="text-[11px] text-[#6b7280]">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between gap-2 text-[11px] font-medium text-[#6b7280]">
        <span>{label}</span>
        {hint && <span className="text-[10px] font-normal text-[#9ca3af]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
function Input({
  value = "",
  onChange = () => undefined,
  placeholder,
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  );
}
function Select({
  value,
  options,
  onChange = () => undefined,
}: {
  value: string;
  options: string[];
  onChange?: (value: string) => void;
}) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}
function ContextSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-1 block text-[11px] text-[#6b7280]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded-md border border-[#d1d5db] bg-white px-2 text-[12px] text-[#374151]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "blue" | "green" | "amber" | "red";
}) {
  const tones = {
    slate: "bg-gray-100 text-gray-600",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
function ConnectionBadge({ status }: { status: "idle" | "testing" | "success" | "failed" }) {
  if (status === "testing")
    return (
      <Badge tone="blue">
        <Loader2 size={10} className="mr-1 animate-spin" /> Probando conexión
      </Badge>
    );
  if (status === "success")
    return (
      <Badge tone="green">
        <CheckCircle2 size={10} className="mr-1" /> Conexión exitosa
      </Badge>
    );
  if (status === "failed")
    return (
      <Badge tone="red">
        <XCircle size={10} className="mr-1" /> Conexión fallida
      </Badge>
    );
  return <Badge>Sin probar</Badge>;
}
function PeriodPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
      <div className="border-b border-[#e5e7eb] bg-white px-4 py-3">
        <h3 className="text-[14px] font-semibold text-[#172033]">{title}</h3>
        <p className="text-[11px] text-[#6b7280]">{subtitle}</p>
      </div>
      <div className="divide-y divide-slate-200">{children}</div>
    </section>
  );
}
function PeriodRow({
  period,
  selected,
  onSelect,
}: {
  period: Period;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`grid cursor-pointer grid-cols-[18px_52px_1fr_auto] items-center gap-2 px-4 py-2.5 text-[12px] ${selected ? "bg-[#fef2f2]" : "hover:bg-[#f9fafb]"}`}
    >
      <input type="checkbox" checked={selected} onChange={onSelect} className="accent-[#dc2626]" />
      <strong>{period.year}</strong>
      <span>
        <strong>{period.period}</strong>
        <span className="ml-2 text-slate-500">
          {period.origin} · {period.records.toLocaleString("es-PE")} registros · BD{" "}
          {period.databaseDate}
        </span>
      </span>
      <Badge
        tone={
          period.status === "Observado" ? "amber" : period.status === "Procesado" ? "green" : "blue"
        }
      >
        {period.status}
      </Badge>
    </label>
  );
}
function ProcessingPeriodRow({ period, onRemove }: { period: Period; onRemove: () => void }) {
  return (
    <div className="grid grid-cols-[52px_1fr_auto] items-center gap-2 px-4 py-2.5 text-[12px]">
      <strong>{period.year}</strong>
      <span>
        <strong>{period.period}</strong>
        <span className="ml-2 text-slate-500">
          {period.records.toLocaleString("es-PE")} registros · {period.databaseDate}
        </span>
      </span>
      <button type="button" onClick={onRemove} className="text-red-600 hover:text-red-800">
        <Trash2 size={12} />
      </button>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <div className="px-4 py-10 text-center text-[12px] text-[#9ca3af]">{text}</div>;
}
function ActionFooter({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  return (
    <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-3">
      <button type="button" onClick={onCancel} className={buttonSecondary}>
        Cancelar
      </button>
      <button type="button" onClick={onSave} className={buttonPrimary}>
        <Save size={13} /> Guardar
      </button>
    </div>
  );
}
function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-auto rounded-lg border border-[#e5e7eb] bg-white">
      <table className="w-full min-w-[880px] border-collapse text-[13px]">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="border-b border-[#e5e7eb] bg-[#f9fafb] px-4 py-2 text-left text-[11px] font-medium text-[#6b7280]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">{children}</tbody>
      </table>
    </div>
  );
}
function Cell({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <td
      className={`px-4 py-2 align-top text-[12px] text-[#374151] ${strong ? "font-medium text-[#172033]" : ""}`}
    >
      {children}
    </td>
  );
}
function Catalog({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
      <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
        <div>
          <h3 className="text-[14px] font-semibold text-[#172033]">{title}</h3>
          <p className="text-[11px] text-[#6b7280]">Código y descripción original conservados</p>
        </div>
        <button type="button" className={smallButton}>
          <Plus size={11} className="mr-1" /> Agregar
        </button>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="bg-[#f9fafb] px-4 py-2 text-left text-[11px] font-medium text-[#6b7280]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="border-t border-slate-200">
                {row.map((value, cell) => (
                  <td key={`${value}-${cell}`} className="px-4 py-2 text-[12px] text-[#374151]">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "amber" | "red";
}) {
  const cls = {
    green: "border-emerald-300 bg-emerald-50 text-emerald-800",
    amber: "border-amber-300 bg-amber-50 text-amber-800",
    red: "border-red-300 bg-red-50 text-red-800",
  }[tone];
  return (
    <div className={`rounded-lg border-l-4 border p-3 ${cls}`}>
      <div className="text-[11px] font-medium uppercase">{label}</div>
      <div className="text-[24px] font-semibold">{value}</div>
    </div>
  );
}
function SeverityBadge({ severity }: { severity: Severity }) {
  if (severity === "Correcto") return <Badge tone="green">● Correcto</Badge>;
  if (severity === "Advertencia") return <Badge tone="amber">● Observado</Badge>;
  return <Badge tone="red">● Error crítico</Badge>;
}
function modeDescription(mode: UpdateMode) {
  if (mode === "Solo pendientes")
    return "Importa únicamente registros que todavía no han sido procesados.";
  if (mode === "Incremental")
    return "Inserta registros nuevos y actualiza aquellos que fueron modificados.";
  if (mode === "Reprocesar periodo")
    return "Reemplaza solo el año y periodo actualmente seleccionados.";
  return "Reconstruye toda la información del periodo después de confirmar la operación.";
}
