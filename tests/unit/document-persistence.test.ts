import { describe, expect, it } from "vitest";
import { DEFAULT_DOCUMENT_STATE } from "@/lib/document/defaults";
import {
  createDocumentExportJson,
  createDocumentJsonFilename,
  parseStoredDocumentState,
} from "@/lib/document/persistence";

describe("document persistence helpers", () => {
  it("serializes document state as formatted JSON", () => {
    const json = createDocumentExportJson(DEFAULT_DOCUMENT_STATE);

    expect(JSON.parse(json)).toEqual(DEFAULT_DOCUMENT_STATE);
    expect(json).toContain('\n  "title": "Development Document"');
  });

  it("parses valid stored document state", () => {
    expect(parseStoredDocumentState(JSON.stringify(DEFAULT_DOCUMENT_STATE))).toEqual(DEFAULT_DOCUMENT_STATE);
  });

  it("returns null for invalid stored document state", () => {
    expect(parseStoredDocumentState("{bad json")).toBeNull();
    expect(parseStoredDocumentState(JSON.stringify({ title: "" }))).toBeNull();
  });

  it("creates a safe JSON filename from the document title", () => {
    expect(createDocumentJsonFilename("개발 문서")).toBe("개발 문서.json");
    expect(createDocumentJsonFilename('API: Report/1')).toBe("API Report1.json");
    expect(createDocumentJsonFilename("   ")).toBe("document.json");
  });
});
