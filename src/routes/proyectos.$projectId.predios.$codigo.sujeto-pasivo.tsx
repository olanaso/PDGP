import { useMemo, useRef, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Loader2, Pencil, Plus, Save, Search, Send, Trash2, Upload, X } from "lucide-react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/$projectId/predios/$codigo/sujeto-pasivo")({
  head: () => ({
    meta: [
      { title: "Sujeto pasivo" },
      {
        name: "description",
        content: "Registro de titulares, condicion juridica y documentos de sustento del sujeto pasivo.",
      },
    ],
  }),
  component: SujetoPasivoPage,
});

const RED = "#dc2626";
const inputCls = "h-8 px-2 text-[12px] border border-gray-300 rounded w-full bg-white focus:outline-none focus:border-gray-500";
const selectCls = inputCls + " appearance-none bg-white";

type Titular = {
  id: number;
  tipoPersona: "NATURAL" | "JURIDICA";
  documento: string;
  nombres: string;
  telefonos: string;
  condicionJuridica: string;
  documentoSustento: string;
};

type TitularForm = Titular & {
  fechaCaducidadDni: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  estadoCivil: string;
};

function SectionTitle ({ children }: { children: ReactNode }) {
  return (
    <div className="border-b pb-1 mb-3 mt-4 first:mt-0">
      <h3 className="text-[13px] font-semibold" style={{ color: RED }}>
        {children}
      </h3>
    </div>
  );
}

