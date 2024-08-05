import assert from 'assert'
import {message} from 'common/redux-actions'
import {clientMessages} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {GameMessage, gameActions} from 'logic/game/game-actions'
import gameSaga from 'logic/game/game-saga'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import {
	call,
	cancelled,
	fork,
	put,
	race,
	take,
	takeEvery,
} from 'typed-redux-saga'
import {
	MatchmakingMessage,
	MatchmakingMessageTable,
	matchmakingActions,
} from './matchmaking-actions'

function* createPrivateGameSaga() {
	function* matchmaking() {
		try {
			// Send message to server to create the game
			yield* sendMsg({type: clientMessages.CREATE_PRIVATE_GAME})

			// Wait for response
			const createGameResponse = yield* race({
				success: call(receiveMsg(serverMessages.CREATE_PRIVATE_GAME_SUCCESS)),
				failure: call(receiveMsg(serverMessages.CREATE_PRIVATE_GAME_FAILURE)),
			})

			if (createGameResponse.success) {
				yield* put(
					message<MatchmakingMessage>({
						type: 'CODE_RECIEVED',
						code: createGameResponse.success.code,
					}),
				)
			} else {
				// Something went wrong, go back to menu
				yield* put(
					message<MatchmakingMessage>({
						type: matchmakingActions.CLEAR_MATCHMAKING,
					}),
				)
				return
			}

			// Wait for game start or timeout
			const queueResponse = yield* race({
				gameStart: call(receiveMsg(serverMessages.GAME_START)),
				timeout: call(receiveMsg(serverMessages.PRIVATE_GAME_TIMEOUT)),
			})

			if (queueResponse.gameStart) {
				yield* call(gameSaga)
			}
		} catch (err) {
			console.error('Game crashed: ', err)
		} finally {
			if (yield* cancelled()) {
				yield* put(
					message<MatchmakingMessage>({
						type: matchmakingActions.CLEAR_MATCHMAKING,
					}),
				)
				yield* put(message<GameMessage>({type: gameActions.GAME_END}))
			}
		}
	}

	const result = yield* race({
		cancel: take('LEAVE_MATCHMAKING'), // We pressed the leave button
		matchmaking: call(matchmaking),
	})
	yield* put(
		message<MatchmakingMessage>({type: matchmakingActions.CLEAR_MATCHMAKING}),
	)

	if (result.cancel) {
		// Tell the server the private game is cancelled
		yield* sendMsg({type: clientMessages.CANCEL_PRIVATE_GAME})
	}
}

function* joinPrivateGameSaga() {
	function* matchmaking() {
		try {
			while (true) {
				const {code} = yield* take<
					MatchmakingMessageTable[typeof matchmakingActions.SET_MATCHMAKING_CODE]
				>(matchmakingActions.SET_MATCHMAKING_CODE)

				yield* sendMsg({type: clientMessages.JOIN_PRIVATE_GAME, code})

				const result = yield* race({
					failure: call(receiveMsg(serverMessages.JOIN_PRIVATE_GAME_FAILURE)),
					success: call(receiveMsg(serverMessages.JOIN_PRIVATE_GAME_SUCCESS)),
					invalidCode: call(receiveMsg(serverMessages.INVALID_CODE)),
					waitingForPlayer: call(receiveMsg(serverMessages.WAITING_FOR_PLAYER)),
					timeout: call(receiveMsg(serverMessages.PRIVATE_GAME_TIMEOUT)),
				})

				if (result.invalidCode) {
					yield* put(
						message<MatchmakingMessage>({
							type: matchmakingActions.INVALID_CODE,
						}),
					)
					continue
				}

				if (result.failure) {
					// Something went wrong, go back to menu
					yield* put(
						message<MatchmakingMessage>({
							type: matchmakingActions.CLEAR_MATCHMAKING,
						}),
					)
				} else if (result.success || result.waitingForPlayer) {
					if (result.waitingForPlayer) {
						yield* put(
							message<MatchmakingMessage>({
								type: matchmakingActions.WAITING_FOR_PLAYER,
							}),
						)
					}

					// Private game joined successfully - wait for game start or timeout
					const queueResponse = yield* race({
						gameStart: call(receiveMsg(serverMessages.GAME_START)),
						timeout: call(receiveMsg(serverMessages.PRIVATE_GAME_TIMEOUT)),
					})

					if (queueResponse.gameStart) {
						yield* call(gameSaga)
					}
				} else if (result.invalidCode) {
					yield* put(message<MatchmakingMessage>({type: 'INVALID_CODE'}))
				}

				// For anything but invalid code, we exit loop
				break
			}
		} catch (err) {
			console.error('Game crashed: ', err)
		} finally {
			if (yield* cancelled()) {
				yield put(message<GameMessage>({type: gameActions.GAME_END}))
				yield* put(
					message<MatchmakingMessage>({
						type: matchmakingActions.CLEAR_MATCHMAKING,
					}),
				)
			}
		}
	}

	const result = yield* race({
		cancel: take(matchmakingActions.LEAVE_MATCHMAKING), // We pressed the leave button
		matchmaking: call(matchmaking),
	})

	yield* put(
		message<MatchmakingMessage>({type: matchmakingActions.CLEAR_MATCHMAKING}),
	)

	if (result.cancel) {
		// If we are waiting for a game here - i.e. we are in the private queue - Then cancel it
		yield* sendMsg({type: clientMessages.CANCEL_PRIVATE_GAME})
	}
}

