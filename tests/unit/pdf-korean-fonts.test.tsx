import { act, render, screen, waitFor } from "@testing-library/react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import ExportPage from "@/app/export/page";
import { DEFAULT_DOCUMENT_STATE } from "@/lib/document/defaults";
import { EXPORT_STORAGE_KEY } from "@/lib/export/storage";

describe("PDF Korean font rendering", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("bundles Korean-capable document fonts for serverless Chromium", () => {
    const css = readFileSync(
      resolve(process.cwd(), "src/components/DocumentRenderer.module.css"),
      "utf8",
    );

    expect(existsSync(resolve(process.cwd(), "public/fonts/NotoSansKR-Regular.ttf"))).toBe(true);
    expect(existsSync(resolve(process.cwd(), "public/fonts/NotoSansKR-Bold.ttf"))).toBe(true);
    expect(css).toContain("url('/fonts/NotoSansKR-Regular.ttf') format('truetype')");
    expect(css).toContain("url('/fonts/NotoSansKR-Bold.ttf') format('truetype')");
    expect(css).toMatch(/font-family:\s*"Noto Sans KR", Arial/);
  });

  it("does not mark the export page ready until document fonts finish loading", async () => {
    let resolveFontsReady: () => void = () => undefined;
    const fontsReady = new Promise<void>((resolvePromise) => {
      resolveFontsReady = resolvePromise;
    });
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: {
        ready: fontsReady,
      },
    });
    window.localStorage.setItem(EXPORT_STORAGE_KEY, JSON.stringify(DEFAULT_DOCUMENT_STATE));

    render(<ExportPage />);

    const page = await screen.findByTestId("document-page");
    expect(page).not.toHaveAttribute("data-export-ready", "true");

    await act(async () => {
      resolveFontsReady();
      await fontsReady;
    });

    await waitFor(() => expect(page).toHaveAttribute("data-export-ready", "true"));
  });
});
