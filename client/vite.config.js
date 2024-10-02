import path from 'path'
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'
import CONFIG from '../common/config/server-config.json'
import {getAppVersion} from '../version'

export default defineConfig({
	plugins: [react()],
	define: {
		__ENV__: JSON.stringify(process.env.NODE_ENV),
		__DEBUG_BUILD__: JSON.stringify(process.env.NODE_ENV !== 'production'),
		__PORT__: JSON.stringify(CONFIG.port),
		__LIMITS__: JSON.stringify(CONFIG.limits),
		__LOGO_SUBTEXT__: JSON.stringify(CONFIG.logoSubText),
		__APP_VERSION__: `'${getAppVersion()}'`,
	},
	target: ["esnext"],
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
		port: CONFIG.clientDevPort || 3002,
	},
})
