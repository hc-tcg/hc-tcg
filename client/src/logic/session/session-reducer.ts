import {PlayerId} from 'common/models/player-model'
import {ToastT} from 'common/types/app'
import {PlayerDeckT} from 'common/types/deck'
import { LocalMessage, actions } from 'logic/actions'

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
	action: LocalMessage,
): SessionState => {
	switch (action.type) {
		case actions.LOGIN:
			return {...state, connecting: true, errorType: undefined}
		case actions.DISCONNECT:
			return {
				...state,
				connecting: false,
				playerName: '',
				minecraftName: '',
				playerId: '' as PlayerId,
				playerSecret: '',
				playerDeck: state.playerDeck,
				errorType: action.errorMessage,
			}
		case actions.PLAYER_INFO_SET:
			return {
				...state,
				connecting: false,
				errorType: undefined,
				...action.player,
			}
		case actions.UPDATES_LOAD:
			return {
				...state,
				...action.updates,
			}
		case actions.DECK_SET:
			return {
				...state,
				playerDeck: action.deck,
			}
		case actions.TOAST_OPEN:
			return {
				...state,
				toast: action,
			}
		case actions.TOAST_CLOSE:
			return {
				...state,
				toast: {
					...state.toast,
					open: false,
				},
			}
		case actions.MINECRAFT_NAME_SET:
			return {
				...state,
				minecraftName: action.name,
			}
		default:
			return state
	}
}

export default loginReducer
