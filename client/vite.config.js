import path from 'path'
import { defineConfig } from 'vite'
import preact from "@preact/preset-vite";
import CONFIG from '../common/config/server-config.json'
import { getAppVersion } from '../version'

export default defineConfig({
	plugins: [preact()],
	define: {
		__ENV__: JSON.stringify(process.env.NODE_ENV),
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
	    react: 'preact/compat',
	    'react-dom': 'preact/compat',
			// Allows react-three.js to work with preact
	    'react-reconciler': 'preact-reconciler',
		},
	},
	css: {
		modules: {
			localsConvention: 'camelCase',
		},
	},
	build: {
		minify: 'terser',
	},
	server: {
		port: CONFIG.clientDevPort || 3002,
	},
})
