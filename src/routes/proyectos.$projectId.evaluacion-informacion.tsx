import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Paperclip,
  Plus,
  Save,
  Send,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { ProjectPageHeader } from "../components/ProjectPageHeader";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/evaluacion-informacion")({
  head: () => ({
    meta: [
      { title: "Evaluación de información recibida - MTC Prototipos" },
      {
        name: "description",
        content: "Evaluación de anexos recibidos y registro de necesidades derivadas del diagnóstico técnico general.",
      },
    ],
  }),
  component: EvaluacionInformacionPage,
});

type Decision = "pendiente" | "sin_necesidad" | "con_necesidad";
type EstadoNecesidad = "Registrada" | "Convertida a servicio" | "Atendida";
type EstadoServicio = "Por contratar" | "En ejecución" | "Entregado" | "Conforme";

type Anexo = {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  origen: "Registro directo" | "Transferencia de información";
  entidad: string;
  fechaRecepcion: string;
  responsable: string;
  estado: "Recibido" | "Validado" | "Observado";
};

type Necesidad = {
  id: string;
  numero: string;
  tipo: string;
  descripcion: string;
  sustento: string;
  prioridad: "Alta" | "Media" | "Baja";
  responsable: string;
  fechaRegistro: string;
  anexos: string[];
  tdr: string;
  estado: EstadoNecesidad;
};

type Servicio = {
  id: string;
  necesidadId: string;
  numero: string;
  proveedor: string;
  ordenServicio: string;
  fechaInicio: string;
  fechaEntrega: string;
  estado: EstadoServicio;
  entregables: string[];
  observaciones: string;
};

const RED = "#dc2626";
const inputCls =
  "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";
const textareaCls =
  "px-2 py-1.5 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";

const anexosRegistrados: Anexo[] = [
  {
    id: "a1",
    codigo: "ANX-001",
    nombre: "Plano perimétrico preliminar del área del proyecto",
    tipo: "Plano",
    origen: "Registro directo",
    entidad: "DDP",
    fechaRecepcion: "2026-06-18",
    responsable: "Ing. Diana Flores",
    estado: "Validado",
  },
  {
    id: "a2",
    codigo: "ANX-002",
    nombre: "Relación de predios afectados por transferencia",
    tipo: "Cuadro predial",
    origen: "Transferencia de información",
    entidad: "Concesionario",
    fechaRecepcion: "2026-06-20",
    responsable: "Gady Gabriela Quiroz Pinchi",
    estado: "Recibido",
  },
  {
    id: "a3",
    codigo: "ANX-003",
    nombre: "Archivo KMZ del eje del proyecto",
    tipo: "Archivo geográfico",
    origen: "Transferencia de información",
    entidad: "Oficina GIS",
    fechaRecepcion: "2026-06-22",
    responsable: "Luis Enrique Ponce Muñoz",
    estado: "Observado",
  },
  {
    id: "a4",
    codigo: "ANX-004",
    nombre: "Informe de compatibilidad catastral inicial",
    tipo: "Informe técnico",
    origen: "Registro directo",
    entidad: "Equipo predial",
    fechaRecepcion: "2026-06-24",
    responsable: "Christian Aliaga Vasquez",
    estado: "Recibido",
  },
];

const tipoNecesidadOptions = [
  "Levantamiento topográfico",
  "Verificación catastral",
  "Búsqueda registral",
  "Saneamiento físico legal",
  "Inspección de campo",
  "Otro servicio especializado",
];

