"use client";

import { useState } from "react";
import {
  ACCEPTED_IMAGE_MIME_TYPES,
  fileToDocumentAsset,
  mergeDocumentAssets,
  removeDocumentAssetByName,
} from "@/lib/document/assets";
import type { DocumentAsset } from "@/lib/document/types";
import styles from "./AppShell.module.css";

type ImageAssetPanelProps = {
  assets: DocumentAsset[];
  onChange: (assets: DocumentAsset[]) => void;
};

export function ImageAssetPanel({ assets, onChange }: ImageAssetPanelProps) {
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    try {
      const nextAssets = await Promise.all(Array.from(files).map(fileToDocumentAsset));
      onChange(mergeDocumentAssets(assets, nextAssets));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Image upload failed.");
    }
  }

  return (
    <section className={styles.assetPanel} aria-label="Image assets">
      <label className={styles.field}>
        Image uploads
        <input
          aria-label="Image uploads"
          type="file"
          accept={ACCEPTED_IMAGE_MIME_TYPES}
          multiple
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </label>
      {error ? (
        <p className={styles.assetError} role="alert">
          {error}
        </p>
      ) : null}
      <ul className={styles.assetList}>
        {assets.map((asset) => (
          <li key={asset.name}>
            <span>{asset.name}</span>
            <button
              className={styles.assetRemoveButton}
              type="button"
              aria-label={`Remove ${asset.name}`}
              onClick={() => onChange(removeDocumentAssetByName(assets, asset.name))}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
