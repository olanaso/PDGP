import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProjectPageHeader } from "../components/ProjectPageHeader";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Printer,
  Save,
  LogOut,
  ChevronDown,
  FileCode,
  Eye,
  History,
  Upload,
  Trash2,
} from "lucide-react";
import {
  CURRENT_USER,
  PROFESIONALES,
  COORDINACIONES,
  TIPOS_PLANO,
  PROCESOS_GESTION_PREDIAL,
  getProjectInfo,
  seguimientoMock,
  type SeguimientoEvento,
} from "../lib/projectContext";

export const Route = createFileRoute("/proyectos/$projectId/codigos-planos")({
  head: () => ({
    meta: [
      { title: "Códigos de Plano — MTC" },
      { name: "description", content: "Listado y registro de códigos de plano del proyecto." },
    ],
  }),
  component: CodigosPlanosPage,
});

type Plano = {
  id: number;
  fecha: string;
  proyecto: string;
  coordinacion: string;
  profesional: string;
  tipoPlano: string;
  periodo: string;
  codigoPlano: string;
  conPlanoPDF: boolean;
  conBaseGrafica: boolean;
  expediente?: string;
  codigoPredio?: string;
  historial: SeguimientoEvento[];
};

const initialPlanos: Plano[] = [
  {
    id: 36413,
    fecha: "2026-06-23 07:52:30",
    proyecto: "PACRI - LONGITUDINAL DE LA SIERRA NORTE TRAMO 2",
    coordinacion: "COORDINACIÓN GENERAL VIAL 3",
    profesional: "GADY GABRIELA, QUIROZ PINCHI",
    tipoPlano: "PLANO DE DISTRIBUCION DE EDIFICACIONES",
    periodo: "2026",
    codigoPlano: "PDIST-55183-2026-CGV3-DDP-DGPPT-MTC",
    conPlanoPDF: false,
    conBaseGrafica: false,
    codigoPredio: "VIAL-LSNT2-ST01-060602-PR-02300",
    historial: seguimientoMock,
  },
  {
    id: 36412,
    fecha: "2026-06-23 07:47:51",
    proyecto: "AEROPUERTO DE AYACUCHO",
    coordinacion: "COORDINACIÓN DE EJECUCIÓN DE LA GESTIÓN PREDIAL",
    profesional: "LUIS ENRIQUE, PONCE MUÑOZ",
    tipoPlano: "PLANO DE INDEPENDIZACION",
    periodo: "2026",
    codigoPlano: "PIND-55182-2026-CGAE-DDP-DGPPT-MTC",
    conPlanoPDF: false,
    conBaseGrafica: false,
    expediente: "117-2025-MTC/DDP",
    codigoPredio: "PM2G-AERAYACUCHO-PU-250",
    historial: seguimientoMock,
  },
  {
    id: 36410,
    fecha: "2026-06-23 06:28:13",
    proyecto: "PACRI - AUTOPISTA DEL SOL",
    coordinacion: "COORDINACIÓN PREDIAL AUTOPISTA DEL SOL",
    profesional: "OKY AGUSTÍN, SUPARO TAJIRI",
    tipoPlano: "PLANO DE AFECTACION",
    periodo: "2026",
    codigoPlano: "PAFE-55180-2026-CPADS-DDP-DGPPT-MTC",
    conPlanoPDF: true,
    conBaseGrafica: true,
    expediente: "00833-2026-MTC/DDP",
    codigoPredio: "AUSOL-TC01-130104-R-0013",
    historial: seguimientoMock,
  },
  {
    id: 36409,
    fecha: "2026-06-23 17:15:58",
    proyecto: "PACRI - HUARAL ACOS",
    coordinacion: "COORDINACIÓN DE MULTIPROYECTOS VIALES 1",
    profesional: "CHRISTIAN ALEXANDER, ALIAGA VASQUEZ",
    tipoPlano: "PLANO PARA BUSQUEDA CATASTRAL ANTE REGISTROS PUBLICOS",
    periodo: "2026",
    codigoPlano: "PBC-55179-2026-CMUV1-DDP-DGPPT-MTC",
    conPlanoPDF: false,
    conBaseGrafica: false,
    codigoPredio: "HUA-A-09",
    historial: seguimientoMock,
  },
];

