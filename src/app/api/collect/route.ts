import { NextRequest, NextResponse } from "next/server";

const BACKEND_TRACK_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost"}/api/${process.env.NEXT_PUBLIC_API_VERSION || "v1"}/track`;

// CORS headers — tracker is embedded on arbitrary third-party origins
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

/** Handle CORS preflight */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Proxy endpoint for the EYE tracker script.
 * The real backend URL never reaches the browser — the snippet only points to /api/collect.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const headers: HeadersInit = {
      "Content-Type": req.headers.get("content-type") || "application/json",
      Accept: "application/json",
      "X-Public-Key": process.env.NEXT_PUBLIC_APP_PUBLIC_KEY || "",
      "X-Secret-Key": process.env.NEXT_PUBLIC_APP_SECRET_KEY || "",
      // Forward real visitor IP to backend for geo-resolution
      "X-Forwarded-For": req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
      "X-Real-IP": req.headers.get("x-real-ip") || "",
      "User-Agent": req.headers.get("user-agent") || "",
    };

    await fetch(BACKEND_TRACK_URL, {
      method: "POST",
      headers,
      body,
    });

    // Always return 200 to the tracker (matches backend contract — silently drops on quota/error)
    return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
  } catch {
    // Never expose errors to the tracker client
    return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
  }
}

// Also proxy the opt-out endpoint
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.text();
    const optoutUrl = BACKEND_TRACK_URL.replace(/\/track$/, "/track/optout");

    await fetch(optoutUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Public-Key": process.env.NEXT_PUBLIC_APP_PUBLIC_KEY || "",
        "X-Secret-Key": process.env.NEXT_PUBLIC_APP_SECRET_KEY || "",
        "X-Forwarded-For": req.headers.get("x-forwarded-for") || "",
        "User-Agent": req.headers.get("user-agent") || "",
      },
      body,
    });
  } catch {}

  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}
