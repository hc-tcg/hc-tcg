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
				saga: async (test, game) => {
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.attack('primary')
					await test.endTurn()

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
				saga: async (test, game) => {
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(PotionOfWeakness, 'single_use')
					await test.applyEffect()
					await test.attack('primary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						VintageBeefCommon.health - VintageBeefCommon.primary.damage - 20,
					)

					await test.attack('primary')
					await test.endTurn()

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
				saga: async (test, game) => {
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(PotionOfWeakness, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					yield* changeActiveHermit(game, 1)
					await test.endTurn()

					await test.playCardFromHand(ChorusFruit, 'single_use')
					await test.attack('primary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						VintageBeefCommon.health - VintageBeefCommon.primary.damage - 20,
					)

					await test.attack('primary')
					await test.endTurn()

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
				saga: async (test, game) => {
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(ImpulseSVCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(PotionOfWeakness, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					yield* changeActiveHermit(game, 1)
					await test.endTurn()

					await test.attack('primary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(ImpulseSVCommon.health - VintageBeefCommon.primary.damage)

					await test.attack('primary')
					await test.endTurn()

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
				saga: async (test, game) => {
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(PotionOfWeakness, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.endTurn()

					await test.playCardFromHand(PotionOfWeakness, 'single_use')
					await test.applyEffect()
					await test.attack('primary')
					await test.endTurn()

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
				saga: async (test, game) => {
					await test.playCardFromHand(SmallishbeansRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(ImpulseSVCommon, 'hermit', 0)
					await test.playCardFromHand(PotionOfWeakness, 'single_use')
					await test.applyEffect()
					await test.attack('primary')
					await test.endTurn()

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
				saga: async (test, game) => {
					await test.playCardFromHand(SmallishbeansRare, 'hermit', 0)
					await test.playCardFromHand(ImpulseSVCommon, 'hermit', 1)
					await test.playCardFromHand(SmallishbeansRare, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(SmallishbeansRare, 'hermit', 0)
					await test.playCardFromHand(SmallishbeansRare, 'hermit', 1)
					await test.playCardFromHand(SmallishbeansRare, 'hermit', 2)
					await test.attack('secondary')
					await test.endTurn()

					await test.endTurn()

					await test.playCardFromHand(PotionOfWeakness, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					expect(game.currentPlayer.activeRow).toBe(null)
					yield* changeActiveHermit(game, 1)
					await test.endTurn()

					await test.attack('primary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(ImpulseSVCommon.health - SmallishbeansRare.primary.damage)

					yield* changeActiveHermit(game, 2)
					await test.endTurn()

					await test.attack('primary')
					await test.endTurn()

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
