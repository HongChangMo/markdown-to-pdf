import { expect, test } from "@playwright/test";
import { PDFDocument } from "pdf-lib";

test("exports the current document as a PDF", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Markdown editor").fill("# PDF Export\n\n한국어 본문입니다.");
  await page.getByLabel("Body font size").fill("16");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PDF" }).click();
  const download = await downloadPromise;
  const path = await download.path();

  expect(download.suggestedFilename()).toBe("Development Document.pdf");
  expect(path).toBeTruthy();

  const stream = await download.createReadStream();
  if (!stream) {
    throw new Error("Download stream was not available");
  }

  const bytes = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });

  const pdf = await PDFDocument.load(bytes);
  expect(pdf.getPageCount()).toBeGreaterThan(0);
});
