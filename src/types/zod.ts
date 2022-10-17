import type { z, ZodType } from 'zod'

export type ZodObjectSchemaToType<T extends Record<string, ZodType>> = z.infer<
	z.ZodObject<T>
>
