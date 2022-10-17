import type { Prisma } from '@prisma/client'

import type {
	GetPayload,
	ShorthandType,
	WithOptions
} from '~/types/shorthands.server.js'
import type { getUserSelectShorthands } from '~/utils/database/shorthands/user.server.js'

type S = ShorthandType<typeof getUserSelectShorthands>
export type UserWith<Options extends WithOptions<S, Prisma.UserSelect>> =
	Prisma.UserGetPayload<GetPayload<S, Options>>
