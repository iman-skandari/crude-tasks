import type { ReactNode } from "react";

interface AlertProps {
  kind: "error" | "success" | "info";
  children: ReactNode;
  onDismiss?: () => void;
}

const styles = {
  error: "border-rose-200 border-s-rose-500 bg-rose-50 text-rose-800",
  success: "border-emerald-200 border-s-emerald-500 bg-emerald-50 text-emerald-800",
  info: "border-sky-200 border-s-sky-500 bg-sky-50 text-sky-800",
};

export function Alert({ kind, children, onDismiss }: AlertProps) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`flex items-start justify-between gap-3 rounded-xl border border-s-4 px-4 py-3 text-sm ${styles[kind]}`}
    >
      <div className="min-w-0 flex-1 leading-6">{children}</div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="بستن پیام"
          className="rounded-md px-1.5 text-lg leading-none opacity-70 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}