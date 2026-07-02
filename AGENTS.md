# Agent Operating Guide

This project uses local harness documents to preserve project state across sessions.

## Startup Order

Every agent session must start by reading these files in order:

1. `harness/progress-log.md`
2. `harness/feature-list.json`
3. `harness/handoff.md`
4. Relevant files under `docs/`

Treat `harness/progress-log.md` as the source of truth for the current verified project state.

## Documentation Rules

- Keep design documents and specifications under `docs/`.
- Keep harness engineering and session continuity documents under `harness/`.
- Update harness files whenever project state changes.
- Record verification evidence immediately after running checks.
- Keep at most one feature in `in_progress` status in `harness/feature-list.json`.

## Harness Files

Current harness files:

- `harness/progress-log.md`: source of truth for verified project state and session records.
- `harness/feature-list.json`: machine-readable feature list, status, verification steps, and evidence.
- `harness/handoff.md`: concise next-session handoff.

## Automatic Harness Updates

Agents must update harness files during the session, not only at the end.

Update `harness/feature-list.json` when:

- A feature starts: set that feature to `in_progress`.
- A feature passes verification: set that feature to `passing` and add evidence.
- Work is blocked: set that feature to `blocked` and document the blocker.
- The next feature begins: ensure the previous feature is no longer `in_progress`.
- The current implementation scope completes: leave no feature in `in_progress`.

Update `harness/progress-log.md` when:

- The verified project state changes.
- A session reaches a meaningful checkpoint.
- Verification commands are run and produce evidence.
- A blocker or risk is discovered.

Update `harness/handoff.md` when:

- The next best action changes.
- The startup, verification, or debug commands change.
- A future session would need new context to continue safely.

## Session Closeout

Before ending a substantial session, update:

1. `harness/progress-log.md` with a new session record.
2. `harness/feature-list.json` with status and evidence changes.
3. `harness/handoff.md` with the shortest useful next-session context.

## Current Project Direction

The project will start as a web application for editing Markdown, previewing the
rendered document, adjusting PDF-oriented styles, and exporting the final result
as a PDF.

Selected stack:

- Next.js
- TypeScript
- Playwright

Initial target:

- Markdown editor
- Live document preview
- Style controls for font size, line height, margins, page size, and code blocks
- PDF export from the preview layout

Initial document type:

- Development documentation
- Headings, lists, tables, fenced code blocks, local images, links, and Korean text
