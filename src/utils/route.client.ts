import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

import type {
	JsonifiedRouteResponseData,
	Route,
	RouteResponse
} from '~/types/route/index.js'
import type { RequestArgs } from '~/utils/request.client.js'
import { sendRequest as sendKyRequest } from '~/utils/request.client.js'

export function useRoute<R extends Route>(
	route: R
): {
	(...args: RequestArgs<R>): Promise<JsonifiedRouteResponseData<R>>
	isLoading: boolean
	response: RouteResponse<R> | null
} {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [response, setResponse] = useState<RouteResponse<R> | null>(null)

	let { path } = route
	if (path.startsWith('/')) {
		path = path.slice(1)
	}

	const sendRequest = useCallback(
		async (args: any = {}): Promise<any> => {
			try {
				setIsLoading(true)
				const result = await sendKyRequest<R>(
					route,
					// @ts-ignore
					args
				)

				if (result.extensions?.redirectUrl !== undefined) {
					await router.push(result.extensions.redirectUrl)
				} else {
					setResponse(result)

					if (result.data === null) {
						throw result
					}
				}

				return result as any
			} finally {
				setIsLoading(false)
			}
		},
		[route, router]
	)

	;(sendRequest as any).isLoading = isLoading
	;(sendRequest as any).response = response

	return sendRequest as any
}

export function useRouteData<R extends Route>(
	route: R,
	...args: RequestArgs<R>
) {
	const callRoute = useRoute(route)
	const [routeData, setRouteData] = useState<RouteResponse<R> | null>(null)

	useEffect(() => {
		void (async () => {
			// @ts-expect-error: Route data assumes that the route doesn't need info
			setRouteData(await callRoute(args))
		})()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return routeData
}
