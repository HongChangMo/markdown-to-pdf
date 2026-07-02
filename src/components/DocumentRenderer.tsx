import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { resolveMarkdownImageSrc } from "@/lib/document/assets";
import { createDocumentCssVars } from "@/lib/document/style";
import type { DocumentState } from "@/lib/document/types";
import styles from "./DocumentRenderer.module.css";

type DocumentRendererProps = {
  document: DocumentState;
  exportReady?: boolean;
};

export function DocumentRenderer({ document, exportReady = false }: DocumentRendererProps) {
  return (
    <article
      className={styles.page}
      style={createDocumentCssVars(document.style)}
      data-testid="document-page"
      data-export-ready={exportReady ? "true" : undefined}
    >
      <div className={styles.content}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={{
            img: ({ src, alt }) => {
              const resolvedSrc = resolveMarkdownImageSrc(src, document.assets);
              if (!resolvedSrc) {
                return <span role="note">Image unavailable: {src}</span>;
              }

              return <img src={resolvedSrc} alt={alt ?? ""} />;
            },
          }}
        >
          {document.markdown}
        </ReactMarkdown>
      </div>
    </article>
  );
}