function* joinQueueSaga() {
	function* matchmaking() {
		try {
			// Send message to server to join the queue
			yield* sendMsg({type: clientMessages.JOIN_QUEUE})

			// Wait for response
			const joinResponse = yield* race({
				success: call(receiveMsg(serverMessages.JOIN_PRIVATE_GAME_SUCCESS)),
				failure: call(receiveMsg(serverMessages.JOIN_PRIVATE_GAME_FAILURE)),
			})

			if (joinResponse.failure) {
				// Something went wrong, go back to menu
				yield* put(
					message<MatchmakingMessage>({
						type: matchmakingActions.CLEAR_MATCHMAKING,
					}),
				)
				return
			}

			// We have joined the queue, wait for game start
			yield* call(receiveMsg(serverMessages.GAME_START))
			yield* call(gameSaga)
			console.log('end game sagas')
		} catch (err) {
			console.error('Game crashed: ', err)
		} finally {
			if (yield* cancelled()) {
				// Clear state and back to menu
				yield* put(
					message<MatchmakingMessage>({
						type: matchmakingActions.CLEAR_MATCHMAKING,
					}),
				)
				yield put(message<GameMessage>({type: gameActions.GAME_END}))
			}
		}
	}

	const result = yield* race({
		leave: take(matchmakingActions.LEAVE_MATCHMAKING), // We pressed the leave button
		matchmaking: call(matchmaking),
	})

	yield* put(
		message<MatchmakingMessage>({type: matchmakingActions.CLEAR_MATCHMAKING}),
	)

	if (result.leave) {
		// Tell the server we left the queue
		yield* call(sendMsg({type: clientMessages.LEAVE_QUEUE}))
	} else {
		yield* put(
			message<MatchmakingMessage>({type: matchmakingActions.CLEAR_MATCHMAKING}),
		)
	}
}

function* reconnectSaga() {
	const reconnectState = yield* call(
		receiveMsg(serverMessages.GAME_STATE_ON_RECONNECT),
	)
	yield* put(
		message<MatchmakingMessage>({type: matchmakingActions.CLEAR_MATCHMAKING}),
	)
	assert(
		reconnectState.localGameState,
		'The user must be in a game when they connect',
	)
	yield* call(gameSaga, reconnectState.localGameState)
	yield* put(
		message<MatchmakingMessage>({type: matchmakingActions.CLEAR_MATCHMAKING}),
	)
}

function* matchmakingSaga() {
	yield* takeEvery(matchmakingActions.JOIN_QUEUE, joinQueueSaga)
	yield* takeEvery(
		matchmakingActions.CREATE_PRIVATE_GAME,
		createPrivateGameSaga,
	)
	yield* takeEvery(matchmakingActions.JOIN_PRIVATE_GAME, joinPrivateGameSaga)
	yield* fork(reconnectSaga)
}

export default matchmakingSaga
