import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { ProjectPageHeader } from "../components/ProjectPageHeader";
import {
  ArrowLeft,
  Plus,
  Download,
  Layers,
  ChevronDown,
  ChevronRight,
  Search,
  Eye,
  MoreVertical,
  Filter,
  MapPin,
  RefreshCw,
  Pencil,
} from "lucide-react";

function ClientMap() {
  const [Comp, setComp] = useState<ComponentType | null>(null);
  useEffect(() => {
    import("../components/MapView").then((m) => setComp(() => m.default));
  }, []);
  if (!Comp) return <div className="h-full w-full bg-[#e5e7eb] animate-pulse" />;
  return <Comp />;
}

export const Route = createFileRoute("/proyectos/$projectId/base-grafica/")({
  head: () => ({
    meta: [
      { title: "Base gráfica — Proyecto" },
      { name: "description", content: "Gestión de capas cartográficas del proyecto." },
    ],
  }),
  component: BaseGraficaPage,
});

type Capa = {
  n: number;
  abrev: string;
  nombre: string;
  categoria: string;
  geometria: "Punto" | "Línea" | "Polígono" | "Raster" | string;
  fuente: string;
  estado: "Aprobado" | "En revisión" | "Observada" | string;
  resultado: "Válida" | "Observada" | string;
  publicar: "Sí" | "No" | string;
  color?: string;
};

const layerGroups = [
  {"name": "CARTOGRAFIA DE RIESGOS", "items": ["Puntos de inundación", "Area  de exposición de inundación", "Puntos críticos", "Niveles de susceptibilidad de inundación", "Niveles de peligro de movimiento de masas", "Peligros geológicos", "nivel de peligro geotecnónico", "Microzonificación sismica"]},
  {"name": "CATASTRO DE AREAS NATURALES PROTEGIDAS", "items": ["ANP Nacional definitivas", "Áreas de Conservación Regional", "Áreas de Conservación Privada", "Zonas de Amortiguamiento", "Zonas Reservadas Indígenas", "Áreas de Concesión", "Áreas de Contratos de aprovechamiento", "Zonificación ACP", "Zonificación ACR", "Zonificación ANP"]},
  {"name": "CATASTRO DE PATRIMONIO CULTURAL", "items": ["Monumentos arqueológicos", "Sitios arqueológicos", "Museos", "Caminos", "Mapa arqueológica declarado"]},
  {"name": "CATASTRO DE PREDIOS", "items": ["Predios rurales ", "Comunidades Campesinas", "Comunidades Nativas", "Pueblos formalizados", "Manzanas referenciales", "Lotes formalizados", "Catastro de predios estatales", "Catastro de concesiones mineras"]},
  {"name": "CATASTRO FORESTAL", "items": ["Bosques de producción permanente", "Bosques locales", "Bosques protectores", "Concesiones forestales"]},
  {"name": "LIMITES POLITICOS ADMINISTRATIVOS", "items": ["Límite Departamental", "Límite Provincial", "Límite Distrital"]},
  {"name": "PROYECTOS MULTIMODALES - INTERFERENCIAS", "items": ["Interferencias existentes tipo puntual", "Interferencias existentes tipo lineal"]},
  {"name": "PROYECTOS MULTIMODALES - PREDIOS", "items": ["Area de proyectos multimodales", "Areas concesionadas", "Areas de reconocimiento de mejoras", "Predios adquiridos de terceros", "Predios adquiridos por transferencia interestatal", "Area de compensación económica"]},
  {"name": "RECURSOS NATURALES E INFRAESTRUCTURA", "items": ["Pozos", "Reservorios", "Bocatomas", "Estación de bombeo", "Presas", "Drenes", "Canal de derivación", "Canal lateral", "Canal transversal", "Puntos críticos y zonas vulnerables", "Vertimientos de aguas residuales", "Linea costera", "Ríos principales", "Ríos secundarios", "Quebradas", "Lagunas", "Lagos o cochas", "Aguajales", "Glaciares", "Bofedales", "Cuencas hidrográficas"]},
  {"name": "SECTOR ENERGIA", "items": ["Central hidráulica", "Central térmica", "Líneas de transmisión", "Concesiones", "Grifos", "Estaciones de Servicios GNV", "Estaciones de venta GLP", "Oleoducto ", "Gaseoducto", "Poliducto", "Planta envasadora GLP"]},
  {"name": "SECTOR TRANSPORTE", "items": ["Terminal portuario", "Red Vial Nacional", "Red Vial Departamental", "Red Vial Vecinal", "Red Vial Férrea"]},
];

