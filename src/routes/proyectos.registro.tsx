import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  FileText,
  History,
  Paperclip,
  Save,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import { AppSidebar } from "../components/AppSidebar";

type Search = { id?: string };

export const Route = createFileRoute("/proyectos/registro")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    id: typeof s.id === "string" ? s.id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Registro de Proyecto — MTC Prototipos" },
      { name: "description", content: "Registro y edición de proyectos prediales con trazabilidad." },
    ],
  }),
  component: RegistroProyectoPage,
});

type TipoRegistro = "tdr" | "opinion" | "gestion";
type SubEscenario = "cero" | "transferencia";
type Naturaleza =
  | "CARRETERA"
  | "PUENTE"
  | "AEROPUERTO"
  | "PUERTO"
  | "FERROCARRIL"
  | "LÍNEA DE TRANSMISIÓN"
  | "HIDROELÉCTRICA"
  | "SANEAMIENTO"
  | "OTROS";
type Modalidad = "concesionado" | "no-concesionado";

type Adjunto = { id: string; nombre: string; tipo: string; tamano: string };
type Responsable = { id: string; nombre: string; rol: string; area: string };
type Evento = { id: string; fecha: string; usuario: string; accion: string; detalle: string };

type Proyecto = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  naturaleza: Naturaleza;
  modalidad: Modalidad;
  tipoRegistro: TipoRegistro;
  subEscenario?: SubEscenario;
  docOrigenTipo: string;
  docOrigenNumero: string;
  docOrigenFecha: string;
  solicitante: string;
  coordinacionGeneral: string;
  coordinacionPredial: string;
  coordinadorPredial: string;
  liderInterferencias: string;
  departamento: string;
  provincia: string;
  distrito: string;
  referencia: string;
  fechaInicio: string;
  fechaFinPrevista: string;
  estado: "Borrador" | "Registrado" | "En revisión" | "Aprobado";
  responsables: Responsable[];
  adjuntos: Adjunto[];
  observaciones: string;
  trazabilidad: Evento[];
};

const PROYECTOS_MOCK: Proyecto[] = [
  {
    id: "caballococha",
    codigo: "PRY-011",
    nombre: "Aeropuerto de Caballococha",
    descripcion: "Proyecto aeroportuario regional en frontera amazónica.",
    naturaleza: "AEROPUERTO",
    modalidad: "no-concesionado",
    tipoRegistro: "gestion",
    subEscenario: "cero",
    docOrigenTipo: "Memorando",
    docOrigenNumero: "MEMO-238-2025-MTC/DGAC",
    docOrigenFecha: "2025-03-12",
    solicitante: "Dirección General de Aeronáutica Civil",
    coordinacionGeneral: "Coordinación General de Aeropuertos",
    coordinacionPredial: "Coordinación Predial Aeropuertos 03",
    coordinadorPredial: "Marcos Armando Soto Luis",
    liderInterferencias: "Joel Jhonny Lázaro Anaya",
    departamento: "Loreto",
    provincia: "Mariscal Ramón Castilla",
    distrito: "Caballococha",
    referencia: "Margen derecha del río Amazonas",
    fechaInicio: "2025-03-15",
    fechaFinPrevista: "2026-12-30",
    estado: "Registrado",
    responsables: [
      { id: "r1", nombre: "Diana Flores", rol: "Coordinadora DDP", area: "Técnica" },
      { id: "r2", nombre: "Luis Quispe", rol: "Profesional Legal", area: "Legal" },
    ],
    adjuntos: [
      { id: "a1", nombre: "MEMO-238-2025.pdf", tipo: "PDF", tamano: "812 KB" },
    ],
    observaciones: "Proyecto iniciado por requerimiento de la DGAC.",
    trazabilidad: [
      { id: "e1", fecha: "2025-03-15 09:12", usuario: "Diana Flores", accion: "Creación", detalle: "Registro inicial del proyecto." },
      { id: "e2", fecha: "2025-03-16 11:40", usuario: "Luis Quispe", accion: "Asignación", detalle: "Se asignó equipo legal y técnico." },
    ],
  },
];

