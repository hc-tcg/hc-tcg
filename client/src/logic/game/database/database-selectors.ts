import {RootState} from 'store'

export const getLocalDatabaseInfo = (state: RootState) => {
	return state.databaseInfo
}

export const getAchievements = (state: RootState) => {
	return getLocalDatabaseInfo(state).achievements
}

export const getAppearance = (state: RootState) => {
	return getLocalDatabaseInfo(state).appearance
}
