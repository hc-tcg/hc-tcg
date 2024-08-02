import {RootState} from "store"

export const getSettings = (state: RootState) => {
	return state.localSettings
}
