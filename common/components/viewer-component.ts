import {PlayerEntity, ViewerEntity} from '../entities'
import {GameModel} from '../models/game-model'
import {PlayerId} from '../models/player-model'

export class ViewerComponent {
	readonly game: GameModel
	entity: ViewerEntity
	playerOnLeft: PlayerEntity
	playerId: PlayerId

	constructor(
		game: GameModel,
		entity: ViewerEntity,
		playerId: PlayerId,
		playerOnLeft: PlayerEntity
	) {
		this.game = game
		this.entity = entity
		this.playerId = playerId
		this.playerOnLeft = playerOnLeft
	}
}
