import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {
	CardStatusEffect,
	StatusEffectProps,
	statusEffect,
} from './status-effect'

class DyedEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		icon: 'dyed',
		name: 'Dyed',
		description: 'This Hermit can use items of any type.',
		applyCondition: (_game, card) =>
			card instanceof CardComponent && !card.getStatusEffect(DyedEffect),
	}

	override onApply(
		_game: GameModel,
		effect: StatusEffectComponent<CardComponent>,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = target

		observer.subscribe(player.hooks.availableEnergy, (availableEnergy) => {
			if (
				!target.slot.inRow() ||
				player.activeRowEntity !== target.slot.row.entity
			)
				return availableEnergy
			return availableEnergy.map(() => 'any')
		})

		observer.subscribe(player.hooks.afterDefence, (attack) => {
			if (!attack.isTargeting(target) || attack.target?.health) return
			effect.remove()
		})
	}
}

export default DyedEffect
