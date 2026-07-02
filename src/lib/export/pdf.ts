import { chromium } from "playwright";
import { pageSizeToPdfFormat } from "@/lib/document/style";
import type { DocumentState } from "@/lib/document/types";
import { EXPORT_STORAGE_KEY } from "./storage";

export async function renderDocumentToPdf(document: DocumentState, origin: string): Promise<Buffer> {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.addInitScript(
      ({ key, value }) => {
        window.localStorage.setItem(key, value);
      },
      { key: EXPORT_STORAGE_KEY, value: JSON.stringify(document) },
    );
    await page.goto(`${origin}/export`, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-export-ready='true']", { timeout: 15_000 });

    return await page.pdf({
      format: pageSizeToPdfFormat(document.style.pageSize),
      printBackground: true,
      margin: {
        top: `${document.style.marginMm}mm`,
        right: `${document.style.marginMm}mm`,
        bottom: `${document.style.marginMm}mm`,
        left: `${document.style.marginMm}mm`,
      },
    });
  } finally {
    await browser.close();
  }
}
