import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  House,
  Landmark,
  Printer,
  X,
} from "lucide-react";
import { useState } from "react";
import writeExcelFile, { type SheetData } from "write-excel-file/browser";

import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/seguimiento-monitoreo/general")({
  head: () => ({
    meta: [
      { title: "Alta gerencia · Reporte general aeroportuario" },
      {
        name: "description",
        content:
          "Reporte ejecutivo del avance de adquisiciones prediales y liberación de interferencias.",
      },
    ],
  }),
  component: ExecutiveAirportReportPage,
});

type AirportProject = {
  name: string;
  totalProperties: number;
  acquiredProperties: number;
  interferenceUniverse: number;
  releasedInterferences: number;
  privateProperties?: number;
  stateProperties?: number;
  acquisitionBreakdown?: AcquisitionBreakdownRow[];
};

type AcquisitionBreakdownRow = {
  regime: "Privado" | "Estatal";
  method: string;
  detail: string;
  total: number;
  completed: number;
  unclassified?: boolean;
};

type AirportGroup = {
  name: string;
  subtotalLabel: string;
  projects: AirportProject[];
};

type SelectedAirportProject = {
  groupName: string;
  project: AirportProject;
};

type ReportPeriod = "TODOS" | "2026" | "2025";

const airportGroups: AirportGroup[] = [
  {
    name: "Aeropuertos - Grupo 1",
    subtotalLabel: "Grupo 1 Aero",
    projects: [
      {
        name: "Cajamarca",
        totalProperties: 555,
        acquiredProperties: 459,
        interferenceUniverse: 24,
        releasedInterferences: 16,
      },
      {
        name: "Chachapoyas",
        totalProperties: 3,
        acquiredProperties: 1,
        interferenceUniverse: 11,
        releasedInterferences: 10,
      },
      {
        name: "Anta",
        totalProperties: 41,
        acquiredProperties: 3,
        interferenceUniverse: 11,
        releasedInterferences: 7,
      },
      {
        name: "Iquitos",
        totalProperties: 1748,
        acquiredProperties: 1746,
        interferenceUniverse: 17,
        releasedInterferences: 12,
      },
      {
        name: "Pisco",
        totalProperties: 125,
        acquiredProperties: 86,
        interferenceUniverse: 17,
        releasedInterferences: 12,
      },
      {
        name: "Piura",
        totalProperties: 250,
        acquiredProperties: 142,
        interferenceUniverse: 17,
        releasedInterferences: 11,
      },
      {
        name: "Pucallpa",
        totalProperties: 559,
        acquiredProperties: 548,
        interferenceUniverse: 17,
        releasedInterferences: 15,
      },
      {
        name: "Tarapoto",
        totalProperties: 595,
        acquiredProperties: 528,
        interferenceUniverse: 18,
        releasedInterferences: 10,
      },
      {
        name: "Trujillo",
        totalProperties: 66,
        acquiredProperties: 56,
        interferenceUniverse: 15,
        releasedInterferences: 12,
      },
      {
        name: "Talara",
        totalProperties: 218,
        acquiredProperties: 96,
        interferenceUniverse: 17,
        releasedInterferences: 10,
      },
    ],
  },
  {
    name: "Aeropuertos - Grupo 2",
    subtotalLabel: "Grupo 2 Aero",
    projects: [
      {
        name: "Ayacucho",
        totalProperties: 324,
        acquiredProperties: 87,
        interferenceUniverse: 15,
        releasedInterferences: 9,
      },
      {
        name: "Juliaca",
        totalProperties: 839,
        acquiredProperties: 229,
        interferenceUniverse: 16,
        releasedInterferences: 6,
      },
      {
        name: "Puerto Maldonado",
        totalProperties: 114,
        acquiredProperties: 93,
        interferenceUniverse: 13,
        releasedInterferences: 10,
      },
      {
        name: "Arequipa",
        totalProperties: 14,
        acquiredProperties: 14,
        interferenceUniverse: 23,
        releasedInterferences: 22,
      },
    ],
  },
  {
    name: "Aeropuertos - Grupo 3",
    subtotalLabel: "Aero Jauja",
    projects: [
      {
        name: "Jauja",
        totalProperties: 501,
        acquiredProperties: 495,
        interferenceUniverse: 19,
        releasedInterferences: 12,
      },
    ],
  },
  {
    name: "Aeródromos",
    subtotalLabel: "Aeródromos",
    projects: [
      {
        name: "Soplín Vargas",
        totalProperties: 56,
        acquiredProperties: 35,
        interferenceUniverse: 12,
        releasedInterferences: 10,
      },
      {
        name: "Huancabamba - Oxapampa",
        totalProperties: 208,
        acquiredProperties: 41,
        interferenceUniverse: 15,
        releasedInterferences: 6,
      },
      {
        name: "Caballococha",
        totalProperties: 607,
        acquiredProperties: 79,
        interferenceUniverse: 9,
        releasedInterferences: 6,
      },
      {
        name: "Breu",
        totalProperties: 3,
        acquiredProperties: 3,
        interferenceUniverse: 12,
        releasedInterferences: 11,
      },
    ],
  },
];

