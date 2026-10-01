// Genera un IFC4 (STEP) del consolidado predial: cada predio es un
// IfcBuildingElementProxy extruido desde su polígono, con un property set
// PDGP_Predio (código, sujeto pasivo, modalidad, área) y color por modalidad.
import { prediosGeojson, predioRows, type PredioRow } from "@/lib/prediosData";

export type IfcLot = {
  row: PredioRow;
  ring: [number, number][]; // metros, relativos al centro del proyecto
  height: number;
};

const PALETTE = ["#16a34a", "#dc2626", "#2563eb", "#f59e0b", "#7c3aed", "#0891b2", "#9ca3af"];

const IFC_GUID_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$";

function guid() {
  let out = IFC_GUID_CHARS[Math.floor(Math.random() * 4)];
  for (let i = 1; i < 22; i++) out += IFC_GUID_CHARS[Math.floor(Math.random() * 64)];
  return out;
}

// Los strings IFC deben ser ASCII; se quitan tildes y se duplican las comillas.
function str(value: string) {
  const ascii = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7e]/g, "")
    .replace(/'/g, "''")
    .replace(/\\/g, "/");
  return `'${ascii}'`;
}

const num = (v: number) => {
  const s = v.toFixed(3);
  return s.includes(".") ? s : s + ".";
};

function firstRing(feature: (typeof prediosGeojson.features)[number]): [number, number][] {
  const coords = feature.geometry?.coordinates as number[][][] | undefined;
  const ring = coords?.[0] ?? [];
  return ring.map(([lng, lat]) => [lng, lat]);
}

function signedArea(ring: [number, number][]) {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}

/** Proyecta los predios con geometría a metros locales (equirectangular). */
export function buildLots(limit = Infinity): IfcLot[] {
  const features = prediosGeojson.features;
  const rings = features.map(firstRing);
  const all = rings.flat();
  if (!all.length) return [];
  const lng0 = all.reduce((s, p) => s + p[0], 0) / all.length;
  const lat0 = all.reduce((s, p) => s + p[1], 0) / all.length;
  const kx = Math.cos((lat0 * Math.PI) / 180) * 111_320;
  const ky = 110_540;

  const lots: IfcLot[] = [];
  rings.forEach((ring, i) => {
    if (ring.length < 4 || lots.length >= limit) return;
    let pts = ring.map(([lng, lat]) => [(lng - lng0) * kx, (lat - lat0) * ky] as [number, number]);
    const [fx, fy] = pts[0];
    const [lx, ly] = pts[pts.length - 1];
    if (Math.abs(fx - lx) < 1e-6 && Math.abs(fy - ly) < 1e-6) pts = pts.slice(0, -1);
    if (pts.length < 3) return;
    if (signedArea(pts) < 0) pts.reverse();
    lots.push({ row: predioRows[i], ring: pts, height: 2 + (i % 4) * 1.5 });
  });
  return lots;
}

