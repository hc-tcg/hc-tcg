import {RootState} from 'store'

export const getSession = (state: RootState) => {
	return state.session
}

export const getPlayerId = (state: RootState) => {
	return getSession(state).playerId
}

export const getPlayerSecret = (state: RootState) => {
	return getSession(state).playerSecret
}

export const getPlayerName = (state: RootState) => {
	return getSession(state).playerName
}

export const getPlayerDeck = (state: RootState) => {
	return getSession(state).playerDeck
}

export const getConnecting = (state: RootState) => {
	return getSession(state).connecting
}

export const getErrorType = (state: RootState) => {
	return getSession(state).errorType
}

export const getToast = (state: RootState) => {
	return getSession(state).toast
}
