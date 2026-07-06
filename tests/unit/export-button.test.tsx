import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExportButton } from "@/components/ExportButton";
import { DEFAULT_DOCUMENT_STATE } from "@/lib/document/defaults";

describe("ExportButton", () => {
  beforeEach(() => {
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows a clear message when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    render(<ExportButton document={DEFAULT_DOCUMENT_STATE} />);
    fireEvent.click(screen.getByRole("button", { name: "Export PDF" }));

    await expect(screen.findByRole("status")).resolves.toHaveTextContent("PDF export failed.");
  });

  it("disables the button while export is in progress", async () => {
    let resolveFetch: (value: Response) => void = () => undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          }),
      ),
    );

    render(<ExportButton document={DEFAULT_DOCUMENT_STATE} />);
    const button = screen.getByRole("button", { name: "Export PDF" });
    fireEvent.click(button);

    expect(button).toBeDisabled();

    resolveFetch(new Response(new Blob(["pdf"], { type: "application/pdf" })));
    await waitFor(() => expect(button).not.toBeDisabled());
  });
});
