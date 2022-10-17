import { z } from 'zod'

import { defineSocketEvent } from '~/utils/socket/define.js'

export const messageReceived = defineSocketEvent({
	key: 'messageReceived',
	payload: {
		roomId: z.string(),
		message: z.string()
	},
	roomPropertyKey: 'roomId'
})
