import {PlayerId} from 'common/models/player-model'
import root from 'serverRoot'

export function getGame(player: PlayerId) {
	return () => {
		return Object.values(root.games).find((game) =>
			Object.keys(game.players).includes(player),
		)
	}
}
