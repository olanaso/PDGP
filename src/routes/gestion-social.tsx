import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  BookOpen,
  ClipboardList,
  FileDown,
  Handshake,
  History,
  Landmark,
  Plus,
  Save,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { AppSidebar } from "@/components/AppSidebar";
import { predioRows } from "@/lib/prediosData";
import { CURRENT_USER } from "@/lib/projectContext";
import { proyectos } from "@/lib/projectsData";

export const Route = createFileRoute("/gestion-social")({
  head: () => ({
    meta: [
      { title: "Gestión social" },
      {
        name: "description",
        content:
          "Módulo transversal de Gestión Predial Social: antecedentes por proyecto, riesgos, actores, atención a sujetos pasivos y actas de gestión social.",
      },
    ],
  }),
  component: GestionSocialPage,
});

const STORAGE_KEY = "pdgp:gestion-social:v1";
const RED = "#dc2626";
const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] text-gray-800 outline-none transition focus:border-[#dc2626] focus:ring-1 focus:ring-red-100";
const textareaCls =
  "min-h-16 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-[12px] text-gray-800 outline-none transition focus:border-[#dc2626] focus:ring-1 focus:ring-red-100";
const btnPrimary =
  "inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-3 text-[12px] font-medium text-white hover:bg-[#b91c1c] disabled:opacity-50";
const btnOutline =
  "inline-flex h-8 items-center gap-1.5 rounded border border-red-200 px-3 text-[11px] font-medium text-[#dc2626] hover:bg-red-50";
const btnGhost =
  "inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 px-3 text-[11px] text-gray-600 hover:bg-gray-50";

// ---------------------------------------------------------------- catálogos

const ACTIVIDADES = [
  "Primera visita",
  "Sensibilización e información",
  "Actualización de información",
  "Entrega de documentación",
  "Recojo de documentación",
  "Coordinación para inspección",
  "Coordinación para tasación",
  "Acompañamiento para trámite documentario",
  "Constatación de vivencia",
  "Atención de consultas",
  "Seguimiento",
  "Negociación",
  "Reunión informativa",
];
const ACEPTACION = ["Muy favorable", "Favorable", "Neutral", "Desfavorable", "Muy desfavorable"];
const DISPOSICION = ["Acepta", "En evaluación", "Requiere mayor información", "Rechaza"];
const NIVELES = ["Bajo", "Medio", "Alto"];
const SEMAFORO = ["Normal", "Seguimiento preventivo", "Atención prioritaria"];
const ESTADOS_RIESGO = ["Atendido", "En proceso", "No atendido"];
const ETAPAS = ["Diagnóstico", "Empadronamiento", "Tasación", "Adquisición", "Pago", "Entrega"];

const SECCIONES_MARCO: { titulo: string; parrafo: string; items: string[] }[] = [
  {
    titulo: "25.1 Marco normativo, contractual y referencias internacionales",
    parrafo:
      "La Gestión Predial Social se enmarca en el Decreto Legislativo N.° 1192 y sus modificatorias; en proyectos APP, en el marco normativo aplicable a dicha modalidad; y en la Resolución Directoral N.° 007-2004-MTC/16 (Directrices PACRI). Considera además los contratos de concesión, adendas e instrumentos de cada proyecto y, cuando apliquen, los estándares internacionales sobre adquisición de tierras, desplazamiento físico y económico, reasentamiento involuntario y participación de partes interesadas.",
    items: [],
  },
  {
    titulo: "25.2 Funcionamiento y articulación del módulo",
    parrafo:
      "Integra las actuaciones sociales con la información técnica, legal, territorial y documental, manteniendo la correspondencia entre las actuaciones de campo y los procesos de Gestión de Predios que les dieron origen.",
    items: [
      "Vinculación multiescala: proyecto, tramo, sector y Códigos de Predio (alcance individual, colectivo o territorial).",
      "Consumo e intercambio de información entre módulos sin duplicar datos ni documentos.",
      "Relaciones estructuradas entre procesos y actuaciones mediante identificadores comunes.",
      "Gestión diferenciada por perfiles: especialista social, brigadas, coordinadores y usuarios autorizados.",
      "Articulación con Gestión Documental, el Expediente Predial Digital y el STD.",
      "Articulación con la Geodatabase corporativa sin duplicar geometrías.",
    ],
  },
  {
    titulo: "25.3 Caracterización y gestión geoespacial de la información social",
    parrafo:
      "Organiza la caracterización social de la población y actores vinculados con las áreas requeridas, para su análisis social y territorial.",
    items: [
      "Diagnóstico social del ámbito del proyecto, sector o zona de intervención.",
      "Caracterización social y socioeconómica: censos, fichas, empadronamientos, padrones y levantamientos de campo.",
      "Matriz de actores sociales (interés y nivel de poder) y directorio de autoridades, dirigentes y gestores.",
      "Estructuración territorial y georreferenciación reutilizando capas existentes.",
      "Consulta, análisis y visualización geoespacial por capas temáticas.",
    ],
  },
  {
    titulo: "25.4 Gestión de riesgos, incidencias y conflictos sociales",
    parrafo:
      "Gestiona las situaciones que puedan afectar la adquisición de predios, diferenciando riesgos potenciales de incidencias o conflictos materializados.",
    items: [
      "Registro y clasificación mediante una matriz de riesgos actualizable.",
      "Evaluación, priorización y semaforización: normal, seguimiento preventivo y atención prioritaria.",
      "Historial de evolución del nivel de riesgo con fecha, condición anterior, nueva condición, sustento y usuario.",
      "Identificación territorial de situaciones críticas y mapas de calor en el entorno GIS.",
    ],
  },
  {
    titulo: "25.5 Atención, participación y trazabilidad de actuaciones sociales",
    parrafo:
      "Concentra la información de los canales de atención y de los mecanismos de participación con la población vinculada.",
    items: [
      "Registro de consultas, solicitudes, quejas y reclamos con fecha, medio, tipo, actores, responsable y estado.",
      "Gestión de reuniones, visitas, talleres y jornadas con participantes, resultados, actas y evidencias.",
      "Gestión de acuerdos y compromisos con plazos, responsables, estados y sustentos.",
      "Trazabilidad completa de actuaciones por actor, situación social o Predio.",
    ],
  },
  {
    titulo: "25.6 Gestión de medidas sociales vinculadas al PCRA",
    parrafo:
      "Cuando el proyecto contemple un Plan de Compensación, Reasentamiento Involuntario y Adquisición de Predios, gestiona las medidas sociales para la población directamente afectada.",
    items: [
      "Configuración de programas, componentes y medidas del PCRA por proyecto.",
      "Asignación de medidas a unidades sociales vinculadas al Código de Predio.",
      "Gestión y visualización GIS de la reubicación o reasentamiento (origen, alternativas y destino).",
      "Medidas de restablecimiento socioeconómico.",
      "Implementación, evidencias y resultado de cada medida.",
    ],
  },
];

// ---------------------------------------------------------------- tipos

type CambioNivel = {
  fecha: string;
  anterior: string;
  nueva: string;
  sustento: string;
  usuario: string;
};

type Riesgo = {
  id: string;
  proyecto: string;
  fecha: string;
  etapa: string;
  denominacion: string;
  tipo: string;
  grupo: string;
  latencia: string;
  antecedentes: string;
  causas: string;
  efectos: string;
  accionesDesarrolladas: string;
  accionesADesarrollar: string;
  nivel: string;
  semaforo: string;
  estado: string;
  codigoPredio: string;
  historial: CambioNivel[];
};

type Actor = {
  id: string;
  proyecto: string;
  nombre: string;
  tipo: string;
  cargo: string;
  interes: string;
  poder: string;
  ambito: string;
  telefono: string;
  correo: string;
};

type Intervencion = {
  id: string;
  proyecto: string;
  codigoPredio: string;
  manzanaLote: string;
  ubicacion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  gestor: string;
  sujetoNombre: string;
  sujetoDni: string;
  sujetoCalidad: string;
  sujetoDireccion: string;
  sujetoTelefono: string;
  sujetoCorreo: string;
  actividades: string[];
  otraActividad: string;
  objetivo: string;
  desarrollo: string;
  aceptacion: string;
  preocupaciones: string;
  disposicion: string;
  riesgo: string;
  factores: string;
  observaciones: string;
};

type Compromiso = {
  id: string;
  proyecto: string;
  codigoPredio: string;
  actor: string;
  compromiso: string;
  responsable: string;
  plazo: string;
  estado: string;
  sustento: string;
};

type Medida = {
  id: string;
  proyecto: string;
  codigoPredio: string;
  unidadSocial: string;
  componente: string;
  medida: string;
  origen: string;
  destino: string;
  estado: string;
  resultado: string;
};

type Store = {
  antecedentes: Record<string, string>;
  riesgos: Riesgo[];
  actores: Actor[];
  intervenciones: Intervencion[];
  compromisos: Compromiso[];
  medidas: Medida[];
};

// ---------------------------------------------------------------- datos semilla

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "");
const projectName = (id: string) => proyectos.find((p) => p.id === id)?.nombre ?? id;

