import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_DOCUMENT_STATE } from "@/lib/document/defaults";
import { renderDocumentToPdf } from "@/lib/export/pdf";

const mocks = vi.hoisted(() => ({
  pdf: vi.fn(),
  close: vi.fn(),
  waitForSelector: vi.fn(),
  goto: vi.fn(),
  addInitScript: vi.fn(),
  setDefaultTimeout: vi.fn(),
  setDefaultNavigationTimeout: vi.fn(),
  newPage: vi.fn(),
  launch: vi.fn(),
  executablePath: vi.fn(),
}));

vi.mock("playwright-core", () => ({
  chromium: {
    launch: mocks.launch,
  },
}));

vi.mock("@sparticuz/chromium", () => ({
  default: {
    args: ["--serverless-chromium"],
    executablePath: mocks.executablePath,
  },
}));

describe("PDF render options", () => {
  beforeEach(() => {
    delete process.env.VERCEL;
    mocks.pdf.mockResolvedValue(Buffer.from("%PDF"));
    mocks.close.mockResolvedValue(undefined);
    mocks.waitForSelector.mockResolvedValue(undefined);
    mocks.goto.mockResolvedValue(undefined);
    mocks.addInitScript.mockResolvedValue(undefined);
    mocks.newPage.mockResolvedValue({
      addInitScript: mocks.addInitScript,
      setDefaultTimeout: mocks.setDefaultTimeout,
      setDefaultNavigationTimeout: mocks.setDefaultNavigationTimeout,
      goto: mocks.goto,
      waitForSelector: mocks.waitForSelector,
      pdf: mocks.pdf,
    });
    mocks.launch.mockResolvedValue({
      newPage: mocks.newPage,
      close: mocks.close,
    });
    mocks.executablePath.mockResolvedValue("/tmp/chromium");
  });

  it("launches local Playwright Chromium outside Vercel", async () => {
    await renderDocumentToPdf(DEFAULT_DOCUMENT_STATE, "http://example.test");

    expect(mocks.launch).toHaveBeenCalledWith({ headless: true });
    expect(mocks.executablePath).not.toHaveBeenCalled();
  });

  it("launches the serverless Chromium binary on Vercel", async () => {
    process.env.VERCEL = "1";

    await renderDocumentToPdf(DEFAULT_DOCUMENT_STATE, "http://example.test");

    expect(mocks.executablePath).toHaveBeenCalled();
    expect(mocks.launch).toHaveBeenCalledWith({
      args: ["--serverless-chromium"],
      executablePath: "/tmp/chromium",
      headless: true,
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

  it("rejects when PDF rendering exceeds the configured timeout", async () => {
    mocks.pdf.mockImplementation(() => new Promise(() => undefined));

    await expect(
      renderDocumentToPdf(DEFAULT_DOCUMENT_STATE, "http://example.test", { timeoutMs: 1 }),
    ).rejects.toThrow("PDF export timed out.");

    expect(mocks.close).toHaveBeenCalled();
  });
});
