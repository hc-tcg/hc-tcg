import {CardComponent} from '../components'
import {StatusEffect, statusEffect} from './status-effect'

const DyedEffect: StatusEffect<CardComponent> = {
	...statusEffect,
	id: 'dyed',
	icon: 'dyed',
	name: 'Dyed',
	description: (_component) => 'Items attached to this Hermit become any type.',
	applyCondition: (_game, card) =>
		card instanceof CardComponent && !card.getStatusEffect(DyedEffect),

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
