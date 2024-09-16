import {LocalMessage, localMessages} from 'logic/messages'

export type FbdbState = {
	uuid: string
	stats: {w: number; l: number; fw: number; fl: number; t: number}
}

const defaultState: FbdbState = {
	uuid: '',
	stats: {w: 0, l: 0, fw: 0, fl: 0, t: 0},
}

const fbdbReducer = (state = defaultState, action: LocalMessage): FbdbState => {
	switch (action.type) {
		case localMessages.FIREBASE_STATS:
			return {...state, stats: action}
		case localMessages.FIREBASE_AUTHED:
			return {...state, uuid: action.uuid}
		default:
			return state
	}
}

export default fbdbReducer
