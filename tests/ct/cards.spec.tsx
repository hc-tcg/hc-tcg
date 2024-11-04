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
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BuilderDoubleItem from 'common/cards/items/builder-rare'
import GoldenAxe from 'common/cards/single-use/golden-axe'

test.use({viewport: {width: 400, height: 400}})
test.setTimeout(1_000_000)

test('Hermit card SVG', async ({mount}) => {
	for (const card of hermitCardClasses) {
		const component = await mount(
			<HermitCard card={card as any} displayTokenCost={true} />,
		)
		await expect(component).toHaveScreenshot(`${card.id}.png`)
		await component.unmount()
	}
})

test('Item card SVG', async ({mount}) => {
	for (const card of itemCardClasses) {
		const component = await mount(
			<ItemCard card={card as any} displayTokenCost={true} />,
		)
		await expect(component).toHaveScreenshot(`${card.id}.png`)
		await component.unmount()
	}
})

test('Effect card SVG', async ({mount}) => {
	for (const card of [...attachCardClasses, ...singleUseCardClasses]) {
		const component = await mount(
			<EffectCard card={card as any} displayTokenCost={true} />,
		)
		await expect(component).toHaveScreenshot(`${card.id}.png`)
		await component.unmount()
	}
})
