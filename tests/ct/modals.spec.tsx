import {expect, test} from '@playwright/experimental-ct-react'
import {ConfirmModal} from 'client/components/modal/modal'
import {AlertModal} from 'client/components/modal/modal'

test('Confirm Modal', async ({mount}) => {
	const component = await mount(
		<ConfirmModal
			setOpen
			title="Confirm Modal Test"
			description="This is a test of the confirm modal visuals."
			onCancel={() => {}}
			onConfirm={() => {}}
		/>,
	)
	await expect(component).toHaveScreenshot()
})

test('Altert Modal', async ({mount}) => {
	const component = await mount(
		<AlertModal
			setOpen
			title="Alert Modal Test"
			description="This is a test of the alert modal visuals."
			onClose={() => {}}
		/>,
	)
	await expect(component).toHaveScreenshot()
})
