import assert from 'assert'
import {expect, test} from '@playwright/test'

test('username login works as expected', async ({context}) => {
	const page = await context.newPage()
	await page.goto('/?showUpdatesModal=false')

	await page.getByLabel('Player Name').fill('Test Player')
	await page.getByLabel('Player Name').press('Enter')

	await page.waitForFunction(() => global.getState().session.connected)
	expect(await page.evaluate(() => global.getState().session.playerName)).toBe(
		'Test Player',
	)
})

test('sync works as expected', async ({context}) => {
	const page = await context.newPage()
	await page.goto('/?showUpdatesModal=false')

	await page.getByLabel('Player Name').fill('Test Player')
	await page.getByLabel('Player Name').press('Enter')

	await page.waitForFunction(() => global.getState().session.connected)

	const secret = await page.evaluate(() =>
		localStorage.getItem('databaseInfo:secret'),
	)
	const playerUuid = await page.evaluate(() =>
		localStorage.getItem('databaseInfo:userId'),
	)

	/* Clear local storage to prevent auto login */
	await page.evaluate(() => window.localStorage.clear())

	const newTab = await context.newPage()
	await newTab.goto('/?showUpdatesModal=false')

	assert(playerUuid)
	assert(secret)

	await newTab.getByRole('button', {name: 'Sync Account'}).press('Enter')
	await newTab.getByPlaceholder('UUID').fill(playerUuid)
	await newTab.getByPlaceholder('Secret').fill(secret)
	// Match to "Sync" but not "Sync Account"
	await newTab
		.getByRole('button', {name: new RegExp('Sync[^w]')})
		.press('Enter')

	await page.waitForFunction(() => global.getState().session.connected)
	expect(await page.evaluate(() => global.getState().session.playerName)).toBe(
		'Test Player',
	)
})

test('login works after initial attempt fails', async ({context}) => {
	const page = await context.newPage()
	await page.goto('/?showUpdatesModal=false')

	// Bogus data that will make the login attempt fail
	await page.getByRole('button', {name: 'Sync Account'}).press('Enter')
	await page.getByPlaceholder('UUID').fill('zundazundazunda')
	await page.getByPlaceholder('Secret').fill('mochimochimochi')
	// Match to "Sync" but not "Sync Account"
	await page.getByRole('button', {name: new RegExp('Sync[^w]')}).press('Enter')

	await page.getByLabel('Player Name').waitFor()
	await page.getByLabel('Player Name').fill('Test Player')
	await page.getByLabel('Player Name').press('Enter')

	await page.waitForFunction(() => global.getState().session.connected)
	expect(await page.evaluate(() => global.getState().session.playerName)).toBe(
		'Test Player',
	)
})
