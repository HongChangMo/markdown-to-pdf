import { describe, expect, it } from "vitest";
import { buildPdfContentDisposition } from "@/lib/export/filename";

describe("buildPdfContentDisposition", () => {
  it("builds a ByteString-safe header for Korean PDF filenames", () => {
    const header = buildPdfContentDisposition("개발 문서");

    expect(() => new Headers({ "content-disposition": header })).not.toThrow();
    expect([...header].every((character) => character.charCodeAt(0) <= 255)).toBe(true);
    expect(header).toContain('filename="document.pdf"');
    expect(header).toContain("filename*=UTF-8''%EA%B0%9C%EB%B0%9C%20%EB%AC%B8%EC%84%9C.pdf");
  });

  it("keeps a readable ASCII fallback when the title has safe ASCII characters", () => {
    const header = buildPdfContentDisposition("API Report: v1/2");

    expect(header).toContain('filename="API Report v12.pdf"');
    expect(header).toContain("filename*=UTF-8''API%20Report%20v12.pdf");
  });
});
