import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  CheckCircle2,
  Download,
  FileArchive,
  FileCheck2,
  FileText,
  History,
  Save,
  Send,
  Upload,
  X,
} from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/cbc")({
  head: () => ({
    meta: [
      { title: "Certificado de Búsqueda Catastral – CBC" },
      { name: "description", content: "Gestión de solicitud, documentos y recepción del Certificado de Búsqueda Catastral SUNARP." },
    ],
  }),
  component: CbcPage,
});

const RED = "#dc2626";
const inputCls = "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";

type VersionKind = "memoria" | "planos" | "certificado";
type VersionRow = {
  id: number;
  kind: VersionKind;
  version: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  status: string;
  notes: string;
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

function downloadTextFile(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  downloadBlobFile(fileName, blob);
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

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(out: number[], value: number) {
  out.push(value & 0xff, (value >>> 8) & 0xff);
}

function writeUint32(out: number[], value: number) {
  out.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function createZipBlob(files: Array<{ name: string; content: string }>) {
  const encoder = new TextEncoder();
  const local: number[] = [];
  const central: number[] = [];
  const records: Array<{ nameBytes: Uint8Array; data: Uint8Array; crc: number; offset: number }> = [];

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const data = encoder.encode(file.content);
    const crc = crc32(data);
    const offset = local.length;
    writeUint32(local, 0x04034b50);
    writeUint16(local, 20);
    writeUint16(local, 0);
    writeUint16(local, 0);
    writeUint16(local, 0);
    writeUint16(local, 0);
    writeUint32(local, crc);
    writeUint32(local, data.length);
    writeUint32(local, data.length);
    writeUint16(local, nameBytes.length);
    writeUint16(local, 0);
    local.push(...nameBytes, ...data);
    records.push({ nameBytes, data, crc, offset });
  });

  records.forEach((record) => {
    writeUint32(central, 0x02014b50);
    writeUint16(central, 20);
    writeUint16(central, 20);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint32(central, record.crc);
    writeUint32(central, record.data.length);
    writeUint32(central, record.data.length);
    writeUint16(central, record.nameBytes.length);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint32(central, 0);
    writeUint32(central, record.offset);
    central.push(...record.nameBytes);
  });

  const end: number[] = [];
  writeUint32(end, 0x06054b50);
  writeUint16(end, 0);
  writeUint16(end, 0);
  writeUint16(end, records.length);
  writeUint16(end, records.length);
  writeUint32(end, central.length);
  writeUint32(end, local.length);
  writeUint16(end, 0);

  return new Blob([new Uint8Array([...local, ...central, ...end])], { type: "application/zip" });
}

function officeForLocation(ciudad?: string, oficina?: string) {
  if (oficina?.trim()) return oficina.trim();
  const value = (ciudad ?? "").toUpperCase();
  if (value.includes("JAUJA") || value.includes("HUANCAYO")) return "SUNARP - Oficina Registral Huancayo";
  if (value.includes("LIMA")) return "SUNARP - Oficina Registral Lima";
  if (value.includes("PUNO")) return "SUNARP - Oficina Registral Puno";
  return "SUNARP - Oficina Registral competente por ubicacion";
}

function buildDxf(codigo: string) {
  return `0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1027\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n999\nPredio ${codigo}\n0\nENDSEC\n0\nEOF\n`;
}

function CbcPage() {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto?.nombre ?? projectId;
  const oficinaRegistral = useMemo(() => officeForLocation(predio?.ciudad, predio?.ofi), [predio?.ciudad, predio?.ofi]);
  const [versions, setVersions] = useState<VersionRow[]>([
    {
      id: 1,
      kind: "memoria",
      version: "v1",
      fileName: `memoria_cbc_${decodedCodigo}.doc`,
      uploadedAt: "2026-07-03 09:20",
      uploadedBy: "Usuario tecnico",
      status: "Generado",
      notes: "Formato base generado con datos del predio",
    },
  ]);
  const [envio, setEnvio] = useState({
    nroSolicitud: `CBC-${new Date().getFullYear()}-${decodedCodigo.slice(-5)}`,
    fechaEnvio: new Date().toISOString().slice(0, 10),
    canal: "Mesa de partes SUNARP",
    responsable: "Especialista tecnico predial",
    observacion: "",
  });
  const [recepcion, setRecepcion] = useState({
    nroCertificado: "",
    fechaEmision: "",
    fechaRecepcion: "",
    resultado: "Pendiente",
    observacion: "",
  });

  function appendVersion(kind: VersionKind, fileName: string, status: string, notes: string) {
    const nextNumber = versions.filter((item) => item.kind === kind).length + 1;
    setVersions((items) => [
      {
        id: Date.now(),
        kind,
        version: `v${nextNumber}`,
        fileName,
        uploadedAt: new Date().toLocaleString("es-PE", { hour12: false }),
        uploadedBy: "Usuario actual",
        status,
        notes,
      },
      ...items,
    ]);
  }

  function handleUpload(kind: VersionKind, files: FileList | null, notes: string) {
    const file = files?.[0];
    if (!file) return;
    appendVersion(kind, file.name, "Cargado", notes);
  }

  function generateMemoria() {
    const html = `<!doctype html>
      <html><head><meta charset="utf-8"><title>Memoria descriptiva CBC</title></head>
      <body style="font-family: Arial; font-size: 10pt;">
        <h2>MEMORIA DESCRIPTIVA PARA CERTIFICADO DE BUSQUEDA CATASTRAL</h2>
        <p><b>Codigo de predio:</b> ${predio?.cod || decodedCodigo}</p>
        <p><b>Proyecto:</b> ${predio?.proyecto || proyecto?.nombre || projectId}</p>
        <p><b>Oficina registral:</b> ${oficinaRegistral}</p>
        <p><b>Sujeto pasivo:</b> ${predio?.suj || "Sin informacion"}</p>
        <p><b>Tipo de predio:</b> ${predio?.tipo || predio?.tp || "Sin informacion"}</p>
        <p><b>Area afectada:</b> ${predio?.area || predio?.m2 || "Sin informacion"} m2</p>
        <p><b>Partida registral:</b> ${predio?.part || predio?.pind || "Sin informacion"}</p>
        <p><b>Modalidad:</b> ${predio?.mod || "Sin informacion"}</p>
        <h3>Descripcion</h3>
        <p>El presente documento sustenta la solicitud de certificado de busqueda catastral del predio seleccionado, con la informacion tecnica y registral disponible en la plataforma.</p>
      </body></html>`;
    const fileName = `memoria_descriptiva_cbc_${decodedCodigo}.doc`;
    downloadTextFile(fileName, html, "application/msword;charset=utf-8");
    appendVersion("memoria", fileName, "Generado", "Documento Word generado desde la plataforma");
  }

  function generateDxf() {
    const content = buildDxf(decodedCodigo);
    downloadTextFile(`predio_${decodedCodigo}.dxf`, content, "application/dxf");
  }

  function generateZip() {
    const fileName = `paquete_cbc_${decodedCodigo}.zip`;
    const zip = createZipBlob([
      {
        name: "solicitud_cbc.txt",
        content: `Solicitud CBC\nPredio: ${predio?.cod || decodedCodigo}\nOficina registral: ${oficinaRegistral}\nSujeto pasivo: ${predio?.suj || "Sin informacion"}\nArea m2: ${predio?.area || predio?.m2 || "Sin informacion"}\n`,
      },
      { name: `predio_${decodedCodigo}.dxf`, content: buildDxf(decodedCodigo) },
    ]);
    downloadBlobFile(fileName, zip);
    appendVersion("planos", fileName, "Generado", "Paquete ZIP generado para envio de planos");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Certificado de Búsqueda Catastral – CBC"
        badgeLabel="Predio"
        badgeValue={predio?.cod || decodedCodigo}
        badgeSuffix="Etapa I · 2.2"
        right={<span className="rounded-full bg-[#fef2f2] px-2 py-1 text-[11px] font-semibold text-[#dc2626]">Solicitud SUNARP</span>}
      />

      <main className="mx-auto max-w-[1400px] p-4">
        <form className="bg-white rounded border">
          <div className="px-5 py-5">
            <div className="border-b mb-3">
              <div className="inline-block px-3 py-1.5 text-[12px] font-medium border-b-2" style={{ borderColor: RED, color: RED }}>
                2.2 Certificado de Búsqueda Catastral – CBC
              </div>
            </div>

            <SectionTitle>Datos automáticos del predio</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field label="Codigo de predio"><input className={inputCls} value={predio?.cod || decodedCodigo} readOnly /></Field>
              <Field label="Oficina registral"><input className={inputCls} value={oficinaRegistral} readOnly /></Field>
              <Field label="Proyecto"><input className={inputCls} value={predio?.proyecto || proyecto?.nombre || projectId} readOnly /></Field>
              <Field label="Sujeto pasivo"><input className={inputCls} value={predio?.suj || "Sin informacion"} readOnly /></Field>
              <Field label="Tipo de predio"><input className={inputCls} value={predio?.tipo || predio?.tp || "Sin informacion"} readOnly /></Field>
              <Field label="Area afectada m2"><input className={inputCls} value={predio?.area || predio?.m2 || "Sin informacion"} readOnly /></Field>
              <Field label="Partida registral"><input className={inputCls} value={predio?.part || predio?.pind || "Sin informacion"} readOnly /></Field>
              <Field label="Modalidad"><input className={inputCls} value={predio?.mod || "Sin informacion"} readOnly /></Field>
            </div>

            <SectionTitle>Documentacion para enviar solicitud CBC</SectionTitle>
            <div className="overflow-x-auto rounded border">
              <table className="w-full text-[12px]">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-2 py-1.5 border-b">Documento</th>
                    <th className="px-2 py-1.5 border-b">Generar</th>
                    <th className="px-2 py-1.5 border-b">Subir firmado / enviado</th>
                    <th className="px-2 py-1.5 border-b">Version vigente</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-2 border-b font-medium">Memoria descriptiva Word</td>
                    <td className="px-2 py-2 border-b">
                      <button type="button" onClick={generateMemoria} className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[12px] text-white" style={{ background: RED }}>
                        <FileText size={14} /> Generar Word
                      </button>
                    </td>
                    <td className="px-2 py-2 border-b">
                      <input type="file" accept=".doc,.docx,.pdf" className="text-[11px]" onChange={(e) => handleUpload("memoria", e.target.files, "Memoria firmada y enviada")} />
                    </td>
                    <td className="px-2 py-2 border-b">{latestVersion(versions, "memoria")}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 border-b font-medium">Plano / DXF / paquete ZIP del predio</td>
                    <td className="px-2 py-2 border-b">
                      <div className="flex flex-wrap gap-1.5">
                        <button type="button" onClick={generateDxf} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-[12px] hover:bg-gray-50">
                          <Download size={14} /> DXF
                        </button>
                        <button type="button" onClick={generateZip} className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[12px] text-white" style={{ background: RED }}>
                          <FileArchive size={14} /> ZIP
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-2 border-b">
                      <input type="file" accept=".pdf,.dwg,.dxf,.zip" className="text-[11px]" onChange={(e) => handleUpload("planos", e.target.files, "Planos firmados/enviados para solicitud CBC")} />
                    </td>
                    <td className="px-2 py-2 border-b">{latestVersion(versions, "planos")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <SectionTitle>Datos de envio a SUNARP</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field label="Nro. solicitud" required><input className={inputCls} value={envio.nroSolicitud} onChange={(e) => setEnvio({ ...envio, nroSolicitud: e.target.value })} /></Field>
              <Field label="Fecha de envio" required><input type="date" className={inputCls} value={envio.fechaEnvio} onChange={(e) => setEnvio({ ...envio, fechaEnvio: e.target.value })} /></Field>
              <Field label="Canal de envio"><select className={selectCls} value={envio.canal} onChange={(e) => setEnvio({ ...envio, canal: e.target.value })}><option>Mesa de partes SUNARP</option><option>SID SUNARP</option><option>Ventanilla registral</option></select></Field>
              <Field label="Responsable"><input className={inputCls} value={envio.responsable} onChange={(e) => setEnvio({ ...envio, responsable: e.target.value })} /></Field>
              <Field label="Observacion envio" className="col-span-2"><textarea className="w-full rounded border border-gray-300 p-2 text-[12px]" rows={2} value={envio.observacion} onChange={(e) => setEnvio({ ...envio, observacion: e.target.value })} /></Field>
            </div>

            <SectionTitle>Recepcion del certificado emitido</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field label="Nro. certificado"><input className={inputCls} value={recepcion.nroCertificado} onChange={(e) => setRecepcion({ ...recepcion, nroCertificado: e.target.value })} /></Field>
              <Field label="Resultado"><select className={selectCls} value={recepcion.resultado} onChange={(e) => setRecepcion({ ...recepcion, resultado: e.target.value })}><option>Pendiente</option><option>Emitido sin observacion</option><option>Emitido con observacion</option><option>Requiere subsanacion</option></select></Field>
              <Field label="Fecha emision"><input type="date" className={inputCls} value={recepcion.fechaEmision} onChange={(e) => setRecepcion({ ...recepcion, fechaEmision: e.target.value })} /></Field>
              <Field label="Fecha recepcion"><input type="date" className={inputCls} value={recepcion.fechaRecepcion} onChange={(e) => setRecepcion({ ...recepcion, fechaRecepcion: e.target.value })} /></Field>
              <Field label="Certificado PDF"><input type="file" accept=".pdf" className="text-[11px]" onChange={(e) => handleUpload("certificado", e.target.files, "Certificado CBC emitido por SUNARP")} /></Field>
              <Field label="Version certificado"><input className={inputCls} value={latestVersion(versions, "certificado")} readOnly /></Field>
              <Field label="Observacion recepcion" className="col-span-2"><textarea className="w-full rounded border border-gray-300 p-2 text-[12px]" rows={2} value={recepcion.observacion} onChange={(e) => setRecepcion({ ...recepcion, observacion: e.target.value })} /></Field>
            </div>

            <SectionTitle>Historial versionado</SectionTitle>
            <VersionHistory versions={versions} />

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
              <button type="button" className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50">
                <X size={14} /> Cancelar
              </button>
              <button type="button" className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50">
                <Save size={14} /> Guardar borrador
              </button>
              <button type="button" className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded" style={{ background: RED }}>
                <Send size={14} /> Registrar CBC
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

function latestVersion(rows: VersionRow[], kind: VersionKind) {
  return rows.find((item) => item.kind === kind)?.version ?? "Sin version";
}

function VersionHistory({ versions }: { versions: VersionRow[] }) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full text-[12px]">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-2 py-1.5 border-b">Tipo</th>
            <th className="px-2 py-1.5 border-b">Version</th>
            <th className="px-2 py-1.5 border-b">Archivo</th>
            <th className="px-2 py-1.5 border-b">Estado</th>
            <th className="px-2 py-1.5 border-b">Usuario</th>
            <th className="px-2 py-1.5 border-b">Fecha</th>
            <th className="px-2 py-1.5 border-b">Observacion</th>
          </tr>
        </thead>
        <tbody>
          {versions.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-2 py-1.5 border-b">
                <span className="inline-flex items-center gap-1">
                  {item.kind === "certificado" ? <FileCheck2 size={13} className="text-[#16a34a]" /> : item.kind === "planos" ? <Archive size={13} className="text-[#7c3aed]" /> : <History size={13} className="text-[#dc2626]" />}
                  {item.kind}
                </span>
              </td>
              <td className="px-2 py-1.5 border-b font-mono text-[#dc2626]">{item.version}</td>
              <td className="px-2 py-1.5 border-b">{item.fileName}</td>
              <td className="px-2 py-1.5 border-b"><span className="inline-flex items-center gap-1 rounded-full bg-[#f0fdf4] px-2 py-0.5 text-[11px] text-[#166534]"><CheckCircle2 size={12} /> {item.status}</span></td>
              <td className="px-2 py-1.5 border-b">{item.uploadedBy}</td>
              <td className="px-2 py-1.5 border-b">{item.uploadedAt}</td>
              <td className="px-2 py-1.5 border-b">{item.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
