import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_DOCUMENT_STATE } from "@/lib/document/defaults";
import { renderDocumentToPdf } from "@/lib/export/pdf";

const mocks = vi.hoisted(() => ({
  pdf: vi.fn(),
  close: vi.fn(),
  waitForSelector: vi.fn(),
  goto: vi.fn(),
  addInitScript: vi.fn(),
  newPage: vi.fn(),
  launch: vi.fn(),
}));

vi.mock("playwright", () => ({
  chromium: {
    launch: mocks.launch,
  },
}));

describe("PDF render options", () => {
  beforeEach(() => {
    mocks.pdf.mockResolvedValue(Buffer.from("%PDF"));
    mocks.close.mockResolvedValue(undefined);
    mocks.waitForSelector.mockResolvedValue(undefined);
    mocks.goto.mockResolvedValue(undefined);
    mocks.addInitScript.mockResolvedValue(undefined);
    mocks.newPage.mockResolvedValue({
      addInitScript: mocks.addInitScript,
      goto: mocks.goto,
      waitForSelector: mocks.waitForSelector,
      pdf: mocks.pdf,
    });
    mocks.launch.mockResolvedValue({
      newPage: mocks.newPage,
      close: mocks.close,
    });
  });

  it("uses CSS page padding as the only document margin source", async () => {
    const document = {
      ...DEFAULT_DOCUMENT_STATE,
      style: {
        ...DEFAULT_DOCUMENT_STATE.style,
        marginMm: 24,
      },
    };

    await renderDocumentToPdf(document, "http://example.test");

    expect(mocks.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: "A4",
        printBackground: true,
        margin: {
          top: "0mm",
          right: "0mm",
          bottom: "0mm",
          left: "0mm",
        },
      }),
    );
  });
});
