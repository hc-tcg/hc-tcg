import {Entity, PlayerEntity} from 'common/entities'
import {GameModel} from 'common/models/game-model'
import {AI_CLASSES} from '.'
import {AIClass, VirtualAI} from './virtual-action'

export type AIEntity = Entity<AIComponent>

export class AIComponent {
	readonly game: GameModel
	readonly entity: AIEntity

	readonly playerEntity: PlayerEntity
	readonly ai: VirtualAI

	constructor(
		game: GameModel,
		entity: AIEntity,
		player: PlayerEntity,
		ai: string | AIClass,
	) {
		this.game = game
		;(this.entity = entity), (this.playerEntity = player)
		if (ai instanceof Object) {
			this.ai = AI_CLASSES[ai.name]
		} else {
			this.ai = AI_CLASSES[ai]
		}
	}

	public getTurnAction() {
		return this.ai.getTurnAction(this.game, this)
	}
}
