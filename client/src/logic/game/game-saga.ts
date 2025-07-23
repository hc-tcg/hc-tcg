import {PlayerEntity} from 'common/entities'
import {GameController, GameControllerProps} from 'common/game/game-controller'
import {getLocalGameState} from 'common/game/make-local-state'
import runGame, {TurnActionAndPlayer} from 'common/game/run-game'
import {PlayerSetupDefs} from 'common/game/setup-game'
import {clientMessages} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {AnyTurnActionData} from 'common/types/turn-action-data'
import {assert} from 'common/utils/assert'
import {LocalMessage, LocalMessageTable, localMessages} from 'logic/messages'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import {getSocket} from 'logic/socket/socket-selectors'
import {ReplayActionData} from 'server/src/routines/turn-action-compressor'
import store from 'store'
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
} from 'typed-redux-saga'
import {select} from 'typed-redux-saga'
import {getEndGameOverlay, getPlayerEntity} from './game-selectors'
import achievementSaga from './tasks/achievements'
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

class ClientGameController extends GameController {
	readyToDisplay = false

	public broadcastState(): void {
		if (!this.readyToDisplay) return
		let localGameState = getLocalGameState(this.game, this.viewers[0])
		store.dispatch({
			type: localMessages.GAME_LOCAL_STATE_SET,
			localGameState: localGameState,
			time: Date.now(),
		})
	}
}

async function startGameLocally(
	myPlayerEntity: PlayerEntity,
	player1: PlayerSetupDefs,
	player2: PlayerSetupDefs,
	props: GameControllerProps,
) {
	let game = new ClientGameController(player1, player2, props)

	game.addViewer({
		spectator: false,
		replayer: false,
		playerOnLeft: myPlayerEntity,
	})

	runGame(game)
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
			serverTurnAction: call(
				receiveMsg<typeof serverMessages.GAME_TURN_ACTION>(
					socket,
					serverMessages.GAME_TURN_ACTION,
				),
			),
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
				realTime: Date.now(),
			}
			yield* sendTurnAction(
				localGameState.playerEntity,
				nextTurnAction.localTurnAction.action,
			)
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
		if (
			localGameState.turn.availableActions.includes('WAIT_FOR_OPPONENT_ACTION')
		)
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

async function getGameSyncedUp(
	gameController: ClientGameController,
	gameHistory: Array<ReplayActionData>,
) {
	const numberOfHandledTurnActions = gameController.game.turnActions.length
	for (const turnAction of gameHistory.slice(
		numberOfHandledTurnActions,
		gameHistory.length,
	)) {
		await gameController.sendTurnAction({
			action: turnAction.action,
			playerEntity: turnAction.player,
			realTime: turnAction.realTime,
		})
	}
}

function* reconnectSaga(gameController: ClientGameController) {
	const socket = yield* select(getSocket)
	while (true) {
		const action = yield* call(
			receiveMsg(socket, serverMessages.PLAYER_RECONNECTED),
		)
		console.log('THIS IS RUNNING TOO')

		yield* call(() => {
			assert(
				action.gameHistory,
				'There should be a game history because the player is in a game.',
			)

			return getGameSyncedUp(gameController, action.gameHistory)
		})

		if (action.messages) {
			yield* put<LocalMessage>({
				type: localMessages.CHAT_UPDATE,
				messages: action.messages,
			})
		}

		const localGameState = getLocalGameState(
			gameController.game,
			gameController.viewers[0],
		)

		yield* put<LocalMessage>({
			type: localMessages.GAME_LOCAL_STATE_RECIEVED,
			localGameState,
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

function* requestCardsForSpyglass() {
	while (true) {
		yield* take(localMessages.SPYGLASS_REQUEST_CARDS)
		yield* sendMsg({
			type: clientMessages.SPYGLASS_REQUEST_CARDS,
		})
	}
}

function* recieveCardsForSpyglass() {
	const socket = yield* select(getSocket)
	while (true) {
		const spyglassCards = yield* call(
			receiveMsg<typeof serverMessages.SPYGLASS_SEND_CARDS>(
				socket,
				serverMessages.SPYGLASS_SEND_CARDS,
			),
		)

		yield* put<LocalMessage>({
			type: localMessages.SPYGLASS_SET_CARDS,
			cards: spyglassCards.cards,
		})
	}
}

type GameSagaProps = {
	initialTurnActions?: Array<ReplayActionData>
	spectatorCode?: string
	playerEntity: PlayerEntity
	playerOneDefs: PlayerSetupDefs
	playerTwoDefs: PlayerSetupDefs
	props: GameControllerProps
}

function* gameSaga({
	initialTurnActions,
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

	if (initialTurnActions) {
		yield* call(() => getGameSyncedUp(gameController, initialTurnActions))
		const localGameState = getLocalGameState(
			gameController.game,
			gameController.viewers[0],
		)
		yield* put<LocalMessage>({
			type: localMessages.GAME_LOCAL_STATE_RECIEVED,
			localGameState,
			time: Date.now(),
		})
	}
	gameController.readyToDisplay = true

	const backgroundTasks = yield* fork(() =>
		all([
			fork(opponentConnectionSaga),
			fork(chatSaga),
			fork(spectatorSaga),
			fork(reconnectSaga, gameController),
			fork(achievementSaga),
			fork(handleForfeitAction),
			fork(turnActionRecieve, gameController),
			fork(requestCardsForSpyglass),
			fork(recieveCardsForSpyglass),
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

		if (result.gameEnd) {
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
