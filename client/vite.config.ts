import path from 'path'
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			server: path.resolve(__dirname, '../server'),
			types: path.resolve(__dirname, './src/types'),
			components: path.resolve(__dirname, './src/components'),
		},
	},
	css: {
		modules: {
			localsConvention: 'camelCaseOnly',
		},
	},
	build: {
		minify: 'terser',
	},
	server: {
		port: 3002,
	},
})
