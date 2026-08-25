import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, Eye, Layers3, X } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/seguimiento-monitoreo")({
  component: SeguimientoMonitoreoLayout,
});

const monitorGuides: Record<
  string,
  { title: string; description: string; questions: [string, string, string] }
> = {
  general: {
    title: "Resumen general",
    description:
      "Ofrece una lectura rápida del estado de los proyectos y permite ubicar dónde actuar primero.",
    questions: [
      "¿Qué proyecto necesita atención?",
      "¿Cuál es su avance físico y financiero?",
      "¿Dónde están las alertas principales?",
    ],
  },
  "dashboard-geografico": {
    title: "Dashboard geográfico",
    description:
      "Integra en un mapa nacional el avance financiero, físico y predial de los proyectos de infraestructura.",
    questions: [
      "¿Dónde se encuentran los proyectos críticos?",
      "¿Qué proyecto tiene menor disponibilidad predial?",
      "¿En qué fase se detienen los predios?",
    ],
  },
  "dashboard-financiero": {
    title: "Presupuesto y pagos",
    description:
      "Compara el presupuesto disponible con lo aprobado, devengado, pagado y pendiente.",
    questions: [
      "¿Cuánto presupuesto existe?",
      "¿Cuánto se ha ejecutado?",
      "¿Dónde existe déficit o riesgo?",
    ],
  },
  "cartera-liberacion": {
    title: "Avance y disponibilidad predial",
    description:
      "Explica cuántos predios están disponibles y cuáles todavía impiden el avance de la obra.",
    questions: [
      "¿Cuántos predios están liberados?",
      "¿En qué etapa están los pendientes?",
      "¿Qué casos afectan el cronograma?",
    ],
  },
  "tecnico-tasaciones": {
    title: "Expedientes y tasaciones",
    description:
      "Resume el estado técnico de los expedientes y las diferencias entre estimación, tasación y pago.",
    questions: [
      "¿Qué expedientes están pendientes?",
      "¿Qué tasaciones están observadas?",
      "¿Dónde existen sobrecostos?",
    ],
  },
  "contractual-servicios-interferencias": {
    title: "Contratos e interferencias",
    description:
      "Relaciona el desempeño de contratos y proveedores con la atención de servicios e interferencias.",
    questions: [
      "¿Qué contratos están por vencer?",
      "¿Qué proveedor presenta retrasos?",
      "¿Qué interferencia sigue siendo crítica?",
    ],
  },
  "legal-riesgos-plazos": {
    title: "Situación legal y plazos",
    description:
      "Prioriza casos jurídicos, vencimientos y riesgos que requieren una acción inmediata.",
    questions: [
      "¿Qué plazo está por vencer?",
      "¿Qué predio tiene riesgo crítico?",
      "¿Quién debe ejecutar la siguiente acción?",
    ],
  },
  "territorial-pagos-cierre": {
    title: "Mapa, pagos y cierre",
    description: "Integra ubicación, pago, entrega, inscripción y cierre de cada predio.",
    questions: [
      "¿Dónde está cada predio?",
      "¿Qué pago o entrega está pendiente?",
      "¿Qué falta para cerrar el expediente?",
    ],
  },
  "territorial-integral": {
    title: "Cierre territorial integral",
    description: "Integra ubicación, pago, entrega, inscripción y cierre de cada predio.",
    questions: [
      "¿Dónde está cada predio?",
      "¿Qué pago o entrega está pendiente?",
      "¿Qué falta para cerrar el expediente?",
    ],
  },
  "gastos-proyecto-predio": {
    title: "Gastos por predio",
    description:
      "Consolida los gastos directos, compartidos y contractuales asociados a los predios seleccionados.",
    questions: [
      "¿Cuánto cuesta cada predio?",
      "¿Qué concepto genera mayor gasto?",
      "¿Existe algún pago inconsistente?",
    ],
  },
  "predios-privados": {
    title: "Seguimiento de predios privados",
    description:
      "Muestra la etapa actual, el avance acumulado y las razones que explican la situación de cada predio privado.",
    questions: [
      "¿En qué etapa se encuentra cada predio?",
      "¿Por qué llegó a esa situación?",
      "¿Qué acción permite continuar el proceso?",
    ],
  },
  predial: {
    title: "Metas y ejecución predial",
    description:
      "Compara metas, programación y ejecución del trabajo predial por equipo responsable.",
    questions: [
      "¿Cuál es la meta vigente?",
      "¿Qué equipo tiene retraso?",
      "¿Cuánto queda por ejecutar?",
    ],
  },
  inscripciones: {
    title: "Inscripción registral",
    description:
      "Muestra el estado registral y documental de los predios presentados para inscripción.",
    questions: [
      "¿Cuántos títulos están inscritos?",
      "¿Qué documentos están pendientes?",
      "¿Qué predios requieren subsanación?",
    ],
  },
  "transferencia-interestatal": {
    title: "Transferencias interestatales",
    description: "Permite identificar predios estatales pendientes, en trámite y adquiridos.",
    questions: [
      "¿Cuántos predios fueron adquiridos?",
      "¿Cuántos continúan en trámite?",
      "¿Qué proyectos tienen transferencias pendientes?",
    ],
  },
  "seguimiento-personal": {
    title: "Seguimiento del personal",
    description:
      "Explica la carga, productividad y cumplimiento de los especialistas que atienden la gestión predial.",
    questions: [
      "¿Quién tiene actividades vencidas?",
      "¿Qué equipo cumple su meta mensual?",
      "¿Dónde existe sobrecarga de trabajo?",
    ],
  },
};

