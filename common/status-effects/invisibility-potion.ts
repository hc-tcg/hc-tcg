import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {beforeAttack, onTurnEnd} from '../types/priorities'
import {StatusEffect, systemStatusEffect} from './status-effect'

export const InvisibilityPotionHeadsEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	id: 'invisibility-potion-heads',
	icon: 'invisibility-potion-heads',
	name: 'Hidden!',
	description: "Your opponent's next attack will miss.",
	onApply(
		_game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		let multipliedDamage = false

		observer.subscribeWithPriority(
			player.opponentPlayer.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!attack.isType('primary', 'secondary')) return
				attack.multiplyDamage(effect.entity, 0)
			},
		)
		observer.subscribeWithPriority(
			player.opponentPlayer.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (multipliedDamage) effect.remove()
			},
		)
	},
}

export const InvisibilityPotionTailsEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	id: 'invisibility-potion-tails',
	icon: 'invisibility-potion-tails',
	name: 'Spotted!',
	description: "Your opponent's next attack will deal double damage.",
	onApply(
		_game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		let multipliedDamage = false

		observer.subscribeWithPriority(
			player.opponentPlayer.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!attack.isType('primary', 'secondary')) return
				attack.multiplyDamage(effect.entity, 2)
			},
		)
		observer.subscribeWithPriority(
			player.opponentPlayer.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (multipliedDamage) effect.remove()
			},
		)
	},
}
