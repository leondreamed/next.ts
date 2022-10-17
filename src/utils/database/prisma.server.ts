import { getPrismaShorthands } from '~/utils/database/shorthands.server'
import { PrismaClient } from '@prisma/client'

export const getPrismaClient: () => Promise<PrismaClient> = async () => {
	if ((global as any).__db !== undefined) {
		return (global as any).__db
	}

	const prisma = new PrismaClient()
	;(global as any).__db = prisma

	console.info(`Database URL: ${process.env.DATABASE_URL}`)

	await prisma.$connect()

	return prisma
}

/**
	Returns the Prisma client along with Prisma shorthands. Not cached with `onetime` because
	it may be called when retrieving the shorthands.
	Performance shouldn't be an issue because both `getPrismaClient` and `getPrismaShorthands` are cached with `onetime`.
*/
export const getPrisma = async (): Promise<{
	prisma: PrismaClient
	shorthands: Awaited<ReturnType<typeof getPrismaShorthands>>
}> => {
	const prisma = await getPrismaClient()
	const shorthands = await getPrismaShorthands({ prisma })

	return {
		prisma,
		shorthands
	}
}

export const seedPrisma = async (prisma: PrismaClient) => {
	// Do stuff to initialize the Prisma database
}
