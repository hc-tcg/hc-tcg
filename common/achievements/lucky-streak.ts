import {onCoinFlip} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const LuckyStreak: Achievement = {
	...achievement,
	numericId: 51,
	id: 'lucky-streak',
	levels: [
		{
			name: 'Lucky Streak',
			description: 'Flip heads 15 times in one game.',
			steps: 15,
		},
	],
	onGameStart(_game, player, component, observer) {
		observer.subscribeWithPriority(
			player.hooks.onCoinFlip,
			onCoinFlip.ACHIEVEMENTS,
			(_card, coinFlips) => {
				component.incrementGoalProgress({
					goal: 0,
					amount: coinFlips.filter((c) => c.result === 'heads').length,
				})
			},
		)
	},
}

export default LuckyStreak
