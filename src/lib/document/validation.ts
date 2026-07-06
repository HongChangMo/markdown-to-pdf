import { z } from "zod";
import {
  getImageAssetMimeType,
  isSupportedImageMimeType,
  MAX_IMAGE_ASSET_COUNT,
  MAX_IMAGE_ASSET_DATA_URL_LENGTH,
} from "./assets";
import type { DocumentState } from "./types";

const documentAssetSchema = z.object({
  name: z.string().min(1).max(200),
  dataUrl: z
    .string()
    .startsWith("data:image/")
    .max(MAX_IMAGE_ASSET_DATA_URL_LENGTH)
    .refine((value) => isSupportedImageMimeType(getImageAssetMimeType(value)), {
      message: "Unsupported image type",
    }),
});

const documentStyleSchema = z.object({
  fontSizePx: z.number().min(10).max(24),
  lineHeight: z.number().min(1.1).max(2.4),
  pageSize: z.enum(["A4", "Letter"]),
  marginMm: z.number().min(8).max(32),
  codeFontSizePx: z.number().min(9).max(20),
});

const documentStateSchema = z.object({
  title: z.string().min(1).max(120),
  markdown: z.string().max(200_000),
  style: documentStyleSchema,
  assets: z.array(documentAssetSchema).max(MAX_IMAGE_ASSET_COUNT),
});

export function parseDocumentState(value: unknown): DocumentState {
  return documentStateSchema.parse(value);
}
