import path from 'path'
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'
import CONFIG from '../common/config/server-config.js'
import {getAppVersion} from '../version'

import {ViteImageOptimizer} from 'vite-plugin-image-optimizer'

let plugins = [react()]

if (process.env.NODE_ENV === 'production') {
	plugins.push(ViteImageOptimizer())
}

export default defineConfig({
	plugins: plugins,
	define: {
		__ENV__: JSON.stringify(process.env.NODE_ENV),
		__DEBUG_BUILD__: JSON.stringify(process.env.NODE_ENV !== 'production'),
		__PORT__: JSON.stringify(CONFIG.port),
		__LIMITS__: JSON.stringify(CONFIG.limits),
		__LOGO_SUBTEXT__: JSON.stringify(CONFIG.logoSubText),
		__APP_VERSION__: `'${getAppVersion()}'`,
	},
	resolve: {
		alias: {
			server: path.resolve(__dirname, '../server'),
			common: path.resolve(__dirname, '../common'),
			types: path.resolve(__dirname, './src/types'),
			sagas: path.resolve(__dirname, './src/sagas'),
			components: path.resolve(__dirname, './src/components'),
			logic: path.resolve(__dirname, './src/logic'),
			store: path.resolve(__dirname, './src/store'),
			socket: path.resolve(__dirname, './src/socket'),
		},
	},
	css: {
		modules: {
			localsConvention: 'camelCase',
		},
	},
	build:
		process.env.NODE_ENV === 'production'
			? {
					minify: 'terser',
				}
			: {},
	server: {
		host: true,
		port: CONFIG.clientDevPort || 3002,
	},
})
