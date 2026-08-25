import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Clock3,
  FileSpreadsheet,
  Landmark,
  MapPin,
  Search,
  UserRound,
  WalletCards,
} from "lucide-react";
import writeExcelFile, { type SheetData } from "write-excel-file/browser";

import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/seguimiento-monitoreo/presupuestal-predio")({
  head: () => ({ meta: [{ title: "Seguimiento Presupuestal por Predio" }] }),
  component: SeguimientoPresupuestalPredioPage,
});

type BudgetState =
  "Sin presupuesto" | "Presupuesto insuficiente" | "Certificado" | "En ejecución" | "Pagado";

type BudgetMovement = {
  date: string;
  siafFile: string;
  classifier: string;
  document: string;
  certification: number;
  commitment: number;
  accrued: number;
  drawn: number;
  paid: number;
  state: string;
};

type PredioBudget = {
  projectId: string;
  code: string;
  file: string;
  owner: string;
  identity: string;
  location: string;
  sector: string;
  section: string;
  affectedArea: number;
  propertyState: string;
  currentStage: string;
  updatedAt: string;
  appraisal: number;
  compensation: number;
  improvements: number;
  otherConcepts: number;
  certification: number;
  annualCommitment: number;
  monthlyCommitment: number;
  accrued: number;
  drawn: number;
  paid: number;
  lastMovement: string;
  movements: BudgetMovement[];
};

type ProjectBudget = {
  id: string;
  name: string;
  cui: string;
  executingUnit: string;
  fiscalYear: string;
  meta: string;
  functionalSequence: string;
  fundingSource: string;
  item: string;
  pia: number;
  pim: number;
};

const projects: ProjectBudget[] = [
  {
    id: "iquitos",
    name: "Mejoramiento y ampliación del Aeropuerto de Iquitos",
    cui: "2457896",
    executingUnit: "001 – Administración General MTC",
    fiscalYear: "2026",
    meta: "0045",
    functionalSequence: "0123",
    fundingSource: "1 – Recursos Ordinarios",
    item: "00 – Recursos Ordinarios",
    pia: 10_000_000,
    pim: 12_500_000,
  },
  {
    id: "jauja",
    name: "Mejoramiento y ampliación del Aeropuerto de Jauja",
    cui: "2233850",
    executingUnit: "020 – Provías Nacional",
    fiscalYear: "2026",
    meta: "0061",
    functionalSequence: "0187",
    fundingSource: "1 – Recursos Ordinarios",
    item: "00 – Recursos Ordinarios",
    pia: 8_400_000,
    pim: 9_800_000,
  },
];

