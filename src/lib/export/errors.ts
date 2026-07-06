import { ZodError } from "zod";

export type ExportErrorResponse = {
  status: 400 | 500;
  message: string;
};

export function createExportErrorResponse(reason: unknown): ExportErrorResponse {
  if (reason instanceof ZodError) {
    const firstIssue = reason.issues[0];
    if (firstIssue?.path[0] === "title") {
      return { status: 400, message: "Document title is required." };
    }

    if (firstIssue?.path[0] === "style") {
      return { status: 400, message: "Document style settings are invalid." };
    }

    return { status: 400, message: "Document input is invalid." };
  }

  return { status: 500, message: "PDF export failed." };
}
