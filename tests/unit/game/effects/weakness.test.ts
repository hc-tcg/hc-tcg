import {describe, expect, test} from '@jest/globals'
import ImpulseSVCommon from 'common/cards/hermits/impulsesv-common'
import SmallishbeansRare from 'common/cards/hermits/smallishbeans-rare'
import VintageBeefCommon from 'common/cards/hermits/vintagebeef-common'
import ChorusFruit from 'common/cards/single-use/chorus-fruit'
import PotionOfWeakness from 'common/cards/single-use/potion-of-weakness'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Weakness', () => {
	test('Weakness Damage Negative Control', () => {
		testGame(
			{
				playerOneDeck: [VintageBeefCommon],
				playerTwoDeck: [VintageBeefCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* attack(game, 'primary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(VintageBeefCommon.health - VintageBeefCommon.primary.damage)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Weakness Works Both Ways', () => {
		testGame(
			{
				playerOneDeck: [VintageBeefCommon],
				playerTwoDeck: [VintageBeefCommon, PotionOfWeakness],
				saga: function* (game) {
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* playCardFromHand(game, PotionOfWeakness, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'primary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						VintageBeefCommon.health - VintageBeefCommon.primary.damage - 20,
					)

					yield* attack(game, 'primary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						VintageBeefCommon.health - VintageBeefCommon.primary.damage - 20,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Weakness Works Through Switches', () => {
		testGame(
			{
				playerOneDeck: [VintageBeefCommon, VintageBeefCommon],
				playerTwoDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					PotionOfWeakness,
					ChorusFruit,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* playCardFromHand(game, PotionOfWeakness, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, ChorusFruit, 'single_use')
					yield* attack(game, 'primary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						VintageBeefCommon.health - VintageBeefCommon.primary.damage - 20,
					)

					yield* attack(game, 'primary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						VintageBeefCommon.health - VintageBeefCommon.primary.damage - 20,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Weakness Does Not Work on Wrong Types', () => {
		testGame(
			{
				playerOneDeck: [VintageBeefCommon, ImpulseSVCommon],
				playerTwoDeck: [VintageBeefCommon, PotionOfWeakness],
				saga: function* (game) {
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* playCardFromHand(game, ImpulseSVCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* playCardFromHand(game, PotionOfWeakness, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* attack(game, 'primary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(ImpulseSVCommon.health - VintageBeefCommon.primary.damage)

					yield* attack(game, 'primary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(VintageBeefCommon.health - ImpulseSVCommon.primary.damage)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Weakness Does Not Stack Self', () => {
		testGame(
			{
				playerOneDeck: [VintageBeefCommon],
				playerTwoDeck: [VintageBeefCommon, PotionOfWeakness, PotionOfWeakness],
				saga: function* (game) {
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* playCardFromHand(game, PotionOfWeakness, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* playCardFromHand(game, PotionOfWeakness, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'primary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						VintageBeefCommon.health - VintageBeefCommon.primary.damage - 20,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Weakness Does Not Stack With Type Chart', () => {
		testGame(
			{
				playerOneDeck: [SmallishbeansRare],
				playerTwoDeck: [ImpulseSVCommon, PotionOfWeakness],
				saga: function* (game) {
					yield* playCardFromHand(game, SmallishbeansRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, ImpulseSVCommon, 'hermit', 0)
					yield* playCardFromHand(game, PotionOfWeakness, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'primary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(SmallishbeansRare.health - ImpulseSVCommon.primary.damage - 20)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Weakness Works Through KOs', () => {
		testGame(
			{
				playerOneDeck: [SmallishbeansRare, ImpulseSVCommon, SmallishbeansRare],
				playerTwoDeck: [
					SmallishbeansRare,
					SmallishbeansRare,
					SmallishbeansRare,
					PotionOfWeakness,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, SmallishbeansRare, 'hermit', 0)
					yield* playCardFromHand(game, ImpulseSVCommon, 'hermit', 1)
					yield* playCardFromHand(game, SmallishbeansRare, 'hermit', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, SmallishbeansRare, 'hermit', 0)
					yield* playCardFromHand(game, SmallishbeansRare, 'hermit', 1)
					yield* playCardFromHand(game, SmallishbeansRare, 'hermit', 2)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* endTurn(game)

					yield* playCardFromHand(game, PotionOfWeakness, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(game.currentPlayer.activeRow).toBe(null)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* attack(game, 'primary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(ImpulseSVCommon.health - SmallishbeansRare.primary.damage)

					yield* changeActiveHermit(game, 2)
					yield* endTurn(game)

					yield* attack(game, 'primary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(SmallishbeansRare.health - SmallishbeansRare.primary.damage)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
