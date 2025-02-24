import {RowComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const Wipeout: Achievement = {
	...achievement,
	numericId: 5,
	id: 'wipeout',
	levels: [
		{
			name: 'Wipeout',
			description: 'Knockout 3 Hermits in the same turn.',
			steps: 3,
		},
	],
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		let knockouts = 0

		game.components
			.filter(RowComponent, query.row.player(player.opponentPlayer.entity))
			.forEach((row) => {
				observer.subscribe(row.hooks.onKnockOut, () => {
					knockouts += 1
				})
			})

		observer.subscribe(player.hooks.onTurnStart, () => {
			component.bestGoalProgress({goal: 0, progress: knockouts})
			knockouts = 0
		})
	},
}

export default Wipeout
