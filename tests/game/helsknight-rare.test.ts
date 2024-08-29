import {describe, expect, test} from '@jest/globals'
import HelsknightRare from 'common/cards/alter-egos/hermits/helsknight-rare'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import TNT from 'common/cards/default/single-use/tnt'
import {attack, endTurn, playCardFromHand, testGame} from './utils'

describe('Test Hels Trap Hole', () => {
	test('Test Trap Hole with TNT', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, TNT],
				playerTwoDeck: [HelsknightRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, HelsknightRare, 'hermit', 0)

					yield* attack(game, 'secondary')

					yield* endTurn(game)

					yield* playCardFromHand(game, TNT, 'single_use')

					yield* attack(game, 'single-use')

					// Check TNT attack log was sent by current player
					expect(
						game.chat.find(
							(message) =>
								message.message.TYPE === 'ListNode' &&
								message.message.nodes.find(
									(node) =>
										node.TYPE === 'PlaintextNode' &&
										node.text.includes('backlash damage'),
								),
						)?.sender.id,
					).toBe(game.currentPlayerEntity)

					expect(
						game.opponentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([TNT])
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
