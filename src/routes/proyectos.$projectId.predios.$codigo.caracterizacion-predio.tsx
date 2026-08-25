import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Apple,
  CheckCircle2,
  Compass,
  Crop,
  Download,
  Fence,
  FileText,
  FileSpreadsheet,
  Hammer,
  Home,
  MapPinned,
  Pencil,
  Plus,
  Ruler,
  Save,
  Sprout,
  Trees,
  Trash2,
  Upload,
  Wrench,
  X,
} from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/caracterizacion-predio")({
  head: () => ({
    meta: [
      { title: "Caracterización del predio" },
      {
        name: "description",
        content:
          "Memoria descriptiva, planos, partidas, fichas, fotografías, documentos técnicos, legales y componentes de valorización del predio.",
      },
    ],
  }),
  component: CaracterizacionPredioPage,
});

const RED = "#dc2626";
const inputCls = "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = `${inputCls} appearance-none bg-white`;
const readOnlyCls = `${inputCls} bg-gray-50 text-gray-700`;

const TABS: { key: TabKey; label: string; icon: ComponentType<{ size?: number; className?: string }> }[] = [
  { key: "padronTecnico", label: "Padron Tecnico", icon: FileText },
  { key: "colindanciaMatriz", label: "Colindancia matriz", icon: Compass },
  { key: "areaAfectada", label: "Area afectada", icon: Crop },
  { key: "cuadroDatosTecnicos", label: "Cuadro de datos tecnicos", icon: Ruler },
  { key: "datosVivienda", label: "Datos de la vivienda", icon: Home },
  { key: "obrasComplementarias", label: "Obras complementarias", icon: Hammer },
  { key: "instFijasPermanentes", label: "Inst. Fijas Permanentes", icon: Wrench },
  { key: "plantacionesFrutales", label: "Plantaciones frutales", icon: Apple },
  { key: "plantacionesForestales", label: "Plantaciones forestales", icon: Trees },
  { key: "plantacionesTransitorias", label: "Plantaciones transitorias", icon: Sprout },
  { key: "cercoVivo", label: "Cerco vivo", icon: Fence },
  { key: "danoEmergente", label: "Dano emergente", icon: AlertTriangle },
  { key: "descripcionEntorno", label: "Descripcion del Entorno", icon: MapPinned },
];

type TabKey =
  | "padronTecnico"
  | "colindanciaMatriz"
  | "areaAfectada"
  | "cuadroDatosTecnicos"
  | "datosVivienda"
  | "obrasComplementarias"
  | "instFijasPermanentes"
  | "plantacionesFrutales"
  | "plantacionesForestales"
  | "plantacionesTransitorias"
  | "cercoVivo"
  | "danoEmergente"
  | "descripcionEntorno";

type CaracterizacionTabProps = {
  codigo: string;
  predio: ReturnType<typeof getPredioByCodigo>;
  projectLabel: string;
};

type AreaSection = "matriz" | "afectadas" | "remanentes";

type AreaRow = {
  cod: string;
  uso: string;
  directa: number;
  indirecta: number;
  total: number;
  fechaPlanoCbc: string;
  codigoPlanoCbc: string;
};

type ViviendaRow = {
  descripcion: string;
  modulo: string;
  piso: string;
  directa: number;
  indirecta: number;
  total: number;
  uso: string;
  material: string;
  fotos: string;
};

type ObraComplementariaRow = {
  tipo: string;
  longitud: string;
  altura: string;
  metrado: string;
  unidad: string;
  uso: string;
  caracteristicas: string;
  ubicacion: string;
  foto: string;
};

type InstalacionFijaPermanenteRow = {
  descripcion: string;
  areaMetrado: string;
  longitud: string;
  ancho: string;
  alturaProfundidad: string;
  antiguedadAnos: string;
  material: string;
  estadoConservacion: string;
  estadoConstruccion: string;
  vuif: string;
  fd: string;
  caracteristicas: string;
  foto: string;
};

type PlantacionFrutalRow = {
  nombreComun: string;
  nombreCientifico: string;
  variedad: string;
  edadAnos: string;
  unidadMedida: string;
  cantidad: string;
  utilidad: string;
  vupp: string;
  observacion: string;
  foto: string;
};

type PlantacionForestalRow = {
  nombreComun: string;
  nombreCientifico: string;
  edadAnos: string;
  diametro: string;
  alturaTotal: string;
  numeroPlantas: string;
  utilidad: string;
  vupp: string;
  observacion: string;
  foto: string;
};

type PlantacionTransitoriaRow = {
  nombreComun: string;
  nombreCientifico: string;
  variedad: string;
  edadAnos: string;
  unidadMedida: string;
  cantidad: string;
  utilidad: string;
  vupt: string;
  observacion: string;
  foto: string;
};

type CercoVivoRow = {
  nombreCientifico: string;
  nombreComun: string;
  edadAnos: string;
  longitudCerco: string;
  distanciamientoPlantas: string;
  estadoFitosanitario: string;
  observaciones: string;
  foto: string;
};

