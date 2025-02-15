import {PlayerEntity} from 'common/entities'
import {clientMessages} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {LocalGameState} from 'common/types/game-state'
import {
	AnyTurnActionData,
	ChangeActiveHermitActionData,
} from 'common/types/turn-action-data'
import {LocalMessage, LocalMessageTable, localMessages} from 'logic/messages'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import {getSocket} from 'logic/socket/socket-selectors'
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
import {getEndGameOverlay, getPlayerEntity} from './game-selectors'
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
import spectatorSaga from './tasks/spectators'

export function* sendTurnAction(
	entity: PlayerEntity,
	action: AnyTurnActionData,
) {
	yield* sendMsg({
		type: clientMessages.TURN_ACTION,
		playerEntity: entity,
		action: action,
	})
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

	yield* put<LocalMessage>({
		type: localMessages.QUEUE_VOICE,
		lines: gameState.voiceLineQueue,
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
	const socket = yield* select(getSocket)
	while (true) {
		const {localGameState} = yield* call(
			receiveMsg(socket, serverMessages.GAME_STATE),
		)
		yield* put<LocalMessage>({
			type: localMessages.GAME_LOCAL_STATE_RECIEVED,
			localGameState: localGameState,
			time: Date.now(),
		})
	}
}

function* gameActionsSaga(initialGameState?: LocalGameState) {
	yield* fork(() =>
		all([
			fork(gameStateReceiver),
			takeLatest(localMessages.GAME_LOCAL_STATE_RECIEVED, gameStateSaga),
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
	const socket = yield* select(getSocket)
	while (true) {
		const action = yield* call(
			receiveMsg(socket, serverMessages.OPPONENT_CONNECTION),
		)
		yield* put<LocalMessage>({
			type: localMessages.GAME_OPPONENT_CONNECTION_SET,
			connected: action.isConnected,
		})
	}
}

function* reconnectSaga() {
	const socket = yield* select(getSocket)
	while (true) {
		const action = yield* call(
			receiveMsg(socket, serverMessages.PLAYER_RECONNECTED),
		)

		// There should be a game state because the player is in a game.
		if (!action.game) continue

		if (action.messages) {
			yield* put<LocalMessage>({
				type: localMessages.CHAT_UPDATE,
				messages: action.messages,
			})
		}

		yield* put<LocalMessage>({
			type: localMessages.GAME_LOCAL_STATE_RECIEVED,
			localGameState: action.game,
			time: Date.now(),
		})
	}
}

function* handleForfeitAction() {
	let action = (yield* take(
		(action: any) =>
			action.type === localMessages.GAME_TURN_ACTION &&
			action.action.type == 'FORFEIT',
	)) as LocalMessageTable[typeof localMessages.GAME_TURN_ACTION]

	let playerEntity = yield* select(getPlayerEntity)
	yield* sendTurnAction(playerEntity, action.action)
}

function* gameSaga(initialGameState?: LocalGameState) {
	const socket = yield* select(getSocket)
	const backgroundTasks = yield* fork(() =>
		all([
			fork(opponentConnectionSaga),
			fork(chatSaga),
			fork(spectatorSaga),
			fork(reconnectSaga),
			fork(handleForfeitAction),
		]),
	)

	try {
		yield* put<LocalMessage>({
			type: localMessages.GAME_START,
		})

		const result = yield* race({
			game: call(gameActionsSaga, initialGameState),
			gameEnd: call(receiveMsg(socket, serverMessages.GAME_END)),
			spectatorLeave: take(localMessages.GAME_SPECTATOR_LEAVE),
		})

		if (result.game) {
			throw new Error('Unexpected game ending')
		} else if (result.gameEnd) {
			const {gameState: newGameState, outcome} = result.gameEnd
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
				outcome,
			})
		}
	} catch (err) {
		console.error('Client error: ', err)
		yield put<LocalMessage>({
			type: localMessages.GAME_END_OVERLAY_SHOW,
			outcome: {type: 'game-crash', error: `${(err as Error).stack}`},
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
