import {CardStatusEffect, StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../components'

class RoyalProtectionEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		icon: 'royal_protection',
		name: 'Royal Protection',
		description: 'Any attacks targeting a Hermit under Royal Protection are prevented.',
		applyLog: (values) => `${values.target} was granted $eRoyal Protection$`,
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent<CardComponent>,
		target: CardComponent,
		observer: ObserverComponent
	): void {
		observer.subscribe(target.player.hooks.beforeDefence, (attack) => {
			if (!attack.isTargeting(target)) return

			attack.multiplyDamage(effect.entity, 0).lockDamage(effect.entity)
		})

		observer.subscribe(target.opponentPlayer.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}

export default RoyalProtectionEffect
