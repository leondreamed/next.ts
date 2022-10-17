import type { Prisma } from '@prisma/client'

import { createDefineShorthands } from '~/utils/database/shorthand-utils.server.js'

const defineShorthands = createDefineShorthands<Prisma.UserSelect>()

export const getUserSelectShorthands = defineShorthands(() => ({
	$actorData: {
		id: true,
		email: true,
		username: true,
		fullName: true,
	},
	$publicUserData: {
		id: true,
		fullName: true
	}
}))
