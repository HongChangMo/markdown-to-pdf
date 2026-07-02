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
- PDF export: Playwright
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
6. Server-side Playwright renders the export page and returns a PDF download.

The app should start on the editor experience, not a landing page.

## Initial Feature Scope

The first version should support:

- Markdown text editing
- Live preview
- Headings, paragraphs, lists, tables, fenced code blocks, inline code, links,
  local or uploaded images, and Korean text
- Style controls for body font size, line height, page size, page margin, and
  code block font size
- PDF export from the same document model and style settings used by preview
- Clear UI errors for export failures and unsupported assets

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
wrapping before export.

## Core Components

- `MarkdownEditor`: controlled Markdown input.
- `PreviewPane`: renders Markdown with current style settings.
- `StylePanel`: updates PDF-oriented style settings.
- `ExportButton`: submits the document model to the export API.
- `DocumentRenderer`: shared renderer used by preview and export routes.
- `ExportPage`: hidden/server-rendered route that Playwright opens for PDF
  generation.
- `ExportApi`: validates payload, launches Playwright, renders PDF, and returns
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

The first version can keep this state in the browser. Persistence can be added
later.

## Rendering Strategy

Preview and PDF export must share:

- Markdown parser configuration
- Document renderer component
- Document CSS variables
- Style setting validation rules

The preview can render directly in the browser. Export should render a stable
export page with the same document state, then Playwright should print that page
to PDF.

## PDF Export Strategy

The export flow should be:

1. Browser sends `DocumentState` to a Next.js API route.
2. API validates the payload.
3. API opens an internal export route with Playwright.
4. Export route renders the document using print-oriented CSS.
5. Playwright calls `page.pdf()` with the requested page size and margins.
6. API returns the PDF as a download.

This project should run in a Node.js runtime, not a static export. Serverless
deployment may need extra handling because Playwright/Chromium can be heavy.

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
- Playwright launch/render failure

Errors should be shown in the UI with short actionable messages. Developer
details can be logged on the server.

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
