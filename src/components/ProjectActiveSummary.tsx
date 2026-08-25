import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Banknote,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesColumnIncreasing,
  CircleUserRound,
  FileText,
  MapPinned,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  initialProjectBrigades,
  PROJECT_BRIGADES_UPDATED_EVENT,
  readProjectBrigades,
  type BrigadaProyecto,
} from "@/lib/projectTeamsData";
import { getProyecto } from "@/lib/projectsData";

function SummaryField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof FileText;
}) {
  return (
    <div className="flex gap-2.5 border-b border-[#f3f4f6] py-2.5 last:border-b-0">
      <Icon size={14} className="mt-0.5 shrink-0 text-[#dc2626]" />
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-[#9ca3af]">{label}</p>
        <p className="mt-0.5 break-words text-[11px] font-medium leading-4 text-[#374151]">
          {value}
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[#e5e7eb] bg-[#fafafa] px-2.5 py-2">
      <p className="text-[17px] font-bold leading-5 text-[#1f2937]">{value}</p>
      <p className="mt-1 text-[9px] font-semibold uppercase leading-3 text-[#6b7280]">{label}</p>
    </div>
  );
}

function Progress({ label, value }: { label: string; value: number }) {
  const percentage = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px]">
        <span className="font-medium text-[#4b5563]">{label}</span>
        <span className="font-bold text-[#1f2937]">{percentage}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#f3f4f6]">
        <div className="h-full rounded-full bg-[#ef4444]" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export function ProjectActiveSummary({ projectId }: { projectId: string }) {
  const project = getProyecto(projectId);
  const [brigades, setBrigades] = useState<BrigadaProyecto[]>(initialProjectBrigades);

  useEffect(() => {
    const refresh = () => setBrigades(readProjectBrigades(projectId));
    const handleProjectUpdate = (event: Event) => {
      const updatedProjectId = (event as CustomEvent<{ projectId?: string }>).detail?.projectId;
      if (!updatedProjectId || updatedProjectId === projectId) refresh();
    };

    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(PROJECT_BRIGADES_UPDATED_EVENT, handleProjectUpdate);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(PROJECT_BRIGADES_UPDATED_EVENT, handleProjectUpdate);
    };
  }, [projectId]);

  const teamSummary = useMemo(
    () => ({
      active: brigades.filter((brigade) => brigade.estado === "Activa").length,
      members: new Set(
        brigades.flatMap((brigade) => brigade.integrantes.map((member) => member.usuarioId)),
      ).size,
    }),
    [brigades],
  );

  if (!project) {
    return (
      <aside
        data-project-summary
        className="fixed bottom-3 right-3 top-[73px] z-30 hidden w-[344px] overflow-hidden rounded-md border border-[#fecaca] bg-white shadow-sm xl:flex xl:flex-col"
      >
        <div className="bg-[#ef4444] px-4 py-3 text-[11px] font-semibold uppercase text-white">
          Información del proyecto
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <AlertCircle size={28} className="text-[#f87171]" />
          <p className="mt-3 text-[12px] font-semibold text-[#374151]">Proyecto no encontrado</p>
          <p className="mt-1 text-[11px] leading-4 text-[#6b7280]">
            No existe información consolidada para el proyecto seleccionado.
          </p>
        </div>
      </aside>
    );
  }

  const available = Math.min(project.predios, Math.max(0, project.disponibles));
  const pending = Math.max(0, project.predios - available);

  return (
    <aside
      data-project-summary
      className="fixed bottom-3 right-3 top-[73px] z-30 hidden w-[344px] overflow-hidden rounded-md border border-[#fecaca] bg-white shadow-sm xl:flex xl:flex-col"
    >
      <div className="bg-[#ef4444] px-4 py-3 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-wide">
          Información del proyecto activo
        </p>
        <p className="mt-1 truncate text-[12px] font-bold" title={project.nombre}>
          {project.nombre}
        </p>
        <p className="mt-0.5 font-mono text-[10px] text-red-100">{project.codigo}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="border-b border-[#e5e7eb] p-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
              {project.tipo}
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-800">
              {project.estado}
            </span>
          </div>
          <div className="mt-3 rounded-md border border-[#e5e7eb] bg-[#fafafa] p-3">
            <div className="flex items-start gap-2.5">
              <MapPinned size={16} className="mt-0.5 shrink-0 text-[#dc2626]" />
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-[#9ca3af]">
                  Fase actual
                </p>
                <p className="mt-1 text-[11px] font-semibold leading-4 text-[#1f2937]">
                  {project.fase}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#e5e7eb] p-4">
          <div className="flex items-center gap-2 text-[#dc2626]">
            <ChartNoAxesColumnIncreasing size={15} />
            <h2 className="text-[10px] font-bold uppercase tracking-wide">Resumen operativo</h2>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Metric label="Predios totales" value={project.predios} />
            <Metric label="Disponibles" value={available} />
            <Metric label="Pendientes" value={pending} />
            <Metric label="Brigadas" value={brigades.length} />
          </div>
          <div className="mt-3 flex items-center justify-between rounded-md border border-[#e5e7eb] px-3 py-2 text-[10px]">
            <span className="flex items-center gap-1.5 text-[#4b5563]">
              <ShieldCheck size={13} className="text-[#dc2626]" /> {teamSummary.active} activas
            </span>
            <span className="flex items-center gap-1.5 text-[#4b5563]">
              <UsersRound size={13} className="text-[#dc2626]" /> {teamSummary.members} integrantes
            </span>
          </div>
          <Link
            to="/proyectos/$projectId/equipos"
            params={{ projectId }}
            className="mt-2 inline-flex text-[10px] font-semibold text-[#dc2626] hover:underline"
          >
            Ver equipos y brigadas
          </Link>
        </section>

        <section className="border-b border-[#e5e7eb] p-4">
          <div className="flex items-center gap-2 text-[#dc2626]">
            <BriefcaseBusiness size={15} />
            <h2 className="text-[10px] font-bold uppercase tracking-wide">Avance y presupuesto</h2>
          </div>
          <div className="mt-3 space-y-3">
            <Progress label="Avance físico" value={project.fisico} />
            <Progress label="Avance financiero" value={project.financiero} />
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-md bg-[#f9fafb] px-3 py-2">
            <Banknote size={14} className="text-[#dc2626]" />
            <div>
              <p className="text-[9px] uppercase text-[#9ca3af]">Presupuesto</p>
              <p className="text-[11px] font-bold text-[#1f2937]">{project.presupuesto}</p>
            </div>
          </div>
        </section>

        <section className="px-4 py-3">
          <div className="flex items-center gap-2 border-b border-[#fecaca] pb-2 text-[#dc2626]">
            <Building2 size={15} />
            <h2 className="text-[10px] font-bold uppercase tracking-wide">Responsables</h2>
          </div>
          <SummaryField
            label="Coordinación general"
            value={project.coordinacionGeneral}
            icon={Building2}
          />
          <SummaryField
            label="Coordinación predial"
            value={project.coordinacionPredial}
            icon={BriefcaseBusiness}
          />
          <SummaryField
            label="Coordinador predial"
            value={project.coordinadorPredial}
            icon={CircleUserRound}
          />
          <SummaryField
            label="Líder de interferencias"
            value={project.liderInterferencias}
            icon={CircleUserRound}
          />
        </section>
      </div>

      <div className="border-t border-[#e5e7eb] bg-[#f9fafb] px-4 py-2.5 text-[9px] leading-3 text-[#6b7280]">
        Resumen de solo lectura generado con la información consolidada del proyecto y sus equipos.
      </div>
    </aside>
  );
}
