import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GoatfatherRare from 'common/cards/hermits/goatfather-rare'
import ZedaphPlaysRare from 'common/cards/hermits/zedaphplays-rare'
import PotionOfWeakness from 'common/cards/single-use/potion-of-weakness'
import TNT from 'common/cards/single-use/tnt'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Zedaph Sheep Stare', () => {
	test('Sheep Stare functionality', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, TNT],
				playerTwoDeck: [ZedaphPlaysRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(ZedaphPlaysRare, 'hermit', 0)
					await test.attack('primary')
					await test.endTurn()

					await test.playCardFromHand(TNT, 'single_use')
					await test.attack('primary')
					expect(
						game.currentPlayer.coinFlips.filter((flip) => flip.opponentFlip),
					).toHaveLength(1)
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health -
							ZedaphPlaysRare.primary.damage -
							EthosLabCommon.primary.damage -
							20 /** TNT backlash */,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						ZedaphPlaysRare.health - 60 /** TNT */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Sheep Stare does not redirect Anvil Drop AFK damage', async () => {
		await testGame(
			{
				playerOneDeck: [GoatfatherRare],
				playerTwoDeck: [ZedaphPlaysRare, EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(GoatfatherRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(ZedaphPlaysRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.attack('primary')
					await test.endTurn()

					await test.attack('secondary')
					expect(
						game.currentPlayer.coinFlips.filter((flip) => flip.opponentFlip),
					).toHaveLength(1)
					expect(game.currentPlayer.activeRow?.health).toBe(
						GoatfatherRare.health -
							ZedaphPlaysRare.primary.damage -
							GoatfatherRare.secondary.damage -
							30 /** Anvil Drop heads */,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						ZedaphPlaysRare.health,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 10 /** AFK Anvil Drop heads */)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Sheep Stare does not flip for weakness', async () => {
		await testGame(
			{
				playerOneDeck: [ZedaphPlaysRare],
				playerTwoDeck: [ZedaphPlaysRare, PotionOfWeakness],
				testGame: async (test, game) => {
					await test.playCardFromHand(ZedaphPlaysRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(ZedaphPlaysRare, 'hermit', 0)
					await test.playCardFromHand(PotionOfWeakness, 'single_use')
					await test.applyEffect()
					await test.attack('primary')
					await test.endTurn()

					await test.attack('secondary')
					expect(
						game.currentPlayer.coinFlips.filter((flip) => flip.opponentFlip),
					).toHaveLength(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
