import type { DocumentState, DocumentStyle } from "./types";

export const DEFAULT_DOCUMENT_STYLE: DocumentStyle = {
  fontSizePx: 14,
  lineHeight: 1.6,
  pageSize: "A4",
  marginMm: 16,
  codeFontSizePx: 13,
};

export const DEFAULT_MARKDOWN = `# 개발 문서

이 문서는 Markdown PDF 미리보기를 검증하기 위한 샘플입니다.

## 기능 목록

- 실시간 미리보기
- PDF 스타일 조정
- 코드블록 렌더링

| 항목 | 상태 |
| --- | --- |
| Markdown | 지원 |
| PDF Export | 준비 중 |

\`\`\`ts
type Feature = {
  title: string;
  done: boolean;
};
\`\`\`
`;

export const DEFAULT_DOCUMENT_STATE: DocumentState = {
  title: "Development Document",
  markdown: DEFAULT_MARKDOWN,
  style: DEFAULT_DOCUMENT_STYLE,
  assets: [],
};
