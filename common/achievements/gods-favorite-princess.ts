import {onCoinFlip} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const GodsFavoritePrincess: Achievement = {
	...achievement,
	numericId: 51,
	id: 'lucky-streak',
	progressionMethod: 'best',
	levels: [
		{
			name: "God's Favorite Princess",
			description: 'Flip heads 15 times in one game.',
			steps: 15,
		},
	],
	onGameStart(_game, player, component, observer) {
		let heads = 0

		observer.subscribeWithPriority(
			player.hooks.onCoinFlip,
			onCoinFlip.ACHIEVEMENTS,
			(_card, coinFlips) => {
				heads += coinFlips.filter((c) => c.result === 'heads').length
				component.updateGoalProgress({
					goal: 0,
					progress: heads,
				})
			},
		)
	},
}

export default GodsFavoritePrincess
