import {AchievementComponent, ObserverComponent} from '../components'
import {GameOutcome} from '../types/game-state'

export type Achievement = {
	id: string
	numericId: number
	name: string
	description: string
	steps: number
	getProgress: (goals: Record<number, number>) => number
	sidebarDescriptions?: Array<{type: string; name: string}>

	onGameStart: (
		component: AchievementComponent,
		observer: ObserverComponent,
	) => void
	onGameEnd: (component: AchievementComponent, outcome: GameOutcome) => void
}
