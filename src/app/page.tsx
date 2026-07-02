"use client";

import { useState } from "react";
import styles from "@/components/AppShell.module.css";
import { ExportButton } from "@/components/ExportButton";
import { ImageAssetPanel } from "@/components/ImageAssetPanel";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { PreviewPane } from "@/components/PreviewPane";
import { StylePanel } from "@/components/StylePanel";
import { DEFAULT_DOCUMENT_STATE } from "@/lib/document/defaults";
import type { DocumentState } from "@/lib/document/types";

export default function Home() {
  const [document, setDocument] = useState<DocumentState>(DEFAULT_DOCUMENT_STATE);

  return (
    <main className={styles.shell}>
      <header className={styles.toolbar}>
        <input
          aria-label="Document title"
          className={styles.titleInput}
          value={document.title}
          onChange={(event) => setDocument({ ...document, title: event.target.value })}
        />
        <ExportButton document={document} />
      </header>
      <div className={styles.workspace}>
        <section className={styles.pane}>
          <MarkdownEditor
            value={document.markdown}
            onChange={(markdown) => setDocument({ ...document, markdown })}
          />
        </section>
        <section className={styles.pane}>
          <PreviewPane document={document} />
        </section>
        <section className={styles.pane}>
          <StylePanel
            value={document.style}
            onChange={(style) => setDocument({ ...document, style })}
          />
          <ImageAssetPanel
            assets={document.assets}
            onChange={(assets) => setDocument({ ...document, assets })}
          />
        </section>
      </div>
    </main>
  );
}
