import {ViewerComponent} from 'common/components/viewer-component'
import {GameModel} from 'common/models/game-model'
import {serverMessages} from 'common/socket-messages/server-messages'
import root from 'serverRoot'
import {broadcast} from 'utils/comm'

function cancelGame(game: {
	playerId: string | null
	gameCode: string
	spectatorsWaiting: Array<string>
}) {
	if (game.playerId) {
		const player = root.players[game.playerId]
		if (player) {
			broadcast([player], {type: serverMessages.PRIVATE_GAME_TIMEOUT})
		}
	}

	for (const spectator of game.spectatorsWaiting) {
		const player = root.players[spectator]
		if (player) {
			broadcast([player], {type: serverMessages.PRIVATE_GAME_TIMEOUT})
		}
	}

	if (game.gameCode) delete root.privateQueue[game.gameCode]
}

function getPlayers(game: GameModel) {
	return game.components.filter(ViewerComponent).flatMap((viewer) => {
		if (viewer.spectator) return []
		let player = viewer.playerOnLeft
		return [
			{
				playerName: player.playerName,
				censoredPlayerName: player.censoredPlayerName,
				minecraftName: player.minecraftName,
				lives: player.lives,
				deck: player.getDeck().map((card) => card.props.id),
			},
		]
	})
}

/** Create a hc-tcg game through the HC-TCG API.
 * API games automatically time out after 5 minutes if it is not started.
 */
const API_GAME_TIMEOUT = 1000 * 60 * 5

export function createApiGame() {
	let {gameCode, spectatorCode, apiSecret} = root.createPrivateGame(null)

	setTimeout(() => {
		let game = root.privateQueue[gameCode]
		if (game) cancelGame(game)
	}, API_GAME_TIMEOUT)

	return {
		gameCode,
		spectatorCode,
		apiSecret,
		timeOutAt: Date.now() + API_GAME_TIMEOUT,
	}
}

export function cancelApiGame(code: string) {
	let game = Object.values(root.privateQueue).find(
		(game) => game.apiSecret === code,
	)

	if (!game) {
		return {
			error: 'Could not find API code',
		}
	}

	cancelGame(game)

	return {success: null}
}

export function getGameInfo(secret: string) {
	let game = Object.values(root.games).find((game) => game.apiSecret === secret)

	if (!game) {
		return {
			error: 'Could not find API code',
		}
	}

	return {
		success: null,
		id: game.id,
		createdTime: game.createdTime,
		spectatorCode: game.spectatorCode,
		players: getPlayers(game),
		viewers: game.viewers.length,
		state: game.state,
	}
}

export function getGameCount() {
	return {games: root.getGameIds().length}
}
