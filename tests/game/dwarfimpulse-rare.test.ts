import {describe, expect, test} from '@jest/globals'
import FiveAMPearlRare from 'common/cards/alter-egos-ii/hermits/fiveampearl-rare'
import DwarfImpulseRare from 'common/cards/alter-egos-iii/hermits/dwarfimpulse-rare'
import LightningRod from 'common/cards/alter-egos/effects/lightning-rod'
import Wolf from 'common/cards/default/effects/wolf'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import TangoTekCommon from 'common/cards/default/hermits/tangotek-common'
import GoldenAxe from 'common/cards/default/single-use/golden-axe'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {IgnoreAttachSlotEffect} from 'common/status-effects/ignore-attach'
import {
	attack,
	changeActiveHermit,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from './utils'

describe('Test Dwarf Impulse Rare', () => {
	test('Test Dwarf Impulse with golden axe.', () => {
		testGame(
			{
				playerOneDeck: [DwarfImpulseRare, GoldenAxe],
				playerTwoDeck: [EthosLabCommon, FiveAMPearlRare],
				saga: function* (game: GameModel) {
					yield* playCardFromHand(game, DwarfImpulseRare, 'hermit', 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, FiveAMPearlRare, 'hermit', 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, GoldenAxe, 'single_use')

					yield* attack(game, 'secondary')

					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)!.health,
					).toBe(EthosLabCommon.health - 80)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)!.health,
					).toBe(FiveAMPearlRare.health - 40)

					yield* endTurn(game)

					expect(
						game.components.filter(
							StatusEffectComponent,
							query.effect.is(IgnoreAttachSlotEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						).length,
					).toBe(0)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Test Dwarf Impulse works with lightning rod.', () => {
		testGame(
			{
				playerOneDeck: [DwarfImpulseRare, GoldenAxe],
				playerTwoDeck: [
					TangoTekCommon,
					FiveAMPearlRare,
					EthosLabCommon,
					LightningRod,
					Wolf,
				],
				saga: function* (game: GameModel) {
					yield* playCardFromHand(game, DwarfImpulseRare, 'hermit', 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, FiveAMPearlRare, 'hermit', 0)
					yield* playCardFromHand(game, TangoTekCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)

					yield* playCardFromHand(game, Wolf, 'attach', 0)
					yield* playCardFromHand(game, LightningRod, 'attach', 2)

					yield* changeActiveHermit(game, 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, GoldenAxe, 'single_use')

					yield* attack(game, 'secondary')

					yield* pick(
						game,
						query.slot.hermit,
						query.slot.opponent,
						query.slot.rowIndex(0),
					)

					// Dwarf impulse should have disabled wolf, so it should not have triggered.
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.active,
						)?.health,
					).toEqual(DwarfImpulseRare.health)

					// Verify that the attack went through and lightning rod was ignored properly.
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toEqual(TangoTekCommon.health - (80 + 20)) // Type advantage Miner -> Redstone
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toEqual(FiveAMPearlRare.health - 40)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
