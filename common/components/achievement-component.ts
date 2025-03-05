import {Achievement} from '../achievements/types'
import type {AchievementEntity, ObserverEntity, PlayerEntity} from '../entities'
import type {GameModel} from '../models/game-model'
import {GameHook} from '../types/hooks'

let ACHIEVEMENTS: Record<string | number, Achievement>
import('../achievements').then((mod) => (ACHIEVEMENTS = mod.ACHIEVEMENTS))

/** A component that represents a card in the game. Cards can be in the player's hand, deck, board or discard pile. */
export class AchievementComponent {
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
		goals: Record<number, number>,
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

		this.goals = goals
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
					newProgress == level.steps
				) {
					this.sentLevels.push(i)
					this.hooks.onComplete.call(newProgress, {index: i, ...level})
				}
			}
		}
	}

	public incrementGoalProgress({
		goal,
		amount = 1,
	}: {goal: number; amount?: number}) {
		const progressChecker = this.checkCompletion(this.goals)
		this.goals[goal] = (this.goals[goal] || 0) + amount
		progressChecker()
	}

	/** Set the goal progress to a number if it is higher than the current goal progress */
	public bestGoalProgress({goal, progress}: {goal: number; progress: number}) {
		const progressChecker = this.checkCompletion(this.goals)
		this.goals[goal] = Math.max(this.goals[goal] || 0, progress)
		progressChecker()
	}
}
