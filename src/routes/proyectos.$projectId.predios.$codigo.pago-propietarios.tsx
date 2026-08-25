import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Mail,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo, predioRows, type PredioRow } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/pago-propietarios")({
  head: () => ({
    meta: [
      { title: "Solicitud de pago" },
      { name: "description", content: "Registro de número de solicitud, propietario, monto, fecha, trazabilidad y envío a Administración/Tesorería." },
    ],
  }),
  component: PagoPropietariosPage,
});

const RED = "#dc2626";
const inputCls = "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";

type DetailRow = {
  codigo: string;
  cod: string;
  propietario: string;
  documento: string;
  ubicacion: string;
  expediente: string;
  valorTasacion: number;
  montoSolicitado: number;
  observacion: string;
};

type TraceRow = {
  fecha: string;
  usuario: string;
  estadoAnterior: string;
  estadoNuevo: string;
  comentario: string;
};

type SentRequest = {
  numero: string;
  fecha: string;
  solicitante: string;
  cantidadPredios: number;
  total: number;
  estado: "ENVIADA" | "PENDIENTE DE ATENCION" | "OBSERVADA" | "ATENDIDA" | "DERIVADA";
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b pb-1 mb-3 mt-4 first:mt-0">
      <h3 className="text-[13px] font-semibold" style={{ color: RED }}>{children}</h3>
    </div>
  );
}

