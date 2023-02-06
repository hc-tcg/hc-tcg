import {RootState} from 'store'

export const getMatchmaking = (state: RootState) => {
	return state.matchmaking
}

export const getStatus = (state: RootState) => {
	return getMatchmaking(state).status
}

export const getCode = (state: RootState) => {
	return getMatchmaking(state).code
}

export const getInvalidCode = (state: RootState) => {
	return getMatchmaking(state).invalidCode
}