export function buildProjectIfc(projectName: string, lots: IfcLot[]) {
  const lines: string[] = [];
  let id = 0;
  const add = (entity: string) => {
    id += 1;
    lines.push(`#${id}=${entity};`);
    return `#${id}`;
  };

  const origin = add("IFCCARTESIANPOINT((0.,0.,0.))");
  const placement = add(`IFCAXIS2PLACEMENT3D(${origin},$,$)`);
  const unitLength = add("IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.)");
  const unitArea = add("IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.)");
  const unitVolume = add("IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.)");
  const units = add(`IFCUNITASSIGNMENT((${unitLength},${unitArea},${unitVolume}))`);
  const context = add(`IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,${placement},$)`);
  const body = add(
    `IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,${context},$,.MODEL_VIEW.,$)`,
  );
  const project = add(
    `IFCPROJECT('${guid()}',$,${str("Consolidado predial " + projectName)},${str("Plataforma Digital de Gestion de Predios - MTC")},$,$,$,(${context}),${units})`,
  );
  const sitePlacement = add(`IFCLOCALPLACEMENT($,${placement})`);
  const site = add(
    `IFCSITE('${guid()}',$,${str("Area del proyecto " + projectName)},$,$,${sitePlacement},$,$,.ELEMENT.,$,$,$,$,$)`,
  );
  add(`IFCRELAGGREGATES('${guid()}',$,$,$,${project},(${site}))`);
  const up = add("IFCDIRECTION((0.,0.,1.))");

  // Un estilo de superficie por modalidad de adquisición.
  const styles = new Map<string, string>();
  const styleFor = (modalidad: string) => {
    const key = modalidad || "SIN INFORMACION";
    if (!styles.has(key)) {
      const hex = PALETTE[styles.size % PALETTE.length];
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
      const colour = add(`IFCCOLOURRGB($,${num(r)},${num(g)},${num(b)})`);
      const rendering = add(`IFCSURFACESTYLERENDERING(${colour},0.,$,$,$,$,$,$,.NOTDEFINED.)`);
      styles.set(key, add(`IFCSURFACESTYLE(${str(key)},.BOTH.,(${rendering}))`));
    }
    return styles.get(key)!;
  };

  const elements: string[] = [];
  lots.forEach((lot) => {
    const { row, ring, height } = lot;
    const points = ring.map(([x, y]) => add(`IFCCARTESIANPOINT((${num(x)},${num(y)}))`));
    const polyline = add(`IFCPOLYLINE((${[...points, points[0]].join(",")}))`);
    const profile = add(`IFCARBITRARYCLOSEDPROFILEDEF(.AREA.,$,${polyline})`);
    const solid = add(`IFCEXTRUDEDAREASOLID(${profile},${placement},${up},${num(height)})`);
    add(`IFCSTYLEDITEM(${solid},(${styleFor(row.mod)}),$)`);
    const shape = add(`IFCSHAPEREPRESENTATION(${body},'Body','SweptSolid',(${solid}))`);
    const productShape = add(`IFCPRODUCTDEFINITIONSHAPE($,$,(${shape}))`);
    const lotPlacement = add(`IFCLOCALPLACEMENT(${sitePlacement},${placement})`);
    const element = add(
      `IFCBUILDINGELEMENTPROXY('${guid()}',$,${str(row.cod || row.codigo)},${str(row.suj)},${str("Predio")},${lotPlacement},${productShape},${str(row.codigo)},$)`,
    );
    elements.push(element);

    const props = (
      [
        ["Codigo", row.cod || row.codigo],
        ["SujetoPasivo", row.suj],
        ["ModalidadAdquisicion", row.mod],
        ["CondicionSujetoPasivo", row.cond],
        ["CondicionPredio", row.condicionPredio],
        ["TipoPredio", row.tipo],
        ["AreaAfectadaM2", row.area],
        ["Expediente", row.exp],
        ["Resolucion", row.res],
        ["PartidaRegistral", row.part],
      ] as [string, string][]
    )
      .filter(([, v]) => v)
      .map(([k, v]) => add(`IFCPROPERTYSINGLEVALUE(${str(k)},$,IFCLABEL(${str(v)}),$)`));
    if (props.length) {
      const pset = add(`IFCPROPERTYSET('${guid()}',$,'PDGP_Predio',$,(${props.join(",")}))`);
      add(`IFCRELDEFINESBYPROPERTIES('${guid()}',$,$,$,(${element}),${pset})`);
    }
  });
  if (elements.length) {
    add(`IFCRELCONTAINEDINSPATIALSTRUCTURE('${guid()}',$,$,$,(${elements.join(",")}),${site})`);
  }

  const stamp = new Date().toISOString().slice(0, 19);
  return [
    "ISO-10303-21;",
    "HEADER;",
    "FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');",
    `FILE_NAME(${str(`consolidado_${projectName}.ifc`)},'${stamp}',('PDGP'),('MTC'),'PDGP','PDGP','');`,
    "FILE_SCHEMA(('IFC4'));",
    "ENDSEC;",
    "DATA;",
    ...lines,
    "ENDSEC;",
    "END-ISO-10303-21;",
    "",
  ].join("\n");
}
