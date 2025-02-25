import {achievement} from './defaults'
import {Achievement} from './types'

const HurtinHermits: Achievement = {
	...achievement,
	numericId: 41,
	id: 'hertin-hermits',
	levels: [{name: "Hurtin' Hermits", description: 'Win 1 game.', steps: 1}],
	onGameEnd(_game, playerEntity, component, outcome) {
		console.log('Incrementing progress')
		if (outcome.type !== 'player-won' || outcome.winner === playerEntity) return
		component.incrementGoalProgress({goal: 0})
	},
}

export default HurtinHermits
