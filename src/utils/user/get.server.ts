import type { Prisma, User } from '@prisma/client'

import type { UserWith } from '~/types/shorthands/user.server'
import { getPrisma } from '~/utils/database/prisma.server.js'
import { redirect } from '~/utils/redirect.js'
import type { HandlerFunctionContext, RouteContext } from '~/utils/route.js'
import { debug } from '~/utils/debug.js'

interface GetUserByIdOptions {
	redirectOnNotFound?: string
}

/**
	Gets a user based on their ID
	@param userId The ID of the user
	@param options.redirectOnNotFound The route to redirect the client to if the user could not be found.
	@returns The Prisma user with the provided ID
*/
export async function getUserById<Select extends Prisma.UserSelect>(
	userId: string,
	selectOptions: Select,
	options: { redirectOnNotFound: string }
): Promise<UserWith<Select>>
export async function getUserById<Select extends Prisma.UserSelect>(
	userId: string,
	select: Select,
	options?: { redirectOnNotFound: undefined }
): Promise<UserWith<Select> | null>
export async function getUserById<Select extends Prisma.UserSelect>(
	userId: string,
	select: Select,
	options?: GetUserByIdOptions
): Promise<UserWith<Select> | null> {
	const { prisma } = await getPrisma()
	const user = await prisma.user.findUnique({
		select,
		where: {
			id: userId
		}
	})

	if (user === null && options?.redirectOnNotFound !== undefined) {
		console.debug(
			`Could not find user with ID ${userId}; redirecting to ${String(
				options.redirectOnNotFound
			)}`
		)
		throw redirect(options.redirectOnNotFound)
	}

	return user as any
}

export const getUserByUsername = async (
	username: string
): Promise<User | null> => {
	const { prisma } = await getPrisma()
	const user = await prisma.user.findUnique({
		where: {
			username
		}
	})
	return user
}

export async function getActorFromAuth<Select extends Prisma.UserSelect>(
	context: RouteContext | HandlerFunctionContext,
	select: Select,
	options: { redirectOnNull: string | true }
): Promise<UserWith<Select>>
export async function getActorFromAuth<Select extends Prisma.UserSelect>(
	context: RouteContext | HandlerFunctionContext,
	select: Select,
	options: { redirectOnNull: false }
): Promise<UserWith<Select> | null>
export async function getActorFromAuth<Select extends Prisma.UserSelect>(
	context: RouteContext | HandlerFunctionContext,
	select: Select,
	options: { redirectOnNull: string | boolean }
): Promise<UserWith<Select> | null> {
	const { authorization } = context.req.headers

	if (authorization === undefined) {
		if (options.redirectOnNull === false) {
			return null
		} else {
			debug(
				() =>
					`User is not logged in; redirecting to ${options.redirectOnNull as string
					}`
			)
			throw redirect(
				options.redirectOnNull === true ? '/login' : options.redirectOnNull
			)
		}
	}
	const token = authorization?.replace('Bearer ', '')

	const { prisma } = await getPrisma()
	const user = await prisma.user.findFirstOrThrow({
		select,
		where: {
			// THIS IS OBVIOUSLY BAD PRACTICE; DO NOT DO THIS IN A PRODUCTION ENVIRONMENT (I'm just too lazy to implement a proper auth solution)
			username: token
		}
	})

	return user as any
}
