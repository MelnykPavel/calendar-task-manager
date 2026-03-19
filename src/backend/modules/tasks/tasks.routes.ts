import { Hono } from 'hono';

import {
  createTaskController,
  deleteTaskController,
  listTasksController,
  moveTaskController,
  updateTaskController,
} from './tasks.controller';

export function tasksRoutes() {
  const router = new Hono();

  router.get('/', listTasksController);
  router.post('/', createTaskController);

  router.patch('/:id/move', moveTaskController);

  router.patch('/:id', updateTaskController);
  router.delete('/:id', deleteTaskController);

  return router;
}
