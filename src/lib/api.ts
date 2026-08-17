import { NextResponse, type NextRequest } from "next/server";
import { db } from "./db";
import { checkRateLimit, rateLimitStore } from "./rate-limit";

const WINDOW_MS = 60_000;
const DEFAULT_RPM = 100;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, X-Api-Key",
};

/**
 * Rate-limit a public API request by API key (`X-Api-Key` header or
 * `Bearer` token) or, for anonymous callers, by IP. Returns either
 * `{ blocked }` — a ready 429 — or the headers to attach to the response.
 */
export async function applyRateLimit(
  request: NextRequest
): Promise<
  | { blocked: NextResponse; headers?: undefined }
  | { blocked?: undefined; headers: Record<string, string> }
> {
  const apiKey =
    request.headers.get("x-api-key") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    null;

  let key: string;
  let limit = DEFAULT_RPM;
  if (apiKey) {
    const record = await db.apiKey.findUnique({ where: { key: apiKey } });
    if (!record) {
      return {
        blocked: NextResponse.json(
          { error: "invalid_api_key" },
          { status: 401, headers: CORS_HEADERS }
        ),
      };
    }
    key = `key:${record.id}`;
    limit = record.rpm;
  } else {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "anonymous";
    key = `ip:${ip}`;
  }

  const result = checkRateLimit(rateLimitStore, key, limit, WINDOW_MS);
  const headers = {
    ...CORS_HEADERS,
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };
  if (!result.allowed) {
    return {
      blocked: NextResponse.json(
        { error: "rate_limited", retryAfter: result.reset },
        { status: 429, headers }
      ),
    };
  }
  return { headers };
}

export function corsPreflight() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
