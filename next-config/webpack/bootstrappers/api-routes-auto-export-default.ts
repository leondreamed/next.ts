import isPathInside from '@commonjs/is-path-inside'
import * as acorn from 'acorn'
import { outdent } from 'outdent'

import { defineBootstrapper } from '../utils/bootstrapper'
import { apiPagesDir } from '../utils/paths'

export default defineBootstrapper((config, { isServer }) => {
	if (isServer) {
		config.module.rules.unshift({
			test(id) {
				return isPathInside(id, apiPagesDir)
			},
			loader: 'string-replace-loader',
			options: {
				search: /^[\S\s]*$/,
				replace(match: string) {
					const ast = acorn.parse(match, {
						ecmaVersion: 2020,
						sourceType: 'module'
					}) as any

					const exportNamedDeclaration = ast.body.find(
						(node: any) => node.type === 'ExportNamedDeclaration'
					)

					if (exportNamedDeclaration === undefined) {
						return match
					}

					const variableName =
						exportNamedDeclaration.declaration?.declarations?.[0]?.id?.name

					if (variableName === undefined) {
						return match
					}

					const replacement = outdent`
						${match}

						export default ${variableName}
					`

					return replacement
				}
			}
		})
	}
})
