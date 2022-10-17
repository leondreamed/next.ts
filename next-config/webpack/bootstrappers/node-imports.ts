import { defineBootstrapper } from '../utils/bootstrapper'

export default defineBootstrapper((config, { isClient, webpack }) => {
	if (isClient) {
		config.plugins.push(
			new webpack.NormalModuleReplacementPlugin(/node:/, (resource: any) => {
				const mod = resource.request.replace(/^node:/, '')
				resource.request = mod
			})
		)
	}
})
