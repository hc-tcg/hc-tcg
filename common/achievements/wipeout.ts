import {RowComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const Wipeout: Achievement = {
	...achievement,
	numericId: 5,
	id: 'wipeout',
	progressionMethod: 'best',
	levels: [
		{
			name: 'Wipeout',
			description:
				"Knockout 3 Hermits in the same turn. Includes both your turn and your opponent's following turn.",
			steps: 3,
		},
	],
	onGameStart(game, player, component, observer) {
		let knockouts = 0

		game.components
			.filter(RowComponent, query.row.player(player.opponentPlayer.entity))
			.forEach((row) => {
				observer.subscribe(row.hooks.onKnockOut, () => {
					knockouts += 1
					component.updateGoalProgress({goal: 0, progress: knockouts})
				})
			})

		observer.subscribe(player.hooks.onTurnStart, () => {
			knockouts = 0
		})
	},
}

export default Wipeout
