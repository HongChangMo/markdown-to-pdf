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
