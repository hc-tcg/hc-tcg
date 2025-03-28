import {
	AchievementComponent,
	ObserverComponent,
	PlayerComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {Goal} from '../types/achievements'
import {GameOutcome} from '../types/game-state'

export type Achievement = {
	id: string
	numericId: number
	getProgress: (goals: Record<number, number>) => number | undefined
	getGoals?: (goals: Record<number, number>) => Array<Goal>
	progressionMethod: 'sum' | 'best'
	evilXAchievement?: boolean

	levels: Array<{
		name: string
		description: string
		steps: number
	}>

	sidebarDescriptions?: Array<{type: string; name: string}>

	onGameStart: (
		game: GameModel,
		playerEntity: PlayerComponent,
		component: AchievementComponent,
		observer: ObserverComponent,
	) => void
	onGameEnd: (
		game: GameModel,
		playerEntity: PlayerComponent,
		component: AchievementComponent,
		outcome: GameOutcome,
	) => void
}
