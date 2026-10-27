"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConnectionBadge } from "@/components/ui/ConnectionBadge";
import { Field } from "@/components/ui/Field";
import { useWebSocket } from "@/hooks/useWebSocket";

interface LogEntry {
  id: number;
  direction: "sent" | "received";
  text: string;
}
interface EchoProps {
  token: string;
}
const MAX_LOG = 50;

export function Echo({ token }: EchoProps) {
  const [text, setText] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const counter = useRef(0);

  const addEntry = useCallback((direction: LogEntry["direction"], value: string) => {
    counter.current += 1;
    const entry = { id: counter.current, direction, text: value };
    setLog((prev) => [...prev, entry].slice(-MAX_LOG));
  }, []);

  const handleMessage = useCallback(
    (data: string) => addEntry("received", data),
    [addEntry]
  );

  const handleError = useCallback((message: string) => setError(message), []);

    const { status, ready, connect, disconnect, send } = useWebSocket({
    path: "/ws/echo",
    token,
    sameOrigin: true,
    onMessage: handleMessage,
    onError: handleError,
  });

  useEffect(() => {
    connect();
  }, [connect]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!text) return;
    setError(null);

    if (!send(text)) {
      setError("اتصال برقرار نیست. ابتدا دوباره متصل شوید.");
      return;
    }
    addEntry("sent", text);
    setText("");
  };

  return (
    <Card
      id="echo-heading"
      title="اکوی متنی"
      aside={<ConnectionBadge status={status} ready={ready} />}
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <Field
          id="echo-text"
          label="پیام"
          autoComplete="off"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={!ready || text.length === 0}>
            ارسال
          </Button>
          {status === "disconnected" ? (
            <Button variant="secondary" onClick={connect}>
              اتصال مجدد
            </Button>
          ) : (
            <Button variant="secondary" onClick={disconnect}>
              قطع اتصال
            </Button>
          )}
          <Button variant="secondary" onClick={() => setLog([])} disabled={log.length === 0}>
            پاک کردن
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

      <ul
        role="log"
        aria-label="تاریخچه‌ی پیام‌ها"
        className="mt-4 max-h-60 space-y-2 overflow-y-auto"
      >
        {log.length === 0 ? (
          <li className="text-sm text-slate-500">هنوز پیامی رد و بدل نشده است.</li>
        ) : (
          log.map((entry) => (
            <li
              key={entry.id}
              className={`break-words rounded-lg px-3 py-2 text-sm ${
                entry.direction === "sent"
                  ? "bg-indigo-50 text-indigo-900"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              <span className="font-semibold">
                {entry.direction === "sent" ? "ارسال: " : "دریافت: "}
              </span>
              <span className="whitespace-pre-wrap">{entry.text}</span>
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}