import {describe, expect, test} from '@jest/globals'
import HermitCard from 'client/components/card/hermit-card-svg'
import ItemCard from 'client/components/card/item-card-svg'
import EffectCard from 'client/components/card/effect-card-svg'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import * as ReactTestRenderer from 'react-test-renderer'
import BuilderDoubleItem from 'common/cards/default/items/builder-rare'
import GoldenAxe from 'common/cards/default/single-use/golden-axe'

describe('Test card snapshots', () => {
	test('Hermit card SVG', () => {
		const render = ReactTestRenderer.create(
			<HermitCard card={EthosLabCommon} showCost={true} />,
		)
		expect(render.toJSON()).toMatchSnapshot()
	})
	test('Item Card SVG', () => {
		const render = ReactTestRenderer.create(
			<ItemCard card={BuilderDoubleItem} showCost={true} />,
		)
		expect(render.toJSON()).toMatchSnapshot()
	})
	test('Effect Card SVG', () => {
		const render = ReactTestRenderer.create(
			<EffectCard card={GoldenAxe} showCost={true} />,
		)
		expect(render.toJSON()).toMatchSnapshot()
	})
})
