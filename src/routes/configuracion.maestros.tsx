import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Database, Search, Power, X } from "lucide-react";
import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/configuracion/maestros")({
  head: () => ({ meta: [{ title: "Configuración · Maestros" }] }),
  component: MaestrosPage,
});

type Maestro = { key: string; label: string; values: string[] };
type Grupo = { titulo: string; items: Maestro[] };

const serviciosAprValues = [
  "1.MAQUINAS Y EQUIPOS - 2.6.3.2.1.1",
  "2.MOBILIARIO - 2.6.3.2.1.2",
  "1.EQUIPOS COMPUTACIONALES Y PERIFERICOS - 2.6.3.2.3.1",
  "1.AIRE ACONDICIONADO Y REFRIGERACION - 2.6.3.2.9.1",
  "5.EQUIPOS E INSTRUMENTOS DE MEDICION - 2.6.3.2.9.5",
  "1.TERRENOS URBANOS - 2.6.5.1.1.1",
  "2.TERRENOS RURALES - 2.6.5.1.1.2",
  "2.SOFTWARES - 2.6.6.1.3.2",
  "2.GASTO POR LA COMPRA DE BIENES - 2.6.8.1.4.2",
  "3.GASTO POR LA CONTRATACION DE SERVICIOS - 2.6.8.1.4.3",
  "4.GASTO POR LAUDOS ARBITRALES O SENTENCIAS VINCULADAS A INVERSIONES - 2.6.8.1.4.4",
  "99.OTROS GASTOS - 2.6.8.1.4.99",
  "3.EQUIPOS DE TELECOMUNICACIONES - 2.6.3.2.3.3",
];

