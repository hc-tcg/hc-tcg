import path from 'path'
import {defineConfig, devices} from '@playwright/experimental-ct-react'

const __dirname = './'

export default defineConfig({
	testDir: './card-prerender/',
	timeout: 0,
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: process.env.CI ? 4 : undefined,
	reporter: 'html',
	use: {
		trace: process.env.CI ? 'on-first-retry' : 'on',
		ctPort: 3100,
		ctTemplateDir: 'tests/ct/template',
		ctViteConfig: {
			publicDir: path.resolve(__dirname, 'client/public/'),
			resolve: {
				alias: {
					client: path.resolve(__dirname, 'client/src'),
					server: path.resolve(__dirname, 'server'),
					common: path.resolve(__dirname, 'common'),
					types: path.resolve(__dirname, 'client/src/types'),
					sagas: path.resolve(__dirname, 'client/src/sagas'),
					components: path.resolve(__dirname, 'client/src/components'),
					logic: path.resolve(__dirname, 'client/src/logic'),
					store: path.resolve(__dirname, 'client/src/store'),
					socket: path.resolve(__dirname, 'client/src/socket'),
				},
			},
		},
	},
	/* Configure projects for major browsers */
	projects: [
		{
			name: 'firefox',
			use: {...devices['Desktop Firefox']},
		},
	],
})
