import {PlayerId} from 'common/models/player-model'
import {RematchData, ToastData} from 'common/types/app'
import {PlayerInfo, Update} from 'common/types/server-requests'
import {LocalMessage, localMessages} from 'logic/messages'
import React from 'react'

export type ConnectionError =
	| 'invalid_name'
	| 'invalid_version'
	| 'session_expired'
	| 'timeout'
	| 'xhr poll_error'
	| 'bad_auth'
	| 'invalid_session'
	| 'invalid_auth_entered'

type SessionState = {
	playerName: string
	minecraftName: string
	playerId: PlayerId
	playerSecret: string
	playerDeck: string | null
	connecting: boolean
	connectingMessage: string
	connected: boolean
	errorType?: ConnectionError
	tooltip: {
		anchor: React.RefObject<HTMLDivElement>
		tooltip: React.ReactNode
		tooltipHeight: number
		tooltipWidth: number
	} | null
	dropdown: {
		x: number
		y: number
		dropdown: React.ReactNode
		direction: 'up' | 'down'
		align: 'left' | 'right'
	} | null
	toast: Array<ToastData>
	updates: Array<Update>
	rematch: RematchData | null
	newPlayer: boolean //If the account was created this session
}

const defaultState: SessionState = {
	playerName: '',
	minecraftName: '',
	playerId: '' as PlayerId,
	playerSecret: '',
	playerDeck: null,
	connecting: true,
	connectingMessage: 'Connecting',
	connected: false,
	tooltip: null,
	dropdown: null,
	toast: [],
	updates: [],
	rematch: null,
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
				playerDeck:
					(action.player as PlayerInfo)?.playerDeck?.code || state.playerDeck,
			}
		case localMessages.NOT_CONNECTING:
			return {
				...state,
				connecting: false,
			}
		case localMessages.CONNECTED:
			return {
				...state,
				connecting: false,
				connected: true,
			}
		case localMessages.CONNECTING_MESSAGE:
			return {
				...state,
				connectingMessage: action.message,
			}
		case localMessages.UPDATES_LOAD:
			return {
				...state,
				updates: action.updates,
			}
		case localMessages.INSERT_DECK:
		case localMessages.UPDATE_DECK:
		case localMessages.SELECT_DECK:
			localStorage.setItem('activeDeck', action.deck.code)
			return {
				...state,
				playerDeck: action.deck.code,
			}
		case localMessages.TOAST_OPEN:
			return {
				...state,
				toast: [
					...state.toast,
					{
						id: state.toast.length + 1,
						toast: action,
						closed: false,
					},
				],
			}
		case localMessages.TOAST_CLOSE:
			const thisToast = state.toast.find((toast) => toast.id === action.id)
			if (thisToast) thisToast.closed = true
			if (state.toast.some((toast) => !toast.closed)) return state
			return {
				...state,
				toast: [],
			}
		case localMessages.EVERY_TOAST_CLOSE:
			return {
				...state,
				toast: [],
			}
		case localMessages.SHOW_TOOLTIP:
			return {
				...state,
				tooltip: {
					tooltip: action.tooltip,
					anchor: action.anchor,
					tooltipHeight: action.tooltipHeight,
					tooltipWidth: action.tooltipWidth,
				},
			}
		case localMessages.HIDE_TOOLTIP:
			return {
				...state,
				tooltip: null,
			}
		case localMessages.SHOW_DROPDOWN:
			return {
				...state,
				dropdown: {
					dropdown: action.dropdown,
					x: action.x,
					y: action.y,
					direction: action.direction,
					align: action.align,
				},
			}
		case localMessages.HIDE_DROPDOWN:
			return {
				...state,
				dropdown: null,
			}
		case localMessages.USERNAME_SET:
			return {
				...state,
				playerName: action.name,
			}
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
		case localMessages.RECIEVE_REMATCH:
			return {
				...state,
				rematch: action.rematch,
			}
		default:
			return state
	}
}

export default loginReducer
