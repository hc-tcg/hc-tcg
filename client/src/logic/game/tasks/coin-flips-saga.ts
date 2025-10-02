import {LocalGameState} from 'common/types/game-state'
import {LocalMessage, localMessages} from 'logic/messages'
import {SagaIterator} from 'redux-saga'
import {delay} from 'redux-saga/effects'
import {put} from 'typed-redux-saga'

function* coinFlipSaga(gameState: LocalGameState): SagaIterator {
	yield* put<LocalMessage>({
		type: localMessages.GAME_COIN_FLIP_SET,
		coinFlip: null,
	})

	// Get new coin flips
	const coinFlips =
		gameState.players[gameState.turn.currentPlayerEntity].coinFlips
	for (const coinFlip of coinFlips) {
		yield* put<LocalMessage>({type: localMessages.GAME_COIN_FLIP_SET, coinFlip})
		console.log("starting wait")
		if (coinFlip.delay) {
			yield delay(coinFlip.delay)
		}
		console.log("ending wait")
	}

	yield* put<LocalMessage>({
		type: localMessages.GAME_COIN_FLIP_SET,
		coinFlip: null,
	})
}

export default coinFlipSaga
