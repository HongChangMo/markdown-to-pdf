import { parseDocumentState } from "./validation";
import type { DocumentState } from "./types";

const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g;

export const DOCUMENT_STORAGE_KEY = "markdown-to-pdf.document.v1";

export function createDocumentExportJson(document: DocumentState): string {
  return JSON.stringify(document, null, 2);
}

export function parseStoredDocumentState(value: string | null): DocumentState | null {
  if (!value) {
    return null;
  }

  try {
    return parseDocumentState(JSON.parse(value));
  } catch {
    return null;
  }
}

export function createDocumentJsonFilename(title: string): string {
  const cleaned = title.replace(INVALID_FILENAME_CHARS, "").trim();
  return `${cleaned || "document"}.json`;
}
