/**
	Even though this file is meant to be used only on the server, because it is called at the top-level it must be exported as isomorphic so it doesn't error on the client.
*/

import type { IncomingMessage, ServerResponse } from 'node:http'

import type {
	GetServerSideProps,
	GetServerSidePropsContext,
	NextApiRequest,
	NextApiResponse
} from 'next'
import pWaitFor from 'p-wait-for'
import { useContext } from 'react'
import superjson from 'superjson'
import invariant from 'tiny-invariant'
import type { Promisable } from 'type-fest'
import type { ZodOptional, ZodString, ZodType } from 'zod'
import { z } from 'zod'

import type {
	Route,
	RouteResponse,
	RouteResponseFromData
} from '~/types/route/index.js'
import type {
	GetRoute,
	GetRouteArgs,
	PostRoute,
	PostRouteArgs
} from '~/types/route/index.js'
import type { ZodObjectSchemaToType } from '~/types/zod.js'
import { ServerDataContext } from '~/utils/page.jsx'
import { isRedirectError } from '~/utils/redirect.js'

function reply<R extends Route>(
	res: NextApiResponse,
	schema: RouteResponse<R>
) {
	if (schema.extensions?.statusCode !== undefined) {
		res.status(schema.extensions.statusCode).send(superjson.stringify(schema))
	} else if (schema.errors !== undefined && schema.errors.length > 0) {
		res.status(500).send(superjson.stringify(schema))
	} else {
		res.status(200).send(superjson.stringify(schema))
	}
}

type GetMethodRequest<Args extends GetRouteArgs<string>> = Omit<
	NextApiRequest,
	'headers' | 'query' | 'params'
> & {
	headers: Args['headers'] extends Record<string, ZodType>
		? ZodObjectSchemaToType<Args['headers']>
		: NextApiRequest['headers']
}

type PostMethodRequest<Args extends PostRouteArgs<string>> = Omit<
	NextApiRequest,
	'body' | 'headers' | 'query' | 'params'
> & {
	body: Args['body'] extends Record<string, ZodType>
		? ZodObjectSchemaToType<Args['body']>
		: NextApiRequest['body']
	headers: Args['headers'] extends Record<string, ZodType>
		? ZodObjectSchemaToType<Args['headers']>
		: NextApiRequest['headers']
}

export interface GetHandlerFunctionContext<Args extends GetRouteArgs<string>> {
	req: GetMethodRequest<Args>
	res: ServerResponse
	pathParams: Args['pathParams'] extends Record<string, true>
		? Record<keyof Args['pathParams'], string>
		: Record<never, never>
	searchParams: Args['searchParams'] extends Record<
		string,
		ZodString | ZodOptional<ZodString>
	>
		? ZodObjectSchemaToType<Args['searchParams']>
		: Record<string, string>
}

export interface PostHandlerFunctionContext<
	Args extends PostRouteArgs<string>
> {
	req: PostMethodRequest<Args>
	res: ServerResponse
	pathParams: Args['pathParams'] extends Record<string, true>
		? Record<keyof Args['pathParams'], string>
		: Record<never, never>
	searchParams: Args['searchParams'] extends Record<
		string,
		ZodString | ZodOptional<ZodString>
	>
		? ZodObjectSchemaToType<Args['searchParams']>
		: Record<string, string>
}

export interface HandlerFunctionContext {
	req: IncomingMessage
	res: ServerResponse
}

export interface RouteContext<_R extends Route = Route> {
	req: Omit<NextApiRequest, 'body'> & { body: unknown }
	res: NextApiResponse
}

type ServerContext<R extends Route> =
	| RouteContext<R>
	| GetServerSidePropsContext

export function usePathParams<R extends Route>(
	context: ServerContext<R>
): R extends Route<infer Args> ? Args['pathParams'] : never {
	if ('query' in context) {
		return context.query as any
	} else {
		return context.req.query as any
	}
}

export function useSearchParams<R extends Route>(
	context: ServerContext<R>
): R extends Route<infer Args> ? Args['searchParams'] : never {
	invariant(context.req.url, 'request should have a url')
	const url = new URL(context.req.url, 'https://dialect.so')
	return Object.fromEntries(url.searchParams) as any
}

export function useBody<R extends Route>(
	context: RouteContext<R>
): R extends Route<infer Args> ? Args['body'] : never {
	return context.req.body as any
}

export function useHeaders<R extends Route>(
	context: RouteContext<R>
): R extends Route<infer Args> ? Args['headers'] : never {
	return context.req.headers as any
}

