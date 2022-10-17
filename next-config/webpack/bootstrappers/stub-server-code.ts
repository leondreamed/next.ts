import path from 'node:path'

import { defineBootstrapper } from '../utils/bootstrapper'
import { nextAppDir } from '../utils/paths'

export default defineBootstrapper((config, { webpack, isClient, dev }) => {
	if (isClient) {
		const stubServerCodePlugin = new webpack.NormalModuleReplacementPlugin(
			/.*/,
			(resource: any) => {
				if (
					resource.request.endsWith('.server') ||
					resource.request === '@prisma/client'
				) {
					resource.request = path.join(nextAppDir, 'src/stubs/empty.mjs')
				} else if (!dev && resource.request === 'ldebug') {
					resource.request = path.join(nextAppDir, 'src/stubs/ldebug.mjs')
				}
			}
		)

		config.plugins.unshift(stubServerCodePlugin)
	}
})
