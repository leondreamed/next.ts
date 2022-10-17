import isPathInside from '@commonjs/is-path-inside'
import * as acorn from 'acorn'
import { outdent } from 'outdent'

import { defineBootstrapper } from '../utils/bootstrapper'
import { apiPagesDir } from '../utils/paths'

export default defineBootstrapper((config, { isClient }) => {
	if (isClient) {
		// Use string-replace-loader last after everything has been transformed to JavaScript
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

					// Remove all the code in the `.handler()` call so webpack can
					// strip server dependencies
					const exportNamedDeclaration = ast.body.find(
						(node: any) => node.type === 'ExportNamedDeclaration'
					)

					// If a named export can't be found, return
					if (exportNamedDeclaration === undefined) {
						return match
					}

					const variableDeclarator =
						exportNamedDeclaration.declaration?.declarations?.[0]

					if (variableDeclarator === undefined) {
						return match
					}

					const callExpression = variableDeclarator.init?.arguments?.[0]

					if (callExpression === undefined) {
						return match
					}

					const replacement = outdent`
						${match.slice(0, callExpression.start)}
							() => {}
						${match.slice(callExpression.end)}
					`

					return replacement
				}
			}
		})
	}
})
