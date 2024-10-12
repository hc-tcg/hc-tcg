import {PlayerId} from 'common/models/player-model'
import {ServerGameModel} from 'routines/game'
import root from 'serverRoot'

export function getGame(player: PlayerId): () => ServerGameModel {
	return () => {
		return Object.values(root.games).find((game) =>
			Object.keys(game.players).includes(player),
		)
	}
}
