import { NextRequest, NextResponse } from "next/server";
import { parseDocumentState } from "@/lib/document/validation";
import { createExportErrorResponse } from "@/lib/export/errors";
import { buildPdfContentDisposition } from "@/lib/export/filename";
import { resolveExportOrigin } from "@/lib/export/origin";
import { renderDocumentToPdf } from "@/lib/export/pdf";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const document = parseDocumentState(await request.json());
    const pdf = await renderDocumentToPdf(document, resolveExportOrigin(request.nextUrl.origin));

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": buildPdfContentDisposition(document.title),
      },
    });
  } catch (reason) {
    const { message, status } = createExportErrorResponse(reason);
    return NextResponse.json({ message }, { status });
  }
}
