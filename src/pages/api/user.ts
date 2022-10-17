import { getPrisma } from '~/utils/database/prisma.server'
import refiners from '~/utils/refiners/index.js'
import { defineRoute, useSearchParams } from '~/utils/route.js'
import { z } from 'zod'
import { UserWith } from '~/types/shorthands/user.server.js'

export const getUserRoute = defineRoute({
	method: 'get',
	path: '/api/user',
	searchParams: (context) => ({
		userId: refiners.userId(context, z.string(), { notActor: false })
	})
}).handler<{
	user: UserWith<{ $publicUserData: true }>
}>(async (context) => {
	const { shorthands, prisma } = await getPrisma()
	const { userId } = useSearchParams(context)
	const user = await prisma.user.findFirstOrThrow({
		select: {
			...shorthands.user.$publicUserData
		},
		where: {
			id: userId
		},
	})

	return {
		data: {
			user
		}
	}
})
