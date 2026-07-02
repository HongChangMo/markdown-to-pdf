import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Markdown to PDF",
  description: "Edit Markdown, preview a document, and export it to PDF.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
