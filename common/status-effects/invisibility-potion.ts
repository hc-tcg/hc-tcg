import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {
	PlayerStatusEffect,
	StatusEffectProps,
	systemStatusEffect,
} from './status-effect'

export class InvisibilityPotionHeadsEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
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
		observer.subscribe(player.opponentPlayer.hooks.beforeAttack, (attack) => {
			if (!attack.isType('primary', 'secondary')) return
			attack.multiplyDamage(effect.entity, 0)
			effect.remove()
		})
	}
}

export class InvisibilityPotionTailsEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
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
		observer.subscribe(player.opponentPlayer.hooks.beforeAttack, (attack) => {
			if (!attack.isType('primary', 'secondary')) return
			attack.multiplyDamage(effect.entity, 2)
			effect.remove()
		})
	}
}
