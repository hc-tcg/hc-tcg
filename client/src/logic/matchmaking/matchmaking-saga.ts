import {clientMessages} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import gameSaga from 'logic/game/game-saga'
import {LocalMessage, LocalMessageTable, localMessages} from 'logic/messages'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import {getSocket} from 'logic/socket/socket-selectors'
import {
	call,
	cancel,
	cancelled,
	fork,
	put,
	race,
	select,
	take,
	takeEvery,
} from 'typed-redux-saga'

function* createBossGameSaga() {
	function* matchmaking() {
		const socket = yield* select(getSocket)
		try {
			// Send message to server to create the game
			yield* sendMsg({type: clientMessages.CREATE_BOSS_GAME})

			const createBossResponse = yield* race({
				success: call(
					receiveMsg(socket, serverMessages.CREATE_BOSS_GAME_SUCCESS),
				),
				failure: call(
					receiveMsg(socket, serverMessages.CREATE_BOSS_GAME_FAILURE),
				),
			})

			if (createBossResponse.failure) {
				yield* put<LocalMessage>({type: localMessages.MATCHMAKING_CLEAR})
				return
			}

			yield* call(receiveMsg, socket, localMessages.GAME_START)
			yield* put<LocalMessage>({
				type: localMessages.QUEUE_VOICE,
				lines: ['/voice/EXSTART.ogg'],
			})
			yield* call(gameSaga)
		} catch (err) {
			console.error('Game crashed: ', err)
		} finally {
			if (yield* cancelled()) {
				// Clear state and back to menu
				yield* put<LocalMessage>({type: localMessages.MATCHMAKING_CLEAR})
				yield* put<LocalMessage>({type: localMessages.GAME_END})
			}
		}
	}

	const result = yield* race({
		cancel: take('LEAVE_MATCHMAKING'),
		matchmaking: call(matchmaking),
	})

	yield* put<LocalMessage>({type: localMessages.MATCHMAKING_CLEAR})

	if (result.cancel) {
		yield* sendMsg({type: clientMessages.CANCEL_BOSS_GAME})
	}
}

function* privateLobbySaga() {
	function* matchmaking() {
		const socket = yield* select(getSocket)

		yield* sendMsg({type: clientMessages.CREATE_PRIVATE_GAME})

		const matchmakingCodeTask = yield* fork(function* () {
			const {code} = yield* take<
				LocalMessageTable[typeof localMessages.MATCHMAKING_CODE_SET]
			>(localMessages.MATCHMAKING_CODE_SET)

			yield* sendMsg({type: clientMessages.JOIN_PRIVATE_GAME, code})
		})

		try {
			while (true) {
				const result = yield* race({
					createPrivateGameSuccess: call(
						receiveMsg(socket, serverMessages.CREATE_PRIVATE_GAME_SUCCESS),
					),
					createPrivateGameFailure: call(
						receiveMsg(socket, serverMessages.CREATE_PRIVATE_GAME_FAILURE),
					),
					joinPrivateGameFailure: call(
						receiveMsg(socket, serverMessages.JOIN_PRIVATE_GAME_FAILURE),
					),
					joinPrivateGameSuccess: call(
						receiveMsg(socket, serverMessages.JOIN_PRIVATE_GAME_SUCCESS),
					),
					cancel: take(localMessages.MATCHMAKING_LEAVE), // We pressed the leave button
					invalidCode: call(receiveMsg(socket, serverMessages.INVALID_CODE)),
					waitingForPlayer: call(
						receiveMsg(socket, serverMessages.WAITING_FOR_PLAYER),
					),
					spectateSuccess: call(
						receiveMsg(socket, serverMessages.SPECTATE_PRIVATE_GAME_START),
					),
					specateWaitSuccess: call(
						receiveMsg(socket, serverMessages.SPECTATE_PRIVATE_GAME_WAITING),
					),
					timeout: call(
						receiveMsg(socket, serverMessages.PRIVATE_GAME_TIMEOUT),
					),
				})

				if (result.invalidCode) {
					yield* put<LocalMessage>({
						type: localMessages.MATCHMAKING_CODE_INVALID,
					})
					continue
				} else if (result.createPrivateGameSuccess) {
					yield* put<LocalMessage>({
						type: localMessages.MATCHMAKING_CODE_RECIEVED,
						gameCode: result.createPrivateGameSuccess.gameCode,
						spectatorCode: result.createPrivateGameSuccess.spectatorCode,
					})
					continue
				} else if (result.joinPrivateGameSuccess || result.waitingForPlayer) {
					if (result.waitingForPlayer) {
						yield* put<LocalMessage>({
							type: localMessages.MATCHMAKING_WAITING_FOR_PLAYER,
						})
					}

					// Private game joined successfully - wait for game start or timeout
					const queueResponse = yield* race({
						gameStart: call(receiveMsg(socket, serverMessages.GAME_START)),
						leave: take(localMessages.MATCHMAKING_LEAVE), // We pressed the leave button
						timeout: call(
							receiveMsg(socket, serverMessages.PRIVATE_GAME_TIMEOUT),
						),
					})

					if (queueResponse.gameStart) {
						yield* call(gameSaga)
						break
					}

					if (queueResponse.leave) {
						yield* sendMsg({
							type: clientMessages.LEAVE_PRIVATE_QUEUE,
						})
					}
				} else if (result.createPrivateGameFailure) {
					// Something went wrong, go back to menu
					yield* put<LocalMessage>({
						type: localMessages.MATCHMAKING_CLEAR,
					})
				} else if (result.joinPrivateGameFailure) {
					// Something went wrong, go back to menu
					yield* put<LocalMessage>({
						type: localMessages.MATCHMAKING_CLEAR,
					})
				} else if (result.spectateSuccess) {
					yield* call(gameSaga, result.spectateSuccess.localGameState)
				} else if (result.specateWaitSuccess) {
					yield* put<LocalMessage>({
						type: localMessages.MATCHMAKING_WAITING_FOR_PLAYER_AS_SPECTATOR,
					})
					let result = yield* race({
						matchmakingLeave: take(localMessages.MATCHMAKING_LEAVE),
						spectatePrivateGame: call(
							receiveMsg(socket, serverMessages.SPECTATE_PRIVATE_GAME_START),
						),
						timeout: call(
							receiveMsg(socket, serverMessages.PRIVATE_GAME_TIMEOUT),
						),
					})
					if (result.spectatePrivateGame) {
						yield* call(gameSaga, result.spectatePrivateGame.localGameState)
					}
					if (result.matchmakingLeave) {
						yield* sendMsg({
							type: clientMessages.SPECTATE_PRIVATE_GAME_QUEUE_LEAVE,
						})
					}
				}

				break
			}
		} catch (err) {
			console.error('Game crashed: ', err)
		} finally {
			if (yield* cancelled()) {
				yield put<LocalMessage>({type: localMessages.GAME_END})
				yield* put<LocalMessage>({
					type: localMessages.MATCHMAKING_CLEAR,
				})
			}
			yield cancel(matchmakingCodeTask)
		}
	}

	const result = yield* race({
		cancel: take(localMessages.MATCHMAKING_CLEAR), // We pressed the leave button
		matchmaking: call(matchmaking),
	})

	yield* put<LocalMessage>({type: localMessages.MATCHMAKING_CLEAR})

	if (result.cancel) {
		// If we are waiting for a game here - i.e. we are in the private queue - Then cancel it
		yield* sendMsg({type: clientMessages.CANCEL_PRIVATE_GAME})
	}
}

