import type { NextConfig } from 'next'
import * as webpackBootstrappers from './webpack/bootstrappers/index'
import type { WebpackBootstrapper } from './webpack/types/bootstrapper'
import { withBundleAnalyzer } from './webpack/utils/bundle-analyzer'
import { waitForServerHealthy } from './webpack/utils/health-check'

export function nextConfig(phase: string): NextConfig {
	// Pings /api/health to initialize the server
	void waitForServerHealthy()

	const config: NextConfig = {
		compiler: {
			emotion: true,
			styledComponents: true
		},
		images: {
			domains: [
				'upload.wikimedia.org',
				'www.gravatar.com',
				'avatars.githubusercontent.com',
				'pbs.twimg.com',
				'lh3.googleusercontent.com'
			]
		},
		reactStrictMode: true,
		swcMinify: true,
		typescript: {
			ignoreBuildErrors: true
		},
		eslint: {
			ignoreDuringBuilds: true
		},
		webpack(config, context) {
			Object.defineProperty(context, 'isClient', { value: !context.isServer })

			const runBootstrapper = (bootstrapper: WebpackBootstrapper) =>
				bootstrapper(config, context as any)

			for (const bootstrapper of Object.values(webpackBootstrappers)) {
				runBootstrapper(bootstrapper)
			}

			return config
		}
	}

	return withBundleAnalyzer(config)
}