const seedRiesgos: Riesgo[] = [
  {
    id: "r1",
    proyecto: "pucallpa",
    fecha: "2026-04-23",
    etapa: "Adquisición",
    denominacion: "Demora en la rectificación de área de algunos predios",
    tipo: "Institucional",
    grupo: "Institucional",
    latencia: "Existente",
    antecedentes: "Demora en la atención de solicitudes de rectificación de área.",
    causas: "Burocracia municipal y registral.",
    efectos: "Molestia de los propietarios y retraso del proceso.",
    accionesDesarrolladas: "Apoyo en los trámites ante la municipalidad.",
    accionesADesarrollar: "Reuniones con la municipalidad y SUNARP.",
    nivel: "Medio",
    semaforo: "Seguimiento preventivo",
    estado: "En proceso",
    codigoPredio: "",
    historial: [],
  },
  {
    id: "r2",
    proyecto: "pucallpa",
    fecha: "2026-04-23",
    etapa: "Adquisición",
    denominacion: "Posesionarios sin título de propiedad o constancia de posesión",
    tipo: "Social",
    grupo: "Individual",
    latencia: "Existente",
    antecedentes: "Posesión de hecho sin documentación.",
    causas: "Posesionarios sin saneamiento.",
    efectos: "Molestia por la demora en la adquisición.",
    accionesDesarrolladas: "Apoyo en la obtención de constancias de posesión.",
    accionesADesarrollar: "Reuniones con la municipalidad.",
    nivel: "Medio",
    semaforo: "Seguimiento preventivo",
    estado: "En proceso",
    codigoPredio: "",
    historial: [],
  },
  {
    id: "r3",
    proyecto: "piura",
    fecha: "2026-04-24",
    etapa: "Adquisición",
    denominacion: "Rechazo de algunos beneficiarios a retirarse de la zona",
    tipo: "Social",
    grupo: "Individual",
    latencia: "Existente",
    antecedentes: "Posesión de larga data.",
    causas: "Negativa a la liberación de las áreas por sobrevaloración de los predios.",
    efectos: "Conformación de asociación y acción de amparo.",
    accionesDesarrolladas: "Acción de sensibilización.",
    accionesADesarrollar: "Sensibilizar.",
    nivel: "Medio",
    semaforo: "Atención prioritaria",
    estado: "No atendido",
    codigoPredio: "",
    historial: [],
  },
  {
    id: "r4",
    proyecto: "tarapoto",
    fecha: "2026-04-22",
    etapa: "Adquisición",
    denominacion: "Ninguno",
    tipo: "",
    grupo: "",
    latencia: "",
    antecedentes: "Ninguno",
    causas: "Ninguna",
    efectos: "Ninguno",
    accionesDesarrolladas: "Proceso de adquisición normal.",
    accionesADesarrollar: "Proceso de adquisición normal.",
    nivel: "Bajo",
    semaforo: "Normal",
    estado: "En proceso",
    codigoPredio: "",
    historial: [],
  },
  {
    id: "r5",
    proyecto: "cajamarca",
    fecha: "2024-01-01",
    etapa: "Adquisición",
    denominacion:
      "La zona de ampliación es el área verde de la ciudad de Cajamarca y alrededor hay zonas residenciales, instituciones educativas y la zona ganadera",
    tipo: "Ambiental",
    grupo: "Familiar",
    latencia: "Existente",
    antecedentes: "Inadecuado resguardo de las propiedades adquiridas.",
    causas: "Inadecuado proceso de demolición.",
    efectos: "Contaminación, enfermedades.",
    accionesDesarrolladas: "Ninguna.",
    accionesADesarrollar:
      "Adecuado proceso de demolición teniendo en cuenta los parámetros socioambientales.",
    nivel: "Alto",
    semaforo: "Atención prioritaria",
    estado: "No atendido",
    codigoPredio: "",
    historial: [],
  },
];

const seedAntecedentes: Record<string, string> = {
  pucallpa:
    "Proyecto aeroportuario con predominio de posesionarios sin título. La municipalidad demora la rectificación de áreas; se coordina con SUNARP y la municipalidad para destrabar expedientes.",
  piura:
    "Beneficiarios organizados en asociación presentaron acción de amparo por desacuerdo con la valoración. Se mantiene campaña de sensibilización casa por casa.",
  tarapoto: "Proceso de adquisición sin riesgos sociales relevantes a la fecha.",
  cajamarca:
    "La zona de ampliación coincide con el área verde de la ciudad; colindan zonas residenciales, instituciones educativas y ganadería. Riesgo ambiental alto por demoliciones.",
  jauja:
    "Predios rurales con posesionarios y comunidades campesinas. Se requiere acompañamiento permanente para la entrega de documentación y constatación de vivencia.",
};

const seedActores: Actor[] = [
  {
    id: "a1",
    proyecto: "piura",
    nombre: "Asociación de Posesionarios Sector Norte",
    tipo: "Organización social",
    cargo: "Presidente: Luis Chávez",
    interes: "Alto",
    poder: "Alto",
    ambito: "Sector norte del aeropuerto",
    telefono: "969 000 111",
    correo: "",
  },
  {
    id: "a2",
    proyecto: "jauja",
    nombre: "Comunidad Campesina de Huertas",
    tipo: "Comunidad",
    cargo: "Presidente comunal",
    interes: "Alto",
    poder: "Medio",
    ambito: "Predios AERO-JAUJA-0088 y PR-0556",
    telefono: "",
    correo: "",
  },
  {
    id: "a3",
    proyecto: "pucallpa",
    nombre: "Municipalidad Provincial de Coronel Portillo",
    tipo: "Autoridad local",
    cargo: "Subgerencia de Catastro",
    interes: "Medio",
    poder: "Alto",
    ambito: "Rectificación de áreas",
    telefono: "061 575 000",
    correo: "catastro@municportillo.gob.pe",
  },
];

const emptyIntervencion = (): Intervencion => ({
  id: "",
  proyecto: "jauja",
  codigoPredio: "",
  manzanaLote: "",
  ubicacion: "",
  fecha: today(),
  horaInicio: "09:00",
  horaFin: "10:00",
  gestor: CURRENT_USER.nombre,
  sujetoNombre: "",
  sujetoDni: "",
  sujetoCalidad: "Posesionario",
  sujetoDireccion: "",
  sujetoTelefono: "",
  sujetoCorreo: "",
  actividades: [],
  otraActividad: "",
  objetivo: "",
  desarrollo: "",
  aceptacion: "Neutral",
  preocupaciones: "",
  disposicion: "En evaluación",
  riesgo: "Medio",
  factores: "",
  observaciones: "",
});

