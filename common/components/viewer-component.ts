import {PlayerEntity, ViewerEntity} from '../entities'
import {GameModel} from '../models/game-model'
import {PlayerModel} from '../models/player-model'

type ViewerDefs = {
	playerOnLeft: PlayerEntity
	spectator: boolean
	player: PlayerModel
}

export class ViewerComponent {
	readonly game: GameModel
	entity: ViewerEntity
	playerOnLeftEntity: PlayerEntity
	spectator: boolean
	player: PlayerModel

	constructor(game: GameModel, entity: ViewerEntity, defs: ViewerDefs) {
		this.game = game
		this.entity = entity
		this.player = defs.player
		this.playerOnLeftEntity = defs.playerOnLeft
		this.spectator = defs.spectator
	}

	get playerId() {
		return this.player.id
	}

	get playerOnLeft() {
		return this.game.components.getOrError(this.playerOnLeftEntity)
	}

	get playerOnRight() {
		return this.playerOnLeft.opponentPlayer
	}
}
