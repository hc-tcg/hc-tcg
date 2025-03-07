import {expect, test} from '@playwright/test'

test('is still connected after reload', async ({page}) => {
	await page.goto('/?showUpdatesModal=false')

	await page.getByLabel('Player Name').fill('Test Player')
	await page.getByLabel('Player Name').press('Enter')

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
	await page.goto('/?showUpdatesModal=false')

	await page.getByLabel('Player Name').fill('Test Player')
	await page.getByLabel('Player Name').press('Enter')

	await page.waitForFunction(() => {
		console.log(global.getState().session.connected)
		return global.getState().session.connected
	})

	let playerId = await page.evaluate(() => global.getState().session.playerId)

	await page.getByRole('button', {name: 'Play'}).click()
	await page.getByRole('heading', {name: 'Public Game'}).click()
	await page.getByRole('button', {name: 'Join Queue'}).click()

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
	expect(await page.evaluate(() => global.getState().matchmaking.status)).toBe(
		null,
	)
})

test('Game state updates if socket is restarted during game.', async ({
	page: playerOne,
	context,
}) => {
	const playerTwo = await context.newPage()

	await playerOne.goto('/?showUpdatesModal=false')
	await playerTwo.goto('/?showUpdatesModal=false')

	await playerOne.getByLabel('Player Name').fill('Test Player')
	await playerOne.getByLabel('Player Name').press('Enter')
	await playerTwo.getByLabel('Player Name').fill('Test Player')
	await playerTwo.getByLabel('Player Name').press('Enter')

	await playerOne.getByRole('button', {name: 'Play'}).click()
	await playerOne.getByRole('heading', {name: 'Public Game'}).click()
	await playerOne.getByRole('button', {name: 'Join Queue'}).click()
	await playerTwo.getByRole('button', {name: 'Play'}).click()
	await playerTwo.getByRole('heading', {name: 'Public Game'}).click()
	await playerTwo.getByRole('button', {name: 'Join Queue'}).click()

	// Mathcmaking can take up to 3 seconds
	await playerOne.waitForTimeout(4000)

	let firstGameStateTime = await playerOne.evaluate(
		() => global.getState().game.time,
	)

	expect(typeof firstGameStateTime).toBe('number')

	await playerOne.evaluate(() =>
		global.getState().socketStatus.socket.disconnect(),
	)

	await playerOne.waitForTimeout(1000)

	await playerOne.evaluate(() =>
		global.getState().socketStatus.socket.connect(),
	)

	await playerOne.waitForTimeout(1000)

	let secondGameStateTime = await playerOne.evaluate(
		() => global.getState().game.time,
	)

	expect(typeof secondGameStateTime).toBe('number')

	// The second game state should be newer because it was recieved on the reconnect.
	expect(firstGameStateTime).toBeLessThan(secondGameStateTime)
})
test('Automatic reconnect if session is invalid.', async ({page}) => {
	await page.goto('/')
	await page.getByLabel('Player Name').fill('Test Player')
	await page.getByLabel('Player Name').press('Enter')

	await page.waitForFunction(() => {
		console.log(global.getState().session.connected)
		return global.getState().session.connected
	})

	await page.evaluate(() => {
		// Set up bogus data
		sessionStorage.setItem('playerName', 'zunda')
		sessionStorage.setItem('censoredPlayerName', 'mochi')
		sessionStorage.setItem('playerId', 'mochimochi')
		sessionStorage.setItem('playerSecret', 'zunda')
	})

	await page.reload()

	await page.waitForFunction(() => {
		console.log(global.getState().session.connected)
		return global.getState().session.connected
	})

	// Make sure the session really did get updated
	expect(await page.evaluate(() => {
		return [
			sessionStorage.getItem('playerName'),
			sessionStorage.getItem('censoredPlayerName'),
			sessionStorage.getItem('playerId'),
			sessionStorage.getItem('playerSecret'),
		]
	})).not.toStrictEqual(['zunda', 'mochi', 'mochimochi', 'zunda'])
})
