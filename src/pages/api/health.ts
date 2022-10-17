import type { SocketEvent } from '~/types/socket.js'
import * as websocketEvents from '~/utils/socket/events/index.js'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Server } from 'socket.io'
import { z } from 'zod'

import { getPrismaClient, seedPrisma } from '~/utils/database/prisma.server'
import { getSocketServer, setSocketServer } from '~/utils/socket.server.js'

function startSocketServer(req: NextApiRequest, res: NextApiResponse) {
	if (getSocketServer() !== undefined) {
		return
	}

	const io = new Server((res.socket as any).server)
	setSocketServer(io)

	console.info('🚀 Socket server started!')

	const websocketEventsMap: Record<string, SocketEvent> = Object.fromEntries(
		Object.values(websocketEvents).map((websocketEvent) => [
			websocketEvent.key,
			websocketEvent
		])
	)

	io.on('connection', (socket) => {
		console.info('Socket connected:', socket.id)

		socket.on('joinRoom', async (roomId: string, ack) => {
			console.info(`Socket ${socket.id} joined room ${roomId}`)
			await socket.join(z.string().parse(roomId))
			ack?.()
		})

		socket.on('leaveRoom', async (roomId: string, ack) => {
			console.info(`Socket ${socket.id} joined room ${roomId}`)
			await socket.leave(z.string().parse(roomId))
			ack?.()
		})

		const socketEventSchema = z.object({
			key: z.string(),
			payload: z.any()
		})

		socket.on('message', (eventString: string) => {
			// This is only called when there is a client socket that sends a WS request,
			// which we currently don't support (so if you want to debug, see
			// `~/utils/socket.server.ts` instead)

			const event = socketEventSchema.parse(JSON.parse(eventString))
			console.info(`Socket ${socket.id} emitted event ${event.key}`)

			const websocketEvent = websocketEventsMap[event.key]
			if (websocketEvent === undefined) {
				console.error(`Websocket event not found: ${String(event.key)}.`)
				return
			}

			socket
				.to(event.payload[websocketEvent.roomPropertyKey])
				.emit('message', event)
		})

		socket.on('disconnect', (reason) => {
			console.info(
				`Socket ${socket.id} disconnected with reason ${JSON.stringify(reason)}`
			)
		})
	})
}

let resolveServerInitialized: (value?: unknown) => any
;(globalThis as any).__serverInitializedPromise = new Promise((resolve) => {
	resolveServerInitialized = resolve
})

export default async function HealthCheck(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const prisma = await getPrismaClient()
	await seedPrisma(prisma)
	startSocketServer(req, res)
	resolveServerInitialized()
	res.send('OK')
}
