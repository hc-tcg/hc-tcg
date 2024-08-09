import {AI_CLASSES} from '../../server/src/routines/virtual'
import {AIEntity, PlayerEntity} from '../entities'
import {GameModel} from '../models/game-model'
import {AIClass, VirtualAI} from '../types/virtual-ai'

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

	public get player() {
		return this.game.components.getOrError(this.playerEntity)
	}
}
