"use client";

import { useEffect, useRef, useState } from "react";
import type { DocumentState } from "@/lib/document/types";
import { DocumentRenderer } from "./DocumentRenderer";
import styles from "./AppShell.module.css";

type PreviewPaneProps = {
  document: DocumentState;
};

export function PreviewPane({ document }: PreviewPaneProps) {
  const pageRef = useRef<HTMLElement>(null);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    const page = pageRef.current;

    if (!page) {
      return;
    }

    function updatePageCount() {
      const currentPage = pageRef.current;

      if (!currentPage) {
        return;
      }

      const style = window.getComputedStyle(currentPage);
      const pageHeight = Number.parseFloat(style.minHeight);

      if (!Number.isFinite(pageHeight) || pageHeight <= 0) {
        setPageCount(1);
        return;
      }

      const renderedHeight = Math.max(currentPage.scrollHeight, currentPage.getBoundingClientRect().height);
      setPageCount(Math.max(1, Math.ceil(renderedHeight / pageHeight)));
    }

    updatePageCount();

    const observer = new ResizeObserver(updatePageCount);
    observer.observe(page);
    window.addEventListener("resize", updatePageCount);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePageCount);
    };
  }, [document]);

  return (
    <section className={styles.preview} aria-label="Document preview">
      <div className={styles.previewStatus} data-testid="preview-page-count">
        Pages: {pageCount}
      </div>
      <DocumentRenderer document={document} pageRef={pageRef} />
    </section>
  );
}
