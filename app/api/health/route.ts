export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TARGET = process.env.API_PROXY_TARGET ?? "https://ts.idicorp.ir";

export async function GET() {
  try {
    const response = await fetch(`${TARGET}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    return Response.json({ ok: response.ok }, { status: response.ok ? 200 : 502 });
  } catch {
    return Response.json({ ok: false }, { status: 502 });
  }
}