import { API_ROUTES } from "@/src/lib/api/routes";
import { apiFetch } from "@/src/lib/api/http";
import type { CreateTaskBody, MoveTaskBody, Task, UpdateTaskBody } from "@/src/types/task";

export async function listTasks(input: { from: string; to: string; search?: string }, signal?: AbortSignal) {
  const url = new URL(API_ROUTES.tasks, window.location.origin);
  url.searchParams.set("from", input.from);
  url.searchParams.set("to", input.to);
  if (input.search?.trim()) url.searchParams.set("search", input.search.trim());
  return apiFetch<Task[]>(url, { method: "GET", signal, timeoutMs: 15_000 });
}

export async function createTask(body: CreateTaskBody) {
  return apiFetch<Task>(API_ROUTES.tasks, {
    method: "POST",
    body: JSON.stringify(body),
    timeoutMs: 15_000,
  });
}

export async function updateTask(id: string, patch: UpdateTaskBody) {
  return apiFetch<Task>(`${API_ROUTES.tasks}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
    timeoutMs: 15_000,
  });
}

export async function deleteTask(id: string) {
  return apiFetch<null>(`${API_ROUTES.tasks}/${id}`, {
    method: "DELETE",
    timeoutMs: 15_000,
  });
}

export async function moveTask(id: string, body: MoveTaskBody) {
  return apiFetch<Task>(`${API_ROUTES.tasks}/${id}/move`, {
    method: "PATCH",
    body: JSON.stringify(body),
    timeoutMs: 20_000,
  });
}
