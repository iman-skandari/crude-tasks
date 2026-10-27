import { getToken } from "@/lib/token";

export class StreamError extends Error {
  status: number;

  constructor(status: number) {
    super(`Stream request failed with status ${status}`);
    this.status = status;
  }
}

export async function streamEcho(
  text: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const token = getToken();

  const response = await fetch("/api/echo/stream", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: text,
    signal,
  });

  if (!response.ok) throw new StreamError(response.status);

  if (!response.body) {
    onChunk(await response.text());
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }

  const tail = decoder.decode();
  if (tail) onChunk(tail);
}

export function getStreamErrorMessage(error: unknown): string {
  if (error instanceof StreamError) {
    if (error.status === 401) return "احراز هویت ناموفق بود. دوباره وارد شوید.";
    if (error.status === 422) return "ورودی نامعتبر است.";
    if (error.status === 503) return "سرویس موقتاً در دسترس نیست.";
    return `خطای سرور (کد ${error.status}).`;
  }
  if (error instanceof TypeError) {
    return "ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.";
  }
  return "خطای ناشناخته‌ای رخ داد.";
}