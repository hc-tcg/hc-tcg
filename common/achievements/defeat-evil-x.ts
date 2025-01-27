import { achievement } from './defaults'
import { Achievement } from './types'

const DefeatEvilX: Achievement = {
	...achievement,
	numericId: 6,
	id: 'defeat_evil_x',
	name: 'Evil X-terminated',
	description: 'Defeat Evil X',
	steps: 1,
	onGameEnd(game, playerEntity, component, outcome) {
		if (!game.state.isEvilXBossGame) return
		if (outcome.type !== 'player-won') return
		if (outcome.winner !== playerEntity) return
		component.incrementGoalProgress(0)
	},
}

export default DefeatEvilX
