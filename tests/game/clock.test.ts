import assert from 'assert'
import {describe, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import Clock from 'common/cards/default/single-use/clock'
import {SlotComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import TurnSkippedEffect from 'common/status-effects/turn-skipped'
import UsedClockEffect from 'common/status-effects/used-clock'
import {LocalMessage, localMessages} from 'server/messages'
import {getLocalCard} from 'server/utils/state-gen'
import {put} from 'typed-redux-saga'
import {applyEffect, endTurn, findCardInHand, playCard, testGame} from './utils'

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

	playCard(game, card, playInSlot)
	endTurn(game)

	card = findCardInHand(game.currentPlayer, EthosLabCommon)
	playInSlot = game.components.find(
		SlotComponent,
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.row(query.row.index(0)),
	)!

	yield* put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		playerEntity: game.currentPlayer.entity,
		action: {
			type: 'PLAY_HERMIT_CARD',
			card: getLocalCard(game, card),
			slot: playInSlot.entity,
		},
	})

	// Clock can not be played on turn one.
	endTurn(game)
	endTurn(game)

	card = findCardInHand(game.currentPlayer, Clock)
	let singleUseSlot = game.components.find(SlotComponent, query.slot.singleUse)!
	playCard(game, card, singleUseSlot)
	applyEffect(game)

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
		testGame({
			saga: testClockHelperSaga,
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [EthosLabCommon, Clock],
		})
	})
})
