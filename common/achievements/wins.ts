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
		icon: '',
		description: `Win ${winCount} game${winCount !== 1 ? 's' : ''}.`,
		steps: winCount,
		onGameEnd(_game, playerEntity, component, outcome) {
			if (outcome.type !== 'player-won' || outcome.winner !== playerEntity)
				return
			component.incrementGoalProgress({goal: 0})
		},
	}
}

export const Win1 = winAchievement('Card Slinger', 25, 1)
export const Win10 = winAchievement('TCG Novice', 26, 10)
export const Win100 = winAchievement('TCG Apprentice', 27, 100)
export const Win500 = winAchievement('TCG Champion', 28, 500)
export const Win1000 = winAchievement('TCG Legend', 29, 1000)
