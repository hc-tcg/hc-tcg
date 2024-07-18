import {ObserverComponent, PlayerComponent, StatusEffectComponent} from '../components'
import {GameModel} from '../models/game-model'
import {PlayerStatusEffect, StatusEffectProps, statusEffect} from './status-effect'

export class InvisibilityPotionHeadsEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		id: 'invisibility-potion-heads',
		name: 'Invisibility Potion - Heads',
		description: 'Your next attack will miss.',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent
	) {
		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (attack.isType('weakness', 'effect', 'status-effect')) return
			attack.multiplyDamage(effect.entity, 0)
		})

		observer.subscribe(player.hooks.afterAttack, () => {
			effect.remove()
		})
	}
}

export class InvisibilityPotionTailsEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		id: 'invisibility-potion-tails',
		name: 'Invisibility Potion - Tails',
		description: 'Your next attack will deal double damage.',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent
	) {
		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (attack.isType('weakness', 'effect', 'status-effect')) return
			attack.multiplyDamage(effect.entity, 2)
		})

		observer.subscribe(player.hooks.afterAttack, () => {
			effect.remove()
		})
	}
}
