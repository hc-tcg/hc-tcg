import {AnyAction} from 'redux'

type SessionState = {
	playerName: string
	playerId: string
	playerSecret: string
	playerDeck: Array<string>
	connecting: boolean
	errorType?:
		| 'invalid_name'
		| 'invalid_version'
		| 'session_expired'
		| 'timeout'
		| string
}

const defaultState: SessionState = {
	playerName: '',
	playerId: '',
	playerSecret: '',
	playerDeck: [],
	connecting: false,
}

const loginReducer = (
	state = defaultState,
	action: AnyAction
): SessionState => {
	switch (action.type) {
		case 'LOGIN':
			return {...state, connecting: true, errorType: undefined}
		case 'DISCONNECT':
			return {
				...state,
				connecting: false,
				playerName: '',
				playerId: '',
				playerSecret: '',
				playerDeck: [],
				errorType: action.payload,
			}
		case 'SET_PLAYER_INFO':
			return {
				...state,
				connecting: false,
				errorType: undefined,
				...action.payload,
			}
		case 'SET_NEW_DECK':
			return {
				...state,
				playerDeck: action.payload,
			}
		default:
			return state
	}
}

export default loginReducer
