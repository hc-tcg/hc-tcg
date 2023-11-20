import {build} from 'esbuild'
import {copy} from 'esbuild-plugin-copy'

await build({
	entryPoints: ['./server/src'],
	tsconfig: './server/tsconfig.json',
	platform: 'node',
	packages: 'external',
	format: 'esm',
	bundle: true,
	outfile: 'server/dist/index.js',
	plugins: [
		copy({
			assets: [
				// This is kinda hardcoded for apiKeys and adminKeys but it works
				{from: './server/src/*.json', to: '.'},
				{from: './server/src/plugins/*.json', to: '.'},
			],
		}),
	],
})

console.log('Build complete')
