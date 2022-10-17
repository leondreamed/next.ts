import type { SocketEvent } from '~/types/socket.js'
import type { Server } from 'socket.io'

export function setSocketServer(server: Server) {
	;(global as any).socketServer = server
}

export function getSocketServer() {
	return (global as any).socketServer
}

export function emitSocketEvent<E extends SocketEvent>(
	eventDefinition: E,
	payload: E extends SocketEvent<infer Data> ? Data['payload'] : never
) {
	if (typeof document !== 'undefined') {
		throw new TypeError('Only the server should be emitting websocket events!')
	}

	// Might be undefined when seeding users
	if (getSocketServer() !== undefined) {
		console.info(
			`Emitting event ${eventDefinition.key} to room ${
				payload[eventDefinition.roomPropertyKey] as string
			} `
		)
		getSocketServer()
			.to(payload[eventDefinition.roomPropertyKey])
			.emit('message', {
				key: eventDefinition.key,
				payload
			})
	}
}
