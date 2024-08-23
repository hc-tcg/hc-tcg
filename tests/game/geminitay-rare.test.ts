import {describe, expect, test} from '@jest/globals'
import IronArmor from 'common/cards/default/effects/iron-armor'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/default/hermits/geminitay-rare'
import GoldenAxe from 'common/cards/default/single-use/golden-axe'
import IronSword from 'common/cards/default/single-use/iron-sword'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, playCardFromHand, testGame} from './utils'

describe('Test Gemini Tay', () => {
	test('Test Axe Functions Until End Of Turn', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, IronArmor],
				playerTwoDeck: [GeminiTayRare, GoldenAxe, IronSword],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, IronArmor, 'attach', 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 0)
					yield* playCardFromHand(game, GoldenAxe, 'single_use')

					yield* attack(game, 'secondary')

					yield* playCardFromHand(game, IronSword, 'single_use')
					yield* attack(game, 'single-use')

					// We expect that the iron armor attached to etho did not block any damage.
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.active,
						)?.health,
					).toBe(
						EthosLabCommon.health -
							80 /* Gem Secondary */ -
							40 /* Golden Axe */ -
							20 /* Iron Sword*/,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
