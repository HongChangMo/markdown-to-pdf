import type { CSSProperties } from "react";
import type { DocumentStyle, PageSize } from "./types";

type DocumentCssVars = CSSProperties & {
  "--doc-font-size": string;
  "--doc-line-height": string;
  "--doc-margin": string;
  "--doc-code-font-size": string;
  "--doc-page-width": string;
  "--doc-page-min-height": string;
};

const PAGE_DIMENSIONS: Record<PageSize, { width: string; minHeight: string }> = {
  A4: { width: "210mm", minHeight: "297mm" },
  Letter: { width: "8.5in", minHeight: "11in" },
};

export function createDocumentCssVars(style: DocumentStyle): DocumentCssVars {
  const dimensions = PAGE_DIMENSIONS[style.pageSize];

  return {
    "--doc-font-size": `${style.fontSizePx}px`,
    "--doc-line-height": String(style.lineHeight),
    "--doc-margin": `${style.marginMm}mm`,
    "--doc-code-font-size": `${style.codeFontSizePx}px`,
    "--doc-page-width": dimensions.width,
    "--doc-page-min-height": dimensions.minHeight,
  };
}

export function pageSizeToPdfFormat(pageSize: PageSize): "A4" | "Letter" {
  return pageSize;
}
