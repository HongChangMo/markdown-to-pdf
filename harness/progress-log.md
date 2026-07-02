# Progress Log

This file is the single source of truth for the current verified project state.
Every new session must read this file first.

## Current Verified State

Repository root directory:

```text
/Users/zzangmo/project/mdToPdf
```

Standard startup path:

```text
npm run dev
```

Standard verification path:

```text
npm run lint
npm run test
npm run test:e2e
npm run build
```

Highest priority unfinished feature:

```text
None for the current MVP scope.
```

Current blocker:

```text
None.
```

## Session Records

### 2026-07-02 - Project direction and harness setup

Goal:

```text
Decide the initial shape of a Markdown-to-PDF project and create persistent project harness documents.
```

Completed:

```text
Confirmed the project should start as a CLI tool.
Confirmed the first target document type is development documentation.
Selected Python as the recommended environment for the initial design.
Created harness document structure.
```

Verification run:

```text
Checked that the working directory was empty and not a git repository.
```

Evidence recorded:

```text
`rg --files -uu` returned no project files.
`git status --short` and `git log --oneline -5` reported that the directory is not a git repository.
```

Commits:

```text
None. Repository is not initialized yet.
```

Known risks:

```text
PDF rendering engine has not been finalized.
Python packaging and verification tooling have not been selected.
Korean font handling is not yet validated.
```

Next best action:

```text
Approve the CLI design, then write the design spec under `docs/`.
```

### 2026-07-02 - CLI design spec draft

Goal:

```text
Write the approved-direction Markdown-to-PDF CLI design spec under `docs/`.
```

Completed:

```text
Created `docs/markdown-to-pdf-cli-design.md`.
Updated documentation status in `docs/README.md`.
Updated harness state for design review handoff.
```

Verification run:

```text
Read `AGENTS.md`, `harness/progress-log.md`, `harness/feature-tracker.yaml`, `harness/handoff.md`, and `docs/README.md` before editing.
```

Evidence recorded:

```text
Spec includes goal, user-visible behavior, non-goals, stack, architecture, data flow, CLI contract, styling, local image handling, error handling, testing, verification commands, open decisions, and next step.
```

Commits:

```text
None. Repository is not initialized yet.
```

Known risks:

```text
The design is still pending user review.
Python project manager has not been selected.
Korean font fallback has not been validated.
No implementation or automated tests exist yet.
```

Next best action:

```text
User reviews `docs/markdown-to-pdf-cli-design.md`. If approved, write an implementation plan under `docs/`.
```

### 2026-07-02 - Direction changed to web app

Goal:

```text
Record the decision to change the product direction from a CLI tool to a web app.
```

Completed:

```text
Updated `AGENTS.md` with the web app direction.
Marked `docs/markdown-to-pdf-cli-design.md` as superseded.
Updated `docs/README.md`, `harness/feature-tracker.yaml`, and `harness/handoff.md`.
```

Verification run:

```text
Read current harness and design documents before editing.
```

Evidence recorded:

```text
The active direction is now a web application with Markdown editing, live preview, style controls, and PDF export.
```

Commits:

```text
None. Repository is not initialized yet.
```

Known risks:

```text
The detailed web app design has not been written or approved yet.
The frontend framework and PDF export implementation need final confirmation.
No implementation or automated tests exist yet.
```

Next best action:

```text
Review the proposed web app design shape. If approved, write `docs/markdown-to-pdf-web-app-design.md`.
```

### 2026-07-02 - Web app stack and design spec draft

Goal:

```text
Record the selected web app stack and write the web app design spec.
```

Completed:

```text
Confirmed the project stack as Next.js, TypeScript, and Playwright.
Created `docs/markdown-to-pdf-web-app-design.md`.
Updated `AGENTS.md`, `docs/README.md`, `harness/feature-tracker.yaml`, and `harness/handoff.md`.
```

Verification run:

```text
Read current project docs and harness files before editing.
```

Evidence recorded:

```text
The web app design spec includes stack, workflow, feature scope, non-goals, layout, components, data model, rendering strategy, export strategy, style controls, error handling, tests, verification commands, open decisions, and next step.
```

Commits:

```text
None. Repository is not initialized yet.
```

Known risks:

```text
The written web app design is pending user review.
Package manager and CSS approach are not selected yet.
Playwright deployment constraints are not validated yet.
No implementation or automated tests exist yet.
```

Next best action:

```text
User reviews `docs/markdown-to-pdf-web-app-design.md`. If approved, write `docs/markdown-to-pdf-web-app-implementation-plan.md`.
```

### 2026-07-02 - Web app design approved and implementation plan written

Goal:

```text
Approve the web app design and write the implementation plan.
```

Completed:

