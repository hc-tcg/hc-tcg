import {Achievement} from './types'

export const achievement: Omit<
	Achievement,
	'id' | 'numericId' | 'name' | 'description' | 'steps' | 'goals'
> = {
	getProgress(goals: Record<number, number>) {
		return Object.values(goals).filter((goal) => goal > 0).length
	},
	onGameStart() {},
	onGameEnd() {},
}
