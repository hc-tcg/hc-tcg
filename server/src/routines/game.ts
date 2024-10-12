import {PlayerComponent} from 'common/components'
import {gameSettingsFromEnv} from 'common/models/game-model'
import {PlayerId, PlayerModel} from 'common/models/player-model'
import setupGameSaga, {
	GameMessage,
	gameMessages,
	GameMessageTable,
} from 'common/routines/game'
import {broadcast} from '../utils/comm'
import {fork, put, take} from 'typed-redux-saga'
import {serverMessages} from 'common/socket-messages/server-messages'
import {LocalMessageTable, localMessages} from '../messages'
import root from '../serverRoot'

type Props = {
	player1: PlayerModel
	player2: PlayerModel
	viewers: Array<PlayerId>
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
	let gameProps = {
		player1: {
			model: {
				name: player1.name,
				minecraftName: player1.minecraftName,
				censoredName: player1.censoredName,
			},
			deck: player1.deck.cards.map((card) => card.props.numericId),
		},
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

	yield* setupGameSaga(gameProps, {
		onGameStart: function* (game) {
			// Player one is added to the ECS first, Player two is added second
			const players = game.components.filter(PlayerComponent)

			viewers.forEach((p, index) => {
				broadcast([root.players[p]], {
					type: serverMessages.GAME_START,
					props: gameProps,
					playerEntity: players[index].entity,
				})
			})

			yield* fork(function* () {
				while (true) {
					let action = (yield* take(
						localMessages.GAME_TURN_ACTION,
					)) as LocalMessageTable[typeof localMessages.GAME_TURN_ACTION]

					if (game.state.order.includes(action.playerEntity)) {
						yield* put<GameMessage>({
							type: gameMessages.TURN_ACTION,
							playerEntity: action.playerEntity,
							action: action.action,
						})
					}
				}
			})
		},
		onTurnAction: function* (
			action: GameMessageTable[typeof gameMessages.TURN_ACTION],
			game,
		) {
			viewers.forEach((p, index) => {
				const playerEntity = action.playerEntity

				const players = game.components.filter(PlayerComponent)

				// then `playerEntity` created this action so we don't need to send it back
				if (playerEntity === players[index].entity) return

				broadcast([root.players[p]], {
					type: serverMessages.GAME_TURN_ACTION,
					playerEntity: action.playerEntity,
					action: action.action,
				})
			})
		},
	})
}
