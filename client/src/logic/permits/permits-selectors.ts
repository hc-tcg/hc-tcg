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

export const getRollFail = (state: RootState) => {
	return getPermits(state).lastPurchaseProblem
}

export const getRollResult = (state: RootState) => {
	return getPermits(state).lastPurchase
}

export const getGameResults = (state: RootState) => {
	return getPermits(state).gameResults
}
