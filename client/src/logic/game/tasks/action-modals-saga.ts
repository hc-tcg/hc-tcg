import {TurnAction} from 'common/types/game-state'
import {LocalMessage, localMessages} from 'logic/messages'
import {SagaIterator} from 'redux-saga'
import {fork, put, take} from 'redux-saga/effects'
import {
	AttackModal,
	ChangeHermitModal,
	CopyAttackModal,
	DragCardsModal,
	EndTurnModal,
	ExitModal,
	ForfeitModal,
	SelectCardsModal,
	SingleUseConfirmModal,
} from '../../../app/game/modals'

export const MODAL_COMPONENTS = {
	attack: AttackModal,
	confirm: SingleUseConfirmModal,
	forfeit: ForfeitModal,
	'change-hermit-modal': ChangeHermitModal,
	'end-turn': EndTurnModal,
	exit: ExitModal,

	// Custom modals
	copyAttack: CopyAttackModal,
	selectCards: SelectCardsModal,
	dragCards: DragCardsModal,
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
	DELAY: null,
	FORFEIT: null,
}

function* endTurnActionSaga(): SagaIterator {
	while (true) {
		yield take(localMessages.GAME_ACTIONS_END_TURN)
		yield put<LocalMessage>({
			type: localMessages.GAME_MODAL_OPENED_SET,
			id: 'end-turn',
		})
	}
}

function* actionModalsSaga(): SagaIterator {
	yield fork(endTurnActionSaga)
}

export default actionModalsSaga
