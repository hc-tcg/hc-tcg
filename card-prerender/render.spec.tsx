import {expect, test} from '@playwright/experimental-ct-react'
import EffectCard from 'client/components/card/effect-card-svg'
import HermitCard from 'client/components/card/hermit-card-svg'
import ItemCard from 'client/components/card/item-card-svg'
import {
	attachCardClasses,
	hermitCardClasses,
	itemCardClasses,
	singleUseCardClasses,
} from 'common/cards'

test.use({viewport: {width: 400, height: 400}})

test('Hermit card SVG', async ({mount}) => {
	for (const card of hermitCardClasses) {
		let component = await mount(
			<HermitCard card={card as any} displayTokenCost={false} />,
		)
		await expect(component).toHaveScreenshot(`${card.id}.png`)
		await component.unmount()
		component = await mount(
			<HermitCard card={card as any} displayTokenCost={true} />,
		)
		await expect(component).toHaveScreenshot(`${card.id}-with-tokens.png`)
		await component.unmount()
	}
})

test('Item card SVG', async ({mount}) => {
	for (const card of itemCardClasses) {
		let component = await mount(
			<ItemCard card={card as any} displayTokenCost={false} />,
		)
		await expect(component).toHaveScreenshot(`${card.id}.png`)
		await component.unmount()
		component = await mount(
			<ItemCard card={card as any} displayTokenCost={true} />,
		)
		await expect(component).toHaveScreenshot(`${card.id}-with-tokens.png`)
		await component.unmount()
	}
})

test('Effect card SVG', async ({mount}) => {
	for (const card of [...attachCardClasses, ...singleUseCardClasses]) {
		let component = await mount(
			<EffectCard card={card as any} displayTokenCost={false} />,
		)
		await expect(component).toHaveScreenshot(`${card.id}.png`)
		await component.unmount()
		component = await mount(
			<EffectCard card={card as any} displayTokenCost={true} />,
		)
		await expect(component).toHaveScreenshot(`${card.id}-with-tokens.png`)
		await component.unmount()
	}
})