const seedIntervenciones: Intervencion[] = [
  {
    ...emptyIntervencion(),
    id: "i1",
    proyecto: "jauja",
    codigoPredio: "AERO-JAUJA-PR-0052",
    manzanaLote: "Mz. C Lt. 4",
    ubicacion: "Jauja / Jauja / Junín",
    fecha: "2026-03-12",
    sujetoNombre: "ANA JOSEFINA QUISPE",
    sujetoDni: "20456789",
    sujetoCalidad: "Propietaria",
    sujetoDireccion: "Jr. Huancayo 215, Jauja",
    sujetoTelefono: "964 112 233",
    actividades: ["Primera visita", "Sensibilización e información"],
    objetivo: "Informar sobre el proceso de adquisición y los beneficios del trato directo.",
    desarrollo:
      "Se explicó el procedimiento del D.L. 1192, el incentivo del 20 % y los plazos. La titular manifestó dudas sobre el valor comercial.",
    aceptacion: "Neutral",
    preocupaciones: "Valor de la tasación y plazo de pago.",
    disposicion: "Requiere mayor información",
    riesgo: "Medio",
    factores: "Desconfianza por experiencias previas de vecinos.",
  },
  {
    ...emptyIntervencion(),
    id: "i2",
    proyecto: "jauja",
    codigoPredio: "AERO-JAUJA-PR-0052",
    manzanaLote: "Mz. C Lt. 4",
    ubicacion: "Jauja / Jauja / Junín",
    fecha: "2026-04-02",
    sujetoNombre: "ANA JOSEFINA QUISPE",
    sujetoDni: "20456789",
    sujetoCalidad: "Propietaria",
    sujetoDireccion: "Jr. Huancayo 215, Jauja",
    sujetoTelefono: "964 112 233",
    actividades: ["Seguimiento", "Recojo de documentación", "Coordinación para tasación"],
    objetivo:
      "Recoger copia de la partida registral y coordinar la fecha de inspección para tasación.",
    desarrollo:
      "La titular entregó copia literal y DNI. Se fijó inspección para el 10/04/2026 con el perito.",
    aceptacion: "Favorable",
    preocupaciones: "Que la tasación considere las mejoras.",
    disposicion: "Acepta",
    riesgo: "Bajo",
    factores: "Mayor confianza tras la explicación del procedimiento.",
  },
  {
    ...emptyIntervencion(),
    id: "i3",
    proyecto: "piura",
    codigoPredio: "AERO-PIURA-PR-0117",
    manzanaLote: "Lt. 17",
    ubicacion: "Castilla / Piura / Piura",
    fecha: "2026-04-24",
    sujetoNombre: "LUIS ALBERTO CHÁVEZ RAMOS",
    sujetoDni: "02876543",
    sujetoCalidad: "Posesionario",
    sujetoDireccion: "Sector Norte, Castilla",
    actividades: ["Reunión informativa", "Negociación"],
    objetivo: "Atender el rechazo de la asociación a retirarse de la zona.",
    desarrollo:
      "Reunión con la directiva de la asociación. Insisten en sobrevaloración; se acordó una segunda reunión con el área de tasaciones.",
    aceptacion: "Desfavorable",
    preocupaciones: "Valor de los predios y reubicación.",
    disposicion: "Rechaza",
    riesgo: "Alto",
    factores: "Acción de amparo en curso; liderazgo organizado.",
  },
];

const seedCompromisos: Compromiso[] = [
  {
    id: "c1",
    proyecto: "piura",
    codigoPredio: "AERO-PIURA-PR-0117",
    actor: "Asociación de Posesionarios Sector Norte",
    compromiso:
      "Segunda reunión con el área de tasaciones para explicar la metodología de valuación.",
    responsable: CURRENT_USER.nombre,
    plazo: "2026-05-08",
    estado: "Pendiente",
    sustento: "Acta de reunión 24/04/2026",
  },
  {
    id: "c2",
    proyecto: "jauja",
    codigoPredio: "AERO-JAUJA-PR-0052",
    actor: "ANA JOSEFINA QUISPE",
    compromiso: "Inspección de campo con el perito tasador.",
    responsable: CURRENT_USER.nombre,
    plazo: "2026-04-10",
    estado: "Cumplido",
    sustento: "Acta 02/04/2026",
  },
];

const seedMedidas: Medida[] = [
  {
    id: "m1",
    proyecto: "cajamarca",
    codigoPredio: "AERO-CAJ-PR-0021",
    unidadSocial: "Familia Huamán Tello (5 miembros)",
    componente: "Programa de reasentamiento",
    medida: "Reubicación asistida a vivienda de reposición",
    origen: "Av. Hoyos Rubio km 3.5",
    destino: "Lote 12, Urb. Las Torrecitas",
    estado: "En implementación",
    resultado: "",
  },
  {
    id: "m2",
    proyecto: "cajamarca",
    codigoPredio: "AERO-CAJ-PR-0021",
    unidadSocial: "Familia Huamán Tello (5 miembros)",
    componente: "Restablecimiento socioeconómico",
    medida: "Capacitación y capital semilla para actividad ganadera",
    origen: "",
    destino: "",
    estado: "Programada",
    resultado: "",
  },
];

const seedStore = (): Store => ({
  antecedentes: seedAntecedentes,
  riesgos: seedRiesgos,
  actores: seedActores,
  intervenciones: seedIntervenciones,
  compromisos: seedCompromisos,
  medidas: seedMedidas,
});

function loadStore(): Store {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...seedStore(), ...(JSON.parse(raw) as Partial<Store>) };
  } catch {
    // Sin almacenamiento, se usa la semilla.
  }
  return seedStore();
}

// ---------------------------------------------------------------- formulario genérico

type StringKeys<T> = { [K in keyof T]: T[K] extends string ? K & string : never }[keyof T];
type FieldSpec<K extends string> = {
  key: K;
  label: string;
  type?: "text" | "date" | "time" | "select" | "textarea" | "predio" | "proyecto";
  options?: string[];
  full?: boolean;
};

function SpecForm<T>({
  fields,
  value,
  onChange,
}: {
  fields: FieldSpec<StringKeys<T>>[];
  value: T;
  onChange: (key: StringKeys<T>, value: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {fields.map((field) => {
        const current = String(value[field.key] ?? "");
        const set = (next: string) => onChange(field.key, next);
        let control: ReactNode;
        if (field.type === "select") {
          control = (
            <select className={inputCls} value={current} onChange={(e) => set(e.target.value)}>
              <option value="">Seleccione</option>
              {field.options?.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          );
        } else if (field.type === "proyecto") {
          control = (
            <select className={inputCls} value={current} onChange={(e) => set(e.target.value)}>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} · {p.tipo}
                </option>
              ))}
            </select>
          );
        } else if (field.type === "textarea") {
          control = (
            <textarea
              className={textareaCls}
              value={current}
              onChange={(e) => set(e.target.value)}
            />
          );
        } else {
          control = (
            <input
              type={field.type === "date" || field.type === "time" ? field.type : "text"}
              className={inputCls}
              value={current}
              list={field.type === "predio" ? "gs-predios" : undefined}
              onChange={(e) => set(e.target.value)}
            />
          );
        }
        return (
          <label key={field.key} className={field.full ? "md:col-span-2 xl:col-span-3" : ""}>
            <span className="mb-1 block text-[10px] font-semibold uppercase text-gray-500">
              {field.label}
            </span>
            {control}
          </label>
        );
      })}
    </div>
  );
}

const riesgoFields: FieldSpec<StringKeys<Riesgo>>[] = [
  { key: "proyecto", label: "Proyecto", type: "proyecto" },
  { key: "fecha", label: "Fecha de registro", type: "date" },
  { key: "etapa", label: "Etapa", type: "select", options: ETAPAS },
  { key: "denominacion", label: "Denominación del riesgo o suceso", full: true },
  {
    key: "tipo",
    label: "Tipo de riesgo",
    type: "select",
    options: ["Social", "Ambiental", "Institucional"],
  },
  {
    key: "grupo",
    label: "Grupo de interés que lo genera",
    type: "select",
    options: ["Individual", "Familiar", "Colectivo", "Institucional"],
  },
  { key: "latencia", label: "Tipo", type: "select", options: ["Latente", "Existente"] },
  { key: "codigoPredio", label: "Código de predio (opcional)", type: "predio" },
  { key: "nivel", label: "Nivel de riesgo", type: "select", options: NIVELES },
  { key: "semaforo", label: "Semaforización", type: "select", options: SEMAFORO },
  { key: "estado", label: "Estado del riesgo", type: "select", options: ESTADOS_RIESGO },
  { key: "antecedentes", label: "Antecedentes", type: "textarea" },
  { key: "causas", label: "Causas", type: "textarea" },
  { key: "efectos", label: "Efectos", type: "textarea" },
  { key: "accionesDesarrolladas", label: "Acciones desarrolladas", type: "textarea" },
  { key: "accionesADesarrollar", label: "Acciones a desarrollar", type: "textarea" },
];