const GRUPOS: Grupo[] = [
  {
    titulo: "Ubicación geográfica",
    items: [
      { key: "departamentos", label: "Departamentos", values: ["AMAZONAS", "ANCASH", "APURIMAC", "AREQUIPA", "AYACUCHO", "CAJAMARCA", "CALLAO", "CUSCO", "HUANCAVELICA", "HUANUCO", "ICA", "JUNIN", "LA LIBERTAD", "LAMBAYEQUE", "LIMA", "LORETO", "MADRE DE DIOS", "MOQUEGUA", "PASCO", "PIURA", "PUNO", "SAN MARTIN", "TACNA", "TUMBES", "UCAYALI"] },
      { key: "provincias", label: "Provincias", values: [] },
      { key: "distritos", label: "Distritos", values: [] },
    ],
  },
  {
    titulo: "Predio",
    items: [
      { key: "tipo-predio", label: "Tipo de predio", values: ["URBANO", "RURAL"] },
      { key: "estado-predio", label: "Estado del predio", values: ["DESIGNADO", "POR MEDIR", "MEDIDO", "NEGATIVO", "LISTO PARA TASAR", "CON TASACIÓN"] },
      { key: "uso-predio", label: "Uso del predio", values: ["VIVIENDA", "VIVIENDA-COMERCIO", "COMERCIO", "TERRENO", "ALMACEN", "AGRÍCOLA", "ERIAZO", "EXPANSIÓN URBANA", "ISLA RÚSTICA"] },
      { key: "condicion-rustico", label: "Condición de rústico", values: ["AGRÍCOLA", "ERIAZO", "EXPANSIÓN URBANA", "ISLA RÚSTICA"] },
      { key: "tipo-via", label: "Tipo de vía", values: ["AVENIDA", "CARRETERA NACIONAL", "PASAJE", "JIRÓN", "ALAMEDA", "CALLE", "PROLONGACIÓN", "MALECÓN"] },
      { key: "lado", label: "Lado", values: ["DERECHO", "IZQUIERDO", "DERECHO/IZQUIERDO"] },
      { key: "tipo-servidumbre", label: "Tipo de servidumbre", values: ["NINGUNO", "SERVIDUMBRE DE PASO", "SERVIDUMBRE DE PASO DE LÍNEAS ELÉCTRICAS, AÉREAS O ENTERRADAS DE ALTA TENSIÓN", "SERVIDUMBRE DE AGUAS", "SERVIDUMBRE DE DESAGÜE", "SERVIDUMBRE DE ACUEDUCTO", "SERVIDUMBRE DE COSTAS Y RÍOS", "SERVIDUMBRE DE LUCES Y VISTAS", "SERVIDUMBRE DE MEDIANERÍA", "SERVIDUMBRES AERONÁUTICAS", "SERVIDUMBRES DE CARRETERAS Y FERROCARRILES", "SERVIDUMBRE DE BALCÓN", "SERVIDUMBRE DE PALCO O BUTACA", "SERVIDUMBRES DE SACA DE LEÑA", "SERVIDUMBRE DE COMUNIDAD DE PASTOS"] },
    ],
  },
  {
    titulo: "Titularidad y documentos",
    items: [
      { key: "condicion-juridica", label: "Condición jurídica del propietario", values: ["PROPIETARIO", "PROPIETARIO NO INSCRITO", "POSESIONARIO MAYOR A 10 AÑOS (6.3)", "OCUPANTE", "PROPIEDAD DEL ESTADO PERUANO", "TRANSFERENCIA INTERESTATAL", "POSESIONARIO MAYOR A 10 AÑOS (7.2)", "COMUNERO"] },
      { key: "documento-titularidad", label: "Documento que acredita la titularidad", values: ["CERTIFICADO DE FORMALIZACIÓN DE LA PROPIEDAD RURAL OTORGADO POR COFOPRI", "CONSTANCIA DE POSESIÓN", "CONSTANCIA DE COMUNERO HÁBIL", "CONTRATO DE TRANSFERENCIA", "CONTRATO PRIVADO DE COMPRAVENTA DE ACCIONES Y DERECHOS", "DECLARACIÓN JURADA DE 6 VECINOS", "DOCUMENTOS CON FECHA CIERTA", "PARTIDA REGISTRAL", "SOLICITUD DE CONSTANCIA DE POSESIÓN", "TÍTULO DE PROPIEDAD", "MINUTA DE COMPRAVENTA"] },
      { key: "entidad-titularidad", label: "Entidad que acredita la titularidad", values: ["Zona Registral N° I - Sede Piura", "Zona Registral N° II - Sede Chiclayo", "Zona Registral N° III - Sede Moyobamba", "Zona Registral N° IV - Sede Iquitos", "Zona Registral N° V - Sede Trujillo", "Zona Registral N° VI - Sede Pucallpa", "Zona Registral N° VII - Sede Huaraz", "Zona Registral N° VIII - Sede Huancayo", "Zona Registral N° IX - Sede Lima", "Zona Registral N° X - Sede Cusco", "Zona Registral N° XI - Sede Ica", "Zona Registral N° XII - Sede Arequipa", "Zona Registral N° XIII - Sede Tacna", "Zona Registral N° XIV - Sede Ayacucho", "Gobierno Regional", "Gobierno Municipal", "COFOPRI", "Comunidad Campesina", "Otros"] },
      { key: "unidad-doc-propiedad", label: "Unidades del documento de propiedad", values: ["m²", "ha"] },
    ],
  },
  {
    titulo: "Tasación",
    items: [
      { key: "periodo-tasacion", label: "Tipo periodo tasación", values: ["ACTUAL", "RETROSPECTIVA"] },
      { key: "tipo-tasacion", label: "Tipo de tasación", values: ["COMERCIAL", "REGLAMENTARIA"] },
      { key: "monedas", label: "Monedas", values: ["PEN - Soles", "USD - Dólares", "EUR - Euros"] },
    ],
  },
  {
    titulo: "Planos y cartografía",
    items: [
      { key: "datum-planos", label: "Datum de los planos", values: ["PSAD56", "WGS84 - ZONA 18S", "WGS84"] },
      { key: "unidad-medida", label: "Unidad de medida", values: ["m", "m²", "m³", "ha", "km", "km²", "und", "ml"] },
    ],
  },
  {
    titulo: "Edificación / Construcción",
    items: [
      { key: "material-predominante", label: "Material predominante", values: ["ACERO", "ADOBE", "ALUMINIO", "ALUZINC", "ASFALTO", "CALAMINA", "CALAMINA METÁLICA", "CALAMINA PLASTIFICADA", "CALAMINA TIPO ETERNIT", "COBRE", "CONCRETO", "DRYWALL", "FIBRA DE VIDRIO", "FIERRO", "FIERRO LISO", "GRANITO", "LADRILLO", "LONA", "LOSA", "MADERA", "MATERIAL LIGERO", "PIEDRA", "POLIETILENO", "POLIPROPILENO", "TRIPLAY", "QUINCHA", "TAPIAL", "VIDRIO"] },
      { key: "estado-conservacion", label: "Estado de conservación", values: ["MUY BUENO", "BUENO", "REGULAR", "MALO", "MUY MALO"] },
      { key: "estado-construccion", label: "Estado de construcción", values: ["TERMINADO", "INCONCLUSO", "EN CONSTRUCCIÓN"] },
      { key: "uso-obra-complementaria", label: "Uso de obra complementaria", values: ["ALMACÉN", "ALTILLO", "AZOTEA", "BAÑO", "CANAL", "CERCO FRONTAL", "CERCO PERIMÉTRICO", "COBERTIZO", "COBERTURA", "COCHERA", "COLUMNA", "CRIANZA DE AVES", "CUBIERTA", "DEPÓSITO", "ESCALERA", "HORNO", "LAVADERO", "LOSA", "MESADA", "MURO", "MURO DE CONTENCIÓN", "PARAPETO", "PARRILLA", "PASADIZO", "PATIO", "PIRCA", "PISO", "PÓRTICO", "PORTÓN", "POZA", "PROTECCIÓN", "RAMAL", "RAMPA", "REJA", "RESERVORIO", "SARDINEL", "TANQUE ELEVADO", "TECHO", "TENDAL", "VEREDA"] },
    ],
  },
  {
    titulo: "Cultivos",
    items: [
      { key: "plantaciones-frutales", label: "Plantaciones frutales", values: ["ALFALFA", "CAPULÍ", "CHIRIMOYA", "DURAZNO", "GRANADILLA", "LIMÓN", "LÚCUMA", "MANDARINA", "MANZANA", "MARACUYÁ", "MEMBRILLO", "MORA", "NARANJA", "NÍSPERO", "PACAY", "PALTA", "PAPAYA", "PLÁTANO", "SÁBILA", "SANKY", "TANGELO", "TUNA", "UVA", "PIÑA", "MANGO"] },
      { key: "plantaciones-forestales", label: "Plantaciones forestales", values: ["EUCALIPTO", "PINO", "CIPRÉS", "MOLLE", "ALISO", "QUEÑUA", "QUINUAL", "TARA", "HUARANGO", "CAOBA", "CEDRO", "ISHPINGO", "TORNILLO", "SHIHUAHUACO", "BOLAINA", "CAPIRONA"] },
      { key: "plantaciones-transitorias", label: "Plantaciones transitorias", values: ["CAÑA DE AZÚCAR", "CEBADA", "CEBOLLA", "COL", "HABA", "MAÍZ", "OCA", "PAPA", "TARA", "TRIGO", "ZAPALLO", "ARROZ", "QUINUA", "KIWICHA", "OLLUCO", "ARVEJA", "FRIJOL", "YUCA", "CAMOTE", "ALGODÓN", "ESPÁRRAGO", "TOMATE", "AJÍ", "ZANAHORIA"] },
    ],
  },
  {
    titulo: "Organización",
    items: [
      { key: "tipos-infra", label: "Tipos de infraestructura", values: ["CARRETERA", "PUENTE", "AEROPUERTO", "PUERTO", "FERROCARRIL", "LÍNEA DE TRANSMISIÓN", "HIDROELÉCTRICA", "SANEAMIENTO"] },
      { key: "cargos", label: "Cargos / Puestos", values: ["COORDINADOR", "ESPECIALISTA LEGAL", "ESPECIALISTA TÉCNICO", "TASADOR", "TOPÓGRAFO", "ASISTENTE SOCIAL", "ASISTENTE TÉCNICO", "ASISTENTE LEGAL", "JEFE DE PROYECTO", "GERENTE"] },
    ],
  },
  {
    titulo: "Servicios APR",
    items: [
      { key: "tipos-servicio-apr", label: "Tipos de servicio APR", values: serviciosAprValues },
    ],
  },
];

