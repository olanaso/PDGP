import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Save, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { AppSidebar } from "../components/AppSidebar";

export const Route = createFileRoute("/configuracion/correos")({
  head: () => ({ meta: [{ title: "Configuración · Correos" }] }),
  component: CorreosPage,
});

function CorreosPage() {
  const [provider, setProvider] = useState("smtp");
  const [form, setForm] = useState({
    host: "smtp.gmail.com",
    port: "587",
    user: "notificaciones@mtc.gob.pe",
    pass: "",
    fromName: "MTC Gestión Predial",
    fromEmail: "notificaciones@mtc.gob.pe",
    secure: "tls",
    apiKey: "",
    domain: "",
  });
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null);
  const [testTo, setTestTo] = useState("");

  const upd = (k: string, v: string) => setForm({ ...form, [k]: v });

  const test = () => {
    if (!testTo) return setStatus({ ok: false, msg: "Ingrese un correo de prueba" });
    setStatus({ ok: true, msg: `Correo de prueba enviado a ${testTo}` });
  };

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <AppSidebar />
      <main className="flex-1 p-6 max-w-5xl">
        <div className="flex items-center gap-2 mb-1">
          <Mail size={18} className="text-[#dc2626]" />
          <h1 className="text-[18px] font-semibold">Configuración de correos</h1>
        </div>
        <p className="text-[13px] text-[#6b7280] mb-4">
          Configura el servidor de salida que enviará notificaciones del sistema (asignaciones,
          confirmaciones, recordatorios de expedientes).
        </p>

        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5">
          <div className="mb-4">
            <div className="text-[12px] font-medium text-[#374151] mb-2">Proveedor</div>
            <div className="flex gap-2">
              {[
                { id: "smtp", label: "SMTP genérico" },
                { id: "sendgrid", label: "SendGrid" },
                { id: "resend", label: "Resend" },
                { id: "ses", label: "Amazon SES" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  className={`px-3 py-1.5 rounded-md text-[13px] border ${
                    provider === p.id ? "bg-[#dc2626] text-white border-[#dc2626]" : "border-[#d1d5db] text-[#374151] hover:bg-[#f9fafb]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {provider === "smtp" && (
              <>
                <Field label="Servidor SMTP" value={form.host} onChange={(v) => upd("host", v)} />
                <Field label="Puerto" value={form.port} onChange={(v) => upd("port", v)} />
                <Field label="Usuario" value={form.user} onChange={(v) => upd("user", v)} />
                <Field label="Contraseña" type="password" value={form.pass} onChange={(v) => upd("pass", v)} />
                <div>
                  <label className="block text-[12px] text-[#374151] mb-1">Cifrado</label>
                  <select
                    value={form.secure}
                    onChange={(e) => upd("secure", e.target.value)}
                    className="w-full border border-[#d1d5db] rounded-md px-2 py-1.5 text-[13px]"
                  >
                    <option value="none">Ninguno</option>
                    <option value="tls">STARTTLS</option>
                    <option value="ssl">SSL/TLS</option>
                  </select>
                </div>
              </>
            )}
            {(provider === "sendgrid" || provider === "resend") && (
              <Field label="API Key" type="password" value={form.apiKey} onChange={(v) => upd("apiKey", v)} />
            )}
            {provider === "ses" && (
              <>
                <Field label="Access Key ID" value={form.apiKey} onChange={(v) => upd("apiKey", v)} />
                <Field label="Secret Access Key" type="password" value={form.pass} onChange={(v) => upd("pass", v)} />
                <Field label="Región" value={form.domain} onChange={(v) => upd("domain", v)} />
              </>
            )}
            <Field label="Nombre remitente" value={form.fromName} onChange={(v) => upd("fromName", v)} />
            <Field label="Correo remitente" value={form.fromEmail} onChange={(v) => upd("fromEmail", v)} />
          </div>

          <div className="border-t border-[#e5e7eb] mt-5 pt-4">
            <div className="text-[12px] font-medium text-[#374151] mb-2">Probar conexión</div>
            <div className="flex gap-2">
              <input
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="correo@dominio.com"
                className="flex-1 border border-[#d1d5db] rounded-md px-3 py-1.5 text-[13px]"
              />
              <button
                onClick={test}
                className="flex items-center gap-1 px-3 py-1.5 border border-[#d1d5db] rounded-md text-[13px] hover:bg-[#f9fafb]"
              >
                <Send size={14} /> Enviar prueba
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
              <Save size={14} /> Guardar configuración
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-[12px] text-[#374151] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#d1d5db] rounded-md px-2 py-1.5 text-[13px]"
      />
    </div>
  );
}