function sumProjects(projects: AirportProject[]) {
  return projects.reduce(
    (total, project) => ({
      totalProperties: total.totalProperties + project.totalProperties,
      acquiredProperties: total.acquiredProperties + project.acquiredProperties,
      interferenceUniverse: total.interferenceUniverse + project.interferenceUniverse,
      releasedInterferences: total.releasedInterferences + project.releasedInterferences,
    }),
    {
      totalProperties: 0,
      acquiredProperties: 0,
      interferenceUniverse: 0,
      releasedInterferences: 0,
    },
  );
}

const allProjects = airportGroups.flatMap((group) => group.projects);
const grandTotal = sumProjects(allProjects);

function percentage(value: number, total: number) {
  return total === 0 ? "0.00%" : `${((value / total) * 100).toFixed(2)}%`;
}

function pendingProperties(project: AirportProject) {
  return project.totalProperties - project.acquiredProperties;
}

function pendingInterferences(project: AirportProject) {
  return project.interferenceUniverse - project.releasedInterferences;
}

function propertyRegimeBreakdown(project: AirportProject) {
  const stateProperties = project.stateProperties ?? 0;
  const privateProperties = project.privateProperties ?? project.totalProperties - stateProperties;
  return { privateProperties, stateProperties };
}

function acquisitionMethodBreakdown(project: AirportProject): AcquisitionBreakdownRow[] {
  if (project.acquisitionBreakdown) return project.acquisitionBreakdown;
  const { privateProperties, stateProperties } = propertyRegimeBreakdown(project);
  return [
    {
      regime: "Privado",
      method: "Trato directo",
      detail: "Adquisición voluntaria",
      total: 0,
      completed: 0,
    },
    {
      regime: "Privado",
      method: "Expropiación",
      detail: "Adquisición forzosa",
      total: 0,
      completed: 0,
    },
    {
      regime: "Privado",
      method: "Liberación en bloque",
      detail: "Procedimiento alternativo",
      total: 0,
      completed: 0,
    },
    {
      regime: "Privado",
      method: "Sin desagregar en la fuente",
      detail: "Pendiente de clasificación por modalidad",
      total: privateProperties,
      completed: project.acquiredProperties,
      unclassified: true,
    },
    {
      regime: "Estatal",
      method: "Transferencia de propiedad",
      detail: "Transferencia interestatal",
      total: stateProperties,
      completed: 0,
    },
    {
      regime: "Estatal",
      method: "Otro derecho real",
      detail: "Otorgamiento de uso u otro derecho",
      total: 0,
      completed: 0,
    },
  ];
}

