import ky from 'ky'
import superjson from 'superjson'

import type { Route, RouteResponse } from '~/types/route/index.js'

export type RequestArgs<R extends Route> = R extends Route<infer Data>
	? [
			Data['body'],
			Data['headers'],
			Data['searchParams'],
			Data['pathParams']
	  ] extends [undefined, undefined, undefined, undefined]
		? []
		: [
				args: (Data['body'] extends undefined
					? Record<never, never>
					: { json: Data['body'] }) &
					(Data['searchParams'] extends undefined
						? Record<never, never>
						: { searchParams: Data['searchParams'] }) &
					(Data['headers'] extends undefined
						? Record<never, never>
						: { headers: Data['headers'] }) &
					(Data['pathParams'] extends undefined
						? Record<never, never>
						: {
								pathParams: {
									[PathParam in keyof Data['pathParams']]: string
								}
						  })
		  ]
	: never

export async function sendRequest<R extends Route>(
	route: R,
	...args: RequestArgs<R>
): Promise<RouteResponse<R>> {
	// @ts-ignore
	const arg = args[0] as any

	let { path } = route
	path = path.startsWith('/') ? path.slice(1) : path

	const response = await ky(path, {
		method: route.method,
		json: arg?.json,
		searchParams: arg?.searchParams,
		headers:
			// We don't want to set it to undefined because otherwise the default `dialectKy` headers will be removed
			arg?.headers === undefined ? {} : { 'x-dialect-api': 'ky' },
		throwHttpErrors: false
	})

	const responseText = await response.text()
	const result = superjson.parse(responseText)

	return result as any
}
