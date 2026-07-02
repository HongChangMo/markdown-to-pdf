import { describe, expect, it } from "vitest";
import { DEFAULT_DOCUMENT_STATE } from "@/lib/document/defaults";
import { resolveMarkdownImageSrc } from "@/lib/document/assets";
import { parseDocumentState } from "@/lib/document/validation";

describe("document validation", () => {
  it("accepts the default document state", () => {
    expect(parseDocumentState(DEFAULT_DOCUMENT_STATE)).toEqual(DEFAULT_DOCUMENT_STATE);
  });

  it("rejects invalid style values", () => {
    expect(() =>
      parseDocumentState({
        ...DEFAULT_DOCUMENT_STATE,
        style: { ...DEFAULT_DOCUMENT_STATE.style, fontSizePx: 2 },
      }),
    ).toThrow("fontSizePx");
  });

  it("resolves uploaded image names to data URLs", () => {
    const src = resolveMarkdownImageSrc("diagram.png", [
      { name: "diagram.png", dataUrl: "data:image/png;base64,abc" },
    ]);

    expect(src).toBe("data:image/png;base64,abc");
  });

  it("keeps http links blocked for image rendering", () => {
    expect(resolveMarkdownImageSrc("https://example.com/a.png", [])).toBe("");
  });
});
