import {expect, test} from '@playwright/test'
import assert from 'assert'

test('sync worked as expected', async ({context}) => {
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

	const newTab = await context.newPage()
	await newTab.goto('/?showUpdatesModal=false')

	assert(userId)
	assert(secret)

	await newTab.getByLabel('Account UUID').fill(userId)
	await newTab.getByLabel('Account Secret').press(secret)
	await page.getByText('Sync').press('Enter')

	await page.waitForFunction(() => global.getState().session.connected)
	expect(await page.evaluate(() => global.getState().session.playerName)).toBe(
		'Test Player',
	)
})
