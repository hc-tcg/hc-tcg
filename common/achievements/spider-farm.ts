import {hasEnoughEnergy} from '../utils/attacks'
import {achievement} from './defaults'
import {Achievement} from './types'

const SpiderFarm: Achievement = {
	...achievement,
	numericId: 61,
	id: 'spider-farm',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Spider Farm',
			description:
				"Place an item in an opponent's item slots that prevents a Hermit from using their secondary attack.",
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		const opponent = game.components.getOrError(
			game.otherPlayerEntity(player.entity),
		)

		observer.subscribe(opponent.hooks.onAttach, (card) => {
			if (game.currentPlayerEntity !== player.entity) return // It has to be an action by us, so on our turn
			if (!card.slot.inRow()) return
			const hermit = card.slot.row.getHermit()
			if (!hermit?.isHermit()) return
			if (!hermit.slot.inRow()) return

			const actualActiveRow = opponent.activeRowEntity
			opponent.activeRowEntity = hermit.slot.rowEntity
			const energy =
				(hermit.slot.inRow() &&
					opponent.hooks.availableEnergy.call(
						hermit.slot.row.itemSlots.flatMap((slot) => {
							if (!slot.card) return ['any', 'any']
							if (slot.card?.isItem()) return slot.card.props.energy
							return []
						}),
					)) ||
				[]
			opponent.activeRowEntity = actualActiveRow

			if (
				hasEnoughEnergy(
					energy,
					hermit.getAttackCost('secondary'),
					game.settings.noItemRequirements,
				)
			)
				return

			component.updateGoalProgress({goal: 0})
		})
	},
}

export default SpiderFarm
