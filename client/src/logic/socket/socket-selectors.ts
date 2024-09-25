import {RootState} from 'store'

export const getSocket = (state: RootState) => {
	return state.socketStatus.socket
}

export const getSocketStatus = (state: RootState) => {
	return state.socketStatus?.status || null
}
