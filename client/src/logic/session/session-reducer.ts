import {AnyAction} from 'redux'
import {PlayerDeckT} from 'common/types/deck'
import {ToastT} from 'common/types/app'

type SessionState = {
	playerName: string
	playerId: string
	playerSecret: string
	playerDeck: PlayerDeckT
	connecting: boolean
	errorType?:
		| 'invalid_name'
		| 'invalid_version'
		| 'session_expired'
		| 'timeout'
		| string
	toast: ToastT
}

const defaultState: SessionState = {
	playerName: '',
	playerId: '',
	playerSecret: '',
	playerDeck: {name: 'Default', icon: 'any', cards: []},
	connecting: false,
	toast: {open: false, title: '', description: '', image: ''},
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
				//@NOWTODO player deck issues
				playerDeck: state.playerDeck,
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
		case 'SET_TOAST':
			return {
				...state,
				toast: action.payload,
			}
		case 'CLOSE_TOAST':
			return {
				...state,
				toast: {
					...state.toast,
					open: false,
				},
			}
		default:
			return state
	}
}

export default loginReducer
