import {describe, expect, test} from '@jest/globals'
import BoomerBdubsCommon from 'common/cards/hermits/boomerbdubs-common'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import MumboJumboRare from 'common/cards/hermits/mumbojumbo-rare'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Mumbo Jumbo', () => {
	test('Test Double Damage Activates Only With Base Set Pranksters', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					MumboJumboRare,
					MumboJumboRare,
					EthosLabCommon,
					BoomerBdubsCommon,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)

					await test.endTurn()

					await test.playCardFromHand(MumboJumboRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(BoomerBdubsCommon, 'hermit', 3)

					await test.attack('secondary')

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.active,
						)?.health,
					).toBe(EthosLabCommon.health - 80 /* x1 Double Heads */)

					await test.endTurn()

					await test.endTurn()

					await test.playCardFromHand(MumboJumboRare, 'hermit', 1)

					await test.attack('secondary')

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.active,
						)?.health,
					).toBe(EthosLabCommon.health - 240 /* x(1+2) Double Heads */)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
