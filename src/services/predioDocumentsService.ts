import type {
  DocumentSectionId,
  PredioDocumentRecord,
} from "@/lib/predioDocumentSections";

type DocumentScope = {
  projectId: string;
  codigo: string;
  sectionId: DocumentSectionId;
};

const store = new Map<string, PredioDocumentRecord[]>();

const keyFor = ({ projectId, codigo, sectionId }: DocumentScope) =>
  `${projectId}:${codigo}:${sectionId}`;

const wait = (milliseconds = 450) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

export async function listPredioDocuments(scope: DocumentScope) {
  await wait(120);
  return [...(store.get(keyFor(scope)) ?? [])];
}

export async function savePredioDocument(
  scope: DocumentScope,
  record: PredioDocumentRecord,
) {
  await wait();
  const key = keyFor(scope);
  const current = store.get(key) ?? [];
  const duplicate = current.find(
    (item) =>
      item.numeroDocumento.trim().toLowerCase() ===
        record.numeroDocumento.trim().toLowerCase() && item.id !== record.id,
  );

  if (duplicate) {
    throw new Error("Ya existe un registro con el mismo número de documento en esta sección.");
  }

  const saved: PredioDocumentRecord = {
    ...record,
    id: record.id || `document-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
  const next = record.id
    ? current.map((item) => (item.id === record.id ? saved : item))
    : [saved, ...current];

  store.set(key, next);
  return saved;
}

export async function deletePredioDocument(scope: DocumentScope, recordId: string) {
  await wait(300);
  const key = keyFor(scope);
  const current = store.get(key) ?? [];
  store.set(
    key,
    current.filter((item) => item.id !== recordId),
  );
}
