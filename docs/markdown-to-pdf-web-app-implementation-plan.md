# Markdown-to-PDF Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js TypeScript web app where users edit Markdown, preview the rendered document, tune PDF-oriented styles, and export the preview layout to PDF with Playwright.

**Architecture:** The app uses a shared `DocumentState` model and shared renderer for preview and export. The browser owns editor state for the first version; a Node.js Next.js route launches Playwright, opens an internal export page, and returns the generated PDF.

**Tech Stack:** Next.js App Router, TypeScript, React, Playwright, react-markdown, remark-gfm, rehype-sanitize, Vitest, Testing Library, pdf-lib, npm, CSS Modules plus global document CSS.

---

## Decisions Locked For MVP

- Package manager: `npm`
- App framework: Next.js App Router with `src/`
- Styling: CSS Modules for app shell, global CSS for reset, document CSS variables for preview/export
- State persistence: browser memory only
- Image support: uploaded images stored as data URLs in `DocumentState.assets`
- PDF export response: return full PDF after generation
- Git: initialize this directory as a git repository during implementation

## File Structure

Create or modify these files:

- `package.json`: scripts and dependencies
- `next.config.ts`: Next.js config
- `vitest.config.ts`: unit test config
- `playwright.config.ts`: browser test config
- `src/app/layout.tsx`: root HTML shell
- `src/app/page.tsx`: main editor app
- `src/app/globals.css`: app reset and base colors
- `src/app/export/page.tsx`: internal export rendering page opened by Playwright
- `src/app/api/export/route.ts`: PDF export API
- `src/components/MarkdownEditor.tsx`: controlled Markdown editor
- `src/components/PreviewPane.tsx`: preview surface wrapper
- `src/components/StylePanel.tsx`: style controls
- `src/components/ExportButton.tsx`: export request UI
- `src/components/DocumentRenderer.tsx`: shared Markdown document renderer
- `src/components/AppShell.module.css`: editor layout styles
- `src/components/DocumentRenderer.module.css`: document presentation styles
- `src/lib/document/types.ts`: shared document types
- `src/lib/document/defaults.ts`: default document state
- `src/lib/document/validation.ts`: runtime validation for export payloads
- `src/lib/document/style.ts`: style variables and page size helpers
- `src/lib/document/assets.ts`: uploaded image helpers and Markdown image resolution
- `src/lib/export/storage.ts`: export-page localStorage key helpers
- `src/lib/export/pdf.ts`: Playwright PDF generation helper
- `src/test/setup.ts`: Testing Library setup
- `tests/unit/document-style.test.ts`: style utility tests
- `tests/unit/document-validation.test.ts`: payload validation tests
- `tests/unit/document-renderer.test.tsx`: renderer tests
- `tests/e2e/editor-preview.spec.ts`: browser editor/preview tests
- `tests/e2e/pdf-export.spec.ts`: browser export tests

## Task 1: Scaffold Next.js, Tooling, And Git

**Files:**
- Create: Next.js scaffold in project root
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/test/setup.ts`
- Modify: `package.json`

- [ ] **Step 1: Initialize git**

Run:

```bash
git init
```

Expected: git reports an initialized repository.

- [ ] **Step 2: Create the Next.js project in the existing directory**

Run:

```bash
npx create-next-app@latest . --ts --app --eslint --src-dir --no-tailwind --import-alias "@/*" --use-npm
```

Expected: Next.js creates `package.json`, `src/app`, TypeScript config, and ESLint config.

- [ ] **Step 3: Install runtime dependencies**

Run:

```bash
npm install react-markdown remark-gfm rehype-sanitize zod playwright pdf-lib
```

Expected: packages are added to `package.json`.

- [ ] **Step 4: Install test dependencies**

Run:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @playwright/test
```

Expected: dev packages are added to `package.json`.

- [ ] **Step 5: Add test scripts to `package.json`**

Modify `package.json` scripts to include:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 6: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

