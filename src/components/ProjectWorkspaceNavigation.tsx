import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  FileCode,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  Hash,
  LayoutDashboard,
  Map,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

type ProjectRoute =
  | "/proyectos/$projectId"
  | "/proyectos/$projectId/evaluacion-informacion"
  | "/proyectos/$projectId/requerimientos"
  | "/proyectos/$projectId/base-grafica"
  | "/proyectos/$projectId/equipos"
  | "/proyectos/$projectId/codigos-planos"
  | "/proyectos/$projectId/codigos-predios"
  | "/proyectos/$projectId/expedientes"
  | "/proyectos/$projectId/padron-preliminar";

type ProjectMenuItem = {
  number: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  route?: ProjectRoute;
};

type ProjectMenuGroup = {
  number: string;
  label: string;
  description: string;
  icon: LucideIcon;
  items: ProjectMenuItem[];
};

const PROJECT_HOME: ProjectMenuItem = {
  number: "0",
  label: "Inicio del proyecto",
  description: "Mapa, capas y listado de predios",
  icon: LayoutDashboard,
  route: "/proyectos/$projectId",
};

const PROJECT_MENU_GROUPS: ProjectMenuGroup[] = [
  {
    number: "1",
    label: "Diagnóstico técnico general",
    description: "Información técnica y operativa",
    icon: ClipboardList,
    items: [
      {
        number: "1.1",
        label: "Evaluación de información recibida",
        icon: ClipboardCheck,
        route: "/proyectos/$projectId/evaluacion-informacion",
      },
      {
        number: "1.2",
        label: "Requerimiento de información",
        icon: FileText,
        route: "/proyectos/$projectId/requerimientos",
      },
      {
        number: "1.3",
        label: "Base gráfica",
        icon: Map,
        route: "/proyectos/$projectId/base-grafica",
      },
      {
        number: "1.4",
        label: "Equipo de trabajo",
        icon: ShieldCheck,
        route: "/proyectos/$projectId/equipos",
      },
      {
        number: "1.5",
        label: "Presupuesto y metas",
        description: "Acceso pendiente de implementación",
        icon: BarChart3,
      },
    ],
  },
  {
    number: "2",
    label: "Códigos del proyecto",
    description: "Planos, predios y expedientes",
    icon: Hash,
    items: [
      {
        number: "2.1",
        label: "Códigos de planos",
        icon: FileCode,
        route: "/proyectos/$projectId/codigos-planos",
      },
      {
        number: "2.2",
        label: "Códigos de predios",
        icon: Hash,
        route: "/proyectos/$projectId/codigos-predios",
      },
      {
        number: "2.3",
        label: "Número de expediente",
        icon: FolderKanban,
        route: "/proyectos/$projectId/expedientes",
      },
    ],
  },
  {
    number: "3",
    label: "Padrón del proyecto",
    description: "Consolidación inicial de predios",
    icon: FileSpreadsheet,
    items: [
      {
        number: "3.1",
        label: "Padrón preliminar",
        icon: FileSpreadsheet,
        route: "/proyectos/$projectId/padron-preliminar",
      },
    ],
  },
];

function resolvedRoute(route: ProjectRoute, projectId: string) {
  return route.replace("$projectId", encodeURIComponent(projectId));
}

function routeIsActive(pathname: string, route: ProjectRoute, projectId: string) {
  const resolved = resolvedRoute(route, projectId);
  if (route === "/proyectos/$projectId") {
    return pathname === resolved || pathname === `${resolved}/`;
  }
  return pathname === resolved || pathname.startsWith(`${resolved}/`);
}

function ProjectLink({
  item,
  projectId,
  pathname,
}: {
  item: ProjectMenuItem;
  projectId: string;
  pathname: string;
}) {
  const Icon = item.icon;

  if (!item.route) {
    return (
      <div
        className="flex cursor-not-allowed items-start gap-2 border-l-2 border-transparent px-4 py-2 text-[11px] text-gray-400"
        title={item.description}
      >
        <Icon size={14} className="mt-0.5 shrink-0 text-gray-300" />
        <span className="min-w-0 flex-1 leading-4">
          <span className="block">
            {item.number} {item.label}
          </span>
          <span className="mt-0.5 block text-[9px] leading-3">Próximamente</span>
        </span>
      </div>
    );
  }

  const active = routeIsActive(pathname, item.route, projectId);
  return (
    <Link
      to={item.route}
      params={{ projectId }}
      aria-current={active ? "page" : undefined}
      className={`flex items-start gap-2 border-l-2 px-4 py-2 text-[11px] transition-colors ${
        active
          ? "border-[#dc2626] bg-[#fef2f2] font-semibold text-[#b91c1c]"
          : "border-transparent text-[#4b5563] hover:bg-[#f9fafb] hover:text-[#111827]"
      }`}
    >
      <Icon size={14} className="mt-0.5 shrink-0 text-[#dc2626]" />
      <span className="min-w-0 flex-1 leading-4">
        {item.number} {item.label}
      </span>
    </Link>
  );
}

function ProjectGroup({
  group,
  projectId,
  pathname,
}: {
  group: ProjectMenuGroup;
  projectId: string;
  pathname: string;
}) {
  const childIsActive = group.items.some(
    (item) => item.route && routeIsActive(pathname, item.route, projectId),
  );
  const [open, setOpen] = useState(true);
  const Icon = group.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-start gap-2.5 border-l-2 px-3 py-2.5 text-left text-[12px] transition-colors ${
          childIsActive
            ? "border-[#dc2626] bg-[#fff7f7] font-semibold text-[#991b1b]"
            : "border-transparent text-[#374151] hover:bg-[#f9fafb]"
        }`}
      >
        <Icon size={15} className="mt-0.5 shrink-0 text-[#dc2626]" />
        <span className="min-w-0 flex-1 leading-4">
          <span className="block">
            {group.number}. {group.label}
          </span>
          <span className="mt-0.5 block text-[9px] font-normal leading-3 text-[#9ca3af]">
            {group.description}
          </span>
        </span>
        <ChevronDown
          size={13}
          className={`mt-0.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-l border-[#f3f4f6]">
          {group.items.map((item) => (
            <ProjectLink key={item.number} item={item} projectId={projectId} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectSectionSidebar({
  projectId,
  projectLabel,
}: {
  projectId: string;
  projectLabel: string;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <aside
      data-project-sidebar
      className="fixed bottom-0 left-0 top-[61px] z-30 hidden w-[264px] flex-col border-r border-[#e5e7eb] bg-white shadow-sm lg:flex"
    >
      <div className="border-b border-[#e5e7eb] bg-[#fefafa] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#dc2626]">
          Navegación del proyecto
        </p>
        <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-4 text-[#1f2937]">
          {projectLabel}
        </p>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto py-2" aria-label="Datos del proyecto">
        <ProjectLink item={PROJECT_HOME} projectId={projectId} pathname={pathname} />
        <div className="my-1 border-t border-[#f3f4f6]" />
        {PROJECT_MENU_GROUPS.map((group) => (
          <ProjectGroup
            key={group.number}
            group={group}
            projectId={projectId}
            pathname={pathname}
          />
        ))}
      </nav>
    </aside>
  );
}
