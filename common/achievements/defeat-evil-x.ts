import {achievement} from './defaults'
import {Achievement} from './types'

const DefeatEvilX: Achievement = {
	...achievement,
	numericId: 6,
	id: 'defeat_evil_x',
	evilXAchievement: true,
	levels: [
		{
			name: 'Evil X-Terminator',
			description: 'Defeat Evil X',
			steps: 1,
		},
	],
	onGameEnd(_game, player, component, outcome) {
		if (outcome.type !== 'player-won') return
		if (outcome.winner !== player.entity) return
		component.incrementGoalProgress({goal: 0})
	},
}

export default DefeatEvilX
