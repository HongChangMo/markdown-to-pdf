import { existsSync } from "node:fs";
import serverlessChromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import type { LaunchOptions } from "puppeteer-core";
import { pageSizeToPdfFormat } from "@/lib/document/style";
import type { DocumentState } from "@/lib/document/types";
import { EXPORT_STORAGE_KEY } from "./storage";

type RenderDocumentToPdfOptions = {
  timeoutMs?: number;
};

const DEFAULT_EXPORT_TIMEOUT_MS = 45_000;

function resolveLocalChromiumExecutablePath(): string {
  const localChromiumCandidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter((path): path is string => Boolean(path));

  const executablePath = localChromiumCandidates.find((path) => existsSync(path));

  if (!executablePath) {
    throw new Error(
      "Local Chromium executable was not found. Set PUPPETEER_EXECUTABLE_PATH or install Chrome.",
    );
  }

  return executablePath;
}

async function createChromiumLaunchOptions(): Promise<LaunchOptions> {
  if (process.env.VERCEL) {
    return {
      args: serverlessChromium.args,
      executablePath: await serverlessChromium.executablePath(),
      headless: true,
    };
  }

  return {
    executablePath: resolveLocalChromiumExecutablePath(),
    headless: true,
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("PDF export timed out.")), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });
}

export async function renderDocumentToPdf(
  document: DocumentState,
  origin: string,
  options: RenderDocumentToPdfOptions = {},
): Promise<Buffer> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_EXPORT_TIMEOUT_MS;
  const browser = await puppeteer.launch(await createChromiumLaunchOptions());

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(timeoutMs);
    page.setDefaultNavigationTimeout(timeoutMs);
    await page.evaluateOnNewDocument(
      ({ key, value }) => {
        window.localStorage.setItem(key, value);
      },
      { key: EXPORT_STORAGE_KEY, value: JSON.stringify(document) },
    );
    await page.goto(`${origin}/export`, { waitUntil: "networkidle0", timeout: timeoutMs });
    await page.waitForSelector("[data-export-ready='true']", { timeout: timeoutMs });

    const pdf = await withTimeout(
      page.pdf({
        format: pageSizeToPdfFormat(document.style.pageSize),
        printBackground: true,
        margin: {
          top: "0mm",
          right: "0mm",
          bottom: "0mm",
          left: "0mm",
        },
      }),
      timeoutMs,
    );
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
