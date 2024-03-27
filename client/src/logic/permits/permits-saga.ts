import {CardT} from 'common/types/game-state'
import {failPurchase, makePurchase, rewardPlayer, setPermits} from './permits-actions'
import {all, fork, put, select, takeEvery, takeLatest} from 'typed-redux-saga'
import {AnyAction} from 'redux'
import {PermitRarityT} from 'common/types/permits'
import {PERMIT_RANKS} from 'common/config'
import {getCredits, getPermits, getUnlockedPermits} from './permits-selectors'
import {receiveMsg} from 'logic/socket/socket-saga'

const loadCredits = () => {
	const permitsString = localStorage.getItem('permits')
	const permits: string[] = JSON.parse(permitsString ? permitsString : '[]')
	const creditsString = localStorage.getItem('credits')
	const credits: number = parseInt(creditsString ? creditsString : '200')

	return {permits, credits}
}

const saveCredits = ({permits, credits}: {permits: string[]; credits: number}) => {
	localStorage.setItem('permits', JSON.stringify(permits))
	localStorage.setItem('credits', credits.toString())
}

export function* permitsSaga() {
	yield put(setPermits(loadCredits()))

	yield all([takeEvery('ROLL_PERMIT', permitPurchase), fork(trackGameResult)])
}

function* permitPurchase(action: AnyAction) {
	const currentCards: string[] = yield select(getUnlockedPermits)
	const currentCredits: number = yield select(getCredits)

	const rarity = action.payload as PermitRarityT

	if (!['free', 'iron', 'gold', 'diamond'].includes(rarity)) {
		//Can only happen if someone is messing around
		yield put(failPurchase(`Unknown permit: ${rarity}`))
		return
	}

	if (PERMIT_RANKS.prices[rarity] > currentCredits) {
		yield put(
			failPurchase(
				`You need ${
					PERMIT_RANKS.prices[rarity] - currentCredits
				} emeralds to buy a ${rarity} permit!`
			)
		)
		return
	}

	const unowned_cards = PERMIT_RANKS[rarity].filter((cardId) => !currentCards.includes(cardId))
	if (unowned_cards.length === 0) {
		yield put(failPurchase(`You already own all ${rarity} permits!`))
		return
	}
	const index = Math.round(Math.random() * unowned_cards.length)

	yield put(
		makePurchase({
			card: unowned_cards[index],
			price: PERMIT_RANKS.prices[rarity],
		})
	)

	saveCredits(yield select(getPermits))
}

function* trackGameResult() {
	while (true) {
		const {won} = yield receiveMsg('gameoverstat')

		if (won) yield put(rewardPlayer(300))
		else yield put(rewardPlayer(300))

		saveCredits(yield select(getPermits))
	}
}
