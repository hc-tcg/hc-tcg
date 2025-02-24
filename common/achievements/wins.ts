import {achievement} from './defaults'
import {Achievement} from './types'

const Win: Achievement = {
	...achievement,
	numericId: 26,
	id: 'wins',
	levels: [
		{name: 'Card Slinger', description: 'Win 1 game.', steps: 1},
		{name: 'TCG Novice', description: 'Win 10 games.', steps: 10},
		{name: 'TCG Apprentice', description: 'Win 100 games.', steps: 100},
		{name: 'TCG Legend', description: 'Win 500 games.', steps: 500},
		{name: 'TCG Champion', description: 'Win 1000 games.', steps: 1000},
	],

	onGameEnd(_game, playerEntity, component, outcome) {
		console.log('Incrementing progress')
		if (outcome.type !== 'player-won' || outcome.winner !== playerEntity) return
		component.incrementGoalProgress({goal: 0})
	},
}

export default Win