function Field ({
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
      <label className="text-right text-[12px] text-gray-700">
        {required && <span style={{ color: RED }}>* </span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function SujetoPasivoPage () {
  const { projectId, codigo } = Route.useParams();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}` : projectId;
  const sujetoFromPredio = predio?.suj && predio.suj !== "SIN INFORMACION" ? predio.suj : "ERICK SIMON ESCALANTE OLANO";
  const areaFromPredio = predio?.m2 || predio?.area || "1245";
  const [message, setMessage] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [titulares, setTitulares] = useState<Titular[]>([
    {
      id: 1,
      tipoPersona: "NATURAL",
      documento: "70021899",
      nombres: sujetoFromPredio,
      telefonos: "978868159",
      condicionJuridica: "PROPIETARIO NO INSCRITO",
      documentoSustento: "DOCUMENTOS CON FECHA CIERTA",
    },
  ]);
  const [form, setForm] = useState({
    titularRegistral: "",
    telefonoContacto: "",
    condicionTitulares: predio?.cond || "OCUPANTE",
    partidaRegistralMatriz: predio?.part || "",
    partidaRegistralIndependizada: predio?.pind || "",
    documentoAcredita: "CONSTANCIA DE COMUNERO HABIL",
    entidadAcredita: predio?.ofi || "Zona Registral Nro. I - Sede Piura",
    numeroDocumento: "",
    fechaEmision: "2024-05-13",
    entidad: "",
    areaDocumento: areaFromPredio,
    unidadDocumento: "m2",
    lucroCesante: "NO",
    tipoEmpresa: "",
    denominacionNegocio: "",
    giroComercial: "",
    condicionNegocio: "",
    tipoNegocio: "",
    regimen: "",
    actividad: "",
    ruc: "",
  });

  const titularRegistralLabel = useMemo(
    () => form.titularRegistral || titulares.map((item) => item.nombres).join(", "),
    [form.titularRegistral, titulares],
  );

  function setField<K extends keyof typeof form> (key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function removeTitular (id: number) {
    setTitulares((current) => current.filter((item) => item.id !== id));
  }

  function addTitular (titular: TitularForm) {
    if (!titular.documento.trim() || !titular.nombres.trim()) return;
    setTitulares((current) => [
      ...current,
      {
        id: Date.now(),
        tipoPersona: titular.tipoPersona,
        documento: titular.documento,
        nombres: titular.nombres,
        telefonos: titular.telefonos,
        condicionJuridica: titular.condicionJuridica,
        documentoSustento: titular.documentoSustento,
      },
    ]);
    setShowAdd(false);
  }

  function handleSave (status: "BORRADOR" | "REGISTRADO") {
    setMessage(status === "REGISTRADO" ? "Sujeto pasivo registrado correctamente." : "Borrador guardado correctamente.");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Sujeto pasivo"
        badgeLabel="Predio"
        badgeValue={predio?.cod || decodedCodigo}
        badgeSuffix="Información base 1.2"
      />

      <main className="mx-auto max-w-[1400px] p-4">
        <form
          className="bg-white rounded border"
          onSubmit={(event) => {
            event.preventDefault();
            handleSave("BORRADOR");
          }}
        >
          <div className="px-5 py-5">
            <div className="border-b mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border-b-2" style={{ borderColor: RED, color: RED }}>
                <Send size={14} /> Sujeto pasivo
              </div>
            </div>

            {message && (
              <div className="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-[12px] text-green-700">
                {message}
              </div>
            )}

            <SectionTitle>Titulares</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field label="Titular Registral.">
                <input className={inputCls} value={form.titularRegistral} onChange={(event) => setField("titularRegistral", event.target.value)} />
              </Field>
              <Field label="Telefono de Contacto.">
                <input className={inputCls} value={form.telefonoContacto} onChange={(event) => setField("telefonoContacto", event.target.value)} />
              </Field>
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[12px] text-white"
                style={{ background: "#5eaaa8" }}
              >
                <Plus size={14} /> Anadir
              </button>
            </div>

            <div className="mt-3 overflow-x-auto rounded border">
              <table className="min-w-full text-[12px]">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-2 py-2 font-semibold">#</th>
                    <th className="px-2 py-2 font-semibold">TIPO PERSONA</th>
                    <th className="px-2 py-2 font-semibold">DNI / RUC</th>
                    <th className="px-2 py-2 font-semibold">NOMBRES / RAZ. SOCIAL</th>
                    <th className="px-2 py-2 font-semibold">TELEFONOS</th>
                    <th className="px-2 py-2 font-semibold">FOTO IDENTIDAD</th>
                    <th className="px-2 py-2 font-semibold">CONDICION JURIDICA</th>
                    <th className="px-2 py-2 font-semibold">DOC. SUST. TITULARIDAD</th>
                    <th className="px-2 py-2 font-semibold">ARCHIVO SUST. TITULARIDAD</th>
                    <th className="px-2 py-2 text-center font-semibold">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {titulares.map((titular, index) => (
                    <tr key={titular.id} className="border-t align-top hover:bg-gray-50">
                      <td className="px-2 py-2">{index + 1}</td>
                      <td className="px-2 py-2">{titular.tipoPersona}</td>
                      <td className="px-2 py-2">{titular.documento}</td>
                      <td className="px-2 py-2" style={{ color: RED }}>{titular.nombres}</td>
                      <td className="px-2 py-2">{titular.telefonos}</td>
                      <td className="px-2 py-2" />
                      <td className="px-2 py-2">{titular.condicionJuridica}</td>
                      <td className="px-2 py-2" style={{ color: RED }}>{titular.documentoSustento}</td>
                      <td className="px-2 py-2" />
                      <td className="px-2 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button type="button" className="inline-flex size-7 items-center justify-center rounded border text-blue-600" title="Editar titular">
                            <Pencil size={13} />
                          </button>
                          <button type="button" onClick={() => removeTitular(titular.id)} className="inline-flex size-7 items-center justify-center rounded border" style={{ color: RED }} title="Eliminar titular">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-y-2">
              <Field label="Condicion Juridica de los Titulares.">
                <select className={selectCls} value={form.condicionTitulares} onChange={(event) => setField("condicionTitulares", event.target.value)}>
                  <option>OCUPANTE</option>
                  <option>PROPIETARIO</option>
                  <option>PROPIETARIO NO INSCRITO</option>
                </select>
              </Field>
              <Field label="Partida Registral Matriz">
                <input className={inputCls} value={form.partidaRegistralMatriz} onChange={(event) => setField("partidaRegistralMatriz", event.target.value)} />
              </Field>
              <Field label="Partida Registral Independizada">
                <input className={inputCls} value={form.partidaRegistralIndependizada} onChange={(event) => setField("partidaRegistralIndependizada", event.target.value)} />
              </Field>
              <Field label="Documento que Acredita la Titularidad del Predio">
                <select className={selectCls} value={form.documentoAcredita} onChange={(event) => setField("documentoAcredita", event.target.value)}>
                  <option>CONSTANCIA DE COMUNERO HABIL</option>
                  <option>PARTIDA REGISTRAL</option>
                  <option>ESCRITURA PUBLICA</option>
                  <option>DOCUMENTOS CON FECHA CIERTA</option>
                </select>
              </Field>
              <Field label="Entidad que Acredita la Titularidad">
                <input className={inputCls} value={form.entidadAcredita} onChange={(event) => setField("entidadAcredita", event.target.value)} />
              </Field>
              <Field label="Numero de Documento que Acredita la Titularidad del Predio">
                <input className={inputCls} value={form.numeroDocumento} onChange={(event) => setField("numeroDocumento", event.target.value)} />
              </Field>
              <Field label="Fecha de Emision">
                <input type="date" className={inputCls} value={form.fechaEmision} onChange={(event) => setField("fechaEmision", event.target.value)} />
              </Field>
              <Field label="Entidad">
                <input className={inputCls} value={form.entidad} onChange={(event) => setField("entidad", event.target.value)} />
              </Field>
              <Field label="Area del Documento de Propiedad" required>
                <input className={inputCls} value={form.areaDocumento} onChange={(event) => setField("areaDocumento", event.target.value)} />
              </Field>
              <Field label="Unidades del Documento de Propiedad.">
                <select className={selectCls} value={form.unidadDocumento} onChange={(event) => setField("unidadDocumento", event.target.value)}>
                  <option>m2</option>
                  <option>ha</option>
                </select>
              </Field>
            </div>


            <div className="mt-3 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-[12px] text-gray-600">
              Titular registral consolidado: <span className="font-medium text-gray-900">{titularRegistralLabel || "Sin titulares registrados"}</span>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t pt-3">
              <button type="button" onClick={() => window.history.back()} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50">
                <X size={14} /> Cancelar
              </button>
              <button type="submit" className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50">
                <Save size={14} /> Guardar borrador
              </button>
              <button type="button" onClick={() => handleSave("REGISTRADO")} className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white" style={{ background: RED }}>
                <Send size={14} /> Registrar sujeto pasivo
              </button>
            </div>
          </div>
        </form>
      </main>

      {showAdd && <TitularDialog onClose={() => setShowAdd(false)} onAdd={addTitular} />}
    </div>
  );
}

function TitularDialog ({ onClose, onAdd }: { onClose: () => void; onAdd: (titular: TitularForm) => void }) {
  const [titular, setTitular] = useState<TitularForm>({
    id: 0,
    tipoPersona: "NATURAL",
    documento: "",
    nombres: "",
    telefonos: "",
    fechaCaducidadDni: "",
    departamento: "",
    provincia: "",
    distrito: "",
    direccion: "",
    condicionJuridica: "PROPIETARIO NO INSCRITO",
    estadoCivil: "SOLTERO",
    documentoSustento: "DOCUMENTOS CON FECHA CIERTA",
  });
  const [reniecLoading, setReniecLoading] = useState(false);
  const [reniecFileName, setReniecFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function setTitularField<K extends keyof TitularForm> (key: K, value: TitularForm[K]) {
    setTitular((current) => ({ ...current, [key]: value }));
  }

  function handleReniecUpload (event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setReniecFileName(file.name);
    setReniecLoading(true);

    // Simulate PDF data extraction with a delay
    setTimeout(() => {
      setTitular((current) => ({
        ...current,
        documento: "70021899",
        nombres: "ERICK SIMON ESCALANTE OLANO",
        fechaCaducidadDni: "2030-12-15",
        departamento: "PIURA",
        provincia: "PIURA",
        distrito: "CASTILLA",
        direccion: "AV. PROGRESO 234, URB. MIRAFLORES",
        telefonos: "978868159",
        estadoCivil: "SOLTERO",
      }));
      setReniecLoading(false);
    }, 2000);

    // Reset the input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="relative max-h-[90vh] w-[462px] overflow-auto rounded-lg bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        {/* RENIEC processing overlay */}
        {reniecLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-white/90">
            <Loader2 size={36} className="animate-spin text-red-600" />
            <p className="mt-3 text-[13px] font-semibold text-gray-700">Procesando ficha RENIEC...</p>
            <p className="mt-1 text-[11px] text-gray-500">Extrayendo datos del documento PDF</p>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <div className="text-[14px]">
            <span className="text-gray-700">Agregar </span>
            <span className="font-semibold" style={{ color: RED }}>TITULAR</span>
          </div>
          <button type="button" onClick={onClose} className="inline-flex size-7 items-center justify-center rounded hover:bg-gray-100" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2">
          <Field label="Tipo persona" required>
            <select className={selectCls} value={titular.tipoPersona} onChange={(event) => setTitularField("tipoPersona", event.target.value as TitularForm["tipoPersona"])}>
              <option>NATURAL</option>
              <option>JURIDICA</option>
            </select>
          </Field>
          <Field label="DNI" required>
            <div className="space-y-1">
              <input className={inputCls} value={titular.documento} onChange={(event) => setTitularField("documento", event.target.value)} />
              <div className="grid grid-cols-3 gap-1">
                {/* Hidden file input for RENIEC PDF upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleReniecUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex min-h-8 items-center justify-center gap-1 rounded border border-red-200 bg-red-50 px-2 text-center text-[10px] font-medium text-red-700 hover:bg-red-100 transition-colors"
                >
                  <Upload size={13} /> Subir ficha RENIEC
                </button>
                <button type="button" className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-2 text-center text-[11px] hover:bg-gray-100">
                  <Search size={13} /> Validacion ficha RENIEC
                </button>
                <button type="button" className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-2 text-center text-[11px] hover:bg-gray-100">
                  <Search size={13} /> Buscar DNI
                </button>
              </div>
              {reniecFileName && (
                <div className="flex items-center gap-1.5 rounded border border-green-200 bg-green-50 px-2 py-1">
                  <FileText size={13} className="shrink-0 text-green-600" />
                  <span className="truncate text-[10px] text-green-700">{reniecFileName}</span>
                  <span className="ml-auto shrink-0 text-[9px] font-medium text-green-600">✓ Datos cargados</span>
                </div>
              )}
            </div>
          </Field>
          <Field label="Nombres y Apellidos" required>
            <input className={inputCls} value={titular.nombres} onChange={(event) => setTitularField("nombres", event.target.value)} />
          </Field>
          <Field label="Fecha caducidad DNI">
            <input type="date" className={inputCls} value={titular.fechaCaducidadDni} onChange={(event) => setTitularField("fechaCaducidadDni", event.target.value)} />
          </Field>
          <Field label="Departamento de domicilio">
            <input className={inputCls} value={titular.departamento} onChange={(event) => setTitularField("departamento", event.target.value)} />
          </Field>
          <Field label="Provincia de domicilio">
            <input className={inputCls} value={titular.provincia} onChange={(event) => setTitularField("provincia", event.target.value)} />
          </Field>
          <Field label="Distrito de domicilio">
            <input className={inputCls} value={titular.distrito} onChange={(event) => setTitularField("distrito", event.target.value)} />
          </Field>
          <Field label="Direccion" required>
            <input className={inputCls} value={titular.direccion} onChange={(event) => setTitularField("direccion", event.target.value)} />
          </Field>
          <Field label="Telf. de contacto" required>
            <input className={inputCls} value={titular.telefonos} onChange={(event) => setTitularField("telefonos", event.target.value)} />
          </Field>
          <Field label="Foto Identidad">
            <input type="file" className="w-full text-[11px]" />
          </Field>
          <Field label="Condicion Juridica" required>
            <select className={selectCls} value={titular.condicionJuridica} onChange={(event) => setTitularField("condicionJuridica", event.target.value)}>
              <option>PROPIETARIO NO INSCRITO</option>
              <option>PROPIETARIO</option>
              <option>OCUPANTE</option>
            </select>
          </Field>
          <Field label="Estado civil" required>
            <select className={selectCls} value={titular.estadoCivil} onChange={(event) => setTitularField("estadoCivil", event.target.value)}>
              <option>SOLTERO</option>
              <option>CASADO</option>
              <option>CONVIVIENTE</option>
              <option>VIUDO</option>
            </select>
          </Field>
          <Field label="Documento que sustenta titularidad" required>
            <select className={selectCls} value={titular.documentoSustento} onChange={(event) => setTitularField("documentoSustento", event.target.value)}>
              <option>DOCUMENTOS CON FECHA CIERTA</option>
              <option>CONSTANCIA DE COMUNERO HABIL</option>
              <option>PARTIDA REGISTRAL</option>
            </select>
          </Field>
          <Field label="Archivo Documento Sustento Titularidad">
            <input type="file" className="w-full text-[11px]" />
          </Field>
        </div>

        <div className="mt-5 flex justify-center gap-2">
          <button type="button" onClick={() => onAdd(titular)} className="inline-flex items-center gap-1.5 rounded px-6 py-1.5 text-[12px] text-white" style={{ background: RED }}>
            <Plus size={14} /> Agregar
          </button>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-6 py-1.5 text-[12px] hover:bg-gray-50">
            <X size={14} /> Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
