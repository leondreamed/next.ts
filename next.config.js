const path = require('node:path')

console.info(`Running Next App with NODE_ENV=${process.env.NODE_ENV}`)

require('@leondreamed/ts-node').register({
	transpileOnly: true,
	esm: true,
	project: path.join(__dirname, './next-config/tsconfig.json')
})

module.exports = require('./next-config/config').nextConfig
