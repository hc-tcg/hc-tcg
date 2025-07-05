import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import FarmerBeefCommon from 'common/cards/hermits/farmerbeef-common'
import IJevinRare from 'common/cards/hermits/ijevin-rare'
import {printBoardState} from 'server/utils'
import {testGame} from '../utils'

describe('Test iJevin Peace Out', () => {
	test('Test Peace Out when opponent times out request', async () => {
		await testGame(
			{
				playerOneDeck: [IJevinRare],
				playerTwoDeck: [EthosLabCommon, FarmerBeefCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(IJevinRare, 'hermit', 0)

					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(FarmerBeefCommon, 'hermit', 2)

					await test.endTurn()

					await test.attack('secondary')

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
