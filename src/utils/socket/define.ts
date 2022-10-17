import type { ZodType } from 'zod'
import { z } from 'zod'

import type { SocketEvent } from '~/types/socket.js'

export type ZodObjectSchemaToType<T> = T extends undefined
	? undefined
	: T extends Record<string, ZodType>
	? z.infer<z.ZodObject<T>>
	: undefined

export function defineSocketEvent<
	Key extends string,
	RoomPropertyKey extends string & keyof Payload,
	Payload extends Record<string, ZodType>
>({
	key,
	roomPropertyKey,
	payload: payloadSchema
}: {
	key: Key
	roomPropertyKey: RoomPropertyKey
	payload: Payload
}): SocketEvent<{
	key: Key
	roomPropertyKey: RoomPropertyKey
	payload: ZodObjectSchemaToType<Payload>
}> {
	return {
		key,
		roomPropertyKey,
		schema: z.object(payloadSchema)
	}
}
