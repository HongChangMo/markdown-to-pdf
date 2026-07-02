const BR_TAG_PATTERN = /<br\s*\/?>/gi;
const FENCE_PATTERN = /^\s*(```|~~~)/;

type LineKind = "blank" | "plain" | "heading" | "list" | "blockquote" | "thematic" | "table";

function isTableLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.endsWith("|");
}

function classifyLine(line: string): LineKind {
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

function normalizeBreakTags(line: string): string {
  return line.replace(BR_TAG_PATTERN, "  \n");
}

function findNearestNonBlankKind(lines: string[], start: number, direction: 1 | -1): LineKind | null {
  for (let index = start; index >= 0 && index < lines.length; index += direction) {
    const kind = classifyLine(lines[index]);
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
  const lines = markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
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

      const kind = classifyLine(line);

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
