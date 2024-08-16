import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import Clock from 'common/cards/default/single-use/clock'
import {StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import TurnSkippedEffect from 'common/status-effects/turn-skipped'
import UsedClockEffect from 'common/status-effects/used-clock'
import {applyEffect, endTurn, playCardFromHand, testGame} from './utils'

function* testClockHelperSaga(game: GameModel) {
	yield* playCardFromHand(game, EthosLabCommon, 0)

	yield* endTurn(game)

	yield* playCardFromHand(game, EthosLabCommon, 0)

	// Clock can not be played on turn one.
	yield* endTurn(game)
	yield* endTurn(game)

	yield* playCardFromHand(game, Clock)

	yield* applyEffect(game)

	expect(
		game.components.find(
			StatusEffectComponent,
			query.effect.targetEntity(game.opponentPlayer.entity),
			query.effect.is(TurnSkippedEffect),
		),
	).toBeTruthy()
	expect(
		game.components.find(
			StatusEffectComponent,
			query.effect.targetEntity(game.currentPlayer.entity),
			query.effect.is(UsedClockEffect),
		),
	).toBeTruthy()
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
