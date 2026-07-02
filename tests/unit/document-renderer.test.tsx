import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DocumentRenderer } from "@/components/DocumentRenderer";
import { DEFAULT_DOCUMENT_STATE } from "@/lib/document/defaults";

describe("DocumentRenderer", () => {
  it("renders Korean headings, tables, and code blocks", () => {
    render(<DocumentRenderer document={DEFAULT_DOCUMENT_STATE} />);

    expect(screen.getByRole("heading", { name: "개발 문서" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText(/type Feature = \{/)).toBeInTheDocument();
  });

  it("uses uploaded images for Markdown image references", () => {
    render(
      <DocumentRenderer
        document={{
          ...DEFAULT_DOCUMENT_STATE,
          markdown: "![Diagram](./diagram.png)",
          assets: [{ name: "diagram.png", dataUrl: "data:image/png;base64,abc" }],
        }}
      />,
    );

    expect(screen.getByRole("img", { name: "Diagram" })).toHaveAttribute(
      "src",
      "data:image/png;base64,abc",
    );
  });

  it("renders editor line breaks and repeated blank lines visibly", () => {
    render(
      <DocumentRenderer
        document={{
          ...DEFAULT_DOCUMENT_STATE,
          markdown: "A\n\n\nB<br>C  \nD",
        }}
      />,
    );

    const page = screen.getByTestId("document-page");
    expect(page.querySelectorAll("br")).toHaveLength(5);
    expect(page).toHaveTextContent("A");
    expect(page).toHaveTextContent("B");
    expect(page).toHaveTextContent("C");
    expect(page).toHaveTextContent("D");
  });

  it("keeps visible spacing before a heading after repeated blank lines", () => {
    render(
      <DocumentRenderer
        document={{
          ...DEFAULT_DOCUMENT_STATE,
          markdown: "현재 구조가 있다.\n\n\n\n### **문제점**",
        }}
      />,
    );

    const page = screen.getByTestId("document-page");
    expect(screen.getByRole("heading", { name: "문제점" })).toBeInTheDocument();
    expect(page.querySelectorAll("br")).toHaveLength(3);
  });

  it.each([
    [1, "# 큰 제목"],
    [2, "## 중간 제목"],
    [3, "### 코드"],
    [4, "#### **현재 구현된 코드**"],
    [5, "##### 세부 코드"],
    [6, "###### 마지막 제목"],
  ])("keeps visible spacing before heading level %i", (level, heading) => {
    render(
      <DocumentRenderer
        document={{
          ...DEFAULT_DOCUMENT_STATE,
          markdown: `본문\n\n\n${heading}`,
        }}
      />,
    );

    const page = screen.getByTestId("document-page");
    expect(screen.getByRole("heading", { level })).toBeInTheDocument();
    expect(page.querySelectorAll("br")).toHaveLength(2);
  });

  it("keeps visible spacing above and below a table", () => {
    render(
      <DocumentRenderer
        document={{
          ...DEFAULT_DOCUMENT_STATE,
          markdown: "표 상단 문장\n\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n\n표 하단 문장",
        }}
      />,
    );

    const page = screen.getByTestId("document-page");
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(page).toHaveTextContent("표 상단 문장");
    expect(page).toHaveTextContent("표 하단 문장");
    expect(page.querySelectorAll("tbody tr")).toHaveLength(1);

    const visibleSpacingParagraphs = Array.from(page.querySelectorAll("p"))
      .map((paragraph) => paragraph.textContent)
      .filter((text) => text?.includes("\u00a0"));
    expect(visibleSpacingParagraphs).toEqual([
      "표 상단 문장\n\u00a0\n\u00a0",
      "\u00a0",
      "\u00a0\n표 하단 문장",
    ]);
  });

  it("keeps visible spacing between a list item and the next heading", () => {
    render(
      <DocumentRenderer
        document={{
          ...DEFAULT_DOCUMENT_STATE,
          markdown:
            "- 기존 `POST` endpoint를 계속 유지하는 동안에는 동일 기능의 endpoint가 중복된다.\n\n\n\n### **3차 개선 방향 : 기존 endpoint를 deprecate하고 상태 변경 API를 역할에 맞게 재분류**",
        }}
      />,
    );

    const page = screen.getByTestId("document-page");
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "3차 개선 방향 : 기존 endpoint를 deprecate하고 상태 변경 API를 역할에 맞게 재분류",
    );

    const visibleSpacingParagraphs = Array.from(page.querySelectorAll("p"))
      .map((paragraph) => paragraph.textContent)
      .filter((text) => text?.includes("\u00a0"));
    expect(visibleSpacingParagraphs).toEqual(["\u00a0", "\u00a0", "\u00a0"]);
  });
});
