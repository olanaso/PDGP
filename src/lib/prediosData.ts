import prediosGeojsonRaw from "@/data/jauja_predios.geojson?raw";

type Geometry = {
  type: string;
  coordinates: unknown;
};

type Feature = {
  type: "Feature";
  properties?: Record<string, unknown>;
  geometry?: Geometry | null;
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: Feature[];
};

export type PredioRow = Record<string, string> & {
  rowId: string;
  codigo: string;
  cod: string;
  n: string;
  et: string;
  ciudad: string;
  condicionPredio: string;
  mod: string;
  suj: string;
  cond: string;
  tipo: string;
  cantidad: string;
  area: string;
  res: string;
  mesres: string;
  hrres: string;
  drive: string;
};

export const prediosGeojson = JSON.parse(prediosGeojsonRaw) as FeatureCollection;

const props = (feature: Feature) => feature.properties ?? {};

function value(properties: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const raw = properties[key];
    if (raw !== undefined && raw !== null && String(raw).trim() !== "") return String(raw);
  }
  return "";
}

function money(properties: Record<string, unknown>, key: string) {
  const raw = properties[key];
  if (typeof raw === "number") return raw.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value(properties, key);
}

function areaHa(areaM2: string) {
  const numeric = Number(areaM2.replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return "";
  return (numeric / 10000).toFixed(4);
}

function rowFromFeature(feature: Feature, index: number): PredioRow {
  const p = props(feature);
  const syncCode = value(p, "codigopred", "match_codigo_geojson", "CODIGO DE PREDIO") || `SIN-CODIGO-${index + 1}`;
  const displayCode = value(p, "CODIGO DE PREDIO", "codigopred", "match_codigo_geojson") || syncCode;
  const areaM2 = value(p, "AREA AFECTADA (m2)");
  const n = value(p, "N\u00b0", "NÂ°", "NÃ‚Â°") || String(index + 1);

  return {
    rowId: `${syncCode}-${index}`,
    codigo: syncCode,
    n,
    et: value(p, "E.T."),
    ciudad: value(p, "CUIDAD"),
    proyecto: value(p, "PROYECTO"),
    cod: displayCode,
    condicionPredio: value(
      p,
      "CONDICION_PREDIO",
      "CONDICIÓN_PREDIO",
      "CONDICION PREDIO",
      "CONDICIÓN PREDIO",
      "condicion_predio",
    ),
    exp: value(p, "N\u00b0 DE EXPEDIENTE", "NÂ° DE EXPEDIENTE", "NÃ‚Â° DE EXPEDIENTE"),
    mod: value(p, "MODALIDAD DE ADQUISICION"),
    suj: value(p, "SUJETO PASIVO").replace(/\s+/g, " ").trim() || "SIN INFORMACION",
    tp: value(p, "TIPO DE PREDIO"),
    cond: value(p, "CONDICION DEL SP"),
    rlegal: value(p, "ESPECIALISTA LEGAL"),
    rtec: value(p, "ESPECIALISTA TECNICO"),
    part: value(p, "N\u00b0 DE PARTIDA INSCRITA", "NÂ° DE PARTIDA INSCRITA", "NÃ‚Â° DE PARTIDA INSCRITA"),
    cantidad: value(p, "CANTIDAD"),
    m2: areaM2,
    ha: areaHa(areaM2),
    afec: value(p, "ESTADO  DE PREDIO ", "TIPO DE PREDIO"),
    valor: money(p, "MONTO"),
    fres: value(p, "Fecha"),
    mesres: value(p, "MES RESOLUCION"),
    nres: value(p, "N\u00b0 DE RESOLUCION", "NÂ° DE RESOLUCION", "NÃ‚Â° DE RESOLUCION"),
    per: value(p, "A\u00d1O DE ADQUISICION", "AÃ‘O DE ADQUISICION", "AÃƒâ€˜O DE ADQUISICION"),
    hrres: value(p, "H.R. RESOLUCION"),
    pago: value(p, "STD DEL DEVENGADO"),
    drive: value(p, "DRIVE"),
    estado: value(p, "ESTADO SITUACIONAL DE INSCRIPCION SI/NO "),
    acto: value(p, "ACTO REGISTRAL "),
    ofi: value(p, "OFICINA REGISTRAL"),
    titulo: value(p, "N\u00b0 DE TITULO PRESENTADO A SUNARP", "NÂ° DE TITULO PRESENTADO A SUNARP", "NÃ‚Â° DE TITULO PRESENTADO A SUNARP"),
    ftit: value(p, "FECHA PRESENTACION DE TITULO"),
    etit: value(p, "ESTADO DE TITULO"),
    finsc: value(p, "FECHA DE INSCRIPCION"),
    pind: value(p, "N\u00b0 DE PARTIDA INSCRITA", "NÂ° DE PARTIDA INSCRITA", "NÃ‚Â° DE PARTIDA INSCRITA"),
    edd: value(p, "RECEPCION DE EXP. EN FISICO "),
    fr: value(p, "RECEPCION EN CAMPO"),
    acta: value(p, "FECHA DE RECEPCION Y ENTREGA"),
    trans: value(p, "FECHA DE ENTREGA"),
    com: value(p, "match_estado"),
    tipo: value(p, "TIPO DE PREDIO"),
    area: areaM2,
    res: value(p, "N\u00b0 DE RESOLUCION", "NÂ° DE RESOLUCION", "NÃ‚Â° DE RESOLUCION"),
  };
}

function collectLngLat(coordinates: unknown, out: [number, number][]) {
  if (!Array.isArray(coordinates)) return;
  if (typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
    out.push([coordinates[0], coordinates[1]]);
    return;
  }
  coordinates.forEach((child) => collectLngLat(child, out));
}

export function getPredioCenter(codigo: string): [number, number] | null {
  const feature = prediosGeojson.features.find((item) => value(props(item), "codigopred", "match_codigo_geojson") === codigo);
  if (!feature?.geometry) return null;

  const points: [number, number][] = [];
  collectLngLat(feature.geometry.coordinates, points);
  if (!points.length) return null;

  const bounds = points.reduce(
    (acc, [lng, lat]) => ({
      minLng: Math.min(acc.minLng, lng),
      maxLng: Math.max(acc.maxLng, lng),
      minLat: Math.min(acc.minLat, lat),
      maxLat: Math.max(acc.maxLat, lat),
    }),
    { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity },
  );

  return [(bounds.minLng + bounds.maxLng) / 2, (bounds.minLat + bounds.maxLat) / 2];
}

export const predioRows = prediosGeojson.features.map(rowFromFeature);

export function getPredioByCodigo(codigo: string | null | undefined) {
  if (!codigo) return null;
  return predioRows.find((row) => row.codigo === codigo) ?? null;
}
