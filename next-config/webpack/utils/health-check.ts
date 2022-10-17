import fetch from '@commonjs/node-fetch'
import onetime from '@commonjs/onetime'
import pWaitFor from '@commonjs/p-wait-for'

export const waitForServerHealthy = onetime(async () => {
	await pWaitFor(
		async () => {
			const response = await fetch('http://localhost:3001/api/health')
			const text = await response.text()
			return text === 'OK'
		},
		{ interval: 1000 }
	)
})
