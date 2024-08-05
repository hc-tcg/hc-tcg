import {PlayerId} from 'common/models/player-model'
import {Action, actions, ActionTable} from 'common/redux-actions'
import {PlayerDeckT} from 'common/types/deck'

const sessionPayloads = () => ({
	login,
	setPlayerInfo,
	disconnect,
	logout,
	setNewDeck,
	setMinecraftName,
	loadUpdates,
	setToast,
	closeToast,
	updateDeck,
	updateMinecraftName,
})

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
	'UPDATE_DECK',
	'UPDATE_MINECRAFT_NAME',
)

export type SessionAction = Action<typeof sessionPayloads>
export type SessionActionTable = ActionTable<typeof sessionPayloads>

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

export const loadUpdates = (updates: Record<string, string[]>) => ({
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

export const updateDeck = (deck: PlayerDeckT) => ({
	type: sessionActions.UPDATE_DECK,
	payload: deck,
})

export const updateMinecraftName = (name: string) => ({
	type: sessionActions.UPDATE_MINECRAFT_NAME,
	payload: name,
})