const predios: PredioBudget[] = [
  {
    projectId: "iquitos",
    code: "AERO-IQT-PR-000125",
    file: "EXP-IQT-0125-2026",
    owner: "Juan Pérez Quispe",
    identity: "DNI 40851247",
    location: "Loreto / Maynas / San Juan Bautista",
    sector: "Sector Este",
    section: "Tramo 1",
    affectedArea: 1250.45,
    propertyState: "En proceso",
    currentStage: "Pago",
    updatedAt: "05/04/2026 16:40",
    appraisal: 150_000,
    compensation: 20_000,
    improvements: 5_000,
    otherConcepts: 2_000,
    certification: 177_000,
    annualCommitment: 177_000,
    monthlyCommitment: 177_000,
    accrued: 177_000,
    drawn: 170_000,
    paid: 150_000,
    lastMovement: "Pago 425 · 05/04/2026",
    movements: [
      {
        date: "05/03/2026",
        siafFile: "3256",
        classifier: "2.6.8.1.4.2",
        document: "Cert. 125",
        certification: 177_000,
        commitment: 0,
        accrued: 0,
        drawn: 0,
        paid: 0,
        state: "Certificado",
      },
      {
        date: "15/03/2026",
        siafFile: "3587",
        classifier: "2.6.8.1.4.2",
        document: "Comp. 208",
        certification: 0,
        commitment: 177_000,
        accrued: 0,
        drawn: 0,
        paid: 0,
        state: "Comprometido",
      },
      {
        date: "25/03/2026",
        siafFile: "4125",
        classifier: "2.6.8.1.4.2",
        document: "Dev. 350",
        certification: 0,
        commitment: 0,
        accrued: 177_000,
        drawn: 0,
        paid: 0,
        state: "Devengado",
      },
      {
        date: "02/04/2026",
        siafFile: "4350",
        classifier: "2.6.8.1.4.2",
        document: "Girado 401",
        certification: 0,
        commitment: 0,
        accrued: 0,
        drawn: 170_000,
        paid: 0,
        state: "Girado",
      },
      {
        date: "05/04/2026",
        siafFile: "4401",
        classifier: "2.6.8.1.4.2",
        document: "Pago 425",
        certification: 0,
        commitment: 0,
        accrued: 0,
        drawn: 0,
        paid: 150_000,
        state: "Pagado parcial",
      },
    ],
  },
  {
    projectId: "iquitos",
    code: "AERO-IQT-PR-000126",
    file: "EXP-IQT-0126-2026",
    owner: "Rosa Elena Salazar Vela",
    identity: "DNI 05281469",
    location: "Loreto / Maynas / San Juan Bautista",
    sector: "Sector Este",
    section: "Tramo 1",
    affectedArea: 840.2,
    propertyState: "Pagado",
    currentStage: "Entrega de posesión",
    updatedAt: "18/05/2026 11:12",
    appraisal: 116_000,
    compensation: 14_500,
    improvements: 7_500,
    otherConcepts: 0,
    certification: 138_000,
    annualCommitment: 138_000,
    monthlyCommitment: 138_000,
    accrued: 138_000,
    drawn: 138_000,
    paid: 138_000,
    lastMovement: "Pago 771 · 18/05/2026",
    movements: makeMovements("0045", 138_000, "5260"),
  },
  {
    projectId: "iquitos",
    code: "AERO-IQT-PR-000127",
    file: "EXP-IQT-0127-2026",
    owner: "Inversiones Amazónicas S.A.C.",
    identity: "RUC 20541278963",
    location: "Loreto / Maynas / Iquitos",
    sector: "Sector Norte",
    section: "Tramo 2",
    affectedArea: 2185.7,
    propertyState: "Observado",
    currentStage: "Certificación",
    updatedAt: "21/05/2026 09:08",
    appraisal: 245_000,
    compensation: 32_000,
    improvements: 18_000,
    otherConcepts: 5_000,
    certification: 240_000,
    annualCommitment: 0,
    monthlyCommitment: 0,
    accrued: 0,
    drawn: 0,
    paid: 0,
    lastMovement: "Cert. 388 · 20/05/2026",
    movements: [
      {
        date: "20/05/2026",
        siafFile: "5874",
        classifier: "2.6.8.1.4.2",
        document: "Cert. 388",
        certification: 240_000,
        commitment: 0,
        accrued: 0,
        drawn: 0,
        paid: 0,
        state: "Observado",
      },
    ],
  },
  {
    projectId: "iquitos",
    code: "AERO-IQT-PR-000128",
    file: "EXP-IQT-0128-2026",
    owner: "Comunidad Campesina San Juan",
    identity: "RUC 20178645219",
    location: "Loreto / Maynas / San Juan Bautista",
    sector: "Sector Sur",
    section: "Tramo 2",
    affectedArea: 3240,
    propertyState: "Pendiente",
    currentStage: "Tasación",
    updatedAt: "25/05/2026 15:30",
    appraisal: 320_000,
    compensation: 40_000,
    improvements: 15_000,
    otherConcepts: 4_500,
    certification: 0,
    annualCommitment: 0,
    monthlyCommitment: 0,
    accrued: 0,
    drawn: 0,
    paid: 0,
    lastMovement: "Sin movimiento SIAF",
    movements: [],
  },
  {
    projectId: "jauja",
    code: "AERO-JAUJA-PR-00245-A",
    file: "EXP-JAUJA-0245A",
    owner: "María Elena Rojas Huamán",
    identity: "DNI 42581736",
    location: "Junín / Jauja / Sausa",
    sector: "Sector Oeste",
    section: "Tramo 1",
    affectedArea: 978.55,
    propertyState: "En proceso",
    currentStage: "Devengado",
    updatedAt: "12/06/2026 10:20",
    appraisal: 185_000,
    compensation: 25_000,
    improvements: 12_000,
    otherConcepts: 3_000,
    certification: 225_000,
    annualCommitment: 225_000,
    monthlyCommitment: 225_000,
    accrued: 225_000,
    drawn: 0,
    paid: 0,
    lastMovement: "Dev. 612 · 12/06/2026",
    movements: makeMovements("0061", 225_000, "6402", false),
  },
  {
    projectId: "jauja",
    code: "AERO-JAUJA-PR-0056",
    file: "EXP-JAUJA-0056",
    owner: "Dirección Regional Agraria Junín",
    identity: "RUC 20145541253",
    location: "Junín / Jauja / Yauyos",
    sector: "Sector Norte",
    section: "Tramo 2",
    affectedArea: 4150.3,
    propertyState: "En proceso",
    currentStage: "Transferencia interestatal",
    updatedAt: "03/07/2026 08:55",
    appraisal: 0,
    compensation: 0,
    improvements: 42_000,
    otherConcepts: 8_000,
    certification: 50_000,
    annualCommitment: 50_000,
    monthlyCommitment: 50_000,
    accrued: 25_000,
    drawn: 25_000,
    paid: 25_000,
    lastMovement: "Pago 806 · 03/07/2026",
    movements: makeMovements("0061", 50_000, "7021"),
  },
];

