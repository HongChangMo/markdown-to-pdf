"use client";

import { useRef, useState } from "react";
import {
  createDocumentExportJson,
  createDocumentJsonFilename,
  parseStoredDocumentState,
} from "@/lib/document/persistence";
import type { DocumentState } from "@/lib/document/types";
import styles from "./AppShell.module.css";

type DocumentPersistenceControlsProps = {
  document: DocumentState;
  onImport: (document: DocumentState) => void;
  onReset: () => void;
};

export function DocumentPersistenceControls({
  document,
  onImport,
  onReset,
}: DocumentPersistenceControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  function exportDocument() {
    const blob = new Blob([createDocumentExportJson(document)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = href;
    anchor.download = createDocumentJsonFilename(document.title);
    anchor.click();
    URL.revokeObjectURL(href);
    setStatus("Exported document");
    setError("");
  }

  async function importDocument(files: FileList | null) {
    const file = files?.[0];
    if (!file) {
      return;
    }

    try {
      const importedDocument = parseStoredDocumentState(await file.text());
      if (!importedDocument) {
        throw new Error("Document import failed.");
      }

      onImport(importedDocument);
      setStatus("Imported");
      setError("");
    } catch {
      setError("Document import failed.");
      setStatus("");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function resetDocument() {
    if (!window.confirm("Reset the document and clear the local draft?")) {
      return;
    }

    onReset();
    setStatus("Reset document");
    setError("");
  }

  return (
    <div className={styles.documentActions} aria-label="Document actions">
      <button type="button" onClick={exportDocument}>
        Export document
      </button>
      <label className={styles.importButton}>
        Import document
        <input
          ref={fileInputRef}
          aria-label="Import document"
          type="file"
          accept="application/json,.json"
          onChange={(event) => void importDocument(event.target.files)}
        />
      </label>
      <button type="button" onClick={resetDocument}>
        Reset document
      </button>
      {status ? <span role="status">{status}</span> : null}
      {error ? <span role="alert">{error}</span> : null}
    </div>
  );
}