function* joinQueueSaga() {
	function* matchmaking() {
		const socket = yield* select(getSocket)
		try {
			// Send message to server to join the queue
			yield sendMsg({type: clientMessages.JOIN_QUEUE})

			// Wait for response
			const joinResponse = yield* race({
				success: call(receiveMsg(socket, serverMessages.JOIN_QUEUE_SUCCESS)),
				failure: call(receiveMsg(socket, serverMessages.JOIN_QUEUE_FAILURE)),
			})

			if (joinResponse.failure) {
				// Something went wrong, go back to menu
				yield* put<LocalMessage>({
					type: localMessages.MATCHMAKING_CLEAR,
				})
				return
			}

			// We have joined the queue, wait for game start
			yield call(receiveMsg(socket, serverMessages.GAME_START))
			yield call(gameSaga)
			console.log('end game sagas')
		} catch (err) {
			console.error('Game crashed: ', err)
		} finally {
			if (yield* cancelled()) {
				// Clear state and back to menu
				yield* put<LocalMessage>({
					type: localMessages.MATCHMAKING_CLEAR,
				})
				yield put<LocalMessage>({type: localMessages.GAME_END})
			}
		}
	}

	const result = yield* race({
		leave: take(localMessages.MATCHMAKING_LEAVE), // We pressed the leave button
		matchmaking: call(matchmaking),
	})

	yield* put<LocalMessage>({type: localMessages.MATCHMAKING_CLEAR})

	if (result.leave) {
		// Tell the server we left the queue
		yield* sendMsg({type: clientMessages.LEAVE_QUEUE})
	}
}

export function* reconnectSaga() {
	const socket = yield* select(getSocket)
	const reconnectState = yield* call(
		receiveMsg(socket, serverMessages.GAME_STATE_ON_RECONNECT),
	)
	yield* put<LocalMessage>({type: localMessages.MATCHMAKING_CLEAR})
	if (!reconnectState.localGameState)
		throw new Error('The user must be in a game when they reconnect')
	yield* call(gameSaga, reconnectState.localGameState)
	yield* put<LocalMessage>({type: localMessages.MATCHMAKING_CLEAR})
}

function* matchmakingSaga() {
	yield* takeEvery(localMessages.MATCHMAKING_QUEUE_JOIN, joinQueueSaga)
	yield* takeEvery(
		localMessages.MATCHMAKING_PRIVATE_GAME_LOBBY,
		privateLobbySaga,
	)
	yield* takeEvery(
		localMessages.MATCHMAKING_BOSS_GAME_CREATE,
		createBossGameSaga,
	)
	yield* fork(reconnectSaga)
}

export default matchmakingSaga
