import {PlayerId} from 'common/models/player-model'
import {GameController} from 'game-controller'
import root from 'serverRoot'

export function getGame(player: PlayerId): () => GameController | undefined {
	return () => {
		return Object.values(root.games).find(
			(game) => new Boolean(game.viewers.find(({id}) => id == player)),
		)
	}
}
