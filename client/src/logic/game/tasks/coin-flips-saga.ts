import {SagaIterator} from 'redux-saga'
import {delay, put} from 'redux-saga/effects'
import {CoinFlipInfo, LocalGameState} from 'common/types/game-state'
import {setCoinFlip} from '../game-actions'
import CARDS from 'server/cards'

function* coinFlipSaga(
	gameState: LocalGameState,
	coinFlipInfo: CoinFlipInfo
): SagaIterator {
	// reset shown coinFlips on new turn
	if (gameState.turn !== coinFlipInfo.turn) {
		coinFlipInfo.shownCoinFlips = []
		coinFlipInfo.turn = gameState.turn
	}

	yield put(setCoinFlip(null))

	// Get new coin flips
	const coinFlips = gameState.players[gameState.currentPlayerId].coinFlips
	const newIds = Object.keys(coinFlips).filter(
		(flipId) => !coinFlipInfo.shownCoinFlips.includes(flipId)
	)
	if (newIds.length) {
		// Display new coin flips one by one
		for (const id of newIds) {
			const coinFlip = coinFlips[id]
			coinFlipInfo.shownCoinFlips.push(id)
			const name = Object.hasOwn(CARDS, id) ? CARDS[id].name : id
			yield put(setCoinFlip({name, tosses: coinFlip}))
			yield delay(2500)
		}
		yield put(setCoinFlip(null))
	}
	return coinFlipInfo
}

export default coinFlipSaga
