export type LinkStatus = "Vinculado" | "Vinculación parcial" | "Sin vincular";

export type IntegratedProject = {
  id: string;
  year: string;
  entity: string;
  entityCode: string;
  pliego: string;
  executingUnit: string;
  cui: string;
  name: string;
  oei: string;
  oeiName: string;
  aei: string;
  aeiName: string;
  aoi: string;
  aoiName: string;
  costCenter: string;
  meta: string;
  functionalSequence: string;
  sourceCode: string;
  sourceName: string;
  itemCode: string;
  itemName: string;
  genericCode: string;
  genericName: string;
  poi: number;
  pia: number;
  pim: number;
  certification: number;
  commitment: number;
  accrued: number;
  drawn: number;
  paid: number;
  linkStatus: LinkStatus;
};

export type IntegratedPredio = {
  projectId: string;
  code: string;
  file: string;
  owner: string;
  identity: string;
  sector: string;
  section: string;
  state: string;
  stage: string;
  appraisalState: string;
  paymentState: string;
  registrationState: string;
  cost: number;
  linkedAmount: number;
  certification: number;
  commitment: number;
  accrued: number;
  drawn: number;
  paid: number;
  classifier: string;
  siafFile: string;
  linkStatus: LinkStatus;
};

export type PhysicalTarget = {
  projectId: string;
  id: string;
  label: string;
  unit: string;
  annual: number;
  periodPlanned: number;
  periodExecuted: number;
  financialAccrued: number;
  financialPim: number;
  state: string;
};

export type PredialIndicator = {
  projectId: string;
  label: string;
  planned: number;
  executed: number;
};

export type SiafClassifier = {
  year: string;
  projectId: string;
  sourceCode: string;
  sourceName: string;
  itemCode: string;
  itemName: string;
  categoryCode: string;
  categoryName: string;
  genericCode: string;
  genericName: string;
  subgenericCode: string;
  subgenericName: string;
  specificCode: string;
  specificName: string;
  code: string;
  description: string;
  meta: string;
  pia: number;
  pim: number;
  certification: number;
  commitment: number;
  accrued: number;
  drawn: number;
  paid: number;
};

export const integratedProjects: IntegratedProject[] = [
  {
    id: "iquitos",
    year: "2026",
    entity: "Ministerio de Transportes y Comunicaciones",
    entityCode: "036",
    pliego: "036 · MTC",
    executingUnit: "001 · Administración General",
    cui: "2458965",
    name: "Adquisición y liberación de áreas del Aeropuerto de Iquitos",
    oei: "OEI.05",
    oeiName: "Mejorar la infraestructura de transporte para la integración territorial",
    aei: "AEI.05.02",
    aeiName: "Infraestructura aeroportuaria segura y disponible",
    aoi: "AOI00003600412",
    aoiName: "Gestión para la adquisición y liberación de áreas",
    costCenter: "DDP · Dirección de Disponibilidad de Predios",
    meta: "0045",
    functionalSequence: "0123",
    sourceCode: "1",
    sourceName: "Recursos Ordinarios",
    itemCode: "00",
    itemName: "Recursos Ordinarios",
    genericCode: "2.6",
    genericName: "Adquisición de activos no financieros",
    poi: 15_000_000,
    pia: 14_000_000,
    pim: 17_500_000,
    certification: 14_200_000,
    commitment: 13_400_000,
    accrued: 11_200_000,
    drawn: 10_400_000,
    paid: 10_100_000,
    linkStatus: "Vinculado",
  },
  {
    id: "jauja",
    year: "2026",
    entity: "Ministerio de Transportes y Comunicaciones",
    entityCode: "036",
    pliego: "036 · MTC",
    executingUnit: "001 · Administración General",
    cui: "2233850",
    name: "Mejoramiento y ampliación del Aeropuerto de Jauja",
    oei: "OEI.05",
    oeiName: "Mejorar la infraestructura de transporte para la integración territorial",
    aei: "AEI.05.02",
    aeiName: "Infraestructura aeroportuaria segura y disponible",
    aoi: "AOI00003600428",
    aoiName: "Liberación y saneamiento de predios aeroportuarios",
    costCenter: "DDP · Dirección de Disponibilidad de Predios",
    meta: "0061",
    functionalSequence: "0187",
    sourceCode: "1",
    sourceName: "Recursos Ordinarios",
    itemCode: "00",
    itemName: "Recursos Ordinarios",
    genericCode: "2.6",
    genericName: "Adquisición de activos no financieros",
    poi: 12_000_000,
    pia: 10_800_000,
    pim: 13_400_000,
    certification: 10_900_000,
    commitment: 9_800_000,
    accrued: 8_100_000,
    drawn: 7_700_000,
    paid: 7_450_000,
    linkStatus: "Vinculación parcial",
  },
];

