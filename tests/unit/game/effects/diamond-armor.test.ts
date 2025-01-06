import {describe, expect, test} from '@jest/globals'
import {DiamondArmor} from 'common/cards/attach/armor'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, playCardFromHand, testGame} from '../utils'
import {DiamondSword} from 'common/cards/single-use/sword'

describe('Test Diamond Armor  Armor', () => {
	test('Diamond Armor prevents damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, DiamondArmor],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, DiamondArmor, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'primary')
					expect(
						game.components.find(
							RowComponent,
							query.row.active,
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - 20)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Diamond Armor prevents effect damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, DiamondArmor],
				playerTwoDeck: [EthosLabCommon, DiamondSword],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, DiamondArmor, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, DiamondSword, 'single_use')
					yield* attack(game, 'primary')
					expect(
						game.components.find(
							RowComponent,
							query.row.active,
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - 20 - 20)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
