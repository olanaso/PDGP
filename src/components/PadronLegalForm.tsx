import { useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";

type Titular = {
  tipo: string;
  dni: string;
  nombres: string;
  telefono: string;
  condicion: string;
  doc: string;
};

const RED = "#dc2626";

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

const inputCls = "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";

export function PadronLegalForm({ codigoPredio, onCancel, onSave }: { codigoPredio?: string; onCancel?: () => void; onSave?: () => void }) {
  const [titulares, setTitulares] = useState<Titular[]>([
    { tipo: "NATURAL", dni: "70021899", nombres: "ERICK SIMON ESCALANTE OLANO", telefono: "978868159", condicion: "PROPIETARIO NO INSCRITO", doc: "DOCUMENTOS CON FECHA CIERTA" },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTit, setNewTit] = useState<Titular>({ tipo: "NATURAL", dni: "", nombres: "", telefono: "", condicion: "PROPIETARIO NO INSCRITO", doc: "DOCUMENTOS CON FECHA CIERTA" });

  const addTitular = () => {
    if (!newTit.dni || !newTit.nombres) return;
    setTitulares([...titulares, newTit]);
    setNewTit({ tipo: "NATURAL", dni: "", nombres: "", telefono: "", condicion: "PROPIETARIO NO INSCRITO", doc: "DOCUMENTOS CON FECHA CIERTA" });
    setShowAdd(false);
  };

  return (
    <div className="bg-white rounded border">
        <div className="px-5 py-5">
          {/* Tab */}
          <div className="border-b mb-3">
            <div className="inline-block px-3 py-1.5 text-[12px] font-medium border-b-2" style={{ borderColor: RED, color: RED }}>
              Padrón Legal
            </div>
          </div>

          {/* Datos de expediente */}
          <SectionTitle>Datos de expediente</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Field label="Código del Predio">
              <input className={inputCls} defaultValue={codigoPredio || "VIAL-LST4-T04-ST05-090506-OC-00699"} />
            </Field>
            <Field label="Código de Expediente">
              <input className={inputCls} defaultValue="3546-2023-MTC/DDP" />
            </Field>
            <Field label="Profesional Legal Responsable" required>
              <select className={selectCls} defaultValue="LAZARO MONTAÑEZ JAROL BRAYAN">
                <option>LAZARO MONTAÑEZ JAROL BRAYAN</option>
              </select>
            </Field>
            <Field label="Mes de Elaboración del Exp.">
              <select className={selectCls}><option>-- SELECCIONE --</option></select>
            </Field>
            <Field label="Estado del Predio.">
              <select className={selectCls} defaultValue="MEDIDO"><option>MEDIDO</option></select>
            </Field>
          </div>

          {/* Ubicación */}
          <SectionTitle>Ubicación</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Field label="Distrito."><input className={inputCls} defaultValue="LOCROJA" /></Field>
            <Field label="Sector/Localidad."><input className={inputCls} defaultValue="CASERÍO HUANCHUY" /></Field>
            <Field label="Manzana"><input className={inputCls} defaultValue="-" /></Field>
            <Field label="Lote"><input className={inputCls} defaultValue="-" /></Field>
            <Field label="UC."><input className={inputCls} defaultValue="-" /></Field>
          </div>

          {/* Titulares */}
          <SectionTitle>Titulares</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-3">
            <Field label="Titular Registral."><input className={inputCls} /></Field>
            <Field label="Teléfono de Contacto."><input className={inputCls} /></Field>
          </div>

          <div className="mb-3">
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] text-white rounded"
              style={{ background: "#5eaaa8" }}
            >
              <Plus size={14} /> Añadir
            </button>
          </div>

          <div className="overflow-x-auto border rounded">
            <table className="w-full text-[12px]">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="px-2 py-1.5 border-b w-10">#</th>
                  <th className="px-2 py-1.5 border-b">Tipo persona</th>
                  <th className="px-2 py-1.5 border-b">DNI / RUC</th>
                  <th className="px-2 py-1.5 border-b">Nombres / Raz. Social</th>
                  <th className="px-2 py-1.5 border-b">Telefonos</th>
                  <th className="px-2 py-1.5 border-b">Foto Identidad</th>
                  <th className="px-2 py-1.5 border-b">Condición Jurídica</th>
                  <th className="px-2 py-1.5 border-b">Doc. sust. titularidad</th>
                  <th className="px-2 py-1.5 border-b">Archivo sust. titularidad</th>
                  <th className="px-2 py-1.5 border-b w-20">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {titulares.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-2 py-1.5 border-b">{i + 1}</td>
                    <td className="px-2 py-1.5 border-b">{t.tipo}</td>
                    <td className="px-2 py-1.5 border-b">{t.dni}</td>
                    <td className="px-2 py-1.5 border-b" style={{ color: RED }}>{t.nombres}</td>
                    <td className="px-2 py-1.5 border-b">{t.telefono}</td>
                    <td className="px-2 py-1.5 border-b"></td>
                    <td className="px-2 py-1.5 border-b">{t.condicion}</td>
                    <td className="px-2 py-1.5 border-b" style={{ color: RED }}>{t.doc}</td>
                    <td className="px-2 py-1.5 border-b"></td>
                    <td className="px-2 py-1.5 border-b">
                      <div className="flex gap-1">
                        <button className="p-1 border rounded text-blue-600"><Pencil size={12} /></button>
                        <button
                          className="p-1 border rounded"
                          style={{ color: RED }}
                          onClick={() => setTitulares(titulares.filter((_, idx) => idx !== i))}
                        ><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-y-2 mt-4">
            <Field label="Condición Jurídica de los Titulares.">
              <select className={selectCls} defaultValue="OCUPANTE"><option>OCUPANTE</option><option>PROPIETARIO</option></select>
            </Field>
            <Field label="Partida Registral Matriz"><input className={inputCls} /></Field>
            <Field label="Partida Registral Independizada"><input className={inputCls} /></Field>
            <Field label="Documento que Acredita la Titularidad del Predio">
              <select className={selectCls} defaultValue="CONSTANCIA DE COMUNERO HÁBIL"><option>CONSTANCIA DE COMUNERO HÁBIL</option></select>
            </Field>
            <Field label="Entidad que Acredita la Titularidad">
              <select className={selectCls} defaultValue="Zona Registral N° I - Sede Piura"><option>Zona Registral N° I - Sede Piura</option></select>
            </Field>
            <Field label="Número de Documento que Acredita la Titularidad del Predio"><input className={inputCls} /></Field>
            <Field label="Fecha de Emisión"><input type="date" className={inputCls} defaultValue="2024-05-13" /></Field>
            <Field label="Entidad"><input className={inputCls} /></Field>
            <Field label="Área del Documento de Propiedad" required><input className={inputCls} defaultValue="1245" /></Field>
            <Field label="Unidades del Documento de Propiedad.">
              <select className={selectCls} defaultValue="m2"><option>m2</option><option>ha</option></select>
            </Field>
          </div>

          {/* Lucro cesante */}
          <SectionTitle>Lucro cesante</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Field label="Lucro Cesante Sí/No."><select className={selectCls} defaultValue="NO"><option>NO</option><option>SI</option></select></Field>
            <Field label="Tipo de Empresa."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
            <Field label="Denominación del Negocio."><input className={inputCls} disabled /></Field>
            <Field label="Descripción del Giro Comercial."><input className={inputCls} disabled /></Field>
            <Field label="Condición del Negocio."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
            <Field label="Tipo de Negocio."><input className={inputCls} disabled /></Field>
            <Field label="Régimen."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
            <Field label="Actividad."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
            <Field label="N.° RUC."><input className={inputCls} disabled /></Field>
            <Field label="Tipo de Establecimiento."><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
          </div>
          <div className="mt-3">
            <label className="text-[12px] block mb-1">Descripción del lucro</label>
            <textarea className="w-full border border-gray-300 rounded p-2 text-[12px]" rows={2} placeholder="Descripción del lucro cesante" />
          </div>

          {/* Servidumbre */}
          <SectionTitle>Servidumbre</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Field label="Tipo de Servidumbre"><select className={selectCls}><option>-- SELECCIONE --</option></select></Field>
            <Field label="Período (Años)"><input className={inputCls} /></Field>
          </div>

          {/* CBC */}
          <SectionTitle>Certificado de Búsqueda Catastral (CBC)</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Field label="Número de Publicidad CBC"><input className={inputCls} /></Field>
            <Field label="Fecha de Informe Técnico"><input type="date" className={inputCls} /></Field>
            <Field label="Cód. Verificación CBC"><input className={inputCls} /></Field>
            <Field label="Estado del CBC"><input className={inputCls} /></Field>
            <Field label="Fecha de Emisión del CBC"><input type="date" className={inputCls} /></Field>
            <Field label="Análisis Legal CBC"><input className={inputCls} /></Field>
            <Field label="N.° De Informe Técnico"><input className={inputCls} /></Field>
          </div>

          <SectionTitle>Marco legal en el que se basa el requerimiento</SectionTitle>
          <textarea className="w-full border border-gray-300 rounded p-2 text-[12px]" rows={4} defaultValue='ARTICULO 15 DEL TEXTO ÚNICO ORDENADO DEL DECRETO LEGISLATIVO N°1192, QUE APRUEBA LA "LEY MARCO DE ADQUISICION Y EXPROPIACION DE INMUEBLES, TRANSFERENCIA DE INMUEBLES DE PROPIEDAD DEL ESTADO, LIBERACION DE INTERFERENCIAS Y DICTA OTRAS MEDIDAS PARA LA EJECUCION DE OBRAS DE INFRAESTRUCTURA", APROBADO MEDIANTE DECRETO SUPREMO N°015-2020-VIVIENDA.' />

          <SectionTitle>Análisis de la situación legal del predio</SectionTitle>
          <textarea className="w-full border border-gray-300 rounded p-2 text-[12px]" rows={3} defaultValue="EL TITULAR DEL PREDIO ACREDITA SU DERECHO DE PROPIEDAD DEL INMUEBLE, EN MERITO A LA PARTIDA REGISTRAL N° <nro-registral> DEL REGISTRO DE PREDIOS DE LIMA, ZONA REGISTRAL N° IX- SEDE LIMA, EN CUMPLIMIENTO AL ART. 6.1 DEL TEXTO UNICO ORDENADO DEL DECRETO LEGISLATIVO N° 1192." />

          <SectionTitle>Observaciones</SectionTitle>
          <textarea className="w-full border border-gray-300 rounded p-2 text-[12px]" rows={2} placeholder="Ingrese la observación" />

          {/* Footer */}
          <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
            <button onClick={onCancel} className="px-4 py-1.5 text-[12px] border border-gray-300 rounded hover:bg-gray-50">Cancelar</button>
            <button onClick={onSave} className="px-4 py-1.5 text-[12px] text-white rounded" style={{ background: RED }}>Guardar</button>
          </div>
        </div>

        {/* Add Titular modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdd(false)}>
            <div className="bg-white rounded-lg w-[420px] max-h-[90vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-[14px]">
                  <span className="text-gray-700">Agregar </span>
                  <span className="font-semibold" style={{ color: RED }}>TITULAR</span>
                </div>
                <button onClick={() => setShowAdd(false)}><X size={16} /></button>
              </div>
              <div className="space-y-2">
                <Field label="Tipo persona" required>
                  <select className={selectCls} value={newTit.tipo} onChange={(e) => setNewTit({ ...newTit, tipo: e.target.value })}>
                    <option>NATURAL</option><option>JURÍDICA</option>
                  </select>
                </Field>
                <Field label="DNI" required>
                  <div className="space-y-1">
                    <input className={inputCls} value={newTit.dni} onChange={(e) => setNewTit({ ...newTit, dni: e.target.value })} />
                    <div className="flex gap-1">
                      <button className="text-[11px] px-2 py-1 border rounded bg-gray-50">Validación ficha RENIEC</button>
                      <button className="text-[11px] px-2 py-1 border rounded bg-gray-50">Búscar DNI</button>
                    </div>
                  </div>
                </Field>
                <Field label="Nombres y Apellidos" required>
                  <input className={inputCls} value={newTit.nombres} onChange={(e) => setNewTit({ ...newTit, nombres: e.target.value })} />
                </Field>
                <Field label="Fecha caducidad DNI"><input className={inputCls} /></Field>
                <Field label="Departamento de domicilio"><input className={inputCls} /></Field>
                <Field label="Provincia de domicilio"><input className={inputCls} /></Field>
                <Field label="Distrito de domicilio"><input className={inputCls} /></Field>
                <Field label="Dirección" required><input className={inputCls + " bg-blue-50"} /></Field>
                <Field label="Telf. de contacto" required><input className={inputCls + " bg-blue-50"} value={newTit.telefono} onChange={(e) => setNewTit({ ...newTit, telefono: e.target.value })} /></Field>
                <Field label="Foto Identidad"><input type="file" className="text-[11px]" /></Field>
                <Field label="Condición Jurídica" required>
                  <select className={selectCls} value={newTit.condicion} onChange={(e) => setNewTit({ ...newTit, condicion: e.target.value })}>
                    <option>PROPIETARIO NO INSCRITO</option><option>PROPIETARIO</option><option>OCUPANTE</option>
                  </select>
                </Field>
                <Field label="Estado civil" required>
                  <select className={selectCls + " bg-blue-50"}><option>SOLTERO</option><option>CASADO</option></select>
                </Field>
                <Field label="Documento que sustenta titularidad" required>
                  <select className={selectCls} value={newTit.doc} onChange={(e) => setNewTit({ ...newTit, doc: e.target.value })}>
                    <option>DOCUMENTOS CON FECHA CIERTA</option>
                  </select>
                </Field>
                <Field label="Archivo Documento Sustento Titularidad"><input type="file" className="text-[11px]" /></Field>
              </div>
              <div className="flex justify-center gap-2 mt-5">
                <button onClick={addTitular} className="px-6 py-1.5 text-[12px] text-white rounded" style={{ background: RED }}>Agregar</button>
                <button onClick={() => setShowAdd(false)} className="px-6 py-1.5 text-[12px] border rounded">Cerrar</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}