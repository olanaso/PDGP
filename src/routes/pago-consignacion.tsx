import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppSidebar } from "../components/AppSidebar";
import {
  Banknote,
  Search,
  Filter,
  Eye,
  Edit,
  Send,
  Save,
  X,
  FileText,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  History,
  CalendarClock,
  Printer,
  Download,
  ClipboardCheck,
} from "lucide-react";

export const Route = createFileRoute("/pago-consignacion")({
  head: () => ({ meta: [{ title: "Pago y consignación" }] }),
  component: Page,
});

const RED = "#dc2626";
const inputCls =
  "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";

type Modalidad = "Adquisición" | "Expropiación";
type Forma = "Cheque" | "Depósito" | "Consignación";
type Estado =
  | "Apto para pago"
  | "Cheque generado"
  | "Entrega programada"
  | "Pagado"
  | "No pagado"
  | "Consignado"
  | "Entrega reprogramada"
  | "Predio entregado";

type Predio = {
  id: string;
  proyecto: string;
  tramo: string;
  codigo: string;
  modalidad: Modalidad;
  sujeto: string;
  dni: string;
  valorAprobado: number;
  incentivo: number;
  total: number;
  resolucion: string;
  forma: Forma;
  cheque?: {
    numero: string;
    entidad: string;
    emision: string;
    vencimiento: string;
    moneda: "PEN";
    custodio: string;
  };
  consignacion?: {
    expediente: string;
    entidad: string;
    constancia: string;
    fecha: string;
  };
  entrega: {
    fecha: string;
    lugar: string;
    responsable: string;
  };
  estado: Estado;
  actas: string[];
};

type Trazabilidad = {
  fecha: string;
  usuario: string;
  accion: string;
  detalle: string;
};

const PROYECTOS = ["Chachapoyas", "Tumbes", "Piura Norte", "Trujillo Metropolitano"];

const seed: Predio[] = [
  {
    id: "PC-0001",
    proyecto: "Chachapoyas",
    tramo: "Tramo 2",
    codigo: "CHA-P-00145",
    modalidad: "Adquisición",
    sujeto: "María Elena Torres Vargas",
    dni: "45231987",
    valorAprobado: 128500,
    incentivo: 25700,
    total: 154200,
    resolucion: "RD N° 145-2026-MTC/DDP",
    forma: "Cheque",
    cheque: {
      numero: "01234567",
      entidad: "Banco de la Nación",
      emision: "12/06/2026",
      vencimiento: "12/09/2026",
      moneda: "PEN",
      custodio: "Tesorería DDP",
    },
    entrega: { fecha: "20/06/2026", lugar: "Sede Chachapoyas", responsable: "Jean Ascencios" },
    estado: "Entrega programada",
    actas: ["Reporte cálculo.pdf", "Ficha cheque.pdf"],
  },
  {
    id: "PC-0002",
    proyecto: "Chachapoyas",
    tramo: "Tramo 1",
    codigo: "CHA-P-00078",
    modalidad: "Expropiación",
    sujeto: "Constructora Andes SAC",
    dni: "20512334987",
    valorAprobado: 342000,
    incentivo: 0,
    total: 342000,
    resolucion: "RM N° 088-2026-MTC",
    forma: "Consignación",
    consignacion: {
      expediente: "EXP-2026-00089",
      entidad: "3° Juzgado Civil - Chachapoyas",
      constancia: "CONS-2026-0044",
      fecha: "05/06/2026",
    },
    entrega: { fecha: "—", lugar: "—", responsable: "Legal DDP" },
    estado: "Consignado",
    actas: ["Constancia consignación.pdf", "Cargo judicial.pdf"],
  },
  {
    id: "PC-0003",
    proyecto: "Tumbes",
    tramo: "Tramo 4",
    codigo: "TUM-P-00212",
    modalidad: "Adquisición",
    sujeto: "Luis Alberto Ruiz Palma",
    dni: "40912456",
    valorAprobado: 87400,
    incentivo: 17480,
    total: 104880,
    resolucion: "RD N° 091-2026-MTC/DDP",
    forma: "Cheque",
    entrega: { fecha: "—", lugar: "—", responsable: "—" },
    estado: "Apto para pago",
    actas: ["Resolución.pdf", "Informe tasación.pdf"],
  },
  {
    id: "PC-0004",
    proyecto: "Piura Norte",
    tramo: "Tramo 2",
    codigo: "PIN-P-00033",
    modalidad: "Adquisición",
    sujeto: "Rosa Angélica Mendoza",
    dni: "42887610",
    valorAprobado: 56200,
    incentivo: 11240,
    total: 67440,
    resolucion: "RD N° 073-2026-MTC/DDP",
    forma: "Cheque",
    cheque: {
      numero: "01234512",
      entidad: "Banco de la Nación",
      emision: "01/06/2026",
      vencimiento: "01/09/2026",
      moneda: "PEN",
      custodio: "Tesorería DDP",
    },
    entrega: { fecha: "10/06/2026", lugar: "Sede Piura", responsable: "Diana Ramos" },
    estado: "Pagado",
    actas: ["Acta recepción.pdf", "Cargo entrega.pdf", "Ficha cheque.pdf"],
  },
  {
    id: "PC-0005",
    proyecto: "Trujillo Metropolitano",
    tramo: "Tramo 3",
    codigo: "TRU-P-00567",
    modalidad: "Adquisición",
    sujeto: "José Miguel Salazar",
    dni: "44123890",
    valorAprobado: 213800,
    incentivo: 42760,
    total: 256560,
    resolucion: "RD N° 112-2026-MTC/DDP",
    forma: "Cheque",
    cheque: {
      numero: "01234599",
      entidad: "Banco de la Nación",
      emision: "22/05/2026",
      vencimiento: "22/08/2026",
      moneda: "PEN",
      custodio: "Tesorería DDP",
    },
    entrega: { fecha: "30/05/2026", lugar: "Sede Trujillo", responsable: "Carlos Vela" },
    estado: "Entrega reprogramada",
    actas: ["Acta reprogramación.pdf"],
  },
];

