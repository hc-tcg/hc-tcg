import {RowComponent} from '../components'
import query from '../components/query'
import {onTurnEnd} from '../types/priorities'
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
	onGameStart(game, player, component, observer) {
		let knockouts = 0

		game.components
			.filter(RowComponent, query.row.player(player.opponentPlayer.entity))
			.forEach((row) => {
				observer.subscribe(row.hooks.onKnockOut, () => {
					knockouts += 1
				})
			})

		const checkProgress = () => {
			console.log(knockouts)
			component.bestGoalProgress({goal: 0, progress: knockouts})
			knockouts = 0
		}

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ACHIEVEMENTS,
			() => {
				checkProgress()
			},
		)
		observer.subscribe(game.hooks.onGameEnd, () => {
			checkProgress()
		})
	},
}

export default Wipeout
