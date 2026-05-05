import { createHash } from "crypto";
import { mkdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_DIR = path.join("/tmp", "eye-heatmap-screenshots");
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const CHROMIUM_PATH_CANDIDATES = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean) as string[];

async function resolveChromiumExecutable() {
  for (const filePath of CHROMIUM_PATH_CANDIDATES) {
    try {
      await stat(filePath);
      return filePath;
    } catch {
      // Try the next candidate.
    }
  }

  return undefined;
}

function screenshotHeaders() {
  return {
    "Content-Type": "image/png",
    "Cache-Control": "private, max-age=300, stale-while-revalidate=3600",
  };
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const xInternalHeader = req.headers.get("x-internal-request") || "";

  // Allow requests from internal services (Laravel backend)
  const isInternalRequest = xInternalHeader === "true" ||
                            req.headers.get("x-eye-internal") === "true";

  if (!authHeader.startsWith("Bearer ") && !isInternalRequest) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const targetUrl = String(searchParams.get("url") || "").trim();

  if (!targetUrl) {
    return NextResponse.json({ error: "url is required." }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: "Invalid page URL." }, { status: 400 });
  }

  if (!/^https?:$/.test(parsedUrl.protocol)) {
    return NextResponse.json({ error: "Only http and https pages can be captured." }, { status: 400 });
  }

  try {
    await mkdir(CACHE_DIR, { recursive: true });
    const cacheKey = createHash("sha1").update(targetUrl).digest("hex");
    const cacheFile = path.join(CACHE_DIR, `${cacheKey}.png`);

    try {
      const fileInfo = await stat(cacheFile);
      if (Date.now() - fileInfo.mtimeMs < CACHE_TTL_MS) {
        const cached = await readFile(cacheFile);
        return new NextResponse(cached, { status: 200, headers: screenshotHeaders() });
      }
    } catch {
      // Cache miss.
    }

    const executablePath = await resolveChromiumExecutable();
    const browser = await chromium.launch({
      headless: true,
      executablePath,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });

    try {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      });

      await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => undefined);

      const screenshot = await page.screenshot({
        type: "png",
        fullPage: false,
      });

      await writeFile(cacheFile, screenshot);

      return new NextResponse(new Uint8Array(screenshot), {
        status: 200,
        headers: screenshotHeaders(),
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Screenshot capture failed.",
      },
      { status: 502 }
    );
  }
}