const ALL_MAESTROS: Maestro[] = GRUPOS.flatMap((g) => g.items);

type Row = { id: number; codigo: string; descripcion: string; activo: boolean };
const seedRows = (m: Maestro): Row[] => {
  const prefix = m.key.slice(0, 3).toUpperCase();
  if (m.values.length === 0) {
    return Array.from({ length: 4 }).map((_, i) => ({
      id: i + 1,
      codigo: `${prefix}-${String(i + 1).padStart(3, "0")}`,
      descripcion: `Pendiente de carga ${i + 1}`,
      activo: true,
    }));
  }
  return m.values.map((v, i) => ({
    id: i + 1,
    codigo: `${prefix}-${String(i + 1).padStart(3, "0")}`,
    descripcion: v,
    activo: true,
  }));
};

function MaestrosPage() {
  const [selected, setSelected] = useState<Maestro>(ALL_MAESTROS[0]);
  const [store, setStore] = useState<Record<string, Row[]>>(() => ({
    [ALL_MAESTROS[0].key]: seedRows(ALL_MAESTROS[0]),
  }));
  const [q, setQ] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [modal, setModal] = useState<{ mode: "create" | "edit"; row: Row } | null>(null);
  const [confirm, setConfirm] = useState<Row | null>(null);

  const rows = store[selected.key] ?? [];

  const pick = (m: Maestro) => {
    setSelected(m);
    setStore((s) => (s[m.key] ? s : { ...s, [m.key]: seedRows(m) }));
    setQ("");
  };

  const updateRows = (fn: (rs: Row[]) => Row[]) =>
    setStore((s) => ({ ...s, [selected.key]: fn(s[selected.key] ?? []) }));

  const openCreate = () => {
    const prefix = selected.key.slice(0, 3).toUpperCase();
    const nextId = (rows.reduce((a, r) => Math.max(a, r.id), 0) || 0) + 1;
    setModal({
      mode: "create",
      row: { id: nextId, codigo: `${prefix}-${String(nextId).padStart(3, "0")}`, descripcion: "", activo: true },
    });
  };

  const openEdit = (r: Row) => setModal({ mode: "edit", row: { ...r } });

  const save = () => {
    if (!modal) return;
    const r = modal.row;
    if (!r.descripcion.trim() || !r.codigo.trim()) return;
    updateRows((rs) =>
      modal.mode === "create" ? [...rs, r] : rs.map((x) => (x.id === r.id ? r : x))
    );
    setModal(null);
  };

  const toggleActivo = (r: Row) =>
    updateRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, activo: !x.activo } : x)));

  const remove = () => {
    if (!confirm) return;
    updateRows((rs) => rs.filter((x) => x.id !== confirm.id));
    setConfirm(null);
  };

  const filtered = rows.filter(
    (r) => !q || r.codigo.toLowerCase().includes(q.toLowerCase()) || r.descripcion.toLowerCase().includes(q.toLowerCase())
  );

  const gruposFiltrados = useMemo(() => {
    if (!groupFilter) return GRUPOS;
    const t = groupFilter.toLowerCase();
    return GRUPOS.map((g) => ({
      ...g,
      items: g.items.filter((i) => i.label.toLowerCase().includes(t)),
    })).filter((g) => g.items.length > 0);
  }, [groupFilter]);

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <AppSidebar />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database size={18} className="text-[#dc2626]" />
          <h1 className="text-[18px] font-semibold">Maestros del sistema</h1>
          <span className="ml-2 text-[12px] text-[#6b7280]">{ALL_MAESTROS.length} catálogos</span>
        </div>
        <div className="grid grid-cols-[300px_1fr] gap-4">
          <aside className="bg-white border border-[#e5e7eb] rounded-lg p-2 h-fit max-h-[calc(100vh-140px)] overflow-y-auto">
            <div className="px-2 pt-1 pb-2">
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  placeholder="Filtrar catálogos..."
                  className="w-full pl-7 pr-2 py-1.5 border border-[#d1d5db] rounded-md text-[12px]"
                />
              </div>
            </div>
            {gruposFiltrados.map((g) => (
              <div key={g.titulo} className="mb-2">
                <div className="text-[10px] text-[#6b7280] px-2 py-1 font-semibold tracking-wider uppercase">{g.titulo}</div>
                {g.items.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => pick(m)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[13px] text-left ${
                      selected.key === m.key ? "bg-[#fef2f2] text-[#dc2626] font-medium" : "hover:bg-[#f3f4f6] text-[#374151]"
                    }`}
                  >
                    <span className="truncate">{m.label}</span>
                    <span className="text-[11px] text-[#6b7280] ml-2">{m.values.length || "—"}</span>
                  </button>
                ))}
              </div>
            ))}
          </aside>

          <section className="bg-white border border-[#e5e7eb] rounded-lg">
            <header className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb]">
              <div>
                <div className="text-[14px] font-semibold">{selected.label}</div>
                <div className="text-[11px] text-[#6b7280]">{rows.length} registros · Editar valores del catálogo</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar..."
                    className="pl-7 pr-3 py-1.5 border border-[#d1d5db] rounded-md text-[13px] w-56"
                  />
                </div>
                <button onClick={openCreate} className="flex items-center gap-1 px-3 py-1.5 bg-[#dc2626] text-white rounded-md text-[13px] hover:bg-[#b91c1c]">
                  <Plus size={14} /> Nuevo
                </button>
              </div>
            </header>
            <table className="w-full text-[13px]">
              <thead className="bg-[#f9fafb] text-[#6b7280]">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Código</th>
                  <th className="text-left px-4 py-2 font-medium">Descripción</th>
                  <th className="text-left px-4 py-2 font-medium">Estado</th>
                  <th className="text-right px-4 py-2 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-[#f1f5f9]">
                    <td className="px-4 py-2 font-mono text-[12px]">{r.codigo}</td>
                    <td className="px-4 py-2">{r.descripcion}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${r.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {r.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => openEdit(r)} title="Editar" className="p-1 hover:bg-[#f3f4f6] rounded text-[#dc2626]"><Pencil size={14} /></button>
                      <button onClick={() => toggleActivo(r)} title={r.activo ? "Inactivar" : "Activar"} className={`p-1 hover:bg-[#f3f4f6] rounded ${r.activo ? "text-amber-600" : "text-green-600"}`}><Power size={14} /></button>
                      <button onClick={() => setConfirm(r)} title="Eliminar" className="p-1 hover:bg-[#f3f4f6] rounded text-red-600"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-[12px] text-[#9ca3af]">Sin registros</td></tr>
                )}
              </tbody>
            </table>
          </section>
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb]">
                <div className="text-[14px] font-semibold">
                  {modal.mode === "create" ? "Nuevo registro" : "Editar registro"} · {selected.label}
                </div>
                <button onClick={() => setModal(null)} className="p-1 hover:bg-[#f3f4f6] rounded"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-[11px] text-[#6b7280] mb-1">Código</label>
                  <input
                    value={modal.row.codigo}
                    onChange={(e) => setModal({ ...modal, row: { ...modal.row, codigo: e.target.value } })}
                    className="w-full px-3 py-1.5 border border-[#d1d5db] rounded-md text-[13px] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#6b7280] mb-1">Descripción</label>
                  <input
                    autoFocus
                    value={modal.row.descripcion}
                    onChange={(e) => setModal({ ...modal, row: { ...modal.row, descripcion: e.target.value } })}
                    className="w-full px-3 py-1.5 border border-[#d1d5db] rounded-md text-[13px]"
                  />
                </div>
                <label className="flex items-center gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    checked={modal.row.activo}
                    onChange={(e) => setModal({ ...modal, row: { ...modal.row, activo: e.target.checked } })}
                  />
                  Activo
                </label>
              </div>
              <div className="flex justify-end gap-2 px-4 py-3 border-t border-[#e5e7eb] bg-[#f9fafb]">
                <button onClick={() => setModal(null)} className="px-3 py-1.5 text-[13px] border border-[#d1d5db] rounded-md hover:bg-white">Cancelar</button>
                <button onClick={save} className="px-3 py-1.5 text-[13px] bg-[#dc2626] text-white rounded-md hover:bg-[#b91c1c]">Guardar</button>
              </div>
            </div>
          </div>
        )}

        {confirm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirm(null)}>
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl w-full max-w-sm">
              <div className="px-4 py-3 border-b border-[#e5e7eb] text-[14px] font-semibold">Eliminar registro</div>
              <div className="p-4 text-[13px] text-[#374151]">
                ¿Eliminar <span className="font-medium">{confirm.descripcion}</span> ({confirm.codigo})? Esta acción no se puede deshacer.
              </div>
              <div className="flex justify-end gap-2 px-4 py-3 border-t border-[#e5e7eb] bg-[#f9fafb]">
                <button onClick={() => setConfirm(null)} className="px-3 py-1.5 text-[13px] border border-[#d1d5db] rounded-md hover:bg-white">Cancelar</button>
                <button onClick={remove} className="px-3 py-1.5 text-[13px] bg-red-600 text-white rounded-md hover:bg-red-700">Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
