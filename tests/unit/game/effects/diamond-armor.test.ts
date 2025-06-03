import {describe, expect, test} from '@jest/globals'
import {DiamondArmor} from 'common/cards/attach/armor'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import {IronSword} from 'common/cards/single-use/sword'
import {DiamondSword} from 'common/cards/single-use/sword'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, playCardFromHand, testGame} from '../utils'

describe('Test Diamond Armor', () => {
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
	test('Diamond Armor prevents a extra effect damage collectively', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, DiamondArmor],
				playerTwoDeck: [GeminiTayRare, IronSword, IronSword],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, DiamondArmor, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 0)
					yield* playCardFromHand(game, IronSword, 'single_use')
					yield* attack(game, 'secondary')
					yield* playCardFromHand(game, IronSword, 'single_use')
					yield* attack(game, 'single-use')
					expect(
						game.components.find(
							RowComponent,
							query.row.active,
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - GeminiTayRare.secondary.damage) // (80[secondary] - 20[block]) - (20[ISword] - 20[eblock]) + 20[ISword] damage
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
