import { defineBootstrapper } from '../utils/bootstrapper'

export default defineBootstrapper((config, { webpack }) => {
	config.plugins.push(
		new webpack.DefinePlugin({
			'process.env.NEXT': 'true',
			'process.env.APP_ENV': JSON.stringify(
				process.env.APP_ENV ?? 'development'
			)
		})
	)
})
