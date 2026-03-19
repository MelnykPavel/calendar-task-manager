import type { Context } from 'hono';

import { getHolidaysService } from './holidays.service';
import { holidaysQuerySchema } from './holidays.validators';

export async function getHolidaysController(c: Context) {
  const query = holidaysQuerySchema.parse(c.req.query());
  const data = await getHolidaysService({
    country: query.country,
    year: query.year,
  });

  c.header('cache-control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  return c.json({ ok: true, data });
}
