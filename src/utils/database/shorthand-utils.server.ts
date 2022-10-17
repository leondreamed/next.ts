import type { Promisable } from 'type-fest'

import type { RecursivelyExpandShorthand } from '~/types/shorthands.server.js'
import type { ShorthandContext } from '../../types/shorthands.server.js'

export function expandInnerShorthand(mapping: Record<string, unknown>) {
	for (const [mappingKey, mappingValue] of Object.entries(mapping)) {
		if (mappingKey.startsWith('$')) {
			Object.assign(mapping, mappingValue)
			delete mapping[mappingKey]
		}
	}
}

export function expandShorthands<
	ShorthandMapping extends Record<string, unknown>
>(
	shorthandMapping: ShorthandMapping
): {
	[Key in keyof ShorthandMapping]: RecursivelyExpandShorthand<
		ShorthandMapping,
		ShorthandMapping[Key]
	>
} {
	for (const topLevelMappingValue of Object.values(shorthandMapping)) {
		expandInnerShorthand(topLevelMappingValue as any)
	}

	return shorthandMapping as any
}

/**
	Creates a type-safe wrapper function for defining shorthands for Prisma `include`s.
*/
export const createDefineShorthands = <
	PrismaSelect extends Record<string, unknown>
>() => {
	const defineShorthands = <
		Shorthands extends Record<
			string,
			PrismaSelect & { [K in keyof Shorthands]?: boolean }
		>
	>(
		shorthandsCallback: (context: ShorthandContext) => Promisable<Shorthands>
	) => shorthandsCallback

	return defineShorthands
}
