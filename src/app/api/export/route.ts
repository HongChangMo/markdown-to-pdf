import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { parseDocumentState } from "@/lib/document/validation";
import { buildPdfContentDisposition } from "@/lib/export/filename";
import { renderDocumentToPdf } from "@/lib/export/pdf";

export const runtime = "nodejs";

function getOrigin(request: NextRequest): string {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedHost) {
    return `${forwardedProto ?? "http"}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

function getExportErrorMessage(reason: unknown): string {
  if (reason instanceof ZodError) {
    const firstIssue = reason.issues[0];
    if (firstIssue?.path[0] === "title") {
      return "Document title is required.";
    }

    if (firstIssue?.path[0] === "style") {
      return "Document style settings are invalid.";
    }

    return "Document input is invalid.";
  }

  return reason instanceof Error ? reason.message : "PDF export failed";
}

export async function POST(request: NextRequest) {
  try {
    const document = parseDocumentState(await request.json());
    const pdf = await renderDocumentToPdf(document, getOrigin(request));

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": buildPdfContentDisposition(document.title),
      },
    });
  } catch (reason) {
    const message = getExportErrorMessage(reason);
    return NextResponse.json({ message }, { status: 400 });
  }
}
