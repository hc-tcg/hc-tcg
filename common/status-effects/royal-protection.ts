import {CardStatusEffect, StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../components'

class RoyalProtectionEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		icon: 'royal_protection',
		name: 'Royal Protection',
		description: 'The first attack against this Hermit deals no damage.',
		applyLog: (values) => `${values.target} was granted $eRoyal Protection$`,
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent<CardComponent>,
		target: CardComponent,
		observer: ObserverComponent
	): void {
		observer.subscribe(target.player.hooks.beforeDefence, (attack) => {
			if (!attack.isTargetting(target)) return

			attack.multiplyDamage(effect.entity, 0).lockDamage(effect.entity)
			effect.remove()
		})
	}
}

export default RoyalProtectionEffect
