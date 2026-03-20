import type { ApiResponse } from '@/src/types/api';

export class HttpError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(input: {
    message: string;
    status: number;
    code?: string;
    details?: unknown;
  }) {
    super(input.message);
    this.name = 'HttpError';
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

function needsJsonContentType(init: RequestInit): boolean {
  const method = init.method?.toUpperCase();
  if (!method || method === 'GET' || init.body == null) return false; // fix: == null вместо === undefined

  return (
    !(init.body instanceof FormData) &&
    !(init.body instanceof URLSearchParams) &&
    !(init.body instanceof Blob) &&
    !(init.body instanceof ArrayBuffer)
  );
}

export async function apiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const { timeoutMs = 12_000, signal: externalSignal, ...rest } = init ?? {};

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let signal: AbortSignal = controller.signal;

  if (externalSignal && typeof AbortSignal.any === 'function') {
    signal = AbortSignal.any([controller.signal, externalSignal]);
  }

  let onExternalAbort: (() => void) | undefined;
  if (externalSignal && typeof AbortSignal.any !== 'function') {
    onExternalAbort = () => controller.abort();
    externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }

  const headers = needsJsonContentType(rest)
    ? { 'Content-Type': 'application/json', ...rest.headers }
    : rest.headers;

  try {
    const res = await fetch(input, {
      ...rest,
      signal,
      headers,
    });

    const body = (await parseJsonSafe(res)) as ApiResponse<T> | null;

    if (!res.ok) {
      const apiError =
        body && typeof body === 'object' && 'ok' in body && body.ok === false
          ? body.error
          : null;

      throw new HttpError({
        status: res.status,
        message: apiError?.message ?? `Request failed (${res.status})`,
        code: apiError?.code,
        details: apiError?.details,
      });
    }

    if (!body || body.ok !== true) {
      throw new HttpError({
        status: 500,
        message: 'Unexpected API response',
      });
    }

    if (!('data' in body)) {
      throw new HttpError({
        status: 500,
        message: 'Missing data in API response',
      });
    }

    return body.data;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      const timedOut = controller.signal.aborted && !externalSignal?.aborted; // fix: явная проверка обоих сигналов
      throw new HttpError({
        status: 408,
        message: timedOut ? 'Request timed out' : 'Request was aborted',
        code: timedOut ? 'TIMEOUT' : 'ABORTED',
      });
    }
    throw err;
  } finally {
    clearTimeout(timeout);
    if (onExternalAbort) {
      externalSignal?.removeEventListener('abort', onExternalAbort);
    }
  }
}