const actorFields: FieldSpec<StringKeys<Actor>>[] = [
  { key: "proyecto", label: "Proyecto", type: "proyecto" },
  { key: "nombre", label: "Actor / organización" },
  {
    key: "tipo",
    label: "Tipo",
    type: "select",
    options: [
      "Autoridad local",
      "Comunidad",
      "Organización social",
      "Dirigente",
      "Gestor social",
      "Institución",
    ],
  },
  { key: "cargo", label: "Cargo / representante" },
  { key: "interes", label: "Nivel de interés", type: "select", options: NIVELES },
  { key: "poder", label: "Nivel de poder", type: "select", options: NIVELES },
  { key: "ambito", label: "Ámbito / predios vinculados" },
  { key: "telefono", label: "Teléfono" },
  { key: "correo", label: "Correo" },
];

const datosGeneralesFields: FieldSpec<StringKeys<Intervencion>>[] = [
  { key: "proyecto", label: "Proyecto", type: "proyecto" },
  { key: "codigoPredio", label: "Código del predio", type: "predio" },
  { key: "manzanaLote", label: "Manzana / Lote" },
  { key: "ubicacion", label: "Distrito / Provincia / Departamento" },
  { key: "fecha", label: "Fecha", type: "date" },
  { key: "horaInicio", label: "Hora inicio", type: "time" },
  { key: "horaFin", label: "Hora fin", type: "time" },
  { key: "gestor", label: "Gestor social" },
];

const sujetoFields: FieldSpec<StringKeys<Intervencion>>[] = [
  { key: "sujetoNombre", label: "Nombre completo" },
  { key: "sujetoDni", label: "DNI" },
  {
    key: "sujetoCalidad",
    label: "Calidad",
    type: "select",
    options: [
      "Propietario",
      "Propietaria",
      "Posesionario",
      "Posesionaria",
      "Ocupante",
      "Representante",
    ],
  },
  { key: "sujetoDireccion", label: "Dirección" },
  { key: "sujetoTelefono", label: "Teléfono" },
  { key: "sujetoCorreo", label: "Correo electrónico" },
];

const evaluacionFields: FieldSpec<StringKeys<Intervencion>>[] = [
  { key: "objetivo", label: "IV. Objetivo de la actividad", type: "textarea", full: true },
  { key: "desarrollo", label: "V. Desarrollo de la actividad", type: "textarea", full: true },
  { key: "aceptacion", label: "VI. Nivel de aceptación", type: "select", options: ACEPTACION },
  { key: "preocupaciones", label: "Principales preocupaciones", type: "textarea" },
  { key: "disposicion", label: "VII. Disposición", type: "select", options: DISPOSICION },
  { key: "riesgo", label: "Riesgo social", type: "select", options: NIVELES },
  { key: "factores", label: "Factores", type: "textarea" },
  { key: "observaciones", label: "VIII. Observaciones", type: "textarea", full: true },
];

const compromisoFields: FieldSpec<StringKeys<Compromiso>>[] = [
  { key: "proyecto", label: "Proyecto", type: "proyecto" },
  { key: "codigoPredio", label: "Código de predio", type: "predio" },
  { key: "actor", label: "Actor / sujeto pasivo" },
  { key: "compromiso", label: "Compromiso", type: "textarea", full: true },
  { key: "responsable", label: "Responsable" },
  { key: "plazo", label: "Plazo", type: "date" },
  {
    key: "estado",
    label: "Estado",
    type: "select",
    options: ["Pendiente", "En curso", "Cumplido", "Incumplido"],
  },
  { key: "sustento", label: "Sustento documental" },
];

const medidaFields: FieldSpec<StringKeys<Medida>>[] = [
  { key: "proyecto", label: "Proyecto", type: "proyecto" },
  { key: "codigoPredio", label: "Código de predio", type: "predio" },
  { key: "unidadSocial", label: "Unidad social" },
  {
    key: "componente",
    label: "Componente del PCRA",
    type: "select",
    options: [
      "Programa de reasentamiento",
      "Restablecimiento socioeconómico",
      "Compensación social",
      "Asistencia a población vulnerable",
    ],
  },
  { key: "medida", label: "Medida", full: true },
  { key: "origen", label: "Ubicación de origen" },
  { key: "destino", label: "Ubicación de destino" },
  {
    key: "estado",
    label: "Estado",
    type: "select",
    options: ["Programada", "En implementación", "Implementada", "Cerrada"],
  },
  { key: "resultado", label: "Resultado alcanzado", type: "textarea", full: true },
];

// ---------------------------------------------------------------- documentos Word

const esc = (v: string) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
const check = (label: string, on: boolean) => `${on ? "☒" : "☐"} ${esc(label)}`;
const kv = (rows: [string, string][]) =>
  `<table>${rows
    .map(
      ([k, v]) =>
        `<tr><td style="width:38%;background:#f3f4f6"><b>${esc(k)}</b></td><td>${esc(v) || "&nbsp;"}</td></tr>`,
    )
    .join("")}</table>`;
const lines = (text: string) =>
  text.trim()
    ? `<p>${esc(text).replace(/\n/g, "<br>")}</p>`
    : "<p>" + "_".repeat(95) + "<br>" + "_".repeat(95) + "</p>";

