import {AnyAction} from 'redux'

type SessionState = {
	playerName: string
	playerId: string
	playerSecret: string
	connecting: boolean
}

const defaultState: SessionState = {
	playerName: '',
	playerId: '',
	playerSecret: '',
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
