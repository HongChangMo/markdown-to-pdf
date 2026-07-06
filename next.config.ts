import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  outputFileTracingIncludes: {
    "/api/export": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
      "./node_modules/puppeteer-core/lib/**/*",
    ],
  },
};

export default nextConfig;
