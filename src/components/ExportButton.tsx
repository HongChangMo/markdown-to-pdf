"use client";

import { useState } from "react";
import type { DocumentState } from "@/lib/document/types";

type ExportButtonProps = {
  document: DocumentState;
};

export function ExportButton({ document }: ExportButtonProps) {
  const [status, setStatus] = useState("");

  async function exportPdf() {
    setStatus("Exporting");
    const response = await fetch("/api/export", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(document),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({ message: "PDF export failed" }))) as {
        message?: string;
      };
      setStatus(body.message ?? "PDF export failed");
      return;
    }

    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = href;
    anchor.download = `${document.title}.pdf`;
    anchor.click();
    URL.revokeObjectURL(href);
    setStatus("Exported");
  }

  return (
    <>
      <button type="button" onClick={exportPdf}>
        Export PDF
      </button>
      {status ? <span role="status">{status}</span> : null}
    </>
  );
}
