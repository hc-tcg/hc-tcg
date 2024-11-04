import {expect, test} from '@playwright/experimental-ct-react'
import Toast from 'client/components/toast/toast'

test('Toast Without Image', async ({mount}) => {
	const component = await mount(
		<Toast title="Test Title" description="Test Description" id={0} />,
	)
	await expect(component).toHaveScreenshot()
})

test('Toast With Image', async ({mount}) => {
	const component = await mount(
		<Toast
			title="Test Title"
			description="Test Description"
			image={'/images/types/type-balanced.png'}
			id={0}
		/>,
	)
	await expect(component).toHaveScreenshot()
})
