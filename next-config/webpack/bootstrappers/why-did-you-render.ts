// import { packageDirs } from '@dialect/paths'
// import path from 'node:path'

import { defineBootstrapper } from '../utils/bootstrapper'

export default defineBootstrapper(
	(_bootstrapper /* (config, { dev, isClient } */) => {
		// if (dev && isClient) {
		// 	const originalEntry = config.entry
		// 	config.entry = async () => {
		// 		const wdrPath = path.resolve(
		// 			packageDirs.nextApp,
		// 			'./scripts/why-did-you-render.js'
		// 		)
		// 		const entries = await (originalEntry as any)()
		// 		if (entries['main.js'] && !entries['main.js'].includes(wdrPath)) {
		// 			entries['main.js'].unshift(wdrPath)
		// 		}
		// 		return entries
		// 	}
		// }
	}
)
