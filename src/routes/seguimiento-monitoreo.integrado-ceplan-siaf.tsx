import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Filter,
  Layers3,
  Search,
  SlidersHorizontal,
  Target,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import writeExcelFile, { type SheetData } from "write-excel-file/browser";

import { AppSidebar } from "../components/AppSidebar";
import {
  getSiafClassifiers,
  integratedPredios,
  integratedProjects,
  physicalTargets,
  predialIndicators,
  type IntegratedPredio,
  type IntegratedProject,
  type LinkStatus,
} from "../lib/integratedCeplanSiafData";

export const Route = createFileRoute("/seguimiento-monitoreo/integrado-ceplan-siaf")({
  validateSearch: (search: Record<string, unknown>) => ({
    project: typeof search.project === "string" ? search.project : undefined,
  }),
  head: () => ({ meta: [{ title: "Seguimiento Integrado CEPLAN – SIAF – Gestión Predial" }] }),
  component: IntegratedMonitoringPage,
});

type TabId = "financial" | "physical" | "classifier";
type AnalysisLevel = "project" | "predio";

type FinancialRow = {
  id: string;
  parentId: string | null;
  depth: number;
  kind: string;
  description: string;
  source: string;
  generic: string;
  poi: number;
  pia: number;
  pim: number;
  certification: number;
  commitment: number;
  accrued: number;
  drawn: number;
  paid: number;
  linkStatus: LinkStatus;
  hasChildren: boolean;
  predio?: IntegratedPredio;
};

const tabDefinitions: Array<{ id: TabId; label: string; icon: typeof Activity }> = [
  { id: "financial", label: "Análisis financiero", icon: WalletCards },
  { id: "physical", label: "Metas físicas", icon: Target },
  { id: "classifier", label: "Clasificador SIAF", icon: Layers3 },
];

const moneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat("es-PE", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function money(value: number) {
  return moneyFormatter.format(value);
}

function compactMoney(value: number) {
  return `S/ ${compactFormatter.format(value)}`;
}

function percent(value: number, total: number) {
  return total ? (value / total) * 100 : 0;
}

function buildFinancialRows(
  project: IntegratedProject,
  predios: IntegratedPredio[],
): FinancialRow[] {
  const common = {
    source: `${project.sourceCode} · ${project.sourceName}`,
    generic: `${project.genericCode} · ${project.genericName}`,
    poi: project.poi,
    pia: project.pia,
    pim: project.pim,
    certification: project.certification,
    commitment: project.commitment,
    accrued: project.accrued,
    drawn: project.drawn,
    paid: project.paid,
    linkStatus: project.linkStatus,
  };
  return [
    {
      ...common,
      id: "oei",
      parentId: null,
      depth: 0,
      kind: "OEI",
      description: `${project.oei} · ${project.oeiName}`,
      hasChildren: true,
    },
    {
      ...common,
      id: "aei",
      parentId: "oei",
      depth: 1,
      kind: "AEI",
      description: `${project.aei} · ${project.aeiName}`,
      hasChildren: true,
    },
    {
      ...common,
      id: "aoi",
      parentId: "aei",
      depth: 2,
      kind: "AOI",
      description: `${project.aoi} · ${project.aoiName}`,
      hasChildren: true,
    },
    {
      ...common,
      id: "project",
      parentId: "aoi",
      depth: 3,
      kind: "CUI",
      description: `CUI ${project.cui} · ${project.name}`,
      hasChildren: true,
    },
    {
      ...common,
      id: "meta",
      parentId: "project",
      depth: 4,
      kind: "META",
      description: `Meta SIAF ${project.meta} · Secuencia ${project.functionalSequence}`,
      hasChildren: true,
    },
    ...predios.map<FinancialRow>((predio) => ({
      id: predio.code,
      parentId: "meta",
      depth: 5,
      kind: "PREDIO",
      description: `${predio.code} · ${predio.owner}`,
      source: `${project.sourceCode} · ${project.sourceName}`,
      generic: predio.classifier ? project.genericCode : "—",
      poi: 0,
      pia: 0,
      pim: project.pim,
      certification: predio.certification,
      commitment: predio.commitment,
      accrued: predio.accrued,
      drawn: predio.drawn,
      paid: predio.paid,
      linkStatus: predio.linkStatus,
      hasChildren: false,
      predio,
    })),
  ];
}

function IntegratedMonitoringPage() {
  const searchParams = Route.useSearch();
  const requestedProjectId = searchParams.project;
  const initialProjectId =
    requestedProjectId && integratedProjects.some((item) => item.id === requestedProjectId)
      ? requestedProjectId
      : integratedProjects[0].id;
  const [tab, setTab] = useState<TabId>("financial");
  const [level, setLevel] = useState<AnalysisLevel>("project");
  const [year, setYear] = useState("2026");
  const [projectId, setProjectId] = useState(initialProjectId);
  const [predioCode, setPredioCode] = useState(integratedPredios[0].code);
  const [predioSearch, setPredioSearch] = useState("");
  const [predioResultsOpen, setPredioResultsOpen] = useState(false);
  const [tableSearch, setTableSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("Todas");
  const [genericFilter, setGenericFilter] = useState("Todas");
  const [stateFilter, setStateFilter] = useState("Todos");
  const [stageFilter, setStageFilter] = useState("Todas");
  const [expanded, setExpanded] = useState(
    () => new Set<string>(["oei", "aei", "aoi", "project", "meta"]),
  );
  const [expandedClassifiers, setExpandedClassifiers] = useState(() => new Set<string>());
  const [linkDetail, setLinkDetail] = useState<IntegratedPredio | "project" | null>(null);

  const project = integratedProjects.find((item) => item.id === projectId) ?? integratedProjects[0];
  const projectPredios = useMemo(
    () => integratedPredios.filter((item) => item.projectId === projectId),
    [projectId],
  );
  const selectedPredio =
    projectPredios.find((item) => item.code === predioCode) ?? projectPredios[0];
  const classifiers = useMemo(() => getSiafClassifiers(year, projectId), [projectId, year]);
  const targets = physicalTargets.filter((item) => item.projectId === projectId);
  const indicators = predialIndicators.filter((item) => item.projectId === projectId);

  const predioMatches = useMemo(() => {
    const query = predioSearch.trim().toLocaleLowerCase("es-PE");
    const base = projectPredios.filter(
      (item) =>
        (stateFilter === "Todos" || item.state === stateFilter) &&
        (stageFilter === "Todas" || item.stage === stageFilter),
    );
    if (!query) return base;
    return base.filter((item) =>
      [item.code, item.file, item.owner, item.identity, item.sector, item.section].some((value) =>
        value.toLocaleLowerCase("es-PE").includes(query),
      ),
    );
  }, [predioSearch, projectPredios, stageFilter, stateFilter]);

  const financialRows = useMemo(
    () => buildFinancialRows(project, projectPredios),
    [project, projectPredios],
  );

  const visibleFinancialRows = useMemo(() => {
    if (level === "predio") {
      return financialRows.filter((row) => row.predio?.code === selectedPredio.code);
    }
    const query = tableSearch.trim().toLocaleLowerCase("es-PE");
    const parentById = new Map(financialRows.map((row) => [row.id, row.parentId]));
    const matched = new Set<string>();
    financialRows.forEach((row) => {
      const predioMatchesFilters =
        !row.predio ||
        ((stateFilter === "Todos" || row.predio.state === stateFilter) &&
          (stageFilter === "Todas" || row.predio.stage === stageFilter));
      const matchesText = !query || row.description.toLocaleLowerCase("es-PE").includes(query);
      const matchesSource = sourceFilter === "Todas" || row.source.startsWith(sourceFilter);
      const matchesGeneric = genericFilter === "Todas" || row.generic.startsWith(genericFilter);
      if (predioMatchesFilters && matchesText && matchesSource && matchesGeneric) {
        matched.add(row.id);
        let parentId = row.parentId;
        while (parentId) {
          matched.add(parentId);
          parentId = parentById.get(parentId) ?? null;
        }
      }
    });
    return financialRows.filter((row) => {
      if (!matched.has(row.id)) return false;
      let parentId = row.parentId;
      while (parentId) {
        if (!expanded.has(parentId)) return false;
        parentId = parentById.get(parentId) ?? null;
      }
      return true;
    });
  }, [
    expanded,
    financialRows,
    genericFilter,
    level,
    selectedPredio.code,
    sourceFilter,
    stageFilter,
    stateFilter,
    tableSearch,
  ]);

  const changeProject = (nextId: string) => {
    const firstPredio = integratedPredios.find((item) => item.projectId === nextId);
    setProjectId(nextId);
    if (firstPredio) setPredioCode(firstPredio.code);
    setPredioSearch("");
    setTableSearch("");
  };

  const toggleExpanded = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportCurrentTab = async () => {
    if (tab === "financial") {
      await exportSheet(
        "Análisis financiero",
        [
          "Descripción",
          "Fuente",
          "Genérica",
          "POI programado",
          "PIA SIAF",
          "PIM SIAF",
          "Certificación",
          "Compromiso",
          "Devengado",
          "Girado",
          "Pagado",
          "Saldo",
          "% Eje/PIM",
          "% Eje/POI",
          "Diferencia PIM-POI",
          "Vinculación",
        ],
        visibleFinancialRows.map((row) => [
          row.description,
          row.source,
          row.generic,
          row.poi,
          row.pia,
          row.pim,
          row.certification,
          row.commitment,
          row.accrued,
          row.drawn,
          row.paid,
          row.pim - row.accrued,
          percent(row.accrued, row.pim) / 100,
          percent(row.accrued, row.poi) / 100,
          row.pim - row.poi,
          row.linkStatus,
        ]),
        "seguimiento_integrado_financiero",
      );
      return;
    }
    if (tab === "physical") {
      await exportSheet(
        "Metas físicas",
        [
          "Descripción",
          "Unidad de medida",
          "Meta anual",
          "Programado periodo",
          "Ejecutado periodo",
          "% avance físico",
          "Devengado",
          "% avance financiero",
          "Brecha",
          "Estado",
        ],
        targets.map((item) => [
          item.label,
          item.unit,
          item.annual,
          item.periodPlanned,
          item.periodExecuted,
          percent(item.periodExecuted, item.periodPlanned) / 100,
          item.financialAccrued,
          percent(item.financialAccrued, item.financialPim) / 100,
          (percent(item.periodExecuted, item.periodPlanned) -
            percent(item.financialAccrued, item.financialPim)) /
            100,
          item.state,
        ]),
        "seguimiento_integrado_metas_fisicas",
      );
      return;
    }
    await exportSheet(
      "Clasificador SIAF",
      [
        "Fuente",
        "Rubro",
        "Categoría",
        "Genérica",
        "Subgenérica",
        "Específica",
        "Clasificador",
        "Descripción",
        "Meta",
        "PIA",
        "PIM",
        "Certificado",
        "Compromiso",
        "Devengado",
        "Girado",
        "Pagado",
      ],
      classifiers.map((item) => [
        `${item.sourceCode} · ${item.sourceName}`,
        `${item.itemCode} · ${item.itemName}`,
        `${item.categoryCode} · ${item.categoryName}`,
        `${item.genericCode} · ${item.genericName}`,
        `${item.subgenericCode} · ${item.subgenericName}`,
        `${item.specificCode} · ${item.specificName}`,
        item.code,
        item.description,
        item.meta,
        item.pia,
        item.pim,
        item.certification,
        item.commitment,
        item.accrued,
        item.drawn,
        item.paid,
      ]),
      "seguimiento_integrado_clasificadores",
    );
  };

  const filterCount = [sourceFilter, genericFilter, stateFilter, stageFilter].filter(
    (value) => value !== "Todas" && value !== "Todos",
  ).length;

  return (
    <div className="flex min-h-screen bg-[#f3f5f7] text-slate-900">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-auto p-3 xl:p-4">
        <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">
              Coordinadores · Trazabilidad institucional
            </p>
            <h1 className="mt-0.5 text-[20px] font-bold tracking-tight">
              Seguimiento Integrado CEPLAN – SIAF – Gestión Predial
            </h1>
            <p className="text-[11px] text-slate-500">
              Planeamiento, meta física, presupuesto y ejecución predial en una sola matriz.
            </p>
          </div>
          <button
            type="button"
            onClick={exportCurrentTab}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-3 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            <FileSpreadsheet size={15} /> Exportar pestaña
          </button>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-2 p-3 md:grid-cols-2 xl:grid-cols-7">
            <CompactSelect label="Año" value={year} options={["2026", "2025"]} onChange={setYear} />
            <CompactSelect
              label="Entidad"
              value={`${project.entityCode} · ${project.entity}`}
              options={[`${project.entityCode} · ${project.entity}`]}
            />
            <CompactSelect label="Pliego" value={project.pliego} options={[project.pliego]} />
            <CompactSelect
              label="Unidad ejecutora"
              value={project.executingUnit}
              options={[project.executingUnit]}
            />
            <div className="md:col-span-2">
              <CompactSelect
                label="Proyecto / CUI"
                value={projectId}
                options={integratedProjects.map((item) => item.id)}
                optionLabel={(value) => {
                  const item = integratedProjects.find((projectItem) => projectItem.id === value);
                  return item ? `${item.cui} · ${item.name}` : value;
                }}
                onChange={changeProject}
              />
            </div>
            <div>
              <label className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-500">
                Nivel de análisis
              </label>
              <div className="grid h-8 grid-cols-2 overflow-hidden rounded-md border border-slate-300">
                <LevelButton active={level === "project"} onClick={() => setLevel("project")}>
                  Proyecto
                </LevelButton>
                <LevelButton active={level === "predio"} onClick={() => setLevel("predio")}>
                  Predio
                </LevelButton>
              </div>
            </div>
          </div>

          {level === "predio" && (
            <div className="border-t border-slate-200 bg-blue-50/40 px-3 py-2">
              <div className="relative max-w-4xl">
                <label className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-500">
                  Predio seleccionado
                </label>
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-[27px] text-slate-400"
                />
                <input
                  value={predioSearch}
                  onFocus={() => setPredioResultsOpen(true)}
                  onBlur={() => window.setTimeout(() => setPredioResultsOpen(false), 150)}
                  onChange={(event) => {
                    setPredioSearch(event.target.value);
                    setPredioResultsOpen(true);
                  }}
                  placeholder="Buscar código, expediente, DNI/RUC, propietario, sector o tramo"
                  className="h-8 w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 text-[11px] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
                {predioResultsOpen && (
                  <div className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-xl">
                    {predioMatches.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setPredioCode(item.code);
                          setPredioSearch("");
                          setPredioResultsOpen(false);
                        }}
                        className={`grid w-full grid-cols-[180px_1fr_120px] gap-2 rounded px-2 py-1.5 text-left text-[10px] hover:bg-slate-50 ${
                          item.code === selectedPredio.code ? "bg-red-50 text-red-700" : ""
                        }`}
                      >
                        <strong>{item.code}</strong>
                        <span className="truncate">{item.owner}</span>
                        <span className="text-right text-slate-500">{item.stage}</span>
                      </button>
                    ))}
                    {!predioMatches.length && (
                      <p className="px-3 py-5 text-center text-[10px] text-slate-500">
                        No hay predios que coincidan con los filtros.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen((value) => !value)}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-600"
              >
                <SlidersHorizontal size={13} /> Filtros de integración
                {filterCount > 0 && (
                  <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] text-white">
                    {filterCount}
                  </span>
                )}
                {filtersOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
              <div className="ml-auto flex items-center gap-1.5">
                <SourceBadge label="CEPLAN" tone="blue" />
                <SourceBadge label="SIAF" tone="violet" />
                <SourceBadge label="GESTIÓN PREDIAL" tone="red" />
              </div>
            </div>
            {filtersOpen && (
              <div className="mt-2 grid gap-2 border-t border-slate-100 pt-2 md:grid-cols-3 xl:grid-cols-6">
                <CompactSelect
                  label="Centro de costo"
                  value={project.costCenter}
                  options={[project.costCenter]}
                />
                <CompactSelect label="OEI" value={project.oei} options={[project.oei]} />
                <CompactSelect label="AEI" value={project.aei} options={[project.aei]} />
                <CompactSelect
                  label="Actividad operativa"
                  value={project.aoi}
                  options={[project.aoi]}
                />
                <CompactSelect label="Meta SIAF" value={project.meta} options={[project.meta]} />
                <CompactSelect
                  label="Fuente de financiamiento"
                  value={sourceFilter}
                  options={["Todas", "1"]}
                  onChange={setSourceFilter}
                />
                <CompactSelect
                  label="Rubro"
                  value={project.itemCode}
                  options={[project.itemCode]}
                />
                <CompactSelect
                  label="Genérica de gasto"
                  value={genericFilter}
                  options={["Todas", "2.6", "2.3"]}
                  onChange={setGenericFilter}
                />
                <CompactSelect
                  label="Estado predial"
                  value={stateFilter}
                  options={["Todos", "Pagado", "En proceso", "Observado"]}
                  onChange={setStateFilter}
                />
                <CompactSelect
                  label="Etapa predial"
                  value={stageFilter}
                  options={[
                    "Todas",
                    "Diagnóstico",
                    "Tasación",
                    "Adquisición",
                    "Pago",
                    "Transferencia interestatal",
                  ]}
                  onChange={setStageFilter}
                />
                <button
                  type="button"
                  onClick={() => {
                    setSourceFilter("Todas");
                    setGenericFilter("Todas");
                    setStateFilter("Todos");
                    setStageFilter("Todas");
                  }}
                  className="mt-[17px] inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                >
                  <Filter size={12} /> Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </section>

        {level === "predio" && (
          <PredioSummary
            project={project}
            predio={selectedPredio}
            onLink={() => setLinkDetail(selectedPredio)}
          />
        )}

        <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 pt-2">
            {tabDefinitions.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`inline-flex h-9 items-center gap-2 border-b-2 px-3 text-[11px] font-bold transition-colors ${
                    active
                      ? "border-red-600 bg-white text-red-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Icon size={14} /> {item.label}
                </button>
              );
            })}
            <div className="ml-auto mb-2 hidden w-64 xl:block">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={tableSearch}
                  onChange={(event) => setTableSearch(event.target.value)}
                  placeholder="Buscar en la matriz"
                  className="h-8 w-full rounded-md border border-slate-300 bg-white pl-8 pr-2 text-[10px] outline-none focus:border-red-400"
                />
              </div>
            </div>
          </div>

          {tab === "financial" && (
            <FinancialMatrix
              rows={visibleFinancialRows}
              level={level}
              project={project}
              expanded={expanded}
              onToggle={toggleExpanded}
              onLink={(predio) => setLinkDetail(predio ?? "project")}
            />
          )}
          {tab === "physical" && (
            <PhysicalMatrix
              project={project}
              predio={level === "predio" ? selectedPredio : null}
              targets={targets}
              indicators={indicators}
            />
          )}
          {tab === "classifier" && (
            <ClassifierMatrix
              project={project}
              predio={level === "predio" ? selectedPredio : null}
              classifiers={classifiers}
              predios={projectPredios}
              expanded={expandedClassifiers}
              onToggle={(code) =>
                setExpandedClassifiers((current) => {
                  const next = new Set(current);
                  if (next.has(code)) next.delete(code);
                  else next.add(code);
                  return next;
                })
              }
              onLink={(predio) => setLinkDetail(predio ?? "project")}
            />
          )}
        </section>

        <section className="mt-3 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
          <MetricCard label="POI programado" value={project.poi} source="CEPLAN" tone="blue" />
          <MetricCard label="PIM vigente" value={project.pim} source="SIAF" tone="violet" />
          <MetricCard label="Devengado" value={project.accrued} source="SIAF" tone="violet" />
          <MetricCard
            label="Ejecución / PIM"
            value={percent(project.accrued, project.pim)}
            percentValue
            source="SIAF"
            tone="green"
          />
          <MetricCard
            label="Predios vinculados"
            value={projectPredios.filter((item) => item.linkStatus !== "Sin vincular").length}
            count
            source="PREDIAL"
            tone="red"
          />
          <MetricCard
            label="Por vincular"
            value={projectPredios.filter((item) => item.linkStatus === "Sin vincular").length}
            count
            source="CONTROL"
            tone="amber"
          />
        </section>

        <footer className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-[9px] text-slate-500">
          <strong className="text-slate-700">Regla de trazabilidad:</strong> Año + Pliego + Unidad
          Ejecutora + CUI + Meta + Secuencia funcional + AOI + Fuente + Rubro + Clasificador. El
          devengado SIAF es el indicador principal para comparar la ejecución financiera con CEPLAN.
        </footer>
      </main>

      {linkDetail && (
        <LinkDetailModal
          project={project}
          predio={linkDetail === "project" ? null : linkDetail}
          onClose={() => setLinkDetail(null)}
        />
      )}
    </div>
  );
}

function FinancialMatrix({
  rows,
  level,
  project,
  expanded,
  onToggle,
  onLink,
}: {
  rows: FinancialRow[];
  level: AnalysisLevel;
  project: IntegratedProject;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onLink: (predio?: IntegratedPredio) => void;
}) {
  return (
    <div>
      <MatrixIntro
        title="Matriz de análisis financiero"
        description={
          level === "project"
            ? "Consolidado jerárquico CEPLAN–SIAF con apertura hasta predio."
            : "Ejecución presupuestal vinculada exclusivamente al predio seleccionado; el PIM se muestra como referencia de la Meta SIAF."
        }
      />
      <div className="overflow-x-auto">
        <table className="min-w-[2100px] w-full border-collapse text-[9px]">
          <thead>
            <tr className="bg-slate-900 text-white">
              {[
                "Descripción",
                "Fuente",
                "Genérica",
                "POI prog.",
                "PIA SIAF",
                "PIM SIAF",
                "Certificación",
                "Compromiso",
                "Devengado",
                "Girado",
                "Pagado",
                "Saldo",
                "% Eje/PIM",
                "% Eje/POI",
                "Dif. PIM-POI",
                "Vinc.",
              ].map((header, index) => (
                <th
                  key={header}
                  className={`border-r border-slate-700 px-2 py-2 text-center font-bold ${
                    index === 0 ? "sticky left-0 z-20 min-w-96 bg-slate-900 text-left" : ""
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const isPredio = row.kind === "PREDIO";
              const saldo = (isPredio ? (row.predio?.cost ?? 0) : row.pim) - row.accrued;
              const poiProgress = isPredio ? 0 : percent(row.accrued, row.poi);
              return (
                <tr
                  key={row.id}
                  className={`${index % 2 ? "bg-slate-50" : "bg-white"} ${
                    row.depth <= 1 ? "font-bold" : ""
                  }`}
                >
                  <td
                    className={`sticky left-0 z-10 border-r border-t border-slate-200 px-2 py-1.5 ${
                      index % 2 ? "bg-slate-50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center" style={{ paddingLeft: row.depth * 16 }}>
                      {row.hasChildren ? (
                        <button
                          type="button"
                          onClick={() => onToggle(row.id)}
                          className="mr-1 flex size-5 shrink-0 items-center justify-center rounded hover:bg-slate-200"
                        >
                          {expanded.has(row.id) ? (
                            <ChevronDown size={13} />
                          ) : (
                            <ChevronRight size={13} />
                          )}
                        </button>
                      ) : (
                        <span className="mr-1 size-5 shrink-0" />
                      )}
                      <span className="mr-1.5 rounded bg-slate-100 px-1 py-0.5 text-[7px] font-bold text-slate-500">
                        {row.kind}
                      </span>
                      <span className={isPredio ? "font-semibold text-red-700" : "text-slate-800"}>
                        {row.description}
                      </span>
                    </div>
                  </td>
                  <TextCell value={row.source} />
                  <TextCell value={row.generic} />
                  <MoneyCell value={row.poi} empty={isPredio} source="ceplan" />
                  <MoneyCell value={row.pia} empty={isPredio} source="siaf" />
                  <MoneyCell value={row.pim} source="siaf" reference={isPredio} />
                  <MoneyCell value={row.certification} />
                  <MoneyCell value={row.commitment} />
                  <MoneyCell value={row.accrued} strong />
                  <MoneyCell value={row.drawn} />
                  <MoneyCell value={row.paid} />
                  <MoneyCell value={saldo} />
                  <PercentCell value={percent(row.accrued, row.pim)} />
                  <PercentCell value={poiProgress} empty={isPredio} />
                  <MoneyCell value={isPredio ? 0 : row.pim - row.poi} empty={isPredio} />
                  <td className="border-t border-slate-200 px-2 py-1.5 text-center">
                    <button type="button" onClick={() => onLink(row.predio)}>
                      <LinkBadge status={row.linkStatus} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={16} className="py-10 text-center text-[11px] text-slate-500">
                  No hay registros para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-3 border-t border-slate-200 bg-slate-50 px-3 py-2 text-[9px] text-slate-600">
        <span>
          <b>Saldo:</b> PIM − Devengado
        </span>
        <span>
          <b>% Eje/PIM:</b> Devengado ÷ PIM
        </span>
        <span>
          <b>% Eje/POI:</b> Devengado ÷ POI programado
        </span>
        <span>
          <b>Meta activa:</b> {project.meta} / {project.functionalSequence}
        </span>
      </div>
    </div>
  );
}

function PhysicalMatrix({
  project,
  predio,
  targets,
  indicators,
}: {
  project: IntegratedProject;
  predio: IntegratedPredio | null;
  targets: ReturnType<typeof physicalTargets.filter>;
  indicators: ReturnType<typeof predialIndicators.filter>;
}) {
  return (
    <div>
      <MatrixIntro
        title="Matriz de metas físicas"
        description="Compara la meta oficial CEPLAN con el avance operativo predial y el devengado SIAF."
      />
      <div className="overflow-x-auto">
        <table className="min-w-[1350px] w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-slate-900 text-white">
              {[
                "Descripción",
                "U.M. CEPLAN",
                "Meta anual",
                "Programado periodo",
                "Ejecutado periodo",
                "% avance físico",
                "Devengado SIAF",
                "% avance financiero",
                "Brecha p.p.",
                "Estado",
              ].map((header, index) => (
                <th
                  key={header}
                  className={`border-r border-slate-700 px-2 py-2 text-center ${
                    index === 0 ? "sticky left-0 z-20 min-w-96 bg-slate-900 text-left" : ""
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <HierarchyTextRow depth={0} label={`${project.oei} · ${project.oeiName}`} tag="OEI" />
            <HierarchyTextRow depth={1} label={`${project.aei} · ${project.aeiName}`} tag="AEI" />
            <HierarchyTextRow depth={2} label={`${project.aoi} · ${project.aoiName}`} tag="AOI" />
            {targets.map((item, index) => {
              const physical = percent(item.periodExecuted, item.periodPlanned);
              const financial = percent(item.financialAccrued, item.financialPim);
              const gap = physical - financial;
              return (
                <tr key={item.id} className={index % 2 ? "bg-slate-50" : "bg-white"}>
                  <td
                    className={`sticky left-0 z-10 border-t border-r border-slate-200 px-2 py-2 ${index % 2 ? "bg-slate-50" : "bg-white"}`}
                  >
                    <div className="flex items-center pl-12">
                      <span className="mr-1.5 rounded bg-blue-50 px-1 py-0.5 text-[7px] font-bold text-blue-700">
                        META
                      </span>
                      <span className="font-semibold">{item.label}</span>
                    </div>
                  </td>
                  <TextCell value={item.unit} />
                  <NumberCell value={item.annual} />
                  <NumberCell value={item.periodPlanned} />
                  <NumberCell value={item.periodExecuted} />
                  <PercentCell value={physical} />
                  <MoneyCell value={item.financialAccrued} strong />
                  <PercentCell value={financial} />
                  <td
                    className={`border-t border-r border-slate-200 px-2 py-2 text-right font-bold ${gap > 20 ? "text-red-600" : gap > 10 ? "text-amber-600" : "text-emerald-600"}`}
                  >
                    {gap.toFixed(1)} p.p.
                  </td>
                  <td className="border-t border-slate-200 px-2 py-2 text-center">
                    <GapBadge gap={gap} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 border-t border-slate-200 bg-slate-50 p-3 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-3 py-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-700">
              Indicadores complementarios de Gestión Predial
            </h3>
            <p className="text-[9px] text-slate-500">
              Explican el avance operativo; no reemplazan la meta oficial CEPLAN.
            </p>
          </div>
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-slate-100 text-slate-600">
                <th className="px-2 py-1.5 text-left">Indicador predial</th>
                <th>Programado</th>
                <th>Ejecutado</th>
                <th>Pendiente</th>
                <th>Avance</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map((item) => (
                <tr key={item.label} className="border-t border-slate-100">
                  <td className="px-2 py-1.5 font-medium">{item.label}</td>
                  <td className="px-2 text-right">{item.planned}</td>
                  <td className="px-2 text-right">{item.executed}</td>
                  <td className="px-2 text-right">{item.planned - item.executed}</td>
                  <td className="px-2 text-right font-bold text-blue-700">
                    {percent(item.executed, item.planned).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {predio ? (
          <PredioContribution project={project} predio={predio} indicators={indicators} />
        ) : (
          <div className="flex items-center justify-center rounded-md border border-dashed border-slate-300 bg-white p-5 text-center text-[10px] text-slate-500">
            Seleccione el nivel <b className="mx-1 text-slate-700">Predio</b> para identificar su
            contribución a la meta física.
          </div>
        )}
      </div>
    </div>
  );
}

function ClassifierMatrix({
  project,
  predio,
  classifiers,
  predios,
  expanded,
  onToggle,
  onLink,
}: {
  project: IntegratedProject;
  predio: IntegratedPredio | null;
  classifiers: ReturnType<typeof getSiafClassifiers>;
  predios: IntegratedPredio[];
  expanded: Set<string>;
  onToggle: (code: string) => void;
  onLink: (predio?: IntegratedPredio) => void;
}) {
  const visibleClassifiers = predio
    ? classifiers.filter((item) => item.code === predio.classifier)
    : classifiers;
  return (
    <div>
      <MatrixIntro
        title="Matriz por clasificador SIAF"
        description={`Catálogo presupuestal ${project.year} cargado desde la configuración SIAF; conserva código y descripción oficial.`}
      />
      <div className="overflow-x-auto">
        <table className="min-w-[2050px] w-full border-collapse text-[9px]">
          <thead>
            <tr className="bg-slate-900 text-white">
              {[
                "Fuente",
                "Rubro",
                "Categoría",
                "Genérica",
                "Subgenérica",
                "Específica",
                "Clasificador",
                "Meta",
                "Expediente / Predio",
                "PIA",
                "PIM",
                "Certificado",
                "Compromiso",
                "Devengado",
                "Girado",
                "Pagado",
                "Saldo",
                "Vinc.",
              ].map((header) => (
                <th
                  key={header}
                  className="border-r border-slate-700 px-2 py-2 text-center font-bold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleClassifiers.flatMap((item, index) => {
              const relatedPredios = predio
                ? [predio]
                : predios.filter((predioItem) => predioItem.classifier === item.code);
              const open = expanded.has(item.code) || Boolean(predio);
              const mainRow = (
                <tr key={item.code} className={index % 2 ? "bg-slate-50" : "bg-white"}>
                  <td className="border-r border-t border-slate-200 px-2 py-2 font-semibold">
                    {item.sourceCode} · {item.sourceName}
                  </td>
                  <TextCell value={`${item.itemCode} · ${item.itemName}`} />
                  <TextCell value={`${item.categoryCode} · ${item.categoryName}`} />
                  <TextCell value={`${item.genericCode} · ${item.genericName}`} />
                  <TextCell value={`${item.subgenericCode} · ${item.subgenericName}`} />
                  <TextCell value={`${item.specificCode} · ${item.specificName}`} />
                  <td className="border-r border-t border-slate-200 px-2 py-2">
                    <button
                      type="button"
                      onClick={() => onToggle(item.code)}
                      className="inline-flex items-start gap-1.5 text-left font-bold text-blue-700"
                    >
                      {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      <span>
                        {item.code}
                        <small className="block font-normal text-slate-500">
                          {item.description}
                        </small>
                      </span>
                    </button>
                  </td>
                  <TextCell value={item.meta} />
                  <TextCell value={`${relatedPredios.length} predio(s)`} />
                  <MoneyCell value={item.pia} />
                  <MoneyCell value={item.pim} />
                  <MoneyCell value={item.certification} />
                  <MoneyCell value={item.commitment} />
                  <MoneyCell value={item.accrued} strong />
                  <MoneyCell value={item.drawn} />
                  <MoneyCell value={item.paid} />
                  <MoneyCell value={item.pim - item.accrued} />
                  <td className="border-t border-slate-200 px-2 py-2 text-center">
                    <button type="button" onClick={() => onLink()}>
                      <LinkBadge status={project.linkStatus} />
                    </button>
                  </td>
                </tr>
              );
              const children = open
                ? relatedPredios.map((predioItem) => (
                    <tr key={`${item.code}-${predioItem.code}`} className="bg-blue-50/40">
                      <td
                        colSpan={6}
                        className="border-r border-t border-slate-200 px-2 py-1.5 text-right text-[8px] font-bold uppercase text-slate-400"
                      >
                        Predio vinculado
                      </td>
                      <td className="border-r border-t border-slate-200 px-2 py-1.5 pl-6 text-blue-800">
                        ↳ {item.code}
                      </td>
                      <td className="border-r border-t border-slate-200 px-2 py-1.5 text-center">
                        {project.meta}
                      </td>
                      <td className="border-r border-t border-slate-200 px-2 py-1.5">
                        <strong>{predioItem.code}</strong>
                        <small className="block text-slate-500">
                          {predioItem.siafFile || "Sin expediente SIAF"}
                        </small>
                      </td>
                      <MoneyCell value={0} empty />
                      <MoneyCell value={project.pim} reference />
                      <MoneyCell value={predioItem.certification} />
                      <MoneyCell value={predioItem.commitment} />
                      <MoneyCell value={predioItem.accrued} strong />
                      <MoneyCell value={predioItem.drawn} />
                      <MoneyCell value={predioItem.paid} />
                      <MoneyCell value={Math.max(predioItem.cost - predioItem.paid, 0)} />
                      <td className="border-t border-slate-200 px-2 py-1.5 text-center">
                        <button type="button" onClick={() => onLink(predioItem)}>
                          <LinkBadge status={predioItem.linkStatus} />
                        </button>
                      </td>
                    </tr>
                  ))
                : [];
              return [mainRow, ...children];
            })}
            {!visibleClassifiers.length && (
              <tr>
                <td colSpan={18} className="py-10 text-center text-[11px] text-slate-500">
                  No existen clasificadores cargados para el año, proyecto o predio seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PredioSummary({
  project,
  predio,
  onLink,
}: {
  project: IntegratedProject;
  predio: IntegratedPredio;
  onLink: () => void;
}) {
  const pending = Math.max(predio.cost - predio.paid, 0);
  const values = [
    ["Costo reconocido", predio.cost],
    ["Monto vinculado", predio.linkedAmount],
    ["Certificado", predio.certification],
    ["Comprometido", predio.commitment],
    ["Devengado", predio.accrued],
    ["Girado", predio.drawn],
    ["Pagado", predio.paid],
    ["Pendiente", pending],
  ] as const;
  return (
    <section className="mt-3 rounded-lg border border-blue-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 bg-blue-50/60 px-3 py-2">
        <div>
          <h2 className="text-[11px] font-bold text-slate-900">
            {predio.code} · {predio.owner}
          </h2>
          <p className="text-[9px] text-slate-500">
            CUI {project.cui} · Meta {project.meta} · {predio.file} · {predio.stage}
          </p>
        </div>
        <button type="button" onClick={onLink}>
          <LinkBadge status={predio.linkStatus} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-4 xl:grid-cols-8">
        {values.map(([label, value]) => (
          <div key={label} className="bg-white px-2.5 py-2">
            <div className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
              {label}
            </div>
            <div
              className={`mt-1 text-[12px] font-bold tabular-nums ${label === "Pendiente" ? "text-red-600" : "text-slate-800"}`}
            >
              {compactMoney(value)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PredioContribution({
  project,
  predio,
  indicators,
}: {
  project: IntegratedProject;
  predio: IntegratedPredio;
  indicators: ReturnType<typeof predialIndicators.filter>;
}) {
  const paidIndicator =
    indicators.find((item) => item.label === "Predios pagados") ?? indicators[0];
  return (
    <div className="rounded-md border border-blue-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-700">
          Contribución del predio a la meta
        </h3>
        <SourceBadge label="GESTIÓN PREDIAL" tone="red" />
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9px]">
        <DetailTerm
          label="Actividad operativa"
          value={`${project.aoi} · ${project.aoiName}`}
          wide
        />
        <DetailTerm
          label="Meta física asociada"
          value={`${paidIndicator.executed} de ${paidIndicator.planned} predios ejecutados`}
          wide
        />
        <DetailTerm label="Código predial" value={predio.code} />
        <DetailTerm label="Estado / etapa" value={`${predio.state} · ${predio.stage}`} />
        <DetailTerm label="Tasación" value={predio.appraisalState} />
        <DetailTerm label="Pago" value={predio.paymentState} />
        <DetailTerm label="Inscripción" value={predio.registrationState} />
        <DetailTerm
          label="Avance de la meta"
          value={`${percent(paidIndicator.executed, paidIndicator.planned).toFixed(1)}%`}
        />
      </dl>
    </div>
  );
}

function LinkDetailModal({
  project,
  predio,
  onClose,
}: {
  project: IntegratedProject;
  predio: IntegratedPredio | null;
  onClose: () => void;
}) {
  const status = predio?.linkStatus ?? project.linkStatus;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-[14px] font-bold">
              Detalle de vinculación CEPLAN ↔ SIAF ↔ Gestión Predial
            </h2>
            <p className="text-[10px] text-slate-500">
              La homologación prioriza códigos oficiales, no coincidencias de texto.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X size={17} />
          </button>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-3">
          <DetailPanel
            title="CEPLAN"
            tone="blue"
            rows={[
              ["OEI", `${project.oei} · ${project.oeiName}`],
              ["AEI", `${project.aei} · ${project.aeiName}`],
              ["Actividad Operativa", `${project.aoi} · ${project.aoiName}`],
              ["Centro de costo", project.costCenter],
              ["Meta física", "Predios con proceso de adquisición y liberación"],
              ["POI programado", money(project.poi)],
            ]}
          />
          <DetailPanel
            title="SIAF"
            tone="violet"
            rows={[
              ["Proyecto / CUI", project.cui],
              ["Meta / secuencia", `${project.meta} / ${project.functionalSequence}`],
              ["Fuente", `${project.sourceCode} · ${project.sourceName}`],
              ["Rubro", `${project.itemCode} · ${project.itemName}`],
              ["Genérica", `${project.genericCode} · ${project.genericName}`],
              ["Clasificador", predio?.classifier || "Por homologar"],
            ]}
          />
          <DetailPanel
            title="GESTIÓN PREDIAL"
            tone="red"
            rows={[
              ["Proyecto", project.name],
              [
                "Código predial",
                predio?.code ??
                  `${integratedPredios.filter((item) => item.projectId === project.id).length} predios`,
              ],
              ["Expediente", predio?.file ?? "Consolidado del proyecto"],
              ["Sujeto pasivo", predio?.owner ?? "Múltiples sujetos pasivos"],
              ["Etapa", predio?.stage ?? "Múltiples etapas"],
              ["Costo predial", predio ? money(predio.cost) : "Consolidado"],
            ]}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="font-bold text-slate-500">Estado:</span>
            <LinkBadge status={status} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-slate-900 px-4 py-2 text-[10px] font-bold text-white"
          >
            Cerrar detalle
          </button>
        </div>
      </div>
    </div>
  );
}

function CompactSelect({
  label,
  value,
  options,
  optionLabel,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  optionLabel?: (value: string) => string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block truncate text-[9px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-[10px] font-medium outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabel ? optionLabel(option) : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function LevelButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[9px] font-bold uppercase ${active ? "bg-red-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
    >
      {children}
    </button>
  );
}

const metricTones = {
  blue: "border-blue-200 bg-blue-50 text-blue-800",
  violet: "border-violet-200 bg-violet-50 text-violet-800",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  red: "border-red-200 bg-red-50 text-red-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
};

function MetricCard({
  label,
  value,
  source,
  tone,
  percentValue = false,
  count = false,
}: {
  label: string;
  value: number;
  source: string;
  tone: keyof typeof metricTones;
  percentValue?: boolean;
  count?: boolean;
}) {
  return (
    <article className={`rounded-lg border p-2.5 shadow-sm ${metricTones[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[8px] font-bold uppercase tracking-wide opacity-75">{label}</span>
        <span className="rounded bg-white/70 px-1 py-0.5 text-[7px] font-bold">{source}</span>
      </div>
      <div className="mt-2 text-[15px] font-bold tabular-nums">
        {percentValue ? `${value.toFixed(1)}%` : count ? value : compactMoney(value)}
      </div>
    </article>
  );
}

function SourceBadge({ label, tone }: { label: string; tone: "blue" | "violet" | "red" }) {
  const styles = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`rounded border px-1.5 py-0.5 text-[7px] font-bold ${styles[tone]}`}>
      {label}
    </span>
  );
}

function MatrixIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
      <div>
        <h2 className="text-[12px] font-bold">{title}</h2>
        <p className="text-[9px] text-slate-500">{description}</p>
      </div>
      <div className="text-[8px] text-slate-400">
        Importes en soles · Devengado como indicador financiero principal
      </div>
    </div>
  );
}

function TextCell({ value }: { value: string }) {
  return (
    <td className="max-w-56 border-r border-t border-slate-200 px-2 py-1.5 text-slate-600">
      <span className="line-clamp-2" title={value}>
        {value}
      </span>
    </td>
  );
}

function MoneyCell({
  value,
  empty = false,
  strong = false,
  source,
  reference = false,
}: {
  value: number;
  empty?: boolean;
  strong?: boolean;
  source?: "ceplan" | "siaf";
  reference?: boolean;
}) {
  return (
    <td
      className={`border-r border-t border-slate-200 px-2 py-1.5 text-right tabular-nums ${strong ? "font-bold text-blue-800" : "text-slate-700"} ${source === "ceplan" ? "bg-blue-50/40" : ""} ${source === "siaf" ? "bg-violet-50/40" : ""}`}
    >
      {empty ? (
        "—"
      ) : (
        <>
          <span>{money(value)}</span>
          {reference && (
            <small className="block text-[7px] font-bold text-violet-500">Referencia Meta</small>
          )}
        </>
      )}
    </td>
  );
}

function PercentCell({ value, empty = false }: { value: number; empty?: boolean }) {
  return (
    <td className="border-r border-t border-slate-200 px-2 py-1.5 text-right font-bold tabular-nums text-slate-700">
      {empty ? "—" : `${value.toFixed(1)}%`}
    </td>
  );
}

function NumberCell({ value }: { value: number }) {
  return (
    <td className="border-r border-t border-slate-200 px-2 py-2 text-right tabular-nums">
      {value.toLocaleString("es-PE")}
    </td>
  );
}

function HierarchyTextRow({ depth, label, tag }: { depth: number; label: string; tag: string }) {
  return (
    <tr className="bg-slate-50 font-semibold text-slate-700">
      <td
        className="sticky left-0 z-10 border-r border-t border-slate-200 bg-slate-50 px-2 py-1.5"
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        <span className="mr-1.5 rounded bg-slate-200 px-1 py-0.5 text-[7px] font-bold">{tag}</span>
        {label}
      </td>
      <td colSpan={9} className="border-t border-slate-200 px-2 py-1.5 text-[8px] text-slate-400">
        Nivel jerárquico de planeamiento
      </td>
    </tr>
  );
}

function LinkBadge({ status }: { status: LinkStatus }) {
  const values = {
    Vinculado: { icon: CheckCircle2, style: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    "Vinculación parcial": {
      icon: AlertTriangle,
      style: "border-amber-200 bg-amber-50 text-amber-700",
    },
    "Sin vincular": { icon: XCircle, style: "border-red-200 bg-red-50 text-red-700" },
  };
  const item = values[status];
  const Icon = item.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[8px] font-bold ${item.style}`}
    >
      <Icon size={10} /> {status}
    </span>
  );
}

function GapBadge({ gap }: { gap: number }) {
  if (Math.abs(gap) <= 8)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-bold text-emerald-700">
        <CheckCircle2 size={10} /> Avance consistente
      </span>
    );
  if (Math.abs(gap) <= 20)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[8px] font-bold text-amber-700">
        <AlertTriangle size={10} /> Diferencia moderada
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[8px] font-bold text-red-700">
      <XCircle size={10} /> Brecha alta
    </span>
  );
}

function DetailTerm({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <dt className="font-bold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-semibold text-slate-700">{value}</dd>
    </div>
  );
}

function DetailPanel({
  title,
  tone,
  rows,
}: {
  title: string;
  tone: "blue" | "violet" | "red";
  rows: Array<[string, string]>;
}) {
  const styles = {
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    violet: "border-violet-200 bg-violet-50 text-violet-800",
    red: "border-red-200 bg-red-50 text-red-800",
  };
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200">
      <h3 className={`border-b px-3 py-2 text-[10px] font-bold ${styles[tone]}`}>{title}</h3>
      <dl className="divide-y divide-slate-100 p-3 text-[9px]">
        {rows.map(([label, value]) => (
          <div key={label} className="py-1.5">
            <dt className="font-bold uppercase tracking-wide text-slate-400">{label}</dt>
            <dd className="mt-0.5 font-medium text-slate-700">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

async function exportSheet(
  title: string,
  headers: string[],
  rows: Array<Array<string | number>>,
  filename: string,
) {
  const monetaryStart = title === "Metas físicas" ? 6 : title === "Clasificador SIAF" ? 9 : 3;
  const data: SheetData = [
    headers.map((value) => ({
      value,
      fontWeight: "bold",
      backgroundColor: "#1E293B",
      textColor: "#FFFFFF",
      wrap: true,
    })),
    ...rows.map((row) =>
      row.map((value, index) => ({
        value,
        type: typeof value === "number" ? Number : String,
        format: typeof value === "number" && index >= monetaryStart ? "#,##0.00" : undefined,
        wrap: true,
      })),
    ),
  ];
  await writeExcelFile(data, {
    sheet: title.slice(0, 31),
    stickyRowsCount: 1,
    orientation: "landscape",
    columns: headers.map((header, index) => ({
      width: index === 0 ? 42 : Math.max(14, Math.min(24, header.length + 3)),
    })),
  }).toFile(`${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
