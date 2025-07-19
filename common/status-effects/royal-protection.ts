import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {beforeAttack} from '../types/priorities'
import {StatusEffect, statusEffect} from './status-effect'

const RoyalProtectionEffect: StatusEffect<CardComponent> = {
	...statusEffect,
	id: 'royal-protection',
	icon: 'royal-protection',
	name: 'Royal Protection',
	description:
		'Any damage dealt to a Hermit under Royal Protection is prevented.',
	applyLog: (values) => `${values.target} was granted $eRoyal Protection$`,
	onApply(
		game: GameModel,
		effect: StatusEffectComponent<CardComponent>,
		target: CardComponent,
		observer: ObserverComponent,
	): void {
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_BLOCK_DAMAGE,
			(attack) => {
				if (!attack.isTargeting(target)) return

				// Do not block backlash attacks
				if (attack.isBacklash) return

				attack.multiplyDamage(effect.entity, 0).lockDamage(effect.entity)
			},
		)

		observer.subscribe(target.player.hooks.onTurnStart, () => {
			effect.remove()
		})
	},
}

export default RoyalProtectionEffect
