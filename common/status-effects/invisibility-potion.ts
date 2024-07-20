import {ObserverComponent, PlayerComponent, StatusEffectComponent} from '../components'
import {GameModel} from '../models/game-model'
import {PlayerStatusEffect, StatusEffectProps, statusEffect} from './status-effect'

export class InvisibilityPotionHeadsEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		icon: 'invisibility-potion-heads',
		name: 'Invisibility Potion - Heads',
		description: "Your opponent's next attack will miss.",
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent
	) {
		observer.subscribe(player.hooks.beforeDefence, (attack) => {
			if (attack.isType('weakness', 'effect', 'status-effect')) return
			attack.multiplyDamage(effect.entity, 0)
		})

		observer.subscribe(player.hooks.afterDefence, () => {
			effect.remove()
		})
	}
}

export class InvisibilityPotionTailsEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		icon: 'invisibility-potion-tails',
		name: 'Invisibility Potion - Tails',
		description: "Your opponent's next attack will deal double damage.",
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent
	) {
		observer.subscribe(player.hooks.beforeDefence, (attack) => {
			if (attack.isType('weakness', 'effect', 'status-effect')) return
			attack.multiplyDamage(effect.entity, 2)
		})

		observer.subscribe(player.hooks.afterDefence, () => {
			effect.remove()
		})
	}
}
