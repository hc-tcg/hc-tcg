import {achievement} from './defaults'
import {Achievement} from './types'

const DeckedOut: Achievement = {
	...achievement,
	numericId: 1,
	id: 'decked_out',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Decked Out',
			steps: 1,
			description: 'Win a game by your opponent running out of cards.',
		},
	],
	onGameEnd(_game, player, component, outcome) {
		if (outcome.type !== 'player-won' || outcome.winner !== player.entity)
			return
		if (outcome.victoryReason !== 'decked-out') return
		component.updateGoalProgress({goal: 0})
	},
}

export default DeckedOut
