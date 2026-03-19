import {
  fetchPublicHolidays,
  NagerError,
} from '../../integrations/nager/nager.client';
import { ApiError } from '../../utils/api-error';

export type HolidayDto = {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
};

async function fetchFromNager(
  country: string,
  year: number,
): Promise<HolidayDto[]> {
  const raw = await fetchPublicHolidays({ year, countryCode: country });
  return raw
    .map((h) => ({
      date: h.date,
      localName: h.localName,
      name: h.name,
      countryCode: h.countryCode,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getHolidaysService(input: {
  country: string;
  year: number;
}): Promise<HolidayDto[]> {
  try {
    return await fetchFromNager(input.country, input.year);
  } catch (err) {
    if (err instanceof NagerError) {
      if (err.kind === 'timeout') {
        throw new ApiError({
          code: 'UPSTREAM_TIMEOUT',
          message: 'Holidays provider timed out',
          status: 504,
          details: { provider: 'nager' },
          cause: err,
        });
      }

      throw new ApiError({
        code: 'UPSTREAM_ERROR',
        message: 'Holidays provider error',
        status: 502,
        details: { provider: 'nager', kind: err.kind, status: err.status },
        cause: err,
      });
    }

    throw err;
  }
}
