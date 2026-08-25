import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProjectPageHeader } from "../components/ProjectPageHeader";
import { getProjectInfo, CURRENT_USER, COORDINACIONES } from "../lib/projectContext";
import { toast } from "sonner";
import {
  Plus,
  Search,
  X,
  Save,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronLeft,
  FileDown,
  Printer,
} from "lucide-react";

export const Route = createFileRoute("/proyectos/$projectId/expedientes")({
  head: () => ({
    meta: [
      { title: "Número de Expediente — MTC" },
      { name: "description", content: "Gestión de expedientes por predio." },
    ],
  }),
  component: ExpedientesPage,
});

const RED = "#dc2626";
const inputCls =
  "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";

type TipoExp = "INDIVIDUAL" | "MULTIPLE";

type Expediente = {
  id: number;
  fecha: string;
  proyecto: string;
  coordinacion: string;
  tipo: TipoExp;
  periodo: string;
  codigoExpediente: string;
  codigoPredio: string;
  solicitante: string;
  referencia?: string;
};

type PredioRow = { codigo: string; departamento: string; tipo: string };

// Genera la lista de predios pertenecientes ÚNICAMENTE al proyecto actual.
// El código de predio se construye con el slug del proyecto para garantizar
// que cada proyecto tenga su propio universo de códigos.
function prediosDelProyecto(projectId: string, project: { departamento: string }): PredioRow[] {
  const slug = projectId.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 6) || "PRY";
  const dpto = project.departamento || "—";
  const sufijos = ["001", "002", "003", "005", "008", "012", "017", "021", "035"];
  return sufijos.map((s) => ({
    codigo: `${slug}-PRD-${s}`,
    departamento: dpto,
    tipo: "PREDIO RURAL",
  }));
}

const initial: Expediente[] = [
  { id: 1, fecha: "2025-04-22 09:06:01", proyecto: "PACRI - IIRSA SUR TRAMO 3", coordinacion: "COORDINACIÓN DE MULTIPROYECTOS VIALES 3", tipo: "INDIVIDUAL", periodo: "2025", codigoExpediente: "00462-2025-MTC/DDP", codigoPredio: "COD_08_09_7", solicitante: "KAISER ELVIS, PAUCAR SALAZAR" },
  { id: 2, fecha: "2025-04-22 09:06:58", proyecto: "PACRI - IIRSA SUR TRAMO 3", coordinacion: "COORDINACIÓN DE MULTIPROYECTOS VIALES 3", tipo: "INDIVIDUAL", periodo: "2025", codigoExpediente: "00463-2025-MTC/DDP", codigoPredio: "T3-ALE-041", solicitante: "KAISER ELVIS, PAUCAR SALAZAR" },
  { id: 3, fecha: "2025-04-22 09:07:42", proyecto: "PACRI - IIRSA SUR TRAMO 3", coordinacion: "COORDINACIÓN DE MULTIPROYECTOS VIALES 3", tipo: "INDIVIDUAL", periodo: "2025", codigoExpediente: "00464-2025-MTC/DDP", codigoPredio: "T3-CAS-NT-02", solicitante: "KAISER ELVIS, PAUCAR SALAZAR" },
  { id: 4, fecha: "2025-04-22 09:08:20", proyecto: "PACRI - IIRSA SUR TRAMO 3", coordinacion: "COORDINACIÓN DE MULTIPROYECTOS VIALES 3", tipo: "INDIVIDUAL", periodo: "2025", codigoExpediente: "00465-2025-MTC/DDP", codigoPredio: "T3-MAV-005", solicitante: "KAISER ELVIS, PAUCAR SALAZAR" },
];

