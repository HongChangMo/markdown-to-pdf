import type { DocumentAsset } from "./types";

export const MAX_IMAGE_ASSET_COUNT = 20;
export const MAX_IMAGE_ASSET_SIZE_BYTES = 2 * 1024 * 1024;
export const MAX_IMAGE_ASSET_DATA_URL_LENGTH = Math.ceil((MAX_IMAGE_ASSET_SIZE_BYTES * 4) / 3) + 128;

export const SUPPORTED_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;
export const ACCEPTED_IMAGE_MIME_TYPES = SUPPORTED_IMAGE_MIME_TYPES.join(",");

export function normalizeAssetName(value: string): string {
  return value.split("/").pop()?.trim() ?? value.trim();
}

export function isSupportedImageMimeType(type: string): boolean {
  return SUPPORTED_IMAGE_MIME_TYPES.includes(type as (typeof SUPPORTED_IMAGE_MIME_TYPES)[number]);
}

export function getImageAssetMimeType(dataUrl: string): string {
  const match = /^data:([^;,]+)[;,]/.exec(dataUrl);
  return match?.[1] ?? "";
}

export function validateImageFile(file: Pick<File, "name" | "type" | "size">): string | null {
  if (!isSupportedImageMimeType(file.type)) {
    return "Only PNG, JPEG, WebP, and GIF images are supported.";
  }

  if (file.size > MAX_IMAGE_ASSET_SIZE_BYTES) {
    return "Each image must be 2 MB or smaller.";
  }

  return null;
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

export function mergeDocumentAssets(existing: DocumentAsset[], nextAssets: DocumentAsset[]): DocumentAsset[] {
  const merged = [...existing];

  for (const nextAsset of nextAssets) {
    const requestedName = normalizeAssetName(nextAsset.name);
    const existingIndex = merged.findIndex((asset) => normalizeAssetName(asset.name) === requestedName);

    if (existingIndex >= 0) {
      merged[existingIndex] = nextAsset;
    } else {
      merged.push(nextAsset);
    }
  }

  if (merged.length > MAX_IMAGE_ASSET_COUNT) {
    throw new Error("Up to 20 image uploads are supported.");
  }

  return merged;
}

export function removeDocumentAssetByName(assets: DocumentAsset[], name: string): DocumentAsset[] {
  const requestedName = normalizeAssetName(name);
  return assets.filter((asset) => normalizeAssetName(asset.name) !== requestedName);
}

export async function fileToDocumentAsset(file: File): Promise<DocumentAsset> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

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
