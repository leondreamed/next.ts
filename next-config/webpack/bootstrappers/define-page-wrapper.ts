import isPathInside from '@commonjs/is-path-inside'
import * as acorn from 'acorn'
import { outdent } from 'outdent'

import { defineBootstrapper } from '../utils/bootstrapper'
import { apiPagesDir, pagesDir } from '../utils/paths'

export default defineBootstrapper((config) => {
	// Load both on client and server
	config.module.rules.unshift({
		test(id) {
			return isPathInside(id, pagesDir) && !isPathInside(id, apiPagesDir)
		},
		loader: 'string-replace-loader',
		options: {
			search: /^[\S\s]*$/,
			replace(match: string) {
				const ast = acorn.parse(match, {
					ecmaVersion: 2020,
					sourceType: 'module'
				}) as any
				const exportDefaultDeclaration = ast.body.find(
					(node: any) => node.type === 'ExportDefaultDeclaration'
				)

				if (exportDefaultDeclaration === undefined) {
					return match
				}

				const functionDeclaration = exportDefaultDeclaration.declaration

				const componentName = functionDeclaration?.id?.name
				if (componentName === undefined) {
					return match
				}

				const replacement = outdent`
					import { __definePage } from '~/utils/page';

					${match.slice(0, exportDefaultDeclaration.start)}

					const ${componentName} = __definePage(
						${match.slice(functionDeclaration.start, functionDeclaration.end)}
					)

					export default ${componentName}

					${match.slice(functionDeclaration.end)}
				`

				return replacement
			}
		}
	})
})
