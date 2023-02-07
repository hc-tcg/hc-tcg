import {AnyAction} from 'redux'
import {GameState, CardT} from 'types/game-state'
import {PickProcessT} from 'types/pick-process'
import {equalCard} from 'server/utils'

type LocalGameState = {
	opponentId: string
	gameState: GameState | null
	availableActions: Array<string>
	selectedCard: CardT | null
	openedModalId: string | null
	pickProcess: PickProcessT | null
}

const defaultState: LocalGameState = {
	opponentId: '',
	gameState: null,
	availableActions: [],
	selectedCard: null,
	openedModalId: null,
	pickProcess: null,
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
			}
			if (
				state.gameState?.turnPlayerId === action.payload.gameState?.turnPlayerId
			)
				return newState
			return {
				...newState,
				selectedCard: null,
				openedModalId: null,
				pickProcess: null,
			}
		case 'GAME_START':
		case 'GAME_END':
			return {
				...state,
				opponentId: '',
				gameState: null,
				availableActions: [],
				selectedCard: null,
				openedModalId: null,
				pickProcess: null,
			}
		case 'SET_SELECTED_CARD':
			if (state.pickProcess) return state
			return {
				...state,
				selectedCard: equalCard(action.payload, state.selectedCard)
					? null
					: action.payload,
			}
		case 'SET_OPENED_MODAL_ID':
			return {
				...state,
				openedModalId: action.payload,
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
		default:
			return state
	}
}

export default gameReducer
