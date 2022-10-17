import path from 'node:path'

import findUp from '@commonjs/find-up'
import isPathInside from '@commonjs/is-path-inside'
import type { MatchPath } from 'tsconfig-paths'
import * as tsConfigPaths from 'tsconfig-paths'

import { defineBootstrapper } from '../utils/bootstrapper'
import { nextAppDir } from '../utils/paths'

export default defineBootstrapper((config, { webpack }) => {
	const workspaceImportsPlugin = new webpack.NormalModuleReplacementPlugin(
		/.*/,
		(resource: any) => {
			if (
				resource.request.startsWith('~') &&
				!isPathInside(nextAppDir, resource.context)
			) {
				const tsconfigJsonPath = findUp.sync('tsconfig.json', {
					cwd: path.dirname(resource.context)
				})
				const config = tsConfigPaths.loadConfig(tsconfigJsonPath)
				if (config.resultType === 'failed') {
					throw new Error(
						`Failed to load tsconfig.json from ${resource.context as string}`
					)
				}

				const { absoluteBaseUrl, paths } = config
				let matchPath: MatchPath

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (paths === undefined) {
					matchPath = () => undefined
				} else {
					matchPath = tsConfigPaths.createMatchPath(absoluteBaseUrl, paths)
				}

				let resourceRequest = resource.request
				if (resourceRequest.endsWith('.js')) {
					resourceRequest = resourceRequest.slice(
						0,
						Math.max(0, resourceRequest.length - 3)
					)
				}

				const matchedPath = matchPath(resourceRequest)
				if (matchedPath !== undefined) {
					resource.request = matchedPath
				}
			}
		}
	)

	config.plugins.unshift(workspaceImportsPlugin)
})
