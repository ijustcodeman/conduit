import { BadRequestException } from '@nestjs/common';
import { type ZodType, ZodError } from 'zod';

export function parseWithSchema<T>(schema: ZodType<T>, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(
        error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      );
    }

    throw error;
  }
}
