import assert from 'assert'
import type {AIEntity, PlayerEntity} from '../entities'
import {AI_DEFINITIONS} from '../game/virtual'
import type {GameModel} from '../models/game-model'
import type {AnyTurnActionData} from '../types/turn-action-data'
import type {VirtualAI} from '../types/virtual-ai'

export class AIComponent {
	public static table = 'ais'

	readonly game: GameModel
	readonly entity: AIEntity

	readonly playerEntity: PlayerEntity
	readonly ai: VirtualAI
	turnActionGenerator: Generator<AnyTurnActionData>

	constructor(
		game: GameModel,
		entity: AIEntity,
		player: PlayerEntity,
		ai: string | VirtualAI,
	) {
		this.game = game
		this.entity = entity
		this.playerEntity = player
		if (ai instanceof Object) {
			this.ai = ai
		} else {
			this.ai = AI_DEFINITIONS[ai]
		}
		this.turnActionGenerator = this.ai.getTurnActions(this.game, this)
	}

	public getNextTurnAction(): AnyTurnActionData {
		let nextAction = this.turnActionGenerator.next()
		assert(
			!nextAction.done,
			'Bosses should always be able to attack as long as the game is running.',
		)
		return nextAction.value
	}

	public get player() {
		return this.game.components.getOrError(this.playerEntity)
	}
}
