# Handoff

## Currently Verified

- The working directory is `/Users/zzangmo/project/mdToPdf`.
- The directory had no project files before harness setup.
- The directory is now a git repository.
- The project direction changed to a web app for Markdown editing, live preview,
  style controls, and PDF export.
- The selected stack is Next.js, TypeScript, and Playwright.
- The first supported document type is development documentation.
- The active design spec exists at `docs/markdown-to-pdf-web-app-design.md`.
- The implementation plan exists at `docs/markdown-to-pdf-web-app-implementation-plan.md`.
- The previous CLI draft exists at `docs/markdown-to-pdf-cli-design.md` and is
  now superseded.
- `AGENTS.md` explicitly requires automatic updates to `harness/progress-log.md`,
  `harness/feature-list.json`, and `harness/handoff.md`.
- The web app MVP is implemented and verified.
- Preview now preserves editor-style line breaks and shows screen-only PDF page
  boundary guides.
- Blank-line spacing is covered before all heading levels, above/below tables,
  and between a list item and the next heading.

## Changes This Session

- Created `AGENTS.md`.
- Created `docs/README.md`.
- Created `harness/progress-log.md`.
- Created `harness/feature-tracker.yaml`.
- Created `harness/handoff.md`.
- Created `docs/markdown-to-pdf-cli-design.md`.
- Updated docs and harness state for design review.
- Updated the project direction from CLI to web app.
- Marked the CLI design as superseded.
- Created `docs/markdown-to-pdf-web-app-design.md`.
- Recorded Next.js, TypeScript, and Playwright as the selected stack.
- Marked the web app design as approved for implementation planning.
- Created `docs/markdown-to-pdf-web-app-implementation-plan.md`.
- Replaced `harness/feature-tracker.yaml` with `harness/feature-list.json`.
- Verified and strengthened `AGENTS.md` harness auto-update rules.
- Completed editor, preview, and style panel implementation.
- Started PDF export implementation with a failing E2E test.
- Completed PDF export, uploaded image assets, clear error handling, and final verification.
- Added Enter-count-based spacing behavior and preview page boundary guides.
- Added regression coverage for heading-level spacing, table top/bottom spacing,
  and list-to-heading spacing.

## Still Broken Or Unverified

- Implementation for the current MVP scope is complete.
- Web app scaffold exists.
- Markdown rendering, live preview, and style controls are implemented and verified.
- PDF export is implemented and verified.
- Uploaded image assets are implemented and verified in preview and PDF export flow.
- Korean text is covered by unit and E2E sample documents.
- Full final verification passed.
- Latest verification after line-break/page-guide changes passed.
- Latest line-break verification includes 33 unit tests and 7 E2E tests.

## Next Best Action

Start the development server and manually review line breaks, blank-line spacing,
heading spacing, table spacing, page boundary guides, and exported PDF output in
the browser.

Implementation may require network access for `npx`, `npm install`, and
Playwright browser installation.

## Commands

Startup:

```bash
npm run dev
```

Verification:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

Debug:

```bash
npm run test:e2e -- --debug
```
