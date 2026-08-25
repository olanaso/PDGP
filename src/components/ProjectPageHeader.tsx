import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { PredioActiveSummary } from "@/components/PredioActiveSummary";
import { PredioSectionSidebar, PredioSelector } from "@/components/PredioWorkspaceNavigation";
import { ProjectActiveSummary } from "@/components/ProjectActiveSummary";
import { ProjectSectionSidebar } from "@/components/ProjectWorkspaceNavigation";

/**
 * Cabecera estandarizada estilo "Datos técnicos":
 *  [← Atrás]  / Proyecto X / Título            BADGE: VALOR / SUFIJO
 */
export function ProjectPageHeader({
  projectId,
  projectLabel,
  title,
  badgeLabel,
  badgeValue,
  badgeSuffix,
  right,
}: {
  projectId: string;
  projectLabel?: string;
  title: string;
  badgeLabel?: string;
  badgeValue?: string;
  badgeSuffix?: string;
  right?: ReactNode;
}) {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { codigo?: string };
  const predioCodigo = params.codigo ? decodeURIComponent(params.codigo) : null;
  const goBack = () => navigate({ to: "/proyectos/$projectId", params: { projectId } });
  return (
    <>
      <header
        data-predio-workspace-header={predioCodigo ? "true" : undefined}
        className={`sticky top-0 z-40 border-b border-[#e5e7eb] bg-white px-4 py-3 ${
          predioCodigo
            ? "flex items-center justify-between gap-4 md:grid md:grid-cols-[minmax(0,1fr)_minmax(320px,520px)_minmax(0,1fr)]"
            : "flex items-center justify-between gap-4"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={goBack}
            className="inline-flex shrink-0 items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-[12px] hover:bg-gray-50"
          >
            <ArrowLeft size={14} /> Atrás
          </button>
          <Link
            to="/proyectos/$projectId"
            params={{ projectId }}
            className="truncate text-[12px] text-gray-500 hover:text-gray-700"
          >
            / Proyecto {projectLabel ?? projectId}
          </Link>
          <span className="truncate text-[12px] text-gray-500">/ {title}</span>
        </div>

        {predioCodigo && (
          <div className="hidden min-w-0 md:block">
            <PredioSelector projectId={projectId} codigo={predioCodigo} />
          </div>
        )}

        <div
          className={`flex shrink-0 items-center gap-3 ${predioCodigo ? "justify-self-end" : ""}`}
        >
          {badgeValue && (
            <div className="text-[12px] text-gray-600">
              {badgeLabel && <span>{badgeLabel}: </span>}
              <span className="font-medium text-gray-900">{badgeValue}</span>
              {badgeSuffix && <span className="text-gray-400"> / {badgeSuffix}</span>}
            </div>
          )}
          {right}
        </div>
      </header>
      {predioCodigo && (
        <>
          <PredioSectionSidebar projectId={projectId} codigo={predioCodigo} />
          <PredioActiveSummary codigo={predioCodigo} />
        </>
      )}
      {!predioCodigo && (
        <>
          <ProjectSectionSidebar projectId={projectId} projectLabel={projectLabel ?? projectId} />
          <ProjectActiveSummary projectId={projectId} />
        </>
      )}
    </>
  );
}
