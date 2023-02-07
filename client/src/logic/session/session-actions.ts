export const login = (playerName: string) => ({
	type: 'LOGIN',
	payload: playerName,
})

type PlayerInfo = {
	playerId: string
	playerName: string
	playerSecret: string
	playerDeck?: Array<string>
}

export const setPlayerInfo = (playerInfo: PlayerInfo) => ({
	type: 'SET_PLAYER_INFO',
	payload: playerInfo,
})

export const disconnect = () => ({
	type: 'DISCONNECT',
})

export const logout = () => ({
	type: 'LOGOUT',
})
