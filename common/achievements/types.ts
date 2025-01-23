import {AchievementComponent, ObserverComponent} from '../components'
import {PlayerEntity} from '../entities'

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
		component: AchievementComponent,
		observer: ObserverComponent,
	) => void
	onGameEnd: (component: AchievementComponent, player: PlayerEntity) => void
}
