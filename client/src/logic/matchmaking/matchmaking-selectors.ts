import {RootState} from 'store'

export const getMatchmaking = (state: RootState) => {
	return state.matchmaking
}

export const getStatus = (state: RootState) => {
	return getMatchmaking(state).status
}

export const getGameCode = (state: RootState) => {
	return getMatchmaking(state).gameCode
}

export const getSpectatorCode = (state: RootState) => {
	return getMatchmaking(state).spectatorCode
}
