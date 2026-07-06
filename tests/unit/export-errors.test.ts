import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createExportErrorResponse } from "@/lib/export/errors";

describe("createExportErrorResponse", () => {
  it("maps title validation failures to a 400 user message", () => {
    const reason = new z.ZodError([
      {
        code: "too_small",
        minimum: 1,
        inclusive: true,
        origin: "string",
        path: ["title"],
        message: "Too small",
      },
    ]);

    expect(createExportErrorResponse(reason)).toEqual({
      status: 400,
      message: "Document title is required.",
    });
  });

  it("hides internal render failures behind a generic 500 message", () => {
    expect(createExportErrorResponse(new Error("browser crashed"))).toEqual({
      status: 500,
      message: "PDF export failed.",
    });
  });
});
