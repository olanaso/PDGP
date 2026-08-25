import {
  ChevronDown,
  Download,
  Eye,
  Info,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { DocumentSectionIcon } from "@/components/DocumentSectionIcon";
import type {
  DocumentSectionConfig,
  PredioDocumentRecord,
} from "@/lib/predioDocumentSections";

type Props = {
  config: DocumentSectionConfig;
  records: PredioDocumentRecord[];
  open: boolean;
  onToggle: () => void;
  onNew: () => void;
  onView: (record: PredioDocumentRecord) => void;
  onEdit: (record: PredioDocumentRecord) => void;
  onDownload: (record: PredioDocumentRecord) => void;
  onDelete: (record: PredioDocumentRecord) => void;
};

export function DocumentSectionAccordion({
  config,
  records,
  open,
  onToggle,
  onNew,
  onView,
  onEdit,
  onDownload,
  onDelete,
}: Props) {
  return (
    <section className="overflow-hidden rounded border border-gray-200 bg-white">
      <div className="flex items-center bg-gray-50">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left hover:bg-gray-100"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded bg-red-50 text-[#dc2626]">
            <DocumentSectionIcon icon={config.icon} size={14} />
          </span>
          <span className="truncate text-[12px] font-semibold text-gray-800">{config.title}</span>
          <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600">
            {records.length}
          </span>
          <ChevronDown
            size={14}
            className={`ml-auto shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNew();
          }}
          className="mr-3 inline-flex items-center gap-1 rounded bg-[#dc2626] px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-[#b91c1c]"
        >
          <Plus size={13} /> Nuevo
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]">
              <thead className="bg-white text-gray-600">
                <tr className="border-b border-gray-200">
                  <th className="w-10 px-2 py-2 text-center font-semibold">N.º</th>
                  <th className="min-w-[150px] px-2 py-2 text-left font-semibold">Acciones</th>
                  {config.columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-2 py-2 text-left font-semibold ${column.className ?? ""}`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={config.columns.length + 2} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center gap-1.5 text-gray-500">
                        <Info size={18} className="text-gray-400" />
                        <span>{config.emptyMessage}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((record, index) => (
                    <tr key={record.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70">
                      <td className="px-2 py-2 text-center text-gray-500">{index + 1}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1">
                          <ActionButton label="Ver" onClick={() => onView(record)}>
                            <Eye size={12} />
                          </ActionButton>
                          <ActionButton label="Editar" onClick={() => onEdit(record)}>
                            <Pencil size={12} />
                          </ActionButton>
                          <ActionButton
                            label={record.archivo ? "Descargar archivo" : "Sin archivo adjunto"}
                            onClick={() => onDownload(record)}
                            disabled={!record.archivo}
                          >
                            <Download size={12} />
                          </ActionButton>
                          <ActionButton label="Eliminar" onClick={() => onDelete(record)} danger>
                            <Trash2 size={12} />
                          </ActionButton>
                        </div>
                      </td>
                      {config.columns.map((column) => (
                        <td key={column.key} className={`px-2 py-2 text-gray-700 ${column.className ?? ""}`}>
                          {column.key === "archivo"
                            ? record.archivo?.name || "—"
                            : record[column.key] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`inline-flex size-7 items-center justify-center rounded border border-gray-200 bg-white hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35 ${danger ? "text-[#dc2626]" : "text-gray-600"}`}
    >
      {children}
    </button>
  );
}
