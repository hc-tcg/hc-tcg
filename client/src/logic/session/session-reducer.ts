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
		default:
			return state
	}
}

export default loginReducer