export function defineRoute<
	Path extends string,
	Args extends GetRouteArgs<Path>
>(
	args: Args
): {
	handler: <ResData>(
		handlerFunction: (
			context: RouteContext<GetRoute<Args, ResData>>
		) => Promisable<RouteResponse<GetRoute<Args, ResData>>>
	) => GetRoute<Args, ResData>
}

export function defineRoute<
	Path extends string,
	Args extends PostRouteArgs<Path>
>(
	args: Args
): {
	handler: <ResData>(
		handlerFunction: (
			context: RouteContext<PostRoute<Args, ResData>>
		) => Promisable<RouteResponse<PostRoute<Args, ResData>>>
	) => PostRoute<Args, ResData>
}

export function defineRoute<Args extends GetRouteArgs | PostRouteArgs>(
	args: Args
): any {
	async function handleRequest(
		handlerFunction: any,
		req: NextApiRequest,
		res: NextApiResponse,
		options: { adminOnly?: boolean }
	) {
		try {
			// Wait for the server to finish initializing before running the route handler
			if ((globalThis as any).__serverInitializedPromise === undefined) {
				await pWaitFor(
					() => (globalThis as any).__serverInitializedPromise !== undefined,
					{ interval: 100, timeout: 30_000 }
				)
			}

			await (globalThis as any).__serverInitializedPromise

			if (args.searchParams !== undefined) {
				invariant(req.url, 'request should have a url')
				const url = new URL(req.url, 'https://dialect.so')
				await z
					.object(args.searchParams({ req, res }))
					.parseAsync(Object.fromEntries(url.searchParams))
			}

			if (args.method === 'post' && args.body !== undefined) {
				await z.object(args.body({ req, res })).parseAsync(req.body)
			}

			if (args.headers !== undefined) {
				await z.object(args.headers({ req, res })).parseAsync(req.headers)
			}

			const response = await handlerFunction({ req, res })

			return reply(res, response)
		} catch (error: any) {
			// Don't catch `redirect(...)` calls when the `x-dialect-api` header is not present
			if (isRedirectError(error)) {
				const location = error.extensions.redirectUrl
				invariant(location, '`location` should not be undefined')
				const response = {
					data: null,
					extensions: {
						redirectUrl: location
					}
				}

				return reply(res, response)
			}

			console.error(error)

			const response = {
				data: null,
				errors: [{ message: error.message }]
			}
			reply(res, response)
		}
	}

	const createHandler = (handlerFunction: any) => {
		async function handler(req: NextApiRequest, res: NextApiResponse) {
			return handleRequest(handlerFunction, req, res, {
				adminOnly: args.adminOnly
			})
		}

		Object.assign(handler, {
			method: args.method,
			path: args.path,
			pathParams: args.pathParams
		})

		return handler
	}

	if (process.env.APP_ENV !== 'production') {
		return Object.assign(
			function () {
				if (process.env.APP_ENV !== 'production') {
					throw new Error(
						// eslint-disable-next-line no-caller
						`Route handler was not set in ${arguments.callee.name}; make sure you call \`.handler()\` after calling \`defineRoute()\``
					)
				}
			},
			{ handler: createHandler }
		) as any
	} else {
		return { handler: createHandler } as any
	}
}

export function useServerData<
	ServerSidePropsFn extends GetServerSideProps
>(): ServerSidePropsFn extends GetServerSideProps<infer R>
	? RouteResponseFromData<R>['data']
	: never {
	const serverDataJson = useContext(ServerDataContext)

	if (serverDataJson === undefined) {
		throw new Error('Server data is undefined.')
	}

	const response = superjson.parse<any>(serverDataJson as unknown as string)

	if (response.data === null) {
		console.error(response.errors)
		throw new Error(
			`Error in retrieving server data: ${JSON.stringify(response.errors)}`
		)
	}

	return response
}

export function defineGetServerSideProps<R extends RouteResponseFromData<any>>(
	handler: (context: GetServerSidePropsContext) => R | Promise<R>
): GetServerSideProps<R> {
	const getServerSideProps: GetServerSideProps = async (context) => {
		try {
			const serverData = await handler(context)

			return {
				props: {
					serverData: superjson.stringify(serverData)
				}
			}
		} catch (error: any) {
			if (error.extensions?.redirectUrl) {
				return {
					redirect: {
						destination: error.extensions.redirectUrl,
						permanent: false
					}
				}
			}

			throw error
		}
	}

	return getServerSideProps as any
}
