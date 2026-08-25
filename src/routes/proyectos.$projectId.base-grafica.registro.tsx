import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ProjectPageHeader } from "../components/ProjectPageHeader";
import {
  Save,
  Send,
  Info,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  MapPin,
  Layers,
  Palette,
  Link2,
  HardDrive,
  Download,
  Eye,
  FileText,
  Database,
  Globe2,
  History,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/proyectos/$projectId/base-grafica/registro")({
  head: () => ({
    meta: [{ title: "Registro de capa — Base gráfica" }],
  }),
  component: RegistroCapa,
});

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-[12px]">
      <span className="font-medium text-[#374151]">
        {label} {required && <span className="text-[#dc2626]">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full px-2.5 py-1.5 border border-[#e5e7eb] rounded text-[12px] focus:outline-none focus:border-[#dc2626] bg-white";

const controles = [
  { label: "Formato reconocido", ok: true },
  { label: "Geometría válida", ok: true },
  { label: "CRS compatible con el proyecto", ok: true },
  { label: "Atributos mínimos completos", ok: false },
  { label: "Coherencia espacial con polígono principal", ok: false },
  { label: "Archivo original respaldado", ok: true },
];

function RegistroCapa() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const [geom, setGeom] = useState<"Punto" | "Línea" | "Polígono" | "Raster">("Polígono");
  const [nombre, setNombre] = useState("");
  const [abrev, setAbrev] = useState("");
  const [categoria, setCategoria] = useState("Base cartográfica");
  const [subcategoria, setSubcategoria] = useState("");
  const [confiabilidad, setConfiabilidad] = useState("Alta");
  const [descripcion, setDescripcion] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [fuente, setFuente] = useState("");
  const [formato, setFormato] = useState("GeoJSON");
  const [crs, setCrs] = useState("WGS 84 / UTM zona 18S (EPSG:32718)");
  const [fechaRecepcion, setFechaRecepcion] = useState("");
  const [responsable, setResponsable] = useState("");
  const [usuarioCarga, setUsuarioCarga] = useState("");
  const [fechaRegistro, setFechaRegistro] = useState("");
  const [saving, setSaving] = useState(false);

  // Archivo original / migración
  const [almacenamiento, setAlmacenamiento] = useState<"archivo" | "enlace">("archivo");
  const [archivoOriginal, setArchivoOriginal] = useState("");
  const [enlaceOriginal, setEnlaceOriginal] = useState("");
  const [archivoProcesado, setArchivoProcesado] = useState("");
  const [formatoSalida, setFormatoSalida] = useState<"SHP" | "KML" | "GeoJSON">("GeoJSON");
  const [preservarOriginal, setPreservarOriginal] = useState(true);

  // Semiología gráfica
  const [fillColor, setFillColor] = useState("#bbf7d0");
  const [strokeColor, setStrokeColor] = useState("#166534");
  const [opacidad, setOpacidad] = useState(70);
  const [grosor, setGrosor] = useState(2);
  const [tipoLinea, setTipoLinea] = useState<"Continua" | "Discontinua" | "Punteada">("Continua");
  const [tamPunto, setTamPunto] = useState(8);
  const [estiloMarcador, setEstiloMarcador] = useState<"Círculo" | "Cuadrado" | "Triángulo" | "Diamante">("Círculo");
  const [etiqueta, setEtiqueta] = useState("");
  const [mostrarEtiquetas, setMostrarEtiquetas] = useState(true);

  const esVector = geom !== "Raster";
  const esRasterOGrande = geom === "Raster" || almacenamiento === "enlace";

  const guardar = (enviar: boolean) => {
    if (enviar) {
      const faltan: string[] = [];
      if (!nombre.trim()) faltan.push("Nombre de la capa");
      if (!abrev.trim()) faltan.push("Abreviatura");
      if (!descripcion.trim()) faltan.push("Descripción");
      if (!objetivo.trim()) faltan.push("Objetivo");
      if (!fechaRecepcion) faltan.push("Fecha de recepción");
      if (!responsable.trim()) faltan.push("Responsable de carga");
      if (!usuarioCarga.trim()) faltan.push("Usuario que subió");
      if (!fechaRegistro) faltan.push("Fecha de registro");
      if (faltan.length) {
        toast.error(`Faltan campos obligatorios: ${faltan.join(", ")}`);
        return;
      }
    } else if (!nombre.trim()) {
      toast.error("Ingresa al menos el nombre de la capa para guardar el borrador");
      return;
    }

    setSaving(true);
    try {
      const key = `base-grafica:${projectId}:capas`;
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      const nueva = {
        n: Date.now(),
        abrev: abrev || nombre.slice(0, 6).toUpperCase(),
        nombre,
        categoria,
        subcategoria,
        geometria: geom,
        fuente,
        formato,
        crs,
        descripcion,
        objetivo,
        confiabilidad,
        fechaRecepcion,
        responsable,
        usuarioCarga,
        fechaRegistro,
        estado: enviar ? "En revisión" : "Aprobado",
        resultado: enviar ? "Observada" : "Válida",
        publicar: enviar ? "No" : "Sí",
        almacenamiento,
        archivoOriginal,
        enlaceOriginal,
        archivoProcesado,
        formatoSalida,
        preservarOriginal,
        simbologia: esVector
          ? { fillColor, strokeColor, opacidad, grosor, tipoLinea, tamPunto, estiloMarcador, etiqueta, mostrarEtiquetas }
          : null,
        color: fillColor,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify([nueva, ...prev]));
      toast.success(enviar ? "Capa enviada a revisión GIS" : "Borrador guardado");
      navigate({ to: "/proyectos/$projectId/base-grafica", params: { projectId } });
    } catch (e) {
      toast.error("No se pudo guardar la capa");
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937] text-sm">
      <main className="flex-1 flex flex-col overflow-hidden">
        <ProjectPageHeader
          projectId={projectId}
          title="Registro de capa"
          badgeLabel="PROYECTO"
          badgeValue={projectId}
          badgeSuffix="BASE GRÁFICA"
        />
        <div className="px-4 py-2 bg-[#fff7ed] border-b border-[#fed7aa] flex items-center gap-2 text-[12px] text-[#b45309]">
          <Info size={14} /> La capa queda en revisión y no se publica en el geovisor hasta aprobación GIS.
        </div>


        <div className="flex-1 overflow-auto">
          <div className="max-w-[1200px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-[200px_1fr_300px] gap-5">
            {/* Nav interno */}
            <nav className="hidden lg:block sticky top-6 self-start text-[12px] space-y-1">
              {[
                { id: "identificacion", label: "1. Identificación", icon: Layers },
                { id: "origen", label: "2. Origen y formato", icon: MapPin },
                { id: "archivo", label: "3. Archivo y migración", icon: HardDrive },
                { id: "servicios", label: "4. Servicios de publicación", icon: Globe2 },
                ...(esVector ? [{ id: "simbologia", label: "5. Simbología", icon: Palette }] : []),
                { id: "trazabilidad", label: `${esVector ? 6 : 5}. Trazabilidad`, icon: History },
              ].map((s) => (
                <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#fef2f2] hover:text-[#dc2626] text-[#374151]">
                  <s.icon size={13} /> {s.label}
                </a>
              ))}
            </nav>

            {/* Formulario */}
            <div className="space-y-5 min-w-0">
              {/* 1. Identificación */}
              <section id="identificacion" className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
                <header className="px-4 py-2.5 bg-[#fef2f2] border-b border-[#fecaca] flex items-center gap-2">
                  <Layers size={14} className="text-[#dc2626]" />
                  <h2 className="text-[13px] font-bold text-[#dc2626]">1. Identificación de la capa</h2>
                  <span className="ml-auto text-[10px] text-[#6b7280]">Qué es y cómo se clasifica</span>
                </header>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2"><Field label="Nombre de la capa" required><input className={inputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Catastro COFOPRI" /></Field></div>
                    <Field label="Abreviatura" required><input className={inputCls} value={abrev} onChange={(e) => setAbrev(e.target.value)} placeholder="CAT-COFOPRI" /></Field>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Categoría" required>
                      <select className={inputCls} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                        <option>Base cartográfica</option>
                        <option>Límites administrativos</option>
                        <option>Proyecto de infraestructura</option>
                        <option>Catastro</option>
                        <option>Registral / legal</option>
                        <option>Bienes estatales</option>
                      </select>
                    </Field>
                    <Field label="Subcategoría">
                      <select className={inputCls} value={subcategoria} onChange={(e) => setSubcategoria(e.target.value)}><option value="">—</option><option>Catastro rural</option><option>Catastro urbano</option></select>
                    </Field>
                    <Field label="Nivel de confiabilidad" required>
                      <select className={inputCls} value={confiabilidad} onChange={(e) => setConfiabilidad(e.target.value)}><option>Alta</option><option>Media</option><option>Baja</option></select>
                    </Field>
                  </div>
                  <Field label="Tipo de geometría" required>
                    <div className="grid grid-cols-4 gap-2 max-w-[480px]">
                      {(["Punto", "Línea", "Polígono", "Raster"] as const).map((g) => (
                        <button key={g} type="button" onClick={() => setGeom(g)} className={`px-2 py-1.5 rounded border text-[12px] ${geom === g ? "border-[#dc2626] text-[#dc2626] bg-[#fef2f2]" : "border-[#e5e7eb] text-[#374151]"}`}>{g}</button>
                      ))}
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Descripción de la capa" required>
                      <textarea className={inputCls} rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción…" />
                    </Field>
                    <Field label="Objetivo de la capa" required>
                      <textarea className={inputCls} rows={3} value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder="Objetivo…" />
                    </Field>
                  </div>
                </div>
              </section>

              {/* 2. Origen */}
              <section id="origen" className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
                <header className="px-4 py-2.5 bg-[#fef2f2] border-b border-[#fecaca] flex items-center gap-2">
                  <MapPin size={14} className="text-[#dc2626]" />
                  <h2 className="text-[13px] font-bold text-[#dc2626]">2. Origen y formato</h2>
                  <span className="ml-auto text-[10px] text-[#6b7280]">De dónde viene la información</span>
                </header>
                <div className="p-4 grid grid-cols-3 gap-3">
                  <div className="col-span-3 sm:col-span-1"><Field label="Fuente / entidad" required><input className={inputCls} value={fuente} onChange={(e) => setFuente(e.target.value)} placeholder="COFOPRI - Dir. de Catastro Rural" /></Field></div>
                  <Field label="Formato original" required>
                    <select className={inputCls} value={formato} onChange={(e) => setFormato(e.target.value)}><option>GeoJSON</option><option>SHP</option><option>KML</option><option>GPKG</option><option>GeoTIFF</option><option>DXF</option></select>
                  </Field>
                  <Field label="Sistema de coordenadas (CRS)" required>
                    <select className={inputCls} value={crs} onChange={(e) => setCrs(e.target.value)}><option>WGS 84 / UTM zona 17S (EPSG:32717)</option><option>WGS 84 / UTM zona 18S (EPSG:32718)</option></select>
                  </Field>
                  <Field label="Fecha de recepción" required><input type="date" className={inputCls} value={fechaRecepcion} onChange={(e) => setFechaRecepcion(e.target.value)} /></Field>
                </div>
              </section>

              {/* 3. Archivo y migración */}
              <section id="archivo" className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
                <header className="px-4 py-2.5 bg-[#fef2f2] border-b border-[#fecaca] flex items-center gap-2">
                  <HardDrive size={14} className="text-[#dc2626]" />
                  <h2 className="text-[13px] font-bold text-[#dc2626]">3. Archivo original y migración</h2>
                  <span className="ml-auto text-[10px] text-[#6b7280]">Almacenamiento y conversión</span>
                </header>
                <div className="p-4 space-y-4">
                  <div>
                    <div className="text-[11px] font-medium text-[#6b7280] mb-2">Modo de almacenamiento</div>
                    <div className="flex flex-wrap items-center gap-2 text-[12px]">
                      <button type="button" onClick={() => setAlmacenamiento("archivo")} className={`px-3 py-1.5 rounded border ${almacenamiento === "archivo" ? "border-[#dc2626] text-[#dc2626] bg-[#fef2f2]" : "border-[#e5e7eb] text-[#374151]"}`}>
                        <HardDrive size={12} className="inline mr-1" /> Archivo cargado
                      </button>
                      <button type="button" onClick={() => setAlmacenamiento("enlace")} className={`px-3 py-1.5 rounded border ${almacenamiento === "enlace" ? "border-[#dc2626] text-[#dc2626] bg-[#fef2f2]" : "border-[#e5e7eb] text-[#374151]"}`}>
                        <Link2 size={12} className="inline mr-1" /> Enlace externo (ortofoto / &gt; 2 GB)
                      </button>
                      {esRasterOGrande && (
                        <span className="ml-auto text-[11px] text-[#b45309] bg-[#fef3c7] border border-[#fde68a] px-2 py-1 rounded">
                          Archivo grande / ortofoto: se recomienda enlace
                        </span>
                      )}
                    </div>
                  </div>

                  {almacenamiento === "archivo" ? (
                    <div className="border-2 border-dashed border-[#fecaca] rounded-lg p-5 text-center bg-[#fef2f2]">
                      <UploadCloud size={26} className="mx-auto text-[#dc2626] mb-1.5" />
                      <div className="text-[13px] font-medium text-[#dc2626]">Arrastrar archivo o seleccionar</div>
                      <div className="text-[11px] text-[#6b7280] mt-1">SHP, GPKG, GeoJSON, DXF, KML, Ráster</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Enlace del archivo original (URL)" required>
                        <input className={inputCls} value={enlaceOriginal} onChange={(e) => setEnlaceOriginal(e.target.value)} placeholder="https://storage.proyecto.gob.pe/ortofoto_iquitos.tif" />
                      </Field>
                      <Field label="Servicio Tile (opcional)">
                        <input className={inputCls} placeholder="https://tiles.proyecto.gob.pe/{z}/{x}/{y}.png" />
                      </Field>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Archivo original almacenado">
                      <div className="flex items-center gap-2">
                        <input className={inputCls} value={archivoOriginal} onChange={(e) => setArchivoOriginal(e.target.value)} placeholder="catastro_cofopri_original.zip" />
                        {archivoOriginal && <span className="text-[10px] px-2 py-0.5 rounded bg-[#dcfce7] text-[#166534] font-medium whitespace-nowrap">Guardado</span>}
                      </div>
                    </Field>
                    <Field label="Capa migrada / procesada">
                      <input className={inputCls} value={archivoProcesado} onChange={(e) => setArchivoProcesado(e.target.value)} placeholder="catastro_cofopri.geojson" />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-end">
                    <Field label="Formato de salida">
                      <div className="flex gap-2">
                        {(["SHP", "KML", "GeoJSON"] as const).map((f) => (
                          <button key={f} type="button" onClick={() => setFormatoSalida(f)} className={`px-3 py-1.5 rounded border text-[12px] ${formatoSalida === f ? "border-[#dc2626] text-[#dc2626] bg-[#fef2f2]" : "border-[#e5e7eb] text-[#374151]"}`}>{f}</button>
                        ))}
                      </div>
                    </Field>
                    <div className="flex items-center gap-2 text-[12px] text-[#16a34a]">
                      <CheckCircle2 size={14} /> Estado de migración: procesada correctamente
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-[12px] text-[#374151]">
                    <input type="checkbox" checked={preservarOriginal} onChange={(e) => setPreservarOriginal(e.target.checked)} />
                    Preservar archivo original (no eliminar tras migración)
                  </label>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#f3f4f6]">
                    <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e5e7eb] rounded text-[12px] hover:bg-[#f9fafb]">
                      <UploadCloud size={13} /> Procesar migración
                    </button>
                    <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e5e7eb] rounded text-[12px] hover:bg-[#f9fafb]">
                      <Download size={13} /> Descargar original
                    </button>
                    <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 border border-[#dc2626] text-[#dc2626] rounded text-[12px] hover:bg-[#fef2f2]">
                      <Download size={13} /> Descargar capa procesada
                    </button>
                  </div>
                </div>
              </section>

              {/* 4. Servicios */}
              <section id="servicios" className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
                <header className="px-4 py-2.5 bg-[#fef2f2] border-b border-[#fecaca] flex items-center gap-2">
                  <Globe2 size={14} className="text-[#dc2626]" />
                  <h2 className="text-[13px] font-bold text-[#dc2626]">4. Servicios de publicación</h2>
                  <span className="ml-auto text-[10px] text-[#6b7280]">URLs WMS / WFS (opcional)</span>
                </header>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <Field label="URL WMS"><input className={inputCls} placeholder="https://geoservicios.gob.pe/wms" /></Field>
                  <Field label="URL WFS"><input className={inputCls} placeholder="https://geoservicios.gob.pe/wfs" /></Field>
                </div>
              </section>

              {/* 5. Simbología (vector) */}
              {esVector && (
                <section id="simbologia" className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
                  <header className="px-4 py-2.5 bg-[#fef2f2] border-b border-[#fecaca] flex items-center gap-2">
                    <Palette size={14} className="text-[#dc2626]" />
                    <h2 className="text-[13px] font-bold text-[#dc2626]">5. Simbología y visualización</h2>
                    <span className="ml-auto text-[10px] text-[#6b7280]">Solo capas vectoriales</span>
                  </header>
                  <div className="p-4 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-3">
                        <Field label="Color de relleno">
                          <input type="color" className="w-full h-8 border border-[#e5e7eb] rounded" value={fillColor} onChange={(e) => setFillColor(e.target.value)} />
                        </Field>
                        <Field label="Color de borde">
                          <input type="color" className="w-full h-8 border border-[#e5e7eb] rounded" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} />
                        </Field>
                        <Field label="Opacidad">
                          <div className="flex items-center gap-2">
                            <input type="range" min={0} max={100} value={opacidad} onChange={(e) => setOpacidad(Number(e.target.value))} className="flex-1 accent-[#dc2626]" />
                            <span className="text-[11px] w-9 text-right">{opacidad}%</span>
                          </div>
                        </Field>
                        <Field label="Grosor de línea">
                          <select className={inputCls} value={grosor} onChange={(e) => setGrosor(Number(e.target.value))}>
                            {[1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>{g} px</option>)}
                          </select>
                        </Field>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="Tipo de línea">
                          <select className={inputCls} value={tipoLinea} onChange={(e) => setTipoLinea(e.target.value as any)}>
                            <option>Continua</option><option>Discontinua</option><option>Punteada</option>
                          </select>
                        </Field>
                        <Field label="Tamaño de punto">
                          <select className={inputCls} value={tamPunto} onChange={(e) => setTamPunto(Number(e.target.value))}>
                            {[4, 6, 8, 10, 12, 14].map((g) => <option key={g} value={g}>{g} px</option>)}
                          </select>
                        </Field>
                        <Field label="Estilo de marcador">
                          <select className={inputCls} value={estiloMarcador} onChange={(e) => setEstiloMarcador(e.target.value as any)}>
                            <option>Círculo</option><option>Cuadrado</option><option>Triángulo</option><option>Diamante</option>
                          </select>
                        </Field>
                      </div>
                      <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                        <Field label="Etiqueta de capa">
                          <input className={inputCls} value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)} placeholder={nombre || "Catastro COFOPRI"} />
                        </Field>
                        <Field label="Mostrar etiquetas">
                          <button type="button" onClick={() => setMostrarEtiquetas((v) => !v)} className={`w-12 h-6 rounded-full relative transition ${mostrarEtiquetas ? "bg-[#dc2626]" : "bg-[#d1d5db]"}`}>
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${mostrarEtiquetas ? "left-6" : "left-0.5"}`} />
                          </button>
                        </Field>
                      </div>
                    </div>

                    <div className="border border-[#e5e7eb] rounded-lg p-3 bg-[#f9fafb]">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#6b7280] mb-2">
                        <Eye size={12} /> Vista previa
                      </div>
                      <div className="aspect-[4/3] rounded bg-white border border-[#e5e7eb] flex items-center justify-center overflow-hidden">
                        <svg viewBox="0 0 200 150" className="w-full h-full">
                          {geom === "Polígono" && (
                            <polygon points="40,90 70,40 140,35 175,80 150,120 70,125" fill={fillColor} fillOpacity={opacidad / 100} stroke={strokeColor} strokeWidth={grosor} strokeDasharray={tipoLinea === "Discontinua" ? "8 4" : tipoLinea === "Punteada" ? "2 3" : undefined} />
                          )}
                          {geom === "Línea" && (
                            <polyline points="20,120 70,60 120,90 180,30" fill="none" stroke={strokeColor} strokeWidth={grosor} strokeDasharray={tipoLinea === "Discontinua" ? "8 4" : tipoLinea === "Punteada" ? "2 3" : undefined} />
                          )}
                          {geom === "Punto" && (
                            <circle cx="100" cy="75" r={tamPunto} fill={fillColor} stroke={strokeColor} strokeWidth={grosor} />
                          )}
                        </svg>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-[#374151]">
                        <span className="inline-block w-3 h-3 border" style={{ background: fillColor, borderColor: strokeColor }} />
                        <span>{etiqueta || nombre || "Capa"}</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* 6. Trazabilidad */}
              <section id="trazabilidad" className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
                <header className="px-4 py-2.5 bg-[#fef2f2] border-b border-[#fecaca] flex items-center gap-2">
                  <History size={14} className="text-[#dc2626]" />
                  <h2 className="text-[13px] font-bold text-[#dc2626]">{esVector ? 6 : 5}. Trazabilidad y versionado</h2>
                  <span className="ml-auto text-[10px] text-[#6b7280]">Auditoría y responsables</span>
                </header>
                <div className="p-4 space-y-4">
                  <div>
                    <div className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide mb-2">Carga</div>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Responsable de carga" required><input className={inputCls} value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="María Pérez" /></Field>
                      <Field label="Usuario que subió" required><input className={inputCls} value={usuarioCarga} onChange={(e) => setUsuarioCarga(e.target.value)} placeholder="mperez" /></Field>
                      <Field label="Fecha de registro" required><input type="date" className={inputCls} value={fechaRegistro} onChange={(e) => setFechaRegistro(e.target.value)} /></Field>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide mb-2">Validación</div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Usuario que validó"><input className={inputCls} placeholder="Carlos Gómez" /></Field>
                      <Field label="Fecha de aprobación"><input type="date" className={inputCls} /></Field>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide mb-2">Versión</div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Versión generada"><input className={inputCls} defaultValue="v0.1.0" /></Field>
                      <Field label="Motivo del cambio"><input className={inputCls} placeholder="Nueva creación de la capa." /></Field>
                    </div>
                  </div>
                </div>
              </section>

              {/* Acciones del formulario */}
              <div className="flex items-center justify-end gap-2 py-3">
                <button type="button" disabled={saving} onClick={() => guardar(false)} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#dc2626] text-[#dc2626] rounded text-[12px] hover:bg-[#fef2f2] disabled:opacity-50">
                  <Save size={14} /> Guardar borrador
                </button>
                <button type="button" disabled={saving} onClick={() => guardar(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#dc2626] text-white rounded text-[12px] hover:bg-[#b91c1c] disabled:opacity-50">
                  <Send size={14} /> Enviar a revisión
                </button>
              </div>
            </div>

            {/* Sidebar derecho */}
            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <section className="bg-white border border-[#e5e7eb] rounded-lg p-4">
                <h3 className="text-[13px] font-bold mb-3 flex items-center gap-2"><CheckCircle2 size={14} className="text-[#16a34a]" /> Controles automáticos</h3>
                <ul className="space-y-2 text-[12px]">
                  {controles.map((c) => (
                    <li key={c.label} className="flex items-center justify-between gap-2">
                      <span className="text-[#374151]">{c.label}</span>
                      {c.ok ? <CheckCircle2 size={16} className="text-[#16a34a] shrink-0" /> : <AlertTriangle size={16} className="text-[#f59e0b] shrink-0" />}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="bg-white border border-[#e5e7eb] rounded-lg p-4">
                <h3 className="text-[13px] font-bold mb-3 flex items-center gap-2"><FileText size={14} /> Estado inicial</h3>
                <div className="text-[12px] space-y-2">
                  <div className="flex justify-between"><span>Estado</span><span className="px-2 py-0.5 rounded bg-[#fee2e2] text-[#b91c1c] text-[11px] font-medium">En revisión</span></div>
                  <div className="flex justify-between"><span>Publicar en geovisor</span><span className="px-2 py-0.5 rounded bg-[#f3f4f6] text-[#374151] text-[11px] font-medium">No, hasta aprobación</span></div>
                  <p className="text-[11px] text-[#6b7280] mt-2">Se generará versión v0.1 y registro de auditoría con usuario, fecha, motivo y archivo fuente.</p>
                </div>
              </section>
              <section className="bg-white border border-[#e5e7eb] rounded-lg p-4">
                <h3 className="text-[13px] font-bold mb-2 flex items-center gap-2"><Database size={14} /> Resumen</h3>
                <ul className="text-[11px] space-y-1.5 text-[#374151]">
                  <li><span className="text-[#6b7280]">Capa:</span> {nombre || "—"}</li>
                  <li><span className="text-[#6b7280]">Categoría:</span> {categoria}</li>
                  <li><span className="text-[#6b7280]">Geometría:</span> {geom}</li>
                  <li><span className="text-[#6b7280]">Formato:</span> {formato} → {formatoSalida}</li>
                  <li><span className="text-[#6b7280]">Origen:</span> {almacenamiento === "archivo" ? "Archivo" : "Enlace externo"}</li>
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}