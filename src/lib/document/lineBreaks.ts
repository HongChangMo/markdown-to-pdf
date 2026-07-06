const BR_TAG_PATTERN = /<br\s*\/?>/gi;
const BR_ONLY_PATTERN = /^<br\s*\/?>$/i;
const FENCE_PATTERN = /^\s*(```|~~~)/;

type LineKind = "blank" | "plain" | "heading" | "list" | "blockquote" | "thematic" | "table";

function isTableLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.endsWith("|");
}

function isSetextUnderline(line: string): boolean {
  return /^(=+|-+)\s*$/.test(line.trim());
}

function classifyLineRaw(line: string): LineKind {
  const trimmed = line.trim();

  if (!trimmed) {
    return "blank";
  }

  if (isTableLine(line)) {
    return "table";
  }

  if (/^#{1,6}\s/.test(trimmed)) {
    return "heading";
  }

  if (/^([-*+]|\d+\.)\s+/.test(trimmed)) {
    return "list";
  }

  if (/^>\s?/.test(trimmed)) {
    return "blockquote";
  }

  if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
    return "thematic";
  }

  return "plain";
}

function isSetextUnderlineAt(lines: string[], index: number): boolean {
  if (!isSetextUnderline(lines[index]) || index === 0) {
    return false;
  }

  return classifyLineRaw(lines[index - 1]) === "plain";
}

function isSetextHeadingTextAt(lines: string[], index: number): boolean {
  return classifyLineRaw(lines[index]) === "plain" && index < lines.length - 1 && isSetextUnderline(lines[index + 1]);
}

function classifyLineAt(lines: string[], index: number): LineKind {
  if (isSetextHeadingTextAt(lines, index) || isSetextUnderlineAt(lines, index)) {
    return "heading";
  }

  return classifyLineRaw(lines[index]);
}

function normalizeBreakTags(line: string): string {
  return line.replace(BR_TAG_PATTERN, "  \n");
}

function isRawHtmlBlockLine(line: string): boolean {
  const trimmed = line.trim();

  if (!trimmed || BR_ONLY_PATTERN.test(trimmed)) {
    return false;
  }

  return /^<!--/.test(trimmed) || /^<\/?(?!br\b)[A-Za-z][A-Za-z0-9:-]*(?:\s[^>]*)?>/.test(trimmed);
}

function stripRawHtmlBlockLines(lines: string[]): string[] {
  let inFence = false;

  return lines.map((line) => {
    const isFenceBoundary = FENCE_PATTERN.test(line);

    if (isFenceBoundary) {
      inFence = !inFence;
      return line;
    }

    if (inFence || !isRawHtmlBlockLine(line)) {
      return line;
    }

    return "";
  });
}

function findNearestNonBlankKind(lines: string[], start: number, direction: 1 | -1): LineKind | null {
  for (let index = start; index >= 0 && index < lines.length; index += direction) {
    const kind = classifyLineAt(lines, index);
    if (kind !== "blank") {
      return kind;
    }
  }

  return null;
}

function supportsVisibleSpacing(kind: LineKind | null): boolean {
  return kind === "plain" || kind === "heading" || kind === "table";
}

function shouldPreserveBlankLine(previousKind: LineKind | null, nextKind: LineKind | null): boolean {
  if (previousKind === "list") {
    return supportsVisibleSpacing(nextKind);
  }

  return supportsVisibleSpacing(previousKind) && supportsVisibleSpacing(nextKind);
}

export function preserveMarkdownLineBreaks(markdown: string): string {
  const lines = stripRawHtmlBlockLines(markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n"));
  let inFence = false;

  return lines
    .map((line, index) => {
      const isFenceBoundary = FENCE_PATTERN.test(line);

      if (isFenceBoundary) {
        inFence = !inFence;
        return line;
      }

      if (inFence) {
        return line;
      }

      const kind = classifyLineAt(lines, index);

      if (
        kind === "table" ||
        kind === "heading" ||
        kind === "list" ||
        kind === "blockquote" ||
        kind === "thematic"
      ) {
        return line;
      }

      if (kind === "blank") {
        const previousKind = findNearestNonBlankKind(lines, index - 1, -1);
        const nextKind = findNearestNonBlankKind(lines, index + 1, 1);
        if (shouldPreserveBlankLine(previousKind, nextKind)) {
          if (previousKind === "table" || previousKind === "list") {
            return "\n&nbsp;  ";
          }

          return "&nbsp;  ";
        }

        return "";
      }

      const nextKind = findNearestNonBlankKind(lines, index + 1, 1);
      const shouldHardBreak = supportsVisibleSpacing(nextKind);
      const normalized = normalizeBreakTags(line);

      if (!shouldHardBreak || normalized.endsWith("  ") || normalized.includes("\n")) {
        return normalized;
      }

      if (index === lines.length - 1) {
        return normalized;
      }

      return `${normalized}  `;
    })
    .join("\n");
}
