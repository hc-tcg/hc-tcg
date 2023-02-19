export const login = (playerName: string) => ({
	type: 'LOGIN',
	payload: playerName,
})

export const authlogin = (uuid: string) => ({
	type: 'AUTHED',
	payload: uuid,
})

export const statsupdate = (stats: {w: number, l: number, fw: number, fl: number}) => ({
	type: 'STATS',
	payload: stats,
})

type PlayerInfo = {
	playerId: string
	playerName: string
	playerSecret: string
	playerDeck?: Array<string>
}

export const setPlayerInfo = (playerInfo: PlayerInfo) => ({
	type: 'SET_PLAYER_INFO' as const,
	payload: playerInfo,
})

export const disconnect = () => ({
	type: 'DISCONNECT' as const,
})

export const logout = () => ({
	type: 'LOGOUT' as const,
})

export const setNewDeck = (newDeck: Array<string>) => ({
	type: 'SET_NEW_DECK',
	payload: newDeck,
})
