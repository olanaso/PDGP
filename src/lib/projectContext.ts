// Mock data sources used by the código de predios / planos modules
// while no backend exists. Centralised so both forms auto-fill the same
// project, coordination and profesional fields and can be overridden.

export type ProjectInfo = {
  id: string;
  nombre: string;
  coordinacion: string;
  tramo?: string;
  tipoInfraestructura: string;
  departamento: string;
  provincia: string;
  distrito: string;
};

export const CURRENT_USER = {
  id: "u-001",
  nombre: "GADY GABRIELA, QUIROZ PINCHI",
  rol: "Profesional Predial",
};

export const PROFESIONALES = [
  "GADY GABRIELA, QUIROZ PINCHI",
  "LUIS ENRIQUE, PONCE MUÑOZ",
  "OKY AGUSTÍN, SUPARO TAJIRI",
  "CHRISTIAN ALEXANDER, ALIAGA VASQUEZ",
  "DAVID DALAMBERT, LINO RUIZ",
];

export const COORDINACIONES = [
  "COORDINACIÓN GENERAL VIAL 3",
  "COORDINACIÓN DE EJECUCIÓN DE LA GESTIÓN PREDIAL",
  "COORDINACIÓN PREDIAL AUTOPISTA DEL SOL",
  "COORDINACIÓN DE MULTIPROYECTOS VIALES 1",
];

export const TIPOS_PLANO = [
  "PLANO DE DISTRIBUCION DE EDIFICACIONES",
  "PLANO DE INDEPENDIZACION",
  "PLANO PERIMETRICO Y UBICACION",
  "PLANO DE AFECTACION",
  "PLANO PARA BUSQUEDA CATASTRAL ANTE REGISTROS PUBLICOS",
];

export const PROCESOS_GESTION_PREDIAL = [
  "Diagnóstico Técnico Legal",
  "Saneamiento Físico Legal",
  "Tasación",
  "Adquisición / Expropiación",
  "Liberación de Áreas",
];

const PROJECTS: Record<string, ProjectInfo> = {
  caballococha: {
    id: "caballococha",
    nombre: "AEROPUERTO DE CABALLOCOCHA",
    coordinacion: "COORDINACIÓN DE EJECUCIÓN DE LA GESTIÓN PREDIAL",
    tipoInfraestructura: "Aeropuerto",
    departamento: "LORETO",
    provincia: "Mariscal Ramón Castilla",
    distrito: "Caballococha",
  },
};

export function getProjectInfo(projectId: string): ProjectInfo {
  return (
    PROJECTS[projectId] ?? {
      id: projectId,
      nombre: projectId.toUpperCase(),
      coordinacion: COORDINACIONES[0],
      tipoInfraestructura: "Vial",
      departamento: "",
      provincia: "",
      distrito: "",
    }
  );
}

export type SeguimientoEvento = {
  id: number;
  fecha: string;
  usuario: string;
  accion: string;
  detalle?: string;
  estado?: string;
};

export const seguimientoMock: SeguimientoEvento[] = [
  {
    id: 1,
    fecha: new Date().toISOString().slice(0, 19).replace("T", " "),
    usuario: CURRENT_USER.nombre,
    accion: "Creación de registro",
    detalle: "Registro generado desde el módulo",
    estado: "DISPONIBLE",
  },
  {
    id: 2,
    fecha: "2026-06-23 07:52:30",
    usuario: "LUIS ENRIQUE, PONCE MUÑOZ",
    accion: "Asignación a profesional",
    detalle: "Asignado para validación técnica",
    estado: "ASIGNADO",
  },
  {
    id: 3,
    fecha: "2026-06-23 09:10:12",
    usuario: "GADY GABRIELA, QUIROZ PINCHI",
    accion: "Validación técnica",
    detalle: "Documentación conforme",
    estado: "USADO",
  },
];