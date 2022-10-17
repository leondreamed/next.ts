export interface Route<
	Data extends {
		method: 'get' | 'post'
		response: any
		body: Record<string, unknown> | undefined
		headers: Record<string, unknown> | undefined
		searchParams: Record<string, unknown> | undefined
		pathParams: Record<string, true> | undefined
		path: string
	} = any
> {
	method: Data['method']
	path: Data['path']
	pathParams: Data['pathParams']
}

/**
	Based on the GraphQL specification for errors
	@see https://spec.graphql.org/draft/#sec-Errors
*/
export interface RouteResponse<R extends Route> {
	data: R extends Route<infer Data> ? Data['response'] | null : never
	errors?: Array<{
		message: string
		extensions?: { code?: string; payload?: Record<string, unknown> }
	}>
	extensions?: {
		redirectUrl?: string
		statusCode?: number
		successMessage?: string
		headers?: Record<string, string>
		interstitial?: string
	}
}

export interface RouteResponseFromData<D> {
	data: D
	errors?: Array<{
		message: string
		extensions?: { code?: string; payload?: Record<string, unknown> }
	}>
	extensions?: {
		redirectUrl?: string
		statusCode?: number
		successMessage?: string
		headers?: Record<string, string>
		interstitial?: string
	}
}

export type JsonifiedRouteResponseData<R extends Route> = Omit<
	RouteResponse<R>,
	'data'
> & {
	data: R extends Route<infer Data> ? Data['response'] : never
}
