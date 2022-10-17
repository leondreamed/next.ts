import { defineBootstrapper } from '../utils/bootstrapper'

export default defineBootstrapper((config, { webpack }) => {
	config.plugins.push(
		new webpack.NormalModuleReplacementPlugin(/\.jsx?$/, (resource: any) => {
			if (!resource.context.includes('/node_modules/')) {
				resource.request = resource.request.replace(/\.[^.]+$/, '')
			}
		})
	)
})
