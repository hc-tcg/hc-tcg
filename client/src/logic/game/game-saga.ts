import {PlayerEntity} from 'common/entities'
import {clientMessages} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {GameState, LocalGameState} from 'common/types/game-state'
import {
	AnyTurnActionData,
	ChangeActiveHermitActionData,
} from 'common/types/turn-action-data'
import {LocalMessage, LocalMessageTable, localMessages} from 'logic/messages'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import {
	all,
	call,
	cancel,
	fork,
	put,
	putResolve,
	race,
	take,
	takeEvery,
	takeLatest,
} from 'typed-redux-saga'
import {select} from 'typed-redux-saga'
import {getEndGameOverlay, getGameState} from './game-selectors'
import {
	localApplyEffect,
	localChangeActiveHermit,
	localEndTurn,
	localRemoveEffect,
} from './local-state'
import actionLogicSaga from './tasks/action-logic-saga'
import actionModalsSaga from './tasks/action-modals-saga'
import attackSaga from './tasks/attack-saga'
import chatSaga from './tasks/chat-saga'
import coinFlipSaga from './tasks/coin-flips-saga'
import endTurnSaga from './tasks/end-turn-saga'
import slotSaga from './tasks/slot-saga'

function* sendTurnAction(entity: PlayerEntity, action: AnyTurnActionData) {
	yield* sendMsg({
		type: clientMessages.TURN_ACTION,
		playerEntity: entity,
		action: action,
	})
}

/* Diff the new and old game state to figure out what sounds to play */
function getNextSound(
	oldGameState: LocalGameState | null,
	newGameState: LocalGameState | null,
): string | null {
	if (!oldGameState || !newGameState) return null

	function countCards(game: LocalGameState) {
		return Object.values(game.players)
			.map((player) =>
				player.board.rows
					.map(
						(row) =>
							Number(row.attach.card !== null) +
							Number(row.hermit.card !== null) +
							row.items.filter((item) => item.card !== null).length,
					)
					.reduce((a, b) => a + b, 0),
			)
			.reduce((a, b) => a + b, 0)
	}

	let oldCardNumber = countCards(oldGameState)
	let newCardNumber = countCards(newGameState)
	console.log(oldCardNumber, newCardNumber)

	if (newCardNumber > oldCardNumber) {
		return 'sfx/Item_Frame_add_item1.ogg'
	}
	if (newCardNumber < oldCardNumber) {
		return 'sfx/Item_Frame_add_remove1.ogg'
	}

	return null
}