function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-[180px_1fr] items-center gap-2 ${className}`}>
      <label className="text-[12px] text-right text-gray-700">
        {required && <span style={{ color: RED }}>* </span>}{label}
      </label>
      {children}
    </div>
  );
}

function parseMoney(value?: string) {
  const normalized = String(value ?? "").replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 });
}

function hasTasacion(row: PredioRow) {
  return parseMoney(row.valor) > 0;
}

function toDetailRow(row: PredioRow): DetailRow {
  const valor = parseMoney(row.valor);
  return {
    codigo: row.codigo,
    cod: row.cod || row.codigo,
    propietario: row.suj || "Sin informacion",
    documento: row.ruc || row.dni || row.doc || row.part || "No registrado",
    ubicacion: [row.ciudad, row.proyecto].filter(Boolean).join(" / ") || "Sin ubicacion",
    expediente: row.exp || "Sin expediente",
    valorTasacion: valor,
    montoSolicitado: valor,
    observacion: "",
  };
}

function PagoPropietariosPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const selectedPredio = getPredioByCodigo(decodedCodigo);
  const today = new Date().toISOString().slice(0, 10);
  const requestNumber = useMemo(() => `SPP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`, []);
  const [activeTab, setActiveTab] = useState<"solicitud" | "bandeja">("solicitud");
  const [form, setForm] = useState({
    fecha: today,
    numero: requestNumber,
    solicitante: "Coordinador Predial",
    areaSolicitante: "Gestion predial",
    destinatario: "Tesoreria DDP",
    correoSolicitante: "coordinador.predial@mtc.gob.pe",
    observacion: "",
    estado: "PENDIENTE DE ATENCION",
    simulateEmailFail: false,
  });
  const [details, setDetails] = useState<DetailRow[]>(() => (selectedPredio && hasTasacion(selectedPredio) ? [toDetailRow(selectedPredio)] : []));
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "warning" | "error"; text: string } | null>(
    selectedPredio && !hasTasacion(selectedPredio)
      ? { type: "warning", text: "El predio seleccionado no fue agregado porque no cuenta con tasacion registrada o valor disponible." }
      : null,
  );
  const [trace, setTrace] = useState<TraceRow[]>([
    {
      fecha: new Date().toLocaleString("es-PE", { hour12: false }),
      usuario: "Sistema",
      estadoAnterior: "-",
      estadoNuevo: "BORRADOR",
      comentario: "Solicitud inicial creada",
    },
  ]);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([
    {
      numero: "SPP-2026-000184",
      fecha: "2026-07-01",
      solicitante: "Coordinador Predial",
      cantidadPredios: 3,
      total: 428500,
      estado: "PENDIENTE DE ATENCION",
    },
  ]);

  const eligibleRows = useMemo(() => predioRows.filter(hasTasacion), []);
  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return eligibleRows.slice(0, 12);
    return eligibleRows
      .filter((row) => {
        const haystack = [row.cod, row.codigo, row.suj, row.ruc, row.dni, row.doc, row.ciudad, row.proyecto, row.exp]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      })
      .slice(0, 12);
  }, [eligibleRows, query]);

  const totalSolicitado = details.reduce((sum, row) => sum + row.montoSolicitado, 0);
  const hasOverBudgetWithoutObservation = details.some((row) => row.montoSolicitado > row.valorTasacion && !row.observacion.trim());

  function addPredio(row: PredioRow) {
    if (!hasTasacion(row)) {
      setMessage({ type: "error", text: "El predio no puede agregarse porque no cuenta con tasacion registrada." });
      return;
    }
    if (details.some((item) => item.codigo === row.codigo)) {
      setMessage({ type: "warning", text: "El predio ya se encuentra agregado en el detalle de la solicitud." });
      return;
    }
    setDetails((items) => [...items, toDetailRow(row)]);
    setQuery("");
    setMessage(null);
  }

  function updateDetail(codigoPredio: string, patch: Partial<DetailRow>) {
    setDetails((items) => items.map((item) => (item.codigo === codigoPredio ? { ...item, ...patch } : item)));
  }

  function removeDetail(codigoPredio: string) {
    setDetails((items) => items.filter((item) => item.codigo !== codigoPredio));
  }

  function sendRequest() {
    if (details.length === 0) {
      setMessage({ type: "error", text: "Debe agregar al menos un predio con tasacion registrada." });
      return;
    }
    if (details.some((row) => row.valorTasacion <= 0)) {
      setMessage({ type: "error", text: "Todos los predios deben tener valor de tasacion disponible." });
      return;
    }
    if (!form.destinatario.trim()) {
      setMessage({ type: "error", text: "Debe seleccionar un destinatario de Administracion/Tesoreria." });
      return;
    }
    if (hasOverBudgetWithoutObservation) {
      setMessage({ type: "error", text: "Existe un monto solicitado mayor al valor de tasacion. Registre una observacion por predio para justificarlo." });
      return;
    }

    const estadoNuevo = form.estado === "ENVIADA" ? "ENVIADA" : "PENDIENTE DE ATENCION";
    setForm((current) => ({ ...current, estado: estadoNuevo }));
    setTrace((items) => [
      {
        fecha: new Date().toLocaleString("es-PE", { hour12: false }),
        usuario: form.solicitante,
        estadoAnterior: "BORRADOR",
        estadoNuevo,
        comentario: `Solicitud enviada a ${form.destinatario}. Notificacion interna registrada.`,
      },
      {
        fecha: new Date().toLocaleString("es-PE", { hour12: false }),
        usuario: "Sistema de notificaciones",
        estadoAnterior: estadoNuevo,
        estadoNuevo,
        comentario: form.simulateEmailFail
          ? "Solicitud registrada. El envio de correo fallo y queda pendiente de reintento."
          : "Correos enviados al coordinador, jefe de brigada, Tesoreria/Administracion y copia al solicitante.",
      },
      ...items,
    ]);
    setSentRequests((items) => [
      {
        numero: form.numero,
        fecha: form.fecha,
        solicitante: form.solicitante,
        cantidadPredios: details.length,
        total: totalSolicitado,
        estado: estadoNuevo as SentRequest["estado"],
      },
      ...items.filter((item) => item.numero !== form.numero),
    ]);
    setMessage({
      type: form.simulateEmailFail ? "warning" : "success",
      text: form.simulateEmailFail
        ? "La solicitud fue creada y se encuentra en la bandeja de Administracion/Tesoreria, pero el correo no pudo enviarse. Se registro una alerta para reintento."
        : "La solicitud de pago a propietarios fue enviada correctamente. Tambien se ha remitido la notificacion por correo electronico y la solicitud se encuentra en la bandeja de Administracion/Tesoreria para su atencion.",
    });
    setActiveTab("bandeja");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={proyecto?.nombre ?? projectId}
        title="Solicitud de pago"
        badgeLabel="Predio"
        badgeValue={selectedPredio?.cod || decodedCodigo}
        badgeSuffix="Etapa III · 4.2"
        right={<span className="rounded-full bg-[#f0fdf4] px-2 py-1 text-[11px] font-semibold text-[#166534]">{form.estado}</span>}
      />

      <main className="mx-auto max-w-[1500px] p-4">
        <div className="bg-white rounded border">
          <div className="px-5 py-5">
            <div className="border-b mb-3 flex gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("solicitud")}
                className="px-3 py-1.5 text-[12px] font-medium border-b-2"
                style={{ borderColor: activeTab === "solicitud" ? RED : "transparent", color: activeTab === "solicitud" ? RED : "#6b7280" }}
              >
                4.2 Solicitud de pago
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("bandeja")}
                className="px-3 py-1.5 text-[12px] font-medium border-b-2"
                style={{ borderColor: activeTab === "bandeja" ? RED : "transparent", color: activeTab === "bandeja" ? RED : "#6b7280" }}
              >
                Bandeja Administracion/Tesoreria
              </button>
            </div>

            {message && <MessageBanner type={message.type} text={message.text} />}

            {activeTab === "solicitud" ? (
              <form>
                <SectionTitle>Datos principales de la solicitud</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Fecha de solicitud"><input type="date" className={inputCls} value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></Field>
                  <Field label="Nro. solicitud"><input className={inputCls} value={form.numero} readOnly /></Field>
                  <Field label="Usuario solicitante"><input className={inputCls} value={form.solicitante} onChange={(e) => setForm({ ...form, solicitante: e.target.value })} /></Field>
                  <Field label="Area solicitante"><select className={selectCls} value={form.areaSolicitante} onChange={(e) => setForm({ ...form, areaSolicitante: e.target.value })}><option>Gestion predial</option><option>Coordinacion predial</option><option>Brigada de campo</option></select></Field>
                  <Field label="Destinatario" required><select className={selectCls} value={form.destinatario} onChange={(e) => setForm({ ...form, destinatario: e.target.value })}><option value="">-- SELECCIONE --</option><option>Tesoreria DDP</option><option>Administracion DDP</option><option>Administracion/Tesoreria</option></select></Field>
                  <Field label="Estado inicial"><select className={selectCls} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}><option>ENVIADA</option><option>PENDIENTE DE ATENCION</option></select></Field>
                  <Field label="Correo solicitante"><input className={inputCls} value={form.correoSolicitante} onChange={(e) => setForm({ ...form, correoSolicitante: e.target.value })} /></Field>
                  <Field label="Prueba correo"><label className="flex items-center gap-2 text-[12px]"><input type="checkbox" checked={form.simulateEmailFail} onChange={(e) => setForm({ ...form, simulateEmailFail: e.target.checked })} className="accent-[#dc2626]" /> Simular falla de envio</label></Field>
                  <Field label="Observaciones / sustento" className="col-span-2"><textarea className="w-full rounded border border-gray-300 p-2 text-[12px]" rows={2} value={form.observacion} onChange={(e) => setForm({ ...form, observacion: e.target.value })} /></Field>
                </div>

                <SectionTitle>Agregar predios tasados</SectionTitle>
                <div className="relative mb-3 max-w-[760px]">
                  <Search size={14} className="absolute left-2 top-2 text-[#9ca3af]" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por codigo, propietario, documento, ubicacion o expediente"
                    className="h-8 w-full rounded border border-gray-300 pl-8 pr-2 text-[12px] focus:outline-none focus:border-gray-500"
                  />
                  {query && (
                    <div className="absolute z-40 mt-1 max-h-[270px] w-full overflow-auto rounded border bg-white shadow-lg">
                      {filteredRows.map((row) => {
                        const already = details.some((item) => item.codigo === row.codigo);
                        return (
                          <button
                            type="button"
                            key={row.rowId}
                            onClick={() => addPredio(row)}
                            disabled={already}
                            className="flex w-full items-center justify-between gap-3 border-b px-3 py-2 text-left text-[12px] hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-mono text-[#dc2626]">{row.cod || row.codigo}</span>
                              <span className="block truncate text-[11px] text-[#6b7280]">{row.suj} / {row.exp || "Sin expediente"}</span>
                            </span>
                            <span className="shrink-0 font-medium">{formatMoney(parseMoney(row.valor))}</span>
                          </button>
                        );
                      })}
                      {filteredRows.length === 0 && <div className="px-3 py-4 text-center text-[12px] text-[#9ca3af]">Sin predios tasados disponibles</div>}
                    </div>
                  )}
                </div>

                <SectionTitle>Tabla detalle de predios</SectionTitle>
                <DetailTable rows={details} onUpdate={updateDetail} onRemove={removeDetail} />

                <div className="mt-3 flex justify-end">
                  <div className="rounded border border-[#fecaca] bg-[#fef2f2] px-4 py-2 text-right">
                    <div className="text-[11px] text-[#991b1b]">Valor total solicitado</div>
                    <div className="text-[18px] font-semibold text-[#dc2626]">{formatMoney(totalSolicitado)}</div>
                  </div>
                </div>

                <SectionTitle>Trazabilidad y notificaciones</SectionTitle>
                <TraceTable rows={trace} />

                <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
                  <button type="button" className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50">
                    <X size={14} /> Cancelar
                  </button>
                  <button type="button" className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50">
                    <Save size={14} /> Guardar borrador
                  </button>
                  <button type="button" onClick={sendRequest} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded" style={{ background: RED }}>
                    <Send size={14} /> Enviar solicitud
                  </button>
                </div>
              </form>
            ) : (
              <TreasuryInbox requests={sentRequests} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function MessageBanner({ type, text }: { type: "success" | "warning" | "error"; text: string }) {
  const style =
    type === "success"
      ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
      : type === "warning"
        ? "border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]"
        : "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]";
  const Icon = type === "success" ? CheckCircle2 : AlertTriangle;
  return (
    <div className={`mb-3 flex items-start gap-2 rounded border px-3 py-2 text-[12px] ${style}`}>
      <Icon size={15} className="mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function DetailTable({ rows, onUpdate, onRemove }: { rows: DetailRow[]; onUpdate: (codigo: string, patch: Partial<DetailRow>) => void; onRemove: (codigo: string) => void }) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full text-[12px]">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-2 py-1.5 border-b">Codigo</th>
            <th className="px-2 py-1.5 border-b">Propietario / sujeto pasivo</th>
            <th className="px-2 py-1.5 border-b">DNI/RUC</th>
            <th className="px-2 py-1.5 border-b">Ubicacion</th>
            <th className="px-2 py-1.5 border-b text-right">Valor tasacion</th>
            <th className="px-2 py-1.5 border-b text-right">Monto solicitado</th>
            <th className="px-2 py-1.5 border-b">Observacion</th>
            <th className="px-2 py-1.5 border-b w-12">Quitar</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const overBudget = row.montoSolicitado > row.valorTasacion;
            return (
              <tr key={row.codigo} className={overBudget && !row.observacion.trim() ? "bg-[#fff7ed]" : "hover:bg-gray-50"}>
                <td className="px-2 py-1.5 border-b font-mono text-[#dc2626]">{row.cod}</td>
                <td className="px-2 py-1.5 border-b min-w-[220px]">{row.propietario}</td>
                <td className="px-2 py-1.5 border-b">{row.documento}</td>
                <td className="px-2 py-1.5 border-b min-w-[180px]">{row.ubicacion}</td>
                <td className="px-2 py-1.5 border-b text-right font-medium">{formatMoney(row.valorTasacion)}</td>
                <td className="px-2 py-1.5 border-b">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.montoSolicitado}
                    onChange={(e) => onUpdate(row.codigo, { montoSolicitado: Number(e.target.value) || 0 })}
                    className="h-8 w-[135px] rounded border border-gray-300 px-2 text-right text-[12px] focus:outline-none focus:border-gray-500"
                  />
                </td>
                <td className="px-2 py-1.5 border-b min-w-[240px]">
                  <input
                    value={row.observacion}
                    onChange={(e) => onUpdate(row.codigo, { observacion: e.target.value })}
                    placeholder={overBudget ? "Obligatorio por superar tasacion" : "Observacion por predio"}
                    className={`h-8 w-full rounded border px-2 text-[12px] focus:outline-none focus:border-gray-500 ${overBudget && !row.observacion.trim() ? "border-[#f97316]" : "border-gray-300"}`}
                  />
                </td>
                <td className="px-2 py-1.5 border-b text-center">
                  <button type="button" onClick={() => onRemove(row.codigo)} className="inline-flex size-7 items-center justify-center rounded border border-gray-300 text-[#dc2626] hover:bg-[#fef2f2]" aria-label="Quitar predio">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="px-3 py-8 text-center text-[#9ca3af]">Sin predios agregados</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TraceTable({ rows }: { rows: TraceRow[] }) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full text-[12px]">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-2 py-1.5 border-b">Fecha</th>
            <th className="px-2 py-1.5 border-b">Usuario</th>
            <th className="px-2 py-1.5 border-b">Estado anterior</th>
            <th className="px-2 py-1.5 border-b">Estado nuevo</th>
            <th className="px-2 py-1.5 border-b">Comentario</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.fecha}-${index}`} className="hover:bg-gray-50">
              <td className="px-2 py-1.5 border-b">{row.fecha}</td>
              <td className="px-2 py-1.5 border-b">{row.usuario}</td>
              <td className="px-2 py-1.5 border-b">{row.estadoAnterior}</td>
              <td className="px-2 py-1.5 border-b font-semibold text-[#dc2626]">{row.estadoNuevo}</td>
              <td className="px-2 py-1.5 border-b">{row.comentario}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TreasuryInbox({ requests }: { requests: SentRequest[] }) {
  return (
    <div>
      <SectionTitle>Bandeja de atencion Administracion/Tesoreria</SectionTitle>
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-[12px]">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-2 py-1.5 border-b">Nro. solicitud</th>
              <th className="px-2 py-1.5 border-b">Fecha</th>
              <th className="px-2 py-1.5 border-b">Solicitante</th>
              <th className="px-2 py-1.5 border-b text-center">Predios</th>
              <th className="px-2 py-1.5 border-b text-right">Monto total</th>
              <th className="px-2 py-1.5 border-b">Estado</th>
              <th className="px-2 py-1.5 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.numero} className="hover:bg-gray-50">
                <td className="px-2 py-1.5 border-b font-mono text-[#dc2626]">{request.numero}</td>
                <td className="px-2 py-1.5 border-b">{request.fecha}</td>
                <td className="px-2 py-1.5 border-b">{request.solicitante}</td>
                <td className="px-2 py-1.5 border-b text-center">{request.cantidadPredios}</td>
                <td className="px-2 py-1.5 border-b text-right font-medium">{formatMoney(request.total)}</td>
                <td className="px-2 py-1.5 border-b"><span className="rounded-full bg-[#fef3c7] px-2 py-0.5 text-[11px] text-[#92400e]">{request.estado}</span></td>
                <td className="px-2 py-1.5 border-b">
                  <div className="flex flex-wrap gap-1">
                    <button type="button" className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-50"><Eye size={12} /> Ver</button>
                    <button type="button" className="inline-flex items-center gap-1 rounded border border-[#bbf7d0] px-2 py-1 text-[11px] text-[#166534] hover:bg-[#f0fdf4]"><CheckCircle2 size={12} /> Atender</button>
                    <button type="button" className="inline-flex items-center gap-1 rounded border border-[#fed7aa] px-2 py-1 text-[11px] text-[#9a3412] hover:bg-[#fff7ed]"><AlertTriangle size={12} /> Observar</button>
                    <button type="button" className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-50"><Mail size={12} /> Derivar</button>
                  </div>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-[#9ca3af]">Sin solicitudes pendientes</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
