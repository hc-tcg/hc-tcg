import {TurnAction} from 'common/types/game-state'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {LocalMessage, localMessages} from 'logic/messages'
import {SagaIterator} from 'redux-saga'
import {fork, put, take} from 'redux-saga/effects'
import {select} from 'typed-redux-saga'
import {
	AttackModal,
	ChangeHermitModal,
	ConfirmModal,
	CopyAttackModal,
	EndTurnModal,
	ForfeitModal,
	SelectCardsModal,
} from '../../../app/game/modals'
import {getAvailableActions} from '../game-selectors'

export const MODAL_COMPONENTS = {
	attack: AttackModal,
	confirm: ConfirmModal,
	forfeit: ForfeitModal,
	'change-hermit-modal': ChangeHermitModal,
	'end-turn': EndTurnModal,

	// Custom modals
	copyAttack: CopyAttackModal,
	selectCards: SelectCardsModal,
}

export type ModalVariant = keyof typeof MODAL_COMPONENTS

export const ActionMap: Record<TurnAction, string | null> = {
	PLAY_ITEM_CARD: 'Playing an item card',
	PLAY_SINGLE_USE_CARD: 'Playing a single use effect card',
	PLAY_EFFECT_CARD: 'Playing an attach effect card',
	PLAY_HERMIT_CARD: 'Playing a hermit card',
	CHANGE_ACTIVE_HERMIT: 'Changing your active hermit',
	SINGLE_USE_ATTACK: 'Attacking opponent with a single use effect',
	PRIMARY_ATTACK: 'Attacking opponent with a primary attack',
	SECONDARY_ATTACK: 'Attacking opponent with a secondary attack',
	WAIT_FOR_OPPONENT_ACTION: null,
	PICK_REQUEST: null,
	APPLY_EFFECT: null,
	REMOVE_EFFECT: null,
	END_TURN: null,
	WAIT_FOR_TURN: null,
	MODAL_REQUEST: null,
}

function* endTurnActionSaga(): SagaIterator {
	while (true) {
		yield take(localMessages.GAME_ACTIONS_END_TURN)
		const availableActions = yield* select(getAvailableActions)
		const settings = yield* select(getSettings)
		if (
			availableActions.some((action) => ActionMap[action] !== null) &&
			settings.confirmationDialogsEnabled
		) {
			yield put<LocalMessage>({
				type: localMessages.GAME_MODAL_OPENED_SET,
				id: 'end-turn',
			})
		} else {
			yield put<LocalMessage>({
				type: localMessages.GAME_TURN_END,
			})
		}
	}
}

function* actionModalsSaga(): SagaIterator {
	yield fork(endTurnActionSaga)
}

export default actionModalsSaga
