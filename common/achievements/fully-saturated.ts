import {RowComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const FullySaturated: Achievement = {
	...achievement,
	numericId: 65,
	id: 'fully-saturated',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Fully Saturated',
			description: 'Heal 1500 HP.',
			steps: 1500,
		},
	],
	onGameStart(game, player, component, observer) {
		game.components
			.filter(RowComponent, query.row.player(player.entity))
			.forEach((row) => {
				observer.subscribe(row.hooks.onHealed, (_card, amount) => {
					if (amount <= 0) return

					component.updateGoalProgress({goal: 0, progress: amount})
				})
			})
	},
}

export default FullySaturated