function CodigosPlanosPage() {
  const { projectId } = Route.useParams();
  const project = getProjectInfo(projectId);
  const [items, setItems] = useState<Plano[]>(initialPlanos);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Plano | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(
      (p) =>
        !q ||
        p.codigoPlano.toLowerCase().includes(q) ||
        p.proyecto.toLowerCase().includes(q) ||
        p.profesional.toLowerCase().includes(q) ||
        p.tipoPlano.toLowerCase().includes(q),
    );
  }, [items, search]);

  function openNew() {
    setEditing(null);
    setOpenModal(true);
  }
  function openEdit(p: Plano) {
    setEditing(p);
    setOpenModal(true);
  }
  function handleSave(form: PlanoFormValue) {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    if (editing) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editing.id
            ? {
                ...it,
                ...form,
                historial: [
                  {
                    id: it.historial.length + 1,
                    fecha: now,
                    usuario: CURRENT_USER.nombre,
                    accion: "Edición de registro",
                    detalle: "Datos generales actualizados",
                  },
                  ...it.historial,
                ],
              }
            : it,
        ),
      );
    } else {
      const id = Math.max(0, ...items.map((i) => i.id)) + 1;
      const codigo =
        form.codigoPlano ||
        `PLAN-${id}-${form.periodo}-${project.id.toUpperCase().slice(0, 4)}-DDP-DGPPT-MTC`;
      setItems((prev) => [
        {
          id,
          fecha: now,
          ...form,
          codigoPlano: codigo,
          historial: [
            {
              id: 1,
              fecha: now,
              usuario: CURRENT_USER.nombre,
              accion: "Creación de registro",
              detalle: "Registro generado desde el módulo",
              estado: "DISPONIBLE",
            },
          ],
        },
        ...prev,
      ]);
    }
    setOpenModal(false);
  }

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937] text-sm">
      <main className="flex-1 flex flex-col overflow-hidden">
        <ProjectPageHeader
          projectId={projectId}
          projectLabel={project.nombre}
          title="Códigos de Plano"
          badgeLabel="PROYECTO"
          badgeValue={project.nombre}
          badgeSuffix="CÓDIGOS PLANO"
        />


        <div className="px-6 py-4 flex-1 overflow-auto">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="BUSCAR POR CODIGO..."
                className="pl-9 pr-3 py-2 w-[300px] rounded-full border border-[#ef4444]/50 bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-[#ef4444]/30"
              />
            </div>
            <div className="flex items-center gap-2 text-[12px] text-[#6b7280]">
              <span>Mostrar</span>
              <select className="px-2 py-1 rounded border border-[#e5e7eb] text-[12px]">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span className="mr-2">registros</span>
              <button className="size-9 rounded-md bg-[#06b6d4] hover:bg-[#0891b2] text-white flex items-center justify-center" title="Filtros">
                <Filter size={16} />
              </button>
              <button className="size-9 rounded-md bg-[#64748b] hover:bg-[#475569] text-white flex items-center justify-center" title="Imprimir">
                <Printer size={16} />
              </button>
              <button
                onClick={openNew}
                className="size-9 rounded-md bg-[#22c55e] hover:bg-[#16a34a] text-white flex items-center justify-center"
                title="Agregar"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-x-auto shadow-sm">
            <table className="w-full text-[12px] min-w-[1400px]">
              <thead className="bg-[#b91c1c] text-white">
                <tr>
                  <Th>ID</Th>
                  <Th>ACCIONES</Th>
                  <Th>FECHA DE CREACIÓN</Th>
                  <Th>PROYECTO</Th>
                  <Th>COORDINACIÓN</Th>
                  <Th>PROFESIONAL SOLICITANTE</Th>
                  <Th>TIPO DE PLANO</Th>
                  <Th>PERIODO</Th>
                  <Th>CÓDIGO DE PLANO</Th>
                  <Th>PLANO PDF</Th>
                  <Th>BASE GRAFICA</Th>
                  <Th>CON PLANO PDF</Th>
                  <Th>CON BASE GRAFICA</Th>
                  <Th>EXPEDIENTE</Th>
                  <Th>CÓDIGO DE PREDIO</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}>
                    <Td className="text-[#dc2626]">{p.id}</Td>
                    <Td>
                      <button
                        onClick={() => openEdit(p)}
                        className="px-2 py-1 rounded border border-[#e5e7eb] hover:bg-[#fef2f2] text-[#dc2626]"
                        title="Editar"
                      >
                        <span className="inline-flex items-center gap-1">
                          <ChevronDown size={12} /> Acciones
                        </span>
                      </button>
                    </Td>
                    <Td className="text-[#6b7280]">{p.fecha}</Td>
                    <Td>{p.proyecto}</Td>
                    <Td>{p.coordinacion}</Td>
                    <Td>{p.profesional}</Td>
                    <Td>{p.tipoPlano}</Td>
                    <Td>{p.periodo}</Td>
                    <Td className="text-[#dc2626] font-medium">{p.codigoPlano}</Td>
                    <Td>{p.conPlanoPDF ? <IconCircle /> : null}</Td>
                    <Td>{p.conBaseGrafica ? <IconCircle /> : null}</Td>
                    <Td>
                      <Pill on={p.conPlanoPDF} />
                    </Td>
                    <Td>
                      <Pill on={p.conBaseGrafica} />
                    </Td>
                    <Td className="text-[#6b7280]">{p.expediente ?? ""}</Td>
                    <Td className="text-[#dc2626]">{p.codigoPredio ?? ""}</Td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={15} className="px-4 py-10 text-center text-[#9ca3af]">
                      Sin resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="px-4 py-2.5 border-t border-[#e5e7eb] text-[12px] text-[#6b7280] flex justify-between">
              <span>Mostrando {filtered.length} de {items.length} registros</span>
              <span>Página 1</span>
            </div>
          </div>
        </div>
      </main>

      {openModal && (
        <PlanoModal
          initial={editing}
          projectId={projectId}
          onClose={() => setOpenModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2.5 align-top ${className}`}>{children}</td>;
}
function IconCircle() {
  return (
    <span className="inline-flex size-6 rounded-full bg-[#5eead4]/30 text-[#0f766e] items-center justify-center">
      <Eye size={12} />
    </span>
  );
}
function Pill({ on }: { on: boolean }) {
  return on ? (
    <span className="text-[#166534] font-semibold">SI</span>
  ) : (
    <span className="text-[#9ca3af]">NO</span>
  );
}

type PlanoFormValue = {
  proyecto: string;
  coordinacion: string;
  profesional: string;
  tipoPlano: string;
  periodo: string;
  codigoPlano: string;
  comentario: string;
  expediente?: string;
  codigoPredio?: string;
  procesoGestionPredial: string;
  conPlanoPDF: boolean;
  conBaseGrafica: boolean;
};

function PlanoModal({
  initial,
  projectId,
  onClose,
  onSave,
}: {
  initial: Plano | null;
  projectId: string;
  onClose: () => void;
  onSave: (form: PlanoFormValue) => void;
}) {
  const project = getProjectInfo(projectId);
  const [tab, setTab] = useState<"datos" | "planos" | "historial">("datos");

  const [proyecto, setProyecto] = useState(initial?.proyecto ?? project.nombre);
  const [coordinacion, setCoordinacion] = useState(initial?.coordinacion ?? project.coordinacion);
  const [profesional, setProfesional] = useState(initial?.profesional ?? CURRENT_USER.nombre);
  const [tipoPlano, setTipoPlano] = useState(initial?.tipoPlano ?? "");
  const [periodo] = useState(initial?.periodo ?? String(new Date().getFullYear()));
  const [codigoPlano] = useState(initial?.codigoPlano ?? "");
  const [expediente, setExpediente] = useState(initial?.expediente ?? "");
  const [codigoPredio, setCodigoPredio] = useState(initial?.codigoPredio ?? "");
  const [comentario, setComentario] = useState("");
  const [procesoGestionPredial, setProcesoGestionPredial] = useState("");
  const [conPlanoPDF, setConPlanoPDF] = useState(initial?.conPlanoPDF ?? false);
  const [conBaseGrafica, setConBaseGrafica] = useState(initial?.conBaseGrafica ?? false);
  const [docs, setDocs] = useState<{ nombre: string; archivo: string; comentario: string }[]>([]);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 flex items-start justify-center overflow-y-auto p-6">
      <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl overflow-hidden mt-6 mb-10">
        {/* Tabs */}
        <div className="flex bg-[#fff1f2] border-b border-[#fecdd3] text-[12.5px]">
          <TabBtn active={tab === "datos"} onClick={() => setTab("datos")}>
            Datos Generales
          </TabBtn>
          <TabBtn active={tab === "planos"} onClick={() => setTab("planos")}>
            Información de Planos
          </TabBtn>
          <TabBtn active={tab === "historial"} onClick={() => setTab("historial")}>
            <History size={13} className="inline mr-1" /> Historial de Seguimiento
          </TabBtn>
        </div>

        {tab === "datos" && (
          <Section title="DATOS GENERALES">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <Field label="Proyecto" required full>
                <input value={proyecto} onChange={(e) => setProyecto(e.target.value)} className="form-input" />
              </Field>
              <Field label="Coordinación" required>
                <select value={coordinacion} onChange={(e) => setCoordinacion(e.target.value)} className="form-select">
                  <option value=""></option>
                  {COORDINACIONES.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Profesional">
                <select value={profesional} onChange={(e) => setProfesional(e.target.value)} className="form-select">
                  {PROFESIONALES.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Tipo de Plano" required>
                <select value={tipoPlano} onChange={(e) => setTipoPlano(e.target.value)} className="form-select">
                  <option value=""></option>
                  {TIPOS_PLANO.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Codigo de Plano">
                <input value={codigoPlano} disabled placeholder="Se generará automáticamente" className="form-input bg-[#f3f4f6]" />
              </Field>
              <Field label="Periodo" required>
                <input value={periodo} disabled className="form-input bg-[#f3f4f6]" />
              </Field>
              <Field label="Expediente administrativo N°">
                <input value={expediente} onChange={(e) => setExpediente(e.target.value)} className="form-input" />
              </Field>
              <Field label="Comentario">
                <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={3} className="form-input" />
              </Field>
              <Field label="Codigo de Predio N°">
                <input value={codigoPredio} onChange={(e) => setCodigoPredio(e.target.value)} className="form-input" />
              </Field>
              <Field label="Proceso de gestion predial" required>
                <select value={procesoGestionPredial} onChange={(e) => setProcesoGestionPredial(e.target.value)} className="form-select">
                  <option value=""></option>
                  {PROCESOS_GESTION_PREDIAL.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>
        )}

        {tab === "planos" && (
          <Section title="INFORMACION DE PLANOS">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#ecfeff] border border-[#a5f3fc] rounded-md p-4 flex gap-3 items-start">
                <div className="size-8 rounded bg-[#06b6d4] text-white flex items-center justify-center font-bold">i</div>
                <div className="text-[12.5px]">
                  En el caso de que los archivos de planos que superen más de 30 MB, subir por este medio:
                  <a href="#" className="block text-[#0ea5e9] underline mt-1">
                    Link de subida a DRIVE
                  </a>
                </div>
              </div>

              <div className="border border-[#e5e7eb] rounded-md overflow-hidden">
                <div className="bg-[#ef4444] text-white px-4 py-2 flex items-center justify-between">
                  <span className="text-[12.5px] font-semibold">DOCUMENTOS COMPLEMENTARIOS</span>
                  <button
                    onClick={() =>
                      setDocs((d) => [...d, { nombre: `Documento ${d.length + 1}`, archivo: "documento.pdf", comentario: "" }])
                    }
                    className="flex items-center gap-1 bg-[#22c55e] hover:bg-[#16a34a] px-2 py-1 rounded text-[12px]"
                  >
                    <Plus size={12} /> Archivo
                  </button>
                </div>
                <table className="w-full text-[12px]">
                  <thead className="bg-[#fecaca] text-[#7f1d1d]">
                    <tr>
                      <th className="px-3 py-1.5 text-left">#</th>
                      <th className="px-3 py-1.5 text-left">NOMBRE</th>
                      <th className="px-3 py-1.5 text-left">ARCHIVO</th>
                      <th className="px-3 py-1.5 text-left">COMENTARIO</th>
                      <th className="px-3 py-1.5 text-right">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-[#9ca3af]">
                          Sin documentos
                        </td>
                      </tr>
                    ) : (
                      docs.map((d, i) => (
                        <tr key={i} className="border-t border-[#fecaca]">
                          <td className="px-3 py-1.5">{i + 1}</td>
                          <td className="px-3 py-1.5">{d.nombre}</td>
                          <td className="px-3 py-1.5">{d.archivo}</td>
                          <td className="px-3 py-1.5">{d.comentario}</td>
                          <td className="px-3 py-1.5 text-right">
                            <button
                              onClick={() => setDocs((arr) => arr.filter((_, idx) => idx !== i))}
                              className="text-[#ef4444] hover:opacity-80"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <Field label="Archivo de planos">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="px-3 py-1.5 rounded border border-[#e5e7eb] bg-[#f9fafb] text-[12px]">
                    <Upload size={12} className="inline mr-1" /> Seleccionar archivo
                  </span>
                  <span className="text-[12px] text-[#6b7280]">
                    {conPlanoPDF ? "plano.pdf" : "Ningún archivo seleccionado"}
                  </span>
                  <input type="file" className="hidden" onChange={(e) => setConPlanoPDF(!!e.target.files?.length)} />
                </label>
              </Field>
              <Field label="Base Grafica">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="px-3 py-1.5 rounded border border-[#e5e7eb] bg-[#f9fafb] text-[12px]">
                    <Upload size={12} className="inline mr-1" /> Seleccionar archivo
                  </span>
                  <span className="text-[12px] text-[#6b7280]">
                    {conBaseGrafica ? "base.dwg" : "Ningún archivo seleccionado"}
                  </span>
                  <input type="file" className="hidden" onChange={(e) => setConBaseGrafica(!!e.target.files?.length)} />
                </label>
              </Field>
            </div>
          </Section>
        )}

        {tab === "historial" && (
          <Section title="HISTORIAL DE SEGUIMIENTO">
            <HistorialTimeline events={initial?.historial ?? seguimientoMock} />
          </Section>
        )}

        <div className="flex justify-end gap-3 px-6 py-4 bg-[#f9fafb] border-t border-[#e5e7eb]">
          <button
            onClick={() =>
              onSave({
                proyecto,
                coordinacion,
                profesional,
                tipoPlano,
                periodo,
                codigoPlano,
                comentario,
                expediente,
                codigoPredio,
                procesoGestionPredial,
                conPlanoPDF,
                conBaseGrafica,
              })
            }
            className="px-4 py-2 rounded-md bg-[#22c55e] hover:bg-[#16a34a] text-white text-[13px] font-medium flex items-center gap-2"
          >
            Guardar <Save size={14} />
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-[#f97316] hover:bg-[#ea580c] text-white text-[13px] font-medium flex items-center gap-2"
          >
            Salir <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 font-semibold border-b-2 ${
        active
          ? "border-[#ef4444] text-[#b91c1c] bg-white"
          : "border-transparent text-[#7f1d1d]/70 hover:text-[#7f1d1d]"
      }`}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-0">
      <div className="bg-[#ef4444] text-white px-5 py-2.5 font-semibold tracking-wide text-[13px]">
        {title}
      </div>
      <div className="p-6 border border-t-0 border-[#e5e7eb]">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-[12px] font-medium text-[#374151] mb-1">
        {required && <span className="text-[#ef4444] mr-1">*</span>}
        {label}:
      </label>
      <div className="[&_.form-input]:w-full [&_.form-input]:px-3 [&_.form-input]:py-2 [&_.form-input]:border [&_.form-input]:border-[#d1d5db] [&_.form-input]:rounded [&_.form-input]:text-[13px] [&_.form-input]:bg-white [&_.form-select]:w-full [&_.form-select]:px-3 [&_.form-select]:py-2 [&_.form-select]:border [&_.form-select]:border-[#d1d5db] [&_.form-select]:rounded [&_.form-select]:text-[13px] [&_.form-select]:bg-white">
        {children}
      </div>
    </div>
  );
}

export function HistorialTimeline({ events }: { events: SeguimientoEvento[] }) {
  return (
    <ol className="relative border-l-2 border-[#e5e7eb] pl-6 space-y-5">
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[31px] top-1 size-5 rounded-full bg-[#dc2626] border-4 border-white" />
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-semibold text-[13px] text-[#1f2937]">{e.accion}</span>
            {e.estado && (
              <span className="px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#dc2626] text-[10.5px] font-semibold">
                {e.estado}
              </span>
            )}
            <span className="text-[11.5px] text-[#6b7280]">{e.fecha}</span>
          </div>
          <p className="text-[12px] text-[#4b5563] mt-0.5">{e.detalle}</p>
          <p className="text-[11px] text-[#6b7280] mt-0.5">Por: {e.usuario}</p>
        </li>
      ))}
    </ol>
  );
}
