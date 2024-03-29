import {CardUnlock, PermitRarityT} from 'common/types/permits'

export const setPermits = (state: {permits: string[]; credits: number}) => ({
	type: 'SET_PERMITS' as const,
	payload: state,
})

export const makePurchase = (unlock: CardUnlock) => ({
	type: 'MAKE_PURCHASE' as const,
	payload: unlock,
})

export const failPurchase = (reason: string) => ({
	type: 'FAIL_PURCHASE' as const,
	payload: reason,
})

export const rewardPlayer = (reward: Array<string>) => ({
	type: 'REWARD_PLAYER' as const,
	payload: reward,
})

export const rollPermit = (rarity: PermitRarityT) => ({
	type: 'ROLL_PERMIT' as const,
	payload: rarity,
})

export const clearResult = () => ({
	type: 'CLEAR_RESULT',
})
