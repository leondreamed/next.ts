import type {
	SocketEvent,
	SocketEventData,
	SocketPayload
} from '~/types/socket.js'
import onetime from 'onetime'
import type { DependencyList } from 'react'
import { useCallback, useEffect } from 'react'
import * as io from 'socket.io-client'
import invariant from 'tiny-invariant'

/** Not meant to be used anywhere */
export const __getSocket: () => io.Socket = onetime(() => io.connect())

export function useSocketEvent<E extends SocketEvent>(
	args: { event: E } & Record<E['roomPropertyKey'], string>,
	handler: (payload: SocketPayload<E>) => void | Promise<void>,
	deps: DependencyList
): void {
	const socket = __getSocket()

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const cachedHandler = useCallback(handler, deps)

	const listener = useCallback(
		async (data: SocketEventData<E>) => {
			try {
				if (data.key !== args.event.key) return
				await cachedHandler(args.event.schema.parse(data.payload))
			} catch (error) {
				console.error(error)
			}
		},
		[args.event.key, args.event.schema, cachedHandler]
	)

	const roomPropertyKey = Object.keys(args).find((key) => key !== 'event') as
		| keyof typeof args
		| undefined
	invariant(roomPropertyKey, '`roomPropertyKey` should not be undefined')
	const roomPropertyValue = args[roomPropertyKey]

	// Join the socket room based on the `roomPropertyKey`
	useEffect(() => {
		socket.emit('joinRoom', roomPropertyValue)
		return () => {
			socket.emit('leaveRoom', roomPropertyValue)
		}
	}, [roomPropertyKey, roomPropertyValue, socket])

	useEffect(() => {
		socket.on('message', listener)
		return () => {
			socket.off('message', listener)
		}
	}, [handler, listener, socket])
}
