import {select, take} from 'typed-redux-saga'
import {call, put, fork} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {LocalGameState} from 'common/types/game-state'
import {runPickProcessSaga} from './pick-process-saga'
import {CardT} from 'common/types/game-state'
import {CardInfoT} from 'common/types/cards'
import CARDS from 'server/cards'
import {getPlayerId} from 'logic/session/session-selectors'
import {
	setOpenedModal,
	followUp,
	applyEffect,
	removeEffect,
} from 'logic/game/game-actions'
import {
	getPlayerState,
	getOpponentState,
	getGameState,
} from 'logic/game/game-selectors'
import {anyAvailableReqOptions} from 'server/utils/reqs'

function* borrowSaga(): SagaIterator {
	yield put(setOpenedModal('borrow'))
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

	if (cardInfo.useReqs) {
		const gameState = yield* select(getGameState)
		const playerState = yield* select(getPlayerState)
		const opponentState = yield* select(getOpponentState)
		const canUse = anyAvailableReqOptions(
			gameState,
			playerState,
			opponentState,
			cardInfo.useReqs
		)
		if (!canUse) {
			yield put(setOpenedModal('unmet-condition'))
			return
		}
	}

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
			'chorus_fruit',
			'sweeping_edge',
			'potion_of_slowness',
			'potion_of_weakness',
		].includes(card.cardId)
	) {
		yield put(setOpenedModal('confirm'))
	} else if (card.cardId === 'chest') {
		yield put(setOpenedModal('chest'))
	} else if (cardInfo.pickOn === 'apply') {
		const result = yield call(
			runPickProcessSaga,
			cardInfo.name,
			cardInfo.pickReqs
		)
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

function* actionLogicSaga(gameState: LocalGameState): SagaIterator {
	const playerId = yield* select(getPlayerId)
	const pState = gameState.players[playerId]
	if (pState.followUp) {
		const cardInfo = CARDS[pState.followUp] as CardInfoT | null
		if (cardInfo?.pickOn === 'followup') {
			let pickedCards = null
			const name = getFollowUpName(cardInfo)
			while (!pickedCards)
				pickedCards = yield call(runPickProcessSaga, name, cardInfo.pickReqs)
			yield put(followUp({pickedCards: {[pState.followUp]: pickedCards}}))
		} else if (pState.followUp === 'grian_rare') {
			yield fork(borrowSaga)
		}
	} else if (pState.custom.spyglass) {
		yield put(setOpenedModal('spyglass'))
	} else if (pState.board.singleUseCard && !pState.board.singleUseCardUsed) {
		yield call(singleUseSaga, pState.board.singleUseCard)
	}
}

export default actionLogicSaga
