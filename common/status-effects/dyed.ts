import {CardComponent} from '../components'
import {
	CardStatusEffect,
	StatusEffect,
	statusEffect,
} from './status-effect'

class DyedEffect extends CardStatusEffect {
	props: StatusEffect = {
		...statusEffect,
		icon: 'dyed',
		name: 'Dyed',
		description: 'Items attached to this Hermit become any type.',
		applyCondition: (_game, card) =>
			card instanceof CardComponent && !card.getStatusEffect(DyedEffect),
	}

	// override onApply(game: GameModel, effect: StatusEffectComponent, target: CardComponent) {
	// 	target.player.hooks.availableEnergy.add(effect, (availableEnergy) => {
	// 		if (!target.slot.inRow() || target.player.activeRowEntity !== target.slot.row.entity)
	// 			return availableEnergy
	// 		return availableEnergy.map(() => 'any')
	// 	})
	// }

	// override onRemoval(game: GameModel, effect: StatusEffectComponent, target: CardComponent) {
	// 	const {player, opponentPlayer} = target

	// 	player.hooks.availableEnergy.remove(effect)
	// 	opponentPlayer.hooks.onTurnEnd.remove(effect)
	// }
}

export default DyedEffect
