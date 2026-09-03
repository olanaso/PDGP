import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { AppSidebar } from "../components/AppSidebar";
import { proyectos } from "@/lib/projectsData";
import {
  Target,
  Calendar,
  Edit,
  History,
  Send,
  Save,
  X,
  Paperclip,
  Info,
  ChevronDown,
  Folder,
} from "lucide-react";

export const Route = createFileRoute("/gestion-presupuestal")({
  head: () => ({
    meta: [
      { title: "Metas" },
      {
        name: "description",
        content: "Programación, reprogramación y seguimiento de metas físicas y financieras.",
      },
    ],
  }),
  component: Page,
});

const RED = "#dc2626";
const inputCls =
  "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre",
];

function fakeYear(codigo: string) {
  const n = parseInt(codigo.replace(/\D/g, "") || "1", 10);
  return 2020 + (n % 5);
}
function getEjercicios(startYear: number) {
  const out: number[] = [];
  for (let y = 2026; y >= startYear; y--) out.push(y);
  return out;
}

type Meta = {
  mes: string;
  programada: number;
  reprogramada: number;
  fechaReprog: string;
  usuarioReprog: string;
  cumplida: number;
};

type HistoryEntry = {
  fecha: string;
  usuario: string;
  cambios: { campo: string; anterior: string; nuevo: string }[];
};

function nowStamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function seedHistory(kind: "fisica" | "financiera", metas: Meta[]): Record<string, HistoryEntry[]> {
  const out: Record<string, HistoryEntry[]> = {};
  metas.forEach((m, i) => {
    if (!m.fechaReprog) return;
    const key = `${kind}-${m.mes}`;
    const [dd, mm, yyyy] = m.fechaReprog.split("/");
    out[key] = [
      {
        fecha: `${dd}/${mm}/${yyyy} 09:${String(15 + i).padStart(2, "0")}:00`,
        usuario: "Sistema",
        cambios: [{ campo: "Meta Programada", anterior: "—", nuevo: String(m.programada) }],
      },
      {
        fecha: `${dd}/${mm}/${yyyy} 14:${String(20 + i).padStart(2, "0")}:00`,
        usuario: m.usuarioReprog || "Jean Ascencios",
        cambios: [
          { campo: "Meta Reprogramada", anterior: String(m.programada), nuevo: String(m.reprogramada) },
        ],
      },
    ];
  });
  return out;
}

function lastDayOfMonth(year: number, monthIndex: number) {
  const d = new Date(year, monthIndex + 1, 0);
  return String(d.getDate()).padStart(2, "0");
}

function seedMetas(kind: "fisica" | "financiera", year: number): Meta[] {
  return MESES.map((mes, i) => {
    const base =
      kind === "fisica"
        ? 10 + ((i * 7 + year) % 60)
        : 50000 + ((i * 13000 + year * 100) % 400000);
    if (year === 2026) {
      // Estamos en junio/julio 2026: meses transcurridos (Ene–Jun) con datos, el resto solo programada.
      if (i < 6) {
        const dd = lastDayOfMonth(year, i);
        const mm = String(i + 1).padStart(2, "0");
        const reprog = Math.max(1, base + ((i % 2 === 0 ? -1 : 1) * ((i + 2) % 5)));
        return {
          mes,
          programada: base,
          reprogramada: reprog,
          fechaReprog: `${dd}/${mm}/${year}`,
          usuarioReprog: "Jean Ascencios",
          cumplida: Math.round(reprog * (0.75 + (i % 3) * 0.05)),
        };
      }
      return {
        mes,
        programada: base,
        reprogramada: 0,
        fechaReprog: "",
        usuarioReprog: "",
        cumplida: 0,
      };
    }
    const dd = lastDayOfMonth(year, i);
    const mm = String(i + 1).padStart(2, "0");
    return {
      mes,
      programada: base,
      reprogramada: base,
      fechaReprog: `${dd}/${mm}/${year}`,
      usuarioReprog: "Jean Ascencios",
      cumplida: Math.round(base * 0.7),
    };
  });
}

