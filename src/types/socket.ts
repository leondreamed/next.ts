import type { ZodSchema } from 'zod'

export interface SocketEvent<
	Data extends {
		payload: Record<string, any>
		key: string
		roomPropertyKey: string
	} = {
		payload: Record<string, any>
		roomPropertyKey: string
		key: string
	}
> {
	key: Data['key']
	roomPropertyKey: Data['roomPropertyKey']
	schema: ZodSchema
}

export type SocketPayload<E extends SocketEvent> = E extends SocketEvent<
	infer Data
>
	? Data['payload']
	: never

export interface SocketEventData<E extends SocketEvent> {
	key: E['key']
	payload: SocketPayload<E>
}
