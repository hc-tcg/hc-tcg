import {serverMessages} from 'common/socket-messages/server-messages'
import {LocalGameState} from 'common/types/game-state'
import {LocalMessage, localMessages} from 'logic/messages'
import {receiveMsg} from 'logic/socket/socket-saga'
import {getSocket} from 'logic/socket/socket-selectors'
import {SagaIterator} from 'redux-saga'
import {delay} from 'redux-saga/effects'
import {call, put, select} from 'typed-redux-saga'

function* coinFlipSaga(gameState: LocalGameState): SagaIterator {
	const socket = yield* select(getSocket)

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
		let serverCoinFlips = yield* call(
			receiveMsg<typeof serverMessages.GAME_SEND_COIN_FLIP>(
				socket,
				serverMessages.GAME_SEND_COIN_FLIP,
			),
		)

		const completeFlip = {
			...coinFlip,
			tosses: serverCoinFlips.result.map((r) => {
				return {
					result: r,
					forced: false,
				}
			}),
		}
		yield* put<LocalMessage>({
			type: localMessages.GAME_COIN_FLIP_SET,
			coinFlip: completeFlip,
		})

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
