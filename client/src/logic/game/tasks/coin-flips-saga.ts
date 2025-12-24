import {LocalGameState} from 'common/types/game-state'
import {LocalMessage, localMessages} from 'logic/messages'
import {getSocket} from 'logic/socket/socket-selectors'
import {SagaIterator} from 'redux-saga'
import {delay} from 'redux-saga/effects'
import {put, select} from 'typed-redux-saga'

function* coinFlipSaga(gameState: LocalGameState): SagaIterator {
	const _socket = yield* select(getSocket)

	// Get new coin flips
	let coinFlips =
		gameState.players[gameState.turn.currentPlayerEntity].coinFlips

	// We don't expect any coin flips from the server
	if (coinFlips.length === 0) {
		return
	}

	// Get new coin flips
	coinFlips = gameState.players[gameState.turn.currentPlayerEntity].coinFlips

	for (const coinFlip of coinFlips) {
		console.log(coinFlip)
		yield* put<LocalMessage>({
			type: localMessages.GAME_COIN_FLIP_SET,
			coinFlip: coinFlip,
		})

		console.log(coinFlip.delay)
		console.log('delaying')
		if (coinFlip.delay) {
			yield delay(coinFlip.delay)
		}
	}

	console.log('coin flip saga ended')
	yield* put<LocalMessage>({
		type: localMessages.GAME_COIN_FLIP_SET,
		coinFlip: null,
	})
}

export default coinFlipSaga