- [ ] **Step 7: Create `src/test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 8: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

- [ ] **Step 9: Run baseline checks**

Run:

```bash
npm run lint
npm run test
```

Expected: lint passes; Vitest passes or reports no tests depending on scaffold defaults.

- [ ] **Step 10: Commit scaffold**

```bash
git add .
git commit -m "chore: scaffold nextjs markdown pdf app"
```

## Task 2: Add Shared Document Model And Style Utilities

**Files:**
- Create: `src/lib/document/types.ts`
- Create: `src/lib/document/defaults.ts`
- Create: `src/lib/document/style.ts`
- Create: `tests/unit/document-style.test.ts`

- [ ] **Step 1: Write failing style utility tests**

Create `tests/unit/document-style.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DEFAULT_DOCUMENT_STATE } from "@/lib/document/defaults";
import { createDocumentCssVars, pageSizeToPdfFormat } from "@/lib/document/style";

describe("document style utilities", () => {
  it("creates CSS variables from document style settings", () => {
    const vars = createDocumentCssVars({
      fontSizePx: 15,
      lineHeight: 1.7,
      pageSize: "A4",
      marginMm: 18,
      codeFontSizePx: 13,
    });

    expect(vars).toEqual({
      "--doc-font-size": "15px",
      "--doc-line-height": "1.7",
      "--doc-margin": "18mm",
      "--doc-code-font-size": "13px",
      "--doc-page-width": "210mm",
      "--doc-page-min-height": "297mm",
    });
  });

  it("maps page size to Playwright PDF format", () => {
    expect(pageSizeToPdfFormat("A4")).toBe("A4");
    expect(pageSizeToPdfFormat("Letter")).toBe("Letter");
  });

  it("provides a sample Korean development document", () => {
    expect(DEFAULT_DOCUMENT_STATE.markdown).toContain("개발 문서");
    expect(DEFAULT_DOCUMENT_STATE.markdown).toContain("```ts");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test -- tests/unit/document-style.test.ts
```

Expected: FAIL because `@/lib/document/defaults` and `@/lib/document/style` do not exist.

- [ ] **Step 3: Create `src/lib/document/types.ts`**

```ts
export type PageSize = "A4" | "Letter";

export type DocumentAsset = {
  name: string;
  dataUrl: string;
};

export type DocumentStyle = {
  fontSizePx: number;
  lineHeight: number;
  pageSize: PageSize;
  marginMm: number;
  codeFontSizePx: number;
};

export type DocumentState = {
  title: string;
  markdown: string;
  style: DocumentStyle;
  assets: DocumentAsset[];
};
```

- [ ] **Step 4: Create `src/lib/document/defaults.ts`**

```ts
import type { DocumentState, DocumentStyle } from "./types";

export const DEFAULT_DOCUMENT_STYLE: DocumentStyle = {
  fontSizePx: 14,
  lineHeight: 1.6,
  pageSize: "A4",
  marginMm: 16,
  codeFontSizePx: 13,
};

export const DEFAULT_MARKDOWN = `# 개발 문서

이 문서는 Markdown PDF 미리보기를 검증하기 위한 샘플입니다.

## 기능 목록

- 실시간 미리보기
- PDF 스타일 조정
- 코드블록 렌더링

| 항목 | 상태 |
| --- | --- |
| Markdown | 지원 |
| PDF Export | 준비 중 |

\`\`\`ts
type Feature = {
  title: string;
  done: boolean;
};
\`\`\`
`;

export const DEFAULT_DOCUMENT_STATE: DocumentState = {
  title: "Development Document",
  markdown: DEFAULT_MARKDOWN,
  style: DEFAULT_DOCUMENT_STYLE,
  assets: [],
};
```

- [ ] **Step 5: Create `src/lib/document/style.ts`**

```ts
import type { CSSProperties } from "react";
import type { DocumentStyle, PageSize } from "./types";

type DocumentCssVars = CSSProperties & {
  "--doc-font-size": string;
  "--doc-line-height": string;
  "--doc-margin": string;
  "--doc-code-font-size": string;
  "--doc-page-width": string;
  "--doc-page-min-height": string;
};

const PAGE_DIMENSIONS: Record<PageSize, { width: string; minHeight: string }> = {
  A4: { width: "210mm", minHeight: "297mm" },
  Letter: { width: "8.5in", minHeight: "11in" },
};

export function createDocumentCssVars(style: DocumentStyle): DocumentCssVars {
  const dimensions = PAGE_DIMENSIONS[style.pageSize];

  return {
    "--doc-font-size": `${style.fontSizePx}px`,
    "--doc-line-height": String(style.lineHeight),
    "--doc-margin": `${style.marginMm}mm`,
    "--doc-code-font-size": `${style.codeFontSizePx}px`,
    "--doc-page-width": dimensions.width,
    "--doc-page-min-height": dimensions.minHeight,
  };
}

export function pageSizeToPdfFormat(pageSize: PageSize): "A4" | "Letter" {
  return pageSize;
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm run test -- tests/unit/document-style.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit model and style utilities**

```bash
git add src/lib/document tests/unit/document-style.test.ts
git commit -m "feat: add document state and style utilities"
```

## Task 3: Add Document Validation And Image Asset Helpers

**Files:**
- Create: `src/lib/document/validation.ts`
- Create: `src/lib/document/assets.ts`
- Create: `tests/unit/document-validation.test.ts`

- [ ] **Step 1: Write failing validation tests**

Create `tests/unit/document-validation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DEFAULT_DOCUMENT_STATE } from "@/lib/document/defaults";
import { resolveMarkdownImageSrc } from "@/lib/document/assets";
import { parseDocumentState } from "@/lib/document/validation";

describe("document validation", () => {
  it("accepts the default document state", () => {
    expect(parseDocumentState(DEFAULT_DOCUMENT_STATE)).toEqual(DEFAULT_DOCUMENT_STATE);
  });

  it("rejects invalid style values", () => {
    expect(() =>
      parseDocumentState({
        ...DEFAULT_DOCUMENT_STATE,
        style: { ...DEFAULT_DOCUMENT_STATE.style, fontSizePx: 2 },
      }),
    ).toThrow("fontSizePx");
  });

  it("resolves uploaded image names to data URLs", () => {
    const src = resolveMarkdownImageSrc("diagram.png", [
      { name: "diagram.png", dataUrl: "data:image/png;base64,abc" },
    ]);

    expect(src).toBe("data:image/png;base64,abc");
  });

  it("keeps http links blocked for image rendering", () => {
    expect(resolveMarkdownImageSrc("https://example.com/a.png", [])).toBe("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test -- tests/unit/document-validation.test.ts
```

Expected: FAIL because validation and asset helpers do not exist.

- [ ] **Step 3: Create `src/lib/document/validation.ts`**

```ts
import { z } from "zod";
import type { DocumentState } from "./types";

const documentAssetSchema = z.object({
  name: z.string().min(1).max(200),
  dataUrl: z.string().startsWith("data:image/"),
});

const documentStyleSchema = z.object({
  fontSizePx: z.number().min(10).max(24),
  lineHeight: z.number().min(1.1).max(2.4),
  pageSize: z.enum(["A4", "Letter"]),
  marginMm: z.number().min(8).max(32),
  codeFontSizePx: z.number().min(9).max(20),
});

const documentStateSchema = z.object({
  title: z.string().min(1).max(120),
  markdown: z.string().max(200_000),
  style: documentStyleSchema,
  assets: z.array(documentAssetSchema).max(20),
});

export function parseDocumentState(value: unknown): DocumentState {
  return documentStateSchema.parse(value);
}
```

- [ ] **Step 4: Create `src/lib/document/assets.ts`**

```ts
import type { DocumentAsset } from "./types";

export function normalizeAssetName(value: string): string {
  return value.split("/").pop()?.trim() ?? value.trim();
}

export function resolveMarkdownImageSrc(src: string | undefined, assets: DocumentAsset[]): string {
  if (!src) {
    return "";
  }

  if (src.startsWith("data:image/")) {
    return src;
  }

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return "";
  }

  const requestedName = normalizeAssetName(src);
  const asset = assets.find((item) => normalizeAssetName(item.name) === requestedName);
  return asset?.dataUrl ?? "";
}

export async function fileToDocumentAsset(file: File): Promise<DocumentAsset> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });

  return {
    name: file.name,
    dataUrl,
  };
}
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm run test -- tests/unit/document-validation.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit validation and asset helpers**

```bash
git add src/lib/document tests/unit/document-validation.test.ts
git commit -m "feat: validate document state and assets"
```

## Task 4: Add Shared Markdown Document Renderer

**Files:**
- Create: `src/components/DocumentRenderer.tsx`
- Create: `src/components/DocumentRenderer.module.css`
- Create: `tests/unit/document-renderer.test.tsx`

- [ ] **Step 1: Write failing renderer tests**

Create `tests/unit/document-renderer.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DocumentRenderer } from "@/components/DocumentRenderer";
import { DEFAULT_DOCUMENT_STATE } from "@/lib/document/defaults";

describe("DocumentRenderer", () => {
  it("renders Korean headings, tables, and code blocks", () => {
    render(<DocumentRenderer document={DEFAULT_DOCUMENT_STATE} />);

    expect(screen.getByRole("heading", { name: "개발 문서" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("type Feature = {")).toBeInTheDocument();
  });

  it("uses uploaded images for Markdown image references", () => {
    render(
      <DocumentRenderer
        document={{
          ...DEFAULT_DOCUMENT_STATE,
          markdown: "![Diagram](./diagram.png)",
          assets: [{ name: "diagram.png", dataUrl: "data:image/png;base64,abc" }],
        }}
      />,
    );

    expect(screen.getByRole("img", { name: "Diagram" })).toHaveAttribute(
      "src",
      "data:image/png;base64,abc",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test -- tests/unit/document-renderer.test.tsx
```

Expected: FAIL because `DocumentRenderer` does not exist.

- [ ] **Step 3: Create `src/components/DocumentRenderer.module.css`**

```css
.page {
  width: var(--doc-page-width);
  min-height: var(--doc-page-min-height);
  margin: 0 auto;
  padding: var(--doc-margin);
  color: #202124;
  background: #ffffff;
  font-family: Arial, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
  font-size: var(--doc-font-size);
  line-height: var(--doc-line-height);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.14);
}

.content h1,
.content h2,
.content h3 {
  margin: 1.4em 0 0.55em;
  line-height: 1.25;
}

.content h1 {
  font-size: 1.8em;
  border-bottom: 1px solid #d6dbe3;
  padding-bottom: 0.35em;
}

.content p,
.content ul,
.content ol,
.content table,
.content pre {
  margin: 0.8em 0;
}

.content table {
  width: 100%;
  border-collapse: collapse;
}

.content th,
.content td {
  border: 1px solid #cfd6e0;
  padding: 0.5em 0.65em;
  text-align: left;
}

.content code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: var(--doc-code-font-size);
}

.content pre {
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  background: #f6f8fa;
  border: 1px solid #d8dee4;
  border-radius: 6px;
  padding: 0.9em;
}

.content img {
  max-width: 100%;
  height: auto;
}

@media print {
  .page {
    width: auto;
    min-height: auto;
    margin: 0;
    box-shadow: none;
  }
}
```

- [ ] **Step 4: Create `src/components/DocumentRenderer.tsx`**

```tsx
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { resolveMarkdownImageSrc } from "@/lib/document/assets";
import { createDocumentCssVars } from "@/lib/document/style";
import type { DocumentState } from "@/lib/document/types";
import styles from "./DocumentRenderer.module.css";

type DocumentRendererProps = {
  document: DocumentState;
  exportReady?: boolean;
};

export function DocumentRenderer({ document, exportReady = false }: DocumentRendererProps) {
  return (
    <article
      className={styles.page}
      style={createDocumentCssVars(document.style)}
      data-testid="document-page"
      data-export-ready={exportReady ? "true" : undefined}
    >
      <div className={styles.content}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={{
            img: ({ src, alt }) => {
              const resolvedSrc = resolveMarkdownImageSrc(src, document.assets);
              if (!resolvedSrc) {
                return <span role="note">Image unavailable: {src}</span>;
              }

              return <img src={resolvedSrc} alt={alt ?? ""} />;
            },
          }}
        >
          {document.markdown}
        </ReactMarkdown>
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Run renderer tests**

Run:

```bash
npm run test -- tests/unit/document-renderer.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit shared renderer**

```bash
git add src/components/DocumentRenderer.tsx src/components/DocumentRenderer.module.css tests/unit/document-renderer.test.tsx
git commit -m "feat: render markdown document preview"
```

## Task 5: Build Editor, Preview, Style Panel, And App Shell

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/MarkdownEditor.tsx`
- Create: `src/components/PreviewPane.tsx`
- Create: `src/components/StylePanel.tsx`
- Create: `src/components/AppShell.module.css`
- Create: `tests/e2e/editor-preview.spec.ts`

- [ ] **Step 1: Write failing browser workflow test**

Create `tests/e2e/editor-preview.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("editing markdown updates preview and style controls change layout", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Markdown editor").fill("# 새 문서\n\n- 항목 A\n- 항목 B");
  await expect(page.getByRole("heading", { name: "새 문서" })).toBeVisible();
  await expect(page.getByText("항목 A")).toBeVisible();

  await page.getByLabel("Body font size").fill("18");
  await expect(page.locator("[data-testid='document-page']")).toHaveCSS("font-size", "18px");

  await page.getByLabel("Line height").fill("1.8");
  await expect(page.locator("[data-testid='document-page']")).toHaveCSS("line-height", "32.4px");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:e2e -- tests/e2e/editor-preview.spec.ts
```

Expected: FAIL because the app shell and controls do not exist.

- [ ] **Step 3: Modify `src/app/globals.css`**

```css
:root {
  color-scheme: light;
  background: #eef2f6;
  color: #1f2933;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #eef2f6;
  color: #1f2933;
  font-family: Arial, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}
```

- [ ] **Step 4: Create `src/components/AppShell.module.css`**

```css
.shell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: 56px 1fr;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  background: #ffffff;
  border-bottom: 1px solid #d7dee8;
}

.titleInput {
  width: min(360px, 45vw);
  border: 1px solid #c8d1dc;
  border-radius: 6px;
  padding: 8px 10px;
}

.workspace {
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(280px, 0.85fr) minmax(360px, 1.2fr) 280px;
  gap: 1px;
  background: #d7dee8;
}

.pane {
  min-width: 0;
  min-height: 0;
  background: #ffffff;
}

.editor {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 56px);
  resize: none;
  border: 0;
  outline: none;
  padding: 16px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 14px;
  line-height: 1.55;
}

.preview {
  overflow: auto;
  padding: 24px;
  background: #f4f7fa;
}

.settings {
  padding: 16px;
  display: grid;
  align-content: start;
  gap: 14px;
}

.field {
  display: grid;
  gap: 6px;
}

.field input,
.field select {
  border: 1px solid #c8d1dc;
  border-radius: 6px;
  padding: 8px 10px;
}

@media (max-width: 980px) {
  .workspace {
    grid-template-columns: 1fr;
    grid-template-rows: 38vh 42vh auto;
  }

  .editor {
    min-height: 38vh;
  }
}
```

- [ ] **Step 5: Create `src/components/MarkdownEditor.tsx`**

```tsx
import styles from "./AppShell.module.css";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <textarea
      aria-label="Markdown editor"
      className={styles.editor}
      value={value}
      spellCheck={false}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
```

- [ ] **Step 6: Create `src/components/PreviewPane.tsx`**

```tsx
import { DocumentRenderer } from "./DocumentRenderer";
import type { DocumentState } from "@/lib/document/types";
import styles from "./AppShell.module.css";

type PreviewPaneProps = {
  document: DocumentState;
};

export function PreviewPane({ document }: PreviewPaneProps) {
  return (
    <section className={styles.preview} aria-label="Document preview">
      <DocumentRenderer document={document} />
    </section>
  );
}
```

- [ ] **Step 7: Create `src/components/StylePanel.tsx`**

```tsx
import type { DocumentStyle } from "@/lib/document/types";
import styles from "./AppShell.module.css";

type StylePanelProps = {
  value: DocumentStyle;
  onChange: (value: DocumentStyle) => void;
};

export function StylePanel({ value, onChange }: StylePanelProps) {
  const update = <K extends keyof DocumentStyle>(key: K, nextValue: DocumentStyle[K]) => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <aside className={styles.settings} aria-label="PDF style settings">
      <label className={styles.field}>
        Body font size
        <input
          aria-label="Body font size"
          type="number"
          min={10}
          max={24}
          value={value.fontSizePx}
          onChange={(event) => update("fontSizePx", Number(event.target.value))}
        />
      </label>
      <label className={styles.field}>
        Line height
        <input
          aria-label="Line height"
          type="number"
          min={1.1}
          max={2.4}
          step={0.1}
          value={value.lineHeight}
          onChange={(event) => update("lineHeight", Number(event.target.value))}
        />
      </label>
      <label className={styles.field}>
        Page size
        <select
          aria-label="Page size"
          value={value.pageSize}
          onChange={(event) => update("pageSize", event.target.value as DocumentStyle["pageSize"])}
        >
          <option value="A4">A4</option>
          <option value="Letter">Letter</option>
        </select>
      </label>
      <label className={styles.field}>
        Page margin
        <input
          aria-label="Page margin"
          type="number"
          min={8}
          max={32}
          value={value.marginMm}
          onChange={(event) => update("marginMm", Number(event.target.value))}
        />
      </label>
      <label className={styles.field}>
        Code font size
        <input
          aria-label="Code font size"
          type="number"
          min={9}
          max={20}
          value={value.codeFontSizePx}
          onChange={(event) => update("codeFontSizePx", Number(event.target.value))}
        />
      </label>
    </aside>
  );
}
```

- [ ] **Step 8: Modify `src/app/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { PreviewPane } from "@/components/PreviewPane";
import { StylePanel } from "@/components/StylePanel";
import { DEFAULT_DOCUMENT_STATE } from "@/lib/document/defaults";
import type { DocumentState } from "@/lib/document/types";
import styles from "@/components/AppShell.module.css";

export default function Home() {
  const [document, setDocument] = useState<DocumentState>(DEFAULT_DOCUMENT_STATE);

  return (
    <main className={styles.shell}>
      <header className={styles.toolbar}>
        <input
          aria-label="Document title"
          className={styles.titleInput}
          value={document.title}
          onChange={(event) => setDocument({ ...document, title: event.target.value })}
        />
      </header>
      <div className={styles.workspace}>
        <section className={styles.pane}>
          <MarkdownEditor
            value={document.markdown}
            onChange={(markdown) => setDocument({ ...document, markdown })}
          />
        </section>
        <section className={styles.pane}>
          <PreviewPane document={document} />
        </section>
        <section className={styles.pane}>
          <StylePanel
            value={document.style}
            onChange={(style) => setDocument({ ...document, style })}
          />
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 9: Run browser workflow test**

Run:

```bash
npm run test:e2e -- tests/e2e/editor-preview.spec.ts
```

Expected: PASS.

- [ ] **Step 10: Commit editor and preview**

```bash
git add src/app src/components tests/e2e/editor-preview.spec.ts
git commit -m "feat: add markdown editor live preview and style panel"
```

## Task 6: Add Export Page, PDF API, And Export Button

**Files:**
- Create: `src/lib/export/storage.ts`
- Create: `src/lib/export/pdf.ts`
- Create: `src/app/export/page.tsx`
- Create: `src/app/api/export/route.ts`
- Create: `src/components/ExportButton.tsx`
- Modify: `src/app/page.tsx`
- Create: `tests/e2e/pdf-export.spec.ts`

- [ ] **Step 1: Write failing PDF export test**

Create `tests/e2e/pdf-export.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:e2e -- tests/e2e/pdf-export.spec.ts
```

Expected: FAIL because the export button and API do not exist.

- [ ] **Step 3: Create `src/lib/export/storage.ts`**

```ts
export const EXPORT_STORAGE_KEY = "mdtopdf.export.document";
```

- [ ] **Step 4: Create `src/app/export/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { DocumentRenderer } from "@/components/DocumentRenderer";
import { parseDocumentState } from "@/lib/document/validation";
import type { DocumentState } from "@/lib/document/types";
import { EXPORT_STORAGE_KEY } from "@/lib/export/storage";

export default function ExportPage() {
  const [document, setDocument] = useState<DocumentState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(EXPORT_STORAGE_KEY);
      setDocument(parseDocumentState(JSON.parse(raw ?? "null")));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to load export document");
    }
  }, []);

  if (error) {
    return <main data-export-error="true">{error}</main>;
  }

  if (!document) {
    return <main>Preparing export</main>;
  }

  return <DocumentRenderer document={document} exportReady />;
}
```

- [ ] **Step 5: Create `src/lib/export/pdf.ts`**

```ts
import { chromium } from "playwright";
import { EXPORT_STORAGE_KEY } from "./storage";
import { pageSizeToPdfFormat } from "@/lib/document/style";
import type { DocumentState } from "@/lib/document/types";

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
```

- [ ] **Step 6: Create `src/app/api/export/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { parseDocumentState } from "@/lib/document/validation";
import { renderDocumentToPdf } from "@/lib/export/pdf";

export const runtime = "nodejs";

function getOrigin(request: NextRequest): string {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedHost) {
    return `${forwardedProto ?? "http"}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

function safePdfFilename(title: string): string {
  const cleaned = title.replace(/[\\/:*?"<>|]/g, "").trim();
  return `${cleaned || "document"}.pdf`;
}

export async function POST(request: NextRequest) {
  try {
    const document = parseDocumentState(await request.json());
    const pdf = await renderDocumentToPdf(document, getOrigin(request));

    return new NextResponse(pdf, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${safePdfFilename(document.title)}"`,
      },
    });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "PDF export failed";
    return NextResponse.json({ message }, { status: 400 });
  }
}
```

- [ ] **Step 7: Create `src/components/ExportButton.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { DocumentState } from "@/lib/document/types";

type ExportButtonProps = {
  document: DocumentState;
};

export function ExportButton({ document }: ExportButtonProps) {
  const [status, setStatus] = useState("");

  async function exportPdf() {
    setStatus("Exporting");
    const response = await fetch("/api/export", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(document),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({ message: "PDF export failed" }))) as {
        message?: string;
      };
      setStatus(body.message ?? "PDF export failed");
      return;
    }

    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = href;
    anchor.download = `${document.title}.pdf`;
    anchor.click();
    URL.revokeObjectURL(href);
    setStatus("Exported");
  }

  return (
    <>
      <button type="button" onClick={exportPdf}>
        Export PDF
      </button>
      {status ? <span role="status">{status}</span> : null}
    </>
  );
}
```

- [ ] **Step 8: Add export button to `src/app/page.tsx` toolbar**

Modify imports:

```tsx
import { ExportButton } from "@/components/ExportButton";
```

Add inside `<header className={styles.toolbar}>` after the title input:

```tsx
<ExportButton document={document} />
```

- [ ] **Step 9: Run PDF export browser test**

Run:

```bash
npm run test:e2e -- tests/e2e/pdf-export.spec.ts
```

Expected: PASS and exported PDF page count is greater than zero.

- [ ] **Step 10: Commit PDF export**

```bash
git add src/app/export src/app/api src/lib/export src/components/ExportButton.tsx src/app/page.tsx tests/e2e/pdf-export.spec.ts
git commit -m "feat: export preview document to pdf"
```

## Task 7: Add Uploaded Image Support In The UI

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/ImageAssetPanel.tsx`
- Modify: `src/components/AppShell.module.css`
- Modify: `tests/e2e/editor-preview.spec.ts`

- [ ] **Step 1: Extend browser test for uploaded images**

Append this test to `tests/e2e/editor-preview.spec.ts`:

```ts
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
  await expect(page.getByText("diagram.png")).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:e2e -- tests/e2e/editor-preview.spec.ts
```

Expected: FAIL because image upload UI does not exist.

- [ ] **Step 3: Create `src/components/ImageAssetPanel.tsx`**

```tsx
"use client";

import { fileToDocumentAsset } from "@/lib/document/assets";
import type { DocumentAsset } from "@/lib/document/types";
import styles from "./AppShell.module.css";

type ImageAssetPanelProps = {
  assets: DocumentAsset[];
  onChange: (assets: DocumentAsset[]) => void;
};

export function ImageAssetPanel({ assets, onChange }: ImageAssetPanelProps) {
  async function handleFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    const nextAssets = await Promise.all(Array.from(files).map(fileToDocumentAsset));
    onChange([...assets, ...nextAssets]);
  }

  return (
    <section className={styles.assetPanel} aria-label="Image assets">
      <label className={styles.field}>
        Image uploads
        <input
          aria-label="Image uploads"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </label>
      <ul className={styles.assetList}>
        {assets.map((asset) => (
          <li key={asset.name}>{asset.name}</li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: Add asset panel styles to `src/components/AppShell.module.css`**

```css
.assetPanel {
  border-top: 1px solid #d7dee8;
  padding-top: 14px;
}

.assetList {
  margin: 8px 0 0;
  padding-left: 18px;
  color: #445160;
  font-size: 13px;
}
```

- [ ] **Step 5: Modify `src/app/page.tsx` to include image assets**

Add import:

```tsx
import { ImageAssetPanel } from "@/components/ImageAssetPanel";
```

Replace the settings pane contents:

```tsx
<section className={styles.pane}>
  <StylePanel
    value={document.style}
    onChange={(style) => setDocument({ ...document, style })}
  />
  <ImageAssetPanel
    assets={document.assets}
    onChange={(assets) => setDocument({ ...document, assets })}
  />
</section>
```

- [ ] **Step 6: Run editor workflow tests**

Run:

```bash
npm run test:e2e -- tests/e2e/editor-preview.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Commit image upload support**

```bash
git add src/app/page.tsx src/components/ImageAssetPanel.tsx src/components/AppShell.module.css tests/e2e/editor-preview.spec.ts
git commit -m "feat: add uploaded image assets"
```

## Task 8: Final Verification, Documentation, And Harness Update

**Files:**
- Modify: `docs/README.md`
- Modify: `harness/progress-log.md`
- Modify: `harness/feature-list.json`
- Modify: `harness/handoff.md`

- [ ] **Step 1: Run full verification**

Run:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

Expected: all commands PASS.

- [ ] **Step 2: Start local app for manual verification**

Run:

```bash
npm run dev
```

Expected: development server starts at `http://localhost:3000`.

- [ ] **Step 3: Manually verify core workflow**

In the browser:

1. Open `http://localhost:3000`.
2. Replace editor content with Korean Markdown.
3. Change body font size, line height, page margin, and code font size.
4. Confirm preview changes immediately.
5. Upload an image named `diagram.png`.
6. Add `![Diagram](diagram.png)` to Markdown.
7. Export PDF.
8. Open the downloaded PDF and confirm text, table, code block, and image are visible.

- [ ] **Step 4: Update `docs/README.md` current status**

Set current status to:

```markdown
## Current Design Status

The web app MVP has been implemented.

Run locally:

```bash
npm run dev
```

Verify:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```
```

- [ ] **Step 5: Update `harness/feature-list.json`**

Mark implemented features as `passing` only if verification succeeded:

```yaml
status: passing
evidence:
  - "YYYY-MM-DD: npm run lint passed."
  - "YYYY-MM-DD: npm run test passed."
  - "YYYY-MM-DD: npm run test:e2e passed."
  - "YYYY-MM-DD: npm run build passed."
```

Keep exactly one next feature as `in_progress` if more work remains.

- [ ] **Step 6: Update `harness/progress-log.md` and `harness/handoff.md`**

Record:

```text
Standard startup path: npm run dev
Standard verification path: npm run lint; npm run test; npm run test:e2e; npm run build
Highest priority unfinished feature: next unstarted or blocked feature
Current blocker: None, or the exact blocker found
```

- [ ] **Step 7: Commit final docs and harness state**

```bash
git add docs harness
git commit -m "docs: record web app implementation status"
```

## Self-Review Checklist

- Spec coverage: editor, preview, style controls, uploaded images, PDF export, errors, and verification are covered by tasks.
- Shared rendering: preview and export both use `DocumentRenderer`.
- PDF export: Playwright opens the internal `/export` route and returns a PDF.
- Testing: unit tests cover pure utilities and renderer; browser tests cover editor, preview, uploaded images, and export.
- No existing PDF editing is included.
- No user accounts, remote image downloading, AI features, collaboration, or cloud storage are included.
