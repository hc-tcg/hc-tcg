import {PlayerId} from 'common/models/player-model'
import {actions} from 'common/redux-actions'
import {PlayerDeckT} from 'common/types/deck'

export const sessionActions = actions(
	'LOGIN',
	'SET_PLAYER_INFO',
	'DISCONNECT',
	'LOGOUT',
	'SET_NEW_DECK',
	'SET_MINECRAFT_NAME',
	'LOAD_UPDATES',
	'SET_TOAST',
	'CLOSE_TOAST',
)

export const login = (playerName: string) => ({
	type: sessionActions.LOGIN,
	payload: playerName,
})

type PlayerInfoT = {
	playerId: PlayerId
	playerName: string
	minecraftName: string
	playerSecret: string
	playerDeck: PlayerDeckT
}

export const setPlayerInfo = (playerInfo: PlayerInfoT) => ({
	type: 'SET_PLAYER_INFO' as const,
	payload: playerInfo,
})

export const disconnect = (errorType?: string) => ({
	type: sessionActions.DISCONNECT,
	payload: errorType,
})

export const logout = () => ({
	type: 'LOGOUT' as const,
})

export const setNewDeck = (newDeck: PlayerDeckT) => ({
	type: 'SET_NEW_DECK' as const,
	payload: newDeck,
})

export const setMinecraftName = (name: string) => ({
	type: 'SET_MINECRAFT_NAME' as const,
	payload: name,
})

export const loadUpdates = (updates: Array<string>) => ({
	type: 'LOAD_UPDATES' as const,
	payload: {updates},
})

type SetToastDefs = {
	open: boolean
	title: string
	description: string
	image: string
}

export const setToast = ({open, title, description, image}: SetToastDefs) => ({
	type: 'SET_TOAST' as const,
	payload: {
		open,
		title,
		description,
		image,
	},
})

export const closeToast = () => ({
	type: 'CLOSE_TOAST' as const,
})

export type SessionActions =
	| ReturnType<typeof login>
	| ReturnType<typeof setPlayerInfo>
	| ReturnType<typeof disconnect>
	| ReturnType<typeof logout>
	| ReturnType<typeof setNewDeck>
	| ReturnType<typeof setMinecraftName>
	| ReturnType<typeof loadUpdates>
	| ReturnType<typeof setToast>
	| ReturnType<typeof closeToast>
