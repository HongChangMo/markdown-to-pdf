import { describe, expect, it } from "vitest";
import {
  MAX_IMAGE_ASSET_COUNT,
  MAX_IMAGE_ASSET_SIZE_BYTES,
  mergeDocumentAssets,
  removeDocumentAssetByName,
  validateImageFile,
} from "@/lib/document/assets";
import type { DocumentAsset } from "@/lib/document/types";

function imageFile(name: string, type = "image/png", size = 100): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("document asset helpers", () => {
  it("accepts supported image files within the size limit", () => {
    expect(validateImageFile(imageFile("diagram.png"))).toBeNull();
  });

  it("rejects unsupported image MIME types", () => {
    expect(validateImageFile(imageFile("diagram.svg", "image/svg+xml"))).toBe(
      "Only PNG, JPEG, WebP, and GIF images are supported.",
    );
  });

  it("rejects files larger than the configured image size limit", () => {
    expect(validateImageFile(imageFile("large.png", "image/png", MAX_IMAGE_ASSET_SIZE_BYTES + 1))).toBe(
      "Each image must be 2 MB or smaller.",
    );
  });

  it("replaces an existing asset when a new upload has the same filename", () => {
    const merged = mergeDocumentAssets(
      [{ name: "diagram.png", dataUrl: "data:image/png;base64,old" }],
      [{ name: "./diagram.png", dataUrl: "data:image/png;base64,new" }],
    );

    expect(merged).toEqual([{ name: "./diagram.png", dataUrl: "data:image/png;base64,new" }]);
  });

  it("rejects merges that exceed the asset count limit", () => {
    const existing: DocumentAsset[] = Array.from({ length: MAX_IMAGE_ASSET_COUNT }, (_, index) => ({
      name: `image-${index}.png`,
      dataUrl: "data:image/png;base64,abc",
    }));

    expect(() =>
      mergeDocumentAssets(existing, [{ name: "extra.png", dataUrl: "data:image/png;base64,abc" }]),
    ).toThrow("Up to 20 image uploads are supported.");
  });

  it("removes assets by normalized filename", () => {
    expect(
      removeDocumentAssetByName(
        [
          { name: "diagram.png", dataUrl: "data:image/png;base64,abc" },
          { name: "photo.png", dataUrl: "data:image/png;base64,def" },
        ],
        "./diagram.png",
      ),
    ).toEqual([{ name: "photo.png", dataUrl: "data:image/png;base64,def" }]);
  });
});
