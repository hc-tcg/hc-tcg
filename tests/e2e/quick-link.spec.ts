import {expect, test} from '@playwright/test'

test('spectate URL works as expected', async ({page}) => {
	await page.goto('/?showUpdatesModal=false&spectate=123456')

	await page.getByPlaceholder(' ').fill('Test Player')
	await page.getByPlaceholder(' ').press('Enter')

	await page.waitForFunction(() => global.getState().session.connected)

	await expect(await page.getByTestId('spectate-code-input')).toHaveValue(
		'123456',
	)
})

test('join URL works as expected', async ({page}) => {
	await page.goto('/?showUpdatesModal=false&fight=123456')

	await page.getByPlaceholder(' ').fill('Test Player')
	await page.getByPlaceholder(' ').press('Enter')

	await page.waitForFunction(() => global.getState().session.connected)

	await expect(await page.getByTestId('join-code-input')).toHaveValue('123456')
})
