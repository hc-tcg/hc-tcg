import {RootState} from 'store'

export const getPermits = (state: RootState) => {
	return state.permits
}

export const getCredits = (state: RootState) => {
	return getPermits(state).credits
}

export const getUnlockedPermits = (state: RootState) => {
	return getPermits(state).permits
}
