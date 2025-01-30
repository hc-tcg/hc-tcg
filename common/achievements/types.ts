import {AchievementComponent, ObserverComponent} from '../components'
import {Cosmetic} from '../cosmetics/types'
import {PlayerEntity} from '../entities'
import {GameModel} from '../models/game-model'
import {GameOutcome} from '../types/game-state'

export type Achievement = {
	id: string
	numericId: number
	name: string
	description: string
	
	steps: number
	getProgress: (goals: Record<number, number>) => number

	icon: Cosmetic['id']
	sidebarDescriptions?: Array<{type: string; name: string}>

	onGameStart: (
		game: GameModel,
		playerEntity: PlayerEntity,
		component: AchievementComponent,
		observer: ObserverComponent,
	) => void
	onGameEnd: (
		game: GameModel,
		playerEntity: PlayerEntity,
		component: AchievementComponent,
		outcome: GameOutcome,
	) => void
}
