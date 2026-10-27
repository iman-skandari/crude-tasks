"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextareaField } from "@/components/ui/TextareaField";
import { useAuthStore } from "@/lib/auth-store";
import { getStreamErrorMessage, StreamError, streamEcho } from "@/lib/stream";

export function StreamEcho() {
  const signOut = useAuthStore((s) => s.signOut);
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!text || streaming) return;

    const controller = new AbortController();
    controllerRef.current = controller;
    setOutput("");
    setError(null);
    setStreaming(true);

    try {
      await streamEcho(
        text,
        (chunk) => setOutput((prev) => prev + chunk),
        controller.signal
      );
    } catch (err) {
      if (controller.signal.aborted) return;
      if (err instanceof StreamError && err.status === 401) signOut();
      setError(getStreamErrorMessage(err));
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setStreaming(false);
      }
    }
  };

  const onStop = () => controllerRef.current?.abort();

  return (
    <Card
      id="stream-heading"
      title="اکوی استریم"
      aside={
        streaming ? (
          <span role="status" className="text-xs text-slate-600">
            در حال دریافت...
          </span>
        ) : null
      }
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <TextareaField
          id="stream-text"
          label="متن برای ارسال"
          rows={4}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={streaming || text.length === 0}>
            ارسال
          </Button>
          <Button variant="secondary" onClick={onStop} disabled={!streaming}>
            توقف
          </Button>
        </div>
      </form>

      {error ? (
        <div className="mt-3">
          <Alert kind="error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      ) : null}

      <div className="mt-4">
        <p className="mb-1 text-sm font-medium text-slate-700">خروجی</p>
        <pre
          aria-label="خروجی استریم"
          className="min-h-20 max-h-60 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
        >
          {output}
        </pre>
      </div>
    </Card>
  );
}