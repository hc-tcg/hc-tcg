import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {
	PlayerStatusEffect,
	StatusEffect,
	systemStatusEffect,
} from './status-effect'

export class InvisibilityPotionHeadsEffect extends PlayerStatusEffect {
	props: StatusEffect = {
		...systemStatusEffect,
		icon: 'invisibility-potion-heads',
		name: 'Hidden!',
		description: "Your opponent's next attack will miss.",
	}

	override onApply(
		_game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		observer.subscribe(player.hooks.beforeDefence, (attack) => {
			if (!attack.isType('primary', 'secondary')) return
			attack.multiplyDamage(effect.entity, 0)
			effect.remove()
		})
	}
}

export class InvisibilityPotionTailsEffect extends PlayerStatusEffect {
	props: StatusEffect = {
		...systemStatusEffect,
		icon: 'invisibility-potion-tails',
		name: 'Spotted!',
		description: "Your opponent's next attack will deal double damage.",
	}

	override onApply(
		_game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		observer.subscribe(player.hooks.beforeDefence, (attack) => {
			if (!attack.isType('primary', 'secondary')) return
			attack.multiplyDamage(effect.entity, 2)
			effect.remove()
		})
	}
}
