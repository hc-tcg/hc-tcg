import {PlayerEntity} from 'common/entities'
import {clientMessages} from 'common/socket-messages/client-messages'
import {
	serverMessages,
	ServerMessageTable,
} from 'common/socket-messages/server-messages'
import {receiveMsg} from 'logic/socket/socket-saga'
import {LocalGameState} from 'common/types/game-state'
import {
	AnyTurnActionData,
	ChangeActiveHermitActionData,
} from 'common/types/turn-action-data'
import {
	LocalMessage,
	LocalMessageTable,
	localMessages,
	useMessageDispatch,
} from 'logic/messages'
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
import achievementSaga from './tasks/achievements'
import actionLogicSaga from './tasks/action-logic-saga'
import actionModalsSaga from './tasks/action-modals-saga'
import attackSaga from './tasks/attack-saga'
import chatSaga from './tasks/chat-saga'
import coinFlipSaga from './tasks/coin-flips-saga'
import endTurnSaga from './tasks/end-turn-saga'
import slotSaga from './tasks/slot-saga'
import spectatorSaga from './tasks/spectators'
import {
	GameController,
	GameControllerProps,
	GameViewer,
} from 'common/game/game-controller'
import {PlayerSetupDefs} from 'common/game/setup-game'
import {getLocalGameState} from 'common/game/make-local-state'
import runGame, {TurnActionAndPlayer} from 'common/game/run-game'

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

class ClientGameController extends GameController {}

async function startGameLocally(
	myPlayerEntity: PlayerEntity,
	player1: PlayerSetupDefs,
	player2: PlayerSetupDefs,
	props: GameControllerProps,
) {
	let game = new ClientGameController(player1, player2, props)
	runGame(game)

	await game.waitForTurnActionReady()

	game.addViewer(
		{
			spectator: false,
			replayer: false,
			playerOnLeft: myPlayerEntity,
		},
	)

	return game
}

function* turnActionRecieve(gameController: GameController) {
	const socket = yield* select(getSocket)

	yield* call(() => gameController.waitForTurnActionReady())

	let localGameState = getLocalGameState(
		gameController.game,
		gameController.viewers[0],
	)

	while (true) {
		const logic = yield* fork(() =>
			all([
				fork(actionModalsSaga),
				fork(slotSaga),
				fork(actionLogicSaga, localGameState),
				fork(endTurnSaga),
				takeEvery(localMessages.GAME_ACTIONS_ATTACK, attackSaga),
			]),
		)

		const nextTurnAction = yield* race({
			serverTurnAction: call(receiveMsg<
				ServerMessageTable[typeof serverMessages.GAME_TURN_ACTION]
			>(socket, serverMessages.GAME_TURN_ACTION)),
			localTurnAction: take<
				LocalMessageTable[typeof localMessages.GAME_TURN_ACTION]
			>(localMessages.GAME_TURN_ACTION),
		})

		// After we send an action, disable logic till the next game state is received
		yield cancel(logic)

		let turnAction: TurnActionAndPlayer | null = null

		if (nextTurnAction.localTurnAction) {
			turnAction = {
				playerEntity: localGameState.playerEntity,
				action: nextTurnAction.localTurnAction.action,
			}
			yield* sendTurnAction(localGameState.playerEntity, nextTurnAction.localTurnAction.action)
		} else if (nextTurnAction.serverTurnAction) {
			turnAction = nextTurnAction.serverTurnAction.action
		}
		if (!turnAction) throw new Error('Turn action should be defined')

		console.log(turnAction)

		yield* call(() => gameController.sendTurnAction(turnAction))

		localGameState = getLocalGameState(
			gameController.game,
			gameController.viewers[0],
		)

		// First show coin flips, if any
		yield* call(coinFlipSaga, localGameState)

		// Actually update the local state
		yield* putResolve<LocalMessage>({
			type: localMessages.GAME_LOCAL_STATE_SET,
			localGameState: localGameState,
			time: Date.now(),
		})

		yield* put<LocalMessage>({
			type: localMessages.QUEUE_VOICE,
			lines: localGameState.voiceLineQueue,
		})

		if (localGameState.turn.availableActions.includes('WAIT_FOR_TURN')) continue
		if (localGameState.turn.availableActions.includes('WAIT_FOR_OPPONENT_ACTION'))
			continue
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

type GameSagaProps = {
	spectatorCode?: string
	playerEntity: PlayerEntity
	playerOneDefs: PlayerSetupDefs
	playerTwoDefs: PlayerSetupDefs
	props: GameControllerProps
}

function* gameSaga({
	spectatorCode,
	playerEntity,
	playerOneDefs,
	playerTwoDefs,
	props,
}: GameSagaProps) {
	const socket = yield* select(getSocket)
	const gameController = yield* call(() =>
		startGameLocally(playerEntity, playerOneDefs, playerTwoDefs, props),
	)
	const backgroundTasks = yield* fork(() =>
		all([
			fork(opponentConnectionSaga),
			fork(chatSaga),
			fork(spectatorSaga),
			fork(reconnectSaga),
			fork(achievementSaga),
			fork(handleForfeitAction),
			fork(turnActionRecieve, gameController),
		]),
	)

	try {
		yield* put<LocalMessage>({
			type: localMessages.GAME_START,
			spectatorCode,
		})

		yield* put<LocalMessage>({
			type: localMessages.GAME_LOCAL_STATE_SET,
			localGameState: getLocalGameState(
				gameController.game,
				gameController.viewers[0],
			),
			time: Date.now(),
		})

		const result = yield* race({
			gameEnd: call(receiveMsg(socket, serverMessages.GAME_END)),
			spectatorLeave: take(localMessages.GAME_SPECTATOR_LEAVE),
		})

		if (result.game) {
			throw new Error('Unexpected game ending')
		} else if (result.gameEnd) {
			const {
				gameState: newGameState,
				outcome,
				earnedAchievements,
				gameEndTime,
			} = result.gameEnd
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
				earnedAchievements,
				gameEndTime,
			})
		}
	} catch (err) {
		console.error('Client error: ', err)
		yield put<LocalMessage>({
			type: localMessages.GAME_END_OVERLAY_SHOW,
			outcome: {type: 'game-crash', error: `${(err as Error).stack}`},
			earnedAchievements: [],
			gameEndTime: Date.now(),
		})
	} finally {
		const hasOverlay = yield* select(getEndGameOverlay)
		if (hasOverlay) yield take(localMessages.GAME_CLOSE)
		console.log('Game ended')
		yield put<LocalMessage>({type: localMessages.GAME_END})
		yield cancel(backgroundTasks)
	}
}

export default gameSaga
