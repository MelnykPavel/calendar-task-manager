import type { ContentfulStatusCode } from 'hono/utils/http-status';

export class ApiError extends Error {
  readonly code: string;
  readonly status: ContentfulStatusCode;
  readonly details?: unknown;

  constructor(input: {
    code: string;
    message: string;
    status: ContentfulStatusCode;
    details?: unknown;
    cause?: unknown;
  }) {
    super(input.message);
    this.name = 'ApiError';
    this.code = input.code;
    this.status = input.status;
    this.details = input.details;
    if (input.cause !== undefined) {
      (this as { cause?: unknown }).cause = input.cause;
    }
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}
