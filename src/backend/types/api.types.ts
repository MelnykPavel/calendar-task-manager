export type ApiErrorBody = {
  ok: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
    stack?: string;
  };
};

export type ApiOk<T> = {
  ok: true;
  data: T;
};

export type ApiOkEmpty = {
  ok: true;
  data: null;
};
