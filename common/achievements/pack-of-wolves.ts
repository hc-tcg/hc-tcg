import Wolf from '../cards/attach/wolf'
import {SlotComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const PackOfWolves: Achievement = {
	...achievement,
	numericId: 3,
	id: 'pack_of_wolves',
	icon: '',
	levels: [
		{
			name: 'Pack Of Wolves',
			description: 'Have 3 wolves attached to your hermits at the same time.',
			steps: 3,
		},
	],
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		observer.subscribe(player.hooks.onAttach, (card) => {
			if (card.props !== Wolf) return
			const boardCards = game.components.filter(
				SlotComponent,
				query.slot.player(playerEntity),
				query.slot.attach,
				query.slot.has(Wolf),
			)
			component.bestGoalProgress({goal: 0, progress: boardCards.length})
		})
	},
}

export default PackOfWolves
