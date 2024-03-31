import {CardT, GameState} from 'common/types/game-state'
import {failPurchase, makePurchase, rewardPlayer, setPermits} from './permits-actions'
import {all, fork, put, select, takeEvery, takeLatest} from 'typed-redux-saga'
import {AnyAction} from 'redux'
import {PermitRarityT} from 'common/types/permits'
import {PERMIT_RANKS} from 'common/config'
import {getCredits, getPermits, getUnlockedPermits} from './permits-selectors'
import {ServerMessage, receiveMsg} from 'logic/socket/socket-saga'
import {getPlayerDeck, getPlayerId} from 'logic/session/session-selectors'
import {CARDS} from 'common/cards'
import {PlayerDeckT} from 'common/types/deck'

const loadCredits = () => {
	const permitsString = localStorage.getItem('permits')
	const permits: string[] = JSON.parse(permitsString ? permitsString : '[]')
	const creditsString = localStorage.getItem('credits')
	const credits: number = parseInt(creditsString ? creditsString : '64')

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
				} diamonds to buy a ${rarity} permit!`
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
		const playerId: string = yield select(getPlayerId)

		const deckString = localStorage.getItem('currentDeck')
		const playerDeck: string[] = JSON.parse(deckString ? deckString : '[]')

		const deck = playerDeck[0] ? [...playerDeck[0]] : []

		const message: ServerMessage = yield receiveMsg('GAME_END')
		const {outcome, gameState}: {outcome: string; gameState: GameState} = message.payload

		const opponent = Object.keys(gameState.players)
			.filter((player) => player != playerId)
			.shift()

		const reward: Array<string> = []

		switch (outcome) {
			case 'you_won':
			case 'leave_win':
			case 'forfeit_win':
				reward.push('playMatch')
				reward.push('win')

				const hermitNumber = deck.reduce((previous, current) => {
					if (CARDS[current] && CARDS[current].type === 'hermit') return previous + 1
					return previous
				}, 0)

				if (hermitNumber === 1) reward.push('oneHermit')

				const ironPermitNumber = deck.reduce((previous, current) => {
					if (PERMIT_RANKS.iron.includes(current)) return previous + 1
					return previous
				}, 0)

				const goldPermitNumber = deck.reduce((previous, current) => {
					if (PERMIT_RANKS.gold.includes(current)) return previous + 1
					return previous
				}, 0)

				const diamondPermitNumber = deck.reduce((previous, current) => {
					if (PERMIT_RANKS.diamond.includes(current)) return previous + 1
					return previous
				}, 0)

				if (deck.length > 0 && ironPermitNumber === 0) reward.push('ironPermit')
				if (deck.length > 0 && goldPermitNumber === 0) reward.push('goldPermit')
				if (deck.length > 0 && diamondPermitNumber === 0) reward.push('diamondPermit')

				const doubleItemNumber = deck.reduce((previous, current) => {
					if (CARDS[current] && CARDS[current].type === 'item' && CARDS[current].rarity === 'rare')
						return previous + 1
					return previous
				}, 0)

				if (deck.length > 0 && doubleItemNumber === 0) reward.push('doubleItems')

				const uniqueHermitNames: Array<string> = []

				deck.forEach((card) => {
					if (!CARDS[card]) return
					const cardInfo = CARDS[card]
					if (cardInfo.type === 'hermit' && !uniqueHermitNames.includes(cardInfo.name)) {
						uniqueHermitNames.push(cardInfo.name)
					}
				})

				if (uniqueHermitNames.length === 1) reward.push('oneHermitName')

				break
			case 'you_lost':
				reward.push('playMatch')
				break
			case 'leave_loss':
			case 'forfeit_loss':
				break
			default:
				reward.push('tie')
		}

		if (opponent !== undefined) {
			for (var i = 0; i < 3 - gameState.players[opponent].lives; i++) {
				reward.push('knockout')
			}
		}

		yield put(rewardPlayer(reward))
		saveCredits(yield select(getPermits))
	}
}
