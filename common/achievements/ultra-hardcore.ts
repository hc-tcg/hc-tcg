import {CardComponent, RowComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const UltraHardcore: Achievement = {
	...achievement,
	numericId: 68,
	id: 'ultra-hardcore',
	progressionMethod: 'best',
	levels: [
		{
			name: 'Ultra Hardcore',
			description: 'Draw 3 of your prize cards before your opponent draws one.',
			steps: 3,
		},
	],
	onGameStart(game, player, component, observer) {
		var knockouts = 0

		game.components
			.filter(RowComponent, query.row.player(player.opponentPlayer.entity))
			.forEach((row) => {
				observer.subscribe(row.hooks.onKnockOut, (card) => {
					if (!card.isHermit()) return
					if (
						game.components.exists(
							CardComponent,
							query.card.isHermit,
							query.card.player(player.entity),
							query.card.slot(query.slot.empty),
						)
					) {
						observer.unsubscribeFromEverything()
						return
					}
					knockouts += 1
					component.updateGoalProgress({goal: 0, progress: knockouts})
				})
			})

		game.components
			.filter(RowComponent, query.row.player(player.entity))
			.forEach((row) => {
				observer.subscribe(row.hooks.onKnockOut, (card) => {
					if (!card.isHermit()) return
					observer.unsubscribeFromEverything()
				})
			})
	},
}

export default UltraHardcore
