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
	onGameStart(component, observer) {
		const {game, player} = component
		const playerComponent = game.components.get(player)
		if (!playerComponent) return

		let knockouts = 0

		game.components
			.filter(
				RowComponent,
				query.row.player(playerComponent.opponentPlayer.entity),
			)
			.forEach((row) => {
				observer.subscribe(row.hooks.onKnockOut, () => {
					knockouts += 1
				})
			})

		observer.subscribe(playerComponent.hooks.onTurnStart, () => {
			if (!component.goals[0]) component.goals[0] = 0
			component.goals[0] = Math.min(component.goals[0], knockouts)
			knockouts = 0
		})
	},
}

export default Wipeout
