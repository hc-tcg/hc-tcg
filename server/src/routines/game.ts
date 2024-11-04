import {PlayerComponent} from 'common/components'
import {GameSettings, gameSettingsFromEnv} from 'common/models/game-model'
import {PlayerModel} from 'common/models/player-model'
import setupGameSaga, {
	GameMessage,
	gameMessages,
	GameMessageTable,
} from 'common/routines/game'
import {serverMessages} from 'common/socket-messages/server-messages'
import {assert} from 'common/utils/assert'
import {AIOpponentDefs} from 'common/utils/setup-game'
import {GameController, GameViewer} from 'game-controller'
import {all, call, cancel, fork, put, take} from 'typed-redux-saga'
import {LocalMessageTable, localMessages} from '../messages'
import root from '../serverRoot'
import {broadcast} from '../utils/comm'

type Props = {
	player1: PlayerModel
	player2: PlayerModel | AIOpponentDefs
	viewers: Array<GameViewer>
	randomizeOrder?: boolean
	settings?: Partial<GameSettings>
	code?: string
	spectatorCode?: string
}

export function* gameManagerSaga({
	player1,
	player2,
	viewers,
	randomizeOrder,
	code,
	settings,
	spectatorCode,
}: Props) {
	let identifierInRootState = Math.random().toString(16)

	let player2Model

	if (player2 instanceof PlayerModel) {
		player2Model = {
			model: {
				name: player2.name,
				minecraftName: player2.minecraftName,
				censoredName: player2.censoredName,
			},
			deck: player2.deck.cards.map((card) => card.props.numericId),
		}
	} else {
		player2Model = {
			model: {
				name: player2.name,
				minecraftName: player2.minecraftName,
				censoredName: player2.censoredName,
				virtualAI: player2.virtualAI,
			},
			deck: player2.deck,
		}
	}

	let gameProps = {
		player1: {
			model: {
				name: player1.name,
				minecraftName: player1.minecraftName,
				censoredName: player1.censoredName,
			},
			deck: player1.deck.cards.map((card) => card.props.numericId),
		},
		id: identifierInRootState,
		player2: player2Model,
		settings: {...gameSettingsFromEnv(), ...settings},
		gameCode: code,
		spectatorCode,
		randomizeOrder,
		randomNumberSeed: Math.random().toString(36),
	}

	let serverSideGame: GameController
	let backgroundSagas: any = undefined

	yield* setupGameSaga(gameProps, {
		onGameStart: function* (game) {
			// Player one is added to the ECS first, Player two is added second
			const players = game.components.filter(PlayerComponent)

			serverSideGame = new GameController({
				game: game,
				viewers,
				playerOne: {
					playerId: player1.id,
					entity: players[0].entity,
				},
				playerTwo: {
					playerId: player2 instanceof PlayerModel ? player2.id : null,
					entity: players[1]?.entity,
				},
				props: gameProps,
			})

			viewers.forEach((p, index) => {
				if (p.type === 'player') {
					broadcast([root.players[p.id]], {
						type: serverMessages.GAME_START,
						props: gameProps,
						playerEntity: players[index].entity,
					})
				} else {
					broadcast([root.players[p.id]], {
						type: serverMessages.SPECTATE_PRIVATE_GAME_START,
						game: serverSideGame.startupInformation(),
					})
				}
			})

			root.games[identifierInRootState] = serverSideGame

			backgroundSagas = yield* fork(all, [
				call(function* () {
					while (true) {
						let action = (yield* take(
							localMessages.GAME_TURN_ACTION,
						)) as LocalMessageTable[typeof localMessages.GAME_TURN_ACTION]

						assert(
							action.time > game.lastTurnActionTime,
							'Server should not recieve actions from the past',
						)

						if (game.state.order.includes(action.playerEntity)) {
							yield* put<GameMessage>({
								type: gameMessages.TURN_ACTION,
								playerEntity: action.playerEntity,
								action: action.action,
								time: action.time,
								gameId: game.id,
							})
						}
					}
				}),
				call(function* () {
					while (true) {
						let action = (yield* take(
							localMessages.REQUEST_GAME_RECONNECT_INFORMATION,
						)) as LocalMessageTable[typeof localMessages.REQUEST_GAME_RECONNECT_INFORMATION]

						if (serverSideGame.viewers.find(({id}) => id == action.playerId)) {
							broadcast([root.players[action.playerId]], {
								type: serverMessages.GAME_RECONNECT_INFORMATION,
								history: serverSideGame.history,
								timer: serverSideGame.game.state.timer,
							})
						}
					}
				}),
				call(function* () {
					while (true) {
						let playerRemoved = yield* take<
							LocalMessageTable[typeof localMessages.PLAYER_REMOVED]
						>(
							(action: any) =>
								action.type === localMessages.PLAYER_REMOVED &&
								[
									player1.id,
									player2 instanceof PlayerModel ? player2.id : null,
								].includes(
									(
										action as LocalMessageTable[typeof localMessages.PLAYER_REMOVED]
									).player.id,
								),
						)

						let playerEntity = serverSideGame.getPlayerComponentById(
							playerRemoved.player.id,
						)?.entity
						assert(
							playerEntity,
							'Players that are not in the game can not disconect',
						)

						yield* put<GameMessage>({
							type: gameMessages.TURN_ACTION,
							playerEntity,
							time: Date.now(),
							gameId: game.id,
							action: {
								type: 'FORFEIT',
								player: playerEntity,
							},
						})
					}
				}),
			])
		},
		onTurnAction: function* (
			action: GameMessageTable[typeof gameMessages.TURN_ACTION],
			game,
		) {
			serverSideGame.history.push(action)

			let gameStateHash = game.getStateHash()

			serverSideGame.broadcastToViewers({
				type: serverMessages.GAME_TURN_ACTION,
				playerEntity: action.playerEntity,
				action: action.action,
				time: action.time,
				gameStateHash,
			})
		},
	})

	assert(
		backgroundSagas,
		'The sagas running in the background of the game should be set when the game is started',
	)

	yield* cancel(backgroundSagas)

	// Cleanup! Remove the game when its over.
	delete root.games[identifierInRootState]
}
