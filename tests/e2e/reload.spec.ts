import {expect, test} from '@playwright/test'

test('is still connected after reload', async ({page}) => {
	await page.goto('http://localhost:9000/')
	await page.getByPlaceholder(' ').click()
	await page.getByPlaceholder(' ').fill('Test Player')
	await page.getByPlaceholder(' ').press('Enter')

	// Wait for login
	await page.waitForTimeout(1000)
	expect(await page.evaluate(() => global.getState().session.playerName)).toBe(
		'Test Player',
	)

	// We expect that the player is still logged in because the session was saved properly.
	await page.reload()
	// Wait for login
	await page.waitForTimeout(1000)
	// Verify we are reconnected as the same player.
	expect(await page.evaluate(() => global.getState().session.playerName)).toBe(
		'Test Player',
	)
})
