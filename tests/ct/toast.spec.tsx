import {expect, test} from '@playwright/experimental-ct-react'
import {ToastInner} from 'client/components/toast/toast'

test.use({viewport: {width: 400, height: 100}})

test('Toast Without Image', async ({mount}) => {
	const component = await mount(
		<ToastInner
			title="Test Title"
			description="Test Description"
			playSound={(_) => {}}
			close={() => {}}
		/>,
	)
	await expect(component).toHaveScreenshot()
})

test('Toast With Image', async ({mount}) => {
	const component = await mount(
		<ToastInner
			title="Test Title"
			description="Test Description"
			image={'/images/types/type-balanced.png'}
			playSound={(_) => {}}
			close={() => {}}
		/>,
	)
	await expect(component).toHaveScreenshot()
})
