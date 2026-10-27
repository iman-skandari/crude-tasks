"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConnectionBadge } from "@/components/ui/ConnectionBadge";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { CalculatorOperation } from "@/types";

const LIMIT = 1_000_000_000_000;
const MAX_COUNT = 100;

const OPERATIONS: { value: CalculatorOperation; label: string }[] = [
  { value: "add", label: "جمع" },
  { value: "subtract", label: "تفریق" },
  { value: "multiply", label: "ضرب" },
  { value: "divide", label: "تقسیم" },
];

type Reply =
  | { kind: "result"; value: number }
  | { kind: "error"; message: string }
  | { kind: "unknown" };

function parseReply(data: string): Reply {
  try {
    const payload = JSON.parse(data);
    if (typeof payload?.result === "number") return { kind: "result", value: payload.result };
    if (typeof payload?.error === "string") return { kind: "error", message: payload.error };
  } catch {
    return { kind: "unknown" };
  }
  return { kind: "unknown" };
}

function translateServerError(message: string): string {
  if (message === "Invalid calculator request") {
    return "درخواست نامعتبر است. عملیات و اعداد را بررسی کنید.";
  }
  if (message === "Unauthorized") {
    return "احراز هویت وب‌سوکت ناموفق بود. دوباره وارد شوید.";
  }
  return message;
}

function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/٫/g, ".");
}

function parseNumbers(
  raw: string,
  operation: CalculatorOperation
): { numbers: number[]; error: string | null } {
  const tokens = normalizeDigits(raw)
    .split(/[\s,،;]+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    return { numbers: [], error: "حداقل یک عدد وارد کنید." };
  }
  if (tokens.length > MAX_COUNT) {
    return { numbers: [], error: `حداکثر ${MAX_COUNT} عدد مجاز است.` };
  }

  const numbers = tokens.map(Number);
  if (numbers.some((n) => !Number.isFinite(n))) {
    return { numbers: [], error: "همه‌ی ورودی‌ها باید عدد معتبر باشند." };
  }
  if (numbers.some((n) => Math.abs(n) > LIMIT)) {
    return { numbers: [], error: "قدر مطلق هر عدد نباید بیشتر از ۱٬۰۰۰٬۰۰۰٬۰۰۰٬۰۰۰ باشد." };
  }
  if (operation === "divide" && numbers.slice(1).some((n) => n === 0)) {
    return { numbers: [], error: "تقسیم بر صفر مجاز نیست." };
  }

  return { numbers, error: null };
}

interface CalculatorProps {
  token: string;
}

export function Calculator({ token }: CalculatorProps) {
  const [operation, setOperation] = useState<CalculatorOperation>("add");
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleMessage = useCallback((data: string) => {
    setPending(false);
    const reply = parseReply(data);
    if (reply.kind === "result") {
      setResult(reply.value);
      setError(null);
    } else if (reply.kind === "error") {
      setResult(null);
      setError(translateServerError(reply.message));
    } else {
      setResult(null);
      setError("پاسخ نامعتبر از سرور دریافت شد.");
    }
  }, []);

  const handleError = useCallback((message: string) => {
    setPending(false);
    setError(message);
  }, []);

  const handleClose = useCallback(() => setPending(false), []);

  const { status, ready, connect, disconnect, send } = useWebSocket({
    path: "/ws/calculator",
    token,
    onMessage: handleMessage,
    onError: handleError,
    onClose: handleClose,
  });

  useEffect(() => {
    connect();
  }, [connect]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    const parsed = parseNumbers(raw, operation);
    if (parsed.error) {
      setError(parsed.error);
      return;
    }

    const sent = send(JSON.stringify({ operation, numbers: parsed.numbers }));
    if (!sent) {
      setError("اتصال برقرار نیست. ابتدا دوباره متصل شوید.");
      return;
    }
    setPending(true);
  };

  return (
    <Card
      id="calculator-heading"
      title="ماشین‌حساب"
      aside={<ConnectionBadge status={status} ready={ready} />}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-3">
        <Select
          id="calc-operation"
          label="عملیات"
          value={operation}
          onChange={(event) => setOperation(event.target.value as CalculatorOperation)}
        >
          {OPERATIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>

        <Field
          id="calc-numbers"
          label="اعداد (با فاصله یا کاما جدا کنید)"
          dir="ltr"
          autoComplete="off"
          placeholder="10, 20, 30"
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={!ready || pending}>
            {pending ? "در حال محاسبه..." : "محاسبه"}
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
        </div>
      </form>

      <div className="mt-4 space-y-2" aria-live="polite">
        {error ? <Alert kind="error">{error}</Alert> : null}
        {result !== null ? (
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            نتیجه:{" "}
            <span dir="ltr" className="font-mono font-semibold">
              {result.toLocaleString("en-US", { maximumFractionDigits: 12 })}
            </span>
          </p>
        ) : null}
      </div>
    </Card>
  );
}