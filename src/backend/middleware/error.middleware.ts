import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { z, ZodError } from 'zod';

import type { ApiErrorBody } from '../types/api.types';
import { ApiError } from '../utils/api-error';

function toErrorBody(
  err: unknown,
  requestId?: string,
): { status: ContentfulStatusCode; body: ApiErrorBody } {
  const isProd = process.env.NODE_ENV === 'production';

  if (err instanceof ApiError) {
    const body: ApiErrorBody = {
      ok: false,
      error: {
        code: err.code,
        message: err.message,
        requestId,
        details: err.details,
      },
    };
    if (!isProd && err.stack) body.error.stack = err.stack;
    return { status: err.status, body };
  }

  if (err instanceof HTTPException) {
    const code = err.status === 404 ? 'NOT_FOUND' : 'HTTP_EXCEPTION';
    const body: ApiErrorBody = {
      ok: false,
      error: {
        code,
        message: err.message,
        requestId,
      },
    };
    if (!isProd && err.stack) body.error.stack = err.stack;
    return { status: err.status, body };
  }

  if (err instanceof ZodError) {
    const body: ApiErrorBody = {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request',
        requestId,
        details: z.treeifyError(err),
      },
    };
    if (!isProd && err.stack) body.error.stack = err.stack;
    return { status: 400, body };
  }

  if (err instanceof SyntaxError) {
    const body: ApiErrorBody = {
      ok: false,
      error: {
        code: 'BAD_REQUEST',
        message: err.message,
        requestId,
      },
    };
    if (!isProd && err.stack) body.error.stack = err.stack;
    return { status: 400, body };
  }

  const message = err instanceof Error ? err.message : 'Internal error';
  const body: ApiErrorBody = {
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
      requestId,
    },
  };
  if (!isProd && err instanceof Error && err.stack)
    body.error.stack = err.stack;
  return { status: 500, body };
}

export function errorMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    try {
      await next();
    } catch (err) {
      const requestId = c.get('requestId') as string | undefined;
      const { status, body } = toErrorBody(err, requestId);
      return c.json(body, status);
    }
  };
}