function* actionSaga(playerEntity: PlayerEntity) {
	const turnAction = yield* take<
		LocalMessageTable[typeof localMessages.GAME_TURN_ACTION]
	>(localMessages.GAME_TURN_ACTION)

	if (
		[
			'PLAY_HERMIT_CARD',
			'PLAY_ITEM_CARD',
			'PLAY_EFFECT_CARD',
			'PLAY_SINGLE_USE_CARD',
		].includes(turnAction.action.type)
	) {
		// This is updated for the client in slot-saga
		yield* call(sendTurnAction, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'APPLY_EFFECT') {
		yield* localApplyEffect()
		yield call(sendTurnAction, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'REMOVE_EFFECT') {
		yield* localRemoveEffect()
		yield call(sendTurnAction, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'PICK_REQUEST') {
		yield call(sendTurnAction, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'MODAL_REQUEST') {
		yield call(sendTurnAction, playerEntity, turnAction.action)
	} else if (
		['SINGLE_USE_ATTACK', 'PRIMARY_ATTACK', 'SECONDARY_ATTACK'].includes(
			turnAction.action.type,
		)
	) {
		yield call(sendTurnAction, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'END_TURN') {
		yield* localEndTurn()
		yield call(sendTurnAction, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'CHANGE_ACTIVE_HERMIT') {
		yield* localChangeActiveHermit(
			turnAction.action as ChangeActiveHermitActionData,
		)
		yield call(sendTurnAction, playerEntity, turnAction.action)
	}
}

function* gameStateSaga(
	action: LocalMessageTable[typeof localMessages.GAME_LOCAL_STATE_RECIEVED],
) {
	const gameState: LocalGameState = action.localGameState

	// First show coin flips, if any
	yield* call(coinFlipSaga, gameState)

	// Actually update the local state
	yield* put<LocalMessage>({
		type: localMessages.GAME_LOCAL_STATE_SET,
		localGameState: gameState,
		time: action.time,
	})

	if (gameState.turn.availableActions.includes('WAIT_FOR_TURN')) return
	if (gameState.turn.availableActions.includes('WAIT_FOR_OPPONENT_ACTION'))
		return

	const logic = yield* fork(() =>
		all([
			fork(actionModalsSaga),
			fork(slotSaga),
			fork(actionLogicSaga, gameState),
			fork(endTurnSaga),
			takeEvery(localMessages.GAME_ACTIONS_ATTACK, attackSaga),
		]),
	)

	// Handle core funcionality
	yield call(actionSaga, gameState.playerEntity)

	// After we send an action, disable logic till the next game state is received
	yield cancel(logic)
}

function* gameStateReceiver() {
	// constantly forward GAME_STATE messages from the server to the store
	while (true) {
		const {localGameState} = yield* call(receiveMsg(serverMessages.GAME_STATE))
		yield* put<LocalMessage>({
			type: localMessages.GAME_LOCAL_STATE_RECIEVED,
			localGameState: localGameState,
			time: Date.now(),
		})
	}
}

function* gameSoundSaga() {
	let oldGameState = null

	while (true) {
		yield* take(localMessages.GAME_LOCAL_STATE_SET)

		let newGameState = yield* select(getGameState)
		if (!newGameState) continue

		if (oldGameState) {
			let nextSound = getNextSound(oldGameState, newGameState)

			if (nextSound) {
				yield* put<LocalMessage>({
					type: localMessages.SOUND_PLAY,
					path: nextSound,
				})
			}
		}

		oldGameState = newGameState
	}
}

function* gameActionsSaga(initialGameState?: LocalGameState) {
	yield* fork(() =>
		all([
			takeEvery(localMessages.GAME_FORFEIT, function* () {
				yield sendMsg({type: clientMessages.FORFEIT})
			}),
			fork(gameStateReceiver),
			takeLatest(localMessages.GAME_LOCAL_STATE_RECIEVED, gameStateSaga),
			fork(gameSoundSaga),
		]),
	)

	if (initialGameState) {
		yield put<LocalMessage>({
			type: localMessages.GAME_LOCAL_STATE_RECIEVED,
			localGameState: initialGameState,
			time: Date.now(),
		})
	}
}

function* opponentConnectionSaga() {
	while (true) {
		const action = yield* call(receiveMsg(serverMessages.OPPONENT_CONNECTION))
		yield* put<LocalMessage>({
			type: localMessages.GAME_OPPONENT_CONNECTION_SET,
			connected: action.isConnected,
		})
	}
}

function* gameSaga(initialGameState?: LocalGameState) {
	const backgroundTasks = yield* fork(() =>
		all([fork(opponentConnectionSaga), fork(chatSaga)]),
	)

	try {
		yield* put<LocalMessage>({
			type: localMessages.GAME_START,
		})

		const result = yield* race({
			game: call(gameActionsSaga, initialGameState),
			gameEnd: call(receiveMsg(serverMessages.GAME_END)),
			gameCrash: call(receiveMsg(serverMessages.GAME_CRASH)),
		})

		if (result.game) {
			throw new Error('Unexpected game ending')
		} else if (result.gameCrash) {
			console.log('Server error')
			yield put<LocalMessage>({
				type: localMessages.GAME_END_OVERLAY_SHOW,
				outcome: 'server_crash',
				reason: 'error',
			})
		} else if (result.gameEnd) {
			const {gameState: newGameState, outcome, reason} = result.gameEnd
			if (newGameState) {
				yield call(coinFlipSaga, newGameState)
				yield putResolve<LocalMessage>({
					type: localMessages.GAME_LOCAL_STATE_SET,
					localGameState: newGameState,
					time: Date.now(),
				})
			}
			yield put<LocalMessage>({
				type: localMessages.GAME_END_OVERLAY_SHOW,
				reason,
				outcome,
			})
		}
	} catch (err) {
		console.error('Client error: ', err)
		yield put<LocalMessage>({
			type: localMessages.GAME_END_OVERLAY_SHOW,
			outcome: 'client_crash',
			reason: 'error',
		})
	} finally {
		const hasOverlay = yield* select(getEndGameOverlay)
		if (hasOverlay) yield take(localMessages.GAME_END_OVERLAY_HIDE)
		console.log('Game ended')
		yield put<LocalMessage>({type: localMessages.GAME_END})
		yield cancel(backgroundTasks)
	}
}

export default gameSaga
