import path from 'path'
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
//@ts-ignore
import config from '../server-config.json' assert {type: 'json'}
// import eslint from 'vite-plugin-eslint'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	define: {
		__ENV__: JSON.stringify(process.env.NODE_ENV),
		__PORT__: JSON.stringify(config.port),
		__LIMITS__: JSON.stringify(config.limits),
	},
	resolve: {
		alias: {
			server: path.resolve(__dirname, '../server'),
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
	build: {
		minify: 'terser',
	},
	server: {
		port: config.clientDevPort || 3002,
	},
})
