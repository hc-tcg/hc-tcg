import {AnyAction} from 'redux'
import {PlayerDeckT} from 'common/types/deck'
import {ToastT} from 'common/types/app'
import {PlayerId} from 'common/models/player-model'

type SessionState = {
	playerName: string
	minecraftName: string
	playerId: PlayerId
	playerSecret: string
	playerDeck: PlayerDeckT
	connecting: boolean
	errorType?: 'invalid_name' | 'invalid_version' | 'session_expired' | 'timeout' | string
	toast: ToastT
	updates: Record<string, Array<string>>
}

const defaultState: SessionState = {
	playerName: '',
	minecraftName: '',
	playerId: '' as PlayerId,
	playerSecret: '',
	playerDeck: {name: '', icon: 'any', cards: []},
	connecting: false,
	toast: {open: false, title: '', description: '', image: ''},
	updates: {},
}

const loginReducer = (state = defaultState, action: AnyAction): SessionState => {
	switch (action.type) {
		case 'LOGIN':
			return {...state, connecting: true, errorType: undefined}
		case 'DISCONNECT':
			return {
				...state,
				connecting: false,
				playerName: '',
				minecraftName: '',
				playerId: '' as PlayerId,
				playerSecret: '',
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
		case 'LOAD_UPDATES':
			return {
				...state,
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
		case 'SET_MINECRAFT_NAME':
			return {
				...state,
				minecraftName: action.payload,
			}
		default:
			return state
	}
}

export default loginReducer
