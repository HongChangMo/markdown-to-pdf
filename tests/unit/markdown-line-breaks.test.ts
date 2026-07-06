import { describe, expect, it } from "vitest";
import { preserveMarkdownLineBreaks } from "@/lib/document/lineBreaks";

describe("preserveMarkdownLineBreaks", () => {
  it("turns single enters into hard line breaks", () => {
    expect(preserveMarkdownLineBreaks("A\nB")).toBe("A  \nB");
  });

  it("preserves repeated enters as visible blank lines", () => {
    expect(preserveMarkdownLineBreaks("A\n\n\nB")).toBe("A  \n&nbsp;  \n&nbsp;  \nB");
  });

  it("preserves blank space between a paragraph and the next heading", () => {
    expect(preserveMarkdownLineBreaks("현재 구조가 있다.\n\n\n\n### **문제점**")).toBe(
      "현재 구조가 있다.  \n&nbsp;  \n&nbsp;  \n&nbsp;  \n### **문제점**",
    );
  });

  it.each([
    "# 큰 제목",
    "## 중간 제목",
    "### 코드",
    "#### **현재 구현된 코드**",
    "##### 세부 코드",
    "###### 마지막 제목",
  ])("preserves blank space before heading syntax: %s", (heading) => {
    expect(preserveMarkdownLineBreaks(`본문\n\n\n${heading}`)).toBe(
      `본문  \n&nbsp;  \n&nbsp;  \n${heading}`,
    );
  });

  it.each([
    ["제목", "==="],
    ["부제목", "---"],
  ])("does not insert hard breaks inside setext heading syntax: %s", (title, underline) => {
    expect(preserveMarkdownLineBreaks(`${title}\n${underline}`)).toBe(`${title}\n${underline}`);
  });

  it("preserves blank space before setext headings", () => {
    expect(preserveMarkdownLineBreaks("본문\n\n\n제목\n===")).toBe(
      "본문  \n&nbsp;  \n&nbsp;  \n제목\n===",
    );
  });

  it("preserves blank space above and below tables", () => {
    const markdown = "표 상단 문장\n\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n\n표 하단 문장";

    expect(preserveMarkdownLineBreaks(markdown)).toBe(
      "표 상단 문장  \n&nbsp;  \n&nbsp;  \n| A | B |\n| - | - |\n| 1 | 2 |\n\n&nbsp;  \n\n&nbsp;  \n표 하단 문장",
    );
  });

  it("preserves blank space between a list item and the next heading", () => {
    const markdown =
      "- 기존 `POST` endpoint를 계속 유지하는 동안에는 동일 기능의 endpoint가 중복된다.\n\n\n\n### **3차 개선 방향 : 기존 endpoint를 deprecate하고 상태 변경 API를 역할에 맞게 재분류**";

    expect(preserveMarkdownLineBreaks(markdown)).toBe(
      "- 기존 `POST` endpoint를 계속 유지하는 동안에는 동일 기능의 endpoint가 중복된다.\n\n&nbsp;  \n\n&nbsp;  \n\n&nbsp;  \n### **3차 개선 방향 : 기존 endpoint를 deprecate하고 상태 변경 API를 역할에 맞게 재분류**",
    );
  });

  it("normalizes br tags into markdown hard breaks", () => {
    expect(preserveMarkdownLineBreaks("A<br>B<br />C<br/>D")).toBe("A  \nB  \nC  \nD");
  });

  it("drops raw HTML block lines without dropping following Markdown", () => {
    expect(
      preserveMarkdownLineBreaks("<script>alert('x')</script>\n\n<div>raw div</div>\n\n**안전한 Markdown**"),
    ).toBe("\n\n\n\n**안전한 Markdown**");
  });

  it("does not rewrite fenced code blocks", () => {
    const markdown = "A\n\n```ts\nconst x = 1;\nconst y = 2;\n```\n\nB";

    expect(preserveMarkdownLineBreaks(markdown)).toContain("```ts\nconst x = 1;\nconst y = 2;\n```");
  });

  it("does not rewrite table rows", () => {
    const markdown = "| A | B |\n| - | - |\n| 1 | 2 |";

    expect(preserveMarkdownLineBreaks(markdown)).toBe(markdown);
  });
});
