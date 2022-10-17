import { defineBootstrapper } from '../utils/bootstrapper'

export default defineBootstrapper((config, { isServer, webpack }) => {
	if (isServer) {
		// Externalizing `@prisma/client` to avoid the following error:
		// ENOENT: no such file or directory, open '[...]/Dialect/packages/next-app/.next/server/pages/api/schema.prisma'
		// See: https://github.com/prisma/prisma/issues/9435
		// This has to do with webpack bundling the `@prisma/client` package
		;(config.externals as string[]).push('@prisma/client')

		// See https://stackoverflow.com/a/64318673/12581865
		config.plugins.push(
			new webpack.IgnorePlugin({ resourceRegExp: /^pg-native$/ })
		)
	}
})