const responsables = [
  "Gady Gabriela Quiroz Pinchi",
  "Luis Enrique Ponce Muñoz",
  "Diana Flores",
  "Pedro Ramírez",
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nextNumero(prefix: string, total: number) {
  return `${prefix}-2026-${String(total + 1).padStart(4, "0")}`;
}

function EvaluacionInformacionPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const proyecto = getProyecto(projectId);
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;

  const [decision, setDecision] = useState<Decision>("pendiente");
  const [evaluacionCerrada, setEvaluacionCerrada] = useState(false);
  const [selectedAnexos, setSelectedAnexos] = useState<string[]>(["a1", "a2"]);
  const [observaciones, setObservaciones] = useState("");
  const [necesidades, setNecesidades] = useState<Necesidad[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [form, setForm] = useState({
    tipo: "Levantamiento topográfico",
    descripcion: "Levantamiento topográfico complementario para validar coordenadas, linderos y áreas de afectación.",
    sustento: "La información recibida no permite confirmar la geometría final del ámbito evaluado.",
    prioridad: "Alta" as Necesidad["prioridad"],
    responsable: responsables[0],
    tdr: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`evaluacion-info:${projectId}`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setDecision(parsed.decision ?? "pendiente");
      setEvaluacionCerrada(Boolean(parsed.evaluacionCerrada));
      setSelectedAnexos(parsed.selectedAnexos ?? ["a1", "a2"]);
      setObservaciones(parsed.observaciones ?? "");
      setNecesidades(parsed.necesidades ?? []);
      setServicios(parsed.servicios ?? []);
    } catch {}
  }, [projectId]);

  useEffect(() => {
    try {
      localStorage.setItem(
        `evaluacion-info:${projectId}`,
        JSON.stringify({ decision, evaluacionCerrada, selectedAnexos, observaciones, necesidades, servicios }),
      );
    } catch {}
  }, [decision, evaluacionCerrada, necesidades, observaciones, projectId, selectedAnexos, servicios]);

  const anexosSeleccionados = useMemo(
    () => anexosRegistrados.filter((a) => selectedAnexos.includes(a.id)),
    [selectedAnexos],
  );

  const toggleAnexo = (id: string) => {
    setSelectedAnexos((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const cerrarSinNecesidad = () => {
    setDecision("sin_necesidad");
    setEvaluacionCerrada(true);
    setNecesidades([]);
    setServicios([]);
  };

  const registrarNecesidad = () => {
    if (!form.descripcion.trim() || !form.sustento.trim()) return;
    const necesidad: Necesidad = {
      id: `nec-${Date.now()}`,
      numero: nextNumero("NEC", necesidades.length),
      tipo: form.tipo,
      descripcion: form.descripcion,
      sustento: form.sustento,
      prioridad: form.prioridad,
      responsable: form.responsable,
      fechaRegistro: today(),
      anexos: selectedAnexos,
      tdr: form.tdr || "TDR pendiente de adjuntar",
      estado: "Registrada",
    };
    setDecision("con_necesidad");
    setEvaluacionCerrada(false);
    setNecesidades((items) => [necesidad, ...items]);
    setForm((current) => ({ ...current, descripcion: "", sustento: "", tdr: "" }));
  };

  const convertirAServicio = (necesidad: Necesidad) => {
    if (servicios.some((s) => s.necesidadId === necesidad.id)) return;
    const servicio: Servicio = {
      id: `srv-${Date.now()}`,
      necesidadId: necesidad.id,
      numero: nextNumero("SRV", servicios.length),
      proveedor: "",
      ordenServicio: "",
      fechaInicio: today(),
      fechaEntrega: "",
      estado: "Por contratar",
      entregables: [],
      observaciones: "",
    };
    setServicios((items) => [servicio, ...items]);
    setNecesidades((items) =>
      items.map((item) =>
        item.id === necesidad.id ? { ...item, estado: "Convertida a servicio" } : item,
      ),
    );
  };

  const agregarServicio = () => {
    const necesidadPendiente = necesidades.find(
      (necesidad) => !servicios.some((servicio) => servicio.necesidadId === necesidad.id),
    );
    if (!necesidadPendiente) return;
    convertirAServicio(necesidadPendiente);
  };

  const volverAlProyecto = () => {
    navigate({ to: "/proyectos/$projectId", params: { projectId } });
  };

  const updateServicio = <K extends keyof Servicio>(id: string, key: K, value: Servicio[K]) => {
    setServicios((items) => items.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
  };

  const addEntregables = (id: string, files: FileList | null) => {
    if (!files?.length) return;
    const names = Array.from(files).map((file) => file.name);
    setServicios((items) =>
      items.map((s) =>
        s.id === id ? { ...s, entregables: [...s.entregables, ...names], estado: "Entregado" } : s,
      ),
    );
  };

  const badgeValue = evaluacionCerrada
    ? "Cerrada sin necesidad"
    : decision === "con_necesidad"
      ? "Con necesidad"
      : "En evaluación";

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937] text-sm">
      <main className="flex-1 flex flex-col overflow-hidden">
        <ProjectPageHeader
          projectId={projectId}
          projectLabel={projectLabel}
          title="Evaluación de información recibida"
          badgeLabel="ESTADO"
          badgeValue={badgeValue}
          badgeSuffix="DIAG. TÉC. GRAL."
        />

        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded border">
            <div className="px-5 py-5">
              <div className="border-b mb-3">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border-b-2"
                  style={{ borderColor: RED, color: RED }}
                >
                  <ClipboardCheck size={14} />
                  Evaluación de información recibida
                </div>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (decision === "sin_necesidad") cerrarSinNecesidad();
                  if (decision === "con_necesidad") registrarNecesidad();
                }}
              >
                <SectionTitle>Información recibida registrada en el proyecto</SectionTitle>
                <AnexosTable
                  anexos={anexosRegistrados}
                  selected={selectedAnexos}
                  onToggle={toggleAnexo}
                />

                <SectionTitle>Resultado de la evaluación</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Decisión" required>
                    <div className="grid grid-cols-2 gap-2">
                      <DecisionButton
                        active={decision === "con_necesidad"}
                        onClick={() => {
                          setDecision("con_necesidad");
                          setEvaluacionCerrada(false);
                        }}
                        icon={<CheckCircle2 size={14} />}
                        label="Existe necesidad"
                      />
                      <DecisionButton
                        active={decision === "sin_necesidad"}
                        onClick={() => setDecision("sin_necesidad")}
                        icon={<X size={14} />}
                        label="No existe necesidad"
                      />
                    </div>
                  </Field>
                  <Field label="Anexos evaluados">
                    <input className={inputCls + " bg-gray-50"} readOnly value={`${anexosSeleccionados.length} anexos`} />
                  </Field>
                  <Field label="Observaciones" className="col-span-2">
                    <textarea
                      rows={3}
                      className={textareaCls}
                      value={observaciones}
                      onChange={(event) => setObservaciones(event.target.value)}
                    />
                  </Field>
                </div>

                {decision === "sin_necesidad" && (
                  <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">
                    La evaluación se cerrará sin generar una necesidad ni un servicio asociado.
                  </div>
                )}

                {decision === "con_necesidad" && (
                  <>
                    <SectionTitle>Registro formal de necesidad</SectionTitle>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      <Field label="Tipo de necesidad" required>
                        <select
                          className={selectCls}
                          value={form.tipo}
                          onChange={(event) => setForm({ ...form, tipo: event.target.value })}
                        >
                          {tipoNecesidadOptions.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Prioridad" required>
                        <select
                          className={selectCls}
                          value={form.prioridad}
                          onChange={(event) =>
                            setForm({ ...form, prioridad: event.target.value as Necesidad["prioridad"] })
                          }
                        >
                          <option>Alta</option>
                          <option>Media</option>
                          <option>Baja</option>
                        </select>
                      </Field>
                      <Field label="Responsable" required>
                        <select
                          className={selectCls}
                          value={form.responsable}
                          onChange={(event) => setForm({ ...form, responsable: event.target.value })}
                        >
                          {responsables.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="TDR adjunto">
                        <label className="inline-flex h-8 w-full cursor-pointer items-center gap-1.5 rounded border border-gray-300 px-2 text-[12px] hover:bg-gray-50">
                          <Upload size={14} style={{ color: RED }} />
                          <span className="truncate">{form.tdr || "Seleccionar archivo TDR"}</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(event) =>
                              setForm({ ...form, tdr: event.target.files?.[0]?.name ?? "" })
                            }
                          />
                        </label>
                      </Field>
                      <Field label="Descripción" required className="col-span-2">
                        <textarea
                          rows={3}
                          className={textareaCls}
                          value={form.descripcion}
                          onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
                        />
                      </Field>
                      <Field label="Sustento" required className="col-span-2">
                        <textarea
                          rows={3}
                          className={textareaCls}
                          value={form.sustento}
                          onChange={(event) => setForm({ ...form, sustento: event.target.value })}
                        />
                      </Field>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={registrarNecesidad}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded"
                        style={{ background: RED }}
                      >
                        <Plus size={14} /> Agregar
                      </button>
                    </div>
                  </>
                )}

                <SectionTitle>Tabla de necesidades</SectionTitle>
                <NecesidadesTable
                  necesidades={necesidades}
                  anexos={anexosRegistrados}
                  servicios={servicios}
                  onConvertir={convertirAServicio}
                />

                <div className="border-b pb-1 mb-3 mt-4 flex items-center justify-between gap-3">
                  <h3 className="text-[13px] font-semibold" style={{ color: RED }}>
                    Servicios y entregables del proveedor
                  </h3>
                  <button
                    type="button"
                    onClick={agregarServicio}
                    disabled={!necesidades.some((necesidad) => !servicios.some((servicio) => servicio.necesidadId === necesidad.id))}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ background: RED }}
                  >
                    <Plus size={14} /> Agregar
                  </button>
                </div>
                <ServiciosTable
                  servicios={servicios}
                  necesidades={necesidades}
                  onUpdate={updateServicio}
                  onAddEntregables={addEntregables}
                />

                <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
                  <button
                    type="button"
                    onClick={volverAlProyecto}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <ArrowLeft size={14} /> Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded"
                    style={{ background: decision === "sin_necesidad" ? "#16a34a" : RED }}
                  >
                    {decision === "sin_necesidad" ? <FileCheck2 size={14} /> : <Save size={14} />}
                    {decision === "sin_necesidad" ? "Cerrar evaluación" : "Registrar necesidad"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AnexosTable({
  anexos,
  selected,
  onToggle,
}: {
  anexos: Anexo[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="overflow-auto rounded border border-gray-200">
      <table className="w-full min-w-[980px] text-[12px]">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            {["Eval.", "Código", "Documento / anexo", "Tipo", "Origen", "Entidad", "Fecha", "Responsable", "Estado"].map(
              (header) => (
                <th key={header} className="px-2 py-2 text-left font-semibold border-b border-gray-200">
                  {header}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {anexos.map((anexo) => (
            <tr key={anexo.id} className="hover:bg-gray-50">
              <td className="px-2 py-2 border-b border-gray-100">
                <input
                  type="checkbox"
                  checked={selected.includes(anexo.id)}
                  onChange={() => onToggle(anexo.id)}
                  className="accent-[#dc2626]"
                />
              </td>
              <td className="px-2 py-2 border-b border-gray-100 font-mono text-[#dc2626]">{anexo.codigo}</td>
              <td className="px-2 py-2 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <FileText size={13} className="text-[#dc2626]" />
                  <span>{anexo.nombre}</span>
                </div>
              </td>
              <td className="px-2 py-2 border-b border-gray-100">{anexo.tipo}</td>
              <td className="px-2 py-2 border-b border-gray-100">{anexo.origen}</td>
              <td className="px-2 py-2 border-b border-gray-100">{anexo.entidad}</td>
              <td className="px-2 py-2 border-b border-gray-100">{anexo.fechaRecepcion}</td>
              <td className="px-2 py-2 border-b border-gray-100">{anexo.responsable}</td>
              <td className="px-2 py-2 border-b border-gray-100">
                <StatusBadge value={anexo.estado} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NecesidadesTable({
  necesidades,
  anexos,
  servicios,
  onConvertir,
}: {
  necesidades: Necesidad[];
  anexos: Anexo[];
  servicios: Servicio[];
  onConvertir: (necesidad: Necesidad) => void;
}) {
  return (
    <div className="overflow-auto rounded border border-gray-200">
      <table className="w-full min-w-[1060px] text-[12px]">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            {["N°", "Necesidad", "Tipo", "Prioridad", "TDR", "Anexos", "Responsable", "Estado", "Acciones"].map(
              (header) => (
                <th key={header} className="px-2 py-2 text-left font-semibold border-b border-gray-200">
                  {header}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {necesidades.length === 0 && (
            <tr>
              <td colSpan={9} className="px-3 py-5 text-center text-gray-500">
                Sin necesidades registradas.
              </td>
            </tr>
          )}
          {necesidades.map((necesidad) => {
            const hasService = servicios.some((servicio) => servicio.necesidadId === necesidad.id);
            return (
              <tr key={necesidad.id} className="hover:bg-gray-50">
                <td className="px-2 py-2 border-b border-gray-100 font-mono text-[#dc2626]">{necesidad.numero}</td>
                <td className="px-2 py-2 border-b border-gray-100 max-w-[300px]">{necesidad.descripcion}</td>
                <td className="px-2 py-2 border-b border-gray-100">{necesidad.tipo}</td>
                <td className="px-2 py-2 border-b border-gray-100">
                  <PriorityBadge value={necesidad.prioridad} />
                </td>
                <td className="px-2 py-2 border-b border-gray-100">
                  <span className="inline-flex items-center gap-1">
                    <Paperclip size={12} className="text-[#dc2626]" />
                    {necesidad.tdr}
                  </span>
                </td>
                <td className="px-2 py-2 border-b border-gray-100">
                  {necesidad.anexos
                    .map((id) => anexos.find((anexo) => anexo.id === id)?.codigo)
                    .filter(Boolean)
                    .join(", ")}
                </td>
                <td className="px-2 py-2 border-b border-gray-100">{necesidad.responsable}</td>
                <td className="px-2 py-2 border-b border-gray-100">
                  <StatusBadge value={necesidad.estado} />
                </td>
                <td className="px-2 py-2 border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() => onConvertir(necesidad)}
                    disabled={hasService}
                    className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <BriefcaseBusiness size={12} />
                    Servicio
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ServiciosTable({
  servicios,
  necesidades,
  onUpdate,
  onAddEntregables,
}: {
  servicios: Servicio[];
  necesidades: Necesidad[];
  onUpdate: <K extends keyof Servicio>(id: string, key: K, value: Servicio[K]) => void;
  onAddEntregables: (id: string, files: FileList | null) => void;
}) {
  return (
    <div className="overflow-auto rounded border border-gray-200">
      <table className="w-full min-w-[1180px] text-[12px]">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            {[
              "Servicio",
              "Necesidad asociada",
              "Proveedor",
              "Orden de servicio",
              "Inicio",
              "Entrega",
              "Estado",
              "Entregables",
              "Acciones",
            ].map((header) => (
              <th key={header} className="px-2 py-2 text-left font-semibold border-b border-gray-200">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {servicios.length === 0 && (
            <tr>
              <td colSpan={9} className="px-3 py-5 text-center text-gray-500">
                Sin servicios generados.
              </td>
            </tr>
          )}
          {servicios.map((servicio) => {
            const necesidad = necesidades.find((item) => item.id === servicio.necesidadId);
            return (
              <tr key={servicio.id} className="align-top hover:bg-gray-50">
                <td className="px-2 py-2 border-b border-gray-100 font-mono text-[#dc2626]">{servicio.numero}</td>
                <td className="px-2 py-2 border-b border-gray-100 max-w-[260px]">{necesidad?.tipo ?? "-"}</td>
                <td className="px-2 py-2 border-b border-gray-100">
                  <input
                    className={inputCls}
                    value={servicio.proveedor}
                    onChange={(event) => onUpdate(servicio.id, "proveedor", event.target.value)}
                  />
                </td>
                <td className="px-2 py-2 border-b border-gray-100">
                  <input
                    className={inputCls}
                    value={servicio.ordenServicio}
                    onChange={(event) => onUpdate(servicio.id, "ordenServicio", event.target.value)}
                  />
                </td>
                <td className="px-2 py-2 border-b border-gray-100">
                  <input
                    type="date"
                    className={inputCls}
                    value={servicio.fechaInicio}
                    onChange={(event) => onUpdate(servicio.id, "fechaInicio", event.target.value)}
                  />
                </td>
                <td className="px-2 py-2 border-b border-gray-100">
                  <input
                    type="date"
                    className={inputCls}
                    value={servicio.fechaEntrega}
                    onChange={(event) => onUpdate(servicio.id, "fechaEntrega", event.target.value)}
                  />
                </td>
                <td className="px-2 py-2 border-b border-gray-100">
                  <select
                    className={selectCls}
                    value={servicio.estado}
                    onChange={(event) => onUpdate(servicio.id, "estado", event.target.value as EstadoServicio)}
                  >
                    <option>Por contratar</option>
                    <option>En ejecución</option>
                    <option>Entregado</option>
                    <option>Conforme</option>
                  </select>
                </td>
                <td className="px-2 py-2 border-b border-gray-100 min-w-[220px]">
                  <div className="space-y-1">
                    {servicio.entregables.length === 0 ? (
                      <span className="text-gray-500">Sin entregables</span>
                    ) : (
                      servicio.entregables.map((entregable) => (
                        <div key={entregable} className="flex items-center gap-1">
                          <FileCheck2 size={12} className="text-[#16a34a]" />
                          <span className="truncate">{entregable}</span>
                        </div>
                      ))
                    )}
                  </div>
                </td>
                <td className="px-2 py-2 border-b border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-50">
                      <Upload size={12} />
                      Entregables
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(event) => onAddEntregables(servicio.id, event.target.files)}
                      />
                    </label>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-50"
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-50"
                    >
                      <Download size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="border-b pb-1 mb-3 mt-4 first:mt-0">
      <h3 className="text-[13px] font-semibold" style={{ color: RED }}>
        {children}
      </h3>
    </div>
  );
}

function Field({
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
      <label className="text-[12px] text-right text-gray-700">
        {required && <span style={{ color: RED }}>* </span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function DecisionButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center justify-center gap-1.5 rounded border px-3 text-[12px] ${
        active ? "border-[#dc2626] bg-[#fef2f2] text-[#dc2626]" : "border-gray-300 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatusBadge({ value }: { value: string }) {
  const isGood = ["Validado", "Atendida", "Conforme", "Cerrada"].includes(value);
  const isWarn = ["Recibido", "Registrada", "Por contratar", "Convertida a servicio"].includes(value);
  const className = isGood
    ? "bg-emerald-100 text-emerald-700"
    : isWarn
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${className}`}>{value}</span>;
}

function PriorityBadge({ value }: { value: Necesidad["prioridad"] }) {
  const className =
    value === "Alta"
      ? "bg-red-100 text-red-700"
      : value === "Media"
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${className}`}>{value}</span>;
}
