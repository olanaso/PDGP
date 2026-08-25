import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  AlertTriangle,
  Banknote,
  Building2,
  CheckCircle2,
  Download,
  FileDown,
  Filter,
  Layers3,
  MapPin,
  Maximize2,
  RefreshCcw,
  Search,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppSidebar } from "../components/AppSidebar";
import {
  geographicProjects,
  projectStateColors,
  type GeographicProject,
} from "@/lib/geographicDashboardData";

export const Route = createFileRoute("/seguimiento-monitoreo/dashboard-geografico")({
  head: () => ({ meta: [{ title: "Dashboard geográfico de proyectos" }] }),
  component: GeographicDashboardPage,
});

type MapProps = {
  projects: GeographicProject[];
  selected: GeographicProject | null;
  onSelect: (project: GeographicProject | null) => void;
};

function ClientProjectMap(props: MapProps) {
  const [MapComponent, setMapComponent] = useState<ComponentType<MapProps> | null>(null);
  useEffect(() => {
    import("../components/GeographicProjectsMap").then((module) =>
      setMapComponent(() => module.default),
    );
  }, []);
  if (!MapComponent)
    return (
      <div className="flex h-full items-center justify-center bg-slate-100 text-[11px] text-slate-500">
        Cargando cartografía de proyectos…
      </div>
    );
  return <MapComponent {...props} />;
}

type Filters = {
  year: string;
  project: string;
  type: string;
  department: string;
  province: string;
  tramo: string;
  sector: string;
  state: string;
  predialState: string;
  risk: string;
  responsible: string;
};

const EMPTY_FILTERS: Filters = {
  year: "2026",
  project: "TODOS",
  type: "TODOS",
  department: "TODOS",
  province: "TODOS",
  tramo: "TODOS",
  sector: "TODOS",
  state: "TODOS",
  predialState: "TODOS",
  risk: "TODOS",
  responsible: "TODOS",
};

const PIE_COLORS = [
  "#1d4ed8",
  "#2563eb",
  "#60a5fa",
  "#7c3aed",
  "#16a34a",
  "#eab308",
  "#f97316",
  "#64748b",
];
const PHASES = [
  "Identificado",
  "Diagnóstico",
  "Expediente",
  "Tasación",
  "Negociación",
  "Pago aprobado",
  "Pagado",
  "Entregado",
  "Inscrito",
  "Cerrado",
];

