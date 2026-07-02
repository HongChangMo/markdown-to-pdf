import type { DocumentAsset } from "./types";

export function normalizeAssetName(value: string): string {
  return value.split("/").pop()?.trim() ?? value.trim();
}

export function resolveMarkdownImageSrc(src: string | undefined, assets: DocumentAsset[]): string {
  if (!src) {
    return "";
  }

  if (src.startsWith("data:image/")) {
    return src;
  }

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return "";
  }

  const requestedName = normalizeAssetName(src);
  const asset = assets.find((item) => normalizeAssetName(item.name) === requestedName);
  return asset?.dataUrl ?? "";
}

export async function fileToDocumentAsset(file: File): Promise<DocumentAsset> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });

  return {
    name: file.name,
    dataUrl,
  };
}
