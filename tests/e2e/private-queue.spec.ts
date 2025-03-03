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

	await page.getByPlaceholder('Player Name').fill('Test Player')
	await page.getByPlaceholder('Player Name').press('Enter')
	await page.getByRole('button', {name: 'Play'}).click()

	await page.getByRole('heading', {name: 'Private Game'}).click()

	await page.getByRole('button', {name: 'Join Game'}).click()
	await page.getByPlaceholder('Enter code...').fill(gameCode)
	await page.getByRole('button', {name: 'Confirm'}).click()

	await page.getByText('Waiting').waitFor()

	await fetch('http://localhost:9000/api/games/cancel', {
		method: 'DELETE',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			code: apiSecret,
		}),
	})

	// We should be kicked back to the "Join Private Game" screen
	await page.getByText('Join Private Game').waitFor()
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

	await page.getByPlaceholder('Player Name').fill('Test Player')
	await page.getByPlaceholder('Player Name').press('Enter')

	await page.getByRole('button', {name: 'Play'}).click()
	await page.getByRole('heading', {name: 'Private Game'}).click()

	await page.getByRole('button', {name: 'Spectate Game'}).click()
	await page.getByPlaceholder('Enter spectator code...').fill(spectatorCode)
	await page.getByRole('button', {name: 'Confirm'}).click()

	await page.getByText('Waiting').waitFor()

	await fetch('http://localhost:9000/api/games/cancel', {
		method: 'DELETE',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			code: apiSecret,
		}),
	})

	// We should be kicked back to the "Spectate Private Game" screen
	await page.getByText('Spectate Private Game').waitFor()
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

	await page.getByPlaceholder('Player Name').fill('Test Player')
	await page.getByPlaceholder('Player Name').press('Enter')

	await page.getByRole('button', {name: 'Play'}).click()

	await page.getByRole('heading', {name: 'Private Game'}).click()

	await page.getByRole('button', {name: 'Join Game'}).click()
	await page.getByPlaceholder('Enter code...').fill(gameCode)
	await page.getByRole('button', {name: 'Confirm'}).click()

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

	await page.getByPlaceholder('Player Name').fill('Test Player')
	await page.getByPlaceholder('Player Name').press('Enter')

	await page.getByRole('button', {name: 'Play'}).click()
	await page.getByRole('heading', {name: 'Private Game'}).click()

	await page.getByRole('button', {name: 'Spectate Game'}).click()
	await page.getByPlaceholder('Enter spectator code...').fill(spectatorCode)
	await page.getByRole('button', {name: 'Confirm'}).click()

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

test('Game starts for players and spectators and places players back on main menu.', async ({
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

	await spectator.getByPlaceholder('Player Name').fill('Test Player')
	await spectator.getByPlaceholder('Player Name').press('Enter')
	await spectator.getByRole('button', {name: 'Play'}).click()
	await spectator.getByRole('heading', {name: 'Private Game'}).click()
	await spectator.getByRole('button', {name: 'Spectate Game'}).click()
	await spectator
		.getByPlaceholder('Enter spectator code...')
		.fill(spectatorCode)
	await spectator.getByRole('button', {name: 'Confirm'}).click()

	for (const player of [playerOne, playerTwo]) {
		await player.getByPlaceholder('Player Name').fill('Test Player')
		await player.getByPlaceholder('Player Name').press('Enter')
		await player.getByRole('button', {name: 'Play'}).click()
		await player.getByRole('heading', {name: 'Private Game'}).click()
		await player.getByRole('button', {name: 'Join Game'}).click()
		await player.getByPlaceholder('Enter code...').fill(gameCode)
		await player.getByRole('button', {name: 'Confirm'}).click()
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
		await player.getByText('Main Menu').click()
	}

	for (const player of [playerOne, playerTwo, spectator]) {
		// Verify the player is on the game select menu.
		await player.getByRole('button', {name: 'Play'}).waitFor()
	}
})
