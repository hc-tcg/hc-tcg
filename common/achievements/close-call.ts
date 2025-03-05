import {SlotComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const RedKing: Achievement = {
	...achievement,
	numericId: 46,
	id: 'red-king',
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

		let hermits = game.components.filter(
			SlotComponent,
			query.slot.hermit,
			query.not(query.slot.empty),
			query.slot.player(player.entity),
		)

		if (hermits.length !== 5) return

		for (const hermit of hermits) {
			if (!hermit.inRow() || !hermit.row.health || hermit.row.health < 90)
				return
		}

		component.incrementGoalProgress({goal: 0})
	},
}

export default RedKing
