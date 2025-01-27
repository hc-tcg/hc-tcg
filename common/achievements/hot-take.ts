import {hasEnoughEnergy} from '../utils/attacks'
import {achievement} from './defaults'
import {Achievement} from './types'

const HotTake: Achievement = {
	...achievement,
	numericId: 9,
	id: 'hot_take',
	name: 'Hot take',
	description: 'Fully power up a 3-cost Hermit you got as a prize card',
	steps: 1,
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		observer.subscribe(player.hooks.onAttach, (card) => {
			if (!card.isItem() || !card.slot.onBoard()) return
			const hermit = card.slot.row?.getHermit()
			if (!hermit || !hermit.prizeCard) return
			const energy =
				(hermit.slot.inRow() &&
					player.hooks.availableEnergy.call(
						hermit.slot.row.getItems(true).flatMap((item) => {
							if (item.isItem()) return item.props.energy
							return []
						}),
					)) ||
				[]
			const canPrimary = hasEnoughEnergy(
				energy,
				hermit.getAttackCost('primary'),
				game.settings.noItemRequirements,
			)
			const canSecondary = hasEnoughEnergy(
				energy,
				hermit.getAttackCost('secondary'),
				game.settings.noItemRequirements,
			)
			if (!canPrimary || !canSecondary) return
			component.incrementGoalProgress(0)
		})
	},
}

export default HotTake
