export type ApiOk<T> = { ok: true; data: T };

export type ApiError = {
  ok: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiOk<T> | ApiError;
