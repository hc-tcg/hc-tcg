import assert from 'assert'
import {describe, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import Clock from 'common/cards/default/single-use/clock'
import {SlotComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import TurnSkippedEffect from 'common/status-effects/turn-skipped'
import UsedClockEffect from 'common/status-effects/used-clock'
import {applyEffect, endTurn, findCardInHand, playCard, testGame} from './utils'

function* testClockHelperSaga(game: GameModel) {
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
		findCardInHand(game.currentPlayer, EthosLabCommon),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
			query.slot.row(query.row.index(0)),
		)!,
	)

	// Clock can not be played on turn one.
	yield* endTurn(game)
	yield* endTurn(game)

	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, Clock),
		game.components.find(SlotComponent, query.slot.singleUse)!,
	)

	yield* applyEffect(game)

	assert(
		game.components.find(
			StatusEffectComponent,
			query.effect.targetEntity(game.opponentPlayer.entity),
			query.effect.is(TurnSkippedEffect),
		),
	)
	assert(
		game.components.find(
			StatusEffectComponent,
			query.effect.targetEntity(game.currentPlayer.entity),
			query.effect.is(UsedClockEffect),
		),
	)
}

describe('Test Clock', () => {
	test('Test Clock', () => {
		testGame(
			{
				saga: testClockHelperSaga,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon, Clock],
			},
			{startWithAllCards: true},
		)
	})
})
