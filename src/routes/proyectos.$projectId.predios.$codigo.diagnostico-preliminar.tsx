import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Save, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { ProjectPageHeader } from "@/components/ProjectPageHeader";
import { getPredioByCodigo } from "@/lib/prediosData";
import { getProyecto } from "@/lib/projectsData";

export const Route = createFileRoute(
  "/proyectos/$projectId/predios/$codigo/diagnostico-preliminar",
)({
  head: () => ({
    meta: [
      { title: "Diagnóstico preliminar" },
      {
        name: "description",
        content: "Diagnóstico físico, catastral, registral y legal del predio.",
      },
    ],
  }),
  component: DiagnosticoPreliminarPage,
});

const RED = "#dc2626";
const inputCls =
  "h-8 w-full rounded border border-gray-300 bg-white px-2 text-[12px] focus:border-gray-500 focus:outline-none";
const selectCls = `${inputCls} appearance-none`;
const textareaCls =
  "w-full rounded border border-gray-300 bg-white p-2 text-[12px] focus:border-gray-500 focus:outline-none";

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-4 border-b pb-1 first:mt-0">
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
    <div className={`grid grid-cols-[180px_1fr] items-start gap-2 ${className}`}>
      <label className="pt-2 text-right text-[12px] text-gray-700">
        {required && <span style={{ color: RED }}>* </span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function DiagnosticoPreliminarPage() {
  const { projectId, codigo } = Route.useParams();
  const navigate = useNavigate();
  const decodedCodigo = decodeURIComponent(codigo);
  const proyecto = getProyecto(projectId);
  const predio = getPredioByCodigo(decodedCodigo);
  const projectLabel = proyecto
    ? `${proyecto.tipo === "Aeroportuarios" ? "Aeropuerto de " : ""}${proyecto.nombre}`
    : projectId;
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    fechaDiagnostico: "",
    resultado: "",
    situacionFisica: "",
    situacionCatastral: "",
    situacionRegistral: "",
    situacionLegal: "",
    antecedentes: "",
    observaciones: "",
    recomendacion: "",
  });

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <ProjectPageHeader
        projectId={projectId}
        projectLabel={projectLabel}
        title="Diagnóstico preliminar"
        badgeLabel="Predio"
        badgeValue={predio?.cod || decodedCodigo}
        badgeSuffix="Información base"
      />

      <main className="mx-auto max-w-[1400px] p-4">
        <form
          className="rounded border bg-white"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("Diagnóstico preliminar guardado correctamente.");
          }}
        >
          <div className="px-5 py-5">
            <div className="mb-3 border-b">
              <div
                className="inline-block border-b-2 px-3 py-1.5 text-[12px] font-medium"
                style={{ borderColor: RED, color: RED }}
              >
                1.4 Diagnóstico preliminar
              </div>
            </div>

            {message && (
              <div className="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-[11px] text-green-700">
                {message}
              </div>
            )}

            <SectionTitle>Control del diagnóstico</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field label="Código de predio">
                <input className={`${inputCls} bg-gray-50`} value={decodedCodigo} readOnly />
              </Field>
              <Field label="Fecha de diagnóstico" required>
                <input
                  type="date"
                  className={inputCls}
                  value={form.fechaDiagnostico}
                  onChange={(event) => setField("fechaDiagnostico", event.target.value)}
                />
              </Field>
              <Field label="Resultado preliminar" required>
                <select
                  className={selectCls}
                  value={form.resultado}
                  onChange={(event) => setField("resultado", event.target.value)}
                >
                  <option value="">-- SELECCIONE --</option>
                  <option>EN EVALUACIÓN</option>
                  <option>CONFORME</option>
                  <option>OBSERVADO</option>
                  <option>INFORMACIÓN INSUFICIENTE</option>
                </select>
              </Field>
              <Field label="Acción recomendada">
                <select
                  className={selectCls}
                  value={form.recomendacion}
                  onChange={(event) => setField("recomendacion", event.target.value)}
                >
                  <option value="">-- SELECCIONE --</option>
                  <option>CONTINUAR DIAGNÓSTICO TÉCNICO-LEGAL</option>
                  <option>PROGRAMAR INSPECCIÓN DE CAMPO</option>
                  <option>SOLICITAR INFORMACIÓN REGISTRAL</option>
                  <option>SUBSANAR OBSERVACIONES</option>
                </select>
              </Field>
            </div>

            <SectionTitle>Situación preliminar del predio</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="Situación física" required>
                <textarea
                  rows={3}
                  className={textareaCls}
                  value={form.situacionFisica}
                  onChange={(event) => setField("situacionFisica", event.target.value)}
                />
              </Field>
              <Field label="Situación catastral" required>
                <textarea
                  rows={3}
                  className={textareaCls}
                  value={form.situacionCatastral}
                  onChange={(event) => setField("situacionCatastral", event.target.value)}
                />
              </Field>
              <Field label="Situación registral" required>
                <textarea
                  rows={3}
                  className={textareaCls}
                  value={form.situacionRegistral}
                  onChange={(event) => setField("situacionRegistral", event.target.value)}
                />
              </Field>
              <Field label="Situación legal" required>
                <textarea
                  rows={3}
                  className={textareaCls}
                  value={form.situacionLegal}
                  onChange={(event) => setField("situacionLegal", event.target.value)}
                />
              </Field>
            </div>

            <SectionTitle>Antecedentes y observaciones</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="Antecedentes">
                <textarea
                  rows={4}
                  className={textareaCls}
                  value={form.antecedentes}
                  onChange={(event) => setField("antecedentes", event.target.value)}
                />
              </Field>
              <Field label="Observaciones">
                <textarea
                  rows={4}
                  className={textareaCls}
                  value={form.observaciones}
                  onChange={(event) => setField("observaciones", event.target.value)}
                />
              </Field>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/proyectos/$projectId/predios/$codigo/identificacion-codificacion",
                    params: { projectId, codigo: decodedCodigo },
                  })
                }
                className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-4 py-1.5 text-[12px] hover:bg-gray-50"
              >
                <X size={14} /> Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[12px] text-white"
                style={{ background: RED }}
              >
                <Save size={14} /> Guardar
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
