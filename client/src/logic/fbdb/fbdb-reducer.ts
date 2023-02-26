import {AnyAction} from 'redux'

type FbdbState = {
	uuid: string
	stats: {w: number; l: number; fw: number; fl: number; t: number}
}

const defaultState: FbdbState = {
	uuid: '',
	stats: {w: 0, l: 0, fw: 0, fl: 0, t: 0},
}

const fbdbReducer = (state = defaultState, action: AnyAction): FbdbState => {
	switch (action.type) {
		case 'STATS':
			return {...state, stats: action.payload}
		case 'AUTHED':
			return {...state, uuid: action.payload}
		default:
			return state
	}
}

export default fbdbReducer
