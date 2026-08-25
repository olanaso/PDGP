import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Building2,
  Search,
  X,
  LayoutGrid,
  List,
  Table as TableIcon,
  Plus,
  MapPin,
  Home,
  FolderOpen,
  Pencil,
  Download,
  Upload,
  ArrowRight,
  Briefcase,
  UserCog,
  Network,
} from "lucide-react";
import { AppSidebar } from "../components/AppSidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { proyectos, type Proyecto } from "@/lib/projectsData";

export const Route = createFileRoute("/proyectos/")({
  head: () => ({
    meta: [
      { title: "Proyectos — MTC Prototipos" },
      { name: "description", content: "Gestione proyectos prediales, consulte avances y cambie entre vistas operativas." },
    ],
  }),
  component: ProyectosPage,
});

// Proyecto type and data live in @/lib/projectsData

const estadoBadge: Record<Proyecto["estado"], string> = {
  "En estructuracion": "bg-[#fef3c7] text-[#92400e] border-[#fde68a]",
  "En ejecucion": "bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]",
  "En revision": "bg-[#fee2e2] text-[#1e40af] border-[#fecaca]",
};

function ProyectosPage() {
  const [view, setView] = useState<"grid" | "list" | "table">("grid");
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [respFilter, setRespFilter] = useState("");

  const filtered = useMemo(() => {
    return proyectos.filter((p) => {
      if (tipoFilter && p.tipo !== tipoFilter) return false;
      if (respFilter && p.coordinadorPredial !== respFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!`${p.nombre} ${p.codigo} ${p.coordinacionPredial} ${p.coordinacionGeneral}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, tipoFilter, respFilter]);

  const projectGroups = useMemo(() => groupProjects(filtered), [filtered]);

  return (
    <div className="flex h-screen bg-[#f7f8fa] text-[#1f2937] text-sm">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="px-8 pt-6 pb-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="size-11 rounded-full bg-[#fde2e2] text-[#b91c1c] flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-[26px] font-bold leading-tight">Proyectos</h1>
              <p className="text-[12px] text-[#6b7280]">
                Gestione proyectos prediales, consulte avances y cambie entre vistas operativas.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 bg-white border border-[#e5e7eb] hover:bg-[#f9fafb] px-3.5 py-2 rounded-md text-[13px] font-medium">
              <Download size={14} /> Exportar
            </button>
            <Link
              to="/proyectos/registro"
              className="flex items-center gap-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-3.5 py-2 rounded-md text-[13px] font-medium"
            >
              <Plus size={14} /> Nuevo proyecto
            </Link>
            <button className="flex items-center gap-1.5 bg-white border border-[#e5e7eb] hover:bg-[#f9fafb] px-3.5 py-2 rounded-md text-[13px] font-medium">
              <Upload size={14} /> Importar proyectos
            </button>
          </div>
        </div>

        <div className="px-8 pb-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xl min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por proyecto, código o coordinación..."
              className="w-full pl-9 pr-8 py-2 border border-[#e5e7eb] rounded-md text-[13px] bg-white focus:outline-none focus:border-[#dc2626]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] p-1"
                aria-label="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="border border-[#e5e7eb] rounded-md px-3 py-2 text-[13px] bg-white"
          >
            <option value="">Todos los tipos ({proyectos.length})</option>
            {Array.from(new Set(proyectos.map((p) => p.tipo))).map((t) => (
              <option key={t} value={t}>
                {t} ({proyectos.filter((p) => p.tipo === t).length})
              </option>
            ))}
          </select>
          <select
            value={respFilter}
            onChange={(e) => setRespFilter(e.target.value)}
            className="border border-[#e5e7eb] rounded-md px-3 py-2 text-[13px] bg-white"
          >
            <option value="">Todos los coordinadores</option>
            {Array.from(new Set(proyectos.map((p) => p.coordinadorPredial))).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="flex-1" />
          <div className="flex items-center border border-[#e5e7eb] rounded-md bg-white overflow-hidden">
            <button onClick={() => setView("grid")} className={`size-8 flex items-center justify-center ${view === "grid" ? "bg-[#fde2e2] text-[#b91c1c]" : "hover:bg-[#f9fafb]"}`}>
              <LayoutGrid size={14} />
            </button>
            <button onClick={() => setView("list")} className={`size-8 flex items-center justify-center border-l border-[#e5e7eb] ${view === "list" ? "bg-[#fde2e2] text-[#b91c1c]" : "hover:bg-[#f9fafb]"}`}>
              <List size={14} />
            </button>
            <button onClick={() => setView("table")} className={`size-8 flex items-center justify-center border-l border-[#e5e7eb] ${view === "table" ? "bg-[#fde2e2] text-[#b91c1c]" : "hover:bg-[#f9fafb]"}`}>
              <TableIcon size={14} />
            </button>
          </div>
        </div>

        <div className="px-8 pb-2 text-[12px] text-[#6b7280]">
          <span className="font-semibold text-[#374151]">{filtered.length}</span> proyectos en{" "}
          <span className="font-semibold text-[#374151]">{projectGroups.length}</span> grupos
        </div>

        <ProjectGroups groups={projectGroups} view={view} />
      </main>
    </div>
  );
}

function getProjectGroup(p: Proyecto) {
  const airportGroup = p.coordinacionPredial.match(/Aeropuertos\s+0?(\d+)/i);
  if (airportGroup) return `Grupo de Aeropuertos ${airportGroup[1]}`;

  const roadGroup = p.coordinacionGeneral.match(/Vial\s+0?(\d+)/i);
  if (roadGroup) return `Grupo de Proyectos Viales ${roadGroup[1]}`;

  if (p.coordinacionGeneral.toLowerCase().includes("proyectos viales y especiales")) {
    return "Grupo de Proyectos Viales y Especiales";
  }

  return "Otros proyectos";
}

function groupProjects(items: Proyecto[]) {
  const groups = new Map<string, Proyecto[]>();

  items.forEach((project) => {
    const groupName = getProjectGroup(project);
    const groupItems = groups.get(groupName) ?? [];
    groupItems.push(project);
    groups.set(groupName, groupItems);
  });

  return Array.from(groups, ([name, projects]) => ({ name, projects }));
}

function ProjectGroups({
  groups,
  view,
}: {
  groups: Array<{ name: string; projects: Proyecto[] }>;
  view: "grid" | "list" | "table";
}) {
  if (groups.length === 0) {
    return (
      <div className="mx-8 mb-8 rounded-xl border border-dashed border-[#d1d5db] bg-white px-6 py-12 text-center">
        <FolderOpen size={28} className="mx-auto text-[#9ca3af]" />
        <p className="mt-3 font-semibold text-[#374151]">No se encontraron proyectos</p>
        <p className="mt-1 text-[12px] text-[#6b7280]">Pruebe con otros filtros o términos de búsqueda.</p>
      </div>
    );
  }

  return (
    <Accordion
      type="multiple"
      defaultValue={groups[0] ? [groups[0].name] : []}
      className="px-8 pb-8 space-y-3"
    >
      {groups.map((group) => (
        <AccordionItem
          key={group.name}
          value={group.name}
          className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm"
        >
          <AccordionTrigger className="px-4 py-3.5 hover:no-underline hover:bg-[#fefafa]">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#fef2f2] text-[#dc2626]">
                <FolderOpen size={17} />
              </span>
              <span className="min-w-0 text-left">
                <span className="block truncate text-[14px] font-semibold text-[#1f2937]">{group.name}</span>
                <span className="block text-[11px] font-normal text-[#6b7280]">
                  {group.projects.length} {group.projects.length === 1 ? "proyecto" : "proyectos"}
                </span>
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="border-t border-[#f3f4f6] bg-[#fafafa] p-4">
            {view === "grid" && (
              <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {group.projects.map((p) => <ProyectoCard key={p.id} p={p} />)}
              </div>
            )}

            {view === "list" && (
              <div className="space-y-3">
                {group.projects.map((p) => <ProyectoRow key={p.id} p={p} />)}
              </div>
            )}

            {view === "table" && <ProyectosTable items={group.projects} />}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function ProyectoCard({ p }: { p: Proyecto }) {
  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden flex flex-col hover:shadow-md transition-shadow h-full">
      <div className="relative h-40 bg-[#e5e7eb] shrink-0">
        <img src={p.img} alt={p.nombre} className="size-full object-cover" loading="lazy" />
        <span className="absolute top-3 right-3 bg-[#fef2f2] text-[#dc2626] text-[11px] font-medium px-2.5 py-1 rounded-full border border-[#fecaca]">
          {p.tipo}
        </span>
        <span className={`absolute top-3 left-3 text-[11px] font-medium px-2 py-0.5 rounded-full border ${estadoBadge[p.estado]}`}>
          {p.estado}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col min-h-0">
        <div className="text-[10px] font-semibold tracking-wide text-[#9ca3af]">{p.codigo}</div>
        <h3 className="font-semibold text-[15px] leading-snug line-clamp-2 mt-0.5">{p.nombre}</h3>

        <div className="mt-2 space-y-1 text-[11px] text-[#6b7280]">
          <div className="flex items-start gap-1.5"><Briefcase size={11} className="mt-0.5 shrink-0 text-[#dc2626]" /><span className="line-clamp-1">{p.coordinacionGeneral}</span></div>
          <div className="flex items-start gap-1.5"><MapPin size={11} className="mt-0.5 shrink-0 text-[#dc2626]" /><span className="line-clamp-1">{p.coordinacionPredial}</span></div>
          <div className="flex items-start gap-1.5"><UserCog size={11} className="mt-0.5 shrink-0 text-[#dc2626]" /><span className="line-clamp-1">{p.coordinadorPredial}</span></div>
          <div className="flex items-start gap-1.5"><Network size={11} className="mt-0.5 shrink-0 text-[#dc2626]" /><span className="line-clamp-1">{p.liderInterferencias}</span></div>
        </div>

        <div className="mt-3 space-y-2">
          <Progress label="Avance físico" value={p.fisico} />
          <Progress label="Avance financiero" value={p.financiero} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="Predios" value={p.predios} />
          <Stat label="Disponibles" value={p.disponibles} />
        </div>

        <Link
          to="/proyectos/$projectId"
          params={{ projectId: p.id }}
          className="mt-auto pt-3 block"
        >
          <span className="block text-center bg-[#dc2626] hover:bg-[#b91c1c] text-white font-medium text-[13px] py-2 rounded-md">
            Ver proyecto
          </span>
        </Link>
      </div>
    </div>
  );
}

function Progress({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[#6b7280]">{label}</span>
        <span className="font-semibold text-[#dc2626]">{value}%</span>
      </div>
      <div className="h-1.5 bg-[#fde2e2] rounded-full overflow-hidden mt-1">
        <div className="h-full bg-[#dc2626] rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#e5e7eb] rounded-md px-2.5 py-1.5">
      <div className="text-[10px] text-[#6b7280] flex items-center gap-1">
        <Home size={10} /> {label}
      </div>
      <div className="font-semibold text-[15px]">{value}</div>
    </div>
  );
}

function ProyectoRow({ p }: { p: Proyecto }) {
  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden flex">
      <div className="w-48 shrink-0 bg-[#e5e7eb]">
        <img src={p.img} alt={p.nombre} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="flex-1 p-4 grid grid-cols-[1fr_auto] gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold tracking-wide text-[#9ca3af]">{p.codigo}</span>
            <h3 className="font-semibold text-[15px]">{p.nombre}</h3>
            <span className="bg-[#fef2f2] text-[#dc2626] text-[11px] font-medium px-2 py-0.5 rounded-full border border-[#fecaca]">{p.tipo}</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${estadoBadge[p.estado]}`}>{p.estado}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3 text-[12px]">
            <Field icon={<Briefcase size={11} />} label="Coordinación General" value={p.coordinacionGeneral} />
            <Field icon={<MapPin size={11} />} label="Coordinación Predial" value={p.coordinacionPredial} />
            <Field icon={<UserCog size={11} />} label="Coordinador Predial" value={p.coordinadorPredial} />
            <Field icon={<Network size={11} />} label="Líder de Interferencias" value={p.liderInterferencias} />
          </div>

          <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3 text-[12px]">
            <Field label="Fase" value={p.fase} />
            <Field label="Predios" value={String(p.predios)} />
            <Field label="Disponibles" value={String(p.disponibles)} />
            <Field label="Presupuesto" value={p.presupuesto} />
          </div>

          <div className="mt-3 space-y-1.5">
            <Progress label="Avance físico" value={p.fisico} />
            <Progress label="Avance financiero" value={p.financiero} />
          </div>
        </div>

        <div className="flex flex-col items-end justify-between gap-2 min-w-[160px]">
          <div className="w-full space-y-1.5">
            <button className="w-full flex items-center justify-center gap-1.5 border border-[#e5e7eb] hover:bg-[#f9fafb] px-3 py-1.5 rounded-md text-[12px]">
              <Download size={12} /> Exportar
            </button>
            <button className="w-full flex items-center justify-center gap-1.5 border border-[#e5e7eb] hover:bg-[#f9fafb] px-3 py-1.5 rounded-md text-[12px]">
              <FolderOpen size={12} /> Expediente
            </button>
            <Link
              to="/proyectos/$projectId"
              params={{ projectId: p.id }}
              className="w-full flex items-center justify-center bg-[#dc2626] hover:bg-[#b91c1c] text-white px-3 py-1.5 rounded-md text-[12px] font-medium"
            >
              Ver proyecto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wide text-[#9ca3af] flex items-center gap-1">
        {icon}{label}
      </div>
      <div className="font-semibold text-[12px] truncate" title={value}>{value}</div>
    </div>
  );
}

function ProyectosTable({ items }: { items: Proyecto[] }) {
  return (
    <div>
      <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-[#f9fafb] text-[#6b7280] text-left">
              <tr>
                {["Código","Proyecto","Tipo","Coordinación General","Coordinación Predial","Coordinador Predial","Líder de Interferencias","Avance físico","Avance financiero","Predios","Estado","Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap border-b border-[#e5e7eb]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-[#f3f4f6] hover:bg-[#fafafa]">
                  <td className="px-4 py-3 font-semibold text-[#374151] whitespace-nowrap">{p.codigo}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#111827]">{p.nombre}</div>
                    <div className="text-[#6b7280] text-[11px]">{p.fase}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-[#fef2f2] text-[#dc2626] text-[11px] font-medium px-2 py-0.5 rounded-full border border-[#fecaca]">{p.tipo}</span>
                  </td>
                  <td className="px-4 py-3 text-[#374151] max-w-[200px]">{p.coordinacionGeneral}</td>
                  <td className="px-4 py-3 text-[#374151] max-w-[200px]">{p.coordinacionPredial}</td>
                  <td className="px-4 py-3 text-[#374151] whitespace-nowrap">{p.coordinadorPredial}</td>
                  <td className="px-4 py-3 text-[#374151] whitespace-nowrap">{p.liderInterferencias}</td>
                  <td className="px-4 py-3 min-w-[140px]"><Progress label="Físico" value={p.fisico} /></td>
                  <td className="px-4 py-3 min-w-[140px]"><Progress label="Financiero" value={p.financiero} /></td>
                  <td className="px-4 py-3 font-semibold">{p.predios}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${estadoBadge[p.estado]}`}>{p.estado}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 min-w-[130px]">
                      <div className="flex gap-1">
                        <button className="flex-1 flex items-center justify-center gap-1 border border-[#e5e7eb] hover:bg-[#f9fafb] px-2 py-1 rounded text-[11px]">
                          <FolderOpen size={11} /> Expediente
                        </button>
                        <Link
                          to="/proyectos/registro"
                          search={{ id: p.id }}
                          className="flex-1 flex items-center justify-center gap-1 border border-[#e5e7eb] hover:bg-[#f9fafb] px-2 py-1 rounded text-[11px]"
                        >
                          <Pencil size={11} /> Editar
                        </Link>
                      </div>
                      <Link
                        to="/proyectos/$projectId"
                        params={{ projectId: p.id }}
                        className="flex items-center justify-center gap-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-2 py-1 rounded text-[11px] font-medium"
                      >
                        <ArrowRight size={11} /> Ver proyecto
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
