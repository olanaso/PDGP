import { Link, useParams } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, MoreVertical } from "lucide-react";

import {
  contextMenuItems,
  estatalMenuItems,
  iconByKey,
  routeByKey,
  type ContextMenuItem,
  type PredioRoute,
} from "@/components/predioNavigationConfig";

const quickActions: Array<{
  key: string;
  label: string;
  shortLabel: string;
  route: PredioRoute;
}> = [
  {
    key: "solicitud-pago-propietarios",
    label: "Solicitud de pago a propietarios",
    shortLabel: "Pago",
    route: "/proyectos/$projectId/predios/$codigo/pago-propietarios",
  },
];

const predioActionsMenuClassName = "z-[10000] w-80";
const informationBaseMenuItems = contextMenuItems.filter((item) => item.key === "informacion-base");

function MenuItemContent({ item, showIcon = true }: { item: ContextMenuItem; showIcon?: boolean }) {
  const Icon = iconByKey[item.key as keyof typeof iconByKey] ?? FileText;
  return (
    <>
      {showIcon && <Icon size={14} className="mr-2 text-[#dc2626]" />}
      <span className="truncate" title={item.description}>
        {item.label}
      </span>
    </>
  );
}

function PredioMenuItem({
  item,
  projectId,
  codigo,
  depth = 0,
}: {
  item: ContextMenuItem;
  projectId: string;
  codigo: string;
  depth?: number;
}) {
  const route = routeByKey[item.key];

  if (item.children?.length) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="cursor-pointer text-[12px]">
          <MenuItemContent item={item} showIcon={depth === 0} />
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className={predioActionsMenuClassName}>
          {item.children.map((child) => (
            <PredioMenuItem
              key={child.key}
              item={child}
              projectId={projectId}
              codigo={codigo}
              depth={depth + 1}
            />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  if (route) {
    return (
      <DropdownMenuItem asChild className="cursor-pointer text-[12px]">
        <Link to={route} params={{ projectId, codigo }}>
          <MenuItemContent item={item} showIcon={depth === 0} />
        </Link>
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem className="cursor-pointer text-[12px]">
      <MenuItemContent item={item} showIcon={depth === 0} />
    </DropdownMenuItem>
  );
}

export function PredioActions({
  codigoPredio,
  condicionPredio,
  mode = "menu",
}: {
  codigoPredio?: string;
  condicionPredio?: string | null;
  mode?: "menu" | "toolbar";
} = {}) {
  const params = useParams({ strict: false }) as { projectId?: string };
  const projectId = params.projectId ?? "default";
  const codigo = codigoPredio || "VIAL-LST4-T04-ST05-090506-OC-00699";
  const normalizedCondicionPredio = condicionPredio?.trim().toUpperCase();
  const useFullMenu = condicionPredio === undefined || normalizedCondicionPredio === "PRIVADO";
  const availableMenuItems =
    normalizedCondicionPredio === "ESTATAL"
      ? estatalMenuItems
      : useFullMenu
        ? contextMenuItems
        : informationBaseMenuItems;
  const availableQuickActions = useFullMenu ? quickActions : [];

  if (mode === "toolbar") {
    return (
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {availableQuickActions.map((action) => {
          const Icon = iconByKey[action.key as keyof typeof iconByKey] ?? FileText;
          return (
            <Link
              key={action.key}
              to={action.route}
              params={{ projectId, codigo }}
              title={action.label}
              aria-label={action.label}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-[#e5e7eb] bg-white px-2.5 text-[11px] font-medium text-[#374151] hover:bg-[#fef2f2] hover:border-[#dc2626] hover:text-[#dc2626]"
            >
              <Icon size={13} className="text-[#dc2626]" />
              <span>{action.shortLabel}</span>
            </Link>
          );
        })}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="inline-flex h-8 items-center gap-1.5 rounded border border-[#e5e7eb] bg-white px-2.5 text-[11px] font-medium text-[#dc2626] hover:bg-[#fef2f2] hover:border-[#dc2626]"
              aria-label="Mas acciones del predio"
            >
              <MoreVertical size={14} />
              <span>Mas</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={predioActionsMenuClassName}>
            {availableMenuItems.map((item) => (
              <PredioMenuItem key={item.key} item={item} projectId={projectId} codigo={codigo} />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={
            mode === "toolbar"
              ? "inline-flex h-8 items-center gap-1.5 rounded border border-[#e5e7eb] bg-white px-2.5 text-[11px] font-medium text-[#dc2626] hover:bg-[#fef2f2] hover:border-[#dc2626]"
              : "p-1 rounded hover:bg-[#fef2f2] text-[#dc2626]"
          }
          aria-label="Acciones del predio"
        >
          <MoreVertical size={14} />
          {mode === "toolbar" && <span>Acciones</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={predioActionsMenuClassName}>
        {availableMenuItems.map((item) => (
          <PredioMenuItem key={item.key} item={item} projectId={projectId} codigo={codigo} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