export const integratedPredios: IntegratedPredio[] = [
  {
    projectId: "iquitos",
    code: "AERO-IQT-PR-00125",
    file: "EXP-IQT-00125-2026",
    owner: "Juan Pérez Quispe",
    identity: "DNI 40851247",
    sector: "Sector Este",
    section: "Tramo 1",
    state: "Pagado",
    stage: "Adquisición",
    appraisalState: "Completada",
    paymentState: "Completado",
    registrationState: "Pendiente",
    cost: 185_000,
    linkedAmount: 185_000,
    certification: 185_000,
    commitment: 185_000,
    accrued: 180_000,
    drawn: 175_000,
    paid: 175_000,
    classifier: "2.6.5.1.1.2",
    siafFile: "EXP-SIAF-00358",
    linkStatus: "Vinculado",
  },
  {
    projectId: "iquitos",
    code: "AERO-IQT-PR-00126",
    file: "EXP-IQT-00126-2026",
    owner: "Rosa Elena Salazar Vela",
    identity: "DNI 05281469",
    sector: "Sector Este",
    section: "Tramo 1",
    state: "En proceso",
    stage: "Tasación",
    appraisalState: "Completada",
    paymentState: "Pendiente",
    registrationState: "Pendiente",
    cost: 138_000,
    linkedAmount: 138_000,
    certification: 138_000,
    commitment: 138_000,
    accrued: 92_000,
    drawn: 0,
    paid: 0,
    classifier: "2.6.5.1.1.2",
    siafFile: "EXP-SIAF-00402",
    linkStatus: "Vinculado",
  },
  {
    projectId: "iquitos",
    code: "AERO-IQT-PR-00127",
    file: "EXP-IQT-00127-2026",
    owner: "Inversiones Amazónicas S.A.C.",
    identity: "RUC 20541278963",
    sector: "Sector Norte",
    section: "Tramo 2",
    state: "Observado",
    stage: "Diagnóstico",
    appraisalState: "Pendiente",
    paymentState: "Pendiente",
    registrationState: "Pendiente",
    cost: 300_000,
    linkedAmount: 0,
    certification: 0,
    commitment: 0,
    accrued: 0,
    drawn: 0,
    paid: 0,
    classifier: "",
    siafFile: "",
    linkStatus: "Sin vincular",
  },
  {
    projectId: "jauja",
    code: "AERO-JAUJA-PR-00245-A",
    file: "EXP-JAUJA-0245A",
    owner: "María Elena Rojas Huamán",
    identity: "DNI 42581736",
    sector: "Sector Oeste",
    section: "Tramo 1",
    state: "En proceso",
    stage: "Pago",
    appraisalState: "Completada",
    paymentState: "En trámite",
    registrationState: "Pendiente",
    cost: 225_000,
    linkedAmount: 225_000,
    certification: 225_000,
    commitment: 225_000,
    accrued: 225_000,
    drawn: 185_000,
    paid: 0,
    classifier: "2.6.5.1.1.2",
    siafFile: "EXP-SIAF-00612",
    linkStatus: "Vinculado",
  },
  {
    projectId: "jauja",
    code: "AERO-JAUJA-PR-0056",
    file: "EXP-JAUJA-0056",
    owner: "Dirección Regional Agraria Junín",
    identity: "RUC 20145541253",
    sector: "Sector Norte",
    section: "Tramo 2",
    state: "En proceso",
    stage: "Transferencia interestatal",
    appraisalState: "No aplica",
    paymentState: "Parcial",
    registrationState: "Pendiente",
    cost: 50_000,
    linkedAmount: 50_000,
    certification: 50_000,
    commitment: 50_000,
    accrued: 25_000,
    drawn: 25_000,
    paid: 25_000,
    classifier: "2.6.5.1.1.2",
    siafFile: "EXP-SIAF-00706",
    linkStatus: "Vinculación parcial",
  },
];

