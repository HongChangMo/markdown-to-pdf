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
});
