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

export const getConnecting = (state: RootState) => {
	return getSession(state).connecting
}
