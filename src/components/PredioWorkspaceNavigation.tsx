import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Check, ChevronDown, ChevronsUpDown, MapPinned, Search } from "lucide-react";
import { useMemo, useState } from "react";

import {
  contextMenuItems,
  estatalMenuItems,
  iconByKey,
  routeByKey,
  type ContextMenuItem,
  type PredioRoute,
} from "@/components/predioNavigationConfig";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getPredioByCodigo, predioRows } from "@/lib/prediosData";

const DEFAULT_PREDIO_ROUTE: PredioRoute =
  "/proyectos/$projectId/predios/$codigo/identificacion-codificacion";

function routeSegment(route: PredioRoute) {
  return route.slice(route.lastIndexOf("/") + 1);
}

function menuItemMatchesPathname(item: ContextMenuItem, pathname: string): boolean {
  const route = routeByKey[item.key];
  if (route && pathname.endsWith(`/${routeSegment(route)}`)) return true;
  return item.children?.some((child) => menuItemMatchesPathname(child, pathname)) ?? false;
}

function currentPredioRoute(pathname: string) {
  return (
    Object.values(routeByKey).find((route) => pathname.endsWith(`/${routeSegment(route)}`)) ??
    DEFAULT_PREDIO_ROUTE
  );
}

function availableMenuItems(codigo: string) {
  const condicion = getPredioByCodigo(codigo)?.condicionPredio.trim().toUpperCase();
  return condicion === "ESTATAL" ? estatalMenuItems : contextMenuItems;
}

