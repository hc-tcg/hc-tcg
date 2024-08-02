import {RootState} from 'store'

export const getFbdb = (state: RootState) => {
	return state.fbdb
}

export const getStats = (state: RootState) => {
	return getFbdb(state).stats
}

export const getUUID = (state: RootState) => {
	return getFbdb(state).uuid
}
