import {describe, expect, test} from '@jest/globals'
import HermitCard from 'client/components/card/hermit-card-svg'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import * as ReactTestRenderer from 'react-test-renderer'

describe('Test card snapshots', () => {
	test('Hermit card SVG', () => {
		const render = ReactTestRenderer.create(
			<HermitCard card={EthosLabCommon} showCost={true} />,
		)
		expect(render.toJSON()).toMatchSnapshot()
	})
})
