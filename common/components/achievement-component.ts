import {Achievement} from '../achievements/types'
import type {AchievementEntity, ObserverEntity, PlayerEntity} from '../entities'
import type {GameModel} from '../models/game-model'
import {GameHook} from '../types/hooks'

let ACHIEVEMENTS: Record<string | number, Achievement>
import('../achievements').then((mod) => (ACHIEVEMENTS = mod.ACHIEVEMENTS))

/** A component that represents a card in the game. Cards can be in the player's hand, deck, board or discard pile. */
export class AchievementComponent {
	public static table = 'achievements'

	readonly game: GameModel
	readonly props: Achievement
	readonly entity: AchievementEntity

	goals: Record<number, number>

	sentLevels: number[]
	observerEntity: ObserverEntity | null
	player: PlayerEntity

	hooks: {
		onComplete: GameHook<
			(
				newProgress: number,
				level: {
					index: number
					name: string
					description: string
					steps: number
				},
			) => void
		>
	}

	constructor(
		game: GameModel,
		entity: AchievementEntity,
		achievement: number | Achievement,
		player: PlayerEntity,
	) {
		this.game = game
		this.entity = entity
		this.observerEntity = null
		this.sentLevels = []
		if (achievement instanceof Object) {
			this.props = ACHIEVEMENTS[achievement.numericId] as Achievement
		} else {
			this.props = ACHIEVEMENTS[achievement] as Achievement
		}

		this.hooks = {
			onComplete: new GameHook(),
		}

		this.goals = {}
		this.player = player
	}

	private checkCompletion(originalGoals: Record<number, number>): () => void {
		const originalProgress = this.props.getProgress(originalGoals) ?? 0
		return () => {
			const newProgress = this.props.getProgress(this.goals) ?? 0

			for (const [i, level] of this.props.levels.entries()) {
				if (
					!this.sentLevels.includes(i) &&
					newProgress > originalProgress &&
					newProgress >= level.steps &&
					originalProgress < level.steps
				) {
					this.sentLevels.push(i)
					this.hooks.onComplete.call(newProgress, {index: i, ...level})
				}
			}
		}
	}

	public updateGoalProgress({
		goal,
		progress = 1,
	}: {goal: number; progress?: number}) {
		const progressChecker = this.checkCompletion(this.goals)
		this.goals[goal] = progress
		progressChecker()
	}
}
