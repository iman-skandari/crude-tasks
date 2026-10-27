import type { WsStatus } from "@/hooks/useWebSocket";

interface ConnectionBadgeProps {
  status: WsStatus;
  ready: boolean;
}

export function ConnectionBadge({ status, ready }: ConnectionBadgeProps) {
  const connected = status === "connected";

  const label =
    status === "connecting"
      ? "در حال اتصال..."
      : connected
        ? ready
          ? "متصل (آماده)"
          : "متصل (در انتظار تأیید)"
        : "قطع شده";

  const tone =
    status === "connecting" || (connected && !ready)
      ? { dot: "bg-amber-500", ring: "bg-amber-400", box: "border-amber-200 bg-amber-50 text-amber-800" }
      : connected
        ? { dot: "bg-emerald-500", ring: "bg-emerald-400", box: "border-emerald-200 bg-emerald-50 text-emerald-800" }
        : { dot: "bg-rose-500", ring: "bg-rose-400", box: "border-rose-200 bg-rose-50 text-rose-800" };

  const pulsing = status === "connecting" || (connected && ready);

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${tone.box}`}
    >
      <span aria-hidden="true" className="relative flex h-2 w-2">
        {pulsing ? (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${tone.ring}`} />
        ) : null}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${tone.dot}`} />
      </span>
      {label}
    </span>
  );
}