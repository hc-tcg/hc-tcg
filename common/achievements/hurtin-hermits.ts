import {achievement} from './defaults'
import {Achievement} from './types'

const HurtinHermits: Achievement = {
	...achievement,
	numericId: 41,
	id: 'hurtin_hermits',
	progressionMethod: 'sum',
	levels: [
		{name: "Hurtin' Hermits", description: 'Lose your first game.', steps: 1},
	],
	onGameEnd(_game, player, component, outcome) {
		if (outcome.type !== 'player-won' || outcome.winner === player.entity)
			return
		component.updateGoalProgress({goal: 0})
	},
}

export default HurtinHermits
