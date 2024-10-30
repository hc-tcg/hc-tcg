import {RootState} from 'store'

export const getLocalDatabaseInfo = (state: RootState) => {
	return state.databaseInfo
}
