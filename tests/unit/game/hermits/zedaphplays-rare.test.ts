import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GoatfatherRare from 'common/cards/hermits/goatfather-rare'
import ZedaphPlaysRare from 'common/cards/hermits/zedaphplays-rare'
import PotionOfWeakness from 'common/cards/single-use/potion-of-weakness'
import TNT from 'common/cards/single-use/tnt'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {
	applyEffect,
	attack,
	endTurn,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Zedaph Sheep Stare', () => {
	test('Sheep Stare functionality', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, TNT],
				playerTwoDeck: [ZedaphPlaysRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZedaphPlaysRare, 'hermit', 0)
					yield* attack(game, 'primary')
					yield* endTurn(game)

					yield* playCardFromHand(game, TNT, 'single_use')
					yield* attack(game, 'primary')
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

	test('Sheep Stare does not redirect Anvil Drop AFK damage', () => {
		testGame(
			{
				playerOneDeck: [GoatfatherRare],
				playerTwoDeck: [ZedaphPlaysRare, EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, GoatfatherRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZedaphPlaysRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* attack(game, 'primary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
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

	test('Sheep Stare does not flip for weakness', () => {
		testGame(
			{
				playerOneDeck: [ZedaphPlaysRare],
				playerTwoDeck: [ZedaphPlaysRare, PotionOfWeakness],
				saga: function* (game) {
					yield* playCardFromHand(game, ZedaphPlaysRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZedaphPlaysRare, 'hermit', 0)
					yield* playCardFromHand(game, PotionOfWeakness, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'primary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					expect(
						game.currentPlayer.coinFlips.filter((flip) => flip.opponentFlip),
					).toHaveLength(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
