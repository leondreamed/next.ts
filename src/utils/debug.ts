import { createDebug } from 'ldebug'

export const debug = createDebug({
	isDevelopment: process.env.APP_ENV !== 'production',
	logger(message) {
		if (
			typeof process === 'undefined' ||
			process.env.LOG_PREFIX === undefined ||
			message.startsWith(process.env.LOG_PREFIX)
		) {
			// eslint-disable-next-line dot-notation
			console['log'](message)
		}
	}
})
