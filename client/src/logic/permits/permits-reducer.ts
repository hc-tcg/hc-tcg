import {AnyAction} from 'redux'
import {CardUnlock} from 'common/types/permits'

type PermitsState = {
	permits: string[]
	credits: number
	lastPurchase: CardUnlock | undefined
	lastPurchaseProblem: string
}

const defaultState: PermitsState = {
	permits: [],
	credits: 0,
	lastPurchase: undefined,
	lastPurchaseProblem: '',
}

const permitsReducer = (state = defaultState, action: AnyAction): PermitsState => {
	switch (action.type) {
		case 'MAKE_PURCHASE':
			const payload = action.payload as CardUnlock
			return {
				...state,
				permits: state.permits.concat([payload.card]),
				credits: state.credits - payload.price,
				lastPurchase: payload,
				lastPurchaseProblem: '',
			}
		case 'FAIL_PURCHASE':
			return {
				...state,
				lastPurchase: undefined,
				lastPurchaseProblem: action.payload,
			}
		case 'REWARD_PLAYER':
			return {
				...state,
				credits: state.credits + action.payload,
			}
		case 'CLEAR_RESULT':
			return {
				...state,
				lastPurchase: undefined,
				lastPurchaseProblem: action.payload,
			}
		case 'SET_PERMITS':
			return action.payload
		default:
			return state
	}
}

export default permitsReducer
