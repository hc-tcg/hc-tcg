import {SagaIterator} from 'redux-saga'
import {delay, put} from 'redux-saga/effects'
import {LocalGameState} from 'common/types/game-state'
import {setCoinFlip} from '../game-actions'

function* coinFlipSaga(gameState: LocalGameState): SagaIterator {
	yield put(setCoinFlip(null))

	// Get new coin flips
	const coinFlips = gameState.players[gameState.turn.currentPlayerId].coinFlips
	for (const coinFlip of coinFlips) {
		yield put(setCoinFlip(coinFlip))
		yield delay(coinFlip.delay)
	}
	yield put(setCoinFlip(null))
}

export default coinFlipSaga
