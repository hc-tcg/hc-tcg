import {AchievementComponent, ObserverComponent} from '../components'
import {PlayerEntity} from '../entities'
import {GameModel} from '../models/game-model'

export type Achievement = {
	id: string
	numericId: number
	name: string
	description: string
	steps: number
	bytes: number
	getProgress: (data: Buffer<ArrayBuffer>) => number
	sidebarDescriptions?: Array<{type: string; name: string}>

	onGameStart: (
		game: GameModel,
		component: AchievementComponent,
		player: PlayerEntity,
		observer: ObserverComponent,
	) => void
	onGameEnd: (
		game: GameModel,
		component: AchievementComponent,
		player: PlayerEntity,
	) => void
}
