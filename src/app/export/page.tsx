"use client";

import { useEffect, useState } from "react";
import { DocumentRenderer } from "@/components/DocumentRenderer";
import { parseDocumentState } from "@/lib/document/validation";
import type { DocumentState } from "@/lib/document/types";
import { EXPORT_STORAGE_KEY } from "@/lib/export/storage";

export default function ExportPage() {
  const [document, setDocument] = useState<DocumentState | null>(null);
  const [error, setError] = useState("");
  const [fontReadyDocument, setFontReadyDocument] = useState<DocumentState | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(EXPORT_STORAGE_KEY);
        setDocument(parseDocumentState(JSON.parse(raw ?? "null")));
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Failed to load export document");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!document) {
      return;
    }

    let cancelled = false;

    const ready = window.document.fonts?.ready ?? Promise.resolve();
    ready
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) {
          setFontReadyDocument(document);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [document]);

  if (error) {
    return <main data-export-error="true">{error}</main>;
  }

  if (!document) {
    return <main>Preparing export</main>;
  }

  return <DocumentRenderer document={document} exportReady={fontReadyDocument === document} />;
}
