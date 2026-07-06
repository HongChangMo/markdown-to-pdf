# Project Documentation

Design documents and specifications for this project live in this directory.

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

The previous CLI design is preserved for reference but is no longer the active
target.

Selected direction:

- Build a web application.
- Edit Markdown in the browser.
- Show a live preview before PDF generation.
- Provide style controls before export.
- Export the preview layout to PDF.
- Target development documentation first.
- Preserve editor line breaks intuitively in preview and export.
- Preserve blank-line spacing around headings, tables, and list-to-heading
  transitions without breaking Markdown block parsing.
- Show page boundary guides in the preview so pagination can be inspected before export.
- Show a preview page count next to the page boundary guides.
- Preserve setext headings and document nested lists and raw HTML safety policy.
- Style blockquotes so quoted text is visually distinct in preview and export.
- Use the same CSS page box and padding-based document margin model for preview
  and export pagination.
- Harden PDF export with trusted origin resolution, timeout handling, generic
  internal error messages, and duplicate-click protection.
- Harden image uploads with supported type and size limits, duplicate filename
  replacement, delete actions, and clear upload errors.
- Autosave the current document in browser localStorage and support full
  document JSON import/export plus reset confirmation.

Selected stack:

- Next.js
- TypeScript
- Playwright

## Spec Files

Active specs:

- `docs/markdown-to-pdf-web-app-design.md`
- `docs/markdown-to-pdf-web-app-implementation-plan.md`

Reference specs:

- `docs/markdown-to-pdf-cli-design.md` - superseded by the web app direction

Planned specs:

- None at this time.

## Update Rules

- Keep specs concise and current.
- Record decisions, constraints, and verification commands.
- When behavior changes, update the relevant spec in the same session.
