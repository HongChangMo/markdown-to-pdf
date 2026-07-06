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

test("exports a document that references an uploaded image", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Image uploads").setInputFiles({
    name: "diagram.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lZ5J4QAAAABJRU5ErkJggg==",
      "base64",
    ),
  });
  await page.getByLabel("Markdown editor").fill("# Image Export\n\n![Diagram](diagram.png)");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PDF" }).click();
  const download = await downloadPromise;
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

test("exports a PDF when the document title contains Korean text", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Document title").fill("개발 문서");
  await page.getByLabel("Markdown editor").fill("# 한글 제목\n\nPDF 파일명 검증입니다.");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PDF" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("개발 문서.pdf");

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

test("matches preview page boundary count to exported PDF pages", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Document title").fill("Pagination Match");
  await page.getByLabel("Body font size").fill("16");
  await page.getByLabel("Line height").fill("1.6");
  await page.getByLabel("Page margin").fill("16");
  await page.getByLabel("Markdown editor").fill(
    "# 페이지 검증\n\n" +
      Array.from(
        { length: 52 },
        (_, index) =>
          `## 섹션 ${index + 1}\n\n페이지 경계와 PDF 내보내기 결과를 비교하는 문단입니다.`,
      ).join("\n\n"),
  );

  const previewPageCount = await page.getByTestId("document-page").evaluate((element) => {
    const page = element as HTMLElement;
    const styles = window.getComputedStyle(page);
    const probe = window.document.createElement("div");
    probe.style.position = "absolute";
    probe.style.height = styles.getPropertyValue("--doc-page-min-height");
    page.appendChild(probe);

    const pageHeight = probe.getBoundingClientRect().height;
    const documentHeight = page.getBoundingClientRect().height;
    probe.remove();

    return Math.ceil(documentHeight / pageHeight - 0.01);
  });

  expect(previewPageCount).toBeGreaterThan(1);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PDF" }).click();
  const download = await downloadPromise;
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
  expect(pdf.getPageCount()).toBe(previewPageCount);
});