function unique(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function money(value: number) {
  return `S/ ${(value / 1_000_000).toLocaleString("es-PE", { maximumFractionDigits: 1 })} MM`;
}

function percentage(value: number, total: number) {
  return total ? (value / total) * 100 : 0;
}

function buildFunnel(projects: GeographicProject[], kind: "general" | "physical" | "financial") {
  const properties = projects.reduce((sum, item) => sum + item.properties, 0);
  const paid = projects.reduce((sum, item) => sum + item.paid, 0);
  const delivered = projects.reduce((sum, item) => sum + item.delivered, 0);
  const registered = projects.reduce((sum, item) => sum + item.registered, 0);
  const values =
    kind === "general"
      ? [
          ["Identificados", properties],
          ["Diagnosticados", Math.round(properties * 0.93)],
          ["Empadronados", Math.round(properties * 0.87)],
          ["Expediente Técnico-Legal", Math.round(properties * 0.79)],
          ["Tasación", Math.round(properties * 0.72)],
          ["Negociación / Trato Directo", Math.round(properties * 0.66)],
          ["Aprobación de Pago", Math.max(paid, Math.round(properties * 0.59))],
          ["Pagados", paid],
          ["Entregados", delivered],
          ["Inscritos", registered],
          ["Cerrados", Math.round(registered * 0.82)],
        ]
      : kind === "physical"
        ? [
            ["Predios Requeridos", properties],
            ["Expediente Completo", Math.round(properties * 0.79)],
            ["Predios Tasados", Math.round(properties * 0.72)],
            ["Pago Aprobado", Math.max(paid, Math.round(properties * 0.59))],
            ["Predios Pagados", paid],
            ["Predios Entregados", delivered],
            ["Disponibles para Obra", Math.round(delivered * 0.93)],
          ]
        : [
            ["Predios Estimados", properties],
            ["Predios Tasados", Math.round(properties * 0.72)],
            ["Presupuesto Disponible", Math.round(properties * 0.67)],
            ["Predios Certificados", Math.round(properties * 0.61)],
            ["Predios Devengados", Math.round(properties * 0.56)],
            ["Predios Girados", Math.round(properties * 0.53)],
            ["Predios Pagados", paid],
          ];
  return values.map(([label, rawValue], index) => {
    const value = Number(rawValue);
    const previous = index ? Number(values[index - 1][1]) : value;
    return {
      label: String(label),
      value,
      totalPct: percentage(value, properties),
      conversion: percentage(value, previous),
      stopped: Math.max(previous - value, 0),
    };
  });
}

function buildPredialRows(project: GeographicProject) {
  const responsibleNames = [
    project.responsible,
    "María Salazar Rojas",
    "Luis Quispe Ramos",
    "Patricia Núñez Soto",
  ];
  return Array.from({ length: 14 }, (_, index) => {
    const phase = PHASES[(index * 3 + project.code.length) % PHASES.length];
    const appraised = 185_000 + index * 47_500 + project.properties * 320;
    const approved = Math.round(appraised * (0.94 + (index % 4) * 0.02));
    const paid = ["Pagado", "Entregado", "Inscrito", "Cerrado"].includes(phase) ? approved : 0;
    const alert =
      index % 7 === 0
        ? "Crítico"
        : index % 5 === 0
          ? "Próximo a vencer"
          : phase === "Cerrado"
            ? "Cerrado"
            : "En proceso";
    return {
      code: `${project.code}-PR-${String(index + 41).padStart(4, "0")}`,
      sector: `${project.sector} ${1 + (index % 3)}`,
      area: 280 + index * 83,
      subject: `Sujeto pasivo demostrativo ${index + 1}`,
      phase,
      appraised,
      approved,
      paid,
      delivery: ["Entregado", "Inscrito", "Cerrado"].includes(phase) ? "Entregado" : "Pendiente",
      registry:
        phase === "Inscrito" || phase === "Cerrado"
          ? "Inscrito"
          : index % 5 === 0
            ? "Observado"
            : "Pendiente",
      days: 7 + index * 4,
      responsible: responsibleNames[index % responsibleNames.length],
      alert,
    };
  });
}

function exportProjects(items: GeographicProject[], selectedPhase: string) {
  const rows = [
    [
      "Código",
      "Proyecto",
      "Tipo",
      "Departamento",
      "Inversión",
      "Ejecutado",
      "Avance físico",
      "Predios",
      "Pagados",
      "Entregados",
      "Inscritos",
      "Riesgo",
    ],
    ...items.map((item) => [
      item.code,
      item.name,
      item.type,
      item.department,
      item.investment,
      item.executed,
      item.physical,
      item.properties,
      item.paid,
      item.delivered,
      item.registered,
      item.risk,
    ]),
  ];
  const html = `<html><head><meta charset="utf-8"></head><body><h3>Dashboard geográfico</h3><p>Fase seleccionada: ${selectedPhase || "Todas"}</p><table border="1">${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</table></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: "application/vnd.ms-excel" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "dashboard_geografico_proyectos.xls";
  anchor.click();
  URL.revokeObjectURL(url);
}

function GeographicDashboardPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedProject, setSelectedProject] = useState<GeographicProject | null>(null);
  const [selectedPhase, setSelectedPhase] = useState("");
  const [sideTab, setSideTab] = useState<"Financiero" | "Físico" | "Predial">("Financiero");
  const [search, setSearch] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  const filtered = useMemo(
    () =>
      geographicProjects.filter((item) => {
        if (filters.project !== "TODOS" && item.id !== filters.project) return false;
        if (filters.type !== "TODOS" && item.type !== filters.type) return false;
        if (filters.department !== "TODOS" && item.department !== filters.department) return false;
        if (filters.province !== "TODOS" && item.province !== filters.province) return false;
        if (filters.tramo !== "TODOS" && item.tramo !== filters.tramo) return false;
        if (filters.sector !== "TODOS" && item.sector !== filters.sector) return false;
        if (filters.state !== "TODOS" && item.state !== filters.state) return false;
        if (filters.predialState !== "TODOS" && item.predialState !== filters.predialState)
          return false;
        if (filters.risk !== "TODOS" && item.risk !== filters.risk) return false;
        if (filters.responsible !== "TODOS" && item.responsible !== filters.responsible)
          return false;
        return true;
      }),
    [filters],
  );

  useEffect(() => {
    if (selectedProject && !filtered.some((item) => item.id === selectedProject.id))
      setSelectedProject(null);
  }, [filtered, selectedProject]);

  const scope = selectedProject ? [selectedProject] : filtered;
  const totalInvestment = scope.reduce((sum, item) => sum + item.investment, 0);
  const totalExecuted = scope.reduce((sum, item) => sum + item.executed, 0);
  const totalProperties = scope.reduce((sum, item) => sum + item.properties, 0);
  const totalDelivered = scope.reduce((sum, item) => sum + item.delivered, 0);
  const totalCritical = scope.reduce((sum, item) => sum + item.critical, 0);
  const physicalAverage = scope.length
    ? scope.reduce((sum, item) => sum + item.physical, 0) / scope.length
    : 0;
  const projectRows = [...filtered]
    .filter((item) =>
      `${item.code} ${item.name} ${item.department}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => (sortDesc ? b.investment - a.investment : a.name.localeCompare(b.name)));
  const predialBase = selectedProject ?? filtered[0] ?? geographicProjects[0];
  const allPredialRows = buildPredialRows(predialBase);
  const matchingPredialRows = selectedPhase
    ? allPredialRows.filter((row) =>
        row.phase.toLowerCase().includes(selectedPhase.split(" ")[0].toLowerCase()),
      )
    : allPredialRows;
  const predialRows = matchingPredialRows.length ? matchingPredialRows : allPredialRows;

  const update = (key: keyof Filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setSelectedProject(null);
  };

  return (
    <div className="flex min-h-screen bg-[#f4f6f8] text-slate-800">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <header className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-950 text-white">
                <MapPin size={19} />
              </div>
              <div>
                <h1 className="text-[20px] font-semibold">
                  Dashboard Geográfico de Proyectos y Gestión Predial
                </h1>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Seguimiento territorial, financiero, físico y predial de proyectos de
                  infraestructura.
                </p>
                <span className="mt-1 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[8px] font-semibold text-amber-700">
                  Datos demostrativos coherentes · actualización 07/08/2026
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton
                icon={RefreshCcw}
                label="Restablecer"
                onClick={() => {
                  setFilters(EMPTY_FILTERS);
                  setSelectedProject(null);
                  setSelectedPhase("");
                }}
              />
              <ActionButton
                icon={Download}
                label="Excel"
                onClick={() => exportProjects(scope, selectedPhase)}
              />
              <ActionButton icon={FileDown} label="PDF" onClick={() => window.print()} />
              <ActionButton
                icon={Maximize2}
                label="Tabla completa"
                onClick={() =>
                  document.getElementById("project-table")?.scrollIntoView({ behavior: "smooth" })
                }
                primary
              />
            </div>
          </div>
        </header>

        <div className="space-y-3 p-4">
          <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold">
              <Filter size={13} className="text-red-600" /> Filtros geográficos y de gestión
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-11">
              <FilterSelect
                label="Año"
                value={filters.year}
                options={["2026", "2025", "2024"]}
                includeAll={false}
                onChange={(value) => update("year", value)}
              />
              <FilterSelect
                label="Proyecto"
                value={filters.project}
                options={geographicProjects.map((item) => ({ label: item.name, value: item.id }))}
                onChange={(value) => update("project", value)}
              />
              <FilterSelect
                label="Tipo de proyecto"
                value={filters.type}
                options={unique(geographicProjects.map((item) => item.type))}
                onChange={(value) => update("type", value)}
              />
              <FilterSelect
                label="Departamento"
                value={filters.department}
                options={unique(geographicProjects.map((item) => item.department))}
                onChange={(value) => update("department", value)}
              />
              <FilterSelect
                label="Provincia"
                value={filters.province}
                options={unique(geographicProjects.map((item) => item.province))}
                onChange={(value) => update("province", value)}
              />
              <FilterSelect
                label="Tramo"
                value={filters.tramo}
                options={unique(geographicProjects.map((item) => item.tramo))}
                onChange={(value) => update("tramo", value)}
              />
              <FilterSelect
                label="Sector"
                value={filters.sector}
                options={unique(geographicProjects.map((item) => item.sector))}
                onChange={(value) => update("sector", value)}
              />
              <FilterSelect
                label="Estado proyecto"
                value={filters.state}
                options={unique(geographicProjects.map((item) => item.state))}
                onChange={(value) => update("state", value)}
              />
              <FilterSelect
                label="Estado predial"
                value={filters.predialState}
                options={unique(geographicProjects.map((item) => item.predialState))}
                onChange={(value) => update("predialState", value)}
              />
              <FilterSelect
                label="Riesgo"
                value={filters.risk}
                options={unique(geographicProjects.map((item) => item.risk))}
                onChange={(value) => update("risk", value)}
              />
              <FilterSelect
                label="Responsable"
                value={filters.responsible}
                options={unique(geographicProjects.map((item) => item.responsible))}
                onChange={(value) => update("responsible", value)}
              />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
            <Kpi
              label="Total de proyectos"
              value={scope.length}
              trend="Cobertura nacional"
              tone="blue"
            />
            <Kpi
              label="Inversión total"
              value={money(totalInvestment)}
              trend="+4.8% vs. periodo anterior"
              tone="blue"
            />
            <Kpi
              label="Ejecución financiera"
              value={`${percentage(totalExecuted, totalInvestment).toFixed(1)}%`}
              trend={money(totalExecuted)}
              tone="green"
            />
            <Kpi
              label="Avance físico promedio"
              value={`${physicalAverage.toFixed(1)}%`}
              trend="-1.9 pp frente a meta"
              tone={physicalAverage >= 65 ? "green" : "yellow"}
            />
            <Kpi
              label="Predios requeridos"
              value={totalProperties.toLocaleString("es-PE")}
              trend="Universo predial"
              tone="gray"
            />
            <Kpi
              label="Predios entregados"
              value={totalDelivered.toLocaleString("es-PE")}
              trend={`${percentage(totalDelivered, totalProperties).toFixed(1)}% disponibles`}
              tone="green"
            />
            <Kpi
              label="Predios pendientes"
              value={(totalProperties - totalDelivered).toLocaleString("es-PE")}
              trend="Requieren gestión"
              tone="yellow"
            />
            <Kpi
              label="Predios críticos"
              value={totalCritical}
              trend="Atención prioritaria"
              tone="red"
            />
          </section>

          <section className="grid min-h-[680px] grid-cols-1 gap-3 2xl:grid-cols-[minmax(0,1.65fr)_minmax(410px,0.85fr)]">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-4 py-2">
                <div>
                  <h2 className="text-[12px] font-semibold">Mapa ejecutivo de proyectos</h2>
                  <p className="text-[9px] text-slate-400">
                    Seleccione un icono para actualizar los componentes del dashboard.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[9px] text-slate-500">
                  <Layers3 size={12} /> {filtered.length} proyectos visibles
                </span>
              </div>
              <div className="h-[635px]">
                <ClientProjectMap
                  projects={filtered}
                  selected={selectedProject}
                  onSelect={setSelectedProject}
                />
              </div>
            </div>
            <SideAnalysisPanel tab={sideTab} onTab={setSideTab} projects={scope} />
          </section>

          {selectedPhase && (
            <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] text-blue-800">
              <span>
                Filtro activo del embudo: <b>{selectedPhase}</b>. El detalle predial muestra los
                casos relacionados.
              </span>
              <button
                onClick={() => setSelectedPhase("")}
                className="font-semibold hover:underline"
              >
                Quitar filtro
              </button>
            </div>
          )}

          <section>
            <div className="mb-2">
              <h2 className="text-[14px] font-semibold">Embudos de Predios según su Fase</h2>
              <p className="text-[9px] text-slate-500">
                Seleccione una fase para revisar los predios detenidos y su detalle.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
              <Funnel
                title="Gestión Predial"
                data={buildFunnel(scope, "general")}
                color="#1d4ed8"
                selected={selectedPhase}
                onSelect={setSelectedPhase}
              />
              <Funnel
                title="Disponibilidad Física"
                data={buildFunnel(scope, "physical")}
                color="#16a34a"
                selected={selectedPhase}
                onSelect={setSelectedPhase}
              />
              <Funnel
                title="Ejecución Financiera Predial"
                data={buildFunnel(scope, "financial")}
                color="#7c3aed"
                selected={selectedPhase}
                onSelect={setSelectedPhase}
              />
            </div>
          </section>

          <PhaseComparison projects={filtered} />

          <section id="project-table" className="grid grid-cols-1 gap-3">
            <ProjectsTable
              projects={projectRows}
              search={search}
              onSearch={setSearch}
              sortDesc={sortDesc}
              onSort={() => setSortDesc((value) => !value)}
              onSelect={(project) => {
                setSelectedProject(project);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
            <PredialTable project={predialBase} rows={predialRows} phase={selectedPhase} />
          </section>

          <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.35fr_0.65fr]">
            <Alerts projects={scope} />
            <RecentActivity projects={scope} />
          </section>
        </div>
      </main>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  includeAll = true,
}: {
  label: string;
  value: string;
  options: Array<string | { label: string; value: string }>;
  onChange: (value: string) => void;
  includeAll?: boolean;
}) {
  return (
    <label className="min-w-0">
      <span className="mb-1 block truncate text-[8px] font-medium text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-[9px]"
      >
        {includeAll && <option value="TODOS">Todos</option>}
        {options.map((option) => {
          const item = typeof option === "string" ? { label: option, value: option } : option;
          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  primary = false,
}: {
  icon: typeof Download;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[9px] font-semibold ${primary ? "bg-blue-950 text-white" : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"}`}
    >
      <Icon size={13} /> {label}
    </button>
  );
}

function Kpi({
  label,
  value,
  trend,
  tone,
}: {
  label: string;
  value: string | number;
  trend: string;
  tone: "blue" | "green" | "yellow" | "red" | "gray";
}) {
  const styles = {
    blue: "border-blue-200 text-blue-700",
    green: "border-green-200 text-green-700",
    yellow: "border-yellow-200 text-yellow-700",
    red: "border-red-200 text-red-700",
    gray: "border-slate-200 text-slate-700",
  };
  return (
    <article className={`rounded-lg border bg-white p-3 shadow-sm ${styles[tone]}`}>
      <div className="truncate text-[8px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 truncate text-[18px] font-bold">{value}</div>
      <div className="mt-1 truncate text-[8px] text-slate-400">{trend}</div>
    </article>
  );
}

function SideAnalysisPanel({
  tab,
  onTab,
  projects,
}: {
  tab: "Financiero" | "Físico" | "Predial";
  onTab: (tab: "Financiero" | "Físico" | "Predial") => void;
  projects: GeographicProject[];
}) {
  const investment = projects.reduce((sum, item) => sum + item.investment, 0);
  const executed = projects.reduce((sum, item) => sum + item.executed, 0);
  const properties = projects.reduce((sum, item) => sum + item.properties, 0);
  const paid = projects.reduce((sum, item) => sum + item.paid, 0);
  const delivered = projects.reduce((sum, item) => sum + item.delivered, 0);
  const registered = projects.reduce((sum, item) => sum + item.registered, 0);
  const expenditure = [
    "Adquisición",
    "Servicios prediales",
    "Tasaciones",
    "Interferencias",
    "Gestión social",
    "Notaría",
    "Registro",
    "Administración",
  ].map((name, index) => ({
    name,
    value: Math.round(executed * [0.52, 0.12, 0.08, 0.1, 0.06, 0.035, 0.025, 0.05][index]),
  }));
  return (
    <aside className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-3 border-b bg-slate-50 p-1">
        {(["Financiero", "Físico", "Predial"] as const).map((item) => (
          <button
            key={item}
            onClick={() => onTab(item)}
            className={`rounded-md px-2 py-2 text-[9px] font-semibold ${tab === item ? "bg-white text-red-600 shadow" : "text-slate-500"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="p-3">
        {tab === "Financiero" && (
          <>
            <h3 className="text-[12px] font-semibold text-blue-950">Componente Financiero</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MiniMetric label="Inversión" value={money(investment)} />
              <MiniMetric label="Presupuesto vigente" value={money(investment * 0.92)} />
              <MiniMetric label="Certificado" value={money(executed * 1.08)} />
              <MiniMetric label="Devengado" value={money(executed)} />
              <MiniMetric label="Girado" value={money(executed * 0.96)} />
              <MiniMetric label="Pagado" value={money(executed * 0.91)} />
              <MiniMetric label="Saldo disponible" value={money(investment * 0.92 - executed)} />
            </div>
            <div className="mt-3 grid grid-cols-[150px_1fr] items-center gap-2">
              <ResponsiveContainer width="100%" height={165}>
                <PieChart>
                  <Pie
                    data={expenditure}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={65}
                  >
                    {expenditure.map((item, index) => (
                      <Cell key={item.name} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1">
                {expenditure.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-2 text-[8px]"
                  >
                    <span className="flex items-center gap-1">
                      <i
                        className="size-2 rounded-full"
                        style={{ background: PIE_COLORS[index] }}
                      />
                      {item.name}
                    </span>
                    <b>{percentage(item.value, executed).toFixed(0)}%</b>
                  </div>
                ))}
              </div>
            </div>
            <ProgressList projects={projects} mode="financial" />
          </>
        )}
        {tab === "Físico" && (
          <>
            <h3 className="text-[12px] font-semibold text-green-800">Componente Físico</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MiniMetric
                label="Avance físico"
                value={`${projects.length ? (projects.reduce((sum, item) => sum + item.physical, 0) / projects.length).toFixed(1) : 0}%`}
              />
              <MiniMetric
                label="Meta programada"
                value={`${projects.length ? (projects.reduce((sum, item) => sum + item.physicalTarget, 0) / projects.length).toFixed(1) : 0}%`}
              />
              <MiniMetric
                label="Hitos cumplidos"
                value={projects.reduce((sum, item) => sum + Math.round(item.physical / 10), 0)}
              />
              <MiniMetric
                label="Hitos pendientes"
                value={projects.reduce(
                  (sum, item) => sum + Math.max(10 - Math.round(item.physical / 10), 0),
                  0,
                )}
              />
            </div>
            <ProgressList projects={projects} mode="physical" />
          </>
        )}
        {tab === "Predial" && (
          <>
            <h3 className="text-[12px] font-semibold text-purple-800">
              Entrega y Disponibilidad Predial
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MiniMetric label="Requeridos" value={properties} />
              <MiniMetric label="Pagados" value={paid} />
              <MiniMetric label="Entregados" value={delivered} />
              <MiniMetric label="Inscritos" value={registered} />
              <MiniMetric
                label="Disponibilidad"
                value={`${percentage(delivered, properties).toFixed(1)}%`}
              />
              <MiniMetric
                label="Área entregada"
                value={`${(projects.reduce((sum, item) => sum + item.areaDelivered, 0) / 1_000_000).toFixed(2)} km²`}
              />
            </div>
            <PredialComposition
              delivered={delivered}
              paid={paid}
              properties={properties}
              critical={projects.reduce((sum, item) => sum + item.critical, 0)}
            />
            <ProgressList projects={projects} mode="predial" />
          </>
        )}
      </div>
    </aside>
  );
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
      <div className="truncate text-[8px] text-slate-400">{label}</div>
      <div className="mt-0.5 truncate text-[12px] font-bold text-slate-700">{value}</div>
    </div>
  );
}

function ProgressList({
  projects,
  mode,
}: {
  projects: GeographicProject[];
  mode: "financial" | "physical" | "predial";
}) {
  return (
    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
      {projects.slice(0, 6).map((item) => {
        const value =
          mode === "financial"
            ? percentage(item.executed, item.investment)
            : mode === "physical"
              ? item.physical
              : percentage(item.delivered, item.properties);
        const target = mode === "physical" ? item.physicalTarget : 100;
        const color = value >= target ? "#16a34a" : target - value <= 8 ? "#eab308" : "#dc2626";
        return (
          <div key={item.id}>
            <div className="mb-1 flex justify-between gap-2 text-[8px]">
              <span className="truncate">
                {item.code} · {item.name}
              </span>
              <b>{value.toFixed(1)}%</b>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(100, value)}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PredialComposition({
  delivered,
  paid,
  properties,
  critical,
}: {
  delivered: number;
  paid: number;
  properties: number;
  critical: number;
}) {
  const data = [
    { name: "Entregados", value: delivered },
    { name: "En proceso", value: Math.max(paid - delivered, 0) },
    { name: "Pendientes", value: Math.max(properties - paid - critical, 0) },
    { name: "Críticos", value: critical },
  ];
  return (
    <ResponsiveContainer width="100%" height={190}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70}>
          {data.map((item, index) => (
            <Cell key={item.name} fill={["#16a34a", "#2563eb", "#eab308", "#dc2626"][index]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 9 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function Funnel({
  title,
  data,
  color,
  selected,
  onSelect,
}: {
  title: string;
  data: ReturnType<typeof buildFunnel>;
  color: string;
  selected: string;
  onSelect: (phase: string) => void;
}) {
  const total = data[0]?.value ?? 1;
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <h3 className="text-[11px] font-semibold">Embudo de {title}</h3>
      <p className="mt-0.5 text-[8px] text-slate-400">Cantidad, conversión y detenidos por fase.</p>
      <div className="mt-3 space-y-1.5">
        {data.map((item) => (
          <button
            key={item.label}
            onClick={() => onSelect(selected === item.label ? "" : item.label)}
            className={`mx-auto block min-w-[55%] rounded px-2 py-1.5 text-white shadow-sm transition hover:brightness-95 ${selected === item.label ? "ring-2 ring-slate-800 ring-offset-1" : ""}`}
            style={{
              width: `${Math.max(55, percentage(item.value, total))}%`,
              background: color,
              opacity: 0.58 + percentage(item.value, total) / 240,
            }}
          >
            <span className="flex items-center justify-between gap-2 text-[8px]">
              <span className="truncate font-semibold">{item.label}</span>
              <b>{item.value}</b>
            </span>
            <span className="mt-0.5 flex justify-between text-[7px] text-white/85">
              <span>{item.totalPct.toFixed(1)}% total</span>
              <span>{item.conversion.toFixed(1)}% conversión</span>
              <span>{item.stopped} detenidos</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function PhaseComparison({ projects }: { projects: GeographicProject[] }) {
  const data = projects.map((item) => ({
    name: item.code,
    identificados: Math.round(item.properties * 0.08),
    expediente: Math.round(item.properties * 0.14),
    tasacion: Math.round(item.properties * 0.12),
    negociacion: Math.max(item.properties - item.paid - Math.round(item.properties * 0.34), 0),
    pagados: Math.max(item.paid - item.delivered, 0),
    entregados: Math.max(item.delivered - item.registered, 0),
    inscritos: item.registered,
  }));
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-[12px] font-semibold">Predios por fase y proyecto</h3>
      <p className="mb-3 text-[8px] text-slate-400">
        Compara dónde se concentra la cartera pendiente.
      </p>
      <ResponsiveContainer width="100%" height={285}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 8 }} />
          <YAxis tick={{ fontSize: 8 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 8 }} />
          <Bar dataKey="identificados" stackId="a" fill="#64748b" />
          <Bar dataKey="expediente" stackId="a" fill="#2563eb" />
          <Bar dataKey="tasacion" stackId="a" fill="#eab308" />
          <Bar dataKey="negociacion" stackId="a" fill="#f97316" />
          <Bar dataKey="pagados" stackId="a" fill="#0ea5e9" />
          <Bar dataKey="entregados" stackId="a" fill="#16a34a" />
          <Bar dataKey="inscritos" stackId="a" fill="#7c3aed" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

function ProjectsTable({
  projects,
  search,
  onSearch,
  sortDesc,
  onSort,
  onSelect,
}: {
  projects: GeographicProject[];
  search: string;
  onSearch: (value: string) => void;
  sortDesc: boolean;
  onSort: () => void;
  onSelect: (project: GeographicProject) => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-[12px] font-semibold">Detalle de Proyectos</h3>
          <p className="text-[8px] text-slate-400">Ordene, busque y abra el detalle geográfico.</p>
        </div>
        <div className="flex gap-2">
          <label className="relative">
            <Search size={12} className="absolute left-2 top-2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Buscar proyecto"
              className="h-7 w-56 rounded border border-slate-300 pl-7 pr-2 text-[9px]"
            />
          </label>
          <button
            onClick={onSort}
            className="rounded border border-slate-300 px-2 text-[8px] font-semibold"
          >
            {sortDesc ? "Mayor inversión" : "Orden alfabético"}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1250px] text-left text-[8px]">
          <thead>
            <tr className="border-y bg-slate-50 text-slate-500">
              <th className="p-2">Código</th>
              <th>Proyecto</th>
              <th>Tipo</th>
              <th>Departamento</th>
              <th>Inversión</th>
              <th>Ejecución</th>
              <th>Avance físico</th>
              <th>Predios</th>
              <th>Pagados</th>
              <th>Entregados</th>
              <th>Inscritos</th>
              <th>Disponibilidad</th>
              <th>Riesgo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="p-2 font-mono font-semibold">{item.code}</td>
                <td className="max-w-64 truncate font-medium">{item.name}</td>
                <td>{item.type}</td>
                <td>{item.department}</td>
                <td>{money(item.investment)}</td>
                <td>{percentage(item.executed, item.investment).toFixed(1)}%</td>
                <td>{item.physical}%</td>
                <td>{item.properties}</td>
                <td>{item.paid}</td>
                <td>{item.delivered}</td>
                <td>{item.registered}</td>
                <td>{percentage(item.delivered, item.properties).toFixed(1)}%</td>
                <td>
                  <span
                    className="rounded-full px-2 py-1 font-semibold"
                    style={{
                      color: projectStateColors[item.state],
                      background: `${projectStateColors[item.state]}14`,
                    }}
                  >
                    {item.risk}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => onSelect(item)}
                    className="font-semibold text-red-600 hover:underline"
                  >
                    Abrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PredialTable({
  project,
  rows,
  phase,
}: {
  project: GeographicProject;
  rows: ReturnType<typeof buildPredialRows>;
  phase: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-[12px] font-semibold">Detalle Predial · {project.code}</h3>
        <p className="text-[8px] text-slate-400">
          {phase
            ? `Filtrado por la fase “${phase}”`
            : "Muestra representativa de predios del proyecto seleccionado."}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] text-left text-[8px]">
          <thead>
            <tr className="border-y bg-slate-50 text-slate-500">
              <th className="p-2">Código predio</th>
              <th>Sector</th>
              <th>Área m²</th>
              <th>Sujeto pasivo</th>
              <th>Fase actual</th>
              <th>Valor tasado</th>
              <th>Monto aprobado</th>
              <th>Monto pagado</th>
              <th>Entrega</th>
              <th>Registral</th>
              <th>Días fase</th>
              <th>Responsable</th>
              <th>Alerta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const tone =
                row.alert === "Crítico"
                  ? "bg-red-50 text-red-700"
                  : row.alert === "Próximo a vencer"
                    ? "bg-yellow-50 text-yellow-700"
                    : row.alert === "Cerrado"
                      ? "bg-green-50 text-green-700"
                      : "bg-blue-50 text-blue-700";
              return (
                <tr key={row.code} className="border-b">
                  <td className="p-2 font-mono font-semibold">{row.code}</td>
                  <td>{row.sector}</td>
                  <td>{row.area.toLocaleString("es-PE")}</td>
                  <td>{row.subject}</td>
                  <td>{row.phase}</td>
                  <td>{money(row.appraised)}</td>
                  <td>{money(row.approved)}</td>
                  <td>{money(row.paid)}</td>
                  <td>{row.delivery}</td>
                  <td>{row.registry}</td>
                  <td>{row.days}</td>
                  <td>{row.responsible}</td>
                  <td>
                    <span className={`rounded-full px-2 py-1 font-semibold ${tone}`}>
                      {row.alert}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Alerts({ projects }: { projects: GeographicProject[] }) {
  const items = projects
    .flatMap((project, projectIndex) => [
      { project, type: "Pagos pendientes", days: 8 + projectIndex * 3 },
      {
        project,
        type: project.critical > 15 ? "Interferencia crítica" : "Entrega sin inscripción",
        days: 5 + projectIndex * 2,
      },
    ])
    .sort((a, b) => b.days - a.days)
    .slice(0, 8);
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-[12px] font-semibold">Alertas y riesgos</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[760px] text-[8px]">
          <thead>
            <tr className="border-y bg-slate-50 text-slate-500">
              <th className="p-2 text-left">Criticidad</th>
              <th className="text-left">Proyecto</th>
              <th className="text-left">Alerta</th>
              <th>Responsable</th>
              <th>Días atraso</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.project.id}-${index}`} className="border-b">
                <td className="p-2">
                  <AlertTriangle
                    size={12}
                    className={item.days > 20 ? "text-red-600" : "text-yellow-600"}
                  />
                </td>
                <td>{item.project.code}</td>
                <td>{item.type}</td>
                <td>{item.project.responsible}</td>
                <td className="text-center font-semibold text-red-600">{item.days}</td>
                <td>Priorizar y actualizar cronograma</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RecentActivity({ projects }: { projects: GeographicProject[] }) {
  const events = [
    "Predio pagado",
    "Entrega física realizada",
    "Tasación aprobada",
    "Título inscrito",
    "Interferencia registrada",
    "Proyecto actualizado",
  ];
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-[12px] font-semibold">Actividad reciente</h3>
      <div className="mt-3 space-y-3">
        {events.map((event, index) => {
          const project = projects[index % Math.max(projects.length, 1)] ?? geographicProjects[0];
          return (
            <div key={event} className="flex gap-2 border-b border-slate-100 pb-2 last:border-0">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-blue-500" />
              <div>
                <div className="text-[9px] font-semibold">{event}</div>
                <div className="text-[8px] text-slate-400">
                  {`0${7 - (index % 4)}/08/2026`} · {project.code}
                </div>
                <div className="text-[8px] text-slate-500">{project.responsible}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
