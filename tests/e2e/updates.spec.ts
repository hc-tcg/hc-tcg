import {test} from '@playwright/test'

test('Updates modal shows on startup.', async ({page}) => {
	await page.goto('/')
	await page.isVisible('Latest updates')
})
