import type { ZodString } from 'zod'

import type { RouteContext } from '~/utils/route.js'

interface UserIdRefinerOptions {
	notActor: boolean
}

/**
	@example ```
		refiners.userId(context, z.string(), { notActor: true })
	```
*/
export function userIdRefiner(
	context: RouteContext,
	schema: ZodString,
	options: UserIdRefinerOptions
) {
	return schema.superRefine(async (userId, ctx) => {
		/**
			Custom logic for validating the input.
			@example ```
				const { prisma } = await getPrisma()
				const user = await prisma.user.findUnique({
					select: {
						id: true
					},
					where: {
						id: userId
					}
				})

				if (user === null) {
					ctx.addIssue({
						code: ZodIssueCode.custom,
						message: `User with ID ${userId} does not exist.`
					})
				}

				if (options.notActor) {
					const actor = await getActorFromAuth(context)
					if (actor.id === userId) {
						ctx.addIssue({
							code: ZodIssueCode.custom,
							message: `The user ID must not equal the actor ID.`
						})
					}
				}
			```
		*/
	})
}
