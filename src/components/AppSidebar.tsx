import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FileText,
  Map as MapIcon,
  ShieldCheck,
  PanelLeftClose,
  Users,
  KeyRound,
  Settings,
  Database,
  Mail,
  MessageSquare,
  LogOut,
  User as UserIcon,
  Network,
  ClipboardCheck,
  LineChart,
  Wallet,
  Target,
  FolderArchive,
  Banknote,
  BarChart3,
  Briefcase,
  ReceiptText,
  Landmark,
  Handshake,
} from "lucide-react";
import { useState } from "react";

export function AppSidebar() {
  const { location } = useRouterState();
  const navigate = useNavigate();
  const path = location.pathname;
  const executivePaths = [
    "/seguimiento-monitoreo/general",
    "/seguimiento-monitoreo/dashboard-geografico",
    "/seguimiento-monitoreo/dashboard-financiero",
    "/seguimiento-monitoreo/cartera-liberacion",
  ];
  const coordinatorPaths = [
    "/seguimiento-monitoreo/predios-privados",
    "/seguimiento-monitoreo/transferencia-interestatal",
    "/seguimiento-monitoreo/contractual-servicios-interferencias",
    "/seguimiento-monitoreo/territorial-pagos-cierre",
    "/seguimiento-monitoreo/gastos-proyecto-predio",
    "/seguimiento-monitoreo/presupuestal-predio",
    "/seguimiento-monitoreo/predial",
    "/seguimiento-monitoreo/seguimiento-personal",
  ];
  const integrationPaths = [
    "/seguimiento-monitoreo/integrado-proyectos",
    "/seguimiento-monitoreo/integrado-ceplan-siaf",
  ];
  const technicalLegalPaths = [
    "/seguimiento-monitoreo/tecnico-tasaciones",
    "/seguimiento-monitoreo/legal-riesgos-plazos",
    "/seguimiento-monitoreo/inscripciones",
  ];
  const [secOpen, setSecOpen] = useState(path.startsWith("/seguridad"));
  const [cfgOpen, setCfgOpen] = useState(path.startsWith("/configuracion"));
  const [monOpen, setMonOpen] = useState(path.startsWith("/seguimiento-monitoreo"));
  const [executiveOpen, setExecutiveOpen] = useState(executivePaths.includes(path));
  const [coordinatorOpen, setCoordinatorOpen] = useState(coordinatorPaths.includes(path));
  const [integrationOpen, setIntegrationOpen] = useState(integrationPaths.includes(path));
  const [technicalLegalOpen, setTechnicalLegalOpen] = useState(technicalLegalPaths.includes(path));
  const [confirmOut, setConfirmOut] = useState(false);

  const handleLogout = () => {
    try {
      localStorage.removeItem("mtc-session");
      sessionStorage.clear();
    } catch {
      // El cierre de sesión debe continuar aunque el almacenamiento no esté disponible.
    }
    navigate({ to: "/", replace: true });
  };

  const linkCls = (active: boolean) =>
    `flex items-center gap-2 mx-2 px-2 py-1.5 rounded-md text-[13px] ${
      active ? "bg-[#fef2f2] text-[#dc2626] font-medium" : "hover:bg-[#f3f4f6] text-[#374151]"
    }`;

  return (
    <aside className="w-60 shrink-0 border-r border-[#e5e7eb] bg-white flex flex-col">
      <div className="px-4 py-4 flex items-center justify-between border-b border-[#e5e7eb]">
        <div>
          <div className="font-semibold text-[15px]">Plataforma Digital de Gestión de Predios</div>
        </div>
        <button className="text-[#6b7280] hover:text-[#111]">
          <PanelLeftClose size={16} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 text-[13px]">
        <div className="px-4 pt-2 pb-1 text-[11px] text-[#6b7280]">Gestión predial</div>
        <Link
          to="/mapa"
          className={`flex items-center gap-2 mx-2 px-2 py-1.5 rounded-md text-[13px] ${
            path === "/mapa"
              ? "bg-[#dc2626] text-white font-medium"
              : "hover:bg-[#f3f4f6] text-[#374151]"
          }`}
        >
          <MapIcon size={15} /> Mapa de proyectos
        </Link>
        <Link
          to="/proyectos"
          className={`flex items-center gap-2 mx-2 px-2 py-1.5 rounded-md text-[13px] ${
            path === "/proyectos" || path.startsWith("/proyectos")
              ? "bg-[#dc2626] text-white font-medium"
              : "hover:bg-[#f3f4f6] text-[#374151]"
          }`}
        >
          <Folder size={15} /> Proyectos
        </Link>
        <Link to="/pago-consignacion" className={linkCls(path.startsWith("/pago-consignacion"))}>
          <Banknote size={15} /> Pago y consignación
        </Link>

        <div className="px-4 pt-4 pb-1 text-[11px] text-[#6b7280]">Módulos transversales</div>
        <Link to="/interoperabilidad" className={linkCls(path === "/interoperabilidad")}>
          <Network size={15} /> Interoperabilidad
        </Link>
        <Link to="/gestion-social" className={linkCls(path === "/gestion-social")}>
          <Handshake size={15} /> Gestión social
        </Link>
        <Link to="/servicios" className={linkCls(path === "/servicios")}>
          <Briefcase size={15} /> Servicios
        </Link>
        <Link to="/gestion-predial-social" className={linkCls(path === "/gestion-predial-social")}>
          <Users size={15} /> Gestión Predial Social
        </Link>
        <button
          onClick={() => setMonOpen((v) => !v)}
          className={`w-full ${linkCls(path.startsWith("/seguimiento-monitoreo"))} justify-between`}
        >
          <span className="flex items-center gap-2">
            <LineChart size={15} /> Monitoreo y seguimiento
          </span>
          {monOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {monOpen && (
          <div className="ml-5 mt-1 space-y-1">
            <button
              onClick={() => setExecutiveOpen((value) => !value)}
              className={`flex w-[calc(100%_-_0.5rem)] items-center justify-between rounded-md px-2 py-1.5 text-[12px] font-semibold ${
                executivePaths.includes(path)
                  ? "bg-red-50 text-red-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              aria-expanded={executiveOpen}
            >
              <span className="flex items-center gap-2">
                <BarChart3 size={14} /> Alta gerencia
              </span>
              {executiveOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>
            {executiveOpen && (
              <div className="ml-3 space-y-0.5 border-l border-slate-200 pl-1">
                <Link
                  to="/seguimiento-monitoreo/general"
                  className={linkCls(path === "/seguimiento-monitoreo/general")}
                >
                  <LineChart size={14} /> Resumen general
                </Link>
                <Link
                  to="/seguimiento-monitoreo/dashboard-geografico"
                  className={linkCls(path === "/seguimiento-monitoreo/dashboard-geografico")}
                >
                  <MapIcon size={14} /> Dashboard geográfico
                </Link>
                <Link
                  to="/seguimiento-monitoreo/dashboard-financiero"
                  className={linkCls(path === "/seguimiento-monitoreo/dashboard-financiero")}
                >
                  <Wallet size={14} /> Presupuesto y pagos
                </Link>
                <Link
                  to="/seguimiento-monitoreo/cartera-liberacion"
                  className={linkCls(path === "/seguimiento-monitoreo/cartera-liberacion")}
                >
                  <MapIcon size={14} /> Avance y disponibilidad predial
                </Link>
              </div>
            )}

            <button
              onClick={() => setCoordinatorOpen((value) => !value)}
              className={`flex w-[calc(100%_-_0.5rem)] items-center justify-between rounded-md px-2 py-1.5 text-[12px] font-semibold ${
                coordinatorPaths.includes(path)
                  ? "bg-red-50 text-red-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              aria-expanded={coordinatorOpen}
            >
              <span className="flex items-center gap-2">
                <ClipboardCheck size={14} /> Coordinadores
              </span>
              {coordinatorOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>
            {coordinatorOpen && (
              <div className="ml-3 space-y-0.5 border-l border-slate-200 pl-1">
                <Link
                  to="/seguimiento-monitoreo/predios-privados"
                  className={linkCls(path === "/seguimiento-monitoreo/predios-privados")}
                >
                  <Folder size={14} /> Predios privados
                </Link>
                <Link
                  to="/seguimiento-monitoreo/transferencia-interestatal"
                  className={linkCls(path === "/seguimiento-monitoreo/transferencia-interestatal")}
                >
                  <Landmark size={14} /> Transferencias interestatales
                </Link>
                <Link
                  to="/seguimiento-monitoreo/contractual-servicios-interferencias"
                  className={linkCls(
                    path === "/seguimiento-monitoreo/contractual-servicios-interferencias",
                  )}
                >
                  <Briefcase size={14} /> Contratos e interferencias
                </Link>
                <Link
                  to="/seguimiento-monitoreo/territorial-pagos-cierre"
                  className={linkCls(path === "/seguimiento-monitoreo/territorial-pagos-cierre")}
                >
                  <MapIcon size={14} /> Mapa, pagos y cierre
                </Link>
                <Link
                  to="/seguimiento-monitoreo/gastos-proyecto-predio"
                  className={linkCls(path === "/seguimiento-monitoreo/gastos-proyecto-predio")}
                >
                  <ReceiptText size={14} /> Gastos por predio
                </Link>
                <Link
                  to="/seguimiento-monitoreo/presupuestal-predio"
                  className={linkCls(path === "/seguimiento-monitoreo/presupuestal-predio")}
                >
                  <Wallet size={14} /> Presupuesto por predio
                </Link>
                <Link
                  to="/seguimiento-monitoreo/predial"
                  className={linkCls(path === "/seguimiento-monitoreo/predial")}
                >
                  <LineChart size={14} /> Metas y ejecución predial
                </Link>
                <Link
                  to="/seguimiento-monitoreo/seguimiento-personal"
                  className={linkCls(path === "/seguimiento-monitoreo/seguimiento-personal")}
                >
                  <Users size={14} /> Seguimiento del personal
                </Link>
              </div>
            )}

            <button
              onClick={() => setIntegrationOpen((value) => !value)}
              className={`flex w-[calc(100%_-_0.5rem)] items-center justify-between rounded-md px-2 py-1.5 text-[12px] font-semibold ${
                integrationPaths.includes(path)
                  ? "bg-red-50 text-red-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              aria-expanded={integrationOpen}
            >
              <span className="flex items-center gap-2">
                <Network size={14} /> Integración CEPLAN–SIAF
              </span>
              {integrationOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>
            {integrationOpen && (
              <div className="ml-3 space-y-0.5 border-l border-slate-200 pl-1">
                <Link
                  to="/seguimiento-monitoreo/integrado-proyectos"
                  className={linkCls(path === "/seguimiento-monitoreo/integrado-proyectos")}
                >
                  <BarChart3 size={14} /> Todos los proyectos
                </Link>
                <Link
                  to="/seguimiento-monitoreo/integrado-ceplan-siaf"
                  className={linkCls(path === "/seguimiento-monitoreo/integrado-ceplan-siaf")}
                >
                  <Network size={14} /> Proyecto y predio
                </Link>
              </div>
            )}

            <button
              onClick={() => setTechnicalLegalOpen((value) => !value)}
              className={`flex w-[calc(100%_-_0.5rem)] items-center justify-between rounded-md px-2 py-1.5 text-[12px] font-semibold ${
                technicalLegalPaths.includes(path)
                  ? "bg-red-50 text-red-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              aria-expanded={technicalLegalOpen}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck size={14} /> Técnicos y legales
              </span>
              {technicalLegalOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>
            {technicalLegalOpen && (
              <div className="ml-3 space-y-0.5 border-l border-slate-200 pl-1">
                <Link
                  to="/seguimiento-monitoreo/tecnico-tasaciones"
                  className={linkCls(path === "/seguimiento-monitoreo/tecnico-tasaciones")}
                >
                  <FileText size={14} /> Expedientes y tasaciones
                </Link>
                <Link
                  to="/seguimiento-monitoreo/legal-riesgos-plazos"
                  className={linkCls(path === "/seguimiento-monitoreo/legal-riesgos-plazos")}
                >
                  <ShieldCheck size={14} /> Situación legal y plazos
                </Link>
                <Link
                  to="/seguimiento-monitoreo/inscripciones"
                  className={linkCls(path === "/seguimiento-monitoreo/inscripciones")}
                >
                  <LineChart size={14} /> Inscripción registral
                </Link>
              </div>
            )}
          </div>
        )}
        <Link to="/gestion-presupuestal" className={linkCls(path === "/gestion-presupuestal")}>
          <Target size={15} /> Metas
        </Link>
        <Link to="/gestion-documental" className={linkCls(path === "/gestion-documental")}>
          <FolderArchive size={15} /> Gestión Documental
        </Link>
        <button
          onClick={() => setSecOpen((v) => !v)}
          className={`w-full ${linkCls(path.startsWith("/seguridad"))} justify-between`}
        >
          <span className="flex items-center gap-2">
            <ShieldCheck size={15} /> Seguridad
          </span>
          {secOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {secOpen && (
          <div className="ml-6 mt-1 space-y-0.5">
            <Link to="/seguridad/roles" className={linkCls(path.startsWith("/seguridad/roles"))}>
              <KeyRound size={14} /> Roles
            </Link>
            <Link to="/seguridad/usuarios" className={linkCls(path === "/seguridad/usuarios")}>
              <Users size={14} /> Usuarios
            </Link>
          </div>
        )}

        <button
          onClick={() => setCfgOpen((v) => !v)}
          className={`w-full ${linkCls(path.startsWith("/configuracion"))} justify-between`}
        >
          <span className="flex items-center gap-2">
            <Settings size={15} /> Configuración
          </span>
          {cfgOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {cfgOpen && (
          <div className="ml-6 mt-1 space-y-0.5">
            <Link
              to="/configuracion/maestros"
              className={linkCls(path === "/configuracion/maestros")}
            >
              <Database size={14} /> Maestros
            </Link>
            <Link
              to="/configuracion/hitos-plazos"
              className={linkCls(path === "/configuracion/hitos-plazos")}
            >
              <ClipboardCheck size={14} /> Hitos y plazos
            </Link>
            <Link
              to="/configuracion/siaf-ceplan"
              className={linkCls(path === "/configuracion/siaf-ceplan")}
            >
              <Landmark size={14} /> SIAF – CEPLAN
            </Link>
            <Link
              to="/configuracion/correos"
              className={linkCls(path === "/configuracion/correos")}
            >
              <Mail size={14} /> Correos
            </Link>
            <Link to="/configuracion/sms" className={linkCls(path === "/configuracion/sms")}>
              <MessageSquare size={14} /> SMS (Twilio)
            </Link>
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-[#e5e7eb]">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="size-8 rounded-full bg-[#fef2f2] text-[#dc2626] flex items-center justify-center">
            <UserIcon size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-[13px] truncate">Equipo funcional</div>
            <div className="text-[11px] text-[#6b7280] truncate">Gestión Predial — MTC</div>
          </div>
        </div>
        <button
          onClick={() => setConfirmOut(true)}
          className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium border border-[#dc2626] text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
        >
          <LogOut size={14} /> Cerrar sesión
        </button>
      </div>

      {confirmOut && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-sm p-5">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-full bg-[#fef2f2] text-[#dc2626] flex items-center justify-center shrink-0">
                <LogOut size={16} />
              </div>
              <div>
                <div className="font-semibold text-[14px] text-[#111]">Cerrar sesión</div>
                <div className="text-[12px] text-[#6b7280] mt-1">
                  ¿Está seguro que desea cerrar su sesión?
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setConfirmOut(false)}
                className="px-4 py-2 rounded-md text-[12px] font-medium border border-[#d1d5db] text-[#374151] hover:bg-[#f9fafb]"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md text-[12px] font-semibold bg-[#dc2626] hover:bg-[#b91c1c] text-white"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
