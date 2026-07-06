import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentPersistenceControls } from "@/components/DocumentPersistenceControls";
import { DEFAULT_DOCUMENT_STATE } from "@/lib/document/defaults";
import type { DocumentState } from "@/lib/document/types";

describe("DocumentPersistenceControls", () => {
  beforeEach(() => {
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:document"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("exports the current document as JSON", () => {
    render(
      <DocumentPersistenceControls
        document={DEFAULT_DOCUMENT_STATE}
        onImport={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Export document" }));

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  it("imports a valid document JSON file", async () => {
    const onImport = vi.fn();
    const importedDocument: DocumentState = {
      ...DEFAULT_DOCUMENT_STATE,
      title: "Imported",
      markdown: "# Imported",
    };

    render(
      <DocumentPersistenceControls
        document={DEFAULT_DOCUMENT_STATE}
        onImport={onImport}
        onReset={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Import document"), {
      target: {
        files: [new File([JSON.stringify(importedDocument)], "document.json", { type: "application/json" })],
      },
    });

    await waitFor(() => expect(onImport).toHaveBeenCalledWith(importedDocument));
    expect(screen.getByRole("status")).toHaveTextContent("Imported");
  });

  it("shows a clear message for invalid import files", async () => {
    render(
      <DocumentPersistenceControls
        document={DEFAULT_DOCUMENT_STATE}
        onImport={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Import document"), {
      target: {
        files: [new File(["bad json"], "document.json", { type: "application/json" })],
      },
    });

    await expect(screen.findByRole("alert")).resolves.toHaveTextContent("Document import failed.");
  });

  it("requires confirmation before reset", () => {
    const onReset = vi.fn();
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);

    render(
      <DocumentPersistenceControls
        document={DEFAULT_DOCUMENT_STATE}
        onImport={vi.fn()}
        onReset={onReset}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset document" }));

    expect(confirm).toHaveBeenCalledWith("Reset the document and clear the local draft?");
    expect(onReset).toHaveBeenCalled();
  });
});
