import { expect, test } from "@playwright/test";

test("editing markdown updates preview and style controls change layout", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Markdown editor").fill("# 새 문서\n\n- 항목 A\n- 항목 B");
  await expect(page.getByRole("heading", { name: "새 문서" })).toBeVisible();
  await expect(page.locator("[data-testid='document-page']").getByText("항목 A")).toBeVisible();

  await page.getByLabel("Body font size").fill("18");
  await expect(page.locator("[data-testid='document-page']")).toHaveCSS("font-size", "18px");

  await page.getByLabel("Line height").fill("1.8");
  await expect(page.locator("[data-testid='document-page']")).toHaveCSS("line-height", "32.4px");
});

test("uploaded image assets can be referenced from markdown", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Image uploads").setInputFiles({
    name: "diagram.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lZ5J4QAAAABJRU5ErkJggg==",
      "base64",
    ),
  });

  await page.getByLabel("Markdown editor").fill("![Diagram](diagram.png)");
  await expect(page.getByRole("img", { name: "Diagram" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Image assets" }).getByText("diagram.png")).toBeVisible();
});

test("preview preserves editor line breaks and exposes page boundary guides", async ({ page }) => {
  await page.goto("/");

  await page
    .getByLabel("Markdown editor")
    .fill("A\n\n\nB<br>C  \nD\n\n" + Array.from({ length: 80 }, (_, index) => `문단 ${index + 1}`).join("\n\n"));

  await expect(page.locator("[data-testid='document-page'] br")).toHaveCount(165);
  await expect(page.getByTestId("page-boundary-guides")).toBeVisible();
  await expect(page.getByTestId("page-boundary-guides")).toHaveCSS(
    "background-image",
    /repeating-linear-gradient/,
  );
});
