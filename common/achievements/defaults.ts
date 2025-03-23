import {Achievement} from './types'

export const achievement: Omit<
	Achievement,
	'id' | 'numericId' | 'levels' | 'icon'
> = {
	getProgress(goals: Record<number, number>) {
		return goals[0]
	},
	onGameStart() {},
	onGameEnd() {},
	progressionMethod: 'best',
}