function makeMovements(meta: string, amount: number, start: string, complete = true) {
  const base = Number(start);
  const rows: BudgetMovement[] = [
    {
      date: "06/05/2026",
      siafFile: String(base),
      classifier: "2.6.8.1.4.2",
      document: `Cert. ${meta}-01`,
      certification: amount,
      commitment: 0,
      accrued: 0,
      drawn: 0,
      paid: 0,
      state: "Certificado",
    },
    {
      date: "13/05/2026",
      siafFile: String(base + 21),
      classifier: "2.6.8.1.4.2",
      document: `Comp. ${meta}-02`,
      certification: 0,
      commitment: amount,
      accrued: 0,
      drawn: 0,
      paid: 0,
      state: "Comprometido",
    },
    {
      date: "20/05/2026",
      siafFile: String(base + 37),
      classifier: "2.6.8.1.4.2",
      document: `Dev. ${meta}-03`,
      certification: 0,
      commitment: 0,
      accrued: amount,
      drawn: 0,
      paid: 0,
      state: "Devengado",
    },
  ];
  if (complete) {
    rows.push(
      {
        date: "27/05/2026",
        siafFile: String(base + 52),
        classifier: "2.6.8.1.4.2",
        document: `Girado ${meta}-04`,
        certification: 0,
        commitment: 0,
        accrued: 0,
        drawn: amount,
        paid: 0,
        state: "Girado",
      },
      {
        date: "31/05/2026",
        siafFile: String(base + 64),
        classifier: "2.6.8.1.4.2",
        document: `Pago ${meta}-05`,
        certification: 0,
        commitment: 0,
        accrued: 0,
        drawn: 0,
        paid: amount,
        state: "Pagado",
      },
    );
  }
  return rows;
}

const moneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

function money(value: number) {
  return moneyFormatter.format(value);
}

function compactMoney(value: number) {
  if (value >= 1_000_000) return `S/ ${(value / 1_000_000).toFixed(1)} M`;
  return `S/ ${value.toLocaleString("es-PE", { maximumFractionDigits: 0 })}`;
}

function totalCost(predio: PredioBudget) {
  return predio.appraisal + predio.compensation + predio.improvements + predio.otherConcepts;
}

function budgetState(predio: PredioBudget): BudgetState {
  const cost = totalCost(predio);
  if (predio.certification <= 0) return "Sin presupuesto";
  if (predio.certification < cost) return "Presupuesto insuficiente";
  if (predio.paid >= cost && cost > 0) return "Pagado";
  if (predio.annualCommitment > 0 || predio.accrued > 0 || predio.drawn > 0) return "En ejecución";
  return "Certificado";
}

