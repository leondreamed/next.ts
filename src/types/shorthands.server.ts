import type { PrismaClient } from '@prisma/client'
import type { UnionToIntersection } from 'type-fest'

export type ShorthandType<ShorthandGetter extends (...args: any) => any> =
	Awaited<ReturnType<ShorthandGetter>>

export type ExpandMapping<ShorthandMappings, Options> = {
	[OptionKey in keyof Options]: OptionKey extends keyof ShorthandMappings
		? ExpandMapping<ShorthandMappings, ShorthandMappings[OptionKey]>
		: Record<OptionKey, Options[OptionKey]>
}[keyof Options]

export interface GetPayload<
	ShorthandMappings,
	Options,
	UniqueKey extends string = 'id'
> {
	select: UnionToIntersection<ExpandMapping<ShorthandMappings, Options>> &
		Record<UniqueKey, true>
}

export type WithOptions<ShorthandMappings, Select> = Select & {
	[Key in keyof ShorthandMappings]?: boolean
}

type Shorthands<ShorthandMappingObject> = keyof {
	[K in keyof ShorthandMappingObject as K extends `$${string}`
		? K
		: never]: true
}

export type RecursivelyExpandShorthand<
	ShorthandMapping,
	ShorthandMappingObject
> = Omit<ShorthandMappingObject, `$${string}`> &
	(Shorthands<ShorthandMappingObject> extends never
		? Record<string, never>
		: {
				[K in Shorthands<ShorthandMappingObject>]: K extends keyof ShorthandMapping
					? ShorthandMapping[K]
					: never
		  }[Shorthands<ShorthandMappingObject>])

export interface ShorthandContext {
	prisma: PrismaClient
}
