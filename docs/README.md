# Project Documentation

Design documents and specifications for this project live in this directory.

## Current Design Status

The project direction changed from a CLI tool to a web application.
The previous CLI design is preserved for reference but is no longer the active
target. The web app design is approved and the implementation plan has been
written.

Selected direction:

- Build a web application.
- Edit Markdown in the browser.
- Show a live preview before PDF generation.
- Provide style controls before export.
- Export the preview layout to PDF.
- Target development documentation first.

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
