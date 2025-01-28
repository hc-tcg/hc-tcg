import {achievement} from './defaults'
import {Achievement} from './types'

function winAchievement(
	name: string,
	numericId: number,
	winCount: number,
): Achievement {
	return {
		...achievement,
		numericId: numericId,
		id: `wins_${winCount}`,
		name: name,
		description: `Win ${winCount} games.`,
		steps: winCount,
		onGameEnd(_game, playerEntity, component, outcome) {
			if (outcome.type !== 'player-won' || outcome.winner !== playerEntity)
				return
			component.addGoalProgress({goal: 0})
		},
	}
}

export const Win1 = winAchievement('Victor', 25, 1)
export const Win10 = winAchievement('Victor II', 26, 10)
export const Win100 = winAchievement('Card slinger', 27, 100)
export const Win500 = winAchievement('TCG Legend', 28, 500)
export const Win1000 = winAchievement('TCG Champion', 29, 1000)
