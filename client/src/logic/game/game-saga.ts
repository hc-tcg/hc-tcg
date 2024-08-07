import {PlayerEntity} from 'common/entities'
import {clientMessages} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {LocalGameState} from 'common/types/game-state'
import {LocalMessage, LocalMessageTable, actions} from 'logic/actions'
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
import {getEndGameOverlay} from './game-selectors'
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
import slotSaga from './tasks/slot-saga'
import {
	AnyTurnActionData,
	ChangeActiveHermitActionData,
} from 'common/types/turn-action-data'
import endTurnSaga from './tasks/end-turn-saga'

function* sendTurnAction(entity: PlayerEntity, action: AnyTurnActionData) {
	yield* sendMsg({
		type: clientMessages.TURN_ACTION,
		playerEntity: entity,
		action: action,
	})
}

function* actionSaga(playerEntity: PlayerEntity) {
	const turnAction = yield* take<
		LocalMessageTable[typeof actions.GAME_TURN_ACTION]
	>(actions.GAME_TURN_ACTION)

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
	action: LocalMessageTable[typeof actions.GAME_LOCAL_STATE_RECIEVED],
) {
	const gameState: LocalGameState = action.localGameState

	// First show coin flips, if any
	yield* call(coinFlipSaga, gameState)

	// Actually update the local state
	yield* put<LocalMessage>({
		type: actions.GAME_LOCAL_STATE_SET,
		localGameState: gameState,
		time: Date.now(),
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
			takeEvery(actions.GAME_ACTIONS_ATTACK_START, attackSaga),
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
			type: actions.GAME_LOCAL_STATE_RECIEVED,
			localGameState: localGameState,
			time: Date.now(),
		})
	}
}

function* gameActionsSaga(initialGameState?: LocalGameState) {
	yield* fork(() =>
		all([
			takeEvery(actions.GAME_FORFEIT, function* () {
				yield call(sendMsg({type: clientMessages.FORFEIT}))
			}),

			fork(gameStateReceiver),
			takeLatest(actions.GAME_LOCAL_STATE_RECIEVED, gameStateSaga),
		]),
	)

	if (initialGameState) {
		yield put<LocalMessage>({
			type: actions.GAME_LOCAL_STATE_SET,
			localGameState: initialGameState,
			time: Date.now(),
		})
	}
}

function* opponentConnectionSaga() {
	while (true) {
		const action = yield* call(receiveMsg(serverMessages.OPPONENT_CONNECTION))
		yield* put<LocalMessage>({
			type: actions.GAME_OPPONENT_CONNECTION_SET,
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
			type: actions.GAME_START,
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
				type: actions.GAME_END_OVERLAY_SHOW,
				outcome: 'server_crash',
				reason: 'error',
			})
		} else if (result.gameEnd) {
			const {gameState: newGameState, outcome, reason} = result.gameEnd
			if (newGameState) {
				yield call(coinFlipSaga, newGameState)
				yield putResolve<LocalMessage>({
					type: actions.GAME_LOCAL_STATE_SET,
					localGameState: newGameState,
					time: Date.now(),
				})
			}
			yield put<LocalMessage>({
				type: actions.GAME_END_OVERLAY_SHOW,
				reason,
				outcome,
			})
		}
	} catch (err) {
		console.error('Client error: ', err)
		yield put<LocalMessage>({
			type: actions.GAME_END_OVERLAY_SHOW,
			outcome: 'client_crash',
			reason: 'error',
		})
	} finally {
		const hasOverlay = yield* select(getEndGameOverlay)
		if (hasOverlay)
			yield take<LocalMessageTable[typeof actions.GAME_END_OVERLAY_SHOW]>(
				actions.GAME_END_OVERLAY_SHOW,
			)
		console.log('Game ended')
		yield put<LocalMessage>({type: actions.GAME_END})
		yield cancel(backgroundTasks)
	}
}

export default gameSaga
