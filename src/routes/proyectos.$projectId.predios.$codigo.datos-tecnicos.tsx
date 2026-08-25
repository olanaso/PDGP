import { useState } from "react";
import type { ComponentType } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  Plus, Pencil, Trash2, X, Upload, FileSpreadsheet, Save, Download, CheckCircle2,
  FileText, Compass, Crop, Ruler, Home, Hammer, Wrench, Apple, Trees,
  Sprout, Fence, AlertTriangle, MapPinned,
} from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";



export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/datos-tecnicos")({
  head: () => ({
    meta: [
      { title: "Tasación / ITT" },
      {
        name: "description",
        content:
          "Generación del borrador, registro de peritos y versionado del Informe Técnico de Tasación.",
      },
    ],
  }),
  component: DatosTecnicosPage,
});

const RED = "#dc2626";
const TABS: { name: string; icon: ComponentType<{ size?: number }> }[] = [
  { name: "Padrón", icon: FileText },
  { name: "Colindancia matriz", icon: Compass },
  { name: "Area afectada", icon: Crop },
  { name: "Cuadro de datos técnicos", icon: Ruler },
  { name: "Datos de la vivienda", icon: Home },
  { name: "Obras complementarias", icon: Hammer },
  { name: "Inst. Fijas Permanentes", icon: Wrench },
  { name: "Plantaciones frutales", icon: Apple },
  { name: "Plantaciones forestales", icon: Trees },
  { name: "Plantaciones transitorias", icon: Sprout },
  { name: "Cerco vivo", icon: Fence },
  { name: "Daño emergente", icon: AlertTriangle },
  { name: "Descripción del Entorno", icon: MapPinned },
] as const;
type Tab = (typeof TABS)[number]["name"];

type IttFileRow = {
  id: string;
  version: string;
  archivo: string;
  fecha: string;
  usuario: string;
  estado: string;
};


const inputCls = "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";

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
        {required && <span style={{ color: RED }}>* </span>}{label}
      </label>
      {children}
    </div>
  );
}

function AddButton({ onClick, label = "Añadir" }: { onClick?: () => void; label?: string }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] text-white rounded" style={{ background: "#5eaaa8" }}>
      <Plus size={14} /> {label}
    </button>
  );
}

