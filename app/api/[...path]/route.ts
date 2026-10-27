import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TARGET = process.env.API_PROXY_TARGET ?? "https://ts.idicorp.ir";

const SKIPPED_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "accept-encoding",
  "origin",
  "referer",
  "transfer-encoding",
]);

const SKIPPED_RESPONSE_HEADERS = new Set([
  "set-cookie",
  "connection",
  "content-length",
  "content-encoding",
  "transfer-encoding",
]);

function rewriteCookie(cookie: string, secureContext: boolean): string {
  const parts = cookie
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .filter((part) => !/^domain=/i.test(part))
    .filter((part) => secureContext || !/^secure$/i.test(part))
    .map((part) => (/^samesite=none$/i.test(part) && !secureContext ? "SameSite=Lax" : part));
  return parts.join("; ");
}

async function handler(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const url = `${TARGET}/api/${path.join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!SKIPPED_REQUEST_HEADERS.has(key.toLowerCase())) headers.set(key, value);
  });

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "manual",
    cache: "no-store",
  };

  if (hasBody) {
    init.body = request.body;
    init.duplex = "half";
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, init);
  } catch {
    return Response.json({ detail: "Upstream service unreachable" }, { status: 502 });
  }

  const secureContext = request.nextUrl.protocol === "https:";
  const responseHeaders = new Headers();

  upstream.headers.forEach((value, key) => {
    if (!SKIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) responseHeaders.set(key, value);
  });

  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", rewriteCookie(cookie, secureContext));
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;