import {SlotComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const FullyLoaded: Achievement = {
	...achievement,
	numericId: 43,
	id: 'fully-loaded',
	levels: [
		{
			name: 'Fully Loaded',
			description:
				'Have cards attached to every one of your Hermit, effect, and item slots..',
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		observer.subscribe(player.hooks.onAttach, () => {
			if (
				game.components.find(
					SlotComponent,
					query.slot.player(player.entity),
					query.slot.empty,
				)
			)
				return
			component.incrementGoalProgress({goal: 0})
		})
	},
}

export default FullyLoaded