function downloadDoc(fileName: string, body: string) {
  const html = `<!doctype html><html><head><meta charset="UTF-8"><style>
    body{font-family:Arial,sans-serif;font-size:10.5pt;color:#111;line-height:1.35}
    h1{font-size:12.5pt;text-align:center;margin:0 0 4px}
    h2{font-size:10.5pt;background:#e5e7eb;padding:3px 6px;margin:14px 0 6px}
    table{border-collapse:collapse;width:100%;margin-bottom:6px}
    td,th{border:1px solid #555;padding:4px 6px;vertical-align:top;font-size:10pt}
    .sig td{border:none;text-align:center;padding-top:46px}
  </style></head><body>${body}</body></html>`;
  const url = URL.createObjectURL(
    new Blob(["﻿", html], { type: "application/msword;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function actaBody(i: Intervencion) {
  return `
<h1>FORMATO DE REGISTRO DE ACTIVIDADES DE GESTIÓN SOCIAL DESARROLLADAS CON SUJETOS PASIVOS</h1>
<p style="text-align:center;margin:0">Dirección de Disponibilidad de Predios (DDP)<br>Formato para Gestores Sociales</p>
<h2>I. DATOS GENERALES</h2>
${kv([
  ["Proyecto", projectName(i.proyecto)],
  ["Código del Predio", i.codigoPredio],
  ["Manzana / Lote", i.manzanaLote],
  ["Distrito / Provincia / Departamento", i.ubicacion],
  ["Fecha", fmtDate(i.fecha)],
  ["Hora Inicio - Fin", `${i.horaInicio} - ${i.horaFin}`],
  ["Gestor Social", i.gestor],
])}
<h2>II. IDENTIFICACIÓN DEL SUJETO PASIVO</h2>
${kv([
  ["Nombre completo", i.sujetoNombre],
  ["DNI", i.sujetoDni],
  ["Calidad", i.sujetoCalidad],
  ["Dirección", i.sujetoDireccion],
  ["Teléfono", i.sujetoTelefono],
  ["Correo electrónico", i.sujetoCorreo],
])}
<h2>III. TIPO DE ACTIVIDAD</h2>
<table><tr><td style="border:none">${ACTIVIDADES.slice(0, 7)
    .map((a) => check(a, i.actividades.includes(a)))
    .join("<br>")}</td><td style="border:none">${ACTIVIDADES.slice(7)
    .map((a) => check(a, i.actividades.includes(a)))
    .join(
      "<br>",
    )}<br>${check("Otro: " + (i.otraActividad || "__________________"), !!i.otraActividad)}</td></tr></table>
<h2>IV. OBJETIVO DE LA ACTIVIDAD</h2>${lines(i.objetivo)}
<h2>V. DESARROLLO DE LA ACTIVIDAD</h2>${lines(i.desarrollo)}
<h2>VI. PERCEPCIÓN DEL SUJETO PASIVO</h2>
<p>Nivel de aceptación: ${ACEPTACION.map((a) => check(a, i.aceptacion === a)).join(" &nbsp; ")}</p>
<p>Principales preocupaciones: ${esc(i.preocupaciones) || "__________________________________________"}</p>
<h2>VII. EVALUACIÓN SOCIAL</h2>
<p>Disposición: ${DISPOSICION.map((d) => check(d, i.disposicion === d)).join(" &nbsp; ")}</p>
<p>Riesgo social: ${NIVELES.map((n) => check(n, i.riesgo === n)).join(" &nbsp; ")}</p>
<p>Factores: ${esc(i.factores) || "__________________________________________"}</p>
<h2>VIII. OBSERVACIONES</h2>${lines(i.observaciones)}
<h2>IX. FIRMAS</h2>
<table class="sig"><tr><td>__________________________<br>Gestor Social<br>${esc(i.gestor)}</td><td>__________________________<br>Sujeto Pasivo<br>${esc(i.sujetoNombre)}</td></tr></table>`;
}

function fichaBody(i: Intervencion) {
  const p = proyectos.find((x) => x.id === i.proyecto);
  const titulo =
    p?.tipo === "Aeroportuarios"
      ? `AFECTACIÓN INDIVIDUAL POR LA AMPLIACIÓN DEL AEROPUERTO DE LA CIUDAD DE ${p.nombre.toUpperCase()}`
      : `AFECTACIÓN INDIVIDUAL POR EL PROYECTO ${projectName(i.proyecto).toUpperCase()}`;
  const persona = (rol: string, nombre: string, dni: string, cel: string) =>
    `<td style="border:none"><br><br>_____________________________________<br>Firma del ${rol}<br><br>Nombre: ${esc(nombre) || "……………………………………"}<br><br>DNI: ${esc(dni) || "……………………………"}<br><br>Celular: ${esc(cel) || "……………………………"}</td>`;
  return `
<h1>FICHA TÉCNICA DE EMPADRONAMIENTO</h1>
<p style="text-align:center;margin:0"><b>${titulo}</b><br>(D.L. N° 1192 Y SUS MODIFICATORIAS)</p>
<h2>DATOS DEL PREDIO</h2>
${kv([
  ["Proyecto", projectName(i.proyecto)],
  ["Código del Predio", i.codigoPredio],
  ["Manzana / Lote", i.manzanaLote],
  ["Distrito / Provincia / Departamento", i.ubicacion],
  ["Fecha de empadronamiento", fmtDate(i.fecha)],
])}
<h2>DATOS DEL POSESIONARIO</h2>
${kv([
  ["Nombre completo", i.sujetoNombre],
  ["DNI", i.sujetoDni],
  ["Calidad", i.sujetoCalidad],
  ["Dirección", i.sujetoDireccion],
  ["Teléfono", i.sujetoTelefono],
])}
<h2>OBSERVACIONES</h2>${lines(i.observaciones)}
<table><tr>${persona("posesionario", i.sujetoNombre, i.sujetoDni, i.sujetoTelefono)}${persona("empadronador", i.gestor, "", "")}</tr>
<tr><td colspan="2" style="border:none;text-align:right">Fecha: ${fmtDate(i.fecha) || "………/………/………"}</td></tr></table>`;
}

const safeName = (v: string) => v.replace(/[^A-Z0-9-]/gi, "_");
const descargarActa = (i: Intervencion) =>
  downloadDoc(
    `acta_gestion_social_${safeName(i.codigoPredio || i.sujetoNombre || "sin-codigo")}_${i.fecha}.doc`,
    actaBody(i),
  );
const descargarFicha = (i: Intervencion) =>
  downloadDoc(
    `ficha_empadronamiento_${safeName(i.codigoPredio || i.sujetoNombre || "sin-codigo")}.doc`,
    fichaBody(i),
  );

// ---------------------------------------------------------------- página

type Tab = "marco" | "proyecto" | "actores" | "historial" | "acta" | "pcra";
const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "marco", label: "Alcance y marco", icon: BookOpen },
  { id: "proyecto", label: "Antecedentes y riesgos", icon: AlertTriangle },
  { id: "actores", label: "Actores sociales", icon: Users },
  { id: "historial", label: "Historial por propietario", icon: History },
  { id: "acta", label: "Registrar intervención / acta", icon: ClipboardList },
  { id: "pcra", label: "Medidas PCRA", icon: Landmark },
];

function GestionSocialPage() {
  const [store, setStore] = useState<Store>(loadStore);
  const [tab, setTab] = useState<Tab>("proyecto");
  const [proyecto, setProyecto] = useState("pucallpa");
  const [draft, setDraft] = useState<Intervencion>(emptyIntervencion);
  const [notice, setNotice] = useState("");

  function persist(next: Store) {
    setStore(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // El prototipo sigue funcionando en memoria.
    }
  }

  const stats = useMemo(
    () => ({
      intervenciones: store.intervenciones.length,
      sujetos: new Set(store.intervenciones.map((i) => i.sujetoDni || i.sujetoNombre)).size,
      abiertos: store.riesgos.filter((r) => r.estado !== "Atendido").length,
      prioritarios: store.riesgos.filter((r) => r.semaforo === "Atención prioritaria").length,
    }),
    [store],
  );

  function setDraftField(key: StringKeys<Intervencion>, value: string) {
    setDraft((d) => {
      const next = { ...d, [key]: value };
      if (key === "codigoPredio") {
        const predio = predioRows.find((p) => p.codigo === value);
        if (predio) {
          next.sujetoNombre = predio.suj;
          next.ubicacion = next.ubicacion || predio.ciudad;
          next.sujetoCalidad = /POSE/i.test(predio.cond) ? "Posesionario" : next.sujetoCalidad;
        }
      }
      return next;
    });
  }

  function guardarIntervencion(descargar: boolean) {
    if (!draft.sujetoNombre.trim() || !draft.codigoPredio.trim()) {
      setNotice("Indique el código del predio y el nombre del sujeto pasivo.");
      return;
    }
    const saved = { ...draft, id: draft.id || uid() };
    const rest = store.intervenciones.filter((i) => i.id !== saved.id);
    persist({ ...store, intervenciones: [saved, ...rest] });
    if (descargar) descargarActa(saved);
    setNotice(`Intervención registrada para ${saved.sujetoNombre}.`);
    setDraft(emptyIntervencion());
    setTab("historial");
  }

  function continuar(i: Intervencion) {
    setDraft({
      ...emptyIntervencion(),
      proyecto: i.proyecto,
      codigoPredio: i.codigoPredio,
      manzanaLote: i.manzanaLote,
      ubicacion: i.ubicacion,
      sujetoNombre: i.sujetoNombre,
      sujetoDni: i.sujetoDni,
      sujetoCalidad: i.sujetoCalidad,
      sujetoDireccion: i.sujetoDireccion,
      sujetoTelefono: i.sujetoTelefono,
      sujetoCorreo: i.sujetoCorreo,
      actividades: ["Seguimiento"],
    });
    setTab("acta");
  }

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937]">
      <AppSidebar />
      <datalist id="gs-predios">
        {predioRows.map((p) => (
          <option key={p.rowId} value={p.codigo}>
            {p.suj}
          </option>
        ))}
      </datalist>
      <main className="min-w-0 flex-1 overflow-auto">
        <div className="px-5 pb-8 pt-5 xl:px-8">
          <header className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#dc2626]">
              Módulo transversal
            </p>
            <div className="mt-1 flex items-center gap-2.5">
              <Handshake size={22} className="text-[#dc2626]" />
              <h1 className="text-[20px] font-semibold text-gray-900">Gestión Predial Social</h1>
            </div>
            <p className="mt-1 max-w-4xl text-[12px] leading-5 text-gray-500">
              Documenta las intervenciones sociales por proyecto y por sujeto pasivo: antecedentes,
              riesgos, actores, atención en campo, compromisos y medidas del PCRA, con generación de
              actas en Word para dar continuidad a la gestión.
            </p>
          </header>

          <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Intervenciones registradas" value={stats.intervenciones} tone="blue" />
            <Metric label="Sujetos pasivos atendidos" value={stats.sujetos} tone="green" />
            <Metric label="Riesgos abiertos" value={stats.abiertos} tone="amber" />
            <Metric label="Atención prioritaria" value={stats.prioritarios} tone="red" />
          </section>

          {notice && (
            <div className="mb-4 flex items-center justify-between rounded border border-green-200 bg-green-50 px-3 py-2 text-[12px] text-green-700">
              {notice}
              <button type="button" onClick={() => setNotice("")} className="font-bold">
                ×
              </button>
            </div>
          )}

          <section className="rounded-md border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <div className="mb-4 flex flex-wrap gap-1 border-b">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-[12px] font-medium ${
                    tab === id
                      ? "border-[#dc2626] text-[#dc2626]"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {tab === "marco" && <MarcoTab />}
            {tab === "proyecto" && (
              <ProyectoTab
                store={store}
                persist={persist}
                proyecto={proyecto}
                setProyecto={setProyecto}
              />
            )}
            {tab === "actores" && (
              <CrudTab<Actor>
                titulo="Matriz de actores sociales y directorio"
                items={store.actores}
                fields={actorFields}
                empty={{
                  id: "",
                  proyecto,
                  nombre: "",
                  tipo: "",
                  cargo: "",
                  interes: "Medio",
                  poder: "Medio",
                  ambito: "",
                  telefono: "",
                  correo: "",
                }}
                columns={[
                  ["Proyecto", (a) => projectName(a.proyecto)],
                  ["Actor", (a) => a.nombre],
                  ["Tipo", (a) => a.tipo],
                  ["Cargo / representante", (a) => a.cargo],
                  ["Interés", (a) => <Pill level={a.interes} />],
                  ["Poder", (a) => <Pill level={a.poder} />],
                  ["Ámbito", (a) => a.ambito],
                  ["Contacto", (a) => [a.telefono, a.correo].filter(Boolean).join(" · ")],
                ]}
                onChange={(actores) => persist({ ...store, actores })}
              />
            )}
            {tab === "historial" && (
              <HistorialTab
                store={store}
                persist={persist}
                onContinuar={continuar}
                proyectoDefault={proyecto}
              />
            )}
            {tab === "acta" && (
              <ActaTab
                draft={draft}
                setField={setDraftField}
                setDraft={setDraft}
                onSave={guardarIntervencion}
              />
            )}
            {tab === "pcra" && (
              <CrudTab<Medida>
                titulo="Medidas sociales del PCRA por unidad social"
                items={store.medidas}
                fields={medidaFields}
                empty={{
                  id: "",
                  proyecto,
                  codigoPredio: "",
                  unidadSocial: "",
                  componente: "",
                  medida: "",
                  origen: "",
                  destino: "",
                  estado: "Programada",
                  resultado: "",
                }}
                columns={[
                  ["Proyecto", (m) => projectName(m.proyecto)],
                  ["Predio", (m) => m.codigoPredio],
                  ["Unidad social", (m) => m.unidadSocial],
                  ["Componente", (m) => m.componente],
                  ["Medida", (m) => m.medida],
                  ["Origen → destino", (m) => [m.origen, m.destino].filter(Boolean).join(" → ")],
                  ["Estado", (m) => <Pill level={m.estado} />],
                  ["Resultado", (m) => m.resultado],
                ]}
                onChange={(medidas) => persist({ ...store, medidas })}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------- tabs

function MarcoTab() {
  return (
    <div className="space-y-5 text-[12px] leading-5 text-gray-700">
      <p>
        El Módulo de Gestión Predial Social constituye el componente transversal de la Plataforma
        Digital de Gestión de Predios orientado a gestionar la información y las actuaciones
        sociales vinculadas con los procesos de adquisición de predios. Articula la dimensión social
        con el ámbito territorial del proyecto y con las Áreas Afectadas individualizadas (Predios),
        incorporando capacidades de registro, gestión geoespacial y trazabilidad, y facilitando la
        identificación y atención de situaciones sociales y la gestión de las medidas e instrumentos
        sociales que correspondan a cada proyecto.
      </p>
      {SECCIONES_MARCO.map((s) => (
        <div key={s.titulo}>
          <h3 className="mb-1 text-[13px] font-semibold text-[#dc2626]">{s.titulo}</h3>
          <p>{s.parrafo}</p>
          {s.items.length > 0 && (
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {s.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function ProyectoTab({
  store,
  persist,
  proyecto,
  setProyecto,
}: {
  store: Store;
  persist: (s: Store) => void;
  proyecto: string;
  setProyecto: (id: string) => void;
}) {
  const [texto, setTexto] = useState(store.antecedentes[proyecto] ?? "");
  const [nuevo, setNuevo] = useState<Riesgo | null>(null);
  const [cambio, setCambio] = useState<{ id: string; nivel: string; sustento: string } | null>(
    null,
  );
  const riesgos = store.riesgos.filter((r) => r.proyecto === proyecto);
  const intervenciones = store.intervenciones.filter((i) => i.proyecto === proyecto);

  function cambiarProyecto(id: string) {
    setProyecto(id);
    setTexto(store.antecedentes[id] ?? "");
    setNuevo(null);
  }

  function guardarCambioNivel() {
    if (!cambio) return;
    persist({
      ...store,
      riesgos: store.riesgos.map((r) =>
        r.id !== cambio.id || r.nivel === cambio.nivel
          ? r
          : {
              ...r,
              nivel: cambio.nivel,
              historial: [
                ...r.historial,
                {
                  fecha: today(),
                  anterior: r.nivel,
                  nueva: cambio.nivel,
                  sustento: cambio.sustento,
                  usuario: CURRENT_USER.nombre,
                },
              ],
            },
      ),
    });
    setCambio(null);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-[280px_minmax(0,1fr)]">
        <label>
          <span className="mb-1 block text-[10px] font-semibold uppercase text-gray-500">
            Proyecto
          </span>
          <select
            className={inputCls}
            value={proyecto}
            onChange={(e) => cambiarProyecto(e.target.value)}
          >
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} · {p.tipo}
              </option>
            ))}
          </select>
        </label>
        <div className="text-[11px] text-gray-500 md:self-end">
          {intervenciones.length} intervenciones · {riesgos.length} riesgos registrados ·{" "}
          {store.actores.filter((a) => a.proyecto === proyecto).length} actores
        </div>
      </div>

      <div>
        <SectionTitle>Antecedentes sociales del proyecto</SectionTitle>
        <textarea
          className={textareaCls + " min-h-24"}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Diagnóstico social, contexto, hitos y acuerdos previos del proyecto…"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className={btnPrimary}
            onClick={() =>
              persist({ ...store, antecedentes: { ...store.antecedentes, [proyecto]: texto } })
            }
          >
            <Save size={14} /> Guardar antecedentes
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <SectionTitle>Matriz de riesgos, incidencias y conflictos sociales</SectionTitle>
          <button
            type="button"
            className={btnOutline}
            onClick={() =>
              setNuevo({
                id: "",
                proyecto,
                fecha: today(),
                etapa: "Adquisición",
                denominacion: "",
                tipo: "Social",
                grupo: "Individual",
                latencia: "Existente",
                antecedentes: "",
                causas: "",
                efectos: "",
                accionesDesarrolladas: "",
                accionesADesarrollar: "",
                nivel: "Medio",
                semaforo: "Seguimiento preventivo",
                estado: "No atendido",
                codigoPredio: "",
                historial: [],
              })
            }
          >
            <Plus size={14} /> Registrar riesgo
          </button>
        </div>
        {nuevo && (
          <div className="mb-3 rounded border border-red-100 bg-red-50/40 p-3">
            <SpecForm<Riesgo>
              fields={riesgoFields}
              value={nuevo}
              onChange={(k, v) => setNuevo({ ...nuevo, [k]: v })}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" className={btnGhost} onClick={() => setNuevo(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className={btnPrimary}
                disabled={!nuevo.denominacion.trim()}
                onClick={() => {
                  persist({ ...store, riesgos: [...store.riesgos, { ...nuevo, id: uid() }] });
                  setNuevo(null);
                }}
              >
                <Save size={14} /> Guardar riesgo
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full min-w-[1400px] text-[11px]">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                {[
                  "N°",
                  "Fecha",
                  "Etapa",
                  "Denominación del riesgo o suceso",
                  "Tipo",
                  "Grupo de interés",
                  "Latente / Existente",
                  "Causas",
                  "Efectos",
                  "Acciones desarrolladas",
                  "Acciones a desarrollar",
                  "Nivel",
                  "Semáforo",
                  "Estado",
                  "",
                ].map((h) => (
                  <th key={h} className="px-2 py-2 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {riesgos.map((r, idx) => (
                <tr key={r.id} className="border-t align-top">
                  <td className="px-2 py-2">{idx + 1}</td>
                  <td className="px-2 py-2 whitespace-nowrap">{fmtDate(r.fecha)}</td>
                  <td className="px-2 py-2">{r.etapa}</td>
                  <td className="px-2 py-2 min-w-[220px]">
                    <p className="font-medium text-gray-800">{r.denominacion}</p>
                    {r.codigoPredio && (
                      <p className="text-[10px] text-gray-400">{r.codigoPredio}</p>
                    )}
                    {r.historial.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-[10px] text-gray-500">
                        {r.historial.map((h, i) => (
                          <li key={i}>
                            {fmtDate(h.fecha)}: {h.anterior} → {h.nueva} ·{" "}
                            {h.sustento || "sin sustento"} · {h.usuario}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-2 py-2">{r.tipo}</td>
                  <td className="px-2 py-2">{r.grupo}</td>
                  <td className="px-2 py-2">{r.latencia}</td>
                  <td className="px-2 py-2 min-w-[160px]">{r.causas}</td>
                  <td className="px-2 py-2 min-w-[160px]">{r.efectos}</td>
                  <td className="px-2 py-2 min-w-[160px]">{r.accionesDesarrolladas}</td>
                  <td className="px-2 py-2 min-w-[160px]">{r.accionesADesarrollar}</td>
                  <td className="px-2 py-2">
                    {cambio?.id === r.id ? (
                      <div className="space-y-1">
                        <select
                          className={inputCls}
                          value={cambio.nivel}
                          onChange={(e) => setCambio({ ...cambio, nivel: e.target.value })}
                        >
                          {NIVELES.map((n) => (
                            <option key={n}>{n}</option>
                          ))}
                        </select>
                        <input
                          className={inputCls}
                          placeholder="Sustento"
                          value={cambio.sustento}
                          onChange={(e) => setCambio({ ...cambio, sustento: e.target.value })}
                        />
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className={btnPrimary + " h-7 px-2"}
                            onClick={guardarCambioNivel}
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            className={btnGhost + " h-7 px-2"}
                            onClick={() => setCambio(null)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        title="Cambiar nivel de riesgo"
                        onClick={() => setCambio({ id: r.id, nivel: r.nivel, sustento: "" })}
                      >
                        <Pill level={r.nivel} />
                      </button>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <select
                      className={inputCls + " h-7"}
                      value={r.semaforo}
                      onChange={(e) =>
                        persist({
                          ...store,
                          riesgos: store.riesgos.map((x) =>
                            x.id === r.id ? { ...x, semaforo: e.target.value } : x,
                          ),
                        })
                      }
                    >
                      {SEMAFORO.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      className={inputCls + " h-7"}
                      value={r.estado}
                      onChange={(e) =>
                        persist({
                          ...store,
                          riesgos: store.riesgos.map((x) =>
                            x.id === r.id ? { ...x, estado: e.target.value } : x,
                          ),
                        })
                      }
                    >
                      {ESTADOS_RIESGO.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      aria-label="Eliminar riesgo"
                      className="text-gray-400 hover:text-red-600"
                      onClick={() =>
                        persist({ ...store, riesgos: store.riesgos.filter((x) => x.id !== r.id) })
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {!riesgos.length && (
                <tr>
                  <td colSpan={15} className="px-4 py-8 text-center text-gray-400">
                    Sin riesgos registrados para este proyecto.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function HistorialTab({
  store,
  persist,
  onContinuar,
  proyectoDefault,
}: {
  store: Store;
  persist: (s: Store) => void;
  onContinuar: (i: Intervencion) => void;
  proyectoDefault: string;
}) {
  const [proyecto, setProyecto] = useState("");
  const [query, setQuery] = useState("");
  const [nuevoCompromiso, setNuevoCompromiso] = useState<Compromiso | null>(null);

  const grupos = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, Intervencion[]>();
    store.intervenciones
      .filter((i) => !proyecto || i.proyecto === proyecto)
      .filter(
        (i) => !q || `${i.sujetoNombre} ${i.sujetoDni} ${i.codigoPredio}`.toLowerCase().includes(q),
      )
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .forEach((i) => {
        const key = i.sujetoDni || i.sujetoNombre;
        map.set(key, [...(map.get(key) ?? []), i]);
      });
    return Array.from(map.values());
  }, [store.intervenciones, proyecto, query]);

  const compromisos = store.compromisos.filter((c) => !proyecto || c.proyecto === proyecto);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-[260px_minmax(0,1fr)]">
        <label>
          <span className="mb-1 block text-[10px] font-semibold uppercase text-gray-500">
            Proyecto
          </span>
          <select
            className={inputCls}
            value={proyecto}
            onChange={(e) => setProyecto(e.target.value)}
          >
            <option value="">Todos los proyectos</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[10px] font-semibold uppercase text-gray-500">
            Sujeto pasivo, DNI o código de predio
          </span>
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className={inputCls + " pl-8"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
            />
          </div>
        </label>
      </div>

      <SectionTitle>Historial de temas sociales por propietario</SectionTitle>
      {!grupos.length && (
        <p className="text-[12px] text-gray-400">
          Sin intervenciones registradas con estos filtros.
        </p>
      )}
      {grupos.map((lista) => {
        const ultima = lista[0];
        return (
          <div
            key={ultima.sujetoDni || ultima.sujetoNombre}
            className="rounded border border-gray-200"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-gray-50 px-3 py-2">
              <div>
                <p className="text-[13px] font-semibold text-gray-800">{ultima.sujetoNombre}</p>
                <p className="text-[11px] text-gray-500">
                  DNI {ultima.sujetoDni || "—"} · {ultima.sujetoCalidad} · {ultima.codigoPredio} ·{" "}
                  {projectName(ultima.proyecto)} · {lista.length} intervención
                  {lista.length === 1 ? "" : "es"} · última disposición:{" "}
                  <Pill level={ultima.disposicion} />
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className={btnGhost} onClick={() => descargarFicha(ultima)}>
                  <FileDown size={14} /> Ficha de empadronamiento (Word)
                </button>
                <button type="button" className={btnPrimary} onClick={() => onContinuar(ultima)}>
                  <Plus size={14} /> Nueva intervención (continuidad)
                </button>
              </div>
            </div>
            <table className="w-full text-[11px]">
              <thead className="text-left text-gray-500">
                <tr>
                  {[
                    "Fecha",
                    "Actividades",
                    "Objetivo / desarrollo",
                    "Aceptación",
                    "Disposición",
                    "Riesgo",
                    "Gestor",
                    "Acta",
                  ].map((h) => (
                    <th key={h} className="px-3 py-1.5 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map((i) => (
                  <tr key={i.id} className="border-t align-top">
                    <td className="px-3 py-2 whitespace-nowrap">{fmtDate(i.fecha)}</td>
                    <td className="px-3 py-2">
                      {[...i.actividades, i.otraActividad].filter(Boolean).join(", ")}
                    </td>
                    <td className="px-3 py-2 max-w-[420px]">
                      <p className="font-medium text-gray-800">{i.objetivo}</p>
                      <p className="text-gray-500">{i.desarrollo}</p>
                      {i.preocupaciones && (
                        <p className="text-[10px] text-gray-400">
                          Preocupaciones: {i.preocupaciones}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2">{i.aceptacion}</td>
                    <td className="px-3 py-2">
                      <Pill level={i.disposicion} />
                    </td>
                    <td className="px-3 py-2">
                      <Pill level={i.riesgo} />
                    </td>
                    <td className="px-3 py-2">{i.gestor}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button
                        type="button"
                        className={btnOutline + " h-7"}
                        onClick={() => descargarActa(i)}
                      >
                        <FileDown size={13} /> Word
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      <div>
        <div className="flex items-center justify-between">
          <SectionTitle>Acuerdos y compromisos</SectionTitle>
          <button
            type="button"
            className={btnOutline}
            onClick={() =>
              setNuevoCompromiso({
                id: "",
                proyecto: proyecto || proyectoDefault,
                codigoPredio: "",
                actor: "",
                compromiso: "",
                responsable: CURRENT_USER.nombre,
                plazo: today(),
                estado: "Pendiente",
                sustento: "",
              })
            }
          >
            <Plus size={14} /> Registrar compromiso
          </button>
        </div>
        {nuevoCompromiso && (
          <div className="mb-3 rounded border border-red-100 bg-red-50/40 p-3">
            <SpecForm<Compromiso>
              fields={compromisoFields}
              value={nuevoCompromiso}
              onChange={(k, v) => setNuevoCompromiso({ ...nuevoCompromiso, [k]: v })}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" className={btnGhost} onClick={() => setNuevoCompromiso(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className={btnPrimary}
                disabled={!nuevoCompromiso.compromiso.trim()}
                onClick={() => {
                  persist({
                    ...store,
                    compromisos: [...store.compromisos, { ...nuevoCompromiso, id: uid() }],
                  });
                  setNuevoCompromiso(null);
                }}
              >
                <Save size={14} /> Guardar
              </button>
            </div>
          </div>
        )}
        <SimpleTable
          rows={compromisos}
          empty="Sin compromisos registrados."
          columns={[
            ["Proyecto", (c) => projectName(c.proyecto)],
            ["Predio", (c) => c.codigoPredio],
            ["Actor", (c) => c.actor],
            ["Compromiso", (c) => c.compromiso],
            ["Responsable", (c) => c.responsable],
            ["Plazo", (c) => fmtDate(c.plazo)],
            ["Estado", (c) => <Pill level={c.estado} />],
            ["Sustento", (c) => c.sustento],
          ]}
          onDelete={(c) =>
            persist({ ...store, compromisos: store.compromisos.filter((x) => x.id !== c.id) })
          }
        />
      </div>
    </div>
  );
}

function ActaTab({
  draft,
  setField,
  setDraft,
  onSave,
}: {
  draft: Intervencion;
  setField: (key: StringKeys<Intervencion>, value: string) => void;
  setDraft: (i: Intervencion) => void;
  onSave: (descargar: boolean) => void;
}) {
  const toggle = (a: string) =>
    setDraft({
      ...draft,
      actividades: draft.actividades.includes(a)
        ? draft.actividades.filter((x) => x !== a)
        : [...draft.actividades, a],
    });
  return (
    <div className="space-y-5">
      <p className="text-[11px] text-gray-500">
        Formato de registro de actividades de gestión social desarrolladas con sujetos pasivos ·
        Dirección de Disponibilidad de Predios (DDP) · Formato para gestores sociales.
      </p>
      <SectionTitle>I. Datos generales</SectionTitle>
      <SpecForm<Intervencion> fields={datosGeneralesFields} value={draft} onChange={setField} />
      <SectionTitle>II. Identificación del sujeto pasivo</SectionTitle>
      <SpecForm<Intervencion> fields={sujetoFields} value={draft} onChange={setField} />
      <SectionTitle>III. Tipo de actividad</SectionTitle>
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
        {ACTIVIDADES.map((a) => (
          <label key={a} className="flex items-center gap-2 text-[12px] text-gray-700">
            <input
              type="checkbox"
              className="size-3.5 accent-[#dc2626]"
              checked={draft.actividades.includes(a)}
              onChange={() => toggle(a)}
            />
            {a}
          </label>
        ))}
        <label className="flex items-center gap-2 text-[12px] text-gray-700">
          Otro:
          <input
            className={inputCls + " h-7"}
            value={draft.otraActividad}
            onChange={(e) => setField("otraActividad", e.target.value)}
          />
        </label>
      </div>
      <SectionTitle>
        IV – VIII. Objetivo, desarrollo, percepción, evaluación y observaciones
      </SectionTitle>
      <SpecForm<Intervencion> fields={evaluacionFields} value={draft} onChange={setField} />
      <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
        <button type="button" className={btnGhost} onClick={() => setDraft(emptyIntervencion())}>
          Limpiar
        </button>
        <button type="button" className={btnOutline} onClick={() => descargarFicha(draft)}>
          <FileDown size={14} /> Ficha de empadronamiento (Word)
        </button>
        <button type="button" className={btnOutline} onClick={() => descargarActa(draft)}>
          <FileDown size={14} /> Vista previa del acta (Word)
        </button>
        <button type="button" className={btnGhost} onClick={() => onSave(false)}>
          <Save size={14} /> Guardar
        </button>
        <button type="button" className={btnPrimary} onClick={() => onSave(true)}>
          <FileDown size={14} /> Guardar y generar acta (Word)
        </button>
      </div>
    </div>
  );
}

// Tabla + formulario de alta para catálogos simples (actores, medidas PCRA).
function CrudTab<T extends { id: string }>({
  titulo,
  items,
  fields,
  empty,
  columns,
  onChange,
}: {
  titulo: string;
  items: T[];
  fields: FieldSpec<StringKeys<T>>[];
  empty: T;
  columns: [string, (row: T) => ReactNode][];
  onChange: (items: T[]) => void;
}) {
  const [nuevo, setNuevo] = useState<T | null>(null);
  return (
    <div>
      <div className="flex items-center justify-between">
        <SectionTitle>{titulo}</SectionTitle>
        <button type="button" className={btnOutline} onClick={() => setNuevo(empty)}>
          <Plus size={14} /> Registrar
        </button>
      </div>
      {nuevo && (
        <div className="mb-3 rounded border border-red-100 bg-red-50/40 p-3">
          <SpecForm<T>
            fields={fields}
            value={nuevo}
            onChange={(k, v) => setNuevo({ ...nuevo, [k]: v })}
          />
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" className={btnGhost} onClick={() => setNuevo(null)}>
              Cancelar
            </button>
            <button
              type="button"
              className={btnPrimary}
              onClick={() => {
                onChange([...items, { ...nuevo, id: uid() }]);
                setNuevo(null);
              }}
            >
              <Save size={14} /> Guardar
            </button>
          </div>
        </div>
      )}
      <SimpleTable
        rows={items}
        columns={columns}
        empty="Sin registros."
        onDelete={(row) => onChange(items.filter((x) => x.id !== row.id))}
      />
    </div>
  );
}

function SimpleTable<T extends { id: string }>({
  rows,
  columns,
  empty,
  onDelete,
}: {
  rows: T[];
  columns: [string, (row: T) => ReactNode][];
  empty: string;
  onDelete: (row: T) => void;
}) {
  return (
    <div className="overflow-x-auto rounded border border-gray-200">
      <table className="w-full min-w-[900px] text-[11px]">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            {columns.map(([h]) => (
              <th key={h} className="px-2 py-2 font-semibold">
                {h}
              </th>
            ))}
            <th className="px-2 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t align-top">
              {columns.map(([h, render]) => (
                <td key={h} className="px-2 py-2">
                  {render(row)}
                </td>
              ))}
              <td className="px-2 py-2">
                <button
                  type="button"
                  aria-label="Eliminar"
                  className="text-gray-400 hover:text-red-600"
                  onClick={() => onDelete(row)}
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-400">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------- piezas

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-1 border-b border-gray-200 pb-1">
      <h3 className="text-[13px] font-semibold" style={{ color: RED }}>
        {children}
      </h3>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "green" | "amber" | "red";
}) {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };
  return (
    <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-3 shadow-sm">
      <span
        className={
          "inline-flex size-9 items-center justify-center rounded border text-[15px] font-semibold " +
          tones[tone]
        }
      >
        {value}
      </span>
      <p className="text-[11px] text-gray-500">{label}</p>
    </div>
  );
}

const PILL: Record<string, string> = {
  Bajo: "bg-green-100 text-green-700",
  Medio: "bg-amber-100 text-amber-700",
  Alto: "bg-red-100 text-red-700",
  Acepta: "bg-green-100 text-green-700",
  "En evaluación": "bg-amber-100 text-amber-700",
  "Requiere mayor información": "bg-blue-100 text-blue-700",
  Rechaza: "bg-red-100 text-red-700",
  Cumplido: "bg-green-100 text-green-700",
  Pendiente: "bg-amber-100 text-amber-700",
  "En curso": "bg-blue-100 text-blue-700",
  Incumplido: "bg-red-100 text-red-700",
  Implementada: "bg-green-100 text-green-700",
  Cerrada: "bg-green-100 text-green-700",
  "En implementación": "bg-blue-100 text-blue-700",
  Programada: "bg-amber-100 text-amber-700",
};

function Pill({ level }: { level: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded px-2 py-0.5 text-[10px] font-bold ${PILL[level] ?? "bg-gray-100 text-gray-600"}`}
    >
      {level || "—"}
    </span>
  );
}
