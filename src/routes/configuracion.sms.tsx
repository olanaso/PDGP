import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquare, Save, Send, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/configuracion/sms")({
  head: () => ({ meta: [{ title: "Configuración · SMS (Twilio)" }] }),
  component: SmsPage,
});

function SmsPage() {
  const [form, setForm] = useState({
    accountSid: "",
    authToken: "",
    apiKeySid: "",
    apiKeySecret: "",
    from: "+51",
    messagingServiceSid: "",
    statusCallback: "https://mtc.gob.pe/api/twilio/status",
    geoPermissions: true,
    pumpingProtection: true,
  });
  const [testTo, setTestTo] = useState("");
  const [testBody, setTestBody] = useState("Mensaje de prueba MTC Gestión Predial");
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null);

  const upd = (k: string, v: string | boolean) => setForm({ ...form, [k]: v as never });

  const test = () => {
    if (!form.accountSid || !form.authToken) return setStatus({ ok: false, msg: "Complete Account SID y Auth Token" });
    if (!testTo) return setStatus({ ok: false, msg: "Ingrese un número destino" });
    setStatus({ ok: true, msg: `SMS de prueba enviado a ${testTo}` });
  };

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <AppSidebar />
      <main className="flex-1 p-6 max-w-5xl">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare size={18} className="text-[#dc2626]" />
          <h1 className="text-[18px] font-semibold">Configuración de SMS · Twilio</h1>
        </div>
        <p className="text-[13px] text-[#6b7280] mb-4">
          Conexión a Twilio para envío de notificaciones SMS a propietarios, equipo técnico
          y trazabilidad de expedientes.
        </p>

        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[14px] font-semibold">Credenciales de Twilio</div>
              <div className="text-[12px] text-[#6b7280]">
                Obtén tus credenciales desde la consola de Twilio.
              </div>
            </div>
            <a
              href="https://console.twilio.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[12px] text-[#dc2626] hover:underline"
            >
              Abrir consola Twilio <ExternalLink size={12} />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Account SID" value={form.accountSid} onChange={(v) => upd("accountSid", v)} placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
            <Field label="Auth Token" type="password" value={form.authToken} onChange={(v) => upd("authToken", v)} />
            <Field label="API Key SID (opcional)" value={form.apiKeySid} onChange={(v) => upd("apiKeySid", v)} />
            <Field label="API Key Secret (opcional)" type="password" value={form.apiKeySecret} onChange={(v) => upd("apiKeySecret", v)} />
            <Field label="Número remitente (E.164)" value={form.from} onChange={(v) => upd("from", v)} placeholder="+51987654321" />
            <Field label="Messaging Service SID (opcional)" value={form.messagingServiceSid} onChange={(v) => upd("messagingServiceSid", v)} />
            <div className="col-span-2">
              <Field label="Status Callback URL" value={form.statusCallback} onChange={(v) => upd("statusCallback", v)} />
            </div>
          </div>

          <div className="border-t border-[#e5e7eb] mt-5 pt-4 space-y-2">
            <div className="text-[12px] font-medium text-[#374151] mb-1">Protección y permisos</div>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={form.pumpingProtection} onChange={(e) => upd("pumpingProtection", e.target.checked)} />
              Habilitar SMS Pumping Protection
            </label>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={form.geoPermissions} onChange={(e) => upd("geoPermissions", e.target.checked)} />
              Restringir envío solo a destinos en Perú (Geo Permissions)
            </label>
          </div>

          <div className="border-t border-[#e5e7eb] mt-5 pt-4">
            <div className="text-[12px] font-medium text-[#374151] mb-2">Probar envío</div>
            <div className="grid grid-cols-[200px_1fr_auto] gap-2">
              <input
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="+51987654321"
                className="border border-[#d1d5db] rounded-md px-3 py-1.5 text-[13px]"
              />
              <input
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
                className="border border-[#d1d5db] rounded-md px-3 py-1.5 text-[13px]"
              />
              <button
                onClick={test}
                className="flex items-center gap-1 px-3 py-1.5 border border-[#d1d5db] rounded-md text-[13px] hover:bg-[#f9fafb]"
              >
                <Send size={14} /> Enviar SMS
              </button>
            </div>
            {status && (
              <div className={`mt-3 flex items-center gap-2 text-[13px] ${status.ok ? "text-green-700" : "text-red-600"}`}>
                {status.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {status.msg}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button className="px-3 py-1.5 border border-[#d1d5db] rounded-md text-[13px] hover:bg-[#f9fafb]">Cancelar</button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md text-[13px] hover:bg-green-700">
              <Save size={14} /> Guardar conexión
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[12px] text-[#374151] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#d1d5db] rounded-md px-2 py-1.5 text-[13px]"
      />
    </div>
  );
}