import nextBundleAnalyzer from '@next/bundle-analyzer'

export const withBundleAnalyzer = nextBundleAnalyzer({
	enabled: process.env.ANALYZE === 'true'
})
