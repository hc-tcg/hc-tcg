import {
	ClientMessageTable,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {Deck} from 'common/types/deck'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import gameSaga from 'logic/game/game-saga'
import {LocalMessage, LocalMessageTable, localMessages} from 'logic/messages'
import {
	getPlayerDeckCode,
	getRematchData,
} from 'logic/session/session-selectors'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import {getSocket} from 'logic/socket/socket-selectors'
import {
	call,
	cancelled,
	delay,
	put,
	race,
	select,
	take,
	takeEvery,
} from 'typed-redux-saga'

type activeDeckSagaT =
	| {
			databaseConnected: true
			activeDeckCode: string
	  }
	| {
			databaseConnected: false
			activeDeck: Deck
	  }
	| null

function* getActiveDeckSaga(): Generator<any, activeDeckSagaT> {
	const activeDeckCode = yield* select(getPlayerDeckCode)
	const databaseInfo = yield* select(getLocalDatabaseInfo)

	if (!activeDeckCode) return null

	if (databaseInfo.noConnection) {
		const activeDeck = databaseInfo.decks.find(
			(deck) => deck.code === activeDeckCode,
		)
		if (!activeDeck) return null
		return {databaseConnected: false, activeDeck}
	}

	return {databaseConnected: true, activeDeckCode}
}

function* sendJoinQueueMessage(
	messageType:
		| ClientMessageTable['CREATE_BOSS_GAME']['type']
		| ClientMessageTable['CREATE_PRIVATE_GAME']['type']
		| ClientMessageTable['JOIN_PUBLIC_QUEUE']['type'],
	activeDeckResult: activeDeckSagaT,
) {
	if (!activeDeckResult) return
	if (activeDeckResult.databaseConnected) {
		yield* sendMsg({
			type: messageType,
			databaseConnected: true,
			activeDeckCode: activeDeckResult.activeDeckCode,
		})
	} else {
		yield* sendMsg({
			type: messageType,
			databaseConnected: false,
			activeDeck: activeDeckResult.activeDeck,
		})
	}
}

function* sendJoinPrivateQueueMessage(
	activeDeckResult: activeDeckSagaT,
	code: string,
) {
	if (!activeDeckResult) return
	if (activeDeckResult.databaseConnected) {
		yield* sendMsg({
			type: clientMessages.JOIN_PRIVATE_QUEUE,
			databaseConnected: true,
			activeDeckCode: activeDeckResult.activeDeckCode,
			code,
		})
	} else {
		yield* sendMsg({
			type: clientMessages.JOIN_PRIVATE_QUEUE,
			databaseConnected: false,
			activeDeck: activeDeckResult.activeDeck,
			code,
		})
	}
}

function* sendRematchQueueMessage(
	activeDeckResult: activeDeckSagaT,
	opponentId: string,
	playerScore: number,
	opponentScore: number,
	spectatorCode: string | null,
) {
	if (!activeDeckResult) return
	if (activeDeckResult.databaseConnected) {
		yield* sendMsg({
			type: clientMessages.CREATE_REMATCH_GAME,
			databaseConnected: true,
			activeDeckCode: activeDeckResult.activeDeckCode,
			opponentId,
			playerScore,
			opponentScore,
			spectatorCode,
		})
	} else {
		yield* sendMsg({
			type: clientMessages.CREATE_REMATCH_GAME,
			databaseConnected: false,
			activeDeck: activeDeckResult.activeDeck,
			opponentId,
			playerScore,
			opponentScore,
			spectatorCode,
		})
	}
}

function* sendSpectatePrivateGameMessage(code: string) {
	yield* sendMsg({
		type: clientMessages.SPECTATE_PRIVATE_GAME,
		code,
	})
}

// Public game
function* joinPublicQueueSaga() {
	function* matchmaking() {
		const socket = yield* select(getSocket)
		const activeDeckResult = yield* getActiveDeckSaga()

		try {
			// Send message to server to join the queue
			yield* sendJoinQueueMessage(
				clientMessages.JOIN_PUBLIC_QUEUE,
				activeDeckResult,
			)

			// Wait for response
			const joinResponse = yield* race({
				success: call(
					receiveMsg(socket, serverMessages.JOIN_PUBLIC_QUEUE_SUCCESS),
				),
				failure: call(
					receiveMsg(socket, serverMessages.JOIN_PUBLIC_QUEUE_FAILURE),
				),
			})

			if (joinResponse.failure) {
				// Something went wrong, delay, notify and cancel queuing
				yield* delay(1000)
				yield* put<LocalMessage>({
					type: localMessages.TOAST_OPEN,
					open: true,
					title: 'Failed to join queue!',
					description: 'Something went wrong. Maybe try reloading the page?',
				})
				yield* put<LocalMessage>({
					type: localMessages.MATCHMAKING_LEAVE,
				})
				return
			}

			// We have joined the queue, change state then wait for game start
			yield* put<LocalMessage>({
				type: localMessages.MATCHMAKING_JOIN_QUEUE_SUCCESS,
			})

			const {playerEntity, playerOneDefs, playerTwoDefs, props} = yield* call(
				receiveMsg(socket, serverMessages.GAME_START),
			)
			yield call(() =>
				gameSaga({
					playerEntity,
					playerOneDefs,
					playerTwoDefs,
					props,
				}),
			)
		} catch (err) {
			console.error('Game crashed: ', err)
		} finally {
			if (yield* cancelled()) {
				// Clear state
				yield put<LocalMessage>({type: localMessages.GAME_END})
			}
		}
	}

	const result = yield* race({
		leave: take(localMessages.MATCHMAKING_LEAVE), // We pressed the leave button
		matchmaking: call(matchmaking),
	})

	if (result.leave) {
		// Tell the server we left the queue
		yield* sendMsg({type: clientMessages.LEAVE_PUBLIC_QUEUE})
	}
}

// Join Private Queue
function* joinPrivateQueueSaga({
	code,
}: LocalMessageTable[typeof localMessages.MATCHMAKING_JOIN_PRIVATE_QUEUE]) {
	function* matchmaking() {
		const socket = yield* select(getSocket)
		const activeDeckResult = yield* getActiveDeckSaga()

		try {
			yield* sendJoinPrivateQueueMessage(activeDeckResult, code)

			const result = yield* race({
				invalidCode: call(receiveMsg(socket, serverMessages.INVALID_CODE)),
				joinPrivateGameFailure: call(
					receiveMsg(socket, serverMessages.JOIN_PRIVATE_GAME_FAILURE),
				),
				joinPrivateGameSuccess: call(
					receiveMsg(socket, serverMessages.JOIN_PRIVATE_GAME_SUCCESS),
				),
			})

			if (result.invalidCode || result.joinPrivateGameFailure) {
				// Something went wrong, delay, notify and cancel queuing
				yield* delay(1000)
				yield* put<LocalMessage>({
					type: localMessages.TOAST_OPEN,
					open: true,
					title: result.invalidCode ? 'Invalid Code!' : 'Failed to join game!',
					description: result.invalidCode
						? 'The code you entered is invalid.'
						: 'Something went wrong. Maybe try reloading the page?',
				})
				yield* put<LocalMessage>({
					type: localMessages.MATCHMAKING_LEAVE,
				})
				return
			}

			// We definitely joined successfully, change state
			yield* put<LocalMessage>({
				type: localMessages.MATCHMAKING_JOIN_QUEUE_SUCCESS,
			})

			// Wait for game start or timeout
			const queueResponse = yield* race({
				gameStart: call(receiveMsg(socket, serverMessages.GAME_START)),
				timeout: call(receiveMsg(socket, serverMessages.PRIVATE_GAME_TIMEOUT)),
				cancelled: call(
					receiveMsg(socket, serverMessages.PRIVATE_GAME_CANCELLED),
				),
			})

			if (queueResponse.gameStart) {
				yield* call(gameSaga, {
					spectatorCode: queueResponse.gameStart?.spectatorCode,
				})
				return
			}

			if (queueResponse.cancelled) {
				// Game was cancelled, notify and cancel queuing
				yield* put<LocalMessage>({
					type: localMessages.TOAST_OPEN,
					open: true,
					title: 'Game cancelled',
					description: 'Your game has been cancelled by the host.',
				})
				yield* put<LocalMessage>({
					type: localMessages.MATCHMAKING_LEAVE,
				})
				return
			}

			// We timed out, notify and cancel queuing
			yield* put<LocalMessage>({
				type: localMessages.TOAST_OPEN,
				open: true,
				title: 'Join Game Timeout',
				description: 'Your game timed out because it took too long to start.',
			})
			yield* put<LocalMessage>({
				type: localMessages.MATCHMAKING_LEAVE,
			})
		} catch (err) {
			console.error('Game crashed: ', err)
		} finally {
			if (yield* cancelled()) {
				// Clear state
				yield put<LocalMessage>({type: localMessages.GAME_END})
			}
		}
	}

	const result = yield* race({
		leave: take(localMessages.MATCHMAKING_LEAVE), // We pressed the leave button
		matchmaking: call(matchmaking),
	})

	if (result.leave) {
		// Tell the server we left the queue
		yield* sendMsg({type: clientMessages.LEAVE_PRIVATE_QUEUE})
	}
}

// Spectate Private Game
function* spectatePrivateGameSaga({
	code,
}: LocalMessageTable[typeof localMessages.MATCHMAKING_SPECTATE_PRIVATE_GAME]) {
	function* matchmaking() {
		const socket = yield* select(getSocket)

		try {
			yield* sendSpectatePrivateGameMessage(code)

			const result = yield* race({
				invalidCode: call(receiveMsg(socket, serverMessages.INVALID_CODE)),
				spectatePrivateGameFailure: call(
					receiveMsg(socket, serverMessages.SPECTATE_PRIVATE_GAME_FAILURE),
				),
				spectateSuccess: call(
					receiveMsg(socket, serverMessages.SPECTATE_PRIVATE_GAME_START),
				),
				spectateWaiting: call(
					receiveMsg(socket, serverMessages.SPECTATE_PRIVATE_GAME_WAITING),
				),
			})

			if (result.invalidCode || result.spectatePrivateGameFailure) {
				// Something went wrong, delay, notify and cancel queuing
				yield* delay(1000)
				yield* put<LocalMessage>({
					type: localMessages.TOAST_OPEN,
					open: true,
					title: result.invalidCode ? 'Invalid Code!' : 'Failed to join game!',
					description: result.invalidCode
						? 'The code you entered is invalid.'
						: 'Something went wrong. Maybe try reloading the page?',
				})
				yield* put<LocalMessage>({
					type: localMessages.MATCHMAKING_LEAVE,
				})
				return
			}

			// We definitely joined successfully, change state
			yield* put<LocalMessage>({
				type: localMessages.MATCHMAKING_JOIN_QUEUE_SUCCESS,
			})

			if (result.spectateSuccess) {
				// Succesfully joined a game as spectator, start the game saga
				yield* call(gameSaga, {
					initialGameState: result.spectateSuccess.localGameState,
				})
			} else if (result.spectateWaiting) {
				// Succesfully joined as spectator, waiting for game to start
				let result = yield* race({
					spectatePrivateGame: call(
						receiveMsg(socket, serverMessages.SPECTATE_PRIVATE_GAME_START),
					),
					timeout: call(
						receiveMsg(socket, serverMessages.PRIVATE_GAME_TIMEOUT),
					),
					cancelled: call(
						receiveMsg(socket, serverMessages.PRIVATE_GAME_CANCELLED),
					),
				})
				if (result.spectatePrivateGame) {
					yield* call(gameSaga, {
						initialGameState: result.spectatePrivateGame.localGameState,
					})
					return
				}
				if (result.cancelled) {
					// Game was cancelled, notify and cancel queuing
					yield* put<LocalMessage>({
						type: localMessages.TOAST_OPEN,
						open: true,
						title: 'Game cancelled',
						description: 'Your game has been cancelled by the host.',
					})
					yield* put<LocalMessage>({
						type: localMessages.MATCHMAKING_LEAVE,
					})
					return
				}

				// We timed out, notify and cancel queuing
				yield* put<LocalMessage>({
					type: localMessages.TOAST_OPEN,
					open: true,
					title: 'Spectate Game Timeout',
					description: 'Your game timed out because it took too long to start.',
				})
				yield* put<LocalMessage>({
					type: localMessages.MATCHMAKING_LEAVE,
				})
			}
		} catch (err) {
			console.error('Game crashed: ', err)
		} finally {
			if (yield* cancelled()) {
				// Clear state
				yield put<LocalMessage>({type: localMessages.GAME_END})
			}
		}
	}

	const result = yield* race({
		leave: take(localMessages.MATCHMAKING_LEAVE), // We pressed the leave button
		matchmaking: call(matchmaking),
	})

	if (result.leave) {
		// Tell the server we left the queue
		yield* sendMsg({type: clientMessages.LEAVE_PRIVATE_QUEUE})
	}
}

// Create Private Game
function* createPrivateGameSaga() {
	function* matchmaking() {
		const socket = yield* select(getSocket)
		const activeDeckResult = yield* getActiveDeckSaga()

		try {
			yield* sendJoinQueueMessage(
				clientMessages.CREATE_PRIVATE_GAME,
				activeDeckResult,
			)

			const result = yield* race({
				createPrivateGameSuccess: call(
					receiveMsg(socket, serverMessages.CREATE_PRIVATE_GAME_SUCCESS),
				),
				createPrivateGameFailure: call(
					receiveMsg(socket, serverMessages.CREATE_PRIVATE_GAME_FAILURE),
				),
			})

			if (result.createPrivateGameFailure) {
				// Something went wrong, delay, notify and cancel
				yield* delay(1000)
				yield* put<LocalMessage>({
					type: localMessages.TOAST_OPEN,
					open: true,
					title: 'Failed to create game!',
					description: 'Something went wrong. Maybe try reloading the page?',
				})
				yield* put<LocalMessage>({
					type: localMessages.MATCHMAKING_LEAVE,
				})
				return
			} else if (result.createPrivateGameSuccess) {
				// Successfully created game, notify and wait for game start
				yield* put<LocalMessage>({
					type: localMessages.MATCHMAKING_CREATE_GAME_SUCCESS,
					gameCode: result.createPrivateGameSuccess.gameCode,
					spectatorCode: result.createPrivateGameSuccess.spectatorCode,
				})

				// Wait for game start or timeout
				const queueResponse = yield* race({
					gameStart: call(receiveMsg(socket, serverMessages.GAME_START)),
					timeout: call(
						receiveMsg(socket, serverMessages.PRIVATE_GAME_TIMEOUT),
					),
				})

				if (queueResponse.gameStart) {
					yield* call(gameSaga, {
						spectatorCode: queueResponse.gameStart.spectatorCode,
					})
					return
				}

				// We timed out, notify and cancel queuing
				yield* put<LocalMessage>({
					type: localMessages.TOAST_OPEN,
					open: true,
					title: 'Create Game Timeout',
					description: 'Your game timed out because it took too long to start.',
				})
				yield* put<LocalMessage>({
					type: localMessages.MATCHMAKING_LEAVE,
				})
			}
		} catch (err) {
			console.error('Game crashed: ', err)
		} finally {
			if (yield* cancelled()) {
				// Clear state
				yield put<LocalMessage>({type: localMessages.GAME_END})
			}
		}
	}

	const result = yield* race({
		leave: take(localMessages.MATCHMAKING_LEAVE), // We pressed the leave button
		matchmaking: call(matchmaking),
	})

	if (result.leave) {
		// Tell the server to cancel the game
		yield* sendMsg({type: clientMessages.CANCEL_PRIVATE_GAME})
	}
}

function* createBossGameSaga() {
	const socket = yield* select(getSocket)
	const activeDeckResult = yield* getActiveDeckSaga()

	try {
		// Send message to server to create the game
		yield* sendJoinQueueMessage(
			clientMessages.CREATE_BOSS_GAME,
			activeDeckResult,
		)
		const createBossResponse = yield* race({
			success: call(
				receiveMsg(socket, serverMessages.CREATE_BOSS_GAME_SUCCESS),
			),
			failure: call(
				receiveMsg(socket, serverMessages.CREATE_BOSS_GAME_FAILURE),
			),
		})

		if (createBossResponse.failure) {
			// Something went wrong, notify and cancel
			yield* put<LocalMessage>({
				type: localMessages.TOAST_OPEN,
				open: true,
				title: 'Failed to start game!',
				description: 'Something went wrong. Maybe try reloading the page?',
			})
			yield* put<LocalMessage>({type: localMessages.MATCHMAKING_LEAVE})
			return
		}

		yield* call(receiveMsg, socket, localMessages.GAME_START)
		yield* put<LocalMessage>({
			type: localMessages.QUEUE_VOICE,
			lines: ['/voice/EXSTART.ogg'],
		})
		yield* call(gameSaga, {})
	} catch (err) {
		console.error('Game crashed: ', err)
	} finally {
		if (yield* cancelled()) {
			// Clear state and back to menu
			yield* put<LocalMessage>({type: localMessages.GAME_END})
		}
	}
}

// Rematches
function* createRematchSaga() {
	function* matchmaking() {
		const socket = yield* select(getSocket)
		const rematch = yield* select(getRematchData)
		const activeDeckResult = yield* getActiveDeckSaga()

		if (!rematch) return

		try {
			// Send message to server to create the game
			yield* sendRematchQueueMessage(
				activeDeckResult,
				rematch.opponentId,
				rematch.playerScore,
				rematch.opponentScore,
				rematch.spectatorCode,
			)
			const createRematchResponse = yield* race({
				success: call(
					receiveMsg(socket, serverMessages.CREATE_REMATCH_SUCCESS),
				),
				failure: call(
					receiveMsg(socket, serverMessages.CREATE_REMATCH_FAILURE),
				),
			})

			if (createRematchResponse.failure) {
				// Something went wrong, notify and cancel
				yield* put<LocalMessage>({
					type: localMessages.TOAST_OPEN,
					open: true,
					title: 'Failed to start game!',
					description: 'Your opponent already declined a rematch.',
				})
				yield* put<LocalMessage>({type: localMessages.MATCHMAKING_LEAVE})
				return
			}

			yield* put<LocalMessage>({
				type: localMessages.MATCHMAKING_JOIN_QUEUE_SUCCESS,
			})

			const gameStart = yield* call(
				receiveMsg(socket, serverMessages.GAME_START),
			)
			console.log(gameStart)
			yield call(gameSaga, {spectatorCode: gameStart.spectatorCode})
		} catch (err) {
			console.error('Game crashed: ', err)
		} finally {
			if (yield* cancelled()) {
				// Clear state and back to menu
				yield* put<LocalMessage>({type: localMessages.GAME_END})
			}
		}
	}

	const result = yield* race({
		leave: take(localMessages.MATCHMAKING_LEAVE), // We pressed the leave button
		matchmaking: call(matchmaking),
	})

	if (result.leave) {
		// Tell the server we left the queue
		yield* sendMsg({type: clientMessages.LEAVE_REMATCH_GAME})
	}
}

// Rematches
function* cancelRematchSaga() {
	const rematch = yield* select(getRematchData)
	if (!rematch) return
	yield* sendMsg({type: clientMessages.CANCEL_REMATCH, rematch})
}

// @TODO
function* createReplayGameSaga(
	action: LocalMessageTable[typeof localMessages.MATCHMAKING_REPLAY_GAME],
) {
	const socket = yield* select(getSocket)
	const databaseInfo = yield* select(getLocalDatabaseInfo)
	const uuid = databaseInfo.userId as string

	try {
		// Send message to server to create the game
		yield* sendMsg({
			type: clientMessages.CREATE_REPLAY_GAME,
			id: action.id,
			uuid: uuid,
		})
		const result = yield* race({
			success: call(
				receiveMsg(socket, serverMessages.SPECTATE_PRIVATE_GAME_START),
			),
			failure: call(
				receiveMsg(socket, serverMessages.JOIN_PUBLIC_QUEUE_FAILURE),
			),
		})

		if (result.failure) {
			// Something went wrong, go back
			yield* put<LocalMessage>({
				type: localMessages.MATCHMAKING_LEAVE,
			})
			return
		} else if (result.success) {
			// Start replay game
			yield* call(gameSaga, {initialGameState: result.success.localGameState})
		}
	} catch (err) {
		console.error('Game crashed: ', err)
	} finally {
		if (yield* cancelled()) {
			// Clear state and back to menu
			yield* put<LocalMessage>({type: localMessages.GAME_END})
		}
	}
}

function* matchmakingSaga() {
	// Join Public Queue
	yield* takeEvery(
		localMessages.MATCHMAKING_JOIN_PUBLIC_QUEUE,
		joinPublicQueueSaga,
	)
	// Join Private Queue
	yield* takeEvery<
		LocalMessageTable[typeof localMessages.MATCHMAKING_JOIN_PRIVATE_QUEUE]
	>(localMessages.MATCHMAKING_JOIN_PRIVATE_QUEUE, function* (action) {
		yield* joinPrivateQueueSaga(action)
	})
	// Spectate Private Game
	yield* takeEvery<
		LocalMessageTable[typeof localMessages.MATCHMAKING_SPECTATE_PRIVATE_GAME]
	>(localMessages.MATCHMAKING_SPECTATE_PRIVATE_GAME, function* (action) {
		yield* spectatePrivateGameSaga(action)
	})
	// Create Private Game
	yield* takeEvery(
		localMessages.MATCHMAKING_CREATE_PRIVATE_GAME,
		createPrivateGameSaga,
	)
	// Boss Battle
	yield* takeEvery(
		localMessages.MATCHMAKING_CREATE_BOSS_GAME,
		createBossGameSaga,
	)
	// Replay Game
	yield* takeEvery<
		LocalMessageTable[typeof localMessages.MATCHMAKING_REPLAY_GAME]
	>(localMessages.MATCHMAKING_REPLAY_GAME, function* (action) {
		yield* createReplayGameSaga(action)
	})
	// Rematch
	yield* takeEvery(localMessages.MATCHMAKING_REMATCH, createRematchSaga)
	yield* takeEvery(localMessages.CANCEL_REMATCH, cancelRematchSaga)
}

export default matchmakingSaga