export const physicalTargets: PhysicalTarget[] = [
  {
    projectId: "iquitos",
    id: "MF-01",
    label: "Predios con proceso de adquisición y liberación gestionado",
    unit: "Predio",
    annual: 250,
    periodPlanned: 250,
    periodExecuted: 180,
    financialAccrued: 11_200_000,
    financialPim: 17_500_000,
    state: "Brecha moderada",
  },
  {
    projectId: "iquitos",
    id: "MF-02",
    label: "Informes técnico-legales emitidos",
    unit: "Informe",
    annual: 120,
    periodPlanned: 96,
    periodExecuted: 81,
    financialAccrued: 1_180_000,
    financialPim: 1_500_000,
    state: "Consistente",
  },
  {
    projectId: "jauja",
    id: "MF-01",
    label: "Predios saneados o liberados",
    unit: "Predio",
    annual: 180,
    periodPlanned: 150,
    periodExecuted: 110,
    financialAccrued: 8_100_000,
    financialPim: 13_400_000,
    state: "Brecha moderada",
  },
  {
    projectId: "jauja",
    id: "MF-02",
    label: "Área saneada para la infraestructura aeroportuaria",
    unit: "Metro cuadrado",
    annual: 85_000,
    periodPlanned: 72_000,
    periodExecuted: 49_800,
    financialAccrued: 2_750_000,
    financialPim: 4_200_000,
    state: "Consistente",
  },
];

export const predialIndicators: PredialIndicator[] = [
  { projectId: "iquitos", label: "Predios diagnosticados", planned: 500, executed: 425 },
  { projectId: "iquitos", label: "Predios tasados", planned: 450, executed: 350 },
  { projectId: "iquitos", label: "Predios con trato directo", planned: 300, executed: 210 },
  { projectId: "iquitos", label: "Predios pagados", planned: 250, executed: 180 },
  { projectId: "iquitos", label: "Predios inscritos", planned: 180, executed: 110 },
  { projectId: "jauja", label: "Predios diagnosticados", planned: 320, executed: 270 },
  { projectId: "jauja", label: "Predios tasados", planned: 280, executed: 205 },
  { projectId: "jauja", label: "Predios con trato directo", planned: 190, executed: 132 },
  { projectId: "jauja", label: "Predios pagados", planned: 160, executed: 98 },
  { projectId: "jauja", label: "Predios inscritos", planned: 110, executed: 62 },
];

