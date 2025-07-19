import {RowComponent} from '../components'
import query from '../components/query'
import SleepingEffect from '../status-effects/sleeping'
import {achievement} from './defaults'
import {Achievement} from './types'

const GottaSchreep: Achievement = {
	...achievement,
	numericId: 54,
	id: 'gotta_schreep',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Gotta Schreep',
			description: 'KO a Hermit while your active Hermit is sleeping.',
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		let isSleeping = false

		observer.subscribe(player.hooks.onTurnStart, () => {
			isSleeping = !!player.activeRow
				?.getHermit()
				?.getStatusEffect(SleepingEffect)
		})

		game.components
			.filter(RowComponent, query.row.player(player.opponentPlayer.entity))
			.forEach((row) => {
				observer.subscribe(row.hooks.onKnockOut, () => {
					if (isSleeping) {
						component.updateGoalProgress({goal: 0})
					}
				})
			})
	},
}

export default GottaSchreep
