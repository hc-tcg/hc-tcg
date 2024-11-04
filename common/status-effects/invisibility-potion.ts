import {isFromTrapdoor} from '../cards/advent-of-tcg/attach/trapdoor'
import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {beforeAttack, onTurnEnd} from '../types/priorities'
import {GasLightEffect, GasLightTriggeredEffect} from './gas-light'
import {StatusEffect, systemStatusEffect} from './status-effect'

export const InvisibilityPotionHeadsEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	id: 'invisibility-potion-heads',
	icon: 'invisibility-potion-heads',
	name: 'Hidden!',
	description: "Your opponent's next attack will miss.",
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		let multipliedDamage = false

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (attack.player.entity !== player.opponentPlayer.entity) return
				if (!attack.isType('primary', 'secondary')) return
				multipliedDamage = true
				attack.multiplyDamage(effect.entity, 0)
			},
		)
		observer.subscribe(
			player.opponentPlayer.hooks.getAttackRequests,
			(_active, _type) => {
				if (!multipliedDamage) return
				effect.remove()
				game.components
					.filter(
						StatusEffectComponent,
						query.effect.is(GasLightEffect, GasLightTriggeredEffect),
						query.effect.targetIsCardAnd(query.card.opponentPlayer),
					)
					.forEach((effect) => (effect.counter = 0))
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
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		let multipliedDamage = false

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (attack.player.entity !== player.opponentPlayer.entity) return
				if (!attack.isType('primary', 'secondary')) return
				if (isFromTrapdoor(game, attack)) return
				multipliedDamage = true
				attack.multiplyDamage(effect.entity, 2)
			},
		)
		observer.subscribe(
			player.opponentPlayer.hooks.getAttackRequests,
			(_active, _type) => {
				if (!multipliedDamage) return
				effect.remove()
				game.components
					.filter(
						StatusEffectComponent,
						query.effect.is(GasLightEffect, GasLightTriggeredEffect),
						query.effect.targetIsCardAnd(query.card.opponentPlayer),
					)
					.forEach((effect) => (effect.counter = (effect.counter || 0) * 2))
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
