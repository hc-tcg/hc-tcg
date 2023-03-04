import {AnyAction} from 'redux'
import {
	GameState,
	CardT,
	GameEndReasonT,
	GameEndOutcomeT,
	CurrentCoinFlipT,
} from 'types/game-state'
import {PickProcessT} from 'types/pick-process'
import {MessageInfoT} from 'types/chat'
import {equalCard} from 'server/utils'

type LocalGameState = {
	opponentId: string
	gameState: GameState | null
	availableActions: Array<string>
	time: number
	selectedCard: CardT | null
	openedModal: {
		id: string
		info: null
	} | null
	pickProcess: PickProcessT | null
	endGameOverlay: {
		reason: GameEndReasonT
		outcome: GameEndOutcomeT
	} | null
	chat: Array<MessageInfoT>
	currentCoinFlip: CurrentCoinFlipT | null
	opponentConnected: boolean
}

const defaultState: LocalGameState = {
	opponentId: '',
	gameState: null,
	availableActions: [],
	time: 0,
	selectedCard: null,
	openedModal: null,
	pickProcess: null,
	endGameOverlay: null,
	chat: [],
	currentCoinFlip: null,
	opponentConnected: true,
}

const gameReducer = (
	state = defaultState,
	action: AnyAction
): LocalGameState => {
	switch (action.type) {
		case 'GAME_STATE':
			const newState = {
				...state,
				opponentId: action.payload.opponentId,
				gameState: action.payload.gameState,
				availableActions: action.payload.availableActions,
				time: action.payload.time,
			}
			if (
				state.gameState?.turnPlayerId === action.payload.gameState?.turnPlayerId
			)
				return newState
			return {
				...newState,
				selectedCard: null,
				openedModal: null,
				pickProcess: null,
			}
		case 'GAME_START':
		case 'GAME_END':
			return {
				...state,
				opponentId: '',
				gameState: null,
				availableActions: [],
				time: 0,
				selectedCard: null,
				openedModal: null,
				pickProcess: null,
				endGameOverlay: null,
				currentCoinFlip: null,
				chat: [],
				opponentConnected: true,
			}
		case 'SET_SELECTED_CARD':
			if (state.pickProcess) return state
			return {
				...state,
				selectedCard: equalCard(action.payload, state.selectedCard)
					? null
					: action.payload,
			}
		case 'SET_OPENED_MODAL':
			return {
				...state,
				openedModal: action.payload,
			}
		case 'SET_PICK_PROCESS':
			return {
				...state,
				selectedCard: null,
				pickProcess: action.payload,
			}
		case 'UPDATE_PICK_PROCESS': {
			if (!state.pickProcess) return state
			return {
				...state,
				pickProcess: {
					...state.pickProcess,
					...action.payload,
				},
			}
		}
		case 'SHOW_END_GAME_OVERLAY':
			return {
				...state,
				endGameOverlay: action.payload,
			}
		case 'CHAT_UPDATE':
			return {
				...state,
				chat: action.payload,
			}
		case 'SET_OPPONENT_CONNECTION':
			return {
				...state,
				opponentConnected: action.payload,
			}
		case 'SET_COIN_FLIP':
			return {
				...state,
				currentCoinFlip: action.payload,
			}
		default:
			return state
	}
}

export default gameReducer