function CaracterizacionPredioPage () {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}` : projectId;
  const [activeTab, setActiveTab] = useState<TabKey>("padronTecnico");
  const [message, setMessage] = useState("");

  function handleSubmit (event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Caracterización del predio guardada como borrador técnico.");
  }

  function handleGenerateMemoriaDescriptiva() {
    const baseCode = getDocumentBaseCode(predio?.cod || decodedCodigo);
    downloadBlobFile(
      `memoria_descriptiva_${baseCode}.doc`,
      createMemoriaDescriptivaBlob({
        codigo: predio?.cod || decodedCodigo,
        predio,
        projectLabel,
      }),
    );
    setMessage("Memoria descriptiva generada correctamente.");
  }

  function handleGenerateMembretadoPlanos() {
    const baseCode = getDocumentBaseCode(predio?.cod || decodedCodigo);
    downloadBlobFile(
      `membretado_planos_${baseCode}.xls`,
      createMembretadoPlanosBlob({
        baseCode,
        codigo: predio?.cod || decodedCodigo,
        predio,
        projectLabel,
      }),
    );
    setMessage("Membretado de planos generado correctamente.");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Caracterización del predio"
        badgeLabel="Predio"
        badgeValue={predio?.cod || decodedCodigo}
        badgeSuffix="Etapa I · 2.7"
      />

      <main className="p-4">
        <form onSubmit={handleSubmit} className="bg-white rounded border">
          <div className="px-5 py-5">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border-b-2"
                style={{ borderColor: RED, color: RED }}
              >
                <Home size={14} /> 2.7 Caracterización del predio
              </div>

              <div className="flex flex-wrap justify-end gap-2 pb-1">
                <button
                  type="button"
                  onClick={handleGenerateMemoriaDescriptiva}
                  className="inline-flex h-8 items-center gap-1.5 rounded border border-[#dc2626] bg-white px-3 text-[12px] font-medium text-[#dc2626] transition hover:bg-red-50"
                >
                  <Download size={14} /> Generar memoria descriptiva
                </button>
                <button
                  type="button"
                  onClick={handleGenerateMembretadoPlanos}
                  className="inline-flex h-8 items-center gap-1.5 rounded bg-[#dc2626] px-3 text-[12px] font-medium text-white transition hover:bg-[#b91c1c]"
                >
                  <FileSpreadsheet size={14} /> Membretado de planos
                </button>
              </div>
            </div>

            <div className="flex overflow-hidden rounded border">
              <aside className="w-[250px] shrink-0 border-r bg-gray-50/70 py-2">
                <nav className="flex flex-col">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2.5 border-l-2 px-4 py-2 text-left text-[12.5px] transition ${active
                            ? "border-[#dc2626] bg-white font-medium text-[#dc2626]"
                            : "border-transparent text-gray-600 hover:bg-white hover:text-gray-900"
                          }`}
                      >
                        <Icon size={15} />
                        <span className="min-w-0 truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </aside>

              <section className="min-w-0 flex-1 p-5">
                {renderActiveTab(activeTab, { codigo: decodedCodigo, predio, projectLabel })}
              </section>
            </div>

            {message && (
              <div className="mt-4 flex items-start gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-[12px] text-green-900">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
              <button
                type="button"
                onClick={() => history.back()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
              >
                <X size={14} /> Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded"
                style={{ background: RED }}
              >
                <Save size={14} /> Guardar caracterizacion
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

function renderActiveTab (activeTab: TabKey, props: CaracterizacionTabProps) {
  switch (activeTab) {
    case "padronTecnico":
      return <PadronTecnicoTab {...props} />;
    case "colindanciaMatriz":
      return <ColindanciasTab {...props} />;
    case "areaAfectada":
      return <AreasTab {...props} />;
    case "cuadroDatosTecnicos":
      return <DatosTecnicosTab {...props} />;
    case "datosVivienda":
      return <DatosViviendaTab {...props} />;
    case "obrasComplementarias":
      return <ObrasComplementariasTab {...props} />;
    case "instFijasPermanentes":
      return <InstalacionesFijasPermanentesTab {...props} />;
    case "plantacionesFrutales":
      return <PlantacionesFrutalesTab {...props} />;
    case "plantacionesForestales":
      return <PlantacionesForestalesTab {...props} />;
    case "plantacionesTransitorias":
      return <PlantacionesTransitoriasTab {...props} />;
    case "cercoVivo":
      return <CercoVivoTab {...props} />;
    case "danoEmergente":
      return <DanoEmergenteTab {...props} />;
    case "descripcionEntorno":
      return <DescripcionEntornoTab {...props} />;
  }
}

function PadronTecnicoTab ({ codigo }: CaracterizacionTabProps) {
  return (
    <div>
      <div className="mb-2 text-[12px]" style={{ color: RED }}>Formulario no guardado</div>
      <SectionTitle>Datos de expediente</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Codigo del Predio"><input className={inputCls} defaultValue={codigo} /></Field>
        <Field label="Codigo Expediente"><input className={inputCls} defaultValue="3546-2023-MTC/DDP" /></Field>
        <Field label="Profesional Tecnico Responsable" required><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Mes Elaboracion Exp."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Estado del Predio."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Tipo de Tasacion."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Tipo Periodo Tasacion."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Fecha de Inspeccion de Campo."><input type="date" className={inputCls} /></Field>
      </div>

      <SectionTitle>Ubicacion</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Tipo de Predio."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Zonificacion."><input className={inputCls} /></Field>
        <Field label="Cond. Rustico."><select className={`${selectCls} bg-gray-100`}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Norma que Aprueba."><input className={inputCls} /></Field>
        <Field label="Uso."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Comunidad Campesina."><input className={inputCls} /></Field>
        <Field label="Denominacion."><input className={inputCls} /></Field>
        <Field label="Sector."><input className={inputCls} /></Field>
        <Field label="Manzana."><input className={inputCls} /></Field>
        <Field label="UC."><input className={inputCls} /></Field>
        <Field label="Lote."><input className={inputCls} /></Field>
        <Field label="Via."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Nombre de Via."><input className={inputCls} /></Field>
        <Field label="No Municipal."><input className={inputCls} /></Field>
        <Field label="Interior."><input className={inputCls} /></Field>
        <Field label="Progresiva inicial."><input className={inputCls} /></Field>
        <Field label="Lado."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Progresiva final."><input className={inputCls} /></Field>
      </div>

      <SectionTitle>Topografia</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Topografia."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Accesibilidad."><input className={inputCls} /></Field>
        <Field label="Pistas veredas."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Alumbrado publico."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Instalaciones gas."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Alcantarillado."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Agua potable."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
      </div>

      <SectionTitle>Areas y certificacion</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Area Grafica Matriz. (M2)"><input className={inputCls} /></Field>
        <Field label="Area Registral Matriz. (M2)"><input className={inputCls} /></Field>
        <Field label="Partida electronica para cbc."><input className={inputCls} /></Field>
        <Field label="Profesional elaboro cbc."><input className={inputCls} /></Field>
      </div>

      <SectionTitle>Observaciones tecnicas</SectionTitle>
      <textarea className="w-full rounded border border-gray-300 p-2 text-[12px] focus:outline-none focus:border-gray-500" rows={2} placeholder="Ingrese la observacion" />

      <SectionTitle>Datos de los planos</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Profesional Tecnico Responsable de Firmar Planos."><input className={inputCls} /></Field>
        <Field label="Datum de los Planos."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Fecha Elaboracion Plano Diagnostico."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Codigo plano diagnostico."><input className={inputCls} /></Field>
        <Field label="Fecha de Elaboracion del Plano de Ubicacion."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Codigo plano ubicacion."><input className={inputCls} /></Field>
        <Field label="Fecha de Elaboracion del Plano Perimetrico."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Codigo plano perimetrico."><input className={inputCls} /></Field>
        <Field label="Fecha de Elaboracion del Plano de Afectacion."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Codigo plano afectacion."><input className={inputCls} /></Field>
        <Field label="Fecha de Elaboracion del Plano de Distribucion."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Codigo plano distribucion."><input className={inputCls} /></Field>
        <Field label="Fecha de Elaboracion del Plano de Arquitectura."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Codigo plano arquitectura."><input className={inputCls} /></Field>
        <Field label="Firma del Plano de Arquitectura."><input className={inputCls} /></Field>
      </div>

      <SectionTitle>Datos Memoria descriptiva</SectionTitle>
      <div className="grid grid-cols-1 gap-y-2">
        <Field label="Fecha de Emision."><input type="date" className={inputCls} /></Field>
      </div>
    </div>
  );
}

function ResumenTab ({ codigo, predio, projectLabel }: CaracterizacionTabProps) {
  return (
    <>
      <SectionTitle>Datos del registro seleccionado</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Codigo interno">
          <input className={readOnlyCls} value={codigo} readOnly />
        </Field>
        <Field label="Codigo de predio">
          <input className={readOnlyCls} value={predio?.cod || codigo} readOnly />
        </Field>
        <Field label="Proyecto">
          <input className={readOnlyCls} value={projectLabel} readOnly />
        </Field>
        <Field label="Expediente">
          <input className={readOnlyCls} value={predio?.exp || "Sin informacion"} readOnly />
        </Field>
        <Field label="Condicion predio">
          <input className={readOnlyCls} value={predio?.condicionPredio || "Sin informacion"} readOnly />
        </Field>
        <Field label="Modalidad">
          <input className={readOnlyCls} value={predio?.mod || "Sin informacion"} readOnly />
        </Field>
        <Field label="Sujeto pasivo" className="col-span-2">
          <input className={readOnlyCls} value={predio?.suj || "Sin informacion"} readOnly />
        </Field>
      </div>

      <SectionTitle>Responsables y estado</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Responsable tecnico">
          <input className={inputCls} defaultValue={predio?.rtec || ""} placeholder="Especialista tecnico" />
        </Field>
        <Field label="Responsable legal">
          <input className={inputCls} defaultValue={predio?.rlegal || ""} placeholder="Especialista legal" />
        </Field>
        <Field label="Fecha de inspeccion">
          <input className={inputCls} type="date" />
        </Field>
        <Field label="Estado de caracterizacion">
          <select className={selectCls} defaultValue="Borrador">
            <option>Borrador</option>
            <option>En revision</option>
            <option>Validada</option>
          </select>
        </Field>
      </div>
    </>
  );
}

function UbicacionTab ({ predio }: CaracterizacionTabProps) {
  return (
    <>
      <SectionTitle>Ubicacion</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Departamento / ciudad">
          <input className={inputCls} defaultValue={predio?.ciudad || ""} />
        </Field>
        <Field label="Tipo de predio">
          <input className={inputCls} defaultValue={predio?.tipo || predio?.tp || ""} />
        </Field>
        <Field label="Denominacion">
          <input className={inputCls} placeholder="Nombre, sector o referencia del predio" />
        </Field>
        <Field label="Uso actual">
          <select className={selectCls}>
            <option>-- SELECCIONE --</option>
            <option>Agricola</option>
            <option>Urbano</option>
            <option>Comercial</option>
            <option>Sin uso aparente</option>
          </select>
        </Field>
        <Field label="Accesibilidad">
          <input className={inputCls} placeholder="Via de acceso, trocha, carretera o camino" />
        </Field>
        <Field label="Servicios existentes">
          <input className={inputCls} placeholder="Agua, energia, saneamiento, otros" />
        </Field>
      </div>

      <SectionTitle>Descripcion del entorno</SectionTitle>
      <textarea
        className="min-h-[96px] w-full rounded border border-gray-300 p-2 text-[12px] focus:outline-none focus:border-gray-500"
        placeholder="Describa el entorno inmediato, accesos, hitos, ocupacion y condiciones fisicas observadas."
      />
    </>
  );
}

function AreasTab ({ codigo }: CaracterizacionTabProps) {
  const [matriz, setMatriz] = useState<AreaRow[]>([]);
  const [afectadas, setAfectadas] = useState<AreaRow[]>([
    {
      cod: "KFRE",
      uso: "AFECTADA",
      directa: 150,
      indirecta: 0,
      total: 150,
      fechaPlanoCbc: "FEBRERO 2025",
      codigoPlanoCbc: "PTKT-0001",
    },
  ]);
  const [remanentes, setRemanentes] = useState<AreaRow[]>([]);
  const [modal, setModal] = useState<AreaSection | null>(null);
  const totalDirecta = afectadas.reduce((sum, row) => sum + row.directa, 0);
  const totalIndirecta = afectadas.reduce((sum, row) => sum + row.indirecta, 0);
  const totalArea = afectadas.reduce((sum, row) => sum + row.total, 0);

  function addArea (target: AreaSection, row: AreaRow) {
    if (target === "matriz") setMatriz((current) => [...current, row]);
    if (target === "afectadas") setAfectadas((current) => [...current, row]);
    if (target === "remanentes") setRemanentes((current) => [...current, row]);
    setModal(null);
  }

  return (
    <div>
      <SectionTitle>Datos de expediente</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Codigo del Predio"><input className={inputCls} defaultValue={codigo} /></Field>
        <Field label="Codigo Expediente"><input className={inputCls} defaultValue="3546-2023-MTC/DDP" /></Field>
      </div>

      <AreaSectionBlock
        title="Area matriz"
        rows={matriz}
        onAdd={() => setModal("matriz")}
        onDelete={(index) => setMatriz((current) => current.filter((_, currentIndex) => currentIndex !== index))}
      />

      <AreaSectionBlock
        title="Listado de areas afectadas"
        rows={afectadas}
        onAdd={() => setModal("afectadas")}
        onDelete={(index) => setAfectadas((current) => current.filter((_, currentIndex) => currentIndex !== index))}
      />

      <div className="mt-3">
        <div className="mb-2 border-b pb-1 pl-3 text-[12px] font-medium" style={{ color: RED }}>Totales</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <Field label="Area Directa Total (M2)"><input className={inputCls} value={totalDirecta.toFixed(2)} readOnly /></Field>
          <Field label="Sumatoria de Areas Total (M2)"><input className={inputCls} value={totalArea.toFixed(2)} readOnly /></Field>
          <Field label="Area Indirecta Total (M2)"><input className={inputCls} value={totalIndirecta.toFixed(2)} readOnly /></Field>
        </div>
      </div>

      <AreaSectionBlock
        title="Listado de areas remanentes"
        rows={remanentes}
        onAdd={() => setModal("remanentes")}
        onDelete={(index) => setRemanentes((current) => current.filter((_, currentIndex) => currentIndex !== index))}
      />

      {modal && (
        <AddAreaModal
          key={modal}
          defaultUso={modal === "matriz" ? "MATRIZ" : modal === "remanentes" ? "REMANENTE" : "AFECTADA"}
          onClose={() => setModal(null)}
          onAdd={(row) => addArea(modal, row)}
        />
      )}
    </div>
  );
}

function AreaSectionBlock ({
  title,
  rows,
  onAdd,
  onDelete,
}: {
  title: string;
  rows: AreaRow[];
  onAdd: () => void;
  onDelete: (index: number) => void;
}) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div className="mb-3 pl-3">
        <AddButton onClick={onAdd} />
      </div>
      <AreaTable rows={rows} onDelete={onDelete} />
    </div>
  );
}

function AddButton ({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[12px] text-white"
      style={{ background: "#5eaaa8" }}
    >
      <Plus size={14} /> Anadir
    </button>
  );
}

function AreaTable ({ rows, onDelete }: { rows: AreaRow[]; onDelete: (index: number) => void }) {
  const headers = [
    "#",
    "Cod. poligono",
    "Uso DT",
    "Area directa (m2)",
    "Area indirecta (m2)",
    "Area total (m2)",
    "Fecha de elaboracion del plano CBC",
    "Codigo del plano CBC",
    "Acciones",
  ];

  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full min-w-[1080px] text-[12px]">
        <thead className="bg-gray-50">
          <tr className="text-left">
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap border-b px-2 py-1.5 font-medium text-gray-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={`${row.cod}-${index}`} className="hover:bg-gray-50">
                <td className="border-b px-2 py-1.5">{index + 1}</td>
                <td className="border-b px-2 py-1.5">{row.cod}</td>
                <td className="border-b px-2 py-1.5">{row.uso}</td>
                <td className="border-b px-2 py-1.5">{formatAreaNumber(row.directa)}</td>
                <td className="border-b px-2 py-1.5">{formatAreaNumber(row.indirecta)}</td>
                <td className="border-b px-2 py-1.5">{formatAreaNumber(row.total)}</td>
                <td className="border-b px-2 py-1.5">{row.fechaPlanoCbc}</td>
                <td className="border-b px-2 py-1.5">{row.codigoPlanoCbc}</td>
                <td className="border-b px-2 py-1.5">
                  <div className="flex gap-1">
                    <button type="button" className="rounded border p-1 text-blue-600" aria-label="Editar area">
                      <Pencil size={12} />
                    </button>
                    <button type="button" onClick={() => onDelete(index)} className="rounded border p-1" style={{ color: RED }} aria-label="Eliminar area">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-2 py-6 text-center text-gray-400">
                Sin registros
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AddAreaModal ({
  defaultUso,
  onClose,
  onAdd,
}: {
  defaultUso: string;
  onClose: () => void;
  onAdd: (row: AreaRow) => void;
}) {
  const [form, setForm] = useState({
    cod: "",
    uso: defaultUso,
    directa: "",
    indirecta: "",
    fechaPlanoCbc: "FEBRERO 2026",
    codigoPlanoCbc: "",
  });
  const directa = parseNumber(form.directa);
  const indirecta = parseNumber(form.indirecta);
  const total = directa + indirecta;

  function handleAdd () {
    onAdd({
      cod: form.cod || "KFRE",
      uso: form.uso === "-- SELECCIONE --" ? defaultUso : form.uso,
      directa,
      indirecta,
      total,
      fechaPlanoCbc: form.fechaPlanoCbc,
      codigoPlanoCbc: form.codigoPlanoCbc,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" onClick={onClose}>
      <div className="w-[720px] max-w-[calc(100vw-32px)] rounded bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[14px] text-gray-700">Agregar</div>
          <button type="button" onClick={onClose} className="p-1 text-gray-600 hover:text-gray-900" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-t pt-3">
          <Field label="Uso" required className="col-span-2">
            <select className={selectCls} value={form.uso} onChange={(event) => setForm({ ...form, uso: event.target.value })}>
              <option>-- SELECCIONE --</option>
              <option>AFECTADA</option>
              <option>MATRIZ</option>
              <option>REMANENTE</option>
            </select>
          </Field>
          <Field label="Area Directa m2" required>
            <input className={inputCls} value={form.directa} onChange={(event) => setForm({ ...form, directa: event.target.value })} />
          </Field>
          <Field label="Area Indirecta M2" required>
            <input className={inputCls} value={form.indirecta} onChange={(event) => setForm({ ...form, indirecta: event.target.value })} />
          </Field>
          <Field label="Area Total M2" required>
            <input className={`${inputCls} bg-gray-100`} value={formatAreaNumber(total)} readOnly />
          </Field>
          <Field label="Fech. Elab. Plano CBC" required>
            <select className={selectCls} value={form.fechaPlanoCbc} onChange={(event) => setForm({ ...form, fechaPlanoCbc: event.target.value })}>
              <option>FEBRERO 2026</option>
              <option>FEBRERO 2025</option>
              <option>ENERO 2026</option>
              <option>MARZO 2026</option>
            </select>
          </Field>
          <Field label="codigoPlanoCbc" className="col-span-2">
            <input className={inputCls} value={form.codigoPlanoCbc} onChange={(event) => setForm({ ...form, codigoPlanoCbc: event.target.value })} />
          </Field>
          {["Foto Panoramico", "Foto Frontal", "Foto Lado Izquierdo", "Foto Lado Derecha", "Foto Fondo"].map((label) => (
            <Field key={label} label={label} className="col-span-2">
              <input type="file" className="w-full text-[11px]" />
            </Field>
          ))}
        </div>

        <div className="mt-5 flex justify-center gap-2 border-t pt-3">
          <button type="button" onClick={handleAdd} className="inline-flex items-center gap-1.5 rounded px-8 py-1.5 text-[12px] text-white" style={{ background: RED }}>
            <Plus size={14} /> Agregar
          </button>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-8 py-1.5 text-[12px] hover:bg-gray-50">
            <X size={14} /> Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function parseNumber (value: string) {
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAreaNumber (value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function ColindanciasTab ({ codigo }: CaracterizacionTabProps) {
  return (
    <div>
      <SectionTitle>Datos de expediente</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Codigo del Predio"><input className={inputCls} defaultValue={codigo} /></Field>
        <Field label="Codigo de Expediente"><input className={inputCls} defaultValue="3546-2023-MTC/DDP" /></Field>
      </div>

      <SectionTitle>Colindancias</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Norte - Frente."><input className={inputCls} /></Field>
        <Field label="Norte - Frente: Distancia."><input className={inputCls} /></Field>
        <Field label="Este - Derecha."><input className={inputCls} /></Field>
        <Field label="Este - Derecha: Distancia."><input className={inputCls} /></Field>
        <Field label="Sur - Izquierda."><input className={inputCls} /></Field>
        <Field label="Sur - Izquierda: Distancia."><input className={inputCls} /></Field>
        <Field label="Oeste - Fondo."><input className={inputCls} /></Field>
        <Field label="Oeste - Fondo: Distancia."><input className={inputCls} /></Field>
      </div>
    </div>
  );
}

function DatosTecnicosTab ({ codigo }: CaracterizacionTabProps) {
  const [selectedArea, setSelectedArea] = useState("NINGUNO");
  const [fileName, setFileName] = useState("");
  const [subTab, setSubTab] = useState<"cdt" | "colindancias">("cdt");
  const areaRows: AreaRow[] = [
    {
      cod: "KFRE",
      uso: "AFECTADA",
      directa: 150,
      indirecta: 0,
      total: 150,
      fechaPlanoCbc: "FEBRERO 2025",
      codigoPlanoCbc: "PTKT-0001",
    },
  ];
  const cdtRows = [
    ["1", "KFRE", "AFECTADA", "1-2", "6.56", "46d25'33\"", "537816.4", "8605575.39", "538041.07", "8605942.86", "NORTE", "COMUNIDAD CAMPESINA COTAY (PE: 40019771)", "Colinda con Comunidad Campesina Cotay (PE: 40019771), mediante una linea recta compuesta por un tramo recto que mide en total 6.56 metros, desde el vertice 1 al vertice 2; tal como se indica en los datos tecnico descritos en el Anexo Nro. 1"],
    ["2", "KFRE", "AFECTADA", "2-3", "10.01", "92d2'18\"", "537822.79", "8605573.89", "538047.46", "8605941.36", "ESTE", "CARRETERA NACIONAL PE-3S", "Colinda con Carretera Nacional PE-3S, mediante una linea recta compuesta por un tramo recto que mide en total 10.01 metros, desde el vertice 2 al vertice 3; tal como se indica en los datos tecnico descritos en el Anexo Nro. 1"],
    ["3", "KFRE", "AFECTADA", "3-4", "0.13", "25d8'25\"", "537820.85", "8605564.07", "538045.52", "8605931.54", "SUR", "VIAL-LST4-T04-ST05-090511-OC-00080", ""],
    ["4", "KFRE", "AFECTADA", "4-5", "1.24", "181d11'31\"", "537820.82", "8605564.19", "538045.49", "8605931.66", "SUR", "VIAL-LST4-T04-ST05-090511-OC-00080", ""],
    ["5", "KFRE", "AFECTADA", "5-6", "1.23", "181d15'7\"", "537820.49", "8605565.39", "538045.17", "8605932.85", "OESTE", "VIAL-LST4-T04-ST05-090511-OC-00080", ""],
    ["6", "KFRE", "AFECTADA", "6-7", "1.22", "181d18'42\"", "537820.15", "8605566.57", "538044.82", "8605934.03", "OESTE", "VIAL-LST4-T04-ST05-090511-OC-00080", ""],
    ["7", "KFRE", "AFECTADA", "7-8", "1.21", "181d22'19\"", "537819.78", "8605567.72", "538044.45", "8605935.19", "OESTE", "VIAL-LST4-T04-ST05-090511-OC-00080", ""],
    ["8", "KFRE", "AFECTADA", "8-9", "1.2", "181d25'48\"", "537819.38", "8605568.86", "538044.05", "8605936.33", "OESTE", "VIAL-LST4-T04-ST05-090511-OC-00080", ""],
    ["9", "KFRE", "AFECTADA", "9-10", "1.19", "181d29'27\"", "537818.96", "8605569.98", "538043.63", "8605937.45", "OESTE", "VIAL-LST4-T04-ST05-090511-OC-00080", ""],
    ["10", "KFRE", "AFECTADA", "10-11", "1.17", "181d33'2\"", "537818.52", "8605571.08", "538043.19", "8605938.55", "OESTE", "VIAL-LST4-T04-ST05-090511-OC-00080", ""],
    ["11", "KFRE", "AFECTADA", "11-12", "1.16", "181d36'34\"", "537818.05", "8605572.16", "538042.72", "8605939.62", "OESTE", "VIAL-LST4-T04-ST05-090511-OC-00080", ""],
    ["12", "KFRE", "AFECTADA", "12-13", "1.15", "181d40'9\"", "537817.55", "8605573.21", "538042.22", "8605940.68", "OESTE", "VIAL-LST4-T04-ST05-090511-OC-00080", ""],
    ["13", "KFRE", "AFECTADA", "13-14", "1.14", "181d43'46\"", "537817.03", "8605574.24", "538041.7", "8605941.71", "OESTE", "VIAL-LST4-T04-ST05-090511-OC-00080", ""],
    ["14", "KFRE", "AFECTADA", "14-1", "0.17", "181d47'19\"", "537816.48", "8605575.25", "538041.15", "8605942.71", "OESTE", "VIAL-LST4-T04-ST05-090511-OC-00080", ""],
  ];
  const colRows = [
    ["1", "KFRE", "RURAL", "WGS84", "AFECTADA", "NORTE", "COMUNIDAD CAMPESINA COTAY (PE: 40019771)", "6.56", cdtRows[0][12]],
    ["2", "KFRE", "RURAL", "WGS84", "AFECTADA", "ESTE", "CARRETERA NACIONAL PE-3S", "10.01", cdtRows[1][12]],
    ["3", "KFRE", "RURAL", "WGS84", "AFECTADA", "SUR", "VIAL-LST4-T04-ST05-090511-OC-00080", "1.37", ""],
    ["4", "KFRE", "RURAL", "WGS84", "AFECTADA", "OESTE", "VIAL-LST4-T04-ST05-090511-OC-00080", "10.84", ""],
  ];

  return (
    <div>
      <SectionTitle>Datos de expediente</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Codigo del Predio"><input className={inputCls} defaultValue={codigo} /></Field>
        <Field label="Codigo Expediente"><input className={inputCls} defaultValue="3546-2023-MTC/DDP" /></Field>
      </div>

      <SectionTitle>Listado de areas Afectadas</SectionTitle>
      <div className="overflow-x-auto rounded border">
        <table className="w-full min-w-[1060px] text-[12px]">
          <thead className="bg-gray-50">
            <tr className="text-left">
              {["#", "Cod. poligono", "Uso DT", "Area directa (m2)", "Area indirecta (m2)", "Area total (m2)", "Fecha de elaboracion del plano CBC", "Codigo del plano CBC", "Seleccionar"].map((header) => (
                <th key={header} className="whitespace-nowrap border-b px-2 py-1.5 font-medium text-gray-700">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {areaRows.map((row, index) => (
              <tr key={row.cod} className="hover:bg-gray-50">
                <td className="border-b px-2 py-1.5">{index + 1}</td>
                <td className="border-b px-2 py-1.5">{row.cod}</td>
                <td className="border-b px-2 py-1.5">{row.uso}</td>
                <td className="border-b px-2 py-1.5">{formatAreaNumber(row.directa)}</td>
                <td className="border-b px-2 py-1.5">{formatAreaNumber(row.indirecta)}</td>
                <td className="border-b px-2 py-1.5">{formatAreaNumber(row.total)}</td>
                <td className="border-b px-2 py-1.5">{row.fechaPlanoCbc}</td>
                <td className="border-b px-2 py-1.5">{row.codigoPlanoCbc}</td>
                <td className="border-b px-2 py-1.5">
                  <button type="button" onClick={() => setSelectedArea(row.cod)} className="rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-50">
                    Seleccionar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionTitle>Digital de cuadro en excel</SectionTitle>
      <div className="grid grid-cols-[220px_1fr_220px] items-center gap-x-5 gap-y-3 text-[12px]">
        <label className="text-right text-gray-700">Area Seleccionada.</label>
        <div className="font-semibold text-gray-700">{selectedArea}</div>
        <div />

        <label className="text-right text-gray-700">Descarga Plantilla de Carga de Datos.</label>
        <button type="button" className="inline-flex size-8 items-center justify-center rounded text-white" style={{ background: RED }}>
          <FileSpreadsheet size={14} />
        </button>
        <div />

        <label className="text-right text-gray-700">Archivo de Datos Tecnicos</label>
        <div className="flex min-w-0 items-center gap-2">
          <input
            type="file"
            className="max-w-[360px] text-[11px]"
            onChange={(event) => setFileName(event.target.files?.[0]?.name || "")}
          />
          {fileName && <span className="truncate text-[11px] text-gray-600">{fileName}</span>}
        </div>
        <button type="button" className="inline-flex items-center justify-center gap-1.5 rounded px-8 py-1.5 text-[12px] text-white" style={{ background: RED }}>
          <Upload size={13} /> Subir CDT
        </button>
      </div>

      <SectionTitle>Cuadro de datos tecnicos y colindancias</SectionTitle>
      <div className="mb-2 flex border-b">
        <button
          type="button"
          onClick={() => setSubTab("cdt")}
          className={`border px-3 py-1.5 text-[12px] ${subTab === "cdt" ? "border-gray-300 border-b-white bg-white font-medium text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"}`}
        >
          Cuadro de datos tecnicos
        </button>
        <button
          type="button"
          onClick={() => setSubTab("colindancias")}
          className={`border px-3 py-1.5 text-[12px] ${subTab === "colindancias" ? "border-gray-300 border-b-white bg-white font-medium text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"}`}
        >
          Colindancias
        </button>
      </div>

      {subTab === "cdt" ? (
        <WideTable
          headers={["Vertice", "Cod. afectada", "Uso DT", "Lado", "Distancia (m)", "Angulo interno", "Este", "Norte", "Este 2", "Norte 2", "Lado 2", "Colindancia", "Colindancia CBC"]}
          rows={cdtRows}
        />
      ) : (
        <WideTable
          headers={["Nro.", "Cod. afect.", "Tipo", "Datum", "Uso DT", "Lado", "Colindancia", "Suma de lados", "Colindancia CBC"]}
          rows={colRows}
        />
      )}
    </div>
  );
}

function WideTable ({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full min-w-[1320px] text-[12px]">
        <thead className="bg-gray-50">
          <tr className="text-left">
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap border-b px-2 py-1.5 font-medium text-gray-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${row[0]}-${rowIndex}`} className="hover:bg-gray-50">
              {row.map((cell, cellIndex) => (
                <td key={`${row[0]}-${cellIndex}`} className={`border-b px-2 py-1.5 ${cellIndex === row.length - 1 ? "max-w-[260px] text-[10px] leading-4" : "whitespace-nowrap"}`}>
                  {cell || <span className="text-gray-400">Pendiente</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComponentesTab () {
  return (
    <>
      <SectionTitle>Componentes identificados</SectionTitle>
      <DataTable
        headers={["#", "Componente", "Descripcion", "Cantidad", "Unidad", "Estado", "Foto"]}
        rows={[
          ["1", "Vivienda", "", "", "m2", "Por verificar", "Pendiente"],
          ["2", "Obra complementaria", "", "", "und", "Por verificar", "Pendiente"],
          ["3", "Plantaciones", "", "", "und", "Por verificar", "Pendiente"],
          ["4", "Cerco vivo", "", "", "ml", "Por verificar", "Pendiente"],
        ]}
      />
    </>
  );
}

function EvidenciasTab () {
  return (
    <>
      <SectionTitle>Archivo fotografico y sustentos</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {["Foto panoramica", "Foto frontal", "Foto lateral izquierda", "Foto lateral derecha", "Plano fuente", "Acta de inspeccion"].map((label) => (
          <Field key={label} label={label}>
            <input className="text-[11px]" type="file" />
          </Field>
        ))}
      </div>
    </>
  );
}

function ObservacionesTab () {
  return (
    <>
      <SectionTitle>Observaciones tecnicas</SectionTitle>
      <textarea
        className="min-h-[112px] w-full rounded border border-gray-300 p-2 text-[12px] focus:outline-none focus:border-gray-500"
        placeholder="Registre observaciones de campo, diferencias entre fuente grafica y fisica, ocupaciones, restricciones o tareas pendientes."
      />

      <SectionTitle>Control de calidad</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Revision topografica">
          <select className={selectCls}>
            <option>Pendiente</option>
            <option>Conforme</option>
            <option>Observado</option>
          </select>
        </Field>
        <Field label="Revision documental">
          <select className={selectCls}>
            <option>Pendiente</option>
            <option>Conforme</option>
            <option>Observado</option>
          </select>
        </Field>
      </div>
    </>
  );
}

function DatosViviendaTab ({ codigo }: CaracterizacionTabProps) {
  const [rows, setRows] = useState<ViviendaRow[]>([]);
  const [open, setOpen] = useState(false);

  function addVivienda(row: ViviendaRow) {
    setRows((current) => [...current, row]);
    setOpen(false);
  }

  return (
    <div>
      <SectionTitle>Datos de expediente</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Codigo del Predio"><input className={inputCls} defaultValue={codigo} /></Field>
        <Field label="Codigo de Expediente"><input className={inputCls} defaultValue="3546-2023-MTC/DDP" /></Field>
      </div>

      <SectionTitle>Listado de viviendas</SectionTitle>
      <div className="mb-3 pl-3">
        <AddButton onClick={() => setOpen(true)} />
      </div>
      <ViviendaTable rows={rows} onDelete={(index) => setRows((current) => current.filter((_, currentIndex) => currentIndex !== index))} />

      {open && <AddViviendaModal onClose={() => setOpen(false)} onAdd={addVivienda} />}
    </div>
  );
}

function ViviendaTable({ rows, onDelete }: { rows: ViviendaRow[]; onDelete: (index: number) => void }) {
  const headers = ["#", "Modulo", "Piso", "Descripcion", "Area directa (m2)", "Area indirecta (m2)", "Area total (m2)", "Uso", "Material predominante", "Fotos", "Acciones"];

  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full min-w-[1120px] text-[12px]">
        <thead className="bg-gray-50">
          <tr className="text-left">
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap border-b px-2 py-1.5 font-medium text-gray-700">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={`${row.descripcion}-${index}`} className="hover:bg-gray-50">
                <td className="border-b px-2 py-1.5">{index + 1}</td>
                <td className="border-b px-2 py-1.5">{row.modulo}</td>
                <td className="border-b px-2 py-1.5">{row.piso}</td>
                <td className="border-b px-2 py-1.5">{row.descripcion}</td>
                <td className="border-b px-2 py-1.5">{formatAreaNumber(row.directa)}</td>
                <td className="border-b px-2 py-1.5">{formatAreaNumber(row.indirecta)}</td>
                <td className="border-b px-2 py-1.5">{formatAreaNumber(row.total)}</td>
                <td className="border-b px-2 py-1.5">{row.uso}</td>
                <td className="border-b px-2 py-1.5">{row.material}</td>
                <td className="border-b px-2 py-1.5">{row.fotos}</td>
                <td className="border-b px-2 py-1.5">
                  <div className="flex gap-1">
                    <button type="button" className="rounded border p-1 text-blue-600" aria-label="Editar vivienda">
                      <Pencil size={12} />
                    </button>
                    <button type="button" onClick={() => onDelete(index)} className="rounded border p-1" style={{ color: RED }} aria-label="Eliminar vivienda">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-2 py-6 text-center text-gray-400">Sin registros</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AddViviendaModal({ onClose, onAdd }: { onClose: () => void; onAdd: (row: ViviendaRow) => void }) {
  const [form, setForm] = useState({
    descripcion: "",
    modulo: "",
    piso: "",
    directa: "",
    indirecta: "",
    pisoMasAlto: "",
    volado: "",
    volado2: "",
    caracteristicas: "",
    uso: "",
    antiguedadAnos: "",
    material: "",
    estadoConservacion: "",
    estadoConstruccion: "",
    muros: "",
    columnas: "",
    techos: "",
    pisos: "",
    puertas: "",
    ventanas: "",
    revestimiento: "",
    banos: "",
    instalacionesElectricas: "",
    instalacionesSanitarias: "",
    vuat: "",
    fd: "",
  });
  const directa = parseNumber(form.directa);
  const indirecta = parseNumber(form.indirecta);
  const total = directa + indirecta;
  const materialOptions = ["ACERO", "ADOBE", "ALUMINIO", "ALUZINC", "ASFALTO", "CALAMINA", "CALAMINA METALICA", "CALAMINA PLASTIFICADA", "CALAMINA TIPO ETERNIT", "COBRE", "CONCRETO", "DRYWALL", "FIBRA DE VIDRIO", "FIERRO", "FIERRO LISO", "GRANITO", "LADRILLO", "LONA", "LOSA"];

  function setValue(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleAdd() {
    onAdd({
      descripcion: form.descripcion,
      modulo: form.modulo || "MODULO 1",
      piso: form.piso || "1",
      directa,
      indirecta,
      total,
      uso: form.uso,
      material: form.material,
      fotos: "4 fotos",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" onClick={onClose}>
      <div className="max-h-[90vh] w-[620px] max-w-[calc(100vw-32px)] overflow-y-auto rounded bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[14px] text-gray-700">Agregar</div>
          <button type="button" onClick={onClose} className="p-1 text-gray-600 hover:text-gray-900" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 border-t pt-3">
          <Field label="descripcion" required><input className={inputCls} value={form.descripcion} onChange={(event) => setValue("descripcion", event.target.value)} /></Field>
          <Field label="modulo" required>
            <select className={selectCls} value={form.modulo} onChange={(event) => setValue("modulo", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              <option>MODULO 1</option>
              <option>MODULO 2</option>
              <option>MODULO 3</option>
            </select>
          </Field>
          <Field label="piso" required>
            <select className={selectCls} value={form.piso} onChange={(event) => setValue("piso", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
          </Field>
          <Field label="directa" required><input className={inputCls} value={form.directa} onChange={(event) => setValue("directa", event.target.value)} /></Field>
          <Field label="indirecta" required><input className={inputCls} value={form.indirecta} onChange={(event) => setValue("indirecta", event.target.value)} /></Field>
          <Field label="total" required><input className={`${inputCls} bg-gray-100`} value={formatAreaNumber(total)} readOnly /></Field>
          <Field label="piso_mas_alto" required><input className={inputCls} type="number" value={form.pisoMasAlto} onChange={(event) => setValue("pisoMasAlto", event.target.value)} /></Field>
          <Field label="volado" required><input className={inputCls} value={form.volado} onChange={(event) => setValue("volado", event.target.value)} /></Field>
          <Field label="volado2" required><input className={inputCls} value={form.volado2} onChange={(event) => setValue("volado2", event.target.value)} /></Field>
          <Field label="caracteristicas"><input className={inputCls} value={form.caracteristicas} onChange={(event) => setValue("caracteristicas", event.target.value)} /></Field>
          <Field label="Uso" required><input className={inputCls} value={form.uso} onChange={(event) => setValue("uso", event.target.value)} /></Field>
          <Field label="antiguedad_anos" required><input className={inputCls} value={form.antiguedadAnos} onChange={(event) => setValue("antiguedadAnos", event.target.value)} /></Field>
          <Field label="Material predominante" required>
            <select className={selectCls} value={form.material} onChange={(event) => setValue("material", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              {materialOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="estado_conservacion" required>
            <select className={selectCls} value={form.estadoConservacion} onChange={(event) => setValue("estadoConservacion", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              <option>BUENO</option>
              <option>REGULAR</option>
              <option>MALO</option>
              <option>MUY BUENO</option>
              <option>MUY MALO</option>
            </select>
          </Field>
          <Field label="estado_construccion" required>
            <select className={selectCls} value={form.estadoConstruccion} onChange={(event) => setValue("estadoConstruccion", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              <option>TERMINADO</option>
              <option>INCONCLUSO</option>
              <option>EN CONSTRUCCION</option>
            </select>
          </Field>
          <Field label="muros" required><input className={inputCls} value={form.muros} onChange={(event) => setValue("muros", event.target.value)} /></Field>
          <Field label="columnas" required><input className={inputCls} value={form.columnas} onChange={(event) => setValue("columnas", event.target.value)} /></Field>
          <Field label="techos" required><input className={inputCls} value={form.techos} onChange={(event) => setValue("techos", event.target.value)} /></Field>
          <Field label="pisos" required><input className={inputCls} value={form.pisos} onChange={(event) => setValue("pisos", event.target.value)} /></Field>
          <Field label="puertas" required><input className={inputCls} value={form.puertas} onChange={(event) => setValue("puertas", event.target.value)} /></Field>
          <Field label="ventanas" required><input className={inputCls} value={form.ventanas} onChange={(event) => setValue("ventanas", event.target.value)} /></Field>
          <Field label="revestimiento" required><input className={inputCls} value={form.revestimiento} onChange={(event) => setValue("revestimiento", event.target.value)} /></Field>
          <Field label="banos" required><input className={inputCls} value={form.banos} onChange={(event) => setValue("banos", event.target.value)} /></Field>
          <Field label="instalaciones_electricas" required><input className={inputCls} value={form.instalacionesElectricas} onChange={(event) => setValue("instalacionesElectricas", event.target.value)} /></Field>
          <Field label="instalaciones_sanitarias" required><input className={inputCls} value={form.instalacionesSanitarias} onChange={(event) => setValue("instalacionesSanitarias", event.target.value)} /></Field>
          <Field label="vuat"><input className={inputCls} value={form.vuat} onChange={(event) => setValue("vuat", event.target.value)} /></Field>
          <Field label="fd"><input className={inputCls} value={form.fd} onChange={(event) => setValue("fd", event.target.value)} /></Field>
          {["Foto Frente", "Foto Lado Derecho", "Foto Lado Izquierdo", "Foto Fondo"].map((label) => (
            <Field key={label} label={label}>
              <input type="file" className="w-full text-[11px]" />
            </Field>
          ))}
        </div>

        <div className="mt-5 flex justify-center gap-2 border-t pt-3">
          <button type="button" onClick={handleAdd} className="inline-flex items-center gap-1.5 rounded px-8 py-1.5 text-[12px] text-white" style={{ background: RED }}>
            <Plus size={14} /> Agregar
          </button>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-8 py-1.5 text-[12px] hover:bg-gray-50">
            <X size={14} /> Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function ObrasComplementariasTab ({ codigo }: CaracterizacionTabProps) {
  const [rows, setRows] = useState<ObraComplementariaRow[]>([]);
  const [open, setOpen] = useState(false);

  function addObra(row: ObraComplementariaRow) {
    setRows((current) => [...current, row]);
    setOpen(false);
  }

  return (
    <div>
      <SectionTitle>Datos de expediente</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Codigo del Predio"><input className={inputCls} defaultValue={codigo} /></Field>
        <Field label="Codigo Expediente"><input className={inputCls} defaultValue="3546-2023-MTC/DDP" /></Field>
      </div>

      <SectionTitle>Listado de obras complementarias</SectionTitle>
      <div className="mb-3 pl-3">
        <AddButton onClick={() => setOpen(true)} />
      </div>
      <ObrasComplementariasTable rows={rows} onDelete={(index) => setRows((current) => current.filter((_, currentIndex) => currentIndex !== index))} />

      {open && <AddObraComplementariaModal onClose={() => setOpen(false)} onAdd={addObra} />}
    </div>
  );
}

function ObrasComplementariasTable({
  rows,
  onDelete,
}: {
  rows: ObraComplementariaRow[];
  onDelete: (index: number) => void;
}) {
  const headers = ["#", "TIPO", "LONGITUD", "ALTURA", "METRADO", "m/m2/", "USO", "CARACTERISTICAS TECNICAS", "UBICACION", "FOTO", "Acciones"];

  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full min-w-[1120px] text-[12px]">
        <thead className="bg-gray-50">
          <tr className="text-left">
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap border-b px-2 py-1.5 font-medium text-gray-700">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={`${row.tipo}-${index}`} className="hover:bg-gray-50">
                <td className="border-b px-2 py-1.5">{index + 1}</td>
                <td className="border-b px-2 py-1.5">{row.tipo}</td>
                <td className="border-b px-2 py-1.5">{row.longitud}</td>
                <td className="border-b px-2 py-1.5">{row.altura}</td>
                <td className="border-b px-2 py-1.5">{row.metrado}</td>
                <td className="border-b px-2 py-1.5">{row.unidad}</td>
                <td className="border-b px-2 py-1.5">{row.uso}</td>
                <td className="border-b px-2 py-1.5">{row.caracteristicas}</td>
                <td className="border-b px-2 py-1.5">{row.ubicacion}</td>
                <td className="border-b px-2 py-1.5">{row.foto}</td>
                <td className="border-b px-2 py-1.5">
                  <div className="flex gap-1">
                    <button type="button" className="rounded border p-1 text-blue-600" aria-label="Editar obra complementaria">
                      <Pencil size={12} />
                    </button>
                    <button type="button" onClick={() => onDelete(index)} className="rounded border p-1" style={{ color: RED }} aria-label="Eliminar obra complementaria">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-2 py-6 text-center text-gray-400">Sin registros</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AddObraComplementariaModal({ onClose, onAdd }: { onClose: () => void; onAdd: (row: ObraComplementariaRow) => void }) {
  const [form, setForm] = useState({
    tipo: "",
    longitud: "",
    altura: "",
    ancho: "",
    espesor: "",
    metrado: "",
    unidad: "",
    uso: "",
    antiguedadAnos: "",
    material: "",
    estadoConservacion: "",
    estadoConstruccion: "",
    caracteristicas: "",
    ubicacion: "",
    vuoc: "",
    fd: "",
  });
  const tipoOptions = [
    "ALMACEN",
    "ALTILLO",
    "AZOTEA",
    "BANO",
    "CANAL",
    "CERCO FRONTAL",
    "CERCO PERIMETRICO",
    "COBERTIZO",
    "COBERTURA",
    "COCHERA",
    "COLUMNA",
    "CRIANZA DE AVES",
    "CUBIERTA",
    "DEPOSITO",
    "ESCALERA",
    "HORNO",
    "LAVADERO",
    "LOSA",
    "MESADA",
    "MURO DE CONTENCION",
    "PARAPETO",
    "PARRILLA",
    "PASADIZO",
    "PATIO",
    "PIRCA",
    "PISO",
    "PORTICO",
    "PORTON",
    "POZA",
    "PROTECCION",
    "RAMAL",
    "RAMPA",
    "REJA",
    "RESERVORIO",
    "SARDINEL",
    "TANQUE ELEVADO",
    "TECHO",
    "TENDAL",
    "VEREDA",
  ];
  const materialOptions = ["ACERO", "ADOBE", "ALUMINIO", "ALUZINC", "ASFALTO", "CALAMINA", "CALAMINA METALICA", "CALAMINA PLASTIFICADA", "CALAMINA TIPO ETERNIT", "COBRE", "CONCRETO", "DRYWALL", "FIBRA DE VIDRIO", "FIERRO", "FIERRO LISO", "GRANITO", "LADRILLO", "LONA", "LOSA"];

  function setValue(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleAdd() {
    onAdd({
      tipo: form.tipo,
      longitud: form.longitud,
      altura: form.altura,
      metrado: form.metrado,
      unidad: form.unidad,
      uso: form.uso,
      caracteristicas: form.caracteristicas,
      ubicacion: form.ubicacion,
      foto: "3 fotos",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" onClick={onClose}>
      <div className="max-h-[90vh] w-[660px] max-w-[calc(100vw-32px)] overflow-y-auto rounded bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[14px] text-gray-700">Agregar</div>
          <button type="button" onClick={onClose} className="p-1 text-gray-600 hover:text-gray-900" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 border-t pt-3">
          <Field label="Tipo" required>
            <select className={selectCls} value={form.tipo} onChange={(event) => setValue("tipo", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              {tipoOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Longitud" required><input className={inputCls} value={form.longitud} onChange={(event) => setValue("longitud", event.target.value)} /></Field>
          <Field label="Altura" required><input className={inputCls} value={form.altura} onChange={(event) => setValue("altura", event.target.value)} /></Field>
          <Field label="Ancho" required><input className={inputCls} value={form.ancho} onChange={(event) => setValue("ancho", event.target.value)} /></Field>
          <Field label="Espesor" required><input className={inputCls} value={form.espesor} onChange={(event) => setValue("espesor", event.target.value)} /></Field>
          <Field label="Metrado" required><input className={inputCls} value={form.metrado} onChange={(event) => setValue("metrado", event.target.value)} /></Field>
          <Field label="m/m2/" required>
            <select className={selectCls} value={form.unidad} onChange={(event) => setValue("unidad", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              <option>m</option>
              <option>m2</option>
              <option>m3</option>
              <option>und</option>
            </select>
          </Field>
          <Field label="Uso" required>
            <select className={selectCls} value={form.uso} onChange={(event) => setValue("uso", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              <option>DOMESTICO</option>
              <option>COMERCIAL</option>
              <option>AGRICOLA</option>
              <option>RURAL</option>
              <option>SIN USO</option>
            </select>
          </Field>
          <Field label="antiguedad_anos" required><input className={inputCls} value={form.antiguedadAnos} onChange={(event) => setValue("antiguedadAnos", event.target.value)} /></Field>
          <Field label="Material predominante" required>
            <select className={selectCls} value={form.material} onChange={(event) => setValue("material", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              {materialOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="estado_conservacion" required>
            <select className={selectCls} value={form.estadoConservacion} onChange={(event) => setValue("estadoConservacion", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              <option>BUENO</option>
              <option>REGULAR</option>
              <option>MALO</option>
              <option>MUY BUENO</option>
              <option>MUY MALO</option>
            </select>
          </Field>
          <Field label="estado_construccion" required>
            <select className={selectCls} value={form.estadoConstruccion} onChange={(event) => setValue("estadoConstruccion", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              <option>TERMINADO</option>
              <option>INCONCLUSO</option>
              <option>EN CONSTRUCCION</option>
            </select>
          </Field>
          <Field label="CARACTERISTICAS TECNICAS" required><input className={inputCls} value={form.caracteristicas} onChange={(event) => setValue("caracteristicas", event.target.value)} /></Field>
          <Field label="UBICACION" required><input className={inputCls} value={form.ubicacion} onChange={(event) => setValue("ubicacion", event.target.value)} /></Field>
          <Field label="VUOC"><input className={inputCls} value={form.vuoc} onChange={(event) => setValue("vuoc", event.target.value)} /></Field>
          <Field label="F.D."><input className={inputCls} value={form.fd} onChange={(event) => setValue("fd", event.target.value)} /></Field>
          {["Foto del Obra Complementaria", "Foto 2 del Obra Complementaria", "Foto 3 del Obra Complementaria"].map((label) => (
            <Field key={label} label={label}>
              <input type="file" className="w-full text-[11px]" />
            </Field>
          ))}
        </div>

        <div className="mt-5 flex justify-center gap-2 border-t pt-3">
          <button type="button" onClick={handleAdd} className="inline-flex items-center gap-1.5 rounded px-8 py-1.5 text-[12px] text-white" style={{ background: RED }}>
            <Plus size={14} /> Agregar
          </button>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-8 py-1.5 text-[12px] hover:bg-gray-50">
            <X size={14} /> Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function InstalacionesFijasPermanentesTab ({ codigo }: CaracterizacionTabProps) {
  const [rows, setRows] = useState<InstalacionFijaPermanenteRow[]>([]);
  const [open, setOpen] = useState(false);

  function addInstalacion(row: InstalacionFijaPermanenteRow) {
    setRows((current) => [...current, row]);
    setOpen(false);
  }

  return (
    <div>
      <SectionTitle>Datos de expediente</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Codigo del Predio"><input className={inputCls} defaultValue={codigo} /></Field>
        <Field label="Codigo Expediente"><input className={inputCls} defaultValue="3546-2023-MTC/DDP" /></Field>
      </div>

      <SectionTitle>Listado de instalaciones fijas permanentes</SectionTitle>
      <div className="mb-3 pl-3">
        <AddButton onClick={() => setOpen(true)} />
      </div>
      <InstalacionesFijasPermanentesTable
        rows={rows}
        onDelete={(index) => setRows((current) => current.filter((_, currentIndex) => currentIndex !== index))}
      />

      {open && <AddInstalacionFijaPermanenteModal onClose={() => setOpen(false)} onAdd={addInstalacion} />}
    </div>
  );
}

function InstalacionesFijasPermanentesTable({
  rows,
  onDelete,
}: {
  rows: InstalacionFijaPermanenteRow[];
  onDelete: (index: number) => void;
}) {
  const headers = [
    "#",
    "DESCRIPCION",
    "AREA / METRADO (m2)",
    "LONGITUD (m)",
    "ANCHO (m)",
    "ALTURA / PROFUNDIDAD (m)",
    "ANTIGUEDAD EN ANOS",
    "MATERIAL",
    "ESTADO CONSERVACION",
    "ESTADO CONSTRUCCION",
    "VUIF",
    "FD",
    "CARACTERISTICAS TECNICAS",
    "FOTO",
    "Acciones",
  ];

  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full min-w-[1380px] text-[12px]">
        <thead className="bg-gray-50">
          <tr className="text-left">
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap border-b px-2 py-1.5 font-medium text-gray-700">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={`${row.descripcion}-${index}`} className="hover:bg-gray-50">
                <td className="border-b px-2 py-1.5">{index + 1}</td>
                <td className="border-b px-2 py-1.5">{row.descripcion}</td>
                <td className="border-b px-2 py-1.5">{row.areaMetrado}</td>
                <td className="border-b px-2 py-1.5">{row.longitud}</td>
                <td className="border-b px-2 py-1.5">{row.ancho}</td>
                <td className="border-b px-2 py-1.5">{row.alturaProfundidad}</td>
                <td className="border-b px-2 py-1.5">{row.antiguedadAnos}</td>
                <td className="border-b px-2 py-1.5">{row.material}</td>
                <td className="border-b px-2 py-1.5">{row.estadoConservacion}</td>
                <td className="border-b px-2 py-1.5">{row.estadoConstruccion}</td>
                <td className="border-b px-2 py-1.5">{row.vuif}</td>
                <td className="border-b px-2 py-1.5">{row.fd}</td>
                <td className="border-b px-2 py-1.5">{row.caracteristicas}</td>
                <td className="border-b px-2 py-1.5">{row.foto}</td>
                <td className="border-b px-2 py-1.5">
                  <div className="flex gap-1">
                    <button type="button" className="rounded border p-1 text-blue-600" aria-label="Editar instalacion fija permanente">
                      <Pencil size={12} />
                    </button>
                    <button type="button" onClick={() => onDelete(index)} className="rounded border p-1" style={{ color: RED }} aria-label="Eliminar instalacion fija permanente">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-2 py-6 text-center text-gray-400">Sin registros</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AddInstalacionFijaPermanenteModal({ onClose, onAdd }: { onClose: () => void; onAdd: (row: InstalacionFijaPermanenteRow) => void }) {
  const [form, setForm] = useState({
    descripcion: "",
    areaMetrado: "",
    longitud: "",
    ancho: "",
    alturaProfundidad: "",
    antiguedadAnos: "",
    material: "",
    estadoConservacion: "",
    estadoConstruccion: "",
    vuif: "",
    fd: "",
    caracteristicas: "",
  });
  const materialOptions = ["ACERO", "ADOBE", "ALUMINIO", "ALUZINC", "ASFALTO", "CALAMINA", "CALAMINA METALICA", "CALAMINA PLASTIFICADA", "CALAMINA TIPO ETERNIT", "COBRE", "CONCRETO", "DRYWALL", "FIBRA DE VIDRIO", "FIERRO", "FIERRO LISO", "GRANITO", "LADRILLO", "LONA", "LOSA"];

  function setValue(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleAdd() {
    onAdd({
      descripcion: form.descripcion,
      areaMetrado: form.areaMetrado,
      longitud: form.longitud,
      ancho: form.ancho,
      alturaProfundidad: form.alturaProfundidad,
      antiguedadAnos: form.antiguedadAnos,
      material: form.material,
      estadoConservacion: form.estadoConservacion,
      estadoConstruccion: form.estadoConstruccion,
      vuif: form.vuif,
      fd: form.fd,
      caracteristicas: form.caracteristicas,
      foto: "1 foto",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" onClick={onClose}>
      <div className="max-h-[90vh] w-[560px] max-w-[calc(100vw-32px)] overflow-y-auto rounded bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[14px] text-gray-700">Agregar</div>
          <button type="button" onClick={onClose} className="p-1 text-gray-600 hover:text-gray-900" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 border-t pt-3">
          <Field label="Descripcion" required><input className={inputCls} value={form.descripcion} onChange={(event) => setValue("descripcion", event.target.value)} /></Field>
          <Field label="Area / Metrado (m2)" required><input className={inputCls} value={form.areaMetrado} onChange={(event) => setValue("areaMetrado", event.target.value)} /></Field>
          <Field label="Longitud (m)" required><input className={inputCls} value={form.longitud} onChange={(event) => setValue("longitud", event.target.value)} /></Field>
          <Field label="Ancho (m)" required><input className={inputCls} value={form.ancho} onChange={(event) => setValue("ancho", event.target.value)} /></Field>
          <Field label="Altura / Profundidad (m)" required><input className={inputCls} value={form.alturaProfundidad} onChange={(event) => setValue("alturaProfundidad", event.target.value)} /></Field>
          <Field label="Antiguedad en anos" required><input className={inputCls} value={form.antiguedadAnos} onChange={(event) => setValue("antiguedadAnos", event.target.value)} /></Field>
          <Field label="Material predominante" required>
            <select className={selectCls} value={form.material} onChange={(event) => setValue("material", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              {materialOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Estado de conservacion" required>
            <select className={selectCls} value={form.estadoConservacion} onChange={(event) => setValue("estadoConservacion", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              <option>BUENO</option>
              <option>REGULAR</option>
              <option>MALO</option>
              <option>MUY BUENO</option>
              <option>MUY MALO</option>
            </select>
          </Field>
          <Field label="Estado de construccion" required>
            <select className={selectCls} value={form.estadoConstruccion} onChange={(event) => setValue("estadoConstruccion", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              <option>TERMINADO</option>
              <option>INCONCLUSO</option>
              <option>EN CONSTRUCCION</option>
            </select>
          </Field>
          <Field label="VUIF" required><input className={inputCls} value={form.vuif} onChange={(event) => setValue("vuif", event.target.value)} /></Field>
          <Field label="FD" required><input className={inputCls} value={form.fd} onChange={(event) => setValue("fd", event.target.value)} /></Field>
          <Field label="Foto">
            <input type="file" className="w-full text-[11px]" />
          </Field>
          <Field label="Caracteristicas tecnicas" required>
            <textarea
              className="min-h-[44px] w-full rounded border border-gray-300 p-2 text-[12px] focus:outline-none focus:border-gray-500"
              value={form.caracteristicas}
              onChange={(event) => setValue("caracteristicas", event.target.value)}
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-center gap-2 border-t pt-3">
          <button type="button" onClick={handleAdd} className="inline-flex items-center gap-1.5 rounded px-8 py-1.5 text-[12px] text-white" style={{ background: RED }}>
            <Plus size={14} /> Agregar
          </button>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-8 py-1.5 text-[12px] hover:bg-gray-50">
            <X size={14} /> Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

const PLANTACION_FRUTAL_OPTIONS = [
  "ALFALFA",
  "CAPULI",
  "CHIRIMOYA",
  "DURAZNO",
  "GRANADILLA",
  "LIMON",
  "LUCUMA",
  "MANDARINA",
  "MANZANA",
  "MARACUYA",
  "MEMBRILLO",
  "MORA",
  "NARANJA",
  "NISPERO",
  "PACAY",
  "PALTA",
  "PAPAYA",
  "PLATANO",
  "SABILA",
];

function PlantacionesFrutalesTab ({ codigo }: CaracterizacionTabProps) {
  const [rows, setRows] = useState<PlantacionFrutalRow[]>([]);
  const [open, setOpen] = useState(false);

  function addPlantacion(row: PlantacionFrutalRow) {
    setRows((current) => [...current, row]);
    setOpen(false);
  }

  return (
    <div>
      <SectionTitle>Datos de expediente</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Codigo del Predio">
          <input className={inputCls} defaultValue={codigo} />
        </Field>
        <Field label="Codigo Expediente">
          <input className={inputCls} defaultValue="3546-2023-MTC/DDP" />
        </Field>
      </div>

      <SectionTitle>Listado de Plantaciones Frutales</SectionTitle>
      <div className="mb-3 pl-3">
        <AddButton onClick={() => setOpen(true)} />
      </div>
      <PlantacionesFrutalesTable
        rows={rows}
        onDelete={(index) => setRows((current) => current.filter((_, currentIndex) => currentIndex !== index))}
      />

      {open && <AddPlantacionFrutalModal onClose={() => setOpen(false)} onAdd={addPlantacion} />}
    </div>
  );
}

function PlantacionesFrutalesTable({
  rows,
  onDelete,
}: {
  rows: PlantacionFrutalRow[];
  onDelete: (index: number) => void;
}) {
  const headers = [
    "#",
    "Nombre comun",
    "Nombre cientifico",
    "Variedad",
    "Edad (Anos)",
    "Cantidad",
    "Utilidad",
    "VUPP",
    "FOTO",
    "Acciones",
  ];

  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full min-w-[980px] text-[12px]">
        <thead className="bg-gray-50">
          <tr className="text-left">
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap border-b px-2 py-1.5 font-medium text-gray-700">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={`${row.nombreComun}-${row.variedad}-${index}`} className="hover:bg-gray-50">
                <td className="border-b px-2 py-1.5">{index + 1}</td>
                <td className="border-b px-2 py-1.5">{row.nombreComun}</td>
                <td className="border-b px-2 py-1.5">{row.nombreCientifico}</td>
                <td className="border-b px-2 py-1.5">{row.variedad}</td>
                <td className="border-b px-2 py-1.5">{row.edadAnos}</td>
                <td className="border-b px-2 py-1.5">{row.cantidad}</td>
                <td className="border-b px-2 py-1.5">{row.utilidad}</td>
                <td className="border-b px-2 py-1.5">{row.vupp}</td>
                <td className="border-b px-2 py-1.5">{row.foto}</td>
                <td className="border-b px-2 py-1.5">
                  <div className="flex gap-1">
                    <button type="button" className="rounded border p-1 text-blue-600" aria-label="Editar plantacion frutal">
                      <Pencil size={12} />
                    </button>
                    <button type="button" onClick={() => onDelete(index)} className="rounded border p-1" style={{ color: RED }} aria-label="Eliminar plantacion frutal">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-2 py-6 text-center text-gray-400">Sin registros</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AddPlantacionFrutalModal({ onClose, onAdd }: { onClose: () => void; onAdd: (row: PlantacionFrutalRow) => void }) {
  const [form, setForm] = useState({
    nombreComun: "",
    nombreCientifico: "",
    variedad: "",
    edadAnos: "",
    unidadMedida: "UND",
    cantidad: "",
    utilidad: "",
    vupp: "",
    observacion: "",
    foto: "",
  });

  function setValue(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleAdd() {
    onAdd({
      nombreComun: form.nombreComun,
      nombreCientifico: form.nombreCientifico,
      variedad: form.variedad,
      edadAnos: form.edadAnos,
      unidadMedida: form.unidadMedida,
      cantidad: form.cantidad,
      utilidad: form.utilidad,
      vupp: form.vupp,
      observacion: form.observacion,
      foto: form.foto || "Sin foto",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" onClick={onClose}>
      <div className="max-h-[90vh] w-[500px] max-w-[calc(100vw-32px)] overflow-y-auto rounded bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[14px] text-gray-700">Agregar</div>
          <button type="button" onClick={onClose} className="p-1 text-gray-600 hover:text-gray-900" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 border-t pt-3">
          <Field label="Nombre comun" required>
            <select className={selectCls} value={form.nombreComun} onChange={(event) => setValue("nombreComun", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              {PLANTACION_FRUTAL_OPTIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Nombre Cientifico" required>
            <input className={inputCls} value={form.nombreCientifico} onChange={(event) => setValue("nombreCientifico", event.target.value)} />
          </Field>
          <Field label="Variedad" required>
            <input className={inputCls} value={form.variedad} onChange={(event) => setValue("variedad", event.target.value)} />
          </Field>
          <Field label="Edad (Anos)" required>
            <input className={inputCls} value={form.edadAnos} onChange={(event) => setValue("edadAnos", event.target.value)} />
          </Field>
          <Field label="Unidad Medida" required>
            <input className={readOnlyCls} value={form.unidadMedida} onChange={(event) => setValue("unidadMedida", event.target.value)} />
          </Field>
          <Field label="Cantidad" required>
            <input className={inputCls} value={form.cantidad} onChange={(event) => setValue("cantidad", event.target.value)} />
          </Field>
          <Field label="Utilidad" required>
            <input className={inputCls} value={form.utilidad} onChange={(event) => setValue("utilidad", event.target.value)} />
          </Field>
          <Field label="VUPP">
            <input className={inputCls} value={form.vupp} onChange={(event) => setValue("vupp", event.target.value)} />
          </Field>
          <Field label="Observacion">
            <input className={inputCls} value={form.observacion} onChange={(event) => setValue("observacion", event.target.value)} />
          </Field>
          <Field label="Foto Plantacion">
            <input
              type="file"
              className="w-full text-[11px]"
              onChange={(event) => setValue("foto", event.target.files?.[0]?.name || "")}
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-center gap-2 border-t pt-3">
          <button type="button" onClick={handleAdd} className="inline-flex items-center gap-1.5 rounded px-8 py-1.5 text-[12px] text-white" style={{ background: RED }}>
            <Plus size={14} /> Agregar
          </button>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-8 py-1.5 text-[12px] hover:bg-gray-50">
            <X size={14} /> Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

const PLANTACION_FORESTAL_OPTIONS = [
  "ALCANFOR",
  "ALISOS",
  "CABUYA",
  "CABUYA BLANCA",
  "CIPRES",
  "COLIFLOR",
  "EUCALIPTO",
  "HUARANGO",
  "JASSI",
  "LECHUGA",
  "MOLLE",
  "PATI",
  "PINO",
  "TARA",
];

function PlantacionesForestalesTab ({ codigo }: CaracterizacionTabProps) {
  const [rows, setRows] = useState<PlantacionForestalRow[]>([]);
  const [open, setOpen] = useState(false);

  function addPlantacion(row: PlantacionForestalRow) {
    setRows((current) => [...current, row]);
    setOpen(false);
  }

  return (
    <div>
      <SectionTitle>Datos de expediente</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Codigo del Predio">
          <input className={inputCls} defaultValue={codigo} />
        </Field>
        <Field label="Codigo Expediente">
          <input className={inputCls} defaultValue="3546-2023-MTC/DDP" />
        </Field>
      </div>

      <SectionTitle>Listado de plantaciones forestales</SectionTitle>
      <div className="mb-3 pl-3">
        <AddButton onClick={() => setOpen(true)} />
      </div>
      <PlantacionesForestalesTable
        rows={rows}
        onDelete={(index) => setRows((current) => current.filter((_, currentIndex) => currentIndex !== index))}
      />

      {open && <AddPlantacionForestalModal onClose={() => setOpen(false)} onAdd={addPlantacion} />}
    </div>
  );
}

function PlantacionesForestalesTable({
  rows,
  onDelete,
}: {
  rows: PlantacionForestalRow[];
  onDelete: (index: number) => void;
}) {
  const headers = [
    "#",
    "Nombre comun",
    "Nombre cientifico",
    "Edad",
    "Diametro (m)",
    "Altura total (m)",
    "Nro de Plantas",
    "Utilidad",
    "VUPP",
    "FOTO",
    "Acciones",
  ];

  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full min-w-[1080px] text-[12px]">
        <thead className="bg-gray-50">
          <tr className="text-left">
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap border-b px-2 py-1.5 font-medium text-gray-700">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={`${row.nombreComun}-${row.edadAnos}-${index}`} className="hover:bg-gray-50">
                <td className="border-b px-2 py-1.5">{index + 1}</td>
                <td className="border-b px-2 py-1.5">{row.nombreComun}</td>
                <td className="border-b px-2 py-1.5">{row.nombreCientifico}</td>
                <td className="border-b px-2 py-1.5">{row.edadAnos}</td>
                <td className="border-b px-2 py-1.5">{row.diametro}</td>
                <td className="border-b px-2 py-1.5">{row.alturaTotal}</td>
                <td className="border-b px-2 py-1.5">{row.numeroPlantas}</td>
                <td className="border-b px-2 py-1.5">{row.utilidad}</td>
                <td className="border-b px-2 py-1.5">{row.vupp}</td>
                <td className="border-b px-2 py-1.5">{row.foto}</td>
                <td className="border-b px-2 py-1.5">
                  <div className="flex gap-1">
                    <button type="button" className="rounded border p-1 text-blue-600" aria-label="Editar plantacion forestal">
                      <Pencil size={12} />
                    </button>
                    <button type="button" onClick={() => onDelete(index)} className="rounded border p-1" style={{ color: RED }} aria-label="Eliminar plantacion forestal">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-2 py-6 text-center text-gray-400">Sin registros</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AddPlantacionForestalModal({ onClose, onAdd }: { onClose: () => void; onAdd: (row: PlantacionForestalRow) => void }) {
  const [form, setForm] = useState({
    nombreComun: "",
    nombreCientifico: "",
    edadAnos: "",
    diametro: "",
    alturaTotal: "",
    numeroPlantas: "",
    utilidad: "",
    vupp: "",
    observacion: "",
    foto: "",
  });

  function setValue(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleAdd() {
    onAdd({
      nombreComun: form.nombreComun,
      nombreCientifico: form.nombreCientifico,
      edadAnos: form.edadAnos,
      diametro: form.diametro,
      alturaTotal: form.alturaTotal,
      numeroPlantas: form.numeroPlantas,
      utilidad: form.utilidad,
      vupp: form.vupp,
      observacion: form.observacion,
      foto: form.foto || "Sin foto",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" onClick={onClose}>
      <div className="max-h-[90vh] w-[500px] max-w-[calc(100vw-32px)] overflow-y-auto rounded bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[14px] text-gray-700">Agregar</div>
          <button type="button" onClick={onClose} className="p-1 text-gray-600 hover:text-gray-900" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 border-t pt-3">
          <Field label="Nombre comun" required>
            <select className={selectCls} value={form.nombreComun} onChange={(event) => setValue("nombreComun", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              {PLANTACION_FORESTAL_OPTIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Nombre Cientifico" required>
            <input className={inputCls} value={form.nombreCientifico} onChange={(event) => setValue("nombreCientifico", event.target.value)} />
          </Field>
          <Field label="Edad (Anos)" required>
            <input className={inputCls} value={form.edadAnos} onChange={(event) => setValue("edadAnos", event.target.value)} />
          </Field>
          <Field label="Diametro (m)" required>
            <input className={inputCls} value={form.diametro} onChange={(event) => setValue("diametro", event.target.value)} />
          </Field>
          <Field label="Altura Total (m)" required>
            <input className={inputCls} value={form.alturaTotal} onChange={(event) => setValue("alturaTotal", event.target.value)} />
          </Field>
          <Field label="No. de Plantas" required>
            <input className={inputCls} value={form.numeroPlantas} onChange={(event) => setValue("numeroPlantas", event.target.value)} />
          </Field>
          <Field label="Utilidad" required>
            <input className={inputCls} value={form.utilidad} onChange={(event) => setValue("utilidad", event.target.value)} />
          </Field>
          <Field label="VUPP">
            <input className={inputCls} value={form.vupp} onChange={(event) => setValue("vupp", event.target.value)} />
          </Field>
          <Field label="Observacion">
            <input className={inputCls} value={form.observacion} onChange={(event) => setValue("observacion", event.target.value)} />
          </Field>
          <Field label="Foto Plantacion">
            <input
              type="file"
              className="w-full text-[11px]"
              onChange={(event) => setValue("foto", event.target.files?.[0]?.name || "")}
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-center gap-2 border-t pt-3">
          <button type="button" onClick={handleAdd} className="inline-flex items-center gap-1.5 rounded px-8 py-1.5 text-[12px] text-white" style={{ background: RED }}>
            <Plus size={14} /> Agregar
          </button>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-8 py-1.5 text-[12px] hover:bg-gray-50">
            <X size={14} /> Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

const PLANTACION_TRANSITORIA_OPTIONS = [
  "CANA DE AZUCAR",
  "CEBADA",
  "CEBOLLA",
  "COL",
  "HABA",
  "MAIZ",
  "OCA",
  "PAPA",
  "TARA",
  "TRIGO",
  "ZAPALLO",
];

function PlantacionesTransitoriasTab ({ codigo }: CaracterizacionTabProps) {
  const [rows, setRows] = useState<PlantacionTransitoriaRow[]>([
    {
      nombreComun: "MAIZ",
      nombreCientifico: "ZEA MAYS",
      variedad: "CHULPI",
      edadAnos: "15",
      unidadMedida: "M2",
      cantidad: "15",
      utilidad: "1500",
      vupt: "1500",
      observacion: "",
      foto: "",
    },
  ]);
  const [open, setOpen] = useState(false);

  function addPlantacion(row: PlantacionTransitoriaRow) {
    setRows((current) => [...current, row]);
    setOpen(false);
  }

  return (
    <div>
      <SectionTitle>Datos de expediente</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Codigo del Predio">
          <input className={inputCls} defaultValue={codigo} />
        </Field>
        <Field label="Codigo Expediente">
          <input className={inputCls} defaultValue="3546-2023-MTC/DDP" />
        </Field>
      </div>

      <SectionTitle>Listado de Plataciones Transitorias</SectionTitle>
      <div className="mb-3 pl-3">
        <AddButton onClick={() => setOpen(true)} />
      </div>
      <PlantacionesTransitoriasTable
        rows={rows}
        onDelete={(index) => setRows((current) => current.filter((_, currentIndex) => currentIndex !== index))}
      />

      {open && <AddPlantacionTransitoriaModal onClose={() => setOpen(false)} onAdd={addPlantacion} />}
    </div>
  );
}

function PlantacionesTransitoriasTable({
  rows,
  onDelete,
}: {
  rows: PlantacionTransitoriaRow[];
  onDelete: (index: number) => void;
}) {
  const headers = [
    "#",
    "Nombre comun",
    "Nombre cientifico",
    "Variedad",
    "Edad",
    "Unidad de medida",
    "Cantidad",
    "Utilidad",
    "VUPT",
    "FOTO",
    "Acciones",
  ];

  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full min-w-[1120px] text-[12px]">
        <thead className="bg-gray-50">
          <tr className="text-left">
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap border-b px-2 py-1.5 font-medium text-gray-700">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={`${row.nombreComun}-${row.variedad}-${index}`} className="hover:bg-gray-50">
                <td className="border-b px-2 py-1.5">{index + 1}</td>
                <td className="border-b px-2 py-1.5">{row.nombreComun}</td>
                <td className="border-b px-2 py-1.5">{row.nombreCientifico}</td>
                <td className="border-b px-2 py-1.5">{row.variedad}</td>
                <td className="border-b px-2 py-1.5">{row.edadAnos}</td>
                <td className="border-b px-2 py-1.5">{row.unidadMedida}</td>
                <td className="border-b px-2 py-1.5">{row.cantidad}</td>
                <td className="border-b px-2 py-1.5">{row.utilidad}</td>
                <td className="border-b px-2 py-1.5">{row.vupt}</td>
                <td className="border-b px-2 py-1.5">{row.foto}</td>
                <td className="border-b px-2 py-1.5">
                  <div className="flex gap-1">
                    <button type="button" className="rounded border p-1 text-blue-600" aria-label="Editar plantacion transitoria">
                      <Pencil size={12} />
                    </button>
                    <button type="button" onClick={() => onDelete(index)} className="rounded border p-1" style={{ color: RED }} aria-label="Eliminar plantacion transitoria">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-2 py-6 text-center text-gray-400">Sin registros</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AddPlantacionTransitoriaModal({ onClose, onAdd }: { onClose: () => void; onAdd: (row: PlantacionTransitoriaRow) => void }) {
  const [form, setForm] = useState({
    nombreComun: "",
    nombreCientifico: "",
    variedad: "",
    edadAnos: "",
    unidadMedida: "",
    cantidad: "",
    utilidad: "",
    vupt: "",
    observacion: "",
    foto: "",
  });

  function setValue(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleAdd() {
    onAdd({
      nombreComun: form.nombreComun,
      nombreCientifico: form.nombreCientifico,
      variedad: form.variedad,
      edadAnos: form.edadAnos,
      unidadMedida: form.unidadMedida,
      cantidad: form.cantidad,
      utilidad: form.utilidad,
      vupt: form.vupt,
      observacion: form.observacion,
      foto: form.foto || "Sin foto",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" onClick={onClose}>
      <div className="max-h-[90vh] w-[500px] max-w-[calc(100vw-32px)] overflow-y-auto rounded bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[14px] text-gray-700">Agregar</div>
          <button type="button" onClick={onClose} className="p-1 text-gray-600 hover:text-gray-900" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 border-t pt-3">
          <Field label="Nombre comun" required>
            <select className={selectCls} value={form.nombreComun} onChange={(event) => setValue("nombreComun", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              {PLANTACION_TRANSITORIA_OPTIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Nombre Cientifico" required>
            <input className={inputCls} value={form.nombreCientifico} onChange={(event) => setValue("nombreCientifico", event.target.value)} />
          </Field>
          <Field label="Variedad" required>
            <input className={inputCls} value={form.variedad} onChange={(event) => setValue("variedad", event.target.value)} />
          </Field>
          <Field label="Edad (Anos)" required>
            <input className={inputCls} value={form.edadAnos} onChange={(event) => setValue("edadAnos", event.target.value)} />
          </Field>
          <Field label="Unidad Medida" required>
            <input className={inputCls} value={form.unidadMedida} onChange={(event) => setValue("unidadMedida", event.target.value)} />
          </Field>
          <Field label="Cantidad" required>
            <input className={inputCls} value={form.cantidad} onChange={(event) => setValue("cantidad", event.target.value)} />
          </Field>
          <Field label="Utilidad" required>
            <input className={inputCls} value={form.utilidad} onChange={(event) => setValue("utilidad", event.target.value)} />
          </Field>
          <Field label="VUPT">
            <input className={inputCls} value={form.vupt} onChange={(event) => setValue("vupt", event.target.value)} />
          </Field>
          <Field label="Observacion">
            <input className={inputCls} value={form.observacion} onChange={(event) => setValue("observacion", event.target.value)} />
          </Field>
          <Field label="Foto Plantacion">
            <input
              type="file"
              className="w-full text-[11px]"
              onChange={(event) => setValue("foto", event.target.files?.[0]?.name || "")}
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-center gap-2 border-t pt-3">
          <button type="button" onClick={handleAdd} className="inline-flex items-center gap-1.5 rounded px-8 py-1.5 text-[12px] text-white" style={{ background: RED }}>
            <Plus size={14} /> Agregar
          </button>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-8 py-1.5 text-[12px] hover:bg-gray-50">
            <X size={14} /> Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

const CERCO_VIVO_OPTIONS = [
  "ALCANFOR",
  "ALFALFA",
  "ALISOS",
  "CABUYA",
  "CABUYA BLANCA",
  "CANA DE AZUCAR",
  "CAPULI",
  "CEBADA",
  "CEBOLLA",
  "CHIRIMOYA",
  "CIPRES",
  "COL",
  "COLIFLOR",
  "DURAZNO",
  "EUCALIPTO",
  "GRANADILLA",
  "HABA",
  "HUARANGO",
  "JASSI",
  "LIMON",
  "MOLLE",
  "PINO",
  "TARA",
];

function CercoVivoTab () {
  const [rows, setRows] = useState<CercoVivoRow[]>([
    {
      nombreCientifico: "ASDASD",
      nombreComun: "ASDASD",
      edadAnos: "23",
      longitudCerco: "123.23",
      distanciamientoPlantas: "123.23",
      estadoFitosanitario: "BUENO",
      observaciones: "NIN",
      foto: "",
    },
    {
      nombreCientifico: "ALNUS GLUTINOSA",
      nombreComun: "ALISOS",
      edadAnos: "25",
      longitudCerco: "12",
      distanciamientoPlantas: "12",
      estadoFitosanitario: "REGULAR",
      observaciones: "NIN",
      foto: "",
    },
  ]);
  const [open, setOpen] = useState(false);

  function addCerco(row: CercoVivoRow) {
    setRows((current) => [...current, row]);
    setOpen(false);
  }

  return (
    <div>
      <SectionTitle>Listado de Cerco Vivo</SectionTitle>
      <div className="mb-3 pl-3">
        <AddButton onClick={() => setOpen(true)} />
      </div>
      <CercoVivoTable
        rows={rows}
        onDelete={(index) => setRows((current) => current.filter((_, currentIndex) => currentIndex !== index))}
      />

      {open && <AddCercoVivoModal onClose={() => setOpen(false)} onAdd={addCerco} />}
    </div>
  );
}

function CercoVivoTable({
  rows,
  onDelete,
}: {
  rows: CercoVivoRow[];
  onDelete: (index: number) => void;
}) {
  const headers = [
    "#",
    "Nombre cientifico",
    "Nombre comun",
    "Edad",
    "Longitud de cerco (m)",
    "Distanciamiento entre plantas (m)",
    "Estado fitosanitario (BUENO/REGULAR/MALO)",
    "Observaciones",
    "Acciones",
  ];

  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full min-w-[1160px] text-[12px]">
        <thead className="bg-gray-50">
          <tr className="text-left">
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap border-b px-2 py-1.5 font-medium text-gray-700">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={`${row.nombreCientifico}-${row.nombreComun}-${index}`} className="hover:bg-gray-50">
                <td className="border-b px-2 py-1.5">{index + 1}</td>
                <td className="border-b px-2 py-1.5">{row.nombreCientifico}</td>
                <td className="border-b px-2 py-1.5">{row.nombreComun}</td>
                <td className="border-b px-2 py-1.5">{row.edadAnos}</td>
                <td className="border-b px-2 py-1.5">{row.longitudCerco}</td>
                <td className="border-b px-2 py-1.5">{row.distanciamientoPlantas}</td>
                <td className="border-b px-2 py-1.5">{row.estadoFitosanitario}</td>
                <td className="border-b px-2 py-1.5">{row.observaciones}</td>
                <td className="border-b px-2 py-1.5">
                  <div className="flex gap-1">
                    <button type="button" className="rounded border p-1 text-blue-600" aria-label="Editar cerco vivo">
                      <Pencil size={12} />
                    </button>
                    <button type="button" onClick={() => onDelete(index)} className="rounded border p-1" style={{ color: RED }} aria-label="Eliminar cerco vivo">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-2 py-6 text-center text-gray-400">Sin registros</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AddCercoVivoModal({ onClose, onAdd }: { onClose: () => void; onAdd: (row: CercoVivoRow) => void }) {
  const [form, setForm] = useState({
    nombreComun: "",
    nombreCientifico: "",
    edadAnos: "",
    longitudCerco: "",
    distanciamientoPlantas: "",
    estadoFitosanitario: "BUENO",
    observaciones: "",
    foto: "",
  });

  function setValue(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleAdd() {
    onAdd({
      nombreCientifico: form.nombreCientifico,
      nombreComun: form.nombreComun,
      edadAnos: form.edadAnos,
      longitudCerco: form.longitudCerco,
      distanciamientoPlantas: form.distanciamientoPlantas,
      estadoFitosanitario: form.estadoFitosanitario,
      observaciones: form.observaciones,
      foto: form.foto || "Sin foto",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" onClick={onClose}>
      <div className="max-h-[90vh] w-[540px] max-w-[calc(100vw-32px)] overflow-y-auto rounded bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[14px] text-gray-700">Agregar</div>
          <button type="button" onClick={onClose} className="p-1 text-gray-600 hover:text-gray-900" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 border-t pt-3">
          <Field label="Nombre comun" required>
            <select className={selectCls} value={form.nombreComun} onChange={(event) => setValue("nombreComun", event.target.value)}>
              <option value="">-- SELECCIONE --</option>
              {CERCO_VIVO_OPTIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Nombre cientifico" required>
            <input className={inputCls} value={form.nombreCientifico} onChange={(event) => setValue("nombreCientifico", event.target.value)} />
          </Field>
          <Field label="Edad" required>
            <input className={inputCls} value={form.edadAnos} onChange={(event) => setValue("edadAnos", event.target.value)} />
          </Field>
          <Field label="Longitud de cerco (m)" required>
            <input className={inputCls} value={form.longitudCerco} onChange={(event) => setValue("longitudCerco", event.target.value)} />
          </Field>
          <Field label="Distanciamiento entre plantas (m)" required>
            <input className={inputCls} value={form.distanciamientoPlantas} onChange={(event) => setValue("distanciamientoPlantas", event.target.value)} />
          </Field>
          <Field label="Estado fitosanitario" required>
            <select className={selectCls} value={form.estadoFitosanitario} onChange={(event) => setValue("estadoFitosanitario", event.target.value)}>
              <option>BUENO</option>
              <option>REGULAR</option>
              <option>MALO</option>
            </select>
          </Field>
          <Field label="Observaciones">
            <input className={inputCls} value={form.observaciones} onChange={(event) => setValue("observaciones", event.target.value)} />
          </Field>
          <Field label="Foto">
            <input
              type="file"
              className="w-full text-[11px]"
              onChange={(event) => setValue("foto", event.target.files?.[0]?.name || "")}
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-center gap-2 border-t pt-3">
          <button type="button" onClick={handleAdd} className="inline-flex items-center gap-1.5 rounded px-8 py-1.5 text-[12px] text-white" style={{ background: RED }}>
            <Plus size={14} /> Agregar
          </button>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-8 py-1.5 text-[12px] hover:bg-gray-50">
            <X size={14} /> Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

const TIPO_AFECTACION_OPTIONS = [
  {
    key: "A",
    text: "EL INMUEBLE QUEDA INHABITABLE O INOPERATIVO E IMPIDE AL SUJETO PASIVO REALIZAR SUS ACTIVIDADES",
  },
  {
    key: "B",
    text: "EXISTE PERDIDA DE FUNCIONALIDAD U OPERATIVIDAD PARCIAL DEL INMUEBLE Y SE REQUIERA EL ACONDICIONAMIENTO DEL AREA REMANENTE QUE PERMITA CONTINUAR CON SUS ACTIVIDADES",
  },
  {
    key: "C",
    text: "EN CASO SE AFECTE LA OPERATIVIDAD DE LAS ACTIVIDADES ECONOMICAS, DE ACUERDO A LO SENALADO EN LOS LITERALES A) Y B), PRECEDENTES, EL DANO EMERGENTE DEBE CONSIDERAR, DE CORRESPONDER, PRECISADO EN EL NUMERAL 1.",
  },
  {
    key: "D",
    text: "TRASLADO DE BIENES MUEBLES, SE DEBE CUANTIFICAR EL NUMERO DE VIAJES Y VOLUMEN DE CARGA NECESARIOS",
  },
  {
    key: "E",
    text: "IDENTIFICACION DEL INMUEBLE DEFINITIVO O EL ALQUILER TEMPORAL",
  },
  {
    key: "F",
    text: "CUANDO SE AFECTA INFRAESTRUCTURA E INSTALACIONES PRODUCTIVAS QUE SIRVEN A OTRA AREA, DISTINTA AL AREA A ADQUIRIR O EXPROPIAR Y GENERE LA INTERRUPCION TEMPORAL DE ALGUNA ACTIVIDAD PRODUCTIVA, CORRESPONDE CONSIDERAR LA RESTITUCION DE LA INFRAESTRUCTURA AFECTADA Y LAS ADECUACIONES NECESARIAS PARA LA CONTINUIDAD DE DICHA ACTIVIDAD.",
  },
  {
    key: "G",
    text: "PENALIDADES POR INCUMPLIMIENTO DE OBLIGACIONES CON TERCEROS, A CONSECUENCIA DE LA ADQUISICION Y EXPROPIACION DEL INMUEBLE",
  },
  {
    key: "H",
    text: "OTROS CASOS DEBIDAMENTE SUSTENTADOS QUE IDENTIFIQUE EL SUJETO ACTIVO",
  },
];

const NUMERAL_UNO_OPTIONS = [
  "TRASLADO DE ENSERES Y DEMAS BIENES DEL NEGOCIO SEGUN CORRESPONDA.",
  "ACONDICIONAMIENTO DEL NUEVO INMUEBLE.",
  "VALOR DE LAS INSTALACIONES NO SUSCEPTIBLES DE TRASLADO Y GASTOS DE SUSTITUCION.",
  "GASTOS ADMINISTRATIVOS Y OPERATIVOS DESDE LA PARALIZACION HASTA LA INSTALACION Y PUESTA EN MARCHA.",
  "INDEMNIZACIONES LABORALES.",
  "PERDIDA DE BENEFICIOS.",
];

function DanoEmergenteTab ({ codigo }: CaracterizacionTabProps) {
  const [correspondencia, setCorrespondencia] = useState({
    danoEmergente: "SI",
    lucroCesante: "SI",
  });
  const [identificacion, setIdentificacion] = useState({
    formaAfectacion: "PARCIAL",
    condicionPredio: "INHABITABLE",
    descripcion:
      "Si corresponde indemnizar al sujeto pasivo acondicionamiento del area remanente en condiciones similares a las identificadas en la inspeccion ocular a cargo del sujeto activo...",
  });
  const [tipoAfectacion, setTipoAfectacion] = useState<Record<string, "SI" | "NO">>({
    A: "SI",
    B: "SI",
    C: "SI",
    D: "SI",
    E: "NO",
    F: "NO",
    G: "NO",
    H: "NO",
  });
  const [numeralUno, setNumeralUno] = useState<Record<number, boolean>>({});

  function setCorrespondenciaValue(key: keyof typeof correspondencia, value: string) {
    setCorrespondencia((current) => ({ ...current, [key]: value }));
  }

  function setIdentificacionValue(key: keyof typeof identificacion, value: string) {
    setIdentificacion((current) => ({ ...current, [key]: value }));
  }

  function toggleNumeral(index: number) {
    setNumeralUno((current) => ({ ...current, [index]: !current[index] }));
  }

  return (
    <div>
      <div className="mb-2 text-[12px]" style={{ color: RED }}>Formulario no guardado</div>

      <SectionTitle>Datos de expediente</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Codigo del Predio">
          <input className={inputCls} defaultValue={codigo} />
        </Field>
        <Field label="Codigo Expediente">
          <input className={inputCls} defaultValue="3546-2023-MTC/DDP" />
        </Field>
      </div>

      <SectionTitle>10. DESCRIPCION DE PERJUICIO ECONOMICO</SectionTitle>
      <div className="ml-4 max-w-[640px] overflow-hidden rounded border">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-white" style={{ background: "#fb7c70" }}>
              <th className="px-3 py-2 text-center font-semibold">COMPONENTE</th>
              <th className="px-3 py-2 text-center font-semibold">CORRESPONDENCIA</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["DANO EMERGENTE", "danoEmergente"],
              ["LUCRO CESANTE", "lucroCesante"],
            ].map(([label, key]) => (
              <tr key={key}>
                <td className="border-t px-3 py-2 text-center font-semibold text-gray-600">{label}</td>
                <td className="border-l border-t px-2 py-1.5">
                  <select
                    className={selectCls}
                    value={correspondencia[key as keyof typeof correspondencia]}
                    onChange={(event) => setCorrespondenciaValue(key as keyof typeof correspondencia, event.target.value)}
                  >
                    <option>-- SELECCIONE --</option>
                    <option>SI</option>
                    <option>NO</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionTitle>10.1 DANO EMERGENTE</SectionTitle>
      <div className="mb-3 px-3 py-2 text-[12px] font-semibold text-white" style={{ background: "#fb7c70" }}>
        10.1.1 IDENTIFICACION
      </div>
      <div className="mb-4 grid max-w-[760px] grid-cols-1 gap-y-2">
        <Field label="Forma de Afectacion">
          <select className={selectCls} value={identificacion.formaAfectacion} onChange={(event) => setIdentificacionValue("formaAfectacion", event.target.value)}>
            <option>-- SELECCIONE --</option>
            <option>PARCIAL</option>
            <option>TOTAL</option>
          </select>
        </Field>
        <Field label="Condicion del Predio">
          <select className={selectCls} value={identificacion.condicionPredio} onChange={(event) => setIdentificacionValue("condicionPredio", event.target.value)}>
            <option>-- SELECCIONE --</option>
            <option>INHABITABLE</option>
            <option>HABITABLE</option>
            <option>INOPERATIVO</option>
            <option>OPERATIVO PARCIAL</option>
          </select>
        </Field>
      </div>

      <div className="mb-0 text-[12px] font-semibold text-gray-700">Descripcion del dano emergente</div>
      <textarea
        className="min-h-[54px] w-full rounded border border-gray-300 p-2 text-[12px] focus:outline-none focus:border-gray-500"
        value={identificacion.descripcion}
        onChange={(event) => setIdentificacionValue("descripcion", event.target.value)}
      />

      <div className="overflow-x-auto rounded border">
        <table className="w-full min-w-[980px] text-[12px]">
          <thead>
            <tr className="text-white" style={{ background: "#fb7c70" }}>
              <th className="px-2 py-2 text-center font-semibold" colSpan={2}>TIPO DE AFECTACION</th>
              <th className="w-[170px] px-2 py-2 text-center font-semibold">CORRESPONDENCIA</th>
            </tr>
          </thead>
          <tbody>
            {TIPO_AFECTACION_OPTIONS.map((row) => (
              <tr key={row.key} className="align-top">
                <td className="w-8 border-t px-2 py-2 font-semibold text-gray-600">{row.key})</td>
                <td className="border-t px-2 py-2 text-gray-600">{row.text}</td>
                <td className="border-l border-t px-2 py-2">
                  <div className="flex justify-center gap-5">
                    {(["SI", "NO"] as const).map((value) => (
                      <label key={value} className="inline-flex items-center gap-1 text-[12px] text-gray-700">
                        <input
                          type="radio"
                          name={`tipo-afectacion-${row.key}`}
                          value={value}
                          checked={tipoAfectacion[row.key] === value}
                          onChange={() => setTipoAfectacion((current) => ({ ...current, [row.key]: value }))}
                          className="accent-[#dc2626]"
                        />
                        {value === "SI" ? "SI" : "NO"}
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 max-w-[820px] overflow-hidden rounded border">
        <table className="w-full text-[12px]">
          <tbody>
            <tr>
              <td className="w-[92px] text-center font-semibold text-white" rowSpan={NUMERAL_UNO_OPTIONS.length + 1} style={{ background: "#fb7c70" }}>
                NUMERAL 1.
              </td>
              <td className="px-2 py-2 font-semibold text-white" style={{ background: "#fb7c70" }}>
                DESMONTAJE Y MONTAJE DE MOBILIARIO, EQUIPOS Y MAQUINARIAS.
              </td>
              <td className="w-10 px-2 py-2 text-center" style={{ background: "#fb7c70" }}>
                <input type="checkbox" className="accent-[#dc2626]" checked={!!numeralUno[-1]} onChange={() => toggleNumeral(-1)} />
              </td>
            </tr>
            {NUMERAL_UNO_OPTIONS.map((option, index) => (
              <tr key={option}>
                <td className="border-t px-2 py-1.5 text-gray-600">{option}</td>
                <td className="border-l border-t px-2 py-1.5 text-center">
                  <input type="checkbox" className="accent-[#dc2626]" checked={!!numeralUno[index]} onChange={() => toggleNumeral(index)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ListadoTecnicoTab ({
  codigo,
  title,
  headers,
}: CaracterizacionTabProps & {
  title: string;
  headers: string[];
}) {
  return (
    <div>
      <SectionTitle>Datos de expediente</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Codigo del Predio"><input className={inputCls} defaultValue={codigo} /></Field>
        <Field label="Codigo Expediente"><input className={inputCls} defaultValue="3546-2023-MTC/DDP" /></Field>
      </div>

      <SectionTitle>{title}</SectionTitle>
      <DataTable headers={headers} rows={[]} />
    </div>
  );
}

function DescripcionEntornoTab () {
  const yesNoOptions = ["SI", "NO"];
  const fuenteOptions = ["-- SELECCIONE --", "RED PUBLICA", "POZO", "CISTERNA", "RIO / QUEBRADA", "OTRO"];
  const tipoSistemaOptions = ["CONDOMINIAL", "CONVENCIONAL", "LETRINA", "POZO SEPTICO", "NINGUNO"];
  const claseViaOptions = ["VIA EXPRESA", "ARTERIAL", "COLECTORA", "LOCAL", "TROCHA", "CAMINO VECINAL"];
  const materialViaOptions = ["AFIRMADO", "ASFALTO", "CONCRETO", "TROCHA", "TIERRA", "ADOQUIN"];
  const pendienteOptions = ["DE 0 A 5%", "DE 6 A 10%", "DE 11 A 20%", "DE 21 A 30%", "MAYOR A 30%"];

  return (
    <div>
      <SectionTitle>Sistema de Agua Potable</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Tipo de Red">
          <div className="flex items-center gap-4 text-[12px] text-gray-700">
            <label className="inline-flex items-center gap-1.5">
              <input type="checkbox" className="accent-[#dc2626]" /> Publica
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input type="checkbox" className="accent-[#dc2626]" /> Domiciliaria
            </label>
          </div>
        </Field>
        <Field label="Fuente">
          <select className={selectCls} defaultValue="-- SELECCIONE --">
            {fuenteOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </Field>
        <Field label="Administrado por Org. Regulador">
          <select className={selectCls} defaultValue="NO">
            {yesNoOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </Field>
        <Field label="Abastecimiento Optimo">
          <select className={selectCls} defaultValue="NO">
            {yesNoOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </Field>
        <Field label="Calidad - Agua Potable">
          <select className={selectCls} defaultValue="SI">
            {yesNoOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </Field>
        <Field label="Observaciones">
          <textarea className="min-h-[54px] w-full rounded border border-gray-300 p-2 text-[12px] focus:outline-none focus:border-gray-500" defaultValue="asdasd" />
        </Field>
      </div>

      <SectionTitle>Sistema de Alcantarillado</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Red">
          <div className="flex items-center gap-4 text-[12px] text-gray-700">
            <label className="inline-flex items-center gap-1.5">
              <input type="checkbox" defaultChecked className="accent-[#dc2626]" /> Publica
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input type="checkbox" className="accent-[#dc2626]" /> Domiciliaria
            </label>
          </div>
        </Field>
        <Field label="Tipo de Sistema">
          <select className={selectCls} defaultValue="CONDOMINIAL">
            {tipoSistemaOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </Field>
        <Field label="Administrado por Org. Regulador">
          <select className={selectCls} defaultValue="NO">
            {yesNoOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </Field>
        <Field label="Fuente Receptora Autorizada">
          <select className={selectCls} defaultValue="SI">
            {yesNoOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </Field>
        <Field label="Observaciones">
          <textarea className="min-h-[54px] w-full rounded border border-gray-300 p-2 text-[12px] focus:outline-none focus:border-gray-500" defaultValue="asdasd" />
        </Field>
      </div>

      <SectionTitle>Servicios Publicos</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {[
          ["Alumbrado Publico", "SI"],
          ["Telefonia Fija", "NO"],
          ["Internet / Cable", "NO"],
          ["Gas", "NO"],
        ].map(([label, defaultValue]) => (
          <Field key={label} label={label}>
            <select className={selectCls} defaultValue={defaultValue}>
              {yesNoOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </Field>
        ))}
      </div>

      <SectionTitle>Accesibilidad y Vias</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Clase de Via">
          <select className={selectCls} defaultValue="VIA EXPRESA">
            {claseViaOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </Field>
        <Field label="Material">
          <select className={selectCls} defaultValue="AFIRMADO">
            {materialViaOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </Field>
        <Field label="Observaciones Accesibilidad">
          <input className={inputCls} placeholder="Ej: A traves del Jiron Los Pinos hasta el Jr. Iquitos C-01" />
        </Field>
      </div>

      <SectionTitle>Equipamiento Urbano</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {[
          ["Comercio", "NO"],
          ["Salud", "NO"],
          ["Recreacion", "NO"],
          ["Inst. Publicas", "NO"],
          ["Educacion", "SI"],
          ["Transporte", "NO"],
        ].map(([label, defaultValue]) => (
          <Field key={label} label={label}>
            <select className={selectCls} defaultValue={defaultValue}>
              {yesNoOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </Field>
        ))}
      </div>

      <SectionTitle>Infraestructura de Riego</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {[
          ["Canales / Surcos", "SI"],
          ["Inundacion", "NO"],
          ["Goteo", "SI"],
          ["Micro Aspersion", "NO"],
          ["Aspersion", "NO"],
          ["Otro", "NO"],
        ].map(([label, defaultValue]) => (
          <Field key={label} label={label}>
            <select className={selectCls} defaultValue={defaultValue}>
              {yesNoOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </Field>
        ))}
        <Field label="Observaciones">
          <textarea className="min-h-[54px] w-full rounded border border-gray-300 p-2 text-[12px] focus:outline-none focus:border-gray-500" />
        </Field>
      </div>

      <SectionTitle>Topografia</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Pendiente (Topografia)">
          <select className={selectCls} defaultValue="DE 21 A 30%">
            {pendienteOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );
}

function SectionTitle ({ children }: { children: ReactNode }) {
  return (
    <div className="border-b pb-1 mb-3 mt-4 first:mt-0">
      <h3 className="text-[13px] font-semibold" style={{ color: RED }}>{children}</h3>
    </div>
  );
}

function Field ({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-[180px_1fr] items-center gap-2 ${className}`}>
      <label className="text-right text-[12px] text-gray-700">
        {required && <span style={{ color: RED }}>* </span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function DataTable ({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full text-[12px]">
        <thead className="bg-gray-50">
          <tr className="text-left">
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap border-b px-2 py-1.5 font-medium text-gray-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={`${row[0]}-${index}`} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <td key={`${row[0]}-${cellIndex}`} className="border-b px-2 py-1.5">
                    {cell || <span className="text-gray-400">Pendiente</span>}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-2 py-6 text-center text-gray-400">
                Sin registros
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function getDocumentBaseCode(codigo: string) {
  return codigo.replace(/[^A-Z0-9-]/gi, "").toUpperCase() || "PREDIO";
}

function createMemoriaDescriptivaBlob({
  codigo,
  predio,
  projectLabel,
}: {
  codigo: string;
  predio: ReturnType<typeof getPredioByCodigo>;
  projectLabel: string;
}) {
  const fechaEmision = new Date().toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const html = `<!doctype html>
<html>
  <head><meta charset="UTF-8" /></head>
  <body style="font-family: Arial, sans-serif; font-size: 10pt; color: #111827; line-height: 1.5;">
    <h2 style="text-align: center;">MEMORIA DESCRIPTIVA</h2>
    <p><b>Fecha de emisión:</b> ${escapeDocumentHtml(fechaEmision)}</p>
    <p><b>Proyecto:</b> ${escapeDocumentHtml(projectLabel)}</p>
    <p><b>Código de predio:</b> ${escapeDocumentHtml(codigo)}</p>
    <p><b>Sujeto pasivo:</b> ${escapeDocumentHtml(predio?.suj || "Sin información")}</p>
    <p><b>Tipo de predio:</b> ${escapeDocumentHtml(predio?.tipo || predio?.tp || "Sin información")}</p>
    <p><b>Área afectada:</b> ${escapeDocumentHtml(predio?.area || predio?.m2 || "Sin información")} m²</p>
    <p>Documento generado con la información disponible en la caracterización del predio.</p>
  </body>
</html>`;

  return new Blob([html], { type: "application/msword;charset=utf-8" });
}

function createMembretadoPlanosBlob({
  baseCode,
  codigo,
  predio,
  projectLabel,
}: {
  baseCode: string;
  codigo: string;
  predio: ReturnType<typeof getPredioByCodigo>;
  projectLabel: string;
}) {
  const planTypes = [
    ["Plano de diagnóstico", "PD"],
    ["Plano de ubicación", "PU"],
    ["Plano perimétrico", "PP"],
    ["Plano de afectación", "PA"],
    ["Plano de distribución", "PDI"],
    ["Plano de arquitectura", "PARQ"],
  ];
  const headers = [
    "Tipo de plano",
    "Código del plano",
    "Código del predio",
    "Proyecto",
    "Sujeto pasivo",
    "Área m²",
  ];
  const rows = planTypes.map(([tipo, suffix], index) => [
    tipo,
    `${baseCode}-${suffix}-${String(index + 1).padStart(2, "0")}`,
    codigo,
    projectLabel,
    predio?.suj || "",
    predio?.area || predio?.m2 || "",
  ]);
  const html = `<!doctype html>
<html>
  <head><meta charset="UTF-8" /></head>
  <body>
    <table border="1">
      <thead><tr>${headers.map((header) => `<th>${escapeDocumentHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeDocumentHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  </body>
</html>`;

  return new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
}

function downloadBlobFile(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeDocumentHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
