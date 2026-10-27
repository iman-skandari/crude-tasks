import { api } from "@/lib/api";
import type {
  CaptchaResponse,
  LoginPayload,
  LoginResponse,
  Task,
  TaskCreatePayload,
  TaskFilters,
  TaskPatchPayload,
  TaskReplacePayload,
} from "@/types";

export async function fetchCaptcha(): Promise<CaptchaResponse> {
  const { data } = await api.get<CaptchaResponse>("/api/auth/login", {
    params: { _: Date.now() },
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  return data;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/login", payload);
  return data;
}

export async function fetchTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const params: Record<string, string | boolean> = {};
  if (filters.q) params.q = filters.q;
  if (typeof filters.completed === "boolean") params.completed = filters.completed;
  const { data } = await api.get<Task[]>("/api/tasks", { params });
  return data;
}

export async function fetchTask(id: string): Promise<Task> {
  const { data } = await api.get<Task>(`/api/tasks/${id}`);
  return data;
}

export async function createTask(payload: TaskCreatePayload): Promise<Task> {
  const { data } = await api.post<Task>("/api/tasks", payload);
  return data;
}

export async function replaceTask(id: string, payload: TaskReplacePayload): Promise<Task> {
  const { data } = await api.put<Task>(`/api/tasks/${id}`, payload);
  return data;
}

export async function patchTask(id: string, payload: TaskPatchPayload): Promise<Task> {
  const { data } = await api.patch<Task>(`/api/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/api/tasks/${id}`);
}
export async function fetchHealth(): Promise<boolean> {
  try {
    await api.get("/api/health", { params: { _: Date.now() } });
    return true;
  } catch {
    return false;
  }
}