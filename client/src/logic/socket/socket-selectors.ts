import {RootState} from "store"

export const getSocketStatus = (state: RootState) => {
	return state.socketStatus
}