const NATURALEZAS: { value: Naturaleza; label: string }[] = [
  { value: "CARRETERA", label: "Carretera" },
  { value: "PUENTE", label: "Puente" },
  { value: "AEROPUERTO", label: "Aeropuerto" },
  { value: "PUERTO", label: "Puerto" },
  { value: "FERROCARRIL", label: "Ferrocarril" },
  { value: "LÍNEA DE TRANSMISIÓN", label: "Línea de Transmisión" },
  { value: "HIDROELÉCTRICA", label: "Hidroeléctrica" },
  { value: "SANEAMIENTO", label: "Saneamiento" },
  { value: "OTROS", label: "Otros" },
];

// Valores tomados de los maestros del sistema
const DEPARTAMENTOS = [
  "AMAZONAS", "ANCASH", "APURIMAC", "AREQUIPA", "AYACUCHO", "CAJAMARCA",
  "CALLAO", "CUSCO", "HUANCAVELICA", "HUANUCO", "ICA", "JUNIN",
  "LA LIBERTAD", "LAMBAYEQUE", "LIMA", "LORETO", "MADRE DE DIOS", "MOQUEGUA",
  "PASCO", "PIURA", "PUNO", "SAN MARTIN", "TACNA", "TUMBES", "UCAYALI",
];

const TIPOS_DOC_ORIGEN = ["Memorando", "Oficio", "Informe", "Resolución", "Carta", "Acta", "Otro"];

const CARGOS = [
  "COORDINADOR",
  "ESPECIALISTA LEGAL",
  "ESPECIALISTA TÉCNICO",
  "TASADOR",
  "TOPÓGRAFO",
  "ASISTENTE SOCIAL",
  "ASISTENTE TÉCNICO",
  "ASISTENTE LEGAL",
  "JEFE DE PROYECTO",
  "GERENTE",
];

const AREAS = ["Técnica", "Legal", "Administrativa", "Predial", "Social", "Topografía", "Tasación"];

const COORDINACIONES_GENERALES = [
  "Coordinación General de Aeropuertos",
  "Coordinación General Vial 1",
  "Coordinación General Vial 2",
  "Coordinación General Vial 3",
  "Coordinación General de Proyectos Viales y Especiales",
];

const COORDINACIONES_PREDIALES = [
  "Coordinación Predial Aeropuertos 01",
  "Coordinación Predial Aeropuertos 02",
  "Coordinación Predial Aeropuertos 03",
  "Coordinación Predial Autopista del Sol",
  "Coordinación Predial Red Vial 4",
  "Coordinación Predial Red Vial 5",
  "Coordinación Predial Red Vial 6",
  "Coordinación Predial Longitudinal de la Sierra Tramo 2",
  "Coordinación Predial Longitudinal de la Sierra Tramo 4",
  "Coordinación de Multiproyectos Viales 1",
  "Coordinación de Multiproyectos Viales 2",
  "Coordinación de Multiproyectos Viales 3",
  "Coordinación de Multiproyectos Especiales",
];

const COORDINADORES_PREDIALES = [
  "Gilbert Manuel Aguirre Gómez",
  "Marcos Armando Soto Luis",
  "Marlon Napravnick Noriega",
  "Raquel Antuanet Huapaya Porras",
  "Rafael Palomino Rojas",
  "Paul Alexander Orosco Jiménez",
  "Freddy Justo Rojas Meza",
  "Nelson Efraín Gutiérrez Minchola",
  "Wenne Esteisy Jesús Loza",
  "José César Mendoza Soto",
];

const LIDERES_INTERFERENCIAS = [
  "Joel Jhonny Lázaro Anaya",
  "Jhony Elguera Rivas",
  "Marvin Antonio Mosquera Pérez",
  "María Cecilia Chil Chang",
  "Cristina Modesta Pancorbo Sayas",
  "Ángel Enrique Reyes Cruz",
  "Por designar",
];

const TIPOS_REGISTRO: { value: TipoRegistro; label: string; descripcion: string }[] = [
  {
    value: "tdr",
    label: "Generación de TDR",
    descripcion: "Elaborar, registrar y gestionar Términos de Referencia para contratación de servicios técnicos, legales o especializados.",
  },
  {
    value: "opinion",
    label: "Opinión Técnica",
    descripcion: "Evaluar viabilidad, consistencia o suficiencia de documentación técnica, legal o predial del proyecto.",
  },
  {
    value: "gestion",
    label: "Gestión Predial",
    descripcion: "Inicio, continuidad o culminación de acciones de gestión predial (DTL o transferencia).",
  },
];

