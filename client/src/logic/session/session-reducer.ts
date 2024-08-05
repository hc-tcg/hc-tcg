import {PlayerId} from 'common/models/player-model'
import {ToastT} from 'common/types/app'
import {PlayerDeckT} from 'common/types/deck'
import {sessionActions, SessionActions} from './session-actions'

type SessionState = {
	playerName: string
	minecraftName: string
	playerId: PlayerId
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

const loginReducer = (
	state = defaultState,
	action: SessionActions,
): SessionState => {
	switch (action.type) {
		case sessionActions.LOGIN:
			return {...state, connecting: true, errorType: undefined}
		case sessionActions.DISCONNECT:
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
		case sessionActions.SET_PLAYER_INFO:
			return {
				...state,
				connecting: false,
				errorType: undefined,
				...action.payload,
			}
		case sessionActions.LOAD_UPDATES:
			return {
				...state,
				...action.payload,
			}
		case sessionActions.SET_NEW_DECK:
			return {
				...state,
				playerDeck: action.payload,
			}
		case sessionActions.SET_TOAST:
			return {
				...state,
				toast: action.payload,
			}
		case sessionActions.CLOSE_TOAST:
			return {
				...state,
				toast: {
					...state.toast,
					open: false,
				},
			}
		case sessionActions.SET_MINECRAFT_NAME:
			return {
				...state,
				minecraftName: action.payload,
			}
		default:
			return state
	}
}

export default loginReducer
