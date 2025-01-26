import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import FarmerBeefCommon from 'common/cards/hermits/farmerbeef-common'
import IJevinRare from 'common/cards/hermits/ijevin-rare'
import {printBoardState} from 'server/utils'
import {attack, endTurn, playCardFromHand, testGame} from '../utils'

describe('Test iJevin Peace Out', () => {
	test('Test Peace Out when opponent times out request', () => {
		testGame(
			{
				playerOneDeck: [IJevinRare],
				playerTwoDeck: [EthosLabCommon, FarmerBeefCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, IJevinRare, 'hermit', 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, FarmerBeefCommon, 'hermit', 2)

					yield* endTurn(game)

					yield* attack(game, 'secondary')

					expect(game.state.pickRequests).toHaveLength(1)

					// Manually timeout request
					game.removePickRequest(0, true)
					if (game.settings.verboseLogging) {
						console.info(`${game.logHeader} Manually timed out pick request 0`)
						printBoardState(game)
					}

					expect(game.opponentPlayer.activeRow?.index).toBe(2)
					expect(game.opponentPlayer.activeRow?.playerId).toBe(
						game.opponentPlayerEntity,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
