import {achievement} from './defaults'
import {Achievement} from './types'

const Win: Achievement = {
	...achievement,
	numericId: 26,
	id: 'wins',
	levels: [
		{name: 'Victor', description: 'Win 1 Game', steps: 1},
		{name: 'Victor II', description: 'Win 10 Games', steps: 10},
		{name: 'Card Slinger', description: 'Win 100 Games', steps: 100},
		{name: 'TCG Legend', description: 'Win 500 Games', steps: 500},
		{name: 'TCG Champion', description: 'Win 1000 Games', steps: 1000},
	],
	icon: '',
	onGameEnd(_game, playerEntity, component, outcome) {
		if (outcome.type !== 'player-won' || outcome.winner !== playerEntity) return
		component.incrementGoalProgress({goal: 0})
	},
}

export default Win
