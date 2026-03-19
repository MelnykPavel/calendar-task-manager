import type { MoveTaskBody, TaskDto, UpdateTaskBody } from './tasks.types';
import type { Task, CreateTaskBody, ListTasksQuery } from './tasks.types';
import {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  moveTask,
  updateTask,
} from './tasks.repository';

function toDto(t: Task): TaskDto {
  return {
    id: t.id,
    day: t.day,
    bucket: t.bucket,
    title: t.title,
    order: t.order,
    dots: t.dots,
    allDay: t.allDay,
    timeMinutes: t.timeMinutes,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export async function listTasksService(input: ListTasksQuery): Promise<TaskDto[]> {
  const tasks = await listTasks(input);
  return tasks.map(toDto);
}

export async function createTaskService(input: CreateTaskBody): Promise<TaskDto> {
  const task = await createTask(input);
  return toDto(task);
}

export async function getTaskByIdService(id: string): Promise<TaskDto | null> {
  const task = await getTaskById(id);
  return task ? toDto(task) : null;
}

export async function updateTaskService(
  id: string,
  patch: UpdateTaskBody,
): Promise<TaskDto | null> {
  const updated = await updateTask(id, patch);
  return updated ? toDto(updated) : null;
}

export async function deleteTaskService(id: string): Promise<boolean> {
  return deleteTask(id);
}

export async function moveTaskService(
  id: string,
  body: MoveTaskBody,
): Promise<TaskDto | null> {
  const moved = await moveTask(id, body);
  return moved ? toDto(moved) : null;
}
