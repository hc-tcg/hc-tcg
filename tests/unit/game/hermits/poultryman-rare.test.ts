import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import HelsknightRare from 'common/cards/hermits/helsknight-rare'
import PoultryManRare from 'common/cards/hermits/poultryman-rare'
import BadOmen from 'common/cards/single-use/bad-omen'
import Egg from 'common/cards/single-use/egg'
import GoldenAxe from 'common/cards/single-use/golden-axe'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Poutry Man Rare', () => {
	test('Poultry Man only recycles Egg.', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [PoultryManRare, Egg, GoldenAxe],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)

					await test.endTurn()

					await test.playCardFromHand(PoultryManRare, 'hermit', 0)
					await test.playCardFromHand(Egg, 'single_use')
					await test.attack('secondary')

					expect(game.state.pickRequests).toHaveLength(1)

					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(game.opponentPlayer.activeRow?.index).toBe(1)

					// Hand should contain Egg and Golden Axe.
					expect(game.currentPlayer.getHand()?.length).toBe(2)

					await test.endTurn()
					await test.endTurn()

					await test.playCardFromHand(GoldenAxe, 'single_use')
					await test.attack('secondary')

					// Hand should only contain Egg.
					expect(game.currentPlayer.getHand()?.length).toBe(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Poultry Man recycles Egg on tails.', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, BadOmen],
				playerTwoDeck: [PoultryManRare, Egg],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)

					await test.endTurn()

					await test.playCardFromHand(PoultryManRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(Egg, 'single_use')
					await test.attack('secondary')

					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(game.opponentPlayer.activeRow?.index).toBe(1)

					// Hand should contain Egg.
					expect(game.currentPlayer.getHand()?.length).toBe(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Poultry Man does not recycle Egg when Trap Hole flips heads', async () => {
		await testGame(
			{
				playerOneDeck: [PoultryManRare, Egg],
				playerTwoDeck: [HelsknightRare, EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(PoultryManRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(HelsknightRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(Egg, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(game.opponentPlayer.activeRow?.index).toBe(1)

					// Opponent hand should contain Egg.
					expect(game.currentPlayer.getHand()).toHaveLength(0)
					expect(
						game.opponentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([Egg])
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