const legendItems = [
  {"color": "#FF4500", "label": "PROYECTOS MULTIMODALES - PREDIOS"},
  {"color": "#8904B1", "label": "PROYECTOS MULTIMODALES - INTERFERENCIAS"},
  {"color": "#A9A9A9", "label": "LIMITES POLITICOS ADMINISTRATIVOS"},
  {"color": "#ADFF2F", "label": "CATASTRO DE PREDIOS"},
  {"color": "#C71585", "label": "CATASTRO DE AREAS NATURALES PROTEGIDAS"},
  {"color": "#088A68", "label": "CATASTRO FORESTAL"},
  {"color": "#F781D8", "label": "CATASTRO DE PATRIMONIO CULTURAL"},
  {"color": "#819FF7", "label": "CARTOGRAFIA DE RIESGOS"},
  {"color": "#58ACFA", "label": "RECURSOS NATURALES E INFRAESTRUCTURA"},
  {"color": "#0B2161", "label": "SECTOR TRANSPORTE"},
  {"color": "#886A08", "label": "SECTOR ENERGIA"},
];

const capas: Capa[] = [
  {"n": 1, "abrev": "AREA_PROYECTO", "nombre": "Area de proyectos multimodales", "categoria": "PROYECTOS MULTIMODALES - PREDIOS", "geometria": "Polígono", "fuente": "DDP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#FF4500"},
  {"n": 2, "abrev": "AREA_CONCESION", "nombre": "Areas concesionadas", "categoria": "PROYECTOS MULTIMODALES - PREDIOS", "geometria": "Polígono", "fuente": "DDP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#FFA500"},
  {"n": 3, "abrev": "AREAS_RECONOCM", "nombre": "Areas de reconocimiento de mejoras", "categoria": "PROYECTOS MULTIMODALES - PREDIOS", "geometria": "Polígono", "fuente": "DDP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#FFFF00"},
  {"n": 4, "abrev": "ADQUIRIDOS_TER", "nombre": "Predios adquiridos de terceros", "categoria": "PROYECTOS MULTIMODALES - PREDIOS", "geometria": "Polígono", "fuente": "DDP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#7FFF00"},
  {"n": 5, "abrev": "PREDIOS_TRANSF", "nombre": "Predios adquiridos por transferencia interestatal", "categoria": "PROYECTOS MULTIMODALES - PREDIOS", "geometria": "Polígono", "fuente": "DDP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#008080"},
  {"n": 6, "abrev": "EXISTENTE_PUNT", "nombre": "Interferencias existentes tipo puntual", "categoria": "PROYECTOS MULTIMODALES - INTERFERENCIAS", "geometria": "Polígono", "fuente": "DDP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#8904B1"},
  {"n": 7, "abrev": "EXISTENTE_LINE", "nombre": "Interferencias existentes tipo lineal", "categoria": "PROYECTOS MULTIMODALES - INTERFERENCIAS", "geometria": "Línea", "fuente": "DDP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#FFD700"},
  {"n": 8, "abrev": "LIMITE_DEPARTA", "nombre": "Límite Departamental", "categoria": "LIMITES POLITICOS ADMINISTRATIVOS", "geometria": "Polígono", "fuente": "INEI", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#A9A9A9"},
  {"n": 9, "abrev": "LIMITE_PROVINC", "nombre": "Límite Provincial", "categoria": "LIMITES POLITICOS ADMINISTRATIVOS", "geometria": "Polígono", "fuente": "INEI", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#F08080"},
  {"n": 10, "abrev": "LIMITE_DISTRIT", "nombre": "Límite Distrital", "categoria": "LIMITES POLITICOS ADMINISTRATIVOS", "geometria": "Polígono", "fuente": "INEI", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#B0C4DE"},
  {"n": 11, "abrev": "PREDIOSRURALES", "nombre": "Predios rurales ", "categoria": "CATASTRO DE PREDIOS", "geometria": "Polígono", "fuente": "MIDAGRI", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#ADFF2F"},
  {"n": 12, "abrev": "CATASTRO_COMUN", "nombre": "Comunidades Campesinas", "categoria": "CATASTRO DE PREDIOS", "geometria": "Polígono", "fuente": "MIDAGRI", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#BDB76B"},
  {"n": 13, "abrev": "CATASTRO_COMUN", "nombre": "Comunidades Nativas", "categoria": "CATASTRO DE PREDIOS", "geometria": "Polígono", "fuente": "MIDAGRI", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#2E8B57"},
  {"n": 14, "abrev": "CATASTRO_PUEBL", "nombre": "Pueblos formalizados", "categoria": "CATASTRO DE PREDIOS", "geometria": "Polígono", "fuente": "COFOPRI", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#B22222"},
  {"n": 15, "abrev": "CATASTRO_MANZA", "nombre": "Manzanas referenciales", "categoria": "CATASTRO DE PREDIOS", "geometria": "Polígono", "fuente": "COFOPRI", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#FF1493"},
  {"n": 16, "abrev": "PREDIOS_COFOPR", "nombre": "Lotes formalizados", "categoria": "CATASTRO DE PREDIOS", "geometria": "Polígono", "fuente": "COFOPRI", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#D8BFD8"},
  {"n": 17, "abrev": "PREDIOSESTATAL", "nombre": "Catastro de predios estatales", "categoria": "CATASTRO DE PREDIOS", "geometria": "Polígono", "fuente": "SBN", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#483D8B"},
  {"n": 18, "abrev": "MINERO_INGEMME", "nombre": "Catastro de concesiones mineras", "categoria": "CATASTRO DE PREDIOS", "geometria": "Polígono", "fuente": "INGEMMET", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#FFA500"},
  {"n": 19, "abrev": "ANP_NACIONALDE", "nombre": "ANP Nacional definitivas", "categoria": "CATASTRO DE AREAS NATURALES PROTEGIDAS", "geometria": "Polígono", "fuente": "SERNANP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#C71585"},
  {"n": 20, "abrev": "ANP_AREASCONSE", "nombre": "Áreas de Conservación Regional", "categoria": "CATASTRO DE AREAS NATURALES PROTEGIDAS", "geometria": "Polígono", "fuente": "SERNANP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#9400D3"},
  {"n": 21, "abrev": "ANP_AREASCONSE", "nombre": "Áreas de Conservación Privada", "categoria": "CATASTRO DE AREAS NATURALES PROTEGIDAS", "geometria": "Polígono", "fuente": "SERNANP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#8B008B"},
  {"n": 22, "abrev": "ANP_ZONAAMORTI", "nombre": "Zonas de Amortiguamiento", "categoria": "CATASTRO DE AREAS NATURALES PROTEGIDAS", "geometria": "Polígono", "fuente": "SERNANP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#8A2BE2"},
  {"n": 23, "abrev": "ANP_ZONASRESER", "nombre": "Zonas Reservadas Indígenas", "categoria": "CATASTRO DE AREAS NATURALES PROTEGIDAS", "geometria": "Polígono", "fuente": "SERNANP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#9932CC"},
  {"n": 24, "abrev": "ANP_CONCESION", "nombre": "Áreas de Concesión", "categoria": "CATASTRO DE AREAS NATURALES PROTEGIDAS", "geometria": "Polígono", "fuente": "SERNANP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#FFE4B5"},
  {"n": 25, "abrev": "ANP_CONTRATOSD", "nombre": "Áreas de Contratos de aprovechamiento", "categoria": "CATASTRO DE AREAS NATURALES PROTEGIDAS", "geometria": "Polígono", "fuente": "SERNANP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#9966CC"},
  {"n": 26, "abrev": "ZONIFICACION_A", "nombre": "Zonificación ACP", "categoria": "CATASTRO DE AREAS NATURALES PROTEGIDAS", "geometria": "Polígono", "fuente": "SERNANP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#EE82EE"},
  {"n": 27, "abrev": "ZONIFICACION_A", "nombre": "Zonificación ACR", "categoria": "CATASTRO DE AREAS NATURALES PROTEGIDAS", "geometria": "Polígono", "fuente": "SERNANP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#DDA0DD"},
  {"n": 28, "abrev": "ZONIFICACION_A", "nombre": "Zonificación ANP", "categoria": "CATASTRO DE AREAS NATURALES PROTEGIDAS", "geometria": "Polígono", "fuente": "SERNANP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#8A2BE2"},
  {"n": 29, "abrev": "FORESTAL_BPP", "nombre": "Bosques de producción permanente", "categoria": "CATASTRO FORESTAL", "geometria": "Polígono", "fuente": "SERFOR", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#088A68"},
  {"n": 30, "abrev": "FORESTAL_BLOCA", "nombre": "Bosques locales", "categoria": "CATASTRO FORESTAL", "geometria": "Polígono", "fuente": "SERFOR", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#86B404"},
  {"n": 31, "abrev": "FORESTAL_BPROT", "nombre": "Bosques protectores", "categoria": "CATASTRO FORESTAL", "geometria": "Polígono", "fuente": "SERFOR", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#2EFEC8"},
  {"n": 32, "abrev": "FORESTAL_CONCE", "nombre": "Concesiones forestales", "categoria": "CATASTRO FORESTAL", "geometria": "Polígono", "fuente": "SERFOR", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#4B8A08"},
  {"n": 33, "abrev": "CULTURA_MONUME", "nombre": "Monumentos arqueológicos", "categoria": "CATASTRO DE PATRIMONIO CULTURAL", "geometria": "Polígono", "fuente": "MINCUL", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#F781D8"},
  {"n": 34, "abrev": "CULTURA_SITIOS", "nombre": "Sitios arqueológicos", "categoria": "CATASTRO DE PATRIMONIO CULTURAL", "geometria": "Polígono", "fuente": "MINCUL", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#8904B1"},
  {"n": 35, "abrev": "CULTURA_MUSEOS", "nombre": "Museos", "categoria": "CATASTRO DE PATRIMONIO CULTURAL", "geometria": "Polígono", "fuente": "MINCUL", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#DF0174"},
  {"n": 36, "abrev": "CULTURA_CAMINO", "nombre": "Caminos", "categoria": "CATASTRO DE PATRIMONIO CULTURAL", "geometria": "Polígono", "fuente": "MINCUL", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#FE642E"},
  {"n": 37, "abrev": "CULTURA_MAPSDE", "nombre": "Mapa arqueológica declarado", "categoria": "CATASTRO DE PATRIMONIO CULTURAL", "geometria": "Polígono", "fuente": "MINCUL", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#F5A9D0"},
  {"n": 38, "abrev": "CRIESGOS_INUND", "nombre": "Puntos de inundación", "categoria": "CARTOGRAFIA DE RIESGOS", "geometria": "Punto", "fuente": "CENEPRED", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#819FF7"},
  {"n": 39, "abrev": "INUNDACION_ARE", "nombre": "Area  de exposición de inundación", "categoria": "CARTOGRAFIA DE RIESGOS", "geometria": "Polígono", "fuente": "CENEPRED", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#3104B4"},
  {"n": 40, "abrev": "INUNDACION_PTO", "nombre": "Puntos críticos", "categoria": "CARTOGRAFIA DE RIESGOS", "geometria": "Punto", "fuente": "CENEPRED", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#045FB4"},
  {"n": 41, "abrev": "INUNDACION_NIV", "nombre": "Niveles de susceptibilidad de inundación", "categoria": "CARTOGRAFIA DE RIESGOS", "geometria": "Polígono", "fuente": "CENEPRED", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#2EFEF7"},
  {"n": 42, "abrev": "MM_NIVELESDEPE", "nombre": "Niveles de peligro de movimiento de masas", "categoria": "CARTOGRAFIA DE RIESGOS", "geometria": "Polígono", "fuente": "CENEPRED", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#FF4000"},
  {"n": 43, "abrev": "PG_PELIGROSGEO", "nombre": "Peligros geológicos", "categoria": "CARTOGRAFIA DE RIESGOS", "geometria": "Polígono", "fuente": "CENEPRED", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#F5DA81"},
  {"n": 44, "abrev": "PG_NIVELDEPELI", "nombre": "nivel de peligro geotecnónico", "categoria": "CARTOGRAFIA DE RIESGOS", "geometria": "Polígono", "fuente": "CENEPRED", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#61380B"},
  {"n": 45, "abrev": "SISMICO_MICROZ", "nombre": "Microzonificación sismica", "categoria": "CARTOGRAFIA DE RIESGOS", "geometria": "Polígono", "fuente": "CENEPRED", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#F4FA58"},
  {"n": 46, "abrev": "IH_POZOS", "nombre": "Pozos", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#58ACFA"},
  {"n": 47, "abrev": "IH_RESERVORIOS", "nombre": "Reservorios", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#0174DF"},
  {"n": 48, "abrev": "IH_BOCATOMAS", "nombre": "Bocatomas", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#084B8A"},
  {"n": 49, "abrev": "IH_ESTACIONBOM", "nombre": "Estación de bombeo", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#A9D0F5"},
  {"n": 50, "abrev": "IH_PRESAS", "nombre": "Presas", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#0489B1"},
  {"n": 51, "abrev": "IH_DREN", "nombre": "Drenes", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#81F7F3"},
  {"n": 52, "abrev": "CANAL_DERIVACI", "nombre": "Canal de derivación", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#0000FF"},
  {"n": 53, "abrev": "CANAL_LATERAL", "nombre": "Canal lateral", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#58ACFA"},
  {"n": 54, "abrev": "CANAL_TRANSVER", "nombre": "Canal transversal", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#A9E2F3"},
  {"n": 55, "abrev": "HI_PUNTOSCRITI", "nombre": "Puntos críticos y zonas vulnerables", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Punto", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#08088A"},
  {"n": 56, "abrev": "HI_VERTIMIENTO", "nombre": "Vertimientos de aguas residuales", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#A4A4A4"},
  {"n": 57, "abrev": "HI_LINEACOSTER", "nombre": "Linea costera", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Línea", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#00BFFF"},
  {"n": 58, "abrev": "HI_RIOSPRINCIP", "nombre": "Ríos principales", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#0080FF"},
  {"n": 59, "abrev": "HI_RIOSSECUNDA", "nombre": "Ríos secundarios", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#58ACFA"},
  {"n": 60, "abrev": "HI_QUEBRADAS", "nombre": "Quebradas", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#81DAF5"},
  {"n": 61, "abrev": "HI_LAGUNAS", "nombre": "Lagunas", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#00BFFF"},
  {"n": 62, "abrev": "HI_LAGOCOCHAS", "nombre": "Lagos o cochas", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#2E9AFE"},
  {"n": 63, "abrev": "HI_AGUAJALES", "nombre": "Aguajales", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#088A85"},
  {"n": 64, "abrev": "HI_GLACIARES", "nombre": "Glaciares", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#F5F6CE"},
  {"n": 65, "abrev": "HI_BOFEDALES", "nombre": "Bofedales", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#4B8A08"},
  {"n": 66, "abrev": "HI_UNIDADHIDRO", "nombre": "Cuencas hidrográficas", "categoria": "RECURSOS NATURALES E INFRAESTRUCTURA", "geometria": "Polígono", "fuente": "ANA", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#B4045F"},
  {"n": 67, "abrev": "TRANSPORTE_TER", "nombre": "Terminal portuario", "categoria": "SECTOR TRANSPORTE", "geometria": "Polígono", "fuente": "MTC", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#0B2161"},
  {"n": 68, "abrev": "REDVIAL_NACION", "nombre": "Red Vial Nacional", "categoria": "SECTOR TRANSPORTE", "geometria": "Línea", "fuente": "MTC", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#DF0101"},
  {"n": 69, "abrev": "REDVIAL_DEPART", "nombre": "Red Vial Departamental", "categoria": "SECTOR TRANSPORTE", "geometria": "Línea", "fuente": "MTC", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#FA5858"},
  {"n": 70, "abrev": "REDVIAL_VECINA", "nombre": "Red Vial Vecinal", "categoria": "SECTOR TRANSPORTE", "geometria": "Línea", "fuente": "MTC", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#F5A9A9"},
  {"n": 71, "abrev": "TRANSPORTE_VIA", "nombre": "Red Vial Férrea", "categoria": "SECTOR TRANSPORTE", "geometria": "Línea", "fuente": "MTC", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#292A0A"},
  {"n": 72, "abrev": "ENERGIA_CENTRA", "nombre": "Central hidráulica", "categoria": "SECTOR ENERGIA", "geometria": "Polígono", "fuente": "MINEM", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#886A08"},
  {"n": 73, "abrev": "ENERGIA_CENTRA", "nombre": "Central térmica", "categoria": "SECTOR ENERGIA", "geometria": "Polígono", "fuente": "MINEM", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#DBA901"},
  {"n": 74, "abrev": "LINEAS_TRANSMI", "nombre": "Líneas de transmisión", "categoria": "SECTOR ENERGIA", "geometria": "Línea", "fuente": "MINEM", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#FFBF00"},
  {"n": 75, "abrev": "ENERGIA_CONCES", "nombre": "Concesiones", "categoria": "SECTOR ENERGIA", "geometria": "Polígono", "fuente": "MINEM", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#FF8000"},
  {"n": 76, "abrev": "ENERGIA_GRIFOS", "nombre": "Grifos", "categoria": "SECTOR ENERGIA", "geometria": "Polígono", "fuente": "MINEM", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#0B614B"},
  {"n": 77, "abrev": "ENERGIA_ESTACI", "nombre": "Estaciones de Servicios GNV", "categoria": "SECTOR ENERGIA", "geometria": "Polígono", "fuente": "MINEM", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#0B4C5F"},
  {"n": 78, "abrev": "ENERGIA_ESTABV", "nombre": "Estaciones de venta GLP", "categoria": "SECTOR ENERGIA", "geometria": "Polígono", "fuente": "MINEM", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#5E610B"},
  {"n": 79, "abrev": "ENERGIA_OLEODU", "nombre": "Oleoducto ", "categoria": "SECTOR ENERGIA", "geometria": "Polígono", "fuente": "MINEM", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#0B2161"},
  {"n": 80, "abrev": "ENERGIA_GASEOD", "nombre": "Gaseoducto", "categoria": "SECTOR ENERGIA", "geometria": "Polígono", "fuente": "MINEM", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#0B4C5F"},
  {"n": 81, "abrev": "ENERGIA_POLIDU", "nombre": "Poliducto", "categoria": "SECTOR ENERGIA", "geometria": "Polígono", "fuente": "MINEM", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#0B614B"},
  {"n": 82, "abrev": "PLANTAENVASADO", "nombre": "Planta envasadora GLP", "categoria": "SECTOR ENERGIA", "geometria": "Polígono", "fuente": "MINEM", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#122A0A"},
  {"n": 83, "abrev": "AREAS_COMPENSA", "nombre": "Area de compensación económica", "categoria": "PROYECTOS MULTIMODALES - PREDIOS", "geometria": "Polígono", "fuente": "DDP", "estado": "Aprobado", "resultado": "Válida", "publicar": "Sí", "color": "#FF1494"},
];


function BaseGraficaPage() {
  const { projectId } = Route.useParams();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(layerGroups.map((g) => [g.name, true]))
  );
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState("Todas las categorías");
  const [extras, setExtras] = useState<Capa[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`base-grafica:${projectId}:capas`);
      if (raw) setExtras(JSON.parse(raw));
    } catch {}
  }, [projectId]);

  const allCapas = [...extras, ...capas];
  const filtered = allCapas.filter(
    (c) =>
      (categoria === "Todas las categorías" || c.categoria === categoria) &&
      (query === "" ||
        c.nombre.toLowerCase().includes(query.toLowerCase()) ||
        c.abrev.toLowerCase().includes(query.toLowerCase()))
  );

  const total = allCapas.length;
  const publicadas = allCapas.filter((c) => c.publicar === "Sí" && c.estado === "Aprobado").length;
  const enRevision = allCapas.filter((c) => c.estado === "En revisión").length;
  const observadas = allCapas.filter((c) => c.resultado === "Observada").length;

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937] text-sm">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <ProjectPageHeader
          projectId={projectId}
          title="Base gráfica preliminar"
          badgeLabel="PROYECTO"
          badgeValue={projectId}
          badgeSuffix="BASE GRÁFICA"
        />


        <div className="flex-1 overflow-auto p-6 space-y-4">
          {/* Map + Layers + side stats */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
            <div className="relative h-[460px] rounded-lg overflow-hidden border border-[#e5e7eb] bg-white">
              <ClientMap />
              <button className="absolute top-3 left-3 z-[500] flex items-center gap-1.5 bg-white border border-[#e5e7eb] rounded-md px-3 py-1.5 text-[12px] shadow hover:bg-[#f9fafb]">
                <RefreshCw size={12} /> Recargar capas
              </button>
              {/* Legend */}
              <div className="absolute top-3 right-3 z-[500] bg-white rounded-lg shadow border border-[#e5e7eb] p-3 max-w-[240px]">
                <div className="text-[12px] font-semibold mb-2">Leyenda</div>
                <ul className="space-y-1">
                  {legendItems.map((l) => (
                    <li key={l.label} className="flex items-center gap-2 text-[11px]">
                      <span className="inline-block w-3 h-3 rounded-sm border border-black/10" style={{ background: l.color }} />
                      <span className="truncate">{l.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute bottom-3 left-3 z-[500] bg-white border border-[#e5e7eb] rounded-md px-3 py-1.5 text-[12px] shadow flex items-center gap-1">
                Satélite <ChevronDown size={12} />
              </div>
            </div>

            {/* Capas panel */}
            <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#e5e7eb]">
                <div className="flex items-center gap-1.5 font-semibold text-[13px]">
                  <Layers size={14} /> Capas
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    to="/proyectos/$projectId/base-grafica/registro"
                    params={{ projectId }}
                    className="flex items-center gap-1 text-[12px] text-white bg-[#dc2626] px-2 py-1 rounded hover:bg-[#b91c1c]"
                  >
                    <Plus size={12} /> Capa
                  </Link>
                  <button className="flex items-center gap-1 text-[12px] text-[#374151] px-2 py-1 rounded hover:bg-[#f3f4f6] border border-[#e5e7eb]">
                    <Download size={12} /> Exportar <ChevronDown size={12} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-1 max-h-[420px]">
                {layerGroups.map((g) => (
                  <div key={g.name} className="text-[12px]">
                    <button
                      onClick={() => setOpenGroups((s) => ({ ...s, [g.name]: !s[g.name] }))}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#f9fafb] font-medium"
                    >
                      <input type="checkbox" defaultChecked className="accent-[#dc2626]" />
                      <span className="flex-1 text-left">{g.name}</span>
                      <ChevronRight size={12} className={openGroups[g.name] ? "rotate-90 transition" : "transition"} />
                    </button>
                    {openGroups[g.name] && (
                      <div className="pl-8 pr-2 pb-1">
                        {g.items.map((item) => (
                          <div key={item} className="flex items-center gap-2 py-1 text-[#374151]">
                            <input type="checkbox" defaultChecked className="accent-[#dc2626]" />
                            <span className="flex-1 truncate">{item}</span>
                            <Eye size={12} className="text-[#9ca3af]" />
                            <MoreVertical size={12} className="text-[#9ca3af]" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total de capas", value: total, color: "#dc2626", bg: "#fef2f2" },
              { label: "Capas publicadas", value: publicadas, color: "#16a34a", bg: "#dcfce7" },
              { label: "Capas en revisión", value: enRevision, color: "#ea580c", bg: "#ffedd5" },
              { label: "Capas observadas", value: observadas, color: "#dc2626", bg: "#fee2e2" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-[#e5e7eb] rounded-lg p-3 flex items-center gap-3">
                <div className="size-10 rounded-md flex items-center justify-center" style={{ background: s.bg, color: s.color }}>
                  <Layers size={18} />
                </div>
                <div>
                  <div className="text-[11px] text-[#6b7280]">{s.label}</div>
                  <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters + Table */}
          <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-[#e5e7eb] flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por código, abreviatura, nombre o responsable…"
                  className="w-full pl-7 pr-2 py-1.5 border border-[#e5e7eb] rounded text-[12px] focus:outline-none focus:border-[#dc2626]"
                />
              </div>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="border border-[#e5e7eb] rounded text-[12px] px-2 py-1.5"
              >
                <option>Todas las categorías</option>
                {layerGroups.map((g) => (
                  <option key={g.name}>{g.name.replace(/^\d+\.\s*/, "")}</option>
                ))}
              </select>
              <button className="flex items-center gap-1 px-2 py-1.5 border border-[#e5e7eb] rounded text-[12px] hover:bg-[#f9fafb]">
                <Filter size={12} /> Filtros
              </button>
              <Link
                to="/proyectos/$projectId/base-grafica/registro"
                params={{ projectId }}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#dc2626] text-white rounded text-[12px] hover:bg-[#b91c1c]"
              >
                <Plus size={12} /> Registrar capa
              </Link>
            </div>
            <div className="overflow-auto">
              <table className="w-full text-[12px] border-collapse">
                <thead className="bg-[#f9fafb] text-[#6b7280] uppercase">
                  <tr>
                    {["Código", "Abrev.", "Nombre de la capa", "Categoría", "Geometría", "Fuente", "Estado", "Resultado GIS", "Publicar", "Acciones"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap border-b border-[#e5e7eb]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.n} className={i % 2 ? "bg-[#fafafa]" : "bg-white"}>
                      <td className="px-3 py-2 border-b border-[#e5e7eb]">{c.n}</td>
                      <td className="px-3 py-2 border-b border-[#e5e7eb] text-[#dc2626] font-semibold">{c.abrev}</td>
                      <td className="px-3 py-2 border-b border-[#e5e7eb]">{c.nombre}</td>
                      <td className="px-3 py-2 border-b border-[#e5e7eb]">{c.categoria}</td>
                      <td className="px-3 py-2 border-b border-[#e5e7eb]">{c.geometria}</td>
                      <td className="px-3 py-2 border-b border-[#e5e7eb]">{c.fuente}</td>
                      <td className="px-3 py-2 border-b border-[#e5e7eb]">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${c.estado === "Aprobado" ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fee2e2] text-[#b91c1c]"}`}>
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-3 py-2 border-b border-[#e5e7eb]">{c.resultado}</td>
                      <td className="px-3 py-2 border-b border-[#e5e7eb]">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${c.publicar === "Sí" ? "bg-[#fee2e2] text-[#b91c1c]" : "bg-[#f3f4f6] text-[#374151]"}`}>
                          {c.publicar}
                        </span>
                      </td>
                      <td className="px-3 py-2 border-b border-[#e5e7eb]">
                        <div className="flex items-center gap-2 text-[#6b7280]">
                          <button className="hover:text-[#dc2626]" title="Ver"><Eye size={14} /></button>
                          <button className="hover:text-[#dc2626]" title="Editar"><Pencil size={14} /></button>
                          <button className="hover:text-[#dc2626]" title="Más"><MoreVertical size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}