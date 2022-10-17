import onetime from 'onetime'

import type { ShorthandContext } from '~/types/shorthands.server.js'
import { getUserSelectShorthands } from '~/utils/database/shorthands/user.server.js'

export const getPrismaShorthands = onetime(
	async (context: ShorthandContext) => {
		const [
			userSelectShorthands
		] = await Promise.all([
			getUserSelectShorthands(context)
		])

		return {
			// FIXME: for some reason expandShorthands breaks when used with getActorFromAuth(context, shorthands.user.$actorData)
			user: userSelectShorthands,
		}
	}
)
