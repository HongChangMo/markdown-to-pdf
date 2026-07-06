export function resolveExportOrigin(
  requestOrigin: string,
  configuredOrigin = process.env.APP_ORIGIN,
): string {
  const trimmed = configuredOrigin?.trim();
  if (!trimmed) {
    return requestOrigin;
  }

  const parsed = new URL(trimmed);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("APP_ORIGIN must be an http or https URL.");
  }

  return parsed.origin;
}
