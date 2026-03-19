import { z } from 'zod';

const daySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, 'Expected Mongo ObjectId');

const dotsSchema = z
  .array(
    z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Expected hex color e.g. #ff0000'),
  )
  .max(5)
  .default([]);

const timeMinutesSchema = z.number().int().min(0).max(1439);

const bucketSchema = z
  .string()
  .regex(
    /^allDay$|^hour:(?:[0-9]|1[0-9]|2[0-3])$/,
    'Expected bucket: allDay | hour:0..23',
  );

export const listTasksQuerySchema = z.object({
  from: daySchema,
  to: daySchema,
  search: z.string().trim().max(200).optional(),
}).refine((q) => q.from <= q.to, {
  message: '`from` must be <= `to`',
  path: ['from'],
});

export const createTaskBodySchema = z
  .object({
    day: daySchema,
    title: z.string().trim().min(1).max(500),
    dots: dotsSchema.optional(),
    allDay: z.boolean().default(true),
    timeMinutes: timeMinutesSchema,
  })
  .superRefine((v, ctx) => {
    if (v.allDay && v.timeMinutes !== 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'For all-day tasks, timeMinutes must be 0',
        path: ['timeMinutes'],
      });
    }
  });

export const updateTaskBodySchema = z
  .object({
    day: daySchema.optional(),
    title: z.string().trim().min(1).max(500).optional(),
    dots: dotsSchema.optional(),
    allDay: z.boolean().optional(),
    timeMinutes: timeMinutesSchema.optional(),
  })
  .superRefine((v, ctx) => {
    if (v.allDay === true && v.timeMinutes !== undefined && v.timeMinutes !== 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'For all-day tasks, timeMinutes must be 0',
        path: ['timeMinutes'],
      });
    }
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Empty patch is not allowed' });

export const taskIdParamSchema = z.object({
  id: objectIdSchema,
});

export const moveTaskBodySchema = z
  .object({
    toDay: daySchema,
    toBucket: bucketSchema,
    beforeId: objectIdSchema.optional().nullable(),
    afterId: objectIdSchema.optional().nullable(),
  })
  .superRefine((v, ctx) => {
    if (v.beforeId && v.afterId && v.beforeId === v.afterId) {
      ctx.addIssue({
        code: 'custom',
        message: 'beforeId and afterId must be different',
        path: ['afterId'],
      });
    }
  });
