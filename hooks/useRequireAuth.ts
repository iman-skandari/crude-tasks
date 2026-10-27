"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

export function useRequireAuth() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const ready = useAuthStore((s) => s.ready);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    if (!ready) hydrate();
  }, [ready, hydrate]);

  useEffect(() => {
    if (ready && !token) router.replace("/login");
  }, [ready, token, router]);

  return { token, ready };
}