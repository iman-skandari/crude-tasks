"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getErrorMessage } from "@/lib/api";
import { fetchTasks } from "@/lib/services";
import type { Task } from "@/types";

export type StatusFilter = "all" | "active" | "done";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const debouncedSearch = useDebouncedValue(search, 300);
  const requestId = useRef(0);

  const load = useCallback(
    async (silent: boolean) => {
      const id = ++requestId.current;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const data = await fetchTasks({
          q: debouncedSearch.trim() || undefined,
          completed: status === "all" ? undefined : status === "done",
        });
        if (id === requestId.current) setTasks(data);
      } catch (err) {
        if (id === requestId.current) setError(getErrorMessage(err));
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [debouncedSearch, status]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const reload = useCallback(() => load(true), [load]);
  const retry = useCallback(() => load(false), [load]);

  return { tasks, loading, error, search, setSearch, status, setStatus, reload, retry };
}