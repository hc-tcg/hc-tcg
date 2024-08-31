import {build} from 'esbuild'
import {copy} from 'esbuild-plugin-copy'
import {getAppVersion} from './version.js'

await build({
	entryPoints: ['./server/src'],
	tsconfig: './server/tsconfig.json',
	platform: 'node',
	packages: 'external',
	format: 'esm',
	bundle: true,
	outfile: 'server/dist/index.js',
	sourcemap: true,
	plugins: [
		copy({
			assets: [
				// This is kinda hardcoded for apiKeys and adminKeys but it works
				{from: './server/src/*.json', to: '.'},
				{from: './server/src/plugins/*.json', to: '.'},
			],
		}),
	],
	define: {
		__APP_VERSION__: `'${getAppVersion()}'`,
	},
})

console.log('Build complete')
