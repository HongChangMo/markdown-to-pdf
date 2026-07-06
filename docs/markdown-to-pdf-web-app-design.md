# Markdown-to-PDF Web App Design

## Status

Approved for implementation planning on 2026-07-02.

## Goal

Build a web application that lets a user write or paste Markdown, preview the
rendered document, adjust PDF-oriented style settings, and export the final
preview layout as a PDF.

The first version targets development documentation.

## Stack

- Framework: Next.js
- Language: TypeScript
- PDF export: Puppeteer Core with Chromium
- UI runtime: React
- Markdown rendering: React Markdown with GitHub Flavored Markdown support
- Styling: application CSS plus a dedicated document CSS layer
- Test direction: unit tests for pure rendering/style logic and Playwright tests
  for browser workflows

## User-Visible Workflow

1. User opens the web app.
2. User writes or pastes Markdown into the editor.
3. Preview updates as Markdown or style settings change.
4. User adjusts PDF style settings before export.
5. User clicks export.
6. Server-side Puppeteer renders the export page and returns a PDF download.

The app should start on the editor experience, not a landing page.

## Initial Feature Scope

The first version should support:

- Markdown text editing
- Live preview
- ATX and setext headings, paragraphs, nested lists, blockquotes, tables,
  fenced code blocks, inline code, links, local or uploaded images, and Korean text
- Uploaded image management with PNG, JPEG, WebP, and GIF support, 2 MB per-file
  limits, duplicate filename replacement, and deletion
- Style controls for body font size, line height, page size, page margin, and
  code block font size
- PDF export from the same document model and style settings used by preview
- Editor-style line break preservation: Enter-based spacing, `<br>` tags, and
  Markdown hard breaks should be visible in preview and export
- Blank-line preservation around Markdown block elements: spacing before all
  ATX heading levels (`#` through `######`), above/below tables, and between a
  list item and the next heading should remain visible without breaking Markdown
  block parsing
- Page boundary guides in the preview so users can inspect where PDF pages will
  divide before exporting
- A preview page count derived from the same page box used by the guides
- Clear UI errors for export failures and unsupported assets
- Browser-local autosave, full document JSON import/export, and reset confirmation
- Raw HTML blocks are removed before rendering instead of being passed through
  as live DOM

## Non-Goals

The first version will not include:

- Existing PDF editing after generation
- User accounts
- Cloud document storage
- Collaboration
- AI writing or summarization
- Remote image downloading
- Multiple saved themes
- Version history
- Mobile-first long-form editing

These can be added later after the editor, preview, style, and export path is
verified.

## Application Layout

Desktop layout:

- Top toolbar for document title, export action, and basic status.
- Left editor pane for Markdown.
- Center preview pane showing a page-like document surface.
- Right settings pane for PDF style controls.

Mobile layout:

- Use tabs or segmented navigation for Editor, Preview, and Settings.
- Keep export available from the top toolbar.

The preview should make page boundaries visible enough to judge margins and line
wrapping before export. It should also show the current page count so users can
quickly see when edits change pagination.

Preview page boundary guides and exported PDF pagination should use the same
page box model. The configured document margin is applied as CSS padding on the
document page. Chromium PDF margins are kept at `0mm` so the margin is not
applied twice and the preview page guide count can match exported PDF pages.

The preview should also preserve editor-entered line breaks in a way that is
intuitive for PDF editing. A single Enter creates a visible line break. Repeated
Enters create repeated visible vertical spacing. `<br>`, `<br/>`, `<br />`, and
Markdown hard breaks are normalized to visible line breaks. Blank lines before
headings are preserved for every ATX heading level, including `### 코드` and
`#### **현재 구현된 코드**`. Blank lines above and below tables are preserved
while keeping table rows parsed as table rows instead of paragraph or list text.
Blank lines after list items and before the next heading are also preserved
while keeping the heading outside the list.
Setext heading syntax (`Title` followed by `===` or `---`) must remain intact
during line-break preprocessing. Blockquotes should be visibly distinct from
plain paragraphs. Raw HTML block lines are removed before Markdown rendering so
the document keeps a safe, Markdown-first rendering policy.

## Core Components