```text
Marked `docs/markdown-to-pdf-web-app-design.md` as approved for implementation planning.
Created `docs/markdown-to-pdf-web-app-implementation-plan.md`.
Updated `docs/README.md`, `harness/feature-tracker.yaml`, and `harness/handoff.md`.
```

Verification run:

```text
Read `AGENTS.md`, `docs/markdown-to-pdf-web-app-design.md`, `harness/feature-tracker.yaml`, `harness/progress-log.md`, and `harness/handoff.md` before editing.
```

Evidence recorded:

```text
Implementation plan covers scaffold, shared document model, validation, renderer, editor/preview/style controls, PDF export, uploaded images, final verification, and harness updates.
```

Commits:

```text
None. Repository is not initialized yet.
```

Known risks:

```text
Implementation has not started.
Network access may be required to scaffold and install npm packages.
Playwright browser installation may be required.
No automated verification has run yet because no project scaffold exists.
```

Next best action:

```text
Choose execution mode, then start Task 1 in `docs/markdown-to-pdf-web-app-implementation-plan.md`.
```

### 2026-07-02 - Feature tracker converted to JSON

Goal:

```text
Replace the YAML feature tracker with a machine-readable JSON feature list.
```

Completed:

```text
Created `harness/feature-list.json`.
Deleted `harness/feature-tracker.yaml`.
Updated `AGENTS.md`, `harness/handoff.md`, and implementation plan references.
Recorded scaffold evidence in `project-scaffold`.
```

Verification run:

```text
Read the existing YAML feature tracker and searched references before editing.
```

Evidence recorded:

```text
`feature-list.json` contains the same feature list and keeps exactly one `in_progress` item: `project-scaffold`.
```

Commits:

```text
Not committed yet. Current implementation work is in progress after the initial scaffold commit.
```

Known risks:

```text
Historical progress log entries still mention the old YAML file because they describe past actions.
```

Next best action:

```text
Continue Task 2 in `docs/markdown-to-pdf-web-app-implementation-plan.md`.
```

### 2026-07-02 - AGENTS harness rules verified

Goal:

```text
Verify that `AGENTS.md` accurately describes automatic management of `./harness` documents.
```

Completed:

```text
Confirmed `AGENTS.md` references the active harness files: `progress-log.md`, `feature-list.json`, and `handoff.md`.
Added explicit automatic harness update rules to `AGENTS.md`.
Verified `harness/feature-list.json` is valid JSON and has exactly one `in_progress` feature: `pdf-export`.
Updated `harness/feature-list.json` and `harness/handoff.md` with the current implementation checkpoint.
```

Verification run:

```text
Read `AGENTS.md`.
Listed current files under `harness/` and `docs/`.
Searched references to `feature-list.json` and `feature-tracker.yaml`.
Validated `harness/feature-list.json` with Node.js and checked the single `in_progress` rule.
```

Evidence recorded:

```text
`AGENTS.md` now contains `Harness Files` and `Automatic Harness Updates` sections.
`feature-list.json` currently has exactly one active feature: `pdf-export`.
```

Commits:

```text
Not committed yet. Current PDF export implementation task is still in progress.
```

Known risks:

```text
Historical progress log entries still mention `feature-tracker.yaml` because they describe past actions before conversion to JSON.
```

Next best action:

```text
Continue Task 6 by implementing the export page, PDF API, and Export PDF button.
```

### 2026-07-02 - MVP implementation verified

Goal:

```text
Finish implementation and run final verification for the Markdown-to-PDF web app MVP.
```

Completed:

```text
Implemented Next.js TypeScript app scaffold.
Implemented shared document state, validation, asset helpers, Markdown renderer, editor, live preview, style controls, PDF export, uploaded image assets, and clear error messages.
Updated `AGENTS.md` to use the correct at-most-one `in_progress` feature rule.
Updated `docs/README.md`, `harness/feature-list.json`, and `harness/handoff.md`.
```

Verification run:

```text
npm run lint
npm run test
npm run test:e2e
npm run build
```

Evidence recorded:

```text
`npm run lint` passed.
`npm run test` passed with 3 test files and 9 tests.
`npm run test:e2e` passed with 6 tests.
`npm run build` passed.
```

Commits:

```text
578f8b7 chore: scaffold nextjs markdown pdf app
5440c4e feat: add document state and style utilities
e55e125 feat: validate document state and assets
84934db feat: render markdown document preview
6efaac6 feat: add markdown editor live preview and style panel
940c2b0 feat: export preview document to pdf
920fb62 feat: add uploaded image assets
6b20a6e feat: show clear export errors
```

Known risks:

```text
Manual visual review in a real browser is still recommended.
PDF visual fidelity is covered by E2E generation and page-count checks, not pixel inspection.
```

Next best action:

```text
Start `npm run dev` and manually review the editor, preview, style controls, image upload, and exported PDF.
```
