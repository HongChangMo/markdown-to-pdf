import { describe, expect, it } from "vitest";
import { DEFAULT_DOCUMENT_STATE } from "@/lib/document/defaults";
import { createDocumentCssVars, pageSizeToPdfFormat } from "@/lib/document/style";

describe("document style utilities", () => {
  it("creates CSS variables from document style settings", () => {
    const vars = createDocumentCssVars({
      fontSizePx: 15,
      lineHeight: 1.7,
      pageSize: "A4",
      marginMm: 18,
      codeFontSizePx: 13,
    });

    expect(vars).toEqual({
      "--doc-font-size": "15px",
      "--doc-line-height": "1.7",
      "--doc-margin": "18mm",
      "--doc-code-font-size": "13px",
      "--doc-page-width": "210mm",
      "--doc-page-min-height": "297mm",
    });
  });

  it("maps page size to browser PDF format", () => {
    expect(pageSizeToPdfFormat("A4")).toBe("A4");
    expect(pageSizeToPdfFormat("Letter")).toBe("Letter");
  });

  it("provides a sample Korean development document", () => {
    expect(DEFAULT_DOCUMENT_STATE.markdown).toContain("개발 문서");
    expect(DEFAULT_DOCUMENT_STATE.markdown).toContain("```ts");
  });
});
