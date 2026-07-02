# Markdown-to-PDF CLI Design

## Status

Superseded.

This CLI design is preserved for reference. On 2026-07-02, the project direction
changed to a web application with Markdown editing, live preview, style controls,
and PDF export before final generation.

## Goal

Build a local command-line tool that converts a Markdown file into a PDF file.
The first version targets development documentation rather than publishing,
resume, proposal, or print-design workflows.

Primary command:

```bash
mdtopdf input.md -o output.pdf
```

## User-Visible Behavior

Given a local Markdown file, the user can run one command and receive a PDF
next to the requested output path.

The initial version should render these common development-document features:

- Headings
- Paragraphs
- Ordered and unordered lists
- Tables
- Fenced code blocks
- Inline code
- Local images referenced from the Markdown file
- Links
- Korean text

## Non-Goals

The first version will not include:

- Web API
- GUI
- Live preview
- Remote image downloading
- Multiple custom themes
- Full GitHub rendering compatibility
- Complex document templates
- Header and footer customization
- Table of contents generation

These can be added later after the basic conversion pipeline is verified.

## Recommended Stack

- Language: Python
- CLI framework: Typer
- Markdown parser: markdown-it-py
- PDF renderer: WeasyPrint
- Test runner: pytest

Rationale:

Python keeps the CLI and document-conversion pipeline small. Typer gives a
clear CLI interface with good help output. markdown-it-py supports modern
Markdown parsing and extensions. WeasyPrint renders HTML and CSS to PDF without
requiring a browser runtime, which keeps the first version simpler than a
Chromium-based renderer.

## Architecture

The tool should be split into small modules:

- `cli`: parse command arguments and present user-facing errors.
- `converter`: orchestrate Markdown-to-PDF conversion.
- `markdown`: convert Markdown text to HTML body content.
- `document`: wrap HTML body content with a complete HTML document.
- `styles`: provide default CSS for development documents.
- `pdf`: render the final HTML document to PDF.

The conversion core should not depend on terminal behavior. This keeps it
testable and leaves room for a future API or library interface.

## Data Flow

1. CLI receives `input.md` and `--output output.pdf`.
2. CLI validates that the input path exists and is a file.
3. Converter reads Markdown as UTF-8.
4. Markdown parser converts Markdown into HTML body content.
5. Document builder wraps the body in a full HTML document.
6. Default CSS is attached.
7. PDF renderer writes the PDF to the output path.
8. CLI prints a short success message.

## CLI Contract

Required command:

```bash
mdtopdf input.md -o output.pdf
```

Accepted aliases:

```bash
mdtopdf input.md --output output.pdf
```

Exit behavior:

- `0`: PDF was created successfully.
- Non-zero: input validation or conversion failed.

Initial options:

- `input`: required Markdown file path.
- `-o, --output`: required PDF output path.

Deferred options:

- `--style`
- `--title`
- `--open`
- `--debug-html`

## Styling

The default stylesheet should be practical and readable:

- A4 page size
- Stable page margins
- Sans-serif body font with Korean fallback
- Monospace code font
- Clear heading hierarchy
- Bordered tables
- Readable code blocks with wrapping behavior that avoids page overflow
- Images constrained to page width
- Link styling that remains readable in print

The stylesheet should live in code or package data and be covered by tests that
confirm it can be loaded.

## Local Images

Image paths in Markdown should resolve relative to the input Markdown file.

Example:

```markdown
![Architecture](./images/architecture.png)
```

If `docs/guide.md` references `./images/architecture.png`, the converter should
resolve it as `docs/images/architecture.png`.

Remote images are out of scope for the first version.

## Error Handling

Errors should be short and actionable.

Expected first-version errors:

- Input file does not exist.
- Input path is not a file.
- Input file cannot be read as UTF-8.
- Output directory does not exist.
- Markdown parsing fails.
- PDF rendering fails.

The CLI should avoid Python tracebacks for normal user errors. Tracebacks can be
reserved for a future debug mode.

## Testing

The initial test suite should cover:

- CLI help command works.
- Missing input file returns a non-zero exit code.
- Markdown conversion preserves headings, tables, and code block structure.
- A sample Markdown file can be converted to a PDF.
- The generated PDF exists and has at least one page.
- Local image paths are resolved relative to the Markdown file.

Visual fidelity tests are not required in the first version, but at least one
sample document should include Korean text to validate font rendering manually.

## Verification Commands

The implementation should eventually support these commands:

```bash
mdtopdf --help
pytest
mdtopdf samples/dev-doc.md -o /tmp/dev-doc.pdf
```

The exact commands may change after project scaffold tooling is selected.

## Open Decisions

- Python project manager: `uv`, Poetry, or plain `pip` with `pyproject.toml`.
- Exact package/module name.
- Whether to initialize git in this directory.
- Which Korean font fallback should be documented for macOS and Linux.

## Next Step

After this design is approved, write an implementation plan under `docs/` and
then scaffold the Python project.
