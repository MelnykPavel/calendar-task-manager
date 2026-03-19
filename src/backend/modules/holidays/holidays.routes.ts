import { Hono } from 'hono';

import { getHolidaysController } from './holidays.controller';

export function holidaysRoutes() {
  const router = new Hono();
  router.get('/', getHolidaysController);
  return router;
}
