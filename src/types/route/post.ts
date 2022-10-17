import type { NextApiRequest, NextApiResponse } from 'next'
import type { ZodOptional, ZodString, ZodType } from 'zod'

import type { Route } from '~/types/route/route.js'
import type { ZodObjectSchemaToType } from '~/types/zod.js'

export interface PostRouteArgs<Path extends string = string> {
	method: 'post'
	adminOnly?: boolean
	searchParams?: (context: {
		req: NextApiRequest
		res: NextApiResponse
	}) => Record<string, ZodString | ZodOptional<ZodString>>
	body?: (context: {
		req: NextApiRequest
		res: NextApiResponse
	}) => Record<string, ZodType>
	headers?: (context: {
		req: NextApiRequest
		res: NextApiResponse
	}) => Record<string, ZodType>
	pathParams?: Record<string, true>
	path: Path
}

export type PostRoute<Args extends PostRouteArgs<string>, ResData> = Route<{
	method: 'post'
	headers: Args['headers'] extends (...args: any) => unknown
		? ZodObjectSchemaToType<ReturnType<Args['headers']>>
		: undefined
	body: Args['body'] extends (...args: any) => unknown
		? ZodObjectSchemaToType<ReturnType<Args['body']>>
		: undefined
	searchParams: Args['searchParams'] extends (...args: any) => unknown
		? ZodObjectSchemaToType<ReturnType<Args['searchParams']>>
		: undefined
	response: ResData
	pathParams: Args['pathParams'] extends Record<string, true>
		? Args['pathParams']
		: undefined
	path: Args['path']
}>
