import {expect, test} from '@playwright/test'

test('has correct title', async ({page}) => {
	await page.goto('http://localhost:9000/')

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/Hermitcraft TCG/)
})

test('is still connected after reload', async ({page}) => {
	await page.goto('http://localhost:9000/')
	await page.getByPlaceholder(' ').click()
	await page.getByPlaceholder(' ').fill('Test Player')
	await page.getByPlaceholder(' ').press('Enter')
	// We expect that the player is still logged in because the session was saved properly.
	await page.reload()
	// We check that the big HC-TCG logo is there.
	await expect(page.locator('._logo_6trod_2 > img')).toBeVisible()
})
