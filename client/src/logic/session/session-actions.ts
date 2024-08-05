import {PlayerId} from 'common/models/player-model'
import {Action, actions} from 'common/redux-actions'
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

export type SessionAction = Action<
	| typeof login
	| typeof setPlayerInfo
	| typeof disconnect
	| typeof logout
	| typeof setNewDeck
	| typeof setMinecraftName
	| typeof loadUpdates
	| typeof setToast
	| typeof closeToast
>

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
	type: sessionActions.SET_PLAYER_INFO,
	payload: playerInfo,
})

export const disconnect = (errorType?: string) => ({
	type: sessionActions.DISCONNECT,
	payload: errorType,
})

export const logout = () => ({
	type: sessionActions.LOGOUT,
})

export const setNewDeck = (newDeck: PlayerDeckT) => ({
	type: sessionActions.SET_NEW_DECK,
	payload: newDeck,
})

export const setMinecraftName = (name: string) => ({
	type: sessionActions.SET_MINECRAFT_NAME,
	payload: name,
})

export const loadUpdates = (updates: Array<string>) => ({
	type: sessionActions.LOAD_UPDATES,
	payload: {updates},
})

type SetToastDefs = {
	open: boolean
	title: string
	description: string
	image: string
}

export const setToast = ({open, title, description, image}: SetToastDefs) => ({
	type: sessionActions.SET_TOAST,
	payload: {
		open,
		title,
		description,
		image,
	},
})

export const closeToast = () => ({
	type: sessionActions.CLOSE_TOAST,
})
