import { Hono } from 'hono';

import { pingMongo } from './db/client';
import { errorMiddleware } from './middleware/error.middleware';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware';
import { holidaysRoutes } from './modules/holidays/holidays.routes';
import { tasksRoutes } from './modules/tasks/tasks.routes';

const app = new Hono().basePath('/api');

app.use('*', requestLoggerMiddleware());
app.use('*', errorMiddleware());

app.get('/db/ping', async (c) => {
  await pingMongo();
  return c.json({ ok: true, data: { mongo: true } });
});

app.route('/tasks', tasksRoutes());
app.route('/holidays', holidaysRoutes());

export default app;
