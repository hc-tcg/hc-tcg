import {AnyAction} from 'redux'

type BoardRow = {
	hermitCard: string
	effectCard: string
	itemCards: Array<string>
}

type PlayerState = {
	hand: Array<string>
	rewards: Array<string>
	pile: Array<string>
	discarded: Array<string>
	board: {
		activeRow: number
		rows: Array<BoardRow>
	}
}

type GameState = {
	turn: number
	players: Record<string, PlayerState>
}

const defaultState = {
	playerName: '',
	playerId: '',
	playerSecret: '',
	gameType: null as 'stranger' | 'friend' | null,
	opponentId: '',
	gameState: null as GameState | null,
	availableActions: [] as Array<string>,
}

const rootReducer = (state = defaultState, action: AnyAction) => {
	switch (action.type) {
		case 'SET_NAME':
			return {...state, playerName: action.playerName}
		case 'SET_PLAYER_INFO':
			return {
				...state,
				playerId: action.playerId,
				playerSecret: action.playerSecret,
			}
		case 'SET_GAME_TYPE':
			return {
				...state,
				gameType: action.gameType,
			}
		case 'GAME_STATE':
			return {
				...state,
				opponentId: action.opponentId,
				gameState: action.gameState,
				availableActions: action.availableActions,
			}
		default:
			return state
	}
}

export default rootReducer
