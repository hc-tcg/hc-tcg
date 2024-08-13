import {describe, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import Clock from 'common/cards/default/single-use/clock'
import {GameModel} from 'common/models/game-model'
import {
	findCardInHand,
	getTestPlayer,
	testAgainstGameSaga,
	testSagas,
} from './utils'
import gameSaga from 'server/routines/game'
import {call, put} from 'typed-redux-saga'
import {localMessages, LocalMessage} from 'server/messages'
import {SlotComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {getLocalCard} from 'server/utils/state-gen'
import assert from 'assert'
import TurnSkippedEffect from 'common/status-effects/turn-skipped'
import UsedClockEffect from 'common/status-effects/used-clock'

function* testClockHelperSaga(game: GameModel) {
	let card
	card = findCardInHand(game.currentPlayer, EthosLabCommon)

	let playInSlot

	playInSlot = game.components.find(
		SlotComponent,
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.row(query.row.index(0)),
	)!

	yield* put<LocalMessage>({
		type: localMessages.TURN_ACTION,
		entity: game.currentPlayer.entity,
		action: {
			type: 'PLAY_HERMIT_CARD',
			card: getLocalCard(game, card),
			slot: playInSlot.entity,
		},
	})

	yield* put<LocalMessage>({
		type: localMessages.TURN_ACTION,
		entity: game.currentPlayer.entity,
		action: {
			type: 'END_TURN',
		},
	})

	card = findCardInHand(game.currentPlayer, EthosLabCommon)
	playInSlot = game.components.find(
		SlotComponent,
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.row(query.row.index(0)),
	)!

	yield* put<LocalMessage>({
		type: localMessages.TURN_ACTION,
		entity: game.currentPlayer.entity,
		action: {
			type: 'PLAY_HERMIT_CARD',
			card: getLocalCard(game, card),
			slot: playInSlot.entity,
		},
	})

	// Clock can not be played on turn one.
	yield* put<LocalMessage>({
		type: localMessages.TURN_ACTION,
		entity: game.currentPlayer.entity,
		action: {
			type: 'END_TURN',
		},
	})
	yield* put<LocalMessage>({
		type: localMessages.TURN_ACTION,
		entity: game.currentPlayer.entity,
		action: {
			type: 'END_TURN',
		},
	})

	card = findCardInHand(game.currentPlayer, Clock)
	let singleUseSlot = game.components.find(SlotComponent, query.slot.singleUse)!

	yield* put<LocalMessage>({
		type: localMessages.TURN_ACTION,
		entity: game.currentPlayer.entity,
		action: {
			type: 'PLAY_SINGLE_USE_CARD',
			card: getLocalCard(game, card),
			slot: singleUseSlot.entity,
		},
	})

	yield* put<LocalMessage>({
		type: localMessages.TURN_ACTION,
		entity: game.currentPlayer.entity,
		action: {
			type: 'APPLY_EFFECT',
		},
	})

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
	test('Test Clock', function* () {
		let game = new GameModel(
			getTestPlayer('player1', [EthosLabCommon]),
			getTestPlayer('player2', [EthosLabCommon, Clock]),
			{randomizeOrder: false},
		)
		testAgainstGameSaga(game, testClockHelperSaga)
	})
})
