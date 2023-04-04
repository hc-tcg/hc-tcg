import {SagaIterator} from 'redux-saga'
import {select} from 'typed-redux-saga'
import {delay, put, takeLatest} from 'redux-saga/effects'
import {LocalGameState} from 'common/types/game-state'
import {getCurrentPlayerState} from '../game-selectors'
import {setCoinFlip} from '../game-actions'
import CARDS from 'server/cards'

function* coinFlipSaga(): SagaIterator {
	let turn = 0
	let shownCoinFlips: Array<string> = []
	yield takeLatest('GAME_STATE', function* (action: any): SagaIterator {
		const gameState: LocalGameState = action.payload.localGameState

		yield put(setCoinFlip(null))

		// reset shown coinFlips on new turn
		if (gameState.turn !== turn) {
			shownCoinFlips = []
			turn = gameState.turn
		}

		// Get new coin flips since last GAME_STATE
		const currentPlayer = yield* select(getCurrentPlayerState)
		if (!currentPlayer) return
		const coinFlips = currentPlayer.coinFlips
		const newIds = Object.keys(coinFlips).filter(
			(flipId) => !shownCoinFlips.includes(flipId)
		)
		if (!newIds.length) return

		// Display new coin flips one by one
		for (const id of newIds) {
			const coinFlip = coinFlips[id]
			shownCoinFlips.push(id)
			const name = Object.hasOwn(CARDS, id) ? CARDS[id].name : id
			yield put(setCoinFlip({name, tosses: coinFlip}))
			yield delay(2500)
		}
		yield put(setCoinFlip(null))
	})
}

export default coinFlipSaga