function TasacionPeritoPanel({ codigo }: { codigo: string }) {
  const predio = getPredioByCodigo(codigo);
  const [peritoNombre, setPeritoNombre] = useState("");
  const [peritoDni, setPeritoDni] = useState("");
  const [peritoSupervisor, setPeritoSupervisor] = useState("");
  const [fechaItt, setFechaItt] = useState(new Date().toISOString().slice(0, 10));
  const [valorTasacion, setValorTasacion] = useState(predio?.valor || "");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<IttFileRow[]>([]);

  function handleGenerateIttDraft() {
    const fileName = `borrador_itt_${(predio?.cod || codigo).replace(/[^A-Z0-9-]/gi, "_")}.doc`;
    downloadBlobFile(
      fileName,
      createIttDraftWordBlob({
        codigo: predio?.cod || codigo,
        sujeto: predio?.suj || "Sin informacion",
        area: predio?.area || predio?.m2 || "Sin informacion",
        valorTasacion,
        peritoNombre,
        peritoDni,
        peritoSupervisor,
        fechaItt,
      }),
    );
    setMessage("Borrador del Informe Tecnico de Tasacion (ITT) generado para descarga.");
  }

  function handleUploadItt(file: File | null) {
    if (!file) return;
    const row: IttFileRow = {
      id: `itt-${Date.now()}`,
      version: `v${files.length + 1}`,
      archivo: file.name,
      fecha: new Date().toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      usuario: peritoNombre || "Perito tasador",
      estado: "Firmado / culminado",
    };
    setFiles((current) => [row, ...current]);
    setMessage(`ITT firmado subido correctamente como ${row.version}.`);
  }

  return (
    <div className="bg-white rounded border p-5 mb-3">
      <div className="border-b pb-1 mb-3">
        <h3 className="text-[13px] font-semibold" style={{ color: RED }}>Tasacion - Informe Tecnico de Tasacion (ITT)</h3>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Perito tasador" required>
          <input className={inputCls} value={peritoNombre} onChange={(event) => setPeritoNombre(event.target.value)} placeholder="Nombre completo del perito" />
        </Field>
        <Field label="DNI del perito" required>
          <input className={inputCls} value={peritoDni} onChange={(event) => setPeritoDni(event.target.value)} placeholder="DNI" />
        </Field>
        <Field label="Perito supervisor" required>
          <input className={inputCls} value={peritoSupervisor} onChange={(event) => setPeritoSupervisor(event.target.value)} placeholder="Nombre completo del supervisor" />
        </Field>
        <Field label="Fecha del ITT" required>
          <input className={inputCls} type="date" value={fechaItt} onChange={(event) => setFechaItt(event.target.value)} />
        </Field>
        <Field label="Valor de tasacion">
          <input className={inputCls} value={valorTasacion} onChange={(event) => setValorTasacion(event.target.value)} placeholder="S/ 0.00" />
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGenerateIttDraft}
          className="flex min-h-[94px] items-center gap-3 rounded border-2 border-[#dc2626] bg-white p-3 text-left shadow-sm hover:bg-[#fef2f2]"
        >
          <span className="flex size-10 items-center justify-center rounded bg-[#dc2626] text-white">
            <Download size={19} />
          </span>
          <span>
            <span className="block text-[13px] font-semibold text-gray-900">Generar borrador ITT</span>
            <span className="block text-[11px] text-gray-500">Descarga Word editable para revision del tasador</span>
          </span>
        </button>

        <label className="flex min-h-[94px] cursor-pointer items-center gap-3 rounded border-2 border-dashed border-[#dc2626] bg-[#fffafa] p-3 text-left shadow-sm hover:bg-[#fef2f2]">
          <span className="flex size-10 items-center justify-center rounded bg-white text-[#dc2626] ring-1 ring-[#fecaca]">
            <Upload size={19} />
          </span>
          <span>
            <span className="block text-[13px] font-semibold text-gray-900">Subir ITT firmado / culminado</span>
            <span className="block text-[11px] text-gray-500">Word final firmado o completado por el tasador</span>
          </span>
          <input
            type="file"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(event) => {
              handleUploadItt(event.target.files?.[0] ?? null);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      {message && (
        <div className="mt-3 flex items-start gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-[12px] text-green-900">
          <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded border border-gray-200">
        <table className="w-full text-[11px]">
          <thead className="bg-gray-50 text-left text-gray-700">
            <tr>
              <th className="px-2 py-2 font-semibold">Version</th>
              <th className="px-2 py-2 font-semibold">Archivo ITT</th>
              <th className="px-2 py-2 font-semibold">Fecha</th>
              <th className="px-2 py-2 font-semibold">Usuario / tasador</th>
              <th className="px-2 py-2 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id} className="border-t border-gray-100">
                <td className="px-2 py-1.5 font-semibold text-[#dc2626]">{file.version}</td>
                <td className="px-2 py-1.5 font-mono">{file.archivo}</td>
                <td className="px-2 py-1.5">{file.fecha}</td>
                <td className="px-2 py-1.5">{file.usuario}</td>
                <td className="px-2 py-1.5">{file.estado}</td>
              </tr>
            ))}
            {!files.length && (
              <tr>
                <td colSpan={5} className="px-3 py-5 text-center text-gray-400">
                  Sin ITT firmado cargado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyTable({ headers }: { headers: string[] }) {
  return (
    <div className="overflow-x-auto border rounded">
      <table className="w-full text-[12px]">
        <thead className="bg-gray-50">
          <tr className="text-left">
            {headers.map((h) => (
              <th key={h} className="px-2 py-1.5 border-b font-medium text-gray-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr><td colSpan={headers.length} className="px-2 py-6 text-center text-gray-400">Sin registros</td></tr>
        </tbody>
      </table>
    </div>
  );
}

function ExpedienteHeader({ codigo }: { codigo: string }) {
  return (
    <>
      <SectionTitle>Datos de expediente</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Código del Predio"><input className={inputCls} defaultValue={codigo} readOnly /></Field>
        <Field label="Código Expediente"><input className={inputCls} defaultValue="3546-2023-MTC/DDP" readOnly /></Field>
      </div>
    </>
  );
}

function PadronTab({ codigo }: { codigo: string }) {
  return (
    <div>
      <div className="text-[12px] mb-2" style={{ color: RED }}>Formulario no guardado</div>
      <SectionTitle>Datos de expediente</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Código del Predio"><input className={inputCls} defaultValue={codigo} /></Field>
        <Field label="Código Expediente"><input className={inputCls} defaultValue="3546-2023-MTC/DDP" /></Field>
        <Field label="Profesional Técnico Responsable" required><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Mes Elaboración Exp."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Estado del Predio."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Tipo de Tasación."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Tipo Periodo Tasación."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Fecha de Inspección de Campo."><input type="date" className={inputCls} /></Field>
      </div>

      <SectionTitle>Ubicación</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Tipo de Predio."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Zonificación."><input className={inputCls} /></Field>
        <Field label="Cond. Rústico."><select className={selectCls + " bg-gray-100"}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Norma que Aprueba."><input className={inputCls} /></Field>
        <Field label="Uso."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Comunidad Campesina."><input className={inputCls} /></Field>
        <Field label="Denominación."><input className={inputCls} /></Field>
        <Field label="Sector."><input className={inputCls} /></Field>
        <Field label="Manzana."><input className={inputCls} /></Field>
        <Field label="UC."><input className={inputCls} /></Field>
        <Field label="Lote."><input className={inputCls} /></Field>
        <Field label="Vía."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Nombre de Vía."><input className={inputCls} /></Field>
        <Field label="No Municipal."><input className={inputCls} /></Field>
        <Field label="Interior."><input className={inputCls} /></Field>
        <Field label="Progresiva inicial."><input className={inputCls} /></Field>
        <Field label="Lado."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Progresiva final."><input className={inputCls} /></Field>
      </div>

      <SectionTitle>Topografía</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Topografía."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Accesibilidad."><input className={inputCls} /></Field>
        <Field label="Pistas veredas."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Alumbrado público."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Instalaciones gas."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Alcantarillado."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Agua potable."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
      </div>

      <SectionTitle> </SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Área Gráfica Matriz. (M²)"><input className={inputCls} /></Field>
        <Field label="Área Registral Matriz. (M²)"><input className={inputCls} /></Field>
        <Field label="Partida electronica para cbc."><input className={inputCls} /></Field>
        <Field label="Profesional elaboro cbc."><input className={inputCls} /></Field>
      </div>

      <SectionTitle>Observaciones técnicas</SectionTitle>
      <textarea className="w-full border border-gray-300 rounded p-2 text-[12px]" rows={2} placeholder="Ingrese la observación" />

      <SectionTitle>Datos de los planos</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Profesional Técnico Responsable de Firmar Planos."><input className={inputCls} /></Field>
        <Field label="Datum de los Planos."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Fecha Elaboración Plano Diagnóstico."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Código plano diagnóstico."><input className={inputCls} /></Field>
        <Field label="Fecha de Elaboración del Plano de Ubicación."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Código plano ubicación."><input className={inputCls} /></Field>
        <Field label="Fecha de Elaboración del Plano Perimétrico."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Código plano perimétrico."><input className={inputCls} /></Field>
        <Field label="Fecha de Elaboración del Plano de Afectación."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Código plano afectación."><input className={inputCls} /></Field>
        <Field label="Fecha de Elaboración del Plano de Distribución."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Código plano distribución."><input className={inputCls} /></Field>
        <Field label="Fecha de Elaboración del Plano de Arquitectura."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
        <Field label="Código plano arquitectura."><input className={inputCls} /></Field>
        <Field label="Firma del Plano de Arquitectura."><input className={inputCls} /></Field>
      </div>

      <SectionTitle>Datos Memoria descriptiva</SectionTitle>
      <div className="grid grid-cols-1 gap-y-2">
        <Field label="Fecha de Emisión."><input type="date" className={inputCls} /></Field>
      </div>
    </div>
  );
}

function ColindanciaMatrizTab({ codigo }: { codigo: string }) {
  return (
    <div>
      <ExpedienteHeader codigo={codigo} />
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

type AreaRow = {
  cod: string;
  uso: string;
  directa: number;
  indirecta: number;
  total: number;
  fecha: string;
  planoCbc: string;
};

function AreaTable({ rows, onDelete }: { rows: AreaRow[]; onDelete: (i: number) => void }) {
  return (
    <div className="overflow-x-auto border rounded">
      <table className="w-full text-[12px]">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="px-2 py-1.5 border-b w-10">#</th>
            <th className="px-2 py-1.5 border-b">Cód. polígono</th>
            <th className="px-2 py-1.5 border-b">Uso DT</th>
            <th className="px-2 py-1.5 border-b">Área directa (m²)</th>
            <th className="px-2 py-1.5 border-b">Área indirecta (m²)</th>
            <th className="px-2 py-1.5 border-b">Área total (m²)</th>
            <th className="px-2 py-1.5 border-b">Fecha de elaboración del plano CBC</th>
            <th className="px-2 py-1.5 border-b">Código del plano CBC</th>
            <th className="px-2 py-1.5 border-b w-20">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={9} className="px-2 py-6 text-center text-gray-400">Sin registros</td></tr>
          ) : rows.map((r, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-2 py-1.5 border-b">{i + 1}</td>
              <td className="px-2 py-1.5 border-b">{r.cod}</td>
              <td className="px-2 py-1.5 border-b">{r.uso}</td>
              <td className="px-2 py-1.5 border-b">{r.directa}</td>
              <td className="px-2 py-1.5 border-b">{r.indirecta}</td>
              <td className="px-2 py-1.5 border-b">{r.total}</td>
              <td className="px-2 py-1.5 border-b">{r.fecha}</td>
              <td className="px-2 py-1.5 border-b">{r.planoCbc}</td>
              <td className="px-2 py-1.5 border-b">
                <div className="flex gap-1">
                  <button className="p-1 border rounded text-blue-600"><Pencil size={12} /></button>
                  <button className="p-1 border rounded" style={{ color: RED }} onClick={() => onDelete(i)}><Trash2 size={12} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AddAreaModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (r: AreaRow) => void }) {
  const [form, setForm] = useState<AreaRow>({ cod: "", uso: "AFECTADA", directa: 0, indirecta: 0, total: 0, fecha: "", planoCbc: "" });
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-lg w-[460px] p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-[14px] font-medium">Agregar</div>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <div className="space-y-2">
          <Field label="Uso DT" required>
            <select className={selectCls} value={form.uso} onChange={(e) => setForm({ ...form, uso: e.target.value })}>
              <option>AFECTADA</option><option>MATRIZ</option><option>REMANENTE</option>
            </select>
          </Field>
          <Field label="Área directa m²" required>
            <input type="number" className={inputCls} value={form.directa} onChange={(e) => { const v = Number(e.target.value); setForm({ ...form, directa: v, total: v + form.indirecta }); }} />
          </Field>
          <Field label="Área indirecta m²">
            <input type="number" className={inputCls} value={form.indirecta} onChange={(e) => { const v = Number(e.target.value); setForm({ ...form, indirecta: v, total: form.directa + v }); }} />
          </Field>
          <Field label="Área Total M²" required><input type="number" className={inputCls} value={form.total} readOnly /></Field>
          <Field label="Fech. Elab. Plano CBC" required>
            <select className={selectCls} value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })}>
              <option value="">-- SELECCIONE --</option><option>ENERO 2025</option><option>FEBRERO 2025</option><option>MARZO 2025</option>
            </select>
          </Field>
          <Field label="código Plano Cbc"><input className={inputCls} value={form.planoCbc} onChange={(e) => setForm({ ...form, planoCbc: e.target.value })} /></Field>
          <Field label="Foto Panorámico"><input type="file" className="text-[11px]" /></Field>
          <Field label="Foto Frontal"><input type="file" className="text-[11px]" /></Field>
          <Field label="Foto Lado Izquierdo"><input type="file" className="text-[11px]" /></Field>
          <Field label="Foto Lado Derecha"><input type="file" className="text-[11px]" /></Field>
          <Field label="Foto Fondo"><input type="file" className="text-[11px]" /></Field>
        </div>
        <div className="flex justify-center gap-2 mt-5">
          <button onClick={() => { onAdd({ ...form, cod: form.cod || "KFRE" }); onClose(); }} className="inline-flex items-center gap-1.5 px-6 py-1.5 text-[12px] text-white rounded" style={{ background: RED }}><Plus size={14} /> Agregar</button>
          <button onClick={onClose} className="inline-flex items-center gap-1.5 px-6 py-1.5 text-[12px] border rounded"><X size={14} /> Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function AreaAfectadaTab({ codigo }: { codigo: string }) {
  const [matriz, setMatriz] = useState<AreaRow[]>([]);
  const [afectadas, setAfectadas] = useState<AreaRow[]>([
    { cod: "KFRE", uso: "AFECTADA", directa: 150, indirecta: 0, total: 150, fecha: "FEBRERO 2025", planoCbc: "PTKT-0001" },
  ]);
  const [remanentes, setRemanentes] = useState<AreaRow[]>([]);
  const [modal, setModal] = useState<null | "matriz" | "afectadas" | "remanentes">(null);

  const totalDirecta = afectadas.reduce((s, r) => s + r.directa, 0);
  const totalIndirecta = afectadas.reduce((s, r) => s + r.indirecta, 0);
  const totalAreas = afectadas.reduce((s, r) => s + r.total, 0);

  return (
    <div>
      <ExpedienteHeader codigo={codigo} />

      <SectionTitle>Área matriz</SectionTitle>
      <div className="mb-2"><AddButton onClick={() => setModal("matriz")} /></div>
      <AreaTable rows={matriz} onDelete={(i) => setMatriz(matriz.filter((_, idx) => idx !== i))} />

      <SectionTitle>Listado de áreas afectadas</SectionTitle>
      <div className="mb-2"><AddButton onClick={() => setModal("afectadas")} /></div>
      <AreaTable rows={afectadas} onDelete={(i) => setAfectadas(afectadas.filter((_, idx) => idx !== i))} />

      <div className="mt-3">
        <div className="text-[12px] font-medium mb-2" style={{ color: RED }}>Totales</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <Field label="Área Directa Total (M²)"><input className={inputCls} value={totalDirecta.toFixed(2)} readOnly /></Field>
          <Field label="Sumatoria de Áreas Total (M²)"><input className={inputCls} value={totalAreas.toFixed(2)} readOnly /></Field>
          <Field label="Área Indirecta Total (M²)"><input className={inputCls} value={totalIndirecta.toFixed(2)} readOnly /></Field>
        </div>
      </div>

      <SectionTitle>Listado de áreas remanentes</SectionTitle>
      <div className="mb-2"><AddButton onClick={() => setModal("remanentes")} /></div>
      <AreaTable rows={remanentes} onDelete={(i) => setRemanentes(remanentes.filter((_, idx) => idx !== i))} />

      <AddAreaModal open={modal === "matriz"} onClose={() => setModal(null)} onAdd={(r) => setMatriz([...matriz, r])} />
      <AddAreaModal open={modal === "afectadas"} onClose={() => setModal(null)} onAdd={(r) => setAfectadas([...afectadas, r])} />
      <AddAreaModal open={modal === "remanentes"} onClose={() => setModal(null)} onAdd={(r) => setRemanentes([...remanentes, r])} />
    </div>
  );
}

function CuadroDatosTecnicosTab({ codigo }: { codigo: string }) {
  const [subTab, setSubTab] = useState<"cdt" | "col">("cdt");
  const cdtRows = [
    { v: 1, cod: "KFRE", uso: "AFECTADA", lado: "1-2", dist: 6.56, ang: '46°25\'33"', e: 537816.4, n: 8605575.39, e2: 538041.07, n2: 8605942.86, lado2: "NORTE", col: "COMUNIDAD CAMPESINA COTAY (PE: 40019771)", colCbc: "Colinda con Comunidad Campesina Cotay (PE: 40019771)..." },
    { v: 2, cod: "KFRE", uso: "AFECTADA", lado: "2-3", dist: 10.01, ang: '92°2\'18"', e: 537822.79, n: 8605573.89, e2: 538047.46, n2: 8605941.36, lado2: "ESTE", col: "CARRETERA NACIONAL PE-3S", colCbc: "Colinda con Carretera Nacional PE-3S..." },
    { v: 3, cod: "KFRE", uso: "AFECTADA", lado: "3-4", dist: 0.13, ang: '25°8\'25"', e: 537820.85, n: 8605564.07, e2: 538045.52, n2: 8605931.54, lado2: "SUR", col: "VIAL-LST4-T05-090511-OC-00080", colCbc: "" },
    { v: 4, cod: "KFRE", uso: "AFECTADA", lado: "4-5", dist: 1.24, ang: '181°11\'31"', e: 537820.82, n: 8605564.19, e2: 538045.49, n2: 8605931.66, lado2: "SUR", col: "VIAL-LST4-T05-090511-OC-00080", colCbc: "" },
  ];
  const colRows = [
    { n: 1, cod: "KFRE", tipo: "RURAL", datum: "WGS84", uso: "AFECTADA", lado: "NORTE", col: "COMUNIDAD CAMPESINA COTAY (PE: 40019771)", suma: 6.56, colCbc: "Colinda con Comunidad Campesina Cotay (PE: 40019771)..." },
    { n: 2, cod: "KFRE", tipo: "RURAL", datum: "WGS84", uso: "AFECTADA", lado: "ESTE", col: "CARRETERA NACIONAL PE-3S", suma: 10.01, colCbc: "Colinda con Carretera Nacional PE-3S..." },
    { n: 3, cod: "KFRE", tipo: "RURAL", datum: "WGS84", uso: "AFECTADA", lado: "SUR", col: "VIAL-LST4-T05-090511-OC-00080", suma: 1.37, colCbc: "" },
    { n: 4, cod: "KFRE", tipo: "RURAL", datum: "WGS84", uso: "AFECTADA", lado: "OESTE", col: "VIAL-LST4-T05-090511-OC-00080", suma: 10.84, colCbc: "" },
  ];

  return (
    <div>
      <ExpedienteHeader codigo={codigo} />

      <SectionTitle>Listado de áreas Afectadas</SectionTitle>
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-[12px]">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-2 py-1.5 border-b w-10">#</th>
              <th className="px-2 py-1.5 border-b">Cód. polígono</th>
              <th className="px-2 py-1.5 border-b">Uso DT</th>
              <th className="px-2 py-1.5 border-b">Área directa (m²)</th>
              <th className="px-2 py-1.5 border-b">Área indirecta (m²)</th>
              <th className="px-2 py-1.5 border-b">Área total (m²)</th>
              <th className="px-2 py-1.5 border-b">Fecha de elaboración del plano CBC</th>
              <th className="px-2 py-1.5 border-b">Código del plano CBC</th>
              <th className="px-2 py-1.5 border-b">Seleccionar</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="px-2 py-1.5 border-b">1</td>
              <td className="px-2 py-1.5 border-b">KFRE</td>
              <td className="px-2 py-1.5 border-b">AFECTADA</td>
              <td className="px-2 py-1.5 border-b">150</td>
              <td className="px-2 py-1.5 border-b">0</td>
              <td className="px-2 py-1.5 border-b">150</td>
              <td className="px-2 py-1.5 border-b">FEBRERO 2025</td>
              <td className="px-2 py-1.5 border-b">PTKT-0001</td>
              <td className="px-2 py-1.5 border-b"><button className="text-blue-600 hover:underline text-[12px]">Seleccionar</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <SectionTitle>Digital de cuadro en excel</SectionTitle>
      <div className="space-y-3">
        <Field label="Área Seleccionada."><div className="text-[12px] font-medium">KFRE</div></Field>
        <Field label="Descarga Plantilla de Carga de Datos.">
          <button className="inline-flex items-center justify-center w-8 h-8 text-white rounded" style={{ background: RED }}><FileSpreadsheet size={14} /></button>
        </Field>
        <Field label="Archivo de Datos Técnicos">
          <div className="flex items-center gap-3">
            <input type="file" className="text-[11px]" />
            <button className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] text-white rounded" style={{ background: RED }}>
              <Upload size={12} /> Subir CDT
            </button>
          </div>
        </Field>
      </div>

      <SectionTitle>Cuadro de datos técnicos y colindancias</SectionTitle>
      <div className="flex border-b mb-3">
        <button onClick={() => setSubTab("cdt")} className={`px-3 py-1.5 text-[12px] border-b-2 ${subTab === "cdt" ? "border-blue-600 text-blue-600 font-medium" : "border-transparent text-gray-600"}`}>Cuadro de datos técnicos</button>
        <button onClick={() => setSubTab("col")} className={`px-3 py-1.5 text-[12px] border-b-2 ${subTab === "col" ? "border-blue-600 text-blue-600 font-medium" : "border-transparent text-gray-600"}`}>Colindancias</button>
      </div>

      {subTab === "cdt" ? (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-[12px]">
            <thead className="bg-gray-50">
              <tr className="text-left">
                {["Vértice","Cód. afectada","Uso DT","Lado","Distancia (m)","Ángulo interno","Este","Norte","Este 2","Norte 2","Lado 2","Colindancia","Colindancia CBC"].map(h => (
                  <th key={h} className="px-2 py-1.5 border-b font-medium text-gray-700 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cdtRows.map((r) => (
                <tr key={r.v} className="hover:bg-gray-50">
                  <td className="px-2 py-1.5 border-b text-blue-600">{r.v}</td>
                  <td className="px-2 py-1.5 border-b">{r.cod}</td>
                  <td className="px-2 py-1.5 border-b">{r.uso}</td>
                  <td className="px-2 py-1.5 border-b">{r.lado}</td>
                  <td className="px-2 py-1.5 border-b text-blue-600">{r.dist}</td>
                  <td className="px-2 py-1.5 border-b text-blue-600">{r.ang}</td>
                  <td className="px-2 py-1.5 border-b">{r.e}</td>
                  <td className="px-2 py-1.5 border-b">{r.n}</td>
                  <td className="px-2 py-1.5 border-b">{r.e2}</td>
                  <td className="px-2 py-1.5 border-b">{r.n2}</td>
                  <td className="px-2 py-1.5 border-b">{r.lado2}</td>
                  <td className="px-2 py-1.5 border-b" style={{ color: "#dc2626" }}>{r.col}</td>
                  <td className="px-2 py-1.5 border-b text-[11px]" style={{ color: "#dc2626", maxWidth: 240 }}>{r.colCbc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-[12px]">
            <thead className="bg-gray-50">
              <tr className="text-left">
                {["N.°","Cód. afect.","Tipo","Datum","Uso DT","Lado","Colindancia","Suma de lados","Colindancia CBC"].map(h => (
                  <th key={h} className="px-2 py-1.5 border-b font-medium text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {colRows.map((r) => (
                <tr key={r.n} className="hover:bg-gray-50">
                  <td className="px-2 py-1.5 border-b text-blue-600">{r.n}</td>
                  <td className="px-2 py-1.5 border-b">{r.cod}</td>
                  <td className="px-2 py-1.5 border-b">{r.tipo}</td>
                  <td className="px-2 py-1.5 border-b">{r.datum}</td>
                  <td className="px-2 py-1.5 border-b">{r.uso}</td>
                  <td className="px-2 py-1.5 border-b">{r.lado}</td>
                  <td className="px-2 py-1.5 border-b" style={{ color: RED }}>{r.col}</td>
                  <td className="px-2 py-1.5 border-b text-blue-600">{r.suma}</td>
                  <td className="px-2 py-1.5 border-b text-[11px]" style={{ color: RED, maxWidth: 280 }}>{r.colCbc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ListadoTab({ codigo, title, headers }: { codigo: string; title: string; headers: string[] }) {
  return (
    <div>
      <ExpedienteHeader codigo={codigo} />
      <SectionTitle>{title}</SectionTitle>
      <div className="mb-2"><AddButton /></div>
      <EmptyTable headers={headers} />
    </div>
  );
}

function DescripcionEntornoTab({ codigo }: { codigo: string }) {
  return (
    <div>
      <ExpedienteHeader codigo={codigo} />
      <SectionTitle>Descripción del entorno</SectionTitle>
      <textarea className="w-full border border-gray-300 rounded p-2 text-[12px]" rows={6} placeholder="Describa el entorno del predio (uso de suelo circundante, accesos, servicios, hitos, etc.)" />
    </div>
  );
}

function renderTab(tab: Tab, codigo: string) {
  switch (tab) {
    case "Padrón": return <PadronTab codigo={codigo} />;
    case "Colindancia matriz": return <ColindanciaMatrizTab codigo={codigo} />;
    case "Area afectada": return <AreaAfectadaTab codigo={codigo} />;
    case "Cuadro de datos técnicos": return <CuadroDatosTecnicosTab codigo={codigo} />;
    case "Datos de la vivienda":
      return <ListadoTab codigo={codigo} title="Listado de viviendas" headers={["#","Módulo","Piso","Descripción","Área directa (m²)","Área indirecta (m²)","Área total (m²)","Uso","Material predominante","Fotos","Acciones"]} />;
    case "Obras complementarias":
      return <ListadoTab codigo={codigo} title="Listado de obras complementarias" headers={["#","TIPO","LONGITUD","ALTURA","METRADO","m/m²/","USO","CARACTERÍSTICAS TÉCNICAS","UBICACIÓN","FOTO","Acciones"]} />;
    case "Inst. Fijas Permanentes":
      return <ListadoTab codigo={codigo} title="Listado de instalaciones fijas permanentes" headers={["#","Tipo","Descripción","Cantidad","Unidad","Material","Estado","Foto","Acciones"]} />;
    case "Plantaciones frutales":
      return <ListadoTab codigo={codigo} title="Listado de plantaciones frutales" headers={["#","Especie","Cantidad","Edad (años)","Estado","Producción","Foto","Acciones"]} />;
    case "Plantaciones forestales":
      return <ListadoTab codigo={codigo} title="Listado de plantaciones forestales" headers={["#","Especie","Cantidad","Edad (años)","Altura (m)","Diámetro (cm)","Foto","Acciones"]} />;
    case "Plantaciones transitorias":
      return <ListadoTab codigo={codigo} title="Listado de plantaciones transitorias" headers={["#","Cultivo","Área (m²)","Campaña","Rendimiento","Foto","Acciones"]} />;
    case "Cerco vivo":
      return <ListadoTab codigo={codigo} title="Listado de cerco vivo" headers={["#","Especie","Longitud (m)","Altura (m)","Estado","Foto","Acciones"]} />;
    case "Daño emergente":
      return <ListadoTab codigo={codigo} title="Listado de daño emergente" headers={["#","Concepto","Descripción","Monto (S/)","Sustento","Acciones"]} />;
    case "Descripción del Entorno":
      return <DescripcionEntornoTab codigo={codigo} />;
  }
}

function createIttDraftWordBlob({
  codigo,
  sujeto,
  area,
  valorTasacion,
  peritoNombre,
  peritoDni,
  peritoSupervisor,
  fechaItt,
}: {
  codigo: string;
  sujeto: string;
  area: string;
  valorTasacion: string;
  peritoNombre: string;
  peritoDni: string;
  peritoSupervisor: string;
  fechaItt: string;
}) {
  const html = `<!doctype html>
<html>
  <head><meta charset="UTF-8" /></head>
  <body style="font-family: Arial; font-size: 10pt; color: #000;">
    <h2>INFORME TECNICO DE TASACION - BORRADOR</h2>
    <p><b>Fecha:</b> ${escapeHtml(fechaItt)}</p>
    <p><b>Codigo de predio:</b> ${escapeHtml(codigo)}</p>
    <p><b>Sujeto pasivo:</b> ${escapeHtml(sujeto)}</p>
    <p><b>Area afectada:</b> ${escapeHtml(area)} m2</p>
    <p><b>Valor de tasacion:</b> ${escapeHtml(valorTasacion || "Pendiente de registro")}</p>
    <p><b>Perito tasador:</b> ${escapeHtml(peritoNombre || "Pendiente de registro")}</p>
    <p><b>DNI del perito:</b> ${escapeHtml(peritoDni || "Pendiente de registro")}</p>
    <p><b>Perito supervisor:</b> ${escapeHtml(peritoSupervisor || "Pendiente de registro")}</p>
    <h3>1. Antecedentes</h3>
    <p>El presente borrador se genera desde el modulo de tasacion para revision y culminacion por el perito tasador.</p>
    <h3>2. Desarrollo de la tasacion</h3>
    <p>Registrar metodologia, inspeccion, fuentes de informacion, analisis del predio y sustento del valor.</p>
    <h3>3. Conclusion</h3>
    <p>Registrar el valor final de tasacion y recomendaciones.</p>
  </body>
</html>`;
  return new Blob([html], { type: "application/msword;charset=utf-8" });
}

function downloadBlobFile(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function DatosTecnicosPage() {
  const { projectId, codigo } = Route.useParams();
  const router = useRouter();
  const goBack = () => router.history.back();
  const decoded = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;
  const [tab, setTab] = useState<Tab>("Padrón");

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Tasación / ITT"
        badgeLabel="Predio"
        badgeValue={decoded}
        badgeSuffix="Etapa I · 2.8"
      />

      <main className="mx-auto max-w-[1600px] p-4">

      <TasacionPeritoPanel codigo={decoded} />

      <div className="bg-white rounded border flex overflow-hidden">
        {/* Vertical tabs sidebar */}
        <aside className="w-[230px] shrink-0 border-r bg-gray-50/50 py-2">
          <nav className="flex flex-col">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => setTab(t.name)}
                  className={`flex items-center gap-2.5 px-4 py-2 text-[12.5px] text-left border-l-2 transition ${
                    active
                      ? "border-[#dc2626] bg-white text-[#dc2626] font-medium"
                      : "border-transparent text-gray-600 hover:bg-white hover:text-gray-900"
                  }`}
                >
                  <Icon size={15} />
                  <span className="truncate">{t.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 p-5">
          {renderTab(tab, decoded)}

          <div className="flex justify-end gap-2 mt-6 pt-3 border-t">
            <button onClick={goBack} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50"><X size={14} /> Cancelar</button>
            <button onClick={goBack} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded" style={{ background: RED }}><Save size={14} /> Guardar</button>
          </div>
        </div>
      </div>

      </main>
    </div>
  );
}
