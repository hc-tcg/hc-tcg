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
			assets: [{from: './server/src/**.json', to: '.'}],
		}),
	],
})

console.log('Build complete')
