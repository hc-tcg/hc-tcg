import {PlayerEntity, ViewerEntity} from '../entities'
import {GameModel} from '../models/game-model'
import { PlayerId } from '../models/player-model'
import {PlayerComponent} from './player-component'

export class ViewerComponent {
	playerOnLeft: PlayerEntity
	playerId: PlayerId

	constructor(game: GameModel, entity: ViewerEntity, playerId: PlayerId, playerOnLeft: PlayerEntity) {
		this.playerId = playerId
		this.playerOnLeft = playerOnLeft
	}
}
