import {execSync} from 'child_process'
import path from 'path'
import {defineConfig, devices} from '@playwright/experimental-ct-react'

// I am sorry
const __dirname = execSync('git rev-parse --show-toplevel').toString().trim()

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: './tests/ct/',
	/* The base directory, relative to the config file, for snapshot files created with toMatchSnapshot and toHaveScreenshot. */
	snapshotDir: './tests/ct/__snapshots__',
	/* Maximum time one test can run for. */
	timeout: 10 * 1000,
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: 'html',
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',

		/* Port to use for Playwright component endpoint. */
		ctPort: 3100,
		ctViteConfig: {
			resolve: {
				alias: {
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
