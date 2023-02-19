import {AnyAction} from 'redux'

type SessionState = {
	playerName: string
	playerId: string
	playerSecret: string
	playerDeck: Array<string>
	connecting: boolean
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
			return {...state, connecting: true}
		case 'STATS':
			return {...state, stats: action.payload}
		case 'AUTHED':
			return {...state, uuid: action.payload}
		case 'DISCONNECT':
			return {
				...state,
				connecting: false,
				playerName: '',
				playerId: '',
				playerSecret: '',
				playerDeck: [],
			}
		case 'SET_PLAYER_INFO':
			return {
				...state,
				connecting: false,
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
