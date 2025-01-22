import {Achievement} from '../achievements/types'
import type {AchievementEntity, ObserverEntity} from '../entities'
import type {GameModel} from '../models/game-model'
import {GameHook} from '../types/hooks'

let ACHIEVEMENTS: Achievement[]
import('../achievements').then((mod) => (ACHIEVEMENTS = mod.ACHIEVEMENTS_LIST))

/** A component that represents a card in the game. Cards can be in the player's hand, deck, board or discard pile. */
export class AchievementComponent<
	AchievementType extends Achievement = Achievement,
> {
	readonly game: GameModel
	readonly props: AchievementType
	readonly entity: AchievementEntity

	progress: Buffer<ArrayBuffer>

	observerEntity: ObserverEntity | null

	hooks: {
		onComplete: GameHook<() => void>
	}

	constructor(
		game: GameModel,
		entity: AchievementEntity,
		achievement: number | Achievement,
		initialProgress: Buffer<ArrayBuffer>,
	) {
		this.game = game
		this.entity = entity
		this.observerEntity = null
		if (achievement instanceof Object) {
			this.props = ACHIEVEMENTS[achievement.numericId] as AchievementType
		} else {
			this.props = ACHIEVEMENTS[achievement] as AchievementType
		}

		this.hooks = {
			onComplete: new GameHook(),
		}

		this.progress = initialProgress
	}
}