const trazSeed: Record<string, Trazabilidad[]> = {
  "PC-0001": [
    { fecha: "10/06/2026 09:15", usuario: "Sistema", accion: "Predio marcado apto", detalle: "Resolución RD 145-2026 vinculada" },
    { fecha: "11/06/2026 11:03", usuario: "Área Financiera", accion: "Cheque registrado", detalle: "N° 01234567 · Banco de la Nación" },
    { fecha: "12/06/2026 15:22", usuario: "Jean Ascencios", accion: "Entrega programada", detalle: "20/06/2026 · Sede Chachapoyas" },
  ],
  "PC-0002": [
    { fecha: "04/06/2026 08:40", usuario: "Legal DDP", accion: "Consignación registrada", detalle: "Expediente EXP-2026-00089" },
    { fecha: "05/06/2026 16:11", usuario: "Sistema", accion: "Estado actualizado", detalle: "Consignado" },
  ],
  "PC-0004": [
    { fecha: "01/06/2026 10:00", usuario: "Área Financiera", accion: "Cheque registrado", detalle: "N° 01234512" },
    { fecha: "10/06/2026 14:35", usuario: "Diana Ramos", accion: "Entrega realizada", detalle: "Firma del Sujeto Pasivo" },
    { fecha: "10/06/2026 14:36", usuario: "Sistema", accion: "Estado actualizado", detalle: "Pagado" },
  ],
};

const estadoColor: Record<Estado, string> = {
  "Apto para pago": "bg-blue-50 text-blue-700 border-blue-200",
  "Cheque generado": "bg-amber-50 text-amber-700 border-amber-200",
  "Entrega programada": "bg-indigo-50 text-indigo-700 border-indigo-200",
  Pagado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "No pagado": "bg-red-50 text-red-700 border-red-200",
  Consignado: "bg-purple-50 text-purple-700 border-purple-200",
  "Entrega reprogramada": "bg-orange-50 text-orange-700 border-orange-200",
  "Predio entregado": "bg-teal-50 text-teal-700 border-teal-200",
};

