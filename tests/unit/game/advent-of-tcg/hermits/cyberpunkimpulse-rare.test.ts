import {describe, expect, test} from '@jest/globals'
import CyberpunkImpulseRare from 'common/cards/advent-of-tcg/hermits/cyberpunkimpulse-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import FarmItem from 'common/cards/items/farm-common'
import RedstoneItem from 'common/cards/items/redstone-common'
import WildItem from 'common/cards/items/wild-common'
import {getAvailableEnergy} from 'server/routines/game'
import {endTurn, playCardFromHand, testGame} from '../../utils'

describe('Test Cyberpunk Impulse', () => {
	test('Energy transferred', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					CyberpunkImpulseRare,
					WildItem,
					RedstoneItem,
				],
				playerTwoDeck: [EthosLabCommon, CyberpunkImpulseRare, FarmItem],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, CyberpunkImpulseRare, 'hermit', 1)
					yield* playCardFromHand(game, WildItem, 'item', 1, 0)
					expect(getAvailableEnergy(game)).toStrictEqual([])
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, CyberpunkImpulseRare, 'hermit', 1)
					yield* playCardFromHand(game, FarmItem, 'item', 1, 0)

					expect(getAvailableEnergy(game)).toStrictEqual(['any'])
					yield* endTurn(game)

					yield* playCardFromHand(game, RedstoneItem, 'item', 1, 1)
					expect(getAvailableEnergy(game)).toStrictEqual([])
				},
			},
			{},
		)
	})
})
