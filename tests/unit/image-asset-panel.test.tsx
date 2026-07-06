import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ImageAssetPanel } from "@/components/ImageAssetPanel";
import { MAX_IMAGE_ASSET_SIZE_BYTES } from "@/lib/document/assets";
import type { DocumentAsset } from "@/lib/document/types";

function renderPanel(assets: DocumentAsset[] = []) {
  const onChange = vi.fn();
  render(<ImageAssetPanel assets={assets} onChange={onChange} />);
  return onChange;
}

describe("ImageAssetPanel", () => {
  it("shows a clear error for unsupported image files", async () => {
    renderPanel();

    fireEvent.change(screen.getByLabelText("Image uploads"), {
      target: {
        files: [new File(["<svg />"], "diagram.svg", { type: "image/svg+xml" })],
      },
    });

    await expect(screen.findByRole("alert")).resolves.toHaveTextContent(
      "Only PNG, JPEG, WebP, and GIF images are supported.",
    );
  });

  it("shows a clear error for oversized image files", async () => {
    renderPanel();

    fireEvent.change(screen.getByLabelText("Image uploads"), {
      target: {
        files: [new File([new Uint8Array(MAX_IMAGE_ASSET_SIZE_BYTES + 1)], "large.png", { type: "image/png" })],
      },
    });

    await expect(screen.findByRole("alert")).resolves.toHaveTextContent("Each image must be 2 MB or smaller.");
  });

  it("removes an uploaded image asset", () => {
    const onChange = renderPanel([{ name: "diagram.png", dataUrl: "data:image/png;base64,abc" }]);

    fireEvent.click(screen.getByRole("button", { name: "Remove diagram.png" }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("replaces duplicate filenames when uploading", async () => {
    const onChange = renderPanel([{ name: "diagram.png", dataUrl: "data:image/png;base64,old" }]);

    fireEvent.change(screen.getByLabelText("Image uploads"), {
      target: {
        files: [new File(["new"], "diagram.png", { type: "image/png" })],
      },
    });

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const nextAssets = onChange.mock.calls[0][0] as DocumentAsset[];
    expect(nextAssets).toHaveLength(1);
    expect(nextAssets[0].name).toBe("diagram.png");
    expect(nextAssets[0].dataUrl).toContain("data:image/png");
    expect(nextAssets[0].dataUrl).not.toBe("data:image/png;base64,old");
  });
});