function fmtS(n: number) {
  return `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;
}

function Page() {
  const [predios, setPredios] = useState<Predio[]>(seed);
  const [q, setQ] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [estado, setEstado] = useState<"" | Estado>("");
  const [modalidad, setModalidad] = useState<"" | Modalidad>("");
  const [selected, setSelected] = useState<Predio | null>(null);
  const [chequeModal, setChequeModal] = useState<Predio | null>(null);
  const [programModal, setProgramModal] = useState<Predio | null>(null);
  const [entregaModal, setEntregaModal] = useState<Predio | null>(null);
  const [trazModal, setTrazModal] = useState<Predio | null>(null);

  const filtered = useMemo(
    () =>
      predios.filter(
        (p) =>
          (!q ||
            p.codigo.toLowerCase().includes(q.toLowerCase()) ||
            p.sujeto.toLowerCase().includes(q.toLowerCase()) ||
            p.resolucion.toLowerCase().includes(q.toLowerCase())) &&
          (!proyecto || p.proyecto === proyecto) &&
          (!estado || p.estado === estado) &&
          (!modalidad || p.modalidad === modalidad),
      ),
    [predios, q, proyecto, estado, modalidad],
  );

  const totales = useMemo(() => {
    const t = { total: 0, pagados: 0, aptos: 0, consignados: 0 };
    filtered.forEach((p) => {
      t.total += p.total;
      if (p.estado === "Pagado") t.pagados += p.total;
      if (p.estado === "Apto para pago") t.aptos += p.total;
      if (p.estado === "Consignado") t.consignados += p.total;
    });
    return t;
  }, [filtered]);

  const upsert = (p: Predio) =>
    setPredios((prev) => prev.map((x) => (x.id === p.id ? p : x)));

  return (
    <div className="min-h-screen flex bg-white">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-4">
            <Banknote size={20} className="text-[#dc2626]" />
            <h1 className="text-[18px] font-semibold">Pago y consignación</h1>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <Kpi label="Predios en bandeja" value={String(filtered.length)} color="text-gray-800" />
            <Kpi label="Monto total" value={fmtS(totales.total)} color="text-gray-800" />
            <Kpi label="Monto pagado" value={fmtS(totales.pagados)} color="text-emerald-700" />
            <Kpi label="Consignado" value={fmtS(totales.consignados)} color="text-purple-700" />
          </div>

          {/* Filtros */}
          <div className="border rounded p-3 mb-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Filter size={13} className="text-gray-500" />
              <span className="text-[12px] font-medium text-gray-700">Filtros de la bandeja</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              <div className="col-span-2 relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Código, Sujeto Pasivo, resolución..."
                  className={inputCls + " pl-7"}
                />
              </div>
              <select value={proyecto} onChange={(e) => setProyecto(e.target.value)} className={inputCls}>
                <option value="">Todos los proyectos</option>
                {PROYECTOS.map((p) => <option key={p}>{p}</option>)}
              </select>
              <select value={modalidad} onChange={(e) => setModalidad(e.target.value as any)} className={inputCls}>
                <option value="">Toda modalidad</option>
                <option>Adquisición</option>
                <option>Expropiación</option>
              </select>
              <select value={estado} onChange={(e) => setEstado(e.target.value as any)} className={inputCls}>
                <option value="">Todo estado</option>
                {Object.keys(estadoColor).map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>

          {/* Bandeja */}
          <div className="border rounded overflow-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-2 py-2 border-b">Código</th>
                  <th className="text-left px-2 py-2 border-b">Proyecto / Tramo</th>
                  <th className="text-left px-2 py-2 border-b">Sujeto Pasivo</th>
                  <th className="text-left px-2 py-2 border-b">Modalidad</th>
                  <th className="text-right px-2 py-2 border-b">Monto total</th>
                  <th className="text-left px-2 py-2 border-b">Forma</th>
                  <th className="text-left px-2 py-2 border-b">Cheque / Consig.</th>
                  <th className="text-left px-2 py-2 border-b">Entrega</th>
                  <th className="text-left px-2 py-2 border-b">Estado</th>
                  <th className="text-center px-2 py-2 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-2 py-1.5 font-medium">{p.codigo}</td>
                    <td className="px-2 py-1.5">
                      <div>{p.proyecto}</div>
                      <div className="text-[11px] text-gray-500">{p.tramo}</div>
                    </td>
                    <td className="px-2 py-1.5">
                      <div>{p.sujeto}</div>
                      <div className="text-[11px] text-gray-500">DNI/RUC {p.dni}</div>
                    </td>
                    <td className="px-2 py-1.5">{p.modalidad}</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmtS(p.total)}</td>
                    <td className="px-2 py-1.5">{p.forma}</td>
                    <td className="px-2 py-1.5 text-[11px] text-gray-600">
                      {p.cheque
                        ? `N° ${p.cheque.numero} · ${p.cheque.entidad}`
                        : p.consignacion
                        ? `${p.consignacion.constancia}`
                        : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-[11px] text-gray-600">
                      {p.entrega.fecha === "—" ? "—" : `${p.entrega.fecha} · ${p.entrega.lugar}`}
                    </td>
                    <td className="px-2 py-1.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] border ${estadoColor[p.estado]}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1 justify-center flex-wrap">
                        <IconBtn onClick={() => setSelected(p)} title="Ver">
                          <Eye size={11} /> Ver
                        </IconBtn>
                        <IconBtn onClick={() => setChequeModal(p)} title="Cheque / Consignación">
                          <Banknote size={11} /> Cheque
                        </IconBtn>
                        <IconBtn onClick={() => setProgramModal(p)} title="Programar entrega">
                          <CalendarClock size={11} /> Programar
                        </IconBtn>
                        <IconBtn onClick={() => setEntregaModal(p)} title="Registrar entrega">
                          <ClipboardCheck size={11} /> Entregar
                        </IconBtn>
                        <IconBtn onClick={() => setTrazModal(p)} title="Trazabilidad">
                          <History size={11} /> Historial
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center text-[12px] text-gray-500 py-8">
                      No hay predios que coincidan con los filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selected && <DetalleModal predio={selected} onClose={() => setSelected(null)} />}
        {chequeModal && (
          <ChequeModal
            predio={chequeModal}
            onClose={() => setChequeModal(null)}
            onSave={(p) => {
              upsert(p);
              setChequeModal(null);
            }}
          />
        )}
        {programModal && (
          <ProgramarModal
            predio={programModal}
            onClose={() => setProgramModal(null)}
            onSave={(p) => {
              upsert(p);
              setProgramModal(null);
            }}
          />
        )}
        {entregaModal && (
          <EntregaModal
            predio={entregaModal}
            onClose={() => setEntregaModal(null)}
            onSave={(p) => {
              upsert(p);
              setEntregaModal(null);
            }}
          />
        )}
        {trazModal && (
          <TrazabilidadModal
            predio={trazModal}
            entries={trazSeed[trazModal.id] || []}
            onClose={() => setTrazModal(null)}
          />
        )}
      </main>
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="border rounded p-3 bg-white">
      <div className="text-[11px] text-gray-500 uppercase">{label}</div>
      <div className={`text-[18px] font-semibold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] border border-gray-300 rounded hover:bg-gray-50"
    >
      {children}
    </button>
  );
}

