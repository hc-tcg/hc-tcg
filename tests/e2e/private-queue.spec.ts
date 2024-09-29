import {expect, test} from '@playwright/test'

test('Private queue is exited when API game is cancelled', async ({page}) => {
	await page.goto('/?showUpdatesModal=false')

	let privateGame = await (
		await fetch('http://localhost:9000/api/games/create')
	).json()

	let gameCode = privateGame.gameCode
	let apiSecret = privateGame.apiSecret

	await page.getByPlaceholder(' ').fill('Test Player')
	await page.getByPlaceholder(' ').press('Enter')
	await page.getByText(' Private Game').click()
	await page.getByLabel('Enter code:').fill(gameCode)
	await page.getByLabel('Enter code:').press('Enter')

	await page.getByText('Waiting').waitFor()

	await fetch('http://localhost:9000/api/games/cancel', {
		method: 'DELETE',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			code: apiSecret,
		}),
	})

	await page.getByText('Public Game').waitFor()
})

test('Player is removed from private queue when they press "Cancel"', async ({
	page,
}) => {
	await page.goto('/?showUpdatesModal=false')

	let privateGame = await (
		await fetch('http://localhost:9000/api/games/create')
	).json()

	let gameCode = privateGame.gameCode
	let apiSecret = privateGame.apiSecret

	await page.getByPlaceholder(' ').fill('Test Player')
	await page.getByPlaceholder(' ').press('Enter')
	await page.getByText('Private Game').click()
	await page.getByLabel('Enter code:').fill(gameCode)
	await page.getByLabel('Enter code:').press('Enter')

	await page.getByText('Cancel').waitFor()

	let playerId = await page.evaluate(() => global.getState().session.playerId)

	expect(
		await (
			await fetch(
				`http://localhost:9000/debug/root-state/private-queue/${apiSecret}`,
			)
		).json(),
	).toHaveProperty('playerId', playerId)

	await page.getByText('Cancel').click()

	await page.waitForTimeout(1000)

	expect(
		await (
			await fetch(
				`http://localhost:9000/debug/root-state/private-queue/${apiSecret}`,
			)
		).json(),
	).toHaveProperty('playerId', null)
})
