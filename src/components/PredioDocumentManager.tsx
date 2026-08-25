import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DocumentSectionAccordion } from "@/components/DocumentSectionAccordion";
import {
  PredioDocumentModal,
  type DocumentModalMode,
} from "@/components/PredioDocumentModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Toaster } from "@/components/ui/sonner";
import {
  DOCUMENT_SECTION_CONFIGS,
  type DocumentSectionConfig,
  type DocumentSectionId,
  type PredioDocumentRecord,
} from "@/lib/predioDocumentSections";
import {
  deletePredioDocument,
  listPredioDocuments,
  savePredioDocument,
} from "@/services/predioDocumentsService";

type RecordsBySection = Record<DocumentSectionId, PredioDocumentRecord[]>;

type ModalState = {
  open: boolean;
  mode: DocumentModalMode;
  config: DocumentSectionConfig | null;
  record: PredioDocumentRecord | null;
};

const emptyRecords = () =>
  DOCUMENT_SECTION_CONFIGS.reduce<RecordsBySection>((result, config) => {
    result[config.id] = [];
    return result;
  }, {} as RecordsBySection);

export function PredioDocumentManager({
  projectId,
  codigo,
}: {
  projectId: string;
  codigo: string;
}) {
  const [recordsBySection, setRecordsBySection] = useState<RecordsBySection>(emptyRecords);
  const [openSections, setOpenSections] = useState<Set<DocumentSectionId>>(
    () => new Set([DOCUMENT_SECTION_CONFIGS[0].id]),
  );
  const [modal, setModal] = useState<ModalState>({
    open: false,
    mode: "create",
    config: null,
    record: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<{
    config: DocumentSectionConfig;
    record: PredioDocumentRecord;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all(
      DOCUMENT_SECTION_CONFIGS.map(async (config) => {
        const records = await listPredioDocuments({ projectId, codigo, sectionId: config.id });
        return [config.id, records] as const;
      }),
    ).then((entries) => {
      if (!active) return;
      setRecordsBySection((current) => {
        const next = { ...current };
        entries.forEach(([sectionId, records]) => {
          next[sectionId] = records;
        });
        return next;
      });
    });
    return () => {
      active = false;
    };
  }, [projectId, codigo]);

  function toggleSection(sectionId: DocumentSectionId) {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }

  function openModal(
    config: DocumentSectionConfig,
    mode: DocumentModalMode,
    record: PredioDocumentRecord | null = null,
  ) {
    setModal({ open: true, config, mode, record });
  }

  function closeModal() {
    setModal((current) => ({ ...current, open: false }));
  }

  async function handleSave(record: PredioDocumentRecord) {
    if (!modal.config) return;
    const config = modal.config;
    const saved = await savePredioDocument(
      { projectId, codigo, sectionId: config.id },
      record,
    );

    setRecordsBySection((current) => ({
      ...current,
      [config.id]: record.id
        ? current[config.id].map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...current[config.id]],
    }));
    closeModal();
    toast.success(record.id ? "Registro actualizado correctamente." : "Registro guardado correctamente.");
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePredioDocument(
        { projectId, codigo, sectionId: deleteTarget.config.id },
        deleteTarget.record.id,
      );
      setRecordsBySection((current) => ({
        ...current,
        [deleteTarget.config.id]: current[deleteTarget.config.id].filter(
          (item) => item.id !== deleteTarget.record.id,
        ),
      }));
      setDeleteTarget(null);
      toast.success("Registro eliminado correctamente.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el registro.");
    } finally {
      setDeleting(false);
    }
  }

  function handleDownload(record: PredioDocumentRecord) {
    if (!record.archivo) return;
    const url = URL.createObjectURL(record.archivo);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = record.archivo.name;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <>
      <div className="space-y-2">
        {DOCUMENT_SECTION_CONFIGS.map((config) => (
          <DocumentSectionAccordion
            key={config.id}
            config={config}
            records={recordsBySection[config.id]}
            open={openSections.has(config.id)}
            onToggle={() => toggleSection(config.id)}
            onNew={() => openModal(config, "create")}
            onView={(record) => openModal(config, "view", record)}
            onEdit={(record) => openModal(config, "edit", record)}
            onDownload={handleDownload}
            onDelete={(record) => setDeleteTarget({ config, record })}
          />
        ))}
      </div>

      <PredioDocumentModal
        open={modal.open}
        mode={modal.mode}
        config={modal.config}
        record={modal.record}
        onClose={closeModal}
        onSave={handleSave}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar registro</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el registro seleccionado de “{deleteTarget?.config.title}”.
              ¿Desea continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              className="inline-flex items-center gap-1.5 bg-[#dc2626] text-white hover:bg-[#b91c1c]"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster position="top-right" richColors />
    </>
  );
}