const stateStyles: Record<BudgetState, string> = {
  "Sin presupuesto": "border-red-200 bg-red-50 text-red-700",
  "Presupuesto insuficiente": "border-orange-200 bg-orange-50 text-orange-700",
  Certificado: "border-amber-200 bg-amber-50 text-amber-700",
  "En ejecución": "border-blue-200 bg-blue-50 text-blue-700",
  Pagado: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function SeguimientoPresupuestalPredioPage() {
  const [projectId, setProjectId] = useState(projects[0].id);
  const [selectedCode, setSelectedCode] = useState(predios[0].code);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [movementsOpen, setMovementsOpen] = useState(true);

  const project = projects.find((item) => item.id === projectId) ?? projects[0];
  const projectPredios = useMemo(
    () => predios.filter((item) => item.projectId === projectId),
    [projectId],
  );
  const selectedPredio =
    projectPredios.find((item) => item.code === selectedCode) ?? projectPredios[0];

  const filteredPredios = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-PE");
    if (!query) return projectPredios;
    return projectPredios.filter((item) =>
      [item.code, item.file, item.identity, item.owner, item.sector, item.section].some((value) =>
        value.toLocaleLowerCase("es-PE").includes(query),
      ),
    );
  }, [projectPredios, search]);

  const cost = totalCost(selectedPredio);
  const pending = Math.max(cost - selectedPredio.paid, 0);
  const paidAdvance = cost ? (selectedPredio.paid / cost) * 100 : 0;
  const accruedAdvance = cost ? (selectedPredio.accrued / cost) * 100 : 0;
  const state = budgetState(selectedPredio);

  const handleProjectChange = (nextProjectId: string) => {
    const firstPredio = predios.find((item) => item.projectId === nextProjectId);
    setProjectId(nextProjectId);
    if (firstPredio) setSelectedCode(firstPredio.code);
    setSearch("");
  };

  const selectPredio = (code: string) => {
    setSelectedCode(code);
    setSearch("");
    setSearchOpen(false);
    setMovementsOpen(true);
  };

  const exportMatrix = async () => {
    const rows: SheetData = [
      [
        "Proyecto",
        "CUI",
        "Meta",
        "Secuencia funcional",
        "Código predial",
        "Expediente predial",
        "PIA Meta",
        "PIM Meta",
        "Certificación predio",
        "Compromiso anual predio",
        "Compromiso mensual predio",
        "Devengado predio",
        "Girado predio",
        "Pagado predio",
        "Costo total predio",
        "Pendiente",
        "Avance financiero",
        "Estado",
        "Último movimiento",
      ].map((value) => ({
        value,
        fontWeight: "bold" as const,
        backgroundColor: "#1E293B",
        textColor: "#FFFFFF",
        wrap: true,
      })),
      [
        project.name,
        project.cui,
        project.meta,
        project.functionalSequence,
        selectedPredio.code,
        selectedPredio.file,
        project.pia,
        project.pim,
        selectedPredio.certification,
        selectedPredio.annualCommitment,
        selectedPredio.monthlyCommitment,
        selectedPredio.accrued,
        selectedPredio.drawn,
        selectedPredio.paid,
        cost,
        pending,
        paidAdvance / 100,
        state,
        selectedPredio.lastMovement,
      ].map((value, index) => ({
        value,
        type: typeof value === "number" ? Number : String,
        format: index === 16 ? "0.00%" : index >= 6 && index <= 15 ? "S/ #,##0.00" : undefined,
        wrap: true,
      })),
    ];
    const movementRows: SheetData = [
      [
        "Fecha",
        "Expediente SIAF",
        "Meta",
        "Clasificador",
        "Documento",
        "Certificación",
        "Compromiso",
        "Devengado",
        "Girado",
        "Pagado",
        "Estado",
      ].map((value) => ({
        value,
        fontWeight: "bold" as const,
        backgroundColor: "#991B1B",
        textColor: "#FFFFFF",
      })),
      ...selectedPredio.movements.map((item) =>
        [
          item.date,
          item.siafFile,
          project.meta,
          item.classifier,
          item.document,
          item.certification,
          item.commitment,
          item.accrued,
          item.drawn,
          item.paid,
          item.state,
        ].map((value, index) => ({
          value,
          type: typeof value === "number" ? Number : String,
          format: index >= 5 && index <= 9 ? "S/ #,##0.00" : undefined,
        })),
      ),
    ];
    await writeExcelFile([
      {
        sheet: "Resumen predio",
        data: rows,
        stickyRowsCount: 1,
        orientation: "landscape",
        columns: Array.from({ length: 19 }, () => ({ width: 20 })),
      },
      {
        sheet: "Movimientos SIAF",
        data: movementRows,
        stickyRowsCount: 1,
        orientation: "landscape",
        columns: Array.from({ length: 11 }, () => ({ width: 18 })),
      },
    ]).toFile(`seguimiento_presupuestal_${selectedPredio.code}.xlsx`);
  };

  const economicRows = [
    ["Valor de tasación", selectedPredio.appraisal],
    ["Indemnización", selectedPredio.compensation],
    ["Mejoras", selectedPredio.improvements],
    ["Otros conceptos", selectedPredio.otherConcepts],
  ] as const;

  const kpis = [
    { label: "Costo predio", value: cost, tone: "slate", icon: CircleDollarSign },
    {
      label: "Certificado",
      value: selectedPredio.certification,
      tone: "amber",
      icon: CheckCircle2,
    },
    { label: "Devengado", value: selectedPredio.accrued, tone: "blue", icon: WalletCards },
    { label: "Girado", value: selectedPredio.drawn, tone: "violet", icon: Landmark },
    { label: "Pagado", value: selectedPredio.paid, tone: "green", icon: CheckCircle2 },
    { label: "Pendiente", value: pending, tone: "red", icon: AlertTriangle },
  ] as const;

  return (
    <div className="flex min-h-screen bg-[#f4f6f8] text-slate-900">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-auto p-3 xl:p-4">
        <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">
              Coordinadores · Seguimiento financiero
            </p>
            <h1 className="mt-0.5 text-[21px] font-bold tracking-tight">
              Seguimiento Presupuestal por Predio
            </h1>
            <p className="text-[11px] text-slate-500">
              Proyecto → Meta SIAF → Predio → Certificación → Devengado → Pagado
            </p>
          </div>
          <button
            onClick={exportMatrix}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-3 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            <FileSpreadsheet size={15} /> Exportar matriz
          </button>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-700">
              Selección y contexto presupuestal
            </h2>
          </div>
          <div className="grid gap-3 p-3 xl:grid-cols-[minmax(300px,0.8fr)_minmax(420px,1.2fr)]">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Proyecto de inversión
              </label>
              <select
                value={projectId}
                onChange={(event) => handleProjectChange(event.target.value)}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-[12px] font-semibold outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              >
                {projects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <div className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200">
                <ContextItem label="CUI" value={project.cui} />
                <ContextItem label="Año fiscal" value={project.fiscalYear} />
                <ContextItem label="Unidad ejecutora" value={project.executingUnit} wide />
                <ContextItem label="Meta SIAF" value={project.meta} />
                <ContextItem label="Secuencia funcional" value={project.functionalSequence} />
                <ContextItem label="Fuente" value={project.fundingSource} />
                <ContextItem label="Rubro" value={project.item} />
                <ContextItem label="Presupuesto vigente (PIM)" value={money(project.pim)} wide />
              </div>
            </div>

            <div className="relative">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Buscar y seleccionar predio
              </label>
              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setSearchOpen(true);
                  }}
                  placeholder="Código predial, expediente, DNI/RUC, propietario, sector o tramo"
                  className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-[12px] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
                {searchOpen && (
                  <div className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl">
                    {filteredPredios.length ? (
                      filteredPredios.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectPredio(item.code)}
                          className={`grid w-full grid-cols-[minmax(150px,0.7fr)_minmax(180px,1fr)_100px] gap-2 rounded-md px-2.5 py-2 text-left text-[11px] hover:bg-slate-50 ${
                            item.code === selectedPredio.code ? "bg-red-50 text-red-700" : ""
                          }`}
                        >
                          <span className="font-bold">{item.code}</span>
                          <span className="truncate">{item.owner}</span>
                          <span className="text-right text-slate-500">{item.sector}</span>
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-5 text-center text-[11px] text-slate-500">
                        No se encontraron predios con ese criterio.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-2 rounded-md border border-blue-200 bg-blue-50/60 p-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[12px] font-bold text-slate-900">
                      {selectedPredio.code}
                    </div>
                    <div className="text-[10px] text-slate-500">{selectedPredio.file}</div>
                  </div>
                  <StatusBadge state={state} />
                </div>
                <div className="mt-2 grid gap-2 text-[10px] sm:grid-cols-2 lg:grid-cols-3">
                  <InfoLine icon={UserRound} label="Sujeto pasivo" value={selectedPredio.owner} />
                  <InfoLine icon={Building2} label="Documento" value={selectedPredio.identity} />
                  <InfoLine icon={MapPin} label="Ubicación" value={selectedPredio.location} />
                  <InfoLine
                    icon={Landmark}
                    label="Área afectada"
                    value={`${selectedPredio.affectedArea.toLocaleString("es-PE")} m²`}
                  />
                  <InfoLine
                    icon={WalletCards}
                    label="Etapa actual"
                    value={selectedPredio.currentStage}
                  />
                  <InfoLine
                    icon={Clock3}
                    label="Última actualización"
                    value={selectedPredio.updatedAt}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-3 grid gap-3 xl:grid-cols-[330px_minmax(0,1fr)]">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-3 py-2">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-700">
                Resumen económico del predio
              </h2>
            </div>
            <div className="p-3">
              <div className="space-y-1.5">
                {economicRows.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">{label}</span>
                    <strong className="tabular-nums text-slate-800">{money(value)}</strong>
                  </div>
                ))}
              </div>
              <div className="mt-2 space-y-1.5 border-t border-slate-200 pt-2 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>Costo total predial</span>
                  <span className="tabular-nums">{money(cost)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Pagado</span>
                  <strong className="tabular-nums">{money(selectedPredio.paid)}</strong>
                </div>
                <div className="flex justify-between rounded bg-red-50 px-2 py-1.5 font-bold text-red-700">
                  <span>Pendiente por pagar</span>
                  <span className="tabular-nums">{money(pending)}</span>
                </div>
              </div>
              <div className="mt-3">
                <ProgressLine
                  label="Avance financiero pagado"
                  value={paidAdvance}
                  color="bg-emerald-500"
                />
                <ProgressLine label="Avance devengado" value={accruedAdvance} color="bg-blue-500" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
            {kpis.map((item) => (
              <KpiCard key={item.label} {...item} />
            ))}
          </section>
        </div>

        <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
            <div>
              <h2 className="text-[12px] font-bold text-slate-900">
                Matriz presupuestal principal
              </h2>
              <p className="text-[10px] text-slate-500">
                La meta puede financiar varios predios; los montos de ejecución corresponden solo al
                predio seleccionado.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[9px] font-semibold">
              <span className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-blue-700">
                PIA / PIM = contexto Proyecto · Meta
              </span>
              <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
                Ejecución = vinculada al predio
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1900px] w-full border-collapse text-[10px]">
              <thead>
                <tr className="text-white">
                  <th
                    colSpan={4}
                    className="border-r border-slate-600 bg-slate-800 px-2 py-2 text-center"
                  >
                    Identificación
                  </th>
                  <th
                    colSpan={2}
                    className="border-r border-blue-600 bg-blue-800 px-2 py-2 text-center"
                  >
                    Presupuesto del proyecto / meta SIAF
                  </th>
                  <th
                    colSpan={6}
                    className="border-r border-emerald-600 bg-emerald-800 px-2 py-2 text-center"
                  >
                    Ejecución asociada al predio
                  </th>
                  <th colSpan={5} className="bg-amber-700 px-2 py-2 text-center">
                    Control
                  </th>
                </tr>
                <tr className="text-[9px] uppercase tracking-wide text-slate-700">
                  {[
                    "Proyecto",
                    "CUI",
                    "Meta",
                    "Código predial",
                    "PIA",
                    "PIM",
                    "Certificación",
                    "Compromiso anual",
                    "Compromiso mensual",
                    "Devengado",
                    "Girado",
                    "Pagado",
                    "Costo total predio",
                    "Pendiente",
                    "Avance",
                    "Estado",
                    "Último movimiento",
                  ].map((header, index) => (
                    <th
                      key={header}
                      className={`border-b border-r border-slate-200 px-2 py-2 text-center font-bold ${
                        index < 4
                          ? "bg-slate-100"
                          : index < 6
                            ? "bg-blue-50 text-blue-800"
                            : index < 12
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="font-medium text-slate-700">
                  <td className="max-w-64 border-r border-t border-slate-200 px-2 py-2 font-semibold">
                    {project.name}
                  </td>
                  <td className="border-r border-t border-slate-200 px-2 py-2 text-center">
                    {project.cui}
                  </td>
                  <td className="border-r border-t border-slate-200 px-2 py-2 text-center font-bold">
                    {project.meta}
                  </td>
                  <td className="border-r border-t border-slate-200 px-2 py-2 font-bold text-red-700">
                    {selectedPredio.code}
                  </td>
                  <AmountCell value={project.pia} context />
                  <AmountCell value={project.pim} context />
                  <AmountCell value={selectedPredio.certification} linked />
                  <AmountCell value={selectedPredio.annualCommitment} linked />
                  <AmountCell value={selectedPredio.monthlyCommitment} linked />
                  <AmountCell value={selectedPredio.accrued} linked />
                  <AmountCell value={selectedPredio.drawn} linked />
                  <AmountCell value={selectedPredio.paid} linked strong />
                  <AmountCell value={cost} control />
                  <AmountCell value={pending} control strong />
                  <td className="min-w-28 border-r border-t border-slate-200 bg-amber-50/60 px-2 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${Math.min(paidAdvance, 100)}%` }}
                        />
                      </div>
                      <strong>{paidAdvance.toFixed(2)}%</strong>
                    </div>
                  </td>
                  <td className="border-r border-t border-slate-200 bg-amber-50/60 px-2 py-2 text-center">
                    <StatusBadge state={state} />
                  </td>
                  <td className="min-w-40 border-t border-slate-200 bg-amber-50/60 px-2 py-2 text-center">
                    {selectedPredio.lastMovement}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setMovementsOpen((value) => !value)}
            className="flex w-full items-center justify-between gap-3 border-b border-slate-200 px-3 py-2 text-left hover:bg-slate-50"
          >
            <div>
              <h2 className="text-[12px] font-bold">Movimientos presupuestales vinculados</h2>
              <p className="text-[10px] text-slate-500">
                Expedientes SIAF y documentos que sustentan la ejecución del predio.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold text-red-600">
              {selectedPredio.movements.length} movimiento(s)
              {movementsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </span>
          </button>
          {movementsOpen && (
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    {[
                      "Fecha",
                      "Expediente SIAF",
                      "Meta",
                      "Clasificador",
                      "Documento",
                      "Certificación",
                      "Compromiso",
                      "Devengado",
                      "Girado",
                      "Pagado",
                      "Estado",
                    ].map((header) => (
                      <th
                        key={header}
                        className="border-r border-slate-600 px-2 py-2 text-center font-bold"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedPredio.movements.length ? (
                    selectedPredio.movements.map((item, index) => (
                      <tr
                        key={`${item.siafFile}-${item.document}`}
                        className={index % 2 ? "bg-slate-50" : "bg-white"}
                      >
                        <td className="border-r border-t border-slate-200 px-2 py-2 text-center">
                          {item.date}
                        </td>
                        <td className="border-r border-t border-slate-200 px-2 py-2 text-center font-bold">
                          {item.siafFile}
                        </td>
                        <td className="border-r border-t border-slate-200 px-2 py-2 text-center">
                          {project.meta}
                        </td>
                        <td className="border-r border-t border-slate-200 px-2 py-2 text-center">
                          {item.classifier}
                        </td>
                        <td className="border-r border-t border-slate-200 px-2 py-2 font-semibold">
                          {item.document}
                        </td>
                        <MovementAmount value={item.certification} />
                        <MovementAmount value={item.commitment} />
                        <MovementAmount value={item.accrued} />
                        <MovementAmount value={item.drawn} />
                        <MovementAmount value={item.paid} />
                        <td className="border-t border-slate-200 px-2 py-2 text-center">
                          <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                            {item.state}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-[11px] text-slate-500">
                        Este predio todavía no tiene movimientos presupuestales vinculados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-3 grid gap-2 md:grid-cols-5">
          {(
            [
              ["Sin presupuesto", "No existe certificación vinculada."],
              ["Presupuesto insuficiente", "La certificación es menor al costo predial."],
              ["Certificado", "Cuenta con certificación y aún no registra ejecución."],
              ["En ejecución", "Registra compromiso, devengado o girado."],
              ["Pagado", "El pago cubre el costo total reconocido."],
            ] as Array<[BudgetState, string]>
          ).map(([label, description]) => (
            <div key={label} className={`rounded-md border p-2 ${stateStyles[label]}`}>
              <div className="text-[10px] font-bold">{label}</div>
              <p className="mt-0.5 text-[9px] opacity-80">{description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

function ContextItem({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`bg-white px-2.5 py-2 ${wide ? "col-span-2" : ""}`}>
      <div className="text-[8px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-0.5 truncate text-[10px] font-semibold text-slate-700" title={value}>
        {value}
      </div>
    </div>
  );
}

function InfoLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 gap-1.5">
      <Icon size={13} className="mt-0.5 shrink-0 text-blue-600" />
      <div className="min-w-0">
        <div className="text-[8px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
        <div className="truncate font-semibold text-slate-700" title={value}>
          {value}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ state }: { state: BudgetState }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-bold ${stateStyles[state]}`}
    >
      <span className="size-1.5 rounded-full bg-current" /> {state}
    </span>
  );
}

const kpiTone = {
  slate: "border-slate-200 bg-white text-slate-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  red: "border-red-200 bg-red-50 text-red-700",
};

function KpiCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: keyof typeof kpiTone;
  icon: typeof CircleDollarSign;
}) {
  return (
    <article
      className={`flex min-h-20 flex-col justify-between rounded-lg border p-2.5 shadow-sm ${kpiTone[tone]}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-bold uppercase tracking-wide opacity-80">{label}</span>
        <Icon size={14} />
      </div>
      <strong className="mt-2 text-[14px] tabular-nums">{compactMoney(value)}</strong>
    </article>
  );
}

function ProgressLine({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-2">
      <div className="mb-1 flex justify-between text-[9px] font-semibold text-slate-600">
        <span>{label}</span>
        <span>{value.toFixed(2)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function AmountCell({
  value,
  context = false,
  linked = false,
  control = false,
  strong = false,
}: {
  value: number;
  context?: boolean;
  linked?: boolean;
  control?: boolean;
  strong?: boolean;
}) {
  return (
    <td
      className={`border-r border-t border-slate-200 px-2 py-2 text-right tabular-nums ${
        context ? "bg-blue-50/60 text-blue-900" : ""
      } ${linked ? "bg-emerald-50/60 text-emerald-900" : ""} ${
        control ? "bg-amber-50/60 text-amber-900" : ""
      } ${strong ? "font-bold" : "font-medium"}`}
    >
      {compactMoney(value)}
    </td>
  );
}

function MovementAmount({ value }: { value: number }) {
  return (
    <td className="border-r border-t border-slate-200 px-2 py-2 text-right tabular-nums text-slate-700">
      {value ? money(value) : "—"}
    </td>
  );
}
