import {expect, test} from '@playwright/test'
import assert from 'assert'

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
	const userId = await page.evaluate(() =>
		localStorage.getItem('databaseInfo:userId'),
	)

	/* Clear local storage to prevent auto login */
	await page.evaluate(() => window.localStorage.clear())

	const newTab = await context.newPage()
	await newTab.goto('/?showUpdatesModal=false')

	assert(userId)
	assert(secret)

	await newTab.getByLabel('Account UUID').fill(userId)
	await newTab.getByLabel('Account Secret').fill(secret)
	await page.getByRole('button', {name: 'Sync'}).press('Enter')

	await page.waitForFunction(() => global.getState().session.connected)
	expect(await page.evaluate(() => global.getState().session.playerName)).toBe(
		'Test Player',
	)
})

test('login works after initial attempt fails', async ({context}) => {
	const page = await context.newPage()
	await page.goto('/?showUpdatesModal=false')

	// Bogus data that will make the login attempt fail
	await page.getByLabel('Account UUID').fill('zundazundazunda')
	await page.getByLabel('Account Secret').fill('mochimochimochi')
	await page.getByRole('button', {name: 'Sync'}).press('Enter')

	await page.getByLabel('Player Name').waitFor()
	await page.getByLabel('Player Name').fill('Test Player')
	await page.getByLabel('Player Name').press('Enter')

	await page.waitForFunction(() => global.getState().session.connected)
	expect(await page.evaluate(() => global.getState().session.playerName)).toBe(
		'Test Player',
	)
})
