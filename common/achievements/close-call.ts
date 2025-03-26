import {SlotComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const RedKing: Achievement = {
	...achievement,
	numericId: 46,
	id: 'red-king',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Red King',
			description:
				'Win a game with all 5 Hermits on red HP (90 or lower) while on your last life.',
			steps: 1,
		},
	],
	onGameEnd(game, player, component, outcome) {
		if (outcome.type !== 'player-won' || outcome.winner !== player.entity)
			return

		if (player.lives !== 1) return

		const redHermits = game.components.filter(
			SlotComponent,
			query.slot.hermit,
			query.not(query.slot.empty),
			query.slot.player(player.entity),
			query.slot.row((_game, row) => (row.health ? row.health <= 90 : false)),
		)

		if (redHermits.length !== 5) return

		component.updateGoalProgress({goal: 0})
	},
}

export default RedKing