function SeguimientoMonitoreoLayout() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [simpleView, setSimpleView] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const routeKey = path.split("/").filter(Boolean).at(-1) ?? "general";
  const guide = monitorGuides[routeKey] ?? monitorGuides.general;

  useEffect(() => {
    document.documentElement.classList.toggle("monitor-simple-mode", simpleView);
    return () => document.documentElement.classList.remove("monitor-simple-mode");
  }, [simpleView]);

  return (
    <>
      <Outlet />
      <div className="fixed bottom-4 right-4 z-[90] flex max-w-[370px] flex-col items-end gap-2">
        {guideOpen && (
          <aside className="w-[min(370px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 bg-slate-900 px-4 py-3 text-white">
              <div className="flex gap-2">
                <BookOpen size={17} className="mt-0.5 shrink-0 text-red-300" />
                <div>
                  <div className="text-[12px] font-semibold">¿Qué muestra este monitor?</div>
                  <div className="mt-0.5 text-[14px] font-bold">{guide.title}</div>
                </div>
              </div>
              <button
                onClick={() => setGuideOpen(false)}
                className="rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label="Cerrar guía"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-[11px] leading-5 text-slate-600">{guide.description}</p>
              <div className="mt-3 space-y-1.5">
                {guide.questions.map((question) => (
                  <div key={question} className="flex items-start gap-2 text-[10px] text-slate-700">
                    <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-green-600" /> {question}
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
                <button
                  onClick={() => setSimpleView(true)}
                  className={`flex items-center justify-center gap-1 rounded-md px-2 py-2 text-[10px] font-semibold ${simpleView ? "bg-white text-red-600 shadow-sm" : "text-slate-500"}`}
                >
                  <Eye size={13} /> Vista simple
                </button>
                <button
                  onClick={() => setSimpleView(false)}
                  className={`flex items-center justify-center gap-1 rounded-md px-2 py-2 text-[10px] font-semibold ${!simpleView ? "bg-white text-red-600 shadow-sm" : "text-slate-500"}`}
                >
                  <Layers3 size={13} /> Análisis completo
                </button>
              </div>
              {simpleView && (
                <p className="mt-2 text-center text-[9px] text-slate-400">
                  La información secundaria está oculta para facilitar la lectura.
                </p>
              )}
            </div>
          </aside>
        )}
        {!guideOpen && (
          <button
            onClick={() => setGuideOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-[11px] font-semibold text-white shadow-xl hover:bg-slate-800"
          >
            <BookOpen size={15} className="text-red-300" /> Guía del monitor
          </button>
        )}
      </div>
    </>
  );
}
