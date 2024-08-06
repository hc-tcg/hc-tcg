import {LocalGameState} from 'common/types/game-state'
import {actions, putAction} from 'logic/actions'
import {SagaIterator} from 'redux-saga'
import {delay} from 'redux-saga/effects'

function* coinFlipSaga(gameState: LocalGameState): SagaIterator {
	yield putAction({type: actions.GAME_COIN_FLIP_SET, coinFlip: null})

	// Get new coin flips
	const coinFlips =
		gameState.players[gameState.turn.currentPlayerEntity].coinFlips
	for (const coinFlip of coinFlips) {
		yield putAction({type: actions.GAME_COIN_FLIP_SET, coinFlip})
		yield delay(coinFlip.delay)
	}

	yield putAction({type: actions.GAME_COIN_FLIP_SET, coinFlip: null})
}

export default coinFlipSaga