- `MarkdownEditor`: controlled Markdown input.
- `PreviewPane`: renders Markdown with current style settings.
- `StylePanel`: updates PDF-oriented style settings.
- `ExportButton`: submits the document model to the export API.
- `DocumentRenderer`: shared renderer used by preview and export routes.
- `ExportPage`: hidden/server-rendered route that the PDF generator opens for PDF
  generation.
- `ExportApi`: validates payload, launches Puppeteer/Chromium, renders PDF, and returns
  the file.

## Data Model

The app state should keep Markdown and style settings together.

```ts
type DocumentState = {
  title: string;
  markdown: string;
  style: DocumentStyle;
};

type DocumentStyle = {
  fontSizePx: number;
  lineHeight: number;
  pageSize: "A4" | "Letter";
  marginMm: number;
  codeFontSizePx: number;
};
```

The first version stores the current document in browser `localStorage`.
Persistence is local to the current browser profile. Full document JSON
import/export lets users move a document state between sessions or machines
without requiring cloud storage.

Uploaded image assets are stored as data URLs in `DocumentState.assets`.
Supported upload types are PNG, JPEG, WebP, and GIF. Each file is limited to
2 MB, and the document may contain up to 20 uploaded images. Uploading a file
with the same normalized filename replaces the previous asset so Markdown
references continue to resolve predictably.

## Rendering Strategy

Preview and PDF export must share:

- Markdown parser configuration
- Document renderer component
- Document CSS variables
- Style setting validation rules

The preview can render directly in the browser. Export should render a stable
export page with the same document state, then Puppeteer should print that page
to PDF.

## PDF Export Strategy

The export flow should be:

1. Browser sends `DocumentState` to a Next.js API route.
2. API validates the payload.
3. API resolves the export origin from `APP_ORIGIN` when configured, otherwise
   from the request origin. Forwarded host headers are not trusted implicitly.
4. API opens an internal export route with Puppeteer. Local development uses
   Puppeteer Core with the locally installed Chromium; Vercel uses
   `@sparticuz/chromium` so the serverless function has an executable browser.
5. Export route renders the document using print-oriented CSS.
6. Puppeteer calls `page.pdf()` with the requested page size and `0mm` PDF
   margins.
7. API returns the PDF as a download.

The document margin setting belongs to shared document CSS, not to browser PDF
PDF margins. This keeps preview pagination and exported PDF pagination aligned.
Puppeteer navigation, readiness checks, and PDF generation use a bounded export
timeout so a hung render can fail cleanly. The export API declares a Vercel
function duration budget so cold Chromium extraction has room to complete.

This project should run in a Node.js runtime, not a static export. Serverless
deployment needs the traced `@sparticuz/chromium` binary files and
Puppeteer runtime files included in the function bundle.

## Style Controls

Initial controls:

- Body font size: numeric stepper or slider
- Line height: numeric stepper or slider
- Page size: segmented control for A4 and Letter
- Page margin: numeric stepper or slider
- Code block font size: numeric stepper or slider

Style settings should update the preview immediately.

## Error Handling

Expected first-version errors:

- Markdown render failure
- Invalid style setting values
- Missing uploaded image asset
- PDF export timeout
- Puppeteer/Chromium launch/render failure

Errors should be shown in the UI with short actionable messages. Developer
details can be logged on the server. Validation errors should return 400-level
responses with user-facing messages. Internal render failures should return a
generic 500-level export failure message instead of exposing browser or server
details to the client.

## Testing

The initial test suite should cover:

- Default document state can render.
- Markdown rendering supports headings, lists, tables, code blocks, links, and
  Korean text.
- Style settings produce expected CSS variables.
- Changing style controls updates preview.
- Export API returns a PDF for a sample document.
- Generated PDF has at least one page.

Playwright browser tests should verify the full editor-to-export workflow after
the scaffold exists.

## Verification Commands

The implementation should eventually support:

```bash
npm run dev
npm run lint
npm run test
npm run test:e2e
```

The exact commands may change when the project scaffold is created.

## Open Decisions

- Package manager: npm, pnpm, or yarn.
- Whether to use Tailwind CSS for the application shell or plain CSS modules.
- How image uploads should be stored for export in the first version.
- Whether export should stream the PDF or return it after full generation.
- Whether to initialize git in this directory.

## Next Step

After this design is approved, write an implementation plan under `docs/` and
then scaffold the Next.js TypeScript project.
