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
	await page.getByText('Join Private Game').click()
	await page.getByLabel('Enter game or spectator code:').fill(gameCode)
	await page.getByLabel('Enter game or spectator code:').fill('Enter')

	expect(await page.isVisible('Waiting'))

	await fetch('http://localhost:9000/api/games/delete', {
		method: 'DELETE',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			code: apiSecret,
		}),
	})

	expect(await page.isVisible('Public Game'))
})
