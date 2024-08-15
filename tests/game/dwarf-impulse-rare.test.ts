import {describe, expect, test} from '@jest/globals'
import FiveAMPearlRare from 'common/cards/alter-egos-ii/hermits/fiveampearl-rare'
import DwarfImpulseRare from 'common/cards/alter-egos-iii/hermits/dwarfimpulse-rare'
import LightningRod from 'common/cards/alter-egos/effects/lightning-rod'
import Wolf from 'common/cards/default/effects/wolf'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import EthosLabRare from 'common/cards/default/hermits/ethoslab-rare'
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
	testGame,
} from './utils'
import {printBoardState} from 'server/utils'

function* testDwarfImpulseHelperSaga(game: GameModel) {
	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, DwarfImpulseRare),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
		)!,
	)

	yield* endTurn(game)

	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, FiveAMPearlRare),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
			query.slot.rowIndex(0),
		)!,
	)

	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, EthosLabCommon),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
			query.slot.rowIndex(1),
		)!,
	)

	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, Wolf),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.attach,
			query.slot.rowIndex(0),
		)!,
	)

	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, LightningRod),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.attach,
			query.slot.rowIndex(1),
		)!,
	)

	yield* endTurn(game)

	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, GoldenAxe),
		game.components.find(SlotComponent, query.slot.singleUse)!,
	)

	yield* attack(game, 'secondary')

	yield* pick(
		game,
		game.components.find(
			SlotComponent,
			query.slot.hermit,
			query.slot.opponent,
		)!,
	)

	printBoardState(game)

	// Dwarf impulse should have disabled wolf, so it should not have triggered.
	expect(
		game.components.find(
			RowComponent,
			query.row.currentPlayer,
			query.row.active,
		)?.health,
	).toEqual(DwarfImpulseRare.health)

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
				playerTwoDeck: [FiveAMPearlRare, EthosLabCommon, LightningRod, Wolf],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
