import {ViewerComponent} from 'common/components/viewer-component'
import {GameModel} from 'common/models/game-model'

export const getOpponentId = (game: GameModel, playerId: string) => {
	const players = game.components
		.filter(ViewerComponent, (_game, viewer) => !viewer.spectator)
		.map((viewer) => viewer.player)
	return players.filter((p) => p.id !== playerId)[0]?.id || null
}
