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

test("uploaded image assets can be removed", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Image uploads").setInputFiles({
    name: "diagram.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lZ5J4QAAAABJRU5ErkJggg==",
      "base64",
    ),
  });

  await expect(page.getByRole("region", { name: "Image assets" }).getByText("diagram.png")).toBeVisible();
  await page.getByRole("button", { name: "Remove diagram.png" }).click();
  await expect(page.getByRole("region", { name: "Image assets" }).getByText("diagram.png")).toBeHidden();
});

test("unsupported image uploads show a clear error", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Image uploads").setInputFiles({
    name: "diagram.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg />"),
  });

  await expect(page.getByText("Only PNG, JPEG, WebP, and GIF images are supported.")).toBeVisible();
});

test("image upload input stays within the settings pane content area", async ({ page }) => {
  await page.goto("/");

  const layout = await page.getByRole("region", { name: "Image assets" }).evaluate((panel) => {
    const input = panel.querySelector<HTMLInputElement>('input[aria-label="Image uploads"]');

    if (!input) {
      throw new Error("Image upload input was not found.");
    }

    const panelRect = panel.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    const panelStyle = window.getComputedStyle(panel);
    const contentRight = panelRect.right - Number.parseFloat(panelStyle.paddingRight);

    return {
      contentRight,
      inputRight: inputRect.right,
    };
  });

  expect(layout.inputRight).toBeLessThanOrEqual(layout.contentRight);
});

test("autosaves the document and restores it after reload", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Document title").fill("Autosaved Document");
  await page.getByLabel("Markdown editor").fill("# 자동 저장\n\n본문입니다.");
  await expect(page.getByRole("heading", { name: "자동 저장" })).toBeVisible();

  await page.reload();

  await expect(page.getByLabel("Document title")).toHaveValue("Autosaved Document");
  await expect(page.getByLabel("Markdown editor")).toHaveValue("# 자동 저장\n\n본문입니다.");
  await expect(page.getByRole("heading", { name: "자동 저장" })).toBeVisible();
});

test("reset document requires confirmation", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Markdown editor").fill("# 임시 문서");
  await expect(page.getByRole("heading", { name: "임시 문서" })).toBeVisible();

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toBe("Reset the document and clear the local draft?");
    await dialog.dismiss();
  });
  await page.getByRole("button", { name: "Reset document" }).click();
  await expect(page.getByRole("heading", { name: "임시 문서" })).toBeVisible();

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toBe("Reset the document and clear the local draft?");
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Reset document" }).click();
  await expect(page.getByRole("heading", { name: "개발 문서" })).toBeVisible();
});

test("renders blockquotes with visible quote styling", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Markdown editor").fill("> 중요한 인용문\n>\n> - 근거 A");

  const blockquote = page.locator("[data-testid='document-page'] blockquote");
  await expect(blockquote).toBeVisible();
  await expect(blockquote).toHaveCSS("border-left-width", "4px");
  await expect(blockquote).toHaveCSS("padding-left", "16px");
  await expect(blockquote.getByText("중요한 인용문")).toBeVisible();
});

test("shows preview page count for long documents", async ({ page }) => {
  await page.goto("/");

  await page
    .getByLabel("Markdown editor")
    .fill(Array.from({ length: 130 }, (_, index) => `문단 ${index + 1}`).join("\n\n"));

  await expect(page.getByTestId("preview-page-count")).toHaveText(/Pages: [2-9]\d*/);
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
