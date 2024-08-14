import {describe, expect, test} from '@jest/globals'
import BdoubleO100Common from 'common/cards/default/hermits/bdoubleo100-common'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import ImpulseSVRare from 'common/cards/default/hermits/impulsesv-rare'
import TangoTekRare from 'common/cards/default/hermits/tangotek-rare'
import {RowComponent, SlotComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {attack, endTurn, findCardInHand, playCard, testGame} from './utils'

function* testOneHermit(game: GameModel) {
	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, EthosLabCommon),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
		)!,
	)

	yield* endTurn(game)

	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, ImpulseSVRare),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
			query.slot.rowIndex(0),
		)!,
	)
	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, BdoubleO100Common),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
			query.slot.rowIndex(1),
		)!,
	)

	yield* attack(game, 'secondary')

	expect(
		game.components.find(RowComponent, query.row.active)?.health,
	).toStrictEqual(260 - (70 + 40))
}

function* testManyHermits(game: GameModel) {
	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, EthosLabCommon),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
		)!,
	)

	yield* endTurn(game)

	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, ImpulseSVRare),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
			query.slot.rowIndex(0),
		)!,
	)
	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, BdoubleO100Common),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
			query.slot.rowIndex(1),
		)!,
	)

	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, BdoubleO100Common),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
			query.slot.rowIndex(2),
		)!,
	)

	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, TangoTekRare),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
			query.slot.rowIndex(3),
		)!,
	)

	yield* attack(game, 'secondary')

	expect(
		game.components.find(RowComponent, query.row.active)?.health,
	).toStrictEqual(260 - (70 + 40 + 40))
}

describe('Test Impulse Test', () => {
	test('Test Impulse Is Triggered By Bdubs', () => {
		testGame(
			{
				saga: testOneHermit,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [ImpulseSVRare, BdoubleO100Common],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Test Impulse Is Triggered By Multiple Hermits', () => {
		testGame(
			{
				saga: testManyHermits,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					ImpulseSVRare,
					BdoubleO100Common,
					BdoubleO100Common,
					TangoTekRare,
				],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