const classifierCatalog: SiafClassifier[] = [
  {
    year: "2026",
    projectId: "iquitos",
    sourceCode: "1",
    sourceName: "Recursos Ordinarios",
    itemCode: "00",
    itemName: "Recursos Ordinarios",
    categoryCode: "6",
    categoryName: "Gastos de capital",
    genericCode: "2.6",
    genericName: "Adquisición de activos no financieros",
    subgenericCode: "2.6.5",
    subgenericName: "Adquisición de activos no producidos",
    specificCode: "2.6.5.1",
    specificName: "Terrenos",
    code: "2.6.5.1.1.2",
    description: "Adquisición de terrenos rurales",
    meta: "0045",
    pia: 12_000_000,
    pim: 15_000_000,
    certification: 12_500_000,
    commitment: 11_900_000,
    accrued: 10_000_000,
    drawn: 9_500_000,
    paid: 9_300_000,
  },
  {
    year: "2026",
    projectId: "iquitos",
    sourceCode: "1",
    sourceName: "Recursos Ordinarios",
    itemCode: "00",
    itemName: "Recursos Ordinarios",
    categoryCode: "5",
    categoryName: "Gastos corrientes",
    genericCode: "2.3",
    genericName: "Bienes y servicios",
    subgenericCode: "2.3.2",
    subgenericName: "Contratación de servicios",
    specificCode: "2.3.2.7",
    specificName: "Servicios profesionales y técnicos",
    code: "2.3.2.7.11.99",
    description: "Servicios especializados para la gestión predial",
    meta: "0045",
    pia: 2_000_000,
    pim: 2_500_000,
    certification: 1_700_000,
    commitment: 1_500_000,
    accrued: 1_200_000,
    drawn: 900_000,
    paid: 800_000,
  },
  {
    year: "2026",
    projectId: "jauja",
    sourceCode: "1",
    sourceName: "Recursos Ordinarios",
    itemCode: "00",
    itemName: "Recursos Ordinarios",
    categoryCode: "6",
    categoryName: "Gastos de capital",
    genericCode: "2.6",
    genericName: "Adquisición de activos no financieros",
    subgenericCode: "2.6.5",
    subgenericName: "Adquisición de activos no producidos",
    specificCode: "2.6.5.1",
    specificName: "Terrenos",
    code: "2.6.5.1.1.2",
    description: "Adquisición de terrenos rurales",
    meta: "0061",
    pia: 9_100_000,
    pim: 11_400_000,
    certification: 9_400_000,
    commitment: 8_600_000,
    accrued: 7_200_000,
    drawn: 6_950_000,
    paid: 6_700_000,
  },
  {
    year: "2026",
    projectId: "jauja",
    sourceCode: "1",
    sourceName: "Recursos Ordinarios",
    itemCode: "00",
    itemName: "Recursos Ordinarios",
    categoryCode: "5",
    categoryName: "Gastos corrientes",
    genericCode: "2.3",
    genericName: "Bienes y servicios",
    subgenericCode: "2.3.2",
    subgenericName: "Contratación de servicios",
    specificCode: "2.3.2.7",
    specificName: "Servicios profesionales y técnicos",
    code: "2.3.2.7.11.99",
    description: "Servicios de saneamiento físico legal",
    meta: "0061",
    pia: 1_700_000,
    pim: 2_000_000,
    certification: 1_500_000,
    commitment: 1_200_000,
    accrued: 900_000,
    drawn: 750_000,
    paid: 750_000,
  },
  {
    year: "2025",
    projectId: "iquitos",
    sourceCode: "1",
    sourceName: "Recursos Ordinarios",
    itemCode: "00",
    itemName: "Recursos Ordinarios",
    categoryCode: "6",
    categoryName: "Gastos de capital",
    genericCode: "2.6",
    genericName: "Adquisición de activos no financieros",
    subgenericCode: "2.6.5",
    subgenericName: "Adquisición de activos no producidos",
    specificCode: "2.6.5.1",
    specificName: "Terrenos",
    code: "2.6.5.1.1.2",
    description: "Adquisición de terrenos rurales",
    meta: "0038",
    pia: 9_500_000,
    pim: 10_800_000,
    certification: 9_100_000,
    commitment: 8_700_000,
    accrued: 8_200_000,
    drawn: 8_000_000,
    paid: 7_950_000,
  },
];

export function getSiafClassifiers(year: string, projectId: string) {
  return classifierCatalog.filter((item) => item.year === year && item.projectId === projectId);
}
