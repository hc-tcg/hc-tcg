export const randomMatchmaking = () => ({
	type: 'RANDOM_MATCHMAKING',
})

export const createPrivateGame = () => ({
	type: 'CREATE_PRIVATE_GAME',
})

export const joinPrivateGame = () => ({
	type: 'JOIN_PRIVATE_GAME',
})

export const codeReceived = (code: string) => ({
	type: 'CODE_RECEIVED',
	payload: code,
})

export const leaveMatchmaking = () => ({
	type: 'LEAVE_MATCHMAKING',
})

export const setCode = (gameCode: string | null) => ({
	type: 'SET_MATCHMAKING_CODE',
	payload: gameCode,
})

export const invalidCode = () => ({
	type: 'INVALID_CODE',
})
