import {expect, test} from '@playwright/test'

test.setTimeout(30000)

test('Private queue is exited when API game is cancelled (Opponent Code)', async ({
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

test('Private queue is exited when API game is cancelled (Spectator Code)', async ({
	page,
}) => {
	await page.goto('/?showUpdatesModal=false')

	let privateGame = await (
		await fetch('http://localhost:9000/api/games/create')
	).json()

	let spectatorCode = privateGame.spectatorCode
	let apiSecret = privateGame.apiSecret

	await page.getByPlaceholder(' ').fill('Test Player')
	await page.getByPlaceholder(' ').press('Enter')
	await page.getByText(' Private Game').click()
	await page.getByLabel('Enter code:').fill(spectatorCode)
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

test('Player is removed from private queue when they press "Cancel" (Opponent Code)', async ({
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

test('Player is removed from private queue when they press "Cancel" (Spectator Code)', async ({
	page,
}) => {
	await page.goto('/?showUpdatesModal=false')

	let privateGame = await (
		await fetch('http://localhost:9000/api/games/create')
	).json()

	let spectatorCode = privateGame.spectatorCode
	let apiSecret = privateGame.apiSecret

	await page.getByPlaceholder(' ').fill('Test Player')
	await page.getByPlaceholder(' ').press('Enter')
	await page.getByText('Private Game').click()
	await page.getByLabel('Enter code:').fill(spectatorCode)
	await page.getByLabel('Enter code:').press('Enter')

	await page.getByText('Cancel').waitFor()

	expect(
		(
			await (
				await fetch(
					`http://localhost:9000/debug/root-state/private-queue/${apiSecret}`,
				)
			).json()
		).spectatorsWaiting,
	).toHaveProperty('length', 1)

	await page.getByText('Cancel').click()

	await page.waitForTimeout(1000)

	expect(
		(
			await (
				await fetch(
					`http://localhost:9000/debug/root-state/private-queue/${apiSecret}`,
				)
			).json()
		).spectatorsWaiting,
	).toStrictEqual([])
})

test('Game starts for players and spectators and places players back on title screen.', async ({
	context,
	page: playerOne,
}) => {
	const playerTwo = await context.newPage()
	const spectator = await context.newPage()

	await playerOne.goto('/?showUpdatesModal=false')
	await playerTwo.goto('/?showUpdatesModal=false')
	await spectator.goto('/?showUpdatesModal=false')

	let privateGame = await (
		await fetch('http://localhost:9000/api/games/create')
	).json()

	let gameCode = privateGame.gameCode
	let spectatorCode = privateGame.spectatorCode

	await spectator.getByPlaceholder(' ').fill('Spectator')
	await spectator.getByPlaceholder(' ').press('Enter')
	await spectator.getByText(' Private Game').click()
	await spectator.getByLabel('Enter code:').fill(spectatorCode)
	await spectator.getByLabel('Enter code:').press('Enter')

	for (const player of [playerOne, playerTwo]) {
		await player.getByPlaceholder(' ').fill('Test Player')
		await player.getByPlaceholder(' ').press('Enter')
		await player.getByText(' Private Game').click()
		await player.getByLabel('Enter code:').fill(gameCode)
		await player.getByLabel('Enter code:').press('Enter')
	}

	// Give the server three seconds to start the game
	await playerOne.waitForTimeout(3000)

	for (const player of [playerOne, playerTwo, spectator]) {
		await expect(
			await player.evaluate(() => global.getState().matchmaking.status),
		).toBe('in_game')
	}

	// After the game is over, players should be placed on the title screen.
	await playerOne.getByTitle('Forfeit').click()
	await playerOne.getByText('Forfeit', {exact: true}).click()

	for (const player of [playerOne, playerTwo, spectator]) {
		await player.getByText('Return').click()
	}

	for (const player of [playerOne, playerTwo, spectator]) {
		// Verify the player is on the main menu.
		await player.getByText('Public Game').waitFor()
	}
})
