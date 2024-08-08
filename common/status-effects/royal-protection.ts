import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {StatusEffect, statusEffect} from './status-effect'

const RoyalProtectionEffect: StatusEffect<CardComponent> = {
	...statusEffect,
	icon: 'royal_protection',
	name: 'Royal Protection',
	description:
		'Any damage dealt to a Hermit under Royal Protection is prevented.',
	applyLog: (values) => `${values.target} was granted $eRoyal Protection$`,
	onApply(
		_game: GameModel,
		effect: StatusEffectComponent<CardComponent>,
		target: CardComponent,
		observer: ObserverComponent,
	): void {
		observer.subscribe(target.player.hooks.beforeDefence, (attack) => {
			if (!attack.isTargeting(target)) return

			// Do not block backlash attacks
			if (attack.isBacklash) return

			attack.multiplyDamage(effect.entity, 0).lockDamage(effect.entity)
		})

		observer.subscribe(target.player.hooks.onTurnStart, () => {
			effect.remove()
		})
	},
}

export default RoyalProtectionEffect
