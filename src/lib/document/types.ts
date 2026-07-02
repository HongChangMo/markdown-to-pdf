export type PageSize = "A4" | "Letter";

export type DocumentAsset = {
  name: string;
  dataUrl: string;
};

export type DocumentStyle = {
  fontSizePx: number;
  lineHeight: number;
  pageSize: PageSize;
  marginMm: number;
  codeFontSizePx: number;
};

export type DocumentState = {
  title: string;
  markdown: string;
  style: DocumentStyle;
  assets: DocumentAsset[];
};
