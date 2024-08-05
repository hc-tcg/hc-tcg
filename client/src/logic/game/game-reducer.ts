import {LocalGameRoot} from 'common/types/game-state'
import {GameMessage, gameActions} from './game-actions'

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
	action: GameMessage,
): LocalGameRoot => {
	switch (action.type) {
		case gameActions.LOCAL_GAME_STATE:
			const newGame: LocalGameRoot = {
				...state,
				localGameState: action.localGameState,
				time: action.time,
				openedModal: null,
			}
			if (
				state.localGameState?.turn.currentPlayerEntity ===
				action.localGameState?.turn.currentPlayerEntity
			)
				return newGame
			return {...newGame}
		case gameActions.GAME_START:
		case gameActions.GAME_END:
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

		case gameActions.SET_SELECTED_CARD:
			return {
				...state,
				selectedCard: action.card,
			}
		case gameActions.SET_OPENED_MODAL:
			return {
				...state,
				openedModal: {id: action.id, info: action.info},
			}
		case gameActions.SHOW_END_GAME_OVERLAY:
			return {
				...state,
				endGameOverlay:
					action.reason && action.outcome
						? {
								reason: action.reason,
								outcome: action.outcome,
							}
						: null,
			}
		case gameActions.CHAT_UPDATE:
			return {
				...state,
				chat: action.messages,
			}
		case gameActions.SET_OPPONENT_CONNECTION:
			return {
				...state,
				opponentConnected: action.connected,
			}
		case gameActions.SET_COIN_FLIP:
			return {
				...state,
				currentCoinFlip: action.coinFlip,
			}
		// Update the board for the current player. This is used to put cards on the board before the
		// server sends the new state.
		// This updates based on outside mutations because I am so confused by redux and I want to ship
		// the release tomorrow.
		case gameActions.UPDATE_GAME:
			return state

		default:
			return state
	}
}

export default gameReducer
