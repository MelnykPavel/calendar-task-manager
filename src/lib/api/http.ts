import type { ApiResponse } from "@/src/types/api";

export class HttpError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(input: { message: string; status: number; code?: string; details?: unknown }) {
    super(input.message);
    this.name = "HttpError";
    this.status = input.status;
    this.code = input.code;
    this.details = input.details;
  }
}

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit & { timeoutMs?: number }
): Promise<T> {
  const timeoutMs = init?.timeoutMs ?? 12_000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(input, {
      ...init,
      signal: init?.signal ?? controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    const body = (await parseJsonSafe(res)) as ApiResponse<T> | null;
    if (!res.ok) {
      if (body && typeof body === "object" && "ok" in body && body.ok === false) {
        throw new HttpError({
          status: res.status,
          message: body.error.message,
          code: body.error.code,
          details: body.error.details,
        });
      }
      throw new HttpError({ status: res.status, message: `Request failed (${res.status})` });
    }

    if (!body || typeof body !== "object" || !("ok" in body) || body.ok !== true) {
      throw new HttpError({ status: 500, message: "Unexpected API response" });
    }
    return body.data;
  } finally {
    clearTimeout(timeout);
  }
}
