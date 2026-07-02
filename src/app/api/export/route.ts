import { NextRequest, NextResponse } from "next/server";
import { parseDocumentState } from "@/lib/document/validation";
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

function safePdfFilename(title: string): string {
  const cleaned = title.replace(/[\\/:*?"<>|]/g, "").trim();
  return `${cleaned || "document"}.pdf`;
}

export async function POST(request: NextRequest) {
  try {
    const document = parseDocumentState(await request.json());
    const pdf = await renderDocumentToPdf(document, getOrigin(request));

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${safePdfFilename(document.title)}"`,
      },
    });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "PDF export failed";
    return NextResponse.json({ message }, { status: 400 });
  }
}
