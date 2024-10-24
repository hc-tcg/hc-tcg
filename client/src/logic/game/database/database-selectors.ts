import {RootState} from 'store'

export const getDatabaseKeys = (state: RootState) => {
	return state.databaseInfo
}
