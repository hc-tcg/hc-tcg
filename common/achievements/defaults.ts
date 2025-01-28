import {Achievement} from './types'

export const achievement: Omit<
	Achievement,
	'id' | 'numericId' | 'name' | 'description' | 'steps'
> = {
	getProgress(goals: Record<number, number>) {
		return goals[0]
	},
	onGameStart() {},
	onGameEnd() {},
}
