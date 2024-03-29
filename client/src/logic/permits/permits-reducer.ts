import {AnyAction} from 'redux'
import {CardUnlock} from 'common/types/permits'
import {CREDIT_VALUES} from 'common/config'

type PermitsState = {
	permits: string[]
	credits: number
	lastPurchase: CardUnlock | undefined
	lastPurchaseProblem: string
	gameResults: Array<string>
}

const defaultState: PermitsState = {
	permits: [],
	credits: 0,
	lastPurchase: undefined,
	lastPurchaseProblem: '',
	gameResults: [],
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
				gameResults: action.payload,
				credits:
					state.credits +
					action.payload.reduce((previous: number, current: string) => {
						if ((CREDIT_VALUES as Record<string, any>)[current])
							return previous + (CREDIT_VALUES as Record<string, any>)[current].value
						return previous
					}, 0),
			}
		case 'CLEAR_RESULT':
			return {
				...state,
				lastPurchase: undefined,
				lastPurchaseProblem: '',
			}
		case 'SET_PERMITS':
			return {
				...state,
				...action.payload,
			}
		default:
			return state
	}
}

export default permitsReducer
