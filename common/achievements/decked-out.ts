import {achievement} from './defaults'
import {Achievement} from './types'

const DeckedOut: Achievement = {
	...achievement,
	numericId: 1,
	id: 'decked_out',
	name: 'Decked out',
	description: 'Win a game by your opponent running out of cards',
	steps: 1,
	onGameEnd(component, outcome) {
		const {player} = component
		if (outcome.type !== 'player-won' || outcome.winner !== player) return
		if (outcome.victoryReason !== 'decked-out') return
		component.incrementGoalProgress(0)
	},
}

export default DeckedOut