type VistaRegistro = "formulario" | "trazabilidad";

function vacio (): Proyecto {
  return {
    id: "",
    codigo: `PRY-${String(Math.floor(Math.random() * 900) + 100)}`,
    nombre: "",
    descripcion: "",
    naturaleza: "CARRETERA",
    modalidad: "no-concesionado",
    tipoRegistro: "gestion",
    subEscenario: "cero",
    docOrigenTipo: "Memorando",
    docOrigenNumero: "",
    docOrigenFecha: new Date().toISOString().slice(0, 10),
    solicitante: "",
    coordinacionGeneral: "",
    coordinacionPredial: "",
    coordinadorPredial: "",
    liderInterferencias: "",
    departamento: "",
    provincia: "",
    distrito: "",
    referencia: "",
    fechaInicio: new Date().toISOString().slice(0, 10),
    fechaFinPrevista: "",
    estado: "Borrador",
    responsables: [],
    adjuntos: [],
    observaciones: "",
    trazabilidad: [
      {
        id: "e0",
        fecha: new Date().toISOString().slice(0, 16).replace("T", " "),
        usuario: "Usuario actual",
        accion: "Creación",
        detalle: "Inicio del registro del proyecto.",
      },
    ],
  };
}

function RegistroProyectoPage () {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const initial = useMemo<Proyecto>(() => {
    if (id) {
      const found = PROYECTOS_MOCK.find((p) => p.id === id);
      if (found) return structuredClone(found);
    }
    return vacio();
  }, [id]);

  const [data, setData] = useState<Proyecto>(initial);
  const [vista, setVista] = useState<VistaRegistro>("formulario");

  const update = <K extends keyof Proyecto> (k: K, v: Proyecto[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const addEvento = (accion: string, detalle: string) => {
    const e: Evento = {
      id: `e${Date.now()}`,
      fecha: new Date().toISOString().slice(0, 16).replace("T", " "),
      usuario: "Usuario actual",
      accion,
      detalle,
    };
    setData((d) => ({ ...d, trazabilidad: [...d.trazabilidad, e] }));
  };

  const guardar = (siguienteEstado?: Proyecto["estado"]) => {
    if (siguienteEstado) {
      addEvento("Cambio de estado", `Estado actualizado a "${siguienteEstado}".`);
      setData((d) => ({ ...d, estado: siguienteEstado }));
    } else {
      addEvento("Guardado", editing ? "Edición guardada." : "Borrador guardado.");
    }
  };

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937] text-sm">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="px-8 pt-6 pb-3">
          <div className="flex items-center gap-2 text-[12px] text-[#6b7280] mb-3">
            <Link to="/" className="hover:text-[#dc2626]">Proyectos</Link>
            <ChevronRight size={12} />
            <span className="text-[#374151] font-medium">
              {editing ? `Editar ${data.codigo}` : "Nuevo proyecto"}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="size-11 rounded-full bg-[#fde2e2] text-[#b91c1c] flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <div>
                <h1 className="text-[26px] font-bold leading-tight">
                  {editing ? "Editar proyecto" : "Registro de proyecto"}
                </h1>
                <p className="text-[12px] text-[#6b7280] max-w-2xl">
                  Establezca un entorno de trabajo trazable, articulado y ordenado para el proyecto predial.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/proyectos"
                className="flex items-center gap-1.5 bg-white border border-[#e5e7eb] hover:bg-[#f9fafb] px-3.5 py-2 rounded-md text-[13px] font-medium"
              >
                <ArrowLeft size={14} /> Volver
              </Link>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 grid grid-cols-[1fr_300px] gap-5">
          <section className="space-y-3">
            <div className="bg-white border border-[#e5e7eb] rounded-xl px-4 pt-3">
              <div className="flex items-center gap-1 border-b border-[#f3f4f6]">
                {(
                  [
                    { key: "formulario", label: "Formulario", icon: FileText },
                    { key: "trazabilidad", label: "Trazabilidad", icon: History },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const active = vista === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setVista(tab.key)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 ${active
                        ? "border-[#dc2626] text-[#b91c1c]"
                        : "border-transparent text-[#6b7280] hover:text-[#374151]"
                        }`}
                    >
                      <Icon size={14} /> {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {vista === "formulario" ? (
              <form
                className="bg-white border border-[#e5e7eb] rounded-xl p-4 space-y-4"
                onSubmit={(e) => e.preventDefault()}
              >
                <FormGeneral data={data} update={update} />
                <FormAlcance data={data} update={update} />
                <FormFlujo data={data} update={update} />
                <FormUbicacion data={data} update={update} />
                <FormResponsables data={data} setData={setData} addEvento={addEvento} />
                <FormDocumentos data={data} setData={setData} addEvento={addEvento} />

                <div className="flex justify-end gap-2 pt-4 border-t border-[#f3f4f6]">
                  <button
                    type="button"
                    onClick={() => guardar()}
                    className="inline-flex items-center gap-1.5 bg-white border border-[#e5e7eb] hover:bg-[#f9fafb] px-3.5 py-2 rounded-md text-[13px] font-medium"
                  >
                    <Save size={14} /> Guardar borrador
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      guardar("Registrado");
                      setTimeout(() => navigate({ to: "/proyectos" }), 300);
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-3.5 py-2 rounded-md text-[13px] font-medium"
                  >
                    <Send size={14} /> {editing ? "Actualizar" : "Registrar proyecto"}
                  </button>
                </div>
              </form>
            ) : (
              <section className="bg-white border border-[#e5e7eb] rounded-xl p-6">
                <Trazabilidad eventos={data.trazabilidad} />
              </section>
            )}
          </section>

          {/* Resumen */}
          <aside className="bg-white border border-[#e5e7eb] rounded-xl p-4 h-fit sticky top-4 space-y-3">
            <div className="text-[11px] uppercase tracking-wide text-[#6b7280]">
              Resumen
            </div>
            <ResumenItem label="Código" value={data.codigo} />
            <ResumenItem label="Nombre" value={data.nombre || "—"} />
            <ResumenItem
              label="Naturaleza"
              value={NATURALEZAS.find((n) => n.value === data.naturaleza)?.label ?? "—"}
            />
            <ResumenItem
              label="Modalidad"
              value={data.modalidad === "concesionado" ? "Concesionado" : "No concesionado"}
            />
            <ResumenItem
              label="Tipo registro"
              value={TIPOS_REGISTRO.find((t) => t.value === data.tipoRegistro)?.label ?? "—"}
            />
            <ResumenItem label="Solicitante" value={data.solicitante || "—"} />
            <ResumenItem label="Coord. General" value={data.coordinacionGeneral || "—"} />
            <ResumenItem label="Coord. Predial" value={data.coordinacionPredial || "—"} />
            <ResumenItem label="Coordinador" value={data.coordinadorPredial || "—"} />
            <ResumenItem label="Líder Interferencias" value={data.liderInterferencias || "—"} />
            <ResumenItem
              label="Ubicación"
              value={[data.departamento, data.provincia, data.distrito].filter(Boolean).join(" · ") || "—"}
            />
            <ResumenItem label="Responsables" value={String(data.responsables.length)} />
            <ResumenItem label="Adjuntos" value={String(data.adjuntos.length)} />
            <div className="pt-2 border-t border-[#f3f4f6]">
              <div className="text-[11px] text-[#6b7280]">Estado</div>
              <span
                className={`inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${data.estado === "Aprobado"
                  ? "bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]"
                  : data.estado === "Registrado"
                    ? "bg-[#fee2e2] text-[#1e40af] border-[#fecaca]"
                    : data.estado === "En revisión"
                      ? "bg-[#fef3c7] text-[#92400e] border-[#fde68a]"
                      : "bg-[#f3f4f6] text-[#374151] border-[#e5e7eb]"
                  }`}
              >
                {data.estado}
              </span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function ResumenItem ({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-[#6b7280]">{label}</div>
      <div className="text-[13px] font-medium text-[#111827] truncate">{value}</div>
    </div>
  );
}

function Field ({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-[#374151]">
        {label} {required && <span className="text-[#dc2626]">*</span>}
      </span>
      <div className="mt-0.5">{children}</div>
      {hint && <span className="text-[11px] text-[#6b7280] mt-1 block">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full h-8 px-2 border border-[#e5e7eb] rounded-md text-[12px] bg-white focus:outline-none focus:border-[#dc2626]";

function SectionTitle ({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h2 className="text-[14px] font-bold text-[#111827]">{title}</h2>
      {sub && <p className="text-[11px] text-[#6b7280]">{sub}</p>}
    </div>
  );
}

type UpdateFn = <K extends keyof Proyecto>(k: K, v: Proyecto[K]) => void;

function FormGeneral ({ data, update }: { data: Proyecto; update: UpdateFn }) {
  return (
    <>
      <SectionTitle
        title="Datos Generales"
        sub="Identifique el proyecto y el documento de origen que da inicio al requerimiento."
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Código">
          <input className={inputCls} value={data.codigo} onChange={(e) => update("codigo", e.target.value)} />
        </Field>
        <Field label="Nombre del proyecto" required>
          <input
            className={inputCls}
            value={data.nombre}
            onChange={(e) => update("nombre", e.target.value)}
            placeholder="Ej. Aeropuerto de Caballococha"
          />
        </Field>
      </div>
      <Field label="Descripción" required>
        <textarea
          rows={2}
          className={inputCls}
          value={data.descripcion}
          onChange={(e) => update("descripcion", e.target.value)}
          placeholder="Descripción ejecutiva del proyecto."
        />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Tipo de documento de origen" required>
          <select
            className={inputCls}
            value={data.docOrigenTipo}
            onChange={(e) => update("docOrigenTipo", e.target.value)}
          >
            {TIPOS_DOC_ORIGEN.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label="Número de documento" required>
          <input
            className={inputCls}
            value={data.docOrigenNumero}
            onChange={(e) => update("docOrigenNumero", e.target.value)}
            placeholder="Ej. MEMO-238-2025-MTC"
          />
        </Field>
        <Field label="Fecha del documento">
          <input
            type="date"
            className={inputCls}
            value={data.docOrigenFecha}
            onChange={(e) => update("docOrigenFecha", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Solicitante / Entidad" required>
          <input
            className={inputCls}
            value={data.solicitante}
            onChange={(e) => update("solicitante", e.target.value)}
            placeholder="Ej. DGAC"
          />
        </Field>
        <Field label="Fecha de inicio">
          <input
            type="date"
            className={inputCls}
            value={data.fechaInicio}
            onChange={(e) => update("fechaInicio", e.target.value)}
          />
        </Field>
        <Field label="Fecha fin prevista">
          <input
            type="date"
            className={inputCls}
            value={data.fechaFinPrevista}
            onChange={(e) => update("fechaFinPrevista", e.target.value)}
          />
        </Field>
      </div>
    </>
  );
}

function FormAlcance ({ data, update }: { data: Proyecto; update: UpdateFn }) {
  return (
    <>
      <SectionTitle
        title="Alcance del Proyecto"
        sub="Configure el tipo de infraestructura y modalidad del proyecto."
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo de infraestructura" required>
          <select
            className={inputCls}
            value={data.naturaleza}
            onChange={(e) => update("naturaleza", e.target.value as Naturaleza)}
          >
            {NATURALEZAS.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Modalidad" required>
          <select
            className={inputCls}
            value={data.modalidad}
            onChange={(e) => update("modalidad", e.target.value as Modalidad)}
          >
            <option value="concesionado">Concesionado</option>
            <option value="no-concesionado">No concesionado</option>
          </select>
        </Field>
      </div>
    </>
  );
}

function FormFlujo ({ data, update }: { data: Proyecto; update: UpdateFn }) {
  const tipoSeleccionado = TIPOS_REGISTRO.find((t) => t.value === data.tipoRegistro);

  return (
    <>
      <SectionTitle
        title="Tipo de Registro"
        sub="Seleccione el flujo de atención que corresponde al requerimiento."
      />
      <Field label="Tipo de registro" required>
        <select
          className={inputCls}
          value={data.tipoRegistro}
          onChange={(e) => update("tipoRegistro", e.target.value as TipoRegistro)}
        >
          {TIPOS_REGISTRO.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {tipoSeleccionado && (
          <div className="text-[11px] text-[#6b7280] mt-1">{tipoSeleccionado.descripcion}</div>
        )}
      </Field>

      {data.tipoRegistro === "gestion" && (
        <Field label="Escenario de gestión predial">
          <select
            className={inputCls}
            value={data.subEscenario ?? "cero"}
            onChange={(e) => update("subEscenario", e.target.value as SubEscenario)}
          >
            <option value="cero">Inicio desde cero</option>
            <option value="transferencia">Inicio por transferencia</option>
            <option value="encargatura">Inicio por encargatura</option>
          </select>
        </Field>
      )}
    </>
  );
}

function FormUbicacion ({ data, update }: { data: Proyecto; update: UpdateFn }) {
  return (
    <>
      <SectionTitle title="Ubicación" sub="Departamento, provincia y distrito donde se ejecuta el proyecto." />
      <div className="grid grid-cols-3 gap-3">
        <Field label="Departamento" required hint="Maestro: Departamentos.">
          <select
            className={inputCls}
            value={data.departamento}
            onChange={(e) => update("departamento", e.target.value)}
          >
            <option value="">Seleccione...</option>
            {DEPARTAMENTOS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Provincia" required>
          <input
            className={inputCls}
            value={data.provincia}
            onChange={(e) => update("provincia", e.target.value)}
          />
        </Field>
        <Field label="Distrito" required>
          <input
            className={inputCls}
            value={data.distrito}
            onChange={(e) => update("distrito", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Referencia / Dirección">
        <input
          className={inputCls}
          value={data.referencia}
          onChange={(e) => update("referencia", e.target.value)}
          placeholder="Ej. Margen derecha del río Amazonas, km 12"
        />
      </Field>
    </>
  );
}

function FormResponsables ({
  data,
  setData,
  addEvento,
}: {
  data: Proyecto;
  setData: React.Dispatch<React.SetStateAction<Proyecto>>;
  addEvento: (a: string, d: string) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState(CARGOS[0]);
  const [area, setArea] = useState(AREAS[0]);

  const add = () => {
    if (!nombre.trim()) return;
    const r: Responsable = { id: `r${Date.now()}`, nombre: nombre.trim(), rol, area };
    setData((d) => ({ ...d, responsables: [...d.responsables, r] }));
    addEvento("Responsable agregado", `${r.nombre} (${r.rol}).`);
    setNombre("");
  };

  const remove = (id: string) => {
    const r = data.responsables.find((x) => x.id === id);
    setData((d) => ({ ...d, responsables: d.responsables.filter((x) => x.id !== id) }));
    if (r) addEvento("Responsable retirado", `${r.nombre}.`);
  };

  const addFromAsignacion = (nombre: string, rolAsign: string, areaAsign: string) => {
    if (!nombre.trim()) return;
    if (data.responsables.some((x) => x.nombre === nombre && x.rol === rolAsign)) return;
    const r: Responsable = { id: `r${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, nombre, rol: rolAsign, area: areaAsign };
    setData((d) => ({ ...d, responsables: [...d.responsables, r] }));
    addEvento("Responsable agregado", `${r.nombre} (${r.rol}).`);
  };

  const ASIGNACIONES: { label: string; key: keyof Proyecto; rol: string; area: string; options: string[] }[] = [
    { label: "Coordinación General", key: "coordinacionGeneral", rol: "COORDINADOR GENERAL", area: "Predial", options: COORDINACIONES_GENERALES },
    { label: "Coordinación Predial", key: "coordinacionPredial", rol: "COORDINACIÓN PREDIAL", area: "Predial", options: COORDINACIONES_PREDIALES },
    { label: "Coordinador Predial", key: "coordinadorPredial", rol: "COORDINADOR PREDIAL", area: "Predial", options: COORDINADORES_PREDIALES },
    { label: "Líder de Interferencias", key: "liderInterferencias", rol: "LÍDER DE INTERFERENCIAS", area: "Técnica", options: LIDERES_INTERFERENCIAS },
  ];

  return (
    <>
      <SectionTitle
        title="Responsables"
        sub="Asignación organizacional y profesionales técnicos / legales del proyecto."
      />

      <div className="border border-[#e5e7eb] rounded-md p-4 bg-[#f9fafb] space-y-3">
        <div className="text-[12px] font-semibold text-[#374151]">
          Asignación organizacional
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ASIGNACIONES.map((a) => {
            const value = String(data[a.key] ?? "");
            return (
              <div key={a.label} className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <Field label={a.label}>
                  <select
                    className={inputCls}
                    value={value}
                    onChange={(e) => setData((d) => ({ ...d, [a.key]: e.target.value }))}
                  >
                    <option value="">Seleccione...</option>
                    {a.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </Field>
                <button
                  type="button"
                  onClick={() => addFromAsignacion(value, a.rol, a.area)}
                  disabled={!value}
                  className="bg-[#dc2626] hover:bg-[#b91c1c] disabled:bg-[#fecaca] text-white px-3 py-2 rounded-md text-[13px] font-medium"
                >
                  Agregar
                </button>
              </div>
            );
          })}
        </div>
      </div>



      <div className="border border-[#e5e7eb] rounded-md overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-[#f9fafb] text-[#6b7280] text-left">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2">Área</th>
              <th className="px-3 py-2 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {data.responsables.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-[#9ca3af]">
                  Sin responsables registrados.
                </td>
              </tr>
            )}
            {data.responsables.map((r) => (
              <tr key={r.id} className="border-t border-[#f3f4f6]">
                <td className="px-3 py-2 font-medium">{r.nombre}</td>
                <td className="px-3 py-2">{r.rol}</td>
                <td className="px-3 py-2">{r.area}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    className="text-[#dc2626] hover:bg-[#fef2f2] p-1 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FormDocumentos ({
  data,
  setData,
  addEvento,
}: {
  data: Proyecto;
  setData: React.Dispatch<React.SetStateAction<Proyecto>>;
  addEvento: (a: string, d: string) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("PDF");

  const add = () => {
    if (!nombre.trim()) return;
    const a: Adjunto = {
      id: `a${Date.now()}`,
      nombre: nombre.trim(),
      tipo,
      tamano: `${Math.floor(Math.random() * 900) + 100} KB`,
    };
    setData((d) => ({ ...d, adjuntos: [...d.adjuntos, a] }));
    addEvento("Documento adjuntado", a.nombre);
    setNombre("");
  };

  const remove = (id: string) => {
    const a = data.adjuntos.find((x) => x.id === id);
    setData((d) => ({ ...d, adjuntos: d.adjuntos.filter((x) => x.id !== id) }));
    if (a) addEvento("Documento eliminado", a.nombre);
  };

  return (
    <>
      <SectionTitle
        title="Documentos"
        sub="Adjunte memorandos, oficios y otros documentos sustento del proyecto."
      />
      <div className="grid grid-cols-[1fr_160px_auto] gap-2 items-end">
        <Field label="Nombre del documento">
          <input
            className={inputCls}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. MEMO-238-2025.pdf"
          />
        </Field>
        <Field label="Tipo">
          <select className={inputCls} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {["PDF", "Word", "Excel", "Imagen", "Otro"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <button
          type="button"
          onClick={add}
          className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-3 py-2 rounded-md text-[13px] font-medium flex items-center gap-1.5"
        >
          <Upload size={14} /> Adjuntar
        </button>
      </div>

      <div className="border border-[#e5e7eb] rounded-md overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-[#f9fafb] text-[#6b7280] text-left">
            <tr>
              <th className="px-3 py-2">Documento</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Tamaño</th>
              <th className="px-3 py-2 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {data.adjuntos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-[#9ca3af]">
                  Sin documentos adjuntos.
                </td>
              </tr>
            )}
            {data.adjuntos.map((a) => (
              <tr key={a.id} className="border-t border-[#f3f4f6]">
                <td className="px-3 py-2 font-medium flex items-center gap-2">
                  <Paperclip size={12} className="text-[#6b7280]" /> {a.nombre}
                </td>
                <td className="px-3 py-2">{a.tipo}</td>
                <td className="px-3 py-2">{a.tamano}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    className="text-[#dc2626] hover:bg-[#fef2f2] p-1 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Trazabilidad ({ eventos }: { eventos: Evento[] }) {
  return (
    <>
      <SectionTitle
        title="Trazabilidad"
        sub="Historial cronológico de acciones, asignaciones y cambios sobre el proyecto."
      />
      <ol className="relative border-l-2 border-[#e5e7eb] ml-3 space-y-4 pt-2">
        {eventos
          .slice()
          .reverse()
          .map((e) => (
            <li key={e.id} className="ml-4 relative">
              <span className="absolute -left-[22px] top-1 size-3 rounded-full bg-[#dc2626] border-2 border-white shadow" />
              <div className="text-[12px] text-[#6b7280]">{e.fecha}</div>
              <div className="text-[13px] font-semibold text-[#111827]">{e.accion}</div>
              <div className="text-[12px] text-[#374151]">{e.detalle}</div>
              <div className="text-[11px] text-[#6b7280] mt-0.5">por {e.usuario}</div>
            </li>
          ))}
      </ol>
    </>
  );
}
