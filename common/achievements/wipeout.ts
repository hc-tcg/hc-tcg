import {RowComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const Wipeout: Achievement = {
	...achievement,
	numericId: 5,
	id: 'wipeout',
	name: 'Wipeout',
	description: 'Knockout 5 Hermits in the same turn',
	steps: 5,
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		let knockouts = 0

		game.components
			.filter(
				RowComponent,
				query.row.player(player.opponentPlayer.entity),
			)
			.forEach((row) => {
				observer.subscribe(row.hooks.onKnockOut, () => {
					knockouts += 1
				})
			})

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (!component.goals[0]) component.goals[0] = 0
			component.goals[0] = Math.min(component.goals[0], knockouts)
			knockouts = 0
		})
	},
}

export default Wipeout
