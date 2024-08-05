import {Message, MessageTable, messages} from 'common/redux-actions'
import {PlayerDeckT} from 'common/types/deck'
import {PlayerInfo} from 'common/types/server-requests'

export const sessionActions = messages(
	'LOGIN',
	'SET_PLAYER_INFO',
	'DISCONNECT',
	'LOGOUT',
	'SET_NEW_DECK',
	'SET_MINECRAFT_NAME',
	'LOAD_UPDATES',
	'SET_TOAST',
	'CLOSE_TOAST',
	'UPDATE_DECK',
	'UPDATE_MINECRAFT_NAME',
)

export type SessionMessages = [
	{type: typeof sessionActions.LOGIN; name: string},
	{type: typeof sessionActions.SET_PLAYER_INFO; player: PlayerInfo},
	{type: typeof sessionActions.DISCONNECT; errorMessage: string},
	{type: typeof sessionActions.LOGOUT},
	{type: typeof sessionActions.SET_NEW_DECK; deck: PlayerDeckT},
	{type: typeof sessionActions.SET_MINECRAFT_NAME; name: string},
	{type: typeof sessionActions.LOAD_UPDATES; updates: Record<string, string[]>},
	{
		type: typeof sessionActions.SET_TOAST
		open: boolean
		title: string
		description: string
		image: string
	},
	{type: typeof sessionActions.CLOSE_TOAST},
	{type: typeof sessionActions.UPDATE_DECK; deck: PlayerDeckT},
	{type: typeof sessionActions.UPDATE_MINECRAFT_NAME; name: string},
]

export type SessionMessage = Message<SessionMessages>
export type SessionMessageTable = MessageTable<SessionMessages>
