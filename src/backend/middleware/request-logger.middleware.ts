import type { MiddlewareHandler } from 'hono';

function nowMs() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function createRequestId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

export function requestLoggerMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const requestId = c.req.header('x-request-id') ?? createRequestId();
    c.set('requestId', requestId);
    c.header('x-request-id', requestId);

    const start = nowMs();
    try {
      await next();
    } finally {
      const ms = Math.round((nowMs() - start) * 10) / 10;
      const method = c.req.method;
      const path = c.req.path;
      const status = c.res.status;
      const msg = `${method} ${path} ${status} ${ms}ms (rid=${requestId})`;

      if (status >= 500) console.error(msg);
      else if (status >= 400) console.warn(msg);
      else console.info(msg);
    }
  };
}
