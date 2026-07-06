import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  outputFileTracingIncludes: {
    "/api/export": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
      "./node_modules/playwright-core/browsers.json",
    ],
  },
};

export default nextConfig;