function progressTone(value: number) {
  if (value >= 80) return "bg-emerald-50 text-emerald-700";
  if (value >= 60) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

async function exportExcel(period: ReportPeriod) {
  const periodLabel = period === "TODOS" ? "Todos" : period;
  const headers = [
    "Proyecto / grupo",
    "Proyecto",
    "Total de predios",
    "Predios adquiridos",
    "Total pendientes",
    "% avance predial",
    "Universo de interferencias",
    "Interferencias liberadas y/o no son interferencia",
    "Pendientes",
    "% avance interferencias",
  ];
  const data: SheetData = [
    headers.map((header) => ({
      value: header,
      fontWeight: "bold",
      backgroundColor: "#111827",
      textColor: "#FFFFFF",
      align: "center",
      wrap: true,
      height: 30,
    })),
  ];

  airportGroups.forEach((group) => {
    group.projects.forEach((project) => {
      data.push([
        { value: group.name, type: String },
        { value: project.name, type: String, fontWeight: "bold" },
        { value: project.totalProperties, type: Number, format: "#,##0", align: "right" },
        {
          value: project.acquiredProperties,
          type: Number,
          format: "#,##0",
          align: "right",
          textColor: "#047857",
        },
        {
          value: pendingProperties(project),
          type: Number,
          format: "#,##0",
          align: "right",
          textColor: "#B91C1C",
        },
        {
          value: project.acquiredProperties / project.totalProperties,
          type: Number,
          format: "0.00%",
          align: "right",
        },
        { value: project.interferenceUniverse, type: Number, format: "#,##0", align: "right" },
        {
          value: project.releasedInterferences,
          type: Number,
          format: "#,##0",
          align: "right",
          textColor: "#1D4ED8",
        },
        {
          value: pendingInterferences(project),
          type: Number,
          format: "#,##0",
          align: "right",
          textColor: "#B91C1C",
        },
        {
          value: project.releasedInterferences / project.interferenceUniverse,
          type: Number,
          format: "0.00%",
          align: "right",
        },
      ]);
    });

    const subtotal = sumProjects(group.projects);
    data.push(buildExcelTotalRow(group.subtotalLabel, subtotal, "#E2E8F0", "#0F172A"));
  });

  data.push(buildExcelTotalRow("SUMA TOTAL", grandTotal, "#111827", "#FFFFFF"));

  await writeExcelFile([
    {
      data,
      sheet: `Reporte ${periodLabel}`,
      stickyRowsCount: 1,
      orientation: "landscape",
      showGridLines: true,
      columns: [
        { width: 25 },
        { width: 24 },
        { width: 15 },
        { width: 17 },
        { width: 16 },
        { width: 15 },
        { width: 20 },
        { width: 29 },
        { width: 14 },
        { width: 18 },
      ],
    },
  ]).toFile(
    `reporte_general_alta_gerencia_${periodLabel.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}

function buildExcelTotalRow(
  label: string,
  total: ReturnType<typeof sumProjects>,
  backgroundColor: string,
  textColor: string,
): SheetData[number] {
  const common = { fontWeight: "bold" as const, backgroundColor, textColor };
  return [
    { value: label, type: String, ...common },
    { value: "", type: String, ...common },
    { value: total.totalProperties, type: Number, format: "#,##0", ...common },
    { value: total.acquiredProperties, type: Number, format: "#,##0", ...common },
    {
      value: total.totalProperties - total.acquiredProperties,
      type: Number,
      format: "#,##0",
      ...common,
    },
    {
      value: total.acquiredProperties / total.totalProperties,
      type: Number,
      format: "0.00%",
      ...common,
    },
    { value: total.interferenceUniverse, type: Number, format: "#,##0", ...common },
    { value: total.releasedInterferences, type: Number, format: "#,##0", ...common },
    {
      value: total.interferenceUniverse - total.releasedInterferences,
      type: Number,
      format: "#,##0",
      ...common,
    },
    {
      value: total.releasedInterferences / total.interferenceUniverse,
      type: Number,
      format: "0.00%",
      ...common,
    },
  ];
}

function ExecutiveAirportReportPage() {
  const [selectedProject, setSelectedProject] = useState<SelectedAirportProject | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("TODOS");
  const acquisitionProgress = (grandTotal.acquiredProperties / grandTotal.totalProperties) * 100;
  const interferenceProgress =
    (grandTotal.releasedInterferences / grandTotal.interferenceUniverse) * 100;

  return (
    <div className="flex min-h-screen bg-slate-100 print:block print:bg-white">
      <div className="flex print:hidden">
        <AppSidebar />
      </div>
      <main className="min-w-0 flex-1 overflow-auto p-3 lg:p-4 print:overflow-visible print:p-0">
        <header className="mb-3 flex flex-wrap items-start justify-between gap-3 print:mb-3">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 print:hidden">
              <BarChart3 size={18} />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">
                Alta gerencia · Reporte general
              </div>
              <h1 className="mt-0.5 text-lg font-bold text-slate-900 lg:text-xl">
                Avance aeroportuario
              </h1>
              <p className="mt-1 max-w-3xl text-[12px] text-slate-500">
                Consolidado de adquisiciones prediales y liberación de interferencias por proyecto y
                grupo aeroportuario.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <label className="flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 text-[11px] font-semibold text-slate-600">
              <CalendarDays size={14} className="text-red-600" />
              <span>Periodo</span>
              <select
                value={selectedPeriod}
                onChange={(event) => {
                  setSelectedPeriod(event.target.value as ReportPeriod);
                  setSelectedProject(null);
                }}
                className="h-7 rounded border-0 bg-slate-100 px-2 text-[12px] font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Seleccionar periodo del reporte"
              >
                <option value="TODOS">Todos</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => void exportExcel(selectedPeriod)}
              disabled={selectedPeriod === "2025"}
              title={
                selectedPeriod !== "2025"
                  ? `Exportar el reporte del periodo ${selectedPeriod === "TODOS" ? "completo" : selectedPeriod}`
                  : "No hay información cargada para el periodo 2025"
              }
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileSpreadsheet size={14} /> Exportar Excel
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-red-600 px-3 text-[12px] font-semibold text-white hover:bg-red-700"
            >
              <Printer size={14} /> Imprimir
            </button>
          </div>
        </header>

        {selectedPeriod !== "2025" ? (
          <>
            <section className="mb-3 grid grid-cols-2 gap-2 xl:grid-cols-4 print:grid-cols-4">
              <ExecutiveKpi
                label="Total de predios"
                value={grandTotal.totalProperties.toLocaleString("es-PE")}
                detail="Universo privado"
              />
              <ExecutiveKpi
                label="Predios adquiridos"
                value={grandTotal.acquiredProperties.toLocaleString("es-PE")}
                detail={`${percentage(grandTotal.acquiredProperties, grandTotal.totalProperties)} de avance`}
                tone="green"
              />
              <ExecutiveKpi
                label="Interferencias liberadas"
                value={grandTotal.releasedInterferences.toLocaleString("es-PE")}
                detail={`${percentage(grandTotal.releasedInterferences, grandTotal.interferenceUniverse)} de avance`}
                tone="blue"
              />
              <ExecutiveKpi
                label="Pendientes críticos"
                value={(grandTotal.totalProperties - grandTotal.acquiredProperties).toLocaleString(
                  "es-PE",
                )}
                detail={`${(grandTotal.interferenceUniverse - grandTotal.releasedInterferences).toLocaleString("es-PE")} interferencias pendientes`}
                tone="red"
              />
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm print:rounded-none print:shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
                <div>
                  <h2 className="text-[14px] font-bold text-slate-900">
                    Matriz consolidada de avance aeroportuario
                  </h2>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Periodo:{" "}
                    {selectedPeriod === "TODOS"
                      ? "Todos (información disponible 2026)"
                      : selectedPeriod}{" "}
                    · Valores expresados en número de predios e interferencias.
                  </p>
                </div>
                <div className="flex gap-4 text-[10px] text-slate-600">
                  <ProgressLegend label="Avance predial" value={acquisitionProgress} />
                  <ProgressLegend label="Interferencias" value={interferenceProgress} />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px] border-collapse text-[10px] text-slate-800">
                  <thead className="text-white">
                    <tr className="bg-slate-950">
                      <th rowSpan={2} className="w-36 border border-slate-600 px-2 py-2 text-left">
                        Proyecto / grupo
                      </th>
                      <th rowSpan={2} className="w-44 border border-slate-600 px-2 py-2 text-left">
                        Proyectos
                      </th>
                      <th colSpan={4} className="border border-slate-600 px-3 py-2 text-center">
                        Avance de las adquisiciones prediales
                      </th>
                      <th colSpan={4} className="border border-slate-600 px-3 py-2 text-center">
                        Avance de la liberación de interferencias
                      </th>
                    </tr>
                    <tr className="bg-slate-800 text-[10px] leading-tight">
                      <th className="border border-slate-600 px-2 py-1.5">Total de predios</th>
                      <th className="border border-slate-600 px-2 py-1.5">Predios adquiridos</th>
                      <th className="border border-slate-600 px-2 py-1.5">Total pendientes</th>
                      <th className="border border-slate-600 px-2 py-1.5">% avance</th>
                      <th className="border border-slate-600 px-2 py-1.5">
                        Universo de interferencias
                      </th>
                      <th className="border border-slate-600 px-2 py-1.5">
                        Liberadas y/o no son interferencia
                      </th>
                      <th className="border border-slate-600 px-2 py-1.5">Pendientes</th>
                      <th className="border border-slate-600 px-2 py-1.5">% avance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {airportGroups.map((group) => {
                      const subtotal = sumProjects(group.projects);
                      return (
                        <GroupRows
                          key={group.name}
                          group={group}
                          subtotal={subtotal}
                          onSelectProject={(project) =>
                            setSelectedProject({ groupName: group.name, project })
                          }
                        />
                      );
                    })}
                    <tr className="bg-slate-950 font-bold text-white">
                      <td
                        colSpan={2}
                        className="border border-slate-600 px-3 py-2 text-center uppercase"
                      >
                        Suma total
                      </td>
                      <TotalCells total={grandTotal} dark />
                    </tr>
                  </tbody>
                </table>
              </div>

              <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2 text-[9px] text-slate-500">
                <span>* Universo de predios privados.</span>
                <span>
                  Total: {grandTotal.totalProperties.toLocaleString("es-PE")} predios ·{" "}
                  {grandTotal.interferenceUniverse.toLocaleString("es-PE")} interferencias
                </span>
              </footer>
            </section>
          </>
        ) : (
          <section className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <div className="max-w-md">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <CalendarDays size={22} />
              </div>
              <h2 className="mt-4 text-base font-bold text-slate-900">
                Sin información cargada para 2025
              </h2>
              <p className="mt-2 text-[12px] leading-5 text-slate-500">
                Por el momento, la matriz aeroportuaria y sus indicadores corresponden al periodo
                2026. Los datos de 2025 se mostrarán cuando sean incorporados.
              </p>
              <button
                type="button"
                onClick={() => setSelectedPeriod("2026")}
                className="mt-4 rounded-md bg-red-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-red-700"
              >
                Ver información 2026
              </button>
            </div>
          </section>
        )}
      </main>
      {selectedProject && (
        <ProjectDetailModal selected={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}

function GroupRows({
  group,
  subtotal,
  onSelectProject,
}: {
  group: AirportGroup;
  subtotal: ReturnType<typeof sumProjects>;
  onSelectProject: (project: AirportProject) => void;
}) {
  return (
    <>
      {group.projects.map((project, index) => {
        const acquisitionProgress = (project.acquiredProperties / project.totalProperties) * 100;
        const interferenceProgress =
          (project.releasedInterferences / project.interferenceUniverse) * 100;
        return (
          <tr
            key={`${group.name}-${project.name}`}
            className="odd:bg-white even:bg-slate-50/70 hover:bg-red-50/60"
          >
            {index === 0 && (
              <th
                rowSpan={group.projects.length + 1}
                scope="rowgroup"
                className="border border-slate-300 bg-slate-900 px-2 py-1 text-left text-[10px] font-bold uppercase text-white"
              >
                {group.name}
              </th>
            )}
            <th scope="row" className="border border-slate-300 px-2 py-1 text-left font-semibold">
              <button
                type="button"
                onClick={() => onSelectProject(project)}
                className="group flex w-full items-center justify-between gap-2 text-left hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                title={`Ver detalle ejecutivo de ${project.name}`}
              >
                <span>{project.name}</span>
                <Eye
                  size={13}
                  className="shrink-0 text-slate-400 opacity-30 transition-opacity group-hover:text-red-600 group-hover:opacity-100"
                />
              </button>
            </th>
            <td className="border border-slate-300 px-1.5 py-1 text-center tabular-nums">
              {project.totalProperties.toLocaleString("es-PE")}
            </td>
            <td
              className="border border-slate-300 bg-emerald-50/50 px-1.5 py-1 text-center font-bold tabular-nums text-emerald-700"
              title="Predios adquiridos"
            >
              {project.acquiredProperties.toLocaleString("es-PE")}
            </td>
            <td
              className={`border border-slate-300 px-1.5 py-1 text-center font-bold tabular-nums ${pendingProperties(project) > 0 ? "bg-red-50/70 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
              title="Predios pendientes"
            >
              {pendingProperties(project).toLocaleString("es-PE")}
            </td>
            <td className="border border-slate-300 px-1.5 py-1 text-center">
              <span
                className={`inline-flex rounded px-1.5 py-0 font-bold ${progressTone(acquisitionProgress)}`}
              >
                {percentage(project.acquiredProperties, project.totalProperties)}
              </span>
            </td>
            <td className="border border-slate-300 px-1.5 py-1 text-center tabular-nums">
              {project.interferenceUniverse.toLocaleString("es-PE")}
            </td>
            <td
              className="border border-slate-300 bg-blue-50/60 px-1.5 py-1 text-center font-bold tabular-nums text-blue-700"
              title="Interferencias liberadas"
            >
              {project.releasedInterferences.toLocaleString("es-PE")}
            </td>
            <td
              className={`border border-slate-300 px-1.5 py-1 text-center font-bold tabular-nums ${pendingInterferences(project) > 0 ? "bg-red-50/70 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
              title="Interferencias pendientes"
            >
              {pendingInterferences(project).toLocaleString("es-PE")}
            </td>
            <td className="border border-slate-300 px-1.5 py-1 text-center">
              <span
                className={`inline-flex rounded px-1.5 py-0 font-bold ${progressTone(interferenceProgress)}`}
              >
                {percentage(project.releasedInterferences, project.interferenceUniverse)}
              </span>
            </td>
          </tr>
        );
      })}
      <tr className="bg-slate-200 font-bold text-slate-950">
        <th className="border border-slate-400 px-2 py-1 text-left uppercase">
          {group.subtotalLabel}
        </th>
        <TotalCells total={subtotal} />
      </tr>
    </>
  );
}

function ProjectDetailModal({
  selected,
  onClose,
}: {
  selected: SelectedAirportProject;
  onClose: () => void;
}) {
  const { project, groupName } = selected;
  const propertyPending = pendingProperties(project);
  const interferencePending = pendingInterferences(project);
  const propertyRegime = propertyRegimeBreakdown(project);
  const acquisitionProgress = (project.acquiredProperties / project.totalProperties) * 100;
  const interferenceProgress = (project.releasedInterferences / project.interferenceUniverse) * 100;
  const needsAttention = acquisitionProgress < 60 || interferenceProgress < 60;
  const recommendation =
    acquisitionProgress < 60
      ? "Priorizar la revisión de expedientes y la estrategia de adquisición de los predios pendientes."
      : interferenceProgress < 60
        ? "Concentrar la coordinación con titulares de servicios para acelerar la liberación de interferencias."
        : propertyPending > 0 || interferencePending > 0
          ? "Mantener el seguimiento semanal hasta cerrar las brechas pendientes."
          : "El proyecto no presenta brechas pendientes; mantener el control de cierre y actualización.";

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[1px] print:hidden"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="airport-project-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-300">
              Detalle ejecutivo · {groupName}
            </div>
            <h2 id="airport-project-detail-title" className="mt-1 text-xl font-bold">
              {project.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="rounded-md p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </header>

        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto p-5">
          <div
            className={`mb-4 flex items-start gap-3 rounded-lg border p-3 ${needsAttention ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}
          >
            {needsAttention ? (
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            )}
            <div>
              <div className="text-[12px] font-bold">
                {needsAttention ? "Requiere atención de la coordinación" : "Avance favorable"}
              </div>
              <p className="mt-0.5 text-[11px] leading-5">{recommendation}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <DetailMetric label="Total de predios" value={project.totalProperties} />
            <DetailMetric
              label="Predios adquiridos"
              value={project.acquiredProperties}
              tone="green"
            />
            <DetailMetric label="Predios pendientes" value={propertyPending} tone="red" />
            <DetailMetric label="Universo de interferencias" value={project.interferenceUniverse} />
            <DetailMetric
              label="Interferencias liberadas"
              value={project.releasedInterferences}
              tone="blue"
            />
            <DetailMetric
              label="Interferencias pendientes"
              value={interferencePending}
              tone="red"
            />
          </div>

          <PropertyRegimeSummary
            total={project.totalProperties}
            privateProperties={propertyRegime.privateProperties}
            stateProperties={propertyRegime.stateProperties}
          />
          <AcquisitionMethodTable project={project} />

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DetailProgress
              label="Avance de adquisiciones prediales"
              value={acquisitionProgress}
              completed={project.acquiredProperties}
              pending={propertyPending}
            />
            <DetailProgress
              label="Avance de liberación de interferencias"
              value={interferenceProgress}
              completed={project.releasedInterferences}
              pending={interferencePending}
            />
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-[12px] font-bold text-slate-800">Lectura para alta gerencia</h3>
            <ul className="mt-2 space-y-2 text-[11px] leading-5 text-slate-600">
              <li className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-red-600" />
                Se adquirieron {project.acquiredProperties.toLocaleString("es-PE")} de{" "}
                {project.totalProperties.toLocaleString("es-PE")} predios; quedan{" "}
                {propertyPending.toLocaleString("es-PE")} pendientes.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-600" />
                Se liberaron {project.releasedInterferences.toLocaleString("es-PE")} de{" "}
                {project.interferenceUniverse.toLocaleString("es-PE")} interferencias; quedan{" "}
                {interferencePending.toLocaleString("es-PE")} pendientes.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function PropertyRegimeSummary({
  total,
  privateProperties,
  stateProperties,
}: {
  total: number;
  privateProperties: number;
  stateProperties: number;
}) {
  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[11px] font-bold text-slate-800">
            Disponibilidad por tipo de predio
          </h3>
          <p className="mt-0.5 text-[9px] text-slate-500">
            Clasificación de referencia conforme al D. Leg. 1192.
          </p>
        </div>
        <span className="rounded-full bg-white px-2 py-1 text-[9px] font-semibold text-slate-500 shadow-sm">
          Universo: {total.toLocaleString("es-PE")}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <article className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                <House size={16} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                  Predios privados
                </div>
                <div className="mt-0.5 text-[9px] text-emerald-700">Universo registrado</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold tabular-nums text-emerald-700">
                {privateProperties.toLocaleString("es-PE")}
              </div>
              <div className="text-[9px] font-semibold text-emerald-700">
                {percentage(privateProperties, total)}
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-emerald-200 pt-2 text-[9px] leading-4 text-emerald-900">
            <div>
              <b className="block">Forma de obtención</b>
              Adquisición, expropiación o liberación en bloque.
            </div>
            <div>
              <b className="block">Personas vinculadas</b>
              Sujeto pasivo, propietario u ocupante/poseedor.
            </div>
          </div>
        </article>

        <article className="rounded-lg border border-blue-200 bg-blue-50/70 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                <Landmark size={16} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-blue-800">
                  Predios estatales
                </div>
                <div className="mt-0.5 text-[9px] text-blue-700">
                  {stateProperties === 0 ? "Sin registros en esta fuente" : "Universo registrado"}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold tabular-nums text-blue-700">
                {stateProperties.toLocaleString("es-PE")}
              </div>
              <div className="text-[9px] font-semibold text-blue-700">
                {percentage(stateProperties, total)}
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-blue-200 pt-2 text-[9px] leading-4 text-blue-900">
            <div>
              <b className="block">Tipo de predio</b>
              Dominio público, privado o empresa del Estado.
            </div>
            <div>
              <b className="block">Forma de obtención</b>
              Transferencia u otorgamiento de otro derecho real.
            </div>
          </div>
        </article>
      </div>

      <p className="mt-2 text-[9px] leading-4 text-slate-500">
        La fuente 2026 declara un universo de predios privados; por ello los estatales se muestran
        separados, sin asignarles valores no registrados.
      </p>
    </section>
  );
}

function AcquisitionMethodTable({ project }: { project: AirportProject }) {
  const rows = acquisitionMethodBreakdown(project);
  return (
    <section className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200 px-3 py-2.5">
        <div>
          <h3 className="text-[11px] font-bold text-slate-800">Detalle por forma de obtención</h3>
          <p className="mt-0.5 text-[9px] text-slate-500">
            Desagregación de predios privados y estatales por procedimiento.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-600">
          D. Leg. 1192
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-[9px]">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="border-r border-slate-600 px-2 py-2 text-left">Tipo de predio</th>
              <th className="border-r border-slate-600 px-2 py-2 text-left">Forma de obtención</th>
              <th className="border-r border-slate-600 px-2 py-2 text-left">Detalle</th>
              <th className="border-r border-slate-600 px-2 py-2 text-right">Universo</th>
              <th className="border-r border-slate-600 px-2 py-2 text-right">Culminados</th>
              <th className="border-r border-slate-600 px-2 py-2 text-right">Pendientes</th>
              <th className="px-2 py-2 text-right">Avance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const pending = Math.max(row.total - row.completed, 0);
              return (
                <tr
                  key={`${row.regime}-${row.method}`}
                  className={row.unclassified ? "bg-amber-50" : "odd:bg-white even:bg-slate-50"}
                >
                  <td className="border border-slate-200 px-2 py-1.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 font-bold ${row.regime === "Privado" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}
                    >
                      {row.regime}
                    </span>
                  </td>
                  <th
                    scope="row"
                    className={`border border-slate-200 px-2 py-1.5 text-left ${row.unclassified ? "font-bold text-amber-800" : "font-semibold text-slate-700"}`}
                  >
                    {row.method}
                  </th>
                  <td className="border border-slate-200 px-2 py-1.5 text-slate-500">
                    {row.detail}
                  </td>
                  <td className="border border-slate-200 px-2 py-1.5 text-right font-semibold tabular-nums">
                    {row.total.toLocaleString("es-PE")}
                  </td>
                  <td className="border border-slate-200 px-2 py-1.5 text-right font-bold tabular-nums text-emerald-700">
                    {row.completed.toLocaleString("es-PE")}
                  </td>
                  <td className="border border-slate-200 px-2 py-1.5 text-right font-bold tabular-nums text-red-700">
                    {pending.toLocaleString("es-PE")}
                  </td>
                  <td className="border border-slate-200 px-2 py-1.5 text-right font-bold tabular-nums">
                    {row.total > 0 ? percentage(row.completed, row.total) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-900 font-bold text-white">
            <tr>
              <td colSpan={3} className="border border-slate-700 px-2 py-1.5 text-right uppercase">
                Total del proyecto
              </td>
              <td className="border border-slate-700 px-2 py-1.5 text-right tabular-nums">
                {project.totalProperties.toLocaleString("es-PE")}
              </td>
              <td className="border border-slate-700 px-2 py-1.5 text-right tabular-nums">
                {project.acquiredProperties.toLocaleString("es-PE")}
              </td>
              <td className="border border-slate-700 px-2 py-1.5 text-right tabular-nums">
                {pendingProperties(project).toLocaleString("es-PE")}
              </td>
              <td className="border border-slate-700 px-2 py-1.5 text-right tabular-nums">
                {percentage(project.acquiredProperties, project.totalProperties)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex items-start gap-2 border-t border-amber-200 bg-amber-50 px-3 py-2 text-[9px] leading-4 text-amber-800">
        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
        <span>
          La fuente consolidada no separa todavía las cantidades de trato directo, expropiación y
          liberación en bloque. Los valores se mantienen en “Sin desagregar” hasta incorporar la
          fuente detallada.
        </span>
      </div>
    </section>
  );
}

function DetailMetric({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "slate" | "green" | "blue" | "red";
}) {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-900",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };
  return (
    <div className={`rounded-lg border p-3 ${tones[tone]}`}>
      <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value.toLocaleString("es-PE")}</div>
    </div>
  );
}

function DetailProgress({
  label,
  value,
  completed,
  pending,
}: {
  label: string;
  value: number;
  completed: number;
  pending: number;
}) {
  const barColor = value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-amber-500" : "bg-red-600";
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div className="text-[11px] font-semibold text-slate-700">{label}</div>
        <div className="text-lg font-bold tabular-nums text-slate-900">{value.toFixed(2)}%</div>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${value}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
        <span>{completed.toLocaleString("es-PE")} completados</span>
        <span className={pending > 0 ? "font-semibold text-red-600" : "text-emerald-600"}>
          {pending.toLocaleString("es-PE")} pendientes
        </span>
      </div>
    </div>
  );
}

function TotalCells({
  total,
  dark = false,
}: {
  total: ReturnType<typeof sumProjects>;
  dark?: boolean;
}) {
  const cellClass = dark
    ? "border border-slate-600 px-1.5 py-1.5 text-center tabular-nums"
    : "border border-slate-400 px-1.5 py-1 text-center tabular-nums";
  return (
    <>
      <td className={cellClass}>{total.totalProperties.toLocaleString("es-PE")}</td>
      <td className={cellClass}>{total.acquiredProperties.toLocaleString("es-PE")}</td>
      <td className={cellClass}>
        {(total.totalProperties - total.acquiredProperties).toLocaleString("es-PE")}
      </td>
      <td className={cellClass}>{percentage(total.acquiredProperties, total.totalProperties)}</td>
      <td className={cellClass}>{total.interferenceUniverse.toLocaleString("es-PE")}</td>
      <td className={cellClass}>{total.releasedInterferences.toLocaleString("es-PE")}</td>
      <td className={cellClass}>
        {(total.interferenceUniverse - total.releasedInterferences).toLocaleString("es-PE")}
      </td>
      <td className={cellClass}>
        {percentage(total.releasedInterferences, total.interferenceUniverse)}
      </td>
    </>
  );
}

function ExecutiveKpi({
  label,
  value,
  detail,
  tone = "slate",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "slate" | "green" | "blue" | "red";
}) {
  const tones = {
    slate: "border-slate-300 text-slate-900",
    green: "border-emerald-400 text-emerald-700",
    blue: "border-blue-400 text-blue-700",
    red: "border-red-400 text-red-700",
  };
  return (
    <article className={`rounded-lg border-l-4 bg-white p-2.5 shadow-sm ${tones[tone]}`}>
      <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 text-xl font-bold tabular-nums">{value}</div>
      <div className="mt-0.5 text-[9px] text-slate-500">{detail}</div>
    </article>
  );
}

function ProgressLegend({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-28">
      <div className="mb-1 flex justify-between gap-3">
        <span>{label}</span>
        <b>{value.toFixed(2)}%</b>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-red-600" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
