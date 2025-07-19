import {Achievement} from './types'

export const achievement: Omit<
	Achievement,
	'id' | 'numericId' | 'levels' | 'icon' | 'progressionMethod'
> = {
	getProgress(goals: Record<number, number>) {
		return goals[0]
	},
	onGameStart() {},
	onGameEnd() {},
}