function ModalShell({
  title,
  subtitle,
  icon,
  onClose,
  children,
  size = "2xl",
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  size?: "xl" | "2xl" | "3xl" | "4xl";
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
      <div className={`bg-white rounded-md border w-full max-h-[90vh] overflow-auto ${size === "xl" ? "max-w-xl" : size === "2xl" ? "max-w-2xl" : size === "3xl" ? "max-w-3xl" : "max-w-4xl"}`}>
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="text-[#dc2626]">{icon}</span>
            <div>
              <div className="text-[13px] font-semibold">{title}</div>
              {subtitle && <div className="text-[11px] text-gray-500">{subtitle}</div>}
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={16} /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
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

function DetalleModal({ predio, onClose }: { predio: Predio; onClose: () => void }) {
  return (
    <ModalShell
      title={`Detalle · ${predio.codigo}`}
      subtitle={`${predio.proyecto} · ${predio.tramo} · ${predio.modalidad}`}
      icon={<Eye size={16} />}
      onClose={onClose}
      size="3xl"
    >
      <SectionTitle>Datos generales</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Sujeto Pasivo"><div className="text-[12px]">{predio.sujeto}</div></Field>
        <Field label="DNI / RUC"><div className="text-[12px]">{predio.dni}</div></Field>
        <Field label="Resolución"><div className="text-[12px]">{predio.resolucion}</div></Field>
        <Field label="Forma de atención"><div className="text-[12px]">{predio.forma}</div></Field>
      </div>

      <SectionTitle>Cálculo del monto ({predio.modalidad})</SectionTitle>
      <div className="border rounded overflow-hidden">
        <table className="w-full text-[12px]">
          <tbody>
            <tr className="border-b">
              <td className="px-3 py-2 text-gray-600">
                {predio.modalidad === "Adquisición" ? "Valor aprobado" : "Valor de tasación"}
              </td>
              <td className="px-3 py-2 text-right font-medium">{fmtS(predio.valorAprobado)}</td>
              <td className="px-3 py-2 text-[11px] text-gray-500">Sustento: {predio.resolucion}</td>
            </tr>
            {predio.modalidad === "Adquisición" && predio.incentivo > 0 && (
              <tr className="border-b">
                <td className="px-3 py-2 text-gray-600">Incentivo / componente adicional</td>
                <td className="px-3 py-2 text-right font-medium">{fmtS(predio.incentivo)}</td>
                <td className="px-3 py-2 text-[11px] text-gray-500">Sustentado en resolución</td>
              </tr>
            )}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-3 py-2">Monto total al Sujeto Pasivo</td>
              <td className="px-3 py-2 text-right" style={{ color: RED }}>{fmtS(predio.total)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {predio.cheque && (
        <>
          <SectionTitle>Ficha del cheque</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Field label="N° de cheque"><div className="text-[12px]">{predio.cheque.numero}</div></Field>
            <Field label="Entidad financiera"><div className="text-[12px]">{predio.cheque.entidad}</div></Field>
            <Field label="Fecha emisión"><div className="text-[12px]">{predio.cheque.emision}</div></Field>
            <Field label="Fecha vencimiento"><div className="text-[12px]">{predio.cheque.vencimiento}</div></Field>
            <Field label="Responsable custodia"><div className="text-[12px]">{predio.cheque.custodio}</div></Field>
            <Field label="Moneda"><div className="text-[12px]">{predio.cheque.moneda}</div></Field>
          </div>
        </>
      )}

      {predio.consignacion && (
        <>
          <SectionTitle>Ficha de consignación</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Field label="Expediente"><div className="text-[12px]">{predio.consignacion.expediente}</div></Field>
            <Field label="Órgano / Entidad"><div className="text-[12px]">{predio.consignacion.entidad}</div></Field>
            <Field label="Constancia"><div className="text-[12px]">{predio.consignacion.constancia}</div></Field>
            <Field label="Fecha"><div className="text-[12px]">{predio.consignacion.fecha}</div></Field>
          </div>
        </>
      )}

      <SectionTitle>Documentos</SectionTitle>
      <div className="space-y-1">
        {predio.actas.map((a) => (
          <div key={a} className="flex items-center justify-between px-3 py-1.5 border rounded text-[12px]">
            <div className="flex items-center gap-2"><FileText size={12} className="text-gray-500" /> {a}</div>
            <div className="flex items-center gap-1">
              <IconBtn onClick={() => {}} title="Ver"><Eye size={11} /> Ver</IconBtn>
              <IconBtn onClick={() => {}} title="Descargar"><Download size={11} /> Descargar</IconBtn>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
        <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50">
          <Printer size={14} /> Imprimir
        </button>
        <button onClick={onClose} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50">
          <X size={14} /> Cerrar
        </button>
      </div>
    </ModalShell>
  );
}

function ChequeModal({ predio, onClose, onSave }: { predio: Predio; onClose: () => void; onSave: (p: Predio) => void }) {
  const [numero, setNumero] = useState(predio.cheque?.numero || "");
  const [entidad, setEntidad] = useState(predio.cheque?.entidad || "Banco de la Nación");
  const [emision, setEmision] = useState(predio.cheque?.emision || "");
  const [venc, setVenc] = useState(predio.cheque?.vencimiento || "");
  const [custodio, setCustodio] = useState(predio.cheque?.custodio || "Tesorería DDP");

  const [expediente, setExpediente] = useState(predio.consignacion?.expediente || "");
  const [entJud, setEntJud] = useState(predio.consignacion?.entidad || "");
  const [constancia, setConstancia] = useState(predio.consignacion?.constancia || "");
  const [fechaCons, setFechaCons] = useState(predio.consignacion?.fecha || "");

  const isCons = predio.forma === "Consignación";

  const save = () => {
    const upd: Predio = { ...predio };
    if (isCons) {
      upd.consignacion = { expediente, entidad: entJud, constancia, fecha: fechaCons };
      if (constancia) upd.estado = "Consignado";
    } else {
      upd.cheque = { numero, entidad, emision, vencimiento: venc, moneda: "PEN", custodio };
      if (numero && upd.estado === "Apto para pago") upd.estado = "Cheque generado";
    }
    onSave(upd);
  };

  return (
    <ModalShell
      title={isCons ? "Registrar consignación" : "Registrar / actualizar cheque"}
      subtitle={`${predio.codigo} · ${predio.sujeto} · ${fmtS(predio.total)}`}
      icon={<Banknote size={16} />}
      onClose={onClose}
    >
      {isCons ? (
        <>
          <SectionTitle>Datos de la consignación</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Field label="Expediente" required>
              <input className={inputCls} value={expediente} onChange={(e) => setExpediente(e.target.value)} />
            </Field>
            <Field label="Órgano / Entidad" required>
              <input className={inputCls} value={entJud} onChange={(e) => setEntJud(e.target.value)} />
            </Field>
            <Field label="N° Constancia" required>
              <input className={inputCls} value={constancia} onChange={(e) => setConstancia(e.target.value)} />
            </Field>
            <Field label="Fecha" required>
              <input type="date" className={inputCls} value={fechaCons} onChange={(e) => setFechaCons(e.target.value)} />
            </Field>
          </div>
        </>
      ) : (
        <>
          <SectionTitle>Ficha del cheque</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Field label="N° de cheque" required>
              <input className={inputCls} value={numero} onChange={(e) => setNumero(e.target.value)} />
            </Field>
            <Field label="Entidad financiera" required>
              <input className={inputCls} value={entidad} onChange={(e) => setEntidad(e.target.value)} />
            </Field>
            <Field label="Fecha emisión" required>
              <input type="date" className={inputCls} value={emision} onChange={(e) => setEmision(e.target.value)} />
            </Field>
            <Field label="Fecha vencimiento">
              <input type="date" className={inputCls} value={venc} onChange={(e) => setVenc(e.target.value)} />
            </Field>
            <Field label="Beneficiario"><div className="text-[12px]">{predio.sujeto}</div></Field>
            <Field label="DNI / RUC"><div className="text-[12px]">{predio.dni}</div></Field>
            <Field label="Monto"><div className="text-[12px] font-medium">{fmtS(predio.total)}</div></Field>
            <Field label="Responsable custodia" required>
              <input className={inputCls} value={custodio} onChange={(e) => setCustodio(e.target.value)} />
            </Field>
          </div>
          <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded mt-3">
            <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="text-[11px] text-amber-900">
              El sistema bloqueará la entrega si el beneficiario, monto o número de cheque no coinciden con la resolución vinculada.
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
        <button onClick={onClose} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50">
          <X size={14} /> Cancelar
        </button>
        <button onClick={save} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded" style={{ background: RED }}>
          <Save size={14} /> Guardar
        </button>
      </div>
    </ModalShell>
  );
}

function ProgramarModal({ predio, onClose, onSave }: { predio: Predio; onClose: () => void; onSave: (p: Predio) => void }) {
  const [fecha, setFecha] = useState(predio.entrega.fecha === "—" ? "" : "");
  const [lugar, setLugar] = useState(predio.entrega.lugar === "—" ? "" : predio.entrega.lugar);
  const [responsable, setResponsable] = useState(predio.entrega.responsable === "—" ? "" : predio.entrega.responsable);
  const [obs, setObs] = useState("");

  const save = () => {
    onSave({
      ...predio,
      entrega: { fecha: fecha || predio.entrega.fecha, lugar, responsable },
      estado: "Entrega programada",
    });
  };

  return (
    <ModalShell
      title="Programar entrega"
      subtitle={`${predio.codigo} · ${predio.sujeto}`}
      icon={<CalendarClock size={16} />}
      onClose={onClose}
    >
      <SectionTitle>Cronograma de entrega</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Fecha programada" required>
          <input type="date" className={inputCls} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </Field>
        <Field label="Lugar de entrega" required>
          <input className={inputCls} value={lugar} onChange={(e) => setLugar(e.target.value)} />
        </Field>
        <Field label="Responsable" required>
          <input className={inputCls} value={responsable} onChange={(e) => setResponsable(e.target.value)} />
        </Field>
        <Field label="Sujeto Pasivo citado"><div className="text-[12px]">{predio.sujeto}</div></Field>
        <Field label="Observaciones" className="col-span-2 items-start">
          <textarea className={inputCls + " h-16 py-1.5"} value={obs} onChange={(e) => setObs(e.target.value)} />
        </Field>
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
        <button onClick={onClose} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50">
          <X size={14} /> Cancelar
        </button>
        <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50">
          <FileText size={14} /> Generar acta
        </button>
        <button onClick={save} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded" style={{ background: RED }}>
          <Send size={14} /> Programar
        </button>
      </div>
    </ModalShell>
  );
}

function EntregaModal({ predio, onClose, onSave }: { predio: Predio; onClose: () => void; onSave: (p: Predio) => void }) {
  const [resultado, setResultado] = useState<"pagado" | "reprogramado" | "no-pagado">("pagado");
  const [motivo, setMotivo] = useState("");
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const save = () => {
    const upd: Predio = { ...predio };
    if (resultado === "pagado") upd.estado = "Pagado";
    if (resultado === "reprogramado") {
      upd.estado = "Entrega reprogramada";
      if (nuevaFecha) upd.entrega = { ...upd.entrega, fecha: nuevaFecha };
    }
    if (resultado === "no-pagado") upd.estado = "No pagado";
    onSave(upd);
  };

  return (
    <ModalShell
      title="Registrar entrega"
      subtitle={`${predio.codigo} · ${predio.entrega.fecha} · ${predio.entrega.lugar}`}
      icon={<ClipboardCheck size={16} />}
      onClose={onClose}
    >
      <SectionTitle>Resultado de la entrega</SectionTitle>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {(
          [
            { v: "pagado", label: "Pagado / Entregado", icon: <CheckCircle2 size={14} /> },
            { v: "reprogramado", label: "Reprogramado", icon: <CalendarClock size={14} /> },
            { v: "no-pagado", label: "No pagado / Imposibilidad", icon: <AlertCircle size={14} /> },
          ] as const
        ).map((o) => (
          <button
            key={o.v}
            onClick={() => setResultado(o.v)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded text-[12px] border ${
              resultado === o.v ? "border-[#dc2626] bg-red-50 text-[#dc2626]" : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            {o.icon} {o.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {resultado === "reprogramado" && (
          <Field label="Nueva fecha" required>
            <input type="date" className={inputCls} value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} />
          </Field>
        )}
        <Field label={resultado === "pagado" ? "Observaciones" : "Motivo"} required={resultado !== "pagado"} className="col-span-2 items-start">
          <textarea className={inputCls + " h-16 py-1.5"} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </Field>
        <Field label="Evidencia / Acta" className="col-span-2">
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] border border-gray-300 rounded cursor-pointer hover:bg-gray-50 w-fit">
            <Paperclip size={14} />
            {file ? file.name : "Adjuntar acta o evidencia"}
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </Field>
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
        <button onClick={onClose} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50">
          <X size={14} /> Cancelar
        </button>
        <button onClick={save} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded" style={{ background: RED }}>
          <Save size={14} /> Registrar
        </button>
      </div>
    </ModalShell>
  );
}

function TrazabilidadModal({
  predio,
  entries,
  onClose,
}: {
  predio: Predio;
  entries: Trazabilidad[];
  onClose: () => void;
}) {
  return (
    <ModalShell
      title="Trazabilidad del predio"
      subtitle={`${predio.codigo} · ${predio.sujeto}`}
      icon={<History size={16} />}
      onClose={onClose}
      size="3xl"
    >
      {entries.length === 0 ? (
        <div className="text-center text-[12px] text-gray-500 py-8">Sin eventos registrados.</div>
      ) : (
        <div className="overflow-auto border rounded">
          <table className="w-full text-[12px]">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-2 py-2 border-b">Fecha / Hora</th>
                <th className="text-left px-2 py-2 border-b">Usuario</th>
                <th className="text-left px-2 py-2 border-b">Acción</th>
                <th className="text-left px-2 py-2 border-b">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-1.5 whitespace-nowrap">{e.fecha}</td>
                  <td className="px-2 py-1.5">{e.usuario}</td>
                  <td className="px-2 py-1.5 font-medium">{e.accion}</td>
                  <td className="px-2 py-1.5 text-gray-600">{e.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-end mt-4 pt-3 border-t">
        <button onClick={onClose} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50">
          <X size={14} /> Cerrar
        </button>
      </div>
    </ModalShell>
  );
}
