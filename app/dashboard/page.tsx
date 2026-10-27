"use client";

import { TaskBoard } from "@/components/tasks/TaskBoard";
import { Button } from "@/components/ui/Button";
import { HealthBadge } from "@/components/ui/HealthBadge";
import { Calculator } from "@/components/widgets/Calculator";
import { Echo } from "@/components/widgets/Echo";
import { StreamEcho } from "@/components/widgets/StreamEcho";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/lib/auth-store";

export default function DashboardPage() {
  const { token, ready } = useRequireAuth();
  const signOut = useAuthStore((s) => s.signOut);

  if (!ready || !token) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p role="status" className="flex items-center gap-3 text-slate-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          در حال بررسی نشست...
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/25">
              ID
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold sm:text-lg">کنسول سرویس IDICorp</h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                مدیریت تسک‌ها و ابزارهای سرویس
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <HealthBadge />
            <Button variant="secondary" size="sm" onClick={signOut}>
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-3 lg:gap-8 lg:py-8">
        <section aria-labelledby="tasks-heading" className="min-w-0 space-y-4 lg:col-span-2">
          <h2 id="tasks-heading" className="text-xl font-bold">
            تسک‌ها
          </h2>
          <TaskBoard />
        </section>

        <section aria-labelledby="tools-heading" className="min-w-0 space-y-4">
          <h2 id="tools-heading" className="text-xl font-bold">
            ابزارهای سرویس
          </h2>
          <div className="space-y-6">
            <Calculator token={token} />
            <Echo token={token} />
            <StreamEcho />
          </div>
        </section>
      </main>
    </div>
  );
}