import {expect, test} from '@playwright/experimental-ct-react'
import EffectCard from 'client/components/card/effect-card-svg'
import HermitCard from 'client/components/card/hermit-card-svg'
import ItemCard from 'client/components/card/item-card-svg'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import BuilderDoubleItem from 'common/cards/default/items/builder-rare'
import GoldenAxe from 'common/cards/default/single-use/golden-axe'

test.use({viewport: {width: 400, height: 400}})

test('Hermit card SVG', async ({mount}) => {
	const component = await mount(
		<HermitCard card={EthosLabCommon} displayTokenCost={true} />,
	)
	await expect(component).toHaveScreenshot()
})

test('Item card SVG', async ({mount}) => {
	const component = await mount(
		<ItemCard card={BuilderDoubleItem} displayTokenCost={true} />,
	)
	await expect(component).toHaveScreenshot()
})

test('Effect card SVG', async ({mount}) => {
	const component = await mount(
		<EffectCard card={GoldenAxe} displayTokenCost={true} />,
	)
	await expect(component).toHaveScreenshot()
})
