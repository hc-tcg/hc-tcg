import Wolf from '../cards/attach/wolf'
import {SlotComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const PackOfWolves: Achievement = {
	...achievement,
	numericId: 3,
	id: 'pack_of_wolves',
	name: 'Pack Of Wolves',
	description: 'Have 3 wolves attached to your hermits at the same time',
	steps: 3,
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		observer.subscribe(player.hooks.onAttach, (card) => {
			if (card.props !== Wolf) return
			const boardCards = game.components.filter(
				SlotComponent,
				query.slot.player(playerEntity),
				query.slot.attach,
				(_game, slot) => slot.getCard()?.props === Wolf,
			)
			if (!component.goals[0]) component.goals[0] = 0
			component.goals[0] = Math.max(component.goals[0], boardCards.length)
		})
	},
}

export default PackOfWolves
