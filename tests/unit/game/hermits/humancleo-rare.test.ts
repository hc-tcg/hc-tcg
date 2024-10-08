import {describe, expect, test} from '@jest/globals'
import ArmorStand from 'common/cards/attach/armor-stand'
import HumanCleoRare from 'common/cards/hermits/humancleo-rare'
import EnderPearl from 'common/cards/single-use/ender-pearl'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import VintageBeefCommon from 'common/cards/hermits/vintagebeef-common'
import Crossbow from 'common/cards/single-use/crossbow'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {
	attack,
	changeActiveHermit,
	endTurn,
	pick,
	playCardFromHand,
	removeEffect,
	testGame,
} from '../utils'

describe('Test Human Cleo Betrayal', () => {
	test('Test Betrayal with canceling to Ender Pearl knock-out', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					VintageBeefCommon,
					Crossbow,
					EnderPearl,
				],
				playerTwoDeck: [HumanCleoRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, HumanCleoRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.active,
					)!.health = 10 // Prepare active row to be knocked-out after using Ender Pearl
					expect(game.state.turn.availableActions).not.toContain('END_TURN')
					yield* playCardFromHand(game, Crossbow, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* removeEffect(game)

					yield* playCardFromHand(game, EnderPearl, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)

					yield* changeActiveHermit(game, 1)
					yield* attack(game, 'secondary')
					expect(game.currentPlayer.activeRow?.health).toBe(
						VintageBeefCommon.health,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						HumanCleoRare.health - VintageBeefCommon.secondary.damage,
					)
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test Betrayal knocking-out opponent active hermit', () => {
		testGame(
			{
				playerOneDeck: [ArmorStand, EthosLabCommon, VintageBeefCommon],
				playerTwoDeck: [HumanCleoRare],
				saga: function* (game) {
					yield* playCardFromHand(game, ArmorStand, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, HumanCleoRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					expect(game.state.turn.availableActions).not.toContain('END_TURN')
					yield* attack(game, 'primary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(VintageBeefCommon.health - EthosLabCommon.primary.damage)
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
