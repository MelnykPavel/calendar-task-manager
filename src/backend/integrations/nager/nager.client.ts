export type NagerPublicHoliday = {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
};

export type NagerErrorKind = 'timeout' | 'http' | 'network' | 'aborted' | 'invalid_json';

export class NagerError extends Error {
  readonly kind: NagerErrorKind;
  readonly status?: number;
  readonly body?: string;
  readonly cause?: unknown;

  constructor(input: {
    kind: NagerErrorKind;
    message: string;
    status?: number;
    body?: string;
    cause?: unknown;
  }) {
    super(input.message);
    this.name = 'NagerError';
    this.kind = input.kind;
    this.status = input.status;
    this.body = input.body;
    this.cause = input.cause;
  }
}

export type FetchPublicHolidaysInput = {
  year: number;
  countryCode: string; // ISO 3166-1 alpha-2
  signal?: AbortSignal;
  timeoutMs?: number;
};

export async function fetchPublicHolidays(input: FetchPublicHolidaysInput): Promise<NagerPublicHoliday[]> {
  const cc = input.countryCode.toUpperCase();
  const url = `https://date.nager.at/api/v3/PublicHolidays/${input.year}/${cc}`;

  const controller = new AbortController();
  const timeoutMs = input.timeoutMs ?? 8000;
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const forwardAbort = () => controller.abort();
  if (input.signal) {
    if (input.signal.aborted) {
      clearTimeout(timeoutId);
      throw new NagerError({
        kind: 'aborted',
        message: 'Nager request aborted',
        cause: input.signal.reason,
      });
    }
    input.signal.addEventListener('abort', forwardAbort, { once: true });
  }

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        'user-agent': 'calendar-task-manager/1.0',
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const body = text ? text.slice(0, 1000) : undefined;
      throw new NagerError({
        kind: 'http',
        message: `Nager API error (${res.status})`,
        status: res.status,
        body,
      });
    }

    try {
      const data = (await res.json()) as NagerPublicHoliday[];
      return data;
    } catch (err) {
      throw new NagerError({
        kind: 'invalid_json',
        message: 'Invalid JSON from Nager API',
        cause: err,
      });
    }
  } catch (err) {
    if (err instanceof NagerError) throw err;

    if (err instanceof Error && err.name === 'AbortError') {
      throw new NagerError({
        kind: timedOut ? 'timeout' : 'aborted',
        message: timedOut ? 'Nager request timed out' : 'Nager request aborted',
        cause: err,
      });
    }

    throw new NagerError({ kind: 'network', message: 'Nager network error', cause: err });
  } finally {
    clearTimeout(timeoutId);
    if (input.signal) input.signal.removeEventListener('abort', forwardAbort);
  }
}
