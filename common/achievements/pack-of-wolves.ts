import Wolf from '../cards/attach/wolf'
import {SlotComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const PackOfWolves: Achievement = {
	...achievement,
	numericId: 3,
	id: 'pack_of_wolves',
	progressionMethod: 'best',
	levels: [
		{
			name: 'Pack of Wolves',
			description: 'Have 3 wolves attached to your hermits at the same time.',
			steps: 3,
		},
	],
	onGameStart(game, player, component, observer) {
		observer.subscribe(player.hooks.onAttach, (card) => {
			if (card.props !== Wolf) return
			const boardCards = game.components.filter(
				SlotComponent,
				query.slot.player(player.entity),
				query.slot.attach,
				query.slot.has(Wolf),
			)
			component.updateGoalProgress({goal: 0, progress: boardCards.length})
		})
	},
}

export default PackOfWolves
