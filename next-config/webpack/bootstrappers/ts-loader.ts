import { defineBootstrapper } from '../utils/bootstrapper'

export default defineBootstrapper((config) => {
	config.module.rules.unshift({
		test: /\.ts(x?)$/,
		use: [
			{
				loader: 'ts-loader',
				options: {
					transpileOnly: true
				}
			}
		]
	})
})
