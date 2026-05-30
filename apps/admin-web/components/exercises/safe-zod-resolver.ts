import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';

/**
 * Wraps zodResolver to catch thrown ZodError and return { errors } format.
 * Needed because zodResolver v4+ throws instead of setting formState.errors.
 */
export function safeZodResolver(schema: ZodSchema) {
  const resolver = zodResolver(schema);
  return async (values: any, context: any, options: any) => {
    try {
      return await resolver(values, context, options);
    } catch (err: any) {
      if (err?.issues && Array.isArray(err.issues)) {
        const fieldErrors: Record<string, { type: string; message: string }> = {};
        for (const issue of err.issues) {
          const key = issue.path?.join('.') || '_root';
          fieldErrors[key] = { type: 'validation', message: issue.message };
        }
        return { values: {}, errors: fieldErrors };
      }
      throw err;
    }
  };
}
