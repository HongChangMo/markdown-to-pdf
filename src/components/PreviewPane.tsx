import type { DocumentState } from "@/lib/document/types";
import { DocumentRenderer } from "./DocumentRenderer";
import styles from "./AppShell.module.css";

type PreviewPaneProps = {
  document: DocumentState;
};

export function PreviewPane({ document }: PreviewPaneProps) {
  return (
    <section className={styles.preview} aria-label="Document preview">
      <DocumentRenderer document={document} />
    </section>
  );
}
