import { zodResolver } from '@hookform/resolvers/zod'
import type {
  FieldValues,
  ResolverOptions,
  ResolverResult,
} from 'react-hook-form'
import type { ZodSchema } from 'zod'

/**
 * Wraps zodResolver to catch thrown ZodError and return { errors } format.
 * Needed because zodResolver v4+ throws instead of setting formState.errors.
 */
export function safeZodResolver<T extends FieldValues>(schema: ZodSchema<T>) {
  const resolver = zodResolver<any>(schema)
  return async (
    values: T,
    context: unknown,
    options: ResolverOptions<T>,
  ): Promise<ResolverResult<T>> => {
    try {
      return await resolver(values, context, options)
    } catch (err: unknown) {
      const zodErr = err as {
        issues?: Array<{ path?: string[]; message: string }>
      }
      if (zodErr?.issues && Array.isArray(zodErr.issues)) {
        const fieldErrors: Record<string, { type: string; message: string }> =
          {}
        for (const issue of zodErr.issues) {
          const key = issue.path?.join('.') || '_root'
          fieldErrors[key] = { type: 'validation', message: issue.message }
        }
        return {
          values: {} as Record<string, never>,
          errors: fieldErrors as ResolverResult<T>['errors'],
        } as ResolverResult<T>
      }
      throw err
    }
  }
}
