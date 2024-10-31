import {PlayerId} from 'common/models/player-model'
import {ToastT} from 'common/types/app'
import {Deck} from 'common/types/deck'
import {LocalMessage, localMessages} from 'logic/messages'

type SessionState = {
	playerName: string
	minecraftName: string
	playerId: PlayerId
	playerSecret: string
	playerDeck: Deck
	connecting: boolean
	connected: boolean
	errorType?:
		| 'invalid_name'
		| 'invalid_version'
		| 'session_expired'
		| 'timeout'
		| string
	toast: ToastT
	updates: Record<string, Array<string>>
	newPlayer: boolean //If the account was created this session
}

const defaultState: SessionState = {
	playerName: '',
	minecraftName: '',
	playerId: '' as PlayerId,
	playerSecret: '',
	playerDeck: {
		name: '',
		iconType: 'item',
		icon: 'any',
		code: '',
		cards: [],
		tags: [],
	},
	connecting: false,
	connected: false,
	toast: {open: false, title: '', description: '', image: ''},
	updates: {},
	newPlayer: false,
}

const loginReducer = (
	state = defaultState,
	action: LocalMessage,
): SessionState => {
	switch (action.type) {
		case localMessages.LOGIN:
			return {...state, connecting: true, errorType: undefined}
		case localMessages.DISCONNECT:
			return {
				...state,
				connecting: false,
				connected: false,
				playerName: '',
				minecraftName: '',
				playerId: '' as PlayerId,
				playerSecret: '',
				playerDeck: state.playerDeck,
				errorType: action.errorMessage,
			}
		case localMessages.PLAYER_INFO_SET:
		case localMessages.PLAYER_SESSION_SET:
			return {
				...state,
				errorType: undefined,
				...action.player,
			}
		case localMessages.CONNECTED:
			return {
				...state,
				connecting: false,
				connected: true,
			}
		case localMessages.UPDATES_LOAD:
			return {
				...state,
				...action.updates,
			}
		case localMessages.INSERT_DECK:
		case localMessages.SELECT_DECK:
			return {
				...state,
				playerDeck: {...action.deck, code: action.deck.code},
			}
		case localMessages.TOAST_OPEN:
			return {
				...state,
				toast: action,
			}
		case localMessages.TOAST_CLOSE:
			return {
				...state,
				toast: {
					...state.toast,
					open: false,
				},
			}
		case localMessages.MINECRAFT_NAME_NEW:
		case localMessages.MINECRAFT_NAME_SET:
			return {
				...state,
				minecraftName: action.name,
			}
		case localMessages.NEW_PLAYER:
			return {
				...state,
				newPlayer: true,
			}
		default:
			return state
	}
}

export default loginReducer
