import {AnyAction} from 'redux'

type SessionState = {
	playerName: string
	playerId: string
	playerSecret: string
	playerDeck: Array<string>
	connecting: boolean
	uuid: string
	stats: {w: number, l: number, fw: number, fl: number}
}

const defaultState: SessionState = {
	playerName: '',
	playerId: '',
	playerSecret: '',
	playerDeck: [],
	connecting: false,
	uuid: '',
	stats: {w: 0, l:0, fw:0, fl: 0}
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
