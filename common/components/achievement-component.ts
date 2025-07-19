import {Achievement} from '../achievements/types'
import type {AchievementEntity, ObserverEntity, PlayerEntity} from '../entities'
import type {GameModel} from '../models/game-model'
import {ProgressionEntry} from '../types/achievements'
import {GameHook} from '../types/hooks'

let ACHIEVEMENTS: Record<string | number, Achievement>
import('../achievements').then((mod) => (ACHIEVEMENTS = mod.ACHIEVEMENTS))

// Used to combine the progress from before the game, with the progress gained during the game
function combineAchievementProgress(
	method: 'sum' | 'best',
	a: Record<number, number>,
	b: Record<number, number>,
) {
	let out: Record<number, number> = {}

	for (const key in a) {
		if (method === 'sum') {
			out[key] = (a[key] || 0) + (b[key] || 0)
		} else if (method === 'best') {
			out[key] = Math.max(a[key] || 0, b[key] || 0)
		}
	}
	for (const key in b) {
		if (method === 'sum') {
			out[key] = (a[key] || 0) + (b[key] || 0)
		} else if (method === 'best') {
			out[key] = Math.max(a[key] || 0, b[key] || 0)
		}
	}

	return out
}

/** A component that represents a card in the game. Cards can be in the player's hand, deck, board or discard pile. */
export class AchievementComponent {
	public static table = 'achievements'

	readonly game: GameModel
	readonly props: Achievement
	readonly entity: AchievementEntity

	goals: Record<number, number>
	oldProgress: ProgressionEntry

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
		oldProgress: ProgressionEntry,
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
		this.oldProgress = oldProgress
		this.player = player

		this.oldProgress.levels.forEach((level, i) => {
			if (level.completionTime !== undefined) {
				this.sentLevels.push(i)
			}
		})
	}

	private checkCompletion(originalGoals: Record<number, number>): () => void {
		const originalProgress =
			this.props.getProgress(
				combineAchievementProgress(
					this.props.progressionMethod,
					originalGoals,
					this.oldProgress.goals,
				),
			) ?? 0

		return () => {
			const newProgress =
				this.props.getProgress(
					combineAchievementProgress(
						this.props.progressionMethod,
						this.goals,
						this.oldProgress.goals,
					),
				) ?? 0

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
		this.goals = combineAchievementProgress(
			this.props.progressionMethod,
			this.goals,
			{[goal]: progress},
		)
		progressChecker()
	}
}
