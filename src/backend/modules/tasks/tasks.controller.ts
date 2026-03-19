import type { Context } from 'hono';

import type { MoveTaskBody, UpdateTaskBody } from './tasks.types';
import {
  createTaskService,
  deleteTaskService,
  listTasksService,
  moveTaskService,
  updateTaskService,
} from './tasks.service';
import {
  createTaskBodySchema,
  listTasksQuerySchema,
  moveTaskBodySchema,
  taskIdParamSchema,
  updateTaskBodySchema,
} from './tasks.validators';
import { ApiError } from '../../utils/api-error';

export async function listTasksController(c: Context) {
  const query = listTasksQuerySchema.parse(c.req.query());
  const data = await listTasksService(query);
  return c.json({ ok: true, data });
}

export async function createTaskController(c: Context) {
  const body = createTaskBodySchema.parse(await c.req.json());
  const data = await createTaskService(body);
  return c.json({ ok: true, data }, 201);
}

export async function updateTaskController(c: Context) {
  const { id } = taskIdParamSchema.parse(c.req.param());
  const patch: UpdateTaskBody = updateTaskBodySchema.parse(await c.req.json());

  const data = await updateTaskService(id, patch);
  if (!data) {
    throw new ApiError({ code: 'TASK_NOT_FOUND', message: 'Task not found', status: 404 });
  }
  return c.json({ ok: true, data });
}

export async function deleteTaskController(c: Context) {
  const { id } = taskIdParamSchema.parse(c.req.param());
  const ok = await deleteTaskService(id);
  if (!ok) {
    throw new ApiError({ code: 'TASK_NOT_FOUND', message: 'Task not found', status: 404 });
  }
  return c.json({ ok: true, data: null });
}

export async function moveTaskController(c: Context) {
  const { id } = taskIdParamSchema.parse(c.req.param());
  const body: MoveTaskBody = moveTaskBodySchema.parse(await c.req.json());

  const data = await moveTaskService(id, body);
  if (!data) {
    throw new ApiError({ code: 'TASK_NOT_FOUND', message: 'Task not found', status: 404 });
  }
  return c.json({ ok: true, data });
}
