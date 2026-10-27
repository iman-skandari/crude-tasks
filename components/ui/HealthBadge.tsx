"use client";

import { useEffect, useState } from "react";
import { fetchHealth } from "@/lib/services";

type Health = "checking" | "up" | "down";

export function HealthBadge() {
  const [health, setHealth] = useState<Health>("checking");

  useEffect(() => {
    let active = true;

    const check = async () => {
      const ok = await fetchHealth();
      if (active) setHealth(ok ? "up" : "down");
    };

    check();
    const timer = setInterval(check, 30000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const config = {
    checking: { label: "بررسی سرویس...", dot: "bg-amber-500" },
    up: { label: "سرویس فعال", dot: "bg-emerald-500" },
    down: { label: "سرویس در دسترس نیست", dot: "bg-rose-500" },
  }[health];

  return (
    <span
      role="status"
      className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs sm:inline-flex"
    >
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}