function ProjectAutocomplete({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selected = proyectos.find((p) => p.id === value);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = proyectos
    .filter((p) => p.nombre.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 40);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={inputCls + " flex items-center justify-between text-left"}
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? selected.nombre : "Buscar proyecto..."}
        </span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Escriba para filtrar..."
            className="h-8 px-2 text-[12px] w-full border-b border-gray-200 focus:outline-none"
          />
          <div className="max-h-64 overflow-auto">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-[12px] text-gray-500">Sin resultados</div>
            )}
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onChange(p.id);
                  setOpen(false);
                  setQ("");
                }}
                className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-red-50 flex items-center gap-2"
              >
                <Folder size={12} className="text-[#dc2626]" />
                <span className="truncate">{p.nombre}</span>
                <span className="ml-auto text-[11px] text-gray-400">{p.codigo}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Page() {
  const [proyectoId, setProyectoId] = useState<string | null>(null);
  const [ejercicio, setEjercicio] = useState<number | null>(null);
  const [tab, setTab] = useState<"fisica" | "financiera">("fisica");
  const [modal, setModal] = useState<{ mes: string; kind: "fisica" | "financiera" } | null>(null);
  const [editModal, setEditModal] = useState<{ mes: string; kind: "fisica" | "financiera" } | null>(null);
  const [historyModal, setHistoryModal] = useState<{ mes: string; kind: "fisica" | "financiera" } | null>(null);
  const [metasFis, setMetasFis] = useState<Meta[]>([]);
  const [metasFin, setMetasFin] = useState<Meta[]>([]);
  const [historial, setHistorial] = useState<Record<string, HistoryEntry[]>>({});

  const proyecto = proyectos.find((p) => p.id === proyectoId);
  const ejercicios = useMemo(
    () => (proyecto ? getEjercicios(fakeYear(proyecto.codigo)) : []),
    [proyecto],
  );

  useEffect(() => {
    if (ejercicios.length && ejercicio === null) {
      setEjercicio(ejercicios[0]);
    }
    if (!proyecto) setEjercicio(null);
  }, [ejercicios, ejercicio, proyecto]);

  useEffect(() => {
    if (ejercicio !== null) {
      const mf = seedMetas("fisica", ejercicio);
      const mfin = seedMetas("financiera", ejercicio);
      setMetasFis(mf);
      setMetasFin(mfin);
      setHistorial({ ...seedHistory("fisica", mf), ...seedHistory("financiera", mfin) });
    }
  }, [ejercicio]);

  const saveEdit = (
    kind: "fisica" | "financiera",
    mes: string,
    programada: number,
    reprogramada: number,
  ) => {
    const setter = kind === "fisica" ? setMetasFis : setMetasFin;
    const list = kind === "fisica" ? metasFis : metasFin;
    const prev = list.find((m) => m.mes === mes);
    if (!prev) return;
    const cambios: HistoryEntry["cambios"] = [];
    if (prev.programada !== programada)
      cambios.push({ campo: "Meta Programada", anterior: String(prev.programada), nuevo: String(programada) });
    if (prev.reprogramada !== reprogramada)
      cambios.push({ campo: "Meta Reprogramada", anterior: String(prev.reprogramada), nuevo: String(reprogramada) });
    setter(list.map((m) => (m.mes === mes ? { ...m, programada, reprogramada } : m)));
    if (cambios.length) {
      const key = `${kind}-${mes}`;
      setHistorial((h) => ({
        ...h,
        [key]: [...(h[key] || []), { fecha: nowStamp(), usuario: "Equipo funcional", cambios }],
      }));
    }
  };

  const currentMetas = tab === "fisica" ? metasFis : metasFin;
  const fmt = (n: number) =>
    tab === "financiera" ? `S/ ${n.toLocaleString("es-PE")}` : n.toLocaleString("es-PE");

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <AppSidebar />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target size={20} className="text-[#dc2626]" />
          <div>
            <h1 className="text-[18px] font-semibold text-[#111]">Metas</h1>
            <p className="text-[11px] text-gray-500">
              Programación y seguimiento de metas físicas y financieras por proyecto.
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-md p-4">
          {/* Barra superior */}
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr_auto] gap-3 items-center mb-4">
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">Proyecto</label>
              <ProjectAutocomplete value={proyectoId} onChange={setProyectoId} />
            </div>
            <div className="flex gap-1 border-b -mb-px">
              <button
                onClick={() => setTab("fisica")}
                disabled={!proyecto}
                className="px-4 py-1.5 text-[12px] font-medium border-b-2 -mb-px disabled:opacity-40"
                style={{
                  borderColor: tab === "fisica" ? RED : "transparent",
                  color: tab === "fisica" ? RED : "#6b7280",
                }}
              >
                Metas Físicas
              </button>
              <button
                onClick={() => setTab("financiera")}
                disabled={!proyecto}
                className="px-4 py-1.5 text-[12px] font-medium border-b-2 -mb-px disabled:opacity-40"
                style={{
                  borderColor: tab === "financiera" ? RED : "transparent",
                  color: tab === "financiera" ? RED : "#6b7280",
                }}
              >
                Metas Financieras
              </button>
            </div>
            <div className="text-[11px] text-gray-500 text-right">
              {tab === "fisica" ? "Cantidad de predios a liberar" : "Monto (S/) a ejecutar"}
            </div>
          </div>

          {!proyecto ? (
            <div className="p-8 text-center text-[12px] text-gray-500 border border-dashed rounded">
              Seleccione un proyecto para visualizar sus ejercicios y metas.
            </div>
          ) : (
            <div className="grid grid-cols-[180px_1fr] gap-4">
              {/* Ejercicios lateral */}
              <div className="border rounded">
                <div className="px-3 py-2 border-b bg-gray-50 text-[12px] font-semibold text-gray-700 flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#dc2626]" /> Periodos
                </div>
                <div className="p-1">
                  {ejercicios.map((y) => {
                    const active = y === ejercicio;
                    return (
                      <button
                        key={y}
                        onClick={() => setEjercicio(y)}
                        className="w-full text-left px-3 py-1.5 text-[12px] rounded flex items-center gap-2"
                        style={{
                          background: active ? RED : "transparent",
                          color: active ? "#fff" : "#374151",
                        }}
                      >
                        <Calendar size={12} />
                        {y}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tabla */}
              <div className="overflow-auto border rounded">
                <table className="w-full text-[12px]">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th rowSpan={2} className="text-left px-2 py-2 border-b">Mes</th>
                      <th rowSpan={2} className="text-right px-2 py-2 border-b">Meta Programada</th>
                      <th colSpan={4} className="text-center px-2 py-1 border-b border-l">Reprogramación</th>
                      <th rowSpan={2} className="text-right px-2 py-2 border-b border-l"># Cumplida</th>
                      <th colSpan={2} className="text-center px-2 py-1 border-b border-l">Brechas</th>
                      <th rowSpan={2} className="text-center px-2 py-2 border-b border-l">Acciones</th>
                    </tr>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="text-right px-2 py-1 border-b border-l">Meta Reprog.</th>
                      <th className="text-center px-2 py-1 border-b">F. Reprog.</th>
                      <th className="text-left px-2 py-1 border-b">Usuario</th>
                      <th className="text-center px-2 py-1 border-b border-l">Solicitar</th>
                      <th className="text-right px-2 py-1 border-b">B. Inicial</th>
                      <th className="text-right px-2 py-1 border-b">B. Reprog.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMetas.map((m) => {
                      const isFuturo = m.fechaReprog === "";
                      const bInicial = isFuturo ? null : m.cumplida - m.programada;
                      const bReprog = isFuturo ? null : m.cumplida - m.reprogramada;
                      return (
                        <tr key={m.mes} className="border-b hover:bg-gray-50">
                          <td className="px-2 py-1.5">{m.mes}</td>
                          <td className="px-2 py-1.5 text-right">{fmt(m.programada)}</td>
                          <td className="px-2 py-1.5 text-right border-l">{isFuturo ? "" : fmt(m.reprogramada)}</td>
                          <td className="px-2 py-1.5 text-center text-gray-600">{m.fechaReprog}</td>
                          <td className="px-2 py-1.5 text-gray-600">{m.usuarioReprog}</td>
                          <td className="px-2 py-1.5 text-center border-l">
                            <button
                              onClick={() => setModal({ mes: m.mes, kind: tab })}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-white rounded"
                              style={{ background: "#ea580c" }}
                            >
                              <Send size={11} /> Reprogramar
                            </button>
                          </td>
                          <td className="px-2 py-1.5 text-right border-l font-medium">{isFuturo ? "" : fmt(m.cumplida)}</td>
                          <td className="px-2 py-1.5 text-right border-l" style={{ color: bInicial !== null && bInicial < 0 ? RED : "#059669" }}>{bInicial !== null ? bInicial : ""}</td>
                          <td className="px-2 py-1.5 text-right" style={{ color: bReprog !== null && bReprog < 0 ? RED : "#059669" }}>{bReprog !== null ? bReprog : ""}</td>
                          <td className="px-2 py-1.5 text-center border-l">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => setEditModal({ mes: m.mes, kind: tab })}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] border border-gray-300 rounded hover:bg-gray-50"
                              >
                                <Edit size={11} /> Editar
                              </button>
                              <button
                                onClick={() => setHistoryModal({ mes: m.mes, kind: tab })}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
                              >
                                <History size={11} /> Historial
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-100 font-semibold">
                      <td className="px-2 py-1.5">TOTALES</td>
                      <td className="px-2 py-1.5 text-right">
                        {fmt(currentMetas.reduce((a, b) => a + b.programada, 0))}
                      </td>
                      <td className="px-2 py-1.5 text-right border-l">
                        {fmt(currentMetas.filter(b => b.fechaReprog).reduce((a, b) => a + b.reprogramada, 0))}
                      </td>
                      <td colSpan={3}></td>
                      <td className="px-2 py-1.5 text-right border-l">
                        {fmt(currentMetas.filter(b => b.fechaReprog).reduce((a, b) => a + b.cumplida, 0))}
                      </td>
                      <td className="px-2 py-1.5 text-right border-l">
                        {fmt(currentMetas.filter(b => b.fechaReprog).reduce((a, b) => a + (b.cumplida - b.programada), 0))}
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        {fmt(currentMetas.filter(b => b.fechaReprog).reduce((a, b) => a + (b.cumplida - b.reprogramada), 0))}
                      </td>
                      <td className="border-l"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {modal && proyecto && ejercicio && (
          <ReprogramarModal
            mes={modal.mes}
            kind={modal.kind}
            proyecto={proyecto.nombre}
            ejercicio={ejercicio}
            onClose={() => setModal(null)}
            onSubmit={() => setModal(null)}
          />
        )}

        {editModal && (() => {
          const list = editModal.kind === "fisica" ? metasFis : metasFin;
          const meta = list.find((m) => m.mes === editModal.mes);
          if (!meta) return null;
          return (
            <EditarMetaModal
              meta={meta}
              kind={editModal.kind}
              onClose={() => setEditModal(null)}
              onSave={(p, r) => {
                saveEdit(editModal.kind, editModal.mes, p, r);
                setEditModal(null);
              }}
            />
          );
        })()}

        {historyModal && (
          <HistorialModal
            mes={historyModal.mes}
            kind={historyModal.kind}
            entries={historial[`${historyModal.kind}-${historyModal.mes}`] || []}
            onClose={() => setHistoryModal(null)}
          />
        )}
      </main>
    </div>
  );
}

function ReprogramarModal({
  mes,
  kind,
  proyecto,
  ejercicio,
  onClose,
  onSubmit,
}: {
  mes: string;
  kind: "fisica" | "financiera";
  proyecto: string;
  ejercicio: number;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md border w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="flex items-center gap-2">
            <Send size={16} className="text-[#dc2626]" />
            <div>
              <div className="text-[13px] font-semibold">Solicitar Reprogramación</div>
              <div className="text-[11px] text-gray-500">
                {proyecto} · {ejercicio} · {mes} · Meta{" "}
                {kind === "fisica" ? "Física" : "Financiera"}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded mb-3">
            <Info size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="text-[11px] text-amber-900">
              La solicitud será enviada a los coordinadores del proyecto <b>{proyecto}</b>. Ellos
              podrán reprogramar las cantidades{" "}
              {kind === "fisica" ? "físicas (predios a liberar)" : "financieras (monto en S/)"} dentro
              del rango de fechas indicado.
            </div>
          </div>

          <SectionTitle>Datos de la solicitud</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Field label="F. Inicio Registro" required>
              <input type="date" className={inputCls} />
            </Field>
            <Field label="F. Fin Registro" required>
              <input type="date" className={inputCls} />
            </Field>
            <Field label="Prioridad">
              <select className={inputCls + " appearance-none"}>
                <option>Alta</option>
                <option>Media</option>
                <option>Baja</option>
              </select>
            </Field>
            <Field label="Indicaciones" required className="col-span-2 items-start">
              <textarea
                className={inputCls + " h-20 py-1.5"}
                placeholder="Motivo y detalles para el coordinador..."
              />
            </Field>
            <Field label="Anexo" className="col-span-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] border border-gray-300 rounded cursor-pointer hover:bg-gray-50 w-fit">
                <Paperclip size={14} />
                {file ? file.name : "Adjuntar archivo"}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </Field>
          </div>

          <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
            >
              <X size={14} /> Cancelar
            </button>
            <button
              onClick={onSubmit}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded"
              style={{ background: RED }}
            >
              <Save size={14} /> Enviar solicitud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b pb-1 mb-3 mt-4 first:mt-0">
      <h3 className="text-[13px] font-semibold" style={{ color: RED }}>{children}</h3>
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

function EditarMetaModal({
  meta,
  kind,
  onClose,
  onSave,
}: {
  meta: Meta;
  kind: "fisica" | "financiera";
  onClose: () => void;
  onSave: (programada: number, reprogramada: number) => void;
}) {
  const [programada, setProgramada] = useState<number>(meta.programada);
  const [reprogramada, setReprogramada] = useState<number>(meta.reprogramada);
  const unidad = kind === "financiera" ? "S/" : "Predios";
  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md border w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="flex items-center gap-2">
            <Edit size={16} className="text-[#dc2626]" />
            <div>
              <div className="text-[13px] font-semibold">Editar Meta</div>
              <div className="text-[11px] text-gray-500">
                {meta.mes} · Meta {kind === "fisica" ? "Física" : "Financiera"} · {unidad}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={16} /></button>
        </div>
        <div className="px-5 py-4">
          <SectionTitle>Valores de la meta</SectionTitle>
          <div className="grid grid-cols-1 gap-y-2">
            <Field label="Meta Programada" required>
              <input
                type="number"
                value={programada}
                onChange={(e) => setProgramada(Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="Meta Reprogramada">
              <input
                type="number"
                value={reprogramada}
                onChange={(e) => setReprogramada(Number(e.target.value))}
                className={inputCls}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
            >
              <X size={14} /> Cancelar
            </button>
            <button
              onClick={() => onSave(programada, reprogramada)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded"
              style={{ background: RED }}
            >
              <Save size={14} /> Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistorialModal({
  mes,
  kind,
  entries,
  onClose,
}: {
  mes: string;
  kind: "fisica" | "financiera";
  entries: HistoryEntry[];
  onClose: () => void;
}) {
  const ordered = [...entries].reverse();
  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md border w-full max-w-3xl max-h-[85vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="flex items-center gap-2">
            <History size={16} className="text-[#dc2626]" />
            <div>
              <div className="text-[13px] font-semibold">Historial de Modificaciones</div>
              <div className="text-[11px] text-gray-500">
                {mes} · Meta {kind === "fisica" ? "Física" : "Financiera"}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={16} /></button>
        </div>
        <div className="px-5 py-4">
          {ordered.length === 0 ? (
            <div className="text-center text-[12px] text-gray-500 py-8">
              Sin modificaciones registradas.
            </div>
          ) : (
            <div className="overflow-auto border rounded">
              <table className="w-full text-[12px]">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left px-2 py-2 border-b">Fecha / Hora</th>
                    <th className="text-left px-2 py-2 border-b">Usuario</th>
                    <th className="text-left px-2 py-2 border-b">Campo</th>
                    <th className="text-right px-2 py-2 border-b">Valor Anterior</th>
                    <th className="text-right px-2 py-2 border-b">Valor Nuevo</th>
                  </tr>
                </thead>
                <tbody>
                  {ordered.flatMap((e, i) =>
                    e.cambios.map((c, j) => (
                      <tr key={`${i}-${j}`} className="border-b hover:bg-gray-50">
                        <td className="px-2 py-1.5 whitespace-nowrap">{e.fecha}</td>
                        <td className="px-2 py-1.5">{e.usuario}</td>
                        <td className="px-2 py-1.5">{c.campo}</td>
                        <td className="px-2 py-1.5 text-right text-gray-500">{c.anterior}</td>
                        <td className="px-2 py-1.5 text-right font-medium">{c.nuevo}</td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end mt-4 pt-3 border-t">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50"
            >
              <X size={14} /> Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
