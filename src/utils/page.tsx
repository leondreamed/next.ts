import * as React from 'react'
import { createContext } from 'react'

import type {
	Route,
	RouteResponse,
	RouteResponseFromData
} from '~/types/route/index.js'

export const ServerDataContext = createContext<RouteResponseFromData<any>>(
	undefined!
)

// Meant to be added at compile-time
export function __definePage(Component: React.FC) {
	// eslint-disable-next-line func-style
	const ComponentWrappedWithServerData = function ({
		serverData,
		...props
	}: {
		serverData: RouteResponse<Route>
	}) {
		return (
			<ServerDataContext.Provider value={serverData}>
				<Component {...props} />
			</ServerDataContext.Provider>
		)
	}

	return ComponentWrappedWithServerData
}
