import {RootState} from 'store'

export const getStats = (state: RootState) => {
	return getSession(state).stats
}

export const getUUID = (state: RootState) => {
	return getSession(state).uuid
}
