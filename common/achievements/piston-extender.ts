import {CardComponent, SlotComponent} from '../components'
import {CardEntity, RowEntity} from '../entities'
import {achievement} from './defaults'
import {Achievement} from './types'

const PistonExtender: Achievement = {
	...achievement,
	numericId: 20,
	id: 'piston-extender',
	progressionMethod: 'best',
	levels: [
		{
			name: 'Double piston extender',
			description:
				'Have an item card be attached to 3 different active hermits.',
			steps: 3,
		},
	],
	onGameStart(_game, player, component, observer) {
		const attachCounts: Record<CardEntity, RowEntity[]> = {}

		function noteCardAttached(card: CardComponent) {
			if (!card.slot.inRow()) return
            if (!player.activeRowEntity) return
            if (attachCounts[card.entity].includes(player.activeRowEntity)) return
			if (!attachCounts[card.entity]) attachCounts[card.entity] = []
			attachCounts[card.entity].push(card.slot.row.entity)

			component.updateGoalProgress({
				goal: 0,
				progress: attachCounts[card.entity].length,
			})
		}

		observer.subscribe(player.hooks.onAttach, (card) => {
			if (!card.slot.inRow()) return
			if (card.slot.row.entity !== player.activeRow?.entity) return
			if (card.slot.type !== 'item') return

			noteCardAttached(card)
		})

		observer.subscribe(player.hooks.onActiveRowChange, () => {
			if (!player.activeRow) return

			player.activeRow.getItems().forEach((card) => {
				noteCardAttached(card)
			})
		})
	},
}

export default PistonExtender