function ExpedientesPage() {
  const { projectId } = Route.useParams();
  const [items, setItems] = useState<Expediente[]>(initial);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Expediente | null>(null);

  const filtered = useMemo(
    () =>
      items.filter(
        (e) =>
          !search ||
          e.codigoExpediente.toLowerCase().includes(search.toLowerCase()) ||
          e.codigoPredio.toLowerCase().includes(search.toLowerCase()) ||
          e.solicitante.toLowerCase().includes(search.toLowerCase()),
      ),
    [items, search],
  );

  function openNew() {
    setEditing(null);
    setOpenModal(true);
  }
  function openEdit(e: Expediente) {
    setEditing(e);
    setOpenModal(true);
  }
  function remove(e: Expediente) {
    if (!confirm(`¿Eliminar expediente ${e.codigoExpediente}?`)) return;
    setItems((p) => p.filter((x) => x.id !== e.id));
    toast.success("Expediente eliminado");
  }

  function handleSave(data: Omit<Expediente, "id" | "fecha"> & { id?: number }) {
    if (editing) {
      setItems((p) =>
        p.map((x) => (x.id === editing.id ? { ...x, ...data, id: editing.id } : x)),
      );
      toast.success("Expediente actualizado");
    } else {
      const nextNum = items.length + 462;
      const next: Expediente = {
        id: Math.max(0, ...items.map((i) => i.id)) + 1,
        fecha: new Date().toISOString().slice(0, 19).replace("T", " "),
        ...data,
        codigoExpediente:
          data.codigoExpediente ||
          `${String(nextNum).padStart(5, "0")}-${data.periodo}-MTC/DDP`,
      };
      setItems((p) => [next, ...p]);
      toast.success("Expediente generado: " + next.codigoExpediente);
    }
    setOpenModal(false);
  }

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937] text-sm">
      <main className="flex-1 flex flex-col overflow-hidden">
        <ProjectPageHeader
          projectId={projectId}
          title="Número de Expediente"
          badgeLabel="PROYECTO"
          badgeValue={projectId}
          badgeSuffix="EXPEDIENTES"
        />

        <div className="px-6 py-4 flex-1 overflow-auto">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="pl-9 pr-3 py-2 w-[280px] rounded-full border border-[#e5e7eb] bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/30"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] rounded-md border border-gray-300 bg-white hover:bg-gray-50">
                <FileDown size={14} /> Exportar
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] rounded-md border border-gray-300 bg-white hover:bg-gray-50">
                <Printer size={14} /> Imprimir
              </button>
              <button
                onClick={openNew}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] rounded-md text-white"
                style={{ background: RED }}
              >
                <Plus size={14} /> Nuevo Expediente
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden shadow-sm">
            <table className="w-full text-[12.5px]">
              <thead className="bg-[#b91c1c] text-white">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold w-12">ID</th>
                  <th className="text-left px-4 py-2.5 font-semibold">FECHA DE CREACION</th>
                  <th className="text-left px-4 py-2.5 font-semibold">PROYECTO</th>
                  <th className="text-left px-4 py-2.5 font-semibold">COORDINACION</th>
                  <th className="text-left px-4 py-2.5 font-semibold">TIPO EXPEDIENTE</th>
                  <th className="text-left px-4 py-2.5 font-semibold">PERIODO</th>
                  <th className="text-left px-4 py-2.5 font-semibold">CÓDIGO DE EXPEDIENTE</th>
                  <th className="text-left px-4 py-2.5 font-semibold">CÓDIGO DE PREDIO</th>
                  <th className="px-4 py-2.5 font-semibold text-right w-28">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, idx) => (
                  <tr key={e.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}>
                    <td className="px-4 py-2.5 text-[#dc2626]">{e.id}</td>
                    <td className="px-4 py-2.5 text-[#6b7280]">{e.fecha}</td>
                    <td className="px-4 py-2.5 text-[#dc2626] font-medium">{e.proyecto}</td>
                    <td className="px-4 py-2.5">{e.coordinacion}</td>
                    <td className="px-4 py-2.5">{e.tipo}</td>
                    <td className="px-4 py-2.5">{e.periodo}</td>
                    <td className="px-4 py-2.5 text-[#1d4ed8]">{e.codigoExpediente}</td>
                    <td className="px-4 py-2.5">{e.codigoPredio}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(e)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11.5px] rounded border border-gray-300 hover:bg-gray-50"
                          title="Editar"
                        >
                          <Pencil size={12} /> Editar
                        </button>
                        <button
                          onClick={() => remove(e)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11.5px] rounded text-white"
                          style={{ background: RED }}
                          title="Eliminar"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-[#9ca3af]">
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
        <ExpedienteModal
          initial={editing}
          onClose={() => setOpenModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
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
  children: React.ReactNode;
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

function ExpedienteModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Expediente | null;
  onClose: () => void;
  onSave: (data: Omit<Expediente, "id" | "fecha">) => void;
}) {
  const { projectId } = Route.useParams();
  const project = getProjectInfo(projectId);

  // Step 1: seleccionar predio. En edición, saltamos directo al paso 2.
  const [step, setStep] = useState<1 | 2>(initial ? 2 : 1);
  const [predioSearch, setPredioSearch] = useState("");
  const [codigoPredio, setCodigoPredio] = useState(initial?.codigoPredio ?? "");

  const [proyecto, setProyecto] = useState(initial?.proyecto ?? project.nombre);
  const [coordinacion, setCoordinacion] = useState(
    initial?.coordinacion ?? project.coordinacion,
  );
  const [tipo, setTipo] = useState<TipoExp>(initial?.tipo ?? "INDIVIDUAL");
  const [periodo, setPeriodo] = useState(
    initial?.periodo ?? String(new Date().getFullYear()),
  );
  const [solicitante, setSolicitante] = useState(
    initial?.solicitante ?? CURRENT_USER.nombre,
  );
  const [referencia, setReferencia] = useState(initial?.referencia ?? "");
  const [codigoExpediente, setCodigoExpediente] = useState(
    initial?.codigoExpediente ?? "",
  );

  const prediosProyecto = useMemo(
    () => prediosDelProyecto(projectId, project),
    [projectId, project],
  );
  const prediosFiltrados = useMemo(
    () =>
      prediosProyecto.filter(
        (p) =>
          !predioSearch ||
          p.codigo.toLowerCase().includes(predioSearch.toLowerCase()),
      ),
    [prediosProyecto, predioSearch],
  );

  function next() {
    if (!codigoPredio) {
      toast.error("Selecciona un predio");
      return;
    }
    setStep(2);
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!proyecto || !coordinacion || !tipo || !periodo) {
      toast.error("Completa los campos obligatorios");
      return;
    }
    onSave({
      proyecto,
      coordinacion,
      tipo,
      periodo,
      codigoExpediente,
      codigoPredio,
      solicitante,
      referencia,
    });
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 flex items-start justify-center overflow-y-auto p-6">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden mt-6">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="text-[13px] font-semibold text-gray-800">
            {initial ? "Editar Expediente" : "Nuevo Número de Expediente"}
            <span className="ml-3 text-[11.5px] text-gray-500">
              Paso {step} de 2 — {step === 1 ? "Seleccionar Predio" : "Datos Generales"}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={16} />
          </button>
        </div>

        {step === 1 ? (
          <div className="px-5 py-5">
            <div className="border-b mb-3">
              <div
                className="inline-block px-3 py-1.5 text-[12px] font-medium border-b-2"
                style={{ borderColor: RED, color: RED }}
              >
                Listado de Predios
              </div>
            </div>

            <div className="flex items-center justify-between mb-2 gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={predioSearch}
                  onChange={(e) => setPredioSearch(e.target.value)}
                  placeholder="Buscar predio..."
                  className={inputCls + " pl-7"}
                />
              </div>
              <span className="text-[11.5px] text-gray-500">
                {prediosFiltrados.length} predios
              </span>
            </div>

            <div className="border rounded overflow-hidden max-h-[360px] overflow-y-auto">
              <table className="w-full text-[12px]">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="w-10 px-3 py-2"></th>
                    <th className="text-left px-3 py-2 font-medium">CÓDIGO PREDIO</th>
                    <th className="text-left px-3 py-2 font-medium">DEPARTAMENTO</th>
                    <th className="text-left px-3 py-2 font-medium">TIPO</th>
                  </tr>
                </thead>
                <tbody>
                  {prediosFiltrados.map((p) => (
                    <tr
                      key={p.codigo}
                      onClick={() => setCodigoPredio(p.codigo)}
                      className={`cursor-pointer border-t hover:bg-[#fef2f2] ${
                        codigoPredio === p.codigo ? "bg-[#fee2e2]" : ""
                      }`}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="radio"
                          checked={codigoPredio === p.codigo}
                          onChange={() => setCodigoPredio(p.codigo)}
                          className="accent-[#dc2626]"
                        />
                      </td>
                      <td className="px-3 py-2 font-medium text-[#dc2626]">
                        {p.codigo}
                      </td>
                      <td className="px-3 py-2">{p.departamento}</td>
                      <td className="px-3 py-2">{p.tipo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
              >
                <X size={14} /> Cancelar
              </button>
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded"
                style={{ background: RED }}
              >
                Siguiente <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="px-5 py-5">
            <div className="border-b mb-3">
              <div
                className="inline-block px-3 py-1.5 text-[12px] font-medium border-b-2"
                style={{ borderColor: RED, color: RED }}
              >
                Datos Generales
              </div>
            </div>

            <SectionTitle>Datos del Expediente</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field label="Proyecto" required className="col-span-2">
                <input
                  value={proyecto}
                  onChange={(e) => setProyecto(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Coordinación" required>
                <select
                  value={coordinacion}
                  onChange={(e) => setCoordinacion(e.target.value)}
                  className={selectCls}
                >
                  {COORDINACIONES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Numero de expediente">
                <input
                  value={codigoExpediente}
                  onChange={(e) => setCodigoExpediente(e.target.value)}
                  placeholder={initial ? "" : "Se generará automáticamente"}
                  disabled={!initial}
                  className={inputCls + " disabled:bg-gray-100"}
                />
              </Field>
              <Field label="Tipo de Expediente" required>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoExp)}
                  className={selectCls}
                >
                  <option value="INDIVIDUAL">INDIVIDUAL</option>
                  <option value="MULTIPLE">MÚLTIPLE</option>
                </select>
              </Field>
              <Field label="Codigo de Predios" required>
                <input value={codigoPredio} disabled className={inputCls + " bg-gray-100"} />
              </Field>
              <Field label="Periodo" required>
                <input
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Solicitante">
                <input
                  value={solicitante}
                  onChange={(e) => setSolicitante(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Referencia" className="col-span-2">
                <input
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="flex justify-between gap-2 mt-5 pt-3 border-t">
              {!initial ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
                >
                  <ChevronLeft size={14} /> Atrás
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
                >
                  <X size={14} /> Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded"
                  style={{ background: RED }}
                >
                  <Save size={14} /> Guardar
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
