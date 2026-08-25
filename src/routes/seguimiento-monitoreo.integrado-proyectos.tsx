import { createFileRoute, Link } from "@tanstack/react-router";
import { type ReactNode, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleDollarSign,
  FileSpreadsheet,
  FolderKanban,
  Search,
  Target,
  WalletCards,
  XCircle,
} from "lucide-react";
import writeExcelFile, { type SheetData } from "write-excel-file/browser";

import { AppSidebar } from "../components/AppSidebar";
import {
  integratedPredios,
  integratedProjects,
  type IntegratedProject,
  type LinkStatus,
} from "../lib/integratedCeplanSiafData";
import { proyectos, type Proyecto } from "../lib/projectsData";

export const Route = createFileRoute("/seguimiento-monitoreo/integrado-proyectos")({
  head: () => ({ meta: [{ title: "Seguimiento Integrado de Todos los Proyectos" }] }),
  component: IntegratedProjectsPage,
});

type PortfolioRow = {
  project: Proyecto;
  integration: IntegratedProject | null;
  referenceBudget: number;
  poi: number | null;
  pia: number | null;
  pim: number | null;
  certification: number | null;
  accrued: number | null;
  paid: number | null;
  financialProgress: number;
  physicalProgress: number;
  gap: number;
  linkStatus: LinkStatus;
};

const moneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 0,
});

function money(value: number) {
  return moneyFormatter.format(value);
}

function compactMoney(value: number) {
  if (value >= 1_000_000) return `S/ ${(value / 1_000_000).toFixed(1)} M`;
  return money(value);
}

function parseProjectBudget(value: string) {
  const amount = Number(value.match(/[\d.]+/)?.[0] ?? 0);
  return value.toUpperCase().includes("MM") ? amount * 1_000_000 : amount;
}

function buildPortfolioRow(project: Proyecto): PortfolioRow {
  const integration = integratedProjects.find((item) => item.id === project.id) ?? null;
  const financialProgress = integration
    ? (integration.accrued / Math.max(integration.pim, 1)) * 100
    : project.financiero;
  return {
    project,
    integration,
    referenceBudget: parseProjectBudget(project.presupuesto),
    poi: integration?.poi ?? null,
    pia: integration?.pia ?? null,
    pim: integration?.pim ?? null,
    certification: integration?.certification ?? null,
    accrued: integration?.accrued ?? null,
    paid: integration?.paid ?? null,
    financialProgress,
    physicalProgress: project.fisico,
    gap: project.fisico - financialProgress,
    linkStatus: integration?.linkStatus ?? "Sin vincular",
  };
}

function IntegratedProjectsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [coordinationFilter, setCoordinationFilter] = useState("Todas");
  const [stateFilter, setStateFilter] = useState("Todos");
  const [linkFilter, setLinkFilter] = useState("Todos");
  const [expandedProject, setExpandedProject] = useState<string | null>("iquitos");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const rows = useMemo(() => proyectos.map(buildPortfolioRow), []);
  const projectTypes = useMemo(
    () => ["Todos", ...Array.from(new Set(proyectos.map((item) => item.tipo)))],
    [],
  );
  const coordinations = useMemo(
    () => ["Todas", ...Array.from(new Set(proyectos.map((item) => item.coordinacionGeneral)))],
    [],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-PE");
    return rows.filter((row) => {
      const matchesText =
        !query ||
        [
          row.project.codigo,
          row.project.nombre,
          row.project.tipo,
          row.project.coordinacionGeneral,
          row.project.coordinacionPredial,
          row.integration?.cui ?? "",
          row.integration?.meta ?? "",
        ].some((value) => value.toLocaleLowerCase("es-PE").includes(query));
      return (
        matchesText &&
        (typeFilter === "Todos" || row.project.tipo === typeFilter) &&
        (coordinationFilter === "Todas" ||
          row.project.coordinacionGeneral === coordinationFilter) &&
        (stateFilter === "Todos" || row.project.estado === stateFilter) &&
        (linkFilter === "Todos" || row.linkStatus === linkFilter)
      );
    });
  }, [coordinationFilter, linkFilter, rows, search, stateFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const linkedCount = rows.filter((row) => row.linkStatus === "Vinculado").length;
  const partialCount = rows.filter((row) => row.linkStatus === "Vinculación parcial").length;
  const unlinkedCount = rows.filter((row) => row.linkStatus === "Sin vincular").length;
  const totalPortfolioBudget = rows.reduce((sum, row) => sum + row.referenceBudget, 0);
  const integratedPim = rows.reduce((sum, row) => sum + (row.pim ?? 0), 0);
  const integratedAccrued = rows.reduce((sum, row) => sum + (row.accrued ?? 0), 0);
  const siafExecution = (integratedAccrued / Math.max(integratedPim, 1)) * 100;

  const resetPage = () => setPage(1);

  const exportPortfolio = async () => {
    const headers = [
      "Código",
      "Proyecto",
      "Tipo",
      "Coordinación general",
      "Coordinación predial",
      "Estado",
      "CUI",
      "OEI",
      "AEI",
      "Actividad operativa",
      "Meta SIAF",
      "POI programado",
      "PIA",
      "PIM",
      "Certificación",
      "Devengado",
      "Pagado",
      "Avance físico",
      "Avance financiero",
      "Brecha físico-financiera",
      "Predios",
      "Predios disponibles",
      "Vinculación",
    ];
    const data: SheetData = [
      headers.map((value) => ({
        value,
        fontWeight: "bold",
        backgroundColor: "#1E293B",
        textColor: "#FFFFFF",
        wrap: true,
      })),
      ...filteredRows.map((row) =>
        [
          row.project.codigo,
          row.project.nombre,
          row.project.tipo,
          row.project.coordinacionGeneral,
          row.project.coordinacionPredial,
          row.project.estado,
          row.integration?.cui ?? "Pendiente",
          row.integration?.oei ?? "Pendiente",
          row.integration?.aei ?? "Pendiente",
          row.integration?.aoi ?? "Pendiente",
          row.integration?.meta ?? "Pendiente",
          row.poi ?? "",
          row.pia ?? "",
          row.pim ?? "",
          row.certification ?? "",
          row.accrued ?? "",
          row.paid ?? "",
          row.physicalProgress / 100,
          row.financialProgress / 100,
          row.gap / 100,
          row.project.predios,
          row.project.disponibles,
          row.linkStatus,
        ].map((value, index) => ({
          value,
          type: typeof value === "number" ? Number : String,
          format:
            index >= 11 && index <= 16
              ? "S/ #,##0.00"
              : index >= 17 && index <= 19
                ? "0.00%"
                : undefined,
          wrap: true,
        })),
      ),
    ];
    await writeExcelFile(data, {
      sheet: "Todos los proyectos",
      stickyRowsCount: 1,
      orientation: "landscape",
      columns: headers.map((header, index) => ({
        width: index === 1 || index === 3 || index === 4 ? 32 : Math.max(13, header.length + 2),
      })),
    }).toFile(
      `seguimiento_integrado_todos_los_proyectos_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f3f5f7] text-slate-900">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-auto p-3 xl:p-4">
        <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">
              Integración institucional · Cartera completa
            </p>
            <h1 className="mt-0.5 text-[20px] font-bold tracking-tight">
              Seguimiento Integrado de Todos los Proyectos
            </h1>
            <p className="text-[11px] text-slate-500">
              Estado CEPLAN, SIAF y Gestión Predial de los {proyectos.length} proyectos registrados.
            </p>
          </div>
          <button
            type="button"
            onClick={exportPortfolio}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-3 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            <FileSpreadsheet size={15} /> Exportar proyectos
          </button>
        </header>

        <section className="mt-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[1.4fr_repeat(4,minmax(150px,0.7fr))_auto]">
            <label className="block">
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-500">
                Buscar proyecto
              </span>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    resetPage();
                  }}
                  placeholder="Nombre, código, CUI, Meta o coordinación"
                  className="h-8 w-full rounded-md border border-slate-300 pl-8 pr-2 text-[10px] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
              </div>
            </label>
            <FilterSelect
              label="Tipo de infraestructura"
              value={typeFilter}
              options={projectTypes}
              onChange={(value) => {
                setTypeFilter(value);
                resetPage();
              }}
            />
            <FilterSelect
              label="Coordinación general"
              value={coordinationFilter}
              options={coordinations}
              onChange={(value) => {
                setCoordinationFilter(value);
                resetPage();
              }}
            />
            <FilterSelect
              label="Estado del proyecto"
              value={stateFilter}
              options={["Todos", "En ejecucion", "En revision", "En estructuracion"]}
              onChange={(value) => {
                setStateFilter(value);
                resetPage();
              }}
            />
            <FilterSelect
              label="Estado de vinculación"
              value={linkFilter}
              options={["Todos", "Vinculado", "Vinculación parcial", "Sin vincular"]}
              onChange={(value) => {
                setLinkFilter(value);
                resetPage();
              }}
            />
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setTypeFilter("Todos");
                setCoordinationFilter("Todas");
                setStateFilter("Todos");
                setLinkFilter("Todos");
                setPage(1);
              }}
              className="mt-[17px] h-8 rounded-md border border-slate-300 bg-white px-3 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
            >
              Limpiar
            </button>
          </div>
        </section>

        <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
            <div>
              <h2 className="text-[12px] font-bold">Matriz consolidada de proyectos</h2>
              <p className="text-[9px] text-slate-500">
                Los campos CEPLAN y SIAF muestran “Pendiente” cuando el proyecto aún no fue
                homologado.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[8px]">
              <LinkBadge status="Vinculado" />
              <LinkBadge status="Vinculación parcial" />
              <LinkBadge status="Sin vincular" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[2300px] w-full border-collapse text-[9px]">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="sticky left-0 z-20 min-w-[330px] border-r border-slate-700 bg-slate-900 px-2 py-2 text-left">
                    Proyecto / CUI
                  </th>
                  {[
                    "Tipo",
                    "Coordinación",
                    "Estado",
                    "OEI / AEI",
                    "Actividad operativa",
                    "Meta SIAF",
                    "POI prog.",
                    "PIA",
                    "PIM",
                    "Certificación",
                    "Devengado",
                    "Pagado",
                    "Avance físico",
                    "Avance financiero",
                    "Brecha",
                    "Predios",
                    "Disponibles",
                    "Vinculación",
                    "Acción",
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
                {visibleRows.flatMap((row, index) => {
                  const open = expandedProject === row.project.id;
                  const rowBackground = index % 2 ? "bg-slate-50" : "bg-white";
                  return [
                    <tr key={row.project.id} className={rowBackground}>
                      <td
                        className={`sticky left-0 z-10 border-r border-t border-slate-200 px-2 py-1.5 ${rowBackground}`}
                      >
                        <div className="flex items-start gap-1.5">
                          <button
                            type="button"
                            onClick={() => setExpandedProject(open ? null : row.project.id)}
                            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded hover:bg-slate-200"
                          >
                            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                          </button>
                          <div>
                            <div className="font-bold text-slate-800">
                              {row.project.codigo} · {row.project.nombre}
                            </div>
                            <div className="mt-0.5 text-[8px] text-slate-500">
                              CUI: {row.integration?.cui ?? "Pendiente de homologación"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <TextCell value={row.project.tipo} />
                      <TextCell value={row.project.coordinacionGeneral} />
                      <td className="border-r border-t border-slate-200 px-2 py-1.5 text-center">
                        <ProjectStateBadge state={row.project.estado} />
                      </td>
                      <TextCell
                        value={
                          row.integration
                            ? `${row.integration.oei} / ${row.integration.aei}`
                            : "Pendiente"
                        }
                        pending={!row.integration}
                      />
                      <TextCell
                        value={row.integration?.aoi ?? "Pendiente"}
                        pending={!row.integration}
                      />
                      <TextCell
                        value={
                          row.integration
                            ? `${row.integration.meta} / ${row.integration.functionalSequence}`
                            : "Pendiente"
                        }
                        pending={!row.integration}
                      />
                      <MoneyCell value={row.poi} tone="ceplan" />
                      <MoneyCell value={row.pia} tone="siaf" />
                      <MoneyCell value={row.pim} tone="siaf" />
                      <MoneyCell value={row.certification} />
                      <MoneyCell value={row.accrued} strong />
                      <MoneyCell value={row.paid} />
                      <ProgressCell value={row.physicalProgress} tone="blue" />
                      <ProgressCell value={row.financialProgress} tone="violet" />
                      <td
                        className={`border-r border-t border-slate-200 px-2 py-1.5 text-right font-bold ${
                          Math.abs(row.gap) > 20
                            ? "text-red-600"
                            : Math.abs(row.gap) > 10
                              ? "text-amber-600"
                              : "text-emerald-600"
                        }`}
                      >
                        {row.gap > 0 ? "+" : ""}
                        {row.gap.toFixed(1)} p.p.
                      </td>
                      <NumberCell value={row.project.predios} />
                      <NumberCell value={row.project.disponibles} />
                      <td className="border-r border-t border-slate-200 px-2 py-1.5 text-center">
                        <LinkBadge status={row.linkStatus} />
                      </td>
                      <td className="border-t border-slate-200 px-2 py-1.5 text-center">
                        {row.integration ? (
                          <Link
                            to="/seguimiento-monitoreo/integrado-ceplan-siaf"
                            search={{ project: row.project.id }}
                            className="inline-flex whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[8px] font-bold text-white hover:bg-slate-700"
                          >
                            Ver análisis
                          </Link>
                        ) : (
                          <Link
                            to="/configuracion/siaf-ceplan"
                            className="inline-flex whitespace-nowrap rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[8px] font-bold text-red-700 hover:bg-red-100"
                          >
                            Homologar
                          </Link>
                        )}
                      </td>
                    </tr>,
                    ...(open
                      ? [
                          <tr key={`${row.project.id}-detail`} className="bg-slate-100/80">
                            <td colSpan={21} className="border-t border-slate-200 p-3">
                              <ProjectDetail row={row} />
                            </td>
                          </tr>,
                        ]
                      : []),
                  ];
                })}
                {!visibleRows.length && (
                  <tr>
                    <td colSpan={21} className="py-12 text-center text-[11px] text-slate-500">
                      No hay proyectos que coincidan con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2 text-[9px] text-slate-500">
            <span>
              Mostrando {(currentPage - 1) * pageSize + (visibleRows.length ? 1 : 0)}–
              {(currentPage - 1) * pageSize + visibleRows.length} de {filteredRows.length} proyectos
            </span>
            <div className="flex items-center gap-1">
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="mr-2 h-7 rounded border border-slate-300 bg-white px-2 text-[9px]"
              >
                <option value={15}>15 filas</option>
                <option value={25}>25 filas</option>
                <option value={50}>Todos</option>
              </select>
              <PaginationButton disabled={currentPage === 1} onClick={() => setPage(1)}>
                <ChevronsLeft size={12} />
              </PaginationButton>
              <PaginationButton
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                <ChevronLeft size={12} />
              </PaginationButton>
              <span className="px-2 font-bold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <PaginationButton
                disabled={currentPage === totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                <ChevronRight size={12} />
              </PaginationButton>
              <PaginationButton
                disabled={currentPage === totalPages}
                onClick={() => setPage(totalPages)}
              >
                <ChevronsRight size={12} />
              </PaginationButton>
            </div>
          </div>
        </section>

        <section className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard
            label="Total de proyectos"
            value={String(rows.length)}
            detail="Cartera registrada"
            icon={FolderKanban}
            tone="slate"
          />
          <SummaryCard
            label="Vinculados"
            value={String(linkedCount)}
            detail="CEPLAN · SIAF · Predial"
            icon={CheckCircle2}
            tone="green"
          />
          <SummaryCard
            label="Vinculación parcial"
            value={String(partialCount)}
            detail="Requieren completar claves"
            icon={AlertTriangle}
            tone="amber"
          />
          <SummaryCard
            label="Sin vincular"
            value={String(unlinkedCount)}
            detail="Pendientes de homologación"
            icon={XCircle}
            tone="red"
          />
          <SummaryCard
            label="PIM integrado"
            value={compactMoney(integratedPim)}
            detail={`Cartera referencial ${compactMoney(totalPortfolioBudget)}`}
            icon={CircleDollarSign}
            tone="violet"
          />
          <SummaryCard
            label="Ejecución devengada"
            value={`${siafExecution.toFixed(1)}%`}
            detail={compactMoney(integratedAccrued)}
            icon={WalletCards}
            tone="blue"
          />
        </section>

        <footer className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-[9px] text-slate-500">
          <strong className="text-slate-700">Lectura del consolidado:</strong> el presupuesto
          referencial proviene de la cartera de proyectos. POI, PIA, PIM, Meta y ejecución solo se
          muestran cuando existe una homologación institucional válida.
        </footer>
      </main>
    </div>
  );
}

function ProjectDetail({ row }: { row: PortfolioRow }) {
  const predios = integratedPredios.filter((item) => item.projectId === row.project.id);
  if (!row.integration) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />
          <div>
            <div className="text-[10px] font-bold text-red-800">
              Proyecto pendiente de integración
            </div>
            <p className="mt-0.5 text-[9px] text-red-700">
              Falta relacionar CUI, OEI, AEI, Actividad Operativa, Meta SIAF y clasificadores.
            </p>
          </div>
        </div>
        <Link
          to="/configuracion/siaf-ceplan"
          className="rounded-md bg-red-600 px-3 py-1.5 text-[9px] font-bold text-white hover:bg-red-700"
        >
          Ir a homologación
        </Link>
      </div>
    );
  }
  return (
    <div className="grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 text-[9px]">
        {[
          ["CUI", row.integration.cui],
          ["Meta / secuencia", `${row.integration.meta} / ${row.integration.functionalSequence}`],
          ["OEI", row.integration.oei],
          ["AEI", row.integration.aei],
          ["Actividad operativa", row.integration.aoi],
          ["Centro de costo", row.integration.costCenter],
          ["Fuente / rubro", `${row.integration.sourceCode} / ${row.integration.itemCode}`],
          ["Genérica", `${row.integration.genericCode} · ${row.integration.genericName}`],
        ].map(([label, value]) => (
          <div key={label} className="bg-white p-2">
            <div className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
              {label}
            </div>
            <div className="mt-0.5 font-semibold text-slate-700">{value}</div>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-3 py-1.5 text-[9px] font-bold text-slate-700">
          Predios vinculados al proyecto
        </div>
        <table className="w-full text-[8px]">
          <thead>
            <tr className="bg-slate-100 text-slate-500">
              <th className="px-2 py-1 text-left">Predio / titular</th>
              <th>Etapa</th>
              <th>Costo</th>
              <th>Devengado</th>
              <th>Pagado</th>
              <th>Vinc.</th>
            </tr>
          </thead>
          <tbody>
            {predios.map((predio) => (
              <tr key={predio.code} className="border-t border-slate-100">
                <td className="px-2 py-1.5">
                  <strong>{predio.code}</strong>
                  <span className="ml-1 text-slate-500">· {predio.owner}</span>
                </td>
                <td className="px-2 text-center">{predio.stage}</td>
                <td className="px-2 text-right">{money(predio.cost)}</td>
                <td className="px-2 text-right">{money(predio.accrued)}</td>
                <td className="px-2 text-right">{money(predio.paid)}</td>
                <td className="px-2 text-center">
                  <LinkBadge status={predio.linkStatus} compact />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end border-t border-slate-100 p-2">
          <Link
            to="/seguimiento-monitoreo/integrado-ceplan-siaf"
            search={{ project: row.project.id }}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-[8px] font-bold text-white"
          >
            Abrir análisis completo
          </Link>
        </div>
      </div>
    </div>
  );
}

const summaryTones = {
  slate: "border-slate-200 bg-white text-slate-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-red-200 bg-red-50 text-red-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
};

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Target;
  tone: keyof typeof summaryTones;
}) {
  return (
    <article className={`rounded-lg border p-2.5 shadow-sm ${summaryTones[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[8px] font-bold uppercase tracking-wide opacity-75">{label}</span>
        <Icon size={14} />
      </div>
      <div className="mt-1 text-[16px] font-bold tabular-nums">{value}</div>
      <div className="mt-0.5 truncate text-[8px] opacity-70" title={detail}>
        {detail}
      </div>
    </article>
  );
}

function FilterSelect({
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
    <label className="block min-w-0">
      <span className="mb-1 block truncate text-[9px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-[10px] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function TextCell({ value, pending = false }: { value: string; pending?: boolean }) {
  return (
    <td
      className={`max-w-60 border-r border-t border-slate-200 px-2 py-1.5 ${
        pending ? "font-semibold text-red-500" : "text-slate-600"
      }`}
    >
      <span className="line-clamp-2" title={value}>
        {value}
      </span>
    </td>
  );
}

function MoneyCell({
  value,
  strong = false,
  tone,
}: {
  value: number | null;
  strong?: boolean;
  tone?: "ceplan" | "siaf";
}) {
  return (
    <td
      className={`border-r border-t border-slate-200 px-2 py-1.5 text-right tabular-nums ${
        strong ? "font-bold text-blue-700" : "text-slate-700"
      } ${tone === "ceplan" ? "bg-blue-50/40" : ""} ${tone === "siaf" ? "bg-violet-50/40" : ""}`}
    >
      {value === null ? (
        <span className="font-semibold text-red-400">Pendiente</span>
      ) : (
        money(value)
      )}
    </td>
  );
}

function ProgressCell({ value, tone }: { value: number; tone: "blue" | "violet" }) {
  return (
    <td className="min-w-28 border-r border-t border-slate-200 px-2 py-1.5">
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${tone === "blue" ? "bg-blue-500" : "bg-violet-500"}`}
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        </div>
        <strong className="w-9 text-right">{value.toFixed(0)}%</strong>
      </div>
    </td>
  );
}

function NumberCell({ value }: { value: number }) {
  return (
    <td className="border-r border-t border-slate-200 px-2 py-1.5 text-right font-semibold tabular-nums">
      {value.toLocaleString("es-PE")}
    </td>
  );
}

function LinkBadge({ status, compact = false }: { status: LinkStatus; compact?: boolean }) {
  const values = {
    Vinculado: {
      icon: CheckCircle2,
      style: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
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
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-1.5 py-0.5 font-bold ${item.style} ${
        compact ? "text-[7px]" : "text-[8px]"
      }`}
    >
      <Icon size={compact ? 8 : 10} /> {compact ? status.replace("Vinculación ", "") : status}
    </span>
  );
}

function ProjectStateBadge({ state }: { state: Proyecto["estado"] }) {
  const style =
    state === "En ejecucion"
      ? "bg-blue-50 text-blue-700"
      : state === "En revision"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";
  return (
    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[8px] font-bold ${style}`}>
      {state}
    </span>
  );
}

function PaginationButton({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