export function PredioSelector({ projectId, codigo }: { projectId: string; codigo: string }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const byCode = new Map<string, { value: string; label: string; subject: string }>();
    predioRows.forEach((row) => {
      if (!byCode.has(row.codigo)) {
        byCode.set(row.codigo, {
          value: row.codigo,
          label: row.cod || row.codigo,
          subject: row.suj || "Sin informacion",
        });
      }
    });
    return Array.from(byCode.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es-PE");
    if (!normalizedQuery) return options;
    return options.filter((option) =>
      `${option.label} ${option.value} ${option.subject}`
        .toLocaleLowerCase("es-PE")
        .includes(normalizedQuery),
    );
  }, [options, query]);

  function selectPredio(nextCodigo: string) {
    const route = currentPredioRoute(pathname);
    setOpen(false);
    setQuery("");
    navigate({ to: route, params: { projectId, codigo: nextCodigo } });
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center gap-2 rounded-md border border-[#d1d5db] bg-white px-3 text-left text-[12px] shadow-sm hover:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-red-100"
          aria-label="Cambiar predio"
        >
          <MapPinned size={15} className="shrink-0 text-[#dc2626]" />
          <span className="shrink-0 text-[#6b7280]">Predio:</span>
          <span className="min-w-0 flex-1 truncate font-semibold text-[#111827]">{codigo}</span>
          <ChevronsUpDown size={14} className="shrink-0 text-[#9ca3af]" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" sideOffset={7} className="z-[10000] w-[430px] p-0">
        <div className="border-b border-[#e5e7eb] p-3">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
            />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por codigo o titular..."
              className="h-9 w-full rounded-md border border-[#d1d5db] bg-white pl-9 pr-3 text-[12px] outline-none focus:border-[#dc2626]"
            />
          </div>
          <p className="mt-2 text-[10px] text-[#6b7280]">
            {filteredOptions.length} de {options.length} predios disponibles
          </p>
        </div>
        <div className="max-h-72 overflow-y-auto p-1.5">
          {filteredOptions.length ? (
            filteredOptions.slice(0, 150).map((option) => {
              const active = option.value === codigo;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectPredio(option.value)}
                  className={`flex w-full items-start gap-2 rounded px-2.5 py-2 text-left hover:bg-[#fef2f2] ${
                    active ? "bg-[#fef2f2]" : ""
                  }`}
                >
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                    {active && <Check size={13} className="text-[#dc2626]" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-[11px] font-semibold text-[#1f2937]">
                      {option.label}
                    </span>
                    <span className="block truncate text-[10px] text-[#6b7280]">
                      {option.subject}
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-8 text-center text-[12px] text-[#6b7280]">
              No se encontraron predios con ese codigo.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SidebarItem({
  item,
  projectId,
  codigo,
  pathname,
  depth = 0,
}: {
  item: ContextMenuItem;
  projectId: string;
  codigo: string;
  pathname: string;
  depth?: number;
}) {
  const [open, setOpen] = useState(true);
  const Icon = iconByKey[item.key as keyof typeof iconByKey] ?? MapPinned;
  const route = routeByKey[item.key];
  const paddingLeft = depth === 0 ? 12 : 40 + (depth - 1) * 16;

  if (item.children?.length) {
    const childIsActive = item.children.some((child) => menuItemMatchesPathname(child, pathname));

    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={`flex w-full items-center gap-2.5 border-l-2 px-3 py-2 text-left text-[12px] transition-colors ${
            childIsActive
              ? "border-[#dc2626] bg-[#fff7f7] font-semibold text-[#991b1b]"
              : "border-transparent text-[#374151] hover:bg-[#f9fafb]"
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          title={item.description}
        >
          {depth === 0 && <Icon size={15} className="shrink-0 text-[#dc2626]" />}
          <span className="min-w-0 flex-1 leading-4">
            <span className="block">{item.label}</span>
            {depth === 0 && item.description && (
              <span className="mt-0.5 block text-[9px] font-normal leading-3 text-[#9ca3af]">
                {item.description}
              </span>
            )}
          </span>
          <ChevronDown
            size={13}
            className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div className="border-l border-[#f3f4f6]">
            {item.children.map((child) => (
              <SidebarItem
                key={child.key}
                item={child}
                projectId={projectId}
                codigo={codigo}
                pathname={pathname}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!route) {
    return (
      <div
        className="flex cursor-not-allowed items-center gap-2.5 border-l-2 border-transparent px-3 py-2 text-[11px] text-[#9ca3af]"
        style={{ paddingLeft: `${paddingLeft}px` }}
        title="Seccion pendiente de implementacion"
      >
        {depth === 0 && <Icon size={14} className="shrink-0 text-[#fca5a5]" />}
        <span className="min-w-0 flex-1 leading-4">{item.label}</span>
      </div>
    );
  }

  const active = pathname.endsWith(`/${routeSegment(route)}`);
  return (
    <Link
      to={route}
      params={{ projectId, codigo }}
      className={`flex items-center gap-2.5 border-l-2 px-3 py-2 text-[11px] transition-colors ${
        active
          ? "border-[#dc2626] bg-[#fef2f2] font-semibold text-[#b91c1c]"
          : "border-transparent text-[#4b5563] hover:bg-[#f9fafb] hover:text-[#111827]"
      }`}
      style={{ paddingLeft: `${paddingLeft}px` }}
      title={item.description}
      aria-current={active ? "page" : undefined}
    >
      {depth === 0 && <Icon size={14} className="shrink-0 text-[#dc2626]" />}
      <span className="min-w-0 flex-1 leading-4">{item.label}</span>
    </Link>
  );
}

export function PredioSectionSidebar({ projectId, codigo }: { projectId: string; codigo: string }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const items = useMemo(() => availableMenuItems(codigo), [codigo]);

  return (
    <aside
      data-predio-sidebar
      className="fixed bottom-0 left-0 top-[61px] z-30 hidden w-[264px] flex-col border-r border-[#e5e7eb] bg-white shadow-sm lg:flex"
    >
      <div className="border-b border-[#e5e7eb] bg-[#fefafa] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#dc2626]">
          Navegacion del predio
        </p>
        <p
          className="mt-1 truncate font-mono text-[11px] font-semibold text-[#1f2937]"
          title={codigo}
        >
          {codigo}
        </p>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto py-2" aria-label="Secciones del predio">
        {items.map((item) => (
          <SidebarItem
            key={item.key}
            item={item}
            projectId={projectId}
            codigo={codigo}
            pathname={pathname}
          />
        ))}
      </nav>
    </aside>
  );
}
