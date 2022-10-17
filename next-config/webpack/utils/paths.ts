import path from 'node:path'

import { getProjectDir } from 'lion-utils'

export const nextAppDir = path.join(
	getProjectDir(__dirname, { monorepoRoot: true }),
	'packages/next-app'
)

export const pagesDir = path.join(nextAppDir, 'src/pages')
export const apiPagesDir = path.join(nextAppDir, 'src/pages/api')
