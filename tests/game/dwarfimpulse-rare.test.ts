import {describe, expect, test} from '@jest/globals'
import FiveAMPearlRare from 'common/cards/alter-egos-ii/hermits/fiveampearl-rare'
import DwarfImpulseRare from 'common/cards/alter-egos-iii/hermits/dwarfimpulse-rare'
import LightningRod from 'common/cards/alter-egos/effects/lightning-rod'
import Wolf from 'common/cards/default/effects/wolf'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import TangoTekCommon from 'common/cards/default/hermits/tangotek-common'
import GoldenAxe from 'common/cards/default/single-use/golden-axe'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
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
					yield* playCardFromHand(game, DwarfImpulseRare, 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 0)
					yield* playCardFromHand(game, FiveAMPearlRare, 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, GoldenAxe)

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
					yield* playCardFromHand(game, DwarfImpulseRare, 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, FiveAMPearlRare, 0)
					yield* playCardFromHand(game, TangoTekCommon, 1)
					yield* playCardFromHand(game, EthosLabCommon, 2)

					yield* playCardFromHand(game, Wolf, 0)
					yield* playCardFromHand(game, LightningRod, 2)

					yield* changeActiveHermit(game, 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, GoldenAxe)

					yield* attack(game, 'secondary')

					yield* pick(
						game,
						query.slot.hermit,
						query.slot.opponent,
						query.not(query.slot.active),
					)

					// Dwarf impulse should have disabled wolf, so it should not have triggered.
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.active,
						)?.health,
					).toEqual(DwarfImpulseRare.health)

					// Verify that the attack went through and lightning rod worked properly.
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toEqual(EthosLabCommon.health - (80 + 40))
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
