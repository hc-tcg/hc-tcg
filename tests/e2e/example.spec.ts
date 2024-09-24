import {expect, test} from '@playwright/test'

test('has correct title', async ({page}) => {
	await page.goto('http://localhost:9000/')

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/Hermitcraft TCG/)
})
