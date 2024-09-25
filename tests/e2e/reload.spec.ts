import {expect, test} from '@playwright/test'

test('is still connected after reload', async ({page}) => {
	await page.goto('/')

	await page.getByPlaceholder(' ').fill('Test Player')
	await page.getByPlaceholder(' ').press('Enter')

	await page.waitForFunction(() => global.getState().session.connected)
	expect(await page.evaluate(() => global.getState().session.playerName)).toBe(
		'Test Player',
	)

	// We expect that the player is still logged in because the session was saved properly.
	await page.reload()
	await page.waitForFunction(() => global.getState().session.connected)
	// Verify we are reconnected as the same player.
	expect(await page.evaluate(() => global.getState().session.playerName)).toBe(
		'Test Player',
	)
})

test('player does not stay in queue after reloading the page', async ({
	page,
}) => {
	await page.goto('/')

	await page.getByPlaceholder(' ').fill('Test Player')
	await page.getByPlaceholder(' ').press('Enter')

	await page.waitForFunction(() => {
		console.log(global.getState().session.connected)
		return global.getState().session.connected
	})

	let playerId = page.evaluate(() => global.getState().session.playerId)
	await page.getByText(/Public Game/).click()

	let queue = await (
		await fetch('http://localhost:9000/debug/root-state/queue')
	).json()

	expect(queue).toContain(playerId)

	await page.reload()
	await page.waitForFunction(() => global.getState().session.connected)

	// We should be automatically removed from the queue.
	queue = await (
		await fetch('http://localhost:9000/debug/root-state/queue')
	).json()
	expect(queue).not.toContain(playerId)
	expect(queue).not.toContain(playerId)
	expect(page.evaluate(() => global.getState().matching.status)).toBe(null)
})
