import {describe, expect, test} from '@jest/globals'
import FiveAMPearlRare from 'common/cards/alter-egos-ii/hermits/fiveampearl-rare'
import DwarfImpulseRare from 'common/cards/alter-egos-iii/hermits/dwarfimpulse-rare'
import LightningRod from 'common/cards/alter-egos/effects/lightning-rod'
import Wolf from 'common/cards/default/effects/wolf'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import GoldenAxe from 'common/cards/default/single-use/golden-axe'
import {RowComponent, SlotComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {
	attack,
	endTurn,
	findCardInHand,
	pick,
	playCard,
	playCardFromHand,
	testGame,
} from './utils'
import TangoTekCommon from 'common/cards/default/hermits/tangotek-common'

function* testDwarfImpulseHelperSaga(game: GameModel) {
	yield* playCardFromHand(game, TangoTekCommon, 0)

	yield* endTurn(game)

	yield* playCardFromHand(game, TangoTekCommon, 0)
	yield* playCardFromHand(game, FiveAMPearlRare, 1)
	yield* playCardFromHand(game, EthosLabCommon, 2)

	yield* playCardFromHand(game, LightningRod, 2)
	yield* playCardFromHand(game, Wolf, 2)

	yield* endTurn(game)

	yield* playCardFromHand(game, GoldenAxe)

	yield* attack(game, 'secondary')

	yield* pick(
		game,
		game.components.find(
			SlotComponent,
			query.slot.hermit,
			query.slot.opponent,
			query.not(query.slot.active),
		)!,
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
			query.row.index(1),
		)?.health,
	).toEqual(EthosLabCommon.health - (80 + 40))
}

describe('Test Dwarf Impulse Rare', () => {
	test('Test Dwarf Impulse works with lightning rod.', () => {
		testGame(
			{
				saga: testDwarfImpulseHelperSaga,
				playerOneDeck: [DwarfImpulseRare, GoldenAxe],
				playerTwoDeck: [
					TangoTekCommon,
					FiveAMPearlRare,
					EthosLabCommon,
					LightningRod,
					Wolf,
				],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
