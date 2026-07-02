"use client";

import { fileToDocumentAsset } from "@/lib/document/assets";
import type { DocumentAsset } from "@/lib/document/types";
import styles from "./AppShell.module.css";

type ImageAssetPanelProps = {
  assets: DocumentAsset[];
  onChange: (assets: DocumentAsset[]) => void;
};

export function ImageAssetPanel({ assets, onChange }: ImageAssetPanelProps) {
  async function handleFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    const nextAssets = await Promise.all(Array.from(files).map(fileToDocumentAsset));
    onChange([...assets, ...nextAssets]);
  }

  return (
    <section className={styles.assetPanel} aria-label="Image assets">
      <label className={styles.field}>
        Image uploads
        <input
          aria-label="Image uploads"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </label>
      <ul className={styles.assetList}>
        {assets.map((asset) => (
          <li key={asset.name}>{asset.name}</li>
        ))}
      </ul>
    </section>
  );
}
