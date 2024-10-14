import {PlayerComponent} from 'common/components'
import {gameSettingsFromEnv} from 'common/models/game-model'
import {PlayerModel} from 'common/models/player-model'
import setupGameSaga, {
	GameMessage,
	gameMessages,
	GameMessageTable,
} from 'common/routines/game'
import {serverMessages} from 'common/socket-messages/server-messages'
import {assert} from 'common/utils/assert'
import {GameController, GameViewer} from 'game-controller'
import {all, call, cancel, fork, put, take} from 'typed-redux-saga'
import {LocalMessageTable, localMessages} from '../messages'
import root from '../serverRoot'
import {broadcast} from '../utils/comm'

type Props = {
	player1: PlayerModel
	player2: PlayerModel
	viewers: Array<GameViewer>
	code?: string
	spectatorCode?: string
}

export function* gameManagerSaga({
	player1,
	player2,
	viewers,
	code,
	spectatorCode,
}: Props) {
	let identifierInRootState = Math.random().toString(16)

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
		player2: {
			model: {
				name: player2.name,
				minecraftName: player2.minecraftName,
				censoredName: player2.censoredName,
			},
			deck: player2.deck.cards.map((card) => card.props.numericId),
		},
		settings: gameSettingsFromEnv(),
		gameCode: code,
		spectatorCode,
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
					playerId: player2.id,
					entity: players[1].entity,
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

						if (game.state.order.includes(action.playerEntity)) {
							yield* put<GameMessage>({
								type: gameMessages.TURN_ACTION,
								playerEntity: action.playerEntity,
								action: action.action,
								time: action.time,
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
								[player1.id, player2.id].includes(
									(
										action as LocalMessageTable[typeof localMessages.PLAYER_REMOVED]
									).player.id,
								),
						)

						// @todo: Make player forfeit when they are disconnected
						yield* put<GameMessage>({
							type: gameMessages.TURN_ACTION,
							playerEntity: playerRemoved,
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
