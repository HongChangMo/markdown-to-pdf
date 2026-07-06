import { describe, expect, it } from "vitest";
import { resolveExportOrigin } from "@/lib/export/origin";

describe("resolveExportOrigin", () => {
  it("uses the request origin when no configured origin is provided", () => {
    expect(resolveExportOrigin("http://127.0.0.1:3000")).toBe("http://127.0.0.1:3000");
  });

  it("uses a configured http origin without a trailing slash", () => {
    expect(resolveExportOrigin("http://127.0.0.1:3000", "https://docs.example.com/")).toBe(
      "https://docs.example.com",
    );
  });

  it("rejects non-http configured origins", () => {
    expect(() => resolveExportOrigin("http://127.0.0.1:3000", "file:///tmp/export")).toThrow(
      "APP_ORIGIN must be an http or https URL.",
    );
  });
});
