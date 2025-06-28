import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GoatfatherRare from 'common/cards/hermits/goatfather-rare'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Goatfather Rare', () => {
	test('Test anvil drop does the proper amount of damage', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [GoatfatherRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(GoatfatherRare, 'hermit', 0)
					await test.attack('secondary')

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							(GoatfatherRare.secondary.damage + 30) /*Anvil damage*/,
					)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 10 /*Anvil damage*/)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
