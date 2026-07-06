const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g;

function cleanFilenameBase(title: string): string {
  return title.replace(INVALID_FILENAME_CHARS, "").trim() || "document";
}

function asciiFallbackFilename(baseName: string): string {
  const fallback = baseName.replace(/[^\x20-\x7e]/g, "").replace(/\s+/g, " ").trim();
  return `${fallback || "document"}.pdf`;
}

function encodeRfc5987Value(value: string): string {
  return encodeURIComponent(value).replace(/['()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function buildPdfContentDisposition(title: string): string {
  const baseName = cleanFilenameBase(title);
  const asciiFilename = asciiFallbackFilename(baseName);
  const encodedFilename = encodeRfc5987Value(`${baseName}.pdf`);

  return `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`;
}
