import {select, take} from 'typed-redux-saga'
import {call, put, fork, cancelled} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {GameState} from 'types/game-state'
import {runPickProcessSaga} from './pick-process-saga'
import {PlayerState, CardT} from 'types/game-state'
import {HermitCardT, CardInfoT} from 'types/cards'
import CARDS from 'server/cards'
import {getPlayerId} from 'logic/session/session-selectors'
import {
	setOpenedModalId,
	followUp,
	applyEffect,
	removeEffect,
} from 'logic/game/game-actions'

function* borrowSaga(pState: PlayerState): SagaIterator {
	yield put(setOpenedModalId('borrow'))
	const result = yield* take(['BORROW_ATTACH', 'BORROW_DISCARD'])
	if (result.type === 'BORROW_DISCARD') {
		yield put(followUp({attach: false}))
		return
	}

	yield put(followUp({attach: true}))
}

function* singleUseSaga(card: CardT): SagaIterator {
	const cardInfo = CARDS[card.cardId]
	if (!cardInfo) return
	if (
		[
			'splash_potion_of_healing',
			'lava_bucket',
			'splash_potion_of_poison',
			'clock',
			'invisibility_potion',
			'fishing_rod',
			'emerald',
			'flint_&_steel',
			'spyglass',
			'efficiency',
			'curse_of_binding',
			'curse_of_vanishing',
			'looting',
			'fortune',
		].includes(card.cardId)
	) {
		yield put(setOpenedModalId('confirm'))
	} else if (card.cardId === 'chest') {
		yield put(setOpenedModalId('chest'))
	} else if (cardInfo.reqsOn === 'apply') {
		const result = yield call(runPickProcessSaga, cardInfo.name, cardInfo.reqs)
		if (result && result.length) {
			yield put(applyEffect({pickedCards: {[card.cardId]: result}}))
		} else {
			yield put(removeEffect())
		}
	}
}

const getFollowUpName = (cardInfo: CardInfoT) => {
	if (cardInfo.type !== 'hermit') return cardInfo.name
	if (cardInfo.primary.power) cardInfo.primary.name
	if (cardInfo.secondary.power) cardInfo.secondary.name
	return cardInfo.name
}

function* actionLogicSaga(gameState: GameState): SagaIterator {
	const playerId = yield* select(getPlayerId)
	const pState = gameState.players[playerId]
	if (pState.followUp) {
		const cardInfo = CARDS[pState.followUp] as CardInfoT | null
		if (cardInfo?.reqsOn === 'followup') {
			let pickedCards = null
			const name = getFollowUpName(cardInfo)
			while (!pickedCards)
				pickedCards = yield call(runPickProcessSaga, name, cardInfo.reqs)
			yield put(followUp({pickedCards: {[pState.followUp]: pickedCards}}))
		} else if (pState.followUp === 'grian_rare') {
			yield fork(borrowSaga, pState)
		}
	} else if (pState.custom.spyglass) {
		yield put(setOpenedModalId('spyglass'))
	} else if (pState.board.singleUseCard && !pState.board.singleUseCardUsed) {
		yield call(singleUseSaga, pState.board.singleUseCard)
	}
}

export default actionLogicSaga
