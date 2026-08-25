import {
  Banknote,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileCode,
  FileText,
  Folder,
  HandCoins,
  Home,
  Landmark,
  LineChart,
  MapPinned,
  Ruler,
  ScanSearch,
  Search,
  Send,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export type PredioRoute =
  | "/proyectos/$projectId/predios/$codigo/caracterizacion-predio"
  | "/proyectos/$projectId/predios/$codigo/datos-tecnicos"
  | "/proyectos/$projectId/predios/$codigo/datos-legales"
  | "/proyectos/$projectId/predios/$codigo/sujeto-pasivo"
  | "/proyectos/$projectId/predios/$codigo/identificacion-codificacion"
  | "/proyectos/$projectId/predios/$codigo/asignacion-predial"
  | "/proyectos/$projectId/predios/$codigo/diagnostico-preliminar"
  | "/proyectos/$projectId/predios/$codigo/empadronamiento-inspeccion-campo"
  | "/proyectos/$projectId/predios/$codigo/levantamiento-informacion-tecnica"
  | "/proyectos/$projectId/predios/$codigo/informe-verificador-especialista"
  | "/proyectos/$projectId/predios/$codigo/cbc"
  | "/proyectos/$projectId/predios/$codigo/comunicacion-afectacion"
  | "/proyectos/$projectId/predios/$codigo/anotacion-preventiva"
  | "/proyectos/$projectId/predios/$codigo/certificado-registral-inmobiliario"
  | "/proyectos/$projectId/predios/$codigo/publicacion-oposiciones"
  | "/proyectos/$projectId/predios/$codigo/requerimiento-tasacion-itl"
  | "/proyectos/$projectId/predios/$codigo/modalidad-adquisicion"
  | "/proyectos/$projectId/predios/$codigo/certificacion-presupuestal-ccp"
  | "/proyectos/$projectId/predios/$codigo/informe-tecnico-legal"
  | "/proyectos/$projectId/predios/$codigo/gestion-documentos-dgppt-vmt"
  | "/proyectos/$projectId/predios/$codigo/elevacion-expediente"
  | "/proyectos/$projectId/predios/$codigo/gestion-resolucion-rd"
  | "/proyectos/$projectId/predios/$codigo/gestion-devengado"
  | "/proyectos/$projectId/predios/$codigo/pago-consignacion"
  | "/proyectos/$projectId/predios/$codigo/formulario-registral"
  | "/proyectos/$projectId/predios/$codigo/entrega-posesion"
  | "/proyectos/$projectId/predios/$codigo/saneamiento-registral"
  | "/proyectos/$projectId/predios/$codigo/inscripcion-registral"
  | "/proyectos/$projectId/predios/$codigo/transferencia-interestatal-sbn"
  | "/proyectos/$projectId/predios/$codigo/entrega-recepcion-ddp-opat"
  | "/proyectos/$projectId/predios/$codigo/transferencia-documentaria-opat"
  | "/proyectos/$projectId/predios/$codigo/carta-intencion"
  | "/proyectos/$projectId/predios/$codigo/respuesta-sujeto-pasivo"
  | "/proyectos/$projectId/predios/$codigo/expediente-tasacion"
  | "/proyectos/$projectId/predios/$codigo/expediente-digital"
  | "/proyectos/$projectId/predios/$codigo/monitoreo"
  | "/proyectos/$projectId/predios/$codigo/pago-propietarios";

export type ContextMenuItem = {
  key: string;
  label: string;
  description?: string;
  children?: ContextMenuItem[];
};

const informationBaseMenuItem: ContextMenuItem = {
  key: "informacion-base",
  label: "1. INFORMACIÓN BASE",
  description: "Datos iniciales y diagnóstico del predio",
  children: [
    {
      key: "identificacion-codificacion-predio",
      label: "1.1 Identificación y codificación del predio",
      description:
        "Código predial, proyecto, ubicación, departamento/provincia/distrito, dirección, coordenadas, área total, área afectada, partida registral",
    },
    {
      key: "sujeto-pasivo",
      label: "1.2 Sujeto Pasivo",
      description:
        "Propietario/poseedor, DNI/RUC, condición jurídica, domicilio, teléfono, correo, documento que acredita propiedad o posesión",
    },
    {
      key: "asignacion-predial",
      label: "1.3 Asignación predial",
      description: "Brigada asignada, responsable, especialista, fecha de asignación",
    },
    {
      key: "diagnostico-preliminar",
      label: "1.4 Diagnóstico preliminar",
      description:
        "Situación física, catastral, registral y legal del predio, antecedentes y observaciones",
    },
    {
      key: "empadronamiento-inspeccion-campo",
      label: "1.5 Empadronamiento e inspección de campo",
      description:
        "Fecha de visita, ocupante, características del predio, edificaciones, mejoras, fotografías, observaciones de campo",
    },
    {
      key: "levantamiento-informacion-tecnica",
      label: "1.6 Levantamiento de información técnica",
      description: "Áreas, linderos, coordenadas, planos, información técnica y archivos adjuntos",
    },
  ],
};

const acquisitionValuationMenuItem: ContextMenuItem = {
  key: "adquisicion-tasacion",
  label: "2. ETAPA I – ADQUISICIÓN Y TASACIÓN",
  description: "Adquisición, tasación y determinación de la modalidad aplicable",
  children: [
    {
      key: "informe-verificador-especialista",
      label: "2.1 Informe del Verificador Especialista",
      description: "Número de informe, fecha, especialista, resultado, documento adjunto",
    },
    {
      key: "cbc",
      label: "2.2 Certificado de Búsqueda Catastral – CBC",
      description:
        "Número, fecha de solicitud, fecha de emisión, resultado, observaciones, archivo",
    },
    {
      key: "comunicacion-afectacion",
      label: "2.3 Comunicación de afectación",
      description: "Número de oficio/carta, fecha, destinatario, fecha de notificación, cargo",
    },
    {
      key: "anotacion-preventiva",
      label: "2.4 Anotación preventiva DL 1192",
      description: "Solicitud, título SUNARP, fecha, asiento registral, estado",
    },
    {
      key: "certificado-registral-inmobiliario",
      label: "2.5 Certificado Registral Inmobiliario – CRI",
      description: "Número, fecha, partida, titular, cargas, gravámenes y archivo",
    },
    {
      key: "publicacion-oposiciones",
      label: "2.6 Publicación y oposiciones",
      description: "Diario, fecha de publicación, aviso, oposiciones presentadas, resultado",
    },
    {
      key: "caracterizacion-predio",
      label: "2.7 Caracterización del predio",
      description:
        "Memoria descriptiva, planos, partidas, fichas, fotografías, documentos técnicos y legales; valor de terreno, edificaciones, mejoras, plantaciones, perjuicio económico, valor total, fecha y documento de tasación",
    },
    {
      key: "tasacion-itt",
      label: "2.8 Tasación / ITT",
      description:
        "Generación del borrador de ITT, registro de perito tasador y perito supervisor, e Informe Técnico de Tasación firmado con control de versiones",
    },
    {
      key: "requerimiento-tasacion-itl",
      label: "2.9 Requerimiento de tasación / ITL",
      description:
        "Número de requerimiento, fecha, informe técnico legal, entidad receptora, estado",
    },
    {
      key: "modalidad-adquisicion",
      label: "2.10 Modalidad de adquisición",
      description:
        "Trato directo, expropiación, transferencia interestatal u otra condición aplicable",
    },
  ],
};

const communicationApprovalMenuItem: ContextMenuItem = {
  key: "comunicacion-aprobacion",
  label: "3. ETAPA II – COMUNICACIÓN Y APROBACIÓN",
  description: "Menú principal",
  children: [
    {
      key: "certificacion-presupuestal-ccp",
      label: "3.1 Certificación presupuestal – CCP",
      description: "Número CCP, fecha, monto certificado, fuente de financiamiento, archivo",
    },
    {
      key: "carta-intencion",
      label: "3.2 Carta / Oficio de intención",
      description:
        "Generador Word, número, fecha, monto ofertado, incentivo, fecha de notificación y documentos finales firmados",
    },
    {
      key: "respuesta-sujeto-pasivo",
      label: "3.3 Respuesta del Sujeto Pasivo",
      description:
        "Registro del sujeto pasivo, aceptación o rechazo, fecha, observaciones, documento y control de versiones",
    },
    {
      key: "informe-tecnico-legal",
      label: "3.4 Informe técnico legal",
      description:
        "Generación del borrador, número, fecha, conclusión, recomendación y registro del informe firmado digital o escaneado",
    },
    {
      key: "gestion-documentos-dgppt-vmt",
      label: "3.5 Gestión de documentos DGPPT – VMT",
      description: "Documento enviado, fecha, destino, número de trámite, estado",
    },
    {
      key: "elevacion-expediente",
      label: "3.6 Elevación del expediente",
      description: "Fecha de elevación, documento, área receptora, responsable, estado",
    },
    {
      key: "gestion-resolucion-rd",
      label: "3.7 Gestión de resolución / RD",
      description:
        "Generación del borrador, registro y envío del original, fecha, monto aprobado, incentivo y archivo",
    },
  ],
};

const paymentMenuItem: ContextMenuItem = {
  key: "etapa-pago",
  label: "4. ETAPA III – PAGO",
  description: "Gestión del devengado, pago y entrega de posesión",
  children: [
    {
      key: "gestion-devengado",
      label: "4.1 Gestión de devengado",
      description:
        "Generación del borrador de memorando o solicitud de devengado, registro del original, número de hoja de ruta y monto del predio",
    },
    {
      key: "solicitud-pago-propietarios",
      label: "4.2 Solicitud de pago",
      description: "Número de solicitud, propietario, monto y fecha",
    },
    {
      key: "pago-consignacion",
      label: "4.3 Pago / Consignación",
      description:
        "Tipo de pago, monto, fecha, comprobante y Banco de la Nación cuando corresponda",
    },
    {
      key: "formulario-registral",
      label: "4.4 Formulario registral",
      description: "Número, fecha de suscripción, notaría y archivo",
    },
    {
      key: "entrega-posesion",
      label: "4.5 Entrega de posesión",
      description: "Fecha de entrega, acta, estado de liberación y observaciones",
    },
  ],
};

const sanitationRegistrationMenuItem: ContextMenuItem = {
  key: "saneamiento-inscripcion",
  label: "5. ETAPA IV – SANEAMIENTO E INSCRIPCIÓN",
  description: "Saneamiento, inscripción SUNARP y transferencia interestatal",
  children: [
    {
      key: "saneamiento-registral",
      label: "5.1 Saneamiento registral",
      description: "Tipo de saneamiento, trámite, fecha, observaciones y estado",
    },
    {
      key: "inscripcion-registral",
      label: "5.2 Inscripción registral",
      description: "Título SUNARP, asiento, partida, fecha de inscripción y propietario final",
    },
    {
      key: "transferencia-interestatal-sbn",
      label: "5.3 Transferencia interestatal – SBN",
      description: "Solicitud, resolución, entidad transferente, entidad beneficiaria y estado",
    },
  ],
};

const repositoryClosureMenuItem: ContextMenuItem = {
  key: "repositorio-cierre",
  label: "6. REPOSITORIO Y CIERRE",
  description: "Consolidación documental, entrega, transferencia y monitoreo final",
  children: [
    {
      key: "expediente-digital",
      label: "6.1 Expediente digital",
      description:
        "Documentos digitalizados organizados por etapa, enlace compartible y envío por correo electrónico",
    },
    {
      key: "entrega-recepcion-ddp-opat",
      label: "6.2 Entrega / Recepción DDP – OPAT",
      description:
        "Fecha, acta, responsable que entrega, responsable que recibe y documento legal de recepción",
    },
    {
      key: "transferencia-documentaria-opat",
      label: "6.3 Transferencia documentaria a OPAT",
      description: "Número de documento, fecha y expediente transferido",
    },
    {
      key: "monitoreo",
      label: "6.4 Monitoreo",
      description: "Estado actual, porcentaje de avance, pendientes, alertas y observaciones",
    },
  ],
};

export const contextMenuItems: ContextMenuItem[] = [
  informationBaseMenuItem,
  acquisitionValuationMenuItem,
  communicationApprovalMenuItem,
  paymentMenuItem,
  sanitationRegistrationMenuItem,
  repositoryClosureMenuItem,
];

export const estatalMenuItems: ContextMenuItem[] = [
  informationBaseMenuItem,
  acquisitionValuationMenuItem,
  {
    key: "solicitar-partida-titulos-archivados",
    label: "Solicitar partida registral y títulos archivados",
  },
  { key: "inspeccion-tecnica-campo", label: "Inspección técnica en campo" },
  { key: "ocupantes", label: "Ocupantes" },
  { key: "reconocimiento-mejoras", label: "Reconocimiento de mejoras" },
  {
    key: "expediente-transferencia-interestatal",
    label: "Expediente de transferencia interestatal",
  },
  {
    key: "solicitar-transferencia-interestatal-sbn",
    label: "Solicitar transferencia interestatal ante la SBN",
    children: [
      { key: "solicitar-transferencia-estatal", label: "Solicitar transferencia estatal" },
      {
        key: "recibir-requerimiento-pago-anotacion-preventiva",
        label: "Recibir requerimiento de pago para anotación preventiva",
      },
      {
        key: "registro-resolucion-sbn-publicacion-diario",
        label: "Registro de resolución SBN y publicación en el diario oficial El Peruano",
      },
    ],
  },
  { key: "formulario-registral", label: "Formulario registral" },
  { key: "inscripcion-registral", label: "Inscripción registral" },
  repositoryClosureMenuItem,
];

export const routeByKey: Partial<Record<string, PredioRoute>> = {
  "identificacion-codificacion-predio":
    "/proyectos/$projectId/predios/$codigo/identificacion-codificacion",
  "sujeto-pasivo": "/proyectos/$projectId/predios/$codigo/sujeto-pasivo",
  "asignacion-predial": "/proyectos/$projectId/predios/$codigo/asignacion-predial",
  "diagnostico-preliminar": "/proyectos/$projectId/predios/$codigo/diagnostico-preliminar",
  "empadronamiento-inspeccion-campo":
    "/proyectos/$projectId/predios/$codigo/empadronamiento-inspeccion-campo",
  "levantamiento-informacion-tecnica":
    "/proyectos/$projectId/predios/$codigo/levantamiento-informacion-tecnica",
  "informe-verificador-especialista":
    "/proyectos/$projectId/predios/$codigo/informe-verificador-especialista",
  cbc: "/proyectos/$projectId/predios/$codigo/cbc",
  "comunicacion-afectacion": "/proyectos/$projectId/predios/$codigo/comunicacion-afectacion",
  "anotacion-preventiva": "/proyectos/$projectId/predios/$codigo/anotacion-preventiva",
  "certificado-registral-inmobiliario":
    "/proyectos/$projectId/predios/$codigo/certificado-registral-inmobiliario",
  "publicacion-oposiciones": "/proyectos/$projectId/predios/$codigo/publicacion-oposiciones",
  "caracterizacion-predio": "/proyectos/$projectId/predios/$codigo/caracterizacion-predio",
  "tasacion-itt": "/proyectos/$projectId/predios/$codigo/datos-tecnicos",
  "requerimiento-tasacion-itl": "/proyectos/$projectId/predios/$codigo/requerimiento-tasacion-itl",
  "modalidad-adquisicion": "/proyectos/$projectId/predios/$codigo/modalidad-adquisicion",
  "certificacion-presupuestal-ccp":
    "/proyectos/$projectId/predios/$codigo/certificacion-presupuestal-ccp",
  "informe-tecnico-legal": "/proyectos/$projectId/predios/$codigo/informe-tecnico-legal",
  "gestion-documentos-dgppt-vmt":
    "/proyectos/$projectId/predios/$codigo/gestion-documentos-dgppt-vmt",
  "elevacion-expediente": "/proyectos/$projectId/predios/$codigo/elevacion-expediente",
  "gestion-resolucion-rd": "/proyectos/$projectId/predios/$codigo/gestion-resolucion-rd",
  "gestion-devengado": "/proyectos/$projectId/predios/$codigo/gestion-devengado",
  "pago-consignacion": "/proyectos/$projectId/predios/$codigo/pago-consignacion",
  "formulario-registral": "/proyectos/$projectId/predios/$codigo/formulario-registral",
  "entrega-posesion": "/proyectos/$projectId/predios/$codigo/entrega-posesion",
  "saneamiento-registral": "/proyectos/$projectId/predios/$codigo/saneamiento-registral",
  "inscripcion-registral": "/proyectos/$projectId/predios/$codigo/inscripcion-registral",
  "transferencia-interestatal-sbn":
    "/proyectos/$projectId/predios/$codigo/transferencia-interestatal-sbn",
  "entrega-recepcion-ddp-opat": "/proyectos/$projectId/predios/$codigo/entrega-recepcion-ddp-opat",
  "transferencia-documentaria-opat":
    "/proyectos/$projectId/predios/$codigo/transferencia-documentaria-opat",
  "expediente-tasacion": "/proyectos/$projectId/predios/$codigo/expediente-tasacion",
  "carta-intencion": "/proyectos/$projectId/predios/$codigo/carta-intencion",
  "respuesta-sujeto-pasivo": "/proyectos/$projectId/predios/$codigo/respuesta-sujeto-pasivo",
  "expediente-digital": "/proyectos/$projectId/predios/$codigo/expediente-digital",
  monitoreo: "/proyectos/$projectId/predios/$codigo/monitoreo",
  "solicitud-pago-propietarios": "/proyectos/$projectId/predios/$codigo/pago-propietarios",
};

export const iconByKey = {
  "informacion-base": ClipboardList,
  "identificacion-codificacion-predio": FileText,
  "sujeto-pasivo": ShieldCheck,
  "asignacion-predial": UserCheck,
  "diagnostico-preliminar": ScanSearch,
  "empadronamiento-inspeccion-campo": MapPinned,
  "levantamiento-informacion-tecnica": Ruler,
  "adquisicion-tasacion": Banknote,
  "informe-verificador-especialista": FileCheck2,
  cbc: Search,
  "comunicacion-afectacion": Send,
  "anotacion-preventiva": Landmark,
  "certificado-registral-inmobiliario": FileText,
  "publicacion-oposiciones": FileCode,
  "caracterizacion-predio": Home,
  "tasacion-itt": Banknote,
  "requerimiento-tasacion-itl": FileCheck2,
  "modalidad-adquisicion": HandCoins,
  "comunicacion-aprobacion": Send,
  "etapa-pago": HandCoins,
  "saneamiento-inscripcion": Landmark,
  "repositorio-cierre": Folder,
  "expediente-tasacion": FileCheck2,
  "comunicacion-sujeto-pasivo": Send,
  "carta-intencion": FileText,
  "respuesta-sujeto-pasivo": FileCheck2,
  "gestion-pago-consignacion": HandCoins,
  "aprobacion-valor-pago": Banknote,
  "solicitud-pago-propietarios": HandCoins,
  "pago-consignacion": Banknote,
  "formulario-registral": FileCode,
  "expediente-digital": Folder,
  monitoreo: LineChart,
  "solicitar-partida-titulos-archivados": FileText,
  "inspeccion-tecnica-campo": Search,
  ocupantes: ShieldCheck,
  "reconocimiento-mejoras": Home,
  "expediente-transferencia-interestatal": FileCheck2,
  "solicitar-transferencia-interestatal-sbn": Landmark,
  "solicitar-transferencia-estatal": Send,
  "recibir-requerimiento-pago-anotacion-preventiva": Banknote,
  "registro-resolucion-sbn-publicacion-diario": FileCode,
  "entrega-posesion": Home,
  "inscripcion-registral": FileCode,
  "cierre-adquisicion-entrega-opat": ClipboardCheck,
} as const;
