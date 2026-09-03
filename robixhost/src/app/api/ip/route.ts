import { NextResponse } from "next/server";

// Returns the visitor's IP for the cinematic intro's "SECURE CONNECTION
// ESTABLISHED" sequence, read from standard proxy headers on this single
// request. Nothing here is persisted (no database write, no logging to
// a file/table) and nothing is forwarded to analytics — see
// src/lib/constants.ts / privacy page for what GDPR-relevant text should
// say once legal has reviewed it.
export async function GET(request: Request) {
  const headers = request.headers;

  const forwardedFor = headers.get("x-forwarded-for");
  const candidate =
    forwardedFor?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("x-vercel-forwarded-for") ||
    null;

  return NextResponse.json(
    { ip: candidate },
    { headers: { "Cache-Control": "no-store" } }
  );
}
