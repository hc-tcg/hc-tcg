import {describe, expect, test} from '@jest/globals'
import PotionOfWeakness from 'common/cards/alter-egos/single-use/potion-of-weakness'
import ImpulseSVCommon from 'common/cards/default/hermits/impulsesv-common'
import VintageBeefCommon from 'common/cards/default/hermits/vintagebeef-common'
import ChorusFruit from 'common/cards/default/single-use/chorus-fruit'
import SmallishbeansRare from 'common/cards/season-x/hermits/smallishbeans-rare'
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

	test('Weakness Damage Same Type Exchange', () => {
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

	test('Weakness Damage Same Type Switch Exchange', () => {
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

	test('Weakness Damage Wrong Type Exchange', () => {
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

	test('Weakness Self Redundancy', () => {
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

	test('Weakness Heteroredundancy', () => {
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

	test('Weakness Lethality Check', () => {
		testGame(
			{
				playerOneDeck: [ImpulseSVCommon, SmallishbeansRare, ImpulseSVCommon],
				playerTwoDeck: [
					SmallishbeansRare,
					SmallishbeansRare,
					SmallishbeansRare,
					PotionOfWeakness
				],
				saga: function* (game) {
					yield* playCardFromHand(game, ImpulseSVCommon, 'hermit', 0)
					yield* playCardFromHand(game, SmallishbeansRare, 'hermit', 1)
					yield* playCardFromHand(game, ImpulseSVCommon, 'hermit', 2)
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
					).toBe(
						SmallishbeansRare.health - SmallishbeansRare.primary.damage - 20,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
