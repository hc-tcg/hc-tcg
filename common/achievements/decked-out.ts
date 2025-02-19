import {achievement} from './defaults'
import {Achievement} from './types'

const DeckedOut: Achievement = {
	...achievement,
	numericId: 1,
	id: 'decked_out',
	name: 'Decked out',
	icon: '',
	description: 'Win a game by your opponent running out of cards',
	steps: 1,
	onGameEnd(_game, playerEntity, component, outcome) {
		if (outcome.type !== 'player-won' || outcome.winner !== playerEntity) return
		if (outcome.victoryReason !== 'decked-out') return
		component.incrementGoalProgress({goal: 0})
	},
}

export default DeckedOut
