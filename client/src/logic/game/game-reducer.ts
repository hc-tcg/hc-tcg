import {BattleLogModel} from 'common/models/battle-log-model'
import {
	GameOutcome,
	LocalCurrentCoinFlip,
	LocalGameState,
	Message,
} from 'common/types/game-state'
import {LocalCardInstance} from 'common/types/server-requests'
import {LocalMessage, localMessages} from 'logic/messages'
import {ModalVariant} from './tasks/action-modals-saga'

type LocalGameRoot = {
	localGameState: LocalGameState | null
	time: number

	selectedCard: LocalCardInstance | null
	openedModal: {
		id: ModalVariant
		info: null
	} | null
	endGameOverlay: {
		outcome: GameOutcome
	} | null
	chat: Array<Message>
	battleLog: BattleLogModel | null
	currentCoinFlip: LocalCurrentCoinFlip | null
	opponentConnected: boolean
}

const defaultState: LocalGameRoot = {
	localGameState: null,
	time: 0,

	selectedCard: null,
	openedModal: null,
	endGameOverlay: null,
	chat: [],
	battleLog: null,
	currentCoinFlip: null,
	opponentConnected: true,
}

const gameReducer = (
	state = defaultState,
	action: LocalMessage,
): LocalGameRoot => {
	switch (action.type) {
		case localMessages.GAME_LOCAL_STATE_SET:
			// I really don't know if its a good idea to automatically close modals besides the forfeit modal, but I am too scared
			// too stop all modals from automatically closing.
			let nextOpenedModal =
				state.openedModal !== null && state.openedModal.id === 'forfeit'
					? state.openedModal
					: null
			const newGame: LocalGameRoot = {
				...state,
				localGameState: action.localGameState,
				time: action.time,
				openedModal: nextOpenedModal,
				selectedCard:
					action.localGameState.hand.find(
						(card) => card.entity === state.selectedCard?.entity,
					) || null,
			}
			if (
				state.localGameState?.turn.currentPlayerEntity ===
				action.localGameState?.turn.currentPlayerEntity
			)
				return newGame
			return {...newGame}
		case localMessages.GAME_START:
		case localMessages.GAME_END:
		case localMessages.GAME_SPECTATOR_LEAVE:
			return {
				...state,
				localGameState: null,
				time: 0,
				selectedCard: null,
				openedModal: null,
				endGameOverlay: null,
				currentCoinFlip: null,
				chat: [],
				battleLog: null,
				opponentConnected: true,
			}

		case localMessages.GAME_CARD_SELECTED_SET:
			return {
				...state,
				selectedCard: action.card,
			}
		case localMessages.GAME_MODAL_OPENED_SET:
			return {
				...state,
				openedModal: action.id ? {id: action.id, info: action.info} : null,
			}
		case localMessages.GAME_END_OVERLAY_SHOW:
			return {
				...state,
				endGameOverlay: {
					outcome: action.outcome,
				},
			}
		case localMessages.CHAT_UPDATE:
			return {
				...state,
				chat: action.messages,
			}
		case localMessages.GAME_OPPONENT_CONNECTION_SET:
			return {
				...state,
				opponentConnected: action.connected,
			}
		case localMessages.GAME_COIN_FLIP_SET:
			return {
				...state,
				currentCoinFlip: action.coinFlip,
			}
		// Update the board for the current player. This is used to put cards on the board before the
		// server sends the new state.
		// This updates based on outside mutations because I am so confused by redux and I want to ship
		// the release tomorrow.
		case localMessages.GAME_UPDATE:
			return state

		default:
			return state
	}
}

export default gameReducer
