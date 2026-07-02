import { expect, test } from "@playwright/test";

test("shows a clear message for missing image assets", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Markdown editor").fill("![Missing](missing.png)");

  await expect(page.getByRole("note")).toContainText("Image unavailable: missing.png");
});

test("shows a clear message for invalid PDF export input", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Document title").fill("");
  await page.getByRole("button", { name: "Export PDF" }).click();

  await expect(page.getByRole("status")).toContainText("Document title is required");
});
